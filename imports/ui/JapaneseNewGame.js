//Databases
import { Players } from '../api/Players.js';
import { JapaneseHands } from '../api/GameDatabases.js';

import { Constants } from '../api/Constants.js';
import { EloCalculator } from '../api/EloCalculator.js';
import { NewGameUtils } from '../api/NewGameUtils.js';

Template.JapaneseNewGame.onCreated( function() {
	this.hand_type = new ReactiveVar( "jpn_dealin" );
	this.hands = new ReactiveArray();

	this.riichi_round_history = [];
	this.riichi_sum_history = [];

	NewGameUtils.resetGameValues(Constants.JPN_START_POINTS);
	Session.set("current_fu", 0);
	Session.set("current_dora", 0);

	Session.set("east_riichi", false);
	Session.set("south_riichi", false);
	Session.set("west_riichi", false);
	Session.set("north_riichi", false);

	Session.set("east_riichi_sum", 0);
	Session.set("south_riichi_sum", 0);
	Session.set("west_riichi_sum", 0);
	Session.set("north_riichi_sum", 0);

	Session.set("free_riichi_sticks", 0);
});

Template.jpn_dealin.onCreated( function() {
	Session.set("east_riichi", false);
	Session.set("south_riichi", false);
	Session.set("west_riichi", false);
	Session.set("north_riichi", false);
});
Template.jpn_selfdraw.onCreated( function() {
	Session.set("east_riichi", false);
	Session.set("south_riichi", false);
	Session.set("west_riichi", false);
	Session.set("north_riichi", false);
});
Template.jpn_nowin.onCreated( function() {
	Session.set("east_tenpai", false);
	Session.set("south_tenpai", false);
	Session.set("west_tenpai", false);
	Session.set("north_tenpai", false);

	Session.set("east_riichi", false);
	Session.set("south_riichi", false);
	Session.set("west_riichi", false);
	Session.set("north_riichi", false);
});
Template.jpn_restart.onCreated( function() {
	Session.set("east_riichi", false);
	Session.set("south_riichi", false);
	Session.set("west_riichi", false);
	Session.set("north_riichi", false);
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
		{ point: 26 },
		{ point: 39 },
		{ point: 52 },
	],
});

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
	//Submission of a hand
	'click .submit_hand_button'(event, template) {

		if ( !$( event.target ).hasClass( "disabled")) {


			template.riichi_sum_history.push(Session.get("free_riichi_sticks"));
			switch(template.hand_type.get()) {
			case "jpn_dealin":
				//Do nothing if we don't have players yet
				if (NewGameUtils.allPlayersSelected()) {
					push_dealin_hand(template);
				}
				else {
					window.alert("You need to fill out the above information!");
				}
				break;

			case "jpn_selfdraw":
				push_selfdraw_hand(template);
				break;

			case "jpn_nowin":
				push_nowin_hand(template);
				break;	

			case "jpn_restart":
				push_restart_hand(template);
				break;	

			case "jpn_fuckup":
				push_fuckup_hand(template);
				break;
			
			default:
				console.log(template.hand_type);
				break;
			};

			if (NewGameUtils.someoneBankrupt())
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

			Session.set("free_riichi_sticks", template.riichi_sum_history.pop())

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

			Session.set("east_score", Constants.JPN_START_POINTS);
			Session.set("south_score", Constants.JPN_START_POINTS);
			Session.set("west_score", Constants.JPN_START_POINTS);
			Session.set("north_score", Constants.JPN_START_POINTS);
			Session.set("east_score_fuckup", 0);
			Session.set("south_score_fuckup", 0);
			Session.set("west_score_fuckup", 0);
			Session.set("north_score_fuckup", 0);

			Session.set("current_round", 1);
			Session.set("current_bonus", 0);
			
			Session.set("current_points", 0);
			Session.set("current_fu", 0);
			Session.set("current_dora", 0);
	
			Session.set("free_riichi_sticks", 0);

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

	var jpn_elo_calculator = new EloCalculator(3000, 5, [15000, 0, -5000, -10000], game, Constants.GAME_TYPE.JAPANESE);
	var east_elo_delta = jpn_elo_calculator.eloChange(east_player);
	var south_elo_delta = jpn_elo_calculator.eloChange(south_player);
	var west_elo_delta = jpn_elo_calculator.eloChange(west_player);
	var north_elo_delta = jpn_elo_calculator.eloChange(north_player);

	var east_id = Players.findOne({japaneseLeagueName: east_player}, {})._id;
	var south_id = Players.findOne({japaneseLeagueName: south_player}, {})._id;
	var west_id = Players.findOne({japaneseLeagueName: west_player}, {})._id;
	var north_id = Players.findOne({japaneseLeagueName: north_player}, {})._id;

	Players.update({_id: east_id}, {$inc: {japaneseElo: east_elo_delta}});
	Players.update({_id: south_id}, {$inc: {japaneseElo: south_elo_delta}});
	Players.update({_id: west_id}, {$inc: {japaneseElo: west_elo_delta}});
	Players.update({_id: north_id}, {$inc: {japaneseElo: north_elo_delta}});

	//Save game to database
	JapaneseHands.insert(game);
};

function push_dealin_hand(template) {
	var pnt = Number(Session.get("current_points"));
	var fu = Number(Session.get("current_fu"));
	var win_direc = NewGameUtils.playerToDirection(Session.get("round_winner"));
	var lose_direc = NewGameUtils.playerToDirection(Session.get("round_loser"));
	var riichiSum = 0;
	var eastDelta = 0, southDelta = 0, westDelta = 0, northDelta = 0;

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

	eastDelta += dealin_delta(pnt, fu, "east", win_direc, lose_direc);
	southDelta += dealin_delta(pnt, fu, "south", win_direc, lose_direc);
	westDelta += dealin_delta(pnt, fu, "west", win_direc, lose_direc);
	northDelta += dealin_delta(pnt, fu, "north", win_direc, lose_direc);

	switch (win_direc) {
	case "east":
		eastDelta += (riichiSum + Number(Session.get("free_riichi_sticks"))) * 1000;
		break;
	case "south":
		southDelta += (riichiSum + Number(Session.get("free_riichi_sticks"))) * 1000;
		break;
	case "west":
		westDelta += (riichiSum + Number(Session.get("free_riichi_sticks"))) * 1000;
		break;
	case "north":
		northDelta += (riichiSum + Number(Session.get("free_riichi_sticks"))) * 1000;
		break;
	}

	Session.set("free_riichi_sticks", 0);
		
	template.hands.push( 
		{
			hand_type: "dealin",
		  	round: Session.get("current_round"),
		  	bonus: Session.get("current_bonus"),
			points: Session.get("current_points"),
			fu: Session.get("current_fu"),
			dora: Session.get("current_dora"),
	  		east_delta: eastDelta,
	  		south_delta: southDelta,
	  		west_delta: westDelta,
	  		north_delta: northDelta,
		}
	);

	Session.set("east_score", Number(Session.get("east_score")) + eastDelta);
	Session.set("south_score", Number(Session.get("south_score")) + southDelta);
	Session.set("west_score", Number(Session.get("west_score")) + westDelta);
	Session.set("north_score", Number(Session.get("north_score")) + northDelta);

	if (win_direc == NewGameUtils.roundToDealerDirection(Session.get("current_round")))
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
	var pnt = Number(Session.get("current_points"));
	var fu = Number(Session.get("current_fu"));
	var win_direc = NewGameUtils.playerToDirection(Session.get("round_winner"));
	var riichiSum = 0;
	var eastDelta = 0, southDelta = 0, westDelta = 0, northDelta = 0;

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

	eastDelta += selfdraw_delta(pnt, fu, "east", win_direc);
	southDelta += selfdraw_delta(pnt, fu, "south", win_direc);
	westDelta += selfdraw_delta(pnt, fu, "west", win_direc);
	northDelta += selfdraw_delta(pnt, fu, "north", win_direc);

	switch (win_direc) {
	case "east":
		eastDelta += (riichiSum + Number(Session.get("free_riichi_sticks"))) * 1000;
		break;
	case "south":
		southDelta += (riichiSum + Number(Session.get("free_riichi_sticks"))) * 1000;
		break;
	case "west":
		westDelta += (riichiSum + Number(Session.get("free_riichi_sticks"))) * 1000;
		break;
	case "north":
		northDelta += (riichiSum + Number(Session.get("free_riichi_sticks"))) * 1000;
		break;
	}

	Session.set("free_riichi_sticks", 0);

	template.hands.push( 
		{
			hand_type: "selfdraw",
			round: Session.get("current_round"),
			bonus: Session.get("current_bonus"),
			points: Session.get("current_points"),
			fu: Session.get("current_fu"),
			dora: Session.get("current_dora"),
			east_delta: eastDelta,
			south_delta: southDelta,
			west_delta: westDelta,
			north_delta: northDelta,
		}
	);

	Session.set("east_score", Number(Session.get("east_score")) + eastDelta);
	Session.set("south_score", Number(Session.get("south_score")) + southDelta);
	Session.set("west_score", Number(Session.get("west_score")) + westDelta);
	Session.set("north_score", Number(Session.get("north_score")) + northDelta);

	if (win_direc == NewGameUtils.roundToDealerDirection(Session.get("current_round")))
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
	var tenpaiSum = 0, riichiSum = 0;

	if (Session.get("east_tenpai") == true) {
		tenpaiSum++;
	}
	if (Session.get("south_tenpai") == true) {
		tenpaiSum++;
	}
	if (Session.get("west_tenpai") == true) {
		tenpaiSum++;
	}
	if (Session.get("north_tenpai") == true) {
		tenpaiSum++;
	}

	if (tenpaiSum != 4 && tenpaiSum != 0) {
		if (Session.get("east_tenpai") == true)
			eastDelta += Constants.JPN_TENPAI_PAYOUT / tenpaiSum;
		else
			eastDelta -= Constants.JPN_TENPAI_PAYOUT / (4 - tenpaiSum);
		if (Session.get("south_tenpai") == true)
			southDelta += Constants.JPN_TENPAI_PAYOUT / tenpaiSum;
		else
			southDelta -= Constants.JPN_TENPAI_PAYOUT / (4 - tenpaiSum);
		if (Session.get("west_tenpai") == true)
			westDelta += Constants.JPN_TENPAI_PAYOUT / tenpaiSum;
		else
			westDelta -= Constants.JPN_TENPAI_PAYOUT / (4 - tenpaiSum);
		if (Session.get("north_tenpai") == true)
			northDelta += Constants.JPN_TENPAI_PAYOUT / tenpaiSum;
		else
			northDelta -= Constants.JPN_TENPAI_PAYOUT / (4 - tenpaiSum);
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

	template.hands.push(
		{	
			hand_type: "nowin",
		  	round: Session.get("current_round"),
		  	bonus: Session.get("current_bonus"),
		  	east_delta: eastDelta,
		 	south_delta: southDelta,
		  	west_delta: westDelta,
		  	north_delta: northDelta,
		}
	);

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

	template.hands.push( 
		{
			hand_type: "restart",
  			round: Session.get("current_round"),	
   			bonus: Session.get("current_bonus"),
		  	east_delta: eastDelta,
		  	south_delta: southDelta,
		  	west_delta: westDelta,
	  		north_delta: northDelta,
		}
	);
	Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);

	template.riichi_round_history.push({east: Session.get("east_riichi"),
										south: Session.get("south_riichi"),
										west: Session.get("west_riichi"),
										north: Session.get("north_riichi")});

	console.log(template.riichi_round_history);
	console.log(template.riichi_sum_history);
};

function push_fuckup_hand(template) {
	var lose_direc = NewGameUtils.playerToDirection(Session.get("round_loser"));

	template.hands.push(
		{
			hand_type: "fuckup",
			round: Session.get("current_round"),
			bonus: Session.get("current_bonus"),
			east_delta: fuckup_delta("east", lose_direc),
			south_delta: fuckup_delta("south", lose_direc),
			west_delta: fuckup_delta("west", lose_direc),
			north_delta: fuckup_delta("north", lose_direc),
		}
	);

	template.riichi_round_history.push({east: false,
										south: false,
										west: false,
										north: false});
};

function dealin_delta(points, fu, playerWind, winnerWind, loserWind) {
	var retval;

	if (playerWind != winnerWind && playerWind != loserWind)
		return 0;

	if (winnerWind != NewGameUtils.roundToDealerDirection(Number(Session.get("current_round")))) {
		switch (points) {
		case 1:
			switch (fu) {
			case 30:
				retval = -1000;
				break;
			case 40:
				retval = -1300;
				break;
			case 50:
				retval = -1600;
				break;
			case 60:
				retval = -2000;
				break;
			case 70:
				retval = -2300;
				break;
			case 80:
				retval = -2600;
				break;
			case 90:
				retval = -2900;
				break;
			case 100:
				retval = -3200;
				break;
			case 110:
				retval = -3600;
				break;
			}
			break;
		case 2:
			switch (fu) {
			case 20:
				retval = -1300;
				break;
			case 25:
				retval = -1600;
				break;
			case 30:
				retval = -2000;
				break;
			case 40:
				retval = -2600;
				break;
			case 50:
				retval = -3200;
				break;
			case 60:
				retval = -3900;
				break;
			case 70:
				retval = -4500;
				break;
			case 80:
				retval = -5200;
				break;
			case 90:
				retval = -5800;
				break;
			case 100:
				retval = -6400;
				break;
			case 110:
				retval = -7100;
				break;
			}
			break;
		case 3:
			switch (fu) {
			case 20:
				retval = -2600;
				break;
			case 25:
				retval = -3200;
				break;
			case 30:
				retval = -3900;
				break;
			case 40:
				retval = -5200;
				break;
			case 50:
				retval = -6400;
				break;
			case 60:
				retval = -7700;
				break;
			default:
				retval = -8000;
				break;
			}
			break;
		case 4:
			switch (fu) {
			case 20:
				retval = -5200;
				break;
			case 25:
				retval = -6400;
				break;
			case 30:
				retval = -7700;
				break;
			default:
				retval = -8000;
				break;
			}
			break;
		case 5:
			retval = -8000;
			break;
		case 6:
		case 7:
			retval = -12000;
			break;
		case 8:
		case 9:
		case 10:
			retval = -16000;
			break;
		case 11:
		case 12:
			retval = -24000;
			break;
		case 13:
			retval = -32000;
			break;
		case 26:
			retval = -64000;
			break;
		case 39:
			retval = -96000;
			break;
		case 52:
			retval = -128000;
			break;
		}
	} else {
		switch (points) {
		case 1:
			switch (fu) {
			case 30:
				retval = -1500;
				break;
			case 40:
				retval = -2000;
				break;
			case 50:
				retval = -2400;
				break;
			case 60:
				retval = -2900;
				break;
			case 70:
				retval = -3400;
				break;
			case 80:
				retval = -3900;
				break;
			case 90:
				retval = -4400;
				break;
			case 100:
				retval = -4800;
				break;
			case 110:
				retval = -5300;
				break;
			}
			break;
		case 2:
			switch (fu) {
			case 20:
				retval = -2000;
				break;
			case 25:
				retval = -2400;
				break;
			case 30:
				retval = -2900;
				break;
			case 40:
				retval = -3900;
				break;
			case 50:
				retval = -4800;
				break;
			case 60:
				retval = -5800;
				break;
			case 70:
				retval = -6800;
				break;
			case 80:
				retval = -7700;
				break;
			case 90:
				retval = -8700;
				break;
			case 100:
				retval = -9600;
				break;
			case 110:
				retval = -10600;
				break;
			}
			break;
		case 3:
			switch (fu) {
			case 20:
				retval = -3900;
				break;
			case 25:
				retval = -4800;
				break;
			case 30:
				retval = -5800;
				break;
			case 40:
				retval = -7700;
				break;
			case 50:
				retval = -9600;
				break;
			case 60:
				retval = -11600;
				break;
			default:
				retval = -12000;
				break;
			}
			break;
		case 4:
			switch (fu) {
			case 20:
				retval = -7700;
				break;
			case 25:
				retval = -9600;
				break;
			case 30:
				retval = -11600;
				break;
			default:
				retval = -12000;
				break;
			}
			break;
		case 5:
			retval = -12000;
			break;
		case 6:
		case 7:
			retval = -18000;
			break;
		case 8:
		case 9:
		case 10:
			retval = -24000;
			break;
		case 11:
		case 12:
			retval = -36000;
			break;
		case 13:
			retval = -48000;
			break;
		case 26:
			retval = -96000;
			break;
		case 39:
			retval = -144000;
			break;
		case 52:
			retval = -192000;
			break;
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
			}
			break;
		case 2:
			switch (fu) {
			case 20:
				retval = (playerWind == dealerWind ? -700 : -400);
				retval = (playerWind == winnerWind ? 1500 : retval);
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
			}
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
			}
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
			}
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
		}
	} else {
		switch (points) {
		case 1:
			switch (fu) {
			case 30:
				retval = -500;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			case 40:
				retval = -700;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			case 50:
				retval = -800;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			case 60:
				retval = -1000;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			case 70:
				retval = -1200;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			case 80:
				retval = -1300;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			case 90:
				retval = -1500;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			case 100:
				retval = -1600;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			case 110:
				retval = -1800;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			}
			break;
		case 2:
			switch (fu) {
			case 20:
				retval = -700;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			case 30:
				retval = -1000;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			case 40:
				retval = -1300;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			case 50:
				retval = -1600;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			case 60:
				retval = -2000;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			case 70:
				retval = -1300;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			case 80:
				retval = -2600;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			case 90:
				retval = -2900;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			case 100:
				retval = -3200;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			case 110:
				retval = -3600;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			}
			break;
		case 3:
			switch (fu) {
			case 20:
				retval = -1300;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			case 25:
				retval = -1600;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			case 30:
				retval = -2000;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			case 40:
				retval = -2600;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			case 50:
				retval = -3200;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			case 60:
				retval = -3900;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			default:
				retval = -4000;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			}
			break;
		case 4:
			switch (fu) {
			case 20:
				retval = -2600;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			case 25:
				retval = -3200;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			case 30:
				retval = -3900;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			default:
				retval = -4000;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
				break;
			}
			break;
		case 5:
				retval = -4000;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
			break;
		case 6:
		case 7:
				retval = -6000;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
			break;
		case 8:
		case 9:
		case 10:
				retval = -8000;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
			break;
		case 11:
		case 12:
				retval = -12000;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
			break;
		case 13:
				retval = -16000;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
			break;
		case 26:
				retval = -32000;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
			break;
		case 39:
				retval = -48000;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
			break;
		case 52:
				retval = -64000;
				retval = (playerWind == winnerWind ? -3 * retval : retval);
			break;
		}
	}

	if ( playerWind == winnerWind )
		retval = retval + 300 * Number(Session.get("current_bonus"));
	else
		retval = retval - 100 * Number(Session.get("current_bonus"));

	return retval;

};

function fuckup_delta(player, loser) {
	if (player == loser)
		return -12000;
	else
		return 4000;
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
})