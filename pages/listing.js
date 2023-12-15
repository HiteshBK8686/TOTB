import PropTypes from 'prop-types';
import Link from 'next/link';
import Head from 'next/head';
import Router from 'next/router';

import Header from '../components/HomeHeader';
import Footer from '../components/HomeFooter';
import NProgress from 'nprogress';
import classNames from "classnames";

import withAuth from '../lib/withAuth';
import Script from 'react-load-script';

import Carousel from "react-multi-carousel";

import { filterRestaurant, searchMap } from '../lib/api/list';
import notify from '../lib/notifier';

class Search extends React.Component {
	static getInitialProps({query}) {
		const urlQuery = query.query;
		var filterRestaurants = query.filterRestaurants;
		var restaurants = query.restaurants;
		var restaurant_image_url = query.image_url;
		var cuisine_types = query.cuisine_types;
		const searchPage = true;
		return { searchPage, filterRestaurants, urlQuery, restaurants, restaurant_image_url, cuisine_types };
	}

	async componentDidMount() {
		this.setState({type:this.getType(),city:this.getCity(),coords:this.getCoords()});
		NProgress.start();
		try {
			// set map section height based on the window size and reset it as window size changes
			if (window.innerWidth > 991) {
				$(document).ready(function() {
					resizeContent();
					$(window).resize(function() {
						resizeContent();
					});
				});

				function resizeContent() {
					var height = $(window).height() - 88;
					$('.map-details').height(height);
				}
			}

			// set scroll based on scroll position
			$(window).scroll(function() {
				var scroll = $(window).scrollTop();
				if (scroll > 86) {
					$(".top-nav").addClass("active");
					$(".top-nav").addClass("fix-search");

				} else {
					$(".top-nav").removeClass("active");
					$(".top-nav").removeClass("fix-search");
				}
			});

			// on mobile view, we have listing toggle to toggle between map view and tile view. following code is use to toggle view
			$(document).on('click', '.listing-toggle', function() {
				var img = $(this).children().find('img');
				var newsrc = (img.attr('src') == 'img/listing/map-view.svg') ? 'img/listing/list-view.svg' : 'img/listing/map-view.svg';
				img.attr('src', newsrc);
				$('.map-sec').toggleClass('map-hide');
				$('.listing-card').toggleClass('listing-hide');
			});

			var that = this;
			document.getElementById('toggle-filter').addEventListener('click', function(e) {
				e.preventDefault();
				document.getElementById('toggle-filter').classList.toggle("is-active");
			});

			NProgress.done();
		} catch (err) {
			this.setState({ loading: false, error: err.message || err.toString() }); // eslint-disable-line
			NProgress.done();
		}
	}

	static propTypes = {
		user: PropTypes.shape({
			_id: PropTypes.string,
		})
	};

	constructor(props) {
		super(props);

		this.state = {
			user: props.user || {},
			updated: false,
			filterRestaurants: props.filterRestaurants || [],
			restaurant_image_url: props.restaurant_image_url || '',
			restaurants: props.restaurants || [],
			urlQuery: props.urlQuery || {},
			cuisine_types: props.cuisine_types || [],
			isSearching: false,
			filterLocation: [],
			filterCuisine: [],
			sort_text: '',
			sort_value: '',
			cuisineLimit: 8,
			type: '',
			city: '',
			coords: {}
		};

		// following functions are for the MAP view functionality related
		this.handleScriptLoad = this.handleScriptLoad.bind(this);
		this.disable = this.disable.bind(this);
		this.drawFreeHand = this.drawFreeHand.bind(this);
	}

