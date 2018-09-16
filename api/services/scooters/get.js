const router = require('express-promise-router')()
const { passport } = require('@root/passport.js')
const queries = require('./queries/index.js')
const { validateRequiredParams, to } = require('@utils/index.js')

async function getWhere(req, res) {
  const validation = validateRequiredParams(['selectFields'], req.body)

  if (!validation.isValid) {
    return res.status(409).json({
      message: 'Missing parameters',
      messageMap: validation.messageMap
    })
  }

  const [getScootersErr, scooterList] = await to(queries.getWhere({
    where: req.body.where,
    selectFields: req.body.selectFields,
    orderBy: req.body.orderBy,
    distanceFrom: req.body.distanceFrom
  }))

  if (getScootersErr) {
    console.log(getScootersErr);
    return res.status(500).json({ message: 'Internal server error.' })
  }

  res.json(scooterList || [])
}

async function routeHandler(req, res) {
  return getWhere(req, res)
}

router.post('*',
  passport.authenticate('jwt', { session: false }),
  routeHandler)

module.exports = router