import { Template } from 'meteor/templating';
import Constants from '../../api/Constants';
import GameRecordUtils from '../../api/utils/GameRecordUtils';

import { InProgressJapaneseHands, InProgressHongKongHands, Players } from '../../api/GameDatabases';

import './LiveJapaneseGameModal';
import './LiveHongKongGameModal';
import './Home.html';

Template.Home.onCreated( function() {
    Meteor.call('canRetrievePlayer', function (error, game) {
        return;
    });
});

Template.Home.helpers({
    jpn_games() {
        return InProgressJapaneseHands.find().fetch();
    },
    hk_games() {
        return InProgressHongKongHands.find().fetch();
    }
});

Template.game_summary.helpers({
    displayScore(score, game_type) {
        if (game_type == Constants.GAME_TYPE.JAPANESE) {
            return (score / 1000).toFixed(1);
        } else {
            return score;
        }
    },
    displayRoundWind(round, game_type) {
        if (game_type == Constants.GAME_TYPE.JAPANESE) {
            return GameRecordUtils.displayRoundWind(round, Constants.GAME_TYPE.JAPANESE);
        } else {
            return GameRecordUtils.displayRoundWind(round, Constants.GAME_TYPE.HONG_KONG);
        }
    },
    displayRoundNumber(round, game_type) {
        if (game_type == Constants.GAME_TYPE.JAPANESE) {
            return GameRecordUtils.handNumberToRoundNumber(round, Constants.GAME_TYPE.JAPANESE);
        } else {
            return GameRecordUtils.handNumberToRoundNumber(round, Constants.GAME_TYPE.HONG_KONG);
        }
    },

});

Template.Home.events({
    'click .summary-container': (event) => {
        event.preventDefault();
        let game_type = event.currentTarget.dataset["type"];
        if (game_type == Constants.GAME_TYPE.JAPANESE) {
            let game = InProgressJapaneseHands.findOne(event.currentTarget.dataset["game"]);
            Session.set("game_summary", game);
            console.log(game);
            $("#jpn-game-modal").modal('show');
        } else {
            let game = InProgressHongKongHands.findOne(event.currentTarget.dataset["game"]);
            Session.set("game_summary", game);
            $("#hk-game-modal").modal('show');
        }
    },
})
