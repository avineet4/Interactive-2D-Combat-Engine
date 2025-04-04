import { FRAME_TIME } from "../../../constants/game.js";

export class HitSplash {
  constructor(x, y, playerId, onEnd) {
    this.image = document.getElementById("decals");
    this.position = { x, y };
    this.playerId = playerId;
    this.onEnd = onEnd;
    this.frames = [];
    this.animationFrame = -1;
    this.animationTimer = 0;
  }

  update(time) {
    if (time.previous < this.animationTimer + 4 * FRAME_TIME) return;
    this.animationFrame += 1;
    this.animationTimer = time.previous;

    // Ensure we don't exceed the number of frames available per player
    const maxFramesPerPlayer = this.frames.length / 2; // 2 players
    if (this.animationFrame >= maxFramesPerPlayer) {
      this.onEnd(this);
    }
  }
  draw(context, camera) {
    if (
      this.animationFrame < 0 ||
      this.animationFrame >= this.frames.length / 2
    ) {
      return;
    }

    const frameIndex = this.animationFrame + this.playerId * 4;
    if (frameIndex < 0 || frameIndex >= this.frames.length) {
      return;
    }

    const [[x, y, width, heigth], [originX, originY]] = this.frames[frameIndex];

    context.drawImage(
      this.image,
      x,
      y,
      width,
      heigth,
      Math.floor(this.position.x - camera.position.x - originX),
      Math.floor(this.position.y - camera.position.y - originY),
      width,
      heigth
    );
  }
}
