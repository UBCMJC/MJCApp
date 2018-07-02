import Constants from '../../api/Constants';
import './JapaneseRanking.html';

Template.JapaneseRanking.helpers({
    getContext() {
        return {
            format: Constants.GAME_TYPE.JAPANESE,
            sort: {
                japaneseElo: -1
            }
        };
    }
});
