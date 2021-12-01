const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const VinylSchema = new Schema({
    album: String,
    artist: String,
    price: Number,
    available: Number,
    description: String,
    released: Number,
    genre: String,
    image: String,
    tracklist: [String],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

VinylSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Vinyl', VinylSchema);