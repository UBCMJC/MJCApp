import { Players } from '../api/players.js';

Template.hongkong_new_game.onCreated( function() {
	this.hand_type = new ReactiveVar( "dealin" );

	this.hands = new ReactiveArray();

	this.hands.push(
		{ 
			hand_type: "dealin",
		  	round: 1,
		  	bonus: 0,
			points: 1,
			fu: 30,
			dora: 0,
		  	riichi_bitwise: 0b0110,
		  	east_delta: -1000, 
		  	south_delta: 1000,
		  	west_delta: 0,
		  	north_delta: 0,
		},
		{
			hand_type: "selfdraw",
		  	round: 2,
		  	bonus: 0,
			points: 5,
			fu: 30,
			dora: 2,
		  	riichi_bitwise: 0b1100,
		  	east_delta: -4000, 
		  	south_delta: 12000,
		  	west_delta: -4000,
		  	north_delta: -4000,
		},
	);

	Session.set("current_east", "Select East!");
	Session.set("current_south", "Select South!");
	Session.set("current_west", "Select West!");
	Session.set("current_north", "Select North!");

	Session.set("current_point", "-1");
});

Template.hongkong_new_game.helpers({
	hand_type() {
		return Template.instance().hand_type.get();
	},
	players() {
		return Players.find({}, {sort: { name: 1}});
	},
	hands() {
		return Template.instance().hands.get();
	},
});

Template.render_hand.helpers({
	is_dealin(hand_type) {
		return hand_type == "dealin";
	},
	is_selfdraw(hand_type) {
		return hand_type == "selfdraw";
	}
})

Template.points.helpers({
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
		{ point: 10 }
	],
});

Template.dealin.helpers({
	get_east() {
		return Session.get("current_east");
	},
	get_south() {
		return Session.get("current_south");
	},
	get_west() {
		return Session.get("current_west");
	},
	get_north() {
		return Session.get("current_north");
	}

})

Template.selfdraw.helpers({
	get_east() {
		return Session.get("current_east");
	},
	get_south() {
		return Session.get("current_south");
	},
	get_west() {
		return Session.get("current_west");
	},
	get_north() {
		return Session.get("current_north");
	}
})

Template.hongkong_new_game.events({
	'click .player_select'(event) {
		if ( $( event.target ).hasClass( "east"))
			Session.set("current_east", event.target.value);
		else if ( $( event.target ).hasClass( "south" ))
			Session.set("current_south", event.target.value);
		else if ( $( event.target ).hasClass( "west" ))
			Session.set("current_west", event.target.value);
		else if ( $( event.target ).hasClass( "north" ))
			Session.set("current_north", event.target.value);
	},
	'click .winner'(event) {
		if ( !$( event.target ).hasClass( "disabled" )) {
			if ( $( event.target ).hasClass( "active" )) {
				$( event.target ).removeClass( "active" );
				$( ".winner_buttons button" ).not( event.target ).removeClass( "disabled" );
			} else {
				$( event.target ).addClass( "active" );
				$( ".winner_buttons button" ).not( event.target ).addClass( "disabled" );
			}
		}	
	},
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
	},
	'click .nav-pills li'( event, template ) {
		var hand_type = $( event.target ).closest( "li" );

		hand_type.addClass( "active" );
		$( ".nav-pills li" ).not( hand_type ).removeClass( "active" );

		template.hand_type.set( hand_type.data( "template" ) );
	},
	'click .submit_hand_button'(event, template) {

		event.preventDefault();

		console.log("Submit pressed");

		if (template.hand_type.get() == "dealin") {
			console.log("Dealin submit");
		}
		else if (template.hand_type.get() == "selfdraw") {
			console.log("Selfdraw submit");
		}
		else if (template.hand_type.get() == "nowin") {
			console.log("Tenpai submit");
		}
		else if (template.hand_type.get() == "restart") {
			console.log("Reshuffle submit");
		}
		else {
			console.log(template.hand_type);
		}
	},
	'click .delete_hand_button'(event) {
		console.log();
	}
});

Template.points.events({
	'click .point_value'(event) {
		Session.set("current_point", event.target.value);
	}
})