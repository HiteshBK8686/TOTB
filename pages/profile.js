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
import Script from 'react-load-script';
import notify from '../lib/notifier';
var jwt = require("jsonwebtoken");

import Carousel from "react-multi-carousel";
import { saveProfile, saveProfileImage, fetchBookmarkedRestaurants, removeBookmark, fetchMyReviews, removeReview, profileSendOTP, verifyotp } from '../lib/api/user';

class ProfilePage extends React.Component {
	static getInitialProps({query}) {
		const ProfilePage = true;
		return { ProfilePage };
	}


	async componentDidMount() {
		if (typeof window === 'undefined') {
			return null;
		} else{
			var accessToken = window.localStorage.getItem("accessToken");
			if(!accessToken){
				window.localStorage.setItem("accessToken", jwt.sign({ id: this.props.user._id }, 'totb-front', {expiresIn: 2592000}));
			}
			var cityList = await import('./au.json');
			cityList = JSON.parse("["+JSON.stringify(cityList)+"]");
			this.setState({cityList:cityList[0]['default']});

			NProgress.start();
			try {
				fetchBookmarkedRestaurants().then(results => {
					// console.log(results);
					this.setState({bookmarkedRestaurants:results, bookmarkFetched:true});
				});

				fetchMyReviews().then(results => {
					// console.log(results);
					this.setState({myReviews:results});
				});


				$(".toggle-password").click(function() {
					// alert('1');
					$(".toggle-password").toggleClass("icon-Password-Show");
					var input = $($(".toggle-password").attr("toggle"));
					if (input.attr("type") == "text") {
						input.attr("type", "password");
					} else {
						input.attr("type", "text");
					}
				});
				
				NProgress.done();
			} catch (err) {
				this.setState({ loading: false, error: err.message || err.toString() }); // eslint-disable-line
				NProgress.done();
			}
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
			phone: this.props.user.phone,
			otp: '',
			cityList: [],
			bookmarkedRestaurants: [],
			myReviews: [],
			bookmarkFetched: false
		};
	}

	removeBookmarkRestaurant = async(i,restaurant_id) => {
		var {user} = this.state;
		try {
			const boomark = await removeBookmark({restaurant_id:restaurant_id});
			notify('Restaurant has been removed from your list!');
			var temp = this.state.bookmarkedRestaurants;
			temp.splice(i,1);
			this.setState({ bookmarkedRestaurants:temp });
		} catch (err) {
			notify(err);
		}
	};

	removeMyReview = async(i,review_id) => {
		var {user} = this.state;
		try {
			const review = await removeReview({review_id:review_id});
			notify('Your review has been removed!');
			var temp = this.state.myReviews;
			temp.splice(i,1);
			this.setState({ myReviews:temp });
		} catch (err) {
			notify(err);
		}
	};

	onProfileSubmit = (event) => {
		event.preventDefault();
		var {name, city, about, phone, website} = this.state.user;
		if (!name) {
			notify('Name is required');
			return;
		}

		if (!city) {
			notify('City is required');
			return;
		}

		if (!phone) {
			notify('Phone Number is required');
			return;
		}

		// if (!about) {
		// 	notify('About is required');
		// 	return;
		// }

		this.profileFn(this.state.user);
	};

	verifyOTP = (event) => {
		event.preventDefault();
		var {name, city, about, phone, website} = this.state.user;
		if (!name) {
			notify('Name is required');
			return;
		}

		if (!city) {
			notify('City is required');
			return;
		}

		if (!phone) {
			notify('Phone Number is required');
			return;
		}

		this.sendOTP(phone);
	};

	sendOTP = async(phone) => {
		notify('Sending OTP!');
		document.getElementById("loader_overlay").style.display = "block";
		try {
			const otpsent = await profileSendOTP({phone});
			if (typeof otpsent.message === 'undefined') {
				notify('OTP sent!');
				$("#profileVerifyOTP").modal("show");
			} else{
				notify(otpsent.message);
			}
			document.getElementById("loader_overlay").style.display = "none";
		} catch (err) {
			notify("Could not sent OTP!");
			document.getElementById("loader_overlay").style.display = "none";
		}
	};

