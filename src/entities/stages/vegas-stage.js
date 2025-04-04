import { playSound } from "../../engine/soundHandler.js";
export class VegasStage {
  image = document.querySelector('img[alt="vegas-stage"]');
  music = document.getElementById("vegas-theme");
  frames = new Map([
    ["stage-floor", [2, 232, 508, 224]],
    ["stage-cars", [64, 496, 357, 184]],
  ]);
  constructor() {
    playSound(this.music, 0.3);
  }

  update() {}

  drawFrame(context, frameKey, x, y) {
    const [sourceX, sourceY, sourceWidth, sourceHeight] =
      this.frames.get(frameKey);

    context.drawImage(
      this.image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      x,
      y,
      sourceWidth,
      sourceHeight
    );
  }

  draw(context, camera) {
    this.drawFrame(
      context,
      "stage-floor",
      Math.floor(385 - camera.position.x),
      15 - camera.position.y
    );

    this.drawFrame(
      context,
      "stage-cars",
      Math.floor(445 - camera.position.x),
      15 - camera.position.y
    );
  }
}
