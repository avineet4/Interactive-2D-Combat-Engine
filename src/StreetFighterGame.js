import { registerKeyboardEvents } from "./engine/inputHandler.js";
import { BattleScene } from "./scene/BattleScene.js";
import { TitleScene } from "./scene/TitleScene.js";
import { ContextHandler } from "./engine/contextHandler.js";

export class StreetFighterGame {
  context = this.getContext();
  contextHandler = new ContextHandler(this.context);

  frameTime = {
    previous: 0,
    secondsPassed: 0,
  };

  constructor() {
    // Start with the title scene
    this.scene = new TitleScene(this.changeScene.bind(this));
  }

  gameViewport = {
    Width: 386,
    Height: 224,
    Scale: 1,
  };

  getContext() {
    const canvasEl = document.querySelector("canvas");
    const context = canvasEl.getContext("2d");
    return context;
  }

  changeScene(newScene) {
    // Handle scene transition
    this.contextHandler.startGlowUp();
    this.scene = newScene;
  }

  frame(time) {
    this.context.clearRect(
      0,
      0,
      this.gameViewport.Width,
      this.gameViewport.Height
    );
    window.requestAnimationFrame(this.frame.bind(this));
    this.frameTime = {
      secondsPassed: (time - this.frameTime.previous) / 1000,
      previous: time,
    };

    // Update context handler for global effects
    this.contextHandler.update(this.frameTime);

    // Update and draw current scene
    this.scene.update(this.frameTime, this.context);
    this.scene.draw(this.context);
  }

  start() {
    registerKeyboardEvents();
    window.requestAnimationFrame(this.frame.bind(this));
  }
}
