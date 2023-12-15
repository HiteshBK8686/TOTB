import PropTypes from 'prop-types';
import React from 'react';
import Script from 'react-load-script';
import Link from 'next/link';

function RelatedVenue({related_places}) {
	if (typeof window === 'undefined') {
		return null;
	} else{
		return (
            <div className="row">
                <div className="col">
                    <div className="owl-carousel venue_carousel">
                        {related_places.map(function(place,i){
                            return (
                                <div key={i} className="item">
                                    <div className="card">
                                        <div className="row no-gutters">
                                            <div className="col-5">
                                                {place.images.length > 0 ? <img src={place.images[0].image} className="card-img" alt="img" /> : <img src="https://totb-data.s3.ap-southeast-2.amazonaws.com/static/250x250.png" className="card-img" alt="img" />}
                                                <div className="star-lbl">
                                                    <span><i className="fa fa-star" aria-hidden="true"></i></span>{place.avg_review}
                                                </div>
                                            </div>
                                            <div className="col-7">
                                                <div className="card-body">
                                                    <Link href={"/"+place.city.toLowerCase()+"/"+place.slug}>
                                                        <h6 className="card-title" style={{cursor:'pointer'}}>{place.name}</h6>
                                                    </Link>
                                                    <div className="place-info mb-2">
                                                        <div className="loc d-flex align-items-center mb-2">
                                                            <span className="icon icon-map-view"></span>{place.city}
                                                        </div>
                                                        <div className="person d-flex align-items-center">
                                                            <span className="icon icon-User-icon"></span>${place.avg_cost} for Per Person
                                                        </div>
                                                    </div>
                                                    {place.cuisine_types.length > 0 ? <h5 className="label">{place.cuisine_types[0].name}</h5> : null}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
		);
	}
}

export default RelatedVenue;