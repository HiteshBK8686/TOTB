import PropTypes from 'prop-types';
import Head from 'next/head';

import Header from '../components/HomeHeader';
import Footer from '../components/HomeFooter';
import NProgress from 'nprogress';
import ReviewListing from '../components/ReviewListing';
import FaqTab from '../components/FaqTab';
import ReviewTab from '../components/ReviewTab';
import OverviewTab from '../components/OverviewTab';
import EventTab from '../components/EventTab';
import PhotoTab from '../components/PhotoTab';

import withAuth from '../lib/withAuth';
import notify from '../lib/notifier';
import Script from 'react-load-script';

import Carousel from "react-multi-carousel";
import { fetchCertificates, fetchEvents, fetchRestaurantImages, submitReview, bookmark, fetchAdditionalDetails, markvisited, fetchSliderImages, fetchReviews, useful, not_useful,  } from '../lib/api/restaurant';

class VenueDetails extends React.Component {
	static getInitialProps({query}) {
		const slug = query.slug;
		const restaurant = query.restaurant;
		const venueDetailsPage = true;
		return { venueDetailsPage, slug, restaurant };
	}


	async componentDidMount() {
		document.getElementById('formButton').addEventListener('click', function(e) {
			e.preventDefault();
			document.getElementsByClassName('toggle')[0].classList.toggle('hide-rw');
			document.getElementsByClassName('toggle')[1].classList.toggle('hide-rw');
		});

		document.getElementById('cancel_review').addEventListener('click', function(e) {
			e.preventDefault();
			document.getElementsByClassName('toggle')[0].classList.toggle('hide-rw');
			document.getElementsByClassName('toggle')[1].classList.toggle('hide-rw');
		});

		var user = this.state.user;
		document.getElementById('rate_restaurant').addEventListener('click', function(e) {
			e.preventDefault();
			if(Object.keys(user).length){
				document.getElementById('write-review').scrollIntoView(true);
			} else{
				document.getElementById('loginLink').click();
			}
		});

		document.getElementById('go-comments-tab').addEventListener('click', function(e) {
			e.preventDefault();
			document.getElementById('comments-tab').scrollIntoView(true);
		});

		var states = await import('./au-states.json');
		states = JSON.parse(JSON.stringify(states));
		
		var result = [];
		for(var i in states)
			result[states[i].id] = states[i].name;
		var states = result;
		this.setState({ states });

		NProgress.start();
		try {
			if(this.props.user != undefined){
				const additionalDetails = await fetchAdditionalDetails({restaurant_id:this.props.restaurant._id, user_id:this.props.user._id});
				this.setState({bookmarked: additionalDetails.bookmark, visited: additionalDetails.visited, reviewed: additionalDetails.reviewed, rating_value:additionalDetails.rating_value, review_text: additionalDetails.review_text, certificates: additionalDetails.certificates});
			} else{
				const additionalDetails = await fetchAdditionalDetails({restaurant_id:this.props.restaurant._id, user_id:0});
				this.setState({bookmarked: additionalDetails.bookmark, visited: additionalDetails.visited, reviewed: additionalDetails.reviewed, rating_value:additionalDetails.rating_value, review_text: additionalDetails.review_text, certificates: additionalDetails.certificates});
			}

			/*const events = await fetchEvents({id:this.props.restaurant._id});
			this.setState({ events:events.events, event_image:events.event_image, events_fetched:1 });*/

			const restaurant_images = await fetchRestaurantImages({id:this.props.restaurant._id,plandetails:this.props.restaurant.plandetails});
			this.setState({ images:restaurant_images.images, restaurant_image:restaurant_images.image_url, restaurant_images_fetched:1 });

			const restaurant_reviews = await fetchReviews({restaurant_id:this.props.restaurant._id, page:this.state.review_page});
			this.setState({ restaurant_reviews:restaurant_reviews, all_reviews:restaurant_reviews.all_reviews, recent_reviews:restaurant_reviews.recent_reviews, popular_reviews:restaurant_reviews.popular_reviews, review_fetched:1 });

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

	static defaultProps = {

	};

	constructor(props) {
		super(props);

		this.state = {
			user: props.user || {},
			restaurant: props.restaurant || {},
			certificates: [],
			menu: props.restaurant.menu || [],
			events: props.restaurant.events || [],
			payment_methods: props.restaurant.payment_methods || [],
			faqs: props.restaurant.faqs || [],
			images: [],
			currentStep: 0,
			rating_value: 0,
			review_text:'',
			bookmarked:0,
			visited:0,
			reviewed:0,
			additionalDetails:{},
			review_page:1,
			all_reviews:[],
			recent_reviews:[],
			popular_reviews:[],
			restaurant_reviews:{},
			states: [],
			review_fetched: 0,
			restaurant_images_fetched: 0,
			events_fetched: 1,
			restaurant_image: '',
			event_image:props.restaurant.event_image || '',
			featuresLimit: 8
		};

		this.carouselLoaded = this.carouselLoaded.bind(this);
	}

	carouselLoaded() {
		var totalItems = $('#gallery-thumb').children().find('.carousel-item').length;
		var currentIndex = $('div.active').index() + 1;
		$('#gallery-thumb').on('slid.bs.carousel', function() {
			currentIndex = $('div.active').index() + 1;
			$('.num').html('' + currentIndex + '/' +   + '');
		});

		$('#galleryModal').on('shown.bs.modal', function(e) {
			$('.num').html('' + currentIndex + '/' + totalItems + '');
		});
	}

	publishReview = async(event) => {
		var {rating_value, review_text, restaurant, user} = this.state;
		event.preventDefault();
		try {
			const review = await submitReview({rating_value:rating_value, review_text:review_text,user_id:user._id,restaurant_id:restaurant._id});
			this.setState({rating_value:0,review_text:''});
		} catch (err) {
			notify(err);
		}
	};

	bookmarkRestaurant = async(event) => {
		var {restaurant, user, bookmarked} = this.state;
		event.preventDefault();
		if(Object.keys(user).length){
			try {
				const boomark = await bookmark({user_id:user._id,restaurant_id:restaurant._id});
				this.setState({bookmarked:!bookmarked});
			} catch (err) {
				notify(err);
			}	
		} else{
			document.getElementById('loginLink').click();	
		}
	};

	visitedRestaurant = async(event) => {
		var {restaurant, user, visited} = this.state;
		event.preventDefault();
		if(Object.keys(user).length){
			try {
				this.setState({visited:!visited});
				const markasvisited = await markvisited({user_id:user._id,restaurant_id:restaurant._id});
			} catch (err) {
				notify(err);
			}
		} else{
			document.getElementById('loginLink').click();	
		}
	};

	usefulMarked = async(index, review) => {
		var {user} = this.state;
		var review_id = review._id;
		try {
			await useful({review_id:review_id,user_id:user._id});
		} catch (err) {
			notify(err);
		}
	};

	notUsefulMarked = async(index, review) => {
		var {user} = this.state;
		var review_id = review._id;
		try {
			await not_useful({review_id:review_id,user_id:user._id});
		} catch (err) {
			notify(err);
		}
	};

	websiteClick = (restaurant_id) => {
		try {
			website_click({restaurant_id});
		} catch (err) {
			notify(err);
		}
	};

	cellPhoneClick = (restaurant_id) => {
		try {
			cellphone_click({restaurant_id});
		} catch (err) {
			notify(err);
		}
	};

	emailClick = (restaurant_id) => {
		try {
			email_click({restaurant_id});
		} catch (err) {
			notify(err);
		}
	};

	render() {
		const { faqs, user, restaurant, certificates, menu, currentStep, events, payment_methods, images, rating_value, review_text, bookmarked, visited, additionalDetails, reviewed, states, restaurant_reviews, all_reviews, recent_reviews, popular_reviews, review_fetched, restaurant_images_fetched, events_fetched, restaurant_image, event_image, featuresLimit } = this.state;

		var categories = menu.categories ? menu.categories : [];
		var day = new Date().getDay();
		var working_hours = restaurant.working_hours;
		if(working_hours != undefined){
			if(restaurant.open_24_hours){
				var today_shift_one = 'open for 24 hours';
				var hours_instructions = restaurant.hours_instructions || 'Place is open for 24 hours';
			} else if(restaurant.temporarily_closed){
				var today_shift_one = 'closed';
				var hours_instructions = restaurant.hours_instructions || 'Place is temporarily closed';
			} else if(restaurant.same_hours){
				var today_shift_one = restaurant.same_working_hours[0] == undefined ? 'Hours not provided' : restaurant.same_working_hours[0].open.toUpperCase() + ' - ' + restaurant.same_working_hours[0].close.toUpperCase();
				var today_shift_two = restaurant.same_working_hours[1] == undefined ? null : restaurant.same_working_hours[1].open.toUpperCase() + ' - ' + restaurant.same_working_hours[1].close.toUpperCase();
				var hours_instructions = restaurant.hours_instructions || false;
				working_hours.sunday = working_hours.monday = working_hours.tuesday = working_hours.wednesday = working_hours.thursday = working_hours.friday = working_hours.saturday = restaurant.same_working_hours;
			} else{
				if(day == 0){
					var today_shift_one = working_hours.sunday_open ? working_hours.sunday[0].open.toUpperCase() + ' - ' + working_hours.sunday[0].close.toUpperCase() : 'Closed';
					var today_shift_two = working_hours.sunday_open && working_hours.sunday[1] != undefined ? working_hours.sunday[1].open.toUpperCase() + ' - ' + working_hours.sunday[1].close.toUpperCase() : null;
				} else if(day == 1){
					var today_shift_one = working_hours.monday_open ? working_hours.monday[0].open.toUpperCase() + ' - ' + working_hours.monday[0].close.toUpperCase() : 'Closed';
					var today_shift_two = working_hours.monday_open && working_hours.monday[1] != undefined ? working_hours.monday[1].open.toUpperCase() + ' - ' + working_hours.monday[1].close.toUpperCase() : null;
				} else if(day == 2){
					var today_shift_one = working_hours.tuesday_open ? working_hours.tuesday[0].open.toUpperCase() + ' - ' + working_hours.tuesday[0].close.toUpperCase() : 'Closed';
					var today_shift_two = working_hours.tuesday_open && working_hours.tuesday[1] != undefined ? working_hours.tuesday[1].open.toUpperCase() + ' - ' + working_hours.tuesday[1].close.toUpperCase() : null;
				} else if(day == 3){
					var today_shift_one = working_hours.wednesday_open ? working_hours.wednesday[0].open.toUpperCase() + ' - ' + working_hours.wednesday[0].close.toUpperCase() : 'Closed';
					var today_shift_two = working_hours.wednesday_open && working_hours.wednesday[1] != undefined ? working_hours.wednesday[1].open.toUpperCase() + ' - ' + working_hours.wednesday[1].close.toUpperCase() : null;
				} else if(day == 4){
					var today_shift_one = working_hours.thursday_open ? working_hours.thursday[0].open.toUpperCase() + ' - ' + working_hours.thursday[0].close.toUpperCase() : 'Closed';
					var today_shift_two = working_hours.thursday_open && working_hours.thursday[1] != undefined ? working_hours.thursday[1].open.toUpperCase() + ' - ' + working_hours.thursday[1].close.toUpperCase() : null;
				} else if(day == 5){
					var today_shift_one = working_hours.friday_open ? working_hours.friday[0].open.toUpperCase() + ' - ' + working_hours.friday[0].close.toUpperCase() : 'Closed';
					var today_shift_two = working_hours.friday_open && working_hours.friday[1] != undefined ? working_hours.friday[1].open.toUpperCase() + ' - ' + working_hours.friday[1].close.toUpperCase() : null;
				} else if(day == 6){
					var today_shift_one = working_hours.saturday_open ? working_hours.saturday[0].open.toUpperCase() + ' - ' + working_hours.saturday[0].close.toUpperCase() : 'Closed';
					var today_shift_two = working_hours.saturday_open && working_hours.saturday[1] != undefined ? working_hours.saturday[1].open.toUpperCase() + ' - ' + working_hours.saturday[1].close.toUpperCase() : null;
				}
			}
		} else{
			working_hours = {};
			if(restaurant.open_24_hours){
				var today_shift_one = 'open for 24 hours';
				var hours_instructions = restaurant.hours_instructions || 'Place is open for 24 hours';
			} else if(restaurant.temporarily_closed){
				var today_shift_one = 'closed';
				var hours_instructions = restaurant.hours_instructions || 'Place is temporarily closed';
			} else if(restaurant.same_hours){
				var today_shift_one = restaurant.same_working_hours[0] == undefined ? 'Hours not provided' : restaurant.same_working_hours[0].open.toUpperCase() + ' - ' + restaurant.same_working_hours[0].close.toUpperCase();
				var today_shift_two = restaurant.same_working_hours[1] == undefined ? null : restaurant.same_working_hours[1].open.toUpperCase() + ' - ' + restaurant.same_working_hours[1].close.toUpperCase();
				var hours_instructions = restaurant.hours_instructions || false;
				working_hours.sunday = working_hours.monday = working_hours.tuesday = working_hours.wednesday = working_hours.thursday = working_hours.friday = working_hours.saturday = restaurant.same_working_hours;
			} else{
				working_hours.monday_open = false;
				working_hours.tuesday_open = false;
				working_hours.wednesday_open = false;
				working_hours.thursday_open = false;
				working_hours.friday_open = false;
				working_hours.saturday_open = false;
				working_hours.sunday_open = false;
				var today_shift_one = 'Closed';
				var today_shift_two = null
			}
		}

		var url = restaurant.website || '';
		if( url.indexOf("http") == 0 || url == '' ) {
			// nothing to do
		} else {
			url = 'https://' + url;
		}

		var features = restaurant.features;
		var slider_images = restaurant.slider_images;
		var slider_url = restaurant.slider_url;
		var slider_thumb_url = restaurant.slider_thumb_url;

		var schema_json = {
			"@context": "http://schema.org",
			"@type": "LocalBusiness"
		};
		schema_json.image = `${process.env.SITE_URL}/static/assets/img/logo.svg`;
		schema_json.address = {
			"@type": "PostalAddress",
			"streetAddress": `${restaurant.address}`,
			"addressLocality": `${restaurant.city}, ${restaurant.state}`,
			"addressRegion": "Australia",
			"postalCode": `${restaurant.zip}`
		}

		if(restaurant.total_reviews != undefined){
			schema_json.aggregateRating = {
				"@type": "AggregateRating",
				"ratingValue": `${restaurant.rating != undefined ? parseInt(restaurant.rating) : 0}`,
				"ratingCount": `${restaurant.total_reviews != undefined ? parseInt(restaurant.total_reviews) : 0}`,
				"worstRating": "0",
				"bestRating": "5"
			}
		}
		schema_json.name = `${restaurant.name}`;
		schema_json.openingHours = [
			`Mon ${working_hours.monday ? working_hours.monday[0].open.toUpperCase() + '-' + working_hours.monday[0].close.toUpperCase() : 'Closed'}`,
			`Tue ${working_hours.tuesday ? working_hours.tuesday[0].open.toUpperCase() + '-' + working_hours.tuesday[0].close.toUpperCase() : 'Closed'}`,
			`Wed ${working_hours.wednesday ? working_hours.wednesday[0].open.toUpperCase() + '-' + working_hours.wednesday[0].close.toUpperCase() : 'Closed'}`,
			`Thu ${working_hours.thursday ? working_hours.thursday[0].open.toUpperCase() + '-' + working_hours.thursday[0].close.toUpperCase() : 'Closed'}`,
			`Fri ${working_hours.friday ? working_hours.friday[0].open.toUpperCase() + '-' + working_hours.friday[0].close.toUpperCase() : 'Closed'}`,
			`Sat ${working_hours.saturday ? working_hours.saturday[0].open.toUpperCase() + '-' + working_hours.saturday[0].close.toUpperCase() : 'Closed'}`,
			`Sun ${working_hours.sunday ? working_hours.sunday[0].open.toUpperCase() + '-' + working_hours.sunday[0].close.toUpperCase() : 'Closed'}`
		];

		schema_json.telephone = `${restaurant.contact || 'NA'}`;
		schema_json.hasMap = `https://www.google.com/maps?ll=${restaurant.lat},${restaurant.long}`;

		return (
			<main className="wrapper venue-page">
				<Head>
					<title>{restaurant.name} - Function venue for Hire in {restaurant.city} - 10 of The Best</title>
					<meta name="title" content={restaurant.name + " - Function venue for Hire in " + restaurant.city + " - 10 of The Best"} />
					<meta name="description" content={restaurant.description.split('.')[0] + ". Explore unbiased reviews, photos and relevant information about " + restaurant.name} />
				
					<meta property="og:locale" content="en_US" />
					<meta property="og:title" content={restaurant.name + ", " + restaurant.city + " - 10 of The Best"} />
					<meta property="og:type" content="article" />
					<meta property="og:url" content={process.env.SITE_URL + '/' + restaurant.city.toLowerCase().replace(/ /g,'-') + '/' + restaurant.slug} />
					{/* <meta property="og:image" content={collection.image || "https://totb-data.s3.ap-southeast-2.amazonaws.com/static/1140x324.jpg"} /> */}

					<meta name="twitter:card" content="summary" />
					<meta name="twitter:title" content={restaurant.name + ", " + restaurant.city + " - 10 of The Best"} />
					<meta name="twitter:desription" content={restaurant.description.split('.')[0] + ". Explore unbiased reviews, rating and relevant information about " + restaurant.name} />
					{/* <meta name="twitter:image" content={collection.image || "https://totb-data.s3.ap-southeast-2.amazonaws.com/static/1140x324.jpg"} /> */}
					<meta name="twitter:url" content={process.env.SITE_URL + '/' + restaurant.city.toLowerCase().replace(/ /g,'-') + '/' + restaurant.slug} />
				</Head>
				<Header user={user} />
				<section className="detail-wrap venue-detail">
					<div className="venue-top">
						<div className="venue-nm">
							<div className="container">
								<div className="row">
									<div className="col-12">
										<div className="dark-menu">
											<ul className="breadcrumb">
												<li><a href="#">Home</a></li>
												<li><a href="#">{states[restaurant.state]}</a></li>
												<li><a href="#">{restaurant.city}</a></li>
												<li className="active"><a href="#">{restaurant.name}</a></li>
											</ul>
										</div>
									</div>
								</div>
								<div className="row">
									<div className="col-6">
										<div className="tag-left">
											<h1>{restaurant.name}
												{/*<span className="verify">
													<img src="/static/assets/img/venue-detail/check-icon.svg" />
												</span>*/}
											</h1>
											<p>{restaurant.restaurant_types.map(function(el){
											return el.name;
											}).join(' · ')}</p>
										</div>
									</div>
									<div className="col-6">
										<div className="tag-rgt">
											<button id="rate_restaurant" className="btn btn-white ml-2" type="submit"><i className={reviewed ? "fa fa-star" : "fa fa-star-o"} aria-hidden="true"></i><span className="hide">Rate</span></button>
											<button onClick={this.bookmarkRestaurant} className="btn btn-white ml-2" type="submit"><i className={bookmarked ? "fa fa-bookmark" : "fa fa-bookmark-o"} aria-hidden="true"></i><span className="hide">Bookmark</span></button>
											<button onClick={this.visitedRestaurant} className="btn btn-white ml-2" type="submit"><i className={visited ? "fa fa-check" : "fa fa-map-marker"} aria-hidden="true"></i><span className="hide">Visited</span></button>
											{/*<button className="btn btn-filled ml-2" type="submit"><i className="fa fa-calendar-check-o" aria-hidden="true"></i><span className="hide">Book now</span></button>*/}
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="venue-img">
							<div className="container-fluid">
								<div className="venue-wrap d-none d-md-flex">
									<div className="lft-box pr-3">
										<div className="vn-img img-horizontal" data-toggle="modal" data-target="#galleryModal">
											<a data-slide-to="4" href="#gallery-thumb"><img style={images.length > 0 ? {} : {display:'none'}} src={images.length > 0 ? images[0].image : ''} alt="img" width="1148" />
											</a>
										</div>
									</div>
									<div className="rgt-box pl-3">
										<div className="vn-img img-vertical mr-btm" data-toggle="modal" data-target="#galleryModal">
											<a data-slide-to="5" href="#gallery-thumb">
												<img style={images.length > 1 ? {} : {display:'none'}} src={images.length > 1 ? images[1].image : ''} alt="img" width="702" /></a>
										</div>
										<div className="vn-img img-vertical mr-tp" data-toggle="modal" data-target="#galleryModal">
											<a data-slide-to="6" href="#gallery-thumb">
												<img style={images.length > 2 ? {} : {display:'none'}} src={images.length > 2 ? images[2].image : ''} alt="img" width="702" /></a>
										</div>
									</div>
									<div className="view-photo-btn">
										<button className="btn btn-filled" type="button" data-toggle="modal" data-target="#galleryModal">View Photos</button>
									</div>
								</div>
								{/*Mobile venue carousel wrapper*/}
								<div className="venue-wrap-slider d-flex d-md-none">
									<div id="venue-thumb" className="venue-slider carousel slide  carousel-thumbnails" data-ride="carousel">
										{/*Slides*/}
										<div className="carousel-inner" role="listbox">
											{images.map(function(image, index){
												return (
													<div key={index} className={index == 0 ? 'carousel-item active' : 'carousel-item'}>
														<img className="d-block" src="/static/assets/img/venue-detail/gallery-1.png" alt="First slide" />
													</div>
												);
											})}
										</div>
										{/*Slides*/}
										{/*Controls*/}
										<a className="carousel-control-prev" href="#venue-thumb" role="button" data-slide="prev">
											<span className="carousel-control-prev-icon" aria-hidden="true"></span>
											<span className="sr-only">Previous</span>
										</a>
										<a className="carousel-control-next" href="#venue-thumb" role="button" data-slide="next">
											<span className="carousel-control-next-icon" aria-hidden="true"></span>
											<span className="sr-only">Next</span>
										</a>
										{/*Controls*/}
										<ol className="carousel-indicators">
											{images.map(function(image, index){
												return (
													<li key={index} data-target="#venue-thumb" data-slide-to={index} className={index == 0 ? 'active' : ''}></li>
												);
											})}
										</ol>
									</div>
								</div>
								{/*Mobile venue carousel wrapper*/}
							</div>
							{/*view photo gallery*/}
							<div id="galleryModal" className="gallery-view modal">
								<div className="modal-content">
									<button type="button" className="close" data-dismiss="modal"><span className="close-bg"><img src="/static/assets/img/venue-detail/close-icon.svg" /></span></button>
									{/*Carousel Wrapper*/}
									<div id="gallery-thumb" className="carousel slide carousel-fade carousel-thumbnails" data-ride="carousel">
										{/*Slides*/}
										<div className="carousel-inner" role="listbox">
											{images.map(function(image, index){
												return (
													<div key={index} className={index == 0 ? 'carousel-item active' : 'carousel-item'}>
														<img className="d-block mx-auto" src={image.image} />
													</div>
												);
											})}
										</div>
										{/*Slides*/}
										{/*Controls*/}
										<a className="carousel-control-prev" href="#gallery-thumb" role="button" data-slide="prev">
											<span className="carousel-control-prev-icon" aria-hidden="true"></span>
											<span className="sr-only">Previous</span>
										</a>
										<a className="carousel-control-next" href="#gallery-thumb" role="button" data-slide="next">
											<span className="carousel-control-next-icon" aria-hidden="true"></span>
											<span className="sr-only">Next</span>
										</a>
										{/*Controls*/}
										<ol className="carousel-indicators">
											{images.map(function(image, index){
												return (
													<li key={index} data-target="#gallery-thumb" data-slide-to={index} className={index == 0 ? 'active' : ''}><img className="d-block" src={image.image} className="img-fluid" /></li>
												);
											})}
											<div className="num d-none"></div>
										</ol>
									</div>
									{/*Carousel Wrapper*/}
								</div>
							</div>
							{/*view photo gallery*/}
						</div>
					</div>
					<div className="venue-info">
						<div className="container">
							<div className="rate-info">
								<div className="info rating">
									<h5><i className="fa fa-star" aria-hidden="true"></i>{restaurant_reviews.avg_rating == null ? '0' : restaurant_reviews.avg_rating}</h5>
									<p>{restaurant_reviews.total_reviews > 100 ? '100+ Ratings' : '< 100 Ratings'}</p>
								</div>
								<div className="info" style={restaurant.capacity ? {} : {display:'none'}}>
									<p>Capacity</p>
									<h5>{restaurant.capacity} Seating</h5>
								</div>
								<div className="info" style={restaurant.avg_cost ? {} : {display:'none'}}>
									<p>Average Cost</p>
									<h5>${restaurant.avg_cost} per person</h5>
								</div>
								<div className="info">
									<p>Trading Hours</p>
									<div className="dropdown">
										<button type="button" className="btn dropdown-toggle" data-toggle="dropdown">
											Today {today_shift_one} {today_shift_two ? ', ' + today_shift_two : null}
										</button>
										<div className={!restaurant.same_hours && !restaurant.open_24_hours && !restaurant.temporarily_closed ? "dropdown-menu" : "d-none"}>
											<a className={day == 1 ? "dropdown-item font-weight-bold" : "dropdown-item"}>Mon {working_hours.monday_open || restaurant.same_hours ? working_hours.monday[0].open.toUpperCase() + ' - ' + working_hours.monday[0].close.toUpperCase() : 'Closed'} {working_hours.monday_open && working_hours.monday[1] != undefined ? ', '+working_hours.monday[1].open.toUpperCase() + ' - ' + working_hours.monday[1].close.toUpperCase() : null}</a>
											<a className={day == 2 ? "dropdown-item font-weight-bold" : "dropdown-item"}>Tue {working_hours.tuesday_open || restaurant.same_hours ? working_hours.tuesday[0].open.toUpperCase() + ' - ' + working_hours.tuesday[0].close.toUpperCase() : 'Closed'} {working_hours.tuesday_open && working_hours.tuesday[1] != undefined ? ', '+working_hours.tuesday[1].open.toUpperCase() + ' - ' + working_hours.tuesday[1].close.toUpperCase() : null}</a>
											<a className={day == 3 ? "dropdown-item font-weight-bold" : "dropdown-item"}>Wed {working_hours.wednesday_open || restaurant.same_hours ? working_hours.wednesday[0].open.toUpperCase() + ' - ' + working_hours.wednesday[0].close.toUpperCase() : 'Closed'} {working_hours.wednesday_open && working_hours.wednesday[1] != undefined ? ', '+working_hours.wednesday[1].open.toUpperCase() + ' - ' + working_hours.wednesday[1].close.toUpperCase() : null}</a>
											<a className={day == 4 ? "dropdown-item font-weight-bold" : "dropdown-item"}>Thu {working_hours.thursday_open || restaurant.same_hours ? working_hours.thursday[0].open.toUpperCase() + ' - ' + working_hours.thursday[0].close.toUpperCase() : 'Closed'} {working_hours.thursday_open && working_hours.thursday[1] != undefined ? ', '+working_hours.thursday[1].open.toUpperCase() + ' - ' + working_hours.thursday[1].close.toUpperCase() : null}</a>
											<a className={day == 5 ? "dropdown-item font-weight-bold" : "dropdown-item"}>Fri {working_hours.friday_open || restaurant.same_hours ? working_hours.friday[0].open.toUpperCase() + ' - ' + working_hours.friday[0].close.toUpperCase() : 'Closed'} {working_hours.friday_open && working_hours.friday[1] != undefined ? ', '+working_hours.friday[1].open.toUpperCase() + ' - ' + working_hours.friday[1].close.toUpperCase() : null}</a>
											<a className={day == 6 ? "dropdown-item font-weight-bold" : "dropdown-item"}>Sat {working_hours.saturday_open || restaurant.same_hours ? working_hours.saturday[0].open.toUpperCase() + ' - ' + working_hours.saturday[0].close.toUpperCase() : 'Closed'} {working_hours.saturday_open && working_hours.saturday[1] != undefined ? ', '+working_hours.saturday[1].open.toUpperCase() + ' - ' + working_hours.saturday[1].close.toUpperCase() : null}</a>
											<a className={day == 0 ? "dropdown-item font-weight-bold" : "dropdown-item"}>Sun {working_hours.sunday_open || restaurant.same_hours ? working_hours.sunday[0].open.toUpperCase() + ' - ' + working_hours.sunday[0].close.toUpperCase() : 'Closed'} {working_hours.sunday_open && working_hours.sunday[1] != undefined ? ', '+working_hours.sunday[1].open.toUpperCase() + ' - ' + working_hours.sunday[1].close.toUpperCase() : null}</a>
										</div>
										<div className={restaurant.same_hours || restaurant.open_24_hours || restaurant.temporarily_closed ? "dropdown-menu p-10" : "d-none"}>
											<p className="dropdown-item">{restaurant.hours_instructions ? restaurant.hours_instructions : hours_instructions}</p>
										</div>
									</div>
								</div>
							</div>
							<div className="detail-tabs">
								<div className="row">
									<div className="col-12 col-lg-12">
										<nav>
											<div className="nav nav-tabs nav-fill" id="nav-tab1" role="tablist">
												<a className="nav-item nav-link active" id="nav-overview-tab" data-toggle="tab" href="#nav-overview" role="tab" aria-controls="nav-overview" aria-selected="true">Overview</a>
												<a className="nav-item nav-link" id="nav-events-tab" data-toggle="tab" href="#nav-events" role="tab" aria-controls="nav-events" aria-selected="false" style={events.length == 0 ? {display:'none'}:{}}>Events</a>
												<a className="nav-item nav-link" id="nav-photos-tab" data-toggle="tab" href="#nav-photos" role="tab" aria-controls="nav-photos" aria-selected="false" style={images.length == 0 ? {display:'none'}:{}}>Photos</a>
												<a className="nav-item nav-link" id="nav-reviews-tab" data-toggle="tab" href="#nav-reviews" role="tab" aria-controls="nav-reviews" aria-selected="false">Reviews</a>
												<a className="nav-item nav-link" id="nav-faq-tab" data-toggle="tab" href="#nav-faq" role="tab" aria-controls="nav-faq" aria-selected="false" style={faqs.length == 0 ? {display:'none'}:{}}>FAQ</a>
											</div>
										</nav>
										<div className="tab-content px-sm-0" id="nav-tabContent">
											<div className="tab-pane fade show active" id="nav-overview" role="tabpanel" aria-labelledby="nav-overview-tab">
												<OverviewTab that={this} restaurant={restaurant} certificates={certificates} states={states} url={url} payment_methods={payment_methods} features={features} featuresLimit={featuresLimit} />
											</div>
											<div className="tab-pane fade" id="nav-events" role="tabpanel" aria-labelledby="nav-events-tab">
												<EventTab that={this} events={events} events_fetched={events_fetched} />
											</div>
											<div className="tab-pane fade" id="nav-photos" role="tabpanel" aria-labelledby="nav-photos-tab">
												<PhotoTab that={this} images={images} restaurant_images_fetched={restaurant_images_fetched} />
											</div>
											<div className="tab-pane fade" id="nav-reviews" role="tabpanel" aria-labelledby="nav-reviews-tab">
												<ReviewTab restaurant={restaurant} restaurant_reviews={restaurant_reviews} />
											</div>
											<div className="tab-pane fade" id="nav-faq" role="tabpanel" aria-labelledby="nav-faq-tab">
												<FaqTab faqs={faqs} />
											</div>
										</div>
									</div>
								</div>
							</div>
							<div id="write-review" className={Object.keys(user).length ? "write-review" : "write-review d-none"}>
								<h5>Write a Review</h5>
								<div className="toggle review show-rw">
								<div className="input-group">
									<input type="email" id="formButton" className="form-control" placeholder={"Help other foodies by sharing your review of " + restaurant.name} />
									<div className="input-group-append">
									<button type="submit" className="btn btn-filled disabled" data-toggle="modal" data-target="#thankyou-popup">Add Your Review</button>
									</div>
								</div>
								</div>
								<div className="toggle hide-rw">
									<div className="review-dtl">
										<div className="usr-img">
											<img src={user.profile_pic ? user.profile_pic : "/static/assets/img/avatar.png"} alt="" />
										</div>
										<div className="review-point">
											<div className="rw-rate">
												<div className="rw-star">
													<div className="usr-star">
														<span onMouseEnter={() => this.setState({rating_value:1})} className={rating_value >= 1 ? "fa fa-star checked" : "fa fa-star-o"}></span>
														<span onMouseEnter={() => this.setState({rating_value:2})} className={rating_value >= 2 ? "fa fa-star checked" : "fa fa-star-o"}></span>
														<span onMouseEnter={() => this.setState({rating_value:3})} className={rating_value >= 3 ? "fa fa-star checked" : "fa fa-star-o"}></span>
														<span onMouseEnter={() => this.setState({rating_value:4})} className={rating_value >= 4 ? "fa fa-star checked" : "fa fa-star-o"}></span>
														<span onMouseEnter={() => this.setState({rating_value:5})} className={rating_value >= 5 ? "fa fa-star checked" : "fa fa-star-o"}></span>
													</div>
													<div className="usr-act">
														<div className={rating_value == 1 ? "rw-icon" : "rw-icon d-none"}><img src="/static/assets/img/details/terrible.svg" alt="" /></div>
														<div className={rating_value == 2 ? "rw-icon" : "rw-icon d-none"}><img src="/static/assets/img/details/average.svg" alt="" /></div>
														<div className={rating_value == 3 ? "rw-icon" : "rw-icon d-none"}><img src="/static/assets/img/details/normal.svg" alt="" /></div>
														<div className={rating_value == 4 ? "rw-icon" : "rw-icon d-none"}><img src="/static/assets/img/details/good.svg" alt="" /></div>
														<div className={rating_value == 5 ? "rw-icon" : "rw-icon d-none"}><img src="/static/assets/img/details/excellent.svg" alt="" /></div>
														<div className={rating_value == 0 ? "rw-act" : "rw-act d-none"}>Not Selected</div>
														<div className={rating_value == 1 ? "rw-act" : "rw-act d-none"}>Terrible</div>
														<div className={rating_value == 2 ? "rw-act" : "rw-act d-none"}>Average</div>
														<div className={rating_value == 3 ? "rw-act" : "rw-act d-none"}>Normal</div>
														<div className={rating_value == 4 ? "rw-act" : "rw-act d-none"}>Good</div>
														<div className={rating_value == 5 ? "rw-act" : "rw-act d-none"}>Excellent</div>
													</div>
													<button onClick={() => this.setState({rating_value:0})} className="btn btn-clear">Clear</button>
												</div>
												{/*<div className="add-img">
													<label htmlFor="fileUpload" className="file-upload btn btn-white"><i className="fa fa-picture-o" aria-hidden="true"></i>Add Photos
														<input id="fileUpload" type="file" />
													</label>
												</div>*/}
											</div>
											<div className="rw-text">
												<textarea 
													className="form-control msg" 
													id="message" 
													placeholder="Share details of your own expericence at this place (optional.)" 
													rows="3" 
													required
													onChange={(event) => {
														this.setState({ review_text: event.target.value });
													}}
												>
												</textarea>
											</div>
											<div className="rw-btns rounded-btn">
												<button className="btn btn-white" type="submit" id="cancel_review">Cancel</button>
												<button className="btn btn-filled ml-2" onClick={this.publishReview}>Publish Review</button>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="comments-tab" id="comments-tab">
								<div className="row">
								<div className="col-12 col-md-12">
									<nav>
									<div className="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
										<a className="nav-item nav-link active" id="nav-popular-tab" data-toggle="tab" href="#nav-popular" role="tab" aria-controls="nav-popular" aria-selected="true">Popular</a>
										<a className="nav-item nav-link" id="nav-recent-tab" data-toggle="tab" href="#nav-recent" role="tab" aria-controls="nav-recent" aria-selected="false">Recent</a>
										<a className="nav-item nav-link" id="nav-all-review-tab" data-toggle="tab" href="#nav-all-review" role="tab" aria-controls="nav-all-review" aria-selected="false">All Reviews</a>
									</div>
									</nav>
									<div className="tab-content" id="nav-tabContent">
									<div className="tab-pane fade show active" id="nav-popular" role="tabpanel" aria-labelledby="nav-popular-tab">
										{popular_reviews.map(function(review, index){
											if(review.user == null){
												return false;
											}
											return (
												<ReviewListing usefulMarked={this.usefulMarked} notUsefulMarked={this.notUsefulMarked} key={index} review={review} index={index} />
											);
										}.bind(this))}
										<span style={popular_reviews.length > 0 ? {display:'none'} : {}}>{review_fetched ? 'No reviews given yet! Be the first one to give!' : 'Fetching details...'}</span>
									</div>
									<div className="tab-pane fade" id="nav-recent" role="tabpanel" aria-labelledby="nav-recent-tab">
										{recent_reviews.map(function(review, index){
											if(review.user == null){
												return false;
											}
											return (
												<ReviewListing usefulMarked={this.usefulMarked} notUsefulMarked={this.notUsefulMarked} key={index} review={review} index={index} />
											);
										}.bind(this))}
										<span style={recent_reviews.length > 0 ? {display:'none'} : {}}>{review_fetched ? 'No reviews given yet! Be the first one to give!' : 'Fetching details...'}</span>
									</div>
									<div className="tab-pane fade" id="nav-all-review" role="tabpanel" aria-labelledby="nav-all-review-tab">
										{all_reviews.map(function(review, index){
											if(review.user == null){
												return false;
											}
											return (
												<ReviewListing usefulMarked={this.usefulMarked} notUsefulMarked={this.notUsefulMarked} key={index} review={review} index={index} />
											);
										}.bind(this))}
										<span style={all_reviews.length > 0 ? {display:'none'} : {}}>{review_fetched ? 'No reviews given yet! Be the first one to give!' : 'Fetching details...'}</span>
									</div>
									</div>
								</div>
								</div>
							</div>
						</div>
					</div>
				</section>
				<Script url="/static/assets/js/owl.carousel.min.js" onLoad={this.carouselLoaded} />
				<Footer user={user} />
				<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `${JSON.stringify(schema_json)}` }}></script>
			</main>
		);
	}
}

export default withAuth(VenueDetails, { loginRequired: false });