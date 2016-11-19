//Databases
import { Players } from '../api/Players.js';
import { JapaneseHands } from '../api/GameDatabases.js';

import { Constants } from '../api/Constants.js';
import { EloCalculator } from '../api/EloCalculator.js';
import { NewGameUtils } from '../api/NewGameUtils.js';

// Code to be evaluated when JapaneseNewGame template is reloaded
Template.JapaneseNewGame.onCreated( function() {
	// Meteor: Template type to show for choosing hand submission
	this.hand_type = new ReactiveVar( "jpn_dealin" );

	// Meteor: List of hands submitted to display
	this.hands = new ReactiveArray();

	// Save game riichi history for if a hand is deleted
	this.riichi_round_history = [];
	this.riichi_sum_history = [];

	// Reset shared Mahjong stats
	NewGameUtils.resetGameValues(Constants.JPN_START_POINTS);

	// Reset Japanese hand specific stats
	Session.set("current_fu", 0);
	Session.set("current_dora", 0);

	// Reset GUI selection fields
	setAllGUIRiichisFalse();

	// Reset Japanese game specific stats
	Session.set("east_riichi_sum", 0);
	Session.set("south_riichi_sum", 0);
	Session.set("west_riichi_sum", 0);
	Session.set("north_riichi_sum", 0);

	Session.set("eastPlayerRiichisWon", 0);
	Session.set("southPlayerRiichisWon", 0);
	Session.set("westPlayerRiichisWon", 0);
	Session.set("northPlayerRiichisWon", 0);

	Session.set("eastPlayerDoraSum", 0);
	Session.set("southPlayerDoraSum", 0);
	Session.set("westPlayerDoraSum", 0);
	Session.set("northPlayerDoraSum", 0);

	// Reset number of riichi sticks stored for next player win
	Session.set("free_riichi_sticks", 0);
});

// Code to be evaluated when jpn_dealin template is reloaded
Template.jpn_dealin.onCreated( function() {
	// Reset GUI selection fields
	setAllGUIRiichisFalse();
});

// Code to be evaluated when jpn_selfdraw template is reloaded
Template.jpn_selfdraw.onCreated( function() {
	// Reset GUI selection fields
	setAllGUIRiichisFalse();
});

// Code to be evaluated when jpn_nowin tenplate is reloaded
Template.jpn_nowin.onCreated( function() {
	// Reset GUI selection fields
	Session.set("east_tenpai", false);
	Session.set("south_tenpai", false);
	Session.set("west_tenpai", false);
	Session.set("north_tenpai", false);

	setAllGUIRiichisFalse();
});

// Code to be evaluated when jpn_restart tenplate is reloaded
Template.jpn_restart.onCreated( function() {
	// Reset GUI selection fields
	setAllGUIRiichisFalse();
});

// Code to be evaluated when jpn_split_pao tenplate is reloaded
Template.jpn_split_pao.onCreated( function() {
	// Reset GUI selection fields
	setAllGUIRiichisFalse();
});

// GUI helper to show current round # 
// [E1,E2,E3,E4,S1,S2,S3,S4,W1,W2,W3,W4,W5,W...]
Template.registerHelper("jpn_round_mod4", function(round) {
	if (Number(round) > 8)
		return (Number(round) - 8);
	var retval = Number(round) % 4;
	if (retval == 0)
		retval = 4;
	return retval;
})

// GUI helpers for hand submission template
Template.JapaneseNewGame.helpers({
	// Choose hand type for submission form
	hand_type() {
		return Template.instance().hand_type.get();
	},
	// Choose player to select from dropdown menus
	players() {
		return Players.find({}, {sort: { japaneseLeagueName: 1}});
	},
	// Return all recorded hands for a game as an array
	hands() {
		return Template.instance().hands.get();
	},
	// Show what a player's +/- is
	get_player_delta(direction) {
		return (NewGameUtils.getDirectionScore(direction) - Constants.JPN_START_POINTS);
	},
	// Show what a player's current score is
	get_player_score(direction) {
		return NewGameUtils.getDirectionScore(direction);
	},
	// Show what a player's score will look like if game is ended now
	get_player_score_final(direction) {
		retval = NewGameUtils.getDirectionScore(direction);

		var winScore = Math.max(Number(Session.get("east_score")),
								Number(Session.get("south_score")),
								Number(Session.get("west_score")),
								Number(Session.get("north_score")));

		if (winScore == Session.get("east_score")) {
			if (direction == "east")
				retval += 1000 * Number(Session.get("free_riichi_sticks"));
		} else if (winScore == Session.get("south_score")) {
			if (direction == "south")
				retval += 1000 * Number(Session.get("free_riichi_sticks"));
		} else if (winScore == Session.get("west_score")) {
			if (direction == "west")
				retval += 1000 * Number(Session.get("free_riichi_sticks"));
		} else if (winScore == Session.get("north_score")) {
			if (direction == "north")
				retval += 1000 * Number(Session.get("free_riichi_sticks"));	
		} 


		return retval;
	},
	// Show a player's ELO
	get_jpn_elo(player) {
		switch (player) {
		case Constants.DEFAULT_EAST:
		case Constants.DEFAULT_SOUTH:
		case Constants.DEFAULT_WEST:
		case Constants.DEFAULT_NORTH:
			return "?";
			break;
		default:
			return Players.findOne({japaneseLeagueName: player}).japaneseElo.toFixed(2);
			break;
		};
	},
	// Return a string of the round wind for Japanese style
	displayRoundWind(round) {
		return NewGameUtils.displayRoundWind(round, Constants.GAME_TYPE.JAPANESE);
	},
});

// GUI helpers for rendering hands
Template.jpn_render_hand.helpers({
	// Boolean expressions to help with rendering hands
	is_dealin(hand_type) {
		return hand_type == Constants.DEAL_IN;
	},
	is_selfdraw(hand_type) {
		return hand_type == Constants.SELF_DRAW;
	},
	is_nowin(hand_type) {
		return hand_type == Constants.NO_WIN;
	},
	is_restart(hand_type) {
		return hand_type == Constants.RESTART;
	},
	is_mistake(hand_type) {
		return hand_type == Constants.MISTAKE;
	},
	// Return a string of the round wind for Japanese style
	displayRoundWind(round) {
		return NewGameUtils.displayRoundWind(round, Constants.GAME_TYPE.JAPANESE);
	},
})

// Helper for point selection dropdown--All allowable points
// Assume that 13, 26, 39, and 52 are single->quadruple yakuman
Template.jpn_points.helpers({
	possible_points: [
		{ point: 1 },
		{ point: 2 },
		{ point: 3 },
		{ point: 4 },
		{ point: 5 },
		{ point: 6 },
		{ point: 7 },
		{ point: 8 },
		{ point: 9 },
		{ point: 10 },
		{ point: 11 },
		{ point: 12 },
		{ point: 13 },
		{ point: 26 },
		{ point: 39 },
		{ point: 52 },
	],
});

// Helper for fu selection dropdown--All allowable fu
// Must do checks to ensure a valid point/fu selection is made
Template.jpn_fu.helpers({
	possible_fu: [
		{ fu: 20 },
		{ fu: 25 },
		{ fu: 30 },
		{ fu: 40 },
		{ fu: 50 },
		{ fu: 60 },
		{ fu: 70 },
		{ fu: 80 },
		{ fu: 90 },
		{ fu: 100 },
		{ fu: 110 },
	],
});

// Helper for dora selection dropdown--All allowable dora
Template.jpn_dora.helpers({
	possible_dora: [
		{ dora: 0 },
		{ dora: 1 },
		{ dora: 2 },
		{ dora: 3 },
		{ dora: 4 },
		{ dora: 5 },
		{ dora: 6 },
		{ dora: 7 },
		{ dora: 8 },
		{ dora: 9 },
		{ dora: 10 },
		{ dora: 11 },
		{ dora: 12 },
		{ dora: 13 },
		{ dora: 14 },
		{ dora: 15 },
		{ dora: 16 },
		{ dora: 17 },
		{ dora: 18 },
		{ dora: 19 },
		{ dora: 20 },
		{ dora: 21 },
		{ dora: 22 },
		{ dora: 23 },
		{ dora: 24 },
		{ dora: 25 },
		{ dora: 26 },
		{ dora: 27 },
		{ dora: 28 },
		{ dora: 29 },
		{ dora: 30 },
		{ dora: 31 },
		{ dora: 32 },
		{ dora: 33 },
		{ dora: 34 },
		{ dora: 35 },
	],
});

