import { Fighter } from "../entities/fighter/fighter.js";
import { FighterState, FighterDirection } from "../constants/fighter.js";
import { AIBrain } from "./AIBrain.js";

/**
 * AI-controlled fighter that extends the base Fighter class
 * Uses AI brain to make decisions instead of player input
 */
export class AIFighter extends Fighter {
  constructor(x, y, direction, playerId, onAttackHit, aiBrain = null) {
    super(x, y, direction, playerId, onAttackHit);
    
    // Initialize AI brain
    this.aiBrain = aiBrain || new AIBrain();
    
    // AI-specific properties
    this.lastDecision = null;
    this.decisionCooldown = 0;
    this.decisionInterval = 100; // Make decision every 100ms
    this.lastDecisionTime = 0;
    
    // Performance tracking
    this.damageDealt = 0;
    this.damageTaken = 0;
    this.battleStartTime = 0;
    this.lastHealth = 100;
    
    // Disable human controls
    this.controlsEnabled = false;
  }

  /**
   * Override update method to include AI decision making
   */
  update(time, context, camera) {
    // Track damage taken
    const currentHealth = this.getCurrentHealth();
    if (currentHealth < this.lastHealth) {
      this.damageTaken += (this.lastHealth - currentHealth);
      this.lastHealth = currentHealth;
    }
    
    // Make AI decision if cooldown is over
    if (time.previous - this.lastDecisionTime > this.decisionInterval) {
      this.makeAIDecision(time);
      this.lastDecisionTime = time.previous;
    }
    
    // Call parent update method
    super.update(time, context, camera);
  }

  /**
   * Make AI decision based on current game state
   */
  makeAIDecision(time) {
    if (!this.opponent) return;
    
    const gameState = this.analyzeGameState();
    const decision = this.aiBrain.makeDecision(gameState);
    
    this.lastDecision = decision;
    this.executeDecision(decision);
  }

  /**
   * Analyze current game state for AI decision making
   */
  analyzeGameState() {
    const distance = Math.abs(this.position.x - this.opponent.position.x);
    const myHealth = this.getCurrentHealth();
    const opponentHealth = this.opponent.getCurrentHealth();
    
    // Determine if opponent is attacking
    const opponentAttacking = this.isOpponentAttacking();
    const opponentVulnerable = this.isOpponentVulnerable();
    
    return {
      myPosition: this.position,
      opponentPosition: this.opponent.position,
      myHealth: myHealth,
      opponentHealth: opponentHealth,
      myState: this.CurrentState,
      opponentState: this.opponent.CurrentState,
      distance: distance,
      opponentAttacking: opponentAttacking,
      opponentVulnerable: opponentVulnerable,
      timeRemaining: this.getTimeRemaining(),
      myDirection: this.direction,
      opponentDirection: this.opponent.direction
    };
  }

  /**
   * Execute AI decision by changing fighter state
   */
  executeDecision(decision) {
    const { action, confidence } = decision;
    
    // Only execute if confidence is above threshold
    if (confidence < -0.5) return;
    
    // Map AI actions to fighter states
    switch (action) {
      case 'moveForward':
        if (this.canMoveForward()) {
          this.changeState(FighterState.WALK_FORWARDS);
        }
        break;
        
      case 'moveBackward':
        if (this.canMoveBackward()) {
          this.changeState(FighterState.WALK_BACKWARDS);
        }
        break;
        
      case 'jump':
        if (this.canJump()) {
          this.changeState(FighterState.JUMP_START);
        }
        break;
        
      case 'crouch':
        if (this.canCrouch()) {
          this.changeState(FighterState.CROUCH_DOWN);
        }
        break;
        
      case 'lightPunch':
        if (this.canAttack()) {
          this.changeState(FighterState.LIGHT_PUNCH);
        }
        break;
        
      case 'mediumPunch':
        if (this.canAttack()) {
          this.changeState(FighterState.MEDIUM_PUNCH);
        }
        break;
        
      case 'heavyPunch':
        if (this.canAttack()) {
          this.changeState(FighterState.HEAVY_PUNCH);
        }
        break;
        
      case 'lightKick':
        if (this.canAttack()) {
          this.changeState(FighterState.LIGHT_KICK);
        }
        break;
        
      case 'mediumKick':
        if (this.canAttack()) {
          this.changeState(FighterState.MEDIUM_KICK);
        }
        break;
        
      case 'heavyKick':
        if (this.canAttack()) {
          this.changeState(FighterState.HEAVY_KICK);
        }
        break;
        
      case 'block':
        // Implement blocking behavior
        this.handleBlocking();
        break;
        
      case 'dodge':
        // Implement dodging behavior
        this.handleDodging();
        break;
        
      case 'idle':
      default:
        // Stay in current state or go to idle
        if (this.CurrentState === FighterState.WALK_FORWARDS || 
            this.CurrentState === FighterState.WALK_BACKWARDS) {
          this.changeState(FighterState.IDLE);
        }
        break;
    }
  }

