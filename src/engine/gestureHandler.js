import { Control, controls } from '../constants/control.js';

class GestureHandler {
    constructor() {
        this.video = null;
        this.gestureStates = new Map();
        this.isInitialized = false;
        this.previousLandmarks = null;
        this.lastGestureTime = 0;
        this.lastJumpTime = 0;
        this.gestureDelay = 100; // Minimum time between gestures in ms
        this.jumpCooldown = 500; // Longer cooldown for jump actions
    }

    async initialize() {
        if (this.isInitialized) return;

        // Setup webcam
        this.video = document.createElement('video');
        this.video.setAttribute('playsinline', '');
        this.video.style.position = 'absolute';
        this.video.style.top = '10px';
        this.video.style.left = '10px';
        this.video.style.width = '160px';
        this.video.style.height = '120px';
        this.video.style.transform = 'scaleX(-1)';
        document.body.appendChild(this.video);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480
                }
            });
            this.video.srcObject = stream;
            this.video.play();

            // Initialize MediaPipe Hands
            const hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            hands.onResults(this.onResults.bind(this));

            // Start camera processing
            const camera = new Camera(this.video, {
                onFrame: async () => {
                    await hands.send({ image: this.video });
                },
                width: 640,
                height: 480
            });
            camera.start();

            this.isInitialized = true;
        } catch (error) {
            console.error('Error initializing gesture handler:', error);
        }
    }

    onResults(results) {
        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            this.resetGestureStates();
            return;
        }

        const landmarks = results.multiHandLandmarks[0];
        this.detectGestures(landmarks);
    }

    detectGestures(landmarks) {
        // Reset all gesture states
        this.resetGestureStates();

        const currentTime = Date.now();
        if (currentTime - this.lastGestureTime < this.gestureDelay) {
            return;
        }

        // Get hand position
        const palmBase = landmarks[0];
        const indexFingerTip = landmarks[8];

        // Movement controls based on hand position
        if (palmBase.y < 0.3) { // Jump
            const timeSinceLastJump = currentTime - this.lastJumpTime;
            if (timeSinceLastJump >= this.jumpCooldown) {
                this.gestureStates.set(Control.UP, true);
                this.lastJumpTime = currentTime;
            }
        } else if (palmBase.y > 0.7) { // Crouch
            this.gestureStates.set(Control.DOWN, true);
        }

        if (palmBase.x < 0.3) { // Move left
            this.gestureStates.set(Control.LEFT, true);
        } else if (palmBase.x > 0.7) { // Move right
            this.gestureStates.set(Control.RIGHT, true);
        }

        // Count extended fingers for attacks
        const extendedFingers = this.countExtendedFingers(landmarks);
        
        // Update last gesture time for any active gesture
        if (extendedFingers > 0 || this.gestureStates.size > 0) {
            this.lastGestureTime = currentTime;
        }

        // Attack moves based on number of extended fingers
        switch(extendedFingers) {
            case 1: // One finger for medium punch
                this.gestureStates.set(Control.MEDIUM_PUNCH, true);
                this.lastGestureTime = currentTime;
                break;
            case 2: // Two fingers for heavy punch
                this.gestureStates.set(Control.HEAVY_PUNCH, true);
                this.lastGestureTime = currentTime;
                break;
            case 3: // Three fingers for medium kick
                this.gestureStates.set(Control.MEDIUM_KICK, true);
                this.lastGestureTime = currentTime;
                break;
            case 4: // Four fingers for heavy kick
                this.gestureStates.set(Control.HEAVY_KICK, true);
                this.lastGestureTime = currentTime;
                break;
        }
    }

    countExtendedFingers(landmarks) {
        const fingerTips = [8, 12, 16, 20]; // Index, middle, ring, pinky tip indices
        const fingerMcp = [5, 9, 13, 17]; // Metacarpophalangeal (knuckle) joints
        
        let extendedCount = 0;
        for (let i = 0; i < fingerTips.length; i++) {
            const tip = landmarks[fingerTips[i]];
            const mcp = landmarks[fingerMcp[i]];
            
            // Check if finger is extended (tip is higher than base)
            if (tip.y < mcp.y - 0.1) { // Added threshold to require more extension
                extendedCount++;
            }
        }
        return extendedCount;
    }





    calculateHandVelocity(landmarks) {
        const palmBase = landmarks[0];
        const prevPalmBase = this.previousLandmarks ? this.previousLandmarks[0] : palmBase;
        const velocityX = palmBase.x - prevPalmBase.x;
        this.previousLandmarks = landmarks;
        return velocityX;
    }

    resetGestureStates() {
        // Clear all states except for movement controls
        const movementControls = [Control.LEFT, Control.RIGHT, Control.UP, Control.DOWN];
        const currentStates = new Map();
        
        // Preserve movement states
        for (const control of movementControls) {
            if (this.gestureStates.has(control)) {
                currentStates.set(control, this.gestureStates.get(control));
            }
        }
        
        this.gestureStates = currentStates;
    }

    isGestureActive(control) {
        return this.gestureStates.get(control) || false;
    }
}

export const gestureHandler = new GestureHandler();
