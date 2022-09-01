//Databases
import Players from '../../api/Players';
import { JapaneseHands, InProgressJapaneseHands } from '../../api/GameDatabases';

import Constants from '../../api/Constants';
import EloCalculator from '../../api/EloCalculator';
import GameRecordUtils from '../../api/utils/GameRecordUtils';
import { HandScoreCalculator } from '../../api/HandScoreCalculator';

import './RecordJapaneseGame.html';

// Code to be evaluated when RecordJapaneseGame template is reloaded
Template.RecordJapaneseGame.onCreated( function() {
    // Meteor: Template type to show for choosing hand submission
    this.hand_type = new ReactiveVar( Constants.JPN_DEAL_IN );
    // Meteor: List of hands submitted to display
    this.hands = new ReactiveArray();

    // Save game riichi history for if a hand is deleted
    this.riichi_round_history = [];
    this.riichi_sum_history = [];

    // Reset shared Mahjong stats
    GameRecordUtils.resetGameValues(Constants.JPN_START_POINTS);

    // Reset Japanese hand specific stats
    Session.set("current_fu", 0);
    Session.set("current_dora", 0);

    // Reset GUI selection fields
    setAllGUIRiichisFalse();

    // Reset Japanese game specific stats
    Session.set("east_riichi_sum", 0);
    Session.set("south_riichi_sum", 0);
    Session.set("west_riichi_sum", 0);
    Session.set("north_riichi_sum", 0);

    Session.set("eastPlayerRiichisWon", 0);
    Session.set("southPlayerRiichisWon", 0);
    Session.set("westPlayerRiichisWon", 0);
    Session.set("northPlayerRiichisWon", 0);

    Session.set("eastPlayerDoraSum", 0);
    Session.set("southPlayerDoraSum", 0);
    Session.set("westPlayerDoraSum", 0);
    Session.set("northPlayerDoraSum", 0);

    // Reset number of riichi sticks stored for next player win
    Session.set("free_riichi_sticks", 0);

    let self = this;
    if (localStorage.getItem("game_id") !== null) {
        Session.set("game_id", localStorage.getItem("game_id"));
        if (localStorage.getItem("game_type") !== "jp") {
            return;
        }
        Meteor.call('canRetrieveInProgressJapaneseGame', Session.get("game_id"), function (error, game) {
            if (game === undefined) {
                localStorage.clear();
                return;
            }
            for (let i = 0; i < game.all_hands.length; i++) {
                let hand = game.all_hands[i];
                self.hands.push({
                    handType: hand.handType,
                    round: hand.round,
                    bonus: hand.bonus,
                    points: hand.points,
                    fu: hand.fu,
                    dora: hand.dora,
                    eastDelta: hand.eastDelta,
                    southDelta: hand.southDelta,
                    westDelta: hand.westDelta,
                    northDelta: hand.northDelta,
                });
            }

            Meteor.call('canRetrievePlayer', function (error) {
                Session.set("current_east", game.east_player);
                Session.set("current_south", game.south_player);
                Session.set("current_west", game.west_player);
                Session.set("current_north", game.north_player);
            });

            Session.set("east_score", game.east_score);
            Session.set("south_score", game.south_score);
            Session.set("west_score", game.west_score);
            Session.set("north_score", game.north_score);

            Session.set("current_round", game.current_round);
            Session.set("current_bonus", game.current_bonus);

            for (let i = 0; i < game.riichi_sum_history.length; i++) {
                self.riichi_sum_history.push(game.riichi_sum_history[i]);
                self.riichi_round_history.push(game.riichi_round_history[i]);
            }
            Session.set("free_riichi_sticks", game.free_riichi_sticks);

            Session.set("eastPlayerWins", game.eastPlayerWins);
            Session.set("southPlayerWins", game.southPlayerWins);
            Session.set("westPlayerWins", game.westPlayerWins);
            Session.set("northPlayerWins", game.northPlayerWins);

            Session.set("eastPlayerLosses", game.eastPlayerLosses);
            Session.set("southPlayerLosses", game.southPlayerLosses);
            Session.set("westPlayerLosses", game.westPlayerLosses);
            Session.set("northPlayerLosses", game.northPlayerLosses);

            Session.set("eastPlayerPointsWon", game.eastPlayerPointsWon);
            Session.set("southPlayerPointsWon", game.southPlayerPointsWon);
            Session.set("westPlayerPointsWon", game.westPlayerPointsWon);
            Session.set("northPlayerPointsWon", game.northPlayerPointsWon);

            Session.set("eastMistakeTotal", game.eastMistakeTotal);
            Session.set("southMistakeTotal", game.southMistakeTotal);
            Session.set("westMistakeTotal", game.westMistakeTotal);
            Session.set("northMistakeTotal", game.northMistakeTotal);

            Session.set("east_riichi_sum", game.east_riichi_sum);
            Session.set("south_riichi_sum", game.south_riichi_sum);
            Session.set("west_riichi_sum", game.west_riichi_sum);
            Session.set("north_riichi_sum", game.north_riichi_sum);

            Session.set("eastPlayerRiichisWon", game.eastPlayerRiichisWon);
            Session.set("southPlayerRiichisWon", game.southPlayerRiichisWon);
            Session.set("westPlayerRiichisWon", game.westPlayerRiichisWon);
            Session.set("northPlayerRiichisWon", game.northPlayerRiichisWon);

            Session.set("eastPlayerDoraSum", game.eastPlayerDoraSum);
            Session.set("southPlayerDoraSum", game.southPlayerDoraSum);
            Session.set("westPlayerDoraSum", game.westPlayerDoraSum);
            Session.set("northPlayerDoraSum", game.northPlayerDoraSum);
        });
    }
});

Template.RecordJapaneseGame.onRendered( function() {
    if (localStorage.getItem("game_id") !== null) {
        if (localStorage.getItem("game_type") !== "jp") {
            document.getElementById("jpn_container").style.display = "none";
            window.alert("Please submit games in progress before starting a new game!");
            return;
        }
        document.getElementById("jpn_names").style.display = "none";
        document.getElementById("jpn_game_buttons").style.display = "block";
        if (localStorage.getItem("game_over") == 1) {
            $( ".submit_hand_button" ).addClass( "disabled" );
            $( ".submit_game_button" ).removeClass( "disabled" );
            $( ".delete_hand_button" ).removeClass( "disabled" );
        } else if (Session.get("current_round") > 0) {
            $( ".delete_hand_button" ).removeClass( "disabled" );
        }
    }
});

// Code to be evaluated when jpn_dealin template is reloaded
Template.jpn_dealin.onCreated( function() {
    // Reset GUI selection fields
    setAllGUIRiichisFalse();
});

// Code to be evaluated when jpn_selfdraw template is reloaded
Template.jpn_selfdraw.onCreated( function() {
    // Reset GUI selection fields
    setAllGUIRiichisFalse();
});

// Code to be evaluated when jpn_nowin tenplate is reloaded
Template.jpn_nowin.onCreated( function() {
    // Reset GUI selection fields
    Session.set("east_tenpai", false);
    Session.set("south_tenpai", false);
    Session.set("west_tenpai", false);
    Session.set("north_tenpai", false);

    setAllGUIRiichisFalse();
});

// Code to be evaluated when jpn_restart tenplate is reloaded
Template.jpn_restart.onCreated( function() {
    // Reset GUI selection fields
    setAllGUIRiichisFalse();
});

// Code to be evaluated when jpn_dealin_pao tenplate is reloaded
Template.jpn_dealin_pao.onCreated( function() {
    // Reset GUI selection fields
    setAllGUIRiichisFalse();
});

