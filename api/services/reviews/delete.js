const router = require('express-promise-router')()
const { authMiddleware } = require('@root/authMiddleware.js')
const { verifyOneOfRoles, validateRequiredParams, to } = require('@utils/index.js')
const queries = require('./queries/index.js')

async function routeHandler(req, res) {
  let isAuthorizedByRole = true
  const validation = validateRequiredParams(['reviewId'], req.body)

  if (!validation.isValid) {
    return res.status(409).json({
      message: 'Missing parameters',
      messageMap: validation.messageMap
    })
  }

  let [getErr, review] = await to(queries.getWhere({
    where: {
      reviewId: req.body.reviewId
    }
  }))

  if (getErr) {
    console.log(err);
    res.status(500).json({ message: 'Internal server error.' })
  }

  if (!review) {
    return res.status(409).json({
      message: 'Could not find review with given reviewId',
      messageMap: {
        reviewId: 'Not found'
      }
    })
  }

  if (review.accountId !== req.user.accountId) {
    const rolesList = (req.user.roles || '').split(' ')

    isAuthorizedByRole = verifyOneOfRoles(['admin', 'manager'], rolesList)
  }

  if (!isAuthorizedByRole) {
    return res.status(403).json({ message: 'Invalid account roles', roles: req.user.roles })
  }

  const [deleteErr, result] = await to(queries.deleteReview({
    reviewId: req.body.reviewId
  }))

  if (deleteErr) {
    console.log(err);
    return res.status(500).json({ message: 'Internal server error.' })
  }

  if (result.rowCount === 0) {
    return res.status(500).json({ message: 'Review not deleted.' })
  }

  res.json({ message: `Review deleted with reviewId: ${req.body.reviewId}` })
}

router.delete('*',
  authMiddleware,
  routeHandler)

module.exports = router
