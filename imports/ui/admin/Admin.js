import './Admin.html';
import { Meteor } from 'meteor/meteor';

import Players from '../../api/Players';
import Admin from '../../api/Admin';

Template.Admin.onCreated(function() {
    this.admin = new ReactiveVar("Login");
});

Template.Admin.events({
    'submit #token'(event, template) {
        event.preventDefault();
        var exists = !!Admin.findOne({ token: $("#token").serializeArray()[0].value });
        template.admin.set(exists ? "AddPlayer" : "Login");
    },

    'submit .new-player'(event) {
        event.preventDefault();

        const { name, hongKongName, japaneseName } = event.target;

        Players.insert({
            name: name.value,
            hongKongLeagueName: hongKongName.value,
            hongKongElo: 1500, //added
            hongKongGamesPlayed: 0, //added
            hongKongPositionSum: 0, //added
            hongKongHandsWin: 0, //added
            hongKongHandsLose: 0, //added
            hongKongHandsTotal: 0, //added
            hongKongWinPointsTotal: 0, //added
            hongKongChomboTotal: 0, //added
            hongKongBankruptTotal: 0, //added
            hongKongFirstPlaceSum: 0, //added
            hongKongSecondPlaceSum: 0, //added
            hongKongThirdPlaceSum: 0, //added
            hongKongFourthPlaceSum: 0, //added

            japaneseLeagueName: japaneseName.value,
            japaneseElo: 1500, //added
            japaneseGamesPlayed: 0, //added
            japanesePositionSum: 0, //added
            japaneseHandsWin: 0, //added
            japaneseHandsLose: 0, //added
            japaneseHandsTotal: 0, //added
            japaneseWinPointsTotal: 0, //added
            japaneseWinDoraTotal: 0, //added
            japaneseRiichiTotal: 0, //added
            japaneseWinRiichiTotal: 0, //added
            japaneseChomboTotal: 0, //added
            japaneseBankruptTotal: 0, //added
            japaneseFirstPlaceSum: 0, //added
            japaneseSecondPlaceSum: 0, //added
            japaneseThirdPlaceSum: 0, //added
            japaneseFourthPlaceSum: 0, //added
        });

        name.value = '';
        hongKongName.value = '';
        japaneseName.value = '';
    }
});

Template.Admin.helpers({
    admin() { return Template.instance().admin.get(); }
});
