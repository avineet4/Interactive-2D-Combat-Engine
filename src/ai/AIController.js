/**
 * AI Controller - Translates AI decisions into fighter actions
 * Manages AI-controlled fighter behavior and decision execution
 */

import { FighterState } from '../constants/fighter.js';
import { GeminiService } from './GeminiService.js';
import { GameStateAnalyzer } from './GameStateAnalyzer.js';
import { setAIInputs } from '../engine/inputHandler.js';

export class AIController {
  constructor(apiKey, controllerId = 0) {
    this.geminiService = new GeminiService(apiKey);
    this.gameStateAnalyzer = new GameStateAnalyzer();
    this.controllerId = controllerId; // Which player this AI controls (0 or 1)
    
    // AI state management
    this.currentDecision = null;
    this.decisionTimer = 0;
    this.decisionDuration = 200; // How long to execute a decision (ms)
    this.isEnabled = false;
    this.debugMode = false;
    
    // Action execution state
    this.currentAction = null;
    this.actionStartTime = 0;
    this.actionQueue = [];
    
    // Virtual input state - simulates key presses
    this.virtualInputs = {
      left: false,
      right: false,
      up: false,
      down: false,
      lightPunch: false,
      mediumPunch: false,
      heavyPunch: false,
      lightKick: false,
      mediumKick: false,
      heavyKick: false
    };

    // Bind methods to maintain context
    this.update = this.update.bind(this);
    this.executeAction = this.executeAction.bind(this);
  }

  /**
   * Enable or disable AI control
   * @param {boolean} enabled - Whether AI should be active
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.clearAllInputs();
    }
    
    if (this.debugMode) {
      console.log(`AI Controller ${this.controllerId} ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Enable debug logging
   * @param {boolean} enabled - Whether to show debug info
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
  }

  /**
   * Main update loop - called every frame
   * @param {Object} aiFighter - The fighter this AI controls
   * @param {Object} opponent - The opponent fighter
   * @param {Object} battleScene - Reference to battle scene
   * @param {Object} frameTime - Frame timing information
   */
  async update(aiFighter, opponent, battleScene, frameTime) {
    if (!this.isEnabled || !aiFighter || !opponent) {
      return;
    }

    const now = performance.now();
    
    // Execute current action if one is active
    if (this.currentAction) {
      this.executeCurrentAction(aiFighter, now);
    }

    // Check if we need a new decision
    if (this.shouldMakeNewDecision(now)) {
      await this.makeNewDecision(aiFighter, opponent, battleScene);
    }

    // Apply virtual inputs to the fighter
    this.applyVirtualInputs();
  }

  /**
   * Check if AI should make a new decision
   * @param {number} now - Current timestamp
   * @returns {boolean} True if new decision needed
   */
  shouldMakeNewDecision(now) {
    // No current decision
    if (!this.currentDecision) return true;
    
    // Decision has expired
    if (now - this.decisionTimer > this.decisionDuration) return true;
    
    // Current action completed and no queued actions
    if (!this.currentAction && this.actionQueue.length === 0) return true;
    
    return false;
  }

  /**
   * Make a new AI decision using Gemini
   * @param {Object} aiFighter - AI controlled fighter
   * @param {Object} opponent - Opponent fighter
   * @param {Object} battleScene - Battle scene reference
   */
  async makeNewDecision(aiFighter, opponent, battleScene) {
    try {
      // Analyze current game state
      const gameState = this.gameStateAnalyzer.analyzeGameState(aiFighter, opponent, battleScene);
      
      if (this.debugMode) {
        console.log('AI Game State:', {
          distance: gameState.distance,
          myHealth: gameState.myHealth,
          opponentHealth: gameState.opponentHealth,
          threatLevel: gameState.threatLevel
        });
      }

      // Get AI decision from Gemini
      const decision = await this.geminiService.getAIDecision(gameState);
      
      if (this.debugMode) {
        console.log('AI Decision:', decision);
      }

      // Store and execute the decision
      this.currentDecision = decision;
      this.decisionTimer = performance.now();
      
      // Convert decision to action
      this.queueAction(decision.action, decision.priority);
      
    } catch (error) {
      console.error('AI Decision Error:', error);
      
      // Fallback to simple behavior
      this.currentDecision = {
        action: 'idle',
        priority: 'low',
        reasoning: 'error fallback'
      };
      this.decisionTimer = performance.now();
    }
  }

  /**
   * Queue an action for execution
   * @param {string} actionName - Name of action to execute
   * @param {string} priority - Priority level
   */
  queueAction(actionName, priority = 'medium') {
    const action = {
      name: actionName,
      priority,
      startTime: performance.now(),
      duration: this.getActionDuration(actionName)
    };

    // High priority actions replace current action
    if (priority === 'high' && this.currentAction) {
      this.currentAction = null;
      this.clearAllInputs();
    }

    // Set as current action if none active
    if (!this.currentAction) {
      this.currentAction = action;
      this.actionStartTime = action.startTime;
    } else {
      // Queue for later
      this.actionQueue.push(action);
    }
  }

