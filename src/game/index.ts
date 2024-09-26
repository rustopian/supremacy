import {
  createGame,
  Game,
  Player,
  Space,
  Piece,
  action,
  union,
} from '@boardzilla/core';
import { SupremacyPlayer } from './SupremacyPlayer.ts';
import { StrategyCardFactory } from './StrategyCardFactory.ts';
import { LawsOfPhysicsCard } from './LawsOfPhysicsCard.ts';
import { StrategyCard } from './StrategyCard.ts';
import { StrategyCardDeck } from './StrategyCardDeck.ts';
import { gameCards } from '../../cards.ts';
import { StrategyCardCategory } from './StrategyCardCategory.ts';
import { PlayerPiece } from './PlayerPiece.ts';

export class SupremacyGame extends Game<SupremacyGame, SupremacyPlayer> {
  dystopiaTrack: number = 0;
  phase: 'phase1' | 'phase2' = 'phase1';
  lawsOfPhysicsCards: LawsOfPhysicsCard[] = [];
  strategyCardDeck: StrategyCardDeck;

  // Define spaces
  field: Space<SupremacyGame, SupremacyPlayer>;
  discardPile: Space<SupremacyGame, SupremacyPlayer>;
  corporateCultureBoard: Space<SupremacyGame, SupremacyPlayer>;
  playerPiecesSpace: Space<SupremacyGame, SupremacyPlayer>;
}

