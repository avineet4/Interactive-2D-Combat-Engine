import { TitleScene } from "./TitleScene.js";
import { Ken } from "../entities/fighter/ken.js";
import { Ryu } from "../entities/fighter/ryu.js";
import { KenStage } from "../entities/stages/ken-stage.js";
import { RyuStage } from "../entities/stages/ryu-stage.js";
import { VegasStage } from "../entities/stages/vegas-stage.js";
import { SagatStage } from "../entities/stages/sagat-stage.js";
import { StatusBar } from "../entities/overlays/StatusBar.js";
import { Camera } from "../engine/camera.js";
import {
  FighterAttackBaseData,
  FighterAttackStrength,
  FighterId,
  FighterState,
} from "../constants/fighter.js";
import { gameState } from "../states/gameState.js";
import { Shadow } from "../entities/fighter/shared/shadow.js";
import { LightHitSplash } from "../entities/fighter/shared/LightHitSplash.js";
import { MediumHitSplash } from "../entities/fighter/shared/MediumHitSplash.js";
import { HeavyHitSplash } from "../entities/fighter/shared/heavyHitSplash.js";
import { stopSound } from "../engine/soundHandler.js";

export class BattleScene {
  constructor(changeScene = null) {
    // Load images properly
    this.winnerImage = document.getElementById("winner");
    this.drawImage = document.getElementById("hud");

    this.fighters = [];
    this.camera = undefined;
    this.shadows = [];
    this.entities = [];
    this.FighterDrawOrder = [0, 1];
    this.hurtTimer = undefined;
    this.winnerId = undefined;
    this.loserId = undefined;
    this.battleEnded = false;
    this.koAnimationComplete = false;
    this.victoryStateSet = false;
    this.timeOutOccurred = false;
    this.FightersDrawOrder = [0, 1];

    this.stage = this.createStage();
    this.changeScene = changeScene;

    this.startRound();

    this.overlays = [new StatusBar(this.fighters, this.onTimeEnd.bind(this))];
  }

  createStage() {
    // Use the selected stage from gameState
    const selectedStage = gameState.selectedStage || "Ken";

    switch (selectedStage) {
      case "Ryu":
        console.log("Creating Ryu stage");
        return new RyuStage();
      case "Sagat":
        console.log("Creating Sagat stage");
        return new SagatStage();
      case "Vegas":
        console.log("Creating Vegas stage");
        return new VegasStage();
      case "Ken":
      default:
        console.log("Creating Ken stage");
        return new KenStage();
    }
  }

  getFighterEntityClass(id) {
    switch (id) {
      case FighterId.RYU:
        return Ryu;
      case FighterId.KEN:
        return Ken;
    }
  }

  getFighterEntity(fighterState, index) {
    const FighterEntityClass = this.getFighterEntityClass(fighterState.id);

    const x = index === 0 ? 580 : 720;
    const y = 220;
    const direction = index === 0 ? 1 : -1;

    return new FighterEntityClass(
      x,
      y,
      direction,
      index,
      this.handleAttackHit.bind(this)
    );
  }

  getFighterEntities() {
    const fighterEntities = gameState.fighters.map(
      this.getFighterEntity.bind(this)
    );

    fighterEntities[0].opponent = fighterEntities[1];
    fighterEntities[1].opponent = fighterEntities[0];

    return fighterEntities;
  }

  getHitSplashClass(strength) {
    switch (strength) {
      case FighterAttackStrength.LIGHT:
        return LightHitSplash;
      case FighterAttackStrength.MEDIUM:
        return MediumHitSplash;
      case FighterAttackStrength.HEAVY:
        return HeavyHitSplash;
      default:
        throw new Error("unknown strength");
    }
  }

  addEntity(EntityClass, ...args) {
    this.entities.push(new EntityClass(...args, this.removeEntity.bind(this)));
  }

  removeEntity(entity) {
    this.entities = this.entities.filter((thisEntity) => thisEntity !== entity);
  }

  handleAttackHit(playerId, opponentId, position, strength, time) {
    // Do nothing if battle has already ended
    if (this.battleEnded) return;

    // Add score based on hit strength
    gameState.fighters[playerId].score += FighterAttackBaseData[strength].score;

    // Reduce opponent's hit points
    const newHitPoints = Math.max(
      0,
      gameState.fighters[opponentId].hitPoints -
        FighterAttackBaseData[strength].damage
    );
    gameState.fighters[opponentId].hitPoints = newHitPoints;

    this.FighterDrawOrder = [playerId, opponentId];
    // Add hit splash effect
    this.addEntity(
      this.getHitSplashClass(strength),
      position.x,
      position.y,
      playerId
    );
  }

