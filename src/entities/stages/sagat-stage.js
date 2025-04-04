import { playSound } from "../../engine/soundHandler.js";
export class SagatStage {
  image = document.querySelector('img[alt="sagat-stage"]');
  music = document.getElementById("sagat-theme");
  frames = new Map([
    ["stage-floor", [7, 16, 769, 225]],
    ["stage-background", [8, 256, 895, 176]],
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
      "stage-background",
      Math.floor(0 - camera.position.x / 3),
      0 - camera.position.y
    );

    this.drawFrame(
      context,
      "stage-floor",
      Math.floor(257 - camera.position.x),
      20 - camera.position.y
    );
  }
}
