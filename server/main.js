import { Meteor } from 'meteor/meteor';

import { Players } from '../imports/api/players.js';
import { Hongkong_Hands } from '../imports/api/hongkong_hands.js'

Meteor.startup(() => {
  // code to run on server at startup

  // Temporary template player
	if (Players.find().count() === 0) {
	Players.insert(
  	{
		name: "DELETE_ME",
  		hongKongElo: 0,
  		hongKongGamesPlayed: 0,
  		hongKongPositionSum: 0,
  		hongKongHandsWin: 0,
  		hongKongHandsLose: 0,
  		hongKongHandsTotal: 0,
  		hongKongWinPointsTotal: 0,
  		hongKongChomboTotal: 0,
  		hongKongBankruptTotal: 0,

  		japaneseElo: 0,
  		japaneseGamesPlayed: 0,
  		japanesePositionSum: 0,
  		japaneseHandsWin: 0,
  		japaneseHandsLose: 0,
  		japaneseHandsTotal: 0,
  		japaneseWinPointsTotal: 0,
  		japaneseWinDoraTotal: 0,
  		japaneseRiichiTotal: 0,
  		japaneseChomboTotal: 0,
  		japaneseBankruptTotal: 0,
	
  });

});
