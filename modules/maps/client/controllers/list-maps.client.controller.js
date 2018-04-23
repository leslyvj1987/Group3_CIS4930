(function () {
  'use strict';

  angular
    .module('maps')
    .controller('MapsListController', MapsListController);

  MapsListController.$inject = ['$scope', '$state', '$modal', '$http', 'MapsService'];

  function MapsListController($scope, $state, $modal, $http, MapsService) {
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
            viewers: parking.viewers,
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
                  // Get device's ip address.
                  var url = "//freegeoip.net/json/";
                  $http.get(url).then(function(response) {
                      // console.log(response.data.ip);
                      $scope.ip = response.data.ip;

                      for (var i = 0; i < vm.maps.length; i++) {
                          if ($scope.marker.id === vm.maps[i]._id) {
                              if (!vm.maps[i].viewers) {
                                  // Create array of viewers.
                                  vm.maps[i].viewers = [];
                              }


                              // // Create an object to represent current marker date + 30 minutes.
                              // $scope.nowMinusThirty = new Date();
                              // $scope.nowMinusThirty.setMinutes($scope.nowMinusThirty.getMinutes() - 30);

                              // Look if the current device is in the DB for this parking.
                              var isPresent = false;
                              for(var j = 0; j < vm.maps[i].viewers.length; j++) {
                                  // console.log('$scope.ip:      ' + $scope.ip);
                                  // console.log('viewerIP[' + j + ']: ' + vm.maps[i].viewers[j].ip);

                                  if(vm.maps[i].viewers[j].ip === $scope.ip) {
                                      // Change the date if the ip exists in the DB.
                                      vm.maps[i].viewers[j].date = new Date();
                                      isPresent = true;
                                      console.log('Ip exists! and the date is:' + vm.maps[i].viewers[j].date);
                                  } else {
                                      console.log('No equal ips. Let see if it needs to be removed.');
                                      // Create an object to represent current marker date + 30 minutes.
                                      $scope.objPlusThirty = new Date(vm.maps[i].viewers[j].date);
                                      $scope.objPlusThirty.setMinutes($scope.objPlusThirty.getMinutes() + 30);

                                      console.log('objPlus:      ' + $scope.objPlusThirty);
                                      console.log('Now: ' + new Date());
                                      if($scope.objPlusThirty < new Date()) {
                                          console.log('Removing object');
                                          vm.maps[i].viewers.splice(j, 1);
                                          j--;
                                      }
                                  }
                              }

                              if (!isPresent) {
                                  // Push the current device ip and current time to the DB for this parking.
                                  vm.maps[i].viewers.push({
                                      ip: $scope.ip,
                                      date: new Date()
                                  })
                              }

                              // Update this parking
                              vm.maps[i].$update(successCallback, errorCallback);
                          }
                      }
                  });

                  function successCallback(res) {
                  }
                  function errorCallback(res) {
                      vm.error = res.data.message;
                  }
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
