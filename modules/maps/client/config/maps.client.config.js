(function () {
  'use strict';

  angular
    .module('maps')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Maps',
      state: 'maps',
      roles: ['admin']
    });
  }
}());
