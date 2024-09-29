import { Piece, Space } from "@boardzilla/core";
import { QubitType, SupremacyGame } from "./index.ts";
import { SupremacyPlayer } from "./SupremacyPlayer.ts";

interface QuantumAdvancementBoardProps {
    qubitType: QubitType;
}


/**
 * Represents the Quantum Advancement Board for a player during Phase 2.
 * Holds advancements that can be unlocked by placing Qubit Cubes.
 */
export class QuantumAdvancementBoard extends Space<SupremacyGame, SupremacyPlayer> {
  advancements: QuantumAdvancement[] = [];

  onCreate(props: QuantumAdvancementBoardProps) {
    // The `player` is automatically assigned to `this.player` by the framework

    // Define the advancements available on the board
    const advancementsData = [
      {
        name: 'Quantum Encryption',
        description: 'Your Strategy Cards cannot be revealed by opponents.',
      },
      {
        name: 'Instantaneous Communication',
        description: 'You may perform an extra action each turn.',
      },
      {
        name: 'Quantum Prediction',
        description: 'Once per turn, you may look at the top 3 cards of the Strategy Card Deck.',
      },
      {
        name: 'Seize Bitcoin',
        description: 'Take all Money from an opposing player.',
      },
      {
        name: 'Hypersearch',
        description: 'You may take two Advanced Research actions in a single turn.',
      },
      {
        name: 'Break Encryption',
        description: "All opposing players' Strategy Cards are perpetually revealed unless they have Quantum Encryption.",
      },
    ];

    // Create and add advancements to the board
    for (const data of advancementsData) {
      const advancement = this.game.create(QuantumAdvancement, data.name, {
        description: data.description,
        player: this.player, // Associate the advancement with the player
      });
      advancement.putInto(this);
      this.advancements.push(advancement);
    }
  }
}

/**
 * Represents a Quantum Advancement that can be unlocked by placing a Qubit Cube on it.
 */
export class QuantumAdvancement extends Piece<SupremacyGame> {
  name: string;
  description: string;
  unlocked: boolean = false;

  onCreate({ description }: { description: string }) {
    this.description = description;
  }

  unlock() {
    if (!this.unlocked) {
      this.unlocked = true;
      this.game.message(`${this.player?.name} unlocks ${this.name}.`);
    }
  }
}