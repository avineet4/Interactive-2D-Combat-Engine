export const Control = {
  LEFT: "left",
  RIGHT: "right",
  UP: "up",
  DOWN: "down",
  LIGHT_PUNCH: "lightPunch",
  MEDIUM_PUNCH: "mediumPunch",
  HEAVY_PUNCH: "heavyPunch",
  LIGHT_KICK: "lightKick",
  MEDIUM_KICK: "mediumKick",
  HEAVY_KICK: "heavyKick",
};
export const controls = {
  0: {
    keyboard: {
      [Control.LEFT]: "ArrowLeft",
      [Control.RIGHT]: "ArrowRight",
      [Control.UP]: "ArrowUp",
      [Control.DOWN]: "ArrowDown",
      [Control.LIGHT_PUNCH]: "ControlRight",
      [Control.MEDIUM_PUNCH]: "Slash",
      [Control.HEAVY_PUNCH]: "Period",
      [Control.LIGHT_KICK]: "Quote",
      [Control.MEDIUM_KICK]: "Enter",
      [Control.HEAVY_KICK]: "ShiftRight",
    },
  },
  1: {
    // Player 2 (Ken)
    keyboard: {
      [Control.LEFT]: "KeyA",
      [Control.RIGHT]: "KeyD",
      [Control.UP]: "KeyW",
      [Control.DOWN]: "KeyS",
      [Control.LIGHT_PUNCH]: "KeyE",
      [Control.MEDIUM_PUNCH]: "Digit3",
      [Control.HEAVY_PUNCH]: "Digit4",
      [Control.LIGHT_KICK]: "KeyR",
      [Control.MEDIUM_KICK]: "KeyF",
      [Control.HEAVY_KICK]: "KeyT",
    },
  },
};
