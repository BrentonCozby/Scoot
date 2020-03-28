const { authMiddleware } = require('@root/authMiddleware.js')
const { validateRequiredParams, to } = require('@utils/index.js')
const queries = require('./queries/index.js')

async function routeHandler(req, res, next) {
  const {newPassword} = req.body

  if (newPassword) {
    return handleNewPassword(req, res, next)
  }

  return handleUpdateMap(req, res, next)
}

async function handleUpdateMap(req, res, next) {
  const {accountId} = req.params
  const {updateMap} = req.body

  let isAuthorizedByRole = verifyOneOfRoles(['admin', 'manager'], rolesList)

  if (!isAuthorizedByRole) {
    return res.status(403).json({
      message: 'Forbidden by role',
      roles: req.user.roles
    })
  }

  const pathValidation = validateRequiredParams(['accountId'], req.params)
  const bodyValidation = validateRequiredParams(['updateMap'], req.body)

  if (!pathValidation.isValid || !bodyValidation.isValid) {
    return res.status(400).json({
      message: 'Missing parameters',
      pathParamsErrors: pathValidation.messageMap,
      requestBodyErrors: bodyValidation.messageMap
    })
  }

  const [getErr, accounts] = await to(queries.get({
    where: {
      accountId
    },
    updateMap
  }))

  if (getErr) {
    return next(getErr)
  }

  if (!accounts[0]) {
    return res.status(404).json({
      message: `Could not find account with accountId: ${accountId}`,
      pathParamsErrors: {
        accountId: 'Not found'
      }
    })
  }

  const [updateErr] = await to(queries.update({accountId, updateMap}))

  if (updateErr) {
    return next(updateErr)
  }

  res.json({ message: `Account updated with accountId: ${accountId}` })
}

async function handleNewPassword(req, res, next) {
  const {accountId} = req.params
  const {newPassword} = req.body

  const pathValidation = validateRequiredParams(['accountId'], req.params)
  const bodyValidation = validateRequiredParams(['newPassword'], req.body)

  if (!pathValidation.isValid || !bodyValidation.isValid) {
    return res.status(400).json({
      message: 'Missing parameters',
      pathParamsErrors: pathValidation.messageMap,
      bodyParamsErrors: bodyValidation.messageMap
    })
  }

  let isAuthorizedByRole = true

  if (accountId !== req.user.accountId) {
    const rolesList = (req.user.roles || '').split(' ')

    isAuthorizedByRole = verifyOneOfRoles(['admin', 'manager'], rolesList)
  }

  if (!isAuthorizedByRole) {
    return res.status(403).json({
      message: 'Forbidden by role. Cannot change password of another account.',
      roles: req.user.roles
    })
  }

  const [updateErr] = await to(queries.updatePassword({accountId, newPassword}))

  if (updateErr) {
    return next(updateErr)
  }

  res.json({ message: `Password updated for accountId: ${accountId}` })
}

module.exports = [
  authMiddleware,
  routeHandler
]
