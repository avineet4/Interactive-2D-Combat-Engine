/**
 * Gemini API Service for AI Fighter Decision Making
 * Analyzes game state and provides AI decisions for fighter control
 * Optimized for performance and cost efficiency
 */
export class GeminiService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    // Enhanced caching system
    this.requestCache = new Map();
    this.decisionHistory = new Map(); // Track decision patterns
    this.statePatterns = new Map(); // Track successful state-action patterns
    
    // Request throttling and batching
    this.lastRequestTime = 0;
    this.minRequestInterval = 200; // Increased from 100ms to 200ms
    this.maxRequestInterval = 2000; // Maximum 2 seconds between requests
    this.requestQueue = [];
    this.isProcessingQueue = false;
    
    // Performance monitoring
    this.requestCount = 0;
    this.cacheHitCount = 0;
    this.errorCount = 0;
    this.averageResponseTime = 0;
    this.lastPerformanceLog = 0;
    
    // Adaptive throttling
    this.consecutiveErrors = 0;
    this.maxConsecutiveErrors = 3;
    this.backoffMultiplier = 1;
    this.maxBackoffMultiplier = 4;
    
    // Cost optimization
    this.dailyRequestCount = 0;
    this.lastDailyReset = Date.now();
    this.maxDailyRequests = 1000; // Limit daily requests
    
    // Intelligent fallback system
    this.fallbackMode = false;
    this.fallbackThreshold = 0.8; // Use fallback if confidence < 80%
  }

  /**
   * Generate AI decision based on game state with optimizations
   * @param {Object} gameState - Current game state information
   * @returns {Promise<Object>} AI decision object
   */
  async getAIDecision(gameState) {
    const now = Date.now();
    
    // Reset daily counter if needed
    this.resetDailyCounter(now);
    
    // Check daily request limit
    if (this.dailyRequestCount >= this.maxDailyRequests) {
      console.warn('Daily API request limit reached, using fallback mode');
      return this.getIntelligentFallbackDecision(gameState);
    }
    
    // Check if in fallback mode due to errors
    if (this.fallbackMode) {
      return this.getIntelligentFallbackDecision(gameState);
    }
    
    // Enhanced caching with pattern recognition
    const cacheKey = this.generateEnhancedCacheKey(gameState);
    const cachedResult = this.getCachedDecision(cacheKey, now);
    if (cachedResult) {
      this.cacheHitCount++;
      return cachedResult;
    }
    
    // Check for similar state patterns
    const patternDecision = this.getPatternBasedDecision(gameState);
    if (patternDecision && patternDecision.confidence > this.fallbackThreshold) {
      this.cacheHitCount++;
      return patternDecision;
    }
    
    // Adaptive throttling based on error rate
    const adaptiveInterval = this.getAdaptiveRequestInterval();
    if (now - this.lastRequestTime < adaptiveInterval) {
      return this.getLastDecision() || this.getIntelligentFallbackDecision(gameState);
    }
    
    // Queue request for batching
    return this.processRequestWithBatching(gameState, now);
  }

  /**
   * Process request with intelligent batching
   * @param {Object} gameState - Current game state
   * @param {number} now - Current timestamp
   * @returns {Promise<Object>} AI decision
   */
  async processRequestWithBatching(gameState, now) {
    // Add to queue
    this.requestQueue.push({
      gameState,
      timestamp: now,
      resolve: null,
      reject: null
    });
    
    // Process queue if not already processing
    if (!this.isProcessingQueue) {
      return this.processRequestQueue();
    }
    
    // Wait for current processing to complete
    return new Promise((resolve, reject) => {
      const queueItem = this.requestQueue[this.requestQueue.length - 1];
      queueItem.resolve = resolve;
      queueItem.reject = reject;
    });
  }

  /**
   * Process queued requests with batching
   * @returns {Promise<Object>} AI decision
   */
  async processRequestQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    const startTime = performance.now();
    
    try {
      // Process the oldest request in queue
      const request = this.requestQueue.shift();
      const decision = await this.makeOptimizedAPIRequest(request.gameState);
      
      // Cache the result
      const cacheKey = this.generateEnhancedCacheKey(request.gameState);
      this.requestCache.set(cacheKey, {
        decision,
        timestamp: Date.now(),
        responseTime: performance.now() - startTime
      });
      
      // Update performance metrics
      this.updatePerformanceMetrics(performance.now() - startTime);
      
      // Resolve the request
      if (request.resolve) {
        request.resolve(decision);
      }
      
      // Process remaining requests with same decision if similar
      this.processSimilarRequests(decision);
      
    } catch (error) {
      this.handleRequestError(error);
      
      // Resolve with fallback
      const request = this.requestQueue.shift();
      if (request && request.resolve) {
        request.resolve(this.getIntelligentFallbackDecision(request.gameState));
      }
    } finally {
      this.isProcessingQueue = false;
      
      // Process remaining queue if any
      if (this.requestQueue.length > 0) {
        setTimeout(() => this.processRequestQueue(), 50);
      }
    }
  }

  /**
   * Process similar requests in queue with same decision
   * @param {Object} decision - AI decision to apply
   */
  processSimilarRequests(decision) {
    const processedIndices = [];
    
    for (let i = 0; i < this.requestQueue.length; i++) {
      const request = this.requestQueue[i];
      const similarity = this.calculateStateSimilarity(request.gameState, decision);
      
      if (similarity > 0.8) { // 80% similarity threshold
        if (request.resolve) {
          request.resolve(decision);
        }
        processedIndices.push(i);
      }
    }
    
    // Remove processed requests
    processedIndices.reverse().forEach(index => {
      this.requestQueue.splice(index, 1);
    });
  }

  /**
   * Make optimized API request with enhanced error handling
   * @param {Object} gameState - Current game state
   * @returns {Promise<Object>} Parsed AI decision
   */
  async makeOptimizedAPIRequest(gameState) {
    const startTime = performance.now();
    this.lastRequestTime = Date.now();
    this.requestCount++;
    this.dailyRequestCount++;
    
    try {
      const prompt = this.buildOptimizedPrompt(gameState);
      
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.6, // Reduced for more consistent decisions
          topK: 20, // Reduced for faster responses
          topP: 0.9, // Reduced for more focused responses
          maxOutputTokens: 80, // Reduced for faster responses
        }
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid API response format');
      }

      const aiResponse = data.candidates[0].content.parts[0].text;
      const decision = this.parseAIResponse(aiResponse, gameState);
      
      // Reset error tracking on success
      this.consecutiveErrors = 0;
      this.backoffMultiplier = Math.max(1, this.backoffMultiplier * 0.8);
      
      // Update pattern recognition
      this.updateStatePatterns(gameState, decision);
      
      return decision;
      
    } catch (error) {
      this.handleRequestError(error);
      throw error;
    }
  }

  /**
   * Handle request errors with intelligent fallback
   * @param {Error} error - Request error
   */
  handleRequestError(error) {
    this.errorCount++;
    this.consecutiveErrors++;
    
    console.error('Gemini API Error:', error.message);
    
    // Enable fallback mode if too many consecutive errors
    if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
      this.fallbackMode = true;
      console.warn('Too many consecutive errors, enabling fallback mode');
      
      // Reset fallback mode after some time
      setTimeout(() => {
        this.fallbackMode = false;
        this.consecutiveErrors = 0;
      }, 30000); // 30 seconds
    }
    
    // Increase backoff multiplier
    this.backoffMultiplier = Math.min(this.maxBackoffMultiplier, this.backoffMultiplier * 1.5);
  }

  /**
   * Get cached decision with enhanced logic
   * @param {string} cacheKey - Cache key
   * @param {number} now - Current timestamp
   * @returns {Object|null} Cached decision or null
   */
  getCachedDecision(cacheKey, now) {
    if (this.requestCache.has(cacheKey)) {
      const cached = this.requestCache.get(cacheKey);
      const age = now - cached.timestamp;
      
      // Dynamic cache duration based on decision confidence
      const maxAge = cached.decision.confidence > 0.8 ? 1000 : 500; // Higher confidence = longer cache
      
      if (age < maxAge) {
        return cached.decision;
      }
    }
    
    return null;
  }

  /**
   * Generate enhanced cache key with more state factors
   * @param {Object} gameState - Current game state
   * @returns {string} Enhanced cache key
   */
  generateEnhancedCacheKey(gameState) {
    const distanceRange = gameState.distance < 50 ? 'close' : 
                         gameState.distance < 100 ? 'medium' : 'far';
    const healthRange = gameState.myHealth < 50 ? 'low' : 
                       gameState.myHealth < 100 ? 'medium' : 'high';
    const opponentHealthRange = gameState.opponentHealth < 50 ? 'low' : 
                               gameState.opponentHealth < 100 ? 'medium' : 'high';
    const threatLevel = gameState.threatLevel || 'medium';
    
    return `${distanceRange}_${healthRange}_${opponentHealthRange}_${gameState.myState}_${gameState.isOpponentAttacking}_${threatLevel}`;
  }

  /**
   * Get pattern-based decision from historical data
   * @param {Object} gameState - Current game state
   * @returns {Object|null} Pattern-based decision
   */
  getPatternBasedDecision(gameState) {
    const patternKey = this.generatePatternKey(gameState);
    
    if (this.statePatterns.has(patternKey)) {
      const patterns = this.statePatterns.get(patternKey);
      const bestPattern = patterns.reduce((best, pattern) => 
        pattern.successRate > best.successRate ? pattern : best
      );
      
      if (bestPattern.successRate > 0.7) { // 70% success rate threshold
        return {
          action: bestPattern.action,
          priority: bestPattern.priority,
          reasoning: `pattern-based: ${bestPattern.successRate * 100}% success rate`,
          confidence: bestPattern.successRate
        };
      }
    }
    
    return null;
  }

  /**
   * Update state patterns with new decision data
   * @param {Object} gameState - Game state
   * @param {Object} decision - AI decision
   */
  updateStatePatterns(gameState, decision) {
    const patternKey = this.generatePatternKey(gameState);
    
    if (!this.statePatterns.has(patternKey)) {
      this.statePatterns.set(patternKey, []);
    }
    
    const patterns = this.statePatterns.get(patternKey);
    const existingPattern = patterns.find(p => p.action === decision.action);
    
    if (existingPattern) {
      existingPattern.count++;
      existingPattern.successRate = (existingPattern.successRate + decision.confidence) / 2;
    } else {
      patterns.push({
        action: decision.action,
        priority: decision.priority,
        count: 1,
        successRate: decision.confidence
      });
    }
    
    // Limit pattern storage
    if (patterns.length > 10) {
      patterns.sort((a, b) => b.successRate - a.successRate);
      patterns.splice(10);
    }
  }

  /**
   * Generate pattern key for state analysis
   * @param {Object} gameState - Game state
   * @returns {string} Pattern key
   */
  generatePatternKey(gameState) {
    const distanceCategory = gameState.distance < 50 ? 'close' : 
                           gameState.distance < 100 ? 'medium' : 'far';
    const healthCategory = gameState.myHealth < 50 ? 'low' : 
                         gameState.myHealth < 100 ? 'medium' : 'high';
    
    return `${distanceCategory}_${healthCategory}_${gameState.isOpponentAttacking}`;
  }

  /**
   * Calculate state similarity for batching
   * @param {Object} state1 - First game state
   * @param {Object} decision - Decision to compare against
   * @returns {number} Similarity score (0-1)
   */
  calculateStateSimilarity(state1, decision) {
    // Simple similarity calculation based on key factors
    let similarity = 0;
    let factors = 0;
    
    // Distance similarity
    const distanceDiff = Math.abs(state1.distance - decision.distance || 0);
    similarity += Math.max(0, 1 - distanceDiff / 100);
    factors++;
    
    // Health similarity
    const healthDiff = Math.abs(state1.myHealth - decision.myHealth || 0);
    similarity += Math.max(0, 1 - healthDiff / 144);
    factors++;
    
    // State similarity
    if (state1.myState === decision.myState) {
      similarity += 1;
    }
    factors++;
    
    return similarity / factors;
  }

  /**
   * Get adaptive request interval based on error rate
   * @returns {number} Adaptive interval in milliseconds
   */
  getAdaptiveRequestInterval() {
    const baseInterval = this.minRequestInterval;
    const errorMultiplier = 1 + (this.consecutiveErrors * 0.5);
    const backoffMultiplier = this.backoffMultiplier;
    
    return Math.min(
      this.maxRequestInterval,
      baseInterval * errorMultiplier * backoffMultiplier
    );
  }

  /**
   * Get intelligent fallback decision with enhanced logic
   * @param {Object} gameState - Current game state
   * @returns {Object} Intelligent fallback decision
   */
  getIntelligentFallbackDecision(gameState) {
    const { distance, myHealth, opponentHealth, isOpponentAttacking, threatLevel, relativePosition } = gameState;
    
    // Enhanced rule-based logic
    let action = 'idle';
    let priority = 'low';
    let reasoning = 'intelligent fallback';
    let confidence = 0.5;

    // Handle jumping over scenarios with high priority
    if (relativePosition && relativePosition.hasOpponentJumpedOver) {
      action = 'walk_backward';
      priority = 'high';
      reasoning = 'opponent jumped over, turn around immediately';
      confidence = 0.9;
    }
    // Handle direction change needed
    else if (relativePosition && relativePosition.needsToTurn) {
      action = 'walk_backward';
      priority = 'high';
      reasoning = 'opponent behind, turn around';
      confidence = 0.8;
    }
    // Handle opponent jumping
    else if (relativePosition && relativePosition.isOpponentJumping) {
      if (relativePosition.isOpponentAbove) {
        action = 'jump_up';
        priority = 'high';
        reasoning = 'opponent jumping over, counter jump';
        confidence = 0.7;
      } else {
        action = 'crouch';
        priority = 'medium';
        reasoning = 'opponent jumping, duck under';
        confidence = 0.6;
      }
    }
    // Defensive behavior when low health
    else if (myHealth < 50) {
      if (isOpponentAttacking && distance < 60) {
        action = 'block';
        priority = 'high';
        reasoning = 'defensive: low health, opponent attacking';
        confidence = 0.8;
      } else if (distance < 80) {
        action = 'walk_backward';
        priority = 'high';
        reasoning = 'defensive: low health, create distance';
        confidence = 0.7;
      }
    }
    // Aggressive behavior when opponent is low health
    else if (opponentHealth < 50) {
      if (distance > 100) {
        action = 'walk_forward';
        priority = 'high';
        reasoning = 'aggressive: opponent low health, close distance';
        confidence = 0.8;
      } else if (distance < 60 && !isOpponentAttacking) {
        action = 'medium_punch';
        priority = 'high';
        reasoning = 'aggressive: opponent low health, attack opportunity';
        confidence = 0.9;
      }
    }
    // Normal behavior
    else {
      if (distance > 120) {
        action = 'walk_forward';
        priority = 'medium';
        reasoning = 'normal: far distance, approach';
        confidence = 0.6;
      } else if (distance < 50 && !isOpponentAttacking) {
        action = 'light_punch';
        priority = 'medium';
        reasoning = 'normal: close range, attack opportunity';
        confidence = 0.7;
      } else if (isOpponentAttacking && distance < 70) {
        action = 'block';
        priority = 'high';
        reasoning = 'normal: opponent attacking, defend';
        confidence = 0.8;
      }
    }

    return {
      action,
      priority,
      reasoning,
      confidence
    };
  }

  /**
   * Build optimized prompt for faster responses
   * @param {Object} gameState - Current game state
   * @returns {string} Optimized prompt
   */
  buildOptimizedPrompt(gameState) {
    const {
      distance,
      myHealth,
      opponentHealth,
      myState,
      opponentState,
      isOpponentAttacking,
      canAttack,
      relativePosition
    } = gameState;

    // Enhanced prompt for jumping over scenarios
    let specialInstructions = '';
    
    if (relativePosition && relativePosition.hasOpponentJumpedOver) {
      specialInstructions = '\nSPECIAL: Opponent jumped over you! Turn around immediately!';
    } else if (relativePosition && relativePosition.needsToTurn) {
      specialInstructions = '\nSPECIAL: Opponent is behind you! Turn around!';
    } else if (relativePosition && relativePosition.isOpponentJumping) {
      specialInstructions = '\nSPECIAL: Opponent is jumping! Watch for cross-up!';
    }

    return `2D fighting game AI controller. Choose best action.

SITUATION: Distance=${distance}px, MyHP=${myHealth}/144, OppHP=${opponentHealth}/144, MyState=${myState}, OppState=${opponentState}, OppAttacking=${isOpponentAttacking}, CanAttack=${canAttack}${specialInstructions}

POSITION: Opponent is ${relativePosition?.horizontal || 'unknown'} and ${relativePosition?.vertical || 'unknown'}. Turn needed: ${relativePosition?.needsToTurn || false}

ACTIONS: walk_forward, walk_backward, jump_forward, jump_backward, jump_up, light_punch, medium_punch, heavy_punch, light_kick, medium_kick, heavy_kick, crouch, block, idle

STRATEGY: Close(<50px)=attack/defend, Medium(50-100px)=move/attack, Far(>100px)=approach, LowHP=defensive, OppAttacking=block/counter, JumpOver=turn_around

Respond with JSON only: {"action": "action_name", "priority": "high/medium/low", "reasoning": "brief explanation"}`;
  }

  /**
   * Update performance metrics
   * @param {number} responseTime - Response time in milliseconds
   */
  updatePerformanceMetrics(responseTime) {
    this.averageResponseTime = (this.averageResponseTime + responseTime) / 2;
    
    // Log performance every 100 requests
    if (this.requestCount % 100 === 0) {
      this.logPerformanceMetrics();
    }
  }

  /**
   * Log performance metrics
   */
  logPerformanceMetrics() {
    const cacheHitRate = this.requestCount > 0 ? (this.cacheHitCount / this.requestCount) * 100 : 0;
    const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;
    
    console.log(`AI Performance Metrics:
      Requests: ${this.requestCount}
      Cache Hit Rate: ${cacheHitRate.toFixed(1)}%
      Error Rate: ${errorRate.toFixed(1)}%
      Avg Response Time: ${this.averageResponseTime.toFixed(0)}ms
      Daily Requests: ${this.dailyRequestCount}/${this.maxDailyRequests}
      Fallback Mode: ${this.fallbackMode}`);
  }

  /**
   * Reset daily request counter
   * @param {number} now - Current timestamp
   */
  resetDailyCounter(now) {
    const dayStart = new Date(now).setHours(0, 0, 0, 0);
    if (now - this.lastDailyReset > 86400000) { // 24 hours
      this.dailyRequestCount = 0;
      this.lastDailyReset = dayStart;
    }
  }

  /**
   * Get performance statistics
   * @returns {Object} Performance statistics
   */
  getPerformanceStats() {
    return {
      requestCount: this.requestCount,
      cacheHitCount: this.cacheHitCount,
      errorCount: this.errorCount,
      cacheHitRate: this.requestCount > 0 ? (this.cacheHitCount / this.requestCount) * 100 : 0,
      errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0,
      averageResponseTime: this.averageResponseTime,
      dailyRequestCount: this.dailyRequestCount,
      fallbackMode: this.fallbackMode,
      consecutiveErrors: this.consecutiveErrors,
      backoffMultiplier: this.backoffMultiplier
    };
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
      return this.getIntelligentFallbackDecision(gameState);
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

    return this.getIntelligentFallbackDecision({
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
    const maxAge = 10000; // Increased to 10 seconds

    for (const [key, value] of this.requestCache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.requestCache.delete(key);
      }
    }
  }

  /**
   * Get default decision when AI fails (legacy method)
   * @param {Object} gameState - Current game state
   * @returns {Object} Default decision
   */
  getDefaultDecision(gameState) {
    return this.getIntelligentFallbackDecision(gameState);
  }

  /**
   * Generate cache key for game state (legacy method)
   * @param {Object} gameState - Current game state
   * @returns {string} Cache key
   */
  generateCacheKey(gameState) {
    return this.generateEnhancedCacheKey(gameState);
  }

  /**
   * Build prompt for Gemini API based on game state (legacy method)
   * @param {Object} gameState - Current game state
   * @returns {string} Formatted prompt
   */
  buildPrompt(gameState) {
    return this.buildOptimizedPrompt(gameState);
  }

  /**
   * Make actual API request to Gemini (legacy method)
   * @param {Object} gameState - Current game state
   * @returns {Promise<Object>} Parsed AI decision
   */
  async makeAPIRequest(gameState) {
    return this.makeOptimizedAPIRequest(gameState);
  }
}