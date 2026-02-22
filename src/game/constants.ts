export const WORLD_WIDTH = 800;
export const WORLD_HEIGHT = 500;
export const GROUND_Y = 460; // top of ground (players stand here)
export const PLAYER_W = 40;
export const PLAYER_H = 40;

export const GRAVITY = 1800; // px/s²
export const JUMP_VELOCITY = -650; // px/s
export const MOVE_SPEED = 220; // px/s
export const WALL_RIGHT = WORLD_WIDTH - PLAYER_W; // 760

export const SPAWN_POSITIONS: [number, number][] = [
  [60, GROUND_Y],
  [700, GROUND_Y],
];

export const PLAYER_COLORS = [0x4488ff, 0xff4444]; // blue, red

export const TICK_RATE = 30; // Hz
export const TICK_DURATION_MS = 1000 / TICK_RATE; // ~33.3 ms

export const RECONCILE_SNAP_THRESHOLD = 5; // px — Euclidean distance before lerp
export const RECONCILE_LERP_FRAMES = 3;

export const GROUND_COLOR = 0x888888;
export const GROUND_HEIGHT = WORLD_HEIGHT - GROUND_Y; // 40 px
