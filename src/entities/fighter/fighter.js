import * as Control from "../../engine/inputHandler.js";
import {
  boxOverlap,
  getAcutalBoxDimensions,
  rectsOverlap,
} from "../../utils/collision.js";

import {
  FighterDirection,
  FighterState,
  FrameDelay,
  PushFriction,
  FighterAttackType,
  FighterAttackStrength,
  FighterAttackBaseData,
  Fighter_Hurt_Box,
  FighterHurtStates,
  Fighter_Hurt_Delay,
} from "../../constants/fighter.js";
import { STAGE_FLOOR } from "../../constants/stage.js";
import { FRAME_TIME } from "../../constants/game.js";
import { gameState } from "../../states/gameState.js";
import { playSound, stopSound } from "../../engine/soundHandler.js";

export class Fighter {
  soundAttacks = {
    [FighterAttackStrength.LIGHT]: document.querySelector(
      "audio#sound-fighter-light-attack"
    ),
    [FighterAttackStrength.MEDIUM]: document.querySelector(
      "audio#sound-fighter-medium-attack"
    ),
    [FighterAttackStrength.HEAVY]: document.querySelector(
      "audio#sound-fighter-heavy-attack"
    ),
  };
  soundHits = {
    [FighterAttackStrength.LIGHT]: {
      [FighterAttackType.PUNCH]: document.querySelector(
        "audio#sound-fighter-light-punch-hit"
      ),
      [FighterAttackType.KICK]: document.querySelector(
        "audio#sound-fighter-light-kick-hit"
      ),
    },
    [FighterAttackStrength.MEDIUM]: {
      [FighterAttackType.PUNCH]: document.querySelector(
        "audio#sound-fighter-medium-punch-hit"
      ),
      [FighterAttackType.KICK]: document.querySelector(
        "audio#sound-fighter-medium-kick-hit"
      ),
    },
    [FighterAttackStrength.HEAVY]: {
      [FighterAttackType.PUNCH]: document.querySelector(
        "audio#sound-fighter-heavy-punch-hit"
      ),
      [FighterAttackType.KICK]: document.querySelector(
        "audio#sound-fighter-heavy-kick-hit"
      ),
    },
  };

