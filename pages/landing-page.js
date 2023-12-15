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

import Carousel from "react-multi-carousel";

class LandingPage extends React.Component {
	static getInitialProps({query}) {
		const LandingPage = true;
		const slug = query.slug;
		const collection = query.collection;
		const template_image_url = query.template_image_url;
		const restaurants = query.restaurants;
		const restaurant_image_url = query.restaurant_image_url;
		return { LandingPage, slug, collection, template_image_url, restaurants, restaurant_image_url };
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
			user: props.user || {},
			collection: props.collection || {},
			template_image_url: props.template_image_url || '',
			restaurants: props.restaurants || '',
			restaurant_image_url: props.restaurant_image_url || ''
		};

		this.carouselLoaded = this.carouselLoaded.bind(this);
	}

	carouselLoaded() {
		
	}

	render() {
		const {user, collection, template_image_url, restaurants, restaurant_image_url} = this.state;

		return (
			<main className="wrapper section-wrap">
				<Head>
					<title>{collection.name}</title>
					<meta name="title" content={collection.meta_title || collection.name} />
					<meta name="description" content={collection.meta_description || ''} />

					<meta property="og:locale" content="en_US" />
					<meta property="og:title" content={collection.meta_title || collection.name} />
					<meta property="og:type" content="article" />
					<meta property="og:url" content={process.env.SITE_URL + '/' + collection.city.toLowerCase().replace(/ /g,'-') + '/collection/' + collection.slug} />
					<meta property="og:image" content={collection.image || "https://totb-data.s3.ap-southeast-2.amazonaws.com/static/1140x324.jpg"} />

					<meta name="twitter:card" content="summary" />
					<meta name="twitter:title" content={collection.meta_title || collection.name} />
					<meta name="twitter:desription" content={collection.meta_description || ''} />
					<meta name="twitter:image" content={collection.image || "https://totb-data.s3.ap-southeast-2.amazonaws.com/static/1140x324.jpg"} />
					<meta name="twitter:url" content={process.env.SITE_URL + '/' + collection.city.toLowerCase().replace(/ /g,'-') + '/collection/' + collection.slug} />
				</Head>
				<Header user={user} />
				<section className="landing-page top-wrap">
					<div className="venue-top">
						<div className="container">
							<div className="row">
								<div className="col-md-12 col-lg-12 landing-top">
									<div className="tag-left">
										<h1>{collection.name}</h1>
										<h6>{collection.description}</h6>
									</div>
									<div className="mb-vw d-none">
										<div className="share-icon">
											<a href="#" className="btn btn-filled">
												<img src="/static/assets/img/landing/link-icon.svg" alt="img" />
											</a>
											<a href="#" className="btn btn-filled">
												<img src="/static/assets/img/landing/share-icon.svg" alt="img" />
											</a>
										</div>
									</div>
								</div>
								<div className="col-md-12 col-lg-5 ds-vw d-none">
									<div className="tag-right">
										<div className="share-link">
											<div className="input-group">
												<input type="text" className="form-control" placeholder="Share link here" />
												<div className="input-group-append">
													<button type="submit" className="btn btn-filled"><span className="">Share</span></button>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="landing-wrap">
						<div className="container">
							<div className="row">
								<div className="col-12">
									<div className="landing-banner">
										<h5>{collection.restaurants.length} Places</h5>
										<div className="outer-wrap">
											<img src={collection.image || "https://totb-data.s3.ap-southeast-2.amazonaws.com/static/1140x324.jpg"} alt="img" />
										</div>
									</div>
								</div>
							</div>
							<div className="places-list">
								<div className="row">
									{restaurants.map(function(restaurant, i){
										return(
											<Link href={"/"+ restaurant.city.toLowerCase().replace(" ","-") + '/' + restaurant.slug} key={i}>
												<a className="col-sm-12 col-md-6 col-lg-4 list-item">
													<div>
														<div className="location-card">
															<div className="img-wrap">
																{restaurant.images.length > 0 ? <img src={restaurant.images[0].image || ''} alt="img" /> : <img src='https://totb-data.s3.ap-southeast-2.amazonaws.com/static/410x160.jpg' alt="img" />}
																<div className="star-lbl">
																	<span><i className="fa fa-star" aria-hidden="true"></i></span>{restaurant.avg_review}
																</div>
															</div>
															<div className="info">
																{restaurant.cuisine_types.length > 0 && <h5 className="label">{restaurant.cuisine_types[0].name + ' Food'}</h5>}
																<h4>{restaurant.name}</h4>
																<div className="place-info">
																	<div className="loc">
																		<span><img src="/static/assets/img/map-view.svg" alt="img" /></span>{restaurant.city}
																	</div>
																	<div className="person">
																		<span><i className="fa fa-user-o" aria-hidden="true"></i></span>{restaurant.avg_cost ? "$"+restaurant.avg_cost+" for Per Person" : "Not mentioned"}
																	</div>
																</div>
															</div>
														</div>
													</div>
												</a>
											</Link>
										);
									})}
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

export default withAuth(LandingPage, { loginRequired: false });