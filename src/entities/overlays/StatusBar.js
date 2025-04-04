import {
  TIME_DELAY,
  TIME_FRAME_KEYS,
  TIME_FLASH_DELAY,
  HEALTH_MAX_HIT_POINTS,
  HEALTH_DAMAGE_COLOR,
  KO_ANIMATION,
  KO_FLASH_DELAY,
  HEALTH_CRITICAL_HIT_POINTS,
} from "../../constants/battle.js";
import { FPS } from "../../constants/game.js";
import { gameState } from "../../states/gameState.js";

export class StatusBar {
  constructor(fighters, onTimeEnd) {
    this.image = document.querySelector('img[alt="hud"]');
    this.fighters = fighters;
    this.onTimeEnd = onTimeEnd; // Store the callback function

    this.time = 99;
    this.timeTimer = 0;
    this.timeFlashTimer = 0;
    this.useFlashFrames = false;
    this.timeEnded = false; // Add flag to prevent time from going negative

    this.healthBars = [
      {
        timer: 0,
        hitPoints: HEALTH_MAX_HIT_POINTS,
        lastHitTime: 0,
      },
      {
        timer: 0,
        hitPoints: HEALTH_MAX_HIT_POINTS,
        lastHitTime: 0,
      },
    ];

    this.nameTags = gameState.fighters.map(
      ({ id }) => `tag-${id.toLowerCase()}`
    );

    this.koFrame = 0;
    this.koAnimationTimer = 0;

    this.frames = new Map([
      ["health-bar", [16, 18, 145, 11]],
      ["ko-white", [161, 16, 32, 14]],
      ["ko-red", [161, 1, 32, 14]],

      //!timer
      [`${TIME_FRAME_KEYS[0]}-0`, [16, 32, 14, 16]],
      [`${TIME_FRAME_KEYS[0]}-1`, [32, 32, 14, 16]],
      [`${TIME_FRAME_KEYS[0]}-2`, [48, 32, 14, 16]],
      [`${TIME_FRAME_KEYS[0]}-3`, [64, 32, 14, 16]],
      [`${TIME_FRAME_KEYS[0]}-4`, [80, 32, 14, 16]],
      [`${TIME_FRAME_KEYS[0]}-5`, [96, 32, 14, 16]],
      [`${TIME_FRAME_KEYS[0]}-6`, [112, 32, 14, 16]],
      [`${TIME_FRAME_KEYS[0]}-7`, [128, 32, 14, 16]],
      [`${TIME_FRAME_KEYS[0]}-8`, [144, 32, 14, 16]],
      [`${TIME_FRAME_KEYS[0]}-9`, [160, 32, 14, 16]],

      //! time that flashes
      [`${TIME_FRAME_KEYS[1]}-0`, [16, 192, 14, 16]],
      [`${TIME_FRAME_KEYS[1]}-1`, [32, 192, 14, 16]],
      [`${TIME_FRAME_KEYS[1]}-2`, [48, 192, 14, 16]],
      [`${TIME_FRAME_KEYS[1]}-3`, [64, 192, 14, 16]],
      [`${TIME_FRAME_KEYS[1]}-4`, [80, 192, 14, 16]],
      [`${TIME_FRAME_KEYS[1]}-5`, [96, 192, 14, 16]],
      [`${TIME_FRAME_KEYS[1]}-6`, [112, 192, 14, 16]],
      [`${TIME_FRAME_KEYS[1]}-7`, [128, 192, 14, 16]],
      [`${TIME_FRAME_KEYS[1]}-8`, [144, 192, 14, 16]],
      [`${TIME_FRAME_KEYS[1]}-9`, [160, 192, 14, 16]],

      //!Numberic
      ["score-0", [17, 101, 10, 10]],
      ["score-1", [29, 101, 10, 10]],
      ["score-2", [41, 101, 10, 10]],
      ["score-3", [53, 101, 10, 10]],
      ["score-4", [65, 101, 10, 10]],
      ["score-5", [77, 101, 10, 10]],
      ["score-6", [89, 101, 10, 10]],
      ["score-7", [101, 101, 10, 10]],
      ["score-8", [113, 101, 10, 10]],
      ["score-9", [125, 101, 10, 10]],

      //!Alpha
      ["score-@", [17, 113, 10, 10]],
      ["score-A", [29, 113, 10, 10]],
      ["score-B", [41, 113, 10, 10]],
      ["score-C", [53, 113, 10, 10]],
      ["score-D", [65, 113, 10, 10]],
      ["score-E", [77, 113, 10, 10]],
      ["score-F", [89, 113, 10, 10]],
      ["score-G", [101, 113, 10, 10]],
      ["score-H", [113, 113, 10, 10]],
      ["score-I", [125, 113, 10, 10]],
      ["score-J", [136, 113, 10, 10]],
      ["score-K", [149, 113, 10, 10]],
      ["score-L", [161, 113, 10, 10]],
      ["score-M", [173, 113, 10, 10]],
      ["score-N", [185, 113, 10, 10]],
      ["score-O", [197, 113, 10, 10]],
      ["score-P", [17, 125, 10, 10]],
      ["score-Q", [29, 125, 10, 10]],
      ["score-R", [41, 125, 10, 10]],
      ["score-S", [53, 125, 10, 10]],
      ["score-T", [65, 125, 10, 10]],
      ["score-U", [77, 125, 10, 10]],
      ["score-V", [89, 125, 10, 10]],
      ["score-W", [101, 125, 10, 10]],
      ["score-X", [113, 125, 10, 10]],
      ["score-Y", [125, 125, 10, 10]],
      ["score-Z", [136, 125, 10, 10]],

      //! Name tag
      ["tag-ken", [128, 56, 30, 9]],
      ["tag-ryu", [16, 56, 28, 9]],
    ]);
  }

