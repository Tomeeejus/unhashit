
var API_base = "HashReversing/JSON";
var hash_types = ["MD5", "SHA1", "SHA256", "SHA512"];
var info_pages = ["About", "API", "Contacts"];

var app = angular.module('HashReversing', ["ngRoute"]);
app.controller('HashReversingController', function($scope, $timeout, $http, $route) {
	$scope.hash_types = hash_types;
	$scope.info_pages = info_pages
	$scope.inputs = {};
	$scope.inputs.hash_error = null;
	$scope.inputs.value_error = null;
	$scope.inputs.value_warning = null;

	$scope.$on('$routeChangeStart', function($event, next, current) {
		delete $scope.inputs.hash;
		delete $scope.inputs.value;
	});

	$scope.on_value_change = function(new_value) {
		if (typeof $scope.update_delayer != "undefined")
			$timeout.cancel($scope.update_delayer);

		if (new_value.length == 0)
			return;

		var current_hash_type = hash_types[0];
		for (var idx in hash_types)
		{
			if ($route.current.templateUrl.indexOf(hash_types[idx]) !== -1)
			{
				current_hash_type = hash_types[idx];
				break;
			}
		}

		$scope.update_delayer = $timeout(function() {
			$http.get(API_base + "/" + current_hash_type + "/digest", {
				params: {value: new_value}
			}).then(function(response) {
				delete $scope.inputs.value_error;
				delete $scope.inputs.hash_error;
				delete $scope.inputs.value_warning;
				$scope.inputs.hash = response.data.digest;
			},
			function (response) {
				delete $scope.inputs.hash;
				delete $scope.inputs.value_warning;

				$scope.inputs.value_error = response.data.error;
			}
			)}, 500);
	}

	$scope.on_hash_change = function(new_hash) {
		if (typeof $scope.update_delayer != "undefined")
			$timeout.cancel($scope.update_delayer);

		if (new_hash.length == 0)
			return;

		var current_hash_type = hash_types[0];
		for (var idx in hash_types)
		{
			if ($route.current.templateUrl.indexOf(hash_types[idx]) !== -1)
			{
				current_hash_type = hash_types[idx];
				break;
			}
		}

		$scope.update_delayer = $timeout(function() {
			$http.get(API_base + "/" + current_hash_type + "/value", {
				params: {digest: new_hash}
			}).then(function(response) {
				delete $scope.inputs.value_error;
				delete $scope.inputs.hash_error;
				delete $scope.inputs.value_warning;

				if (response.data.value == null)
				{
					$scope.inputs.value_warning = "Value not found";
					$scope.inputs.value = "Value not found for specified hash";
				}
				else
				{
					$scope.inputs.value = response.data.value;
				}

			},
			function (response) {
				delete $scope.inputs.value;
				delete $scope.inputs.value_warning;
				$scope.inputs.hash_error = response.data.error;
			}
			)}, 500);
	}
});

app.config(function ($routeProvider) {

	$routeProvider.when("/", {
		templateUrl : hash_types[0] + ".html"
	});

	for (var idx in hash_types)
	{
		requested_URL = "/" + hash_types[idx];
		required_URL = requested_URL + ".html";
		$routeProvider.when(requested_URL, {
			templateUrl : required_URL
		});
	}

	for (var idx in info_pages)
	{
		requested_URL = "/" + info_pages[idx];
		required_URL = requested_URL + ".html";
		$routeProvider.when(requested_URL, {
			templateUrl : required_URL
		});
	}

	$routeProvider.otherwise({
		template : "<p>Unknown page requested</p>"
	});
});


