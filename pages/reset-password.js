import PropTypes from 'prop-types';
import notify from '../lib/notifier';
import Router from 'next/router';
import Head from 'next/head';

import Header from '../components/HomeHeader';
import Footer from '../components/HomeFooter';

import withAuth from '../lib/withAuth';
import { resetpassword } from '../lib/api/user';


class ResetPassword extends React.Component {
  static getInitialProps({query}) {
    const ResetPasswordPage = true;
    const token = query.token;
    return { ResetPasswordPage, token };
  }

  static propTypes = {
    token: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      userdata: {},
      token: props.token || ''
    };
  }

  onSubmit = (event) => {
    event.preventDefault();
    const { userdata } = this.state;
    const { password, cpassword } = userdata;

    if (!password) {
      notify('Password is required');
      return;
    }

    if (!cpassword) {
      notify('Confirm Password is required');
      return;
    }

    if (password != cpassword) {
      notify('Password and Confirm Password mismatch');
      return;
    }
    userdata.reset_token = this.props.token;
    this.resetpassword(userdata);
  };

  resetpassword = async (data) => {
    document.getElementById("overlay").style.display = "block";
    try {
      const result = await resetpassword(data);
      document.getElementById("overlay").style.display = "none";
      if(result.status == 'success'){
        notify('Password has been changed!');
        Router.push('/melbourne');
      } else{
        notify('Invalid Reset Token!');
      }
    } catch (err) {
      notify(err);
      document.getElementById("overlay").style.display = "none";
    }
  };

  render() {
    const { userdata } = this.state;
    return (
      <main className="wrapper listing-event-detail">
				<Head>
					<title>Reset Password - 10 of The Best</title>
				</Head>
				<Header user={{}} />
        <section className="reset-pwd">
          <div className="container">
            <div className="row justify-content-center">
              <div className="form-body">
                <div className="reset-form mt-5 mb-5">
                  <h1 className="title">Reset Password</h1>
                  <form id="needs-validation" noValidate onSubmit={this.onSubmit}>
                    <div className="form-group">
                      <input 
                        onChange={(event) => {
                          this.setState({
                            userdata: Object.assign({}, userdata, { password: event.target.value }),
                          });
                        }}
                        type="password" 
                        className="form-control"
                        id="login-password" 
                        name="password" 
                        placeholder="Password"
                      />
                    </div>
                    <div className="form-group">
                      <input 
                        onChange={(event) => {
                          this.setState({
                            userdata: Object.assign({}, userdata, { cpassword: event.target.value }),
                          });
                        }}
                        type="password" 
                        className="form-control"
                        id="login-password" 
                        name="cpassword" 
                        placeholder="Confirm Password"
                      />
                      {/*<div className="invalid-feedback">
                        This password is too weak.
                      </div>*/}
                    </div>
                    <div className="change-btn">
                      <button type="submit" className="btn btn-filled btn-yellow">Change Password</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div id="overlay" style={{display:'none'}}></div>
        </section>
        <Footer user={{}} />
			</main>
    );
  }
}

export default withAuth(ResetPassword, { logoutRequired: true });
