import PropTypes from 'prop-types';
import React from 'react';

function FaqTab({ faqs }) {
	if (typeof window === 'undefined') {
		return null;
	} else{
		return (
            <div className="tab-text faq-tab">
                <div className="container-fluid">
                    <div className="faq_detail">
                        <div className="row justify-content-center">
                            <div className="col-12 col-offset-2 col-lg-8">
                                <div className="faq_accrodian_tabs">
                                    <div id="accordion_tab" className="myaccordion">
                                        {faqs.map(function(faq, index){
                                            return (
                                                <div key={index} className="card faq_card">
                                                    <div className="card-header collapsed" id="heading1" data-toggle="collapse" data-target="#collapse1" aria-expanded="false" aria-controls="collapse1">
                                                        <h5>
                                                            {faq.question}
                                                        </h5>
                                                        <span className="toggle-arrow">
                                                        <img src="/static/assets/img/details/plus-icon.svg" className="accordian-icon" alt="img" />
                                                        </span>
                                                    </div>
                                                    <div id="collapse1" className="collapse" aria-labelledby="heading1" data-parent="#accordion_tab" >
                                                        <div className="card-body pt-0">
                                                            <p>{faq.answer}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
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

export default FaqTab;