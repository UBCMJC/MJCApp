import { Template } from 'meteor/templating';
import Constants from '../../api/Constants';
import GameRecordUtils from '../../api/utils/GameRecordUtils';

import { JapaneseHands, HongKongHands } from '../../api/GameDatabases';

import './Home.html';

Template.Home.helpers({
    current_games() {
        return JapaneseHands.find().fetch();
    }
});

Template.game_summary.helpers({
    displayScore(score) {
        return (score / 1000).toFixed(1);
    },
    displayRoundWind(rounds) {
        let lastRound = rounds[rounds.length - 1];
        return GameRecordUtils.displayRoundWind(lastRound.round + 1, Constants.GAME_TYPE.JAPANESE);
    },
    displayRoundNumber(rounds) {
        let lastRound = rounds[rounds.length - 1];
        return GameRecordUtils.handNumberToRoundNumber(lastRound.round + 1, Constants.GAME_TYPE.JAPANESE);
    },
    getBonus(rounds) {
        let lastRound = rounds[rounds.length - 1];
        return lastRound.bonus;
    }
}); // TODO: custom popups, localStorage stuff
