/**
 * Fitness Function for evaluating AI performance
 * Calculates fitness scores based on various battle metrics
 */
export class FitnessFunction {
  constructor() {
    // Weight factors for different performance metrics
    this.weights = {
      damageDealt: 10,        // Reward for dealing damage
      damageTaken: -5,        // Penalty for taking damage
      victory: 100,           // Big reward for winning
      survivalTime: 0.1,      // Small reward for surviving longer
      attackAccuracy: 5,      // Reward for hitting attacks
      defenseEffectiveness: 3, // Reward for avoiding damage
      aggression: 2,          // Reward for being aggressive
      efficiency: 1           // Reward for efficient play
    };
  }

  /**
   * Calculate fitness score for an AI fighter
   * @param {Object} battleData - Data from a single battle
   * @returns {number} Fitness score
   */
  calculateFitness(battleData) {
    const {
      damageDealt,
      damageTaken,
      won,
      survivalTime,
      totalAttacks,
      hitsLanded,
      blocksPerformed,
      dodgesPerformed,
      opponentAttacks,
      opponentHits
    } = battleData;

    let fitness = 0;

    // Basic damage metrics
    fitness += damageDealt * this.weights.damageDealt;
    fitness += damageTaken * this.weights.damageTaken;

    // Victory bonus
    if (won) {
      fitness += this.weights.victory;
    }

    // Survival time bonus
    fitness += survivalTime * this.weights.survivalTime;

    // Attack accuracy
    const attackAccuracy = totalAttacks > 0 ? (hitsLanded / totalAttacks) : 0;
    fitness += attackAccuracy * this.weights.attackAccuracy;

    // Defense effectiveness
    const defenseEffectiveness = opponentAttacks > 0 ? 
      (1 - (opponentHits / opponentAttacks)) : 1;
    fitness += defenseEffectiveness * this.weights.defenseEffectiveness;

    // Aggression factor (encourages active play)
    const aggression = totalAttacks / Math.max(survivalTime / 1000, 1); // Attacks per second
    fitness += Math.min(aggression, 2) * this.weights.aggression; // Cap at 2 attacks per second

    // Efficiency (damage dealt per attack)
    const efficiency = totalAttacks > 0 ? (damageDealt / totalAttacks) : 0;
    fitness += efficiency * this.weights.efficiency;

    // Bonus for defensive actions
    fitness += blocksPerformed * 0.5;
    fitness += dodgesPerformed * 0.3;

    return Math.max(0, fitness); // Ensure non-negative fitness
  }

  /**
   * Calculate fitness for multiple battles
   * @param {Array} battleResults - Array of battle data
   * @returns {number} Average fitness score
   */
  calculateAverageFitness(battleResults) {
    if (battleResults.length === 0) return 0;

    const totalFitness = battleResults.reduce((sum, battle) => {
      return sum + this.calculateFitness(battle);
    }, 0);

    return totalFitness / battleResults.length;
  }

  /**
   * Calculate detailed fitness breakdown
   * @param {Object} battleData - Data from a single battle
   * @returns {Object} Detailed fitness breakdown
   */
  getFitnessBreakdown(battleData) {
    const {
      damageDealt,
      damageTaken,
      won,
      survivalTime,
      totalAttacks,
      hitsLanded,
      blocksPerformed,
      dodgesPerformed,
      opponentAttacks,
      opponentHits
    } = battleData;

    const breakdown = {
      damageDealtScore: damageDealt * this.weights.damageDealt,
      damageTakenScore: damageTaken * this.weights.damageTaken,
      victoryScore: won ? this.weights.victory : 0,
      survivalScore: survivalTime * this.weights.survivalTime,
      attackAccuracyScore: 0,
      defenseScore: 0,
      aggressionScore: 0,
      efficiencyScore: 0,
      totalFitness: 0
    };

    // Attack accuracy
    const attackAccuracy = totalAttacks > 0 ? (hitsLanded / totalAttacks) : 0;
    breakdown.attackAccuracyScore = attackAccuracy * this.weights.attackAccuracy;

    // Defense effectiveness
    const defenseEffectiveness = opponentAttacks > 0 ? 
      (1 - (opponentHits / opponentAttacks)) : 1;
    breakdown.defenseScore = defenseEffectiveness * this.weights.defenseEffectiveness;

    // Aggression factor
    const aggression = totalAttacks / Math.max(survivalTime / 1000, 1);
    breakdown.aggressionScore = Math.min(aggression, 2) * this.weights.aggression;

    // Efficiency
    const efficiency = totalAttacks > 0 ? (damageDealt / totalAttacks) : 0;
    breakdown.efficiencyScore = efficiency * this.weights.efficiency;

    // Calculate total
    breakdown.totalFitness = Object.values(breakdown).reduce((sum, value) => {
      return typeof value === 'number' ? sum + value : sum;
    }, 0);

    return breakdown;
  }

