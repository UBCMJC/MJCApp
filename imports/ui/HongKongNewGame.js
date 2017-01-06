//Databases
import { Players } from '../api/Players.js';
import { HongKongHands } from '../api/GameDatabases.js';

import { Constants } from '../api/Constants.js';
import { EloCalculator } from '../api/EloCalculator.js';
import { NewGameUtils } from '../api/NewGameUtils.js';

import './HongKongNewGame.html';

Template.HongKongNewGame.onCreated( function() {
	this.hand_type = new ReactiveVar( "dealin" );
	this.hands = new ReactiveArray();

	NewGameUtils.resetGameValues(Constants.HKG_START_POINTS);
});

Template.registerHelper("hkg_round_mod4", function(round) {
	if (Number(round) > 12)
		return (Number(round) - 12);
	var retval = Number(round) % 4;
	if (retval == 0)
		retval = 4;
	return retval;
})

Template.HongKongNewGame.helpers({
	hand_type() {
		return Template.instance().hand_type.get();
	},
	players() {
		return Players.find({}, {sort: { hongKongLeagueName: 1}});
	},
	hands() {
		return Template.instance().hands.get();
	},
	get_player_delta(direction) {
		return (NewGameUtils.getDirectionScore(direction) - Constants.HKG_START_POINTS);
	},
	get_player_score(direction) {
		return NewGameUtils.getDirectionScore(direction);
	},
	get_player_score_final(direction) {
		return NewGameUtils.getDirectionScore(direction);
	},
	// Show what a player's Elo change will look like if game is ended now
	get_expected_elo_change(direction) {

		let eastPlayer  = Session.get("current_east");
		let southPlayer = Session.get("current_south");
		let westPlayer  = Session.get("current_west");
		let northPlayer = Session.get("current_north");

		if (eastPlayer  == Constants.DEFAULT_EAST ||
		    southPlayer == Constants.DEFAULT_SOUTH ||
		    westPlayer  == Constants.DEFAULT_WEST ||
		    northPlayer == Constants.DEFAULT_NORTH) {
			return "N/A";
        }

		let game = {
			timestamp: Date.now(),
			east_player: eastPlayer,
			south_player: southPlayer,
			west_player: westPlayer,
			north_player: northPlayer,
			east_score: (Number(Session.get("east_score"))),
			south_score: (Number(Session.get("south_score"))),
			west_score: (Number(Session.get("west_score"))),
			north_score: (Number(Session.get("north_score"))),
			all_hands: Template.instance().hands.get(),
		};

		let hkEloCalculator = new EloCalculator(2000, 5, [100, 50, -50, -100], game, Constants.GAME_TYPE.HONG_KONG);

		switch (direction) {
		case "east":  return hkEloCalculator.eloChange(eastPlayer).toFixed(2);
		case "south": return hkEloCalculator.eloChange(southPlayer).toFixed(2);
		case "west":  return hkEloCalculator.eloChange(westPlayer).toFixed(2);
		case "north": return hkEloCalculator.eloChange(northPlayer).toFixed(2);
		};
	},
	get_hk_elo(player) {
		switch (player) {
		case Constants.DEFAULT_EAST:
		case Constants.DEFAULT_SOUTH:
		case Constants.DEFAULT_WEST:
		case Constants.DEFAULT_NORTH:
			return "?";
			break;
		default:
			return Players.findOne({hongKongLeagueName: player}).hongKongElo.toFixed(2);
			break;
		};
	},
	displayRoundWind(round) {
		return NewGameUtils.displayRoundWind(round, Constants.GAME_TYPE.HONG_KONG);
	},

});

Template.render_hand.helpers({
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
	displayRoundWind(round) {
		return NewGameUtils.displayRoundWind(round, Constants.GAME_TYPE.HONG_KONG);
	}
});

Template.points.helpers({
	possible_points: [
		{ point: 3 },
		{ point: 4 },
		{ point: 5 },
		{ point: 6 },
		{ point: 7 },
		{ point: 8 },
		{ point: 9 },
		{ point: 10 }
	],
});

