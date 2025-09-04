/**
 * Game State Analyzer for AI Decision Making
 * Analyzes current game state and provides structured data for AI processing
 */

import { FighterState } from '../constants/fighter.js';
import { gameState } from '../states/gameState.js';

export class GameStateAnalyzer {
  constructor() {
    this.attackingStates = [
      FighterState.LIGHT_PUNCH,
      FighterState.MEDIUM_PUNCH, 
      FighterState.HEAVY_PUNCH,
      FighterState.LIGHT_KICK,
      FighterState.MEDIUM_KICK,
      FighterState.HEAVY_KICK
    ];

    this.vulnerableStates = [
      FighterState.JUMP_START,
      FighterState.JUMP_LAND,
      FighterState.CROUCH_DOWN,
      FighterState.CROUCH_UP,
      FighterState.HURT_HEAD_LIGHT,
      FighterState.HURT_HEAD_MEDIUM,
      FighterState.HURT_HEAD_HEAVY,
      FighterState.HURT_BODY_LIGHT,
      FighterState.HURT_BODY_MEDIUM,
      FighterState.HURT_BODY_HEAVY
    ];

    this.defensiveStates = [
      FighterState.CROUCH,
      FighterState.WALK_BACKWARDS
    ];

    this.movementStates = [
      FighterState.WALK_FORWARDS,
      FighterState.WALK_BACKWARDS,
      FighterState.JUMP_UP,
      FighterState.JUMP_FORWARDS,
      FighterState.JUMP_BACKWARDS
    ];
  }

  /**
   * Analyze current game state and return structured data for AI
   * @param {Object} aiFighter - AI controlled fighter
   * @param {Object} opponent - Opponent fighter
   * @param {Object} battleScene - Battle scene reference
   * @returns {Object} Analyzed game state
   */
  analyzeGameState(aiFighter, opponent, battleScene) {
    const distance = this.calculateDistance(aiFighter, opponent);
    const relativePosition = this.getRelativePosition(aiFighter, opponent);
    
    return {
      // Distance and positioning
      distance: Math.round(distance),
      distanceCategory: this.categorizeDistance(distance),
      relativePosition,
      
      // Fighter states
      myState: aiFighter.CurrentState,
      opponentState: opponent.CurrentState,
      myHealth: this.getFighterHealth(aiFighter),
      opponentHealth: this.getFighterHealth(opponent),
      
      // Positions
      myPosition: {
        x: Math.round(aiFighter.position.x),
        y: Math.round(aiFighter.position.y)
      },
      opponentPosition: {
        x: Math.round(opponent.position.x), 
        y: Math.round(opponent.position.y)
      },
      
      // State analysis
      isOpponentAttacking: this.isAttacking(opponent),
      isOpponentVulnerable: this.isVulnerable(opponent),
      isOpponentDefensive: this.isDefensive(opponent),
      amIAttacking: this.isAttacking(aiFighter),
      amIVulnerable: this.isVulnerable(aiFighter),
      
      // Action capabilities
      canAttack: this.canPerformAction(aiFighter, 'attack'),
      canMove: this.canPerformAction(aiFighter, 'move'),
      canJump: this.canPerformAction(aiFighter, 'jump'),
      canCrouch: this.canPerformAction(aiFighter, 'crouch'),
      
      // Tactical analysis
      hasAdvantage: this.hasAdvantage(aiFighter, opponent),
      threatLevel: this.calculateThreatLevel(aiFighter, opponent, distance),
      recommendedRange: this.getRecommendedRange(aiFighter, opponent),
      
      // Stage information
      stage: battleScene.stage?.constructor?.name || 'unknown',
      timeRemaining: battleScene.overlays?.[0]?.time || 99,
      
      // Historical context
      recentDamage: this.getRecentDamage(aiFighter),
      momentum: this.calculateMomentum(aiFighter, opponent)
    };
  }

