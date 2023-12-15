import PropTypes from 'prop-types';
import Link from 'next/link';
import Head from 'next/head';
import NProgress from 'nprogress';
import notify from '../lib/notifier';
import Router from 'next/router';

import withAuth from '../lib/withAuth';
import { login } from '../lib/api/auth';

const styleTeamMember = {
  textAlign: 'center',
  padding: '10px 5%',
};



class LoginWithData extends React.Component {
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
    const { username, password } = userdata;

    if (!username) {
      notify('Username is required');
      return;
    }

    if (!password) {
      notify('Password is required');
      return;
    }

    this.login(userdata);
  };

  login = async (data) => {
    NProgress.start();
    try {
      const userdata = await login(data);
      console.log(JSON.stringify(userdata));
      console.log(JSON.stringify(data));
      if(data.remember_me != undefined && data.remember_me == true){
        window.localStorage.setItem("user", JSON.stringify(userdata));
      } else{

      }
      notify('Login Successful!');
      try {
        const userId = userdata._id;
        NProgress.done();
        window.location.href = '/';
      } catch (err) {
        // notify(err);
        notify('Username/Password mismatch!');
        NProgress.done();
      }
    } catch (err) {
      // notify(err);
      notify('Username/Password mismatch!');
      NProgress.done();
    }
  };

  render() {
    const { userdata } = this.state;
    return (
      <div id="page-container">
        <Head>
          <title>TOTB Admin -- Login</title>
        </Head>
        <main id="main-container">
          <div className="bg-image" style={{backgroundImage:'url(../static/assets/media/photos/photo6@2x.jpg)'}}>
            <div className="hero-static bg-white-95">
              <div className="content">
                <div className="row justify-content-center">
                  <div className="col-md-8 col-lg-6 col-xl-4">
                    <div className="block block-themed block-fx-shadow mb-0">
                      <div className="block-header">
                        <h3 className="block-title">Sign In</h3>
                        <div className="block-options">
                          <Link href="/forgot-password">
                          <a className="btn-block-option font-size-sm">Forgot Password?</a>
                          </Link>
                          <Link href="/signup">
                            <a className="btn-block-option">
                              <i className="fa fa-user-plus"></i>
                            </a>
                          </Link>
                        </div>
                      </div>
                      <div className="block-content">
                        <div className="p-sm-3 px-lg-4">
                          <img style={{width:'100%'}} src="/static/assets/media/logo.png" />
                          <form className="js-validation-signin" onSubmit={this.onSubmit}>
                            <div className="py-3">
                              <div className="form-group">
                                <input  
                                  onChange={(event) => {
                                    this.setState({
                                      userdata: Object.assign({}, userdata, { username: event.target.value }),
                                    });
                                  }}
                                  type="text" 
                                  className="form-control form-control-alt form-control-lg" 
                                  id="login-username" 
                                  name="username" 
                                  placeholder="Username" 
                                />
                              </div>
                              <div className="form-group">
                                <input 
                                  onChange={(event) => {
                                    this.setState({
                                      userdata: Object.assign({}, userdata, { password: event.target.value }),
                                    });
                                  }}
                                  type="password" 
                                  className="form-control form-control-alt form-control-lg" 
                                  id="login-password" 
                                  name="password" 
                                  placeholder="Password" 
                                  />
                              </div>
                              <div className="form-group">
                                <div className="custom-control custom-checkbox">
                                  <input 
                                    onChange={(event) => {
                                      this.setState({
                                        userdata: Object.assign({}, userdata, { remember_me: !userdata.remember_me }),
                                      });
                                    }}
                                    type="checkbox" 
                                    className="custom-control-input" 
                                    id="login-remember" 
                                    name="login-remember" 
                                  />
                                  <label className="custom-control-label font-w400" htmlFor="login-remember">Remember Me</label>
                                </div>
                              </div>
                            </div>
                            <div className="form-group row">
                              <div className="col-md-6 col-xl-5">
                                <button type="submit" className="btn btn-block btn-primary">
                                  <i className="fa fa-fw fa-sign-in-alt mr-1"></i> Sign In
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

export default withAuth(LoginWithData, { logoutRequired: true });