// Functions for browser events
Template.JapaneseNewGame.events({
	//Selecting who the east player is
	'change select[name="east_player"]'(event) {
		Session.set("current_east", event.target.value);
	},
	//Selecting who the south player is
	'change select[name="south_player"]'(event) {
		Session.set("current_south", event.target.value);
	},
	//Selecting who the west player is
	'change select[name="west_player"]'(event) {
		Session.set("current_west", event.target.value);
	},
	//Selecting who the north player is
	'change select[name="north_player"]'(event) {
		Session.set("current_north", event.target.value);
	},
	//Selecting who the winner is for a dealin or tsumo
	'click .winner'(event) {
		if ( !$( event.target ).hasClass( "disabled" )) {
			if ( $( event.target ).hasClass( "active" )) {
				$( event.target ).removeClass( "active" );
				$( ".winner_buttons button" ).not( event.target ).removeClass( "disabled" );
				Session.set("round_winner", Constants.NO_PERSON);
			} else {
				$( event.target ).addClass( "active" );
				$( ".winner_buttons button" ).not( event.target ).addClass( "disabled" );
				Session.set("round_winner", event.target.innerHTML);
			}
		}
	},
	//Selecting who the loser is for a dealin
	'click .loser'(event) {
		if ( !$( event.target ).hasClass( "disabled" )) {
			if ( $( event.target ).hasClass( "active" )) {
				$( event.target ).removeClass( "active" );
				$( ".loser_buttons button" ).not( event.target ).removeClass( "disabled" );
				Session.set("round_loser", Constants.NO_PERSON);
			} else {
				$( event.target ).addClass( "active" );
				$( ".loser_buttons button" ).not( event.target ).addClass( "disabled" );
				Session.set("round_loser", event.target.innerHTML);
			}
		}
	},
	//Selecting who riichied
	'click .riichi'(event) {
		if ( !$( event.target ).hasClass( "active" )) {
			$( event.target ).addClass( "active" );
			Session.set( NewGameUtils.playerToDirection(event.target.innerHTML) + "_riichi", true);
		} else {
			$( event.target ).removeClass( "active" )
			Session.set( NewGameUtils.playerToDirection(event.target.innerHTML) + "_riichi", false);
		}
	},
	//Selecting who tenpaied
	'click .tenpai'(event) {
		if ( !$( event.target ).hasClass( "active" )) {
			$( event.target ).addClass( "active" );
			Session.set( NewGameUtils.playerToDirection(event.target.innerHTML) + "_tenpai", true);
		} else {
			$( event.target ).removeClass( "active" )
			Session.set( NewGameUtils.playerToDirection(event.target.innerHTML) + "_tenpai", false);
		}
	},
	//Selecting who is under pao
	'click .pao'(event) {
		if ( !$( event.target ).hasClass( "disabled" )) {
			if ( $( event.target ).hasClass( "active" )) {
				$( event.target ).removeClass( "active" );
				$( ".pao_buttons button" ).not( event.target ).removeClass( "disabled" );
				Session.set("round_pao_player", Constants.NO_PERSON);
			} else {
				$( event.target ).addClass( "active" );
				$( ".pao_buttons button" ).not( event.target ).addClass( "disabled" );
				Session.set("round_pao_player", event.target.innerHTML);
			}
		}
	},
	//Submission of a hand
	'click .submit_hand_button'(event, template) {

		if ( !$( event.target ).hasClass( "disabled")) {


			//Do nothing if we don't have players yet
			if (NewGameUtils.allPlayersSelected()) {
				// Save what the free riichi stick number is in case we delete this hand
				template.riichi_sum_history.push(Session.get("free_riichi_sticks"));

				switch(template.hand_type.get()) {
				// Push a deal in hand and ensure proper information
				case "jpn_dealin":
					// Ensure correct input of who won and who lost
					if (Session.get("round_winner") != Constants.NO_PERSON &&
						Session.get("round_loser") != Constants.NO_PERSON &&
						Session.get("round_winner") != Session.get("round_loser")) {
						// Ensure a valid point/fu combination
						if (NewGameUtils.noIllegalJapaneseHands()) {
							push_dealin_hand(template);
							$( ".delete_hand_button" ).removeClass( "disabled" );
						}
						else {
							window.alert("Invalid points/fu entry!");
						}
					} else {
						window.alert("You need to fill out who won and who dealt in!");
					}
					break;
				// Push a self draw hand and ensure proper information
				case "jpn_selfdraw":
					// Ensure correct input of who won
					if (Session.get("round_winner") != Constants.NO_PERSON) {
						// Ensure a valid point/fu combination
						if (NewGameUtils.noIllegalSelfdrawJapaneseHands()) {
							push_selfdraw_hand(template);
							$( ".delete_hand_button" ).removeClass( "disabled" );
						}
						else {
							window.alert("Invalid points/fu entry!");
						}
					} else {
						window.alert("You need to fill out who self drew!");
					}
					break;
				// Push a tenpai hand -> cannot input invalid information
				case "jpn_nowin":
					push_nowin_hand(template);
					$( ".delete_hand_button" ).removeClass( "disabled" );
					break;
				// Push a restart hand -> cannot input invalid information
				case "jpn_restart":
					push_restart_hand(template);
					$( ".delete_hand_button" ).removeClass( "disabled" );
					break;
				// Push a chombo hand and ensure proper information
				case "jpn_mistake":
					// Ensure correct input of who chomboed
					if (Session.get("round_loser") != Constants.NO_PERSON) {
						push_mistake_hand(template);
						$( ".delete_hand_button" ).removeClass( "disabled" );
					}
					else
						window.alert("You need to fill out who chomboed!");
					break;
				// Push a hand where pao was split and ensure proper information
				case "jpn_split_pao":
					// Ensure correct input of winner, loser, and pao player 
					if (Session.get("round_winner") != Constants.NO_PERSON &&
						Session.get("round_loser") != Constants.NO_PERSON &&
						Session.get("round_pao_player") != Constants.NO_PERSON &&
						Session.get("round_winner") != Session.get("round_loser") &&
						Session.get("round_loser") != Session.get("round_pao_player") &&
						Session.get("round_pao_player") != Session.get("round_winner")) {
						//Ensure a valid point/fu combination
						if (NewGameUtils.noIllegalJapaneseHands()) {
							push_split_pao_hand(template);
							$( ".delete_hand_button" ).removeClass( "disabled" );
						}
						else {
							window.alert("Invalid points/fu entry!");
						}
					} else {
						window.alert("You need to fill out who won, who dealt in, and who has pao penalty!");
					}
					break;
				// No other hands should be possible!
				default:
					console.log(template.hand_type);
					break;
				};
			}
			else {
				window.alert("You need to fill out the player information!");
			}

			// If game ending conditions are met, do not allow more hand submissions and allow game submission
			if (NewGameUtils.japaneseGameOver())
			{
				$( event.target ).addClass( "disabled");
				$( ".submit_game_button" ).removeClass( "disabled" );
			}
		}

	},
	//Remove the last submitted hand
	'click .delete_hand_button'(event, template) {
		if ( !$(event.target ).hasClass( "disabled" )) {
			var r = confirm("Are you sure?");
			// Reset game to last hand state
			if (r == true) {
				// Deletes last hand
				var del_hand = Template.instance().hands.pop();

				Session.set("east_score", Number(Session.get("east_score")) - Number(del_hand.eastDelta));
				Session.set("south_score", Number(Session.get("south_score")) - Number(del_hand.southDelta));
				Session.set("west_score", Number(Session.get("west_score")) - Number(del_hand.westDelta));
				Session.set("north_score", Number(Session.get("north_score")) - Number(del_hand.northDelta));
				Session.set("current_bonus", del_hand.bonus);
				Session.set("current_round", del_hand.round);

				//Set free riichi sticks to last round's value
				Session.set("free_riichi_sticks", template.riichi_sum_history.pop())

				var riichiHistory = template.riichi_round_history.pop();
				if (riichiHistory.east == true)
					Session.set("east_riichi_sum", Number(Session.get("east_riichi_sum")) - 1);
				if (riichiHistory.south == true)
					Session.set("south_riichi_sum", Number(Session.get("south_riichi_sum")) - 1);
				if (riichiHistory.west == true)
					Session.set("west_riichi_sum", Number(Session.get("west_riichi_sum")) - 1);
				if (riichiHistory.north == true)
					Session.set("north_riichi_sum", Number(Session.get("north_riichi_sum")) - 1);

				// Rollback chombo stat
				if (del_hand.handType == "mistake")
					NewGameUtils.rollbackChomboStat(del_hand);

				// Rollback hand win/loss stat
				if (del_hand.handType == "dealin" || del_hand.handType == "selfdraw") {
					// win stat
					NewGameUtils.rollbackHandWinStat(del_hand);

					// win riichis stat
					NewGameUtils.rollbackHandRiichiStat(del_hand, riichiHistory);

					// points stat
					NewGameUtils.rollbackTotalPointsStat(del_hand);

					// loss stat -> may occur when pao selfdraw
					NewGameUtils.rollbackHandDealinStat(del_hand);
				}

				$( ".submit_hand_button" ).removeClass( "disabled" );
				$( ".submit_game_button" ).addClass( "disabled" );
				if (Template.instance().hands.get().length === 0) {
					$( ".delete_hand_button" ).addClass( "disabled" );
				}
			}
		}
	},
	//Submit a game to the database
	'click .submit_game_button'(event, template) {
		var r = confirm("Are you sure?");
		if (r == true) {
			var winScore = Math.max(Number(Session.get("east_score")),
									Number(Session.get("south_score")),
									Number(Session.get("west_score")),
									Number(Session.get("north_score")));

			if (winScore == Session.get("east_score"))
				Session.set("east_score", winScore + 1000 * Number(Session.get("free_riichi_sticks")));
			else if (winScore == Session.get("south_score"))
				Session.set("south_score", winScore + 1000 * Number(Session.get("free_riichi_sticks")));
			else if (winScore == Session.get("west_score"))
				Session.set("west_score", winScore + 1000 * Number(Session.get("free_riichi_sticks")));
			else //if (winScore == Session.get("north_score"))
				Session.set("north_score", winScore + 1000 * Number(Session.get("free_riichi_sticks")));

			save_game_to_database(template.hands.get());

			//Deletes all hands to reset to empty game
			while (template.hands.pop()) {}

			Session.set("east_score", Constants.JPN_START_POINTS);
			Session.set("south_score", Constants.JPN_START_POINTS);
			Session.set("west_score", Constants.JPN_START_POINTS);
			Session.set("north_score", Constants.JPN_START_POINTS);

			Session.set("current_round", 1);
			Session.set("current_bonus", 0);
	
			Session.set("free_riichi_sticks", 0);

			Session.set("eastPlayerRiichisWon", 0);
			Session.set("southPlayerRiichisWon", 0);
			Session.set("westPlayerRiichisWon", 0);
			Session.set("northPlayerRiichisWon", 0);

			Session.set("eastFuckupTotal", 0);
			Session.set("southFuckupTotal", 0);
			Session.set("westFuckupTotal", 0);
			Session.set("northFuckupTotal", 0);

			Session.set("eastPlayerWins", 0);
			Session.set("southPlayerWins", 0);
			Session.set("westPlayerWins", 0);
			Session.set("northPlayerWins", 0);

			Session.set("eastPlayerPointsWon", 0);
			Session.set("southPlayerPointsWon", 0);
			Session.set("westPlayerPointsWon", 0);
			Session.set("northPlayerPointsWon", 0);

			Session.set("eastPlayerDoraSum", 0);
			Session.set("southPlayerDoraSum", 0);
			Session.set("westPlayerDoraSum", 0);
			Session.set("northPlayerDoraSum", 0);

			Session.set("eastPlayerLosses", 0);
			Session.set("southPlayerLosses", 0);
			Session.set("westPlayerLosses", 0);
			Session.set("northPlayerLosses", 0);

			$( ".submit_hand_button" ).removeClass( "disabled" );
			$( ".submit_game_button" ).addClass( "disabled" );
			$( ".delete_hand_button" ).addClass( "disabled" );
		}
	},
	//Toggle between different round types
	'click .nav-pills li'( event, template ) {
		var hand_type = $( event.target ).closest( "li" );

		hand_type.addClass( "active" );
		$( ".nav-pills li" ).not( hand_type ).removeClass( "active" );

		template.hand_type.set( hand_type.data( "template" ) );
	},
});

