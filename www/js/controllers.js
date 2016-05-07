console.log("hi")
angular.module('app.controllers', [])

.controller('mapCtrl', function($scope, $http) {
  $scope.isTracking = false;
  $scope.trackingPoints = [];
  var bgLocationServices;
  var map;
  var line;
  var uuid;

  var marker;

  ionic.Platform.ready(function(onError){
    if (window.device) {
      uuid = window.device.uuid
    } else {
      uuid = "dev"
    }
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
      center: {lat:  43.46278, lng: -3.80500},
      zoom: 12
    });

    navigator.geolocation.getCurrentPosition(function(pos) {
      console.log(pos.coords)

      new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#00FF00',
        fillOpacity: 0.35,
        map: map,
        center: {lat: pos.coords.latitude, lng: pos.coords.longitude},
        radius: 3
      });
    });

    google.maps.event.addListener(map, 'click', function(event) {
       placeMarker(event.latLng);
    });

    function placeMarker(location) {
        if (marker) marker.setMap(null);
        marker = new google.maps.Marker({
            position: location,
            map: map
        });
        url = 'http://91.121.66.103:7070/route/new_with_end?tp=foot&km=0&fromLat=43.46278&fromLon=-3.80500&toLat=' +location.lat()+ "&toLon=" + location.lng()
        $http({
          method: 'GET',
          url: url
        }).then(function successCallback(data) {
          console.log(data)
          rt = JSON.parse(data.data.message);
          var ll = []
          for (var i = 0; i < rt.length; ++i) {
            ll.push({"lat": rt[i][0], "lng": rt[i][1]})
          }

          if (line) line.setMap(null);
          line = new google.maps.Polyline({
             path: ll,
             geodesic: true,
             strokeColor: '#FF0000',
             strokeOpacity: 1.0,
             strokeWeight: 2
           });

           line.setMap(map);
        });
    }

    // create customer
    $http({
      method: 'GET',
      url: 'http://91.121.66.103:7070/customer/get?uid=' + uuid
    }).then(function successCallback(response) {
      console.log(response)
    }, function errorCallback(response) {
      console.log(response)
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

  $scope.$on("newRoute", function (event, args) {
    var ll = []
    for (var i = 0; i < args.route.length; ++i) {
      ll.push({"lat": args.route[i][0], "lng": args.route[i][1]})
    }

    if (line) line.setMap(null);
    line = new google.maps.Polyline({
       path: ll,
       geodesic: true,
       strokeColor: '#FF0000',
       strokeOpacity: 1.0,
       strokeWeight: 2
     });

     line.setMap(map);
  });
})

.controller('newRouteCtrl', function($scope, $http, $ionicTabsDelegate,$rootScope) {
  $scope.info = {"tp" : "foot", "km": 15}

  $scope.newRoute = function() {
    console.log($scope.info.km)
    $http({
      method: 'GET',
      url: 'http://91.121.66.103:7070/route/new?tp=' + $scope.info.tp + "&km=" + Math.floor($scope.info.km/2) + "&fromLat=43.46278" + "&fromLon=-3.80500"
    }).then(function successCallback(response) {
       $ionicTabsDelegate.select(0)
       $rootScope.$broadcast("newRoute", {route: JSON.parse(response.data.message)});
    }, function errorCallback(response) {
      console.log(response)
    });
  }
})

.controller('storeCtrl', function($scope, $http, $ionicPopup) {
  var uuid;
  if (window.device) {
    uuid = window.device.uuid
  } else {
    uuid = "dev"
  }

  $scope.getImage = function(name) {
    if (name.indexOf("Bus") != -1) return "img/front-bus.png";
    if (name.indexOf("Bike") != -1) return "img/bicycle.png";
    if (name.indexOf("Metro") != -1) return "img/public-transport-subway.png";
    return "http://placehold.it/200x200"
  }

  $scope.products = []
  $http({
    method: 'GET',
    url: 'http://91.121.66.103:7070/products/list'
  }).then(function successCallback(response) {
    $scope.products = response.data;
    console.log(response)
  }, function errorCallback(response) {
    console.log(response);
  });

  $scope.buyProduct = function(name, price) {
    $http({
      method: 'GET',
      url: 'http://91.121.66.103:7070/products/buy?uid=' + uuid + '&price=' + price + '&offering=' + name
    }).then(function successCallback(response) {
      if (response.data.indexOf("points") != -1) {
        var alertPopup = $ionicPopup.alert({
         title: 'Error!',
         template: 'You do not have enought points'
       });
   } else {
     var alertPopup = $ionicPopup.alert({
      title: 'Congratulations!',
      template: 'Your item has been bought. You can find it in your profile'
    });
   }
    }, function errorCallback(response) {
      var alertPopup = $ionicPopup.alert({
       title: 'Error!',
       template: response.data
     });
    });
  }
})

.controller('profileCtrl', function($scope, $http) {
  var uuid;
  $scope.qr = {}
  if (window.device) {
    uuid = window.device.uuid
  } else {
    uuid = "dev"
  }

  $scope.getImage = function(name) {
    if (name.indexOf("Bus") != -1) return "img/front-bus.png";
    if (name.indexOf("Bike") != -1) return "img/bicycle.png";
    if (name.indexOf("Metro") != -1) return "img/public-transport-subway.png";
    return "http://placehold.it/200x200"
  }

  $scope.products = []
  $http({
    method: 'GET',
    url: 'http://91.121.66.103:7070/customer/inventory?uid='+uuid
  }).then(function successCallback(response) {
    $scope.products = response.data;
    console.log($scope.products)
  }, function errorCallback(response) {
    console.log(response)
  });

  $scope.showQR = function(id) {
    if ($scope.qr[id]) {
      $scope.qr[id] = !$scope.qr[id];
    } else $scope.qr[id] = true;
  }
})