  onTimeEnd(time) {
    if (this.battleEnded) return;

    this.timeOutOccurred = true;
    this.battleEnded = true;

    // Set fighters to idle state and freeze them
    for (const fighter of this.fighters) {
      // First change to idle state
      fighter.changeState(FighterState.IDLE);

      // Then freeze their movement by setting velocity to 0
      fighter.velocity.x = 0;
      fighter.velocity.y = 0;

      // Disable controls
      fighter.controlsEnabled = false;
    }

    // Determine winner based on remaining health
    const hp1 = gameState.fighters[0].hitPoints;
    const hp2 = gameState.fighters[1].hitPoints;

    if (hp1 > hp2) {
      this.loserId = 1;
      this.winnerId = 0;
      this.startBattleEnd(this.loserId, this.winnerId, time);
    } else if (hp2 > hp1) {
      this.loserId = 0;
      this.winnerId = 1;
      this.startBattleEnd(this.loserId, this.winnerId, time);
    }
  }

  // Modified to handle battle end in sequence
  startBattleEnd(loserId, winnerId, time) {
    console.log(
      `Battle ending! Winner: Player ${winnerId + 1}, Loser: Player ${
        loserId + 1
      }`
    );

    // Set winner and loser IDs for later use
    this.winnerId = winnerId;
    this.loserId = loserId;
    this.battleEnded = true;

    if (this.fighters[loserId]) {
      this.fighters[loserId].changeState(FighterState.KO, time);
      //! Help in giving smooth transition
      setTimeout(() => {
        this.koAnimationComplete = true;
      }, 2000);
    }
  }

  // Function to handle scene change after victory animation
  completeEndSequence() {
    // If we have a scene change function, call it after a delay

    setTimeout(() => {
      console.log("Changing scene now");
      stopSound(this.stage.music);
      location.reload();
    }, 5000); // Delay before changing scenes after victory animation
  }

  startRound() {
    this.fighters = this.getFighterEntities();
    this.camera = new Camera(448, 16, this.fighters);
    this.shadows = this.fighters.map((fighter) => new Shadow(fighter));
  }

  updateFighters(time, context) {
    for (const fighter of this.fighters) {
      if (time.previous < this.hurtTimer) {
        fighter.updateHurtShake(time, this.hurtTimer);
      } else {
        fighter.update(time, context, this.camera);
      }
    }

    // Check if KO animation is complete and victory state hasn't been set yet
    if (this.battleEnded && this.koAnimationComplete && !this.victoryStateSet) {
      if (this.fighters[this.winnerId]) {
        this.fighters[this.winnerId].changeState(FighterState.VICTORY, time);
        this.fighters[this.winnerId].victory = true;
        this.victoryStateSet = true;

        // Start the end sequence timer after setting victory state
        this.completeEndSequence();
      }
    }
  }

  updateShadows = (time) => {
    this.shadows.map((shadow) => shadow.update(time));
  };

  updateEntities(time, context) {
    for (const entity of this.entities) {
      entity.update(time, context, this.camera);
    }
  }

  drawWinnerText = (context, id) => {
    context.drawImage(this.winnerImage, 0, 11 * id, 70, 9, 130, 60, 140, 30);
  };

  drawTimeOut = (context) => {
    context.drawImage(this.drawImage, 351, 111, 66, 32, 140, 65, 100, 30);
  };

  updateOverlays(time, context) {
    for (const overlay of this.overlays) {
      overlay.update(time, context, this.camera);
    }
  }

  // Continue checking HP during update to catch edge cases
  updateFighterHP = (time) => {
    if (this.battleEnded) return;

    gameState.fighters.forEach((fighter, index) => {
      if (fighter.hitPoints <= 0) {
        const opponentId = 1 - index;
        this.startBattleEnd(index, opponentId, time);
      }
    });
  };

  update(time, context) {
    // Always update these components regardless of battle state
    this.updateShadows(time);
    this.stage.update(time);
    this.updateEntities(time, context);
    this.camera.update(time, context);
    this.updateOverlays(time, context);

    // Only update fighters if battle hasn't ended
    if (!this.battleEnded) {
      this.updateFighters(time, context);
      this.updateFighterHP(time);
    } else {
      // Even if battle ended, still update fighters for KO animation
      this.updateFighters(time, context);
    }
  }

  drawFighters(context) {
    for (const fighterId of this.FightersDrawOrder) {
      this.fighters[fighterId].draw(context, this.camera);
    }
  }

  drawShadows(context) {
    this.shadows.map((shadow) => shadow.draw(context, this.camera));
  }

  drawEntities(context) {
    for (const entity of this.entities) {
      entity.draw(context, this.camera);
    }
  }

  drawOverlays(context) {
    for (const overlay of this.overlays) {
      overlay.draw(context, this.camera);
    }
  }

  draw(context) {
    // Always draw these components

    context.imageSmoothingEnabled = false;

    this.stage.draw(context, this.camera);

    this.drawShadows(context);
    this.drawFighters(context);
    this.drawEntities(context);
    this.drawOverlays(context);

    // Handle different end game scenarios
    if (this.timeOutOccurred) {
      if (this.winnerId === undefined) {
        // It's a draw - show DRAW GAME text
        this.drawTimeOut(context);
      } else {
        // Time out but one player had more health - show winner
        this.drawWinnerText(context, this.winnerId);
      }
    }
    // KO scenario - show winner
    else if (this.winnerId !== undefined) {
      this.drawWinnerText(context, this.winnerId);
    }
  }
}
