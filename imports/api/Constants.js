// A class/namespace of commonly used Constants
const Constants = {
    // Title
    MAHJONG_CLUB_LEAGUE: "Mahjong Club League",

    // Universal hands per round in a four player game
    HANDS_PER_ROUND: 4,

    // The maximum hand size in a Hong Kong game
    HKG_MAX_HAND_SIZE: 13,

    // The starting number of points in a Hong Kong game
    HKG_START_POINTS: 750,

    // Points paid out for a mistake in a Hong Kong game
    HKG_MISTAKE_POINTS: 600,

    // The number of rounds in a Hong Kong game
    HKG_NUM_ROUNDS: 4,

    // The number of hands in a Hong Kong game
    get HKG_NUM_HANDS() { return this.HKG_NUM_ROUNDS * this.HANDS_PER_ROUND },

    // The maximum hand size in a Japanese game (yakuman)
    // Hands may be bigger, but must be a multiple of this value
    JPN_MAX_HAND_SIZE: 13,

    // The maximum yakuman multiple in a Japanese game
    JPN_MAX_YAKUMAN_MULTIPLE: 5,

    // The starting number of points in a Japanese game
    JPN_START_POINTS: 25000,

    // The number of points distributed upon a tenpai round
    // from noten players to tenpai ones in a Japanese game
    JPN_TENPAI_PAYOUT: 3000,

    // The required number of points of any one player to
    // end a game at the end of "South" round in a Japanese
    // game
    JPN_END_POINTS: 30000,

    // Base points for a "mangan" hand in a Japanese game
    JPN_MANGAN_BASE_POINTS: 2000,

    // Points added for every bonus round in a Japanese game
    JPN_BONUS_POINTS: 300,

    // Points added or deducted for a riichi stick in a
    // Japanese game
    JPN_RIICHI_POINTS: 1000,

    // Points paid out for a mistake in a Japanese game
    JPN_MISTAKE_POINTS: 12000,

    // The number of rounds in a Japanese game
    JPN_NUM_ROUNDS: 2,

    // The number of hands in a Japanese game
    get JPN_NUM_HANDS() { return this.JPN_NUM_ROUNDS * this.HANDS_PER_ROUND },

    // Constants for defining the ELO calculation operation
    ELO_CALCULATOR_N: 2000,
    ELO_CALCULATOR_EXP: 5,

    // Score adjustment for Hong Kong ending scores
    // Calculated as analogous to Japanese system
    HKG_SCORE_ADJUSTMENT: [
        100,
        50,
        -50,
        -100
    ],

    // Score adjustment for Japanese ending scores
    // Calculated as
    // 1st = 100,000 - 2nd - 3rd - 4th - 1st = 15,000
    // 2nd = 2nd - 30,000 + 10,000 = 5,000
    // 3rd = 3rd - 30,000 + 0 = -5,000
    // 4th = 4th - 30,000 - 10,000 = -15,000
    JPN_SCORE_ADJUSTMENT: [
        15000,
        5000,
        -5000,
        -15000
    ],

    // Placeholder value to establish a player select button
    // That has no player selected
    NO_PERSON: "no one",

    // The default text to display for player buttons/fields
    // When no player has been selected
    DEFAULT_EAST: "Select East!",
    DEFAULT_SOUTH: "Select South!",
    DEFAULT_WEST: "Select West!",
    DEFAULT_NORTH: "Select North!",

    // An enum of game types for shared yet slightly altered
    // rules.  Possibly add more if ever decided to
    GAME_TYPE: {
        // Hong Kong Old Style
        HONG_KONG: "hongKong",
        // Japanese Riichi Style
        JAPANESE: "japanese"
    },

    // Round End Conditions
    DEAL_IN: "dealin",
    SELF_DRAW: "selfdraw",
    NO_WIN: "nowin",
    PAO: "pao",
    RESTART: "restart",
    MISTAKE: "mistake",

    // Direction Constants
    EAST: "east",
    SOUTH: "south",
    WEST: "west",
    NORTH: "north",

    get WINDS() { return [this.EAST, this.SOUTH, this.WEST, this.NORTH]; },

    // Hong Kong HTML forms
    // Be careful as some of these are hardcoded in HTML!
    HKG_DEAL_IN: "hkg_dealin",
    HKG_SELF_DRAW: "hkg_selfdraw",
    HKG_NO_WIN: "hkg_nowin",
    HKG_MISTAKE: "hkg_mistake",
    HKG_PAO: "hkg_pao",

    // Japanese HTML forms
    // Be careful as some of these are hardcoded in HTML!
    JPN_DEAL_IN: "jpn_dealin",
    JPN_SELF_DRAW: "jpn_selfdraw",
    JPN_NO_WIN: "jpn_nowin",
    JPN_RESTART: "jpn_restart",
    JPN_MISTAKE: "jpn_mistake",
    JPN_DEAL_IN_PAO: "jpn_dealin_pao",

    PRIORITY: {
        east: 3,
        south: 2,
        west: 1,
        north: 0,
    }
};

export default Constants;

function registerConstants(object, prefix) {
    for (let key in object) {
        let value = object[key];
        if (value instanceof Object && !Array.isArray(value)) {
            registerConstants(value, prefix + key + ".");
        } else {
            Template.registerHelper(prefix + key, () => value);
        }
    }
}

registerConstants(Constants, "");
