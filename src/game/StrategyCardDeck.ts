import { StrategyCard } from './StrategyCard.ts';

export class StrategyCardDeck {
  cards: StrategyCard[] = [];

  constructor(cards: StrategyCard[]) {
    this.cards = cards;
    this.shuffle();
  }

  shuffle() {
    // Implement shuffle logic
  }

  draw(): StrategyCard {
    return this.cards.pop()!;
  }
}