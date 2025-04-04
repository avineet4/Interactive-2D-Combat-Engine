import { Camera } from "../../engine/camera.js";
import { playSound } from "../../engine/soundHandler.js";

export class KenStage {
  image = document.querySelector('img[alt="ken-stage"]');
  music = document.getElementById("ken-theme");
  frames = new Map([
    ["stage-background", [72, 208, 767, 176]],
    ["stage-floor", [8, 392, 895, 72]],
    ["stage-boat", [8, 18, 517, 178]],
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
    // Draw the background (water and sky)
    this.drawFrame(
      context,
      "stage-background",
      Math.floor(16 - camera.position.x / 2.157303),
      -camera.position.y
    );

    // Draw the boat
    this.drawFrame(
      context,
      "stage-boat",
      Math.floor(150 - camera.position.x / 1.613445),
      -1 - camera.position.y
    );

    // Draw the wooden floor
    this.drawFrame(
      context,
      "stage-floor",
      Math.floor(192 - camera.position.x),
      176 - camera.position.y
    );
  }
}
