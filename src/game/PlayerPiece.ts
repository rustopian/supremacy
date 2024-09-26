import { Piece } from '@boardzilla/core';
import { SupremacyGame } from './index.ts';
import { SupremacyPlayer } from './SupremacyPlayer.ts';

export class PlayerPiece extends Piece<SupremacyGame> {
  player: SupremacyPlayer;

  onCreate(props: { player: SupremacyPlayer }) {
    this.player = props.player;
  }
}
