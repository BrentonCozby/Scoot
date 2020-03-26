const { authMiddleware } = require('@root/authMiddleware.js')
const queries = require('./queries/index.js')
const { to } = require('@utils/index.js')

async function routeHandler(req, res, next) {
  const {reservationId} = req.params
  const {selectFields, where, orderBy, distanceFrom, betweenDates} = req.query

  let conditions = where || null

  if (reservationId) {
    conditions = where || {}
    conditions.reservationId = reservationId
  }

  const [getErr, reservationList] = await to(queries.get({
    selectFields: (selectFields || '').split(','),
    where: conditions,
    orderBy,
    distanceFrom: (distanceFrom || '').split(','),
    betweenDates: (betweenDates || '').split(',')
  }))

  if (getErr) {
    return next(getErr)
  }

  if (reservationList.length === 0) {
    return res.status(404).json({message: `No reservation(s) found`})
  }

  res.json(reservationList)
}

module.exports = [
  authMiddleware,
  routeHandler
]
