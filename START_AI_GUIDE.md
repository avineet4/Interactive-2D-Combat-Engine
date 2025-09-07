# How to Start the AI System

## Quick Start Guide

### 1. **Open Your Game**
- Open `index.html` in your browser
- The game will start in normal mode

### 2. **Switch to AI Mode**
- Press **A** key to toggle AI mode
- You'll see "AI MODE" overlay and green border around the canvas
- An "AI" button will appear in the top-left corner

### 3. **Start AI Training**
- Press **T** key to start training
- OR click the "AI" button and use the control panel
- Watch the AI evolve through generations!

### 4. **Create Battles**
- Press **V** for AI vs AI battle
- Press **H** for Human vs AI battle
- Use the control panel for more options

## Step-by-Step Instructions

### **Step 1: Launch the Game**
```
1. Open index.html in your browser
2. Wait for the game to load
3. You should see the normal fighting game
```

### **Step 2: Enable AI Mode**
```
1. Press the 'A' key
2. You'll see "AI MODE" text appear briefly
3. The canvas will have a green border
4. An "AI" button appears in the top-left corner
```

### **Step 3: Start Training**
```
1. Press 'T' to start AI training
2. OR click the "AI" button and press "Start Training"
3. Watch the console for training progress
4. The AI will fight battles and evolve
```

### **Step 4: Test the AI**
```
1. Press 'V' to create an AI vs AI battle
2. Press 'H' to fight against the AI yourself
3. Use the control panel to save/load AI brains
```

## Keyboard Controls

| Key | Action |
|-----|--------|
| **A** | Toggle AI Mode |
| **T** | Start AI Training |
| **S** | Stop AI Training |
| **V** | AI vs AI Battle |
| **H** | Human vs AI Battle |

## Control Panel Features

Click the "AI" button to access:

- **Training Statistics**: Generation, fitness scores, training time
- **Progress Bar**: Visual training progress
- **Control Buttons**: Start/stop training, create battles
- **Save/Load**: Save best AI brains to browser storage
- **Debug Info**: Real-time AI decision making

## What to Expect

### **First Run**
- AI starts with random strategies
- Early battles may look chaotic
- AI learns through trial and error

### **After Training**
- AI becomes more strategic
- Better timing and positioning
- More effective attack combinations

### **Training Progress**
- Watch fitness scores improve
- AI adapts to different situations
- Generates unique fighting styles

## Troubleshooting

### **AI Not Responding**
- Make sure you're in AI mode (press A)
- Check browser console for errors
- Refresh the page and try again

### **Training Not Starting**
- Press A to enable AI mode first
- Check console for error messages
- Try clicking the AI button for manual control

### **Performance Issues**
- Reduce population size in AITrainingSystem.js
- Lower the number of battles per generation
- Close other browser tabs

## Advanced Usage

### **Customize AI Behavior**
Edit `src/ai/AIBrain.js` to modify decision weights:
```javascript
this.decisionWeights = {
  moveForward: 0.8,    // More aggressive movement
  lightPunch: 0.6,     // More light attacks
  block: -0.2,         // Less defensive
};
```

### **Adjust Training Parameters**
Edit `src/ai/AITrainingSystem.js`:
```javascript
const geneticAlgorithm = new GeneticAlgorithm(
  100,    // Population size
  0.15,   // Mutation rate
  0.9     // Crossover rate
);
```

### **Modify Fitness Function**
Edit `src/ai/FitnessFunction.js` to change what the AI optimizes for:
```javascript
this.weights = {
  damageDealt: 15,     // Reward damage dealing
  damageTaken: -3,     // Penalty for taking damage
  victory: 200,         // Big victory bonus
};
```

## Next Steps

1. **Experiment**: Try different training parameters
2. **Observe**: Watch how AI strategies evolve
3. **Customize**: Modify weights and fitness functions
4. **Compete**: Train AI to beat human players
5. **Analyze**: Use the control panel to study AI behavior

## Tips for Best Results

- **Let it train**: Run for 50+ generations for good results
- **Monitor progress**: Use the control panel to track improvement
- **Save good AI**: Use the save button to keep successful AI brains
- **Experiment**: Try different fitness weights for different play styles
- **Be patient**: AI learning takes time, but results are rewarding!

---

**Ready to start? Press A to enable AI mode and T to start training!**
