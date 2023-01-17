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
        template.admin.set(true ? "AddPlayer" : "Login");
    },

    'submit .new-player'(event) {
        event.preventDefault();
        
        if (confirm("Are you sure you want to add this user?")) {
            const { name, hongKongName, japaneseName, upperJapanese } = event.target;
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
                japaneseDealInTotal: 0,
                japaneseDealInAfterRiichiTotal: 0,

                upperJapanese: upperJapanese.checked,
                upperJapaneseElo: 1500,
                upperJapaneseGamesPlayed: 0,
                upperJapanesePositionSum: 0,
                upperJapaneseHandsWin: 0,
                upperJapaneseHandsLose: 0,
                upperJapaneseHandsTotal: 0,
                upperJapaneseWinPointsTotal: 0,
                upperJapaneseWinDoraTotal: 0,
                upperJapaneseRiichiTotal: 0,
                upperJapaneseWinRiichiTotal: 0,
                upperJapaneseChomboTotal: 0,
                upperJapaneseBankruptTotal: 0,
                upperJapaneseFirstPlaceSum: 0,
                upperJapaneseSecondPlaceSum: 0,
                upperJapaneseThirdPlaceSum: 0,
                upperJapaneseFourthPlaceSum: 0,
                upperJapaneseDealInTotal: 0,
                upperJapaneseDealInAfterRiichiTotal: 0,
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
