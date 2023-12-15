import React, { useState, useEffect } from 'react';
import notify from '../lib/notifier';
import { sendOtpMail, checkClient } from '../lib/api/user';

function RegisterClient() {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [generatedOTP, setGeneratedOTP] = useState('');
    const [otp, setOtp] = useState('');
    const [userExistError, setUserExistError] = useState(false);
    const password = '12345!@#$%abcdef';
    const email_verified = true;

    const onSubmit = async (event) => {
		event.preventDefault();

		if (!firstname) {
			notify('First Name is required');
			return;
		}

        if (!lastname) {
			notify('Last Name is required');
			return;
		}

        if (!email) {
			notify('Email is required');
			return;
		}

		if (!phone) {
			notify('Phone is required');
			return;
		}
        const clientExist = await checkClient({email});
        if(!clientExist.status){
            setUserExistError(false);
            _sendOtp();
        } else{
            setUserExistError(true);
            return;
        }
	};

    useEffect(() => {
        if(generatedOTP != ''){
            async function _emailOTP() {
                const reverse_otp = parseInt(String(generatedOTP).split("").reverse().join(""), 10);
                const multiplied_otp = reverse_otp * 11.7;
                const secret = btoa(multiplied_otp);
                const sentOTP = await sendOtpMail({secret, email});
                if(sentOTP.status){
                    _openOTPForm();
                }
            }        
            _emailOTP();
        }
    }, [generatedOTP]);

    const _sendOtp = async() => {
        // create random OTP and send mail
        const newOTP = Math.floor(100000 + Math.random() * 900000);
        setGeneratedOTP(newOTP);
    }

    const _verifyOtp = (event) => {
        event.preventDefault();
        
        if (otp == generatedOTP){
            // verified
            _signup(firstname, lastname, email, phone, password);
        } else {
            // incorrect
            notify('Incorrect OTP');
        }
    }

    const _signup = (firstname, lastname, email, phone, password) => {
        $("#loader_overlay").show();
        try {
			// call signup API
            fetch(process.env.ADMIN_URL+"/api/v1/auth/signup", {
                "method": "POST",
                "headers": {
                    "content-type": "application/json",
                    "accept": "application/json"
                },
                "body": JSON.stringify({
                    firstname, lastname, email, phone, password, email_verified
                })
            })
            .then((response) => {
                if(response.status == 200){
                    const combination = email + '@TOTB@' + password;
                    const encryption = window.btoa(combination);
                    $("#loader_overlay").hide();
                    notify('Account created Successfully, you will be redirected to dashboard..');
                    window.location.href = process.env.ADMIN_URL+"/front-login/"+encryption;
                } else{
                    notify("Error creating account, please contact admin!");
                    $("#loader_overlay").hide();
                }
            })
            .catch(err => {
                console.log(err);
                notify("Error creating account, please contact admin!");
                $("#loader_overlay").hide();
            });
		} catch (err) {
            console.log(err);
			notify("Error creating account, please contact admin!");
			$("#loader_overlay").hide();
		}
    }

    const _openSignupForm = () => {
        // hide OTP modal
        $("#otpModal").modal("hide");
        // show signup modal
        $("#registerClientModal").modal("show");
    }

    const _openOTPForm = () => {
        // hide signup modal
        $("#registerClientModal").modal("hide");
        // show OTP modal
        $("#otpModal").modal("show");
    }

	return (
        <>
            <div className="modal fade login-popup" id="registerClientModal">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header border-bottom-0 text-left">
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h5 className="modal-title">Create Account</h5>
                            <p className="tag">Get listed on '10 of The Best' and unlock doors to millions of potential customers.</p>
                        </div>
                        <form>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="form-group col-6 pr-1">
                                        <input 
                                            onChange={(event) => {
                                                setFirstname(event.target.value);
                                            }}
                                            placeholder="First Name"
                                            type="text" 
                                            className="form-control" 
                                            id="firstname" 
                                            name="firstname" 
                                            value={firstname || ''} 
                                        />
                                    </div>
                                    <div className="form-group col-6 pl-0">
                                        <input 
                                            onChange={(event) => {
                                                setLastname(event.target.value);
                                            }}
                                            placeholder="Last Name"
                                            type="text" 
                                            className="form-control" 
                                            id="lastname" 
                                            name="lastname" 
                                            value={lastname || ''} 
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <input 
                                        onChange={(event) => {
                                            setEmail(event.target.value);
                                        }}
                                        placeholder="Email"
                                        type="text" 
                                        className="form-control" 
                                        id="email" 
                                        name="email" 
                                        value={email || ''} 
                                    />
                                </div>
                                <div className="form-group">
                                    <input 
                                        onChange={(event) => {
                                            setPhone(event.target.value);
                                        }}
                                        placeholder="Phone"
                                        type="text" 
                                        className="form-control" 
                                        id="phone" 
                                        name="phone" 
                                        value={phone || ''} 
                                    />
                                </div>
                                <div>
                                    <button onClick={onSubmit} className="btn btn-filled btn-yellow">Submit</button>
                                </div>
                                {userExistError && <div>
                                    <p className="text-warning">Account with provided email already exists. If this email belongs to you then please try reset your password <a target="_blank" href="https://admin.10ofthebest.com.au/forgot-password">here</a>!</p>
                                </div>}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className="modal fade login-popup" id="otpModal">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header border-bottom-0 text-left">
                            <button style={{marginBottom:'0px'}} onClick={_openSignupForm} type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <p className="modal-title">One-time password (OTP) is sent to your registered email address. In case, if you have not received the login OTP in your Email "Inbox", we request you to check your "Spam & Junk folder" of your email account.</p>
                        </div>
                        <form>
                            <div className="modal-body">
                                <div className="form-group">
                                    <input 
                                        onChange={(event) => {
                                            setOtp(event.target.value);
                                        }}
                                        placeholder="OTP"
                                        type="text" 
                                        className="form-control" 
                                        id="otp" 
                                        name="otp" 
                                        value={otp || ''} 
                                    />
                                </div>
                                <div>
                                    <button onClick={_verifyOtp} className="btn btn-filled btn-yellow">Verify</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default RegisterClient;