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
		return Players.find({}, {sort: { name: 1}});
	},
	hands() {
		return Template.instance().hands.get();
	},
	get_player_delta(direction_score) {
		return (Number(Session.get(direction_score)) - Constants.HKG_START_POINTS);
	},
	get_player_score(direction_score) {
		return Session.get(direction_score);
	},
	//Horribly exploitive of javascript.  This is why I hate this language
	get_player_score_final(direction_score) {
		return (Number(Session.get(direction_score)) + 
			    Number(Session.get(direction_score + "_fuckup")));
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
			return Players.findOne({name: player}).hongKongElo;
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

			switch(template.hand_type.get()) {
			case "dealin":
				//Do nothing if we don't have players yet
				if (NewGameUtils.allPlayersSelected() ) {
					push_dealin_hand(template);
				}
				else {
					window.alert("You need to fill out the above information!");
				}
				break;

			case "selfdraw":
				push_selfdraw_hand(template);
				break;

			case "nowin":
				push_nowin_hand(template);
				break;	

			case "restart":
				push_restart_hand(template);
				break;	

			case "fuckup":
				push_fuckup_hand(template);
				break;
			
			default:
				console.log("Something went wrong; Received hand type: " + template.hand_type);
				break;
			};

			if (Session.get("east_score") < 0 || 
				Session.get("south_score") < 0 ||
				Session.get("west_score") < 0 ||
				Session.get("north_score") < 0 ||
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

	var east_id = Players.findOne({name: east_player}, {})._id;
	var south_id = Players.findOne({name: south_player}, {})._id;
	var west_id = Players.findOne({name: west_player}, {})._id;
	var north_id = Players.findOne({name: north_player}, {})._id;

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

	if (winnerWind == hkRoundToDirection(Session.get("current_round")))
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

	if (winnerWind == hkRoundToDirection(Session.get("current_round")))
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

function hkRoundToDirection(round) {
	if (round % 4 == 1) return "east";
	if (round % 4 == 2) return "south";
	if (round % 4 == 3) return "west";
	if (round % 4 == 0) return "north";
};

function dealin_delta(points, player, winner, loser) {
	var exponent = points;
	var direction = -1;

	if ( player == winner ) {
		direction = 1;
		exponent += 2;
	} 
	else if ( player == loser ) {
		exponent++;
	}
	var retval = direction * Math.pow(2, exponent);
	return retval;
};

function selfdraw_delta(points, player, winner) {
	var exponent = points + 1;
	var direction = -1;

	if ( player == winner ) {
		direction = 1.5;
		exponent++;
	}

	var retval = direction * Math.pow(2, exponent);
	return retval;
};

function fuckup_delta(player, loser) {
	if (player == loser)
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
