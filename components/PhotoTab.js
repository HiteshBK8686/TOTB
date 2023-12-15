import PropTypes from 'prop-types';
import React from 'react';
import Masonry from 'react-masonry-css';


function PhotoTab({ that, images, restaurant_images_fetched }) {
	if (typeof window === 'undefined') {
		return null;
	} else{
		return (
            <div className="tab-text photos-tab">
                <div className="container-fluid">
                    <div className="photos">
                        <div className="row">
                        <div className="col-12">
                            <Masonry
                                breakpointCols={{default: 4}}
                                className="my-masonry-grid"
                                columnClassName="my-masonry-grid_column"
                            >
                                {images.map(function(image, index){
                                    return(
                                        <div key={index} className="img-box">
                                            <div className="vn-img mr-btm" data-toggle="modal" data-target="#photosModal">
                                                <a data-slide-to={index} href="#gallery-thumb">
                                                    <img style={{marginBottom:'10px'}} src={image.image} alt="img" />
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </Masonry>
                            <span style={images.length > 0 ? {display:'none'} : {}}>{restaurant_images_fetched ? 'Restaurant has no images!' : 'Fetching images...'}</span>
                        </div>
                        </div>
                        {/*<div className="load-more">
                            <div className="more-img">
                            <a href="#" id="load">Load More<span><i className="fa fa-angle-down" aria-hidden="true"></i></span></a>
                            200+ Photos
                            </div>
                        </div>*/}
                    </div>
                </div>
            </div>
		);
	}
}

export default PhotoTab;