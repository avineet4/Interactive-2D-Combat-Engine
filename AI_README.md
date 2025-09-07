# AI System for 2D Combat Engine

This document explains how to implement and use the AI system using genetic algorithms in your 2D combat engine.

## Overview

The AI system uses genetic algorithms to evolve fighter strategies through AI vs AI battles. The system includes:

- **Genetic Algorithm Core**: Manages population evolution and breeding
- **AI Brain**: Neural network-like decision making system
- **AI Fighter**: AI-controlled fighter that extends the base Fighter class
- **Training System**: Manages AI vs AI battles and fitness evaluation
- **Fitness Function**: Evaluates AI performance based on multiple metrics
- **Control Panel**: UI for managing AI training and testing

## Architecture

### 1. Genetic Algorithm (`GeneticAlgorithm.js`)
- Manages population of AI brains
- Implements selection, crossover, and mutation
- Tracks generation progress and statistics

### 2. AI Brain (`AIBrain.js`)
- Makes decisions based on game state
- Uses weighted decision system
- Adapts behavior based on distance, health, and opponent state

### 3. AI Fighter (`AIFighter.js`)
- Extends base Fighter class
- Overrides input handling with AI decisions
- Tracks performance metrics

### 4. Training System (`AITrainingSystem.js`)
- Manages AI vs AI battles
- Evaluates fitness and evolves population
- Saves/loads best AI brains

### 5. Fitness Function (`FitnessFunction.js`)
- Calculates fitness scores based on:
  - Damage dealt/taken
  - Victory/defeat
  - Survival time
  - Attack accuracy
  - Defense effectiveness
  - Aggression level
  - Efficiency

## Usage

### Basic Setup

```javascript
import { AIStreetFighterGame } from './ai/AIIntegrationExample.js';

const game = new AIStreetFighterGame();
game.start();
```

### Keyboard Controls

- **A**: Toggle AI Mode
- **T**: Start AI Training
- **S**: Stop AI Training
- **V**: AI vs AI Battle
- **H**: Human vs AI Battle

### Using the Control Panel

1. Click the "AI" button (top-left corner)
2. Use the control panel to:
   - Start/stop training
   - Create different battle types
   - View training statistics
   - Save/load AI brains

## AI Decision Making

The AI makes decisions based on:

### Game State Analysis
- Distance to opponent
- Current health levels
- Opponent's current state
- Time remaining in battle

### Decision Weights
The AI uses weighted decisions for:
- Movement (forward/backward/jump/crouch)
- Attacks (light/medium/heavy punches and kicks)
- Defense (blocking/dodging)

### Modifiers
Decisions are modified by:
- Distance-based modifiers
- Health-based modifiers
- Opponent state modifiers

## Training Process

### 1. Population Initialization
- Create random population of AI brains
- Each brain has random decision weights

### 2. Battle Evaluation
- Each AI fights multiple battles
- Fitness is calculated based on performance
- Best performers are selected for breeding

### 3. Evolution
- Top 10% are kept (elitism)
- Remaining population created through crossover and mutation
- Process repeats for multiple generations

### 4. Fitness Evaluation
Fitness is calculated based on:
- **Damage Dealt**: +10 points per damage point
- **Damage Taken**: -5 points per damage point
- **Victory**: +100 points
- **Survival Time**: +0.1 points per millisecond
- **Attack Accuracy**: +5 points per hit percentage
- **Defense Effectiveness**: +3 points for avoiding damage
- **Aggression**: +2 points for active play
- **Efficiency**: +1 point for damage per attack

## Customization

### Modifying Decision Weights

```javascript
// In AIBrain.js, modify the decisionWeights object
this.decisionWeights = {
  moveForward: 0.5,    // Increase for more aggressive movement
  lightPunch: 0.8,     // Increase for more light attacks
  block: -0.3,          // Decrease for less defensive play
  // ... other weights
};
```

### Adjusting Fitness Function

