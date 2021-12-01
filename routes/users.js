const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAdmin } = require('../middleware');
const users = require('../controllers/users');

router.get('/profile', isLoggedIn, users.profile)

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/allorders', isLoggedIn, isAdmin, catchAsync(users.allOrders))

router.get('/logout', users.logout)

module.exports = router;