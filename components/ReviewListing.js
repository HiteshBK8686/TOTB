import PropTypes from 'prop-types';
import Link from 'next/link';
import React, { useState } from 'react';
import Moment from 'react-moment';
import ShowMoreText from 'react-show-more-text';

function ReviewListing({ review, index, usefulMarked, notUsefulMarked }) {
	if (typeof window === 'undefined') {
		return null;
	} else{
		return (
            <div className="comment-box">
                <div className="profile-pic">
                    <img src={review.user.profile_pic ? review.user.profile_pic : "/static/assets/img/avatar.png"} alt="" />
                </div>
                <div className="profile-info" style={{width:'100%'}}>
                    <div className="main_commnet">
                        <div className="name">
                        <div className="usr-nm">
                            <h5>{review.user.name}</h5>
                            <p>
                            <span className="bord-rt" style={{display:'none'}}>550 Reviews</span>
                            <span><Moment fromNow>{review.createdAt}</Moment></span>
                            </p>
                        </div>
                        <div className="usr-star">
                            <span className={review.rating_value >= 1 ? "fa fa-star checked" : "fa fa-star-o"}></span>
                            <span className={review.rating_value >= 2 ? "fa fa-star checked" : "fa fa-star-o"}></span>
                            <span className={review.rating_value >= 3 ? "fa fa-star checked" : "fa fa-star-o"}></span>
                            <span className={review.rating_value >= 4 ? "fa fa-star checked" : "fa fa-star-o"}></span>
                            <span className={review.rating_value >= 5 ? "fa fa-star checked" : "fa fa-star-o"}></span>
                        </div>
                        </div>
                        <p>
                            <ShowMoreText
                                lines={2}
                                more='See more'
                                less='See less'
                                anchorClass=''
                                expanded={false}
                            >
                                {review.review_text ? review.review_text : 'No review given!'} 
                            </ShowMoreText>
                        </p>
                        <div className="fd-img">
                            {review.review_images.map(function(image,j){
                                return (
                                    <span><img style={{width:'48px',height:'48px'}} src={image.image} alt="" /></span>
                                );
                            })}
                        </div>
                        <div className="like">
                            <div className="useful">
                                <button onClick={() => usefulMarked(index, review)} className="btn" type="submit"><i className="fa fa-thumbs-o-up" aria-hidden="true"></i> Useful</button>
                                <button onClick={() => notUsefulMarked(index, review)} className="btn" type="submit"><i className="fa fa-thumbs-o-down" aria-hidden="true"></i> Not Useful</button>
                            </div>
                            <div className="social">
                            <ul>
                                <li className="tag">share</li>
                                <a style={{cursor:'pointer'}} onClick={() => window.open('https://www.facebook.com/sharer/sharer.php?u=http://10ofthebest.com.au&quote='+review.review_text,'sharer','toolbar=0,status=0,width=580,height=325')} target="_blank" className="facebook">
                                    <i className="fa fa-facebook" aria-hidden="true"></i>
                                </a>
                                <Link href={"http://twitter.com/share?text="+review.review_text}>
                                    <a className="twitter">
                                        <i className="fa fa-twitter" aria-hidden="true"></i>
                                    </a>
                                </Link>
                                {/* <li><a href="#" className="linked-in">
                                    <i className="fa fa-linkedin" aria-hidden="true"></i>
                                    </a></li>
                                */}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className={review.response ? "comment_resonse border-top mt-4 pt-4 d-sm-flex align-items-baseline" : "d-none"}>
                        <div className="profile_img mb-2 mb-sm-0">
                            <img src="/static/assets/img/details/comment-profile.png" className="img-fluid" alt="img" />
                        </div>
                        <div className="profile_desc">
                            <div className="usr-nm mb-3">
                                <h5>Restaurant Admin</h5>
                                <p><Moment fromNow>{review.responseCreatedAt}</Moment></p>
                            </div>
                            <p className="mb-0">
                                {review.response}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
		);
	}
}

ReviewListing.propTypes = {
	user: PropTypes.shape({
	displayName: PropTypes.string,
	email: PropTypes.string,
	name: PropTypes.string,
	isAdmin: PropTypes.number,
	avatarUrl: PropTypes.string,
	isGithubConnected: PropTypes.bool,
	}),
};

ReviewListing.defaultProps = {
	user: null,
};

export default ReviewListing;
