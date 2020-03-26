const { authMiddleware } = require('@root/authMiddleware.js')
const queries = require('./queries/index.js')
const { to } = require('@utils/index.js')

async function routeHandler(req, res, next) {
  const {scooterId} = req.params
  const {selectFields, where, orderBy, distanceFrom} = req.query

  let conditions = where || null

  if (scooterId) {
    conditions = where || {}
    conditions.scooterId = scooterId
  }

  const [getErr, scooterList] = await to(queries.get({
    selectFields: (selectFields || '').split(','),
    where: conditions,
    orderBy,
    distanceFrom: (distanceFrom || '').split(',')
  }))

  if (getErr) {
    return next(getErr)
  }

  if (scooterList.length === 0) {
    return res.status(404).json({message: `No scooter(s) found`})
  }

  res.json(scooterList)
}

module.exports = [
  authMiddleware,
  routeHandler
]
