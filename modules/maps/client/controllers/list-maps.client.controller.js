(function () {
  'use strict';

  angular
    .module('maps')
    .controller('MapsListController', MapsListController);

  MapsListController.$inject = ['$scope', '$state', '$modal', 'MapsService'];

  function MapsListController($scope, $state, $modal, MapsService) {
    var vm = this;

    /* vm.maps is an array of parking objects to display in a map. */
    vm.maps = MapsService.query();


    /* Map properties */
    $scope.map = {center: [29.6436, -82.3549], zoom: 4};
    /* Markers to represents in google map */
    $scope.markers = [];

      $scope.fillMapContainer = function() {
      /* Markets' color */
      var colorsDynamic=['98FB98','D7FF33','B2FF33','33FFC7','33FFF0','FF6B33','FFA233','FF33AC'];
      /* Clear the marker container */
      $scope.markers = [];
      /* Create a new marker array with all the parking information */
        for (var i = 0; i < vm.maps.length; i++) {
        var parking = vm.maps[i];
        var title = "Name: " + parking.parking_name + "\n" + "Availability: " + parking.availability;
        if (parking.coordinates) {
            $scope.markers.push({
            title: title,
            parking_name: parking.parking_name,
            address: parking.location,
            position: [parking.coordinates.latitude, parking.coordinates.longitude],
            availability: parking.availability,
            price: parking.price,
            icon: 'http://chart.apis.google.com/chart?chst=d_map_xpin_letter&chld=pin|' + parking.availability +'|'+colorsDynamic[i % 8],
            id: parking._id
          });
        }
      }
    };


    // Change the view and load the today event list.
    // vm.goToView = function (evt) {
    //       alert(evt.id);
    //   $state.go('maps.view', {'mapId': evt.id});
    // };


      $scope.endID = undefined;
      vm.parkingModal = function (obj, marker) {
          // Display parking information.
          $modal.open({
              templateUrl:'modules/maps/client/views/parkingModal-map.client.view.html',
              controller: function ($scope, $modalInstance) {
                  $scope.marker = marker;
                  // console.log('Hello: ' +  marker.id);
              },
              resolve: {

              }
          }).result.then($scope.Agree = function() {
              // The agreement was accepted.
              // console.log("Return was valid!");
              // Ready to find a way to the parking location.
              $scope.endID = marker.id;
          }, function() {
              // Agreement Canceled.
              // console.log("Cancel");
          });

          // Do not go to this parking location.
          // console.log("Return false!");
          return false;
      };
  }
}());
