import {
  createGame,
  Game,
  Player,
  Space,
  Piece,
  Do,
  union,
} from '@boardzilla/core';
import { CorporateCulture, SupremacyPlayer } from './SupremacyPlayer.ts';
import { StrategyCardFactory } from './StrategyCardFactory.ts';
import { LawsOfPhysicsCard } from './LawsOfPhysicsCard.ts';
import { StrategyCard } from './StrategyCard.ts';
import { StrategyCardDeck } from './StrategyCardDeck.ts';
import { gameCards } from '../../cards.ts';
import { StrategyCardCategory } from './StrategyCardCategory.ts';
import { PlayerPiece } from './PlayerPiece.ts';
import { QuantumAdvancementBoard } from './QuantumAdvancementsBoard.ts';
import { QuantumComputerBoard } from './QuantumComputerBoard.ts'; // Added import

export enum QubitType {
  Superconducting = 'Superconducting Qubits',
  Photonic = 'Photonic Qubits',
  TrappedIon = 'Trapped Ion Qubits',
  SiliconSpin = 'Silicon Spin Qubits',
  Topological = 'Topological Qubits',
  SuperfluidHelium = 'Superfluid Helium Qubits',
  DiamondVacancy = 'Diamond Vacancy Qubits',
  NeutronAtom = 'Neutron Atom Qubits',
}

export class SupremacyGame extends Game<SupremacyGame, SupremacyPlayer> {
  dystopiaTrack: number = 0;
  phase: 'phase1' | 'phase2' = 'phase1';
  lawsOfPhysicsCards: LawsOfPhysicsCard[] = [];
  strategyCardDeck: StrategyCardDeck;
  corporatioSupremo?: SupremacyPlayer;

  // Define spaces
  field: Space<SupremacyGame, SupremacyPlayer>;
  discardPile: Space<SupremacyGame, SupremacyPlayer>;
  corporateCultureBoard: Space<SupremacyGame, SupremacyPlayer>;
  playerPiecesSpace: Space<SupremacyGame, SupremacyPlayer>;

  // End game conditions
  checkGameLossCondition(): boolean {
    if (this.dystopiaTrack >= 10) {
      this.message('Dystopia has been reached. AI becomes uncontrollable. All players lose.');
      this.finish(); // Ends the game with no winners
      return true;
    }
    return false;
  }

  checkGameWinConditions(): boolean {
    // Check for Domination Victory
    const playerWithAllAdvancements = this.players.find(
      (player) => player.quantumAdvancementBoard?.advancements.every((adv) => adv.unlocked)
    );
    if (playerWithAllAdvancements) {
      this.message(`${playerWithAllAdvancements.name} achieves Domination Victory!`);
      this.finish(playerWithAllAdvancements);
      return true;
    }

    // Check for Victory for Humanity in Phase 2
    const cooperativePlayerReached6Qubits = this.players.find(
      (player) =>
        player.quantumComputerBoard?.flipped &&
        player.cooperation >= 3 &&
        !player.isCorporatioSupremo()
    );
    if (cooperativePlayerReached6Qubits) {
      this.message('Victory for Humanity! Players with positive Cooperation win.');
      const winners = this.players.filter((p) => p.cooperation > 0);
      this.finish(...winners);
      return true;
    }

    return false;
  }

  // Handle phase transition
  checkPhase1EndConditions() {
    // Check if any player has flipped their Quantum Computer Board
    const flippingPlayer = this.players.find(
      (player) => player.quantumComputerBoard.flipped
    );
    if (flippingPlayer) {
      this.phase = 'phase2';
      this.setCorporatioSupremo(flippingPlayer);
    }
  }

  // Set Corporatio Supremo
  setCorporatioSupremo(player: SupremacyPlayer) {
    this.corporatioSupremo = player;
    this.message(`${player.name} becomes the Corporatio Supremo.`);
    player.quantumAdvancementBoard = new QuantumAdvancementBoard(this, player);
  }
}

