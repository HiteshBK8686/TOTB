import PropTypes from 'prop-types';
import Link from 'next/link';
import Head from 'next/head';

import Header from '../components/HomeHeader';
import Footer from '../components/HomeFooter';
import NProgress from 'nprogress';

import withAuth from '../lib/withAuth';

import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

class Index extends React.Component {
  static getInitialProps() {
    const indexPage = true;
    return { indexPage };
  }

  
  async componentDidMount() {
    {/*
    document.getElementsByClassName('.trend-carousel').owlCarousel({
      loop: true,
      margin: 0,
      nav: false,
      dots: true,
      center: true,
      items:2,
      animateOut: 'slideInLeft',
      animateIn: 'slideOutRight'
    });

    document.getElementsByClassName('.restro-carousel').owlCarousel({
      loop: true,
      margin: 30,
      nav: false,
      dots: true,
      center: true,
      items:2,
      animateOut: 'slideInLeft',
      animateIn: 'slideOutRight'
    });

    document.getElementsByClassName('.category-carousel').owlCarousel({
      loop: true,
      margin: 0,
      nav: false,
      dots: true,
       center: true,
      items:2,
      animateOut: 'slideInLeft',
      animateIn: 'slideOutRight'
    });
    */}

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
    };
    

  }

  render() {
    const { user } = this.state;
    const responsive = {
      superLargeDesktop: {
        // the naming can be any, depends on you.
        breakpoint: { max: 4000, min: 3000 },
        items: 5,
      },
      desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: 3,
      },
      tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 2,
      },
      mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 1,
      },
    };

    return (
      <main className="wrapper unsubscribe-page">
        <Head>
          <title>Welcome to 10ofTheBest</title>
        </Head>
        <Header user={user} />
         <section className="unsubscribe section">
                <div className="container-fluid">
                    <div className="outer-sec">
                        <div className="top-sec text-center">
                            <div className="icon">
                                <img src="/static/assets/img/unsubscribe-icon.svg" alt="image" />
                            </div>
                            <h2>Unsubscribe Successful</h2>
                            <h6>We are sorry to find you are no longer interested in our newsletters. Please, take a moment to tell us why you no longer wish to hear from us:
                            </h6>
                        </div>
                        <div className="mid-sec">
                            <div className="select-opt">
                                <p>
                                    <input type="radio" id="test1" name="radio-group" checked={true} />
                                    <label for="test1">I no longer want to receive these emails</label>
                                </p>
                                <p>
                                    <input type="radio" id="test2" name="radio-group" />
                                    <label for="test2">The Newsletters are too frequent</label>
                                </p>
                                <p>
                                    <input type="radio" id="test3" name="radio-group" />
                                    <label for="test3">I never signed up for these newsletters</label>
                                </p>
                                <p>
                                    <input type="radio" id="test4" name="radio-group" />
                                    <label for="test4">The content of the emails often repeats itself and gets boring</label>
                                </p>
                                <p>
                                    <input type="radio" id="test5" name="radio-group" />
                                    <label for="test5">These emails are not relevant to me</label>
                                </p>
                                <p>
                                    <input type="radio" id="test6" name="radio-group" />
                                    <label for="test6">I receive too many emails in general</label>
                                </p>
                                <p>
                                    <input type="radio" id="test7" name="radio-group" />
                                    <label for="test7">I unsubscribed by accident! Please add me back to this list
                                    </label>
                                </p>
                                <p>
                                    <input type="radio" id="test8" name="radio-group" />
                                    <label for="test8">Other (fill in reason below)</label>
                                </p>
                            </div>
                            <div className="form-group">
                                <textarea className="form-control md-textarea" id="message" rows="3" required></textarea>
                            </div>
                            <div className="form-submit text-center">
                                <button className="btn btn-filled" type="submit">Submit</button>
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

export default withAuth(Index, { loginRequired: false });