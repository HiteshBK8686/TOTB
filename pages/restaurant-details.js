import PropTypes from 'prop-types';
import Head from 'next/head';
import Link from 'next/link';

import Header from '../components/HomeHeader';
import Footer from '../components/HomeFooter';
import NProgress from 'nprogress';
import ReviewListing from '../components/ReviewListing';
import FaqTab from '../components/FaqTab';
import ReviewTab from '../components/ReviewTab';
import OverviewTab from '../components/OverviewTab';
import EventTab from '../components/EventTab';
import PhotoTab from '../components/PhotoTab';
import RelatedVenue from '../components/RelatedVenue';

import withAuth from '../lib/withAuth';
import notify from '../lib/notifier';
import Script from 'react-load-script';

import Carousel from "react-multi-carousel";
import { fetchRelatedPlaces, fetchRestaurantImages, submitReview, updateReview, bookmark, fetchAdditionalDetails, markvisited, fetchReviews, useful, not_useful, saveReviewImages, website_click, cellphone_click, email_click } from '../lib/api/restaurant';
import { HTML5_FMT } from 'moment';

var formData = null;

class Index extends React.Component {
	static getInitialProps({query}) {
		const slug = query.slug;
		const restaurant = query.restaurant;
		const restaurantPage = true;
		return { restaurantPage, slug, restaurant };
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
				// const additionalDetails = await fetchAdditionalDetails({restaurant_id:this.props.restaurant._id, user_id:this.props.user._id});
				fetchAdditionalDetails({restaurant_id:this.props.restaurant._id, user_id:this.props.user._id}).then(additionalDetails => {
					if(additionalDetails.review != undefined){
						this.setState({bookmarked: additionalDetails.bookmark, visited: additionalDetails.visited, reviewed: additionalDetails.reviewed, rating_value:additionalDetails.review.rating_value, review_text: additionalDetails.review.review_text, certificates: additionalDetails.certificates});
					} else{
						this.setState({bookmarked: additionalDetails.bookmark, visited: additionalDetails.visited, reviewed: additionalDetails.reviewed, certificates: additionalDetails.certificates});
					}
				});
			} else{
				// const additionalDetails = await fetchAdditionalDetails({restaurant_id:this.props.restaurant._id, user_id:0});
				fetchAdditionalDetails({restaurant_id:this.props.restaurant._id, user_id:0}).then(additionalDetails => {
					if(additionalDetails.review != undefined){
						this.setState({bookmarked: additionalDetails.bookmark, visited: additionalDetails.visited, reviewed: additionalDetails.reviewed, rating_value:additionalDetails.review.rating_value, review_text: additionalDetails.review.review_text, certificates: additionalDetails.certificates});
					} else{
						this.setState({bookmarked: additionalDetails.bookmark, visited: additionalDetails.visited, reviewed: additionalDetails.reviewed, certificates: additionalDetails.certificates});
					}
				});
			}

			if(this.state.reviewed){
				document.getElementsByClassName('toggle')[0].classList.toggle('hide-rw');
				document.getElementsByClassName('toggle')[1].classList.toggle('hide-rw');
			}

			fetchRestaurantImages({id:this.props.restaurant._id,plandetails:this.props.restaurant.plandetails}).then(restaurant_images => {
				this.setState({ images:restaurant_images.images, restaurant_image:restaurant_images.image_url, restaurant_images_fetched:1 });
			});

			fetchRelatedPlaces({city:this.props.restaurant.city}).then(related_places => {
				this.setState({ related_places:related_places }, this.relatedPlacesCarousel);
			});

