/**
 * AI Brain - Neural network-like decision making system
 * Makes decisions based on game state inputs
 */
export class AIBrain {
  constructor() {
    // Decision weights for different actions
    // Each weight represents how likely the AI is to choose that action
    this.decisionWeights = {
      // Movement decisions
      moveForward: this.randomWeight(),
      moveBackward: this.randomWeight(),
      jump: this.randomWeight(),
      crouch: this.randomWeight(),
      
      // Attack decisions
      lightPunch: this.randomWeight(),
      mediumPunch: this.randomWeight(),
      heavyPunch: this.randomWeight(),
      lightKick: this.randomWeight(),
      mediumKick: this.randomWeight(),
      heavyKick: this.randomWeight(),
      
      // Defensive decisions
      block: this.randomWeight(),
      dodge: this.randomWeight(),
      
      // Distance-based modifiers
      closeRangeModifier: this.randomWeight(),
      mediumRangeModifier: this.randomWeight(),
      longRangeModifier: this.randomWeight(),
      
      // Health-based modifiers
      lowHealthModifier: this.randomWeight(),
      highHealthModifier: this.randomWeight(),
      
      // Opponent state modifiers
      opponentAttackingModifier: this.randomWeight(),
      opponentVulnerableModifier: this.randomWeight(),
      opponentJumpingModifier: this.randomWeight(),
      opponentCrouchingModifier: this.randomWeight(),
    };
    
    this.fitness = 0;
    this.gamesPlayed = 0;
    this.wins = 0;
    this.totalDamageDealt = 0;
    this.totalDamageTaken = 0;
  }

  /**
   * Generate random weight between -1 and 1
   */
  randomWeight() {
    return (Math.random() - 0.5) * 2;
  }

  /**
   * Make decision based on current game state
   * @param {Object} gameState - Current state of the game
   * @returns {Object} Decision object with action and confidence
   */
  makeDecision(gameState) {
    const {
      myPosition,
      opponentPosition,
      myHealth,
      opponentHealth,
      myState,
      opponentState,
      distance,
      opponentAttacking,
      opponentVulnerable,
      timeRemaining
    } = gameState;

    // Calculate base scores for each action
    const actionScores = this.calculateActionScores(gameState);
    
    // Apply modifiers based on game state
    this.applyModifiers(actionScores, gameState);
    
    // Select action with highest score
    const bestAction = this.selectBestAction(actionScores);
    
    return {
      action: bestAction.action,
      confidence: bestAction.score,
      reasoning: bestAction.reasoning
    };
  }

  /**
   * Calculate base scores for all possible actions
   */
  calculateActionScores(gameState) {
    const { distance, myHealth, opponentHealth, timeRemaining } = gameState;
    
    return {
      moveForward: this.decisionWeights.moveForward,
      moveBackward: this.decisionWeights.moveBackward,
      jump: this.decisionWeights.jump,
      crouch: this.decisionWeights.crouch,
      lightPunch: this.decisionWeights.lightPunch,
      mediumPunch: this.decisionWeights.mediumPunch,
      heavyPunch: this.decisionWeights.heavyPunch,
      lightKick: this.decisionWeights.lightKick,
      mediumKick: this.decisionWeights.mediumKick,
      heavyKick: this.decisionWeights.heavyKick,
      block: this.decisionWeights.block,
      dodge: this.decisionWeights.dodge,
      idle: 0 // Default neutral action
    };
  }

