const { vinylSchema, reviewSchema, orderSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Vinyl = require('./models/vinyl');
const Review = require('./models/review')

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role == 'admin') {
        return next();
    }
    req.flash('error', "You don't have permission to do that");
    res.redirect('/vinyls')
}

module.exports.validateVinyl = (req, res, next) => {
    const { error } = vinylSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const vinyl = await Vinyl.findById(id);
    if (!vinyl.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/vinyls/${id}`)
    }
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.validateOrder = (req, res, next) => {
    const { error } = orderSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}



module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewID } = req.params;
    const review = await Review.findById(reviewID);
    if (review.author.equals(req.user._id) || req.user.role === 'admin') {
        return next();
    }
    req.flash('error', 'You do not have permission to do that!');
    return res.redirect(`/vinyls/${id}`);
}