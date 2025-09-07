import { BattleScene } from "../scene/BattleScene.js";
import { AIControlPanel, AIToggleButton } from "./AIControlPanel.js";
import { AITrainingSystem } from "./AITrainingSystem.js";

/**
 * AI Scene - Specialized battle scene for AI training and testing
 * Extends BattleScene with AI-specific functionality
 */
export class AIScene extends BattleScene {
  constructor(changeScene = null) {
    super(changeScene, true); // Pass aiMode = true
    
    // Initialize AI components
    this.controlPanel = null;
    this.toggleButton = null;
    this.isAIMode = true;
    
    this.initializeAIComponents();
  }

  /**
   * Initialize AI-specific components
   */
  initializeAIComponents() {
    // Create AI control panel
    this.controlPanel = new AIControlPanel(this);
    
    // Create AI toggle button
    this.toggleButton = new AIToggleButton(this);
    
    // Start auto-update for the control panel
    this.controlPanel.startAutoUpdate();
    
    console.log("AI Scene initialized with control panel and toggle button");
  }

  /**
   * Override startRound to set up AI mode
   */
  startRound() {
    super.startRound();
    
    // Show AI controls
    this.toggleButton.show();
    
    // Set up AI mode indicators
    this.setupAIModeIndicators();
  }

  /**
   * Set up AI mode visual indicators
   */
  setupAIModeIndicators() {
    // Add AI mode indicator to the canvas
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.style.border = '3px solid #00ff00'; // Green border for AI mode
    }
    
    // Add AI mode text overlay
    this.addAIModeOverlay();
  }

  /**
   * Add AI mode overlay text
   */
  addAIModeOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'ai-mode-overlay';
    overlay.textContent = 'AI MODE';
    overlay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 255, 0, 0.8);
      color: black;
      padding: 10px 20px;
      border-radius: 5px;
      font-family: Arial, sans-serif;
      font-size: 24px;
      font-weight: bold;
      z-index: 999;
      pointer-events: none;
      animation: fadeInOut 3s ease-in-out;
    `;

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; }
        20% { opacity: 1; }
        80% { opacity: 1; }
        100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(overlay);

    // Remove overlay after animation
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 3000);
  }

  /**
   * Override update to include AI-specific updates
   */
  update(time, context) {
    // Call parent update
    super.update(time, context);
    
    // Update AI-specific components
    this.updateAIComponents(time);
  }

  /**
   * Update AI-specific components
   */
  updateAIComponents(time) {
    // Update control panel if visible
    if (this.controlPanel && this.controlPanel.isVisible) {
      this.controlPanel.updateDisplay();
    }
    
    // Check for training completion
    if (this.isAITraining && this.aiTrainingSystem) {
      const progress = this.aiTrainingSystem.getTrainingProgress();
      if (progress && !progress.isTraining) {
        this.onTrainingComplete();
      }
    }
  }

  /**
   * Handle training completion
   */
  onTrainingComplete() {
    this.isAITraining = false;
    this.controlPanel.showTrainingComplete();
    
    // Automatically create AI vs AI battle with best AI
    setTimeout(() => {
      this.createAIVsAIBattle();
    }, 2000);
  }

  /**
   * Override draw to include AI-specific overlays
   */
  draw(context) {
    // Call parent draw
    super.draw(context);
    
    // Draw AI-specific overlays
    this.drawAIOverlays(context);
  }

  /**
   * Draw AI-specific overlays
   */
  drawAIOverlays(context) {
    // Draw AI decision info if available
    const aiFighters = this.fighters.filter(fighter => fighter instanceof AIFighter);
    
    if (aiFighters.length > 0 && this.controlPanel && this.controlPanel.isVisible) {
      this.drawAIDebugInfo(context, aiFighters);
    }
  }

  /**
   * Draw AI debug information
   */
  drawAIDebugInfo(context, aiFighters) {
    context.save();
    
    // Set text properties
    context.fillStyle = 'rgba(0, 255, 0, 0.8)';
    context.font = '12px Arial';
    
    // Draw debug info for each AI fighter
    aiFighters.forEach((fighter, index) => {
      const x = 10;
      const y = 30 + (index * 80);
      
      const stats = fighter.getAIStats();
      
      // Draw AI info box
      context.fillStyle = 'rgba(0, 0, 0, 0.7)';
      context.fillRect(x, y - 20, 200, 70);
      
      // Draw text
      context.fillStyle = '#00ff00';
      context.fillText(`AI Fighter ${index + 1}:`, x + 5, y);
      context.fillText(`Decision: ${stats.lastDecision?.action || 'None'}`, x + 5, y + 15);
      context.fillText(`Confidence: ${stats.lastDecision?.confidence?.toFixed(2) || '0'}`, x + 5, y + 30);
      context.fillText(`Fitness: ${stats.fitness.toFixed(2)}`, x + 5, y + 45);
    });
    
    context.restore();
  }

  /**
   * Clean up AI components when scene changes
   */
  cleanup() {
    // Hide AI controls
    if (this.toggleButton) {
      this.toggleButton.hide();
    }
    
    if (this.controlPanel) {
      this.controlPanel.hide();
    }
    
    // Remove AI mode border
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.style.border = '';
    }
    
    // Call parent cleanup if it exists
    if (super.cleanup) {
      super.cleanup();
    }
  }

  /**
   * Get AI scene statistics
   */
  getAIStats() {
    return {
      isAIMode: this.isAIMode,
      isTraining: this.isAITraining,
      trainingProgress: this.getAITrainingProgress(),
      aiFightersCount: this.fighters.filter(fighter => fighter instanceof AIFighter).length,
      controlPanelVisible: this.controlPanel ? this.controlPanel.isVisible : false
    };
  }
}
