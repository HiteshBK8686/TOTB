import PropTypes from 'prop-types';
import Link from 'next/link';
import React, { useState } from 'react';
import Router from 'next/router';

function Header({ user, parentChangeType }) {
	var cityList = [];
	const getType = () => {
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

	const getCookie = () => {
		var name =  "acceptCookie=";
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
		return "";
	}



	if (typeof window === 'undefined') {
		return null;
	} else{
		if(user._id == undefined){
			window.localStorage.removeItem("accessToken");
		}
		const [type, setType] = useState(getType());
		const [city, setCity] = useState(getCity());
		const [cities, setCities] = useState([]);
		const [citysearch, setCitysearch] = useState('');
		const [cookie, setCookie] = useState(getCookie());

		const getCities = async () => {
			cityList = await import('../pages/au.json');
			cityList = JSON.parse("["+JSON.stringify(cityList)+"]");
			setCities(cityList[0]['default']);
		}

		if(cities.length == 0){
			getCities();
		}
		const changeType = (type) => {
			var d = new Date();
			d.setTime(d.getTime() + (7*24*60*60*1000));
			var expires = "expires="+ d.toUTCString();
			document.cookie = "type=" + type + ";" + expires + ";path=/";

			// removing coords from the cookie as user selects the another city from dropdown
			document.cookie = "coords_lat=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
			document.cookie = "coords_lng=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
			setType(type);
			parentChangeType(type);
		};

		const changeCity = (city) => {
			var d = new Date();
			d.setTime(d.getTime() + (7*24*60*60*1000));
			var expires = "expires="+ d.toUTCString();
			document.cookie = "city=" + city + ";" + expires + ";path=/";
			setCity(city);
			if(currentURL.includes('listing')){
				Router.push('/listing/'+city.toLowerCase().replace(/ /g,"-")+"?t="+type);
			} else{
				Router.push('/'+city.toLowerCase().replace(/ /g,"-"));
			}
		};

		const changeCookie = (value) => {
			var d = new Date();
			d.setTime(d.getTime() + (7*24*60*60*1000));
			var expires = "expires="+ d.toUTCString();
			document.cookie = "acceptCookie="+ value +";" + expires + ";path=/";
			setCookie(value);
		};

		var currentURL = window.location.pathname;
		return (
		<nav className="top-nav navbar navbar-expand-lg navbar-dark fixed-top bg-light">
			<div style={cookie != '' ? {display:'none'} : {}} className="cookie-popup">
				<h5>This website uses cookies to improve your experience. We’ll Assume you’re ok with this, but you can opt-out if you wish.</h5>
				<div className="cookie-btn">
					<span className="accept-btn">
						<button onClick={() => changeCookie('yes')} className="btn btn-filled btn-yellow">Accept</button>
					</span>
					<span className="close-btn">
						<a onClick={() => changeCookie('no')}><img src="/static/assets/img/close.svg" alt="img" /></a>
					</span>
				</div>
			</div>
			<button className="openbtn" onClick={() => document.getElementById("mySidepanel").style.width = "320px"}><img src="/static/assets/img/menu.svg" alt="" /></button>
			<div className=" d-flex d-lg-none">
				<div id="mySidepanel" className="sidepanel">
					<a href="javascript:void(0)" className="closebtn" onClick={() => document.getElementById("mySidepanel").style.width = "0"}><img src="/static/assets/img/close.svg" alt="" /></a>
					<div style={user._id == undefined ? {display:'none'} : {}} className="profile">
						<img style={{height:'86px'}} src={user.profile_pic ? user.profile_pic : "/static/assets/img/avatar.png"} alt="" />
						<h4>{user.name}</h4>
						<Link href="/profile"><a><p>Edit Profile</p></a></Link>
					</div>
					<div style={user._id == undefined ? {display:'none'} : {}} className="side-btn mb-listing-btn">
						<Link prefetch={false} href={process.env.ADMIN_URL + '/signup'}>
							<a className="btn btn-white" type="submit">Add Your Listing</a>
						</Link>
					</div>
					{/*<div className="side-btn mb-signin-btn">
                        <button className="btn btn-filled" type="button" data-toggle="modal" data-target="#loginModal">Sign in</button>
                    </div>*/}
					<div className="side-menu-link">
						<ul className="navbar-nav">
							{/*<li className="nav-item active">
								<a className="nav-link" href="#">Dine & Drinks
								</a>
							</li>
							<li className="nav-item">
								<a className="nav-link" href="#">Function Venue</a>
							</li>*/}
							<li className="nav-item">
								<Link href="/about"><a className="nav-link">About Us</a></Link>
							</li>
							<li className="nav-item">
								<Link href="/help"><a className="nav-link">Help</a></Link>
							</li>
							<li className="nav-item">
								<Link href="/contact"><a className="nav-link">Contact Us</a></Link>
							</li>
							<li style={user._id == undefined ? {display:'none'} : {}} className="nav-item">
								<Link href="/logout"><a className="nav-link">Logout</a></Link>
							</li>
							<li style={user._id == undefined ? {} : {display:'none'}} className="nav-item">
								<a href="#loginModal" data-toggle="modal" data-dismiss="modal" className="nav-link" id="loginLink">Sign In</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<Link href={"/"+getCity().toLowerCase().replace(/ /g,"-")}>
				<a className="navbar-brand logo mr-auto">
					<img src="/static/assets/img/logo.svg" alt="" />
				</a>
			</Link>

			<div className="nav-search">
				<div className="search-bar">
					<input 
						className="form-control" 
						type="text" 
						placeholder="Search for your city" 
						aria-label="Search" 
						autoComplete="off"
						onChange={(event) => {
							setCitysearch(event.target.value);
						}}
					/>
				</div>
			</div>
			<div style={currentURL.includes('listing') ? {} : {display:'none'}} className="dropdown nav-venue ds-vw">
				<a className={type == 'restaurant' ? "dropdown-toggle dine-drink active" : "dropdown-toggle fun-venue active"} href="#" id="venue-drpdwn" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">{type == 'restaurant' ? 'Dine & Drinks' : 'Function Venue'}</a>
				<div className="dropdown-menu" aria-labelledby="venue-drpdwn">
					<a href="#" onClick={() => changeType('restaurant')} className={type == 'restaurant' ? "dropdown-item dine-drink active" : "dropdown-item dine-drink"}>Dine & Drinks</a>
					<a href="#" onClick={() => changeType('venue')} className={type == 'venue' ? "dropdown-item fun-venue active" : "dropdown-item fun-venue"}>Function Venue</a>
				</div>
			</div>
			<div className="menu-large nav-item">
				<a className="dropdown-toggle nav-link green" href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{getCity()}</a>
				<div className="dropdown-menu location-menu" aria-labelledby="dropdown01">
					<div className="cities-dropdown">
						<div className="search-bar">
							<input 
								className="form-control" 
								type="text" 
								placeholder="Search for your city" 
								aria-label="Search" 
								autoComplete="off"
								onChange={(event) => {
									setCitysearch(event.target.value);
								}}
							/>
						</div>
						<div className="popular-cities">
							<h5>Popular cities</h5>
							<div className="cities-list">
								<button className="btn btn-white mr-2 mb-2" type="submit" onClick={() => changeCity('Sydney')}>Sydney</button>
								<button className="btn btn-white mr-2 mb-2" type="submit" onClick={() => changeCity('Melbourne')}>Melbourne</button>
								<button className="btn btn-white mr-2 mb-2" type="submit" onClick={() => changeCity('Brisbane')}>Brisbane</button>
								<button className="btn btn-white mr-2 mb-2" type="submit" onClick={() => changeCity('Perth')}>Perth</button>
								<button className="btn btn-white mr-2 mb-2" type="submit" onClick={() => changeCity('Adelaide')}>Adelaide</button>
							</div>
						</div>
						<div className="other-cities ">
							<h5>Other cities</h5>
							<div className="city-list scrollbar scrollbar-primary">
								<ul>
									{cities.map(function(c, i){
										if(citysearch.length > 0){
											if(c.city.toUpperCase().indexOf(citysearch.toUpperCase()) !== -1){
												return (
													<li key={i}><a href="#" onClick={() => changeCity(c.city)}>{c.city}</a></li>
												);
											} else{
												return null;
											}
										} else{
											return (
												<li key={i}><a href="#" onClick={() => changeCity(c.city)}>{c.city}</a></li>
											);
										}
									})}
									<div className="clearfix"></div>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="collapse navbar-collapse d-none d-lg-flex">
			<ul className="navbar-nav ml-auto">
				<li className={currentURL.includes('about') ? "nav-item active" : "nav-item"}>
					<Link href="/about"><a className="nav-link">About Us</a></Link>
				</li>
				<li className={currentURL.includes('help') ? "nav-item active" : "nav-item"}>
					<Link href="/help"><a className="nav-link">Help</a></Link>
				</li>
				<li className={currentURL.includes('contact') ? "nav-item active" : "nav-item"}>
					<Link href="/contact"><a className="nav-link">Contact Us</a></Link>
				</li>
			</ul>
			<form className="form-inline my-2 my-lg-0">
				{user._id != undefined ? <Link prefetch={false} href={process.env.ADMIN_URL + '/signup'}><a><button className="btn btn-white ml-2" type="button">Add Your Listing</button></a></Link> : null }
				{user._id != undefined ? <div className="dropdown user-dropdown">
					<div className="user-img">
						<img style={{width:'47px'}} src={user.profile_pic ? user.profile_pic : "/static/assets/img/avatar.png"} />
					</div>
					<a href="#" className="dropdown-toggle" data-toggle="dropdown">{user.name}</a>
					<div className="dropdown-menu">
						<Link href="/profile"><a className="dropdown-item">Profile</a></Link>
						<Link href="/logout"><a className="dropdown-item">Logout</a></Link>
					</div>
				</div> : <button className="btn btn-filled ml-3 signin-btn" type="button" data-toggle="modal" data-target="#loginModal">SIGN IN</button>}
			</form>
			</div>
			<div id="overlay" style={{display:'none'}}></div>
		</nav>
		);
	}
}

Header.propTypes = {
	user: PropTypes.shape({
	displayName: PropTypes.string,
	email: PropTypes.string,
	name: PropTypes.string,
	isAdmin: PropTypes.number,
	avatarUrl: PropTypes.string,
	isGithubConnected: PropTypes.bool,
	}),
};

Header.defaultProps = {
	user: null,
};

export default Header;