// Save the currently recorded game to database and update player statistics
function save_game_to_database(hands_array) {
	var position;

	var east_player = Session.get("current_east");
	var south_player= Session.get("current_south");
	var west_player = Session.get("current_west");
	var north_player= Session.get("current_north");

	// Initialise game to be saved
	var game = {
		timestamp: Date.now(),
		east_player: east_player,
		south_player: south_player,
		west_player: west_player,
		north_player: north_player,
		east_score: (Number(Session.get("east_score"))),
		south_score: (Number(Session.get("south_score"))),
		west_score: (Number(Session.get("west_score"))),
		north_score: (Number(Session.get("north_score"))),
		all_hands: hands_array,
	};

	// Initialise ELO calculator to update player ELO
	var jpn_elo_calculator = new EloCalculator(2000, 5, [15000, 0, -5000, -10000], game, Constants.GAME_TYPE.JAPANESE);
	var east_elo_delta = jpn_elo_calculator.eloChange(east_player);
	var south_elo_delta = jpn_elo_calculator.eloChange(south_player);
	var west_elo_delta = jpn_elo_calculator.eloChange(west_player);
	var north_elo_delta = jpn_elo_calculator.eloChange(north_player);

	var east_id = Players.findOne({japaneseLeagueName: east_player}, {})._id;
	var south_id = Players.findOne({japaneseLeagueName: south_player}, {})._id;
	var west_id = Players.findOne({japaneseLeagueName: west_player}, {})._id;
	var north_id = Players.findOne({japaneseLeagueName: north_player}, {})._id;

	if (east_elo_delta != NaN && south_elo_delta != NaN && west_elo_delta != NaN && north_elo_delta != NaN) {
		// Save ELO
		Players.update({_id: east_id}, {$inc: {japaneseElo: Number(east_elo_delta)}});
		Players.update({_id: south_id}, {$inc: {japaneseElo: Number(south_elo_delta)}});
		Players.update({_id: west_id}, {$inc: {japaneseElo: Number(west_elo_delta)}});
		Players.update({_id: north_id}, {$inc: {japaneseElo: Number(north_elo_delta)}});

		// Update number of games
		Players.update({_id: east_id}, {$inc: {japaneseGamesPlayed: 1}});
		Players.update({_id: south_id}, {$inc: {japaneseGamesPlayed: 1}});
		Players.update({_id: west_id}, {$inc: {japaneseGamesPlayed: 1}});
		Players.update({_id: north_id}, {$inc: {japaneseGamesPlayed: 1}});

		// Update bankruptcy count
		if (Number(Session.get("east_score")) < 0)
			Players.update({_id: east_id}, {$inc: {japaneseBankruptTotal: 1}});
		if (Number(Session.get("south_score")) < 0)
			Players.update({_id: south_id}, {$inc: {japaneseBankruptTotal: 1}});
		if (Number(Session.get("west_score")) < 0)
			Players.update({_id: west_id}, {$inc: {japaneseBankruptTotal: 1}});
		if (Number(Session.get("north_score")) < 0)
			Players.update({_id: north_id}, {$inc: {japaneseBankruptTotal: 1}});

		// Save chombo counts
		Players.update({_id: east_id}, {$inc: {japaneseChomboTotal: Number(Session.get("eastFuckupTotal"))}});
		Players.update({_id: south_id}, {$inc: {japaneseChomboTotal: Number(Session.get("southFuckupTotal"))}});
		Players.update({_id: west_id}, {$inc: {japaneseChomboTotal: Number(Session.get("westFuckupTotal"))}});
		Players.update({_id: north_id}, {$inc: {japaneseChomboTotal: Number(Session.get("northFuckupTotal"))}});

		// Update riichi count
		Players.update({_id: east_id}, {$inc: {japaneseRiichiTotal: Number(Session.get("east_riichi_sum"))}});
		Players.update({_id: south_id}, {$inc: {japaneseRiichiTotal: Number(Session.get("south_riichi_sum"))}});
		Players.update({_id: west_id}, {$inc: {japaneseRiichiTotal: Number(Session.get("west_riichi_sum"))}});
		Players.update({_id: north_id}, {$inc: {japaneseRiichiTotal: Number(Session.get("north_riichi_sum"))}});

		// Update hands count (Includes chombos, do we want this?)
		Players.update({_id: east_id}, {$inc: {japaneseHandsTotal: hands_array.length}});
		Players.update({_id: south_id}, {$inc: {japaneseHandsTotal: hands_array.length}});
		Players.update({_id: west_id}, {$inc: {japaneseHandsTotal: hands_array.length}});
		Players.update({_id: north_id}, {$inc: {japaneseHandsTotal: hands_array.length}});

		// Save number of hands won
		Players.update({_id: east_id}, {$inc: {japaneseHandsWin: Number(Session.get("eastPlayerWins"))}});
		Players.update({_id: south_id}, {$inc: {japaneseHandsWin: Number(Session.get("southPlayerWins"))}});
		Players.update({_id: west_id}, {$inc: {japaneseHandsWin: Number(Session.get("westPlayerWins"))}});
		Players.update({_id: north_id}, {$inc: {japaneseHandsWin: Number(Session.get("northPlayerWins"))}});

		// Save number of points won
		Players.update({_id: east_id}, {$inc: {japaneseWinPointsTotal: Number(Session.get("eastPlayerPointsWon"))}});
		Players.update({_id: south_id}, {$inc: {japaneseWinPointsTotal: Number(Session.get("southPlayerPointsWon"))}});
		Players.update({_id: west_id}, {$inc: {japaneseWinPointsTotal: Number(Session.get("westPlayerPointsWon"))}});
		Players.update({_id: north_id}, {$inc: {japaneseWinPointsTotal: Number(Session.get("northPlayerPointsWon"))}});

		// Update total dora
		Players.update({_id: east_id}, {$inc: {japaneseWinDoraTotal: Number(Session.get("eastPlayerDoraSum"))}});
		Players.update({_id: south_id}, {$inc: {japaneseWinDoraTotal: Number(Session.get("southPlayerDoraSum"))}});
		Players.update({_id: west_id}, {$inc: {japaneseWinDoraTotal: Number(Session.get("westPlayerDoraSum"))}});
		Players.update({_id: north_id}, {$inc: {japaneseWinDoraTotal: Number(Session.get("northPlayerDoraSum"))}});

		// Save number of riichied hands won
		Players.update({_id: east_id}, {$inc: {japaneseWinRiichiTotal: Number(Session.get("eastPlayerRiichisWon"))}});
		Players.update({_id: south_id}, {$inc: {japaneseWinRiichiTotal: Number(Session.get("southPlayerRiichisWon"))}});
		Players.update({_id: west_id}, {$inc: {japaneseWinRiichiTotal: Number(Session.get("westPlayerRiichisWon"))}});
		Players.update({_id: north_id}, {$inc: {japaneseWinRiichiTotal: Number(Session.get("northPlayerRiichisWon"))}});

		// Save number of hands lost
		Players.update({_id: east_id}, {$inc: {japaneseHandsLose: Number(Session.get("eastPlayerLosses"))}});
		Players.update({_id: south_id}, {$inc: {japaneseHandsLose: Number(Session.get("southPlayerLosses"))}});
		Players.update({_id: west_id}, {$inc: {japaneseHandsLose: Number(Session.get("westPlayerLosses"))}});
		Players.update({_id: north_id}, {$inc: {japaneseHandsLose: Number(Session.get("northPlayerLosses"))}});

		// Calculate positions
		// Calculate east position quickly?
		position = 4;
		if (Number(Session.get("east_score")) >= Number(Session.get("south_score"))) position--;
		if (Number(Session.get("east_score")) >= Number(Session.get("west_score"))) position--;
		if (Number(Session.get("east_score")) >= Number(Session.get("north_score"))) position--;
		Players.update({_id: east_id}, {$inc: {japanesePositionSum: position}});

		// Calculate east position quickly?
		position = 4;
		if (Number(Session.get("south_score")) > Number(Session.get("east_score"))) position--;
		if (Number(Session.get("south_score")) >= Number(Session.get("west_score"))) position--;
		if (Number(Session.get("south_score")) >= Number(Session.get("north_score"))) position--;
		Players.update({_id: south_id}, {$inc: {japanesePositionSum: position}});

		// Calculate east position quickly?
		position = 4;
		if (Number(Session.get("west_score")) > Number(Session.get("east_score"))) position--;
		if (Number(Session.get("west_score")) > Number(Session.get("south_score"))) position--;
		if (Number(Session.get("west_score")) >= Number(Session.get("north_score"))) position--;
		Players.update({_id: west_id}, {$inc: {japanesePositionSum: position}});

		// Calculate east position quickly?
		var position = 4;
		if (Number(Session.get("north_score")) > Number(Session.get("east_score"))) position--;
		if (Number(Session.get("north_score")) > Number(Session.get("south_score"))) position--;
		if (Number(Session.get("north_score")) > Number(Session.get("west_score"))) position--;
		Players.update({_id: north_id}, {$inc: {japanesePositionSum: position}});

		//Save game to database
		JapaneseHands.insert(game);
	}
};

