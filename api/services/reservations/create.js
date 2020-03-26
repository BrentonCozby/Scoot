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

  const [createErr, result] = await to(queries.create({ accountId, scooterId, startDate, endDate }))

  if (createErr) {
    return next(createErr)
  }

  if (result.rowCount === 0) {
    return next('Reservation not created.')
  }

  res.json({ message: 'Reservation created', rows: result.rows })
}

module.exports = [
  authMiddleware,
  routeHandler
]
