# 🤖 AI System Implementation Guide

## Overview

This document describes the AI system implementation for the Interactive 2D Combat Engine. The system uses Google's Gemini API to make intelligent decisions based on game state analysis.

## 🏗️ System Architecture

### Core Components

1. **AISystem** (`src/ai/AISystem.js`) - Main coordinator
2. **AIController** (`src/ai/AIController.js`) - Individual fighter AI control
3. **GeminiService** (`src/ai/GeminiService.js`) - Gemini API integration
4. **GameStateAnalyzer** (`src/ai/GameStateAnalyzer.js`) - Game state analysis
5. **VirtualInputHandler** (`src/ai/VirtualInputHandler.js`) - Input injection
6. **AIControls** (`src/ai/AIControls.js`) - UI controls for AI management

### Integration Points

- **BattleScene** - Main integration point, manages AI lifecycle
- **InputHandler** - Modified to support AI virtual inputs
- **Fighter System** - Unchanged, works with AI inputs transparently

## 🎯 How It Works

### 1. Game State Analysis
The system continuously analyzes:
- Distance between fighters
- Health levels
- Fighter states (attacking, vulnerable, etc.)
- Positioning and tactical situation

### 2. AI Decision Making
- Sends structured game state to Gemini API
- Receives strategic decisions in JSON format
- Caches decisions to avoid API spam
- Falls back to rule-based logic if API fails

### 3. Action Execution
- Translates AI decisions into virtual inputs
- Injects inputs into the existing input system
- Manages action timing and queuing

## 🚀 Usage

### Basic Setup

```javascript
import { AISystem } from './src/ai/AISystem.js';

// Initialize with your Gemini API key
const aiSystem = new AISystem('YOUR_API_KEY');
await aiSystem.initialize();

// Setup AI vs Human (Player 0 is AI - Ryu)
aiSystem.setupAIVsHuman(0);

// Update in your game loop
await aiSystem.update(fighters, battleScene, frameTime);
```

### Configuration Options

```javascript
// Enable debug mode
aiSystem.setDebugMode(true);

// Different game modes
aiSystem.setupHumanVsHuman();    // No AI
aiSystem.setupAIVsHuman(0);      // Player 0 is AI
aiSystem.setupAIVsAI();          // Both players AI

// Force specific actions (for testing)
aiSystem.forceAction(1, 'light_punch');
```

### AI Controls Interface

The system includes a built-in UI for controlling AI during gameplay:

- **Ctrl + I** - Toggle AI controls visibility
- **Radio buttons** - Switch between Human vs Human, AI vs Human, AI vs AI
- **Debug checkbox** - Enable/disable debug logging
- **Force Action** - Test specific AI actions
- **Status display** - Real-time AI system statistics

## 🎮 Game Integration

### BattleScene Integration

The AI system is integrated into `BattleScene`:

```javascript
// In constructor
this.aiSystem = new AISystem(apiKey);
await this.initializeAI();

// In update loop
await this.aiSystem.update(this.fighters, this, time);
```

### Input System Integration

Modified `inputHandler.js` to support AI inputs:

```javascript
// New functions added
setAIInputs(playerId, virtualInputState)
clearAIInputs(playerId)

// All input functions now check AI inputs first
export const isleft = (id) => 
  isAIControlActive(id, Control.LEFT) || 
  isKeyDown(controls[id].keyboard[Control.LEFT]);
```

## 🧠 AI Decision Process

### Gemini Prompt Structure

The AI receives detailed game state information:

```
CURRENT SITUATION:
- Distance to opponent: 75 pixels (medium range)
- My health: 120/144 HP (83%)
- Opponent health: 90/144 HP (63%)
- My current state: idle
- Opponent state: walk_forward
- Opponent is attacking: false
- I can attack: true

AVAILABLE ACTIONS:
- MOVE: walk_forward, walk_backward, jump_forward, etc.
- ATTACK: light_punch, medium_punch, heavy_punch, etc.
- DEFENSE: crouch, block, idle

Respond with JSON: {"action": "light_punch", "priority": "high", "reasoning": "close range opportunity"}
```

