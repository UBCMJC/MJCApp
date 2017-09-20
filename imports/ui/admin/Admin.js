import './Admin.html';
import { Players } from '../../api/Players';
import { Meteor } from 'meteor/meteor';
import { Admin } from '../../api/Admin';

Template.Admin.events({
    'change .token'(event) {
        Session.set("admin", !!Admin.findOne({ token: event.target.value }));
    },

    'submit .new-player'(event) {
        event.preventDefault();

        const { name, hongKongName, japaneseName } = event.target;

        Players.insert({
            name: name.value,
            hongKongLeagueName: hongKongName.value,
            hongKongElo: 0, //added
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
            japaneseElo: 0, //added
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

        target.name.value = '';
        target.hongKongName.value = '';
        target.japaneseName.value = '';
    }
});

Template.Admin.helpers({
    isAdmin() { return Session.get("admin"); }
});