  /**
   * Calculate distance between two fighters
   * @param {Object} fighter1 - First fighter
   * @param {Object} fighter2 - Second fighter
   * @returns {number} Distance in pixels
   */
  calculateDistance(fighter1, fighter2) {
    const dx = fighter1.position.x - fighter2.position.x;
    const dy = fighter1.position.y - fighter2.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Get relative position of fighters
   * @param {Object} aiFighter - AI fighter
   * @param {Object} opponent - Opponent fighter
   * @returns {Object} Relative position data
   */
  getRelativePosition(aiFighter, opponent) {
    const dx = opponent.position.x - aiFighter.position.x;
    const dy = opponent.position.y - aiFighter.position.y;
    
    // Enhanced detection for jumping over scenarios
    const isOpponentJumping = this.isJumping(opponent);
    const isOpponentAbove = dy > 10; // Increased threshold for better detection
    const isOpponentBelow = dy < -10;
    
    // Detect if opponent has jumped over the AI
    const hasOpponentJumpedOver = this.detectJumpOver(aiFighter, opponent);
    
    // Calculate if AI needs to turn based on current and previous positions
    const needsToTurn = this.calculateTurnNeeded(aiFighter, opponent);
    
    return {
      horizontal: dx > 0 ? 'right' : dx < 0 ? 'left' : 'aligned',
      vertical: isOpponentAbove ? 'above' : isOpponentBelow ? 'below' : 'same',
      isOpponentInFront: (aiFighter.direction > 0 && dx > 0) || (aiFighter.direction < 0 && dx < 0),
      needsToTurn: needsToTurn,
      hasOpponentJumpedOver: hasOpponentJumpedOver,
      isOpponentJumping: isOpponentJumping,
      isOpponentAbove: isOpponentAbove,
      isOpponentBelow: isOpponentBelow,
      horizontalDistance: Math.abs(dx),
      verticalDistance: Math.abs(dy)
    };
  }

  /**
   * Detect if opponent has jumped over the AI
   * @param {Object} aiFighter - AI fighter
   * @param {Object} opponent - Opponent fighter
   * @returns {boolean} True if opponent jumped over
   */
  detectJumpOver(aiFighter, opponent) {
    // Check if opponent is jumping and above the AI
    if (!this.isJumping(opponent) || opponent.position.y <= aiFighter.position.y) {
      return false;
    }
    
    // Check if opponent is close horizontally but above vertically
    const horizontalDistance = Math.abs(opponent.position.x - aiFighter.position.x);
    const verticalDistance = opponent.position.y - aiFighter.position.y;
    
    // If opponent is within horizontal range but significantly above, they likely jumped over
    return horizontalDistance < 80 && verticalDistance > 20;
  }

  /**
   * Calculate if AI needs to turn based on opponent position
   * @param {Object} aiFighter - AI fighter
   * @param {Object} opponent - Opponent fighter
   * @returns {boolean} True if AI needs to turn
   */
  calculateTurnNeeded(aiFighter, opponent) {
    const dx = opponent.position.x - aiFighter.position.x;
    
    // Basic direction check
    const basicTurnNeeded = (aiFighter.direction > 0 && dx < 0) || (aiFighter.direction < 0 && dx > 0);
    
    // Enhanced check for jumping scenarios
    if (this.isJumping(opponent)) {
      const horizontalDistance = Math.abs(dx);
      const verticalDistance = Math.abs(opponent.position.y - aiFighter.position.y);
      
      // If opponent is jumping and close horizontally, consider turning
      if (horizontalDistance < 60 && verticalDistance > 15) {
        return true;
      }
    }
    
    return basicTurnNeeded;
  }

  /**
   * Check if fighter is in a jumping state
   * @param {Object} fighter - Fighter to check
   * @returns {boolean} True if jumping
   */
  isJumping(fighter) {
    const jumpingStates = [
      FighterState.JUMP_START,
      FighterState.JUMP_UP,
      FighterState.JUMP_FORWARDS,
      FighterState.JUMP_BACKWARDS
    ];
    return jumpingStates.includes(fighter.CurrentState);
  }

  /**
   * Categorize distance for AI decision making
   * @param {number} distance - Distance in pixels
   * @returns {string} Distance category
   */
  categorizeDistance(distance) {
    if (distance < 40) return 'very_close';
    if (distance < 70) return 'close';
    if (distance < 120) return 'medium';
    if (distance < 200) return 'far';
    return 'very_far';
  }

  /**
   * Get fighter health from game state
   * @param {Object} fighter - Fighter object
   * @returns {number} Health points
   */
  getFighterHealth(fighter) {
    // Try to get health from gameState if available
    if (gameState && gameState.fighters) {
      const fighterState = gameState.fighters.find(f => f.id === fighter.id);
      if (fighterState) {
        return fighterState.hitPoints;
      }
    }
    
    // Fallback to a reasonable estimate based on fighter ID
    // This could be enhanced to track health more accurately
    return 144; // Max health as fallback
  }

  /**
   * Check if fighter is in attacking state
   * @param {Object} fighter - Fighter to check
   * @returns {boolean} True if attacking
   */
  isAttacking(fighter) {
    return this.attackingStates.includes(fighter.CurrentState);
  }

  /**
   * Check if fighter is in vulnerable state
   * @param {Object} fighter - Fighter to check
   * @returns {boolean} True if vulnerable
   */
  isVulnerable(fighter) {
    return this.vulnerableStates.includes(fighter.CurrentState);
  }

  /**
   * Check if fighter is in defensive state
   * @param {Object} fighter - Fighter to check
   * @returns {boolean} True if defensive
   */
  isDefensive(fighter) {
    return this.defensiveStates.includes(fighter.CurrentState);
  }

  /**
   * Check if fighter can perform specific action type
   * @param {Object} fighter - Fighter to check
   * @param {string} actionType - Type of action (attack, move, jump, crouch)
   * @returns {boolean} True if action is possible
   */
  canPerformAction(fighter, actionType) {
    const currentState = fighter.CurrentState;
    
    // Can't act if in hurt state or during attack animations
    if (this.vulnerableStates.includes(currentState) || this.isAttacking(fighter)) {
      return false;
    }

    switch (actionType) {
      case 'attack':
        return [FighterState.IDLE, FighterState.WALK_FORWARDS, FighterState.WALK_BACKWARDS, FighterState.CROUCH].includes(currentState);
      
      case 'move':
        return [FighterState.IDLE, FighterState.WALK_FORWARDS, FighterState.WALK_BACKWARDS].includes(currentState);
      
      case 'jump':
        return [FighterState.IDLE, FighterState.WALK_FORWARDS, FighterState.WALK_BACKWARDS].includes(currentState);
      
      case 'crouch':
        return [FighterState.IDLE, FighterState.WALK_FORWARDS, FighterState.WALK_BACKWARDS].includes(currentState);
      
      default:
        return true;
    }
  }

  /**
   * Determine if AI fighter has tactical advantage
   * @param {Object} aiFighter - AI fighter
   * @param {Object} opponent - Opponent fighter
   * @returns {boolean} True if AI has advantage
   */
  hasAdvantage(aiFighter, opponent) {
    const aiHealth = this.getFighterHealth(aiFighter);
    const opponentHealth = this.getFighterHealth(opponent);
    
    // Health advantage
    if (aiHealth > opponentHealth + 20) return true;
    
    // Positional advantage (opponent vulnerable)
    if (this.isVulnerable(opponent) && !this.isVulnerable(aiFighter)) return true;
    
    // State advantage
    if (this.isAttacking(aiFighter) && !this.isAttacking(opponent)) return true;
    
    return false;
  }

  /**
   * Calculate threat level from opponent
   * @param {Object} aiFighter - AI fighter
   * @param {Object} opponent - Opponent fighter  
   * @param {number} distance - Distance between fighters
   * @returns {string} Threat level (low, medium, high, critical)
   */
  calculateThreatLevel(aiFighter, opponent, distance) {
    let threatScore = 0;
    
    // Distance threat
    if (distance < 50) threatScore += 3;
    else if (distance < 100) threatScore += 1;
    
    // Opponent state threat
    if (this.isAttacking(opponent)) threatScore += 4;
    if (this.isVulnerable(aiFighter)) threatScore += 3;
    
    // Health-based threat
    const aiHealth = this.getFighterHealth(aiFighter);
    if (aiHealth < 50) threatScore += 2;
    if (aiHealth < 25) threatScore += 3;
    
    // Opponent health advantage
    const opponentHealth = this.getFighterHealth(opponent);
    if (opponentHealth > aiHealth + 30) threatScore += 2;
    
    if (threatScore >= 8) return 'critical';
    if (threatScore >= 5) return 'high';
    if (threatScore >= 2) return 'medium';
    return 'low';
  }

  /**
   * Get recommended fighting range based on character and situation
   * @param {Object} aiFighter - AI fighter
   * @param {Object} opponent - Opponent fighter
   * @returns {string} Recommended range
   */
  getRecommendedRange(aiFighter, opponent) {
    const aiHealth = this.getFighterHealth(aiFighter);
    const opponentHealth = this.getFighterHealth(opponent);
    
    // Low health - prefer medium range
    if (aiHealth < 50) return 'medium';
    
    // Health advantage - can be aggressive
    if (aiHealth > opponentHealth + 30) return 'close';
    
    // Opponent attacking - back off
    if (this.isAttacking(opponent)) return 'far';
    
    // Default to close range for pressure
    return 'close';
  }

  /**
   * Get recent damage taken (simplified)
   * @param {Object} fighter - Fighter to check
   * @returns {number} Estimated recent damage
   */
  getRecentDamage(fighter) {
    // This could be enhanced to track actual damage over time
    if (this.vulnerableStates.includes(fighter.CurrentState)) {
      return 15; // Estimate based on hurt state
    }
    return 0;
  }

  /**
   * Calculate momentum (simplified)
   * @param {Object} aiFighter - AI fighter
   * @param {Object} opponent - Opponent fighter
   * @returns {string} Momentum direction
   */
  calculateMomentum(aiFighter, opponent) {
    const aiHealth = this.getFighterHealth(aiFighter);
    const opponentHealth = this.getFighterHealth(opponent);
    
    if (this.isVulnerable(opponent) && !this.isVulnerable(aiFighter)) {
      return 'positive';
    }
    
    if (this.isVulnerable(aiFighter) && !this.isVulnerable(opponent)) {
      return 'negative';
    }
    
    if (aiHealth > opponentHealth + 20) return 'positive';
    if (opponentHealth > aiHealth + 20) return 'negative';
    
    return 'neutral';
  }
}