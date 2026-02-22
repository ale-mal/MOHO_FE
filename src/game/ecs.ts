import Phaser from "phaser";
import { StateSnapshot } from "./types";

export type EntityId = string; // cid UUID

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

// For remote players: two-snapshot interpolation buffer
export interface Interpolant {
  prevX: number;
  prevY: number;
  nextX: number;
  nextY: number;
  alpha: number; // 0→1 between prev and next
}

export interface PlayerMeta {
  isLocal: boolean;
  color: number;
  alive: boolean;
  spawnSide: number;
}

export interface World {
  position: Map<EntityId, Position>;
  velocity: Map<EntityId, Velocity>;
  interpolant: Map<EntityId, Interpolant>; // remote players only
  playerMeta: Map<EntityId, PlayerMeta>;
  phaserObjects: Map<EntityId, Phaser.GameObjects.Rectangle>;
  pendingSnapshots: StateSnapshot[];
  localCid: string;
  kills: Map<EntityId, number>;
}

export function createWorld(localCid: string): World {
  return {
    position: new Map(),
    velocity: new Map(),
    interpolant: new Map(),
    playerMeta: new Map(),
    phaserObjects: new Map(),
    pendingSnapshots: [],
    localCid,
    kills: new Map(),
  };
}

export function addPlayer(
  world: World,
  id: EntityId,
  x: number,
  y: number,
  isLocal: boolean,
  color: number,
  spawnSide: number,
  rect: Phaser.GameObjects.Rectangle
): void {
  world.position.set(id, { x, y });
  world.velocity.set(id, { vx: 0, vy: 0 });
  world.playerMeta.set(id, { isLocal, color, alive: true, spawnSide });
  world.phaserObjects.set(id, rect);
  if (!isLocal) {
    world.interpolant.set(id, { prevX: x, prevY: y, nextX: x, nextY: y, alpha: 1 });
  }
}

export function removePlayer(world: World, id: EntityId): void {
  world.position.delete(id);
  world.velocity.delete(id);
  world.interpolant.delete(id);
  world.playerMeta.delete(id);
  world.phaserObjects.delete(id);
}
