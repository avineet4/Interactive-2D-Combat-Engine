/**
 * Virtual Input Handler - Injects AI inputs into the game's input system
 * Extends the existing input handler to support AI-controlled inputs
 */

import { Control } from '../constants/control.js';

export class VirtualInputHandler {
  constructor() {
    // Store references to AI controllers
    this.aiControllers = new Map();
    
    // Virtual key states for each player
    this.virtualKeys = new Map();
    
    // Track original input functions for restoration
    this.originalInputFunctions = new Map();
    
    this.isPatched = false;
  }

  /**
   * Register an AI controller for a specific player
   * @param {number} playerId - Player ID (0 or 1)
   * @param {AIController} aiController - AI controller instance
   */
  registerAIController(playerId, aiController) {
    this.aiControllers.set(playerId, aiController);
    
    // Initialize virtual key state for this player
    if (!this.virtualKeys.has(playerId)) {
      this.virtualKeys.set(playerId, {
        [Control.LEFT]: false,
        [Control.RIGHT]: false,
        [Control.UP]: false,
        [Control.DOWN]: false,
        [Control.LIGHT_PUNCH]: false,
        [Control.MEDIUM_PUNCH]: false,
        [Control.HEAVY_PUNCH]: false,
        [Control.LIGHT_KICK]: false,
        [Control.MEDIUM_KICK]: false,
        [Control.HEAVY_KICK]: false
      });
    }
  }

  /**
   * Unregister an AI controller
   * @param {number} playerId - Player ID to unregister
   */
  unregisterAIController(playerId) {
    this.aiControllers.delete(playerId);
    this.virtualKeys.delete(playerId);
  }

  /**
   * Update virtual inputs from AI controller
   * @param {number} playerId - Player ID
   * @param {Object} virtualInputs - Virtual input state from AI controller
   */
  updateVirtualInputs(playerId, virtualInputs) {
    if (!this.virtualKeys.has(playerId)) {
      return;
    }

    const playerKeys = this.virtualKeys.get(playerId);
    
    // Map AI virtual inputs to control constants
    playerKeys[Control.LEFT] = virtualInputs.left;
    playerKeys[Control.RIGHT] = virtualInputs.right;
    playerKeys[Control.UP] = virtualInputs.up;
    playerKeys[Control.DOWN] = virtualInputs.down;
    playerKeys[Control.LIGHT_PUNCH] = virtualInputs.lightPunch;
    playerKeys[Control.MEDIUM_PUNCH] = virtualInputs.mediumPunch;
    playerKeys[Control.HEAVY_PUNCH] = virtualInputs.heavyPunch;
    playerKeys[Control.LIGHT_KICK] = virtualInputs.lightKick;
    playerKeys[Control.MEDIUM_KICK] = virtualInputs.mediumKick;
    playerKeys[Control.HEAVY_KICK] = virtualInputs.heavyKick;
  }

  /**
   * Check if a virtual key is pressed for a player
   * @param {number} playerId - Player ID
   * @param {string} control - Control constant
   * @returns {boolean} True if virtually pressed
   */
  isVirtualKeyDown(playerId, control) {
    const playerKeys = this.virtualKeys.get(playerId);
    return playerKeys ? playerKeys[control] : false;
  }

  /**
   * Patch the input handler module to support virtual inputs
   * This modifies the imported input functions to check for AI inputs
   */
  async patchInputHandler() {
    if (this.isPatched) {
      return;
    }

    try {
      // Import the input handler module
      const inputModule = await import('../engine/inputHandler.js');
      
      // Store original functions
      this.originalInputFunctions.set('isKeyDown', inputModule.isKeyDown);
      this.originalInputFunctions.set('iskeyPressed', inputModule.iskeyPressed);
      
      // Create patched versions that check virtual inputs
      const patchedIsKeyDown = (code) => {
        // Check for AI virtual inputs first
        for (const [playerId, controller] of this.aiControllers.entries()) {
          if (controller.isEnabled) {
            const virtualPressed = this.checkVirtualKeyByCode(playerId, code);
            if (virtualPressed) {
              return true;
            }
          }
        }
        
        // Fall back to original function
        return this.originalInputFunctions.get('isKeyDown')(code);
      };

      const patchedIsKeyPressed = (code) => {
        // For key pressed events, we need to track state changes
        // This is more complex and might need frame-based tracking
        
        // For now, fall back to original for human inputs
        // AI inputs are handled differently (continuous state)
        return this.originalInputFunctions.get('iskeyPressed')(code);
      };

      // Replace the functions in the module
      // Note: This is a bit hacky but necessary for integration
      Object.defineProperty(inputModule, 'isKeyDown', {
        value: patchedIsKeyDown,
        writable: true,
        configurable: true
      });

      Object.defineProperty(inputModule, 'iskeyPressed', {
        value: patchedIsKeyPressed,
        writable: true,
        configurable: true
      });

      this.isPatched = true;
      console.log('Input handler patched for AI support');
      
    } catch (error) {
      console.error('Failed to patch input handler:', error);
    }
  }

