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

		if (format == Constants.GAME_TYPE.JAPANESE) {
			leagueName = player.japaneseLeagueName;
			elo = player.japaneseElo;
		}

		else if (format === Constants.GAME_TYPE.HONG_KONG) {
			leagueName = player.hongKongLeagueName;
			elo = player.hongKongElo;
		}

		return {
			"leagueName": leagueName,
			"elo": elo.toFixed(3),
			"rank": this.rank ? ++this.rank : this.rank = 1
		};
	},
	getPlayers(sortBy) {
		return Players.find({}, { "sort": sortBy });
	}
});
