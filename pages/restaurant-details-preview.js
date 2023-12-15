import PropTypes from 'prop-types';
import Link from 'next/link';
import Head from 'next/head';
import Moment from 'react-moment';
import ShowMoreText from 'react-show-more-text';
import Masonry from 'react-masonry-css';

import Header from '../components/HomeHeader';
import Footer from '../components/HomeFooter';
import NProgress from 'nprogress';
import classNames from "classnames";

import withAuth from '../lib/withAuth';
import notify from '../lib/notifier';

import Carousel from "react-multi-carousel";
import { fetchCertificates, fetchMenu, fetchEvents, fetchRestaurantImages, submitReview, updateReview, bookmark, fetchAdditionalDetails, markvisited, fetchSliderImages, fetchReviews, useful, not_useful, saveReviewImages, website_click, cellphone_click, email_click } from '../lib/api/restaurant';

var formData;

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

			fetchRestaurantImages({id:this.props.restaurant._id}).then(restaurant_images => {
				this.setState({ images:restaurant_images.images, restaurant_image:restaurant_images.image_url, restaurant_images_fetched:1 });
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
			tmpReviewImages: []
		};


	}

	render() {
		const { faqs, user, restaurant, certificates, menu, currentStep, events, images, rating_value, review_text, bookmarked, visited, additionalDetails, reviewed, states, restaurant_reviews, all_reviews, recent_reviews, popular_reviews, review_fetched, restaurant_images_fetched, events_fetched, restaurant_image, event_image, featuresLimit, tmpReviewImages } = this.state;
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
				var hours_instructions = restaurant.hours_instructions || false;
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
				var hours_instructions = restaurant.hours_instructions || false;
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
        if(!slider_images.length){
            slider_images[0] = {image:'https://totb-data.s3-ap-southeast-2.amazonaws.com/static/1140x312.png'};
            slider_images[1] = {image:'https://totb-data.s3-ap-southeast-2.amazonaws.com/static/1140x312.png'};
        }
		var slider_url = restaurant.slider_url;
		var slider_thumb_url = restaurant.slider_thumb_url;

		return (
			<main className="wrapper detail-page">
				<Head>
					<title>{restaurant.name} - 10 of The Best</title>
				</Head>
				{/* <Header user={user} /> */}
				<section className="dark-sec"></section>
				<section className="detail-wrap">
					<div className="container">
					<div className="dark-menu">
						<ul className="breadcrumb">
							<li><a href="#">Home</a></li>
							<li><a href="#">{states[restaurant.state]}</a></li>
							<li><a href="#">{restaurant.city}</a></li>
							<li className="active"><a href="#">{restaurant.name}</a></li>
						</ul>
					</div>
					<div className="row">
						<div className="col-xs-12 col-sm-6">
							<div className="tag-left">
								<h1>{restaurant.name}</h1>
								<p>{restaurant.restaurant_types.map(function(el){
								return el.name;
								}).join(' · ')}<span className={restaurant.restaurant_types.length ? 'd-none':''}>[Restaurant Types will be displayed here]</span></p>
							</div>
						</div>
						<div className="col-xs-12 col-sm-6">
							<div className="tag-rgt">
								<button className="btn btn-white ml-2" type="submit"><i className="fa fa-star-o" aria-hidden="true"></i><span className="hide">Rate</span></button>
								<button className="btn btn-white ml-2" type="submit"><i className="fa fa-bookmark-o" aria-hidden="true"></i><span className="hide">Bookmark</span></button>
								<button className="btn btn-white ml-2" type="submit"><i className="fa fa-check" aria-hidden="true"></i><span className="hide">Visited</span></button>
							</div>
						</div>
					</div>
					{/*Carousel Wrapper*/}
					<Carousel customDot={<CustomDot />} ssr={true} infinite={true} showDots={true} arrows={true} containerclassName="carousel-with-custom-dots" itemClass="carousel-item" responsive={responsive}>
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
						<div className="info">
							<p>Cuisines</p>
							<h5>{restaurant.cuisine_types.map(function(el){
								return el.name;
								}).join(', ')}<span className={restaurant.cuisine_types.length ? 'd-none':''}>[Cuisines Types will be displayed here]</span>
							</h5>
						</div>
						<div className="info" style={restaurant.avg_cost ? {} : {display:'none'}}>
							<p>Average Cost</p>
							<h5>${restaurant.avg_cost} - Per Person (approx.)</h5>
						</div>
						<div className="info">
							<p>Working Hours</p>
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
								<a className="nav-item nav-link" id="nav-menu-tab" data-toggle="tab" href="#nav-menu" role="tab" aria-controls="nav-menu" aria-selected="false">Menu</a>
								<a className="nav-item nav-link" id="nav-events-tab" data-toggle="tab" href="#nav-events" role="tab" aria-controls="nav-events" aria-selected="false">Events</a>
								<a className="nav-item nav-link" id="nav-photos-tab" data-toggle="tab" href="#nav-photos" role="tab" aria-controls="nav-photos" aria-selected="false">Photos</a>
								<a className="nav-item nav-link" id="nav-reviews-tab" data-toggle="tab" href="#nav-reviews" role="tab" aria-controls="nav-reviews" aria-selected="false">Reviews</a>
								<a className="nav-item nav-link" id="nav-faq-tab" data-toggle="tab" href="#nav-faq" role="tab" aria-controls="nav-faq" aria-selected="false">FAQ</a>
							</div>
							</nav>
							<div className="tab-content px-sm-0" id="nav-tabContent">
							<div className="tab-pane fade show active" id="nav-overview" role="tabpanel" aria-labelledby="nav-overview-tab">
								<div className="tab-text overview">
									<div className="container-fluid">
										<div className="row">
											<div className="col-12 bord-btm">
												<div className="about-tab">
													<h3>About {restaurant.name}</h3>
													<p>
														<ShowMoreText
															lines={2}
															more='See more'
															less='See less'
															anchorClass=''
															expanded={false}
														>
															{restaurant.description} 
														</ShowMoreText>
													</p>
													<div className="certificate">
														{certificates.map(function(certificate, index){
														return (
															<h6 key={index}><span className="certi-icon"><img src="/static/assets/img/details/awward-icon.svg" alt="" /></span>{certificate.name}</h6>
														);
														})}
													</div>
												</div>
											</div>
										</div>
										<div className="row bord-btm">
											<div className="col-12 col-md-5">
												<div className="dtl-left">
													<div className="map">
														<div className="map-responsive">
															<iframe src={"https://www.google.com/maps/embed/v1/place?key=AIzaSyA0s1a7phLN0iaD6-UE7m4qP-z21pH0eSc&q="+restaurant.lat+","+restaurant.long} width="100%" height="140" frameBorder="0" style={{border:"0"}} allowFullScreen></iframe>
															<div className="map-tag">Get Direction</div>
														</div>
													</div>
													<div className="address">
														<span className="location"><i className="fa fa-map-marker" aria-hidden="true"></i></span>{restaurant.address},<br></br>
														{restaurant.city} {states[restaurant.state]} {restaurant.zip}.
														<div className="clearfix"></div>
													</div>
												</div>
											</div>
											<div className="col-12 col-md-7">
												<div className="dtl-right">
													<div className="contact">
														<a href={url == '' ? null : url}><button className={url == '' ? "btn btn-filled mr-3 disabled" : "btn btn-filled mr-3"} type="submit"><span><i className="fa fa-globe" aria-hidden="true"></i></span>Website</button></a>
														<a href={restaurant.contact_cellphone ? 'tel:' + restaurant.contact_cellphone : null}><button className={restaurant.contact_cellphone == '' ? "btn btn-filled mr-3 disabled" : "btn btn-filled mr-3"} type="submit"><span><i className="fa fa-phone" aria-hidden="true"></i></span>Phone</button></a>
														<a href={restaurant.contact_email ? 'mailto:' + restaurant.contact_email : null}><button className={restaurant.contact_email == '' ? "btn btn-filled disabled" : "btn btn-filled"} type="submit"><span><i className="fa fa-envelope-o" aria-hidden="true"></i></span>Email</button></a>
													</div>
													<div className="note">
														<span><i className="fa fa-info-circle" aria-hidden="true"></i></span>Usually replies within one day.
													</div>
													<div className="social-links">
														<a href={restaurant.facebook ? "https://www.facebook.com/"+restaurant.facebook : null} className="facebook">
															<i className="fa fa-facebook" aria-hidden="true"></i>
														</a>
														<a href={restaurant.instagram ? "https://www.instagram.com/"+restaurant.instagram : null} className="instagram">
															<i className="fa fa-instagram" aria-hidden="true"></i>
														</a>
														<a href={restaurant.twitter ? "https://www.twitter.com/"+restaurant.twitter : null} className="twitter">
															<i className="fa fa-twitter" aria-hidden="true"></i>
														</a>
													</div>
													<div className="cards">
														<h6>We accept</h6>
														<div className="card-img">
															<ul>
																<li><img src="/static/assets/img/details/Visa-light.png" alt="" /></li>
																<li><img src="/static/assets/img/details/Mastercard.png" alt="" /></li>
																<li><img src="/static/assets/img/details/Discover.png" alt="" /></li>
																<li><img src="/static/assets/img/details/American-Express.png" alt="" /></li>
															</ul>
														</div>
													</div>
												</div>
											</div>
										</div>
										<div className="row" style={features.length == 0 ? {display:'none'} : {}}>
											<div className="col-12">
												<div className="feature">
													<div className="tag-link">
														<h3>Features</h3>
													</div>
													<div className="list">
														<ul className="col-12 pl-0">
															{features.map(function(feature, index){
																if(index >= featuresLimit){
																	return null;
																}
																return (
																	<li className="col-12 col-md-3 pl-0" key={index} style={{display:'inline-block'}}><span className="icon icon-dine-drinks"></span>{feature.name}</li>
																);
															})}
														</ul>
													</div>
													{features.length > featuresLimit ? <div className="more">
														<a style={{cursor:'pointer'}} onClick={() => this.setState({featuresLimit: features.length})}>See More Features<span className="next"></span></a>
													</div> : ''}
													{features.length == featuresLimit ? <div className="more">
														<a style={{cursor:'pointer'}} onClick={() => this.setState({featuresLimit: 8})}>See Less Features<span className="next"></span></a>
													</div> : ''}
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="tab-pane fade" id="nav-menu" role="tabpanel" aria-labelledby="nav-menu-tab">
								<div className="tab-text menu-tab">
									<div className="container-fluid">
										<div className={categories.length > 0 ? 'row' : 'd-none'}>
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
																			{/*
																			<li className="img-detail">
																				<div className="food-img">
																				<img src="/static/assets/img/details/food-1.png" alt="" />
																				</div>
																				<div className="food-info">
																				<h5>Espresso</h5>
																				<p>Kale and seasonal greens topped w/ sauteed corn, edamame, caramalised onion, pickled cauliflower, golden sultana, toasted pumpkin and sunflower seeds cripsy.</p>
																				</div>
																				<div className="price">$20</div>
																			</li>
																			*/}
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
										<span style={categories.length > 0 ? {display:'none'} : {paddingLeft:'10px',paddingTop:'25px',paddingBottom:'25px',display:'block'}}>Restaurant has no menu!</span>
									</div>
								</div>
							</div>
							<div className="tab-pane fade" id="nav-events" role="tabpanel" aria-labelledby="nav-events-tab">
								<div className="tab-text event-tab">
									<div className="container-fluid">
										{events.map(function(event, index){
											return (
											<div key={index} className="sub-event">
												<div className="row">
													<div className="col-12 col-md-4">
													<div className="event-img">
														<img src={event.image} alt="img" className="img-fluid" />
													</div>
													</div>
													<div className="col-12 col-md-8">
														<div className="event-info">
															<Link href={"/event/"+event._id}>
																<a><h5>{event.name}</h5></a>
															</Link>
															<p>
																<ShowMoreText
																	lines={5}
																	more='See more'
																	less='See less'
																	anchorClass=''
																	expanded={false}
																>
																	{event.description} 
																</ShowMoreText>
															</p>
															<div className="date-time">
															<div className="date">
																<span><i className="fa fa-calendar-o" aria-hidden="true"></i></span> <Moment format="Do MMM, YYYY">{event.start_date}</Moment> - <Moment format="Do MMM, YYYY">{event.end_date}</Moment>
															</div>
															{/*<div className="time">
																<span><i className="fa fa-clock-o" aria-hidden="true"></i></span>10:20 AM - 12:00 PM
															</div>*/}
															</div>
														</div>
													</div>
												</div>
											</div>
											);
										})}	
										<span style={events.length > 0 ? {display:'none'} : {}}>{events_fetched ? 'Restaurant has no events!' : 'Fetching events...'}</span>
									</div>
								</div>
							</div>
							<div className="tab-pane fade" id="nav-photos" role="tabpanel" aria-labelledby="nav-photos-tab">
								<div className="tab-text photos-tab">
									<div className="container-fluid">
										<div style={images.length > 0 ? {} : {display:'none'}} className="photos">
											<div className="row">
												<div className="col-12">
												<Masonry
													breakpointCols={{default: 4}}
													className="my-masonry-grid"
													columnClassName="my-masonry-grid_column"
												>
													{images.map(function(image, index){
														return(
															<div key={index} className="img-box">
																<img style={{marginBottom:'10px'}} src={image.image} alt="" />
															</div>
														);
													})}
												</Masonry>
												</div>
											</div>
											{/*<div className="load-more">
												<div className="more-img">
												<a href="#" id="load">Load More<span><i className="fa fa-angle-down" aria-hidden="true"></i></span></a>
												200+ Photos
												</div>
											</div>*/}
										</div>
										<span style={images.length > 0 ? {display:'none'} : {paddingLeft:'10px',paddingTop:'25px',paddingBottom:'25px',display:'block'}}>{restaurant_images_fetched ? 'Restaurant has no images!' : 'Fetching images...'}</span>
									</div>
								</div>
							</div>
							<div className="tab-pane fade" id="nav-reviews" role="tabpanel" aria-labelledby="nav-reviews-tab">
								<div className="tab-text review-tab">
								<div className="container-fluid">
									<div className="rw-box">
									<div className="row">
										<div className="col-12 col-md-6">
										<div className="rev-text">
											<h5>Customer Reviews & Ratings</h5>
											<div className="star">
											<span className="point">{restaurant_reviews.avg_rating}</span>
											<span className={restaurant_reviews.rating >= 1 ? "fa fa-star checked" : "fa fa-star-o"}></span>
											<span className={restaurant_reviews.rating >= 2 ? "fa fa-star checked" : "fa fa-star-o"}></span>
											<span className={restaurant_reviews.rating >= 3 ? "fa fa-star checked" : "fa fa-star-o"}></span>
											<span className={restaurant_reviews.rating >= 4 ? "fa fa-star checked" : "fa fa-star-o"}></span>
											<span className={restaurant_reviews.rating >= 5 ? "fa fa-star checked" : "fa fa-star-o"}></span>
											<p>{restaurant_reviews.total_reviews} Rating</p>
											</div>
											<div className="clearfix"></div>
											<p className="rate-text">Take a look at verified ratings & reviews of {restaurant.name} posted by our users.</p>
											<div className="all-rev">
											<a style={{cursor:'pointer'}} id="go-comments-tab">See All {restaurant_reviews.total_reviews} Reviews</a>
											</div>
										</div>
										</div>
										<div className="col-12 col-md-6">
										<div className="rev-icon">
											<div className="rate-bar">
											<div className="pb-icon"><img src="/static/assets/img/details/excellent.svg" alt="" /></div>
											<div className="pb-star">5 Star</div>
											<div className="pn-bar">
												<div className="progress">
												<div className="progress-bar" style={{width:(restaurant_reviews.five_star*100)/restaurant_reviews.total_reviews+'%'}}></div>
												</div>
												<div className="pb-label">Excellent</div>
											</div>
											<div className="pb-percent">{restaurant_reviews.five_star}</div>
											<div className="clearfix"></div>
											</div>
										</div>
										<div className="rev-icon">
											<div className="rate-bar">
											<div className="pb-icon"><img src="/static/assets/img/details/good.svg" alt="" /></div>
											<div className="pb-star">4 Star</div>
											<div className="pn-bar">
												<div className="progress">
												<div className="progress-bar" style={{width:(restaurant_reviews.four_star*100)/restaurant_reviews.total_reviews+'%'}}></div>
												</div>
												<div className="pb-label">Good</div>
											</div>
											<div className="pb-percent">{restaurant_reviews.four_star}</div>
											<div className="clearfix"></div>
											</div>
										</div>
										<div className="rev-icon">
											<div className="rate-bar">
											<div className="pb-icon"><img src="/static/assets/img/details/normal.svg" alt="" /></div>
											<div className="pb-star">3 Star</div>
											<div className="pn-bar">
												<div className="progress">
												<div className="progress-bar" style={{width:(restaurant_reviews.three_star*100)/restaurant_reviews.total_reviews+'%'}}></div>
												</div>
												<div className="pb-label">Normal</div>
											</div>
											<div className="pb-percent">{restaurant_reviews.three_star}</div>
											<div className="clearfix"></div>
											</div>
										</div>
										<div className="rev-icon">
											<div className="rate-bar">
											<div className="pb-icon"><img src="/static/assets/img/details/average.svg" alt="" /></div>
											<div className="pb-star">2 Star</div>
											<div className="pn-bar">
												<div className="progress">
												<div className="progress-bar normal" style={{width:(restaurant_reviews.two_star*100)/restaurant_reviews.total_reviews+'%'}}></div>
												</div>
												<div className="pb-label">Average</div>
											</div>
											<div className="pb-percent">{restaurant_reviews.two_star}</div>
											<div className="clearfix"></div>
											</div>
										</div>
										<div className="rev-icon">
											<div className="rate-bar">
											<div className="pb-icon"><img src="/static/assets/img/details/terrible.svg" alt="" /></div>
											<div className="pb-star">1 Star</div>
											<div className="pn-bar">
												<div className="progress">
												<div className="progress-bar terrible" style={{width:(restaurant_reviews.one_star*100)/restaurant_reviews.total_reviews+'%'}}></div>
												</div>
												<div className="pb-label">Terrible</div>
											</div>
											<div className="pb-percent">{restaurant_reviews.one_star}</div>
											<div className="clearfix"></div>
											</div>
										</div>
										</div>
									</div>
									</div>
								</div>
								</div>
							</div>
							<div className="tab-pane fade" id="nav-faq" role="tabpanel" aria-labelledby="nav-faq-tab">
							<div className="tab-text faq-tab">
								<div className="container-fluid">
									<div style={faqs.length > 0 ? {} : {display:'none'}} className="faq_detail">
										<div className="row justify-content-center">
											<div className="col-12 col-offset-2 col-lg-8">
												<div className="faq_accrodian_tabs">
													<div id="accordion_tab" className="myaccordion">
														{faqs.map(function(faq, index){
															return (
																<div key={index} className="card faq_card">
																	<div className="card-header collapsed" id="heading1" data-toggle="collapse" data-target="#collapse1" aria-expanded="false" aria-controls="collapse1">
																		<h5>
																			{faq.question}
																		</h5>
																		<span className="toggle-arrow">
																		<img src="/static/assets/img/details/plus-icon.svg" className="accordian-icon" alt="img" />
																		</span>
																	</div>
																	<div id="collapse1" className="collapse" aria-labelledby="heading1" data-parent="#accordion_tab" >
																		<div className="card-body pt-0">
																			<p>{faq.answer}</p>
																		</div>
																	</div>
																</div>
															);
														})}
													</div>
												</div>
											</div>
										</div>
									</div>
									<span style={faqs.length > 0 ? {display:'none'} : {paddingLeft:'10px',paddingTop:'25px',paddingBottom:'25px',display:'block'}}>Restaurant has no FAQs!</span>
								</div>
							</div>
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
												<input id="file" type="file" />
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
												<span><img style={{width:'48px',height:'48px'}} src={tmpReviewImage} alt="" /></span>
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
								
								<span>Reviews will be displayed here!</span>
							</div>
							<div className="tab-pane fade" id="nav-recent" role="tabpanel" aria-labelledby="nav-recent-tab">
								
								<span>Reviews will be displayed here!</span>
							</div>
							<div className="tab-pane fade" id="nav-all-review" role="tabpanel" aria-labelledby="nav-all-review-tab">
								
								<span>Reviews will be displayed here!</span>
							</div>
							</div>
						</div>
						</div>
					</div>
					</div>
				</section>
				{/* <Footer user={user} /> */}
			</main>
		);
	}
}

export default withAuth(Index, { loginRequired: false });