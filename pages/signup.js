import PropTypes from 'prop-types';
import Link from 'next/link';
import Head from 'next/head';
import NProgress from 'nprogress';
import notify from '../lib/notifier';
import Router from 'next/router';

import withAuth from '../lib/withAuth';
import { signup } from '../lib/api/auth';

const styleTeamMember = {
  textAlign: 'center',
  padding: '10px 5%',
};



class SignupWithData extends React.Component {
  static getInitialProps() {
    const signupPage = true;
    return { signupPage };
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
    const { username, email, password } = userdata;

    if (!username) {
      notify('Username is required');
      return;
    }

    if (!email) {
      notify('Email is required');
      return;
    }

    if (!password) {
      notify('Password is required');
      return;
    }

    this.createAccount(userdata);
  };

  createAccount = async (data) => {
    NProgress.start();
    try {
      const userdata = await signup(data);
      notify('Signup Successful, wait for Admin to activate your account!');
      try {
        const userId = userdata._id;
        NProgress.done();
        Router.push('/login', '/login');
      } catch (err) {
        notify(err);
        NProgress.done();
      }
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
          <title>TOTB Admin -- Signup</title>
        </Head>
        <main id="main-container">
          <div className="hero-static">
            <div className="content">
              <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6 col-xl-4">
                  <div className="block block-themed block-fx-shadow mb-0">
                    <div className="block-header bg-success">
                      <h3 className="block-title">Create Account</h3>
                      <div className="block-options">
                        <a className="btn-block-option font-size-sm" href="javascript:void(0)" data-toggle="modal" data-target="#one-signup-terms">View Terms</a>
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
                        <form onSubmit={this.onSubmit} className="js-validation-signup">
                          <div className="py-3">
                            <div className="form-group">
                              <input 
                                onChange={(event) => {
                                  this.setState({
                                    userdata: Object.assign({}, userdata, { username: event.target.value }),
                                  });
                                }}
                                value={userdata.username || ''} 
                                type="text" 
                                className="form-control form-control-lg form-control-alt" 
                                id="signup-username" 
                                name="username" 
                                placeholder="Username"
                              />
                            </div>
                            <div className="form-group">
                              <input 
                                onChange={(event) => {
                                  this.setState({
                                    userdata: Object.assign({}, userdata, { email: event.target.value }),
                                  });
                                }}
                                value={userdata.email || ''} 
                                type="email" 
                                className="form-control form-control-lg form-control-alt" 
                                id="signup-email" 
                                name="email" 
                                placeholder="Email"
                              />
                            </div>
                            <div className="form-group">
                              <input 
                                onChange={(event) => {
                                  this.setState({
                                    userdata: Object.assign({}, userdata, { password: event.target.value }),
                                  });
                                }}
                                value={userdata.password || ''} 
                                type="password" 
                                className="form-control form-control-lg form-control-alt" 
                                id="signup-password" 
                                name="password" 
                                placeholder="Password"
                              />
                            </div>
                            <div className="form-group">
                              <div className="custom-control custom-checkbox">
                                <input type="checkbox" className="custom-control-input" id="signup-terms" name="signup-terms"/>
                                <label className="custom-control-label font-w400" htmlFor="signup-terms">I agree to Terms &amp; Conditions</label>
                              </div>
                            </div>
                          </div>
                          <div className="form-group row">
                            <div className="col-md-6 col-xl-5">
                              <button type="submit" className="btn btn-block btn-success">
                                <i className="fa fa-fw fa-plus mr-1"></i> Sign Up
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
        </main>
        <div className="modal fade" id="one-signup-terms" tabindex="-1" role="dialog" aria-labelledby="one-signup-terms" aria-hidden="true">
          <div className="modal-dialog modal-lg modal-dialog-popout" role="document">
            <div className="modal-content">
              <div className="block block-themed block-transparent mb-0">
                <div className="block-header bg-primary-dark">
                  <h3 className="block-title">Terms &amp; Conditions</h3>
                  <div className="block-options">
                    <button type="button" className="btn-block-option" data-dismiss="modal" aria-label="Close">
                      <i className="fa fa-fw fa-times"></i>
                    </button>
                  </div>
                </div>
                <div className="block-content">
                  <p>Dolor posuere proin blandit accumsan senectus netus nullam curae, ornare laoreet adipiscing luctus mauris adipiscing pretium eget fermentum, tristique lobortis est ut metus lobortis tortor tincidunt himenaeos habitant quis dictumst proin odio sagittis purus mi, nec taciti vestibulum quis in sit varius lorem sit metus mi.</p>
                  <p>Dolor posuere proin blandit accumsan senectus netus nullam curae, ornare laoreet adipiscing luctus mauris adipiscing pretium eget fermentum, tristique lobortis est ut metus lobortis tortor tincidunt himenaeos habitant quis dictumst proin odio sagittis purus mi, nec taciti vestibulum quis in sit varius lorem sit metus mi.</p>
                  <p>Dolor posuere proin blandit accumsan senectus netus nullam curae, ornare laoreet adipiscing luctus mauris adipiscing pretium eget fermentum, tristique lobortis est ut metus lobortis tortor tincidunt himenaeos habitant quis dictumst proin odio sagittis purus mi, nec taciti vestibulum quis in sit varius lorem sit metus mi.</p>
                  <p>Dolor posuere proin blandit accumsan senectus netus nullam curae, ornare laoreet adipiscing luctus mauris adipiscing pretium eget fermentum, tristique lobortis est ut metus lobortis tortor tincidunt himenaeos habitant quis dictumst proin odio sagittis purus mi, nec taciti vestibulum quis in sit varius lorem sit metus mi.</p>
                  <p>Dolor posuere proin blandit accumsan senectus netus nullam curae, ornare laoreet adipiscing luctus mauris adipiscing pretium eget fermentum, tristique lobortis est ut metus lobortis tortor tincidunt himenaeos habitant quis dictumst proin odio sagittis purus mi, nec taciti vestibulum quis in sit varius lorem sit metus mi.</p>
                </div>
                <div className="block-content block-content-full text-right border-top">
                  <button type="button" className="btn btn-sm btn-link mr-2" data-dismiss="modal">Close</button>
                  <button type="button" className="btn btn-sm btn-primary" data-dismiss="modal">I Agree</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withAuth(SignupWithData, { loginRequired: false });
