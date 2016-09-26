import { Template } from 'meteor/templating';
import { Players } from '../api/Players.js';
import { Constants } from '../api/Constants.js';

import './About.html';
import './Body.html';
import './Home.html';
import './Index.html';

import './ranking/HongKongRanking.html';
import './ranking/JapaneseRanking.html';
import './ranking/Ranking.html';
import './HongKongNewGame.html';
import './JapaneseNewGame.html';

import './Index.js';
import './HongKongNewGame.js';
import './JapaneseNewGame.js';

Template.registerHelper('toObj', (args) => {
	return args.hash;
});

Template.Ranking.helpers({
	getInfo(format, player) {
		let leagueName;
		let elo;
		switch (format) {
			case Constants.GAME_TYPE.JAPANESE:
				leagueName = player.japaneseLeagueName;
				elo = player.japaneseElo;
				break;
			case Constants.GAME_TYPE.HONG_KONG:
				leagueName = player.hongKongLeagueName;
				elo = player.hongKongElo;
				break;
			default:
				console.error("Format '" + format + "' is invalid");
				break;
		}

		return {
			"leagueName": leagueName,
			"elo": elo.toFixed(3),
			"rank": this.rank ? ++this.rank : this.rank = 1
		};
	},
	getName(format) {
		switch (format) {
			case Constants.GAME_TYPE.JAPANESE:
				league = "Japanese";
				break;
			case Constants.GAME_TYPE.HONG_KONG:
				league = "Hong Kong";
				break;
			default:
				console.error("Format '" + format + "' is invalid");
				break;
		}

		return league + " " + Constants.MAHJONG_CLUB_LEAGUE;
	},
	getPlayers(sortBy) {
		return Players.find({}, { "sort": sortBy });
	}
});