  /**
   * Check if fighter can move forward
   */
  canMoveForward() {
    return [FighterState.IDLE, FighterState.WALK_BACKWARDS].includes(this.CurrentState);
  }

  /**
   * Check if fighter can move backward
   */
  canMoveBackward() {
    return [FighterState.IDLE, FighterState.WALK_FORWARDS].includes(this.CurrentState);
  }

  /**
   * Check if fighter can jump
   */
  canJump() {
    return [FighterState.IDLE, FighterState.WALK_FORWARDS, FighterState.WALK_BACKWARDS].includes(this.CurrentState);
  }

  /**
   * Check if fighter can crouch
   */
  canCrouch() {
    return [FighterState.IDLE, FighterState.WALK_FORWARDS, FighterState.WALK_BACKWARDS].includes(this.CurrentState);
  }

  /**
   * Check if fighter can attack
   */
  canAttack() {
    return [FighterState.IDLE, FighterState.WALK_FORWARDS, FighterState.WALK_BACKWARDS].includes(this.CurrentState);
  }

  /**
   * Check if opponent is currently attacking
   */
  isOpponentAttacking() {
    const attackStates = [
      FighterState.LIGHT_PUNCH,
      FighterState.MEDIUM_PUNCH,
      FighterState.HEAVY_PUNCH,
      FighterState.LIGHT_KICK,
      FighterState.MEDIUM_KICK,
      FighterState.HEAVY_KICK
    ];
    return attackStates.includes(this.opponent.CurrentState);
  }

  /**
   * Check if opponent is vulnerable (in recovery frames)
   */
  isOpponentVulnerable() {
    const vulnerableStates = [
      FighterState.IDLE,
      FighterState.WALK_FORWARDS,
      FighterState.WALK_BACKWARDS,
      FighterState.CROUCH,
      FighterState.CROUCH_DOWN
    ];
    return vulnerableStates.includes(this.opponent.CurrentState);
  }

  /**
   * Handle blocking behavior
   */
  handleBlocking() {
    // For now, just move backward when blocking
    if (this.canMoveBackward()) {
      this.changeState(FighterState.WALK_BACKWARDS);
    }
  }

  /**
   * Handle dodging behavior
   */
  handleDodging() {
    // For now, just jump when dodging
    if (this.canJump()) {
      this.changeState(FighterState.JUMP_START);
    }
  }

  /**
   * Get current health percentage
   */
  getCurrentHealth() {
    // This would need to be connected to the game state
    // For now, return a placeholder
    return 100; // This should be replaced with actual health from gameState
  }

  /**
   * Get time remaining in battle
   */
  getTimeRemaining() {
    // This would need to be connected to the battle timer
    // For now, return a placeholder
    return 99; // This should be replaced with actual time remaining
  }

  /**
   * Override attack hit handler to track damage dealt
   */
  handleAttackHit(attackStrength, hitLocation) {
    // Track damage dealt
    const damage = this.getAttackDamage(attackStrength);
    this.damageDealt += damage;
    
    // Call parent method
    super.handleAttackHit(attackStrength, hitLocation);
  }

  /**
   * Get damage value for attack strength
   */
  getAttackDamage(attackStrength) {
    const damageMap = {
      'light': 12,
      'medium': 20,
      'heavy': 28
    };
    return damageMap[attackStrength] || 0;
  }

  /**
   * Update AI fitness after battle
   */
  updateFitness(won, battleDuration) {
    this.aiBrain.updateFitness(
      this.damageDealt,
      this.damageTaken,
      won,
      battleDuration
    );
  }

  /**
   * Reset AI fighter for new battle
   */
  resetForNewBattle() {
    this.damageDealt = 0;
    this.damageTaken = 0;
    this.battleStartTime = 0;
    this.lastHealth = 100;
    this.lastDecision = null;
    this.lastDecisionTime = 0;
  }

  /**
   * Get AI brain for genetic algorithm operations
   */
  getBrain() {
    return this.aiBrain;
  }

  /**
   * Set AI brain (for genetic algorithm breeding)
   */
  setBrain(brain) {
    this.aiBrain = brain;
  }

  /**
   * Get AI performance statistics
   */
  getAIStats() {
    return {
      ...this.aiBrain.getStats(),
      currentDamageDealt: this.damageDealt,
      currentDamageTaken: this.damageTaken,
      lastDecision: this.lastDecision
    };
  }
}
