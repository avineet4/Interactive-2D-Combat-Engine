import { SCENE_WIDTH } from "../constants/stage.js";
import { gameState } from "../states/gameState.js";
import { ContextHandler } from "../engine/contextHandler.js";
import { KenStage } from "../entities/stages/ken-stage.js";
import { RyuStage } from "../entities/stages/ryu-stage.js";
import { VegasStage } from "../entities/stages/vegas-stage.js";
import { SagatStage } from "../entities/stages/sagat-stage.js";
import { playSound, stopSound } from "../engine/soundHandler.js";
import { VersusScene } from "./VersusScene.js";

// Define getStageClass as a standalone function
export function getStageClass(stageName) {
  switch (stageName) {
    case "Ken":
      return KenStage;
    case "Ryu":
      return RyuStage;
    case "Sagat":
      return SagatStage;
    case "Vegas":
      return VegasStage;
    default:
      return RyuStage; // Default to RyuStage if unknown
  }
}

export class StageSelectionScene {
  music = document.getElementById("stage-selection");
  constructor(changeScene) {
    playSound(this.music, 0.3);

    this.changeScene = changeScene;
    this.contextHandler = new ContextHandler();
    this.image = document.getElementById("hud");
    this.stages = ["Ken", "Ryu", "Sagat", "Vegas"];
    this.currentIndex = 0;
    this.selectedStage = this.stages[this.currentIndex];

    this.carouselX = (SCENE_WIDTH || 386) / 2;
    this.stageWidth = 200;
    this.stageHeight = 135;
    this.spacing = 50;
    this.isTransitioning = false;
    this.transitionProgress = 0;
    this.transitionFrom = 0;
    this.transitionTo = 0;
    this.isSelectingStage = false;

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
    ]);

    this.setupEventListeners();
    console.log("StageSelectionScene initialized");
  }

  setupEventListeners() {
    this.canvas = document.querySelector("canvas");
    this.clickHandler = this.handleClick.bind(this);
    this.keyHandler = this.handleKeyDown.bind(this);
    this.canvas.addEventListener("click", this.clickHandler);
    window.addEventListener("keydown", this.keyHandler);
  }

  handleClick(event) {
    if (this.isTransitioning || this.isSelectingStage) return;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    if (y > 100 && y < 180) {
      if (x > 20 && x < 60) this.navigateCarousel("prev");
      if (x > (SCENE_WIDTH || 386) - 60 && x < (SCENE_WIDTH || 386) - 20)
        this.navigateCarousel("next");
    }

    const centerX = (SCENE_WIDTH || 386) / 2;
    const centerY = 130;
    if (
      x > centerX - this.stageWidth / 2 &&
      x < centerX + this.stageWidth / 2 &&
      y > centerY - this.stageHeight / 2 &&
      y < centerY + this.stageHeight / 2
    ) {
      this.selectStage();
    }
  }

  handleKeyDown(event) {
    if (this.isTransitioning || this.isSelectingStage) return;

    switch (event.key) {
      case "ArrowLeft":
        this.navigateCarousel("prev");
        break;
      case "ArrowRight":
        this.navigateCarousel("next");
        break;
      case "Enter":
      case " ":
        this.selectStage();
        break;
    }
  }

  navigateCarousel(direction) {
    if (this.isTransitioning || this.isSelectingStage) return;

    this.isTransitioning = true;
    this.transitionProgress = 0;
    this.transitionFrom = this.currentIndex;

    if (direction === "next") {
      this.currentIndex = (this.currentIndex + 1) % this.stages.length;
    } else {
      this.currentIndex =
        (this.currentIndex - 1 + this.stages.length) % this.stages.length;
    }

    this.transitionTo = this.currentIndex;
    this.selectedStage = this.stages[this.currentIndex];
  }

  selectStage() {
    if (this.isTransitioning || this.isSelectingStage) return;

    this.isSelectingStage = true;
    this.isTransitioning = false;

    gameState.selectedStage = this.selectedStage;
    this.contextHandler.startDimDown();

    setTimeout(() => {
      this.canvas.removeEventListener("click", this.clickHandler);
      window.removeEventListener("keydown", this.keyHandler);
      stopSound(this.music);
      this.changeScene(new VersusScene(this.changeScene));
    }, 1000);
  }

  update(time) {
    this.contextHandler.update(time);

    if (this.isTransitioning) {
      this.transitionProgress += 0.05;
      if (this.transitionProgress >= 1) {
        this.isTransitioning = false;
      }
    }
  }

  drawFrame(context, frameKey, x, y, scaleX = 1, scaleY = 1, direction = 1) {
    const frameData = this.frames.get(frameKey);
    if (!frameData || !this.image) return;
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

  drawTitle(context, label, x, y = 1, scaleX = 1, scaleY = 1) {
    const safeLabel = label.toUpperCase();
    for (const index in safeLabel) {
      const char = safeLabel.charAt(index);
      this.drawFrame(
        context,
        `score-${char}`,
        x + index * (12 * scaleX),
        y,
        scaleX,
        scaleY
      );
    }
  }

  drawCarousel(context) {
    const centerX = (SCENE_WIDTH || 386) / 2;
    const centerY = 130;

    for (let i = 0; i < this.stages.length; i++) {
      const offset = this.getCarouselOffset(i);
      const distance = Math.abs(offset);
      const scale = 1 - distance * 0.3;
      const opacity = 1 - distance * 0.4;
      const xPos = centerX + offset * (this.stageWidth + this.spacing) * 0.8;

      const drawWidth = this.stageWidth * scale;
      const drawHeight = this.stageHeight * scale;

      context.save();
      context.globalAlpha = opacity;
      this.drawStageThumbnail(
        context,
        this.stages[i],
        xPos - drawWidth / 2,
        centerY - drawHeight / 2,
        drawWidth,
        drawHeight
      );

      if (Math.abs(offset) < 0.5) {
        context.strokeStyle = "yellow";
        context.lineWidth = 4;
        context.strokeRect(
          xPos - drawWidth / 2 - 5,
          centerY - drawHeight / 2 - 5,
          drawWidth + 10,
          drawHeight + 10
        );
      }
      context.restore();
    }
  }

  getCarouselOffset(index) {
    if (
      (this.currentIndex === 0 && index < 0) ||
      (this.currentIndex === this.stages.length - 1 &&
        index > this.currentIndex)
    )
      return;

    let offset = index - this.currentIndex;

    if (this.isTransitioning) {
      const fromOffset = index - this.transitionFrom;
      const toOffset = index - this.transitionTo;
      offset = fromOffset + (toOffset - fromOffset) * this.transitionProgress;
    }

    return offset;
  }

  drawStageThumbnail(context, stageName, x, y, width, height) {
    const stageImage = this.getStagePreviewImage(stageName);
    context.fillStyle = "#222";
    context.fillRect(x, y, width, height);

    if (stageImage) {
      context.save();
      context.beginPath();
      context.rect(x, y, width, height);
      context.clip();
      const scale = Math.max(
        width / stageImage.width,
        height / stageImage.height
      );
      const scaledWidth = stageImage.width * scale;
      const scaledHeight = stageImage.height * scale;
      context.drawImage(
        stageImage,
        x + width / 2 - scaledWidth / 2,
        y + height / 2 - scaledHeight / 2,
        scaledWidth,
        scaledHeight
      );
      context.restore();
    }

    const isCenter = stageName === this.selectedStage;
    context.strokeStyle = isCenter ? "#ffdd00" : "#555";
    context.lineWidth = isCenter ? 3 : 2;
    context.strokeRect(x, y, width, height);
  }

  getStagePreviewImage(stageName) {
    switch (stageName) {
      case "Ken":
        return document.getElementById("kenStagePre") || null;
      case "Ryu":
        return document.getElementById("ryuStagePre") || null;
      case "Sagat":
        return document.getElementById("sagatStagePre") || null;
      case "Vegas":
        return document.getElementById("vegasStagePre") || null;
      default:
        return null;
    }
  }

  drawNavigationButtons(context) {
    const centerY = 130;
    context.fillStyle = "white";
    context.beginPath();
    context.moveTo(20, centerY);
    context.lineTo(40, centerY - 20);
    context.lineTo(40, centerY + 20);
    context.closePath();
    context.fill();

    context.beginPath();
    context.moveTo((SCENE_WIDTH || 386) - 20, centerY);
    context.lineTo((SCENE_WIDTH || 386) - 40, centerY - 20);
    context.lineTo((SCENE_WIDTH || 386) - 40, centerY + 20);
    context.closePath();
    context.fill();
  }

  draw(context) {
    context.imageSmoothingEnabled = false;
    context.fillStyle = "#111";
    context.fillRect(0, 0, SCENE_WIDTH || 386, 224);
    this.drawTitle(context, "SELECT STAGE", 95, 20, 1.4, 1.4);
    this.drawCarousel(context);
    this.drawNavigationButtons(context);
    this.drawTitle(context, `${this.selectedStage} STAGE`, 130, 210, 1, 1);

    if (this.isSelectingStage) {
      context.fillStyle = `rgba(0, 0, 0, ${
        1 - this.contextHandler.brightness
      })`;
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    }
  }
}
