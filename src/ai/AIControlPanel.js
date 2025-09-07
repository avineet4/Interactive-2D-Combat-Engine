/**
 * AI Control Panel for managing AI training and testing
 * Provides UI controls for genetic algorithm operations
 */
export class AIControlPanel {
  constructor(battleScene) {
    this.battleScene = battleScene;
    this.isVisible = false;
    this.panel = null;
    this.statsDisplay = null;
    this.trainingProgress = null;
    
    this.createPanel();
    this.setupEventListeners();
  }

  /**
   * Create the AI control panel HTML
   */
  createPanel() {
    // Create main panel
    this.panel = document.createElement('div');
    this.panel.id = 'ai-control-panel';
    this.panel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 15px;
      border-radius: 10px;
      font-family: Arial, sans-serif;
      font-size: 12px;
      z-index: 1000;
      display: none;
    `;

    // Create panel content
    this.panel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0; color: #00ff00;">AI Control Panel</h3>
        <button id="close-ai-panel" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">×</button>
      </div>
      
      <div id="ai-stats" style="margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #ffff00;">Training Statistics</h4>
        <div id="stats-content">
          <div>Generation: <span id="generation">0</span></div>
          <div>Best Fitness: <span id="best-fitness">0</span></div>
          <div>Average Fitness: <span id="avg-fitness">0</span></div>
          <div>Training Time: <span id="training-time">0s</span></div>
        </div>
      </div>
      
      <div id="training-progress" style="margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #ffff00;">Training Progress</h4>
        <div style="background: #333; height: 20px; border-radius: 10px; overflow: hidden;">
          <div id="progress-bar" style="background: #00ff00; height: 100%; width: 0%; transition: width 0.3s;"></div>
        </div>
        <div style="text-align: center; margin-top: 5px;">
          <span id="progress-text">0%</span>
        </div>
      </div>
      
      <div id="ai-controls" style="margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #ffff00;">Controls</h4>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button id="start-training" style="background: #00aa00; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer;">Start Training</button>
          <button id="stop-training" style="background: #aa0000; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer;">Stop Training</button>
          <button id="ai-vs-ai" style="background: #0066aa; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer;">AI vs AI Battle</button>
          <button id="human-vs-ai" style="background: #aa6600; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer;">Human vs AI</button>
          <button id="save-ai" style="background: #6600aa; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer;">Save Best AI</button>
          <button id="load-ai" style="background: #aa0066; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer;">Load AI</button>
        </div>
      </div>
      
      <div id="ai-info" style="margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #ffff00;">AI Information</h4>
        <div id="ai-info-content">
          <div>Status: <span id="ai-status">Ready</span></div>
          <div>Mode: <span id="ai-mode">Normal</span></div>
          <div>Best AI Fitness: <span id="best-ai-fitness">0</span></div>
        </div>
      </div>
      
      <div id="ai-debug" style="margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #ffff00;">Debug Info</h4>
        <div id="debug-content">
          <div>Last Decision: <span id="last-decision">None</span></div>
          <div>Decision Confidence: <span id="decision-confidence">0</span></div>
          <div>Current State: <span id="current-state">Idle</span></div>
        </div>
      </div>
    `;

    // Add panel to document
    document.body.appendChild(this.panel);
    
    // Store references to elements
    this.statsDisplay = {
      generation: document.getElementById('generation'),
      bestFitness: document.getElementById('best-fitness'),
      avgFitness: document.getElementById('avg-fitness'),
      trainingTime: document.getElementById('training-time')
    };
    
    this.trainingProgress = {
      bar: document.getElementById('progress-bar'),
      text: document.getElementById('progress-text')
    };
  }

  /**
   * Setup event listeners for panel controls
   */
  setupEventListeners() {
    // Close panel
    document.getElementById('close-ai-panel').addEventListener('click', () => {
      this.hide();
    });

    // Training controls
    document.getElementById('start-training').addEventListener('click', () => {
      this.battleScene.startAITraining();
      this.updateStatus('Training');
    });

    document.getElementById('stop-training').addEventListener('click', () => {
      this.battleScene.stopAITraining();
      this.updateStatus('Stopped');
    });

    // Battle controls
    document.getElementById('ai-vs-ai').addEventListener('click', () => {
      this.battleScene.createAIVsAIBattle();
      this.updateStatus('AI vs AI Battle');
    });

    document.getElementById('human-vs-ai').addEventListener('click', () => {
      this.battleScene.createHumanVsAIBattle();
      this.updateStatus('Human vs AI Battle');
    });

    // Save/Load controls
    document.getElementById('save-ai').addEventListener('click', () => {
      this.saveAI();
    });

    document.getElementById('load-ai').addEventListener('click', () => {
      this.loadAI();
    });
  }

  /**
   * Show the AI control panel
   */
  show() {
    this.panel.style.display = 'block';
    this.isVisible = true;
    this.updateDisplay();
  }

  /**
   * Hide the AI control panel
   */
  hide() {
    this.panel.style.display = 'none';
    this.isVisible = false;
  }

