import Players from '../../api/Players';

import Constants from '../../api/Constants';

import './RecordChooseTypeModal.html';

Template.RecordChooseTypeModal.helpers({
    players(style) {
	switch (style) {
	case Constants.GAME_TYPE.HONG_KONG:
	    return Players.find({}, {sort: { hongKongLeagueName: 1 }});
	case Constants.GAME_TYPE.JAPANESE:
	    return Players.find({}, {sort: { japaneseLeagueName: 1 }});
	};
    },
    isHongKongStyle(style) {
	return style === Constants.GAME_TYPE.HONG_KONG;
    },
    isJapaneseStyle(style) {
	return style === Constants.GAME_TYPE.JAPANESE;
    },
});