	onVerifyOTPSubmit = async (event) => {
		event.preventDefault();
		var otp = this.state.otp;
		var phone = this.state.user.phone;
		if (!otp) {
			notify('OTP is required');
			return;
		}
		const verify = await verifyotp({phone,otp});
		if(typeof verify.message === 'undefined'){
			$("#profileVerifyOTP").modal("hide");
			notify('Saving Profile..');
			this.setState({phone});
			this.profileFn(this.state.user);
		} else{
			notify("Invalid OTP!");
		}
	};

	profileFn = async(user) => {
		document.getElementById("loader_overlay").style.display = "block";
		try {
			var userdata = {};
			userdata.name = user.name || '';
			userdata.city = user.city || '';
			userdata.about = user.about || '';
			userdata.phone = user.phone || '';
			userdata.website = user.website || '';
			userdata.email = user.email;
			userdata.newpassword = user.newpassword || '';
			console.log(this.props.user);
			await saveProfile(userdata);
			this.setState({
				user: Object.assign({}, user, { newpassword: null }),
			});
			document.getElementById("loader_overlay").style.display = "none";
			notify('Profile saved!');
		} catch (err) {
			notify(err);
			document.getElementById("loader_overlay").style.display = "none";
		}
	};

	openFileSelector = () => {
		$("#file").click();
	};

	uploadFile = async(event) => {
		document.getElementById("loader_overlay").style.display = "block";
		try{
			const formData = new FormData();

			for (var i = 0; i < event.target.files.length; i++) {
				formData.append('files',event.target.files[i]);
			}
			const user = await saveProfileImage(formData);
			this.setState({ user });
			document.getElementById("loader_overlay").style.display = "none";
		} catch (err) {
			notify(err);
			document.getElementById("loader_overlay").style.display = "none";
		}
	};

