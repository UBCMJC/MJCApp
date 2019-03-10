// Databases
import Players from '../../api/Players';

import Constants from '../../api/Constants';

import './RecordHongKongGame.html'
import './RecordChooseTypeModal';

Template.RecordHongKongGame.onCreated( function () {
    this.hasGame = new ReactiveVar(false);
    this.keyCode = new ReactiveVar(undefined);
});

Template.RecordHongKongGame.helpers({
    hasGame() {
	return Template.instance().hasGame.get();
    },
    getStyle() {
	return Constants.GAME_TYPE.HONG_KONG;
    },
    hasGameProvide() {
	return Template.instance().hasGame;
    },
    keyCodeProvide() {
	return Template.instance().keyCode;
    }
});

Template.RecordHongKongGame.events({
    'click .start-recording'(event, template) {
	$("#record-choose-modal").modal();
    }
});