  soundLand = document.querySelector("audio#sound-fighter-land");
  constructor(x, y, direction, playerId, onAttackHit) {
    this.playerId = playerId;
    this.image = new Image();
    this.frames = new Map(); //! array is not used because then each frame index will be diffcult to store
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.initialvelocity = {};
    this.gravity = 0;
    this.attackStruck = false;
    this.animationFrame = 0; //! provides animation to fighter (array)
    this.animationTimer = 0;
    this.controlsEnabled = true; // Flag to enable/disable controls

    this.hurtShake = 0;
    this.hurtShakeTimer = 0;
    this.slideVelocity = 0;
    this.slideFriction = 0;

    this.animations = {};
    this.direction = direction;
    this.victory = false;
    this.opponent;
    this.onAttackHit = onAttackHit;

    this.boxes = {
      push: { x: 0, y: 0, width: 0, height: 0 },
      hurt: {
        [Fighter_Hurt_Box.HEAD]: [0, 0, 0, 0],
        [Fighter_Hurt_Box.BODY]: [0, 0, 0, 0],
        [Fighter_Hurt_Box.FEET]: [0, 0, 0, 0],
      },
      hit: { x: 0, y: 0, width: 0, height: 0 },
    };

    this.states = {
      [FighterState.IDLE]: {
        init: this.handleIdleInit.bind(this),
        update: this.handleIdleState.bind(this),
        validFrom: [
          undefined,
          FighterState.IDLE,
          FighterState.WALK_FORWARDS,
          FighterState.WALK_BACKWARDS,
          FighterState.JUMP_UP,
          FighterState.JUMP_FORWARDS,
          FighterState.JUMP_BACKWARDS,
          FighterState.CROUCH_UP,
          FighterState.JUMP_LAND,
          FighterState.IDLE_TURN,
          FighterState.LIGHT_PUNCH,
          FighterState.MEDIUM_PUNCH,
          FighterState.HEAVY_PUNCH,
          FighterState.LIGHT_KICK,
          FighterState.MEDIUM_KICK,
          FighterState.HEAVY_KICK,
          FighterState.HURT_HEAD_LIGHT,
          FighterState.HURT_HEAD_MEDIUM,
          FighterState.HURT_HEAD_HEAVY,
          FighterState.HURT_BODY_LIGHT,
          FighterState.HURT_BODY_MEDIUM,
          FighterState.HURT_BODY_HEAVY,
        ],
        shadow: [1.2, 1.2, 0, 0],
      },
      [FighterState.WALK_FORWARDS]: {
        init: this.handleMoveInit.bind(this),
        update: this.handleWalkForwardState.bind(this),
        validFrom: [FighterState.IDLE, FighterState.WALK_BACKWARDS],
      },
      [FighterState.WALK_BACKWARDS]: {
        init: this.handleMoveInit.bind(this),
        update: this.handleWalkBackwardState.bind(this),
        validFrom: [FighterState.IDLE, FighterState.WALK_FORWARDS],
      },

      [FighterState.JUMP_START]: {
        init: this.handleJumpStartInit.bind(this),
        update: this.handleJumpStartState.bind(this),
        validFrom: [
          FighterState.IDLE,
          FighterState.WALK_FORWARDS,
          FighterState.WALK_BACKWARDS,
          FighterState.JUMP_LAND,
        ],
      },
      [FighterState.JUMP_UP]: {
        init: this.handleJumpInit.bind(this),
        update: this.handleJumpState.bind(this),
        validFrom: [FighterState.JUMP_START],
      },
      [FighterState.JUMP_FORWARDS]: {
        init: this.handleJumpInit.bind(this),
        update: this.handleJumpState.bind(this),
        validFrom: [FighterState.JUMP_START],
      },
      [FighterState.JUMP_BACKWARDS]: {
        init: this.handleJumpInit.bind(this),
        update: this.handleJumpState.bind(this),
        validFrom: [FighterState.JUMP_START],
      },
      [FighterState.JUMP_LAND]: {
        init: this.handleJumpLandInit.bind(this),
        update: this.handleJumpLandState.bind(this),
        validFrom: [
          FighterState.JUMP_UP,
          FighterState.JUMP_FORWARDS,
          FighterState.JUMP_BACKWARDS,
        ],
      },
      [FighterState.CROUCH]: {
        init: () => {},
        update: this.handleCrouchState.bind(this),
        validFrom: [FighterState.CROUCH_DOWN, FighterState.CROUCH_TURN],
      },
      [FighterState.CROUCH_DOWN]: {
        init: this.handleCrouchDownInit.bind(this),
        update: this.handleCrouchDownState.bind(this),
        validFrom: [
          FighterState.IDLE,
          FighterState.WALK_FORWARDS,
          FighterState.WALK_BACKWARDS,
        ],
      },
      [FighterState.CROUCH_UP]: {
        init: () => {},
        update: this.handleCrouchUpState.bind(this),
        validFrom: [FighterState.CROUCH],
      },
      [FighterState.IDLE_TURN]: {
        init: () => {},
        update: this.handleIdleTurnState.bind(this),
        validFrom: [
          FighterState.IDLE,
          FighterState.JUMP_LAND,
          FighterState.WALK_FORWARDS,
          FighterState.WALK_BACKWARDS,
        ],
      },
      [FighterState.CROUCH_TURN]: {
        init: () => {},
        update: this.handleCrouchTurnState.bind(this),
        validFrom: [FighterState.CROUCH],
      },
      [FighterState.LIGHT_PUNCH]: {
        attackType: FighterAttackType.PUNCH,
        attackStrength: FighterAttackStrength.LIGHT,
        init: this.handleAttackInit.bind(this),
        update: this.handleLightPunchState.bind(this),
        validFrom: [
          FighterState.IDLE,
          FighterState.WALK_FORWARDS,
          FighterState.WALK_BACKWARDS,
        ],
      },
      [FighterState.MEDIUM_PUNCH]: {
        attackType: FighterAttackType.PUNCH,
        attackStrength: FighterAttackStrength.MEDIUM,
        init: this.handleAttackInit.bind(this),
        update: this.handleMediumPunchState.bind(this),
        validFrom: [
          FighterState.IDLE,
          FighterState.WALK_FORWARDS,
          FighterState.WALK_BACKWARDS,
        ],
      },

      [FighterState.HEAVY_PUNCH]: {
        attackType: FighterAttackType.PUNCH,
        attackStrength: FighterAttackStrength.HEAVY,
        init: this.handleAttackInit.bind(this),
        update: this.handleMediumPunchState.bind(this),
        validFrom: [
          FighterState.IDLE,
          FighterState.WALK_FORWARDS,
          FighterState.WALK_BACKWARDS,
        ],
      },
      [FighterState.LIGHT_KICK]: {
        attackType: FighterAttackType.KICK,
        attackStrength: FighterAttackStrength.LIGHT,
        init: this.handleAttackInit.bind(this),
        update: this.handleLightKickState.bind(this),
        validFrom: [
          FighterState.IDLE,
          FighterState.WALK_FORWARDS,
          FighterState.WALK_BACKWARDS,
        ],
      },
      [FighterState.MEDIUM_KICK]: {
        attackType: FighterAttackType.KICK,
        attackStrength: FighterAttackStrength.MEDIUM,
        init: this.handleAttackInit.bind(this),
        update: this.handleMediumKickState.bind(this),
        validFrom: [
          FighterState.IDLE,
          FighterState.WALK_FORWARDS,
          FighterState.WALK_BACKWARDS,
        ],
      },

      [FighterState.HEAVY_KICK]: {
        attackType: FighterAttackType.KICK,
        attackStrength: FighterAttackStrength.HEAVY,
        init: this.handleAttackInit.bind(this),
        update: this.handleMediumKickState.bind(this),
        validFrom: [
          FighterState.IDLE,
          FighterState.WALK_FORWARDS,
          FighterState.WALK_BACKWARDS,
        ],
      },
      [FighterState.HURT_HEAD_LIGHT]: {
        init: this.handleHurtInit.bind(this),
        update: this.handleHurtState.bind(this),
        validFrom: FighterHurtStates,
      },
      [FighterState.HURT_HEAD_MEDIUM]: {
        init: this.handleHurtInit.bind(this),
        update: this.handleHurtState.bind(this),
        validFrom: FighterHurtStates,
      },
      [FighterState.HURT_HEAD_HEAVY]: {
        init: this.handleHurtInit.bind(this),
        update: this.handleHurtState.bind(this),
        validFrom: FighterHurtStates,
      },
      [FighterState.HURT_BODY_LIGHT]: {
        init: this.handleHurtInit.bind(this),
        update: this.handleHurtState.bind(this),
        validFrom: FighterHurtStates,
      },
      [FighterState.HURT_BODY_MEDIUM]: {
        init: this.handleHurtInit.bind(this),
        update: this.handleHurtState.bind(this),
        validFrom: FighterHurtStates,
      },
      [FighterState.HURT_BODY_HEAVY]: {
        init: this.handleHurtInit.bind(this),
        update: this.handleHurtState.bind(this),
        validFrom: FighterHurtStates,
      },

      [FighterState.KO]: {
        init: this.handleKoInit.bind(this),
        update: this.handleFallBack.bind(this),
        validFrom: [
          FighterState.IDLE,
          FighterState.WALK_FORWARDS,
          FighterState.WALK_BACKWARDS,
          FighterState.JUMP_UP,
          FighterState.JUMP_FORWARDS,
          FighterState.JUMP_BACKWARDS,
          FighterState.CROUCH,
          FighterState.CROUCH_DOWN,
          FighterState.CROUCH_UP,
          FighterState.HURT_BODY_LIGHT,
          FighterState.HURT_BODY_MEDIUM,
          FighterState.HURT_BODY_HEAVY,
          FighterState.HURT_HEAD_LIGHT,
          FighterState.HURT_HEAD_MEDIUM,
          FighterState.HURT_HEAD_HEAVY,
        ],
        shadow: [2.4, 1, 0, 0],
      },
      [FighterState.VICTORY]: {
        init: () => {},
        update: () => {},
        validFrom: [FighterState.IDLE],
      },
    };
    this.changeState(FighterState.IDLE);
  }
  isAnimationCompleted = () =>
    this.animations[this.CurrentState][this.animationFrame][1] ===
    FrameDelay.TRANSITION;

