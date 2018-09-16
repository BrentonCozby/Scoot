const router = require('express-promise-router')()
const { authMiddleware } = require('@root/authMiddleware.js')
const { verifyOneOfRoles, validateRequiredParams, to } = require('@utils/index.js')
const queries = require('./queries/index.js')

async function routeHandler(req, res) {
  const validation = validateRequiredParams(['reviewId', 'updateMap'], req.body)

  if (!validation.isValid) {
    return res.status(409).json({
      message: 'Missing parameters',
      messageMap: validation.messageMap
    })
  }

  const [getErr, review] = await to(queries.getWhere({
    where: {
      reviewId: req.body.reviewId
    }
  }))

  if (getErr) {
    console.log(getErr);
    return res.status(500).json({ message: 'Internal server error.' })
  }

  if (!review) {
    return res.status(409).json({
      message: 'Could not find review with given reviewId',
      messageMap: {
        reviewId: 'Not found'
      }
    })
  }

  let isAuthorizedByRole = true

  if (review.accountId !== req.user.accountId) {
    const rolesList = (req.user.roles || '').split(' ')

    isAuthorizedByRole = verifyOneOfRoles(['admin', 'manager'], rolesList)
  }

  if (!isAuthorizedByRole) {
    return res.status(403).json({ message: 'Editing reservations on other accounts is prohibited due to role.', roles: req.uesr.roles })
  }

  const [updateErr, result] = await to(queries.updateReview({
    reviewId: req.body.reviewId,
    updateMap: req.body.updateMap
  }))

  if (updateErr) {
    console.log(err);
    return res.status(500).json({ message: 'Internal server error.' })
  }

  if (result.rowCount === 0) {
    return res.status(500).json({ message: 'Review not updated.' })
  }

  res.json({ message: `Review updated with reviewId ${req.body.reviewId}` })
}

router.put('*',
  authMiddleware,
  routeHandler)

module.exports = router
