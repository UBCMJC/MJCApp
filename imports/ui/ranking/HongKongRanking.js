import Constants from '../../api/Constants';
import './HongKongRanking.html';

Template.HongKongRanking.helpers({
    /**
     * Provide a context for the ranking page
     * @returns the Hong Kong ranking context
     */
    getContext() {
        return {
            format: Constants.GAME_TYPE.HONG_KONG,
            rankingSort: {
                hongKongElo: -1
            }
        };
    }
})