  hasCollideWithOpponent = () =>
    rectsOverlap(
      this.position.x + this.boxes.push.x,
      this.position.y + this.boxes.push.y,
      this.boxes.push.width,
      this.boxes.push.height,
      this.opponent.position.x + this.opponent.boxes.push.x,
      this.opponent.position.y + this.opponent.boxes.push.y,
      this.opponent.boxes.push.width,
      this.opponent.boxes.push.height
    );

  resetVelocities() {
    this.velocity.x = 0;
    this.velocity.y = 0;
  }

  getDirection() {
    if (
      this.position.x + this.boxes.push.x + this.boxes.push.width <=
      this.opponent.position.x + this.opponent.boxes.push.x
    ) {
      return FighterDirection.Right;
    } else if (
      this.position.x + this.boxes.push.x >=
      this.opponent.position.x +
        this.opponent.boxes.push.x +
        this.opponent.boxes.push.width
    ) {
      return FighterDirection.Left;
    }
    return this.direction;
  }

  getBoxes(frameKey) {
    const [
      ,
      [pushX = 0, pushY = 0, pushWidth = 0, pushHeight = 0] = [],
      [head = [0, 0, 0, 0], body = [0, 0, 0, 0], feet = [0, 0, 0, 0]] = [],
      [hitX = 0, hitY = 0, hitWidth = 0, hitHeight = 0] = [],
    ] = this.frames.get(frameKey);

    return {
      push: { x: pushX, y: pushY, width: pushWidth, height: pushHeight },
      hurt: {
        [Fighter_Hurt_Box.HEAD]: head,
        [Fighter_Hurt_Box.BODY]: body,
        [Fighter_Hurt_Box.FEET]: feet,
      },
      hit: { x: hitX, y: hitY, width: hitWidth, height: hitHeight },
    };
  }

