import Constants from '../../api/Constants';
import './JapaneseRanking.html';

Template.JapaneseRanking.helpers({
    /**
     * Provide a context for the ranking page
     * @returns the Japanese ranking context
     */
    getContext() {
        return {
            format: Constants.GAME_TYPE.JAPANESE,
            rankingSort: {
                japaneseElo: -1
            }
        };
    }
});