  update(time, context) {
    this.updateHealthBars(time);
    this.updateTime(time);
    this.updateKOIcon(time);
  }

  updateTime(time) {
    // Don't update time if battle has ended or time is already ended
    if (this.timeEnded) {
      this.time = Math.max(0, this.time); // Ensure time doesn't go below 0
      this.useFlashFrames = false; // Stop flashing when battle ends
      return;
    }

    // Check if any fighter's HP is 0 and freeze time if so
    if (this.fighters.some((fighter) => fighter.hitPoints <= 0)) {
      this.timeEnded = true;
      this.time = Math.max(0, this.time); // Ensure time doesn't go below 0
      this.useFlashFrames = false; // Stop flashing when battle ends
      return;
    }

    if (time.previous > this.timeTimer + TIME_DELAY) {
      this.time -= 1;
      this.timeTimer = time.previous;

      // Check if time reached zero
      if (this.time <= 0) {
        this.time = 0; // Ensure time doesn't go below zero
        this.timeEnded = true; // Set flag to stop timer
        this.useFlashFrames = false; // Stop flashing when time runs out

        // Call onTimeEnd callback if it exists
        if (typeof this.onTimeEnd === "function") {
          this.onTimeEnd(time);
        }
      }
    }

    // Only flash the timer if it's between 15 and 0 seconds and battle hasn't ended
    if (
      this.time < 15 &&
      this.time > -1 &&
      !this.timeEnded &&
      time.previous > this.timeFlashTimer + TIME_FLASH_DELAY
    ) {
      this.useFlashFrames = !this.useFlashFrames;
      this.timeFlashTimer = time.previous;
    }
  }

  updateKOIcon(time) {
    if (
      this.healthBars.every(
        (healthBar) => healthBar.hitPoints > HEALTH_CRITICAL_HIT_POINTS
      )
    )
      return;
    if (time.previous < this.koAnimationTimer + KO_FLASH_DELAY[this.koFrame])
      return;

    this.koFrame = 1 - this.koFrame;
    this.koAnimationTimer = time.previous;
  }

