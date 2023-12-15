import Head from 'next/head';
import PropTypes from 'prop-types';

import Header from '../components/HomeHeader';
import Footer from '../components/HomeFooter';

class NotFound extends React.Component {
	static propTypes = {
		user: PropTypes.shape({
			_id: PropTypes.string,
		})
	};

	constructor(props) {
		super(props);
		this.state = {
			user: props.user || {}
		};
	}

	render() {
		const { user } = this.state;
        
		return (
			<main className="wrapper section-wrap">
				{/* Head section where we can send meta tags */}
				<Head>
					<title>Page not found!!</title>
				</Head>

				{/* header */}
				<Header user={user} />

				{/* body */}
				<section className="error__wrap">
                    <div className="container">
                        <div className="row">
                            <div className="col-12 col-lg-8 offset-lg-2">
                                <div className="404__img mb-5 text-center">
                                    <img src="/static/assets/img/404-page/404-img.png" alt="img" className="img-fluid" />
                                </div>
                            </div>
                            <div className="col-12 col-lg-8 offset-lg-2 mb-5">
                                <div className="error__content text-center">
                                    <h4 className="error__content--title pb-2 pt-3">
                                        <span className="highlight">Oops!</span> Something is broken.
                                    </h4>
                                    <p className="error__content--desc pb-4">
                                        looks like you lost somewhere. The page you were looking for doesn't exist. You may mistyped the address or the page may have moved.
                                    </p>
                                    <a href="/melbourne" className="page__link">BACK TO HOME</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* footer  */}
				<Footer user={user} />
			</main>
		);
	}
}

export default NotFound;