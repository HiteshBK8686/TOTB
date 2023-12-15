import PropTypes from 'prop-types';
import React from 'react';
import ShowMoreText from 'react-show-more-text';

function OverviewTab({ that, restaurant, certificates, states, url, payment_methods, features, featuresLimit }) {
	if (typeof window === 'undefined') {
		return null;
	} else{
		return (
            <div className="tab-text overview">
                <div className="container-fluid">
                    <div className="row align-items-start bord-btm px-1 pt-2 pb-4 px-lg-4 pt-lg-5">
                        <div className={((restaurant.featured_video_type && restaurant.featured_video) || (restaurant.featured_video_type && restaurant.youtube_featured_video)) ? "col-12 col-lg-8" : "col-12 col-lg-12"}>
                            <div className="about-tab">
                                <h3>About {restaurant.name}</h3>
                                <span className="mb-0">
                                    <ShowMoreText
                                        lines={3}
                                        more='See more'
                                        less='See less'
                                        anchorClass=''
                                        expanded={false}
                                    >
                                        {restaurant.description} 
                                    </ShowMoreText>
                                </span>
                                
                            </div>
                            {certificates.length > 0 && <div>
                                <h3>Certificates</h3>
                                <div className="certificate">
                                    {certificates.map(function(certificate, index){
                                    return (
                                        <h6 key={index}><span className="certi-icon icon icon-awward-icon"></span>{certificate.name}</h6>
                                    );
                                    })}
                                </div>
                            </div>}
                        </div>
                        <div className={((restaurant.featured_video_type && restaurant.featured_video) || (restaurant.featured_video_type && restaurant.youtube_featured_video)) ? "col-12 col-lg-4" : "d-none"}>
                            <div className="teaser_video pb-1">
                                {/* <h3>Featured Video</h3> */}
                                <div className="video_tab text-center">
                                    <a href="#videoModal" type="submit" className="video-btn text-uppercase" data-toggle="modal">Watch Video
                                        <span className="video_icon pl-2">
                                            <img src="/static/assets/img/details/video-play-icon.svg" alt="img" />
                                        </span>
                                    </a>
                                </div>
                                <div className="modal" id="videoModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                    <div className="modal-dialog mw-100 w-75" role="document">
                                        <div className="modal-content border-0 shadow-none">
                                            <div className="modal-body">
                                                <button type="button" className="close" onClick={() => {$('video').trigger('pause');var url = $('#youtubevideo').attr('src');$('#youtubevideo').attr('src', '');$('#youtubevideo').attr('src', url)}} data-dismiss="modal" aria-label="Close">
                                                    <span aria-hidden="true">&times;</span>
                                                </button>
                                                <div className={restaurant.featured_video_type == 'youtube_link' ? "embed-responsive embed-responsive-16by9":"d-none"}>
                                                    <iframe className="embed-responsive-item" src={restaurant.youtube_featured_video} id="youtubevideo" allowscriptaccess="always"></iframe>
                                                </div>
                                                <div className={restaurant.featured_video_type == 'upload_video' ? "embed-responsive embed-responsive-16by9":"d-none"}>
                                                    <video className="embed-responsive-item" src={restaurant.featured_video} id="video" allowscriptaccess="always" controls={true}></video>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row bord-btm">
                        <div className="col-12 col-md-5">
                            <div className="dtl-left">
                                <div className="map">
                                    <div className="map-responsive">
                                        <iframe src={"https://www.google.com/maps/embed/v1/place?key=AIzaSyA0s1a7phLN0iaD6-UE7m4qP-z21pH0eSc&q="+restaurant.lat+","+restaurant.long} width="100%" height="140" frameBorder="0" style={{border:"0"}} allowFullScreen></iframe>
                                        <div className="map-tag">Get Direction</div>
                                    </div>
                                </div>
                                <div className="address">
                                    <span className="location"><i className="fa fa-map-marker" aria-hidden="true"></i></span>{restaurant.address},<br></br>
                                    {restaurant.city} {states[restaurant.state]} {restaurant.zip}.
                                    <div className="clearfix"></div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-7">
                            <div className="dtl-right">
                                <div className="contact">
                                    <a className={url ? '':'d-none'} onClick={() => that.websiteClick(restaurant._id)} href={url} target="_blank"><button className="btn btn-filled mr-3" type="submit"><span><i className="fa fa-globe" aria-hidden="true"></i></span>Website</button></a>
                                    <a onClick={() => that.cellPhoneClick(restaurant._id)} href={'tel:' + restaurant.contact_cellphone}><button className="btn btn-filled mr-3" type="submit"><span><i className="fa fa-phone" aria-hidden="true"></i></span>Phone</button></a>
                                    <a onClick={() => that.emailClick(restaurant._id)} href={'mailto:' + restaurant.contact_email}><button className="btn btn-filled" type="submit"><span><i className="fa fa-envelope-o" aria-hidden="true"></i></span>Email</button></a>
                                </div>
                                {/* <div className="note">
                                    <span><i className="fa fa-info-circle" aria-hidden="true"></i></span>Usually replies within one day.
                                </div> */}
                                <div className="social-links">
                                    <a href={"https://www.facebook.com/"+restaurant.facebook} className={restaurant.facebook ? "facebook" : "d-none"}>
                                        <i className="fa fa-facebook" aria-hidden="true"></i>
                                    </a>
                                    <a href={"https://www.instagram.com/"+restaurant.instagram} className={restaurant.instagram ? "instagram" : "d-none"}>
                                        <i className="fa fa-instagram" aria-hidden="true"></i>
                                    </a>
                                    <a href={"https://www.twitter.com/"+restaurant.twitter} className={restaurant.twitter ? "twitter" : "d-none"}>
                                        <i className="fa fa-twitter" aria-hidden="true"></i>
                                    </a>
                                </div>
                                {payment_methods.length > 0 && <div className="cards">
                                    <h6>We accept</h6>
                                    <div className="card-img">
                                        <ul>
                                            {payment_methods.map(function(method, i){
                                                method = JSON.parse(JSON.stringify(method));
                                                return (
                                                    <li key={i}><img src={method.image} alt={method.name} title={method.name} /></li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>}
                            </div>
                        </div>
                    </div>
                    <div className="row" style={features.length == 0 ? {display:'none'} : {}}>
                        <div className="col-12">
                            <div className="feature">
                                <div className="tag-link">
                                    <h3>Features</h3>
                                </div>
                                <div className="list">
                                    <ul className="col-12 pl-0">
                                        {features.map(function(feature, index){
                                            if(index >= featuresLimit){
                                                return null;
                                            }
                                            return (
                                                <li className="col-12 col-md-3 pl-0" key={index} style={{display:'inline-block'}}><span className={"icon "+feature.icon}></span>{feature.name}</li>
                                            );
                                        })}
                                    </ul>
                                </div>
                                {features.length > featuresLimit ? <div className="more">
                                    <a style={{cursor:'pointer'}} onClick={() => that.setState({featuresLimit: features.length})}>See More Features<span className="next"></span></a>
                                </div> : ''}
                                {features.length == featuresLimit ? <div className="more">
                                    <a style={{cursor:'pointer'}} onClick={() => that.setState({featuresLimit: 8})}>See Less Features<span className="next"></span></a>
                                </div> : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
		);
	}
}

export default OverviewTab;