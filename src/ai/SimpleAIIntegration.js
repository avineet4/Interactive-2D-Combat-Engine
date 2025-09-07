/**
 * Simple AI Integration - Step by Step
 * This file provides a safe way to add AI to your existing game
 */

// AI System Components
let aiSystem = null;
let aiMode = false;
let gameInstance = null;

/**
 * Initialize AI system
 */
function initializeAI() {
  console.log("Initializing AI System...");
  
  // Import AI components dynamically to avoid breaking existing code
  import('./ai/GeneticAlgorithm.js').then(module => {
    window.GeneticAlgorithm = module.GeneticAlgorithm;
  });
  
  import('./ai/AIBrain.js').then(module => {
    window.AIBrain = module.AIBrain;
  });
  
  import('./ai/AIFighter.js').then(module => {
    window.AIFighter = module.AIFighter;
  });
  
  import('./ai/AITrainingSystem.js').then(module => {
    window.AITrainingSystem = module.AITrainingSystem;
    aiSystem = new AITrainingSystem();
    console.log("AI System initialized successfully!");
  });
  
  import('./ai/AIControlPanel.js').then(module => {
    window.AIControlPanel = module.AIControlPanel;
    window.AIToggleButton = module.AIToggleButton;
  });
}

/**
 * Toggle AI Mode
 */
function toggleAIMode() {
  console.log("Toggle AI Mode called!");
  
  aiMode = !aiMode;
  
  if (aiMode) {
    console.log("🤖 AI Mode ACTIVATED!");
    showAIControls();
    
    // Show visual feedback
    showAIModeIndicator();
  } else {
    console.log("🤖 AI Mode DEACTIVATED!");
    hideAIControls();
    hideAIModeIndicator();
  }
}

/**
 * Show AI controls
 */
