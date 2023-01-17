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
		hongKongElo: 1498.50 + i,
		hongKongGamesPlayed: 1,
		hongKongHandsWin: 0,
		hongKongHandsLose: 0,
		hongKongHandsTotal: 0,
		hongKongWinPointsTotal: 0,
		hongKongChomboTotal: 0,
		hongKongBankruptTotal: 0,
		hongKongFirstPlaceSum: (1 === i + 1) ? 1 : 0,
		hongKongSecondPlaceSum: (2 === i + 1) ? 1 : 0,
		hongKongThirdPlaceSum: (3 === i + 1) ? 1 : 0,
		hongKongFourthPlaceSum: (4 === i + 1) ? 1 : 0,

		japaneseLeagueName: "JPN_DELETE_ME_" + i,
		japaneseElo: 1498.5 + i,
		japaneseGamesPlayed: 1,
		japaneseHandsWin: 0,
		japaneseHandsLose: 0,
		japaneseHandsTotal: 0,
		japaneseWinPointsTotal: 0,
		japaneseWinDoraTotal: 0,
		japaneseRiichiTotal: 0,
		japaneseWinRiichiTotal: 0,
		japaneseChomboTotal: 0,
		japaneseBankruptTotal: 0,
		japaneseFirstPlaceSum: (1 === i + 1) ? 1 : 0,
		japaneseSecondPlaceSum: (2 === i + 1) ? 1 : 0,
		japaneseThirdPlaceSum: (3 === i + 1) ? 1 : 0,
		japaneseFourthPlaceSum: (4 === i + 1) ? 1 : 0,
		japaneseDealInTotal: 0,
		japaneseDealInAfterRiichiTotal: 0,
		japaneseSelfDrawTotal: 0,
		japaneseRiichiEV: 0,

		upperJapanese: true,
		upperJapaneseElo: 1498.5 + i,
		upperJapaneseGamesPlayed: 1,
		upperJapanesePositionSum: 0,
		upperJapaneseHandsWin: 0,
		upperJapaneseHandsLose: 0,
		upperJapaneseHandsTotal: 0,
		upperJapaneseWinPointsTotal: 0,
		upperJapaneseWinDoraTotal: 0,
		upperJapaneseRiichiTotal: 0,
		upperJapaneseWinRiichiTotal: 0,
		upperJapaneseChomboTotal: 0,
		upperJapaneseBankruptTotal: 0,
		upperJapaneseFirstPlaceSum: (1 === i + 1) ? 1 : 0,
		upperJapaneseSecondPlaceSum: (2 === i + 1) ? 1 : 0,
		upperJapaneseThirdPlaceSum: (3 === i + 1) ? 1 : 0,
		upperJapaneseFourthPlaceSum: (4 === i + 1) ? 1 : 0,
		upperJapaneseDealInTotal: 0,
		upperJapaneseDealInAfterRiichiTotal: 0,
		upperJapaneseSelfDrawTotal: 0,
		upperJapaneseRiichiEV: 0,
	    });
	}
    }
});
