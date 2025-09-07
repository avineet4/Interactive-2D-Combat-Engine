import { StreetFighterGame } from "./StreetFighterGame.js";
import { initializeAI, setupAIControls } from "./ai/SimpleAIIntegration.js";

// Store game instance globally for AI access
let game;

window.onload = () => {
  game = new StreetFighterGame();
  game.start();
  
  // Store game instance globally for AI system
  window.gameInstance = game;
  
  // Setup AI controls
  setupAIControls();
  
  console.log("Game started! Click the 🤖 AI button to enable AI mode.");
};
