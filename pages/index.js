import PropTypes from 'prop-types';
import Link from 'next/link';
import Head from 'next/head';
import Router from 'next/router';

import Header from '../components/HomeHeader';
import Footer from '../components/HomeFooter';

import NProgress from 'nprogress';

import withAuth from '../lib/withAuth';

import { filterRestaurants, filterVenues, fetchBlogs, saveInterestedEmails } from '../lib/api/home';

import Carousel from "react-multi-carousel";
// import ContentLoader from 'content-loader-reactjs';
import "react-multi-carousel/lib/styles.css";
import notify from '../lib/notifier';

class Index extends React.Component {
	/*fetch data sent from the routes file and set them as props for this page*/
	static getInitialProps({ query }) {
		const indexPage = true;
		const restaurant_bars_templates = query.pagetemplates.restaurant_bars_templates;
		const venues_templates = query.pagetemplates.venues_templates;
		const trusted_restaurants = query.trusted_restaurants.restaurants;
		const trusted_venues = query.trusted_venues.venues;
		return { indexPage, restaurant_bars_templates, venues_templates, trusted_restaurants, trusted_venues, city: query.city, city_capital: query.city_capital };
	}


	async componentDidMount() {
		/*Location detection code -- starts*/
		const geo = navigator.geolocation;
		if (!geo) {
			console.log('Geolocation is not supported');
			return;
		}

		const settings = {enableHighAccuracy:false,timeout:Infinity,maximumAge:0,};

		var cityList = await import('./au.json');
		var cityList = JSON.parse("["+JSON.stringify(cityList)+"]");
		cityList = cityList[0]['default'];
		this.setState({cities:cityList});

		const onChange = ({ coords, timestamp }) => {
			var that = this;
			if (typeof $ !== 'undefined') {
				// get city name based on lat-long
				$.getJSON('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + coords.latitude + ',' + coords.longitude + '&sensor=true&key=AIzaSyAX0aAp5ecBK4lufy1LqeJhOB1SGHdIX8A', function(data) {
					data.results[0].address_components.map(function(address_component, i) {
						if (address_component.types.includes('administrative_area_level_2')) {
							if (!that.props.city) {
								if (that.props.city != address_component.long_name.toLowerCase()) {
									var d = new Date();
									d.setTime(d.getTime() + (7 * 24 * 60 * 60 * 1000));
									var expires = "expires=" + d.toUTCString();
									// set city name in cookie
									document.cookie = "city=" + address_component.long_name + ";" + expires + ";path=/";
									// set coords data in cookie
									document.cookie = "coords_lat=" + coords.latitude + ";" + expires + ";path=/";
									document.cookie = "coords_lng=" + coords.longitude + ";" + expires + ";path=/";
									// redirect to city
									if(that.state.cities.some(el => el.city.toLowerCase().replace(/ /g,"-") === address_component.long_name.toLowerCase().replace(/ /g, "-"))){
										Router.push('/' + address_component.long_name.toLowerCase().replace(/ /g, "-"));
										return false;
									} else{
										Router.push('/melbourne');
										return false;
									}
								}
							}
						}
					});
				});
			}
		};

		const onError = (error) => {
			// handle error
			// console.log(error.message);
		};

		let watcher = null;
		let watch = false;
		if (watch) {
			watcher = geo.watchPosition(onChange, onError, settings);
		} else {
			geo.getCurrentPosition(onChange, onError, settings);
		}
		/*Location detection code -- ends*/

		// Initiate type and city for whole page from cookie
		if(this.props.city){
			this.setType(this.getType());
			this.setState({ type: this.getType() });
			this.setState({ city: this.getCity() });
			this.getBlogs();
		}

		NProgress.start();
		try {
			// If city name is not in route, then check if we have city name in cookie. If no then redirect to "melbourne"
			if (!this.props.city) {
				var name = "city=";
				var decodedCookie = decodeURIComponent(document.cookie);
				var ca = decodedCookie.split(';');
				for (var i = 0; i < ca.length; i++) {
					var c = ca[i];
					while (c.charAt(0) == ' ') {
						c = c.substring(1);
					}
					if (c.indexOf(name) == 0) {
						Router.push('/' + c.substring(name.length, c.length).toLowerCase().replace(/ /g, "-"));
						return false;
					}
				}
				Router.push('/melbourne');
				return false;
			} else{
				var d = new Date();
				d.setTime(d.getTime() + (7 * 24 * 60 * 60 * 1000));
				var expires = "expires=" + d.toUTCString();
				// set city name in cookie
				var city = this.props.city;
				city = city.replace(/-/g," ");
				document.cookie = "city=" + city.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) + ";" + expires + ";path=/";
			}
			
