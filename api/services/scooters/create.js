const router = require('express-promise-router')()
const { authMiddleware } = require('@root/authMiddleware.js')
const { validateRequiredParams, verifyOneOfRolesMiddleware, to } = require('@utils/index.js')
const queries = require('./queries/index.js')

async function routeHandler(req, res, next) {
  const {model, photo, color, description, lat, lng} = req.body

  const bodyValidation = validateRequiredParams(['model', 'photo', 'color', 'description', 'lat', 'lng'], req.body)

  if (!bodyValidation.isValid) {
    return res.status(400).json({
      message: 'Missing parameters',
      requestBodyErrors: bodyValidation.messageMap
    })
  }

  const [createErr, result] = await to(queries.create({model, photo, color, description, lat, lng}))

  if (createErr) {
    return next(createErr)
  }

  if (result.rowCount === 0) {
    return next('Scooter not created.')
  }

  res.json({ message: 'Scooter created' })
}

module.exports = [
  authMiddleware,
  verifyOneOfRolesMiddleware(['admin', 'manager']),
  routeHandler
]