  updateHealthBars(time) {
    for (let i = 0; i < this.fighters.length; i++) {
      const fighter = gameState.fighters[i];

      if (fighter.hitPoints <= 0) {
        this.timeEnded = true;
      }

      // If the fighter takes damage (hitPoints decrease)
      if (this.healthBars[i].hitPoints > fighter.hitPoints) {
        this.healthBars[i].hitPoints = Math.max(
          fighter.hitPoints,
          this.healthBars[i].hitPoints - time.secondsPassed * FPS
        );
        this.healthBars[i].lastHitTime = time.previous;
      }

      // Regenerate health if no damage taken for 6 seconds
      else if (
        time.previous > this.healthBars[i].lastHitTime + 6000 &&
        this.healthBars[i].hitPoints < HEALTH_MAX_HIT_POINTS &&
        !this.timeEnded
      ) {
        this.healthBars[i].hitPoints = Math.min(
          HEALTH_MAX_HIT_POINTS,
          this.healthBars[i].hitPoints + time.secondsPassed * FPS * 0.5
        );
        fighter.hitPoints = this.healthBars[i].hitPoints;
      }
    }
  }

  drawFrame(context, frameKey, x, y, direction = 1) {
    const [sourceX, sourceY, sourceWidth, sourceHeight] =
      this.frames.get(frameKey);

    context.scale(direction, 1);
    context.drawImage(
      this.image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      x * direction,
      y,
      sourceWidth,
      sourceHeight
    );
    context.setTransform(1, 0, 0, 1, 0, 0);
  }

  drawHealthBar(context) {
    this.drawFrame(context, "health-bar", 31, 20);
    this.drawFrame(context, KO_ANIMATION[this.koFrame], 176, 18);
    this.drawFrame(context, "health-bar", 353, 20, -1);

    context.fillStyle = HEALTH_DAMAGE_COLOR;

    context.beginPath();
    context.fillRect(
      32,
      21,
      HEALTH_MAX_HIT_POINTS - Math.floor(this.healthBars[0].hitPoints),
      9
    );
    context.fillRect(
      208 + Math.floor(this.healthBars[1].hitPoints),
      21,
      HEALTH_MAX_HIT_POINTS - Math.floor(this.healthBars[1].hitPoints),
      9
    );
  }

  drawTime(context) {
    const timeString = String(Math.max(this.time, 0)).padStart(2, "00");
    const flashFrame = TIME_FRAME_KEYS[Number(this.useFlashFrames)];
    this.drawFrame(context, `${flashFrame}-${timeString[0]}`, 178, 33);
    this.drawFrame(context, `${flashFrame}-${timeString[1]}`, 194, 33);
  }

  drawName(context) {
    this.drawFrame(context, this.nameTags[0], 32, 33);
    this.drawFrame(context, this.nameTags[1], 322, 33);
  }

  drawScore(context, score, x) {
    const strValue = String(score);
    const buffer = 6 * 12 - strValue.length * 12;

    for (let i = 0; i < strValue.length; i++) {
      this.drawFrame(context, `score-${strValue[i]}`, x + buffer + i * 12, 1);
    }
  }

  drawScoreLabel(context, label, x) {
    for (const index in label) {
      this.drawFrame(
        context,
        `score-${label.charAt(index)}`,
        x + index * 12,
        1
      );
    }
  }

  drawScores(context) {
    this.drawScoreLabel(context, "DHRUV", 4);
    this.drawScore(context, gameState.fighters[0].score, 45);
    this.drawScoreLabel(context, "2DCOMBATPROJECT", 122);

    this.drawScoreLabel(context, "P2", 305);
    this.drawScore(context, gameState.fighters[1].score, 309);
  }

  draw(context) {
    this.drawScores(context);
    this.drawHealthBar(context);
    this.drawTime(context);
    this.drawName(context);
  }
}