			NProgress.done();
		} catch (err) {
			console.log(err);
			this.setState({ loading: false, error: err.message || err.toString() }); // eslint-disable-line
			NProgress.done();
		}
	}

	static propTypes = {
		user: PropTypes.shape({
			_id: PropTypes.string,
		})
	};

	// Below two functions are use for get/set type for restaurant/venue in/from cookie
	setType = (type) => {
		var d = new Date();
		d.setTime(d.getTime() + (7 * 24 * 60 * 60 * 1000));
		var expires = "expires=" + d.toUTCString();
		document.cookie = "type=" + type + ";" + expires + ";path=/";

		// Change Page Templates based on Type
		var temp_pagetemplates = type == 'restaurant' ? this.props.restaurant_bars_templates : this.props.venues_templates;
		var temp_trusted = type == 'restaurant' ? this.props.trusted_restaurants : this.props.trusted_venues;
		this.setState({pagetemplates:temp_pagetemplates, type, trusted_restaurants:temp_trusted});

		this.getBlogs();
	};

	getBlogs = () => {
		document.getElementById("loader_overlay").style.display = "block";
		fetchBlogs({city:this.getCity(),type:this.getType(),count:3}).then(results => {
			results = JSON.parse(JSON.stringify(results));
			if(results.length > 0){
				this.setState({blogs:results});
				document.getElementById("loader_overlay").style.display = "none";
			} else{
				fetchBlogs({count:3}).then(results => {
					results = JSON.parse(JSON.stringify(results));
					this.setState({blogs:results});
					document.getElementById("loader_overlay").style.display = "none";
				});
			}
		});
	}

	getType = () => {
		var name = "type=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				var type = c.substring(name.length, c.length);
				// Set Page Templates based on Type
				var temp_pagetemplates = type == 'restaurant' ? this.props.restaurant_bars_templates : this.props.venues_templates;
				var temp_trusted = type == 'restaurant' ? this.props.trusted_restaurants : this.props.trusted_venues;
				this.setState({pagetemplates:temp_pagetemplates,trusted_restaurants:temp_trusted});
				return type;
			}
		}
		return "restaurant";
	}

	// Below function is to get city from the cookie
	getCity = () => {
		if(!this.props.city){
			var name = "city=";
			var decodedCookie = decodeURIComponent(document.cookie);
			var ca = decodedCookie.split(';');
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') {
					c = c.substring(1);
				}
				if (c.indexOf(name) == 0) {
					return c.substring(name.length, c.length);
				}
			}
			return "Melbourne";
		} else{
			var city = this.props.city;
			city = city.replace(/-/g," ");
			return city.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
		}
	};

	constructor(props) {
		super(props);
		this.state = {
			vendorEmailError: false,
			vendorEmail: '',
			user: props.user || {},
			pagetemplates: props.restaurant_bars_templates || [],
			trusted_restaurants: props.trusted_restaurants || [],
			isSearch: false,
			isVenueSearch: false,
			isSearching: false,
			emptySearchText: '',
			capacity: '',
			fetechedRestaurants: [],
			query: '',
			type: this.getType || 'restaurant',
			// city: this.getCity() || 'Melbourne',
			city: this.props.city_capital || 'Melbourne',
			blogs: [],
			cities: []
		};
	}

	// Below functions are to initiate restaurant and venue search after user enters search term
	doRestaurantSearch = (event) => {
		var name = event.target.value;
		if(this.timeout) clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			filterRestaurants({name:name,published:1,status:true}).then(results => {
				if(results.restaurants == 0){
					this.setState({emptySearchText:"No result found!"});
				}
				this.setState({fetechedRestaurants:results.restaurants,isSearching:false});
			});
		}, 1500);
	}
	doVenueSearch = (event) => {
		var name = event.target.value;
		if(this.timeout) clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			var capacity = this.state.capacity;
			filterVenues({name: name,capacity:capacity}).then(results => {
				if(results.restaurants == 0){
					this.setState({emptySearchText:"No result found!"});
				}
				this.setState({fetechedRestaurants:results.restaurants,isSearching:false});
			});
		}, 1500);
	}

	submitForm = async() => {
		const {vendorEmail} = this.state;
		if(!vendorEmail){
			this.setState({vendorEmailError:true});
			return false;
		}
		await saveInterestedEmails({email:vendorEmail});
		this.setState({vendorEmailError:false});
		window.location.replace(process.env.ADMIN_URL+"/signup/"+vendorEmail);
	}

	// This is for speech to text feature
	startDictation = (event) => {
		if (window.hasOwnProperty('webkitSpeechRecognition')) {
			var recognition = new webkitSpeechRecognition();
		
			recognition.continuous = false;
			recognition.interimResults = false;
		
			recognition.lang = "en-AU";
			recognition.start();
			var that = this;
			recognition.onresult = function(e) {
				// document.getElementById('input-srch').value = e.results[0][0].transcript;
				var val = e.results[0][0].transcript;
				that.setState({query:val});
				if(val.length > 2){
					that.setState({ isSearch: true });
					that.setState({isSearching:true});
					if(that.timeout) clearTimeout(that.timeout);
					that.timeout = setTimeout(() => {
						filterRestaurants({name:val,published:1,status:true}).then(results => {
							that.setState({fetechedRestaurants:results.restaurants,isSearching:false});
						});
					}, 1500);
				} else{
					// console.log('invalid');
				}
				recognition.stop();
			};
		
			recognition.onerror = function(e) {
				recognition.stop();
			}
		} else{
			console.log('Your browser does not support speech to text feature!');
		}
	}

	render() {
		if(!this.props.city){
			return false;
		}
		const { vendorEmail, vendorEmailError, capacity, user, pagetemplates, trusted_restaurants, isSearch, isVenueSearch, isSearching, emptySearchText, fetechedRestaurants, query, type, city, blogs } = this.state;
		const responsive = {
			superLargeDesktop: {
				// the naming can be any, depends on you.
				breakpoint: { max: 4000, min: 3000 },
				items: 5,
			},
			desktop: {
				breakpoint: { max: 3000, min: 1024 },
				items: 3,
			},
			tablet: {
				breakpoint: { max: 1024, min: 464 },
				items: 2,
			},
			mobile: {
				breakpoint: { max: 464, min: 0 },
				items: 1,
			},
		};

		return (
			<main className={type == 'restaurant' ? "wrapper home-page" : "wrapper home-page function-venue-wrap"}>
				{/* Head section where we can send meta tags */}
				<Head>
					<title>{"Best "+city+" Places for Dine & Drink or Venues for Hire - 10 of The Best"}</title>
					<meta name="title" content={"Best "+city+" Places for Dine & Drink or Venues for Hire - 10 of The Best"} />
					<meta name="description" content={city+"'s best places to eat, dine & drink or venues to hire. 10 of The Best includes quick information on best restaurants, cafes, bars & function rooms."} />
					
					<meta property="og:locale" content="en_US" />
					<meta property="og:title" content={"Best "+city+" Places for Dine & Drink or Venues for Hire - 10 of The Best"} />
					<meta property="og:type" content="website" />
					<meta property="og:url" content={process.env.SITE_URL + '/' + city.toLowerCase().replace(/ /g,'-')} />
					{/* <meta property="og:image" content="image_url" /> */}

					<meta name="twitter:card" content="summary" />
					<meta name="twitter:title" content={"Best "+city+" Places for Dine & Drink or Venues for Hire - 10 of The Best"} />
					<meta name="twitter:desription" content={city+"'s best places to eat, dine & drink or venues to hire. 10 of The Best includes quick information on best restaurants, cafes, bars & function rooms."} />
					{/* <meta name="twitter:image" content="image_url" /> */}
					<meta name="twitter:url" content={process.env.SITE_URL + '/' + city.toLowerCase().replace(/ /g,'-')} />
				</Head>

				{/* header */}
				<Header user={user} />

				{/* body */}
				<section className="top-section section">
					<div className="container">
						<div className="content">
							<div className="amenities">
								<div className="row justify-content-center">
									<div className="col-md-4 col-6 pd-0" style={{cursor:'pointer'}} onClick={() => this.setType('restaurant')}>
										<div className="inr-bx br-rg text-center pd-15">
											<div className="icon">
												<img src={type == 'restaurant' ? "/static/assets/img/dine-drinks-dark.svg" : "/static/assets/img/dine-drinks.svg"} alt="" />
											</div>
											<h4 className={type == 'restaurant' ? 'active' : ''}>Dine & Drinks </h4>
										</div>
									</div>
									<div className="col-md-4 col-6 pd-0" style={{cursor:'pointer'}} onClick={() => this.setType('venue')}>
										<div className="inr-bx text-center pd-15">
											<div className="icon">
												<img src={type == 'venue' ? "/static/assets/img/function-venue-fill-icon.svg" : "/static/assets/img/function-venue.svg"} alt="" />
											</div>
											<h4 className={type == 'venue' ? 'active' : ''}>Function Venue </h4>
										</div>
									</div>
								</div>
							</div>
							<h1 className="text-center">Find the best restaurants, cafés, and bars in {city}</h1>
							{/* restaurant search view */}
							{type == 'restaurant' && <div className="search-bar inner-form">
								<div className="input-field">
									<input
										className="form-control" id="input-srch" autoComplete="off" type="text" placeholder="Search here" aria-label="Search"
										value={query || ''}
										onChange={(event) => {
											this.setState({query:event.target.value});
											if(event.target.value.length > 2){
												this.setState({isSearching:true});
												this.doRestaurantSearch(event);
											}
										}}
										onClick={() => {
											this.setState({ isSearch: true, emptySearchText:'' });
										}}
									/>
									<span onClick={(event) => this.startDictation(event)} style={{right:'70px',top:'24px',display:'none'}} className="fa fa-microphone pwd-field-icon"></span>
									<Link href={"/listing/"+city.toLowerCase().replace(/ /g,'-')+"?t=restaurant&q="+query}>
										<a className="btn-search" target="_blank">
											<img src="/static/assets/img/search-white.svg" alt="img" />
										</a>
									</Link>
								</div>
								<div style={isSearch ? {width:'100%'} : {display:'none',width:'100%'}} id="showsearch" className="search-content">
									<div className="input-wrap">
										<div className="options">
											<Link href={"/listing/"+city.toLowerCase().replace(/ /g,'-')+"?t=restaurant&q=Restaurant"}>
												<a target="_blank" className="btn btn-white mr-1">Restaurants</a>
											</Link>
											<Link href={"/listing/"+city.toLowerCase().replace(/ /g,'-')+"?t=restaurant&q=Cafe"}>
												<a target="_blank" className="btn btn-white mr-1">Cafes</a>
											</Link>
											<Link href={"/listing/"+city.toLowerCase().replace(/ /g,'-')+"?t=restaurant&q=Bar"}>
												<a target="_blank" className="btn btn-white mr-1">Bars</a>
											</Link>
											<Link href={"/listing/"+city.toLowerCase().replace(/ /g,'-')+"?t=restaurant&q="+query}>
												<a target="_blank" style={query.length ? {} : {'display':'none'}} className="btn btn-white mr-1">Search "{query}"</a>
											</Link>
											<a id="close-rest-search" 
												className="btn btn-white pull-right" 
												onClick={() => {
													this.setState({ isSearch: false, isVenueSearch: false, emptySearchText:'', fetechedRestaurants: [] });
												}}
											>
												<span className="fa fa-close"></span>
											</a>
										</div>
										<div className="places" style={!isSearching && emptySearchText ? {'display':'none'} : {}}>
											{fetechedRestaurants.map(function(restaurant, i){
												restaurant = JSON.parse(JSON.stringify(restaurant));
												return (
													<Link key={i} href={"/"+ restaurant.city.toLowerCase().replace(/ /g,"-") + "/" + restaurant.slug}>
														<a target="_blank">
															<div className="address" style={i == fetechedRestaurants.length-1 ? {borderBottom:'inherit'}:{}}>
																<div className="plc-img">
																	{restaurant.images.length > 0 ? <img src={restaurant.images[0].image || ''} alt="img" /> : null}
																</div>
																<div className="location">
																	<h4>{restaurant.name}</h4>
																	<h6>{restaurant.address}, {restaurant.city}</h6>
																</div>
															</div>
														</a>
													</Link>
												);
											})}
										</div>
										<div className="places" style={isSearching || emptySearchText ? {} : {'display':'none'}}>
											<p className="text-center">{emptySearchText ? emptySearchText : 'Fetching restaurants..'}</p>
										</div>
									</div>
								</div>
							</div>}
							{/* end restaurant search view */}

							{/* function-venue search view */}
							{type == 'venue' && <div className="venue-search-wrap">
								<div className="inner-form function-search">
									<div className="function-event">
										<div className="input-field first-wrap" id="event-toggle">
											<input 
												id="function-venue-search" className="form-control" autoComplete="off" type="text" placeholder="Search here" 
												value={query || ''}
												onChange={async(event) => {
													this.setState({query:event.target.value});
													if(event.target.value.length > 1){
														this.setState({isSearching:true});
														this.doVenueSearch(event);
													}
												}}
												onClick={() => {
													this.setState({ isVenueSearch: true, emptySearchText:'' });
												}}
											/>
										</div>
									</div>
									<div className="function-attendees">
										<div className="input-field">
											<div className="input-group">
												<input 
													type="text" name="capacity" className="form-control input-number" placeholder="Attendees" 
													onChange={async(event) => {
														var attendees = event.target.value;
														attendees = attendees.replace(".","");
														attendees = attendees.replace(" ","");
														if(isNaN(attendees)){
															return false;
														}
														this.setState({capacity:attendees});
														if(this.state.query){
															this.doVenueSearch(this.state.query);
														}
													}}
													value={capacity}
												/>
												<span className="input-group-btn">
													<button type="button" className="btn btn-number"
														onClick={() => {
															var capacity = this.state.capacity;
															capacity++
															this.setState({capacity});
														}}
													>
														<span className="fa fa-angle-up"></span>
													</button>
													<button type="button" className="btn btn-number"
														onClick={() => {
															var capacity = this.state.capacity;
															if(capacity){
																capacity--
															}
															this.setState({capacity});
														}}
													>
														<span className="fa fa-angle-down"></span>
													</button>
												</span>
											</div>
										</div>
									</div>
									{/*<div className="function-venue">
										<div className="input-field third-wrap dropdown-toggle" id="venue-toggle" data-toggle="dropdown">
												<input className="form-control" type="text" placeholder="Select Venue type" />
										</div>
										<div className="dropdown-menu venue-type-menu" aria-labelledby="venue-toggle">
												<a href="#" className="dropdown-item">Casual dining restaurant</a>
												<a href="#" className="dropdown-item">Fast food</a>
												<a href="#" className="dropdown-item">High-end restaurant</a>
												<a href="#" className="dropdown-item">Cafe</a>
										</div>
									</div>*/}
									<Link href={"/listing/"+city.toLowerCase().replace(/ /g,'-')+"?t=venues&q="+query+"&capacity="+capacity}>
										<a className="btn-search" target="_blank">
											<img src="/static/assets/img/search-white.svg" alt="img" />
											<span className="search-text mb-vw">Search</span>
										</a>
									</Link>
								</div>
								<div style={isVenueSearch ? {width:'100%'} : {display:'none',width:'100%'}} id="showsearch" className="search-content">
									<div className="input-wrap">
										<div className="options">
											<Link href={"/listing/"+city.toLowerCase().replace(/ /g,'-')+"?t=venues&q=Restaurant"}>
												<a target="_blank" className="btn btn-white mr-1">Restaurants</a>
											</Link>
											<Link href={"/listing/"+city.toLowerCase().replace(/ /g,'-')+"?t=venues&q=Cafe"}>
												<a target="_blank" className="btn btn-white mr-1">Cafes</a>
											</Link>
											<Link href={"/listing/"+city.toLowerCase().replace(/ /g,'-')+"?t=venues&q=Bar"}>
												<a target="_blank" className="btn btn-white mr-1">Bars</a>
											</Link>
											<Link href={"/listing/"+city.toLowerCase().replace(/ /g,'-')+"?t=venues&q="+query}>
												<a target="_blank" style={query.length ? {} : {'display':'none'}} className="btn btn-white mr-1">Search "{query}"</a>
											</Link>
											<a id="close-venue-search" 
												className="btn btn-white pull-right"
												onClick={() => {
													this.setState({ isSearch: false, isVenueSearch: false, emptySearchText:'', fetechedRestaurants: [] });
												}}
											>
												<span className="fa fa-close"></span>
											</a>
										</div>
										<div className="places" style={!isSearching && emptySearchText ? {'display':'none'} : {}}>
											{fetechedRestaurants.map(function(restaurant, i){
												restaurant = JSON.parse(JSON.stringify(restaurant));
												return (
													<Link key={i} href={"/"+ restaurant.city.toLowerCase().replace(/ /g,"-") + "/" + restaurant.slug}>
														<a target="_blank">
															<div className="address" style={i == fetechedRestaurants.length-1 ? {borderBottom:'inherit'}:{}}>
																<div className="plc-img">
																	{restaurant.images.length > 0 ? <img src={restaurant.images[0].image || ''} alt="img" /> : null}
																</div>
																<div className="location">
																	<h4>{restaurant.name}</h4>
																	<h6>{restaurant.address}, {restaurant.city}</h6>
																</div>
															</div>
														</a>
													</Link>
												);
											})}
										</div>
										<div className="places" style={isSearching || emptySearchText ? {} : {'display':'none'}}>
											<p className="text-center">{emptySearchText ? emptySearchText : 'Fetching venues..'}</p>
										</div>
									</div>
								</div>
							</div>}
							{/* end function-venue search view */}
						</div>
					</div>
				</section>
				<section style={pagetemplates.length == 0 ? {display:'none'} : {}} className="new-thing section">
					<div className="container">
						<div className="middle">
							<div className="section-header">
								<highlight>What’s New</highlight> in {city}
							</div>
							<div className="row">
								{/*<div className="col-md-3 col-12">
									<div className="trend-left">
										<ul>
											<li className="tag">
												Trending Search
											</li>
											<li>
												<h5>Grossi Florentino</h5>
												<p>Top Restaurant</p>
											</li>
											<li>
												<h5>Stasia Citta</h5>
												<p>Top Restaurant</p>
											</li>
											<li>
												<h5>Melbourne Showground</h5>
												<p>Top Restaurant</p>
											</li>
											<li>
												<h5>Grossi Florentino</h5>
												<p>Top Restaurant</p>
											</li>
											<li>
												<h5>Rising Embers</h5>
												<p>Top Restaurant</p>
											</li>
											<li>
												<h5>Pinotta</h5>
												<p>Top Restaurant</p>
											</li>
										</ul>
									</div>
								</div>*/}
								<div className="col-md-12 col-12">
									<div className="trend-right">
										{/* desktop view */}
										<div className="row d-none d-md-flex">
											{pagetemplates.map(function(template, index){
												template = JSON.parse(JSON.stringify(template));
												return (
													<div key={index} className="col-md-4 col-12">
														<Link href={"/"+ template.city.toLowerCase().replace(/ /g,"-") + '/collection/' + template.slug}>
															<a >
																<div className="item">
																	<div className="box" style={{overflow:'hidden'}}>
																		<div className="pic">
																			<img style={{width:'348px',height:'200px',objectFit: 'cover'}} src={template.image || 'https://totb-data.s3-ap-southeast-2.amazonaws.com/static/264x173.jpg'} alt="" />
																		</div>
																		<div className="inside" >
																			<h5 style={{overflow:'inherit'}}>{template.name}</h5>
																		</div>
																	</div>
																</div>
															</a>
														</Link>
													</div>
												);
											})}
										</div>
										{/* end desktop view */}
										{/* mobile view */}
										<Carousel centerMode={true} ssr={true} infinite={false} showDots={true} arrows={false} containerClass="row d-flex d-md-none" responsive={responsive}>
											{pagetemplates.map(function(template, index){
												template = JSON.parse(JSON.stringify(template));
												return (
													<div key={index} className="col-md-12 col-12">
														<Link href={"/"+ template.city.toLowerCase().replace(/ /g,"-") + '/collection/' + template.slug}>
															<a>
																<div className="item">
																	<div className="box">
																		<div className="pic">
																			<img src={template.image || 'https://totb-data.s3-ap-southeast-2.amazonaws.com/static/264x173.jpg'} alt="" />
																		</div>
																		<div className="inside">
																			<h5 style={{height:'initial'}}>{template.name}</h5>
																		</div>
																	</div>
																</div>
															</a>
														</Link>
													</div>
												);
											})}
										</Carousel>
										{/* end mobile view */}
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
				<section style={trusted_restaurants.length == 0 ? {display:'none'} : {}} className="restaurant section">
					<div className="container">
						<div className="section-header">
							<span className="mr-2">{city}'s Most</span>
							<highlight>Trusted</highlight> Restaurants
						</div>
						{/* desktop view */}
						<div className="row d-none d-md-flex">
							<div className="restro-container">
								{trusted_restaurants.map(function(restaurant, index){
									restaurant = JSON.parse(JSON.stringify(restaurant));
									if(!restaurant.city){
										return false;
									}
									return (
										<Link href={"/"+ restaurant.city.toLowerCase().replace(/ /g,"-") + '/' + restaurant.slug} key={index}>
											<a>
												<div className="item restro-item">
													<div className="restro-img">
														<div className="overlay"></div>
														{restaurant.images.length > 0 ? <img src={restaurant.images[0].image || ''} alt="img" /> : <img src='https://totb-data.s3.ap-southeast-2.amazonaws.com/static/250x250.jpg' alt="img" />}
														<div className="bottom-center">{restaurant.name}</div>
													</div>
												</div>
											</a>
										</Link>
									);
								})}
							</div>
						</div>
						{/* end desktop view */}
						{/* mobile view */}
						<Carousel centerMode={true} ssr={true} infinite={false} showDots={true} arrows={false} containerClass="row d-flex d-md-none" responsive={responsive}>
							{trusted_restaurants.map(function(restaurant, index){
								restaurant = JSON.parse(JSON.stringify(restaurant));
								if(!restaurant.city){
									return false;
								}
								return (
									<Link href={"/"+ restaurant.city.toLowerCase().replace(/ /g,"-") + "/" + restaurant.slug} key={index}>
										<a>
											<div className="col-md-12 col-12">
												<div className="item restro-item">
													<div className="restro-img">
														<div className="overlay"></div>
														{restaurant.images.length > 0 ? <img src={restaurant.images[0].image || ''} alt="" /> : <img src='https://totb-data.s3.ap-southeast-2.amazonaws.com/static/250x250.jpg' alt="img" />}
														<div className="bottom-center">{restaurant.name}</div>
													</div>
												</div>
											</div>
										</a>
									</Link>
								);
							})}
						</Carousel>
						{/* end mobile view */}
					</div>
				</section>
				<section style={blogs.length == 0 ? {display:'none'} : {}} className="category section">
					<div className="container">
						<div className="title">
							<div className="row align-items-center">
								<div className="col-md-8 col-12">
									<div className="section-header pb-0">
										<span className="mr-2">Food & Events Trends in</span>
										<highlight>{new Date().getFullYear()}</highlight>
									</div>
								</div>
								<div className="col-md-4">
									<div className="more">
										<a href="https://www.10ofthebest.com.au/blog">Explore More<span className="next"><img src="/static/assets/img/next-arrow.svg" alt="" /></span></a>
									</div>
								</div>
							</div>
						</div>
						<div className="info">
							<div className="row d-none d-md-flex">
								{blogs.map(function(blog, i){
									return (
										<div key={i} className="col-md-4 col-12 item">
											<div className="info-box">
												<div className="pic">
													<img src={blog.thumbnail} alt="" />
												</div>
												<div className="inside">
													<Link prefetch={false} href={blog.link}><a target="_blank"><h5 dangerouslySetInnerHTML={{ __html: blog.title}}></h5></a></Link>
													{/* <p>It’s the question on everyone’s lips, Top 10 tips to Host a Perfect Private Dining Event…</p> */}
													{/*<a href="#" className="more-link">See more<span className="next"><img src="/static/assets/img/small-next.svg" alt="" /></span></a>*/}
												</div>
											</div>
										</div>
									);
								})}
							</div>
							<Carousel ssr={true} centerMode={true} showDots={true} centerMode={true} arrows={false} containerClass="row d-flex d-md-none" responsive={responsive}>
								{blogs.map(function(blog, i){
									return (
										<div key={i} className="col-md-4 col-12 item">
											<div className="info-box">
												<div className="pic">
													<img src={blog.thumbnail} alt="" />
												</div>
												<div className="inside">
													<Link prefetch={false} href={blog.link}><a target="_blank"><h5>{blog.title}</h5></a></Link>
													{/* <p>It’s the question on everyone’s lips, What to Wear to Melbourne Cup Carnival…</p> */}
													{/*<a href="#" className="more-link">See more<span className="next"><img src="/static/assets/img/small-next.svg" alt="" /></span></a>*/}
												</div>
											</div>
										</div>
									);
								})}
							</Carousel>
						</div>
					</div>
				</section>
				{/* footer  */}
				<Footer user={user} />
			</main>
		);
	}
}

export default withAuth(Index, { loginRequired: false });