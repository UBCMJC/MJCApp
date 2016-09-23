import { Template } from 'meteor/templating';
import { Players } from '../api/Players.js';

import './About.html';
import './Body.html';
import './Home.html';
import './Index.html';
import './HongKongRanking.html';
import './JapaneseRanking.html';
import './HongKongNewGame.html';
import './JapaneseNewGame.html';

import './Index.js';
import './HongKongNewGame.js';
import './JapaneseNewGame.js';

var index;

function initPlayer(key) {
	index = 1;

	var sort = {};
	sort[key] = -1;
	return Players.find({}, sort);
}

Template.registerHelper('nicerElo', (elo) => { return elo.toFixed(3) });
Template.registerHelper('setRank', () => {
		var returnValue = index;
		index++;
		return returnValue;
});

Template.JapaneseRanking.helpers({
	japanesePlayers() {
		return initPlayer("japaneseElo");
	}
});

Template.HongKongRanking.helpers({
	hongKongPlayers() {
		return initPlayer("hongKongElo");
	}
});