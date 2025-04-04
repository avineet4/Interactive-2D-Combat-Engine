import { ContextHandler } from "../engine/contextHandler.js";
import { playSound, stopSound } from "../engine/soundHandler.js";
import { StageSelectionScene } from "./stageSelection.js";

export class TitleScene {
  music = document.getElementById("title-theme");
  constructor(changeScene = null) {
    playSound(this.music, 0.3);

    this.image = document.getElementById("TitleScene");
    this.image1 = document.getElementById("hud");

    this.frames = new Map([
      ["score-@", [17, 113, 10, 10]],
      ["score-A", [29, 113, 10, 10]],
      ["score-B", [41, 113, 10, 10]],
      ["score-C", [53, 113, 10, 10]],
      ["score-D", [65, 113, 10, 10]],
      ["score-E", [77, 113, 10, 10]],
      ["score-F", [89, 113, 10, 10]],
      ["score-G", [101, 113, 10, 10]],
      ["score-H", [113, 113, 10, 10]],
      ["score-I", [125, 113, 10, 10]],
      ["score-J", [136, 113, 10, 10]],
      ["score-K", [149, 113, 10, 10]],
      ["score-L", [161, 113, 10, 10]],
      ["score-M", [173, 113, 10, 10]],
      ["score-N", [185, 113, 10, 10]],
      ["score-O", [197, 113, 10, 10]],
      ["score-P", [17, 125, 10, 10]],
      ["score-Q", [29, 125, 10, 10]],
      ["score-R", [41, 125, 10, 10]],
      ["score-S", [53, 125, 10, 10]],
      ["score-T", [65, 125, 10, 10]],
      ["score-U", [77, 125, 10, 10]],
      ["score-V", [89, 125, 10, 10]],
      ["score-W", [101, 125, 10, 10]],
      ["score-X", [113, 125, 10, 10]],
      ["score-Y", [125, 125, 10, 10]],
      ["score-Z", [136, 125, 10, 10]],
      ["score- ", [0, 0, 10, 10]],
      ["arrow", [176, 93, 4, 4]],
      ["score-|", [167, 149, 4, 11]],
    ]);

    this.changeScene = changeScene;
    this.isTransitioning = false;

    this.selectedOption = 0;
    this.optionYPositions = [171, 184, 197];

    this.contextHandler = new ContextHandler();

    this.setupInput();
  }

  setupInput() {
    this.keyDownHandler = this.handleKeyDown.bind(this);
    document.addEventListener("click", this.clickHandler);
    document.addEventListener("keydown", this.keyDownHandler);
  }

  removeInputListeners() {
    document.removeEventListener("click", this.clickHandler);
    document.removeEventListener("keydown", this.keyDownHandler);
  }

  handleKeyDown(event) {
    if (this.isTransitioning) return;

    switch (event.key) {
      case "ArrowUp":
        this.selectedOption = Math.max(0, this.selectedOption - 1);
        break;
      case "ArrowDown":
        this.selectedOption = Math.min(2, this.selectedOption + 1);
        break;
      case "Enter":
      case " ":
        this.startGame();
        break;
    }
  }

  startGame() {
    if (this.selectedOption !== 0 || this.isTransitioning) return; // Only proceed if on "PRESS TO START"

    stopSound(this.music, 0.3);
    this.isTransitioning = true;

    // Start dimming down the screen
    this.contextHandler.startDimDown();

    // Schedule transition to StageSelectionScene
    setTimeout(() => {
      if (this.changeScene && typeof this.changeScene === "function") {
        this.removeInputListeners();
        const stageSelectionScene = new StageSelectionScene(this.changeScene);
        this.changeScene(stageSelectionScene);
      }
    }, 1000); // Allow time for dimming effect
  }

  update(time, context) {
    this.contextHandler.update(time);
  }

  drawTitleScene(context) {
    context.drawImage(this.image, 391, 20, 332, 130, 75, 8, 250, 150);
  }

  drawFrame(context, frameKey, x, y, scaleX = 1, scaleY = 1, direction = 1) {
    const frameData = this.frames.get(frameKey);
    if (!frameData) {
      console.warn(`Frame data not found for key: ${frameKey}`);
      return;
    }

    const [sourceX, sourceY, sourceWidth, sourceHeight] = frameData;

    context.scale(direction, 1);
    context.drawImage(
      this.image1,
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

  drawTitle(context, label, x, y = 1, scaleX = 1, scaleY = 1) {
    const safeLabel = label.toUpperCase();
    for (const index in safeLabel) {
      const char = safeLabel.charAt(index);
      const frameKey = `score-${char}`;
      this.drawFrame(
        context,
        frameKey,
        x + index * (12 * scaleX),
        y,
        scaleX,
        scaleY
      );
    }
  }

  drawArrow(context) {
    const arrowX = 123; // Position the arrow to the left of the options
    const arrowY = this.optionYPositions[this.selectedOption];
    this.drawFrame(context, "arrow", arrowX, arrowY, 1, 1);
  }

  draw(context) {
    context.imageSmoothingEnabled = false;
    context.fillStyle = "#111";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    this.drawTitleScene(context);

    this.drawTitle(context, "PRESS TO START", 130, 170, 0.7, 0.7);
    this.drawTitle(context, "CREATE |JOIN ROOM @SOON", 130, 183, 0.7, 0.7);
    this.drawTitle(context, "AI VS PLAYER @SOON", 130, 196, 0.7, 0.7);

    // Draw the arrow
    this.drawArrow(context);

    if (this.isTransitioning) {
      context.fillStyle = `rgba(0, 0, 0, ${
        1 - this.contextHandler.brightness
      })`;
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    }
  }
}
