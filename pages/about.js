import Link from 'next/link';
import Head from 'next/head';

import Header from '../components/HomeHeader';
import Footer from '../components/HomeFooter';

import withAuth from '../lib/withAuth';
import Script from 'react-load-script';

class AboutDetails extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			user: props.user || {}
		};

		this.carouselLoaded = this.carouselLoaded.bind(this);
	}

	carouselLoaded() {
		$('.testimonial-carousel').owlCarousel({
			items: 3.5,
			loop: true,
			autoplay: false,
			margin: 0,
			nav: true,
			dots: false,
			navText: ["<img src='/static/assets/img/back.svg'>", "<img src='/static/assets/img/next.svg'>"],
			responsiveClass: true,
			responsive: {
				0:{
				  items: 1
				},
				480:{
				  items: 1
				},
				769:{
				  items: 1
				},
				 768:{
				  items: 1
				},
				991:{
				  items: 1
				},
				992:{
				  items: 2.5
				},
				1024:{
				  items: 2.5
				},
				1600:{
				  items: 2.5
				},
				1920:{
				  items: 3.5
				}
			}
		});
	}

	render() {
		const {user} = this.state;

		return (
			<main className="wrapper listing-event-detail">
				<Head>
					<title>About Us - 10 of The Best</title>
					<meta name="title" content="About Us - 10 of The Best" />
					<meta name="description" content="10 of The Best is a comprehensive guide that offer unbiased reviews, rating and information about Australia's top venues, trending restaurants, cafes & bars." />
				</Head>
				<Header user={user} />
				<section className="about-us-wrap top-wrap">
					<div className="venue-top">
						<div className="container">
							<div className="row">
								<div className="col-12">
									<div className="dark-menu">
										<ul className="breadcrumb">
											<li><a>Home</a></li>
											<li className="active"><a>About Us</a></li>
										</ul>
									</div>
								</div>
							</div>
							<div className="row">
								<div className="col-12">
									<div className="tag-left">
										<h1>About Us</h1>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="about-us">
						<div className="about-us-info">
							<div className="container">
								<div className="row">
									<div className="col-12 order-lg-last col-lg-6">
										<div className="box-img">
											<div className="info-img">
												<img src="/static/assets/img/about-us/about-us.webp" alt="" />
											</div>
										</div>
									</div>
									<div className="col-12 order-lg-first col-lg-6 my-5 my-lg-0">
										<div className="box-info">
											<h3>Who we are</h3>
											<div className="box-text">
		                                        <p>"10 of The Best" is a comprehensive guide that brings the most talked about venues, trending restaurants, cafes and sought after party spots on a single platform and lets its users make an informed choice while making a booking, in real-time. So, whatever be the occasion, be it a social gathering, a business lunch, a quiet dinner or an ecstatic party, the users are spoilt with choice when they visit <Link href="/"><a target="_blank">"10 of The Best"</a></Link>.
		                                        </p>
		                                        <p>As the occasion demands, and in accordance to the customer's preference, "10 of the best" lets its users book a venue, a table at a restaurant or cafe, or the most happening party spot in the town, from a diverse and long list of partner venues, restaurants, and bars.</p>
		                                        <p>What's more, it also rewards its customers through various customer loyalty programs that offer discounts and rewards to its members.
		                                        </p>
		                                    </div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="our-mission">
							<div className="container">
								<div className="row">
									<div className="col-12 col-lg-6">
										<div className="box-img">
											<div className="info-img">
												<img src="/static/assets/img/about-us/mission.webp" alt="" />
											</div>
										</div>
									</div>
									<div className="col-12 col-lg-6 my-5 my-lg-0">
										<div className="box-info">
											<h3>Our Mission</h3>
											<div className="box-text">
		                                        <p>"10 of The Best" was founded with the singular mission of serving our clientele by providing them an enhanced experience while they look for a venue, restaurants, cafe or a party joint for their personal or business needs, in Australia.
		                                        </p>
		                                        <p>We want to develop a crowdsourced booking platform that provides an unparalleled user experience in terms of search results and reviews, thereby simplifying the complex process of searching and booking a venue for the right occasion.
		                                        </p>
		                                    </div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="our-vision">
							<div className="container">
								<div className="row">
									<div className="col-12 col-lg-6 order-lg-last">
										<div className="box-img">
											<div className="info-img">
												<img src="/static/assets/img/about-us/vision.webp" alt="" />
											</div>
										</div>
									</div>
									<div className="col-12 col-lg-6 order-lg-first my-5 my-lg-0">
										<div className="box-info">
											<h3>Our Vision</h3>
											<div className="box-text">
		                                        <p>It is our aim to offer experiential services to our clientele and become Australia's most preferred booking platform for venues, eateries, bars, and party joints. 
		                                        </p>
		                                        <p>We wish to achieve sustainable growth by offering a wide range of services that will cater to the varied needs of our clients thereby achieving the highest levels of customer loyalty.
		                                        </p>
		                                    </div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="testimonials">
						<div className="container">
							<h3>Testimonials</h3>
						</div>
					</div>
					<div className="testimonial-slider ">
						<div className="box-slider">
							<div className="row align-items-center">
								<div className="col-12 col-carousel">
									<div className="owl-carousel testimonial-carousel">
										<div className="item">
											<div className="box">
												<div className="quote-icon">
													<img src="/static/assets/img/about-us/quote-icon.svg" alt="" />
												</div>
												<div className="msg">
													I like the user experience of "10 of The Best" vis a vis other booking sites. The site has been designed keeping in mind a smooth and easy to navigate experience for the site visitors. Needless to say, the deals and customer loyalty program is something I can vouch for and strongly recommend to others.
												</div>
												{/*<div className="user-profile">
													<div className="user-img">
														<img src="/static/assets/img/about-us/user.png" alt="" />
													</div>
													<div className="user-info">
														<h5>Daniel Bowman</h5>
														<h6>Senior Designer</h6>
													</div>
												</div>*/}
											</div>
										</div>
										<div className="item">
											<div className="box">
												<div className="quote-icon">
													<img src="/static/assets/img/about-us/quote-icon.svg" alt="" />
												</div>
												<div className="msg">
													The most amazing thing about booking through 10 of The Best is the number of options, be it for restaurants, cafes or pubs. The cherry on the deal is the rewards and discounts that are available exclusively on "0 of The Best.
												</div>
												{/*<div className="user-profile">
													<div className="user-img">
														<img src="/static/assets/img/about-us/user.png" alt="" />
													</div>
													<div className="user-info">
														<h5>Daniel Bowman</h5>
														<h6>Senior Designer</h6>
													</div>
												</div>*/}
											</div>
										</div>
										<div className="item">
											<div className="box">
												<div className="quote-icon">
													<img src="/static/assets/img/about-us/quote-icon.svg" alt="" />
												</div>
												<div className="msg">
													I have been using 10 of The Best as a preferred platform whenever I want to make a booking for a venue or book a table at the restaurant. I find the reviews on the site to be genuine and of great help while making the selection from a lengthy and diverse list of venues and restaurants.
												</div>
												{/*<div className="user-profile">
													<div className="user-img">
														<img src="/static/assets/img/about-us/user.png" alt="" />
													</div>
													<div className="user-info">
														<h5>Phillip Reyes</h5>
														<h6>Co - Founder</h6>
													</div>
												</div>*/}
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
			</main>
		);
	}
}

export default withAuth(AboutDetails, { loginRequired: false });