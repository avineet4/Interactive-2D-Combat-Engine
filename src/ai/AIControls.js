/**
 * AI Controls Interface
 * Provides simple controls for managing AI during gameplay
 */

export class AIControls {
  constructor(aiSystem) {
    this.aiSystem = aiSystem;
    this.controlsElement = null;
    this.isVisible = false;
    
    this.createControls();
    this.setupEventListeners();
  }

  createControls() {
    // Create controls container
    this.controlsElement = document.createElement('div');
    this.controlsElement.id = 'ai-controls';
    this.controlsElement.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 15px;
      border-radius: 5px;
      font-family: Arial, sans-serif;
      font-size: 12px;
      z-index: 1000;
      min-width: 200px;
      display: none;
    `;

    // Create controls HTML
    this.controlsElement.innerHTML = `
      <h3 style="margin: 0 0 10px 0;">AI Controls</h3>
      
      <div style="margin-bottom: 10px;">
        <label>
          <input type="radio" name="ai-mode" value="human-vs-human"> Human vs Human
        </label>
      </div>
      
      <div style="margin-bottom: 10px;">
        <label>
          <input type="radio" name="ai-mode" value="ai-vs-human" checked> AI vs Human
        </label>
      </div>
      
      <div style="margin-bottom: 10px;">
        <label>
          <input type="radio" name="ai-mode" value="ai-vs-ai"> AI vs AI
        </label>
      </div>
      
      <div style="margin-bottom: 10px;">
        <label>
          <input type="checkbox" id="ai-debug"> Debug Mode
        </label>
      </div>
      
      <div style="margin-bottom: 10px;">
        <button id="ai-force-action">Force Action</button>
        <select id="ai-action-select" style="margin-left: 5px;">
          <option value="idle">Idle</option>
          <option value="walk_forward">Walk Forward</option>
          <option value="walk_backward">Walk Backward</option>
          <option value="jump_up">Jump Up</option>
          <option value="light_punch">Light Punch</option>
          <option value="medium_punch">Medium Punch</option>
          <option value="heavy_punch">Heavy Punch</option>
          <option value="light_kick">Light Kick</option>
          <option value="medium_kick">Medium Kick</option>
          <option value="heavy_kick">Heavy Kick</option>
          <option value="crouch">Crouch</option>
        </select>
      </div>
      
      <div style="margin-bottom: 10px; font-size: 10px;">
        <div id="ai-status">AI Status: Initializing...</div>
      </div>
      
      <div style="text-align: center;">
        <button id="ai-toggle-controls" style="font-size: 10px;">Hide Controls</button>
      </div>
    `;

    // Add to document
    document.body.appendChild(this.controlsElement);
  }

  setupEventListeners() {
    // Mode selection
    const modeRadios = this.controlsElement.querySelectorAll('input[name="ai-mode"]');
    modeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.handleModeChange(e.target.value);
        }
      });
    });

    // Debug mode toggle
    const debugCheckbox = this.controlsElement.querySelector('#ai-debug');
    debugCheckbox.addEventListener('change', (e) => {
      this.aiSystem.setDebugMode(e.target.checked);
    });

    // Force action button
    const forceButton = this.controlsElement.querySelector('#ai-force-action');
    const actionSelect = this.controlsElement.querySelector('#ai-action-select');
    
    forceButton.addEventListener('click', () => {
      const action = actionSelect.value;
      // Force action on AI player (assuming player 1)
      this.aiSystem.forceAction(1, action);
    });

    // Toggle controls visibility
    const toggleButton = this.controlsElement.querySelector('#ai-toggle-controls');
    toggleButton.addEventListener('click', () => {
      this.toggleVisibility();
    });

    // Keyboard shortcut to show/hide controls (Ctrl + I)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        this.toggleVisibility();
      }
    });
  }

  handleModeChange(mode) {
    switch (mode) {
      case 'human-vs-human':
        this.aiSystem.setupHumanVsHuman();
        break;
      case 'ai-vs-human':
        this.aiSystem.setupAIVsHuman(0);
        break;
      case 'ai-vs-ai':
        this.aiSystem.setupAIVsAI();
        break;
    }
    
    this.updateStatus();
  }

  toggleVisibility() {
    this.isVisible = !this.isVisible;
    this.controlsElement.style.display = this.isVisible ? 'block' : 'none';
    
    const toggleButton = this.controlsElement.querySelector('#ai-toggle-controls');
    toggleButton.textContent = this.isVisible ? 'Hide Controls' : 'Show Controls';
  }

  show() {
    this.isVisible = true;
    this.controlsElement.style.display = 'block';
  }

  hide() {
    this.isVisible = false;
    this.controlsElement.style.display = 'none';
  }

  updateStatus() {
    const statusElement = this.controlsElement.querySelector('#ai-status');
    const stats = this.aiSystem.getStatistics();
    
    let statusText = `AI Status: ${stats.initialized ? 'Ready' : 'Not Ready'}\\n`;
    statusText += `Active Controllers: [${stats.activeControllers.join(', ')}]\\n`;
    statusText += `Updates: ${stats.updateCount}\\n`;
    statusText += `Avg Update Time: ${stats.averageUpdateTime.toFixed(2)}ms`;
    
    statusElement.textContent = statusText;
  }

  // Update status periodically
  startStatusUpdates() {
    setInterval(() => {
      if (this.isVisible) {
        this.updateStatus();
      }
    }, 1000);
  }

  destroy() {
    if (this.controlsElement && this.controlsElement.parentNode) {
      this.controlsElement.parentNode.removeChild(this.controlsElement);
    }
  }
}