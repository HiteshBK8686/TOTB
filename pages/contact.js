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
import { addContactInquiry } from '../lib/api/contact';

class PrivacyPolicyPage extends React.Component {
	static getInitialProps({query}) {
		const PrivacyPolicyPage = true;
		return { PrivacyPolicyPage };
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
			name: '',
			email: '',
			phone: '',
			message: ''
		};
	}

	onContactSubmit = (event) => {
		event.preventDefault();
		var {name, email, phone, message} = this.state;
		if (!name) {
			notify('Name is required');
			return;
		}

		if (!email) {
			notify('Email is required');
			return;
		}

		if (!phone) {
			notify('Phone Number is required');
			return;
		}

		if (!message) {
			notify('Message is required');
			return;
		}

		this.contactFn(name, email, phone, message);
	};

	contactFn = async(name, email, phone, message) => {
		$("#loader_overlay").show();
		try {
			var inquiry = {};
			inquiry.name = name;
			inquiry.email = email;
			inquiry.phone = phone;
			inquiry.message = message;
			await addContactInquiry(inquiry);
			notify('Inquiry has been sent successfully!');
			this.setState({name:'',email:'',phone:'',message:''});
			$("#loader_overlay").hide();
		} catch (err) {
			notify(err);
			$("#loader_overlay").hide();
		}
	};

	render() {
		const {user, name, email, phone, message} = this.state;

		return (
			<main className="wrapper listing-event-detail">
				<Head>
					<title>Contact Us - 10 of The Best</title>
					<meta name="title" content="Contact Us - 10 of The Best" />
					<meta name="description" content="If you have any feedback / suggestions about how we can improve or have a favourite venue which you think should be at 10 of The Best, you can contact us." />
				</Head>
				<Header user={user} />
				<section className="contact-us-wrap top-wrap">
					<div className="venue-top">
						<div className="container">
							<div className="row">
								<div className="col-12">
									<div className="dark-menu">
										<ul className="breadcrumb">
											<li><a href="#">Home</a></li>
											<li className="active"><a href="#">Contact Us</a></li>
										</ul>
									</div>
								</div>
							</div>
							<div className="row">
								<div className="col-12">
									<div className="tag-left">
										<h1>Contact Us</h1>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="contact-section">
						<div className="container">
							<div className="contact-us">
								<div className="contact-form">
									<h3 className="h1 title">Get in touch</h3>
									<h2 className="subtitle">If you would like to talk to us, you can contact us by filling in the form below.</h2>
									<form id="needs-validation" novalidate>
										<div className="form-group">
											<input 
												type="text" 
												className="form-control" 
												placeholder="Name" 
												name="name" 
												onChange={(event) => {
													this.setState({ name: event.target.value });
												}}
												value={name || ''}
												required 
											/>
										</div>
										<div className="form-group">
											<input 
												type="email" 
												className="form-control" 
												placeholder="Email" 
												name="email" 
												onChange={(event) => {
													this.setState({ email: event.target.value });
												}}
												value={email || ''}
												required 
											/>
											  <div className="invalid-feedback">
												The Email field must be a valid email
											</div>
										</div>
										<div className="form-group">
											<input 
												type="text" 
												className="form-control" 
												placeholder="Phone Number" 
												name="phone"
												onChange={(event) => {
													this.setState({ phone: event.target.value });
												}} 
												value={phone || ''}
												required 
											/>
										</div>
										<div className="form-group">
											<textarea 
												className="form-control md-textarea" 
												id="message" 
												placeholder="Message" 
												rows="3" 
												onChange={(event) => {
													this.setState({ message: event.target.value });
												}}
												value={message || ''}
												required="">
											</textarea>
										</div>
										<div className="form-submit">
											<div className="send-btn">
												<button onClick={this.onContactSubmit} className="btn btn-filled btn-yellow">SEND MESSAGE</button>
											</div>
										</div>
									</form>
								</div>
								<div className="contact-detail">
									<div className="contact-card">
										<span className="icon"> <img src="/static/assets/img/contact-us/email.svg" alt="img" /></span>
										<h5><a className="link" href="mailto:info@10ofthebest.com.au">info@10ofthebest.com.au</a></h5>
									</div>
									<div className="contact-card">
										<span className="icon"> <img src="/static/assets/img/contact-us/call.svg" alt="img" /></span>
										<h5><a className="link" href="tel:1300 008 682">1300 008 682</a></h5>
									</div>
									<div className="contact-card mb-5">
										<span className="icon"> <img src="/static/assets/img/contact-us/location.svg" alt="img" /></span>
										<h5>Suite 126, 6/197 - 205 Church Street, Parramatta NSW 2150 Australia.</h5>
									</div>
									<div className="map">
										<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3314.875941626769!2d151.00089721477642!3d-33.81551442372569!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12a31dd07eff9d%3A0x89688836aee41383!2sChurch%20St%2C%20Parramatta%20NSW%202150%2C%20Australia!5e0!3m2!1sen!2sin!4v1581400421808!5m2!1sen!2sin" width="100%" height="227px" frameBorder="0" style={{border:"0"}} allowfullscreen></iframe>
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

export default withAuth(PrivacyPolicyPage, { loginRequired: false });