  /**
   * Toggle panel visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Update the display with current AI statistics
   */
  updateDisplay() {
    if (!this.isVisible) return;

    const progress = this.battleScene.getAITrainingProgress();
    
    if (progress) {
      // Update training statistics
      this.statsDisplay.generation.textContent = progress.currentGeneration;
      this.statsDisplay.bestFitness.textContent = progress.stats.bestFitness.toFixed(2);
      this.statsDisplay.avgFitness.textContent = progress.stats.averageFitness.toFixed(2);
      this.statsDisplay.trainingTime.textContent = Math.round(progress.stats.trainingTime / 1000) + 's';

      // Update progress bar
      this.trainingProgress.bar.style.width = progress.progress + '%';
      this.trainingProgress.text.textContent = progress.progress.toFixed(1) + '%';
    }

    // Update AI fighter debug info
    this.updateDebugInfo();
  }

  /**
   * Update debug information for AI fighters
   */
  updateDebugInfo() {
    const aiFighters = this.battleScene.fighters.filter(fighter => fighter instanceof AIFighter);
    
    if (aiFighters.length > 0) {
      const aiFighter = aiFighters[0]; // Show info for first AI fighter
      const stats = aiFighter.getAIStats();
      
      document.getElementById('last-decision').textContent = stats.lastDecision?.action || 'None';
      document.getElementById('decision-confidence').textContent = stats.lastDecision?.confidence?.toFixed(2) || '0';
      document.getElementById('current-state').textContent = aiFighter.CurrentState;
      document.getElementById('best-ai-fitness').textContent = stats.fitness.toFixed(2);
    }
  }

  /**
   * Update AI status
   */
  updateStatus(status) {
    document.getElementById('ai-status').textContent = status;
  }

  /**
   * Save the best AI to localStorage
   */
  saveAI() {
    if (this.battleScene.aiTrainingSystem) {
      const bestAI = this.battleScene.aiTrainingSystem.getBestAI();
      if (bestAI) {
        try {
          const aiData = {
            decisionWeights: bestAI.decisionWeights,
            fitness: bestAI.fitness,
            stats: bestAI.getStats(),
            timestamp: Date.now()
          };
          
          localStorage.setItem('bestAI', JSON.stringify(aiData));
          alert('Best AI saved successfully!');
        } catch (error) {
          alert('Failed to save AI: ' + error.message);
        }
      } else {
        alert('No AI to save');
      }
    } else {
      alert('AI Training System not initialized');
    }
  }

  /**
   * Load AI from localStorage
   */
  loadAI() {
    try {
      const aiData = localStorage.getItem('bestAI');
      if (aiData) {
        const parsed = JSON.parse(aiData);
        alert(`AI loaded successfully!\nFitness: ${parsed.fitness.toFixed(2)}\nSaved: ${new Date(parsed.timestamp).toLocaleString()}`);
        
        // You could implement loading the AI into the training system here
        console.log('Loaded AI data:', parsed);
      } else {
        alert('No saved AI found');
      }
    } catch (error) {
      alert('Failed to load AI: ' + error.message);
    }
  }

  /**
   * Start auto-update loop
   */
  startAutoUpdate() {
    setInterval(() => {
      this.updateDisplay();
    }, 1000); // Update every second
  }

  /**
   * Show training completion message
   */
  showTrainingComplete() {
    const progress = this.battleScene.getAITrainingProgress();
    if (progress) {
      alert(`Training Complete!\nGenerations: ${progress.currentGeneration}\nBest Fitness: ${progress.stats.bestFitness.toFixed(2)}\nTraining Time: ${Math.round(progress.stats.trainingTime / 1000)}s`);
    }
  }
}

/**
 * AI Toggle Button for easy access to AI controls
 */
export class AIToggleButton {
  constructor(battleScene) {
    this.battleScene = battleScene;
    this.button = null;
    this.controlPanel = null;
    
    this.createButton();
    this.controlPanel = new AIControlPanel(battleScene);
  }

  /**
   * Create the toggle button
   */
  createButton() {
    this.button = document.createElement('button');
    this.button.id = 'ai-toggle-button';
    this.button.textContent = 'AI';
    this.button.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      width: 50px;
      height: 50px;
      background: #0066aa;
      color: white;
      border: none;
      border-radius: 25px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      z-index: 1001;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
    `;

    // Add hover effect
    this.button.addEventListener('mouseenter', () => {
      this.button.style.background = '#0088cc';
      this.button.style.transform = 'scale(1.1)';
    });

    this.button.addEventListener('mouseleave', () => {
      this.button.style.background = '#0066aa';
      this.button.style.transform = 'scale(1)';
    });

    // Add click event
    this.button.addEventListener('click', () => {
      this.controlPanel.toggle();
    });

    // Add to document
    document.body.appendChild(this.button);
  }

  /**
   * Show the toggle button
   */
  show() {
    this.button.style.display = 'block';
  }

  /**
   * Hide the toggle button
   */
  hide() {
    this.button.style.display = 'none';
  }
}
