import Constants from '../../api/Constants';
import './UpperJapaneseRanking.html';

Template.UpperJapaneseRanking.helpers({
    /**
     * Provide a context for the ranking page
     * @returns the Japanese ranking context
     */
    getContext() {
        return {
            format: Constants.GAME_TYPE.UPPER_JAPANESE,
            rankingSort: {
                upperJapaneseElo: -1
            }
        };
    }
});
