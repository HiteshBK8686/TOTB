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

class PrivacyPolicyPage extends React.Component {
	static getInitialProps({query}) {
		const PrivacyPolicyPage = true;
		return { PrivacyPolicyPage };
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
					<title>Privacy Policy - 10 of The Best</title>
				</Head>
				<Header user={user} />
				<section className="privacy-page terms-page top-wrap">
					<div className="venue-top">
						<div className="container">
							<div className="row">
								<div className="col-12">
									<div className="dark-menu">
										<ul className="breadcrumb">
											<li><a href="#">Home</a></li>
											<li className="active"><a href="#">Privacy Policy</a></li>
										</ul>
									</div>
								</div>
							</div>
							<div className="row">
								<div className="col-12">
									<div className="tag-left">
										<h1>Privacy Policy</h1>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="terms-wrap privacy-content">
						<div className="container">
							<div className="row justify-content-center">
								<div className="col-lg-8 col-md-12">
									<div className="middle-content">
										<p>t is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. </p>
										<p>
											When Beacon can’t identify the person starting a chat as an existing contact, by default it will automatically ask for an email address. In some cases (like a sales enquiry) that could add some unhelpful friction to the conversation. Good news! You can now turn off that automatic email address request in the Chat Options for any Beacon
										</p>
										<h4>Lorem ipsum generator</h4>
										<p>
											"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
										</p>
										<p>
											There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.
										</p>
										<h4>True Generators Randomised</h4>
										<p>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet.</p>
										<div className="list-content">
											<ul>
												 <li>
												Eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem veritatis et quasi.
											</li>
											<li>
												Passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words
											</li>
											<li>
												randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, injected houmor randoimised which don’t look.
											</li>
											<li>
												"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae
											</li>
											<li>
												 Person starting a chat as an existing contact, by default it will automatically ask for an email address. In some cases (like a sales enquiry) that could add some unhelpful 
											</li>
											</ul>
										   
										</div>
										<p>
											Mllamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.
										</p>
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