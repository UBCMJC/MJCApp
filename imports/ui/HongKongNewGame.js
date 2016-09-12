//Databases
import { Players } from '../api/Players.js';
import { HongKongHands } from '../api/GameDatabases.js';

import { Constants } from '../api/Constants.js';
import { EloCalculator } from '../api/EloCalculator.js';
import { NewGameUtils } from '../api/NewGameUtils.js';

Template.HongKongNewGame.onCreated( function() {
	this.hand_type = new ReactiveVar( "dealin" );
	this.hands = new ReactiveArray();

	NewGameUtils.resetGameValues(Constants.HKG_START_POINTS);
});

Template.registerHelper("get_hkg_start_points", function () {
	return Constants.HKG_START_POINTS;
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
	get_round() {
		return Session.get("current_round");
	},
	get_bonus() {
		return Session.get("current_bonus");
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
			return Players.findOne({hongKongLeagueName: player}).hongKongElo;
			break;
		};
	},
	displayRoundWind(round) {
		return NewGameUtils.displayRoundWind(round, Constants.GAME_TYPE.HONG_KONG);
	},

});

Template.render_hand.helpers({
	is_dealin(hand_type) {
		return hand_type == "dealin";
	},
	is_selfdraw(hand_type) {
		return hand_type == "selfdraw";
	},
	is_nowin(hand_type) {
		return hand_type == "nowin";
	},
	is_restart(hand_type) {
		return hand_type == "restart";
	},
	is_fuckup(hand_type) {
		return hand_type == "fuckup";
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
			} else {
				$( event.target ).addClass( "active" );
				$( ".loser_buttons button" ).not( event.target ).addClass( "disabled" );
			}
		}
		Session.set("round_loser", event.target.innerHTML);
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
						Session.get("round_loser") != Constants.NO_PERSON) {
						if (Session.get("current_points") != 0) {
							push_dealin_hand(template);
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
						} else {
							window.alert("Invalid points entry!");
						}
					} else {
						window.alert("You need to fill out who self drew!");
					}
					break;

				case "nowin":
					push_nowin_hand(template);
					break;

				case "restart":
					push_restart_hand(template);
					break;

				case "fuckup":
					if (Session.get("round_loser") != Constants.NO_PERSON)
						push_fuckup_hand(template);
					else
						window.alert("You need to fill out who made the mistake!");
					break;
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
		var r = confirm("Are you sure?");
		if (r == true) {
			var del_hand = Template.instance().hands.pop();

			Session.set("east_score", Number(Session.get("east_score")) - Number(del_hand.east_delta));
			Session.set("south_score", Number(Session.get("south_score")) - Number(del_hand.south_delta));
			Session.set("west_score", Number(Session.get("west_score")) - Number(del_hand.west_delta));
			Session.set("north_score", Number(Session.get("north_score")) - Number(del_hand.north_delta));
			Session.set("current_bonus", del_hand.bonus);
			Session.set("current_round", del_hand.round);

			$( ".submit_hand_button" ).removeClass( "disabled" );
			$( ".submit_game_button" ).addClass( "disabled" );
		}
	},
	//Submit a game to the database
	'click .submit_game_button'(event, template) {
		var r = confirm("Are you sure?");
		if (r == true) {
			save_game_to_database(template.hands.get());

			//Deletes all hands
			while (template.hands.pop()) {}
			Session.set("east_score", Constants.HKG_START_POINTS);
			Session.set("south_score", Constants.HKG_START_POINTS);
			Session.set("west_score", Constants.HKG_START_POINTS);
			Session.set("north_score", Constants.HKG_START_POINTS);
			Session.set("east_score_fuckup", 0);
			Session.set("south_score_fuckup", 0);
			Session.set("west_score_fuckup", 0);
			Session.set("north_score_fuckup", 0);

			Session.set("current_round", 1);
			Session.set("current_bonus", 0);

			$( ".submit_hand_button" ).removeClass( "disabled" );
			$( ".submit_game_button" ).addClass( "disabled" );
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
		east_score: (Number(Session.get("east_score")) + Number(Session.get("east_score_fuckup"))),
		south_score: (Number(Session.get("south_score")) + Number(Session.get("south_score_fuckup"))),
		west_score: (Number(Session.get("west_score")) + Number(Session.get("west_score_fuckup"))),
		north_score: (Number(Session.get("north_score")) + Number(Session.get("north_score_fuckup"))),
		all_hands: hands_array,
	};


	var hk_elo_calculator = new EloCalculator(3000, 5, [100, 50, -50, -100], game, Constants.GAME_TYPE.HONG_KONG);
	var east_elo_delta = hk_elo_calculator.eloChange(east_player);
	var south_elo_delta = hk_elo_calculator.eloChange(south_player);
	var west_elo_delta = hk_elo_calculator.eloChange(west_player);
	var north_elo_delta = hk_elo_calculator.eloChange(north_player);

	var east_id = Players.findOne({hongKongLeagueName: east_player}, {})._id;
	var south_id = Players.findOne({hongKongLeagueName: south_player}, {})._id;
	var west_id = Players.findOne({hongKongLeagueName: west_player}, {})._id;
	var north_id = Players.findOne({hongKongLeagueName: north_player}, {})._id;

	Players.update({_id: east_id}, {$inc: {hongKongElo: east_elo_delta}});
	Players.update({_id: south_id}, {$inc: {hongKongElo: south_elo_delta}});
	Players.update({_id: west_id}, {$inc: {hongKongElo: west_elo_delta}});
	Players.update({_id: north_id}, {$inc: {hongKongElo: north_elo_delta}});

	//Save game to database
	HongKongHands.insert(game);
};