  getHitState(attackStrength, hitLocation) {
    switch (attackStrength) {
      case FighterAttackStrength.LIGHT:
        if (hitLocation === Fighter_Hurt_Box.HEAD)
          return FighterState.HURT_HEAD_LIGHT;
        return FighterState.HURT_BODY_LIGHT;
      case FighterAttackStrength.MEDIUM:
        if (hitLocation === Fighter_Hurt_Box.HEAD)
          return FighterState.HURT_HEAD_MEDIUM;
        return FighterState.HURT_BODY_MEDIUM;
      case FighterAttackStrength.HEAVY:
        if (hitLocation === Fighter_Hurt_Box.HEAD)
          return FighterState.HURT_HEAD_HEAVY;
        return FighterState.HURT_BODY_HEAVY;
    }
  }

  changeState(newState) {
    if (
      newState === this.CurrentState ||
      !this.states[newState].validFrom.includes(this.CurrentState)
    )
      return;
    this.CurrentState = newState;
    this.animationFrame = 0;
    this.states[this.CurrentState].init();
  }
  //! This function defines as animation will be in which state

  handleIdleInit() {
    this.resetVelocities();
    this.attackStruck = false;
  }
  handleMoveInit() {
    this.velocity.x = this.initialvelocity.x[this.CurrentState] ?? 0;
  }
  handleJumpInit() {
    this.velocity.y = this.initialvelocity.jump;
    this.handleMoveInit();
  }
  handleJumpStartInit() {
    this.resetVelocities();
  }
  handleJumpLandInit() {
    this.resetVelocities();
    this.soundLand.play();
  }
  handleCrouchDownInit() {
    this.resetVelocities();
  }

