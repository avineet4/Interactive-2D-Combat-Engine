/**
 * AI System Manager - Coordinates all AI components
 * Main interface for integrating AI into the fighting game
 */

import { AIController } from './AIController.js';
import { VirtualInputHandler } from './VirtualInputHandler.js';

export class AISystem {
  constructor(geminiApiKey) {
    this.geminiApiKey = geminiApiKey;
    this.virtualInputHandler = new VirtualInputHandler();
    this.aiControllers = new Map();
    this.isInitialized = false;
    this.debugMode = false;
    
    // Performance tracking
    this.updateCount = 0;
    this.lastPerformanceLog = 0;
    this.averageUpdateTime = 0;
  }

  /**
   * Initialize the AI system
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Patch input handler to support virtual inputs
      await this.virtualInputHandler.patchInputHandler();
      
      this.isInitialized = true;
      console.log('AI System initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize AI System:', error);
      throw error;
    }
  }

  /**
   * Enable AI control for a specific player
   * @param {number} playerId - Player ID (0 or 1)
   * @param {boolean} enabled - Whether to enable AI
   */
  setAIEnabled(playerId, enabled = true) {
    if (!this.isInitialized) {
      console.warn('AI System not initialized. Call initialize() first.');
      return;
    }

    if (enabled) {
      // Create AI controller if it doesn't exist
      if (!this.aiControllers.has(playerId)) {
        const aiController = new AIController(this.geminiApiKey, playerId);
        aiController.setDebugMode(this.debugMode);
        
        this.aiControllers.set(playerId, aiController);
        this.virtualInputHandler.registerAIController(playerId, aiController);
      }
      
      // Enable the controller
      this.aiControllers.get(playerId).setEnabled(true);
      console.log(`AI enabled for player ${playerId}`);
      
    } else {
      // Disable AI if it exists
      if (this.aiControllers.has(playerId)) {
        this.aiControllers.get(playerId).setEnabled(false);
        console.log(`AI disabled for player ${playerId}`);
      }
    }
  }

  /**
   * Check if AI is enabled for a player
   * @param {number} playerId - Player ID
   * @returns {boolean} True if AI is enabled
   */
  isAIEnabled(playerId) {
    const controller = this.aiControllers.get(playerId);
    return controller ? controller.isEnabled : false;
  }

  /**
   * Update AI system - called every frame
   * @param {Array} fighters - Array of fighter objects
   * @param {Object} battleScene - Battle scene reference
   * @param {Object} frameTime - Frame timing information
   */
  async update(fighters, battleScene, frameTime) {
    if (!this.isInitialized || !fighters || fighters.length < 2) {
      return;
    }

    const startTime = performance.now();

    try {
      // Update each AI controller
      for (const [playerId, controller] of this.aiControllers.entries()) {
        if (controller.isEnabled && fighters[playerId]) {
          const aiFighter = fighters[playerId];
          const opponent = fighters[1 - playerId]; // Get the other fighter
          
          // Update AI decision making
          await controller.update(aiFighter, opponent, battleScene, frameTime);
          
          // Update virtual inputs
          this.virtualInputHandler.updateVirtualInputs(playerId, controller.virtualInputs);
        }
      }

      // Performance tracking
      const updateTime = performance.now() - startTime;
      this.updateCount++;
      this.averageUpdateTime = (this.averageUpdateTime + updateTime) / 2;

      // Log performance occasionally
      if (this.debugMode && performance.now() - this.lastPerformanceLog > 5000) {
        console.log(`AI System Performance: ${this.averageUpdateTime.toFixed(2)}ms avg update time`);
        this.lastPerformanceLog = performance.now();
      }

    } catch (error) {
      console.error('AI System update error:', error);
    }
  }

  /**
   * Get AI status for a player
   * @param {number} playerId - Player ID
   * @returns {Object|null} AI status or null if no AI
   */
  getAIStatus(playerId) {
    const controller = this.aiControllers.get(playerId);
    return controller ? controller.getStatus() : null;
  }

  /**
   * Force an action for testing
   * @param {number} playerId - Player ID
   * @param {string} actionName - Action to force
   */
  forceAction(playerId, actionName) {
    const controller = this.aiControllers.get(playerId);
    if (controller) {
      controller.forceAction(actionName);
    }
  }

  /**
   * Enable or disable debug mode
   * @param {boolean} enabled - Whether to enable debug mode
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    
    // Update all controllers
    for (const controller of this.aiControllers.values()) {
      controller.setDebugMode(enabled);
    }
    
    console.log(`AI System debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Reset AI system state
   */
  reset() {
    // Reset all AI controllers
    for (const controller of this.aiControllers.values()) {
      controller.reset();
    }
    
    // Reset virtual inputs
    this.virtualInputHandler.resetAllVirtualInputs();
    
    console.log('AI System reset');
  }

  /**
   * Shutdown AI system and cleanup
   */
  shutdown() {
    // Disable all AI controllers
    for (const [playerId] of this.aiControllers.entries()) {
      this.setAIEnabled(playerId, false);
    }

    // Unpatch input handler
    this.virtualInputHandler.unpatchInputHandler();
    
    // Clear controllers
    this.aiControllers.clear();
    
    this.isInitialized = false;
    console.log('AI System shutdown');
  }

  /**
   * Get system statistics
   * @returns {Object} System statistics
   */
  getStatistics() {
    return {
      initialized: this.isInitialized,
      activeControllers: Array.from(this.aiControllers.entries())
        .filter(([_, controller]) => controller.isEnabled)
        .map(([playerId]) => playerId),
      updateCount: this.updateCount,
      averageUpdateTime: this.averageUpdateTime,
      debugMode: this.debugMode
    };
  }

  /**
   * Create a simple AI vs Human setup
   * @param {number} aiPlayerId - Which player should be AI (0 or 1)
   */
  setupAIVsHuman(aiPlayerId = 1) {
    this.setAIEnabled(aiPlayerId, true);
    this.setAIEnabled(1 - aiPlayerId, false);
    
    console.log(`Setup complete: Player ${aiPlayerId} is AI, Player ${1 - aiPlayerId} is human`);
  }

  /**
   * Create AI vs AI setup
   */
  setupAIVsAI() {
    this.setAIEnabled(0, true);
    this.setAIEnabled(1, true);
    
    console.log('Setup complete: Both players are AI controlled');
  }

  /**
   * Disable all AI (human vs human)
   */
  setupHumanVsHuman() {
    this.setAIEnabled(0, false);
    this.setAIEnabled(1, false);
    
    console.log('Setup complete: Both players are human controlled');
  }
}