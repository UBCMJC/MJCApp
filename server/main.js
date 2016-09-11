import { Meteor } from 'meteor/meteor';

import { Players } from '../imports/api/Players.js';
import { HongKongHands } from '../imports/api/GameDatabases.js'

Meteor.startup(() => {
  // code to run on server at startup

  // Temporary template player for first run
  // You can use this to edit in the database
  if (Players.find().count() === 0) {
		Players.insert(
  		{
			name: "DELETE_ME",
			hongKongLeagueName: "JPN_DELETE_ME",
  			hongKongElo: 0,
  			hongKongGamesPlayed: 0,
  			hongKongPositionSum: 0,
  			hongKongHandsWin: 0,
  			hongKongHandsLose: 0,
  			hongKongHandsTotal: 0,
  			hongKongWinPointsTotal: 0,
  			hongKongChomboTotal: 0,
  			hongKongBankruptTotal: 0,

  			japaneseLeagueName: "HK_DELETE_ME",
  			japaneseElo: 0,
  			japaneseGamesPlayed: 0,
  			japanesePositionSum: 0,
  			japaneseHandsWin: 0,
  			japaneseHandsLose: 0,
  			japaneseHandsTotal: 0,
  			japaneseWinPointsTotal: 0,
  			japaneseWinDoraTotal: 0,
  			japaneseRiichiTotal: 0,
        japaneseWinRiichiTotal: 0,
  			japaneseChomboTotal: 0,
  			japaneseBankruptTotal: 0,
	
  		});
	}
});
