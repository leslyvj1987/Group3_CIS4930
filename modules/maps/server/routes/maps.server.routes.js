'use strict';

/**
 * Module dependencies
 */
var mapsPolicy = require('../policies/maps.server.policy'),
  maps = require('../controllers/maps.server.controller');

module.exports = function(app) {
  // Maps Routes
  app.route('/api/maps').all(mapsPolicy.isAllowed)
    .get(maps.list)
    .post(maps.create);

  app.route('/api/maps/:mapId').all(mapsPolicy.isAllowed)
    .get(maps.read)
    .put(maps.update)
    .delete(maps.delete);

  // Finish by binding the Map middleware
  app.param('mapId', maps.mapByID);
};
