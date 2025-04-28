import { Control, controls } from "../constants/control.js";
import { FighterDirection } from "../constants/fighter.js";
import { gestureHandler } from "./gestureHandler.js";

const heldKey = new Set(); //! Since Set only keeps unique values, duplicate key presses won’t be added multiple times.
const pressedKeys = new Set();

function handleKeyDown(event) {
  event.preventDefault();

  heldKey.add(event.code);
  gestureHandler.handleKeyDown(event);
}

function handleKeyUp(event) {
  event.preventDefault();

  heldKey.delete(event.code);
  pressedKeys.delete(event.code);
}

export async function registerKeyboardEvents() {
  addEventListener("keydown", handleKeyDown);
  addEventListener("keyup", handleKeyUp);
  
  // Initialize gesture handler
  await gestureHandler.initialize();
}

export const isKeyDown = (code) => {
  // For player 1 (Ryu), check gestures
  if (controls[0].keyboard[Control.LEFT] === code) return gestureHandler.isGestureActive(Control.LEFT);
  if (controls[0].keyboard[Control.RIGHT] === code) return gestureHandler.isGestureActive(Control.RIGHT);
  if (controls[0].keyboard[Control.UP] === code) return gestureHandler.isGestureActive(Control.UP);
  if (controls[0].keyboard[Control.DOWN] === code) return gestureHandler.isGestureActive(Control.DOWN);
  if (controls[0].keyboard[Control.LIGHT_PUNCH] === code) return gestureHandler.isGestureActive(Control.LIGHT_PUNCH);
  if (controls[0].keyboard[Control.MEDIUM_PUNCH] === code) return gestureHandler.isGestureActive(Control.MEDIUM_PUNCH);
  if (controls[0].keyboard[Control.HEAVY_PUNCH] === code) return gestureHandler.isGestureActive(Control.HEAVY_PUNCH);
  if (controls[0].keyboard[Control.MEDIUM_KICK] === code) return gestureHandler.isGestureActive(Control.MEDIUM_KICK);
  if (controls[0].keyboard[Control.HEAVY_KICK] === code) return gestureHandler.isGestureActive(Control.HEAVY_KICK);
  
  // For all other controls, use keyboard
  return heldKey.has(code);
};
export const isKeyUP = (code) => !heldKey.has(code);
export function iskeyPressed(code) {
  // For player 1 (Ryu), check gestures for attacks
  if (controls[0].keyboard[Control.LIGHT_PUNCH] === code) return gestureHandler.isGestureActive(Control.LIGHT_PUNCH);
  if (controls[0].keyboard[Control.MEDIUM_PUNCH] === code) return gestureHandler.isGestureActive(Control.MEDIUM_PUNCH);
  if (controls[0].keyboard[Control.HEAVY_PUNCH] === code) return gestureHandler.isGestureActive(Control.HEAVY_PUNCH);
  if (controls[0].keyboard[Control.LIGHT_KICK] === code) return gestureHandler.isGestureActive(Control.LIGHT_KICK);
  if (controls[0].keyboard[Control.MEDIUM_KICK] === code) return gestureHandler.isGestureActive(Control.MEDIUM_KICK);
  if (controls[0].keyboard[Control.HEAVY_KICK] === code) return gestureHandler.isGestureActive(Control.HEAVY_KICK);

  // For keyboard controls
  if (heldKey.has(code) && !pressedKeys.has(code)) {
    pressedKeys.add(code);
    return true;
  }
  return false;
}
export const isleft = (id) => isKeyDown(controls[id].keyboard[Control.LEFT]);
export const isright = (id) => isKeyDown(controls[id].keyboard[Control.RIGHT]);
export const isup = (id) => isKeyDown(controls[id].keyboard[Control.UP]);
export const isdown = (id) => isKeyDown(controls[id].keyboard[Control.DOWN]);
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
  iskeyPressed(controls[id].keyboard[Control.LIGHT_PUNCH]);
export const isMediumPunch = (id) =>
  iskeyPressed(controls[id].keyboard[Control.MEDIUM_PUNCH]);
export const isHeavyPunch = (id) =>
  iskeyPressed(controls[id].keyboard[Control.HEAVY_PUNCH]);

export const isLightKick = (id) =>
  iskeyPressed(controls[id].keyboard[Control.LIGHT_KICK]);
export const isMediumKick = (id) =>
  iskeyPressed(controls[id].keyboard[Control.MEDIUM_KICK]);
export const isHeavyKick = (id) =>
  iskeyPressed(controls[id].keyboard[Control.HEAVY_KICK]);