	// initiates the map functions to load map and marker in it.
	// needs to call this function everytime result is changed
	handleScriptLoad() {
		// get lat-long of city selected
		var geocoder =  new google.maps.Geocoder();
		var lat,lng,map,mapOptions;
		geocoder.geocode( { 'address': this.state.city+', AU'}, function(results, status) {
			// var that = this;
			if(this.state.coords.lat != undefined && this.state.coords.lng != undefined){
				console.log(this.state.coords);
				lat = this.state.coords.lat;
				lng = this.state.coords.lng;
			} else{
				if (status == google.maps.GeocoderStatus.OK) {
					// console.log("location : " + results[0].geometry.location.lat() + " " +results[0].geometry.location.lng()); 
					lat = results[0].geometry.location.lat();
					lng = results[0].geometry.location.lng();
				} else {
					// console.log("Something got wrong " + status);
					lat = -33.85756;
					lng = 151.21468800000002;
				}
			}

			// initiate map with mapoptions
			mapOptions = {
				zoom: 11,
				maxZoom: 16,
				center: new google.maps.LatLng(lat, lng),
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				styles: [{"featureType":"all","elementType":"geometry.fill","stylers":[{"weight":"2.00"}]},{"featureType":"all","elementType":"geometry.stroke","stylers":[{"color":"#9c9c9c"}]},{"featureType":"all","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"all","elementType":"labels.text.fill","stylers":[{"color":"#33988d"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#eeeeee"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#7b7b7b"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#c8d7d4"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#070707"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]}]
			};
			map = new google.maps.Map(document.getElementById('map'), mapOptions);

			// prepare markers array and set in map
			var markers = [];
			var bounds = new google.maps.LatLngBounds();
			this.state.filterRestaurants.map(function(restaurant, i){
				markers.push({title: restaurant.name, latLng: new google.maps.LatLng(restaurant.lat, restaurant.long)});
			});
			markers.map(function(marker, i){
				bounds.extend(markers[i].latLng);
				markers[i].marker = new google.maps.Marker({
					position: markers[i].latLng,
					map: map,
					title: markers[i].title,
					icon: '/static/Fish-TOTB-64-64.png'
				});
			});
			if(markers.length > 0){
				map.fitBounds(bounds);
			}

			//draw
			var that = this;
			$("#draw").click(function(e) {
				$("#draw").hide();
				$("#clear").show();
				e.preventDefault();
				// disable map
				that.disable(map);
				// remove all markers
				for (var i = 0; i < markers.length; i++ ) {
					markers[i].marker.setMap(null);
				}
				// add draw event
				google.maps.event.addDomListener(map.getDiv(),'mousedown',function(e){
					that.drawFreeHand(map);
				});
			});

			$("#clear").click(function(e) {
				$("#clear").hide();
				$("#draw").show();
				// initiate map
				map = new google.maps.Map(document.getElementById('map'), mapOptions);
				// draw old markers
				markers.map(function(marker, i){
					bounds.extend(markers[i].latLng);
					markers[i].marker = new google.maps.Marker({
						position: markers[i].latLng,
						map: map,
						title: markers[i].title,
						icon: '/static/Fish-TOTB-64-64.png'
					});
				});
				if(markers.length > 0){
					map.fitBounds(bounds);
				}
				// reassign orignal data
				var restaurants = that.state.restaurants;
				restaurants = JSON.parse(JSON.stringify(restaurants));
				that.setState({filterRestaurants:restaurants});
				e.preventDefault();
			});
        }.bind(this));
	}

	// disable map while drawing
	disable = (map) => {
		map.setOptions({
			draggable: false,
			zoomControl: false,
			scrollwheel: false,
			disableDoubleClickZoom: false
		});
	}

	// enable map after drawing is cleared
	enable = (map) => {
		map.setOptions({
			draggable: true,
			zoomControl: true,
			scrollwheel: true,
			disableDoubleClickZoom: true
		});
	}

	// initiate this function when ready to draw
	drawFreeHand(map) {
		//the polygon
		var poly;
		poly = new google.maps.Polyline({ map: map, clickable: false });

		//move-listener
		var move = google.maps.event.addListener(map, 'mousemove', function(e) {
			poly.getPath().push(e.latLng);
		});

		//mouseup-listener
		var that = this;
		var drawing = true;
		if(drawing){
			that.disable(map);
			drawing = false;
			google.maps.event.addListenerOnce(map, 'mouseup', async function(e) {
				google.maps.event.removeListener(move);
				var path = poly.getPath();
				poly.setMap(null);
				poly = new google.maps.Polygon({ map: map, path: path });
				var polyPath = poly.getPath();
				
				var searchArea = google.maps.geometry.spherical.computeArea(poly.getPath());
				var randomMarkers = [];
				var type = that.state.type == 'restaurant' ? 'restaurant_bars' : 'venues';
				var filterRestaurants = await filterRestaurant({city:that.state.city,type:type});
				filterRestaurants = filterRestaurants.restaurants;
				filterRestaurants = JSON.parse(JSON.stringify(filterRestaurants));
				var i = filterRestaurants.length;
				while (i--) {
					if (google.maps.geometry.poly.containsLocation(new google.maps.LatLng(filterRestaurants[i].lat, filterRestaurants[i].long), poly)) {
						// console.log('=> is in searchArea');
						randomMarkers.push({title: filterRestaurants[i].name, latLng: new google.maps.LatLng(filterRestaurants[i].lat, filterRestaurants[i].long)});
					} else{
						// console.log('=> is NOT in searchArea');
						filterRestaurants.splice(i, 1);
					}
				}

				// var points = [];
				// for (var i = 0; i < polyPath.length; i++) {
				// 	points.push([polyPath.getAt(i).lng(),polyPath.getAt(i).lat()]);
				// }
				// points.push([polyPath.getAt(0).lng(),polyPath.getAt(0).lat()]);
				// // Call API to search points within GEO
				// var filterRestaurants = await searchMap({points: points,type:'restaurant_bars'});
				// if(filterRestaurants.errorMessage != undefined){
				// 	notify('Selected region is not a valid polygon!');
				// 	return false;
				// }
				// filterRestaurants = filterRestaurants.restaurants;
				// filterRestaurants = JSON.parse(JSON.stringify(filterRestaurants));
				// var i = filterRestaurants.length;
				// while (i--) {
				// 	randomMarkers.push({title: filterRestaurants[i].name, latLng: new google.maps.LatLng(filterRestaurants[i].lat, filterRestaurants[i].long)});
				// }

				// set the filtered restaurant data
				that.setState({filterRestaurants});

				// apply markers to the map
				var bounds = new google.maps.LatLngBounds();
				randomMarkers.map(function(marker, i){
					bounds.extend(randomMarkers[i].latLng);
					randomMarkers[i].marker = new google.maps.Marker({
						position: randomMarkers[i].latLng,
						map: map,
						title: randomMarkers[i].title,
						icon: '/static/Fish-TOTB-64-64.png'
					});
				});
				if(randomMarkers.length > 0){
					map.fitBounds(bounds);
				}

				// remove polygon from the map
				poly.setMap(null);

				map.setOptions({
					draggable: true,
					zoomControl: true,
					scrollwheel: true
				});

				google.maps.event.clearListeners(map.getDiv(), 'mousedown');
			});
		}
	}

	// filter result via value based on value passed in the function
	filterLocation(value) {
		var filterLocation = this.state.filterLocation;
		// Check if value in array or not
		var exist = filterLocation.includes(value);
		if(exist){
			// if in array then delete it
			var index = filterLocation.indexOf(value);
			filterLocation.splice(index, 1);
			this.setState({filterLocation});
		} else{
			// if not in array then add it
			filterLocation.push(value);
			this.setState({filterLocation});
		}
	}

	// filter result via cuisine
	filterCuisine(value) {
		var filterCuisine = this.state.filterCuisine;
		// Check if value in array or not
		var exist = filterCuisine.includes(value);
		if(exist){
			// if in array then delete it
			var index = filterCuisine.indexOf(value);
			filterCuisine.splice(index, 1);
			this.setState({filterCuisine});
		} else{
			// if not in array then add it
			filterCuisine.push(value);
			this.setState({filterCuisine});
		}
	}

	// this function will change sortby method based on value passed
	changeSortBy(value) {
		this.setState({sort_value:value});
		this.search();
	}
	setSortBy(value) {
		this.setState({sort_value:value});
	}

	// get type wether its restaurant or venue
	getType = () => {
		var name =  "type=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for(var i = 0; i <ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "restaurant";
	};

	// get selected city
	getCity = () => {
		var name =  "city=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for(var i = 0; i <ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "Melbourne";
	};

	// get coords
	getCoords = () => {
		var coords = {};
		var name =  "coords_lat=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for(var i = 0; i <ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				coords.lat = c.substring(name.length, c.length);
			}
		}

		var name =  "coords_lng=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for(var i = 0; i <ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				coords.lng = c.substring(name.length, c.length);
			}
		}

		return coords;
	};

	// below function will change type based on user's selection
	changeType = (type) => {
		// set in cookie
		var d = new Date();
		d.setTime(d.getTime() + (7*24*60*60*1000));
		var expires = "expires="+ d.toUTCString();
		document.cookie = "type=" + type + ";" + expires + ";path=/";
		// change url
		var url = '/listing/'+this.state.city.toLowerCase().replace(/ /g,"-")+'?t=' + type;
		if(this.state.urlQuery.q){
			url += '&q='+this.state.urlQuery.q;
		}
		Router.push(url);
		// set state and then call search fucntion
		this.setState({type},this.search);
	};

	// this will reset the filter applied
	async reset() {
		document.getElementById("overlay").style.display = "block";
		this.setState({filterLocation:[],filterCuisine:[],sort_value:'',sort_text:''});
		var type = this.state.type == 'restaurant' ? 'restaurant_bars' : 'venues';
		var filterRestaurants = await filterRestaurant({name: this.state.urlQuery.q,type:type,city:this.state.city});
		this.setState({restaurants:filterRestaurants.restaurants,filterRestaurants:filterRestaurants.restaurants,isSearching:false,restaurant_image_url:filterRestaurants.image_url});
		this.handleScriptLoad();
		document.getElementById("overlay").style.display = "none";
	}

	// initiate the search and display result based on filter selected
	async search() {
		document.getElementById('toggle-filter').classList.toggle("is-active");
		document.getElementById("show-filter").classList.remove("show");
		document.getElementById("overlay").style.display = "block";
		var type = this.state.type == 'restaurant' ? 'restaurant_bars' : 'venues';
		var filterRestaurants = await filterRestaurant({name: this.state.urlQuery.q,type:type,location:this.state.filterLocation,cuisine:this.state.filterCuisine,city:this.state.city});
		if(this.state.sort_value == 'PopularityHL'){
			filterRestaurants.restaurants.sort(function compare( a, b ) {
			  if ( a.total_rating > b.total_rating ){
			    return -1;
			  }
			  if ( a.total_rating < b.total_rating ){
			    return 1;
			  }
			  return 0;
			});
		} else if(this.state.sort_value == 'PopularityLH'){
			filterRestaurants.restaurants.sort(function compare( a, b ) {
			  if ( a.total_rating < b.total_rating ){
			    return -1;
			  }
			  if ( a.total_rating > b.total_rating ){
			    return 1;
			  }
			  return 0;
			});
		} else if(this.state.sort_value == 'RatingHL'){
			filterRestaurants.restaurants.sort(function compare( a, b ) {
			  if ( a.avg_review > b.avg_review ){
			    return -1;
			  }
			  if ( a.avg_review < b.avg_review ){
			    return 1;
			  }
			  return 0;
			});
		} else if(this.state.sort_value == 'RatingLH'){
			filterRestaurants.restaurants.sort(function compare( a, b ) {
			  if ( a.avg_review < b.avg_review ){
			    return -1;
			  }
			  if ( a.avg_review > b.avg_review ){
			    return 1;
			  }
			  return 0;
			});
		} else if(this.state.sort_value == 'CostHL'){
			filterRestaurants.restaurants.sort(function compare( a, b ) {
			  if ( a.avg_cost > b.avg_cost ){
			    return -1;
			  }
			  if ( a.avg_cost < b.avg_cost ){
			    return 1;
			  }
			  return 0;
			});
		} else if(this.state.sort_value == 'CostLH'){
			filterRestaurants.restaurants.sort(function compare( a, b ) {
			  if ( a.avg_cost < b.avg_cost ){
			    return -1;
			  }
			  if ( a.avg_cost > b.avg_cost ){
			    return 1;
			  }
			  return 0;
			});
		}
		this.setState({restaurants:filterRestaurants.restaurants,filterRestaurants:filterRestaurants.restaurants,isSearching:false,restaurant_image_url:filterRestaurants.image_url});
		this.handleScriptLoad();
		document.getElementById("overlay").style.display = "none";
	}

	render() {
		var { user, filterRestaurants, urlQuery, isSearching, restaurants, restaurant_image_url, filterLocation, sort_text, sort_value, cuisine_types, cuisineLimit, filterCuisine, type } = this.state;
		return (
			<div className="listing-wrap">
				<main className="wrapper listing">
					{/* head for title and meta tags */}
					<Head>
						<title>10 of The Best</title>
					</Head>
					{/* header */}
					<Header user={user} parentChangeType={this.changeType} />
					{/* main content */}
					<section className="map-wrap">
						<div className="middle-content">
							<div className="map-details">
								<div className="dropdown nav-venue mb-vw">
									<a className={type == 'restaurant' ? "dropdown-toggle dine-drink active" : "dropdown-toggle fun-venue active"} href="#" id="venue-drpdwn" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">{type == 'restaurant' ? 'Dine & Drinks' : 'Function Venue'}</a>
									<div className="dropdown-menu" aria-labelledby="venue-drpdwn">
										<a href="#" onClick={() => this.changeType('restaurant')} className={type == 'restaurant' ? "dropdown-item dine-drink active" : "dropdown-item dine-drink"}>Dine & Drinks</a>
										<a href="#" onClick={() => this.changeType('venue')} className={type == 'venue' ? "dropdown-item fun-venue active" : "dropdown-item fun-venue"}>Function Venue</a>
									</div>
								</div>
								<div className="filter">
									<div className="search-bar">
										<input 
											className="form-control" 
											type="text" 
											value={urlQuery.q} 
											onChange={async(event) => {
												this.setState({
													urlQuery: Object.assign({}, urlQuery, { q: event.target.value }),
												});
												if(event.target.value.length > 3){
													document.getElementById("overlay").style.display = "block";
													var type = this.state.type == 'restaurant' ? 'restaurant_bars' : 'venues';
													var filterRestaurants = await filterRestaurant({name: event.target.value,type:type,city:this.state.city});
													this.setState({restaurants:filterRestaurants.restaurants,filterRestaurants:filterRestaurants.restaurants,isSearching:false,restaurant_image_url:filterRestaurants.image_url});
													this.handleScriptLoad();
													document.getElementById("overlay").style.display = "none";
												} else if(event.target.value.length == 0){
													document.getElementById("overlay").style.display = "block";
													var type = this.state.type == 'restaurant' ? 'restaurant_bars' : 'venues';
													var filterRestaurants = await filterRestaurant({type:type,city:this.state.city});
													this.setState({restaurants:filterRestaurants.restaurants,filterRestaurants:filterRestaurants.restaurants,isSearching:false,restaurant_image_url:filterRestaurants.image_url});
													this.handleScriptLoad();
													document.getElementById("overlay").style.display = "none";
												}
											}}
											placeholder="Search here.." 
											aria-label="Search" 
										/>
									</div>
									<div className="filter-btn">
										<div className="reset-tab ds-vw" onClick={async() => { this.reset() }}><a href="#">Reset</a></div>
										<a href="#show-filter" id="toggle-filter" className="btn btn-white filter-tab" data-toggle="collapse">
											<span className="icon icon-filter-icon"></span>
											<span className="hide-tab">Filter
												<span className="counting"></span>
											</span>
										</a>
										<a href="#" className="btn btn-white hidden-tab listing-toggle">
											<span className="hidden-icon"><img src="/static/assets/img/listing/map-view.svg" alt="" /></span>
										</a>
										<div id="show-filter" className="collapse filter-collapse">
											<div className="filter-wrap">
												<div className="container-fluid">
													<div className="row bord-btm">
														<div className="col-md-4 col-12 bord-rt">
														 	<div className="filter-bx sortby-tag">
																<h5>Sort by</h5>
																<div className="item-bx">
																	<div className="custom-control custom-radiobtn mb-3">
																		<input type="radio" id="test1" name="radio-group" value="PopularityHL" onChange={async(event) => { this.setState({sort_text:'Popularity (High to Low)'}); this.setSortBy(event.target.value) }} />
																		<label htmlFor="test1">Popularity <span className="light"> - High to low</span></label>
																	</div>
																</div>
																<div className="item-bx">
																	<div className="custom-control custom-radiobtn mb-3">
																		<input type="radio" id="test2" name="radio-group" value="RatingHL" onChange={async(event) => { this.setState({sort_text:'Rating (High to Low)'}); this.setSortBy(event.target.value) }} />
																		<label htmlFor="test2">Rating <span className="light"> - High to low</span></label>
																	</div>
																</div>
																<div className="item-bx">
																	<div className="custom-control custom-radiobtn mb-3">
																		<input type="radio" id="test3" name="radio-group" value="CostHL" onChange={async(event) => { this.setState({sort_text:'Cost (High to Low)'}); this.setSortBy(event.target.value) }} />
																		<label htmlFor="test3">Cost <span className="light"> - High to low</span></label>
																	</div>
																</div>
																<div className="item-bx">
																	<div className="custom-control custom-radiobtn mb-3">
																		<input type="radio" id="test4" name="radio-group" value="RatingLH" onChange={async(event) => { this.setState({sort_text:'Rating (Low to High)'}); this.setSortBy(event.target.value) }} />
																		<label htmlFor="test4">Rating <span className="light"> - Low to High</span></label>
																	</div>
																</div>
																<div className="item-bx">
																	<div className="custom-control custom-radiobtn mb-3">
																		<input type="radio" id="test5" name="radio-group" value="CostLH" onChange={async(event) => { this.setState({sort_text:'Cost (Low to High)'}); this.setSortBy(event.target.value) }} />
																		<label htmlFor="test5">Cost <span className="light"> - Low to High</span></label>
																	</div>
																</div>
															</div>
														</div>
														<div className="col-md-4 col-12 bord-rt">
															<div className="filter-bx">
																<h5>Location</h5>
																<div className="item-bx">
																	<div className="custom-control custom-checkbox mb-3">
																		<input type="checkbox" className="custom-control-input" onChange={async(event) => { this.filterLocation(event.target.value) }} checked={filterLocation.includes("Sydney") ? "checked" : null} value="Sydney" id="locationCheckBox7" />
																		<label className="custom-control-label" htmlFor="locationCheckBox7">Sydney</label>
																	</div>
																</div>
																<div className="item-bx">
																	<div className="custom-control custom-checkbox mb-3">
																		<input type="checkbox" className="custom-control-input" onChange={async(event) => { this.filterLocation(event.target.value) }} checked={filterLocation.includes("Melbourne") ? "checked" : null} value="Melbourne" id="locationCheckBox8" />
																		<label className="custom-control-label" htmlFor="locationCheckBox8">Melbourne</label>
																	</div>
																</div>
															</div>
														</div>
														<div className="col-md-4 col-12">
															<div className="filter-bx">
																<h5>Cuisine</h5>
																{cuisine_types.map(function(type, i){
																	if(i >= cuisineLimit){
																		return null;
																	}
																	return (
																	<div key={i} className="item-bx">
																		<div className="custom-control custom-checkbox mb-3">
																			<input checked={filterCuisine.includes(type._id) ? 'checked' : null} type="checkbox" className="custom-control-input" id={type._id} value={type._id} onChange={async(event) => { this.filterCuisine(event.target.value) }} name={type.name} />
																			<label className="custom-control-label" htmlFor={type._id}>{type.name}</label>
																		</div>
																	</div>
																	);
																}.bind(this))}
																{cuisine_types.length > cuisineLimit ? <div className="more">
																	<a style={{cursor:'pointer'}} onClick={() => this.setState({cuisineLimit: cuisine_types.length})}>See More<span className="next"></span></a>
																</div> : ''}
																{cuisine_types.length == cuisineLimit ? <div className="more">
																	<a style={{cursor:'pointer'}} onClick={() => this.setState({cuisineLimit: 8})}>See Less<span className="next"></span></a>
																</div> : ''}
															</div>
														</div>
													</div>
													<div className="row">
														<div className="col-12">
															<div className="reset-btn">
																<button className="btn btn-white" type="submit">Reset</button>
																<button className="btn btn-filled ml-2" type="submit" onClick={async(event) => { this.search() }}>Done</button>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="reset-tab mb-vw" onClick={() => { this.reset() }}><a href="#">Reset</a></div>
								<div className="selected-filter">
									<ul>
										<li style={filterLocation.length > 0 ? {}: {'display':'none'}} >
											<a onClick={() => {this.setState({filterLocation:[]}); this.search();}}>Location</a>
										</li>
										<li style={filterCuisine.length > 0 ? {}: {'display':'none'}} >
											<a onClick={() => {this.setState({filterCuisine:[]}); this.search();}}>Cuisine</a>
										</li>
									</ul>
								</div>
								<div className="container-fluid listing-card">
									<div className="item-card">
										{<div className="tag" style={filterRestaurants.length == 0 ? {display:'none'}:{}}>{filterRestaurants.length} {filterRestaurants.length > 1 ? 'Results':'Result'} found:</div>}
										<div className="dropdown newest-dropdown">
											<a className="dropdown-toggle" href="#" id="newest-drpdwn" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">{sort_text ? sort_text : 'Sort By'}</a>
											<div className="dropdown-menu" aria-labelledby="newest-drpdwn">
												<a className="dropdown-item" onClick={async(event) => { this.setState({sort_text:'Popularity (High to Low)'}); this.changeSortBy('PopularityHL') }} href="#">Popularity (<i className="fa fa-arrow-down" aria-hidden="true"></i>)</a>
												<a className="dropdown-item" onClick={async(event) => { this.setState({sort_text:'Rating (High to Low)'}); this.changeSortBy('RatingHL') }} href="#">Rating (<i className="fa fa-arrow-down" aria-hidden="true"></i>)</a>
												<a className="dropdown-item" onClick={async(event) => { this.setState({sort_text:'Cost (High to Low)'}); this.changeSortBy('CostHL') }} href="#">Cost (<i className="fa fa-arrow-down" aria-hidden="true"></i>)</a>
												<a className="dropdown-item" onClick={async(event) => { this.setState({sort_text:'Rating (Low to High)'}); this.changeSortBy('RatingLH') }} href="#">Rating (<i className="fa fa-arrow-up" aria-hidden="true"></i>)</a>
												<a className="dropdown-item" onClick={async(event) => { this.setState({sort_text:'Cost (Low to High)'}); this.changeSortBy('CostLH') }} href="#">Cost (<i className="fa fa-arrow-up" aria-hidden="true"></i>)</a>
											</div>
										</div>
									</div>
									<div className="location">
										<div className="row">
											{filterRestaurants.map(function(restaurant, i){
												restaurant = JSON.parse(JSON.stringify(restaurant));
												return (
													<div key={i} className="col-12 col-md-6 list-item" style={{display:'initial'}}>
														<Link href={"/"+ restaurant.city.toLowerCase() + '/' + restaurant.slug}>
															<a>
																<div className="loc-bx">
																	<div className="img-wrap">
																		{restaurant.images.length > 0 ? <img src={restaurant.images[0].image} alt="" /> : <img src="https://totb-data.s3-ap-southeast-2.amazonaws.com/static/410x160.jpg" alt="" />}
																		<div className="star-lbl">
																			<span><i className="fa fa-star" aria-hidden="true"></i></span>{restaurant.avg_review}
																		</div>
																	</div>
																	<div className="info">
																		{restaurant.cuisine_types.length > 0 ? <h5 className="label">{restaurant.cuisine_types[0].name + ' Food'}</h5> : null}
																		<h4>{restaurant.name}</h4>
																		<div className="place-info">
																			<div className="loc">
																				<span><i className="fa fa-map-marker" aria-hidden="true"></i></span>{restaurant.city}
																			</div>
																			<div className="person">
																				<span><i className="fa fa-user-o" aria-hidden="true"></i></span>{restaurant.avg_cost ? "$"+restaurant.avg_cost+" for Per Person" : "Not mentioned"}
																			</div>
																		</div>
																	</div>
																</div>
															</a>
														</Link>
													</div>
												);
											})}
											<div className="col-12 col-lg-6 offset-lg-3 text-center" style={filterRestaurants.length == 0 ? {}:{display:'none'}}>
												<div className="no_result">
													<div className="image">
														<img src="/static/assets/img/listing/not-found.svg" alt="img" />
													</div>
													<div className="title">
														No results found
													</div> 
													<div className="button see_all_btn">
														<Link prefetch={false} href={process.env.SITE_URL + '/listing/'+this.state.city.toLowerCase().replace(/ /g,"-")+'?t=' + this.state.type}>
															<a>
																<button className="btn btn-filled" type="button">See All Restaurents in {this.state.city}</button>
															</a>
														</Link>
													</div>
													<div className="title">
														Are we missing a place?
													</div>
													<div className="button">
														<button className="btn btn-white" type="button">Add Your Listing</button>
													</div>
												</div>
											</div>
										</div>
									</div>
									<div className="related_venues d-none">
                                		<h5 className="text-uppercase">Other Related Venues </h5>
										<div className="row">
											<div className="col-12 col-md-6 col-lg-12 col-xl-6 mb-3">
												<div className="card">
													<div className="row no-gutters">
														<div className="col-5 col-lg-4">
															<img src="/static/assets/img/details/photo-6.png" className="card-img" alt="img" />
															<div className="star-lbl">
																<span><i className="fa fa-star" aria-hidden="true"></i></span>4.0
															</div>
														</div>
														<div className="col-7 col-lg-8">
															<div className="card-body">
																<h5 className="label">Italian and Cafe Food</h5>
																<h6 className="card-title">Tuck Shop Take Away</h6>
																<div className="place-info">
																	<div className="loc d-flex align-items-center mb-2">
																		<span className="icon icon-map-view"></span>Melbourne
																	</div>
																	<div className="person d-flex align-items-center">
																		<span className="icon icon-User-icon"></span>$45 for Per Person
																	</div>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
											<div className="col-12 col-md-6 col-lg-12 col-xl-6 mb-3">
												<div className="card">
													<div className="row no-gutters">
														<div className="col-5 col-lg-4">
															<img src="/static/assets/img/details/photo-6.png" className="card-img" alt="img" />
															<div className="star-lbl">
																<span><i className="fa fa-star" aria-hidden="true"></i></span>4.0
															</div>
														</div>
														<div className="col-7 col-lg-8">
															<div className="card-body">
																<h5 className="label">Italian and Cafe Food</h5>
																<h6 className="card-title">Tuck Shop Take Away</h6>
																<div className="place-info">
																	<div className="loc d-flex align-items-center mb-2">
																		<span className="icon icon-map-view"></span>Melbourne
																	</div>
																	<div className="person d-flex align-items-center">
																		<span className="icon icon-User-icon"></span>$45 for Per Person
																	</div>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
											<div className="col-12 col-md-6 col-lg-12 col-xl-6 mb-3">
												<div className="card">
													<div className="row no-gutters">
														<div className="col-5 col-lg-4">
															<img src="/static/assets/img/details/photo-6.png" className="card-img" alt="img" />
															<div className="star-lbl">
																<span><i className="fa fa-star" aria-hidden="true"></i></span>4.0
															</div>
														</div>
														<div className="col-7 col-lg-8">
															<div className="card-body">
																<h5 className="label">Italian and Cafe Food</h5>
																<h6 className="card-title">Tuck Shop Take Away</h6>
																<div className="place-info">
																	<div className="loc d-flex align-items-center mb-2">
																		<span className="icon icon-map-view"></span>Melbourne
																	</div>
																	<div className="person d-flex align-items-center">
																		<span className="icon icon-User-icon"></span>$45 for Per Person
																	</div>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
											<div className="col-12 col-md-6 col-lg-12 col-xl-6 mb-3">
												<div className="card">
													<div className="row no-gutters">
														<div className="col-5 col-lg-4">
															<img src="/static/assets/img/details/photo-6.png" className="card-img" alt="img" />
															<div className="star-lbl">
																<span><i className="fa fa-star" aria-hidden="true"></i></span>4.0
															</div>
														</div>
														<div className="col-7 col-lg-8">
															<div className="card-body">
																<h5 className="label">Italian and Cafe Food</h5>
																<h6 className="card-title">Tuck Shop Take Away</h6>
																<div className="place-info">
																	<div className="loc d-flex align-items-center mb-2">
																		<span className="icon icon-map-view"></span>Melbourne
																	</div>
																	<div className="person d-flex align-items-center">
																		<span className="icon icon-User-icon"></span>$45 for Per Person
																	</div>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
                            		</div>
								</div>
								{/* footer  */}
								<Footer user={user} />
							</div>
							<div className="map-sec map-hide">
								<Script url="https://maps.googleapis.com/maps/api/js?key=AIzaSyBl6RyVLorSd0PbXxpsX9sKFcvYKsRMfVE" onLoad={this.handleScriptLoad} />
								<div id="map" style={{height:'100%',width:'100%',border:'0'}}></div>
								<div className="map-overlay">
									<p className="text">Draw a shape around the region you would like to search </p>
									<button id="draw" className="btn btn-filled" type="submit">Draw</button>
									<button id="clear" className="btn btn-filled" style={{display:'none'}}>Clear</button>
								</div>
							</div>
						</div>
					</section>
				</main>
			</div>
		);
	}
}

export default withAuth(Search, { loginRequired: false });