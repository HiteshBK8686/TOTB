/* eslint-disable react/no-danger */
import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import htmlescape from 'htmlescape';

const { GA_TRACKING_ID, StripePublishableKey } = process.env;
const env = { GA_TRACKING_ID, StripePublishableKey };

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <link rel="stylesheet" href="/static/assets/css/bootstrap.min.css" />
          <link rel="shortcut icon" href="/static/favicon.ico"/>
          {/*<link rel="stylesheet" href="/static/assets/css/owl.carousel.min.css" />*/}
          <link rel="stylesheet" href="/static/assets/css/custom.css" />
          <link rel="stylesheet" href="/static/assets/css/totb-icon-fonts.css" />
          <link rel="stylesheet" href="/static/assets/css/react-multi-carousel.min.css" />
          <link rel="stylesheet" href="/static/assets/css/owl.carousel.min.css" />
          <link rel="stylesheet" href="/static/assets/css/style.css" />
          <link rel="stylesheet" href="/static/assets/css/responsive.css" />
          <script dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-KBFZLKW');`,
          }}>
          </script>
          <script async src="https://www.googletagmanager.com/gtag/js?id=UA-168904939-1"></script>
          <script dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'UA-168904939-1');`,
          }}>
          </script>
        </Head>
        <body id="wrap" className="index-wrap">
          <section className="background-container">
            <Main />
          </section>
          <script dangerouslySetInnerHTML={{ __html: `__ENV__ = ${htmlescape(env)}` }} />
          <NextScript />
        </body>
        <link rel="stylesheet" href="/static/assets/css/font-awesome.min.css" />
        <script defer src="/static/assets/js/jquery.min.js"></script>
        <script defer src="/static/assets/js/custom.js"></script>
        <script defer src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.0.4/popper.min.js"></script>
        <script defer src="/static/assets/js/bootstrap.min.js"></script>
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KBFZLKW" height="0" width="0" style={{display:'none',visibility:'hidden'}}></iframe></noscript>
      </Html>
    );
  }
}

MyDocument.getInitialProps = async (ctx) => {
  // Resolution order
  //
  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  const initialProps = await Document.getInitialProps(ctx);

  return {
    ...initialProps,
    // Styles fragment is rendered after the app and page rendering finish.
    styles: (
      <React.Fragment>
        {initialProps.styles}
      </React.Fragment>
    ),
  };
};

export default MyDocument;