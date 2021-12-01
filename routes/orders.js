const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateOrder } = require('../middleware')
const orders = require('../controllers/orders')


router.get('/add-to-cart/:id', catchAsync(orders.addToCart))

router.get('/reduce/:id', orders.reduce)

router.get('/remove/:id', orders.removeItem);

router.get('/increment/:id', catchAsync(orders.increment));

router.get('/cart', orders.cart);

router.get('/checkout', isLoggedIn, orders.renderCheckout)

router.post('/checkout', isLoggedIn, validateOrder, catchAsync(orders.checkout));

module.exports = router;