/**
 * AI Integration Example
 * Shows how to integrate AI system into the main game
 */

import { StreetFighterGame } from "./StreetFighterGame.js";
import { AIScene } from "./scene/AIScene.js";
import { BattleScene } from "./scene/BattleScene.js";

/**
 * Extended game class with AI support
 */
export class AIStreetFighterGame extends StreetFighterGame {
  constructor() {
    super();
    this.aiMode = false;
    this.setupAIKeyboardControls();
  }

  /**
   * Setup keyboard controls for AI mode
   */
  setupAIKeyboardControls() {
    document.addEventListener('keydown', (event) => {
      switch(event.code) {
        case 'KeyA':
          this.toggleAIMode();
          break;
        case 'KeyT':
          this.startAITraining();
          break;
        case 'KeyS':
          this.stopAITraining();
          break;
        case 'KeyV':
          this.createAIVsAIBattle();
          break;
        case 'KeyH':
          this.createHumanVsAIBattle();
          break;
      }
    });
  }

  /**
   * Toggle AI mode
   */
  toggleAIMode() {
    this.aiMode = !this.aiMode;
    
    if (this.aiMode) {
      this.scene = new AIScene(this.changeScene.bind(this));
      console.log("Switched to AI Mode");
    } else {
      this.scene = new BattleScene(this.changeScene.bind(this));
      console.log("Switched to Normal Mode");
    }
  }

  /**
   * Start AI training
   */
  startAITraining() {
    if (this.aiMode && this.scene.startAITraining) {
      this.scene.startAITraining();
    }
  }

  /**
   * Stop AI training
   */
  stopAITraining() {
    if (this.aiMode && this.scene.stopAITraining) {
      this.scene.stopAITraining();
    }
  }

  /**
   * Create AI vs AI battle
   */
  createAIVsAIBattle() {
    if (this.aiMode && this.scene.createAIVsAIBattle) {
      this.scene.createAIVsAIBattle();
    }
  }

  /**
   * Create Human vs AI battle
   */
  createHumanVsAIBattle() {
    if (this.aiMode && this.scene.createHumanVsAIBattle) {
      this.scene.createHumanVsAIBattle();
    }
  }

  /**
   * Override changeScene to handle AI mode
   */
  changeScene(newScene) {
    // Clean up AI components if switching away from AI scene
    if (this.scene && this.scene.cleanup) {
      this.scene.cleanup();
    }
    
    // Call parent method
    super.changeScene(newScene);
  }
}

/**
 * Usage Examples
 */

// Example 1: Basic AI integration
export function basicAIExample() {
  const game = new AIStreetFighterGame();
  game.start();
  
  // Press 'A' to toggle AI mode
  // Press 'T' to start training
  // Press 'V' for AI vs AI battle
  // Press 'H' for Human vs AI battle
}

// Example 2: Direct AI training
export function directTrainingExample() {
  const game = new AIStreetFighterGame();
  game.start();
  
  // Switch to AI mode
  game.toggleAIMode();
  
  // Start training
  setTimeout(() => {
    game.startAITraining();
  }, 1000);
}

// Example 3: AI vs Human battle
export function aiVsHumanExample() {
  const game = new AIStreetFighterGame();
  game.start();
  
  // Switch to AI mode
  game.toggleAIMode();
  
  // Create human vs AI battle
  setTimeout(() => {
    game.createHumanVsAIBattle();
  }, 1000);
}

/**
 * Keyboard Controls Reference
 * 
 * Normal Mode:
 * - Arrow keys: Move fighter
 * - Z, X, C: Light, Medium, Heavy Punch
 * - A, S, D: Light, Medium, Heavy Kick
 * 
 * AI Mode Controls:
 * - A: Toggle AI Mode
 * - T: Start AI Training
 * - S: Stop AI Training
 * - V: AI vs AI Battle
 * - H: Human vs AI Battle
 * 
 * AI Control Panel:
 * - Click AI button (top-left) to open control panel
 * - Use panel buttons for all AI operations
 * - View real-time training statistics
 * - Save/Load best AI brains
 */
