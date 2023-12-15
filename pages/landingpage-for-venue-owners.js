import PropTypes from 'prop-types';
import Head from 'next/head';
import './landingpage-for-venue-owners.css';

import Header from '../components/HomeHeader';
import Footer from '../components/HomeFooter';
import NProgress from 'nprogress';

import withAuth from '../lib/withAuth';
import Script from 'react-load-script';

class LandingPageForVenueOwners extends React.Component {
	static getInitialProps() {
		const LandingPageForVenueOwners = true;
		return { LandingPageForVenueOwners };
	}


	async componentDidMount() {
		NProgress.done();
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
		};

        this.handleScriptLoad = this.handleScriptLoad.bind(this);
        this.handleCarousel = this.handleCarousel.bind(this);
	}

    handleScriptLoad() {
        $("#accordion").on("hide.bs.collapse show.bs.collapse", e => {
            $(e.target)
                .prev()
                .find("i:last-child")
                .toggleClass("fa-plus fa-minus");
        });

        // accordion add active class 

        $(document).ready(function() {
            $('.collapse').on('show.bs.collapse', function() {
                $(this).siblings('.card-header').addClass('active');
                $(this).parent('.card').addClass('active');
            });

            $('.collapse').on('hide.bs.collapse', function() {
                $(this).siblings('.card-header').removeClass('active');
                $(this).parent('.card').removeClass('active');
            });
        });
    }

    handleCarousel() {
        $('.feedback_carousel').owlCarousel({
            loop: true,
            margin: 30,
            nav: false,
            dots: true,
            responsive: {
                0: {
                    items: 1
                },
                991: {
                    items: 2
                }
            }
        });
    }

	render() {
        const {user} = this.state;
		return (
			<main className="wrapper section-wrap" style={{marginTop:'0px'}}>
				<Head>
					<title>Membership Benefits for Restaurants & Venues - 10 of The Best</title>
				</Head>
				<section className="intro-section">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-12 col-md-6">
                                <div className="heading">
                                    <h1>A great pool of customers now within your reach.</h1>
                                    <p>Get listed on <span className="highlight green">'10 of The Best'</span> and draw a large customer base.</p>
                                    <a data-toggle="modal" data-target="#registerClientModal" className="btn btn-filled btn-yellow">Register Your Restaurant</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="feature-section">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-12 col-lg-4">
                                <div className="heading">
                                    <h3>Why <span className="highlight">10 of The Best?</span></h3>
                                    <p>This Australian platform gives you the visibility, reach, flexibility and insights that you need to grow your business.</p>
                                </div>
                            </div>
                            <div className="col-12 col-lg-8">
                                <div className="feature-list">
                                    <div className="feature-item">
                                        <span className="icon"><img src="/static/assets/img/new-landing/feature-icon-1.svg" alt="" /></span>
                                        <h4 className="feature-title">Personalised</h4>
                                        <p className="feature-desc">Customer’s review and interaction</p>
                                    </div>
                                    <div className="feature-item">
                                        <span className="icon"><img src="/static/assets/img/new-landing/feature-icon-2.svg" alt="" /></span>
                                        <h4 className="feature-title">Reach</h4>
                                        <p className="feature-desc">Millions of customers</p>
                                    </div>
                                    <div className="feature-item">
                                        <span className="icon"><img src="/static/assets/img/new-landing/feature-icon-3.svg" alt="" /></span>
                                        <h4 className="feature-title">Dashboard</h4>
                                        <p className="feature-desc">Access to manage it all</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="process-section">
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                <div className="heading">
                                    <h3>How it <span className="highlight">works</span></h3>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12 col-md-4">
                                <div className="pr-card">
                                    <span className="pr-count">01</span>
                                    <h4 className="pr-title">Create your profile on 10 of The Best</h4>
                                    <p className="pr-desc">Help users discover your business by signing up on <span className="highlight green">10 of The Best</span>.</p>
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="pr-card">
                                    <span className="pr-count">02</span>
                                    <h4 className="pr-title">List your business</h4>
                                    <p className="pr-desc">Complete your profile to tell about your business to users.</p>
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="pr-card">
                                    <span className="pr-count">03</span>
                                    <h4 className="pr-title">Get access to the dashboard</h4>
                                    <p className="pr-desc">Manage your profile and boost your visibility by extending your reach to millions of potential customers.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="cta-light">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-12 col-xl-8">
                                <div className="cta-title pb-4 pb-xl-0">
                                    <h3>Get listed on '10 of The Best' and unlock doors to millions of potential customers.</h3>
                                </div>
                            </div>
                            <div className="col-12 col-xl-4">
                                <a data-toggle="modal" data-target="#registerClientModal" className="btn btn-filled btn-yellow">REGISTER YOUR RESTAURANT</a>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="join-section">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-12 col-md-6">
                                <div className="heading">
                                    <h3>How to <span className="highlight">Get Started</span></h3>
                                    <ul className="list-totb">
                                        <li>Sign up on <span className="highlight green">10 of The Best</span></li>
                                        <li>Fill in details to complete your profile</li>
                                        <li>Access dashboard</li>
                                        <li>Get listed and grow</li>
                                    </ul>
                                </div>
                                <a data-toggle="modal" data-target="#registerClientModal" className="btn btn-filled btn-yellow">SIGN UP NOW!</a>
                            </div>
                            <div className="col-12 col-md-6 d-none d-md-block">
                                <img src="/static/assets/img/new-landing/join-section-bg.png" alt="" className="img-fluid mx-auto d-block" />
                            </div>
                        </div>
                    </div>
                </section>
                <section className="cta-testimonial">
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                <div className="heading">
                                    <h3>What Our Customers Are <span className="highlight">Saying</span></h3>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <div className="owl-carousel feedback_carousel">
                                    <div className="item">
                                        <div className="feedback_box">
                                            <div className="quote">
                                                <img src="/static/assets/img/new-landing/quote.svg" className="img-fluid" alt="img" />
                                            </div>
                                            <p className="content">
                                                We are particularly satisfied with the marketing push provided by 10 of the Best. The events and top 10 lists have brought us, patrons, from across the city. We are now exclusive with 10 of the Best and we are prepared for further growth in our restaurant business.
                                            </p>
                                            <div className="customer-detail d-flex align-items-center">
                                                {/* <div className="customer-img">
                                                    <img src="/static/assets/img/user.png" className="img-fluid" alt="img" />
                                                </div> */}
                                                <div className="customer-profile">
                                                    <h6 className="name">Oliver Smith</h6>
                                                    {/* <p className="designation">Creative Director</p> */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="item">
                                        <div className="feedback_box">
                                            <div className="quote">
                                                <img src="/static/assets/img/new-landing/quote.svg" className="img-fluid" alt="img" />
                                            </div>
                                            <p className="content">
                                                10 of the Best is a revolutionary platform that made us reach the customers who were looking for event venues. Our venue has profited greatly even during COVID by using the amazing marketing strategies and newsletters on this platform.
                                            </p>
                                            <div className="customer-detail d-flex align-items-center">
                                                {/* <div className="customer-img">
                                                    <img src="/static/assets/img/user.png" className="img-fluid" alt="img" />
                                                </div> */}
                                                <div className="customer-profile">
                                                    <h6 className="name">Adham Aziz</h6>
                                                    {/* <p className="designation">Creative Director</p> */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="item">
                                        <div className="feedback_box">
                                            <div className="quote">
                                                <img src="/static/assets/img/new-landing/quote.svg" className="img-fluid" alt="img" />
                                            </div>
                                            <p className="content">
                                                Our marketing efforts are saved as 10 of the Best does most of the work for us. Now, potential customers can discover our brand easily on this platform. We could actually engage the guests and build confidence among our repeated customers using this exceptional platform.
                                            </p>
                                            <div className="customer-detail d-flex align-items-center">
                                                {/* <div className="customer-img">
                                                    <img src="/static/assets/img/user.png" className="img-fluid" alt="img" />
                                                </div> */}
                                                <div className="customer-profile">
                                                    <h6 className="name">Noah Brown</h6>
                                                    {/* <p className="designation">Creative Director</p> */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="item">
                                        <div className="feedback_box">
                                            <div className="quote">
                                                <img src="/static/assets/img/new-landing/quote.svg" className="img-fluid" alt="img" />
                                            </div>
                                            <p className="content">
                                                Earlier, it was difficult to attract so many diners and we were troubled by the growing competition. But when we partnered with 10 of the Best, we could promote our restaurant and cater to a huge number of patrons. The reviews left by our happy customers have benefitted us even more.
                                            </p>
                                            <div className="customer-detail d-flex align-items-center">
                                                {/* <div className="customer-img">
                                                    <img src="/static/assets/img/user.png" className="img-fluid" alt="img" />
                                                </div> */}
                                                <div className="customer-profile">
                                                    <h6 className="name">Pranav T N</h6>
                                                    {/* <p className="designation">Creative Director</p> */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="cta-dark">
                    <div className="container">
                        <div className="row align-items-center justify-content-center text-center">
                            <div className="col-12 col-md-7">
                                <div className="cta-title">
                                    {/* <h3>Lorem ipsum dolor sit amet, elit, tempor incididunt</h3> */}
                                    <p className="contant">
                                        Get listed on '10 of The Best' and unlock doors to millions of potential customers.
                                    </p>
                                </div>
                                <a data-toggle="modal" data-target="#registerClientModal" className="btn btn-filled btn-green">REGISTER YOUR RESTAURANT</a>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="faq-section">
                    <div className="container">
                        <div className="row">
                            <div className="col-12 col-md-8 mx-auto">
                                <div className="heading">
                                    <h3>Frequently Asked <span className="highlight">Questions</span></h3>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12 col-md-8 mx-auto">
                                <div className="faq-accordian faq-accordian-border">
                                    <div id="accordion" className="myaccordian">
                                        <div className="card">
                                            <div className="card-header" id="heading1" data-toggle="collapse" data-target="#collapse1" aria-expanded="true" aria-controls="collapse1">
                                                <h5>
                                                    What will 10 of The Best charge me for creating a profile on its platform?
                                                </h5>
                                                <span className="toggle-arrow">
                                                    <i className="fa fa-plus"></i>
                                                </span>
                                            </div>
                                            <div id="collapse1" className="collapse" aria-labelledby="heading1" data-parent="#accordion">
                                                <div className="card-body">
                                                    <p>Creating a business profile on 10 of The Best is free of cost. You can maintain your page by replying to reviews and do a lot more with its free plan.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card">
                                            <div className="card-header" id="heading2" data-toggle="collapse" data-target="#collapse2" aria-expanded="true" aria-controls="collapse2">
                                                <h5>
                                                    When can I get access to my dashboard?
                                                </h5>
                                                <span className="toggle-arrow">
                                                    <i className="fa fa-plus"></i>
                                                </span>
                                            </div>
                                            <div id="collapse2" className="collapse" aria-labelledby="heading2" data-parent="#accordion">
                                                <div className="card-body">
                                                    <p>As soon as you are done with a successful registration on 10 of The Best, you get access to your dashboard, where you can list your business to boost visibility.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card">
                                            <div className="card-header" id="heading3" data-toggle="collapse" data-target="#collapse3" aria-expanded="true" aria-controls="collapse3">
                                                <h5>
                                                    Do I have to create multiple profiles for different businesses I run?
                                                </h5>
                                                <span className="toggle-arrow">
                                                    <i className="fa fa-plus"></i>
                                                </span>
                                            </div>
                                            <div id="collapse3" className="collapse" aria-labelledby="heading3" data-parent="#accordion">
                                                <div className="card-body">
                                                    <p>This platform welcomes all the businesses that come under eateries and venue categories. You can add, access and manage all your listed businesses from a single dashboard.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Script url="/static/assets/js/owl.carousel.min.js" onLoad={this.handleCarousel} />
                    <Script url="https://maps.googleapis.com/maps/api/js?key=AIzaSyBl6RyVLorSd0PbXxpsX9sKFcvYKsRMfVE" onLoad={this.handleScriptLoad} />
                </section>
				<Footer user={user} />
			</main>
		);
	}
}

export default withAuth(LandingPageForVenueOwners, { loginRequired: false });