function push_dealin_hand(template) {
	var points = Number(Session.get("current_points"));
	var fu = Number(Session.get("current_fu"));
	var dora = Number(Session.get("current_dora"));
	var winnerWind = NewGameUtils.playerToDirection(Session.get("round_winner"));
	var loserWind = NewGameUtils.playerToDirection(Session.get("round_loser"));
	var riichiSum = Session.get("free_riichi_sticks");
	var eastDelta = 0, southDelta = 0, westDelta = 0, northDelta = 0;

	if 		(winnerWind == "east") {
		Session.set("eastPlayerWins", Number(Session.get("eastPlayerWins")) + 1);
		Session.set("eastPlayerPointsWon", Number(Session.get("eastPlayerPointsWon")) + points);
		Session.set("eastPlayerDoraSum", Number(Session.get("eastPlayerDoraSum")) + dora);
		if (Session.get("east_riichi") == true) 
			Session.set("eastPlayerRiichisWon", Number(Session.get("eastPlayerRiichisWon")) + 1);
	}
	else if (winnerWind == "south") {
		Session.set("southPlayerWins", Number(Session.get("southPlayerWins")) + 1);
		Session.set("southPlayerPointsWon", Number(Session.get("southPlayerPointsWon")) + points);
		Session.set("southPlayerDoraSum", Number(Session.get("southPlayerDoraSum")) + dora);
		if (Session.get("south_riichi") == true) 
			Session.set("southPlayerRiichisWon", Number(Session.get("southPlayerRiichisWon")) + 1);
	}
	else if (winnerWind == "west") {
		Session.set("westPlayerWins", Number(Session.get("westPlayerWins")) + 1);
		Session.set("westPlayerPointsWon", Number(Session.get("westPlayerPointsWon")) + points);
		Session.set("westPlayerDoraSum", Number(Session.get("westPlayerDoraSum")) + dora);
		if (Session.get("west_riichi") == true) 
			Session.set("westPlayerRiichisWon", Number(Session.get("westPlayerRiichisWon")) + 1);
	}
	else if (winnerWind == "north") {
		Session.set("northPlayerWins", Number(Session.get("northPlayerWins")) + 1);
		Session.set("northPlayerPointsWon", Number(Session.get("northPlayerPointsWon")) + points);
		Session.set("northPlayerDoraSum", Number(Session.get("northPlayerDoraSum")) + dora);
		if (Session.get("north_riichi") == true) 
			Session.set("northPlayerRiichisWon", Number(Session.get("northPlayerRiichisWon")) + 1);
	}

	if 		(loserWind == "east")
		Session.set("eastPlayerLosses", Number(Session.get("eastPlayerLosses")) + 1);
	else if (loserWind == "south")
		Session.set("southPlayerLosses", Number(Session.get("southPlayerLosses")) + 1);
	else if (loserWind == "west")
		Session.set("westPlayerLosses", Number(Session.get("westPlayerLosses")) + 1);
	else if (loserWind == "north")
		Session.set("northPlayerLosses", Number(Session.get("northPlayerLosses")) + 1);

	if (Session.get("east_riichi") == true) {
		eastDelta -= 1000;
		riichiSum++;
		Session.set("east_riichi_sum", Number(Session.get("east_riichi_sum")) + 1);
	}
	if (Session.get("south_riichi") == true) {
		southDelta -= 1000;
		riichiSum++;
		Session.set("south_riichi_sum", Number(Session.get("south_riichi_sum")) + 1);
	}
	if (Session.get("west_riichi") == true) {
		westDelta -= 1000;
		riichiSum++;
		Session.set("west_riichi_sum", Number(Session.get("west_riichi_sum")) + 1);
	}
	if (Session.get("north_riichi") == true) {
		northDelta -= 1000;
		riichiSum++;
		Session.set("north_riichi_sum", Number(Session.get("north_riichi_sum")) + 1);
	}

	eastDelta  += dealin_delta(points, fu, "east", winnerWind, loserWind)  +
				  rewardRiichiSticks(riichiSum, "east", winnerWind);
	southDelta += dealin_delta(points, fu, "south", winnerWind, loserWind) +
				  rewardRiichiSticks(riichiSum, "south", winnerWind);
	westDelta  += dealin_delta(points, fu, "west", winnerWind, loserWind)  +
				  rewardRiichiSticks(riichiSum, "west", winnerWind);
	northDelta += dealin_delta(points, fu, "north", winnerWind, loserWind) +
				  rewardRiichiSticks(riichiSum, "north", winnerWind);

	pushHand(template, "dealin", eastDelta, southDelta, westDelta, northDelta);

	if (winnerWind == NewGameUtils.roundToDealerDirection(Session.get("current_round")))
		Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
	else {
		Session.set("current_bonus", 0);
		Session.set("current_round", Number(Session.get("current_round")) + 1)
	}

	template.riichi_round_history.push({east: Session.get("east_riichi"),
										south: Session.get("south_riichi"),
										west: Session.get("west_riichi"),
										north: Session.get("north_riichi")});
};

