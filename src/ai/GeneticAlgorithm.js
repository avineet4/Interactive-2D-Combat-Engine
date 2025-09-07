/**
 * Genetic Algorithm implementation for fighter AI
 * Manages population evolution and breeding
 */
export class GeneticAlgorithm {
  constructor(populationSize = 50, mutationRate = 0.1, crossoverRate = 0.8) {
    this.populationSize = populationSize;
    this.mutationRate = mutationRate;
    this.crossoverRate = crossoverRate;
    this.population = [];
    this.generation = 0;
    this.bestFitness = 0;
    this.averageFitness = 0;
    
    this.initializePopulation();
  }

  /**
   * Initialize random population of AI brains
   */
  initializePopulation() {
    this.population = [];
    for (let i = 0; i < this.populationSize; i++) {
      this.population.push(new AIBrain());
    }
  }

  /**
   * Evaluate fitness of entire population
   * @param {Array} fitnessScores - Array of fitness scores for each individual
   */
  evaluatePopulation(fitnessScores) {
    this.population.forEach((individual, index) => {
      individual.fitness = fitnessScores[index] || 0;
    });

    // Sort population by fitness (descending)
    this.population.sort((a, b) => b.fitness - a.fitness);
    
    this.bestFitness = this.population[0].fitness;
    this.averageFitness = this.population.reduce((sum, ind) => sum + ind.fitness, 0) / this.populationSize;
    
    console.log(`Generation ${this.generation}: Best fitness = ${this.bestFitness.toFixed(2)}, Average = ${this.averageFitness.toFixed(2)}`);
  }

  /**
   * Create next generation through selection, crossover, and mutation
   */
  evolve() {
    const newPopulation = [];
    
    // Keep top 10% (elitism)
    const eliteCount = Math.floor(this.populationSize * 0.1);
    for (let i = 0; i < eliteCount; i++) {
      newPopulation.push(this.population[i].clone());
    }

    // Fill rest through crossover and mutation
    while (newPopulation.length < this.populationSize) {
      const parent1 = this.tournamentSelection();
      const parent2 = this.tournamentSelection();
      
      let offspring1, offspring2;
      
      if (Math.random() < this.crossoverRate) {
        [offspring1, offspring2] = this.crossover(parent1, parent2);
      } else {
        offspring1 = parent1.clone();
        offspring2 = parent2.clone();
      }
      
      // Apply mutation
      if (Math.random() < this.mutationRate) {
        offspring1.mutate();
      }
      if (Math.random() < this.mutationRate) {
        offspring2.mutate();
      }
      
      newPopulation.push(offspring1);
      if (newPopulation.length < this.populationSize) {
        newPopulation.push(offspring2);
      }
    }
    
    this.population = newPopulation;
    this.generation++;
  }

  /**
   * Tournament selection for parent selection
   */
  tournamentSelection(tournamentSize = 3) {
    let best = null;
    for (let i = 0; i < tournamentSize; i++) {
      const candidate = this.population[Math.floor(Math.random() * this.populationSize)];
      if (!best || candidate.fitness > best.fitness) {
        best = candidate;
      }
    }
    return best;
  }

  /**
   * Crossover two parents to create offspring
   */
  crossover(parent1, parent2) {
    const offspring1 = parent1.clone();
    const offspring2 = parent2.clone();
    
    // Single-point crossover for decision weights
    const crossoverPoint = Math.floor(Math.random() * offspring1.decisionWeights.length);
    
    for (let i = crossoverPoint; i < offspring1.decisionWeights.length; i++) {
      const temp = offspring1.decisionWeights[i];
      offspring1.decisionWeights[i] = offspring2.decisionWeights[i];
      offspring2.decisionWeights[i] = temp;
    }
    
    return [offspring1, offspring2];
  }

  /**
   * Get the best performing individual
   */
  getBestIndividual() {
    return this.population[0];
  }

  /**
   * Get random individual for testing
   */
  getRandomIndividual() {
    return this.population[Math.floor(Math.random() * this.populationSize)];
  }

  /**
   * Get population statistics
   */
  getStats() {
    return {
      generation: this.generation,
      bestFitness: this.bestFitness,
      averageFitness: this.averageFitness,
      populationSize: this.populationSize
    };
  }
}
