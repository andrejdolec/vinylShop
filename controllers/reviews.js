const Vinyl = require('../models/vinyl');
const Review = require('../models/review')

module.exports.createReview = async (req, res) => {
    const { id } = req.params
    const vinyl = await Vinyl.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    vinyl.reviews.push(review);
    await review.save();
    await vinyl.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/vinyls/${vinyl._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewID } = req.params;
    await Vinyl.findByIdAndUpdate(id, { $pull: { reviews: reviewID } });
    await Review.findByIdAndDelete(reviewID);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/vinyls/${id}`);
}