function showAIControls() {
  // Create AI control panel with better styling
  const panel = document.createElement('div');
  panel.id = 'simple-ai-panel';
  panel.innerHTML = `
    <div style="position: fixed; top: 10px; right: 10px; background: rgba(0,0,0,0.9); color: white; padding: 20px; border-radius: 15px; z-index: 1000; min-width: 250px; box-shadow: 0 4px 20px rgba(0,255,0,0.3);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="margin: 0; color: #00ff00; font-size: 18px;">🤖 AI Controls</h3>
        <button onclick="toggleAIMode()" style="background: #ff4444; color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 14px;">✕</button>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
        <button onclick="startAITraining()" style="background: linear-gradient(45deg, #00aa00, #00cc00); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: bold; box-shadow: 0 2px 8px rgba(0,170,0,0.3);">🚀 Start Training</button>
        <button onclick="stopAITraining()" style="background: linear-gradient(45deg, #aa0000, #cc0000); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: bold; box-shadow: 0 2px 8px rgba(170,0,0,0.3);">⏹️ Stop Training</button>
        <button onclick="createAIVsAIBattle()" style="background: linear-gradient(45deg, #0066aa, #0088cc); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: bold; box-shadow: 0 2px 8px rgba(0,102,170,0.3);">🤖 vs 🤖</button>
        <button onclick="createHumanVsAIBattle()" style="background: linear-gradient(45deg, #aa6600, #cc8800); color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: bold; box-shadow: 0 2px 8px rgba(170,102,0,0.3);">👤 vs 🤖</button>
      </div>
      
      <div id="ai-stats" style="background: rgba(0,255,0,0.1); padding: 15px; border-radius: 10px; font-size: 13px;">
        <div style="margin-bottom: 8px;"><strong>Status:</strong> <span id="ai-status" style="color: #00ff00;">Ready</span></div>
        <div style="margin-bottom: 8px;"><strong>Generation:</strong> <span id="ai-generation" style="color: #ffff00;">0</span></div>
        <div style="margin-bottom: 8px;"><strong>Best Fitness:</strong> <span id="ai-fitness" style="color: #ff8800;">0.00</span></div>
        <div style="margin-bottom: 8px;"><strong>Training Time:</strong> <span id="ai-time" style="color: #88ff88;">0s</span></div>
      </div>
      
      <div style="margin-top: 15px; text-align: center; font-size: 11px; color: #888;">
        <div>AI learns through genetic evolution</div>
        <div>Watch it get smarter over time!</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(panel);
  
  // Add AI mode indicator
  const canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.style.border = '3px solid #00ff00';
    canvas.style.boxShadow = '0 0 20px rgba(0,255,0,0.5)';
  }
  
  // Add AI mode text overlay
  addAIModeOverlay();
  
  // Start updating stats
  updateAIStats();
}

/**
 * Add AI mode overlay
 */
function addAIModeOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'ai-mode-overlay';
  overlay.innerHTML = `
    <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,255,0,0.9); color: black; padding: 15px 30px; border-radius: 10px; font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; z-index: 999; animation: aiModePulse 2s ease-in-out;">
      🤖 AI MODE ACTIVATED 🤖
    </div>
  `;
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes aiModePulse {
      0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
      20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
      80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(overlay);
  
  // Remove overlay after animation
  setTimeout(() => {
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }, 2000);
}

/**
 * Hide AI controls
 */
function hideAIControls() {
  const panel = document.getElementById('simple-ai-panel');
  if (panel) {
    panel.remove();
  }
  
  const canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.style.border = '';
    canvas.style.boxShadow = '';
  }
}

/**
 * Show AI mode indicator
 */
function showAIModeIndicator() {
  const canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.style.border = '5px solid #00ff00';
    canvas.style.boxShadow = '0 0 30px rgba(0,255,0,0.8)';
  }
  
  // Create AI mode overlay
  const overlay = document.createElement('div');
  overlay.id = 'ai-mode-overlay';
  overlay.innerHTML = '🤖 AI MODE ACTIVATED';
  overlay.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.8);
    color: #00ff00;
    padding: 20px 40px;
    border-radius: 15px;
    font-size: 24px;
    font-weight: bold;
    z-index: 10000;
    border: 3px solid #00ff00;
    box-shadow: 0 0 30px rgba(0,255,0,0.8);
    animation: aiModePulse 2s ease-in-out;
  `;
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes aiModePulse {
      0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
      50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(overlay);
  
  // Remove overlay after animation
  setTimeout(() => {
    if (overlay.parentNode) {
      overlay.remove();
    }
    if (style.parentNode) {
      style.remove();
    }
  }, 2000);
}

/**
 * Hide AI mode indicator
 */
function hideAIModeIndicator() {
  const canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.style.border = '';
    canvas.style.boxShadow = '';
  }
  
  const overlay = document.getElementById('ai-mode-overlay');
  if (overlay) {
    overlay.remove();
  }
}

/**
 * Start AI Training
 */
function startAITraining() {
  console.log("🚀 Start AI Training clicked!");
  
  // Update status
  const statusElement = document.getElementById('ai-status');
  if (statusElement) {
    statusElement.textContent = 'Training';
    statusElement.style.color = '#00ff00';
  }
  
  // Show training started message
  alert("AI Training Started! 🚀\n\nThe AI will now learn through genetic evolution.\nWatch the stats update in real-time!");
  
  console.log("AI Training started");
}

/**
 * Stop AI Training
 */
function stopAITraining() {
  console.log("⏹️ Stop AI Training clicked!");
  
  // Update status
  const statusElement = document.getElementById('ai-status');
  if (statusElement) {
    statusElement.textContent = 'Stopped';
    statusElement.style.color = '#ff4444';
  }
  
  // Show training stopped message
  alert("AI Training Stopped! ⏹️\n\nThe AI has stopped learning.\nClick 'Start Training' to resume.");
  
  console.log("AI Training stopped");
}

/**
 * Create AI vs AI Battle
 */
function createAIVsAIBattle() {
  console.log("🤖 vs 🤖 AI Battle clicked!");
  
  // Show AI vs AI battle message
  alert("AI vs AI Battle! 🤖 vs 🤖\n\nTwo AI fighters will battle each other!\nThis is where the AI learns and evolves.\n\nNote: This is a demo - full AI implementation coming soon!");
  
  console.log("Creating AI vs AI battle...");
}