  /**
   * Execute the current action
   * @param {Object} aiFighter - AI controlled fighter
   * @param {number} now - Current timestamp
   */
  executeCurrentAction(aiFighter, now) {
    if (!this.currentAction) return;

    const action = this.currentAction;
    const elapsed = now - this.actionStartTime;

    // Check if action should complete
    if (elapsed > action.duration) {
      this.completeCurrentAction();
      return;
    }

    // Execute the action
    this.executeAction(action.name, aiFighter);
  }

  /**
   * Execute a specific action by name
   * @param {string} actionName - Name of action to execute
   * @param {Object} aiFighter - AI controlled fighter
   */
  executeAction(actionName, aiFighter) {
    // Clear all inputs first
    this.clearAllInputs();

    switch (actionName) {
      // Movement actions
      case 'walk_forward':
        this.virtualInputs.right = aiFighter.direction > 0;
        this.virtualInputs.left = aiFighter.direction < 0;
        break;
        
      case 'walk_backward':
        this.virtualInputs.left = aiFighter.direction > 0;
        this.virtualInputs.right = aiFighter.direction < 0;
        break;
        
      case 'jump_up':
        this.virtualInputs.up = true;
        break;
        
      case 'jump_forward':
        this.virtualInputs.up = true;
        this.virtualInputs.right = aiFighter.direction > 0;
        this.virtualInputs.left = aiFighter.direction < 0;
        break;
        
      case 'jump_backward':
        this.virtualInputs.up = true;
        this.virtualInputs.left = aiFighter.direction > 0;
        this.virtualInputs.right = aiFighter.direction < 0;
        break;

      // Attack actions
      case 'light_punch':
        this.virtualInputs.lightPunch = true;
        break;
        
      case 'medium_punch':
        this.virtualInputs.mediumPunch = true;
        break;
        
      case 'heavy_punch':
        this.virtualInputs.heavyPunch = true;
        break;
        
      case 'light_kick':
        this.virtualInputs.lightKick = true;
        break;
        
      case 'medium_kick':
        this.virtualInputs.mediumKick = true;
        break;
        
      case 'heavy_kick':
        this.virtualInputs.heavyKick = true;
        break;

      // Defensive actions
      case 'crouch':
        this.virtualInputs.down = true;
        break;
        
      case 'block':
        // Block by moving backward
        this.virtualInputs.left = aiFighter.direction > 0;
        this.virtualInputs.right = aiFighter.direction < 0;
        break;
        
      case 'idle':
      default:
        // All inputs already cleared
        break;
    }
  }

  /**
   * Complete the current action and start next queued action
   */
  completeCurrentAction() {
    if (this.debugMode && this.currentAction) {
      console.log(`AI completed action: ${this.currentAction.name}`);
    }

    this.currentAction = null;
    this.clearAllInputs();

    // Start next queued action
    if (this.actionQueue.length > 0) {
      this.currentAction = this.actionQueue.shift();
      this.actionStartTime = performance.now();
    }
  }

  /**
   * Get duration for specific action type
   * @param {string} actionName - Name of action
   * @returns {number} Duration in milliseconds
   */
  getActionDuration(actionName) {
    const durations = {
      // Movement durations
      'walk_forward': 300,
      'walk_backward': 300,
      'jump_up': 600,
      'jump_forward': 600,
      'jump_backward': 600,
      
      // Attack durations (brief for single hits)
      'light_punch': 100,
      'medium_punch': 150,
      'heavy_punch': 200,
      'light_kick': 120,
      'medium_kick': 170,
      'heavy_kick': 220,
      
      // Defensive durations
      'crouch': 250,
      'block': 200,
      'idle': 100
    };

    return durations[actionName] || 150;
  }

  /**
   * Clear all virtual inputs
   */
  clearAllInputs() {
    Object.keys(this.virtualInputs).forEach(key => {
      this.virtualInputs[key] = false;
    });
  }

  /**
   * Apply virtual inputs by modifying the input handler's state
   * This is where we inject our AI inputs into the game's input system
   */
  applyVirtualInputs() {
    // Apply virtual inputs to the input handler
    setAIInputs(this.controllerId, this.virtualInputs);
    
    if (this.debugMode && Object.values(this.virtualInputs).some(v => v)) {
      const activeInputs = Object.entries(this.virtualInputs)
        .filter(([key, value]) => value)
        .map(([key]) => key);
      console.log(`AI Virtual Inputs: ${activeInputs.join(', ')}`);
    }
  }

  /**
   * Get current AI status for debugging
   * @returns {Object} Current AI status
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      currentDecision: this.currentDecision?.action || 'none',
      currentAction: this.currentAction?.name || 'none',
      queuedActions: this.actionQueue.length,
      decisionAge: this.currentDecision ? 
        performance.now() - this.decisionTimer : 0
    };
  }

  /**
   * Force a specific action (for testing)
   * @param {string} actionName - Action to force
   */
  forceAction(actionName) {
    this.queueAction(actionName, 'high');
  }

  /**
   * Reset AI state
   */
  reset() {
    this.currentDecision = null;
    this.currentAction = null;
    this.actionQueue = [];
    this.clearAllInputs();
    this.decisionTimer = 0;
    this.actionStartTime = 0;
  }
}