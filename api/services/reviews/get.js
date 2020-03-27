const { authMiddleware } = require('@root/authMiddleware.js')
const queries = require('./queries/index.js')
const { to } = require('@utils/index.js')

async function routeHandler(req, res, next) {
  const {reviewId} = req.params
  const {selectFields, where, orderBy} = req.query

  let conditions = where || null

  if (reviewId) {
    conditions = where || {}
    conditions.reviewId = reviewId
  }

  const [getErr, reviewList] = await to(queries.get({
    selectFields,
    where: conditions,
    orderBy
  }))

  if (getErr) {
    return next (getErr)
  }

  res.json(reviewList)
}

module.exports = [
  authMiddleware,
  routeHandler
]