	render() {
		const {otp, phone, user, cityList, bookmarkedRestaurants, myReviews, bookmarkFetched} = this.state;
		return (
			<main className="wrapper listing-event-detail">
				<Head>
					<title>My Profile - 10 of The Best</title>
				</Head>
				<Header user={user} />
				<section className="profile-wrap top-wrap">
					<div className="venue-top">
						<div className="container">
							<div className="row">
								<div className="col-12">
									<div className="dark-menu">
										<ul className="breadcrumb">
											<li><a href="#">Home</a></li>
											<li><a href="#">Profile</a></li>
										</ul>
									</div>
								</div>
							</div>
							<div className="row">
								<div className="col-12">
									<div className="profile-info">
										<div className="usr-img">
											<img style={{height:'106px'}} src={user.profile_pic ? user.profile_pic : "/static/assets/img/avatar.png"} alt="" />
											<div className="overlay">
												<button onClick={this.openFileSelector} className="btn btn-filled">Change</button>
												<input type="file" id="file" onChange={this.uploadFile} style={{display:'none'}} />
											</div>
										</div>
										<div className="tag-left">
											<h1>{user.name}</h1>
											{user.city ? <h5><span><img src="/static/assets/img/listing/map-view.svg" alt="" /></span>{user.city}</h5> : null}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="profile-tabs">
						<div className="container">
							<div className="detail-tabs">
								<div className="row">
									<div className="col-12 col-lg-12">
									<nav>
										<div className="nav nav-tabs nav-fill scrollbar scrollbar-primary" id="profile-tab" role="tablist">
											<a className="nav-item nav-link active" id="nav-setting-tab" data-toggle="tab" href="#nav-setting" role="tab" aria-controls="nav-setting" aria-selected="true">Settings</a>
											{/*<a className="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#nav-profile" role="tab" aria-controls="nav-profile" aria-selected="false">Profiles</a>*/}
											{/*<a className="nav-item nav-link active" id="nav-notification-tab" data-toggle="tab" href="#nav-notification" role="tab" aria-controls="nav-notification" aria-selected="true">Notifications</a>*/}
											<a className="nav-item nav-link" id="nav-bookmark-tab" data-toggle="tab" href="#nav-bookmark" role="tab" aria-controls="nav-bookmark" aria-selected="false">Bookmarks</a>
											<a className="nav-item nav-link" id="nav-reviews-tab" data-toggle="tab" href="#nav-reviews" role="tab" aria-controls="nav-reviews" aria-selected="false">Reviews</a>
											{/* <a className="nav-item nav-link" id="nav-photos-tab" data-toggle="tab" href="#nav-photos" role="tab" aria-controls="nav-photos" aria-selected="false">Photos</a> */}
									  	</div>
									</nav>
									<div className="tab-content px-sm-0" id="profile-tabContent">
										<div className="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab">
											<div className="tab-text profile-block">
												<div className="container-fluid">
													<div className="row">
														<div className="col-12">
															<div className="user-content">
																Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
										<div className="tab-pane fade" id="nav-notification" role="tabpanel" aria-labelledby="nav-notification-tab">
											<div className="tab-text notification-tab">
												<div className="container-fluid">
													<div className="notification-list">
														<div className="row">
															<div className="col-12">
																<div className="msg-wrap">
																	<div className="sub-list">
																		<div className="list-icon">
																			<span><img src="/static/assets/img/profile/fish-icon.svg" /></span>
																		</div>
																		<div className="list-text">
																			<h5>Loved these two dishes—Smashed Avo 🥑 with Meredith goats cheese</h5>
																			<p>Today</p>
																		</div>
																	</div>
																</div>
																<div className="msg-wrap">
																	<div className="sub-list">
																		<div className="list-icon">
																			<span><img src="/static/assets/img/profile/fish-icon.svg" /></span>
																		</div>
																		<div className="list-text">
																			<h5>Slow and steady wins nothing! 😊 That’s why we delivered your order in 17 min, Enjoy!</h5>
																			<p>Yesterday</p>
																		</div>
																	</div>
																</div>
																<div className="msg-wrap">
																	<div className="sub-list">
																		<div className="list-icon">
																			<span><img src="/static/assets/img/profile/fish-icon.svg" /></span>
																		</div>
																		<div className="list-text">
																			<h5>The Mushroom French Toast 🍄 with truffle goats cheese, manchego and egg.</h5>
																			<p>22 Sep</p>
																		</div>
																	</div>
																</div>
																<div className="msg-wrap">
																	<div className="sub-list">
																		<div className="list-icon">
																			<span><img src="/static/assets/img/profile/fish-icon.svg" /></span>
																		</div>
																		<div className="list-text">
																			<h5>The staff were also friendly and attentive, even though it was super busy.</h5>
																			<p>15 Sep</p>
																		</div>
																	</div>
																</div>
																<div className="msg-wrap">
																	<div className="sub-list">
																		<div className="list-icon">
																			<span><img src="/static/assets/img/profile/fish-icon.svg" /></span>
																		</div>
																		<div className="list-text">
																			<h5>Loved these two dishes—Smashed Avo 🥑 with Meredith goats cheese </h5>
																			<p>14 Sep</p>
																		</div>
																	</div>
																</div>
																<div className="msg-wrap">
																	<div className="sub-list">
																		<div className="list-icon">
																			<span><img src="/static/assets/img/profile/fish-icon.svg" /></span>
																		</div>
																		<div className="list-text">
																			<h5>Slow and steady wins nothing! 😊 That’s why we delivered your order in 17 min, Enjoy!</h5>
																			<p>Today</p>
																		</div>
																	</div>
																</div>
																<div className="msg-wrap">
																	<div className="sub-list">
																		<div className="list-icon">
																			<span><img src="/static/assets/img/profile/fish-icon.svg" /></span>
																		</div>
																		<div className="list-text">
																			<h5>The Mushroom French Toast 🍄 with truffle goats cheese, manchego and egg.</h5>
																			<p>22 Sep</p>
																		</div>
																	</div>
																</div>
																<div className="msg-wrap">
																	<div className="sub-list">
																		<div className="list-icon">
																			<span><img src="/static/assets/img/profile/fish-icon.svg" /></span>
																		</div>
																		<div className="list-text">
																			<h5>Loved these two dishes—Smashed Avo 🥑 with Meredith goats cheese</h5>
																			<p>Today</p>
																		</div>
																	</div>
																</div>
																<div className="msg-wrap">
																	<div className="sub-list">
																		<div className="list-icon">
																			<span><img src="/static/assets/img/profile/fish-icon.svg" /></span>
																		</div>
																		<div className="list-text">
																			<h5>Slow and steady wins nothing! 😊 That’s why we delivered your order in 17 min, Enjoy!</h5>
																			<p>Yesterday</p>
																		</div>
																	</div>
																</div>
																<div className="msg-wrap">
																	<div className="sub-list">
																		<div className="list-icon">
																			<span><img src="/static/assets/img/profile/fish-icon.svg" /></span>
																		</div>
																		<div className="list-text">
																			<h5>The Mushroom French Toast 🍄 with truffle goats cheese, manchego and egg.</h5>
																			<p>22 Sep</p>
																		</div>
																	</div>
																</div>
																<div className="msg-wrap">
																	<div className="sub-list">
																		<div className="list-icon">
																			<span><img src="/static/assets/img/profile/fish-icon.svg" /></span>
																		</div>
																		<div className="list-text">
																			<h5>The staff were also friendly and attentive, even though it was super busy.</h5>
																			<p>15 Sep</p>
																		</div>
																	</div>
																</div>
															</div>
															<div className="col-12 load-more text-center">
																<a href="#" id="notification-load" className="load-tab">Load More<span><i className="fa fa-angle-down" aria-hidden="true"></i></span></a>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
										<div className="tab-pane fade" id="nav-bookmark" role="tabpanel" aria-labelledby="nav-bookmark-tab">
											<div className="tab-text bookmark-tab tab-wrap">
												<div className="row">
													{bookmarkedRestaurants.map(function(restaurant, i){
														if(restaurant.restaurant_details == null){
															// do nothing
														} else{
															return (
																<div key={i} index={i} className="col-lg-4 col-md-6 col-12 mark-tab">
																	<div className="location-card">
																		<div className="img-wrap">
																			<img style={restaurant.images.length == 0 ? {display:'none'} : {}} src={restaurant.images[0].image} />
																			<div className="star-lbl">
																				<span><i className="fa fa-star" aria-hidden="true"></i></span>{restaurant.avg_review}
																			</div>
																			<div className="bookmark-icon">
																				<i onClick={() => this.removeBookmarkRestaurant(i,restaurant.restaurant_id)} className="fa fa-bookmark" aria-hidden="true"></i>
																			</div>
																		</div>
																		<div className="info">
																			<Link href={"/"+ restaurant.restaurant_details.city.toLowerCase().replace(" ","-") + "/" + restaurant.restaurant_details.slug}>
																				<a>
																				<h4>{restaurant.restaurant_details.name}</h4>
																				</a>
																			</Link>
																			<div className="place-info">
																				<div className="loc">
																					<span><img src="/static/assets/img/map-view.svg" alt="img" /></span>{restaurant.restaurant_details.city}
																				</div>
																				<div className="person">
																					<span><img src="/static/assets/img/user.svg" alt="img" /></span>${restaurant.restaurant_details.avg_cost} for Per Person
																				</div>
																			</div>
																		</div>
																	</div>
																</div>
															);
														}
													}.bind(this))}
													<div className="col-12 mx-auto">
														<p className="no-text text-center" style={bookmarkedRestaurants.length == 0 && bookmarkFetched == true ? {} : {display:'none'}}>You have not bookmarked any place!</p>
														<p className="no-text text-center" style={bookmarkedRestaurants.length == 0 && bookmarkFetched == false ? {} : {display:'none'}}>Fetching details...</p>
													</div>
												</div>
											</div>
										</div>
										<div className="tab-pane fade" id="nav-reviews" role="tabpanel" aria-labelledby="nav-reviews-tab">
											<div className="tab-text reviews-tab">
												<div className="row">
													<div style={myReviews.length == 0 ? {display:'none'} : {}} className="col-12">
														<div className="review-list">
															{myReviews.map(function(review, i){
															return (
																<div key={i} className="review-box">
																	<div className="rw-update pb-0">
																		<div className="rw-rating">
																			<div className="usr-star">
																				<span className={review.rating_value >= 1 ? "fa fa-star checked" : "fa fa-star-o"}></span>
																				<span className={review.rating_value >= 2 ? "fa fa-star checked" : "fa fa-star-o"}></span>
																				<span className={review.rating_value >= 3 ? "fa fa-star checked" : "fa fa-star-o"}></span>
																				<span className={review.rating_value >= 4 ? "fa fa-star checked" : "fa fa-star-o"}></span>
																				<span className={review.rating_value >= 5 ? "fa fa-star checked" : "fa fa-star-o"}></span>
																			</div>
																			<div className="rw-time"><Moment fromNow>{review.createdAt}</Moment></div>
																		</div>
																		<div className="rw-button">
																			<button onClick={() => this.removeMyReview(i,review._id)} className="btn" type="submit"><span className="icon"><img src="/static/assets/img/map-view.svg" /></span>Delete</button>
																			{/* <button className="btn" type="submit"><span className="icon"><img src="/static/assets/img/map-view.svg" /></span>Edit</button> */}
																			<button className="btn" type="submit"><span className="icon"><img src="/static/assets/img/map-view.svg" /></span>Share</button>
																		</div>
																	</div>
																	<div className="rw-msg">
																		<p>{review.review_text}</p>
																	</div>
																	<div className="fd-img pb-5">
																		{review.review_images.map(function(image,j){
																			return (
																				<span key={j}><img style={{width:'48px',height:'48px'}} src={image.image} alt="" /></span>
																			);
																		})}
																	</div>
																</div>
															);
															}.bind(this))}
														</div>
													</div>
													<div className="col-12 mx-auto"><p className="no-text text-center" style={myReviews.length == 0 ? {} : {display:'none'}}>No reviews given!</p></div>
												</div>
											</div>
										</div>
										<div className="tab-pane fade" id="nav-photos" role="tabpanel" aria-labelledby="nav-photos-tab">
										<div className="tab-text photos-tab">
											<div className="container-fluid">
												<div className="photos">
													<div className="row">
														<div className="col-md-3 col-sm-4 col-6">
															<div className="img-box">
																<img src="/static/assets/img/profile/photo-1.jpg" alt="img" />
																<div className="overlay">
																	<a href="#" className="trash-icon">
																		<img src="/static/assets/img/trash.svg" />
																	</a>
																</div>
															</div>
														</div>
														<div className="col-md-3 col-sm-4 col-6">
															<div className="img-box">
																<img src="/static/assets/img/profile/photo-2.jpg" alt="img" />
																<div className="overlay">
																	<a href="#" className="trash-icon">
																		<img src="/static/assets/img/trash.svg" />
																	</a>
																</div>
															</div>
														</div>
														<div className="col-md-3 col-sm-4 col-6">
															<div className="img-box">
																<img src="/static/assets/img/profile/photo-3.jpg" alt="img" />
																<div className="overlay">
																	<a href="#" className="trash-icon">
																		<img src="/static/assets/img/trash.svg" />
																	</a>
																</div>
															</div>
														</div>
														<div className="col-md-3 col-sm-4 col-6">
															<div className="img-box">
																<img src="/static/assets/img/profile/photo-4.jpg" alt="img" />
																<div className="overlay">
																	<a href="#" className="trash-icon">
																		<img src="/static/assets/img/trash.svg" />
																	</a>
																</div>
															</div>
														</div>
														<div className="col-md-3 col-sm-4 col-6">
															<div className="img-box">
																<img src="/static/assets/img/profile/photo-5.jpg" alt="img" />
																<div className="overlay">
																	<a href="#" className="trash-icon">
																		<img src="/static/assets/img/trash.svg" />
																	</a>
																</div>
															</div>
														</div>
														<div className="col-md-3 col-sm-4 col-6">
															<div className="img-box">
																<img src="/static/assets/img/profile/photo-4.jpg" alt="img" />
																<div className="overlay">
																	<a href="#" className="trash-icon">
																		<img src="/static/assets/img/trash.svg" />
																	</a>
																</div>
															</div>
														</div>
														<div className="col-md-3 col-sm-4 col-6">
															<div className="img-box">
																<img src="/static/assets/img/profile/photo-7.jpg" alt="img" />
																<div className="overlay">
																	<a href="#" className="trash-icon">
																		<img src="/static/assets/img/trash.svg" />
																	</a>
																</div>
															</div>
														</div>
														<div className="col-md-3 col-sm-4 col-6">
															<div className="img-box">
																<img src="/static/assets/img/profile/photo-8.jpg" alt="img" />
																<div className="overlay">
																	<a href="#" className="trash-icon">
																		<img src="/static/assets/img/trash.svg" />
																	</a>
																</div>
															</div>
														</div>
														<div className="col-md-3 col-sm-4 col-6">
															<div className="img-box">
																<img src="/static/assets/img/profile/photo-9.jpg" alt="img" />
																<div className="overlay">
																	<a href="#" className="trash-icon">
																		<img src="/static/assets/img/trash.svg" />
																	</a>
																</div>
															</div>
														</div>
														<div className="col-md-3 col-sm-4 col-6">
															<div className="img-box">
																<img src="/static/assets/img/profile/photo-10.jpg" alt="img" />
																<div className="overlay">
																	<a href="#" className="trash-icon">
																		<img src="/static/assets/img/trash.svg" />
																	</a>
																</div>
															</div>
														</div>
														<div className="col-md-3 col-sm-4 col-6">
															<div className="img-box">
																<img src="/static/assets/img/profile/photo-11.jpg" alt="img" />
																<div className="overlay">
																	<a href="#" className="trash-icon">
																		<img src="/static/assets/img/trash.svg" />
																	</a>
																</div>
															</div>
														</div>
														<div className="col-md-3 col-sm-4 col-6">
															<div className="img-box">
																<img src="/static/assets/img/profile/photo-12.jpg" alt="img" />
																<div className="overlay">
																	<a href="#" className="trash-icon">
																		<img src="/static/assets/img/trash.svg" />
																	</a>
																</div>
															</div>
														</div>
														<div className="col-md-3 col-sm-4 col-6">
															<div className="img-box">
																<img src="/static/assets/img/profile/photo-1.jpg" alt="img" />
																<div className="overlay">
																	<a href="#" className="trash-icon">
																		<img src="/static/assets/img/trash.svg" />
																	</a>
																</div>
															</div>
														</div>
														<div className="col-md-3 col-sm-4 col-6">
															<div className="img-box">
																<img src="/static/assets/img/profile/photo-2.jpg" alt="img" />
																<div className="overlay">
																	<a href="#" className="trash-icon">
																		<img src="/static/assets/img/trash.svg" />
																	</a>
																</div>
															</div>
														</div>
														<div className="col-md-3 col-sm-4 col-6">
															<div className="img-box">
																<img src="/static/assets/img/profile/photo-3.jpg" alt="img" />
																<div className="overlay">
																	<a href="#" className="trash-icon">
																		<img src="/static/assets/img/trash.svg" />
																	</a>
																</div>
															</div>
														</div>
														<div className="col-md-3 col-sm-4 col-6">
															<div className="img-box">
																<img src="/static/assets/img/profile/photo-4.jpg" alt="img" />
																<div className="overlay">
																	<a href="#" className="trash-icon">
																		<img src="/static/assets/img/trash.svg" />
																	</a>
																</div>
															</div>
														</div>
														<div className="col-md-3 col-sm-4 col-6">
															<div className="img-box">
																<img src="/static/assets/img/profile/photo-5.jpg" alt="img" />
																<div className="overlay">
																	<a href="#" className="trash-icon">
																		<img src="/static/assets/img/trash.svg" />
																	</a>
																</div>
															</div>
														</div>
														<div className="col-md-3 col-sm-4 col-6">
															<div className="img-box">
																<img src="/static/assets/img/profile/photo-6.jpg" alt="img" />
																<div className="overlay">
																	<a href="#" className="trash-icon">
																		<img src="/static/assets/img/trash.svg" />
																	</a>
																</div>
															</div>
														</div>
														<div className="col-md-3 col-sm-4 col-6">
															<div className="img-box">
																<img src="/static/assets/img/profile/photo-7.jpg" alt="img" />
																<div className="overlay">
																	<a href="#" className="trash-icon">
																		<img src="/static/assets/img/trash.svg" />
																	</a>
																</div>
															</div>
														</div>
														<div className="col-md-3 col-sm-4 col-6">
															<div className="img-box">
																<img src="/static/assets/img/profile/photo-8.jpg" alt="img" />
																<div className="overlay">
																	<a href="#" className="trash-icon">
																		<img src="/static/assets/img/trash.svg" />
																	</a>
																</div>
															</div>
														</div>
														<div className="clearfix"></div>
													</div>
													<div className="load-more">
														<div className="more-img">
															<a href="#" id="photo-load">Load More<span><i className="fa fa-angle-down" aria-hidden="true"></i></span></a>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
									<div className="tab-pane fade show active" id="nav-setting" role="tabpanel" aria-labelledby="nav-setting-tab">
									   	<div className="tab-text setting-tab">
											<div className="container-fluid">
												<div className="setting-form">
													<form id="needs-validation" noValidate="">
														<div className="row">
															<div className="col-md-6 col-12">
																<div className="form-group">
																	<input 
																		type="text" 
																		className="form-control" 
																		placeholder="Your Full Name" 
																		name="name" 
																		required="" 
																		onChange={(event) => {
																			this.setState({
																				user: Object.assign({}, user, { name: event.target.value }),
																			});
																		}}
																		value={user.name || ''} 
																	/>
																</div>
															</div>
															<div className="col-md-6 col-12">
																<div className="form-group select">
																	<select 
																		id="inputCity" 
																		className="form-control form-item__element--select minimal" 
																		onChange={(event) => {
																			this.setState({
																				user: Object.assign({}, user, { city: event.target.value }),
																			});
																		}}
																		required="">
																		<option value="" disabled selected hidden>Where do you live?*</option>
																		{cityList.map(function(city, i){
																			return (
																				<option key={i} value={city.city} selected={city.city == user.city ? 'selected':''}>{city.city}</option>
																			);
																		})}
																	</select>
																</div>
															</div>
														</div>
														<div className="row">
															<div className="col-md-12">
																<div className="form-group">
																	<textarea 
																		className="form-control md-textarea" 
																		id="about-yourself" 
																		placeholder="About Yourself" 
																		rows="3" 
																		onChange={(event) => {
																			this.setState({
																				user: Object.assign({}, user, { about: event.target.value }),
																			});
																		}}
																		value={user.about || ''}
																		required="">
																	</textarea>
																</div>
															</div>
														</div>
														<div className="row">
															<div className="col-md-6 col-12">
																<div className="form-group">
																	<input 
																		type="text" 
																		className="form-control" 
																		placeholder="Your Phone Number" 
																		name="phone" 
																		required="" 
																		onChange={(event) => {
																			this.setState({
																				user: Object.assign({}, user, { phone: event.target.value }),
																			});
																		}}
																		value={user.phone || ''}
																	/>
																</div>
															</div>
															<div className="col-md-6 col-12">
																<div className="form-group">
																	<input 
																		type="email" 
																		className="form-control" 
																		placeholder="Your Email Address" 
																		name="email" 
																		value={user.email || ''} 
																		required="" 
																		disabled
																	/>
																	<div className={!user.email_verified ? "invalid-feedback d-block" : "invalid-feedback"}>
																		Email not verified.
																	</div>
																</div>
															</div>
														</div>
														<div className="row">
															<div className="col-md-6 col-12">
																<div className="form-group pwd-field">
																	<input 
																		type="password" 
																		className="form-control" 
																		placeholder="Set New Password" 
																		name="password" 
																		required="" 
																		value={user.newpassword || ''}
																		id="newpassword"
																		onChange={(event) => {
																			this.setState({
																				user: Object.assign({}, user, { newpassword: event.target.value }),
																			});
																		}}
																	/>
																	<span toggle="#newpassword" className="eye-icon icon-Password-Hide pwd-field-icon toggle-password"></span>
																</div>
															</div>
															<div className="col-md-6 col-12">
																<div className="form-group">
																	<input 
																		type="text" 
																		className="form-control" 
																		placeholder="Got a personal Website?" 
																		name="website" 
																		required="" 
																		value={user.website || ''}
																		onChange={(event) => {
																			this.setState({
																				user: Object.assign({}, user, { website: event.target.value }),
																			});
																		}}
																	/>
																</div>
															</div>
														</div>
														<div className="save-btn">
															{(phone != user.phone) && <button onClick={this.verifyOTP} className="btn btn-filled">Verify OTP & Save</button>}
															{(phone == user.phone) && <button onClick={this.onProfileSubmit} className="btn btn-filled">Save</button>}
														</div>
													</form>
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
					{/* OTP Verification modall */}
					<div className="modal fade login-popup" data-backdrop="true" id="profileVerifyOTP">
						<div className="modal-dialog modal-dialog-centered" role="document">
							<div className="modal-content">
								<div className="modal-header border-bottom-0 text-left">
									<button type="button" className="close" data-dismiss="modal" aria-label="Close">
										<span aria-hidden="true">&times;</span>
									</button>
									<h5 className="modal-title">Verify OTP</h5>
									<p className="tag">You should receive OTP on your mobile number soon!</p>
								</div>
								<form>
									<div className="modal-body">
										<div className="form-group">
											<input 
												onChange={(event) => {
													this.setState({otp:event.target.value})
												}}
												placeholder="OTP Code"
												type="text" 
												className="form-control" 
												id="otp" 
												name="otp" 
												value={otp || ''} 
											/>
										</div>
										<div>
											<button onClick={this.onVerifyOTPSubmit} className="btn btn-filled btn-yellow">Verify & Save</button>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
				</section>
				<Footer user={user} />
			</main>
		);
	}
}

export default withAuth(ProfilePage, { loginRequired: true });