  handleAttackInit() {
    this.resetVelocities();
    this.attackStruck = false; // Reset this when attack starts
    playSound(this.soundAttacks[this.states[this.CurrentState].attackStrength]);
  }

  handleHurtInit() {
    this.handleIdleInit();
    this.hurtShake = 2;
    this.hurtShakeTimer = performance.now();
  }
  handleKoInit() {
    this.handleIdleInit();
  }
  handleIdleState() {
    // If controls are disabled, don't respond to inputs
    if (!this.controlsEnabled) return;

    if (this.victory) {
      this.changeState(FighterState.VICTORY);
      return;
    }
    if (Control.isBackward(this.playerId, this.direction)) {
      this.changeState(FighterState.WALK_BACKWARDS);
    } else if (Control.isForward(this.playerId, this.direction)) {
      this.changeState(FighterState.WALK_FORWARDS);
    } else if (Control.isup(this.playerId)) {
      this.changeState(FighterState.JUMP_START);
    } else if (Control.isdown(this.playerId)) {
      this.changeState(FighterState.CROUCH_DOWN);
    } else if (Control.isLightPunch(this.playerId)) {
      this.changeState(FighterState.LIGHT_PUNCH);
    } else if (Control.isMediumPunch(this.playerId)) {
      this.changeState(FighterState.MEDIUM_PUNCH);
    } else if (Control.isHeavyPunch(this.playerId)) {
      this.changeState(FighterState.HEAVY_PUNCH);
    } else if (Control.isLightKick(this.playerId)) {
      this.changeState(FighterState.LIGHT_KICK);
    } else if (Control.isMediumKick(this.playerId)) {
      this.changeState(FighterState.MEDIUM_KICK);
    } else if (Control.isHeavyKick(this.playerId)) {
      this.changeState(FighterState.HEAVY_KICK);
    }

    // Only check direction if controls are enabled
    if (this.controlsEnabled) {
      const newDirection = this.getDirection();

      if (newDirection !== this.direction) {
        this.direction = newDirection;
        this.changeState(FighterState.IDLE_TURN);
      }
    }
  }

  handleWalkForwardState() {
    if (!Control.isForward(this.playerId, this.direction)) {
      this.changeState(FighterState.IDLE);
    } else if (Control.isup(this.playerId))
      this.changeState(FighterState.JUMP_START);
    else if (Control.isLightPunch(this.playerId)) {
      this.changeState(FighterState.LIGHT_PUNCH);
    } else if (Control.isMediumPunch(this.playerId)) {
      this.changeState(FighterState.MEDIUM_PUNCH);
    } else if (Control.isHeavyPunch(this.playerId)) {
      this.changeState(FighterState.HEAVY_PUNCH);
    } else if (Control.isLightKick(this.playerId)) {
      this.changeState(FighterState.LIGHT_KICK);
    } else if (Control.isMediumKick(this.playerId)) {
      this.changeState(FighterState.MEDIUM_KICK);
    } else if (Control.isHeavyKick(this.playerId)) {
      this.changeState(FighterState.HEAVY_KICK);
    }
    {
      this.direction = this.getDirection();
    }
  }

