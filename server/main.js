import { Meteor } from 'meteor/meteor';

import Players from '../imports/api/Players';

// We need to instantiate the collections server-side. Maintain this import, even though
// we don't use it at all
import '../imports/api/GameDatabases';

Meteor.startup(() => {
	// code to run on server at startup
	// Temporary template player for first run
	// You can use this to edit in the database
	if (Players.find().count() === 0) {
		for (let i = 0; i < 4; i++) {
		Players.insert({
			name: "DELETE_ME_" + i,

			hongKongLeagueName: "HK_DELETE_ME_" + i,
			hongKongElo: 0, //added
			hongKongGamesPlayed: 0, //added
			hongKongHandsWin: 0, //added
			hongKongHandsLose: 0, //added
			hongKongHandsTotal: 0, //added
			hongKongWinPointsTotal: 0, //added
			hongKongChomboTotal: 0, //added
			hongKongBankruptTotal: 0, //added
			hongKongFirstPlaceSum: 0, //added
			hongKongSecondPlaceSum: 0, //added
			hongKongThirdPlaceSum: 0, //added
			hongKongFourthPlaceSum: 0, //added

			japaneseLeagueName: "JPN_DELETE_ME_" + i,
			japaneseElo: 0, //added
			japaneseGamesPlayed: 0, //added
			japaneseHandsWin: 0, //added
			japaneseHandsLose: 0, //added
			japaneseHandsTotal: 0, //added
			japaneseWinPointsTotal: 0, //added
			japaneseWinDoraTotal: 0, //added
			japaneseRiichiTotal: 0, //added
			japaneseWinRiichiTotal: 0, //added
			japaneseChomboTotal: 0, //added
			japaneseBankruptTotal: 0, //added
			japaneseFirstPlaceSum: 0, //added
			japaneseSecondPlaceSum: 0, //added
			japaneseThirdPlaceSum: 0, //added
			japaneseFourthPlaceSum: 0, //added
			});
		}
	}
});