export default createGame(SupremacyPlayer, SupremacyGame, (game: SupremacyGame) => {
  game.field = game.create(Space<SupremacyGame, SupremacyPlayer>, 'field');
  game.discardPile = game.create(Space<SupremacyGame, SupremacyPlayer>, 'discardPile');
  game.corporateCultureBoard = game.create(Space<SupremacyGame, SupremacyPlayer>, 'corporateCultureBoard');
  game.playerPiecesSpace = game.create(Space<SupremacyGame, SupremacyPlayer>, 'playerPieces');

  game.players.forEach((player) => {
    const playerPiece = game.create(PlayerPiece, { player });
    playerPiece.putInto(game.playerPiecesSpace);
  });

  // Setup game components
  const strategyCardFactory = new StrategyCardFactory();
  const strategyCards = strategyCardFactory.cardMap;

  const lawsOfPhysicsCards: LawsOfPhysicsCard[] = gameCards.lawsOfPhysicsCards;

  // Shuffle and select two cards face down
  game.lawsOfPhysicsCards = shuffleArray(lawsOfPhysicsCards).slice(0, 2);

  game.strategyCardDeck = new StrategyCardDeck(strategyCards);

  // Assign qubit types to players randomly
  const qubitTypes = [
    'Superconducting Qubits',
    'Photonic Qubits',
    'Trapped Ion Qubits',
    'Silicon Spin Qubits',
    'Topological Qubits',
    'Superfluid Helium Qubits',
    'Diamond Vacancy Qubits',
    'Neutron Atom Qubits',
  ];

  game.players.forEach((player) => {
    const qubitType = qubitTypes.splice(Math.floor(Math.random() * qubitTypes.length), 1)[0];
    player.qubitType = qubitType;

    // Create a hand space for each player
    player.handSpace = game.create(Space<SupremacyGame, SupremacyPlayer>, 'hand', { player });
  });

  // Set Actions
  const { action } = game;

  // Define actions
  game.defineActions({
    // Employee Pawn Actions
    researchPhysics: (player) =>
      action({
        prompt: 'Research Physics',
        description: 'Look at both face-down Laws of Physics Cards',
        condition: () => !player.hasResearchedPhysics,
      })
        .do(() => {
          player.hasResearchedPhysics = true;
          // Logic to privately show face-down cards to the player
          player.viewLawsOfPhysicsCards(game.lawsOfPhysicsCards);
        })
        .message('{{player.name}} researches physics and gains insight.'),

    advanceQuantumTechnology: (player) =>
      action({
        prompt: 'Advance Quantum Technology',
        description: 'Place one Qubit Cube on your Quantum Advancement Track',
        condition: () =>
          player.canAdvanceQuantumTechnology() &&
          player.hasAvailablePawn('employee'),
      })
        .do(() => {
          player.usePawn('employee');
          player.qubitCubes += 1;
        })
        .message('{{player.name}} advances their quantum technology.'),

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
          card.showToPlayer(player);
        })
        .message('{{player.name}} conducts advanced research and draws a Strategy Card.'),

    playHireCard: (player) =>
      action({
        prompt: 'Play Strategy Card as Hire',
        description: 'Place a Hire Card for ongoing benefits',
        condition: () =>
          player.handSpace.has(StrategyCard, (card) => card.canBeHired) &&
          player.hasAvailablePawn('employee') &&
          !player.hasActiveHire(),
      })
        .chooseOnBoard(
          'card',
          player.handSpace.all(StrategyCard, (card) => card.canBeHired),
          {
            prompt: 'Select a Hire Card to play',
          }
        )
        .do(({ card }) => {
          player.usePawn('employee');
          // Move the card to the activeHireSpace using putInto
          card.putInto(player.activeHireSpace);
          // Optionally adjust visibility if needed
          card.showToAll(); // or card.hideFromAll() / card.showToPlayer(player)
        })
        .message('{{player.name}} hires {{card.name}} for ongoing benefits.'),

    // Agent Pawn Actions
    corporateEspionage: (player) =>
      action({
        prompt: 'Corporate Espionage',
        description: "Peek at another player's Strategy Cards or steal 1 Money",
        condition: () => player.money >= 1 && player.hasAvailablePawn('agent'),
      })
        .chooseOnBoard(
          'targetPiece',
          game.playerPiecesSpace.all<PlayerPiece>(PlayerPiece, (p) => p.player !== player),
          {
            prompt: 'Choose a player to target',
          }
        )
        .do(({ targetPiece }) => {
          const targetPlayer = targetPiece.player;
          player.usePawn('agent');
          player.money -= 1;
          // Logic to peek at target's hand or steal money
          // For simplicity, let's assume stealing money
          if (targetPlayer.money > 0) {
            targetPlayer.money -= 1;
            player.money += 1;
          }
        })
        .message('{{player.name}} conducts corporate espionage against {{targetPiece.player.name}}'),

    technologyLicensing: (player) =>
      action({
        prompt: 'Technology Licensing',
        description: 'Initiate a technology trade with another player',
        condition: () => player.hasAvailablePawn('agent'),
      })
        .chooseOnBoard(
          'targetPiece',
          game.playerPiecesSpace.all<PlayerPiece>(PlayerPiece, (p) => p.player !== player),
          {
            prompt: 'Choose a player to propose licensing',
          }
        )
        .do(({ targetPiece }) => {
          const targetPlayer = targetPiece.player;
          player.usePawn('agent');
          // Logic for initiating trade (requires mutual consent)
          game.initiateTrade(player, targetPlayer);
        })
        .message('{{player.name}} proposes technology licensing to {{targetPiece.player.name}}.'),

    aiDevelopment: (player) =>
      action({
        prompt: 'AI Development',
        description: 'Place 2 Qubit Cubes on your Quantum Advancement Track',
        condition: () =>
          player.canAdvanceQuantumTechnology() && player.hasAvailablePawn('agent'),
      })
        .do(() => {
          player.usePawn('agent');
          player.qubitCubes += 2;
          game.dystopiaTrack += 1;
        })
        .message('{{player.name}} advances AI development, risking dystopia.'),

    // Phase 2 Additional Actions
    implementAISafeguards: (player) =>
      action({
        prompt: 'Implement AI Safeguards',
        description: 'Reduce the Dystopia Track by 1',
        condition: () => game.phase === 'phase2' && player.hasAvailablePawn('employee'),
      })
        .do(() => {
          player.usePawn('employee');
          let reduction = 1;
          if (player.isVisionaryCollaborator()) {
            reduction += 1; // Reduce by an extra point
          }
          game.dystopiaTrack = Math.max(0, game.dystopiaTrack - reduction);
        })
        .message('{{player.name}} implements AI safeguards, reducing dystopia.'),

    sabotage: (player) =>
      action({
        prompt: 'Sabotage',
        description: 'Use Strategy Cards to hinder opponents',
        condition: () =>
          game.phase === 'phase2' &&
          player.handSpace.has(StrategyCard, (card) => card.category === StrategyCardCategory.Sabotage) &&
          player.hasAvailablePawn('agent'),
      })
        .chooseOnBoard(
          'card',
          player.handSpace.all(StrategyCard, (card) => card.category === StrategyCardCategory.Sabotage),
          {
            prompt: 'Select a Sabotage Card to play',
          }
        )
        .chooseOnBoard(
          'targetPiece',
          game.playerPiecesSpace.all<PlayerPiece>(PlayerPiece, (p) => p.player !== player),
          {
            prompt: 'Choose a player to sabotage',
          }
        )
        .do(({ card, targetPiece }) => {
          const targetPlayer = targetPiece.player;
          player.usePawn('agent');
          // Move the card to the discard pile
          card.putInto(game.discardPile);
          // Apply card effects to the target
          player.playSabotageCard(card, targetPlayer);
          // Dystopia Impact
          game.dystopiaTrack += card.dystopiaImpact || 0;
        })
        .message('{{player.name}} sabotages {{targetPiece.player.name}} using {{card.name}}.'),

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
  game.defineFlow(() => {
    return {
      phases: {
        phase1: {
          turnOrder: 'clockwise',
          start: true,
          onBegin: () => {
            // Phase 1 setup
            game.phase = 'phase1';
          },
          onEnd: () => {
            // Check end conditions for Phase 1
            game.checkPhase1EndConditions();
          },
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
            aiDevelopment: true,
            pass: true,
          },
          endTurnIf: (player) => player.passed || !player.hasAvailablePawns(),
        },
        phase2: {
          turnOrder: 'clockwise',
          onBegin: () => {
            // Phase 2 setup
            game.phase = 'phase2';
            game.determineCorporateCultures();
          },
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
            implementAISafeguards: true,
            sabotage: true,
            pass: true,
          },
          endTurnIf: (player) => player.passed || !player.hasAvailablePawns(),
        },
      },
      onEnd: () => {
        // Game end conditions
        game.checkEndGameConditions();
      },
    };
  });
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