function push_selfdraw_hand(template) {
	var points = Number(Session.get("current_points"));
	var fu = Number(Session.get("current_fu"));
	var dora = Number(Session.get("current_dora"));
	var winnerWind = NewGameUtils.playerToDirection(Session.get("round_winner"));
	var riichiSum = Session.get("free_riichi_sticks");
	var eastDelta = 0, southDelta = 0, westDelta = 0, northDelta = 0;

	if 		(winnerWind == "east") {
		Session.set("eastPlayerWins", Number(Session.get("eastPlayerWins")) + 1);
		Session.set("eastPlayerPointsWon", Number(Session.get("eastPlayerPointsWon")) + points);
		Session.set("eastPlayerDoraSum", Number(Session.get("eastPlayerDoraSum")) + dora);
		if (Session.get("east_riichi") == true) 
			Session.set("eastPlayerRiichisWon", Number(Session.get("eastPlayerRiichisWon")) + 1);
	}
	else if (winnerWind == "south") {
		Session.set("southPlayerWins", Number(Session.get("southPlayerWins")) + 1);
		Session.set("southPlayerPointsWon", Number(Session.get("southPlayerPointsWon")) + points);
		Session.set("southPlayerDoraSum", Number(Session.get("southPlayerDoraSum")) + dora);
		if (Session.get("south_riichi") == true) 
			Session.set("southPlayerRiichisWon", Number(Session.get("southPlayerRiichisWon")) + 1);
	}
	else if (winnerWind == "west") {
		Session.set("westPlayerWins", Number(Session.get("westPlayerWins")) + 1);
		Session.set("westPlayerPointsWon", Number(Session.get("westPlayerPointsWon")) + points);
		Session.set("westPlayerDoraSum", Number(Session.get("westPlayerDoraSum")) + dora);
		if (Session.get("west_riichi") == true) 
			Session.set("westPlayerRiichisWon", Number(Session.get("westPlayerRiichisWon")) + 1);
	}
	else if (winnerWind == "north") {
		Session.set("northPlayerWins", Number(Session.get("northPlayerWins")) + 1);
		Session.set("northPlayerPointsWon", Number(Session.get("northPlayerPointsWon")) + points);
		Session.set("northPlayerDoraSum", Number(Session.get("northPlayerDoraSum")) + dora);
		if (Session.get("north_riichi") == true) 
			Session.set("northPlayerRiichisWon", Number(Session.get("northPlayerRiichisWon")) + 1);
	}

	if (Session.get("east_riichi") == true) {
		eastDelta -= 1000;
		riichiSum++;
		Session.set("east_riichi_sum", Number(Session.get("east_riichi_sum")) + 1);
	}
	if (Session.get("south_riichi") == true) {
		southDelta -= 1000;
		riichiSum++;
		Session.set("south_riichi_sum", Number(Session.get("south_riichi_sum")) + 1);
	}
	if (Session.get("west_riichi") == true) {
		westDelta -= 1000;
		riichiSum++;
		Session.set("west_riichi_sum", Number(Session.get("west_riichi_sum")) + 1);
	}
	if (Session.get("north_riichi") == true) {
		northDelta -= 1000;
		riichiSum++;
		Session.set("north_riichi_sum", Number(Session.get("north_riichi_sum")) + 1);
	}

	eastDelta  += selfdraw_delta(points, fu, "east", winnerWind) +
				  rewardRiichiSticks(riichiSum, "east", winnerWind);
	southDelta += selfdraw_delta(points, fu, "south", winnerWind) +
				  rewardRiichiSticks(riichiSum, "south", winnerWind);
	westDelta  += selfdraw_delta(points, fu, "west", winnerWind) +
				  rewardRiichiSticks(riichiSum, "west", winnerWind);
	northDelta += selfdraw_delta(points, fu, "north", winnerWind) +
				  rewardRiichiSticks(riichiSum, "north", winnerWind);

	pushHand(template, "selfdraw", eastDelta, southDelta, westDelta, northDelta);

	if (winnerWind == NewGameUtils.roundToDealerDirection(Session.get("current_round")))
		Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
	else {
		Session.set("current_bonus", 0);
		Session.set("current_round", Number(Session.get("current_round")) + 1);
	}

	template.riichi_round_history.push({east: Session.get("east_riichi"),
										south: Session.get("south_riichi"),
										west: Session.get("west_riichi"),
										north: Session.get("north_riichi")});
};

