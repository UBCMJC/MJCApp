// Databases
import Players from '../../api/Players';

import Constants from '../../api/Constants';

import './RecordHongKongGame.html';

Template.RecordHongKongGame.onCreated( function() {
    this.hasGame = new ReactiveVar(false);
});

Template.RecordHongKongGame.helpers({
    hasGame() {
        return Template.instance().hasGame.get();
    },
});

Template.RecordHongKongGame.events({
    'click .start-recording'(event, template) {
        $("#choose-record-modal").modal();
    }
});
