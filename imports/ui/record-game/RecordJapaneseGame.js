// Databases
import Players from '../../api/Players';

import Constants from '../../api/Constants';

import './RecordJapaneseGame.html';
import './RecordChooseTypeModal';

Template.RecordJapaneseGame.onCreated( function() {
    this.hasGame = new ReactiveVar(false);
});

Template.RecordJapaneseGame.helpers({
    hasGame() {
	return Template.instance().hasGame.get();
    },
    getStyle() {
	return Constants.GAME_TYPE.JAPANESE;
    },
});

Template.RecordJapaneseGame.events({
    'click .start-recording'(event, template) {

	$("#record-choose-modal").modal();


    }
});
