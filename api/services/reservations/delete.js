const router = require('express-promise-router')()
const { authMiddleware } = require('@root/authMiddleware.js')
const { verifyOneOfRoles, validateRequiredParams, to } = require('@utils/index.js')
const queries = require('./queries/index.js')

async function routeHandler(req, res) {
  let isAuthorizedByRole = true
  const validation = validateRequiredParams(['reservationId'], req.body)

  if (!validation.isValid) {
    return res.status(409).json({
      message: 'Missing parameters',
      messageMap: validation.messageMap
    })
  }

  let [getErr, reservation] = await to(queries.getWhere({
    where: {
      reservationId: req.body.reservationId
    }
  }))

  if (getErr) {
    console.log(getErr);
    res.status(500).json({ message: 'Internal server error.' })
  }

  if (!reservation[0]) {
    return res.status(409).json({
      message: 'Could not find reservation with given reservationId',
      messageMap: {
        reservationId: 'Not found'
      }
    })
  }

  if (reservation[0].accountId !== req.user.accountId) {
    const rolesList = (req.user.roles || '').split(' ')

    isAuthorizedByRole = verifyOneOfRoles(['admin', 'manager'], rolesList)
  }

  if (!isAuthorizedByRole) {
    return res.status(403).json({ message: 'Invalid account roles', roles: req.user.roles })
  }

  const [deleteErr, result] = await to(queries.remove({
    reservationId: req.body.reservationId
  }))

  if (deleteErr) {
    console.log(deleteErr);
    return res.status(500).json({ message: 'Internal server error.' })
  }

  if (result.rowCount === 0) {
    return res.status(500).json({ message: 'Reservation not deleted.' })
  }

  res.json({
    message: `Reservation deleted with reservationId: ${req.body.reservationId}`,
    rows: result.rows
  })
}

router.delete('*',
  authMiddleware,
  routeHandler)

module.exports = router
