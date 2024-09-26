// src/game/StrategyCardFactory.ts

import { StrategyCard, StrategyCardProps } from './StrategyCard.ts';
import { StrategyCardCategory } from './StrategyCardCategory.ts';
import { SupremacyGame } from './index.ts';
import { gameCards } from '../../cards.ts';
import { Space } from '@boardzilla/core';

interface StrategyCardsJSON {
  strategyCards: StrategyCardProps[];
  corporateIdentityCards: any[];
  phase2StrategyCards: any[];
  designTypeCards: any[];
}

export class StrategyCardFactory {
  cardMap: Map<string, StrategyCardProps>;

  constructor() {
    this.cardMap = new Map<string, StrategyCardProps>();
    this.loadStrategyCards();
  }

  private loadStrategyCards() {
    const data: StrategyCardsJSON = gameCards;

    data.strategyCards.forEach((card) => {
      // Validate category
      if (!Object.values(StrategyCardCategory).includes(card.category)) {
        console.warn(
          `Strategy Card "${card.name}" has an invalid category "${card.category}". Skipping.`
        );
        return;
      }

      // Add to map
      this.cardMap.set(card.name, card);
    });
  }

  // Modify this method to accept the parent element where the card will be created
  createStrategyCard(parent: Space<SupremacyGame>, name: string): StrategyCard | null {
    const cardProps = this.cardMap.get(name);
    if (!cardProps) {
      console.warn(`Strategy Card "${name}" is not defined.`);
      return null;
    }

    // Use the create method on the parent element
    return parent.create(StrategyCard, cardProps.name, cardProps);
  }

  getAllStrategyCardNames(): string[] {
    return Array.from(this.cardMap.keys());
  }

  // Optional: Method to get random Strategy Cards
  getRandomStrategyCards(parent: Space<SupremacyGame>, count: number): StrategyCard[] {
    const allNames = this.getAllStrategyCardNames();
    const shuffled = allNames.sort(() => 0.5 - Math.random());
    const selectedNames = shuffled.slice(0, count);
    return selectedNames
      .map((name) => this.createStrategyCard(parent, name))
      .filter((card): card is StrategyCard => card !== null);
  }
}
