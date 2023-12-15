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
import { fetchCertificates, fetchMenu, fetchEvents, fetchRestaurantImages, submitReview, bookmark, fetchAdditionalDetails, markvisited, fetchSliderImages, fetchReviews, useful, not_useful } from '../lib/api/restaurant';

class EventDetails extends React.Component {
	static getInitialProps({query}) {
		const EventDetails = true;
		const event = query.event;
		const event_image = query.event_image;
		const restaurant = query.restaurant;
		return { EventDetails, event, restaurant, event_image };
	}


	async componentDidMount() {
		// fixed right map content
		var topPosition = $('.floating-div').offset().top - 10;
		var floatingDivHeight = $('.floating-div').outerHeight();
		var footerFromTop = $('footer').offset().top;
		var absPosition = footerFromTop - floatingDivHeight - 20;
		var win = $(window);
		var floatingDiv = $('.floating-div');

		win.scroll(function() {
			if (window.matchMedia('(min-width: 991px)').matches) {
				if ((win.scrollTop() > topPosition) && (win.scrollTop() < absPosition)) {
					floatingDiv.addClass('sticky');
					floatingDiv.removeClass('abs');

				} else if ((win.scrollTop() > topPosition) && (win.scrollTop() > absPosition)) {
					floatingDiv.removeClass('sticky');
					floatingDiv.addClass('abs');

				} else {
					floatingDiv.removeClass('sticky');
					floatingDiv.removeClass('abs');
				}
			}
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

	static defaultProps = {

	};

	constructor(props) {
		super(props);

		this.state = {
			user: props.user || {},
			event: props.event || {},
			event_image: props.event_image || '',
			restaurant: props.restaurant || {},
			states: [],
		};


	}

	render() {
		const {user, event, restaurant, event_image, states} = this.state;

		return (
			<main className="wrapper listing-event-detail">
				<Head>
					<title>{event.name} - 10 of The Best</title>
				</Head>
				<Header user={user} />
				<section className="detail-wrap listing-event">
					<div className="venue-top">
						<div className="container">
							<div className="row">
								<div className="col-12">
									<div className="back">
										<a href="#" className="back-link"><img src="/static/assets/img/back-arrow.svg" alt="" /></a>
									</div>
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
								<div className="col-12">
									<div className="tag-left">
										<h1>{event.name}</h1>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="listing-event-wrap">
						<div className="container">
							<div className="row">
								<div className="col-md-8 col-12">
									<div className="event-details">
										<div className="event-img">
											<img style={{width:'100%'}} src={event.image} alt="" />
										</div>
										<div className="event-desc">
											{event.description}
										</div>
									</div>
								</div>
								<div className="col-md-4 col-12">
									<div className="event-booking floating-div">
										<div className="event-lable">
											<div className="lable-info">
												<div className="lable-tags">
													<h5>Date</h5>
													<h4><Moment format="Do MMM, YYYY">{event.start_date}</Moment> - <Moment format="Do MMM, YYYY">{event.end_date}</Moment></h4>
												</div>
												{/*<div className="lable-tags">
													<h5>Time</h5>
													<h4>10:00 AM - 11:30 PM</h4>
												</div>*/}
												<div className="lable-tags">
													<h5>Event Location</h5>
													<h4>{restaurant.address}<br />{restaurant.city}, {restaurant.state} {restaurant.zip}</h4>
												</div>
											</div>
											<div className="event-location">
												<div className="map-responsive">
													<iframe src={"https://www.google.com/maps/embed/v1/place?key=AIzaSyA0s1a7phLN0iaD6-UE7m4qP-z21pH0eSc&q="+restaurant.lat+","+restaurant.long} width="100%" height="155" frameBorder="0" style={{border:"0"}}></iframe>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="row">
								<div className="col-lg-8 col-12">
									<div className="category">
										<h3>Related Events</h3>
										<div className="row">
											<div className="col-md-4 col-12 item">
												<div className="info-box">
													<div className="pic">
														<img src="/static/assets/img/home/function-1.png" alt="" />
													</div>
													<div className="inside">
														<div className="date">
															<span><img src="/static/assets/img/listing/calander.svg" /></span>
															<span className="dt">Oct 26,2019</span>
														</div>
														<h5>What to wear to melbourne cup carnival</h5>
														<a href="#" className="more-link">See more<span className="next"><img src="/static/assets/img/small-next.svg" alt="" /></span></a>
													</div>
												</div>
											</div>
											<div className="col-md-4 col-12 item">
												<div className="info-box">
													<div className="pic">
														<img src="/static/assets/img/home/function-2.png" alt="" />
													</div>
													<div className="inside">
														<div className="date">
															<span><img src="/static/assets/img/listing/calander.svg" /></span>
															<span className="dt">Oct 20,2019</span>
														</div>
														<h5>Eight Melbourne Bars with Views for Days Eight Melbourne Bars with Views for DaysEight Melbourne Bars with Views for Days</h5>
														<a href="#" className="more-link">See more<span className="next"><img src="/static/assets/img/small-next.svg" alt="" /></span></a>
													</div>
												</div>
											</div>
											<div className="col-md-4 col-12 item">
												<div className="info-box">
													<div className="pic">
														<img src="/static/assets/img/home/function-3.png" alt="" />
													</div>
													<div className="inside">
														<div className="date">
															<span><img src="/static/assets/img/listing/calander.svg" /></span>
															<span className="dt">Oct 15,2019</span>
														</div>
														<h5>Good Food & Wine Show Melbourne</h5>
														<a href="#" className="more-link">See more<span className="next"><img src="/static/assets/img/small-next.svg" alt="" /></span></a>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
				<Footer user={user} />
			</main>
		);
	}
}

export default withAuth(EventDetails, { loginRequired: false });