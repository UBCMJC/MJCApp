import { Meteor } from 'meteor/meteor';

import CurrentGames from '../imports/api/CurrentGames';
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
    if (CurrentGames.find().count() === 0) {
	CurrentGames.insert({
	    timestamp: 1518490447206,

	    code: "1234",

	    style: "jpn",

	    players: [ "JPN_DELETE_ME_0",
		       "JPN_DELETE_ME_1",
		       "JPN_DELETE_ME_2",
		       "JPN_DELETE_ME_3" ],

	    winSums: [ 1, 1, 0, 0 ],

	    lossSums: [ 0, 1, 0, 0 ],

	    pointSums: [ 4, 1, 0, 0 ],

	    doraSums: [ 1, 0, 0, 0 ],

	    riichiSums: [ 2, 1, 0, 1 ],

	    riichiWinSums: [ 1, 0, 0, 0 ],

	    chomboSums: [ 0, 0, 0, 0 ],

	    scores: [ 33000, 24800, 21100, 21100 ],

	    allHands: [
		{
		    handType: "dealin",
		    round: 1,
		    bonus: 0,
		    points: 1,
		    fu: 30,
		    dora: 0,
		    riichis: [ true, false, false, false ],
		    deltas: [ -1000, 2000, -1000, -1000 ]
		},
		{
		    handType: "nowin",
		    round: 2,
		    bonus: 0,
		    points: 0,
		    fu: 0,
		    dora: 0,
		    riichis: [ true, true, false, false ],
		    deltas: [ 500, 500, -1500, -1500 ]
		},
		{
		    handType: "selfdraw",
		    round: 2,
		    bonus: 1,
		    points: 4,
		    fu: 20,
		    dora: 1,
		    riichis: [ true, false, false, true ],
		    deltas: [ 8500, -2700, -1400, -1400 ]
		}
	    ]
	});
    }
});
