export interface InputMessage {
  left: boolean;
  right: boolean;
  jump: boolean;
}

export interface PlayerSnap {
  cid: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alive: boolean;
  spawn_side: number;
  kills: number;
}

export interface StateSnapshot {
  tick: number;
  players: PlayerSnap[];
}
