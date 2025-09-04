import { Control, controls } from "../constants/control.js";
import { FighterDirection } from "../constants/fighter.js";

// Optimized key state management
const heldKey = new Set();
const pressedKeys = new Set();

// AI Virtual Input Support with caching
let aiInputs = new Map();
let aiInputsCache = new Map(); // Cache for AI input lookups

export function setAIInputs(playerId, virtualInputState) {
  if (!aiInputs.has(playerId)) {
    aiInputs.set(playerId, {});
  }
  aiInputs.set(playerId, { ...virtualInputState });
  
  // Update cache
  aiInputsCache.set(playerId, new Map());
  for (const [control, value] of Object.entries(virtualInputState)) {
    aiInputsCache.get(playerId).set(control, value);
  }
}

export function clearAIInputs(playerId) {
  aiInputs.delete(playerId);
  aiInputsCache.delete(playerId);
}

function isAIControlActive(playerId, control) {
  // Use cached lookup for better performance
  const playerCache = aiInputsCache.get(playerId);
  if (!playerCache) return false;
  
  return playerCache.get(control) || false;
}

// Optimized event handlers
let keyDownHandler = null;
let keyUpHandler = null;

function handleKeyDown(event) {
  // Prevent default only for game keys
  if (isGameKey(event.code)) {
    event.preventDefault();
  }
  heldKey.add(event.code);
}

function handleKeyUp(event) {
  // Prevent default only for game keys
  if (isGameKey(event.code)) {
    event.preventDefault();
  }
  heldKey.delete(event.code);
  pressedKeys.delete(event.code);
}

// Check if key is used by the game
function isGameKey(keyCode) {
  const gameKeys = new Set([
    'KeyA', 'KeyD', 'KeyW', 'KeyS', 'KeyE', 'KeyR', 'KeyT', 'KeyF',
    'Digit3', 'Digit4', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'ControlRight', 'ShiftRight', 'Enter', 'Quote'
  ]);
  return gameKeys.has(keyCode);
}

export function registerKeyboardEvents() {
  // Remove existing handlers if any
  if (keyDownHandler) {
    removeEventListener("keydown", keyDownHandler);
    removeEventListener("keyup", keyUpHandler);
  }
  
  // Create new handlers
  keyDownHandler = handleKeyDown;
  keyUpHandler = handleKeyUp;
  
  addEventListener("keydown", keyDownHandler);
  addEventListener("keyup", keyUpHandler);
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

// Optimized input functions with early returns
export const isleft = (id) => {
  if (isAIControlActive(id, Control.LEFT)) return true;
  return isKeyDown(controls[id].keyboard[Control.LEFT]);
};

export const isright = (id) => {
  if (isAIControlActive(id, Control.RIGHT)) return true;
  return isKeyDown(controls[id].keyboard[Control.RIGHT]);
};

export const isup = (id) => {
  if (isAIControlActive(id, Control.UP)) return true;
  return isKeyDown(controls[id].keyboard[Control.UP]);
};

export const isdown = (id) => {
  if (isAIControlActive(id, Control.DOWN)) return true;
  return isKeyDown(controls[id].keyboard[Control.DOWN]);
};

export const isControlDown = (id) => isKeyDown(controls[id].keyboard[Control.LIGHT_PUNCH]);

export const isControlPressed = (id) => iskeyPressed(controls[id].keyboard[Control.LIGHT_PUNCH]);

export const isForward = (id, direction) => direction === FighterDirection.Right ? isright(id) : isleft(id);

export const isBackward = (id, direction) => direction === FighterDirection.Left ? isright(id) : isleft(id);

export const isIdle = (id) => !(isleft(id) || isright(id) || isup(id) || isdown(id));

// Optimized attack functions
export const isLightPunch = (id) => {
  if (isAIControlActive(id, Control.LIGHT_PUNCH)) return true;
  return iskeyPressed(controls[id].keyboard[Control.LIGHT_PUNCH]);
};

export const isMediumPunch = (id) => {
  if (isAIControlActive(id, Control.MEDIUM_PUNCH)) return true;
  return iskeyPressed(controls[id].keyboard[Control.MEDIUM_PUNCH]);
};

export const isHeavyPunch = (id) => {
  if (isAIControlActive(id, Control.HEAVY_PUNCH)) return true;
  return iskeyPressed(controls[id].keyboard[Control.HEAVY_PUNCH]);
};

export const isLightKick = (id) => {
  if (isAIControlActive(id, Control.LIGHT_KICK)) return true;
  return iskeyPressed(controls[id].keyboard[Control.LIGHT_KICK]);
};

export const isMediumKick = (id) => {
  if (isAIControlActive(id, Control.MEDIUM_KICK)) return true;
  return iskeyPressed(controls[id].keyboard[Control.MEDIUM_KICK]);
};

export const isHeavyKick = (id) => {
  if (isAIControlActive(id, Control.HEAVY_KICK)) return true;
  return iskeyPressed(controls[id].keyboard[Control.HEAVY_KICK]);
};
