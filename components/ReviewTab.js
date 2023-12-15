import PropTypes from 'prop-types';
import React from 'react';

function ReviewTab({ restaurant, restaurant_reviews }) {
	if (typeof window === 'undefined') {
		return null;
	} else{
		return (
            <div className="tab-text review-tab">
                <div className="container-fluid">
                    <div className="rw-box">
                        <div className="row">
                            <div className="col-12 col-md-6">
                                <div className="rev-text">
                                <h5>Customer Reviews & Ratings</h5>
                                <div className="star">
                                <span className="point">{restaurant_reviews.avg_rating}</span>
                                <span className={restaurant_reviews.rating >= 1 ? "fa fa-star checked" : "fa fa-star-o"}></span>
                                <span className={restaurant_reviews.rating >= 2 ? "fa fa-star checked" : "fa fa-star-o"}></span>
                                <span className={restaurant_reviews.rating >= 3 ? "fa fa-star checked" : "fa fa-star-o"}></span>
                                <span className={restaurant_reviews.rating >= 4 ? "fa fa-star checked" : "fa fa-star-o"}></span>
                                <span className={restaurant_reviews.rating >= 5 ? "fa fa-star checked" : "fa fa-star-o"}></span>
                                <p>{restaurant_reviews.total_reviews} Rating</p>
                                </div>
                                <div className="clearfix"></div>
                                <p className="rate-text">Take a look at verified ratings & reviews of {restaurant.name} posted by our users.</p>
                                <div className="all-rev">
                                <a style={{cursor:'pointer'}} id="go-comments-tab">View All Reviews</a>
                                {/* {restaurant_reviews.total_reviews} */}
                                </div>
                            </div>
                            </div>
                            <div className="col-12 col-md-6">
                                <div className="rev-icon">
                                    <div className="rate-bar">
                                    <div className="pb-icon"><img src="/static/assets/img/details/excellent.svg" alt="" /></div>
                                    <div className="pb-star">5 Star</div>
                                    <div className="pn-bar">
                                        <div className="progress">
                                        <div className="progress-bar" style={{width:(restaurant_reviews.five_star*100)/restaurant_reviews.total_reviews+'%'}}></div>
                                        </div>
                                        <div className="pb-label">Excellent</div>
                                    </div>
                                    <div className="pb-percent">{restaurant_reviews.five_star}</div>
                                    <div className="clearfix"></div>
                                    </div>
                                </div>
                                <div className="rev-icon">
                                    <div className="rate-bar">
                                    <div className="pb-icon"><img src="/static/assets/img/details/good.svg" alt="" /></div>
                                    <div className="pb-star">4 Star</div>
                                    <div className="pn-bar">
                                        <div className="progress">
                                        <div className="progress-bar" style={{width:(restaurant_reviews.four_star*100)/restaurant_reviews.total_reviews+'%'}}></div>
                                        </div>
                                        <div className="pb-label">Good</div>
                                    </div>
                                    <div className="pb-percent">{restaurant_reviews.four_star}</div>
                                    <div className="clearfix"></div>
                                    </div>
                                </div>
                                <div className="rev-icon">
                                    <div className="rate-bar">
                                    <div className="pb-icon"><img src="/static/assets/img/details/normal.svg" alt="" /></div>
                                    <div className="pb-star">3 Star</div>
                                    <div className="pn-bar">
                                        <div className="progress">
                                        <div className="progress-bar" style={{width:(restaurant_reviews.three_star*100)/restaurant_reviews.total_reviews+'%'}}></div>
                                        </div>
                                        <div className="pb-label">Normal</div>
                                    </div>
                                    <div className="pb-percent">{restaurant_reviews.three_star}</div>
                                    <div className="clearfix"></div>
                                    </div>
                                </div>
                                <div className="rev-icon">
                                    <div className="rate-bar">
                                    <div className="pb-icon"><img src="/static/assets/img/details/average.svg" alt="" /></div>
                                    <div className="pb-star">2 Star</div>
                                    <div className="pn-bar">
                                        <div className="progress">
                                        <div className="progress-bar normal" style={{width:(restaurant_reviews.two_star*100)/restaurant_reviews.total_reviews+'%'}}></div>
                                        </div>
                                        <div className="pb-label">Average</div>
                                    </div>
                                    <div className="pb-percent">{restaurant_reviews.two_star}</div>
                                    <div className="clearfix"></div>
                                    </div>
                                </div>
                                <div className="rev-icon">
                                <div className="rate-bar">
                                <div className="pb-icon"><img src="/static/assets/img/details/terrible.svg" alt="" /></div>
                                <div className="pb-star">1 Star</div>
                                <div className="pn-bar">
                                    <div className="progress">
                                    <div className="progress-bar terrible" style={{width:(restaurant_reviews.one_star*100)/restaurant_reviews.total_reviews+'%'}}></div>
                                    </div>
                                    <div className="pb-label">Terrible</div>
                                </div>
                                <div className="pb-percent">{restaurant_reviews.one_star}</div>
                                <div className="clearfix"></div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
		);
	}
}

export default ReviewTab;