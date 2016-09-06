import { Template } from 'meteor/templating';

import { Players } from '../api/players.js';

import './home.html';
import './index.html';
import './hongkong_ranking.html';
import './japanese_ranking.html';
import './hongkong_new_game.html';
import './body.html';

import './index.js';
import './hongkong_new_game.js';

Template.japanese_ranking.helpers({
	japanese_players() {
		return Players.find({}, {sort: { japanese_elo: -1}});
	}
});

Template.hongkong_ranking.helpers({
	hongkong_players() {
		return Players.find({}, {sort: { hongkong_elo: -1}});
	}
});