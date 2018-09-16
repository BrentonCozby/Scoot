const router = require('express-promise-router')()
const { authMiddleware } = require('@root/authMiddleware.js')
const queries = require('./queries/index.js')
const { verifyOneOfRoles, validateRequiredParams, to } = require('@utils/index.js')

async function getAll(req, res, next) {
  const rolesList = (req.user.roles || '').split(' ')

  const isAuthorizedByRole = verifyOneOfRoles(['admin', 'manager'], rolesList)

  if (!isAuthorizedByRole) {
    return res.status(403).json({ message: 'Invalid account roles', roles: req.user.roles })
  }

  const [err, reviewList] = await to(queries.getAll({ selectFields: req.body.selectFields }))

  if (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal server error.' })
  }

  res.json(reviewList || [])
}

async function getWhere(req, res, next) {
  const validation = validateRequiredParams(['where'], req.body)

  if (!validation.isValid) {
    return res.status(409).json({
      message: 'Missing parameters',
      messageMap: validation.messageMap
    })
  }

  const [err, reviewList] = await to(queries.getWhere({
    where: req.body.where,
    selectFields: req.body.selectFields
  }))

  if (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal server error.' })
  }

  res.json(reviewList || [])
}

async function routeHandler(req, res, next) {
  if (req.body.all) {
    return getAll(req, res, next)
  }

  if (req.body.where) {
    return getWhere(req, res, next)
  }

  res.status(406).json({
    message: 'Parameters for getting reviews are required',
    params: 'all (boolean), where (map)'
  })
}

router.post('*',
  authMiddleware,
  routeHandler)

module.exports = router
