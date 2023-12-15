import PropTypes from 'prop-types';
import Link from 'next/link';
import Head from 'next/head';
// import Grid from '@material-ui/core/Grid';
// import Avatar from '@material-ui/core/Avatar';
// import Button from '@material-ui/core/Button';

import Header from '../components/HomeHeader';
import Footer from '../components/HomeFooter';

import withAuth from '../lib/withAuth';

const styleTeamMember = {
  textAlign: 'center',
  padding: '10px 5%',
};



const underconstruction = ({ user }) => (
  <div id="page-container" className="sidebar-o sidebar-dark side-scroll page-header-fixed">
    <Head>
      <title>Under Construction</title>
    </Head>
    <Header user={user} />
    <main id="main-container">
      <p>Under Construction</p>
    </main>
    <Footer user={user} />
  </div>
);

underconstruction.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
  }),
};

underconstruction.defaultProps = {
  user: null,
};

underconstruction.getInitialProps = function getInitialProps() {
  const underconstruction = true;
  return { underconstruction };
};

export default withAuth(underconstruction, { loginRequired: true });
