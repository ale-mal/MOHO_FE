import Phaser from "phaser";
import { createWorld, addPlayer, World } from "~/game/ecs";
import {
  inputSystem,
  predictionSystem,
  serverReconcileSystem,
  interpolationSystem,
} from "~/game/systems";
import { StateSnapshot, InputMessage } from "~/game/types";
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  GROUND_Y,
  GROUND_HEIGHT,
  GROUND_COLOR,
  PLAYER_W,
  PLAYER_H,
  PLAYER_COLORS,
  SPAWN_POSITIONS,
} from "~/game/constants";

export interface GameSceneConfig {
  sessionId: string;
  cid: string;
  wsBaseUrl: string;
  touchInput: InputMessage;
}

export class GameScene extends Phaser.Scene {
  private world!: World;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private ws!: WebSocket;
  private config!: GameSceneConfig;
  private touchInput!: InputMessage;
  private killText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: GameSceneConfig) {
    this.config = data;
    this.touchInput = data.touchInput;
  }

  preload() {
    // No assets — all rectangles
  }

  create() {
    const { sessionId, cid, wsBaseUrl } = this.config;

    this.world = createWorld(cid);

    // Ground
    this.add
      .rectangle(0, GROUND_Y, WORLD_WIDTH * 2, GROUND_HEIGHT * 2, GROUND_COLOR)
      .setOrigin(0, 0);

    // Status text
    const statusText = this.add
      .text(WORLD_WIDTH / 2, 20, "Waiting for opponent...", {
        color: "#ffffff",
        fontSize: "16px",
      })
      .setOrigin(0.5, 0);

    // Open WebSocket
    const wsUrl = `${wsBaseUrl}/game-ws?sessionId=${sessionId}&cid=${cid}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      statusText.setVisible(false);
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const snap = JSON.parse(event.data) as StateSnapshot;

        // Create Phaser objects for newly seen players
        for (const playerSnap of snap.players) {
          if (!this.world.phaserObjects.has(playerSnap.cid)) {
            const isLocal = playerSnap.cid === cid;
            const color = PLAYER_COLORS[playerSnap.spawn_side] ?? 0xffffff;
            const [sx, sy] = SPAWN_POSITIONS[playerSnap.spawn_side] ?? [0, 0];
            const rect = this.add.rectangle(sx, sy, PLAYER_W, PLAYER_H, color).setOrigin(0, 1);
            addPlayer(this.world, playerSnap.cid, sx, sy, isLocal, color, playerSnap.spawn_side, rect);
          }
        }

        // Queue snapshot for systems to process
        this.world.pendingSnapshots.push(snap);
      } catch {
        // ignore malformed messages
      }
    };

    this.ws.onclose = () => {
      statusText.setText("Disconnected").setVisible(true);
    };

    // Kill counter HUD
    this.killText = this.add
      .text(8, 8, "", { color: "#ffffff", fontSize: "14px" })
      .setDepth(10);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  update(_time: number, delta: number) {
    if (!this.world) return;

    // 1. Read input, send to server
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      inputSystem(this.world, this.cursors, this.ws, this.touchInput);
    }

    // 2. Predict local player movement
    predictionSystem(this.world, this.cursors, delta, this.touchInput);

    // 3. Consume server snapshots
    serverReconcileSystem(this.world);

    // 4. Update kill counter HUD
    let myKills = 0, oppKills = 0;
    for (const [id, k] of this.world.kills.entries()) {
      const meta = this.world.playerMeta.get(id);
      if (!meta) continue;
      if (meta.isLocal) myKills = k;
      else oppKills = k;
    }
    this.killText.setText(`You: ${myKills}   Opp: ${oppKills}`);

    // 5. Interpolate remote players
    interpolationSystem(this.world, delta);
  }

  shutdown() {
    if (this.ws) {
      this.ws.close();
    }
  }
}
