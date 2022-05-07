import { Template } from 'meteor/templating';
import Constants from '../../api/Constants';
import GameRecordUtils from '../../api/utils/GameRecordUtils';

import { JapaneseHands, HongKongHands } from '../../api/GameDatabases';

import './Home.html';

Template.Home.helpers({
    jpn_games() {
        return JapaneseHands.find({complete: 0}).fetch();
    },
    hk_games() {
        return HongKongHands.find({complete: 0}).fetch();
    }
});

Template.game_summary.helpers({
    displayScore(score) {
        return (score / 1000).toFixed(1);
    },
    displayRoundWind(round) {
        return GameRecordUtils.displayRoundWind(round, Constants.GAME_TYPE.JAPANESE);
    },
    displayRoundNumber(round) {
        return GameRecordUtils.handNumberToRoundNumber(round, Constants.GAME_TYPE.JAPANESE);
    },

});