			fetchReviews({restaurant_id:this.props.restaurant._id, page:this.state.review_page}).then(restaurant_reviews => {
				this.setState({ restaurant_reviews:restaurant_reviews, all_reviews:restaurant_reviews.all_reviews, recent_reviews:restaurant_reviews.recent_reviews, popular_reviews:restaurant_reviews.popular_reviews, review_fetched:1 });
			});

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
			featuresLimit: 8,
			tmpReviewImages: [],
			related_places: []
		};

		this.carouselLoaded = this.carouselLoaded.bind(this);
		this.relatedPlacesCarousel = this.relatedPlacesCarousel.bind(this);
	}

	relatedPlacesCarousel() {
		$('.venue_carousel').owlCarousel({
			loop:true,
			margin:15,
			nav:false,
			dots:true,
			center:true,
			autoplay:true,
			autoplayTimeout:1500,
			autoplayHoverPause:true,
			responsive:{
				0:{
					items:1
				},
				768:{
					items:2
				},
				1200:{
					items:3
				}
			}
		});	
	}

	carouselLoaded() {

		// photos tab popup
		var totalItems = $('#gallery-thumb').children().find('.carousel-item').length;
		var currentIndex = $('div.active').index() + 1;
		$('#gallery-thumb').on('slid.bs.carousel', function() {
			currentIndex = $('div.active').index() + 1;
			$('.num').html('' + currentIndex + '/' + totalItems + '');
		});

		$('#photoModal').on('shown.bs.modal', function(e) {
			$('.num').html('' + currentIndex + '/' + totalItems + '');
		});
	}

	publishReview = async(event) => {
		var {rating_value, review_text, restaurant, user} = this.state;

		event.preventDefault();
		try {
			const review = await submitReview({rating_value:rating_value, review_text:review_text,user_id:user._id,restaurant_id:restaurant._id});
			if(formData == null){
				formData = new FormData();
			}
			formData.append('review_id',review._id);
			const image = await saveReviewImages(formData);
			this.setState({rating_value:0,review_text:''});
		} catch (err) {
			notify(err);
		}
	};

	updateReview = async(event) => {
		var {rating_value, review_text, restaurant, user} = this.state;
		event.preventDefault();
		try {
			const review = await updateReview({rating_value:rating_value, review_text:review_text,user_id:user._id,restaurant_id:restaurant._id});
		} catch (err) {
			notify(err);
		}
	};

	bookmarkRestaurant = async(event) => {
		var {restaurant, user, bookmarked} = this.state;
		event.preventDefault();
		if(Object.keys(user).length){
			try {
				this.setState({bookmarked:!bookmarked});
				const boomark = await bookmark({user_id:user._id,restaurant_id:restaurant._id});
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
				const markasvisited = await markvisited({user_id:user._id,restaurant_id:restaurant._id});
				this.setState({visited:!visited});
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

	uploadFile = async(event) => {
		// Initiate blank formdata object
		formData = new FormData();
		document.getElementById("overlay").style.display = "block";
		var tmpReviewImages = this.state.tmpReviewImages;

		// loop through all the files selected via client and append them one by one into formdata. Once we do that, we'll create objectURL using URL class and add them into tmpReviewImages array so that we can display preview to the user as soon as user uploads file
		for (var i = 0; i < event.target.files.length; i++) {
			formData.append('files',event.target.files[i]);
			tmpReviewImages.push(URL.createObjectURL(event.target.files[i]));
		}
		this.setState({tmpReviewImages});
		console.log(tmpReviewImages);
		formData.append('user_id',this.state.user._id);
  		document.getElementById("overlay").style.display = "none";
	};

	render() {
		const { related_places, faqs, user, restaurant, certificates, menu, currentStep, events, payment_methods, images, rating_value, review_text, bookmarked, visited, additionalDetails, reviewed, states, restaurant_reviews, all_reviews, recent_reviews, popular_reviews, review_fetched, restaurant_images_fetched, events_fetched, restaurant_image, event_image, featuresLimit, tmpReviewImages } = this.state;
		const responsive = {
			superLargeDesktop: {
				// the naming can be any, depends on you.
				breakpoint: { max: 4000, min: 3000 },
				items: 1,
			},
			desktop: {
				breakpoint: { max: 3000, min: 1024 },
				items: 1,
			},
			tablet: {
				breakpoint: { max: 1024, min: 464 },
				items: 1,
			},
			mobile: {
				breakpoint: { max: 464, min: 0 },
				items: 1,
			},
		};

		const CustomDot = ({
			index,
			onClick,
			active
		}) => {
			return (
				<div 
				style={active ? {margin:'4px',cursor:'pointer',borderRadius:'5px',backgroundPosition: 'center',width:'48px',height:'48px',overflow: 'hidden',backgroundImage:'url('+ slider_images[index].image+')'} : {margin:'4px',cursor:'pointer',borderRadius:'5px',backgroundPosition: 'center',width:'48px',height:'48px',overflow: 'hidden',backgroundImage:'url('+ slider_images[index].image+')',opacity:'0.7'}} 
				onClick={e => {
					onClick();
					e.preventDefault();
				}}>
					{/*<img 
						onClick={e => {
						onClick();
						e.preventDefault();
						}}
						style={active ? {cursor:'pointer',borderRadius:'5px',maxWidth:'100%',maxHeight:'100%',margin:'4px'} : {cursor:'pointer',borderRadius:'5px',maxWidth:'100%',maxHeight:'100%',margin:'4px',opacity:'0.1',opacity:'0.7'}} 
						className="d-block" src={slider_url + slider_images[index].image} 
					/>*/}
				</div>
			);
		};
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

		var schema_json = {
			"@context": "http://schema.org",
			"@type": "Restaurant"
		};
		schema_json.image = `${process.env.SITE_URL}/static/assets/img/logo.svg`;
		schema_json.priceRange = `${restaurant.avg_cost ? '$'+restaurant.avg_cost : 'NA'}`;
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

		schema_json.servesCuisine = [];

		JSON.parse(JSON.stringify(restaurant.cuisine_types)).map(function(el){
			schema_json.servesCuisine.push(el.name);
		});

		schema_json.telephone = `${restaurant.contact || 'NA'}`;
		schema_json.hasMap = `https://www.google.com/maps?ll=${restaurant.lat},${restaurant.long}`;

		return (
			<main className="wrapper detail-page">
				<Head>
					<title>{restaurant.name}, {restaurant.city} - 10 of The Best</title>
					<meta name="title" content={restaurant.name + ", " + restaurant.city + " - 10 of The Best"} />
					<meta name="description" content={restaurant.description.split('.')[0] + ". Explore unbiased reviews, rating and relevant information about " + restaurant.name} />
				
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
				<section className="dark-sec"></section>
				<section className="detail-wrap">
					<div className="container">
					<div className="dark-menu">
						<ul className="breadcrumb">
							<li>
								<a>Home</a>
							</li>
							<li>
								<a>{states[restaurant.state]}</a>
							</li>
							<li>
								<a>{restaurant.city}</a>
							</li>
							<li className="active">
								<a>{restaurant.name}</a>
							</li>
						</ul>
					</div>
					<div className="row">
						<div className="col-xs-12 col-sm-6">
							<div className="tag-left">
								<h1>{restaurant.name}</h1>
								<p>{restaurant.restaurant_types.map(function(el){
								return el.name;
								}).join(' · ')}</p>
							</div>
						</div>
						<div className="col-xs-12 col-sm-6">
							<div className="tag-rgt">
								<button id="rate_restaurant" className="btn btn-white ml-2" type="submit"><i className={reviewed ? "fa fa-star" : "fa fa-star-o"} aria-hidden="true"></i><span className="hide">Rate</span></button>
								<button onClick={this.bookmarkRestaurant} className="btn btn-white ml-2" type="submit"><i className={bookmarked ? "fa fa-bookmark" : "fa fa-bookmark-o"} aria-hidden="true"></i><span className="hide">Bookmark</span></button>
								<button onClick={this.visitedRestaurant} className="btn btn-white ml-2" type="submit"><i className={visited ? "fa fa-check" : "fa fa-map-marker"} aria-hidden="true"></i><span className="hide">Visited</span></button>
							</div>
						</div>
					</div>
					{/*Carousel Wrapper*/}
					<Carousel customDot={<CustomDot />} ssr={true} infinite={true} showDots={true} arrows={true} containerclassName="carousel-with-custom-dots" responsive={responsive}>
						{slider_images.map(function(image, index){
							return (
								<div key={index}>
									<img className="d-block w-100 react-carousel-image" style={{borderRadius:'14px'}} src={image.image} alt="First slide" />
									<div className="overlay"></div>
								</div>
							);
						})}
					</Carousel>
					{/*/.Carousel Wrapper*/}
					<div className="rate-info">
						<div className="info rating">
							<h5><i className="fa fa-star" aria-hidden="true"></i>{restaurant.rating != undefined ? restaurant.rating : '0'}</h5>
							<p>{(restaurant.total_reviews != undefined && restaurant.total_reviews > 50) ? '50+ Ratings' : '< 50 Ratings'}</p>
						</div>
						{restaurant.cuisine_types.length > 0 && 
							<div className="info">
								<p>Cuisines</p>
								<div className="dropdown cuisines-dropdown">
									{restaurant.cuisine_types.length > 1 &&
										<button type="button" className="btn dropdown-toggle" data-toggle="dropdown">
											{restaurant.cuisine_types[0].name} & {restaurant.cuisine_types.length-1} more
										</button>
									}
									{restaurant.cuisine_types.length == 1 &&
										<h5>
											{restaurant.cuisine_types[0].name}
										</h5>
									}
									<div className={restaurant.cuisine_types.length == 1 ? "d-none" : "dropdown-menu"}>
										{restaurant.cuisine_types.map(function(el,i){
											if(i != 0){
												return (
													<a key={i} className="dropdown-item">{el.name}</a>
												);
											}
										})}
									</div>
								</div>
							</div>
						}
						<div className="info" style={restaurant.avg_cost ? {} : {display:'none'}}>
							<p>Average Cost</p>
							<h5>${restaurant.avg_cost} - Per Person (approx.)</h5>
						</div>
						<div className="info" style={{marginRight:'0px'}}>
							<p>Working Hours</p>
							<div className="dropdown">
								<button type="button" className="btn dropdown-toggle" data-toggle="dropdown">
									Today {today_shift_one} {today_shift_two ? ', ' + today_shift_two : null}
								</button>
								<div className={!restaurant.same_hours && !restaurant.open_24_hours && !restaurant.temporarily_closed ? "dropdown-menu" : "d-none"}>
									<a className={day == 1 ? "dropdown-item font-weight-bold" : "dropdown-item"}><strong>Mon</strong>{working_hours.monday_open || restaurant.same_hours ? working_hours.monday[0].open.toUpperCase() + ' - ' + working_hours.monday[0].close.toUpperCase() : 'Closed'} {working_hours.monday_open && working_hours.monday[1] != undefined ? ', '+working_hours.monday[1].open.toUpperCase() + ' - ' + working_hours.monday[1].close.toUpperCase() : null}</a>
									<a className={day == 2 ? "dropdown-item font-weight-bold" : "dropdown-item"}><strong>Tue</strong> {working_hours.tuesday_open || restaurant.same_hours ? working_hours.tuesday[0].open.toUpperCase() + ' - ' + working_hours.tuesday[0].close.toUpperCase() : 'Closed'} {working_hours.tuesday_open && working_hours.tuesday[1] != undefined ? ', '+working_hours.tuesday[1].open.toUpperCase() + ' - ' + working_hours.tuesday[1].close.toUpperCase() : null}</a>
									<a className={day == 3 ? "dropdown-item font-weight-bold" : "dropdown-item"}><strong>Wed</strong> {working_hours.wednesday_open || restaurant.same_hours ? working_hours.wednesday[0].open.toUpperCase() + ' - ' + working_hours.wednesday[0].close.toUpperCase() : 'Closed'} {working_hours.wednesday_open && working_hours.wednesday[1] != undefined ? ', '+working_hours.wednesday[1].open.toUpperCase() + ' - ' + working_hours.wednesday[1].close.toUpperCase() : null}</a>
									<a className={day == 4 ? "dropdown-item font-weight-bold" : "dropdown-item"}><strong>Thu</strong> {working_hours.thursday_open || restaurant.same_hours ? working_hours.thursday[0].open.toUpperCase() + ' - ' + working_hours.thursday[0].close.toUpperCase() : 'Closed'} {working_hours.thursday_open && working_hours.thursday[1] != undefined ? ', '+working_hours.thursday[1].open.toUpperCase() + ' - ' + working_hours.thursday[1].close.toUpperCase() : null}</a>
									<a className={day == 5 ? "dropdown-item font-weight-bold" : "dropdown-item"}><strong>Fri</strong> {working_hours.friday_open || restaurant.same_hours ? working_hours.friday[0].open.toUpperCase() + ' - ' + working_hours.friday[0].close.toUpperCase() : 'Closed'} {working_hours.friday_open && working_hours.friday[1] != undefined ? ', '+working_hours.friday[1].open.toUpperCase() + ' - ' + working_hours.friday[1].close.toUpperCase() : null}</a>
									<a className={day == 6 ? "dropdown-item font-weight-bold" : "dropdown-item"}><strong>Sat</strong> {working_hours.saturday_open || restaurant.same_hours ? working_hours.saturday[0].open.toUpperCase() + ' - ' + working_hours.saturday[0].close.toUpperCase() : 'Closed'} {working_hours.saturday_open && working_hours.saturday[1] != undefined ? ', '+working_hours.saturday[1].open.toUpperCase() + ' - ' + working_hours.saturday[1].close.toUpperCase() : null}</a>
									<a className={day == 0 ? "dropdown-item font-weight-bold" : "dropdown-item"}><strong>Sun</strong> {working_hours.sunday_open || restaurant.same_hours ? working_hours.sunday[0].open.toUpperCase() + ' - ' + working_hours.sunday[0].close.toUpperCase() : 'Closed'} {working_hours.sunday_open && working_hours.sunday[1] != undefined ? ', '+working_hours.sunday[1].open.toUpperCase() + ' - ' + working_hours.sunday[1].close.toUpperCase() : null}</a>
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
										<a className="nav-item nav-link" id="nav-menu-tab" data-toggle="tab" href="#nav-menu" role="tab" aria-controls="nav-menu" aria-selected="false" style={categories.length == 0 ? {display:'none'}:{}}>Menu</a>
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
									<div className="tab-pane fade" id="nav-menu" role="tabpanel" aria-labelledby="nav-menu-tab">
										<div className="tab-text menu-tab">
											<div className="container-fluid">
												<div className="row">
													<div className="col-md-3 col-12 bord-rt pd-0">
														<ul className="nav nav-pills flex-column" id="menuTab" role="tablist">
														{categories.map(function(m, index){
															return (
																<li key={index} className="nav-item" onClick={() => this.setState({currentStep: index})}>
																	<a key={index} className={index == currentStep ? "nav-link active" : "nav-link"} id={index+"-tab"} data-toggle="tab" href={"#"+index} role="tab" aria-controls={index} aria-selected="true">{m.name}</a>
																	{m.sub_categories.map(function(sub_category, sub_category_index){
																	return (
																		<p key={sub_category_index} className="sub-menu">{sub_category.name}</p>
																	);
																	})}
																</li>
															);
														}.bind(this))}
														</ul>
													</div>
													<div className="col-md-9 col-12">
													<div className="tab-content" id="menuTabContent">
													{categories.map(function(m, index){
														return (
															<div key={index} className={index == currentStep ? "tab-pane fade show active" : "tab-pane fade"} id={index} role="tabpanel" aria-labelledby={index+"-tab"}>
																<h2>{m.name}</h2>
																{m.sub_categories.map(function(sub_category, sub_category_index){
																return (
																	<div key={sub_category_index} className="sub-menu-info pd-bt">
																		<div className="title">
																			<h5>{sub_category.name}</h5>
																			<p>{sub_category.items.length} Items</p>
																		</div>
																		<div className="sub-list">
																			<ul>
																			{sub_category.items.map(function(item, item_index){
																				if(item.image){
																					return (
																						<li key={item_index} className="food-detail">
																							<div className="food-img">
																								<img src={item.image} alt="" />
																							</div>
																							<div className="food-info">
																								<h5>{item.name}</h5>
																								<p>{item.description}</p>
																							</div>
																							<div className="price">${item.regular_price}</div>
																						</li>
																					);
																				} else{
																					return (
																						<li key={item_index}>
																							{item.name}<span className="price">${item.regular_price}</span>
																						</li>
																					);
																				}
																			})}
																			</ul>
																		</div>
																	</div>
																);
																})}
															</div>
														);
													})}
													</div>
												</div>
												</div>
											</div>
										</div>
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
										<div className="add-img">
											<label htmlFor="file" className="file-upload btn btn-white"><i className="fa fa-picture-o" aria-hidden="true"></i>Add Photos
												<input id="file" onChange={this.uploadFile} type="file" />
											</label>
										</div>
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
											value={review_text || ''}
										>
										</textarea>
									</div>
									<div className="fd-img">
										{tmpReviewImages.map(function(tmpReviewImage,i){
											return (
												<span key={i}><img style={{width:'48px',height:'48px'}} src={tmpReviewImage} alt="" /></span>
											);
										})}
									</div>
									<div className="rw-btns rounded-btn">
										<button className={reviewed ? "d-none" : "btn btn-white"} type="submit" id="cancel_review">Cancel</button>
										<button className={reviewed ? "d-none" : "btn btn-filled ml-2"} onClick={this.publishReview}>Publish Review</button>
										<button className={reviewed ? "btn btn-filled ml-2" : "d-none"} onClick={this.updateReview}>Update Review</button>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="related_venues">
						<h5 className={related_places.length > 0 ? "text-uppercase" : "d-none"}>Related Places </h5>
						<RelatedVenue related_places={related_places} />
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
				</section>
				<Script url="/static/assets/js/owl.carousel.min.js" onLoad={this.carouselLoaded} />
				<Footer user={user} />
				{/* <!-- view photo gallery  --> */}
				<div id="photosModal" className="gallery-view modal">
					<div className="modal-content">
						<button type="button" className="close" data-dismiss="modal">
							<span className="close-bg"><img src="/static/assets/img/close.svg" /></span>
						</button>
						{/* <!--Carousel Wrapper--> */}
						<div id="gallery-thumb" className="carousel slide carousel-fade carousel-thumbnails" data-ride="carousel">
							{/* <!--Slides--> */}
							<div className="carousel-inner" role="listbox">
								{images.map(function(image, index){
                                    return(
										<div key={index} className={index == 0 ? "carousel-item active" : "carousel-item"}>
											<img className="" src={image.image} />
										</div>
                                    );
                                })}
							</div>
							{/* <!--Slides--> */}
							{/* <!--Controls--> */}
							<a className="carousel-control-prev" href="#gallery-thumb" role="button" data-slide="prev">
								<span className="carousel-control-prev-icon" aria-hidden="true"></span>
								<span className="sr-only">Previous</span>
							</a>
							<a className="carousel-control-next" href="#gallery-thumb" role="button" data-slide="next">
								<span className="carousel-control-next-icon" aria-hidden="true"></span>
								<span className="sr-only">Next</span>
							</a>
							{/* <!--Controls--> */}
							<ol className="carousel-indicators">
								{images.map(function(image, index){
                                    return(
										<li key={index} data-target="#gallery-thumb" data-slide-to={index} className={index == 0 ? "active" : ""}><img className="d-block " src={image.image} className="img-fluid" /></li>
                                    );
                                })}
							</ol>
						</div>
						{/* <!--/.Carousel Wrapper--> */}
					</div>
				</div>
				<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `${JSON.stringify(schema_json)}` }}></script>
				{/* <!-- view photo gallery  --> */}
			</main>
		);
	}
}

export default withAuth(Index, { loginRequired: false });