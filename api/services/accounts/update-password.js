const { authMiddleware } = require('@root/authMiddleware.js')
const queries = require('./queries/index.js')
const { verifyOneOfRoles, validateRequiredParams, to } = require('@utils/index.js')

async function routeHandler(req, res, next) {
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

  const [updateErr, result] = await to(queries.updateAccountPassword({accountId, newPassword}))

  if (updateErr) {
    return next(updateErr)
  }

  if (result.rowCount === 0) {
    return next('Password not updated.')
  }

  res.json({ message: `Password updated for accountId: ${accountId}` })
}

module.exports = [
  authMiddleware,
  routeHandler
]