function push_dealin_hand(template) {
	var points = Number(Session.get("current_points"));
	var winnerWind = NewGameUtils.playerToDirection(Session.get("round_winner"));
	var loserWind = NewGameUtils.playerToDirection(Session.get("round_loser"));
		
	template.hands.push( 
		{
			hand_type: "dealin",
		  	round: Session.get("current_round"),
		  	bonus: Session.get("current_bonus"),
			points: Session.get("current_points"),
	  		east_delta: dealin_delta(points, "east", winnerWind, loserWind),
	  		south_delta: dealin_delta(points, "south", winnerWind, loserWind),
	  		west_delta: dealin_delta(points, "west", winnerWind, loserWind),
	  		north_delta: dealin_delta(points, "north", winnerWind, loserWind),
		});

	Session.set("east_score", Number(Session.get("east_score")) + dealin_delta(points, "east", winnerWind, loserWind));
	Session.set("south_score", Number(Session.get("south_score")) + dealin_delta(points, "south", winnerWind, loserWind));
	Session.set("west_score", Number(Session.get("west_score")) + dealin_delta(points, "west", winnerWind, loserWind));
	Session.set("north_score", Number(Session.get("north_score")) + dealin_delta(points, "north", winnerWind, loserWind));

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

	template.hands.push( 
		{
			hand_type: "selfdraw",
			round: Session.get("current_round"),
			bonus: Session.get("current_bonus"),
			points: Session.get("current_points"),
			east_delta: selfdraw_delta(points, "east", winnerWind),
			south_delta: selfdraw_delta(points, "south", winnerWind),
			west_delta: selfdraw_delta(points, "west", winnerWind),
			north_delta: selfdraw_delta(points, "north", winnerWind),
		});

	Session.set("east_score", Number(Session.get("east_score")) + selfdraw_delta(points, "east", winnerWind));
	Session.set("south_score", Number(Session.get("south_score")) + selfdraw_delta(points, "south", winnerWind));
	Session.set("west_score", Number(Session.get("west_score")) + selfdraw_delta(points, "west", winnerWind));
	Session.set("north_score", Number(Session.get("north_score")) + selfdraw_delta(points, "north", winnerWind));

	if (winnerWind == NewGameUtils.roundToDealerDirection(Session.get("current_round")))
		Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
	else {
		Session.set("current_bonus", 0);
		Session.set("current_round", Number(Session.get("current_round")) + 1);
	}
};

function push_nowin_hand(template) {
	template.hands.push(
		{	
			hand_type: "nowin",
		  	round: Session.get("current_round"),
		  	bonus: Session.get("current_bonus"),
			points: 0,
		  	east_delta: 0,
		 	south_delta: 0,
		  	west_delta: 0,
		  	north_delta: 0,
		});
	Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
};

function push_restart_hand(template) {
	template.hands.push( 
		{
			hand_type: "restart",
  			round: Session.get("current_round"),	
   			bonus: Session.get("current_bonus"),
			points: 0,
		  	east_delta: 0,
		  	south_delta: 0,
		  	west_delta: 0,
	  		north_delta: 0,
		});
	Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
};

function push_fuckup_hand(template) {
	var loserWind = NewGameUtils.playerToDirection(Session.get("round_loser"));

	template.hands.push(
		{
			hand_type: "fuckup",
			round: Session.get("current_round"),
			bonus: Session.get("current_bonus"),
			points: 0,
			east_delta: fuckup_delta("east", loserWind),
			south_delta: fuckup_delta("south", loserWind),
			west_delta: fuckup_delta("west", loserWind),
			north_delta: fuckup_delta("north", loserWind),
		});

	Session.set("east_score", Number(Session.get("east_score")) + fuckup_delta("east", loserWind));
	Session.set("south_score", Number(Session.get("south_score")) + fuckup_delta( "south", loserWind));
	Session.set("west_score", Number(Session.get("west_score")) + fuckup_delta("west", loserWind));
	Session.set("north_score", Number(Session.get("north_score")) + fuckup_delta("north", loserWind));
};

function dealin_delta(points, playerWind, winnerWind, loserWind) {
	var retval;

	switch (points) {
	case 3:
		retval = -8;
		break;
	case 4:
		retval = -16;
		break;
	case 5:
		retval = -24;
		break;
	case 6:
		retval = -32;
		break;
	case 7:
		retval = -48;
		break;
	case 8:
		retval = -64;
		break;
	case 9:
		retval = -96;
		break;
	case 10:
		retval = -128;
		break;
	}

	if ( playerWind == winnerWind )
		retval = -4 * retval;
	else if ( playerWind == loserWind )
		retval = 2 * retval;

	return retval;
}

function selfdraw_delta(points, playerWind, winnerWind) {
	var retval;

	switch (points) {
	case 3:
		retval = -16;
		break;
	case 4:
		retval = -32;
		break;
	case 5:
		retval = -48;
		break;
	case 6:
		retval = -64;
		break;
	case 7:
		retval = -96;
		break;
	case 8:
		retval = -128;
		break;
	case 9:
		retval = -192;
		break;
	case 10:
		retval = -256;
		break;
	}

	if ( playerWind == winnerWind )
		retval = -3 * retval;

	return retval;
}

function fuckup_delta(playerWind, loserWind) {
	if (playerWind == loserWind)
		return -192;
	else
		return 64;
};

Template.points.events({
	//'click .point_value'(event) {
	'change select[name="points"]'(event) {
		Session.set("current_points", event.target.value);
	}
})
