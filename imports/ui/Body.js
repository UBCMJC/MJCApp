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

Template.JapaneseRanking.helpers({
	japanesePlayers() {
		return Players.find({}, {sort: { japaneseElo: -1}});
	}
});

Template.HongKongRanking.helpers({
	hongKongPlayers() {
		return Players.find({}, {sort: { hongKongElo: -1}});
	}
});