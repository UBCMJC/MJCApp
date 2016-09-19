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
			hongKongLeagueName: "HK_DELETE_ME",
  			hongKongElo: 0, //added
  			hongKongGamesPlayed: 0, //added
  			hongKongPositionSum: 0, //added
  			hongKongHandsWin: 0, //added
  			hongKongHandsLose: 0, //added
  			hongKongHandsTotal: 0, //added
  			hongKongWinPointsTotal: 0,
  			hongKongChomboTotal: 0, //added
  			hongKongBankruptTotal: 0, //added

  			japaneseLeagueName: "JPN_DELETE_ME",
  			japaneseElo: 0, //added
  			japaneseGamesPlayed: 0, //added
  			japanesePositionSum: 0, //added
  			japaneseHandsWin: 0, //added
  			japaneseHandsLose: 0, //added
  			japaneseHandsTotal: 0, //added
  			japaneseWinPointsTotal: 0,
  			japaneseWinDoraTotal: 0,
  			japaneseRiichiTotal: 0, //added
        japaneseWinRiichiTotal: 0,
  			japaneseChomboTotal: 0, //added
  			japaneseBankruptTotal: 0, //added
	
  		});
	}
});
