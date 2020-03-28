require('express')
const router = require('express-promise-router')()

const auth = require('./services/auth')
const accounts = require('./services/accounts')
const scooters = require('./services/scooters')
const reviews = require('./services/reviews')
const reservations = require('./services/reservations')

router.get('/create-token', ...auth.createToken)

router.get('/accounts', ...accounts.get)
router.get('/accounts/:accountId', ...accounts.get)
router.post('/accounts', ...accounts.create)
router.put('/accounts/:accountId', ...accounts.edit)
router.delete('/accounts/:accountId', ...accounts.remove)

router.get('/reservations', ...reservations.get)
router.get('/reservations/:reservationId', ...reservations.get)
router.post('/reservations', ...reservations.create)
router.put('/reservations/:reservationId', ...reservations.edit)
router.delete('/reservations/:reservationId', ...reservations.remove)

router.get('/reviews', ...reviews.get)
router.get('/reviews/:reviewId', ...reviews.get)
router.post('/reviews', ...reviews.create)
router.put('/reviews/:reviewId', ...reviews.edit)
router.delete('/reviews/:reviewId', ...reviews.remove)

router.get('/scooters', ...scooters.get)
router.get('/scooters/:scooterId', ...scooters.get)
router.post('/scooters', ...scooters.create)
router.put('/scooters/:scooterId', ...scooters.edit)
router.delete('/scooters/:scooterId', ...scooters.remove)

module.exports = router
