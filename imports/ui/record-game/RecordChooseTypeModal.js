import Players from '../../api/Players';
import CurrentGames from '../../api/collections/CurrentGames';

import { Template } from 'meteor/templating';

import Constants from '../../api/Constants';

import './RecordChooseTypeModal.html';

Template.RecordChooseTypeModal.onCreated( function() {
    this.players = [undefined,
		    undefined,
		    undefined,
		    undefined];

    this.newGameKeyCode = undefined;
});

Template.RecordChooseTypeModal.helpers({
    players(style) {
	switch (style) {
	case Constants.GAME_TYPE.HONG_KONG:
	    return Players.find({}, {sort: { hongKongLeagueName: 1 }});
	case Constants.GAME_TYPE.JAPANESE:
	    return Players.find({}, {sort: { japaneseLeagueName: 1 }});
	};
    },
    isHongKongStyle(style) {
	return style === Constants.GAME_TYPE.HONG_KONG;
    },
    isJapaneseStyle(style) {
	return style === Constants.GAME_TYPE.JAPANESE;
    },
});

Template.RecordChooseTypeModal.events({
    'submit .start-new-game'(event, template) {
	event.preventDefault();
	const [ east, south, west, north, keyCode ] = event.target;
	template.players = [east.value,
			    south.value,
			    west.value,
			    north.value];
	template.newGameKeyCode = keyCode.value;
	
    	if (template.newGameKeyCode === undefined) {
    	    window.alert("Must provide keycode");
    	} else if (template.players.includes(undefined) || (new Set(template.players)).size != template.players.length) {
    	    window.alert("Must provide all players")
    	} else {
    	    newGame = {
    		startTimestamp: Date.now(),
    		endTimestamp: 0,
		
    		keyCode: template.newGameKeyCode,
		
    		style: template.data.style,
		
    		players: template.players,
		
    		hands: []
    	    }
	    CurrentGames.insert(newGame);
    	    template.data.hasGame.set(true);
    	    template.data.keyCode.set(template.newGameKeyCode);
    	    $("#record-choose-modal").modal('hide');
    	}
    },
    'change select[name="east_select"]'(event, template) {
	template.players[0] = event.target.value;
    },
    'change select[name="south_select"]'(event, template) {
	template.players[1] = event.target.value;
    },
    'change select[name="west_select"]'(event, template) {
	template.players[2] = event.target.value;
    },
    'change select[name="north_select"]'(event, template) {
	template.players[3] = event.target.value;
    }
    
});
