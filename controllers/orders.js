const Cart = require('../models/cart');
const Order = require('../models/order');
const Vinyl = require('../models/vinyl');

module.exports.addToCart = async (req, res) => {
    const productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : { items: {} });
    const vinyl = await Vinyl.findById(productId);
    cart.add(vinyl, vinyl._id, vinyl.price);
    req.session.cart = cart;
    res.redirect(`/vinyls`);
}

module.exports.reduce = (req, res) => {
    const productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});
    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/cart')
}

module.exports.removeItem = (req, res) => {
    const productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});
    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/cart')
}

module.exports.increment = async (req, res) => {
    const productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});
    cart.incrementByOne(productId);
    req.session.cart = cart;
    res.redirect('/cart')
}

module.exports.cart = (req, res) => {
    if (!req.session.cart) {
        return res.render('shop/shoppingcart', { products: null })
    }
    const cart = new Cart(req.session.cart);
    let products = cart.generateArray();
    for (let product of products) {
        if (product.qty > product.item.available) {
            req.flash('error', 'Not enough units available');
            product.qty--;
            req.session.cart.totalPrice -= product.price;
            req.session.cart.totalQty--;
            return res.redirect('/cart')
        }
    }
    res.render('shop/shoppingcart', { products: cart.generateArray(), totalPrice: cart.totalPrice });
}

module.exports.renderCheckout = (req, res) => {
    if (!req.session.cart || req.session.cart.totalQty === 0) {
        req.session.cart = null;
        return res.redirect('/cart')
    }
    console.log(req.session.cart)
    const cart = new Cart(req.session.cart);
    res.render('shop/checkout', { total: cart.totalPrice })
}

module.exports.checkout = async (req, res) => {
    if (!req.session.cart) {
        return res.redirect('/cart')
    }
    const cart = new Cart(req.session.cart);
    const orderEmail = req.user.email;
    const order = new Order({
        user: req.user,
        cart: cart,
        fullname: req.body.fullname,
        email: orderEmail,
        address: req.body.address,
        phone: req.body.phone,
        city: req.body.city
    });
    await order.save();
    const products = cart.generateArray();
    for (let product of products) {
        const productQty = product.qty;
        const vinyl = await Vinyl.findById(product.item._id);
        const vinylAvailable = vinyl.available;
        await Vinyl.findByIdAndUpdate(product.item._id, { available: `${vinylAvailable - productQty}` })
    }
    if (req.session.cart.totalQty === 1) {
        req.flash('success', 'Successfully bought product');
    } else {
        req.flash('success', 'Successfully bought products');
    }
    req.session.cart = null;
    res.redirect('/')
};