import { GeneticAlgorithm } from "./GeneticAlgorithm.js";
import { AIFighter } from "./AIFighter.js";
import { Ken } from "../entities/fighter/ken.js";
import { Ryu } from "../entities/fighter/ryu.js";
import { FighterId, FighterState } from "../constants/fighter.js";
import { KenStage } from "../entities/stages/ken-stage.js";

/**
 * AI Training System for genetic algorithm evolution
 * Manages AI vs AI battles and population training
 */
export class AITrainingSystem {
  constructor() {
    this.geneticAlgorithm = new GeneticAlgorithm(50, 0.1, 0.8);
    this.isTraining = false;
    this.currentGeneration = 0;
    this.battlesPerGeneration = 25; // Each AI fights 25 battles per generation
    this.battleResults = [];
    this.trainingStats = {
      totalGenerations: 0,
      bestFitness: 0,
      averageFitness: 0,
      trainingTime: 0
    };
    
    // Battle simulation properties
    this.battleDuration = 30000; // 30 seconds per battle
    this.battleStartTime = 0;
    this.currentBattle = null;
    this.battleIndex = 0;
  }

  /**
   * Start training process
   */
  startTraining() {
    console.log("Starting AI training...");
    this.isTraining = true;
    this.currentGeneration = 0;
    this.battleResults = [];
    this.trainingStats.trainingTime = performance.now();
    
    this.runGeneration();
  }

  /**
   * Stop training process
   */
  stopTraining() {
    this.isTraining = false;
    console.log("Training stopped");
  }

  /**
   * Run a complete generation of battles
   */
  async runGeneration() {
    if (!this.isTraining) return;
    
    console.log(`Running generation ${this.currentGeneration + 1}`);
    
    const population = this.geneticAlgorithm.population;
    const fitnessScores = new Array(population.length).fill(0);
    
    // Run battles for each individual
    for (let i = 0; i < population.length; i++) {
      const individual = population[i];
      let totalFitness = 0;
      
      // Each individual fights multiple battles
      for (let battle = 0; battle < this.battlesPerGeneration; battle++) {
        const opponent = this.selectOpponent(population, i);
        const battleResult = await this.runBattle(individual, opponent);
        totalFitness += battleResult.fitness;
      }
      
      fitnessScores[i] = totalFitness / this.battlesPerGeneration;
    }
    
    // Evaluate population and evolve
    this.geneticAlgorithm.evaluatePopulation(fitnessScores);
    this.geneticAlgorithm.evolve();
    
    this.currentGeneration++;
    this.updateTrainingStats();
    
    // Continue to next generation or stop
    if (this.currentGeneration < 100) { // Train for 100 generations
      setTimeout(() => this.runGeneration(), 100); // Small delay between generations
    } else {
      this.finishTraining();
    }
  }

  /**
   * Select opponent for battle
   */
  selectOpponent(population, currentIndex) {
    // Select random opponent (not self)
    let opponentIndex;
    do {
      opponentIndex = Math.floor(Math.random() * population.length);
    } while (opponentIndex === currentIndex);
    
    return population[opponentIndex];
  }

  /**
   * Run a single battle between two AI fighters
   */
  async runBattle(ai1, ai2) {
    return new Promise((resolve) => {
      // Create AI fighters
      const fighter1 = new AIFighter(580, 220, 1, 0, this.handleAttackHit.bind(this), ai1);
      const fighter2 = new AIFighter(720, 220, -1, 1, this.handleAttackHit.bind(this), ai2);
      
      // Set opponents
      fighter1.opponent = fighter2;
      fighter2.opponent = fighter1;
      
      // Create battle simulation
      const battle = new AIBattleSimulation(fighter1, fighter2, this.battleDuration);
      
      battle.onComplete((result) => {
        // Update fitness for both fighters
        fighter1.updateFitness(result.fighter1Won, result.duration);
        fighter2.updateFitness(result.fighter2Won, result.duration);
        
        resolve({
          fitness: result.fighter1Won ? 100 : 0,
          duration: result.duration,
          winner: result.fighter1Won ? 0 : 1
        });
      });
      
      battle.start();
    });
  }

  /**
   * Handle attack hit during battle simulation
   */
  handleAttackHit(playerId, opponentId, position, strength) {
    // This would be called during battle simulation
    // For now, just log the hit
    console.log(`Player ${playerId} hit Player ${opponentId} with ${strength} attack`);
  }

