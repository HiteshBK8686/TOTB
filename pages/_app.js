import App from 'next/app';
import React from 'react';
import Router from 'next/router';
import Head from 'next/head';

import Notifier from '../components/Notifier';

import * as gtag from '../lib/gtag';

Router.onRouteChangeStart = () => {
  if(document != undefined && document.getElementById("loader_overlay") != null)
    document.getElementById("loader_overlay").style.display = "block";
}
Router.onRouteChangeComplete = (url) => {
  // NProgress.done();
  document.getElementById("loader_overlay").style.display = "none";
  // gtag.pageview(url);
  gtag.manager();
};
Router.onRouteChangeError = () => document.getElementById("loader_overlay").style.display = "none";

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    const pageProps = {};

    if (Component.getInitialProps) {
      Object.assign(pageProps, await Component.getInitialProps(ctx));
    }

    return { pageProps };
  }

  componentDidMount() {
    Router.beforePopState(({as}) => {
      location.href = as;
    });
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
  }

  render() {
    const { Component, pageProps } = this.props;
    
    return (
      <div>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Component {...pageProps} />
        <Notifier />
      </div>
    );
  }
}

export default MyApp;