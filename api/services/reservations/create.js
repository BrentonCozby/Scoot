const { authMiddleware } = require('@root/authMiddleware.js')
const { validateRequiredParams, to } = require('@utils/index.js')
const queries = require('./queries/index.js')

async function routeHandler(req, res, next) {
  const {accountId, scooterId, startDate, endDate} = req.body

  const bodyValidation = validateRequiredParams(['accountId', 'scooterId', 'startDate', 'endDate'], req.body)

  if (!bodyValidation.isValid) {
    return res.status(400).json({
      message: 'Missing parameters',
      requestBodyErrors: bodyValidation.messageMap
    })
  }

  const [createErr, resultList] = await to(queries.create({ accountId, scooterId, startDate, endDate }))

  if (createErr) {
    return next(createErr)
  }

  if (!resultList[0]) {
    return next('Reservation not created.')
  }

  res.status(201).json({ message: 'Reservation created', reservation: resultList[0] })
}

module.exports = [
  authMiddleware,
  routeHandler
]
