import { Piece } from '@boardzilla/core';
import { SupremacyGame } from './index.ts';
import { SupremacyPlayer } from './SupremacyPlayer.ts';

export interface LawsOfPhysicsCardProps {
  name: string;
  affectedQubits: string[];
  effect: string;
}

export class LawsOfPhysicsCard extends Piece<SupremacyGame, SupremacyPlayer> {
  name: string;
  affectedQubits: string[];
  effect: string;

  onCreate(props: LawsOfPhysicsCardProps) {
    this.name = props.name;
    this.affectedQubits = props.affectedQubits;
    this.effect = props.effect;
  }
}
