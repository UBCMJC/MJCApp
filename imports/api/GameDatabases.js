import { Mongo } from 'meteor/mongo';

import Players from './Players';

export const HongKongHands = new Mongo.Collection('hongKongHands');
export const JapaneseHands = new Mongo.Collection('japaneseHands');

Meteor.methods({
  getJapaneseGame: function (gameId) {
     return JapaneseHands.findOne({_id: gameId});
  },
  canRetrievePlayer: function (param) {
     return Players.find().fetch();
  }
});