Template.HongKongNewGame.events({
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
			var pnt = Number(Session.get("current_points"));

			//Do nothing if we don't have players yet
			if (NewGameUtils.allPlayersSelected() ) {
				switch(template.hand_type.get()) {
				case "dealin":
					if (Session.get("round_winner") != Constants.NO_PERSON &&
						Session.get("round_loser") != Constants.NO_PERSON &&
						Session.get("round_winner") != Session.get("round_loser")) {
						if (Session.get("current_points") != 0) {
							push_dealin_hand(template);
							$( ".delete_hand_button" ).removeClass( "disabled" );
						} else {
							window.alert("Invalid points entry!");
						}
					} else {
						window.alert("You need to fill out who won and who dealt in!");
					}
					break;

				case "selfdraw":
					if (Session.get("round_winner") != Constants.NO_PERSON) {
						if (Session.get("current_points") != 0) {
							push_selfdraw_hand(template);
							$( ".delete_hand_button" ).removeClass( "disabled" );
						} else {
							window.alert("Invalid points entry!");
						}
					} else {
						window.alert("You need to fill out who self drew!");
					}
					break;

				case "nowin":
					push_nowin_hand(template);
					$( ".delete_hand_button" ).removeClass( "disabled" );
					break;

				case "restart":
					push_restart_hand(template);
					$( ".delete_hand_button" ).removeClass( "disabled" );
					break;

				case "mistake":
					if (Session.get("round_loser") != Constants.NO_PERSON) {
						push_mistake_hand(template);
						$( ".delete_hand_button" ).removeClass( "disabled" );
					}

					else
						window.alert("You need to fill out who made the mistake!");
					break;

				case "dealin_pao":
					if (Session.get("round_winner") != Constants.NO_PERSON &&
						Session.get("round_loser") != Constants.NO_PERSON &&
						Session.get("round_pao_player") != Constants.NO_PERSON &&
						Session.get("round_winner") != Session.get("round_loser") &&
						Session.get("round_pao_player") != Session.get("round_winner")) {
						if (Session.get("current_points") != 0) {
							push_dealin_pao_hand(template);
							$( ".delete_hand_button" ).removeClass( "disabled" );
						} else {
							window.alert("Invalid points entry!");
						}
					} else {
						window.alert("You need to fill out who won, who dealt in, and who has pao penalty!");
					}
					break;

				case "selfdraw_pao":
					if (Session.get("round_winner") != Constants.NO_PERSON &&
						Session.get("round_pao_player") != Constants.NO_PERSON &&
						Session.get("round_winner")	!= Session.get("round_pao_player")) {
						if (Session.get("current_points") != 0) {
							push_selfdraw_pao_hand(template);
							$( ".delete_hand_button" ).removeClass( "disabled" );
						} else {
							window.alert("Invalid points entry!");
						}
					} else {
						window.alert("You need to fill out who won, who dealt in, and who has pao penalty!");
					}
					break;

				default:
					console.log("Something went wrong; Received hand type: " + template.hand_type);
					break;
				};
			} else {
				window.alert("You need to fill out the player information!");
			}

			if (NewGameUtils.someoneBankrupt() ||
				Session.get("current_round") > 16)
			{
				$( event.target ).addClass( "disabled");
				$( ".submit_game_button" ).removeClass( "disabled" );
			}
		}

	},
	//Remove the last submitted hand
	'click .delete_hand_button'(event, template) {
		if ( !$( event.target ).hasClass( "disabled" )) {
			var r = confirm("Are you sure you want to delete the last hand?");
			if (r == true) {
				var del_hand = Template.instance().hands.pop();

				Session.set("east_score", Number(Session.get("east_score")) - Number(del_hand.eastDelta));
				Session.set("south_score", Number(Session.get("south_score")) - Number(del_hand.southDelta));
				Session.set("west_score", Number(Session.get("west_score")) - Number(del_hand.westDelta));
				Session.set("north_score", Number(Session.get("north_score")) - Number(del_hand.northDelta));
				Session.set("current_bonus", del_hand.bonus);
				Session.set("current_round", del_hand.round);

				// Rollback chombo stat
				if (del_hand.handType == "mistake")
					NewGameUtils.rollbackChomboStat(del_hand);

				// Rollback hand stats for wins/losses
				if (del_hand.handType == "dealin" || del_hand.handType == "selfdraw") {
					// win stat
					NewGameUtils.rollbackHandWinStat(del_hand);

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
		var r = confirm("Are you sure you want to submit this game?");
		if (r == true) {
			save_game_to_database(template.hands.get());

			//Deletes all hands
			while (template.hands.pop()) {}
			Session.set("east_score", Constants.HKG_START_POINTS);
			Session.set("south_score", Constants.HKG_START_POINTS);
			Session.set("west_score", Constants.HKG_START_POINTS);
			Session.set("north_score", Constants.HKG_START_POINTS);

			Session.set("current_round", 1);
			Session.set("current_bonus", 0);

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

function save_game_to_database(hands_array) {

	var east_player = Session.get("current_east");
	var south_player= Session.get("current_south");
	var west_player = Session.get("current_west");
	var north_player= Session.get("current_north");

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


	var hk_elo_calculator = new EloCalculator(2000, 5, [100, 50, -50, -100], game, Constants.GAME_TYPE.HONG_KONG);
	var east_elo_delta = hk_elo_calculator.eloChange(east_player);
	var south_elo_delta = hk_elo_calculator.eloChange(south_player);
	var west_elo_delta = hk_elo_calculator.eloChange(west_player);
	var north_elo_delta = hk_elo_calculator.eloChange(north_player);

	var east_id = Players.findOne({hongKongLeagueName: east_player}, {})._id;
	var south_id = Players.findOne({hongKongLeagueName: south_player}, {})._id;
	var west_id = Players.findOne({hongKongLeagueName: west_player}, {})._id;
	var north_id = Players.findOne({hongKongLeagueName: north_player}, {})._id;

	if (east_elo_delta != NaN && south_elo_delta != NaN && west_elo_delta != NaN && north_elo_delta != NaN) {
		// Save ELO
		Players.update({_id: east_id}, {$inc: {hongKongElo: east_elo_delta}});
		Players.update({_id: south_id}, {$inc: {hongKongElo: south_elo_delta}});
		Players.update({_id: west_id}, {$inc: {hongKongElo: west_elo_delta}});
		Players.update({_id: north_id}, {$inc: {hongKongElo: north_elo_delta}});

		// Save number of games
		Players.update({_id: east_id}, {$inc: {hongKongGamesPlayed: 1}});
		Players.update({_id: south_id}, {$inc: {hongKongGamesPlayed: 1}});
		Players.update({_id: west_id}, {$inc: {hongKongGamesPlayed: 1}});
		Players.update({_id: north_id}, {$inc: {hongKongGamesPlayed: 1}});

		// Save bankruptcy counts
		if (Number(Session.get("east_score")) < 0)
			Players.update({_id: east_id}, {$inc: {hongKongBankruptTotal: 1}});
		if (Number(Session.get("south_score")) < 0)
			Players.update({_id: south_id}, {$inc: {hongKongBankruptTotal: 1}});
		if (Number(Session.get("west_score")) < 0)
			Players.update({_id: west_id}, {$inc: {hongKongBankruptTotal: 1}});
		if (Number(Session.get("north_score")) < 0)
			Players.update({_id: north_id}, {$inc: {hongKongBankruptTotal: 1}});

		// Save chombo counts
		Players.update({_id: east_id}, {$inc: {hongKongChomboTotal: Number(Session.get("eastFuckupTotal"))}});
		Players.update({_id: south_id}, {$inc: {hongKongChomboTotal: Number(Session.get("southFuckupTotal"))}});
		Players.update({_id: west_id}, {$inc: {hongKongChomboTotal: Number(Session.get("westFuckupTotal"))}});
		Players.update({_id: north_id}, {$inc: {hongKongChomboTotal: Number(Session.get("northFuckupTotal"))}});

		// Save number of hands (includes chombos, do we want this?)
		Players.update({_id: east_id}, {$inc: {hongKongHandsTotal: hands_array.length}});
		Players.update({_id: south_id}, {$inc: {hongKongHandsTotal: hands_array.length}});
		Players.update({_id: west_id}, {$inc: {hongKongHandsTotal: hands_array.length}});
		Players.update({_id: north_id}, {$inc: {hongKongHandsTotal: hands_array.length}});

		// Save number of hands won
		Players.update({_id: east_id}, {$inc: {hongKongHandsWin: Number(Session.get("eastPlayerWins"))}});
		Players.update({_id: south_id}, {$inc: {hongKongHandsWin: Number(Session.get("southPlayerWins"))}});
		Players.update({_id: west_id}, {$inc: {hongKongHandsWin: Number(Session.get("westPlayerWins"))}});
		Players.update({_id: north_id}, {$inc: {hongKongHandsWin: Number(Session.get("northPlayerWins"))}});

		// Save number of points won
		Players.update({_id: east_id}, {$inc: {hongKongWinPointsTotal: Number(Session.get("eastPlayerPointsWon"))}});
		Players.update({_id: south_id}, {$inc: {hongKongWinPointsTotal: Number(Session.get("southPlayerPointsWon"))}});
		Players.update({_id: west_id}, {$inc: {hongKongWinPointsTotal: Number(Session.get("westPlayerPointsWon"))}});
		Players.update({_id: north_id}, {$inc: {hongKongWinPointsTotal: Number(Session.get("northPlayerPointsWon"))}});

		// Save number of hands lost
		Players.update({_id: east_id}, {$inc: {hongKongHandsLose: Number(Session.get("eastPlayerLosses"))}});
		Players.update({_id: south_id}, {$inc: {hongKongHandsLose: Number(Session.get("southPlayerLosses"))}});
		Players.update({_id: west_id}, {$inc: {hongKongHandsLose: Number(Session.get("westPlayerLosses"))}});
		Players.update({_id: north_id}, {$inc: {hongKongHandsLose: Number(Session.get("northPlayerLosses"))}});

		// Calculate positions
		// Calculate east position quickly?
		position = 4;
		if (Number(Session.get("east_score")) >= Number(Session.get("south_score"))) position--;
		if (Number(Session.get("east_score")) >= Number(Session.get("west_score"))) position--;
		if (Number(Session.get("east_score")) >= Number(Session.get("north_score"))) position--;
		Players.update({_id: east_id}, {$inc: {hongKongPositionSum: position}});

		// Calculate east position quickly?
		position = 4;
		if (Number(Session.get("south_score")) > Number(Session.get("east_score"))) position--;
		if (Number(Session.get("south_score")) >= Number(Session.get("west_score"))) position--;
		if (Number(Session.get("south_score")) >= Number(Session.get("north_score"))) position--;
		Players.update({_id: south_id}, {$inc: {hongKongPositionSum: position}});

		// Calculate east position quickly?
		position = 4;
		if (Number(Session.get("west_score")) > Number(Session.get("east_score"))) position--;
		if (Number(Session.get("west_score")) > Number(Session.get("south_score"))) position--;
		if (Number(Session.get("west_score")) >= Number(Session.get("north_score"))) position--;
		Players.update({_id: west_id}, {$inc: {hongKongPositionSum: position}});

		// Calculate east position quickly?
		var position = 4;
		if (Number(Session.get("north_score")) > Number(Session.get("east_score"))) position--;
		if (Number(Session.get("north_score")) > Number(Session.get("south_score"))) position--;
		if (Number(Session.get("north_score")) > Number(Session.get("west_score"))) position--;
		Players.update({_id: north_id}, {$inc: {hongKongPositionSum: position}});

		//Save game to database
		HongKongHands.insert(game);
	}
};

function push_dealin_hand(template) {
	var points = Number(Session.get("current_points"));
	var winnerWind = NewGameUtils.playerToDirection(Session.get("round_winner"));
	var loserWind = NewGameUtils.playerToDirection(Session.get("round_loser"));

 	var eastDelta = dealin_delta(points, "east", winnerWind, loserWind);
	var southDelta = dealin_delta(points, "south", winnerWind, loserWind);
	var westDelta = dealin_delta(points, "west", winnerWind, loserWind);
	var northDelta = dealin_delta(points, "north", winnerWind, loserWind);

	if 		(winnerWind == "east") {
		Session.set("eastPlayerWins", Number(Session.get("eastPlayerWins")) + 1);
		Session.set("eastPlayerPointsWon", Number(Session.get("eastPlayerPointsWon")) + points);
	}
	else if (winnerWind == "south") {
		Session.set("southPlayerWins", Number(Session.get("southPlayerWins")) + 1);
		Session.set("southPlayerPointsWon", Number(Session.get("southPlayerPointsWon")) + points);
	}
	else if (winnerWind == "west") {
		Session.set("westPlayerWins", Number(Session.get("westPlayerWins")) + 1);
		Session.set("westPlayerPointsWon", Number(Session.get("westPlayerPointsWon")) + points);
	}
	else if (winnerWind == "north") {
		Session.set("northPlayerWins", Number(Session.get("northPlayerWins")) + 1);
		Session.set("northPlayerPointsWon", Number(Session.get("northPlayerPointsWon")) + points);
	}

	if 		(loserWind == "east")
		Session.set("eastPlayerLosses", Number(Session.get("eastPlayerLosses")) + 1);
	else if (loserWind == "south")
		Session.set("southPlayerLosses", Number(Session.get("southPlayerLosses")) + 1);
	else if (loserWind == "west")
		Session.set("westPlayerLosses", Number(Session.get("westPlayerLosses")) + 1);
	else if (loserWind == "north")
		Session.set("northPlayerLosses", Number(Session.get("northPlayerLosses")) + 1);

	pushHand(template, "dealin", eastDelta, southDelta, westDelta, northDelta);

	if (winnerWind == NewGameUtils.roundToDealerDirection(Session.get("current_round")))
		Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
	else {
		Session.set("current_bonus", 0);
		Session.set("current_round", Number(Session.get("current_round")) + 1)
	}
};

function push_selfdraw_hand(template) {
	var points = Number(Session.get("current_points"));
	var winnerWind = NewGameUtils.playerToDirection(Session.get("round_winner"));

 	var eastDelta = selfdraw_delta(points, "east", winnerWind);
	var southDelta = selfdraw_delta(points, "south", winnerWind);
	var westDelta = selfdraw_delta(points, "west", winnerWind);
	var northDelta = selfdraw_delta(points, "north", winnerWind);

	if 		(winnerWind == "east") {
		Session.set("eastPlayerWins", Number(Session.get("eastPlayerWins")) + 1);
		Session.set("eastPlayerPointsWon", Number(Session.get("eastPlayerPointsWon")) + points);
	}
	else if (winnerWind == "south") {
		Session.set("southPlayerWins", Number(Session.get("southPlayerWins")) + 1);
		Session.set("southPlayerPointsWon", Number(Session.get("southPlayerPointsWon")) + points);
	}
	else if (winnerWind == "west") {
		Session.set("westPlayerWins", Number(Session.get("westPlayerWins")) + 1);
		Session.set("westPlayerPointsWon", Number(Session.get("westPlayerPointsWon")) + points);
	}
	else if (winnerWind == "north") {
		Session.set("northPlayerWins", Number(Session.get("northPlayerWins")) + 1);
		Session.set("northPlayerPointsWon", Number(Session.get("northPlayerPointsWon")) + points);
	}

	pushHand(template, "selfdraw", eastDelta, southDelta, westDelta, northDelta);

	if (winnerWind == NewGameUtils.roundToDealerDirection(Session.get("current_round")))
		Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
	else {
		Session.set("current_bonus", 0);
		Session.set("current_round", Number(Session.get("current_round")) + 1);
	}
};

function push_dealin_pao_hand(template) {
	var points = Number(Session.get("current_points"));
	var winnerWind = NewGameUtils.playerToDirection(Session.get("round_winner"));
	var loserWind = NewGameUtils.playerToDirection(Session.get("round_loser"));
	var paoWind = NewGameUtils.playerToDirection(Session.get("round_pao_player"));
	var eastDelta = 0, southDelta = 0, westDelta = 0, northDelta = 0;

	if 		(winnerWind == "east") {
		Session.set("eastPlayerWins", Number(Session.get("eastPlayerWins")) + 1);
		Session.set("westPlayerPointsWon", Number(Session.get("westPlayerPointsWon")) + points);
	}
	else if (winnerWind == "south") {
		Session.set("southPlayerWins", Number(Session.get("southPlayerWins")) + 1);
		Session.set("southPlayerPointsWon", Number(Session.get("southPlayerPointsWon")) + points);
	}
	else if (winnerWind == "west") {
		Session.set("westPlayerWins", Number(Session.get("westPlayerWins")) + 1);
		Session.set("westPlayerPointsWon", Number(Session.get("westPlayerPointsWon")) + points);
	}
	else if (winnerWind == "north") {
		Session.set("northPlayerWins", Number(Session.get("northPlayerWins")) + 1);
		Session.set("northPlayerPointsWon", Number(Session.get("northPlayerPointsWon")) + points);
	}

	if 		(loserWind == "east" || paoWind == "east")
		Session.set("eastPlayerLosses", Number(Session.get("eastPlayerLosses")) + 1);
	else if (loserWind == "south" || paoWind == "south")
		Session.set("southPlayerLosses", Number(Session.get("southPlayerLosses")) + 1);
	else if (loserWind == "west" || paoWind == "west")
		Session.set("westPlayerLosses", Number(Session.get("westPlayerLosses")) + 1);
	else if (loserWind == "north" || paoWind == "north")
		Session.set("northPlayerLosses", Number(Session.get("northPlayerLosses")) + 1);

	var value = dealin_delta(points, winnerWind, winnerWind);

	switch (winnerWind) {
	case "east": eastDelta += value; break;
	case "south": southDelta += value; break;
	case "west": westDelta += value; break;
	case "north": northDelta += value; break;
	}

	if 		(loserWind == "east")  eastDelta -= value / 2;
	else if (loserWind == "south") southDelta -= value / 2;
	else if (loserWind == "west")  westDelta -= value / 2;
	else if (loserWind == "north") northDelta -= value / 2;

	if		(paoWind == "east")  eastDelta -= value / 2;
	else if (paoWind == "south") southDelta -= value / 2;
	else if (paoWind == "west")  westDelta -= value / 2;
	else if (paoWind == "north") northDelta -= value / 2;

	pushHand(template, "dealin", eastDelta, southDelta, westDelta, northDelta);

	if (winnerWind == NewGameUtils.roundToDealerDirection(Session.get("current_round")))
		Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
	else {
		Session.set("current_bonus", 0);
		Session.set("current_round", Number(Session.get("current_round")) + 1);
	}
};

function push_selfdraw_pao_hand(template) {
	var points = Number(Session.get("current_points"));
	var winnerWind = NewGameUtils.playerToDirection(Session.get("round_winner"));
	var paoWind = NewGameUtils.playerToDirection(Session.get("round_pao_player"));
	var eastDelta = 0, southDelta = 0, westDelta = 0, northDelta = 0;

	if 		(winnerWind == "east") {
		Session.set("eastPlayerWins", Number(Session.get("eastPlayerWins")) + 1);
		Session.set("westPlayerPointsWon", Number(Session.get("westPlayerPointsWon")) + points);
	}
	else if (winnerWind == "south") {
		Session.set("southPlayerWins", Number(Session.get("southPlayerWins")) + 1);
		Session.set("southPlayerPointsWon", Number(Session.get("southPlayerPointsWon")) + points);
	}
	else if (winnerWind == "west") {
		Session.set("westPlayerWins", Number(Session.get("westPlayerWins")) + 1);
		Session.set("westPlayerPointsWon", Number(Session.get("westPlayerPointsWon")) + points);
	}
	else if (winnerWind == "north") {
		Session.set("northPlayerWins", Number(Session.get("northPlayerWins")) + 1);
		Session.set("northPlayerPointsWon", Number(Session.get("northPlayerPointsWon")) + points);
	}

	if 		(paoWind == "east")
		Session.set("eastPlayerLosses", Number(Session.get("eastPlayerLosses")) + 1);
	else if (paoWind == "south")
		Session.set("southPlayerLosses", Number(Session.get("southPlayerLosses")) + 1);
	else if (paoWind == "west")
		Session.set("westPlayerLosses", Number(Session.get("westPlayerLosses")) + 1);
	else if (paoWind == "north")
		Session.set("northPlayerLosses", Number(Session.get("northPlayerLosses")) + 1);

	var value = selfdraw_delta(points, winnerWind, winnerWind);

	if 		(winnerWind == "east") 	eastDelta += value;
	else if (winnerWind == "south") southDelta += value;
	else if (winnerWind == "west")  westDelta += value;
	else if (winnerWind == "north") northDelta += value;

	if 		(paoWind == "east")  eastDelta -= value;
	else if (paoWind == "south") southDelta -= value;
	else if (paoWind == "west")  westDelta -= value;
	else if (paoWind == "north") northDelta -= value;

	pushHand(template, "selfdraw", eastDelta, southDelta, westDelta, northDelta);

	if (winnerWind == NewGameUtils.roundToDealerDirection(Session.get("current_round")))
		Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
	else {
		Session.set("current_bonus", 0);
		Session.set("current_round", Number(Session.get("current_round")) + 1);
	}
};

function push_nowin_hand(template) {
	pushHand(template, "nowin", 0, 0, 0, 0);

	Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
};

function push_restart_hand(template) {
	pushHand(template, "restart", 0, 0, 0, 0);

	Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
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
};

function pushHand(template, handType, eastDelta, southDelta, westDelta, northDelta) {
	template.hands.push(
		{
			handType: handType,
		  	round: Session.get("current_round"),
		  	bonus: Session.get("current_bonus"),
			points: Session.get("current_points"),
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

function dealin_delta(points, playerWind, winnerWind, loserWind) {
	var retval;

	switch (points) {
	case 3: retval = -8; break;
	case 4: retval = -16; break;
	case 5: retval = -24; break;
	case 6: retval = -32; break;
	case 7: retval = -48; break;
	case 8: retval = -64; break;
	case 9: retval = -96; break;
	case 10: retval = -128; break;
	}

	if ( playerWind == winnerWind ) retval = -4 * retval;
	else if ( playerWind == loserWind ) retval = 2 * retval;

	return retval;
};

function selfdraw_delta(points, playerWind, winnerWind) {
	var retval;

	switch (points) {
	case 3: retval = -16; break;
	case 4: retval = -32; break;
	case 5: retval = -48; break;
	case 6: retval = -64; break;
	case 7: retval = -96; break;
	case 8: retval = -128; break;
	case 9: retval = -192; break;
	case 10: retval = -256; break;
	}

	if ( playerWind == winnerWind )
		retval = -3 * retval;

	return retval;
};

function mistake_delta(playerWind, loserWind) {
	if (playerWind == loserWind) return -192;
	else return 64;
};

Template.points.events({
	//'click .point_value'(event) {
	'change select[name="points"]'(event) {
		Session.set("current_points", event.target.value);
	}
});
