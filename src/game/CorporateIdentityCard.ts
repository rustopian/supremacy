import { Piece } from '@boardzilla/core';
import { SupremacyGame } from './index.ts';
import { SupremacyPlayer } from './SupremacyPlayer.ts';

export interface CorporateIdentityCardProps {
  id: string;
  name: string;
  type: string;
  corporateCulture: string;
  startingEmployees: number;
  startingAgents: number;
  startingTokens?: { [key: string]: number };
  uniqueAbility1: {
    name: string;
    mechanicsType: string | string[];
    description: string;
  };
  uniqueAbility2?: {
    name: string;
    mechanicsType: string | string[];
    description: string;
  };
  description: string;
}

export class CorporateIdentityCard extends Piece<SupremacyGame, SupremacyPlayer> {
  id: string;
  name: string;
  type: string;
  corporateCulture: string;
  startingEmployees: number;
  startingAgents: number;
  startingTokens: { [key: string]: number };
  uniqueAbility1: {
    name: string;
    mechanicsType: string | string[];
    description: string;
  };
  uniqueAbility2?: {
    name: string;
    mechanicsType: string | string[];
    description: string;
  };
  description: string;

  onCreate(props: CorporateIdentityCardProps) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.corporateCulture = props.corporateCulture;
    this.startingEmployees = props.startingEmployees;
    this.startingAgents = props.startingAgents;
    this.startingTokens = props.startingTokens || {};
    this.uniqueAbility1 = props.uniqueAbility1;
    this.uniqueAbility2 = props.uniqueAbility2;
    this.description = props.description;
  }

  // Methods to activate unique abilities can be added here
}