```javascript
// In FitnessFunction.js, modify the weights object
this.weights = {
  damageDealt: 15,     // Increase reward for damage
  damageTaken: -3,     // Decrease penalty for taking damage
  victory: 200,         // Increase victory bonus
  // ... other weights
};
```

### Training Parameters

```javascript
// In AITrainingSystem.js, modify constructor parameters
const geneticAlgorithm = new GeneticAlgorithm(
  100,    // Population size (increase for more diversity)
  0.15,   // Mutation rate (increase for more exploration)
  0.9     // Crossover rate (increase for more breeding)
);
```

## Advanced Features

### Phase-Based Training

The fitness function can be adjusted for different training phases:

```javascript
// Early phase: Focus on survival
fitnessFunction.updateWeightsForPhase('early');

// Mid phase: Balance offense and defense
fitnessFunction.updateWeightsForPhase('mid');

// Late phase: Focus on efficiency
fitnessFunction.updateWeightsForPhase('late');
```

### Saving and Loading AI

```javascript
// Save best AI
const bestAI = trainingSystem.getBestAI();
localStorage.setItem('bestAI', JSON.stringify(bestAI));

// Load AI
const savedAI = JSON.parse(localStorage.getItem('bestAI'));
const aiBrain = new AIBrain();
aiBrain.decisionWeights = savedAI.decisionWeights;
```

### Custom Battle Types

```javascript
// Create custom AI vs AI battle
const ai1 = trainingSystem.getBestAI();
const ai2 = trainingSystem.getRandomAI();
const fighter1 = new AIFighter(580, 220, 1, 0, onAttackHit, ai1);
const fighter2 = new AIFighter(720, 220, -1, 1, onAttackHit, ai2);
```

## Performance Tips

### 1. Optimize Population Size
- Start with 50 individuals
- Increase to 100+ for better results
- Balance between diversity and training time

### 2. Adjust Mutation Rate
- Higher rate (0.2+) for exploration
- Lower rate (0.05) for exploitation
- Start with 0.1 and adjust based on results

### 3. Training Duration
- Run for 50-100 generations
- Monitor fitness improvement
- Stop when fitness plateaus

### 4. Battle Frequency
- 25 battles per individual per generation
- Increase for more stable fitness evaluation
- Decrease for faster training

## Troubleshooting

### Common Issues

1. **AI not learning**: Increase mutation rate or population size
2. **AI too aggressive**: Adjust decision weights or fitness function
3. **Training too slow**: Reduce population size or battles per generation
4. **Poor performance**: Check fitness function weights

### Debugging

Use the AI Control Panel to monitor:
- Training progress
- Fitness scores
- AI decision making
- Battle statistics

### Performance Monitoring

```javascript
// Get training statistics
const progress = battleScene.getAITrainingProgress();
console.log('Generation:', progress.currentGeneration);
console.log('Best Fitness:', progress.stats.bestFitness);
console.log('Average Fitness:', progress.stats.averageFitness);
```

## Future Enhancements

### Potential Improvements

1. **Neural Networks**: Replace weighted decisions with actual neural networks
2. **Deep Learning**: Use deep reinforcement learning
3. **Multi-objective Optimization**: Optimize for multiple goals simultaneously
4. **Behavioral Diversity**: Encourage different fighting styles
5. **Adaptive Difficulty**: Adjust AI difficulty based on human player skill

### Advanced Features

1. **Tournament Selection**: Use tournament-based selection
2. **Island Model**: Separate populations with occasional migration
3. **Co-evolution**: Evolve multiple species simultaneously
4. **Behavioral Analysis**: Analyze and visualize AI behavior patterns

## Conclusion

The AI system provides a robust foundation for creating intelligent fighters using genetic algorithms. By understanding the components and customizing the parameters, you can create AIs with different fighting styles and skill levels. The system is designed to be extensible, allowing for future enhancements and more sophisticated AI techniques.
