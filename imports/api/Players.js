import { Mongo } from 'meteor/mongo';

//Until some actually halfway programming happens players 
//must be created and edited through the actual database
// >>This might not be a bad thing
export default new Mongo.Collection('players');