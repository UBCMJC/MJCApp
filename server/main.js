import { Meteor } from 'meteor/meteor';

import Players from '../imports/api/Players';
import Admin from '../imports/api/Admin';

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
			hongKongElo: 0,
			hongKongGamesPlayed: 0,
			hongKongHandsWin: 0,
			hongKongHandsLose: 0,
			hongKongHandsTotal: 0,
			hongKongWinPointsTotal: 0,
			hongKongChomboTotal: 0,
			hongKongBankruptTotal: 0,
			hongKongFirstPlaceSum: 0,
			hongKongSecondPlaceSum: 0,
			hongKongThirdPlaceSum: 0,
			hongKongFourthPlaceSum: 0,

			japaneseLeagueName: "JPN_DELETE_ME_" + i,
			japaneseElo: 0,
			japaneseGamesPlayed: 0,
			japaneseHandsWin: 0,
			japaneseHandsLose: 0,
			japaneseHandsTotal: 0,
			japaneseWinPointsTotal: 0,
			japaneseWinDoraTotal: 0,
			japaneseRiichiTotal: 0,
			japaneseWinRiichiTotal: 0,
			japaneseChomboTotal: 0,
			japaneseBankruptTotal: 0,
			japaneseFirstPlaceSum: 0,
			japaneseSecondPlaceSum: 0,
			japaneseThirdPlaceSum: 0,
			japaneseFourthPlaceSum: 0,
			});
		}
	}
});
