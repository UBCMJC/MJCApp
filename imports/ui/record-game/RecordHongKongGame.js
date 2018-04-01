// Databases
import Players from '../../api/Players';

import Constants from '../../api/Constants';

import './RecordHongKongGame.html';
import './RecordChooseTypeModal';

Template.RecordHongKongGame.onCreated( function() {
    this.hasGame = new ReactiveVar(false);
});

Template.RecordHongKongGame.helpers({
    hasGame() {
        return Template.instance().hasGame.get();
    },
    getStyle() {
        return Constants.GAME_TYPE.HONG_KONG;
    },
});

Template.RecordHongKongGame.events({
    'click .start-recording'(event, template) {
        $("#record-choose-modal").modal();
    }
});
