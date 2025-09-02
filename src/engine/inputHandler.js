import { Control, controls } from "../constants/control.js";
import { FighterDirection } from "../constants/fighter.js";

const heldKey = new Set(); //! Since Set only keeps unique values, duplicate key presses won't be added multiple times.
const pressedKeys = new Set();

// AI Virtual Input Support
let aiInputs = new Map(); // playerId -> virtual input state

export function setAIInputs(playerId, virtualInputState) {
  if (!aiInputs.has(playerId)) {
    aiInputs.set(playerId, {});
  }
  aiInputs.set(playerId, { ...virtualInputState });
}

export function clearAIInputs(playerId) {
  aiInputs.delete(playerId);
}

function isAIControlActive(playerId, control) {
  const playerAI = aiInputs.get(playerId);
  if (!playerAI) return false;
  
  switch (control) {
    case Control.LEFT:
      return playerAI.left || false;
    case Control.RIGHT:
      return playerAI.right || false;
    case Control.UP:
      return playerAI.up || false;
    case Control.DOWN:
      return playerAI.down || false;
    case Control.LIGHT_PUNCH:
      return playerAI.lightPunch || false;
    case Control.MEDIUM_PUNCH:
      return playerAI.mediumPunch || false;
    case Control.HEAVY_PUNCH:
      return playerAI.heavyPunch || false;
    case Control.LIGHT_KICK:
      return playerAI.lightKick || false;
    case Control.MEDIUM_KICK:
      return playerAI.mediumKick || false;
    case Control.HEAVY_KICK:
      return playerAI.heavyKick || false;
    default:
      return false;
  }
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
export const isleft = (id) => isAIControlActive(id, Control.LEFT) || isKeyDown(controls[id].keyboard[Control.LEFT]);
export const isright = (id) => isAIControlActive(id, Control.RIGHT) || isKeyDown(controls[id].keyboard[Control.RIGHT]);
export const isup = (id) => isAIControlActive(id, Control.UP) || isKeyDown(controls[id].keyboard[Control.UP]);
export const isdown = (id) => isAIControlActive(id, Control.DOWN) || isKeyDown(controls[id].keyboard[Control.DOWN]);
export const isControlDown = (id) =>
  isKeyDown(controls[id].keyboard[Control.LIGHT_PUNCH]);

export const isControlPressed = (id) =>
  iskeyPressed(controls[id].keyboard[Control.LIGHT_PUNCH]);
export const isForward = (id, direction) =>
  direction === FighterDirection.Right ? isright(id) : isleft(id);

export const isBackward = (id, direction) =>
  direction === FighterDirection.Left ? isright(id) : isleft(id);

export const isIdle = (id) =>
  !(isleft(id) || isright(id) || isup(id) || isdown(id));

export const isLightPunch = (id) =>
  isAIControlActive(id, Control.LIGHT_PUNCH) || iskeyPressed(controls[id].keyboard[Control.LIGHT_PUNCH]);
export const isMediumPunch = (id) =>
  isAIControlActive(id, Control.MEDIUM_PUNCH) || iskeyPressed(controls[id].keyboard[Control.MEDIUM_PUNCH]);
export const isHeavyPunch = (id) =>
  isAIControlActive(id, Control.HEAVY_PUNCH) || iskeyPressed(controls[id].keyboard[Control.HEAVY_PUNCH]);

export const isLightKick = (id) =>
  isAIControlActive(id, Control.LIGHT_KICK) || iskeyPressed(controls[id].keyboard[Control.LIGHT_KICK]);
export const isMediumKick = (id) =>
  isAIControlActive(id, Control.MEDIUM_KICK) || iskeyPressed(controls[id].keyboard[Control.MEDIUM_KICK]);
export const isHeavyKick = (id) =>
  isAIControlActive(id, Control.HEAVY_KICK) || iskeyPressed(controls[id].keyboard[Control.HEAVY_KICK]);
