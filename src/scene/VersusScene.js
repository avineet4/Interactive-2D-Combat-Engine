import { ContextHandler } from "../engine/contextHandler.js";
import { BattleScene } from "./BattleScene.js";
import { gameState } from "../states/gameState.js";
import { getStageClass } from "./stageSelection.js";
import { playSound, stopSound } from "../engine/soundHandler.js";

export class VersusScene {
  image = document.getElementById("versusScene");
  music = document.getElementById("versus-screen");
  frames = new Map([
    ["background", [0, 0, 385, 225]],
    ["Ryu-image", [386, 140, 129, 126]],
    ["Ken-image", [385, 266, 130, 129]],
    ["Ryu-tag", [387, 35, 126, 17]],
    ["Ken-tag", [388, 69, 124, 18]],
  ]);
  constructor(changeScene) {
    playSound(this.music, 0.3);

    this.changeScene = changeScene;
    this.contextHandler = new ContextHandler();
    this.isTransitioning = false;

    // Start fading in from black
    this.contextHandler.brightness = 0;
    this.contextHandler.startGlowUp(); // Replaced startDimUp with startGlowUp

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.canvas = document.querySelector("canvas");
    this.clickHandler = this.handleClick.bind(this);
    this.keyHandler = this.handleKeyDown.bind(this);
    this.canvas.addEventListener("click", this.clickHandler);
    window.addEventListener("keydown", this.keyHandler);
  }

  handleClick(event) {
    if (this.isTransitioning) return;
    this.startTransition();
  }

  handleKeyDown(event) {
    if (this.isTransitioning) return;
    if (event.key === "Enter" || event.key === " ") {
      this.startTransition();
    }
  }

  startTransition() {
    this.isTransitioning = true;
    this.contextHandler.startDimDown();

    setTimeout(() => {
      this.canvas.removeEventListener("click", this.clickHandler);
      window.removeEventListener("keydown", this.keyHandler);
      const StageClass = getStageClass(gameState.selectedStage);
      const battleScene = new BattleScene(this.changeScene, new StageClass());
      stopSound(this.music);
      this.changeScene(battleScene);
    }, 1000);
  }

  update(time) {
    this.contextHandler.update(time);
  }

  drawFrame(context, frameKey, x, y, scaleX = 1, scaleY = 1, direction = 1) {
    const frameData = this.frames.get(frameKey);

    const [sourceX, sourceY, sourceWidth, sourceHeight] = frameData;

    context.scale(direction, 1);
    context.drawImage(
      this.image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      x * direction,
      y,
      sourceWidth * scaleX,
      sourceHeight * scaleY
    );
    context.setTransform(1, 0, 0, 1, 0, 0);
  }

  draw(context) {
    context.imageSmoothingEnabled = false;

    // Draw background
    context.fillStyle = "#111";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    this.drawFrame(context, "background", 0, 0);
    this.drawFrame(context, "Ryu-image", 10, 11);
    this.drawFrame(context, "Ryu-tag", 17, 140);
    this.drawFrame(context, "Ken-image", 375, 9, 1, 1, -1);
    this.drawFrame(context, "Ken-tag", 245, 140);

    if (this.isTransitioning) {
      context.fillStyle = `rgba(0, 0, 0, ${
        1 - this.contextHandler.brightness
      })`;
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    }
  }
}