function push_nowin_hand(template) {
	var eastDelta = 0, southDelta = 0, westDelta = 0, northDelta = 0;
	var tenpaiSum = 0, tenpaiWin, tenpaiLose, riichiSum = 0;

	if (Session.get("east_tenpai") == true) tenpaiSum++;
	if (Session.get("south_tenpai") == true) tenpaiSum++;
	if (Session.get("west_tenpai") == true) tenpaiSum++;
	if (Session.get("north_tenpai") == true) tenpaiSum++;

	tenpaiWin = Constants.JPN_TENPAI_PAYOUT / tenpaiSum;
	tenpaiLose = -Constants.JPN_TENPAI_PAYOUT / (4 - tenpaiSum);
	if (tenpaiSum != 4 && tenpaiSum != 0) {
		eastDelta += Session.get("east_tenpai") == true ? tenpaiWin : tenpaiLose;
		southDelta += Session.get("south_tenpai") == true ? tenpaiWin : tenpaiLose;
		westDelta += Session.get("west_tenpai") == true ? tenpaiWin : tenpaiLose;
		northDelta += Session.get("north_tenpai") == true ? tenpaiWin : tenpaiLose;
	}

	if (Session.get("east_riichi") == true) {
		eastDelta -= 1000;
		riichiSum++;
		Session.set("east_riichi_sum", Number(Session.get("east_riichi_sum")) + 1);
	}
	if (Session.get("south_riichi") == true) {
		southDelta -= 1000;
		riichiSum++;
		Session.set("south_riichi_sum", Number(Session.get("south_riichi_sum")) + 1);
	}
	if (Session.get("west_riichi") == true) {
		westDelta -= 1000;
		riichiSum++;
		Session.set("west_riichi_sum", Number(Session.get("west_riichi_sum")) + 1);
	}
	if (Session.get("north_riichi") == true) {
		northDelta -= 1000;
		riichiSum++;
		Session.set("north_riichi_sum", Number(Session.get("north_riichi_sum")) + 1);
	}

	Session.set("free_riichi_sticks", Number(Session.get("free_riichi_sticks")) + riichiSum);

	pushHand(template, "nowin", eastDelta, southDelta, westDelta, northDelta);

	if (Session.get(NewGameUtils.roundToDealerDirection(Session.get("current_round")) + "_tenpai") == true)
		Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
	else {
		Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
		Session.set("current_round", Number(Session.get("current_round")) + 1);
	}

	template.riichi_round_history.push({east: Session.get("east_riichi"),
										south: Session.get("south_riichi"),
										west: Session.get("west_riichi"),
										north: Session.get("north_riichi")});
};

function push_restart_hand(template) {
	var eastDelta = 0, southDelta = 0, westDelta = 0, northDelta = 0;
	var riichiSum = 0;

	if (Session.get("east_riichi") == true) {
		eastDelta -= 1000;
		riichiSum++;
		Session.set("east_riichi_sum", Number(Session.get("east_riichi_sum")) + 1);
	}
	if (Session.get("south_riichi") == true) {
		southDelta -= 1000;
		riichiSum++;
		Session.set("south_riichi_sum", Number(Session.get("south_riichi_sum")) + 1);
	}
	if (Session.get("west_riichi") == true) {
		westDelta -= 1000;
		riichiSum++;
		Session.set("west_riichi_sum", Number(Session.get("west_riichi_sum")) + 1);
	}
	if (Session.get("north_riichi") == true) {
		northDelta -= 1000;
		riichiSum++;
		Session.set("north_riichi_sum", Number(Session.get("north_riichi_sum")) + 1);
	}

	Session.set("free_riichi_sticks", Number(Session.get("free_riichi_sticks")) + riichiSum);

	pushHand(template, "restart", eastDelta, southDelta, westDelta, northDelta);

	Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);

	template.riichi_round_history.push({east: Session.get("east_riichi"),
										south: Session.get("south_riichi"),
										west: Session.get("west_riichi"),
										north: Session.get("north_riichi")});
};

function push_mistake_hand(template) {
	var loserWind = NewGameUtils.playerToDirection(Session.get("round_loser"));
	var eastDelta = mistake_delta("east", loserWind);
	var southDelta = mistake_delta("south", loserWind);
	var westDelta = mistake_delta("west", loserWind);
	var northDelta = mistake_delta("north", loserWind);

	if 		(loserWind == "east")  Session.set("eastFuckupTotal",  Number(Session.get("eastFuckupTotal"))  + 1);
	else if (loserWind == "south") Session.set("southFuckupTotal", Number(Session.get("southFuckupTotal")) + 1);
	else if (loserWind == "west")  Session.set("westFuckupTotal",  Number(Session.get("westFuckupTotal"))  + 1);
	else if (loserWind == "north") Session.set("northFuckupTotal", Number(Session.get("northFuckupTotal")) + 1);

	pushHand(template, "fuckup", eastDelta, southDelta, westDelta, northDelta);

	template.riichi_round_history.push({east: false,
										south: false,
										west: false,
										north: false});
};

function push_split_pao_hand(template) {
	var points = Number(Session.get("current_points"));
	var fu = Number(Session.get("current_fu"));
	var dora = Number(Session.get("current_dora"));
	var winnerWind = NewGameUtils.playerToDirection(Session.get("round_winner"));
	var loserWind = NewGameUtils.playerToDirection(Session.get("round_loser"));
	var paoWind = NewGameUtils.playerToDirection(Session.get("round_pao_player"));
	var riichiSum = Session.get("free_riichi_sticks");
	var eastDelta = 0, southDelta = 0, westDelta = 0, northDelta = 0;

	if 		(winnerWind == "east") {
		Session.set("eastPlayerWins", Number(Session.get("eastPlayerWins")) + 1);
		Session.set("eastPlayerPointsWon", Number(Session.get("eastPlayerPointsWon")) + points);
		Session.set("eastPlayerDoraSum", Number(Session.get("eastPlayerDoraSum")) + dora);
		if (Session.get("east_riichi") == true) 
			Session.set("eastPlayerRiichisWon", Number(Session.get("eastPlayerRiichisWon")) + 1);
	}
	else if (winnerWind == "south") {
		Session.set("southPlayerWins", Number(Session.get("southPlayerWins")) + 1);
		Session.set("southPlayerPointsWon", Number(Session.get("southPlayerPointsWon")) + points);
		Session.set("southPlayerDoraSum", Number(Session.get("southPlayerDoraSum")) + dora);
		if (Session.get("south_riichi") == true) 
			Session.set("southPlayerRiichisWon", Number(Session.get("southPlayerRiichisWon")) + 1);
	}
	else if (winnerWind == "west") {
		Session.set("westPlayerWins", Number(Session.get("westPlayerWins")) + 1);
		Session.set("westPlayerPointsWon", Number(Session.get("westPlayerPointsWon")) + points);
		Session.set("westPlayerDoraSum", Number(Session.get("westPlayerDoraSum")) + dora);
		if (Session.get("west_riichi") == true) 
			Session.set("westPlayerRiichisWon", Number(Session.get("westPlayerRiichisWon")) + 1);
	}
	else if (winnerWind == "north") {
		Session.set("northPlayerWins", Number(Session.get("northPlayerWins")) + 1);
		Session.set("northPlayerPointsWon", Number(Session.get("northPlayerPointsWon")) + points);
		Session.set("northPlayerDoraSum", Number(Session.get("northPlayerDoraSum")) + dora);
		if (Session.get("north_riichi") == true) 
			Session.set("northPlayerRiichisWon", Number(Session.get("northPlayerRiichisWon")) + 1);
	}

	if 		(loserWind == "east" || paoWind == "east")
		Session.set("eastPlayerLosses", Number(Session.get("eastPlayerLosses")) + 1);
	else if (loserWind == "south" || paoWind == "south")
		Session.set("southPlayerLosses", Number(Session.get("southPlayerLosses")) + 1);
	else if (loserWind == "west" || paoWind == "west")
		Session.set("westPlayerLosses", Number(Session.get("westPlayerLosses")) + 1);
	else if (loserWind == "north" || paoWind == "north")
		Session.set("northPlayerLosses", Number(Session.get("northPlayerLosses")) + 1);

	if (Session.get("east_riichi") == true) {
		eastDelta -= 1000;
		riichiSum++;
		Session.set("east_riichi_sum", Number(Session.get("east_riichi_sum")) + 1);
	}
	if (Session.get("south_riichi") == true) {
		southDelta -= 1000;
		riichiSum++;
		Session.set("south_riichi_sum", Number(Session.get("south_riichi_sum")) + 1);
	}
	if (Session.get("west_riichi") == true) {
		westDelta -= 1000;
		riichiSum++;
		Session.set("west_riichi_sum", Number(Session.get("west_riichi_sum")) + 1);
	}
	if (Session.get("north_riichi") == true) {
		northDelta -= 1000;
		riichiSum++;
		Session.set("north_riichi_sum", Number(Session.get("north_riichi_sum")) + 1);
	}

	var value = dealin_delta(points, fu, winnerWind, winnerWind);

	if (((value / 2 ) % 100) == 50)
		value += 100;

	switch (winnerWind) {
	case "east":
		eastDelta += value;
		eastDelta += (riichiSum * 1000);
		break;
	case "south":
		southDelta += value;
		southDelta += (riichiSum * 1000);
		break;
	case "west":
		westDelta += value;
		westDelta += (riichiSum * 1000);
		break;
	case "north":
		northDelta += value;
		northDelta += (riichiSum * 1000);
		break;
	}

	Session.set("free_riichi_sticks", 0);

	if (loserWind == "east" || paoWind == "east") eastDelta -= value / 2;
	if (loserWind == "south" || paoWind == "south") southDelta -= value / 2;
	if (loserWind == "west" || paoWind == "west") westDelta -= value / 2;
	if (loserWind == "north" || paoWind == "north") northDelta -= value / 2;

	pushHand(template, "selfdraw", eastDelta, southDelta, westDelta, northDelta);

	if (winnerWind == NewGameUtils.roundToDealerDirection(Session.get("current_round")))
		Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
	else {
		Session.set("current_bonus", 0);
		Session.set("current_round", Number(Session.get("current_round")) + 1)
	}

	template.riichi_round_history.push({east: Session.get("east_riichi"),
										south: Session.get("south_riichi"),
										west: Session.get("west_riichi"),
										north: Session.get("north_riichi")});
};

