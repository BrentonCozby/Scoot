const router = require('express-promise-router')()
const { passport } = require('@root/passport.js')
const { validateRequiredParams, verifyOneOfRolesMiddleware, to } = require('@utils/index.js')
const queries = require('./queries/index.js')

async function routeHandler(req, res) {
  const model = req.body.model
  const photo = req.body.photo
  const color = req.body.color
  const description = req.body.description
  const lat = req.body.lat
  const lng = req.body.lng

  const validation = validateRequiredParams(['model', 'photo', 'color', 'description', 'lat', 'lng'], req.body)

  if (!validation.isValid) {
    return res.status(409).json({
      message: 'Missing parameters',
      messageMap: validation.messageMap
    })
  }

  const [createErr, result] = await to(queries.createScooter({
    data: { model, photo, color, description, lat, lng }
  }))

  if (createErr) {
    console.log(createErr);
    return res.status(500).json({ message: 'Internal server error.' })
  }

  if (result.rowCount === 0) {
    return res.status(500).json({ message: 'Scooter not created.' })
  }

  res.json({ message: 'Scooter created' })
}

router.post('*',
  passport.authenticate('jwt', { session: false }),
  verifyOneOfRolesMiddleware(['admin', 'manager']),
  routeHandler
)

module.exports = router
