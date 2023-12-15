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

class HelpPage extends React.Component {
	static getInitialProps({query}) {
		const HelpPage = true;
		return { HelpPage };
	}


	async componentDidMount() {

	    // accordion add active class 
	    $(document).ready(function() {
	        $('.collapse').on('show.bs.collapse', function() {
	            $(this).siblings('.card-header').addClass('active');
	        });
	        $('.collapse').on('hide.bs.collapse', function() {
	            $(this).siblings('.card-header').removeClass('active');
	        });
	    });
		// accordion toggle icon
	    $("#accordion").on("hide.bs.collapse show.bs.collapse", e => {
	        $(e.target).prev().find("i:last-child").toggleClass("fa-angle-up fa-angle-down");
	    });

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
			user: props.user || {}
		};
	}

	render() {
		const {user} = this.state;

		return (
			<main className="wrapper section-wrap">
				<Head>
					<title>How can we Help? - 10 of The Best</title>
					<meta name="title" content="How can we Help? - 10 of The Best" />
					<meta name="description" content="We are happy to know your experiences to our website. Explore FAQ or get in touch with us for any query or questions." />
				</Head>
				<Header user={user} />
				<section className="help-page top-wrap">
				    <div className="venue-top">
				        <div className="container">
				            <div className="row">
				                <div className="col-12">
				                    <div className="dark-menu">
				                        <ul className="breadcrumb">
				                            <li><a href="#">Home</a></li>
				                            <li className="active"><a href="#">Help</a></li>
				                        </ul>
				                    </div>
				                </div>
				            </div>
				            <div className="row">
				                <div className="col-12">
				                    <div className="tag-left">
				                        <h1>How can we help?</h1>
				                    </div>
				                </div>
				            </div>
				        </div>
				    </div>
				    <div className="help-wrap">
				        <div className="container">
				            <div className="row">
				                <div className="col-lg-8 col-md-12">
				                    <div className="faq-wrap">
				                        <h4>FAQ</h4>
				                        <div className="faq-accrodian">
				                            <div id="accordion" className="myaccordion">
				                                <div className="card">
				                                    <div className="card-header" id="heading1" data-toggle="collapse" data-target="#collapse1" aria-expanded="true" aria-controls="collapse1">
				                                        <h5>
				                                            How does it work?
				                                        </h5>
				                                        <span className="toggle-arrow">
				                                            <i className="fa fa-angle-down"></i>
				                                        </span>
				                                    </div>
				                                    <div id="collapse1" className="collapse" aria-labelledby="heading1" data-parent="#accordion">
				                                        <div className="card-body">
				                                            <p>Begin with searching the directory; find venues for your functions & Dine or/and drink that best suit your needs and contact or book them directly with the details or forms provided on their listing profiles. It’s that simple!
															</p>
 															<div className="note-text">
				                                                <b>Note :</b> It is free for anyone to use our website and we do not charge or accept any commissions or fees on venue bookings or enquiries.
				                                            </div>
				                                        </div>
				                                    </div>
				                                </div>
				                                <div className="card">
				                                    <div className="card-header" id="heading2" data-toggle="collapse" data-target="#collapse2" aria-expanded="true" aria-controls="collapse2">
				                                        <h5>
				                                            How do I add my listing in 10 of The Best?
				                                        </h5>
				                                        <span className="toggle-arrow">
				                                            <i className="fa fa-angle-down"></i>
				                                        </span>
				                                    </div>
				                                    <div id="collapse2" className="collapse" aria-labelledby="heading2" data-parent="#accordion">
				                                        <div className="card-body">
				                                            <p>In case of adding your listing to the 10 of The Best, you can apply by filling up the “Add your Listing” form. Our inhouse team will review your request and will get in touch with you via email address.</p>
				                                        </div>
				                                    </div>
				                                </div>
				                                <div className="card">
				                                    <div className="card-header" id="heading3" data-toggle="collapse" data-target="#collapse3" aria-expanded="true" aria-controls="collapse3">
				                                        <h5>
				                                            How do I find a restaurant or a venue in Australia?
				                                        </h5>
				                                        <span className="toggle-arrow">
				                                            <i className="fa fa-angle-down"></i>
				                                        </span>
				                                    </div>
				                                    <div id="collapse3" className="collapse" aria-labelledby="heading3" data-parent="#accordion">
				                                        <div className="card-body">
				                                            <p>Finding a restaurant or a venue is easy with our highly researched and curated dining guide. To make it easy our team has divided listings into simple, easy to use categories including Popular, Cuisine, Location, Features, Street & Laneways, Specialities, Landmarks, Regions, Events, and Functions.</p>
				                                            <p>Visit <Link prefetch={false} href="https://www.10ofthebest.com.au/"><a target="_blank"> www.10ofthebest.com.au </a></Link>to research and book!</p>
				                                        </div>
				                                    </div>
				                                </div>
				                            </div>
				                        </div>
				                    </div>
				                    <div className="help-link">
				                        <h3>How can we help? Drop us a line.</h3>
				                        <div className="contact-btn">
				                            <Link href="contact">
				                            	<a><button type="button" className="btn btn-filled">Contact Us</button></a>
				                            </Link>
				                        </div>
				                    </div>
				                </div>
				                <div className="col-lg-4 col-md-12">
				                    <div className="contact-detail">
				                        <h4>Support</h4>
				                        <div className="contact-card">
				                            <span className="icon"> <img src="/static/assets/img/contact-us/email.svg" alt="img" /></span>
				                            <h5><a className="link" href="mailto:info@10ofthebest.com.au">info@10ofthebest.com.au</a></h5>
				                        </div>
				                        <div className="contact-card">
				                            <span className="icon"> <img src="/static/assets/img/contact-us/location.svg" alt="img" /></span>
				                            <h5>Suite 126, 6/197 - 205 Church Street, Parramatta NSW 2150 Australia.</h5>
				                        </div>
				                        <div className="contact-card">
				                            <span className="icon"> <img src="/static/assets/img/contact-us/call.svg" alt="img" /></span>
				                            <h5><a className="link" href="tel:1300 008 682">1300 008 682</a></h5>
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

export default withAuth(HelpPage, { loginRequired: false });