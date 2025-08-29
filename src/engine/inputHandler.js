import { Control, controls } from "../constants/control.js";
import { FighterDirection } from "../constants/fighter.js";

const heldKey = new Set(); //! Since Set only keeps unique values, duplicate key presses won’t be added multiple times.
const pressedKeys = new Set();

const playerInputEnabled = {
  0: true,
  1: true,
};

export function setPlayerInput(id, enabled) {
  playerInputEnabled[id] = enabled;
}

export function isPlayerInputEnabled(id) {
  return playerInputEnabled[id];
}

function handleKeyDown(event) {
  event.preventDefault();

  heldKey.add(event.code);
}

function handleKeyUp(event) {
  event.preventDefault();

  heldKey.delete(event.code);
  pressedKeys.delete(event.code);
}

export function registerKeyboardEvents() {
  addEventListener("keydown", handleKeyDown);
  addEventListener("keyup", handleKeyUp);
}

export const isKeyDown = (code) => heldKey.has(code);
export const isKeyUP = (code) => !heldKey.has(code);
export function iskeyPressed(code) {
  if (heldKey.has(code) && !pressedKeys.has(code)) {
    pressedKeys.add(code);
    return true;
  }
  return false;
}
export const isleft = (id) =>
  playerInputEnabled[id] && isKeyDown(controls[id].keyboard[Control.LEFT]);
export const isright = (id) =>
  playerInputEnabled[id] && isKeyDown(controls[id].keyboard[Control.RIGHT]);
export const isup = (id) =>
  playerInputEnabled[id] && isKeyDown(controls[id].keyboard[Control.UP]);
export const isdown = (id) =>
  playerInputEnabled[id] && isKeyDown(controls[id].keyboard[Control.DOWN]);
export const isControlDown = (id) =>
  playerInputEnabled[id] &&
  isKeyDown(controls[id].keyboard[Control.LIGHT_PUNCH]);

export const isControlPressed = (id) =>
  playerInputEnabled[id] &&
  iskeyPressed(controls[id].keyboard[Control.LIGHT_PUNCH]);
export const isForward = (id, direction) =>
  playerInputEnabled[id] &&
  (direction === FighterDirection.Right ? isright(id) : isleft(id));

export const isBackward = (id, direction) =>
  playerInputEnabled[id] &&
  (direction === FighterDirection.Left ? isright(id) : isleft(id));

export const isIdle = (id) =>
  playerInputEnabled[id] &&
  !(isleft(id) || isright(id) || isup(id) || isdown(id));

export const isLightPunch = (id) =>
  playerInputEnabled[id] &&
  iskeyPressed(controls[id].keyboard[Control.LIGHT_PUNCH]);
export const isMediumPunch = (id) =>
  playerInputEnabled[id] &&
  iskeyPressed(controls[id].keyboard[Control.MEDIUM_PUNCH]);
export const isHeavyPunch = (id) =>
  playerInputEnabled[id] &&
  iskeyPressed(controls[id].keyboard[Control.HEAVY_PUNCH]);

export const isLightKick = (id) =>
  playerInputEnabled[id] &&
  iskeyPressed(controls[id].keyboard[Control.LIGHT_KICK]);
export const isMediumKick = (id) =>
  playerInputEnabled[id] &&
  iskeyPressed(controls[id].keyboard[Control.MEDIUM_KICK]);
export const isHeavyKick = (id) =>
  playerInputEnabled[id] &&
  iskeyPressed(controls[id].keyboard[Control.HEAVY_KICK]);
