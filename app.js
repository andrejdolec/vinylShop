if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const Vinyl = require('./models/vinyl');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const MongoStore = require('connect-mongo');
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/vinylShop';

const userRoutes = require('./routes/users');
const vinylRoutes = require('./routes/vinyls');
const reviewRoutes = require('./routes/reviews');
const orderRoutes = require('./routes/orders')

mongoose.connect(dbUrl);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize())

const secret = process.env.SESSION_SECRET || 'secretestsecret'

const sessionConfig = {
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: dbUrl, touchAfter: 24 * 60 * 60, secret }),
    cookie: {
        httpOnly: true,
        // secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());
app.use(helmet({ contentSecurityPolicy: false }))

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.session = req.session;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.get('/about', (req, res) => {
    res.render('about')
})

app.get('/download', (req, res) => {
    var filePath = __dirname + '/data/Достапни Винили - Декември 2021.xlsx';
    var fileName = "Достапни Винили - Декември 2021.xlsx"; // The default name the browser will use
    res.download(filePath, fileName);
});

app.use('/', userRoutes)
app.use('/vinyls', vinylRoutes);
app.use('/vinyls/:id/reviews', reviewRoutes);
app.use('/', orderRoutes);

app.get('/', catchAsync(async (req, res) => {
    const vinyls = await Vinyl.find({});
    if (!req.query.search) {
        return res.render('home', { vinyls });
    } else {
        const searchField = req.query.search;
        const searchedVinyls = await Vinyl.find({ $or: [{ album: { $regex: searchField, $options: '$i' } }, { artist: { $regex: searchField, $options: '$i' } }] })
        res.render('searchResults', { searchedVinyls });
    }
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})