import Head from 'next/head';
import PropTypes from 'prop-types';

import Header from '../components/HomeHeader';
import Footer from '../components/HomeFooter';

class ThankYou extends React.Component {
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
					<title>Thank You!!</title>
				</Head>

				{/* header */}
				<Header user={user} />

				{/* body */}
				<section className="error__wrap">
                    <div className="container">
                        <div className="row">
                            <div className="col-12 col-lg-8 offset-lg-2 mb-5">
                                <div className="error__content text-center">
                                    <h4 className="error__content--title pb-2 pt-3">
                                        <span className="highlight">Thanks for your registration.</span>
                                    </h4>
                                    <p className="error__content--desc pb-4">
                                        You will be notified through email after your account will be listed on '<b>10 of The Best</b>' in few hours.
                                    </p>
                                    <a href="/melbourne" className="page__link">VISIT OUR WEBSITE</a>
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

export default ThankYou;