  /**
   * Check virtual key by keyboard code
   * @param {number} playerId - Player ID
   * @param {string} code - Keyboard code
   * @returns {boolean} True if virtually pressed
   */
  checkVirtualKeyByCode(playerId, code) {
    // Import controls mapping
    import('../constants/control.js').then(({ controls }) => {
      const playerControls = controls[playerId];
      if (!playerControls) return false;

      // Find which control this code maps to
      for (const [control, keyCode] of Object.entries(playerControls.keyboard)) {
        if (keyCode === code) {
          return this.isVirtualKeyDown(playerId, control);
        }
      }
    });

    return false;
  }

  /**
   * Restore original input handler functions
   */
  unpatchInputHandler() {
    if (!this.isPatched) {
      return;
    }

    try {
      import('../engine/inputHandler.js').then(inputModule => {
        // Restore original functions
        Object.defineProperty(inputModule, 'isKeyDown', {
          value: this.originalInputFunctions.get('isKeyDown'),
          writable: true,
          configurable: true
        });

        Object.defineProperty(inputModule, 'iskeyPressed', {
          value: this.originalInputFunctions.get('iskeyPressed'),
          writable: true,
          configurable: true
        });

        this.isPatched = false;
        console.log('Input handler restored');
      });
    } catch (error) {
      console.error('Failed to restore input handler:', error);
    }
  }