### Decision Categories

**Distance-based Strategy:**
- **Close (<50px)**: Quick attacks or defensive moves
- **Medium (50-100px)**: Movement or medium attacks
- **Far (>100px)**: Approach or wait for opportunity

**Health-based Strategy:**
- **Low health**: More defensive play
- **Health advantage**: Aggressive pressure
- **Equal health**: Balanced approach

**State-based Strategy:**
- **Opponent attacking**: Block, dodge, or counter
- **Opponent vulnerable**: Press advantage
- **Neutral**: Positioning and setup

## 📊 Performance Considerations

### API Rate Limiting
- Minimum 100ms between API requests
- Decision caching for similar game states
- Fallback to rule-based AI if API fails

### Update Frequency
- AI decisions refresh every 200ms by default
- Game state analysis every frame
- Virtual inputs applied continuously

### Memory Management
- Cache cleanup every 5 seconds
- Limited decision history
- Efficient state comparison

## 🔧 Configuration

### API Key Setup
Replace the API key in `BattleScene.js`:

```javascript
this.aiSystem = new AISystem("YOUR_GEMINI_API_KEY");
```

### Difficulty Adjustment
Modify decision durations in `AIController.js`:

```javascript
this.decisionDuration = 200; // Faster = more reactive
```

### Debug Options
Enable various debug features:

```javascript
aiSystem.setDebugMode(true);  // Console logging
aiController.debugMode = true; // Detailed AI logs
```

## 🎯 Available Actions

### Movement Actions
- `walk_forward` - Move toward opponent
- `walk_backward` - Move away from opponent
- `jump_up` - Vertical jump
- `jump_forward` - Jump toward opponent
- `jump_backward` - Jump away from opponent

### Attack Actions
- `light_punch` - Quick, low damage punch
- `medium_punch` - Balanced punch
- `heavy_punch` - Slow, high damage punch
- `light_kick` - Quick kick
- `medium_kick` - Balanced kick
- `heavy_kick` - Powerful kick

### Defensive Actions
- `crouch` - Duck under attacks
- `block` - Defensive positioning
- `idle` - No action, assess situation

## 🐛 Troubleshooting

### Common Issues

**AI not responding:**
- Check API key is valid
- Verify network connection
- Check console for errors
- Enable debug mode

**Erratic behavior:**
- Check decision duration settings
- Verify game state analysis
- Review Gemini responses in console

**Performance issues:**
- Monitor API request frequency
- Check average update times
- Reduce debug logging in production

### Debug Information

With debug mode enabled, you'll see:
- AI decisions and reasoning
- Virtual input states
- Performance metrics
- API response details

## 🔮 Future Enhancements

### Planned Features
- Learning from player behavior
- Difficulty levels
- Character-specific AI personalities
- Special move recognition
- Combo execution

### Extensibility
The system is designed for easy extension:
- Add new action types in `AIController`
- Enhance game state analysis in `GameStateAnalyzer`
- Modify Gemini prompts in `GeminiService`
- Create custom AI strategies

## 📝 Example Usage Scenarios

### Scenario 1: Training Mode
```javascript
// Setup AI opponent for practice
aiSystem.setupAIVsHuman(1);
aiSystem.setDebugMode(true);
```

### Scenario 2: AI Exhibition
```javascript
// Watch AI vs AI battle
aiSystem.setupAIVsAI();
```

### Scenario 3: Testing Specific Moves
```javascript
// Force AI to perform specific actions
aiSystem.forceAction(1, 'heavy_punch');
```

This AI system provides intelligent, adaptive opponents that analyze the game situation and make strategic decisions using advanced language models, creating a more engaging and challenging fighting game experience.