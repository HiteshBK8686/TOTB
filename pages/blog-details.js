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

class BlogDetails extends React.Component {
	static getInitialProps({query}) {
		const BlogDetails = true;
		return { BlogDetails };
	}


	async componentDidMount() {
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
			<main className="wrapper listing-event-detail">
				<Head>
					<title>10 of The Best</title>
				</Head>
				<Header user={user} />
				<section className="blog-detail top-wrap">
					<div className="venue-top">
						<div className="container">
							<div className="row">
								<div className="col-12">
									<div className="dark-menu">
										<ul className="breadcrumb">
											<li><a href="#">Home</a></li>
											<li className="active"><a href="#">Blog</a></li>
										</ul>
									</div>
								</div>
							</div>
							<div className="row">
								<div className="col-12">
									<div className="tag-left">
										<h1>How Beacon Helps You Provide the Best Service to Your Customers</h1>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="blog-detail-wrap">
						<div className="blog-top">
							<div className="container">
								<div className="row">
									<div className="col-lg-8 col-md-12">
										<div className="event-details">
											<div className="event-desc">
												<p>
													However, just because a topic is peppered with plenty of “maybes” and “sort ofs” doesn’t mean we should stop thinking critically about it. Use the research available to challenge notions and to raise better questions; it’s the one consistent way to reach better answers.
												</p>
												<p>
													When Beacon can’t identify the person starting a chat as an existing contact, by default it will automatically ask for an email address. In some cases (like a sales enquiry) that could add some unhelpful friction to the conversation. Good news! You can now turn off that automatic email address request in the Chat Options for any Beacon
												</p>
												<p>
													Learn more about Messages here, and stay tuned for next week’s article — a deep dive into how Messages extend Beacon with powerful triggers, allowing you to automatically reach out to the right people at the right time.
												</p>
												<div className="event-img">
													<img src="/static/assets/img/blog/blog-1.png" alt="" />
												</div>
												<p>
													When Beacon can’t identify the person starting a chat as an existing contact, by default it will automatically ask for an email address. In some cases (like a sales enquiry) that could add some unhelpful friction to the conversation. Good news! You can now turn off that automatic email address request in the Chat Options for any Beacon
												</p>
												<p>
													Learn more about Messages here, and stay tuned for next week’s article — a deep dive into how Messages extend Beacon with powerful triggers, allowing you to automatically reach out to the right people at the right time.
												</p>
												<div className="highlight-text">
													However, just because a topic is peppered with plenty of “maybes” and “sort ofs” doesn’t mean we should stop thinking critically about it.
												</div>
												<p>However, just because a topic is peppered with plenty of “maybes” and “sort ofs” doesn’t should stop thinking critically about it. Use the research available to challenge notions and to raise better questions; it’s the one consistent way to reach better answers esearch available Learn more about Messages here, and stay tuned for next week’s article — a deep dive into how with powerful triggers, reach out to the right people at the right time.</p>
												<p>When Beacon can’t identify the person starting a chat as an existing contact, by default it will automatically ask for an email address. In some cases (like a sales enquiry) that could add some unhelpful friction to the conversation. Good news! You can now turn off that automatic email address request in the Chat Options for any Beacon</p>
											</div>
										</div>
										<div className="event-tabs">
											<ul className="event-title">
												<li>
													Problematic, often wrong classification of elements as atoms.
												</li>
												<li>
													Extended time of adjusting the interface element to the appropriate.
												</li>
												<li>
													increased risk of the need for refactoring because of mistakes made due to misunderstanding the methodology.
												</li>
												<li>
													extensive dispersion of elements belonging to the same family.
												</li>
											</ul>
										</div>
										<div className="share-blog">
											<div className="share-text">Share</div>
											<div className="share-social">
												<div className="social-links">
													<a href="https://www.facebook.com/10ofthebest/" className="facebook">
														<i className="fa fa-facebook" aria-hidden="true"></i>
													</a>
													<a href="https://www.instagram.com/10ofthebest_totb/" className="instagram">
														<i className="fa fa-instagram" aria-hidden="true"></i>
													</a>
													<a href="https://twitter.com/10ofTheBest1" className="twitter">
														<i className="fa fa-twitter" aria-hidden="true"></i>
													</a>
													<a href="https://www.linkedin.com/company/10ofthebest" className="linked-in">
														<i className="fa fa-linkedin" aria-hidden="true"></i>
													</a>
												</div>
											</div>
										</div>
									</div>
									<div className="col-lg-4 col-md-12">
										<div className="right-panel">
											<div className="subscribe-box text-center">
												<div className="icon">
													<img src="/static/assets/img/blog/Susbcribe- icon.png" alt="" />
												</div>
												<h5>Subscribe to our newsletter</h5>
												<div className="email-tab">
													<input type="email" className="form-control" placeholder="Email Address" required="" />
												</div>
												<div className="subscribe-btn">
													<button className="btn btn-filled" type="submit">Subscribe Now</button>
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

export default withAuth(BlogDetails, { loginRequired: false });