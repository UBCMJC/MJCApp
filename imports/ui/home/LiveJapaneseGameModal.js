import { Template } from 'meteor/templating';
import Constants from '../../api/Constants';
import GameRecordUtils from '../../api/utils/GameRecordUtils';

import { Players } from '../../api/GameDatabases';

import './LiveJapaneseGameModal.html';

Template.LiveJapaneseGameModal.helpers({
    // Return all recorded hands for a game as an array
    hands() {
        return Session.get("game_summary").all_hands;
    },

    get_east_player() {
        return Session.get("game_summary").east_player;
    },
    get_south_player() {
        return Session.get("game_summary").south_player;
    },
    get_west_player() {
        return Session.get("game_summary").west_player;
    },
    get_north_player() {
        return Session.get("game_summary").north_player;
    },

    // Show what a player's +/- is
    get_player_delta(direction) {
        let score = 0;
        switch (direction) {
            case Constants.EAST:
                score = Session.get("game_summary").east_score;
            case Constants.SOUTH:
                score = Session.get("game_summary").south_score;
            case Constants.WEST:
                score = Session.get("game_summary").west_score;
            case Constants.NORTH:
                score = Session.get("game_summary").north_score;
        }
        return (score - Constants.JPN_START_POINTS);
    },
    // Show what a player's current score is
    get_player_score(direction) {
        switch (direction) {
            case Constants.EAST:
                return Session.get("game_summary").east_score;
            case Constants.SOUTH:
                return Session.get("game_summary").south_score;
            case Constants.WEST:
                return Session.get("game_summary").west_score;
            case Constants.NORTH:
                return Session.get("game_summary").north_score;
        }
    },
    // Show what a player's score will look like if game is ended now
    get_player_score_final(direction) {
        let retval = 0;
        switch (direction) {
            case Constants.EAST:
                retval = Session.get("game_summary").east_score;
                break;
            case Constants.SOUTH:
                retval = Session.get("game_summary").south_score;
                break;
            case Constants.WEST:
                retval = Session.get("game_summary").west_score;
                break;
            case Constants.NORTH:
                retval = Session.get("game_summary").north_score;
                break;
        }

        let winScore = Math.max(Session.get("game_summary").east_score,
                                Session.get("game_summary").south_score,
                                Session.get("game_summary").west_score,
                                Session.get("game_summary").north_score);

        if (winScore == Session.get("game_summary").east_score) {
            if (direction == Constants.EAST)
                retval += Constants.JPN_RIICHI_POINTS * Number(Session.get("game_summary").free_riichi_sticks);
        } else if (winScore == Session.get("game_summary").south_score) {
            if (direction == Constants.SOUTH)
                retval += Constants.JPN_RIICHI_POINTS * Number(Session.get("game_summary").free_riichi_sticks);
        } else if (winScore == Session.get("game_summary").west_score) {
            if (direction == Constants.WEST)
                retval += Constants.JPN_RIICHI_POINTS * Number(Session.get("game_summary").free_riichi_sticks);
        } else if (winScore == Session.get("game_summary").north_score) {
            if (direction == Constants.NORTH)
                retval += Constants.JPN_RIICHI_POINTS * Number(Session.get("game_summary").free_riichi_sticks);
        }

        return retval;
    },
    get_round() {
        return Session.get("game_summary").current_round;
    },
    get_bonus() {
        return Session.get("game_summary").current_bonus;
    },
    // Return a string of the round wind for Japanese style
    displayRoundWind(round) {
        return GameRecordUtils.displayRoundWind(round, Constants.GAME_TYPE.JAPANESE);
    },
    // Return the current round number for Japanese style
    displayRoundNumber(round) {
        return GameRecordUtils.handNumberToRoundNumber(round,
                                                       Constants.GAME_TYPE.JAPANESE);
    },
});

Template.jpn_render_hand_2.helpers({
    // Boolean expressions to help with rendering hands
    is_dealin(hand_type) {
        return hand_type == Constants.DEAL_IN;
    },
    is_selfdraw(hand_type) {
        return hand_type == Constants.SELF_DRAW;
    },
    is_nowin(hand_type) {
        return hand_type == Constants.NO_WIN;
    },
    is_restart(hand_type) {
        return hand_type == Constants.RESTART;
    },
    is_mistake(hand_type) {
        return hand_type == Constants.MISTAKE;
    },
    // Return a string of the round wind for Japanese style
    displayRoundWind(round) {
        return GameRecordUtils.displayRoundWind(round, Constants.GAME_TYPE.JAPANESE);
    },
    // Return the current round number for Japanese style
    displayRoundNumber(round) {
        return GameRecordUtils.handNumberToRoundNumber(round,
                                                       Constants.GAME_TYPE.JAPANESE);
    },
})
