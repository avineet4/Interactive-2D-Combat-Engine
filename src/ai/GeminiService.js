/**
 * Gemini API Service for AI Fighter Decision Making
 * Analyzes game state and provides AI decisions for fighter control
 */
export class GeminiService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    this.requestCache = new Map();
    this.lastRequestTime = 0;
    this.minRequestInterval = 100; // Minimum 100ms between requests to avoid spam
  }

  /**
   * Generate AI decision based on game state
   * @param {Object} gameState - Current game state information
   * @returns {Promise<Object>} AI decision object
   */
  async getAIDecision(gameState) {
    // Throttle requests to avoid API spam
    const now = Date.now();
    if (now - this.lastRequestTime < this.minRequestInterval) {
      return this.getLastDecision();
    }

    const cacheKey = this.generateCacheKey(gameState);
    
    // Check cache for recent similar states
    if (this.requestCache.has(cacheKey)) {
      const cachedResult = this.requestCache.get(cacheKey);
      if (now - cachedResult.timestamp < 500) { // Use cache for 500ms
        return cachedResult.decision;
      }
    }

    try {
      this.lastRequestTime = now;
      const decision = await this.makeAPIRequest(gameState);
      
      // Cache the result
      this.requestCache.set(cacheKey, {
        decision,
        timestamp: now
      });

      // Clean old cache entries
      this.cleanCache();
      
      return decision;
    } catch (error) {
      console.error('Gemini API Error:', error);
      return this.getDefaultDecision(gameState);
    }
  }

  /**
   * Make actual API request to Gemini
   * @param {Object} gameState - Current game state
   * @returns {Promise<Object>} Parsed AI decision
   */
  async makeAPIRequest(gameState) {
    const prompt = this.buildPrompt(gameState);
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 100,
      }
    };

    const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid API response format');
    }

    const aiResponse = data.candidates[0].content.parts[0].text;
    return this.parseAIResponse(aiResponse, gameState);
  }

  /**
   * Build prompt for Gemini API based on game state
   * @param {Object} gameState - Current game state
   * @returns {string} Formatted prompt
   */
  buildPrompt(gameState) {
    const {
      distance,
      myHealth,
      opponentHealth,
      myState,
      opponentState,
      myPosition,
      opponentPosition,
      isOpponentAttacking,
      canAttack,
      stage
    } = gameState;

    return `You are controlling a fighter in a 2D fighting game. Analyze the situation and choose the best action.

CURRENT SITUATION:
- Distance to opponent: ${distance} pixels (close: <50, medium: 50-100, far: >100)
- My health: ${myHealth}/144 HP (${Math.round((myHealth/144)*100)}%)
- Opponent health: ${opponentHealth}/144 HP (${Math.round((opponentHealth/144)*100)}%)
- My current state: ${myState}
- Opponent state: ${opponentState}
- My position: x=${myPosition.x}, y=${myPosition.y}
- Opponent position: x=${opponentPosition.x}, y=${opponentPosition.y}
- Opponent is attacking: ${isOpponentAttacking}
- I can attack: ${canAttack}

AVAILABLE ACTIONS:
- MOVE: "walk_forward", "walk_backward", "jump_forward", "jump_backward", "jump_up"
- ATTACK: "light_punch", "medium_punch", "heavy_punch", "light_kick", "medium_kick", "heavy_kick"
- DEFENSE: "crouch", "block", "idle"

STRATEGY GUIDELINES:
- Close distance (<50px): Use quick attacks or defensive moves
- Medium distance (50-100px): Move closer or use medium attacks
- Far distance (>100px): Move closer or wait for opportunity
- Low health: Play more defensively
- Opponent attacking: Block, dodge, or counter-attack
- Opponent vulnerable: Press advantage with attacks

Respond with ONLY a JSON object in this exact format:
{"action": "action_name", "priority": "high/medium/low", "reasoning": "brief explanation"}

Example: {"action": "light_punch", "priority": "high", "reasoning": "close range, opponent vulnerable"}`;
  }

  /**
   * Parse AI response from Gemini
   * @param {string} response - Raw AI response
   * @param {Object} gameState - Original game state for fallback
   * @returns {Object} Parsed decision object
   */
  parseAIResponse(response, gameState) {
    try {
      // Extract JSON from response (handle potential markdown formatting)
      const jsonMatch = response.match(/\{[^{}]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!parsed.action || !parsed.priority) {
        throw new Error('Missing required fields in AI response');
      }

      // Validate action is legal
      const validActions = [
        'walk_forward', 'walk_backward', 'jump_forward', 'jump_backward', 'jump_up',
        'light_punch', 'medium_punch', 'heavy_punch', 'light_kick', 'medium_kick', 'heavy_kick',
        'crouch', 'block', 'idle'
      ];

      if (!validActions.includes(parsed.action)) {
        throw new Error(`Invalid action: ${parsed.action}`);
      }

      return {
        action: parsed.action,
        priority: parsed.priority,
        reasoning: parsed.reasoning || 'No reasoning provided',
        confidence: this.calculateConfidence(parsed, gameState)
      };

    } catch (error) {
      console.warn('Failed to parse AI response:', error, response);
      return this.getDefaultDecision(gameState);
    }
  }

  /**
   * Calculate confidence score for AI decision
   * @param {Object} decision - Parsed AI decision
   * @param {Object} gameState - Current game state
   * @returns {number} Confidence score (0-1)
   */
  calculateConfidence(decision, gameState) {
    let confidence = 0.5; // Base confidence

    // Higher confidence for defensive moves when low health
    if (gameState.myHealth < 50 && ['block', 'crouch', 'walk_backward'].includes(decision.action)) {
      confidence += 0.2;
    }

    // Higher confidence for attacks when close and opponent vulnerable
    if (gameState.distance < 50 && !gameState.isOpponentAttacking && 
        decision.action.includes('punch') || decision.action.includes('kick')) {
      confidence += 0.3;
    }

    // Higher confidence for movement when far
    if (gameState.distance > 100 && decision.action.includes('walk_forward')) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Generate cache key for game state
   * @param {Object} gameState - Current game state
   * @returns {string} Cache key
   */
  generateCacheKey(gameState) {
    // Create a simplified key based on important state factors
    const distanceRange = gameState.distance < 50 ? 'close' : 
                         gameState.distance < 100 ? 'medium' : 'far';
    const healthRange = gameState.myHealth < 50 ? 'low' : 
                       gameState.myHealth < 100 ? 'medium' : 'high';
    
    return `${distanceRange}_${healthRange}_${gameState.myState}_${gameState.isOpponentAttacking}`;
  }

  /**
   * Get default decision when AI fails
   * @param {Object} gameState - Current game state
   * @returns {Object} Default decision
   */
  getDefaultDecision(gameState) {
    const { distance, myHealth, isOpponentAttacking } = gameState;

    // Simple rule-based fallback
    let action = 'idle';
    let priority = 'low';
    let reasoning = 'fallback decision';

    if (isOpponentAttacking && distance < 60) {
      action = 'block';
      priority = 'high';
      reasoning = 'defensive fallback';
    } else if (distance > 100) {
      action = 'walk_forward';
      priority = 'medium';
      reasoning = 'close distance fallback';
    } else if (distance < 50 && !isOpponentAttacking) {
      action = 'light_punch';
      priority = 'medium';
      reasoning = 'attack opportunity fallback';
    }

    return {
      action,
      priority,
      reasoning,
      confidence: 0.3 // Low confidence for fallback
    };
  }

  /**
   * Get the last cached decision
   * @returns {Object} Last decision or default
   */
  getLastDecision() {
    const entries = Array.from(this.requestCache.values());
    if (entries.length > 0) {
      const latest = entries.reduce((latest, entry) => 
        entry.timestamp > latest.timestamp ? entry : latest
      );
      return latest.decision;
    }

    return this.getDefaultDecision({
      distance: 100,
      myHealth: 144,
      opponentHealth: 144,
      myState: 'idle',
      opponentState: 'idle',
      isOpponentAttacking: false
    });
  }

  /**
   * Clean old cache entries
   */
  cleanCache() {
    const now = Date.now();
    const maxAge = 5000; // 5 seconds

    for (const [key, value] of this.requestCache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.requestCache.delete(key);
      }
    }
  }
}