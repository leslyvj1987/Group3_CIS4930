(function () {
  'use strict';

  angular
    .module('maps')
    .controller('MapsListController', MapsListController);

  MapsListController.$inject = ['$scope', '$state', '$modal', '$http', '$interval', 'MapsService'];

  function MapsListController($scope, $state, $modal, $http, $interval, MapsService) {
    var vm = this;
    vm.maps = MapsService.query();
    $scope.markers = [];
      /* Markets' color */
      var colorsDynamic=['98FB98','D7FF33','B2FF33','33FFC7','33FFF0','FF6B33','FFA233','FF33AC'];

      $scope.fillMapContainer = function() {
          /* Map properties */
          $scope.map = {center: [29.6436, -82.3549], zoom: 4, address: "686 Museum Rd, Gainesville, FL 32601"};

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



      $interval(function(){
          vm.mapsDefault = MapsService.query().$promise.then(function (data) {
              if ((data && data.length > 0) && ($scope.markers && $scope.markers.length > 0)) {
                  for (var i = 0; i < $scope.markers.length; i++) {
                      if ($scope.markers[i] && ($scope.markers[i].availability !== data[i].availability)) {
                          var temp = $scope.markers[i];
                          temp.availability = data[i].availability;
                          temp.icon = 'http://chart.apis.google.com/chart?chst=d_map_xpin_letter&chld=pin|' + temp.availability +'|'+colorsDynamic[i % 8];

                          $scope.markers.splice(i, 1);
                          $scope.markers.splice(i, 0, temp);
                      }
                  }
              }
              return data;
          });

      },5000);



      $scope.endID = undefined;
      vm.parkingModal = function (obj, marker) {
          // Display parking information.
          $modal.open({
              templateUrl:'modules/maps/client/views/parkingModal-map.client.view.html',
              controller: function ($scope, $modalInstance) {
                  $scope.marker = marker;
                  // Get device's ip address.
                  var url = "//freegeoip.net/json/";
                  $http.get(url).then(function(response) {
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
                                  if(vm.maps[i].viewers[j].ip === $scope.ip) {
                                      // Change the date if the ip exists in the DB.
                                      vm.maps[i].viewers[j].date = new Date();
                                      isPresent = true;
                                  } else {
                                      // Create an object to represent current marker date + 30 minutes.
                                      $scope.objPlusThirty = new Date(vm.maps[i].viewers[j].date);
                                      $scope.objPlusThirty.setMinutes($scope.objPlusThirty.getMinutes() + 30);

                                      if($scope.objPlusThirty < new Date()) {
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
              // Ready to find a way to the parking location.
              $scope.endID = marker.id;
          }, function() {
              // Agreement Canceled.
          });

          // Do not go to this parking location.
          return false;
      };

  }
}());
