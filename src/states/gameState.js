import { createDefaultFighterState } from "./fighterState.js";
import { FighterId } from "../constants/fighter.js";

export const gameState = {
  fighters: [
    createDefaultFighterState(FighterId.RYU),
    createDefaultFighterState(FighterId.KEN),
  ],
};