export default createGame(SupremacyPlayer, SupremacyGame, (game: SupremacyGame) => {
  game.field = game.create(Space<SupremacyGame, SupremacyPlayer>, 'field');
  game.discardPile = game.create(Space<SupremacyGame, SupremacyPlayer>, 'discardPile');
  game.corporateCultureBoard = game.create(Space<SupremacyGame, SupremacyPlayer>, 'corporateCultureBoard');
  game.playerPiecesSpace = game.create(Space<SupremacyGame, SupremacyPlayer>, 'playerPieces');

  game.players.forEach((player) => {
    const playerPiece = game.create(PlayerPiece, player.name);
    playerPiece.putInto(game.playerPiecesSpace);

    // Initialize Quantum Computer Board for each player
    player.quantumComputerBoard = new QuantumComputerBoard(game, player);

    // Create a hand space for each player
    player.handSpace = game.create(Space<SupremacyGame, SupremacyPlayer>, 'hand', { player });
  });

  // Setup game components
  const strategyCardFactory = new StrategyCardFactory();
  const strategyCards = strategyCardFactory.cardMap;

  const lawsOfPhysicsCards: LawsOfPhysicsCard[] = gameCards.lawsOfPhysicsCards;

  // Shuffle and select two cards face down
  game.lawsOfPhysicsCards = shuffleArray(lawsOfPhysicsCards).slice(0, 2);

  game.strategyCardDeck = new StrategyCardDeck(strategyCards);

  // Assign qubit types to players randomly
  const qubitTypes = Object.values(QubitType);

  game.players.forEach((player) => {
    const qubitType = qubitTypes.splice(Math.floor(Math.random() * qubitTypes.length), 1)[0];
    player.qubitType = qubitType;
  });

  // No need to initialize Quantum Advancement Boards here; they'll be initialized upon flipping

  // Define actions
  const { action } = game;

  game.defineActions({
    // Employee Pawn Actions
    researchPhysics: (player) =>
      action({
        prompt: 'Research Physics',
        description: 'Look at both face-down Laws of Physics Cards',
        condition: () => !player.hasResearchedPhysics && player.hasAvailablePawn('employee'),
      })
        .do(() => {
          player.usePawn('employee');
          player.hasResearchedPhysics = true;
          // Logic to privately show face-down cards to the player
          player.viewLawsOfPhysicsCards(game.lawsOfPhysicsCards);
        })
        .message('{{player.name}} researches physics and gains insight.'),

    advanceQuantumTechnology: (player) =>
      action({
        prompt: 'Advance Quantum Technology',
        description: 'Place a Qubit Cube on your Quantum Computer Board',
        condition: () => player.hasAvailablePawn('employee'),
      })
        .do(() => {
          player.usePawn('employee');
          player.quantumComputerBoard.placeQubitCube();
          // Check if board should flip
          if (player.quantumComputerBoard.isFlipped && game.phase === 'phase1') {
            game.checkPhase1EndConditions();
          }
        })
        .message('{{player.name}} advances quantum technology.'),

    isolationCorrection: (player) =>
      action({
        prompt: 'Isolation/Correction',
        description: 'Remove one Interference Cube from your board',
        condition: () => player.interferenceCubes > 0 && player.hasAvailablePawn('employee'),
      })
        .do(() => {
          player.usePawn('employee');
          player.interferenceCubes -= 1;
        })
        .message('{{player.name}} performs isolation/correction, removing an interference cube.'),

    fundraising: (player) =>
      action({
        prompt: 'Fundraising',
        description: 'Gain 1 Money',
        condition: () => player.hasAvailablePawn('employee'),
      })
        .do(() => {
          player.usePawn('employee');
          player.money += 1;
        })
        .message('{{player.name}} conducts fundraising and gains 1 Money.'),

    publicRelationsCampaign: (player) =>
      action({
        prompt: 'Public Relations Campaign',
        description: 'Increase your Cooperation by +1',
        condition: () => player.cooperation < 5 && player.hasAvailablePawn('employee'),
      })
        .do(() => {
          player.usePawn('employee');
          player.cooperation += 1;
        })
        .message('{{player.name}} launches a public relations campaign, increasing Cooperation.'),

    advancedResearch: (player) =>
      action({
        prompt: 'Advanced Research',
        description: 'Draw one Strategy Card',
        condition: () => player.money >= 1 && player.hasAvailablePawn('employee'),
      })
        .do(() => {
          player.usePawn('employee');
          player.money -= 1;
          const card = game.strategyCardDeck.draw();
          // Place the drawn card into the player's hand space
          card.putInto(player.handSpace);
          card.hideFromAll();
          card.showOnlyTo(player);
        })
        .message('{{player.name}} conducts advanced research and draws a Strategy Card.'),

    playHireCard: (player) =>
      action({
        prompt: 'Play a Hire Card',
        description: 'Play a Hire Card from your hand',
        condition: () =>
          player.handSpace.has(StrategyCard, (card) => card.category === StrategyCardCategory.Hire) &&
          player.hasAvailablePawn('employee'),
      })
        .chooseOnBoard(
          'card',
          player.handSpace.all<StrategyCard>(StrategyCard, (card) => card.category === StrategyCardCategory.Hire),
          {
            prompt: 'Select a Hire Card to play',
          }
        )
        .do(({ card }) => {
          player.usePawn('employee');
          card.putInto(player.activeHireSpace);
        })
        .message('{{player.name}} plays Hire Card {{card.name}}.'),

    // Agent Pawn Actions
    corporateEspionage: (player) =>
      action({
        prompt: 'Corporate Espionage',
        description: "Peek at another player's Strategy Cards or steal 1 Money",
        condition: () => player.money >= 1 && player.hasAvailablePawn('agent'),
      })
        .chooseOnBoard(
          'targetPlayer',
          game.players.filter((p) => p !== player),
          {
            prompt: 'Choose a player to target',
          }
        )
        .do(({ targetPlayer }) => {
          player.usePawn('agent');
          player.money -= 1;
          // For simplicity, let's assume stealing money
          if (targetPlayer.money > 0) {
            targetPlayer.money -= 1;
            player.money += 1;
          }
          game.message('{{player.name}} conducts corporate espionage against {{targetPlayer.name}} and steals 1 Money.');
        }),

    technologyLicensing: (player) =>
      action({
        prompt: 'Technology Licensing',
        description: 'Initiate a technology trade with another player',
        condition: () => player.hasAvailablePawn('agent'),
      })
        .chooseOnBoard(
          'targetPlayer',
          game.players.filter((p) => p !== player),
          {
            prompt: 'Choose a player to propose licensing',
          }
        )
        .do(({ targetPlayer }) => {
          player.usePawn('agent');
          // Logic for initiating trade (requires mutual consent)
          game.initiateTrade(player, targetPlayer);
          game.message('{{player.name}} proposes technology licensing to {{targetPlayer.name}}.');
        }),

    aiDevelopment: (player) =>
      action({
        prompt: 'AI Development',
        description: 'Place 2 Qubit Cubes on your Quantum Advancement Track',
        condition: () => player.hasAvailablePawn('agent'),
      })
        .do(() => {
          player.usePawn('agent');
          player.qubitCubes += 2;
          game.dystopiaTrack += 1;
          // Check for game ending condition
          game.checkGameLossCondition();
        })
        .message('{{player.name}} advances AI development, risking dystopia.'),

    unlockAdvancement: (player) =>
      action({
        prompt: 'Unlock Quantum Advancement',
        description: 'Unlock an advancement on your Quantum Advancement Board',
        condition: () =>
          game.phase === 'phase2' &&
          player.hasAvailablePawn('agent') &&
          player.isCorporatioSupremo &&
          player.quantumAdvancementBoard &&
          player.quantumAdvancementBoard.advancements.some((adv) => !adv.unlocked),
      })
        .choose({
          choices: player.quantumAdvancementBoard!.advancements.filter((adv) => !adv.unlocked).map((adv) => adv.name),
          prompt: 'Select an advancement to unlock',
        })
        .do(({ choice }) => {
          player.usePawn('agent');
          const advancement = player.quantumAdvancementBoard!.advancements.find((adv) => adv.name === choice)!;
          advancement.unlock();

          // Increase Dystopia Track by 1 for each advancement unlocked
          game.dystopiaTrack += 1;

          // Check for game ending condition
          game.checkGameLossCondition();
          game.checkGameWinConditions();
        })
        .message('{{player.name}} unlocks {{choice}}.'),

    // Implement 'Seize Bitcoin' action
    seizeBitcoin: (player) =>
      action({
        prompt: 'Seize Bitcoin',
        description: 'Take all Money from an opposing player',
        condition: () =>
          player.isCorporatioSupremo &&
          player.hasAdvancement('Seize Bitcoin') &&
          player.hasAvailablePawn('agent'),
      })
        .chooseOnBoard(
          'targetPlayer',
          game.players.filter((p) => p !== player),
          {
            prompt: 'Choose a player to seize Money from',
          }
        )
        .do(({ targetPlayer }) => {
          player.usePawn('agent');
          const amount = targetPlayer.money;
          targetPlayer.money = 0;
          player.money += amount;
          game.message('{{player.name}} seizes {{amount}} Money from {{targetPlayer.name}}.');
        })
        .message('{{player.name}} uses Seize Bitcoin on {{targetPlayer.name}}.'),

    // Additional Phase 2 actions...
    quantumPrediction: (player) =>
      action({
        prompt: 'Quantum Prediction',
        description: 'Look at the top 3 cards of the Strategy Card Deck',
        condition: () =>
          game.phase === 'phase2' &&
          player.hasAdvancement('Quantum Prediction') &&
          !player.usedQuantumPredictionThisTurn,
      })
        .do(() => {
          player.usedQuantumPredictionThisTurn = true;
          const topThreeCards = game.strategyCardDeck.peek(3);
          // Show the top three cards privately to the player
          player.viewCards(topThreeCards);
          game.message('{{player.name}} uses Quantum Prediction to view top 3 Strategy Cards.');
        }),

    // Pass action
    pass: (player) =>
      action({
        prompt: 'Pass',
        description: 'End your turn for this round',
      })
        .do(() => {
          player.passed = true;
        })
        .message('{{player.name}} passes their turn.'),
  });

  // Define game flow
  game.defineFlow(() => ({
    phases: {
      phase1: {
        moves: {
          researchPhysics: true,
          advanceQuantumTechnology: true,
          isolationCorrection: true,
          fundraising: true,
          publicRelationsCampaign: true,
          advancedResearch: true,
          playHireCard: true,
          corporateEspionage: true,
          technologyLicensing: true,
          // Other Phase 1 actions...
          pass: true,
        },
        turnOrder: {
          order: 'players',
        },
        onTurnBegin: ({ player }) => {
          player.resetTurnFlags();
        },
        onTurnEnd: ({ player }) => {
          // Check for phase transition at the end of each player's turn
          if (game.phase === 'phase1') {
            game.checkPhase1EndConditions();
          }
          // Additional end-of-turn logic...
        },
      },
      phase2: {
        moves: {
          // All Phase 1 actions remain available
          researchPhysics: true,
          advanceQuantumTechnology: true,
          isolationCorrection: true,
          fundraising: true,
          publicRelationsCampaign: true,
          advancedResearch: true,
          playHireCard: true,
          corporateEspionage: true,
          technologyLicensing: true,
          aiDevelopment: true,
          // Additional Phase 2 actions
          unlockAdvancement: true,
          seizeBitcoin: true,
          quantumPrediction: true,
          // Other Phase 2 actions...
          pass: true,
        },
        turnOrder: {
          order: 'players',
        },
        onTurnBegin: ({ player }) => {
          player.resetTurnFlags();
          // Apply per-turn effects based on unlocked advancements
          if (player.hasAdvancement('Break Encryption')) {
            game.players.forEach((otherPlayer) => {
              if (otherPlayer !== player && !otherPlayer.hasAdvancement('Quantum Encryption')) {
                // Reveal other player's Strategy Cards to 'player'
                otherPlayer.handSpace.all<StrategyCard>(StrategyCard).forEach((card) => {
                  card.showToPlayer(player);
                });
              }
            });
          }
          // Other per-turn effects...
        },
        onTurnEnd: ({ player }) => {
          // Check for game ending conditions
          game.checkGameLossCondition();
          game.checkGameWinConditions();
        },
      },
    },
    endGameIf: () => {
      // Check for overall game end conditions
      return game.checkGameLossCondition() || game.checkGameWinConditions();
    },
  }));
});

// Utility function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}