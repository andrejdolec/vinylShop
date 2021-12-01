const Vinyl = require('../models/vinyl')
const axios = require('axios').default;
const Cart = require('../models/cart')

module.exports.index = async (req, res) => {
    const vinyls = await Vinyl.find({});
    if (!req.session.cart) {
        return res.render('vinyls/index', { products: null, vinyls })
    }
    const cart = new Cart(req.session.cart);
    let products = cart.generateArray();
    for (let product of products) {
        if (product.qty > product.item.available) {
            req.flash('error', 'Not enough units available');
            product.qty--;
            req.session.cart.totalPrice -= product.price;
            req.session.cart.totalQty--;
            return res.redirect('/vinyls')
        }
    }
    res.render('vinyls/index', { vinyls });
}

module.exports.renderNewForm = (req, res) => {
    res.render('vinyls/new');
}

module.exports.createVinyl = async (req, res) => {
    const { apiID, image, availableNumber } = req.body;
    try {
        const res = await axios.get(`https://theaudiodb.com/api/v1/json/2/album.php?m=${apiID}`);
        const tracklist = [];
        const tracklistRes = await axios.get(`https://theaudiodb.com/api/v1/json/2/track.php?m=${apiID}`);
        for (let i = 0; i < tracklistRes.data.track.length; i++) {
            tracklist.push(tracklistRes.data.track[i].strTrack)
        }
        const vinyl = new Vinyl({
            album: res.data.album[0].strAlbum,
            artist: res.data.album[0].strArtist,
            price: 19.99,
            available: availableNumber,
            description: res.data.album[0].strDescriptionEN,
            released: res.data.album[0].intYearReleased,
            genre: res.data.album[0].strGenre,
            image: image,
            author: '61a657988c41ce30f19c60a9',
            tracklist: tracklist
        });
        await vinyl.save();
    } catch (e) {
        console.log("ERROR!", e)
    }
    req.flash('success', 'Succesfully added a vinyl!');
    res.redirect(`/vinyls`)
}

module.exports.popGenre = async (req, res) => {
    const vinyls = await Vinyl.find({ $or: [{ genre: { $regex: 'Pop', $options: '$i' } }, { genre: { $regex: 'Funk', $options: '$i' } }] });
    res.render('vinyls/genres/pop', { vinyls });
}

module.exports.rockGenre = async (req, res) => {
    const vinyls = await Vinyl.find({ genre: { $regex: 'Rock', $options: '$i' } });
    res.render('vinyls/genres/rock', { vinyls });
}

module.exports.hiphopGenre = async (req, res) => {
    const vinyls = await Vinyl.find({ genre: { $regex: 'Hip-Hop', $options: '$i' } });
    res.render('vinyls/genres/hiphop', { vinyls });
}

module.exports.rnbGenre = async (req, res) => {
    const vinyls = await Vinyl.find({ $or: [{ genre: { $regex: 'R&B', $options: '$i' } }, { genre: { $regex: 'Soul', $options: '$i' } }] });
    res.render('vinyls/genres/rnb', { vinyls });
}

module.exports.showVinyl = async (req, res) => {
    const { id } = req.params;
    const vinyl = await Vinyl.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!vinyl) {
        req.flash('error', 'Cannot find that vinyl!');
        return res.redirect('/vinyls')
    }
    res.render('vinyls/show', { vinyl, currentUser: req.user });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const vinyl = await Vinyl.findById(id);
    if (!vinyl) {
        req.flash('error', 'Cannot find that vinyl!');
        return res.redirect('/vinyls')
    }
    res.render('vinyls/edit', { vinyl });
}

module.exports.updateVinyl = async (req, res) => {
    const { id } = req.params;
    const vinyl = await Vinyl.findByIdAndUpdate(id, { ...req.body.vinyl });
    req.flash('success', 'Successfully updated vinyl!');
    res.redirect(`/vinyls/${vinyl._id}`)
}

module.exports.deleteVinyl = async (req, res) => {
    const { id } = req.params;
    await Vinyl.findByIdAndDelete(id);
    req.flash('success', 'Succesfully deleted selected vinyl!');
    res.redirect('/vinyls')
}