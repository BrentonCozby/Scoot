const router = require('express-promise-router')()
const { authMiddleware } = require('@root/authMiddleware.js')
const queries = require('./queries/index.js')
const { verifyOneOfRolesMiddleware, validateRequiredParams, to } = require('@utils/index.js')

async function getAll(req, res) {
  const [getAllErr, accountList] = await to(queries.getAll({
    selectFields: req.body.selectFields,
    orderBy: req.body.orderBy
  }))

  if (getAllErr) {
    console.log(getAllErr);
    return res.status(500).json({ message: 'Internal server error.' })
  }

  res.json(accountList || [])
}

async function getWhere(req, res) {
  const validation = validateRequiredParams(['accountId', 'selectFields'], req.body)

  if (!validation.isValid) {
    return res.status(409).json({
      message: 'Missing parameters',
      messageMap: validation.messageMap
    })
  }

  const [getErr, accountList] = await to(queries.getWhere({
    where: {
      accountId: req.body.accountId
    },
    selectFields: req.body.selectFields,
    orderBy: req.body.orderBy
  }))

  if (getErr) {
    console.log(getErr);
    return res.status(500).json({ message: 'Internal server error.' })
  }

  res.json(accountList || [])
}

async function routeHandler(req, res) {
  if (req.body.all) {
    return getAll(req, res)
  }

  if (req.body.where) {
    return getWhere(req, res)
  }

  res.status(406).json({
    message: 'Parameters for getting accounts are required',
    params: 'all (boolean), where (map)'
  })
}

router.post('*',
  authMiddleware,
  verifyOneOfRolesMiddleware(['admin', 'manager']),
  routeHandler)

module.exports = router
