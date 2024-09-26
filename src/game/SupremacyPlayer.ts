import { Player, Space } from '@boardzilla/core';
import { StrategyCard } from './StrategyCard.ts';
import { LawsOfPhysicsCard } from './LawsOfPhysicsCard.ts';
import { SupremacyGame } from './index.ts';

export class SupremacyPlayer extends Player {
  qubitCubes: number = 0;
  money: number = 5;
  cooperation: number = 0;
  innovation: number = 0;
  interferenceCubes: number = 0;
  hasResearchedPhysics: boolean = false;
  employeePawns: number = 3;
  agentPawns: number = 1;
  passed: boolean = false;
  hand: StrategyCard[] = [];
  qubitType: string;
  activeHire: StrategyCard | null = null;
  handSpace: Space<SupremacyGame, SupremacyPlayer>;
  activeHireSpace: Space<SupremacyGame, SupremacyPlayer>;

  hasAvailablePawn(type: 'employee' | 'agent'): boolean {
    return type === 'employee' ? this.employeePawns > 0 : this.agentPawns > 0;
  }

  usePawn(type: 'employee' | 'agent') {
    if (type === 'employee') {
      this.employeePawns -= 1;
    } else {
      this.agentPawns -= 1;
    }
  }

  hasAvailablePawns(): boolean {
    return this.employeePawns > 0 || this.agentPawns > 0;
  }

  canAdvanceQuantumTechnology(): boolean {
    // Logic to determine if the player can advance quantum technology
    // For example, check if their qubit type is not excluded
    return !this.isQubitTypeExcluded();
  }

  isQubitTypeExcluded(): boolean {
    // Check if the player's qubit type is in the excluded types
    // after the Laws of Physics Cards have been revealed
    return false; // Placeholder, implement actual logic
  }

  viewLawsOfPhysicsCards(cards: LawsOfPhysicsCard[]) {
    // Logic to allow the player to view the cards privately
  }

  hasActiveHire(): boolean {
    return this.activeHireSpace.has(StrategyCard);
  }

  isVisionaryCollaborator(): boolean {
    // Determine if the player is a Visionary Collaborator based on culture
    return this.cooperation >= 3 && this.innovation >= 3;
  }

  playSabotageCard(card: StrategyCard, target: SupremacyPlayer) {
    // Logic to play a sabotage card against the target
    this.hand.splice(this.hand.indexOf(card), 1);
    // Apply card effects to the target
  }
}