function pushHand(template, handType, eastDelta, southDelta, westDelta, northDelta) {
	template.hands.push(
		{
			handType: handType,
			round: Session.get("current_round"),
			bonus: Session.get("current_bonus"),
			points: Session.get("current_points"),
			fu: Session.get("current_fu"),
			dora: Session.get("current_dora"),
			eastDelta: eastDelta,
			southDelta: southDelta,
			westDelta: westDelta,
			northDelta: northDelta,
		});

	Session.set("east_score", Number(Session.get("east_score")) + eastDelta);
	Session.set("south_score", Number(Session.get("south_score")) + southDelta);
	Session.set("west_score", Number(Session.get("west_score")) + westDelta);
	Session.set("north_score", Number(Session.get("north_score")) + northDelta);
};

function dealin_delta(points, fu, playerWind, winnerWind, loserWind) {
	var retval;

	if (playerWind != winnerWind && playerWind != loserWind)
		return 0;

	if (winnerWind != NewGameUtils.roundToDealerDirection(Number(Session.get("current_round")))) {
		switch (points) {
		case 1:
			switch (fu) {
			//Issue protection against 20 and 25 other ways but return 0
			case 20:
			case 25: retval = 0; break;
			case 30: retval = -1000; break;
			case 40: retval = -1300; break;
			case 50: retval = -1600; break;
			case 60: retval = -2000; break;
			case 70: retval = -2300; break;
			case 80: retval = -2600; break;
			case 90: retval = -2900; break;
			case 100: retval = -3200; break;
			case 110: retval = -3600; break;
			}
			break;
		case 2:
			switch (fu) {
			case 20: retval = -1300; break;
			case 25: retval = -1600; break;
			case 30: retval = -2000; break;
			case 40: retval = -2600; break;
			case 50: retval = -3200; break;
			case 60: retval = -3900; break;
			case 70: retval = -4500; break;
			case 80: retval = -5200; break;
			case 90: retval = -5800; break;
			case 100: retval = -6400; break;
			case 110: retval = -7100; break;
			}
			break;
		case 3:
			switch (fu) {
			case 20: retval = -2600; break;
			case 25: retval = -3200; break;
			case 30: retval = -3900; break;
			case 40: retval = -5200; break;
			case 50: retval = -6400; break;
			case 60: retval = -7700; break;
			default: retval = -8000; break;
			}
			break;
		case 4:
			switch (fu) {
			case 20: retval = -5200; break;
			case 25: retval = -6400; break;
			case 30: retval = -7700; break;
			default: retval = -8000; break;
			}
			break;
		case 5: retval = -8000; break;
		case 6:
		case 7: retval = -12000; break;
		case 8:
		case 9:
		case 10: retval = -16000; break;
		case 11:
		case 12: retval = -24000; break;
		case 13: retval = -32000; break;
		case 26: retval = -64000; break;
		case 39: retval = -96000; break;
		case 52: retval = -128000; break;
		}
	} else {
		switch (points) {
		case 1:
			switch (fu) {
			//Issue protection against 20 and 25 other ways
			case 20:
			case 25: retval = 0; break;
			case 30: retval = -1500; break;
			case 40: retval = -2000; break;
			case 50: retval = -2400; break;
			case 60: retval = -2900; break;
			case 70: retval = -3400; break;
			case 80: retval = -3900; break;
			case 90: retval = -4400; break;
			case 100: retval = -4800; break;
			case 110: retval = -5300; break;
			}
			break;
		case 2:
			switch (fu) {
			case 20: retval = -2000; break;
			case 25: retval = -2400; break;
			case 30: retval = -2900; break;
			case 40: retval = -3900; break;
			case 50: retval = -4800; break;
			case 60: retval = -5800; break;
			case 70: retval = -6800; break;
			case 80: retval = -7700; break;
			case 90: retval = -8700; break;
			case 100: retval = -9600; break;
			case 110: retval = -10600; break;
			}
			break;
		case 3:
			switch (fu) {
			case 20: retval = -3900; break;
			case 25: retval = -4800; break;
			case 30: retval = -5800; break;
			case 40: retval = -7700; break;
			case 50: retval = -9600; break;
			case 60: retval = -11600; break;
			default: retval = -12000; break;
			}
			break;
		case 4:
			switch (fu) {
			case 20: retval = -7700; break;
			case 25: retval = -9600; break;
			case 30: retval = -11600; break;
			default: retval = -12000; break;
			}
			break;
		case 5: retval = -12000; break;
		case 6:
		case 7: retval = -18000; break;
		case 8:
		case 9:
		case 10: retval = -24000; break;
		case 11:
		case 12: retval = -36000; break;
		case 13: retval = -48000; break;
		case 26: retval = -96000; break;
		case 39: retval = -144000; break;
		case 52: retval = -192000; break;
		}
	}

	if ( playerWind == winnerWind )
		retval = -1 * retval + 300 * Number(Session.get("current_bonus"));
	else
		retval = retval - 300 * Number(Session.get("current_bonus"));

	return retval;
};