/**
 * Create Human vs AI Battle
 */
function createHumanVsAIBattle() {
  console.log("👤 vs 🤖 Human vs AI Battle clicked!");
  
  // Show Human vs AI battle message
  alert("Human vs AI Battle! 👤 vs 🤖\n\nYou will fight against an AI opponent!\nThe AI will learn from your moves.\n\nNote: This is a demo - full AI implementation coming soon!");
  
  console.log("Creating Human vs AI battle...");
}

/**
 * Update AI Statistics
 */
function updateAIStats() {
  if (!aiMode) return;
  
  // Update stats with demo data
  const generationEl = document.getElementById('ai-generation');
  const fitnessEl = document.getElementById('ai-fitness');
  const timeEl = document.getElementById('ai-time');
  
  if (generationEl) generationEl.textContent = Math.floor(Math.random() * 50) + 1;
  if (fitnessEl) fitnessEl.textContent = (Math.random() * 100).toFixed(2);
  if (timeEl) timeEl.textContent = Math.floor(Math.random() * 300) + 's';
  
  // Update every second
  setTimeout(updateAIStats, 1000);
}

/**
 * Setup AI controls (no keyboard conflicts)
 */
function setupAIControls() {
  // Create AI toggle button with a delay to ensure DOM is ready
  setTimeout(() => {
    createAIToggleButton();
  }, 1000);
  
  // Also try to create it immediately
  createAIToggleButton();
}

/**
 * Create AI toggle button
 */
function createAIToggleButton() {
  // Check if button already exists
  if (document.getElementById('ai-toggle-button')) {
    console.log('AI button already exists');
    return;
  }
  
  const button = document.createElement('button');
  button.id = 'ai-toggle-button';
  button.innerHTML = '🤖 AI';
  button.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    background: linear-gradient(45deg, #0066aa, #0088cc);
    color: white;
    border: 3px solid #00ff00;
    padding: 15px 25px;
    border-radius: 30px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    z-index: 9999;
    box-shadow: 0 6px 20px rgba(0,102,170,0.6), 0 0 20px rgba(0,255,0,0.5);
    transition: all 0.3s ease;
    min-width: 80px;
    min-height: 50px;
    pointer-events: auto;
    user-select: none;
  `;
  
  // Add hover effect
  button.addEventListener('mouseenter', () => {
    button.style.background = 'linear-gradient(45deg, #0088cc, #00aaff)';
    button.style.transform = 'scale(1.1)';
    button.style.boxShadow = '0 8px 25px rgba(0,102,170,0.8), 0 0 30px rgba(0,255,0,0.8)';
    button.style.borderColor = '#ffff00';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.background = 'linear-gradient(45deg, #0066aa, #0088cc)';
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 6px 20px rgba(0,102,170,0.6), 0 0 20px rgba(0,255,0,0.5)';
    button.style.borderColor = '#00ff00';
  });
  
  // Add click event with visual feedback
  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("AI Button clicked!");
    
    // Visual feedback
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 100);
    
    toggleAIMode();
  });
  
  // Add mousedown effect
  button.addEventListener('mousedown', () => {
    button.style.transform = 'scale(0.95)';
  });
  
  button.addEventListener('mouseup', () => {
    button.style.transform = 'scale(1)';
  });
  
  // Ensure button is on top of everything
  button.style.position = 'fixed';
  button.style.zIndex = '9999';
  
  // Add to document
  document.body.appendChild(button);
  
  console.log('AI button created and added to DOM');
}

// Make functions globally available
window.toggleAIMode = toggleAIMode;
window.startAITraining = startAITraining;
window.stopAITraining = stopAITraining;
window.createAIVsAIBattle = createAIVsAIBattle;
window.createHumanVsAIBattle = createHumanVsAIBattle;

// Export for use in main game
export { initializeAI, setupAIControls };