  /**
   * Create enhanced input checking functions that work with both human and AI inputs
   * These can be used instead of patching the original module
   */
  createEnhancedInputFunctions() {
    const enhancedFunctions = {};

    // Import original functions
    import('../engine/inputHandler.js').then(inputModule => {
      enhancedFunctions.isLeft = (playerId) => {
        // Check AI virtual input
        if (this.aiControllers.has(playerId) && this.aiControllers.get(playerId).isEnabled) {
          if (this.isVirtualKeyDown(playerId, Control.LEFT)) {
            return true;
          }
        }
        
        // Fall back to human input
        return inputModule.isleft(playerId);
      };

      enhancedFunctions.isRight = (playerId) => {
        if (this.aiControllers.has(playerId) && this.aiControllers.get(playerId).isEnabled) {
          if (this.isVirtualKeyDown(playerId, Control.RIGHT)) {
            return true;
          }
        }
        return inputModule.isright(playerId);
      };

      enhancedFunctions.isUp = (playerId) => {
        if (this.aiControllers.has(playerId) && this.aiControllers.get(playerId).isEnabled) {
          if (this.isVirtualKeyDown(playerId, Control.UP)) {
            return true;
          }
        }
        return inputModule.isup(playerId);
      };

      enhancedFunctions.isDown = (playerId) => {
        if (this.aiControllers.has(playerId) && this.aiControllers.get(playerId).isEnabled) {
          if (this.isVirtualKeyDown(playerId, Control.DOWN)) {
            return true;
          }
        }
        return inputModule.isdown(playerId);
      };

      // Attack functions
      enhancedFunctions.isLightPunch = (playerId) => {
        if (this.aiControllers.has(playerId) && this.aiControllers.get(playerId).isEnabled) {
          if (this.isVirtualKeyDown(playerId, Control.LIGHT_PUNCH)) {
            return true;
          }
        }
        return inputModule.isLightPunch(playerId);
      };

      enhancedFunctions.isMediumPunch = (playerId) => {
        if (this.aiControllers.has(playerId) && this.aiControllers.get(playerId).isEnabled) {
          if (this.isVirtualKeyDown(playerId, Control.MEDIUM_PUNCH)) {
            return true;
          }
        }
        return inputModule.isMediumPunch(playerId);
      };

      enhancedFunctions.isHeavyPunch = (playerId) => {
        if (this.aiControllers.has(playerId) && this.aiControllers.get(playerId).isEnabled) {
          if (this.isVirtualKeyDown(playerId, Control.HEAVY_PUNCH)) {
            return true;
          }
        }
        return inputModule.isHeavyPunch(playerId);
      };

      enhancedFunctions.isLightKick = (playerId) => {
        if (this.aiControllers.has(playerId) && this.aiControllers.get(playerId).isEnabled) {
          if (this.isVirtualKeyDown(playerId, Control.LIGHT_KICK)) {
            return true;
          }
        }
        return inputModule.isLightKick(playerId);
      };

      enhancedFunctions.isMediumKick = (playerId) => {
        if (this.aiControllers.has(playerId) && this.aiControllers.get(playerId).isEnabled) {
          if (this.isVirtualKeyDown(playerId, Control.MEDIUM_KICK)) {
            return true;
          }
        }
        return inputModule.isMediumKick(playerId);
      };

      enhancedFunctions.isHeavyKick = (playerId) => {
        if (this.aiControllers.has(playerId) && this.aiControllers.get(playerId).isEnabled) {
          if (this.isVirtualKeyDown(playerId, Control.HEAVY_KICK)) {
            return true;
          }
        }
        return inputModule.isHeavyKick(playerId);
      };

      // Direction-based functions
      enhancedFunctions.isForward = (playerId, direction) => {
        const isRightPressed = this.aiControllers.has(playerId) && 
                              this.aiControllers.get(playerId).isEnabled ?
                              this.isVirtualKeyDown(playerId, Control.RIGHT) :
                              inputModule.isright(playerId);
                              
        const isLeftPressed = this.aiControllers.has(playerId) && 
                             this.aiControllers.get(playerId).isEnabled ?
                             this.isVirtualKeyDown(playerId, Control.LEFT) :
                             inputModule.isleft(playerId);

        return direction > 0 ? isRightPressed : isLeftPressed;
      };

      enhancedFunctions.isBackward = (playerId, direction) => {
        const isRightPressed = this.aiControllers.has(playerId) && 
                              this.aiControllers.get(playerId).isEnabled ?
                              this.isVirtualKeyDown(playerId, Control.RIGHT) :
                              inputModule.isright(playerId);
                              
        const isLeftPressed = this.aiControllers.has(playerId) && 
                             this.aiControllers.get(playerId).isEnabled ?
                             this.isVirtualKeyDown(playerId, Control.LEFT) :
                             inputModule.isleft(playerId);

        return direction > 0 ? isLeftPressed : isRightPressed;
      };

      enhancedFunctions.isIdle = (playerId) => {
        if (this.aiControllers.has(playerId) && this.aiControllers.get(playerId).isEnabled) {
          const playerKeys = this.virtualKeys.get(playerId);
          if (playerKeys) {
            return !playerKeys[Control.LEFT] && !playerKeys[Control.RIGHT] && 
                   !playerKeys[Control.UP] && !playerKeys[Control.DOWN];
          }
        }
        return inputModule.isIdle(playerId);
      };
    });

    return enhancedFunctions;
  }

  /**
   * Update all AI controllers and apply their virtual inputs
   */
  updateAllAI() {
    for (const [playerId, controller] of this.aiControllers.entries()) {
      if (controller.isEnabled) {
        // Update virtual inputs from AI controller
        this.updateVirtualInputs(playerId, controller.virtualInputs);
      }
    }
  }

  /**
   * Reset all virtual inputs
   */
  resetAllVirtualInputs() {
    for (const [playerId, keys] of this.virtualKeys.entries()) {
      Object.keys(keys).forEach(control => {
        keys[control] = false;
      });
    }
  }
}