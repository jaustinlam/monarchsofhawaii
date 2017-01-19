$(document).ready(function(){
	$(".button-collapse").sideNav();
	
});

function init(){
	var Model = function(){
		
	}
	function MapViewModel(){
		var self = this;
		
		// Los Angeles Coordinates
		var lat = 34.0522;
		var long = -118.2437;
		// FourSquare Client Details.
		var CLIENT_ID = "YBJDPS3IUH1XOTWRGY0CVLSTUUEPCVLUIXPWGIUOEMD3NNVH";
		var CLIENT_SECRET = "YI1HYR2XN2U0YNLIYETVHCUXYSWA03WIFIVMPXHGIDQ1W5U0";

		// Los Angeles Map
		self.map = new google.maps.Map(document.getElementById('map'), {
			zoom: 11,
			center: new google.maps.LatLng(lat, long),
			disableDefaultUI: true,
			// draggable: false,
			// scrollwheel: false
		});

		// Timeout error if something does wrong with data
		var fourSquareTimeout = setTimeout(function(){
			alert("Failed to get restaurant data");
		}, 8000);

		// AJAX request for FourSquare API
		$.ajax({
			url: 'https://api.foursquare.com/v2/venues/search?ll=' + lat + "," + long,
			dataType: 'jsonp',
			data: 
				"client_id=" + CLIENT_ID +
					"&client_secret=" + CLIENT_SECRET +
					"&v=" + "20170114" +
					"&query=noodles",
					// TO DO SET TIME AND DATE TO NOW
			success: function(data) {
				// Success message
				console.log("Data received");
				// Clear the Timeout Error
				clearTimeout(fourSquareTimeout);

				// Empty array to store restaurants
				var restaurants = [];
				// Set returns to self.results
				self.results = data.response.venues;

				// Clear local store if data exists
				if(localStorage.restaurants){
					localStorage.clear();
				};
				for (var i = self.results.length - 1; i >= 0; i--) {
					var currentRestaurant = self.results[i];
					var restaurant = {
						id: currentRestaurant.id,
						name: currentRestaurant.name,
						website: currentRestaurant.url,
						lat: currentRestaurant.location.lat,
						lng: currentRestaurant.location.lng,
						visible: true,
					};
					// Push restaurant object to restaurants array
					restaurants.push(restaurant);
				};
				// Save restaurants array to local storage
				localStorage.setItem("restaurants", JSON.stringify(restaurants));
				console.log(localStorage.restaurants);
			
			},
			// Error if fails
			error: function(){
				alert("Sorry data failed to load")
			} 
		});
		// Array of restaurants
		this.mapRestaurants = ko.observableArray(JSON.parse(localStorage.restaurants));

		// Placing Markers on Mapa
		var markerArray = [];
		for (var i = self.mapRestaurants().length - 1; i >= 0; i--) {
			self.contentString = '<h6>' + self.mapRestaurants()[i].name + '</h6>';
			self.lng = self.mapRestaurants()[i].lng;
			self.lat = self.mapRestaurants()[i].lat;
			// Markers
			var icon = 'images/icon.png';
			// var selectedIcon 
			self.marker = new google.maps.Marker({
				position: {lat: self.lat, lng: self.lng },
				map: self.map,
				icon: icon,
				animation: google.maps.Animation.DROP,
				id: self.mapRestaurants()[i].id
			});
			self.marker.info = new google.maps.InfoWindow({
				content: self.mapRestaurants()[i].name
			})
			markerArray.push(self.marker);

			// self.marker.addListener('click', toggleBounce);
			self.marker.addListener('click', (function(markerCopy){
				return function(){
					markerCopy.info.open(self.map, markerCopy);
					if (markerCopy.getAnimation() !== null) {
						markerCopy.setAnimation(null);
					} else {
					markerCopy.setAnimation(google.maps.Animation.BOUNCE);
					};
				};
			})(self.marker));
		};

		this.clickOpen = function(data, event){
			console.log("you clicked" + event.target.id);
			console.log(markerArray[0].id);

		}
	};

	

	ko.applyBindings(new MapViewModel());
};

// Create a new AppViewModel
