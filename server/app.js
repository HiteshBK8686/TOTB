const express = require('express');
const session = require('express-session');
const compression = require('compression');
const mongoSessionStore = require('connect-mongo');
const next = require('next');
const mongoose = require('mongoose');
const helmet = require('helmet');
const routesWithSlug = require('./routesWithSlug');
const routesWithCache = require('./routesWithCache');
const sitemapAndRobots = require('./sitemapAndRobots');
var fs = require('fs');
var cors = require('cors');

const gAuth = require('./google');
const fbAuth = require('./facebook');
const api = require('./api');

const logger = require('./logs');

require('dotenv').config();

const dev = (process.env.dev == 'true');
const port = process.env.port;
const ROOT_URL = dev ? `http://localhost:${port}` : process.env.SITE_URL;

const MONGO_URL = process.env.MONGO_URL;
const options = {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
};

mongoose.connect(MONGO_URL, options);

const sessionSecret = process.env.SESSION_SECRET;

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
	const server = express();
	server.use(cors());
	server.use(helmet());
	server.use(compression());
	server.use(express.json());
	if(process.env.PLATFORM == 'PROD'){
		server.get('/*', function(req, res, next) {
			if (req.headers.host.match(/^www/) == null ) {
				res.redirect('https://www.' + req.headers.host + req.url);
			} else {
				next();
			}
		});
	}	  

	// potential fix for Error: Can't set headers
	// try reproducing with Chrome Dev Tools open

	// if (!dev) {
	//   server.use(compression());
	// };

	// give all Nextjs's request to Nextjs server
	server.get('/_next/*', (req, res) => {
		handle(req, res);
	});

	server.get('/static/*', (req, res) => {
		handle(req, res);
	});

	const MongoStore = mongoSessionStore(session);
	const sess = {
		name: 'totb.sid.front',
		secret: sessionSecret,
		store: new MongoStore({
			mongooseConnection: mongoose.connection,
			ttl: 14 * 24 * 60 * 60, // save session 14 days
		}),
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			maxAge: 14 * 24 * 60 * 60 * 1000, // expires in 14 days
		},
	};

	// if (!dev) {
	// 	server.set('trust proxy', 1); // trust first proxy
	// 	sess.cookie.secure = true; // serve secure cookies
	// }

	server.use(session(sess));

	gAuth({ server, ROOT_URL });
	fbAuth({ server, ROOT_URL });
	api(server);

	routesWithSlug({ server, app });
	routesWithCache({ server, app });

	sitemapAndRobots({ server });

	require('./routes')({ server, app });

	server.listen(port, (err) => {
		if (err) throw err;
		logger.info(`> Ready on ${ROOT_URL}`);
	});
});
