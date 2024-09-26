// src/game/StrategyCard.ts

import { Piece } from '@boardzilla/core';
import { StrategyCardCategory } from './StrategyCardCategory.ts';
import { SupremacyGame } from './index.ts';
import { SupremacyPlayer } from './SupremacyPlayer.ts';

export interface StrategyCardProps {
  id: string;
  name: string;
  category: StrategyCardCategory;
  type: string;
  mechanicsType: string;
  mechanicsVariables: string;
  coopChange: number;
  innovChange: number;
  dystopiaImpact: number;
  canBeHired: boolean;
  description: string;
}

export class StrategyCard extends Piece<SupremacyGame, SupremacyPlayer> {
  id: string;
  name: string;
  category: StrategyCardCategory;
  mechanicsType: string;
  mechanicsVariables: string;
  coopChange: number;
  innovChange: number;
  canBeHired: boolean;
  dystopiaImpact: number;
  description: string;

  onCreate(props: StrategyCardProps) {
    this.id = props.id;
    this.name = props.name;
    this.category = props.category;
    this.mechanicsType = props.mechanicsType;
    this.mechanicsVariables = props.mechanicsVariables;
    this.coopChange = props.coopChange;
    this.innovChange = props.innovChange;
    this.canBeHired = props.canBeHired;
    this.description = props.description;
    this.dystopiaImpact = props.dystopiaImpact;
  }

  // Override toString for better message formatting
  toString(): string {
    return `${this.name} [${this.category}]`;
  }

  // Define additional methods for card effects here
}
