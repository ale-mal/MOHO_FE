import Phaser from "phaser";
import { World } from "./ecs";
import { InputMessage } from "./types";
import {
  GRAVITY,
  JUMP_VELOCITY,
  MOVE_SPEED,
  GROUND_Y,
  WALL_RIGHT,
  TICK_DURATION_MS,
  RECONCILE_SNAP_THRESHOLD,
  RECONCILE_LERP_FRAMES,
  SPAWN_POSITIONS,
  PLAYER_H,
} from "./constants";

// ─── InputSystem ────────────────────────────────────────────────────────────
// Reads Phaser cursor keys each frame and sends an InputMessage over WS.
export function inputSystem(
  world: World,
  cursors: Phaser.Types.Input.Keyboard.CursorKeys,
  ws: WebSocket,
  touchInput: InputMessage
): void {
  if (ws.readyState !== WebSocket.OPEN) return;

  const msg: InputMessage = {
    left: cursors.left.isDown || touchInput.left,
    right: cursors.right.isDown || touchInput.right,
    jump: cursors.up.isDown || cursors.space.isDown || touchInput.jump,
  };
  ws.send(JSON.stringify(msg));
}

// ─── PredictionSystem ───────────────────────────────────────────────────────
// Applies the local player's input immediately (client-side prediction).
export function predictionSystem(
  world: World,
  cursors: Phaser.Types.Input.Keyboard.CursorKeys,
  deltaMs: number,
  touchInput: InputMessage
): void {
  const id = world.localCid;
  const pos = world.position.get(id);
  const vel = world.velocity.get(id);
  const meta = world.playerMeta.get(id);
  if (!pos || !vel || !meta || !meta.alive) return;

  const dt = deltaMs / 1000;
  const onGround = pos.y >= GROUND_Y;

  // Horizontal
  if (cursors.left.isDown || touchInput.left) {
    vel.vx = -MOVE_SPEED;
  } else if (cursors.right.isDown || touchInput.right) {
    vel.vx = MOVE_SPEED;
  } else {
    vel.vx = 0;
  }

  // Jump
  if ((cursors.up.isDown || cursors.space.isDown || touchInput.jump) && onGround) {
    vel.vy = JUMP_VELOCITY;
  }

  // Gravity
  vel.vy += GRAVITY * dt;

  // Integrate
  pos.x += vel.vx * dt;
  pos.y += vel.vy * dt;

  // Ground clamp
  if (pos.y >= GROUND_Y) {
    pos.y = GROUND_Y;
    vel.vy = 0;
  }

  // Wall clamp
  if (pos.x < 0) pos.x = 0;
  if (pos.x > WALL_RIGHT) pos.x = WALL_RIGHT;

  // Update Phaser object
  const rect = world.phaserObjects.get(id);
  if (rect) {
    rect.setPosition(pos.x, pos.y);
  }
}

// ─── ServerReconcileSystem ──────────────────────────────────────────────────
// Consumes pending server snapshots.
// Local player: if delta > threshold, lerp toward server pos.
// Remote player: update interpolant targets.
export function serverReconcileSystem(world: World): void {
  if (world.pendingSnapshots.length === 0) return;

  // Use the latest snapshot; discard older ones
  const snap = world.pendingSnapshots[world.pendingSnapshots.length - 1];
  world.pendingSnapshots = [];

  for (const playerSnap of snap.players) {
    const id = playerSnap.cid;
    const meta = world.playerMeta.get(id);
    if (!meta) continue;

    const wasAlive = meta.alive;
    meta.alive = playerSnap.alive;
    meta.spawnSide = playerSnap.spawn_side;
    world.kills.set(id, playerSnap.kills ?? 0);

    const rect = world.phaserObjects.get(id);
    if (!rect) continue;

    if (meta.isLocal) {
      // Reconcile local player
      const pos = world.position.get(id);
      const vel = world.velocity.get(id);
      if (!pos || !vel) continue;

      if (!playerSnap.alive) {
        // Dead — hide and don't move
        rect.setVisible(false);
      } else {
        rect.setVisible(true);
        const dx = playerSnap.x - pos.x;
        const dy = playerSnap.y - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > RECONCILE_SNAP_THRESHOLD) {
          // Lerp over RECONCILE_LERP_FRAMES frames (~3 frames)
          const alpha = 1 / RECONCILE_LERP_FRAMES;
          pos.x += dx * alpha;
          pos.y += dy * alpha;
          // Also correct velocity toward server's
          vel.vx += (playerSnap.vx - vel.vx) * alpha;
          vel.vy += (playerSnap.vy - vel.vy) * alpha;
        }
        // ≤ threshold: accept local prediction, skip correction
      }

      // Handle respawn (dead→alive transition)
      if (!wasAlive && playerSnap.alive) {
        const sp = playerSnap.spawn_side;
        const [sx, sy] = SPAWN_POSITIONS[sp];
        pos.x = sx;
        pos.y = sy;
        vel.vx = 0;
        vel.vy = 0;
        rect.setPosition(sx, sy);
        rect.setVisible(true);
      }
    } else {
      // Remote player: update interpolation targets
      const interp = world.interpolant.get(id);
      if (!interp) continue;
      const pos = world.position.get(id);

      interp.prevX = pos ? pos.x : interp.nextX;
      interp.prevY = pos ? pos.y : interp.nextY;

      if (!playerSnap.alive) {
        rect.setVisible(false);
        interp.nextX = interp.prevX;
        interp.nextY = interp.prevY;
      } else {
        interp.nextX = playerSnap.x;
        interp.nextY = playerSnap.y;
        rect.setVisible(true);
      }
      interp.alpha = 0;

      // Respawn
      if (!wasAlive && playerSnap.alive) {
        const sp = playerSnap.spawn_side;
        const [sx, sy] = SPAWN_POSITIONS[sp];
        interp.prevX = sx;
        interp.prevY = sy;
        interp.nextX = sx;
        interp.nextY = sy;
        if (pos) { pos.x = sx; pos.y = sy; }
        rect.setPosition(sx, sy);
        rect.setVisible(true);
      }
    }
  }
}

// ─── InterpolationSystem ────────────────────────────────────────────────────
// Advances alpha and lerps remote player Phaser objects.
export function interpolationSystem(world: World, deltaMs: number): void {
  const step = deltaMs / TICK_DURATION_MS;

  for (const [id, interp] of world.interpolant.entries()) {
    const meta = world.playerMeta.get(id);
    if (!meta || !meta.alive) continue;

    interp.alpha = Math.min(interp.alpha + step, 1);
    const x = interp.prevX + (interp.nextX - interp.prevX) * interp.alpha;
    const y = interp.prevY + (interp.nextY - interp.prevY) * interp.alpha;

    const pos = world.position.get(id);
    if (pos) { pos.x = x; pos.y = y; }

    const rect = world.phaserObjects.get(id);
    if (rect) rect.setPosition(x, y);
  }
}
