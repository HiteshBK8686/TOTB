import PropTypes from 'prop-types';
import React from 'react';
import ShowMoreText from 'react-show-more-text';
import Link from 'next/link';
import Moment from 'react-moment';

function EventTab({ that, events, events_fetched }) {
	if (typeof window === 'undefined') {
		return null;
	} else{
		return (
            <div className="tab-text event-tab">
                <div className="container-fluid">
                    {events.map(function(event, index){
                        return (
                        <div key={index} className="sub-event">
                            <div className="row">
                                <div className="col-12 col-md-4">
                                <div className="event-img">
                                    <img src={event.image} alt="" />
                                </div>
                                </div>
                                <div className="col-12 col-md-8">
                                    <div className="event-info">
                                        <Link href={"/event/"+event._id}>
                                            <a><h5>{event.name}</h5></a>
                                        </Link>
                                        <p>
                                            <ShowMoreText
                                                lines={5}
                                                more='See more'
                                                less='See less'
                                                anchorClass=''
                                                expanded={false}
                                            >
                                                {event.description} 
                                            </ShowMoreText>
                                        </p>
                                        <div className="date-time">
                                        <div className="date">
                                            <span><i className="fa fa-calendar-o" aria-hidden="true"></i></span> <Moment format="Do MMM, YYYY">{event.start_date}</Moment> - <Moment format="Do MMM, YYYY">{event.end_date}</Moment>
                                        </div>
                                        {/*<div className="time">
                                            <span><i className="fa fa-clock-o" aria-hidden="true"></i></span>10:20 AM - 12:00 PM
                                        </div>*/}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        );
                    })}
                    <span style={events.length > 0 ? {display:'none'} : {}}>{events_fetched ? 'Restaurant has no events!' : 'Fetching events...'}</span>
                </div>
            </div>
		);
	}
}

export default EventTab;