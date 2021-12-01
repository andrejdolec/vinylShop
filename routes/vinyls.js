const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const vinyls = require('../controllers/vinyls');

const { isLoggedIn, isAdmin, validateVinyl } = require('../middleware');

router.route('/')
    .get(catchAsync(vinyls.index))
    .post(isLoggedIn, isAdmin, catchAsync(vinyls.createVinyl))

router.route('/new')
    .get(isLoggedIn, isAdmin, vinyls.renderNewForm)

router.get('/pop', catchAsync(vinyls.popGenre));

router.get('/rock', catchAsync(vinyls.rockGenre));

router.get('/hiphop', catchAsync(vinyls.hiphopGenre));

router.get('/rnb', catchAsync(vinyls.rnbGenre));

router.route('/:id')
    .get(catchAsync(vinyls.showVinyl))
    .put(isLoggedIn, isAdmin, validateVinyl, catchAsync(vinyls.updateVinyl))
    .delete(isLoggedIn, isAdmin, catchAsync(vinyls.deleteVinyl))

router.get('/:id/edit', isLoggedIn, isAdmin, catchAsync(vinyls.renderEditForm));

module.exports = router;