function selfdraw_delta(points, fu, playerWind, winnerWind) {
	var retval;
	var dealerWind = NewGameUtils.roundToDealerDirection(Number(Session.get("current_round")));

	if (winnerWind != dealerWind) {
		switch (points) {
		case 1:
			switch (fu) {
			// Issue protection against 20 and 25 other ways
			case 20:
			case 25:
				retval = 0;
				break;
			case 30:
				retval = (playerWind == dealerWind ? -500 : -300);
				retval = (playerWind == winnerWind ? 1100 : retval);
				break;
			case 40:
				retval = (playerWind == dealerWind ? -700 : -400);
				retval = (playerWind == winnerWind ? 1500 : retval);
				break;
			case 50:
				retval = (playerWind == dealerWind ? -800 : -400);
				retval = (playerWind == winnerWind ? 1600 : retval);
				break;
			case 60:
				retval = (playerWind == dealerWind ? -100 : -500);
				retval = (playerWind == winnerWind ? 2000 : retval);
				break;
			case 70:
				retval = (playerWind == dealerWind ? -1200 : -600);
				retval = (playerWind == winnerWind ? 2400 : retval);
				break;
			case 80:
				retval = (playerWind == dealerWind ? -1300 : -700);
				retval = (playerWind == winnerWind ? 2700 : retval);
				break;
			case 90:
				retval = (playerWind == dealerWind ? -1500 : -800);
				retval = (playerWind == winnerWind ? 3100 : retval);
				break;
			case 100:
				retval = (playerWind == dealerWind ? -1600 : -800);
				retval = (playerWind == winnerWind ? 3200 : retval);
				break;
			case 110:
				retval = (playerWind == dealerWind ? -1800 : -900);
				retval = (playerWind == winnerWind ? 3600 : retval);
				break;
			};
			break;
		case 2:
			switch (fu) {
			case 20:
				retval = (playerWind == dealerWind ? -700 : -400);
				retval = (playerWind == winnerWind ? 1500 : retval);
				break;
			//Issue protection against selfdraw 2p25f other ways
			case 25:
				retval = 0;
				break;
			case 30:
				retval = (playerWind == dealerWind ? -1000 : -500);
				retval = (playerWind == winnerWind ? 2000 : retval);
				break;
			case 40:
				retval = (playerWind == dealerWind ? -1300 : -700);
				retval = (playerWind == winnerWind ? 2700 : retval);
				break;
			case 50:
				retval = (playerWind == dealerWind ? -1600 : -800);
				retval = (playerWind == winnerWind ? 3200 : retval);
				break;
			case 60:
				retval = (playerWind == dealerWind ? -2000 : -1000);
				retval = (playerWind == winnerWind ? 4000 : retval);
				break;
			case 70:
				retval = (playerWind == dealerWind ? -2300 : -1200);
				retval = (playerWind == winnerWind ? 4700 : retval);
				break;
			case 80:
				retval = (playerWind == dealerWind ? -2600 : -1300);
				retval = (playerWind == winnerWind ? 5200 : retval);
				break;
			case 90:
				retval = (playerWind == dealerWind ? -2900 : -1500);
				retval = (playerWind == winnerWind ? 5900 : retval);
				break;
			case 100:
				retval = (playerWind == dealerWind ? -3200 : -1600);
				retval = (playerWind == winnerWind ? 6400 : retval);
				break;
			case 110:
				retval = (playerWind == dealerWind ? -3600 : -1800);
				retval = (playerWind == winnerWind ? 7200 : retval);
				break;
			};
			break;
		case 3:
			switch (fu) {
			case 20:
				retval = (playerWind == dealerWind ? -1300 : -700);
				retval = (playerWind == winnerWind ? 2700 : retval);
				break;
			case 25:
				retval = (playerWind == dealerWind ? -1600 : -800);
				retval = (playerWind == winnerWind ? 3200 : retval);
				break;
			case 30:
				retval = (playerWind == dealerWind ? -2000 : -1000);
				retval = (playerWind == winnerWind ? 4000 : retval);
				break;
			case 40:
				retval = (playerWind == dealerWind ? -2600 : -1300);
				retval = (playerWind == winnerWind ? 5200 : retval);
				break;
			case 50:
				retval = (playerWind == dealerWind ? -3200 : -1600);
				retval = (playerWind == winnerWind ? 6400 : retval);
				break;
			case 60:
				retval = (playerWind == dealerWind ? -3900 : -2000);
				retval = (playerWind == winnerWind ? 7900 : retval);
				break;
			default:
				retval = (playerWind == dealerWind ? -4000 : -2000);
				retval = (playerWind == winnerWind ? 8000 : retval);
				break;
			};
			break;
		case 4:
			switch (fu) {
			case 20:
				retval = (playerWind == dealerWind ? -2600 : -1300);
				retval = (playerWind == winnerWind ? 5200 : retval);
				break;
			case 25:
				retval = (playerWind == dealerWind ? -3200 : -1600);
				retval = (playerWind == winnerWind ? 6400 : retval);
				break;
			case 30:
				retval = (playerWind == dealerWind ? -3900 : -2000);
				retval = (playerWind == winnerWind ? 7900 : retval);
				break;
			default:
				retval = (playerWind == dealerWind ? -4000 : -2000);
				retval = (playerWind == winnerWind ? 8000 : retval);
				break;
			};
			break;
		case 5:
			retval = (playerWind == dealerWind ? -4000 : -2000);
			retval = (playerWind == winnerWind ? 8000 : retval);
			break;
		case 6:
		case 7:
			retval = (playerWind == dealerWind ? -6000 : -3000);
			retval = (playerWind == winnerWind ? 12000 : retval);
			break;
		case 8:
		case 9:
		case 10:
			retval = (playerWind == dealerWind ? -8000 : -4000);
			retval = (playerWind == winnerWind ? 16000 : retval);
			break;
		case 11:
		case 12:
			retval = (playerWind == dealerWind ? -12000 : -6000);
			retval = (playerWind == winnerWind ? 24000 : retval);
			break;
		case 13:
			retval = (playerWind == dealerWind ? -16000 : -8000);
			retval = (playerWind == winnerWind ? 32000 : retval);
			break;
		case 26:
			retval = (playerWind == dealerWind ? -32000 : -16000);
			retval = (playerWind == winnerWind ? 64000 : retval);
			break;
		case 39:
			retval = (playerWind == dealerWind ? -48000 : -24000);
			retval = (playerWind == winnerWind ? 96000 : retval);
			break;
		case 52:
			retval = (playerWind == dealerWind ? -64000 : -32000);
			retval = (playerWind == winnerWind ? 128000 : retval);
			break;
		};
	} else {
		switch (points) {
		case 1:
			switch (fu) {
			//Issue protection against 20 and 25 fu other ways but return 0
			case 20: 
			case 25: retval = 0; break;
			case 30: retval = -500; break;
			case 40: retval = -700; break;
			case 50: retval = -800; break;
			case 60: retval = -1000; break;
			case 70: retval = -1200; break;
			case 80: retval = -1300; break;
			case 90: retval = -1500; break;
			case 100: retval = -1600; break;
			case 110: retval = -1800; break;
			};
			break;
		case 2:
			switch (fu) {
			case 20: retval = -700; break;
			//Issue protection against 2p25 selfdraw other ways but return 0
			case 25: retval = 0; break;
			case 30: retval = -1000; break;
			case 40: retval = -1300; break;
			case 50: retval = -1600; break;
			case 60: retval = -2000; break;
			case 70: retval = -1300; break;
			case 80: retval = -2600; break;
			case 90: retval = -2900; break;
			case 100: retval = -3200; break;
			case 110: retval = -3600; break;
			};
			break;
		case 3:
			switch (fu) {
			case 20: retval = -1300; break;
			case 25: retval = -1600; break;
			case 30: retval = -2000; break;
			case 40: retval = -2600; break;
			case 50: retval = -3200; break;
			case 60: retval = -3900; break;
			default: retval = -4000; break;
			};
			break;
		case 4:
			switch (fu) {
			case 20: retval = -2600; break;
			case 25: retval = -3200; break;
			case 30: retval = -3900; break;
			default: retval = -4000; break;
			}
			break;
		case 5: retval = -4000; break;
		case 6:
		case 7: retval = -6000; break;
		case 8:
		case 9:
		case 10: retval = -8000; break;
		case 11:
		case 12: retval = -12000; break;
		case 13: retval = -16000; break;
		case 26: retval = -32000; break;
		case 39: retval = -48000; break;
		case 52: retval = -64000; break;
		}
		retval *= (playerWind == winnerWind ? -3 : 1)
	}

	if ( playerWind == winnerWind )
		retval = retval + 300 * Number(Session.get("current_bonus"));
	else
		retval = retval - 100 * Number(Session.get("current_bonus"));

	return retval;

};

function mistake_delta(player, loser) {
	if (player == loser)
		return -12000;
	else
		return 4000;
};

function rewardRiichiSticks(riichiSticks, playerWind, winnerWind) {
	if (playerWind == winnerWind){
		Session.set("free_riichi_sticks", 0);
		return (riichiSticks*1000);
	}
	return 0;
};

function setAllGUIRiichisFalse() {
	Session.set("east_riichi", false);
	Session.set("south_riichi", false);
	Session.set("west_riichi", false);
	Session.set("north_riichi", false);
};

Template.jpn_points.events({
	'change select[name="points"]'(event) {
		Session.set("current_points", event.target.value);
	}
});

Template.jpn_fu.events({
	'change select[name="fu"]'(event) {
		Session.set("current_fu", event.target.value);
	}
});

Template.jpn_dora.events({
	'change select[name="dora"]'(event) {
		Session.set("current_dora", event.target.value);
	}
});
