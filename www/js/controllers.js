angular.module('app.controllers', [])

.controller('mapCtrl', function($scope) {
  $scope.isTracking = false;
  $scope.trackingPoints = [];
  var bgLocationServices;
  var map;

  ionic.Platform.ready(function(onError){
    bgLocationServices = window.plugins.backgroundLocationServices;

    bgLocationServices.configure({
         //Both
         desiredAccuracy: 20, // Desired Accuracy of the location updates (lower means more accurate but more battery consumption)
         distanceFilter: 5, // (Meters) How far you must move from the last point to trigger a location update
         debug: true, // <-- Enable to show visual indications when you receive a background location update
         interval: 9000, // (Milliseconds) Requested Interval in between location updates.
         //Android Only
         notificationTitle: 'EcoRun', // customize the title of the notification
         notificationText: 'Tracking', //customize the text of the notification
         fastestInterval: 5000, // <-- (Milliseconds) Fastest interval your app / server can handle updates
         useActivityDetection: true // Uses Activitiy detection to shut off gps when you are still (Greatly enhances Battery Life)

    });

    bgLocationServices.registerForLocationUpdates(function(location) {
         console.log("We got an BG Update" + JSON.stringify(location));
         $scope.trackingPoints.push([location.latitude, location.longitude, new Date()])
    }, function(err) {
         console.log("Error: Didnt get an update", err);
    });

    //Register for Activity Updates (ANDROID ONLY)
    //Uses the Detected Activies API to send back an array of activities and their confidence levels
    //See here for more information: //https://developers.google.com/android/reference/com/google/android/gms/location/DetectedActivity
    bgLocationServices.registerForActivityUpdates(function(acitivites) {
         console.log("We got an BG Update" + activities);
    }, function(err) {
         console.log("Error: Something went wrong", err);
    });
  });

  $scope.initMap = function() {
    map = new google.maps.Map(document.getElementById('map'), {
      /*center: {lat: 43.7034, lng: 7.2663},*/
      center: {lat: 41.390205, lng: 2.154},
      zoom: 12
    });

    navigator.geolocation.getCurrentPosition(function(pos) {
      console.log(pos.coords)

      new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        center: {lat: pos.coords.latitude, lng: pos.coords.longitude},
        radius: 3
      });
    });
  }

  $scope.startTracking = function() {
    bgLocationServices.start()
    $scope.isTracking = true;
  }

  $scope.stopTracking = function() {
    bgLocationServices.stop()
    $scope.isTracking = false;
    $scope.trackingPoints = [];

    //TODO: enviar locations al server
  }
})

.controller('newRouteCtrl', function($scope) {

})

.controller('storeCtrl', function($scope, $http) {
  $scope.products = []
  $http({
    method: 'GET',
    url: 'http://localhost:7070/products/list'
  }).then(function successCallback(response) {
    $scope.products = response.data;
  }, function errorCallback(response) {
    console.log(response)
  });
})

.controller('profileCtrl', function($scope) {

})