  /**
   * Normalize fitness score to 0-100 range
   * @param {number} fitness - Raw fitness score
   * @param {number} maxPossibleFitness - Maximum possible fitness
   * @returns {number} Normalized fitness (0-100)
   */
  normalizeFitness(fitness, maxPossibleFitness = 500) {
    return Math.min(100, (fitness / maxPossibleFitness) * 100);
  }

  /**
   * Compare two AI fighters
   * @param {Object} ai1Data - First AI's battle data
   * @param {Object} ai2Data - Second AI's battle data
   * @returns {Object} Comparison results
   */
  compareAIs(ai1Data, ai2Data) {
    const fitness1 = this.calculateFitness(ai1Data);
    const fitness2 = this.calculateFitness(ai2Data);

    return {
      ai1Fitness: fitness1,
      ai2Fitness: fitness2,
      winner: fitness1 > fitness2 ? 1 : fitness2 > fitness1 ? 2 : 0,
      difference: Math.abs(fitness1 - fitness2),
      breakdown1: this.getFitnessBreakdown(ai1Data),
      breakdown2: this.getFitnessBreakdown(ai2Data)
    };
  }

  /**
   * Update weights for different training phases
   * @param {string} phase - Training phase ('early', 'mid', 'late')
   */
  updateWeightsForPhase(phase) {
    switch (phase) {
      case 'early':
        // Focus on basic survival and damage dealing
        this.weights = {
          damageDealt: 15,
          damageTaken: -3,
          victory: 50,
          survivalTime: 0.2,
          attackAccuracy: 3,
          defenseEffectiveness: 2,
          aggression: 1,
          efficiency: 0.5
        };
        break;
        
      case 'mid':
        // Balance offense and defense
        this.weights = {
          damageDealt: 10,
          damageTaken: -5,
          victory: 100,
          survivalTime: 0.1,
          attackAccuracy: 5,
          defenseEffectiveness: 3,
          aggression: 2,
          efficiency: 1
        };
        break;
        
      case 'late':
        // Focus on efficiency and advanced tactics
        this.weights = {
          damageDealt: 8,
          damageTaken: -7,
          victory: 150,
          survivalTime: 0.05,
          attackAccuracy: 8,
          defenseEffectiveness: 5,
          aggression: 1.5,
          efficiency: 2
        };
        break;
    }
  }

  /**
   * Get recommended training focus based on current performance
   * @param {Object} battleData - Recent battle data
   * @returns {string} Recommended focus area
   */
  getTrainingFocus(battleData) {
    const breakdown = this.getFitnessBreakdown(battleData);
    
    if (breakdown.attackAccuracyScore < 10) {
      return 'accuracy';
    } else if (breakdown.defenseScore < 15) {
      return 'defense';
    } else if (breakdown.aggressionScore < 5) {
      return 'aggression';
    } else if (breakdown.efficiencyScore < 10) {
      return 'efficiency';
    } else {
      return 'balanced';
    }
  }
}