  /**
   * Update training statistics
   */
  updateTrainingStats() {
    const stats = this.geneticAlgorithm.getStats();
    this.trainingStats.totalGenerations = stats.generation;
    this.trainingStats.bestFitness = stats.bestFitness;
    this.trainingStats.averageFitness = stats.averageFitness;
  }

  /**
   * Finish training and save results
   */
  finishTraining() {
    this.isTraining = false;
    this.trainingStats.trainingTime = performance.now() - this.trainingStats.trainingTime;
    
    console.log("Training completed!");
    console.log(`Total generations: ${this.trainingStats.totalGenerations}`);
    console.log(`Best fitness: ${this.trainingStats.bestFitness}`);
    console.log(`Average fitness: ${this.trainingStats.averageFitness}`);
    console.log(`Training time: ${this.trainingStats.trainingTime}ms`);
    
    // Save best AI brain
    const bestAI = this.geneticAlgorithm.getBestIndividual();
    this.saveBestAI(bestAI);
  }

  /**
   * Save the best AI brain to localStorage
   */
  saveBestAI(aiBrain) {
    try {
      const aiData = {
        decisionWeights: aiBrain.decisionWeights,
        fitness: aiBrain.fitness,
        stats: aiBrain.getStats(),
        timestamp: Date.now()
      };
      
      localStorage.setItem('bestAI', JSON.stringify(aiData));
      console.log("Best AI saved to localStorage");
    } catch (error) {
      console.error("Failed to save AI:", error);
    }
  }

  /**
   * Load the best AI brain from localStorage
   */
  loadBestAI() {
    try {
      const aiData = localStorage.getItem('bestAI');
      if (aiData) {
        const parsed = JSON.parse(aiData);
        const aiBrain = new AIBrain();
        aiBrain.decisionWeights = parsed.decisionWeights;
        aiBrain.fitness = parsed.fitness;
        return aiBrain;
      }
    } catch (error) {
      console.error("Failed to load AI:", error);
    }
    return null;
  }

  /**
   * Get current training progress
   */
  getTrainingProgress() {
    return {
      isTraining: this.isTraining,
      currentGeneration: this.currentGeneration,
      totalGenerations: 100,
      progress: (this.currentGeneration / 100) * 100,
      stats: this.trainingStats
    };
  }

  /**
   * Get best AI for testing
   */
  getBestAI() {
    return this.geneticAlgorithm.getBestIndividual();
  }

  /**
   * Get random AI for testing
   */
  getRandomAI() {
    return this.geneticAlgorithm.getRandomIndividual();
  }
}

/**
 * AI Battle Simulation for training
 * Simulates battles between AI fighters
 */
class AIBattleSimulation {
  constructor(fighter1, fighter2, duration) {
    this.fighter1 = fighter1;
    this.fighter2 = fighter2;
    this.duration = duration;
    this.startTime = 0;
    this.isRunning = false;
    this.onCompleteCallback = null;
    
    // Battle state
    this.fighter1Health = 100;
    this.fighter2Health = 100;
    this.battleEnded = false;
  }

  /**
   * Start the battle simulation
   */
  start() {
    this.startTime = performance.now();
    this.isRunning = true;
    this.battleEnded = false;
    
    // Start battle loop
    this.battleLoop();
  }

  /**
   * Main battle loop
   */
  battleLoop() {
    if (!this.isRunning || this.battleEnded) {
      this.endBattle();
      return;
    }
    
    const currentTime = performance.now();
    const elapsed = currentTime - this.startTime;
    
    // Check if battle time is up
    if (elapsed >= this.duration) {
      this.battleEnded = true;
      this.endBattle();
      return;
    }
    
    // Check if one fighter is KO'd
    if (this.fighter1Health <= 0 || this.fighter2Health <= 0) {
      this.battleEnded = true;
      this.endBattle();
      return;
    }
    
    // Continue battle
    setTimeout(() => this.battleLoop(), 16); // ~60 FPS
  }

  /**
   * End the battle and determine winner
   */
  endBattle() {
    this.isRunning = false;
    
    const duration = performance.now() - this.startTime;
    const fighter1Won = this.fighter1Health > this.fighter2Health;
    const fighter2Won = this.fighter2Health > this.fighter1Health;
    
    const result = {
      fighter1Won,
      fighter2Won,
      duration,
      fighter1Health: this.fighter1Health,
      fighter2Health: this.fighter2Health
    };
    
    if (this.onCompleteCallback) {
      this.onCompleteCallback(result);
    }
  }

  /**
   * Set callback for when battle completes
   */
  onComplete(callback) {
    this.onCompleteCallback = callback;
  }
}