  handleWalkBackwardState() {
    if (!Control.isBackward(this.playerId, this.direction)) {
      this.changeState(FighterState.IDLE);
    } else if (Control.isup(this.playerId))
      this.changeState(FighterState.JUMP_START);
    else if (Control.isLightPunch(this.playerId)) {
      this.changeState(FighterState.LIGHT_PUNCH);
    } else if (Control.isMediumPunch(this.playerId)) {
      this.changeState(FighterState.MEDIUM_PUNCH);
    } else if (Control.isHeavyPunch(this.playerId)) {
      this.changeState(FighterState.HEAVY_PUNCH);
    } else if (Control.isLightKick(this.playerId)) {
      this.changeState(FighterState.LIGHT_KICK);
    } else if (Control.isMediumKick(this.playerId)) {
      this.changeState(FighterState.MEDIUM_KICK);
    } else if (Control.isHeavyKick(this.playerId)) {
      this.changeState(FighterState.HEAVY_KICK);
    }
    {
      this.direction = this.getDirection();
    }
  }

  handleCrouchState() {
    if (!Control.isdown(this.playerId))
      this.changeState(FighterState.CROUCH_UP);

    const newDirection = this.getDirection();

    if (newDirection !== this.direction) {
      this.direction = newDirection;
      this.changeState(FighterState.IDLE_TURN);
    }
  }
  handleCrouchDownState() {
    if (this.isAnimationCompleted()) {
      this.changeState(FighterState.CROUCH);
    } else if (!Control.isdown(this.playerId)) {
      this.CurrentState = FighterState.CROUCH_UP;
    }
  }
  handleCrouchUpState() {
    if (this.isAnimationCompleted()) {
      this.changeState(FighterState.IDLE);
    }
  }

  handleJumpStartState() {
    if (this.isAnimationCompleted()) {
      if (Control.isBackward(this.playerId, this.direction)) {
        this.changeState(FighterState.JUMP_BACKWARDS);
      } else if (Control.isForward(this.playerId, this.direction)) {
        this.changeState(FighterState.JUMP_FORWARDS);
      } else {
        this.changeState(FighterState.JUMP_UP);
      }
    }
  }
  handleJumpState(time) {
    this.velocity.y += this.gravity * time.secondsPassed;
    if (this.position.y > STAGE_FLOOR) {
      this.position.y = STAGE_FLOOR;
      this.changeState(FighterState.JUMP_LAND);
    }
  }
  handleJumpLandState() {
    if (this.animationFrame < 1) return;

    let newState = FighterState.IDLE;

    if (!Control.isIdle(this.playerId)) {
      this.direction = this.getDirection();

      this.handleIdleState();
    } else {
      const newDirection = this.getDirection();

      if (newDirection !== this.direction) {
        this.direction = newDirection;
        newState = FighterState.IDLE_TURN;
      } else {
        if (!this.isAnimationCompleted()) return;
      }
    }

    this.changeState(newState);
  }
  handleIdleTurnState() {
    this.handleIdleState();
    if (!this.isAnimationCompleted()) {
      this.changeState(FighterState.IDLE);
    }
  }
  handleCrouchTurnState() {
    // First check if the player is still pressing down
    if (!Control.isdown(this.playerId)) {
      this.changeState(FighterState.CROUCH_UP);
      return;
    }

    // Then check if the animation is complete
    if (this.isAnimationCompleted()) {
      this.changeState(FighterState.CROUCH);
    }

    // Check for direction change
    const newDirection = this.getDirection();
    if (newDirection !== this.direction) {
      this.direction = newDirection;
    }
  }
  handleLightAttackReset() {
    this.animationFrame = 0;
    this.handleAttackInit();
    this.attackStruck = false;
  }
  handleLightPunchState() {
    if (this.animationFrame < 2) return;
    if (Control.isLightPunch(this.playerId)) this.handleLightAttackReset();

    if (!this.isAnimationCompleted()) return;
    this.changeState(FighterState.IDLE);
  }

  handleFallBack = (time) => {
    if (this.animationFrame === 2 && this.position.y >= STAGE_FLOOR) {
      this.animationFrame++;
      this.velocity.y = 0;
      this.position.y = STAGE_FLOOR;
    } else if (this.animationFrame === 2) this.velocity.y = 120;
    if (!this.isAnimationCompleted()) return;
    this.hurtShake = 0;
    this.hurtShakeTimer = 0;
    this.opponent.attackStruck = false;
    this.changeState(FighterState.IDLE, time);
  };

