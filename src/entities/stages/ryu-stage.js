import { playSound } from "../../engine/soundHandler.js";
export class RyuStage {
  image = document.querySelector('img[alt="ryu-stage"]');
  music = document.getElementById("ryu-theme");
  frames = new Map([
    ["stage-floor", [4, 197, 502, 215]],
    ["stage-background", [4, 4, 416, 184]],
  ]);
  constructor() {
    this.camera = {
      position: { x: 0, y: 0 },
    };
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
      Math.round(450 - camera.position.x),
      Math.round(17 - camera.position.y)
    );

    this.drawFrame(
      context,
      "stage-floor",
      Math.round(400 - camera.position.x),
      Math.round(25 - camera.position.y)
    );
  }
}