// GUI helpers for hand submission template
Template.RecordJapaneseGame.helpers({
    // Choose hand type for submission form
    hand_type() {
        return Template.instance().hand_type.get();
    },
    // Choose player to select from dropdown menus
    players() {
        return Players.find({}, {sort: { japaneseLeagueName: 1}});
    },
    // Return all recorded hands for a game as an array
    hands() {
        return Template.instance().hands.get();
    },
    // Show what a player's +/- is
    get_player_delta(direction) {
        return (GameRecordUtils.getDirectionScore(direction) - Constants.JPN_START_POINTS);
    },
    // Show what a player's current score is
    get_player_score(direction) {
        return GameRecordUtils.getDirectionScore(direction);
    },
    // Show what a player's score will look like if game is ended now
    get_player_score_final(direction) {
        retval = GameRecordUtils.getDirectionScore(direction);

        let winScore = Math.max(Number(Session.get("east_score")),
                                Number(Session.get("south_score")),
                                Number(Session.get("west_score")),
                                Number(Session.get("north_score")));

        if (winScore == Session.get("east_score")) {
            if (direction == Constants.EAST)
                retval += Constants.JPN_RIICHI_POINTS * Number(Session.get("free_riichi_sticks"));
        } else if (winScore == Session.get("south_score")) {
            if (direction == Constants.SOUTH)
                retval += Constants.JPN_RIICHI_POINTS * Number(Session.get("free_riichi_sticks"));
        } else if (winScore == Session.get("west_score")) {
            if (direction == Constants.WEST)
                retval += Constants.JPN_RIICHI_POINTS * Number(Session.get("free_riichi_sticks"));
        } else if (winScore == Session.get("north_score")) {
            if (direction == Constants.NORTH)
                retval += Constants.JPN_RIICHI_POINTS * Number(Session.get("free_riichi_sticks"));
        }


        return retval;
    },
    // Show what a player's Elo change will look like if game is ended now
    get_expected_elo_change(direction) {

        let eastPlayer  = Session.get("current_east");
        let southPlayer = Session.get("current_south");
        let westPlayer  = Session.get("current_west");
        let northPlayer = Session.get("current_north");

        if (eastPlayer  == Constants.DEFAULT_EAST ||
            southPlayer == Constants.DEFAULT_SOUTH ||
            westPlayer  == Constants.DEFAULT_WEST ||
            northPlayer == Constants.DEFAULT_NORTH) {
            return "N/A";
        }

        let game = {
            timestamp: new Date(),
            east_player: eastPlayer,
            south_player: southPlayer,
            west_player: westPlayer,
            north_player: northPlayer,
            east_score: (Number(Session.get("east_score"))),
            south_score: (Number(Session.get("south_score"))),
            west_score: (Number(Session.get("west_score"))),
            north_score: (Number(Session.get("north_score"))),
            all_hands: Template.instance().hands.get(),
        };

        let jpnEloCalculator = new EloCalculator(Constants.ELO_CALCULATOR_N,
                                                 Constants.ELO_CALCULATOR_EXP,
                                                 Constants.JPN_SCORE_ADJUSTMENT,
                                                 game,
                                                 Constants.GAME_TYPE.JAPANESE);

        switch (direction) {
        case Constants.EAST:  return jpnEloCalculator.eloChange(eastPlayer).toFixed(2);
        case Constants.SOUTH: return jpnEloCalculator.eloChange(southPlayer).toFixed(2);
        case Constants.WEST:  return jpnEloCalculator.eloChange(westPlayer).toFixed(2);
        case Constants.NORTH: return jpnEloCalculator.eloChange(northPlayer).toFixed(2);
        };
    },
    // Show a player's ELO
    get_jpn_elo(player) {
        switch (player) {
        case Constants.DEFAULT_EAST:
        case Constants.DEFAULT_SOUTH:
        case Constants.DEFAULT_WEST:
        case Constants.DEFAULT_NORTH:
            return "?";
        default:
            return Players.findOne({japaneseLeagueName: player}).japaneseElo.toFixed(2);
        };
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

// GUI helpers for rendering hands
Template.jpn_render_hand.helpers({
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

// Helpers for point selection dropdown
Template.jpn_points.helpers({
    /**
     * Return an Array of valid Japanese mahjong hand point values
     * 13, 26, 39, 52, and 65 are considered single->quintuple yakumans
     *
     * @return {Array} An Array of valid point values with yakuman values
     */
    get possiblePoints() {
        let normalPoints = Array.from({ length: Constants.JPN_MAX_HAND_SIZE - 1 })
                                .map((_,i) => ({ point: i + 1}));
        let yakumanPoints = Array.from({ length: Constants.JPN_MAX_YAKUMAN_MULTIPLE })
                                 .map((_,i) => ({ point: (i + 1) * Constants.JPN_MAX_HAND_SIZE}));
        return normalPoints.concat(yakumanPoints);
    }
});

// Helpers for fu selection dropdown
Template.jpn_fu.helpers({
    /**
     * Return an Array of valid Japanese mahjong hand fu values
     *
     * @return {Array} An Array of valid fu values
     */
    get possibleFu() {
        let allowedFu = Array.from({length: 10}).map((_,i) => ({ fu: 20 + 10 * i }));
        allowedFu.push({ fu: 25});
        allowedFu.sort((a, b) => a.fu > b.fu);
        return allowedFu;
    }
});

// Helpers for dora selection dropdown
Template.jpn_dora.helpers({
    /**
     * Return an Array of valid Japanese mahjong hand dora values
     * Theoretically, maximum dora in one hand is 35
     *
     * @return {Array} An Array of valid dora values
     */
    get possibleDora() {
        return Array.from({length: 36}).map((_,i) => ({ dora: i }));
    }
});

// Functions for browser events
Template.RecordJapaneseGame.events({
    //Selecting who the east player is
    'change select[name="east_player"]'(event) {
        Session.set("current_east", event.target.value);
    },
    //Selecting who the south player is
    'change select[name="south_player"]'(event) {
        Session.set("current_south", event.target.value);
    },
    //Selecting who the west player is
    'change select[name="west_player"]'(event) {
        Session.set("current_west", event.target.value);
    },
    //Selecting who the north player is
    'change select[name="north_player"]'(event) {
        Session.set("current_north", event.target.value);
    },
    //Selecting who the winner is for a dealin or tsumo
    'click .winner'(event) {
        if ( !$( event.target ).hasClass( "disabled" )) {
            if ( $( event.target ).hasClass( "active" )) {
                $( event.target ).removeClass( "active" );
                $( ".winner_buttons button" ).not( event.target ).removeClass( "disabled" );
                Session.set("round_winner", Constants.NO_PERSON);
            } else {
                $( event.target ).addClass( "active" );
                $( ".winner_buttons button" ).not( event.target ).addClass( "disabled" );
                Session.set("round_winner", event.target.innerHTML);
            }
        }
    },
    //Selecting who the loser is for a dealin
    'click .loser'(event) {
        if ( !$( event.target ).hasClass( "disabled" )) {
            if ( $( event.target ).hasClass( "active" )) {
                $( event.target ).removeClass( "active" );
                $( ".loser_buttons button" ).not( event.target ).removeClass( "disabled" );
                Session.set("round_loser", Constants.NO_PERSON);
            } else {
                $( event.target ).addClass( "active" );
                $( ".loser_buttons button" ).not( event.target ).addClass( "disabled" );
                Session.set("round_loser", event.target.innerHTML);
            }
        }
    },
    //Selecting who riichied
    'click .riichi'(event) {
        if ( !$( event.target ).hasClass( "active" )) {
            $( event.target ).addClass( "active" );
            Session.set( GameRecordUtils.playerToDirection(event.target.innerHTML) + "_riichi", true);
        } else {
            $( event.target ).removeClass( "active" )
            Session.set( GameRecordUtils.playerToDirection(event.target.innerHTML) + "_riichi", false);
        }
    },
    //Selecting who tenpaied
    'click .tenpai'(event) {
        if ( !$( event.target ).hasClass( "active" )) {
            $( event.target ).addClass( "active" );
            Session.set( GameRecordUtils.playerToDirection(event.target.innerHTML) + "_tenpai", true);
        } else {
            $( event.target ).removeClass( "active" )
            Session.set( GameRecordUtils.playerToDirection(event.target.innerHTML) + "_tenpai", false);
        }
    },
    //Selecting who is under pao
    'click .pao'(event) {
        if ( !$( event.target ).hasClass( "disabled" )) {
            if ( $( event.target ).hasClass( "active" )) {
                $( event.target ).removeClass( "active" );
                $( ".pao_buttons button" ).not( event.target ).removeClass( "disabled" );
                Session.set("round_pao_player", Constants.NO_PERSON);
            } else {
                $( event.target ).addClass( "active" );
                $( ".pao_buttons button" ).not( event.target ).addClass( "disabled" );
                Session.set("round_pao_player", event.target.innerHTML);
            }
        }
    },

    //Submission of names
    'click .submit_names_button'(event, template) {
        if ( !$( event.target ).hasClass( "disabled")) {
            if (GameRecordUtils.allPlayersSelected()) {
                document.getElementById("jpn_names").style.display = "none";
                document.getElementById("jpn_game_buttons").style.display = "block";
            } else {
                window.alert("Please enter all 4 player names!");
                return;
            }
        }

        let east_player = Session.get("current_east");
        let south_player= Session.get("current_south");
        let west_player = Session.get("current_west");
        let north_player= Session.get("current_north");

        let game = {
            timestamp: new Date(),
            east_player: east_player,
            south_player: south_player,
            west_player: west_player,
            north_player: north_player,
            east_score: Constants.JPN_START_POINTS,
            south_score: Constants.JPN_START_POINTS,
            west_score: Constants.JPN_START_POINTS,
            north_score: Constants.JPN_START_POINTS,
            current_round: 1,
            current_bonus: 0,
            free_riichi_sticks: 0,
            riichi_sum_history: [],
            riichi_round_history: [],
            all_hands: [],
            eastPlayerWins: 0,
            southPlayerWins: 0,
            westPlayerWins: 0,
            northPlayerWins: 0,
            eastPlayerLosses: 0,
            southPlayerLosses: 0,
            westPlayerLosses: 0,
            northPlayerLosses: 0,
            eastPlayerPointsWon: 0,
            southPlayerPointsWon: 0,
            westPlayerPointsWon: 0,
            northPlayerPointsWon: 0,
            eastMistakeTotal: 0,
            southMistakeTotal: 0,
            westMistakeTotal: 0,
            northMistakeTotal: 0,
            east_riichi_sum: 0,
            south_riichi_sum: 0,
            west_riichi_sum: 0,
            north_riichi_sum: 0,
            eastPlayerRiichisWon: 0,
            southPlayerRiichisWon: 0,
            westPlayerRiichisWon: 0,
            northPlayerRiichisWon: 0,
            eastPlayerDoraSum: 0,
            southPlayerDoraSum: 0,
            westPlayerDoraSum: 0,
            northPlayerDoraSum: 0,
        };
        Meteor.call('insertInProgressJapaneseGame', game, function (error, game_id) {
            Session.set("game_id", game_id);
            localStorage.setItem("game_id", Session.get("game_id"));
            localStorage.setItem("game_type", "jp");
            localStorage.setItem("game_over", 0);
        });

    },

    //Submission of a hand
    'click .submit_hand_button'(event, template) {

        if ( !$( event.target ).hasClass( "disabled")) {

            const handType = template.hand_type.get();
            //Do nothing if we don't have players yet
            if (GameRecordUtils.allPlayersSelected()) {
                // Save what the free riichi stick number is in case we delete this hand
                template.riichi_sum_history.push(Session.get("free_riichi_sticks"));

                switch(handType) {
                    // Push a deal in hand and ensure proper information
                case Constants.JPN_DEAL_IN:
                    // Ensure correct input of who won and who lost
                    if (Session.get("round_winner") != Constants.NO_PERSON &&
                        Session.get("round_loser") != Constants.NO_PERSON &&
                        Session.get("round_winner") != Session.get("round_loser")) {
                        // Ensure a valid point/fu combination
                        if (GameRecordUtils.noIllegalJapaneseHands()) {
                            push_dealin_hand(template);
                            $( ".delete_hand_button" ).removeClass( "disabled" );
                            resetRoundStats();
                        }
                        else {
                            window.alert("Invalid points/fu entry!");
                            return;
                        }
                    } else {
                        window.alert("You need to fill out who won and who dealt in!");
                        return;
                    }
                    break;
                    // Push a self draw hand and ensure proper information
                case Constants.JPN_SELF_DRAW:
                    // Ensure correct input of who won
                    if (Session.get("round_winner") != Constants.NO_PERSON) {
                        // Ensure a valid point/fu combination
                        if (GameRecordUtils.noIllegalSelfdrawJapaneseHands()) {
                            push_selfdraw_hand(template);
                            $( ".delete_hand_button" ).removeClass( "disabled" );
                            resetRoundStats();
                        }
                        else {
                            window.alert("Invalid points/fu entry!");
                            return;
                        }
                    } else {
                        window.alert("You need to fill out who self drew!");
                        return;
                    }
                    break;
                    // Push a tenpai hand -> cannot input invalid information
                case Constants.JPN_NO_WIN:
                    push_nowin_hand(template);
                    $( ".delete_hand_button" ).removeClass( "disabled" );
                    resetRoundStats();
                    break;
                    // Push a restart hand -> cannot input invalid information
                case Constants.JPN_RESTART:
                    push_restart_hand(template);
                    $( ".delete_hand_button" ).removeClass( "disabled" );
                    resetRoundStats();
                    break;
                    // Push a chombo hand and ensure proper information
                case Constants.JPN_MISTAKE:
                    // Ensure correct input of who chomboed
                    if (Session.get("round_loser") != Constants.NO_PERSON) {
                        push_mistake_hand(template);
                        $( ".delete_hand_button" ).removeClass( "disabled" );
                        resetRoundStats();
                    } else {
                        window.alert("You need to fill out who chomboed!");
                        return;
                    }

                    break;
                    // Push a hand where pao was split and ensure proper information
                case Constants.JPN_DEAL_IN_PAO:
                    // Ensure correct input of winner, loser, and pao player
                    if (Session.get("round_winner") != Constants.NO_PERSON &&
                        Session.get("round_loser") != Constants.NO_PERSON &&
                        Session.get("round_pao_player") != Constants.NO_PERSON &&
                        Session.get("round_winner") != Session.get("round_loser") &&
                        Session.get("round_loser") != Session.get("round_pao_player") &&
                        Session.get("round_pao_player") != Session.get("round_winner")) {
                        //Ensure a valid point/fu combination
                        if (GameRecordUtils.noIllegalJapaneseHands()) {
                            push_split_pao_hand(template);
                            $( ".delete_hand_button" ).removeClass( "disabled" );
                            resetRoundStats();
                        }
                        else {
                            window.alert("Invalid points/fu entry!");
                            return;
                        }
                    } else {
                        window.alert("You need to fill out who won, who dealt in, and who has pao penalty!");
                        return;
                    }
                    break;
                    // No other hands should be possible!
                default:
                    console.log(handType);
                    break;
                };
            } else {
                window.alert("You need to fill out the player information!");
                return;
            }

            let current_hand = template.hands.get()[template.hands.get().length - 1];

            let game = {
               game_id: Session.get("game_id"),
               all_hands: template.hands.get(),
               current_round: Session.get("current_round"),
               current_bonus: Session.get("current_bonus"),
               free_riichi_sticks: Session.get("free_riichi_sticks"),
               riichi_sum_history: template.riichi_sum_history,
               riichi_round_history: template.riichi_round_history,
               eastPlayerWins: Session.get("eastPlayerWins"),
               southPlayerWins: Session.get("southPlayerWins"),
               westPlayerWins: Session.get("westPlayerWins"),
               northPlayerWins: Session.get("northPlayerWins"),
               eastPlayerLosses: Session.get("eastPlayerLosses"),
               southPlayerLosses: Session.get("southPlayerLosses"),
               westPlayerLosses: Session.get("westPlayerLosses"),
               northPlayerLosses: Session.get("northPlayerLosses"),
               eastPlayerPointsWon: Session.get("eastPlayerPointsWon"),
               southPlayerPointsWon: Session.get("southPlayerPointsWon"),
               westPlayerPointsWon: Session.get("westPlayerPointsWon"),
               northPlayerPointsWon: Session.get("northPlayerPointsWon"),
               eastMistakeTotal: Session.get("eastMistakeTotal"),
               southMistakeTotal: Session.get("southMistakeTotal"),
               westMistakeTotal: Session.get("westMistakeTotal"),
               northMistakeTotal: Session.get("northMistakeTotal"),
               east_riichi_sum: Session.get("east_riichi_sum"),
               south_riichi_sum: Session.get("south_riichi_sum"),
               west_riichi_sum: Session.get("west_riichi_sum"),
               north_riichi_sum: Session.get("north_riichi_sum"),
               eastPlayerRiichisWon: Session.get("eastPlayerRiichisWon"),
               southPlayerRiichisWon: Session.get("southPlayerRiichisWon"),
               westPlayerRiichisWon: Session.get("westPlayerRiichisWon"),
               northPlayerRiichisWon: Session.get("northPlayerRiichisWon"),
               eastPlayerDoraSum: Session.get("eastPlayerDoraSum"),
               southPlayerDoraSum: Session.get("southPlayerDoraSum"),
               westPlayerDoraSum: Session.get("westPlayerDoraSum"),
               northPlayerDoraSum: Session.get("northPlayerDoraSum"),
               eastDelta: current_hand.eastDelta,
               southDelta: current_hand.southDelta,
               westDelta: current_hand.westDelta,
               northDelta: current_hand.northDelta
            };

            Meteor.call('updateInProgressJapaneseGame', game);

            // If game ending conditions are met, do not allow more hand submissions and allow game submission
            if (GameRecordUtils.japaneseGameOver(handType)) {
                localStorage.setItem("game_over", 1);
                $( event.target ).addClass( "disabled");
                $( ".submit_game_button" ).removeClass( "disabled" );
            }
        }
    },
    //Remove the last submitted hand
    'click .delete_hand_button'(event, template) {
        if ( !$(event.target ).hasClass( "disabled" )) {
            let r = confirm("Are you sure you want to delete the last hand?");
            // Reset game to last hand state
            if (r == true) {
                // Deletes last hand
                let del_hand = Template.instance().hands.pop();

                Session.set("east_score", Number(Session.get("east_score")) - Number(del_hand.eastDelta));
                Session.set("south_score", Number(Session.get("south_score")) - Number(del_hand.southDelta));
                Session.set("west_score", Number(Session.get("west_score")) - Number(del_hand.westDelta));
                Session.set("north_score", Number(Session.get("north_score")) - Number(del_hand.northDelta));
                Session.set("current_bonus", del_hand.bonus);
                Session.set("current_round", del_hand.round);

                //Set free riichi sticks to last round's value
                Session.set("free_riichi_sticks", template.riichi_sum_history.pop());

                let riichiHistory = template.riichi_round_history.pop();
                if (riichiHistory.east == true)
                    Session.set("east_riichi_sum", Number(Session.get("east_riichi_sum")) - 1);
                if (riichiHistory.south == true)
                    Session.set("south_riichi_sum", Number(Session.get("south_riichi_sum")) - 1);
                if (riichiHistory.west == true)
                    Session.set("west_riichi_sum", Number(Session.get("west_riichi_sum")) - 1);
                if (riichiHistory.north == true)
                    Session.set("north_riichi_sum", Number(Session.get("north_riichi_sum")) - 1);

                // Rollback chombo stat
                if (del_hand.handType == Constants.MISTAKE)
                    GameRecordUtils.rollbackChomboStat(del_hand);

                // Rollback hand win/loss stat
                if (del_hand.handType == Constants.DEAL_IN || del_hand.handType == Constants.SELF_DRAW) {
                    // win stat
                    GameRecordUtils.rollbackHandWinStat(del_hand);

                    // win riichis stat
                    GameRecordUtils.rollbackHandRiichiStat(del_hand, riichiHistory);

                    // points stat
                    GameRecordUtils.rollbackTotalPointsStat(del_hand);

                    // loss stat -> may occur when pao selfdraw
                    GameRecordUtils.rollbackHandDealinStat(del_hand);
                }

                $( ".submit_hand_button" ).removeClass( "disabled" );
                $( ".submit_game_button" ).addClass( "disabled" );
                if (Template.instance().hands.get().length === 0) {
                    $( ".delete_hand_button" ).addClass( "disabled" );
                }

                let game = {
                   game_id: Session.get("game_id"),
                   all_hands: template.hands.get(),
                   current_round: Session.get("current_round"),
                   current_bonus: Session.get("current_bonus"),
                   free_riichi_sticks: Session.get("free_riichi_sticks"),
                   riichi_sum_history: template.riichi_sum_history,
                   riichi_round_history: template.riichi_round_history,
                   eastPlayerWins: Session.get("eastPlayerWins"),
                   southPlayerWins: Session.get("southPlayerWins"),
                   westPlayerWins: Session.get("westPlayerWins"),
                   northPlayerWins: Session.get("northPlayerWins"),
                   eastPlayerLosses: Session.get("eastPlayerLosses"),
                   southPlayerLosses: Session.get("southPlayerLosses"),
                   westPlayerLosses: Session.get("westPlayerLosses"),
                   northPlayerLosses: Session.get("northPlayerLosses"),
                   eastPlayerPointsWon: Session.get("eastPlayerPointsWon"),
                   southPlayerPointsWon: Session.get("southPlayerPointsWon"),
                   westPlayerPointsWon: Session.get("westPlayerPointsWon"),
                   northPlayerPointsWon: Session.get("northPlayerPointsWon"),
                   eastMistakeTotal: Session.get("eastMistakeTotal"),
                   southMistakeTotal: Session.get("southMistakeTotal"),
                   westMistakeTotal: Session.get("westMistakeTotal"),
                   northMistakeTotal: Session.get("northMistakeTotal"),
                   east_riichi_sum: Session.get("east_riichi_sum"),
                   south_riichi_sum: Session.get("south_riichi_sum"),
                   west_riichi_sum: Session.get("west_riichi_sum"),
                   north_riichi_sum: Session.get("north_riichi_sum"),
                   eastPlayerRiichisWon: Session.get("eastPlayerRiichisWon"),
                   southPlayerRiichisWon: Session.get("southPlayerRiichisWon"),
                   westPlayerRiichisWon: Session.get("westPlayerRiichisWon"),
                   northPlayerRiichisWon: Session.get("northPlayerRiichisWon"),
                   eastPlayerDoraSum: Session.get("eastPlayerDoraSum"),
                   southPlayerDoraSum: Session.get("southPlayerDoraSum"),
                   westPlayerDoraSum: Session.get("westPlayerDoraSum"),
                   northPlayerDoraSum: Session.get("northPlayerDoraSum"),
                   eastDelta: - Number(del_hand.eastDelta),
                   southDelta: - Number(del_hand.southDelta),
                   westDelta: - Number(del_hand.westDelta),
                   northDelta: - Number(del_hand.northDelta)
                };

                Meteor.call('updateInProgressJapaneseGame', game);
            }
        }
    },
    //Delete a game from the database

    'click .delete_game_button'(event, template) {
        if ( !$(event.target ).hasClass( "disabled" )) {
            let r = confirm("Are you sure you want to delete this game?");
            if (r == true) {
                let r2 = confirm("Are you sure sure you want to delete this game?");
                if (r2 == true) {
                    localStorage.clear();

                    //deletes game from in progress database
                    Meteor.call('removeInProgressJapaneseGame', Session.get("game_id"));

                    //resets page UI
                    document.getElementById("jpn_names").style.display = "block";
                    document.getElementById("jpn_game_buttons").style.display = "none";

                    document.querySelector('select[name="east_player"]').value="";
                    document.querySelector('select[name="south_player"]').value="";
                    document.querySelector('select[name="west_player"]').value="";
                    document.querySelector('select[name="north_player"]').value="";


                    //Deletes all hands to reset to empty game
                    while (template.hands.pop()) {}

                    GameRecordUtils.resetGameValues();

                    Session.set("east_score", Constants.JPN_START_POINTS);
                    Session.set("south_score", Constants.JPN_START_POINTS);
                    Session.set("west_score", Constants.JPN_START_POINTS);
                    Session.set("north_score", Constants.JPN_START_POINTS);

                    Session.set("current_round", 1);
                    Session.set("current_bonus", 0);

                    Session.set("free_riichi_sticks", 0);

                    Session.set("eastPlayerRiichisWon", 0);
                    Session.set("southPlayerRiichisWon", 0);
                    Session.set("westPlayerRiichisWon", 0);
                    Session.set("northPlayerRiichisWon", 0);

                    Session.set("eastMistakeTotal", 0);
                    Session.set("southMistakeTotal", 0);
                    Session.set("westMistakeTotal", 0);
                    Session.set("northMistakeTotal", 0);

                    Session.set("eastPlayerWins", 0);
                    Session.set("southPlayerWins", 0);
                    Session.set("westPlayerWins", 0);
                    Session.set("northPlayerWins", 0);

                    Session.set("eastPlayerPointsWon", 0);
                    Session.set("southPlayerPointsWon", 0);
                    Session.set("westPlayerPointsWon", 0);
                    Session.set("northPlayerPointsWon", 0);

                    Session.set("eastPlayerDoraSum", 0);
                    Session.set("southPlayerDoraSum", 0);
                    Session.set("westPlayerDoraSum", 0);
                    Session.set("northPlayerDoraSum", 0);

                    Session.set("eastPlayerLosses", 0);
                    Session.set("southPlayerLosses", 0);
                    Session.set("westPlayerLosses", 0);
                    Session.set("northPlayerLosses", 0);

                    resetRoundStats();

                    $( ".submit_hand_button" ).removeClass( "disabled" );
                    $( ".submit_game_button" ).addClass( "disabled" );
                    $( ".delete_hand_button" ).addClass( "disabled" );
                }
            }

        }
    },



    //Submit a game to the database
    'click .submit_game_button'(event, template) {
        if ( !$(event.target ).hasClass( "disabled" )) {
            let r = confirm("Are you sure you want to submit this game?");
            if (r == true) {
                localStorage.clear();
                let winScore = Math.max(Number(Session.get("east_score")),
                                        Number(Session.get("south_score")),
                                        Number(Session.get("west_score")),
                                        Number(Session.get("north_score")));

                if (winScore == Session.get("east_score"))
                    Session.set("east_score", winScore + Constants.JPN_RIICHI_POINTS * Number(Session.get("free_riichi_sticks")));
                else if (winScore == Session.get("south_score"))
                    Session.set("south_score", winScore + Constants.JPN_RIICHI_POINTS * Number(Session.get("free_riichi_sticks")));
                else if (winScore == Session.get("west_score"))
                    Session.set("west_score", winScore + Constants.JPN_RIICHI_POINTS * Number(Session.get("free_riichi_sticks")));
                else //if (winScore == Session.get("north_score"))
                    Session.set("north_score", winScore + Constants.JPN_RIICHI_POINTS * Number(Session.get("free_riichi_sticks")));

                save_game_to_database(template.hands.get());

                //resets page UI
                document.getElementById("jpn_names").style.display = "block";
                document.getElementById("jpn_game_buttons").style.display = "none";

                document.querySelector('select[name="east_player"]').value="";
                document.querySelector('select[name="south_player"]').value="";
                document.querySelector('select[name="west_player"]').value="";
                document.querySelector('select[name="north_player"]').value="";

                //Deletes all hands to reset to empty game
                while (template.hands.pop()) {}

                GameRecordUtils.resetGameValues();

                Session.set("east_score", Constants.JPN_START_POINTS);
                Session.set("south_score", Constants.JPN_START_POINTS);
                Session.set("west_score", Constants.JPN_START_POINTS);
                Session.set("north_score", Constants.JPN_START_POINTS);

                Session.set("current_round", 1);
                Session.set("current_bonus", 0);

                Session.set("free_riichi_sticks", 0);

                Session.set("eastPlayerRiichisWon", 0);
                Session.set("southPlayerRiichisWon", 0);
                Session.set("westPlayerRiichisWon", 0);
                Session.set("northPlayerRiichisWon", 0);

                Session.set("eastMistakeTotal", 0);
                Session.set("southMistakeTotal", 0);
                Session.set("westMistakeTotal", 0);
                Session.set("northMistakeTotal", 0);

                Session.set("eastPlayerWins", 0);
                Session.set("southPlayerWins", 0);
                Session.set("westPlayerWins", 0);
                Session.set("northPlayerWins", 0);

                Session.set("eastPlayerPointsWon", 0);
                Session.set("southPlayerPointsWon", 0);
                Session.set("westPlayerPointsWon", 0);
                Session.set("northPlayerPointsWon", 0);

                Session.set("eastPlayerDoraSum", 0);
                Session.set("southPlayerDoraSum", 0);
                Session.set("westPlayerDoraSum", 0);
                Session.set("northPlayerDoraSum", 0);

                Session.set("eastPlayerLosses", 0);
                Session.set("southPlayerLosses", 0);
                Session.set("westPlayerLosses", 0);
                Session.set("northPlayerLosses", 0);

                resetRoundStats();

                $( ".submit_hand_button" ).removeClass( "disabled" );
                $( ".submit_game_button" ).addClass( "disabled" );
                $( ".delete_hand_button" ).addClass( "disabled" );
            }
        }
    },
    //Toggle between different round types
    'click .nav-pills li'( event, template ) {
        let hand_type = $( event.target ).closest( "li" );

        hand_type.addClass( "active" );
        $( ".nav-pills li" ).not( hand_type ).removeClass( "active" );

        template.hand_type.set( hand_type.data( "template" ) );
    },
});

// Save the currently recorded game to database and update player statistics
function save_game_to_database(hands_array) {
    let east_player = Session.get("current_east");
    let south_player= Session.get("current_south");
    let west_player = Session.get("current_west");
    let north_player= Session.get("current_north");

    // Initialise game to be saved
    let game = {
        east_player: east_player,
        south_player: south_player,
        west_player: west_player,
        north_player: north_player,
        east_score: (Number(Session.get("east_score"))),
        south_score: (Number(Session.get("south_score"))),
        west_score: (Number(Session.get("west_score"))),
        north_score: (Number(Session.get("north_score"))),
        all_hands: hands_array,
    };

    // Initialise ELO calculator to update player ELO
    let jpn_elo_calculator = new EloCalculator(Constants.ELO_CALCULATOR_N,
                                               Constants.ELO_CALCULATOR_EXP,
                                               Constants.JPN_SCORE_ADJUSTMENT,
                                               game,
                                               Constants.GAME_TYPE.JAPANESE);

    let game2 = {
        positions: Constants.WINDS.map((wind) => ({ wind, score: Session.get(wind + "_score") })).sort((a, b) => b.score - a.score),
        hands_array_length: hands_array.length,
        east_elo_delta: jpn_elo_calculator.eloChange(east_player),
        south_elo_delta: jpn_elo_calculator.eloChange(south_player),
        west_elo_delta: jpn_elo_calculator.eloChange(west_player),
        north_elo_delta: jpn_elo_calculator.eloChange(north_player),
        east_player: east_player,
        south_player: south_player,
        west_player: west_player,
        north_player: north_player,
        east_score: Session.get("east_score"),
        south_score: Session.get("south_score"),
        west_score: Session.get("west_score"),
        north_score: Session.get("north_score"),
        eastPlayerWins: Session.get("eastPlayerWins"),
        southPlayerWins: Session.get("southPlayerWins"),
        westPlayerWins: Session.get("westPlayerWins"),
        northPlayerWins: Session.get("northPlayerWins"),
        eastPlayerLosses: Session.get("eastPlayerLosses"),
        southPlayerLosses: Session.get("southPlayerLosses"),
        westPlayerLosses: Session.get("westPlayerLosses"),
        northPlayerLosses: Session.get("northPlayerLosses"),
        eastMistakeTotal: Session.get("eastMistakeTotal"),
        southMistakeTotal: Session.get("southMistakeTotal"),
        westMistakeTotal: Session.get("westMistakeTotal"),
        northMistakeTotal: Session.get("northMistakeTotal"),
        eastPlayerPointsWon: Session.get("eastPlayerPointsWon"),
        southPlayerPointsWon: Session.get("southPlayerPointsWon"),
        westPlayerPointsWon: Session.get("westPlayerPointsWon"),
        northPlayerPointsWon: Session.get("northPlayerPointsWon"),
        eastMistakeTotal: Session.get("eastMistakeTotal"),
        southMistakeTotal: Session.get("southMistakeTotal"),
        westMistakeTotal: Session.get("westMistakeTotal"),
        northMistakeTotal: Session.get("northMistakeTotal"),
        east_riichi_sum: Session.get("east_riichi_sum"),
        south_riichi_sum: Session.get("south_riichi_sum"),
        west_riichi_sum: Session.get("west_riichi_sum"),
        north_riichi_sum: Session.get("north_riichi_sum"),
        eastPlayerRiichisWon: Session.get("eastPlayerRiichisWon"),
        southPlayerRiichisWon: Session.get("southPlayerRiichisWon"),
        westPlayerRiichisWon: Session.get("westPlayerRiichisWon"),
        northPlayerRiichisWon: Session.get("northPlayerRiichisWon"),
        eastPlayerDoraSum: Session.get("eastPlayerDoraSum"),
        southPlayerDoraSum: Session.get("southPlayerDoraSum"),
        westPlayerDoraSum: Session.get("westPlayerDoraSum"),
        northPlayerDoraSum: Session.get("northPlayerDoraSum")
    };

    //updates player info
    Meteor.call('updateJapanesePlayers', game2);

    //Save game to database
    Meteor.call('insertJapaneseGame', game);

    //deletes game from in progress database
    Meteor.call('removeInProgressJapaneseGame', Session.get("game_id"));
};

function push_dealin_hand(template) {
    let points = Number(Session.get("current_points"));
    let fu = Number(Session.get("current_fu"));
    let dora = Number(Session.get("current_dora"));
    let dealerWind = GameRecordUtils.roundToDealerDirection(Number(Session.get("current_round")));
    let winnerWind = GameRecordUtils.playerToDirection(Session.get("round_winner"));
    let loserWind = GameRecordUtils.playerToDirection(Session.get("round_loser"));
    let riichiSum = Session.get("free_riichi_sticks");
    let seatDeltas = {};
    Constants.WINDS.forEach(w => seatDeltas[w] = 0);

    if (winnerWind == Constants.EAST) {
        Session.set("eastPlayerWins", Number(Session.get("eastPlayerWins")) + 1);
        Session.set("eastPlayerPointsWon", Number(Session.get("eastPlayerPointsWon")) + points);
        Session.set("eastPlayerDoraSum", Number(Session.get("eastPlayerDoraSum")) + dora);
        if (Session.get("east_riichi") == true)
            Session.set("eastPlayerRiichisWon", Number(Session.get("eastPlayerRiichisWon")) + 1);
    }
    else if (winnerWind == Constants.SOUTH) {
        Session.set("southPlayerWins", Number(Session.get("southPlayerWins")) + 1);
        Session.set("southPlayerPointsWon", Number(Session.get("southPlayerPointsWon")) + points);
        Session.set("southPlayerDoraSum", Number(Session.get("southPlayerDoraSum")) + dora);
        if (Session.get("south_riichi") == true)
            Session.set("southPlayerRiichisWon", Number(Session.get("southPlayerRiichisWon")) + 1);
    }
    else if (winnerWind == Constants.WEST) {
        Session.set("westPlayerWins", Number(Session.get("westPlayerWins")) + 1);
        Session.set("westPlayerPointsWon", Number(Session.get("westPlayerPointsWon")) + points);
        Session.set("westPlayerDoraSum", Number(Session.get("westPlayerDoraSum")) + dora);
        if (Session.get("west_riichi") == true)
            Session.set("westPlayerRiichisWon", Number(Session.get("westPlayerRiichisWon")) + 1);
    }
    else if (winnerWind == Constants.NORTH) {
        Session.set("northPlayerWins", Number(Session.get("northPlayerWins")) + 1);
        Session.set("northPlayerPointsWon", Number(Session.get("northPlayerPointsWon")) + points);
        Session.set("northPlayerDoraSum", Number(Session.get("northPlayerDoraSum")) + dora);
        if (Session.get("north_riichi") == true)
            Session.set("northPlayerRiichisWon", Number(Session.get("northPlayerRiichisWon")) + 1);
    }

    if (loserWind == Constants.EAST)
        Session.set("eastPlayerLosses", Number(Session.get("eastPlayerLosses")) + 1);
    else if (loserWind == Constants.SOUTH)
        Session.set("southPlayerLosses", Number(Session.get("southPlayerLosses")) + 1);
    else if (loserWind == Constants.WEST)
        Session.set("westPlayerLosses", Number(Session.get("westPlayerLosses")) + 1);
    else if (loserWind == Constants.NORTH)
        Session.set("northPlayerLosses", Number(Session.get("northPlayerLosses")) + 1);

    // Find riichis and save them to allocate them
    if (Session.get("east_riichi") == true) {
        seatDeltas[Constants.EAST] -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("east_riichi_sum", Number(Session.get("east_riichi_sum")) + 1);
    }
    if (Session.get("south_riichi") == true) {
        seatDeltas[Constants.SOUTH] -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("south_riichi_sum", Number(Session.get("south_riichi_sum")) + 1);
    }
    if (Session.get("west_riichi") == true) {
        seatDeltas[Constants.WEST] -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("west_riichi_sum", Number(Session.get("west_riichi_sum")) + 1);
    }
    if (Session.get("north_riichi") == true) {
        seatDeltas[Constants.NORTH] -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("north_riichi_sum", Number(Session.get("north_riichi_sum")) + 1);
    }

    let handDeltas = HandScoreCalculator.jpn.dealinDelta(points,
                                                         fu,
                                                         Number(Session.get("current_bonus")),
                                                         dealerWind,
                                                         winnerWind,
                                                         loserWind,
                                                         riichiSum);
    Session.set("free_riichi_sticks", 0);

    // Accumulate hand deltas for this round
    for (const seat of Constants.WINDS) {
        seatDeltas[seat] += handDeltas[seat];
    }

    pushHand(template,
             Constants.DEAL_IN,
             seatDeltas[Constants.EAST],
             seatDeltas[Constants.SOUTH],
             seatDeltas[Constants.WEST],
             seatDeltas[Constants.NORTH]);

    if (winnerWind == dealerWind) {
        Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
    } else {
        Session.set("current_bonus", 0);
        Session.set("current_round", Number(Session.get("current_round")) + 1)
    }

    template.riichi_round_history.push({east: Session.get("east_riichi"),
                                        south: Session.get("south_riichi"),
                                        west: Session.get("west_riichi"),
                                        north: Session.get("north_riichi")});
};

function push_selfdraw_hand(template) {
    let points = Number(Session.get("current_points"));
    let fu = Number(Session.get("current_fu"));
    let dora = Number(Session.get("current_dora"));
    let dealerWind = GameRecordUtils.roundToDealerDirection(Number(Session.get("current_round")));
    let winnerWind = GameRecordUtils.playerToDirection(Session.get("round_winner"));
    let riichiSum = Session.get("free_riichi_sticks");
    let seatDeltas = {};
    Constants.WINDS.forEach(w => seatDeltas[w] = 0);

    if (winnerWind == Constants.EAST) {
        Session.set("eastPlayerWins", Number(Session.get("eastPlayerWins")) + 1);
        Session.set("eastPlayerPointsWon", Number(Session.get("eastPlayerPointsWon")) + points);
        Session.set("eastPlayerDoraSum", Number(Session.get("eastPlayerDoraSum")) + dora);
        if (Session.get("east_riichi") == true)
            Session.set("eastPlayerRiichisWon", Number(Session.get("eastPlayerRiichisWon")) + 1);
    }
    else if (winnerWind == Constants.SOUTH) {
        Session.set("southPlayerWins", Number(Session.get("southPlayerWins")) + 1);
        Session.set("southPlayerPointsWon", Number(Session.get("southPlayerPointsWon")) + points);
        Session.set("southPlayerDoraSum", Number(Session.get("southPlayerDoraSum")) + dora);

        if (Session.get("south_riichi") == true)
            Session.set("southPlayerRiichisWon", Number(Session.get("southPlayerRiichisWon")) + 1);
    }
    else if (winnerWind == Constants.WEST) {
        Session.set("westPlayerWins", Number(Session.get("westPlayerWins")) + 1);
        Session.set("westPlayerPointsWon", Number(Session.get("westPlayerPointsWon")) + points);
        Session.set("westPlayerDoraSum", Number(Session.get("westPlayerDoraSum")) + dora);
        if (Session.get("west_riichi") == true)
            Session.set("westPlayerRiichisWon", Number(Session.get("westPlayerRiichisWon")) + 1);
    }
    else if (winnerWind == Constants.NORTH) {
        Session.set("northPlayerWins", Number(Session.get("northPlayerWins")) + 1);
        Session.set("northPlayerPointsWon", Number(Session.get("northPlayerPointsWon")) + points);
        Session.set("northPlayerDoraSum", Number(Session.get("northPlayerDoraSum")) + dora);
        if (Session.get("north_riichi") == true)
            Session.set("northPlayerRiichisWon", Number(Session.get("northPlayerRiichisWon")) + 1);
    }

    if (Session.get("east_riichi") == true) {
        seatDeltas[Constants.EAST] -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("east_riichi_sum", Number(Session.get("east_riichi_sum")) + 1);
    }
    if (Session.get("south_riichi") == true) {
        seatDeltas[Constants.SOUTH] -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("south_riichi_sum", Number(Session.get("south_riichi_sum")) + 1);
    }
    if (Session.get("west_riichi") == true) {
        seatDeltas[Constants.WEST] -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("west_riichi_sum", Number(Session.get("west_riichi_sum")) + 1);
    }
    if (Session.get("north_riichi") == true) {
        seatDeltas[Constants.NORTH] -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("north_riichi_sum", Number(Session.get("north_riichi_sum")) + 1);
    }

    let handDeltas = HandScoreCalculator.jpn.selfDrawDelta(points,
                                                           fu,
                                                           Number(Session.get("current_bonus")),
                                                           dealerWind,
                                                           winnerWind,
                                                           riichiSum);
    Session.set("free_riichi_sticks", 0);

    // Accumulate hand deltas for this round
    for (const seat of Constants.WINDS) {
        seatDeltas[seat] += handDeltas[seat];
    }

    pushHand(template,
             Constants.SELF_DRAW,
             seatDeltas[Constants.EAST],
             seatDeltas[Constants.SOUTH],
             seatDeltas[Constants.WEST],
             seatDeltas[Constants.NORTH]);

    if (winnerWind == dealerWind)
        Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
    else {
        Session.set("current_bonus", 0);
        Session.set("current_round", Number(Session.get("current_round")) + 1);
    }

    template.riichi_round_history.push({east: Session.get("east_riichi"),
                                        south: Session.get("south_riichi"),
                                        west: Session.get("west_riichi"),
                                        north: Session.get("north_riichi")});
};

function push_nowin_hand(template) {
    let eastDelta = 0, southDelta = 0, westDelta = 0, northDelta = 0;
    let tenpaiSum = 0, tenpaiWin, tenpaiLose, riichiSum = 0;

    if (Session.get("east_tenpai") == true) tenpaiSum++;
    if (Session.get("south_tenpai") == true) tenpaiSum++;
    if (Session.get("west_tenpai") == true) tenpaiSum++;
    if (Session.get("north_tenpai") == true) tenpaiSum++;

    tenpaiWin = Constants.JPN_TENPAI_PAYOUT / tenpaiSum;
    tenpaiLose = -Constants.JPN_TENPAI_PAYOUT / (4 - tenpaiSum);
    if (tenpaiSum != 4 && tenpaiSum != 0) {
        eastDelta += Session.get("east_tenpai") == true ? tenpaiWin : tenpaiLose;
        southDelta += Session.get("south_tenpai") == true ? tenpaiWin : tenpaiLose;
        westDelta += Session.get("west_tenpai") == true ? tenpaiWin : tenpaiLose;
        northDelta += Session.get("north_tenpai") == true ? tenpaiWin : tenpaiLose;
    }

    if (Session.get("east_riichi") == true) {
        eastDelta -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("east_riichi_sum", Number(Session.get("east_riichi_sum")) + 1);
    }
    if (Session.get("south_riichi") == true) {
        southDelta -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("south_riichi_sum", Number(Session.get("south_riichi_sum")) + 1);
    }
    if (Session.get("west_riichi") == true) {
        westDelta -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("west_riichi_sum", Number(Session.get("west_riichi_sum")) + 1);
    }
    if (Session.get("north_riichi") == true) {
        northDelta -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("north_riichi_sum", Number(Session.get("north_riichi_sum")) + 1);
    }

    Session.set("free_riichi_sticks", Number(Session.get("free_riichi_sticks")) + riichiSum);

    pushHand(template, Constants.NO_WIN, eastDelta, southDelta, westDelta, northDelta);

    if (Session.get(GameRecordUtils.roundToDealerDirection(Session.get("current_round")) + "_tenpai") == true)
        Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
    else {
        Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
        Session.set("current_round", Number(Session.get("current_round")) + 1);
    }

    template.riichi_round_history.push({east: Session.get("east_riichi"),
                                        south: Session.get("south_riichi"),
                                        west: Session.get("west_riichi"),
                                        north: Session.get("north_riichi")});
};

function push_restart_hand(template) {
    let eastDelta = 0, southDelta = 0, westDelta = 0, northDelta = 0;
    let riichiSum = 0;

    if (Session.get("east_riichi") == true) {
        eastDelta -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("east_riichi_sum", Number(Session.get("east_riichi_sum")) + 1);
    }
    if (Session.get("south_riichi") == true) {
        southDelta -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("south_riichi_sum", Number(Session.get("south_riichi_sum")) + 1);
    }
    if (Session.get("west_riichi") == true) {
        westDelta -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("west_riichi_sum", Number(Session.get("west_riichi_sum")) + 1);
    }
    if (Session.get("north_riichi") == true) {
        northDelta -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("north_riichi_sum", Number(Session.get("north_riichi_sum")) + 1);
    }

    Session.set("free_riichi_sticks", Number(Session.get("free_riichi_sticks")) + riichiSum);

    pushHand(template, Constants.RESTART, eastDelta, southDelta, westDelta, northDelta);

    Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);

    template.riichi_round_history.push({east: Session.get("east_riichi"),
                                        south: Session.get("south_riichi"),
                                        west: Session.get("west_riichi"),
                                        north: Session.get("north_riichi")});
};

function push_mistake_hand(template) {
    let loserWind = GameRecordUtils.playerToDirection(Session.get("round_loser"));
    let handDeltas = HandScoreCalculator.jpn.mistakeDelta(loserWind);

    if (loserWind == Constants.EAST) {
        Session.set("eastMistakeTotal", Number(Session.get("eastMistakeTotal")) + 1);
    } else if (loserWind == Constants.SOUTH) {
        Session.set("southMistakeTotal", Number(Session.get("southMistakeTotal")) + 1);
    } else if (loserWind == Constants.WEST) {
        Session.set("westMistakeTotal", Number(Session.get("westMistakeTotal")) + 1);
    } else if (loserWind == Constants.NORTH) {
        Session.set("northMistakeTotal", Number(Session.get("northMistakeTotal")) + 1);
    }

    pushHand(template,
             Constants.MISTAKE,
             handDeltas[Constants.EAST],
             handDeltas[Constants.SOUTH],
             handDeltas[Constants.WEST],
             handDeltas[Constants.NORTH]);

    template.riichi_round_history.push({east: false,
                                        south: false,
                                        west: false,
                                        north: false});
};

function push_split_pao_hand(template) {
    let points = Number(Session.get("current_points"));
    let fu = Number(Session.get("current_fu"));
    let dora = Number(Session.get("current_dora"));
    let dealerWind = GameRecordUtils.roundToDealerDirection(Number(Session.get("current_round")));
    let winnerWind = GameRecordUtils.playerToDirection(Session.get("round_winner"));
    let loserWind = GameRecordUtils.playerToDirection(Session.get("round_loser"));
    let paoWind = GameRecordUtils.playerToDirection(Session.get("round_pao_player"));
    let riichiSum = Session.get("free_riichi_sticks");
    let seatDeltas = {};
    Constants.WINDS.forEach(w => seatDeltas[w] = 0);

    if (winnerWind == Constants.EAST) {
        Session.set("eastPlayerWins", Number(Session.get("eastPlayerWins")) + 1);
        Session.set("eastPlayerPointsWon", Number(Session.get("eastPlayerPointsWon")) + points);
        Session.set("eastPlayerDoraSum", Number(Session.get("eastPlayerDoraSum")) + dora);
        if (Session.get("east_riichi") == true)
            Session.set("eastPlayerRiichisWon", Number(Session.get("eastPlayerRiichisWon")) + 1);
    }
    else if (winnerWind == Constants.SOUTH) {
        Session.set("southPlayerWins", Number(Session.get("southPlayerWins")) + 1);
        Session.set("southPlayerPointsWon", Number(Session.get("southPlayerPointsWon")) + points);
        Session.set("southPlayerDoraSum", Number(Session.get("southPlayerDoraSum")) + dora);
        if (Session.get("south_riichi") == true)
            Session.set("southPlayerRiichisWon", Number(Session.get("southPlayerRiichisWon")) + 1);
    }
    else if (winnerWind == Constants.WEST) {
        Session.set("westPlayerWins", Number(Session.get("westPlayerWins")) + 1);
        Session.set("westPlayerPointsWon", Number(Session.get("westPlayerPointsWon")) + points);
        Session.set("westPlayerDoraSum", Number(Session.get("westPlayerDoraSum")) + dora);
        if (Session.get("west_riichi") == true)
            Session.set("westPlayerRiichisWon", Number(Session.get("westPlayerRiichisWon")) + 1);
    }
    else if (winnerWind == Constants.NORTH) {
        Session.set("northPlayerWins", Number(Session.get("northPlayerWins")) + 1);
        Session.set("northPlayerPointsWon", Number(Session.get("northPlayerPointsWon")) + points);
        Session.set("northPlayerDoraSum", Number(Session.get("northPlayerDoraSum")) + dora);
        if (Session.get("north_riichi") == true)
            Session.set("northPlayerRiichisWon", Number(Session.get("northPlayerRiichisWon")) + 1);
    }

    if (loserWind == Constants.EAST || paoWind == Constants.EAST)
        Session.set("eastPlayerLosses", Number(Session.get("eastPlayerLosses")) + 1);
    else if (loserWind == Constants.SOUTH || paoWind == Constants.SOUTH)
        Session.set("southPlayerLosses", Number(Session.get("southPlayerLosses")) + 1);
    else if (loserWind == Constants.WEST || paoWind == Constants.WEST)
        Session.set("westPlayerLosses", Number(Session.get("westPlayerLosses")) + 1);
    else if (loserWind == Constants.NORTH || paoWind == Constants.NORTH)
        Session.set("northPlayerLosses", Number(Session.get("northPlayerLosses")) + 1);

    if (Session.get("east_riichi") == true) {
        seatDeltas[Constants.EAST] -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("east_riichi_sum", Number(Session.get("east_riichi_sum")) + 1);
    }
    if (Session.get("south_riichi") == true) {
        seatDeltas[Constants.SOUTH] -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("south_riichi_sum", Number(Session.get("south_riichi_sum")) + 1);
    }
    if (Session.get("west_riichi") == true) {
        seatDeltas[Constants.WEST] -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("west_riichi_sum", Number(Session.get("west_riichi_sum")) + 1);
    }
    if (Session.get("north_riichi") == true) {
        seatDeltas[Constants.NORTH] -= Constants.JPN_RIICHI_POINTS;
        riichiSum++;
        Session.set("north_riichi_sum", Number(Session.get("north_riichi_sum")) + 1);
    }

    let value = HandScoreCalculator.jpn.dealinDelta(points,
                                                    fu,
                                                    Number(Session.get("current_bonus")),
                                                    dealerWind,
                                                    winnerWind,
                                                    loserWind,
                                                    0)[winnerWind];

    if (((value / 2 ) % 100) == 50) {
        value += 100;
    }

    // Accumulate hand deltas for this round
    for (const wind of Constants.WINDS) {
        if (wind === winnerWind) {
            seatDeltas[wind] += value + riichiSum * Constants.JPN_RIICHI_POINTS;
        } else if (wind === loserWind || wind === paoWind) {
            seatDeltas[wind] -= value / 2;
        }
    }
    Session.set("free_riichi_sticks", 0);

    pushHand(template,
             Constants.PAO,
             seatDeltas[Constants.EAST],
             seatDeltas[Constants.SOUTH],
             seatDeltas[Constants.WEST],
             seatDeltas[Constants.NORTH]);

    if (winnerWind == dealerWind)
        Session.set("current_bonus", Number(Session.get("current_bonus")) + 1);
    else {
        Session.set("current_bonus", 0);
        Session.set("current_round", Number(Session.get("current_round")) + 1)
    }

    template.riichi_round_history.push({east: Session.get("east_riichi"),
                                        south: Session.get("south_riichi"),
                                        west: Session.get("west_riichi"),
                                        north: Session.get("north_riichi")});
};

function pushHand(template, handType, eastDelta, southDelta, westDelta, northDelta) {
    template.hands.push(
        {
            handType: handType,
            round: Session.get("current_round"),
            bonus: Session.get("current_bonus"),
            points: Session.get("current_points"),
            fu: Session.get("current_fu"),
            dora: Session.get("current_dora"),
            eastDelta: eastDelta,
            southDelta: southDelta,
            westDelta: westDelta,
            northDelta: northDelta,
        });

    Session.set("east_score", Number(Session.get("east_score")) + eastDelta);
    Session.set("south_score", Number(Session.get("south_score")) + southDelta);
    Session.set("west_score", Number(Session.get("west_score")) + westDelta);
    Session.set("north_score", Number(Session.get("north_score")) + northDelta);
};

function setAllGUIRiichisFalse() {
    Session.set("east_riichi", false);
    Session.set("south_riichi", false);
    Session.set("west_riichi", false);
    Session.set("north_riichi", false);
};

function resetRoundStats() {
    Session.set("current_points", 0);
    Session.set("current_fu", 0);
    Session.set("current_dora", 0);
    Session.set("round_winner", Constants.NO_PERSON);
    Session.set("round_loser", Constants.NO_PERSON);
    Session.set("round_pao_player", Constants.NO_PERSON);

    for (let wind of Constants.WINDS) {
        Session.set(wind + "_riichi", false);
        Session.set(wind + "_tenpai", false);
    }

    $( ".winner_buttons button" ).removeClass( "disabled" );
    $( ".loser_buttons button" ).removeClass( "disabled" );
    $( ".riichi_buttons button" ).removeClass( "disabled" );
    $( ".tenpai_buttons button" ).removeClass( "disabled" );
    $( ".pao_buttons button" ).removeClass( "disabled" );

    $( ".winner_buttons button" ).removeClass( "active" );
    $( ".loser_buttons button" ).removeClass( "active" );
    $( ".riichi_buttons button" ).removeClass( "active" );
    $( ".tenpai_buttons button" ).removeClass( "active" );
    $( ".pao_buttons button" ).removeClass( "active" );

    $( "select.points" ).val(undefined);
    $( "select.fu" ).val(undefined);
    $( "select.dora" ).val(undefined);
};

Template.jpn_points.events({
    'change select[name="points"]'(event) {
        Session.set("current_points", event.target.value);
    }
});

Template.jpn_fu.events({
    'change select[name="fu"]'(event) {
        Session.set("current_fu", event.target.value);
    }
});

Template.jpn_dora.events({
    'change select[name="dora"]'(event) {
        Session.set("current_dora", event.target.value);
    }
});