  handleMediumPunchState() {
    if (!this.isAnimationCompleted()) return;
    this.changeState(FighterState.IDLE);
  }
  handleLightKickState() {
    if (this.animationFrame < 2) return;
    if (Control.isLightKick(this.playerId)) this.handleLightAttackReset();

    if (!this.isAnimationCompleted()) return;
    this.changeState(FighterState.IDLE);
  }

  handleMediumKickState() {
    if (!this.isAnimationCompleted()) return;
    this.changeState(FighterState.IDLE);
  }

  handleHurtState() {
    if (!this.isAnimationCompleted()) return;
    this.hurtShake = 0;
    this.hurtShakeTimer = 0;
    this.changeState(FighterState.IDLE);
  }
  handleAttackHit(attackStrength, hitLocation) {
    const newState = this.getHitState(attackStrength, hitLocation);
    const { velocity, friction } = FighterAttackBaseData[attackStrength].slide;

    this.slideVelocity = velocity;
    this.slideFriction = friction;

    this.changeState(newState);

    console.log(
      `${gameState.fighters[this.playerId].id} has hit ${
        gameState.fighters[this.opponent.playerId].id
      }'s ${hitLocation} with a attack`
    );
  }
  updateStageConstraints(time, context, camera) {
    if (
      this.position.x >
      camera.position.x + context.canvas.width - this.boxes.push.width
    ) {
      this.position.x =
        camera.position.x + context.canvas.width - this.boxes.push.width;

      this.resetSlide(true);
    }

    if (this.position.x < camera.position.x + this.boxes.push.width) {
      this.position.x = camera.position.x + this.boxes.push.width;
      this.resetSlide(true);
    }

    if (this.hasCollideWithOpponent()) {
      //!This means Player (this) is to the left of the Opponent.
      if (this.position.x <= this.opponent.position.x) {
        //!The Math.max ensures that the player doesn't move too far off-screen.
        this.position.x = Math.max(
          this.opponent.position.x +
            this.opponent.boxes.push.x -
            (this.boxes.push.x + this.boxes.push.width),
          camera.position.x + this.boxes.push.width
        );
        if (
          [
            FighterState.IDLE,
            FighterState.CROUCH,
            FighterState.JUMP_UP,
            FighterState.JUMP_FORWARDS,
            FighterState.JUMP_BACKWARDS,
          ].includes(this.opponent.CurrentState)
        ) {
          this.opponent.position.x += PushFriction * time.secondsPassed;
        }
      }
      //!This means Player (this) is to the right of the Opponent.
      if (this.position.x >= this.opponent.position.x) {
        //!The Math.min ensures that the player doesn't go outside the right boundary of the canvas.
        this.position.x = Math.min(
          this.opponent.position.x +
            this.opponent.boxes.push.x +
            this.opponent.boxes.push.width +
            (this.boxes.push.width + this.boxes.push.x),
          camera.position.x + context.canvas.width - this.boxes.push.width
        );
        if (
          [
            FighterState.IDLE,
            FighterState.CROUCH,
            FighterState.JUMP_UP,
            FighterState.JUMP_FORWARDS,
            FighterState.JUMP_BACKWARDS,
          ].includes(this.opponent.CurrentState)
        ) {
          this.opponent.position.x -= PushFriction * time.secondsPassed;
        }
      }
    }
  }

  updateAnimation(time) {
    const animation = this.animations[this.CurrentState];
    const [, frameDelay] = animation[this.animationFrame];
    if (time.previous <= this.animationTimer + frameDelay * FRAME_TIME) return;
    this.animationTimer = time.previous;

    if (frameDelay <= FrameDelay.FREEZE) return;
    this.animationFrame++;

    if (this.animationFrame >= animation.length) this.animationFrame = 0;
    this.boxes = this.getBoxes(animation[this.animationFrame][0]);
  }

