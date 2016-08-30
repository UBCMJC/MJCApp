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

Template.body.events({
	'submit .submit-game'(event) {

		//TODO: Do some checks to see if multiple of the same name are included
		//TODO: Ensure that scores add up to 100,000
			//  >> Is this necessary if tournament games are to be included?
			//  >> Still need a check to see if it's even-ish

		event.preventDefault();

		const target = event.target;

		const east_player = target.east_player.value;
		const south_player = target.south_player.value;
		const west_player = target.west_player.value;
		const north_player = target.north_player.value;

		//Received as strings
		var east_player_score = target.east_player_score.value;
		var south_player_score = target.south_player_score.value;
		var west_player_score = target.west_player_score.value;
		var north_player_score = target.north_player_score.value;

		//Do something funky to clean this up but until then fuck it
		//Seriously this is a hacky mess I didn't think about
		var east_player_id = Players.findOne({name: east_player}, {})._id;
		var south_player_id = Players.findOne({name: south_player}, {})._id;
		var west_player_id = Players.findOne({name: west_player}, {})._id;
		var north_player_id = Players.findOne({name: north_player}, {})._id;

		const winning_score = Math.max(east_player_score, 
									   south_player_score, 
									   west_player_score, 
									   north_player_score);

		
		if (winning_score == east_player_score){
			Players.update({_id: east_player_id}, {$inc: {elo: 10}});
			east_player_score = Number.NEGATIVE_INFINITY;
		}
		else if (winning_score == south_player_score){
			Players.update({_id: south_player_id}, {$inc: {elo: 10}});
			south_player_score = Number.NEGATIVE_INFINITY;
		}
		else if (winning_score == west_player_score){
			Players.update({_id: west_player_id}, {$inc: {elo: 10}});
			west_player_score = Number.NEGATIVE_INFINITY;
		}
		else if (winning_score == north_player_score){
			Players.update({_id: north_player_id}, {$inc: {elo: 10}})
			north_player_score = Number.NEGATIVE_INFINITY;
		}

		const second_score = Math.max(east_player_score, 
								 south_player_score, 
							   	 west_player_score, 
								 north_player_score);


		if (second_score == east_player_score){
			Players.update({_id: east_player_id}, {$inc: {elo: 5}});
			east_player_score = Number.NEGATIVE_INFINITY;
		}
		else if (second_score == south_player_score){
			Players.update({_id: south_player_id}, {$inc: {elo: 5}});
			south_player_score = Number.NEGATIVE_INFINITY;
		}
		else if (second_score == west_player_score){
			Players.update({_id: west_player_id}, {$inc: {elo: 5}});
			west_player_score = Number.NEGATIVE_INFINITY;
		}
		else if (second_score == north_player_score){
			Players.update({_id: north_player_id}, {$inc: {elo: 5}})
			north_player_score = Number.NEGATIVE_INFINITY;
		}

		const third_score = Math.max(east_player_score, 
								 	 south_player_score, 
							   		 west_player_score, 
									 north_player_score);

		if (third_score == east_player_score){
			Players.update({_id: east_player_id}, {$inc: {elo: -5}});
			east_player_score = Number.NEGATIVE_INFINITY;
		}
		else if (third_score == south_player_score){
			Players.update({_id: south_player_id}, {$inc: {elo: -5}});
			south_player_score = Number.NEGATIVE_INFINITY;
		}
		else if (third_score == west_player_score){
			Players.update({_id: west_player_id}, {$inc: {elo: -5}});
			west_player_score = Number.NEGATIVE_INFINITY;
		}
		else if (third_score == north_player_score){
			Players.update({_id: north_player_id}, {$inc: {elo: -5}})
			north_player_score = Number.NEGATIVE_INFINITY;
		}

		const last_score = Math.max(east_player_score, 
								 	south_player_score, 
							   		west_player_score, 
									north_player_score);

		if (last_score == east_player_score){
			Players.update({_id: east_player_id}, {$inc: {elo: -10}});
			east_player_score = Number.NEGATIVE_INFINITY;
		}
		else if (last_score == south_player_score){
			Players.update({_id: south_player_id}, {$inc: {elo: -10}});
			south_player_score = Number.NEGATIVE_INFINITY;
		}
		else if (last_score == west_player_score){
			Players.update({_id: west_player_id}, {$inc: {elo: -10}});
			west_player_score = Number.NEGATIVE_INFINITY;
		}
		else if (last_score == north_player_score){
			Players.update({_id: north_player_id}, {$inc: {elo: -10}})
			north_player_score = Number.NEGATIVE_INFINITY;
		}


		console.log(winning_score);
		console.log(second_score);
		console.log(third_score);
		console.log(last_score);

	}
})