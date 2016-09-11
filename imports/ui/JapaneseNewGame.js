//Databases
import { Players } from '../api/Players.js';
import { JapaneseHands } from '../api/GameDatabases.js';

import { Constants } from '../api/Constants.js';
import { EloCalculator } from '../api/EloCalculator.js';
import { NewGameUtils } from '../api/NewGameUtils.js';

Template.JapaneseNewGame.onCreated( function() {
	this.hand_type = new ReactiveVar( "dealin" );
	this.hands = new ReactiveArray();

	NewGameUtils.resetGameValues(Constants.JPN_START_POINTS);
});

Template.registerHelper("get_jpn_start_points", function () {
	return Constants.JPN_START_POINTS;
});
Template.registerHelper("jpn_round_mod4", function(round) {
	if (Number(round) > 8)
		return (Number(round) - 8);
	var retval = Number(round) % 4;
	if (retval == 0)
		retval = 4;
	return retval;
})

Template.JapaneseNewGame.helpers({
	hand_type() {
		return Template.instance().hand_type.get();
	},
	players() {
		return Players.find({}, {sort: { japaneseLeagueName: 1}});
	},
	hands() {
		return Template.instance().hands.get();
	},
	get_player_delta(direction_score) {
		return (Number(Session.get(direction_score)) - Constants.JPN_START_POINTS);
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
	get_jpn_elo(player) {
		switch (player) {
		case Constants.DEFAULT_EAST:
		case Constants.DEFAULT_SOUTH:
		case Constants.DEFAULT_WEST:
		case Constants.DEFAULT_NORTH:
			return "?";
			break;
		default:
			return Players.findOne({japaneseLeagueName: player}).japaneseElo;
			break;
		};
	},
	displayRoundWind(round) {
		return NewGameUtils.displayRoundWind(round, Constants.GAME_TYPE.JAPANESE);
	},

});


Template.jpn_render_hand.helpers({
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
	next_round(round) {
		return (round + 1);
	},
	displayRoundWind(round) {
		return NewGameUtils.displayRoundWind(round, Constants.GAME_TYPE.JAPANESE);
	},
})

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
	],
});

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
				if (all_players_selected()) {
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
				console.log(template.hand_type);
				break;
			};

			if (Session.get("east_score") < 0 || 
				Session.get("south_score") < 0 ||
				Session.get("west_score") < 0 ||
				Session.get("north_score") < 0)
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
			Session.set("east_score", JPN_START_POINTS);
			Session.set("south_score", JPN_START_POINTS);
			Session.set("west_score", JPN_START_POINTS);
			Session.set("north_score", JPN_START_POINTS);
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

	var jpn_elo_calculator = new EloCalculator(3000, 5, [15000, 0, -5000, -10000], game);
	var east_elo_delta = jpn_elo_calculator.eloChange(east_player);
	var south_elo_delta = jpn_elo_calculator.eloChange(south_player);
	var west_elo_delta = jpn_elo_calculator.eloChange(west_player);
	var north_elo_delta = jpn_elo_calculator.eloChange(north_player);

	var east_id = Players.findOne({japaneseLeagueName: east_player}, {})._id;
	var south_id = Players.findOne({japaneseLeagueName: south_player}, {})._id;
	var west_id = Players.findOne({japaneseLeagueName: west_player}, {})._id;
	var north_id = Players.findOne({japaneseLeagueName: north_player}, {})._id;

	console.log("ID: " + east_id);

	Players.update({_id: east_id}, {$inc: {japaneseElo: east_elo_delta}});
	Players.update({_id: south_id}, {$inc: {japaneseElo: south_elo_delta}});
	Players.update({_id: west_id}, {$inc: {japaneseElo: west_elo_delta}});
	Players.update({_id: north_id}, {$inc: {japaneseElo: north_elo_delta}});

	//Save game to database
	Japanese_Hands.insert(game);
}

