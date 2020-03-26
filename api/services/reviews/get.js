const { authMiddleware } = require('@root/authMiddleware.js')
const queries = require('./queries/index.js')
const { verifyOneOfRoles, to } = require('@utils/index.js')

async function routeHandler(req, res, next) {
  const {reviewId} = req.params
  const {selectFields, where, orderBy} = req.query
  const rolesList = (req.user.roles || '').split(' ')

  const isAuthorizedByRole = verifyOneOfRoles(['admin', 'manager'], rolesList)

  if (!reviewId && !isAuthorizedByRole) {
    return res.status(403).json({ message: 'Forbidden by role', roles: req.user.roles })
  }

  let conditions = where || null

  if (reviewId) {
    conditions = where || {}
    conditions.reviewId = reviewId
  }

  const [getErr, reviewList] = await to(queries.get({
    selectFields: (selectFields || '').split(','),
    where: conditions,
    orderBy
  }))

  if (getErr) {
    return next (getErr)
  }

  if (reviewList.length === 0) {
    return res.status(404).json({message: `No review(s) found`})
  }

  res.json(reviewList)
}

module.exports = [
  authMiddleware,
  routeHandler
]
