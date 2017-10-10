import './Admin.html';
import { Meteor } from 'meteor/meteor';

import Players from '../../api/Players';
import Admin from '../../api/Admin';

Template.Admin.onCreated(function() {
    this.admin = new ReactiveVar("Login");
});

Template.Admin.events({
    'click #logout'(event, template) {
        template.admin.set("Login");
    },

    'submit #token'(event, template) {
        event.preventDefault();
        var exists = !!Admin.findOne({ token: $("#token").serializeArray()[0].value });
        template.admin.set(exists ? "AddPlayer" : "Login");
    },

    'submit .new-player'(event) {
        event.preventDefault();
        
        if (confirm("The user will the above information will be added to the database.")) {
            const { name, hongKongName, japaneseName } = event.target;

            Players.insert({
                name: name.value,
                hongKongLeagueName: hongKongName.value,
                hongKongElo: 1500,
                hongKongGamesPlayed: 0,
                hongKongPositionSum: 0,
                hongKongHandsWin: 0,
                hongKongHandsLose: 0,
                hongKongHandsTotal: 0,
                hongKongWinPointsTotal: 0,
                hongKongChomboTotal: 0,
                hongKongBankruptTotal: 0,
                hongKongFirstPlaceSum: 0,
                hongKongSecondPlaceSum: 0,
                hongKongThirdPlaceSum: 0,
                hongKongFourthPlaceSum: 0,

                japaneseLeagueName: japaneseName.value,
                japaneseElo: 1500,
                japaneseGamesPlayed: 0,
                japanesePositionSum: 0,
                japaneseHandsWin: 0,
                japaneseHandsLose: 0,
                japaneseHandsTotal: 0,
                japaneseWinPointsTotal: 0,
                japaneseWinDoraTotal: 0,
                japaneseRiichiTotal: 0,
                japaneseWinRiichiTotal: 0,
                japaneseChomboTotal: 0,
                japaneseBankruptTotal: 0,
                japaneseFirstPlaceSum: 0,
                japaneseSecondPlaceSum: 0,
                japaneseThirdPlaceSum: 0,
                japaneseFourthPlaceSum: 0,
            });

            name.value = '';
            hongKongName.value = '';
            japaneseName.value = '';
        }
    }
});

Template.Admin.helpers({
    admin() { return Template.instance().admin.get(); }
});

Template.AddPlayer.helpers({
    players() { return Players.find({}); }
})