  /**
   * Apply modifiers based on current game state
   */
  applyModifiers(actionScores, gameState) {
    const { distance, myHealth, opponentHealth, opponentState, opponentAttacking, opponentVulnerable } = gameState;
    
    // Distance-based modifiers
    if (distance < 50) {
      // Close range - favor quick attacks and movement
      actionScores.lightPunch += this.decisionWeights.closeRangeModifier;
      actionScores.lightKick += this.decisionWeights.closeRangeModifier;
      actionScores.moveBackward += this.decisionWeights.closeRangeModifier * 0.5;
    } else if (distance < 100) {
      // Medium range - favor medium attacks
      actionScores.mediumPunch += this.decisionWeights.mediumRangeModifier;
      actionScores.mediumKick += this.decisionWeights.mediumRangeModifier;
      actionScores.moveForward += this.decisionWeights.mediumRangeModifier * 0.3;
    } else {
      // Long range - favor movement and heavy attacks
      actionScores.moveForward += this.decisionWeights.longRangeModifier;
      actionScores.heavyPunch += this.decisionWeights.longRangeModifier;
      actionScores.heavyKick += this.decisionWeights.longRangeModifier;
    }
    
    // Health-based modifiers
    if (myHealth < 30) {
      // Low health - be more defensive
      actionScores.block += this.decisionWeights.lowHealthModifier;
      actionScores.moveBackward += this.decisionWeights.lowHealthModifier * 0.5;
      actionScores.dodge += this.decisionWeights.lowHealthModifier;
    } else if (myHealth > 70) {
      // High health - be more aggressive
      actionScores.heavyPunch += this.decisionWeights.highHealthModifier;
      actionScores.heavyKick += this.decisionWeights.highHealthModifier;
      actionScores.moveForward += this.decisionWeights.highHealthModifier * 0.3;
    }
    
    // Opponent state modifiers
    if (opponentAttacking) {
      actionScores.block += this.decisionWeights.opponentAttackingModifier;
      actionScores.dodge += this.decisionWeights.opponentAttackingModifier * 0.7;
      actionScores.moveBackward += this.decisionWeights.opponentAttackingModifier * 0.5;
    }
    
    if (opponentVulnerable) {
      actionScores.lightPunch += this.decisionWeights.opponentVulnerableModifier;
      actionScores.mediumPunch += this.decisionWeights.opponentVulnerableModifier;
      actionScores.heavyPunch += this.decisionWeights.opponentVulnerableModifier;
    }
    
    if (opponentState === 'jump-up' || opponentState === 'jump-forwards' || opponentState === 'jump-backwards') {
      actionScores.lightKick += this.decisionWeights.opponentJumpingModifier;
      actionScores.mediumKick += this.decisionWeights.opponentJumpingModifier;
    }
    
    if (opponentState === 'crouch' || opponentState === 'crouch-down') {
      actionScores.lightKick += this.decisionWeights.opponentCrouchingModifier;
      actionScores.mediumKick += this.decisionWeights.opponentCrouchingModifier;
    }
  }

  /**
   * Select the best action based on scores
   */
  selectBestAction(actionScores) {
    let bestAction = 'idle';
    let bestScore = -Infinity;
    let reasoning = '';
    
    for (const [action, score] of Object.entries(actionScores)) {
      if (score > bestScore) {
        bestScore = score;
        bestAction = action;
      }
    }
    
    // Add some reasoning for debugging
    if (bestScore > 1) {
      reasoning = `High confidence in ${bestAction}`;
    } else if (bestScore > 0) {
      reasoning = `Moderate confidence in ${bestAction}`;
    } else {
      reasoning = `Low confidence, choosing ${bestAction}`;
    }
    
    return {
      action: bestAction,
      score: bestScore,
      reasoning: reasoning
    };
  }

  /**
   * Mutate the brain's weights
   */
  mutate() {
    for (const key in this.decisionWeights) {
      if (Math.random() < 0.1) { // 10% chance to mutate each weight
        this.decisionWeights[key] += (Math.random() - 0.5) * 0.2; // Small mutation
        this.decisionWeights[key] = Math.max(-1, Math.min(1, this.decisionWeights[key])); // Clamp to [-1, 1]
      }
    }
  }

  /**
   * Create a clone of this brain
   */
  clone() {
    const clone = new AIBrain();
    clone.decisionWeights = { ...this.decisionWeights };
    clone.fitness = this.fitness;
    return clone;
  }

  /**
   * Update fitness based on battle results
   */
  updateFitness(damageDealt, damageTaken, won, timeSurvived) {
    this.gamesPlayed++;
    if (won) this.wins++;
    
    this.totalDamageDealt += damageDealt;
    this.totalDamageTaken += damageTaken;
    
    // Calculate fitness score
    let fitness = 0;
    fitness += damageDealt * 10; // Reward for dealing damage
    fitness -= damageTaken * 5; // Penalty for taking damage
    fitness += won ? 100 : 0; // Big reward for winning
    fitness += timeSurvived * 0.1; // Small reward for surviving longer
    
    this.fitness = fitness;
  }

  /**
   * Get performance statistics
   */
  getStats() {
    return {
      fitness: this.fitness,
      gamesPlayed: this.gamesPlayed,
      winRate: this.gamesPlayed > 0 ? (this.wins / this.gamesPlayed) * 100 : 0,
      averageDamageDealt: this.gamesPlayed > 0 ? this.totalDamageDealt / this.gamesPlayed : 0,
      averageDamageTaken: this.gamesPlayed > 0 ? this.totalDamageTaken / this.gamesPlayed : 0
    };
  }
}
