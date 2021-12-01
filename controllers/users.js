const User = require('../models/user');
const Order = require('../models/order');
const Cart = require('../models/cart');

module.exports.profile = function (req, res, next) {
    Order.find({ user: req.user }, function (err, orders) {
        if (err) {
            return res.write('ERROR')
        }
        var cart;
        orders.forEach(function (order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });
        res.render('users/profile', { orders: orders })
    });
}

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        if (username !== 'admin' && email !== `${process.env.ADMIN_EMAIL}`) {
            const user = new User({ email, username, role: 'user' });
            const registeredUser = await User.register(user, password);
            req.login(registeredUser, err => {
                if (err) return next(err);
                req.flash('Welcome to VinylShop');
                res.redirect('/vinyls');
            });
        } else {
            const admin = new User({ email, username, role: 'admin' })
            const registeredAdmin = await User.register(admin, password);
            req.login(registeredAdmin, err => {
                if (err) return next(err);
                req.flash('Welcome to VinylShop');
                res.redirect('/vinyls');
            });
        }
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register')
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome Back!');
    const redirectUrl = req.session.returnTo || '/vinyls';
    delete req.session.returnTo;
    res.redirect(`${redirectUrl}`);
}

module.exports.allOrders = async (req, res) => {
    Order.find({}, function (err, orders) {
        if (err) {
            return res.write('ERROR')
        }
        var cart;
        orders.forEach(function (order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });
        res.render('users/allorders', { orders: orders });
    });
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', "Succesfully logged you out");
    res.redirect('/vinyls');
}