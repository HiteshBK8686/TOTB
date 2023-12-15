import PropTypes from 'prop-types';
import Link from 'next/link';
import Head from 'next/head';
import NProgress from 'nprogress';
import notify from '../lib/notifier';
import Router from 'next/router';

import withAuth from '../lib/withAuth';
import { forgotpassword } from '../lib/api/auth';

const styleTeamMember = {
  textAlign: 'center',
  padding: '10px 5%',
};



class ForgotPassword extends React.Component {
  static getInitialProps() {
    const loginPage = true;
    return { loginPage };
  }

  static propTypes = {
    userdata: PropTypes.shape({
      _id: PropTypes.string.isRequired,
    })
  };

  static defaultProps = {
    userdata: null,
  };

  async componentDidMount() {
    NProgress.done();
  }

  constructor(props) {
    super(props);

    this.state = {
      userdata: props.userdata || {}
    };
  }

  onSubmit = (event) => {
    event.preventDefault();
    const { userdata } = this.state;
    const { email } = userdata;

    if (!email) {
      notify('Email is required');
      return;
    }

    this.forgotpassword(userdata);
  };

  forgotpassword = async (data) => {
    NProgress.start();
    try {
      const userdata = await forgotpassword(data);
      console.log(JSON.stringify(userdata));
      notify('Email sent successfully!');
      NProgress.done();
    } catch (err) {
      notify(err);
      NProgress.done();
    }
  };

  render() {
    const { userdata } = this.state;
    return (
      <div id="page-container">
        <Head>
          <title>TOTB Admin -- Forgot Password</title>
        </Head>
        <main id="main-container">
          <div className="bg-image" style={{backgroundImage:'url(../static/assets/media/photos/photo6@2x.jpg)'}}>
            <div className="hero-static bg-white-95">
              <div className="content">
                <div className="row justify-content-center">
                  <div className="col-md-8 col-lg-6 col-xl-4">
                    <div className="block block-themed block-fx-shadow mb-0">
                      <div className="block-header">
                        <h3 className="block-title">Password Reminder</h3>
                        <div className="block-options">
                          <Link href="/login">
                          <a className="btn-block-option">
                            <i className="fa fa-sign-in-alt"></i>
                          </a>
                          </Link>
                        </div>
                      </div>
                      <div className="block-content">
                        <div className="p-sm-3 px-lg-4">
                          <img style={{width:'100%'}} src="/static/assets/media/logo.png" />
                          <form className="js-validation-reminder" onSubmit={this.onSubmit}>
                            <div className="form-group py-3">
                              <div className="form-group">
                                <input  
                                  onChange={(event) => {
                                    this.setState({
                                      userdata: Object.assign({}, userdata, { email: event.target.value }),
                                    });
                                  }}
                                  type="text" 
                                  className="form-control form-control-alt form-control-lg" 
                                  id="login-email" 
                                  name="email" 
                                  placeholder="Email" 
                                />
                              </div>
                            </div>
                            <div className="form-group row">
                              <div className="col-md-6 col-xl-5">
                                <button type="submit" className="btn btn-block btn-primary">
                                  <i className="fa fa-fw fa-envelope mr-1"></i> Submit
                                </button>
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="content content-full font-size-sm text-muted text-center">
                <strong>Copyright</strong> &copy; <span data-toggle="year-copy">2019</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default withAuth(ForgotPassword, { logoutRequired: true });
