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

  // Performance optimization
  targetFPS = 60;
  targetFrameTime = 1000 / 60; // 16.67ms
  frameCount = 0;
  lastFPSLog = 0;
  actualFPS = 0;

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
    
    // Enable hardware acceleration
    context.imageSmoothingEnabled = false;
    
    return context;
  }

  changeScene(newScene) {
    // Handle scene transition
    this.contextHandler.startGlowUp();
    this.scene = newScene;
  }

  frame(time) {
    // Calculate frame time with capping
    const deltaTime = time - this.frameTime.previous;
    const cappedDeltaTime = Math.min(deltaTime, this.targetFrameTime * 2); // Cap at 2x target frame time
    
    this.frameTime = {
      secondsPassed: cappedDeltaTime / 1000,
      previous: time,
    };

    // Clear canvas efficiently
    this.context.clearRect(
      0,
      0,
      this.gameViewport.Width,
      this.gameViewport.Height
    );

    // Update context handler for global effects
    this.contextHandler.update(this.frameTime);

    // Update and draw current scene
    this.scene.update(this.frameTime, this.context);
    this.scene.draw(this.context);

    // Performance monitoring
    this.frameCount++;
    if (time - this.lastFPSLog > 2000) { // Log FPS every 2 seconds
      this.actualFPS = Math.round((this.frameCount * 1000) / (time - this.lastFPSLog + 1000));
      this.frameCount = 0;
      this.lastFPSLog = time;
      
      // Log performance if FPS drops below target
      if (this.actualFPS < this.targetFPS - 10) {
        console.warn(`Performance warning: FPS dropped to ${this.actualFPS}`);
      } else {
        console.log(`Game running at ${this.actualFPS} FPS`);
      }
    }

    // Schedule next frame
    window.requestAnimationFrame(this.frame.bind(this));
  }

  start() {
    registerKeyboardEvents();
    window.requestAnimationFrame(this.frame.bind(this));
  }
}
