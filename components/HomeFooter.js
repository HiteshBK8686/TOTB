import React, { useState } from 'react';
import notify from '../lib/notifier';
import RegisterClient from './RegisterClient';
import { login, forgotpassword, addListing, sendotp, verifyotp, subscribe } from '../lib/api/user';
import Link from 'next/link';

function Footer({ user }) {
	var countryCodeList = [];
	const [name, setName] = useState('');
	const [subscriptionEmail, setSubscriptionEmail] = useState('');
	const [otp, setOtp] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [countryCode, setCountryCode] = useState('+61');
	const [listingType, setListingType] = useState('restaurant');
	const [listingTitle, setListingTitle] = useState('');
	const [listingCategory, setListingCategory] = useState('');
	const [listingDescription, setListingDescription] = useState('');
	const [listingAddress, setListingAddress] = useState('');
	const [password, setPassword] = useState('');
	const [category, setCategory] = useState('');
	const [error, setError] = useState({});

	const getCity = () => {
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

	const onSignupSubmit = (event) => {
		event.preventDefault();

		if (!name) {
			notify('Name is required');
			return;
		}

		if (!email) {
			notify('Email is required');
			return;
		} else{
			const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    		if(re.test(String(email).toLowerCase())){
				// nothing
			} else{
				notify('Invalid email address');
				return;
			}
		}

		if (!password) {
			notify('Password is required');
			return;
		}

		if (!phone) {
			notify('Phone is required');
			return;
		} else{
			if(phone.length > 10){
				notify("Phone number can't be more than 10 digits");
				return;
			}
		}
		sendOTP(countryCode+phone, email);
		// signupFn(name, email, password, phone);
	};

	const sendOTP = async(phone,email) => {
		$("#loader_overlay").show();
		try {
			const otpsent = await sendotp({phone,email});
			if (typeof otpsent.message === 'undefined') {
				notify('OTP sent!');
				$("#signupModal").modal("hide");
				$("#verifyOTP").modal("show");
				// window.location.reload();
			} else{
				notify(otpsent.message);
			}
			$("#loader_overlay").hide();
		} catch (err) {
			notify("Could not sent OTP!");
			$("#loader_overlay").hide();
		}
	};

	const onVerifyOTPSubmit = (event) => {
		event.preventDefault();

		if (!otp) {
			notify('OTP is required');
			return;
		}
		// setPhone(countryCode + phone);
		signupFn(name, email, password, countryCode+phone, otp);
	};

	const signupFn = async(name, email, password, phone, otp) => {
		$("#loader_overlay").show();
		try {
			const verify = await verifyotp({phone,otp});
			if(typeof verify.message === 'undefined'){
				var username = name + '___' + email + '___' + phone;
				const user = await login({username:username, password:password});
				console.log(user);
				if (typeof user.message === 'undefined') {
					notify('Signup Successfully!');
					window.location.reload();
				} else{
					notify(user.message);
				}
			} else{
				notify("Invalid OTP!");
			}
			$("#loader_overlay").hide();
		} catch (err) {
			notify("User with same email or phone number already exists!");
			$("#loader_overlay").hide();
		}
	};

	const onForgotPassSubmit = (event) => {
		event.preventDefault();

		if (!email) {
			notify('Email is required');
			return;
		}

		forgotPassFn(email);
	};

	const forgotPassFn = async(email) => {
		if (!email) {
			notify('Email is required');
			return;
		}

		$("#loader_overlay").show();
		try {
			await forgotpassword({email:email});
			$("#loader_overlay").hide();
			notify('Email sent with instructions to reset your password!');
			$("#forgotpwdModal").modal('hide');
			// window.location.reload();
		} catch (err) {
			notify(err);
			$("#loader_overlay").hide();
		}
	};

	const onLoginSubmit = (event) => {
		event.preventDefault();

		if (!email) {
			notify('Email is required');
			return;
		}

		if (!password) {
			notify('Password is required');
			return;
		}

		loginFn(email, password);
	};

	const loginFn = async(email, password) => {
		$("#loader_overlay").show();
		try {
			var username = email;
			const user = await login({username:username, password:password});
			window.localStorage.setItem("accessToken", user.accessToken);
			$("#loader_overlay").hide();
			notify('Login Successfully!');
			window.location.reload();
		} catch (err) {
			notify("Username/Password mismatch!");
			$("#loader_overlay").hide();
		}
	};

	const onSubscribeSubmit = (event) => {
		event.preventDefault();

		if (!email) {
			notify('Email is required');
			return;
		}

		subscribeFn(email);
	};

	const subscribeFn = async(email) => {
		$("#loader_overlay").show();
		try {
			const data = await subscribe({email:email});
			notify('Subscribed Successfully!');
			$("#loader_overlay").hide();
		} catch (err) {
			notify("Something went wrong, please try again!");
			$("#loader_overlay").hide();
		}
	};

	const changeCategory = (c) => {
		if(category.includes(c)){
			var catList = category;
			var index = catList.indexOf(c);
			catList.splice(index, 1);
			setCategory(catList);
		} else{
			setCategory([
				...category,
				c
			]);
		}
	};
	const onListingSubmit = (event) => {
		event.preventDefault();

		if (!listingTitle) {
			notify('Title is required');
			return;
		}

		if (!listingCategory) {
			notify('Category is required');
			return;
		}

		if (!listingAddress) {
			notify('Address is required');
			return;
		}

		if (!listingDescription) {
			notify('Description is required');
			return;
		}

		listingFn(listingType, listingTitle, listingCategory, listingAddress, listingDescription);
	};

	const listingFn = async(type, title, category, address, description) => {
		$("#loader_overlay").show();
		try {
			await addListing({user_id:user._id, type:type, title:title, category:category, address:address, description:description});
			notify("We have received your details, we'll contact you shortly!");
			$("#loader_overlay").hide();
			$("#addListingModal").modal('hide');
		} catch (err) {
			$("#loader_overlay").hide();
		}
	};

	if (typeof window === 'undefined') {
		return null;
	} else{
		const [countryCodes, setCountryCodes] = useState([]);
		const getCountryCodes = async () => {
			countryCodeList = await import('../pages/country_code.json');
			countryCodeList = JSON.parse("["+JSON.stringify(countryCodeList)+"]");
			setCountryCodes(countryCodeList[0]['default']);
		}

		if(countryCodes.length == 0){
			getCountryCodes();
		}
		
		return (
			<footer className="section">
				<div className="container">
					<div className="footer">
						<div className="row">
							<div className="col-md-4 col-12">
								<Link href={"/"+getCity().toLowerCase().replace(" ","-")}>
									<a>
										<div className="logo-light">
											<img src="/static/assets/img/logo.svg" alt="" />
										</div>
									</a>
								</Link>
								<div className="copywrite d-none d-md-flex">
									<a href="#">Copyright©{(new Date().getFullYear())} 10 of The Best. All rights reserved.</a>
								</div>
							</div>
							<div className="col-md-4 col-12">
								<div className="link">
									<h5 className="title">Quick Links</h5>
									<div className="link-list">
										<ul>
											<li>
												<Link href={"/"+getCity().toLowerCase().replace(" ","-")}>
													<a>Home</a>
												</Link>
											</li>
											<li>
												<Link href="/about">
													<a>About Us</a>
												</Link>
											</li>
											<li>
												<a data-toggle="modal" data-target="#registerClientModal">Add Your Listing</a>
											</li>
										</ul>
										<ul>
											<li>
												<Link href="/terms-conditions">
													<a>Terms</a>
												</Link>
											</li>
											<li>
												<Link href="/contact">
													<a>Contact Us</a>
												</Link>
											</li>
											<li>
												<Link href="/help">
													<a>Help</a>
												</Link>
											</li>
										</ul>
									</div>
								</div>
							</div>
							<div className="col-md-4 col-12">
								<div className="news-ltr">
									<h5 className="title">Subscribe to our newsletter</h5>
									<div className="email-bx">
										<div className="input-group">
											<input 
												onChange={(event) => {
													setSubscriptionEmail(event.target.value);
												}}
												value={subscriptionEmail || ''}
												type="text"
												className="form-control"
												placeholder="Enter Your Email"
											/>
											<div className="input-group-append">
												<button 
													onClick={onSubscribeSubmit}
													type="submit" 
													className="btn btn-form">
													<img src="/static/assets/img/email-icon.svg" alt="" />
												</button>
											</div>
										</div>
									</div>
									<div className="social-links">
										<a target="_blank" href="https://www.facebook.com/10ofthebest/" className="facebook">
											<i className="fa fa-facebook" aria-hidden="true"></i>
										</a>
										<a target="_blank" href="https://www.instagram.com/10ofthebest_totb/" className="instagram">
											<i className="fa fa-instagram" aria-hidden="true"></i>
										</a>
										<a target="_blank" href="https://twitter.com/10ofTheBest1" className="twitter">
											<i className="fa fa-twitter" aria-hidden="true"></i>
										</a>
										<a target="_blank" href="https://www.linkedin.com/company/10ofthebest" className="linked-in">
											<i className="fa fa-linkedin" aria-hidden="true"></i>
										</a>
									</div>
									<div className="copywrite d-flex d-md-none">
										<a href="#">Copyright©{(new Date().getFullYear())} 10 of The Best. All rights reserved.</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="modal fade login-popup" id="loginModal">
					<div className="modal-dialog modal-dialog-centered" role="document">
						<div className="modal-content">
							<div className="modal-header border-bottom-0 text-left">
								<button type="button" className="close" data-dismiss="modal" aria-label="Close">
									<span aria-hidden="true">&times;</span>
								</button>
								<h5 className="modal-title">Sign In</h5>
								<p className="tag">To keep connected with us please login with your personal info.</p>
							</div>
							<form>
								<div className="modal-body">
									<div className="form-group">
										<input 
											onChange={(event) => {
												setEmail(event.target.value);
											}}
											placeholder="Email"
											type="email" 
											className="form-control" 
											id="login_email" 
											name="email" 
											value={email || ''} 
										/>
									</div>
									<div className="form-group">
										<input 
											onChange={(event) => {
												setPassword(event.target.value);
											}}
											placeholder="Password"
											type="password" 
											className="form-control" 
											id="login_password" 
											autoComplete="current-password"
											name="password" 
											value={password || ''} 
										/>
									</div>
									<div className="forgot">
										<a href="#forgotpwdModal" data-toggle="modal" data-dismiss="modal">Forgot Password ?</a>
									</div>
									<div>
										<button onClick={onLoginSubmit} className="btn btn-filled btn-yellow">Sign In</button>
									</div>
									<div className="signup-link">
										Don’t have an account ? <a href="#signupModal" data-toggle="modal" data-dismiss="modal" className="signup-btn">Sign Up</a>
									</div>
									<div className="share-btn text-center">
										<Link href="/auth/facebook"><a className="facebook"><i className="fa fa-facebook" aria-hidden="true"></i></a></Link>
										<Link href="/auth/google"><a className="google"><i className="fa fa-google" aria-hidden="true"></i></a></Link>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
				<div className="modal fade login-popup" data-backdrop="true" id="signupModal">
					<div className="modal-dialog modal-dialog-centered" role="document">
						<div className="modal-content">
							<div className="modal-header border-bottom-0 text-left">
								<button type="button" className="close" data-dismiss="modal" aria-label="Close">
									<span aria-hidden="true">&times;</span>
								</button>
								<h5 className="modal-title">Sign Up</h5>
								<p className="tag">Provide us with some basic account details so we can get you started!</p>
							</div>
							<form>
								<div className="modal-body">
									<div className="form-group">
										<input 
											onChange={(event) => {
												setName(event.target.value);
											}}
											placeholder="Name"
											type="text" 
											className="form-control" 
											id="name" 
											name="name" 
											value={name || ''} 
										/>
										<div className={error.name ? "invalid-feedback d-block" : "invalid-feedback"}>
											Please enter your Name
										</div>
									</div>
									<div className="form-group">
										<input 
											onChange={(event) => {
												setEmail(event.target.value);
											}}
											placeholder="Email"
											type="email" 
											className="form-control" 
											id="signup_email" 
											name="email" 
											value={email || ''} 
										/>
										<div className={error.email ? "invalid-feedback d-block" : "invalid-feedback"}>
											Please enter your Email
										</div>
									</div>
									<div className="row">
										<div className="form-group col-4 pr-1">
											<select 
												onChange={(event) => {
													setCountryCode(event.target.value);
												}}
												type="text" 
												className="form-control" 
												id="countryCode" 
												name="countryCode" 
												value={countryCode || ''} 
											>
												{countryCodes.map((code,i)=>{
													if(code.dial_code){
														return (
															<option key={i}>{code.dial_code}</option>
														);
													}
												})}
											</select>
										</div>
										<div className="form-group col-8 pl-0">
										<input 
											onChange={(event) => {
												setPhone(event.target.value);
											}}
											placeholder="Phone"
											type="text" 
											className="form-control" 
											id="phone" 
											name="phone" 
											value={phone || ''} 
										/>
										<div className={phone.length > 10 ? "invalid-feedback d-block" : "invalid-feedback"}>
											Phone number can't be more than 10 digits
										</div>
									</div>
									</div>
									<div className="form-group">
										<input 
											onChange={(event) => {
												setPassword(event.target.value);
											}}
											placeholder="Password"
											type="password" 
											className="form-control" 
											id="signup_password" 
											autoComplete="current-password"
											name="password" 
											value={password || ''} 
										/>
										<div className={error.password ? "invalid-feedback d-block" : "invalid-feedback"}>
											Please enter valid Password
										</div>
									</div>
									<div>
										<button onClick={onSignupSubmit} className="btn btn-filled btn-yellow">Sign Up</button>
									</div>
									<div className="signup-link">
										Already a member ?  <a href="#loginModal" data-toggle="modal" data-dismiss="modal">Sign In</a>
									</div>
									{/*<div className="share-btn text-center">
										<a href="#" className="facebook"><i className="fa fa-facebook" aria-hidden="true"></i></a>
										<a href="#" className="google"><i className="fa fa-google" aria-hidden="true"></i></a>
									</div>*/}
								</div>
							</form>
						</div>
					</div>
				</div>
				{/* OTP Verification modall */}
				<div className="modal fade login-popup" data-backdrop="true" id="verifyOTP">
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
												setOtp(event.target.value);
											}}
											placeholder="OTP Code"
											type="text" 
											className="form-control" 
											id="otp" 
											name="otp" 
											value={otp || ''} 
										/>
										<div className={error.name ? "invalid-feedback d-block" : "invalid-feedback"}>
											Please enter OTP code
										</div>
									</div>
									<div>
										<button onClick={onVerifyOTPSubmit} className="btn btn-filled btn-yellow">Sign Up</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
				{/*forgot password modal*/}
				<div className="modal fade login-popup forgot-pwd-popup" id="forgotpwdModal" tabIndex="-1" aria-hidden="true" data-backdrop="true" role="dialog">
					<div className="modal-dialog modal-dialog-centered" role="document">
						<div className="modal-content">
							<div className="modal-header border-bottom-0 text-left">
								<button type="button" className="close" data-dismiss="modal" aria-label="Close">
									<span aria-hidden="true">&times;</span>
								</button>
								<h5 className="modal-title">Forgot Password</h5>
								<p className="tag">Enter your email below to receive your password reset instructions</p>
							</div>
							<form noValidate>
								<div className="modal-body">
									<div className="form-group">
										<input 
											type="email" 
											className="form-control" 
											id="reset_email" 
											placeholder="Email" 
											name="email" 
											required
											onChange={(event) => {
												setEmail(event.target.value);
											}}
											value={email || ''} 
										/>
										<div className="invalid-feedback">
											The Email field must be a valid email
										</div>
									</div>
									<div className="forgot-btn">
										<button onClick={onForgotPassSubmit} type="submit" className="btn btn-filled btn-yellow">Submit</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
				{/*Add Listing Modal*/}
				<div className="modal fade totb-popup add-listing-popup" id="addListingModal" tabIndex="-1" aria-hidden="true" data-backdrop="true" role="dialog">
					<div className="modal-dialog modal-dialog-centered" role="document">
						<div className="modal-content">
							<div className="modal-header border-bottom-0 text-left">
								<button type="button" className="close" data-dismiss="modal" aria-label="Close">
									<span aria-hidden="true">&times;</span>
								</button>
								<h5 className="modal-title">Listing Information</h5>
								<div className="select-category">
									<div className="sub-category">
										<input 
											type="radio" 
											id="restaurant" 
											name="radio-group" 
											checked="checked" 
											onChange={
												(event) => { setListingType('restaurant') }
											} 
											checked={listingType == 'restaurant' ? "checked" : null}
										/>
										<label htmlFor="restaurant">Dine & Drinks</label>
									</div>
									<div className="sub-category">
										<input 
											type="radio" 
											id="venue" 
											name="radio-group" 
											checked="checked" 
											onChange={
												(event) => { setListingType('venue') }
											} 
											checked={listingType == 'venue' ? "checked" : null}
										/>
										<label htmlFor="venue">Function Venue</label>
									</div>
								</div>
							</div>
							<div className="modal-body">
								<form noValidate>
									<div className="form-group">
										<input 
											type="name" 
											className="form-control" 
											placeholder="Listing Title" 
											name="name" 
											required 
											value={listingTitle || ''}
											onChange={
												(event) => { setListingTitle(event.target.value) }
											}
										/>
									</div>
									<div className="form-group">
										<input 
											type="name" 
											className="form-control" 
											placeholder="Category" 
											name="name" 
											required 
											value={listingCategory || ''}
											onChange={
												(event) => { setListingCategory(event.target.value) }
											}
										/>
									</div>
									<div className="form-group">
										<textarea 
											className="form-control md-textarea" 
											placeholder="Address" 
											rows="3" 
											required=""
											onChange={
												(event) => { setListingAddress(event.target.value) }
											}
											value={listingAddress || ''}
										></textarea>
									</div>
									<div className="form-group">
										<textarea 
											className="form-control md-textarea" 
											placeholder="Description" 
											rows="3" 
											required=""
											onChange={
												(event) => { setListingDescription(event.target.value) }
											}
											value={listingDescription || ''}
										></textarea>
									</div>
								</form>
								<div className="feature-box">
									<h4>Features</h4>
									<div className="options">
										<div className="filter-bx">
											<div className="item-bx">
												<div className="custom-control custom-checkbox mb-3">
													<input 
														type="checkbox" 
														className="custom-control-input" 
														id="customCheck1" 
														name="example1"
														value="Cafe Food"
														onChange={(event) => { changeCategory(event.target.value) }} 
													/>
													<label className="custom-control-label" htmlFor="customCheck1">Cafe Food</label>
												</div>
											</div>
											<div className="item-bx">
												<div className="custom-control custom-checkbox mb-3">
													<input 
														type="checkbox" 
														className="custom-control-input" 
														id="customCheck2" 
														name="example1"
														value="Goods For Groups"
														onChange={(event) => { changeCategory(event.target.value) }} 
													/>
													<label className="custom-control-label" htmlFor="customCheck2">Goods For Groups</label>
												</div>
											</div>
											<div className="item-bx">
												<div className="custom-control custom-checkbox mb-3">
													<input 
														type="checkbox" 
														className="custom-control-input" 
														id="customCheck3" 
														name="example1"
														value="Home Delivery"
														onChange={(event) => { changeCategory(event.target.value) }} 
													/>
													<label className="custom-control-label" htmlFor="customCheck3">Home Delivery</label>
												</div>
											</div>
										</div>
										<div className="filter-bx">
											<div className="item-bx">
												<div className="custom-control custom-checkbox mb-3">
													<input 
														type="checkbox" 
														className="custom-control-input" 
														id="customCheck7" 
														name="example1"
														value="Takeaway Available"
														onChange={(event) => { changeCategory(event.target.value) }} 
													/>
													<label className="custom-control-label" htmlFor="customCheck7">Takeaway Available</label>
												</div>
											</div>
											<div className="item-bx">
												<div className="custom-control custom-checkbox mb-3">
													<input 
														type="checkbox" 
														className="custom-control-input" 
														id="customCheck8" 
														name="example1"
														value="Free Wi-Fi"
														onChange={(event) => { changeCategory(event.target.value) }} 
													/>
													<label className="custom-control-label" htmlFor="customCheck8">Free Wi-Fi</label>
												</div>
											</div>
											<div className="item-bx">
												<div className="custom-control custom-checkbox mb-3">
													<input 
														type="checkbox" 
														className="custom-control-input" 
														id="customCheck9" 
														name="example1"
														value="Veg / Vegan-Friendly"
														onChange={(event) => { changeCategory(event.target.value) }} 
													/>
													<label className="custom-control-label" htmlFor="customCheck9">Veg / Vegan-Friendly</label>
												</div>
											</div>
										</div>
										<div className="filter-bx">
											<div className="item-bx">
												<div className="custom-control custom-checkbox mb-3">
													<input 
														type="checkbox" 
														className="custom-control-input" 
														id="customCheck13" 
														name="example1"
														value="Wheelchair Access"
														onChange={(event) => { changeCategory(event.target.value) }} 
													/>
													<label className="custom-control-label" htmlFor="customCheck13">Wheelchair Access</label>
												</div>
											</div>
											<div className="item-bx">
												<div className="custom-control custom-checkbox mb-3">
													<input 
														type="checkbox" 
														className="custom-control-input" 
														id="customCheck14" 
														name="example1"
														value="Kid Friendly"
														onChange={(event) => { changeCategory(event.target.value) }} 
													/>
													<label className="custom-control-label" htmlFor="customCheck14">Kid Friendly</label>
												</div>
											</div>
											<div className="item-bx">
												<div className="custom-control custom-checkbox mb-3">
													<input 
														type="checkbox" 
														className="custom-control-input" 
														id="customCheck15" 
														name="example1"
														value="Full Bar Available"
														onChange={(event) => { changeCategory(event.target.value) }} 
													/>
													<label className="custom-control-label" htmlFor="customCheck15">Full Bar Available</label>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="submit-btn">
									<button onClick={onListingSubmit} className="btn btn-filled btn-yellow">Submit</button>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div id="loader_overlay" style={{display:'none'}}>
					<img className="loader_img" src="/static/rotate.gif" alt="" />
				</div>
				<RegisterClient />
			</footer>
		);
	}
}

export default Footer;
