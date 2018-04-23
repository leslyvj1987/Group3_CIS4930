'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Map Schema
 */
var MapSchema = new Schema({
  parking_name: {
    type: String,
    default: '',
    required: 'Please fill parking name',
    trim: true
  },
  availability: {
    type: Number,
    default: 0
  },
    viewers:{
      type: [
        {
          ip: String,
          date: Date
        }
      ]
    },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  location: {
    type: String,
    default: '',
    trim: true
  },
  price: {
    type: Number,
    default: 0
  },
  created: {
    type: Date,
    default: Date.now
  }

  // user: {
  //   type: Schema.ObjectId,
  //   ref: 'User'
  // }
});

mongoose.model('Map', MapSchema);