  updateAttackBoxCollided(time) {
    const { attackStrength, attackType } = this.states[this.CurrentState];

    // Return early if this attack has already struck
    if (this.attackStruck) return;

    // Return if not an attack state
    if (!this.states[this.CurrentState].attackType) return;

    const actualHitBox = getAcutalBoxDimensions(
      this.position,
      this.direction,
      this.boxes.hit
    );

    for (const [hurtLocation, hurtBox] of Object.entries(
      this.opponent.boxes.hurt
    )) {
      const [x, y, width, height] = hurtBox;
      const actualOpponentHurtBox = getAcutalBoxDimensions(
        this.opponent.position,
        this.opponent.direction,
        { x, y, width, height }
      );

      if (!boxOverlap(actualHitBox, actualOpponentHurtBox)) return;

      stopSound(this.soundAttacks[attackStrength]);
      playSound(this.soundHits[attackStrength][attackType]);

      const hitPosition = {
        x:
          (actualHitBox.x +
            actualHitBox.width / 2 +
            actualOpponentHurtBox.x +
            actualOpponentHurtBox.width / 2) /
          2,
        y:
          (actualHitBox.y +
            actualHitBox.height / 2 +
            actualOpponentHurtBox.y +
            actualOpponentHurtBox.height / 2) /
          2,
      };
      hitPosition.x -= 4 - Math.random() * 8;
      hitPosition.y -= 4 - Math.random() * 8;

      this.onAttackHit(
        this.playerId,
        this.opponent.playerId,
        hitPosition,
        this.states[this.CurrentState].attackStrength
      );
      this.opponent.handleAttackHit(attackStrength, hurtLocation);

      this.attackStruck = true;
      return;
    }
  }

  updateHurtShake(time, delay) {
    if (this.hurtShakeTimer === 0 || time.previous <= this.hurtShakeTimer)
      return;
    const shakeAmount =
      delay - time.previous < (Fighter_Hurt_Delay * FRAME_TIME) / 2 ? 1 : 2;

    this.hurtShake = shakeAmount - this.hurtShake;
    this.hurtShakeTimer = time.previous + FRAME_TIME;
  }

  resetSlide = (transfer = false) => {
    if (transfer) {
      this.opponent.slideVelocity = this.slideVelocity;
      this.opponent.slideFriction = this.slideFriction;
    }
    this.slideVelocity = 0;
    this.slideFriction = 0;
  };
  updateSlide(time) {
    if (this.slideVelocity >= 0) return;

    this.slideVelocity += this.slideFriction * time.secondsPassed;
    if (this.slideVelocity < 0) return;

    this.resetSlide();
  }

  updatePosition(time) {
    this.position.x +=
      (this.velocity.x + this.slideVelocity) *
      this.direction *
      time.secondsPassed;
    this.position.y += this.velocity.y * time.secondsPassed;
  }

  update(time, context, camera) {
    this.states[this.CurrentState].update(time, context);
    this.updatePosition(time);
    this.updateSlide(time);
    this.updateAnimation(time);
    this.updateStageConstraints(time, context, camera);
    this.updateAttackBoxCollided(time);
  }

  draw(context, camera) {
    const [frameKey] = this.animations[this.CurrentState][this.animationFrame];
    const [[[x, y, width, height], [originX, originY]]] =
      this.frames.get(frameKey);

    context.save(); //! save current state before inverting
    context.scale(this.direction, 1); //! Inverting the sprites
    context.drawImage(
      this.image,
      x,
      y,
      width,
      height,
      Math.floor(
        (this.position.x - this.hurtShake - camera.position.x) * this.direction
      ) - originX,
      Math.floor(this.position.y - camera.position.y) - originY,
      width,
      height
    );
    context.restore(); //! restore state which was there  before inverting
  }
}