function push_dealin_hand(template) {
	var pnt = Number(Session.get("current_points"));
	var win_direc = player_to_direction(Session.get("round_winner"));
	var lose_direc = player_to_direction(Session.get("round_loser"));
		
	template.hands.push( 
		{
			hand_type: "dealin",
		  	round: Session.get("current_round"),
		  	bonus: Session.get("current_bonus"),
			points: Session.get("current_points"),
	  		east_delta: dealin_delta(pnt, "east", win_direc, lose_direc),
	  		south_delta: dealin_delta(pnt, "south", win_direc, lose_direc),
	  		west_delta: dealin_delta(pnt, "west", win_direc, lose_direc),
	  		north_delta: dealin_delta(pnt, "north", win_direc, lose_direc),
		}
	);

	Session.set("east_score", Number(Session.get("east_score")) + dealin_delta(pnt, "east", win_direc, lose_direc));
	Session.set("south_score", Number(Session.get("south_score")) + dealin_delta(pnt, "south", win_direc, lose_direc));
	Session.set("west_score", Number(Session.get("west_score")) + dealin_delta(pnt, "west", win_direc, lose_direc));
	Session.set("north_score", Number(Session.get("north_score")) + dealin_delta(pnt, "north", win_direc, lose_direc));

	if (win_direc == round_to_direction(Session.get("current_round")))
		Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
	else {
		Session.set("current_bonus", 0);
		Session.set("current_round", Number(Session.get("current_round")) + 1)
	}
}

function push_selfdraw_hand(template) {
	var pnt = Number(Session.get("current_points"));
	var win_direc = player_to_direction(Session.get("round_winner"));

	template.hands.push( 
		{
			hand_type: "selfdraw",
			round: Session.get("current_round"),
			bonus: Session.get("current_bonus"),
			points: Session.get("current_points"),
			east_delta: selfdraw_delta(pnt, "east", win_direc),
			south_delta: selfdraw_delta(pnt, "south", win_direc),
			west_delta: selfdraw_delta(pnt, "west", win_direc),
			north_delta: selfdraw_delta(pnt, "north", win_direc),
		}
	);

	Session.set("east_score", Number(Session.get("east_score")) + selfdraw_delta(pnt, "east", win_direc));
	Session.set("south_score", Number(Session.get("south_score")) + selfdraw_delta(pnt, "south", win_direc));
	Session.set("west_score", Number(Session.get("west_score")) + selfdraw_delta(pnt, "west", win_direc));
	Session.set("north_score", Number(Session.get("north_score")) + selfdraw_delta(pnt, "north", win_direc));

	if (win_direc == round_to_direction(Session.get("current_round")))
		Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
	else {
		Session.set("current_bonus", 0);
		Session.set("current_round", Number(Session.get("current_round")) + 1);
	}
}

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
		}
	);
	Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
}

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
		}
	);
	Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
}

function push_fuckup_hand(template) {
	var lose_direc = player_to_direction(Session.get("round_loser"));

	template.hands.push(
		{
			hand_type: "fuckup",
			round: Session.get("current_round"),
			bonus: Session.get("current_bonus"),
			points: 0,
			east_delta: fuckup_delta("east", lose_direc),
			south_delta: fuckup_delta("south", lose_direc),
			west_delta: fuckup_delta("west", lose_direc),
			north_delta: fuckup_delta("north", lose_direc),
		}
	);
}

function player_to_direction(player) {
	if (player == Session.get("current_east")) return "east";
	if (player == Session.get("current_south")) return "south";
	if (player == Session.get("current_west")) return "west";
	if (player == Session.get("current_north")) return "north";
}

function round_to_direction(round) {
	if (round % 4 == 1) return "east";
	if (round % 4 == 2) return "south";
	if (round % 4 == 3) return "west";
	if (round % 4 == 0) return "north";
}

function dealin_delta(points, player, winner, loser) {
	var exponent = points - 1;
	
	if (exponent == 5 || exponent == 6)
		exponent = 4;
	else if (exponent == 7 || exponent == 8 || exponent == 9)
		exponent = 5;
	if (exponent >= 10)
		exponent = 6;

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
}

function selfdraw_delta(points, player, winner) {
	var exponent = points;

	if (exponent == 5 || exponent == 6)
		exponent = 4;
	else if (exponent == 7 || exponent == 8 || exponent == 9)
		exponent = 5;
	if (exponent >= 10)
		exponent = 6;

	var direction = -1;

	if ( player == winner ) {
		direction = 1.5;
		exponent++;
	}

	var retval = direction * Math.pow(2, exponent);
	return retval;
}

function fuckup_delta(player, loser) {
	if (player == loser)
		return -12000;
	else
		return 4000;
}

function all_players_selected() {
	return (Session.get("current_east") != "Select East!" && 
	 		Session.get("current_south") != "Select South!" && 
	 		Session.get("current_west") != "Select West!" && 
	 		Session.get("current_north") != "Select North!")
}

Template.points.events({
	//'click .point_value'(event) {
	'change select[name="points"]'(event) {
		Session.set("current_points", event.target.value);
	}
})