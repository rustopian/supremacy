import { Space } from '@boardzilla/core';
import { QubitType, SupremacyGame } from './index.ts';
import { SupremacyPlayer } from './SupremacyPlayer.ts';
import { QuantumAdvancementBoard } from './QuantumAdvancementsBoard.ts';

export interface QuantumComputerBoardProps {
  qubitType: QubitType;
}

/**
 * Represents the Quantum Computer Board for a player during Phase 1.
 * Holds up to 6 Qubit Cubes, each granting minor powers when placed.
 */
export class QuantumComputerBoard extends Space<SupremacyGame, SupremacyPlayer> {
  qubitSlots: boolean[] = [false, false, false, false, false, false];
  flipped: boolean = false;

  onCreate(props: QuantumComputerBoardProps) {
        if (!this.player) {
        throw new Error('Player is not defined');
        }
  }

  /**
   * Places a Qubit Cube on the next available slot and grants the corresponding minor power.
   */
  placeQubitCube() {
    const index = this.qubitSlots.findIndex((slot) => slot === false);
    if (index !== -1) {
      this.qubitSlots[index] = true;
      this.player!.qubitCubes += 1;
      this.grantMinorPower(index);
      this.game.message(`${this.player!.name} places a Qubit Cube on slot ${index + 1} and gains a minor power.`);
      if (this.player!.qubitCubes >= 6) {
        this.flipBoard();
      }
    }
  }

  /**
   * Grants a minor power based on the slot index where the Qubit Cube was placed.
   * @param index - The index of the slot (0 to 5).
   */
  grantMinorPower(index: number) {
    switch (index) {
      case 0:
        // Minor power 1: Gain 1 Money immediately.
        this.player!.money += 1;
        this.game.message(`${this.player!.name} gains 1 Money.`);
        break;
      case 1:
        // Minor power 2: Remove 1 Interference Cube immediately if any.
        if (this.player!.interferenceCubes > 0) {
          this.player!.interferenceCubes -= 1;
          this.game.message(`${this.player!.name} removes 1 Interference Cube.`);
        }
        break;
      case 2:
        // Minor power 3: Gain 1 Cooperation.
        this.player!.cooperation = Math.min(this.player!.cooperation + 1, 5);
        this.game.message(`${this.player!.name}'s Cooperation increases by 1.`);
        break;
      case 3:
        // Minor power 4: Draw 1 Strategy Card.
        const card = this.game.strategyCardDeck.draw();
        if (card) {
          card.putInto(this.player!.handSpace);
          card.hideFromAll();
          card.showOnlyTo(this.player!);
          this.game.message(`${this.player!.name} draws 1 Strategy Card.`);
        }
        break;
      case 4:
        // Minor power 5: Gain 1 Innovation.
        this.player!.innovation = Math.min(this.player!.innovation + 1, 5);
        this.game.message(`${this.player!.name}'s Innovation increases by 1.`);
        break;
      case 5:
        // Minor power 6: Gain an extra Employee Pawn for this round.
        this.player!.employeePawns += 1;
        this.game.message(`${this.player!.name} gains an extra Employee Pawn for this round.`);
        break;
      default:
        break;
    }
  }

  /**
   * Flips the Quantum Computer Board to become the Quantum Advancement Board.
   */
  flipBoard() {
    if (!this.flipped) {
      this.flipped = true;
      this.game.message(`${this.player!.name}'s Quantum Computer Board flips to become the Quantum Advancement Board.`);
      // Replace the board with Quantum Advancement Board
      this.player!.quantumAdvancementBoard = this.game.create(QuantumAdvancementBoard, 'QuantumAdvancementBoard', {
        player: this.player,
      });
    }
  }
}