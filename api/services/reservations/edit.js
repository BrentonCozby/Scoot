const router = require('express-promise-router')()
const { passport } = require('@root/passport.js')
const { verifyOneOfRoles, validateRequiredParams, to } = require('@utils/index.js')
const queries = require('./queries/index.js')

async function routeHandler(req, res) {
  const validation = validateRequiredParams(['reservationId', 'updateMap'], req.body)

  if (!validation.isValid) {
    return res.status(409).json({
      message: 'Missing parameters',
      messageMap: validation.messageMap
    })
  }

  const [getErr, reservation] = await to(queries.getWhere({
    where: {
      reservationId: req.body.reservationId
    }
  }))

  if (getErr) {
    console.log(getErr);
    return res.status(500).json({ message: 'Internal server error.' })
  }

  if (!reservation) {
    return res.status(409).json({
      message: 'Could not find reservation with given reservationId',
      messageMap: {
        reservationId: 'Not found'
      }
    })
  }

  let isAuthorizedByRole = true

  if (reservation.accountId !== req.user.accountId) {
    const rolesList = (req.user.roles || '').split(' ')

    isAuthorizedByRole = verifyOneOfRoles(['admin', 'manager'], rolesList)
  }

  if (!isAuthorizedByRole) {
    return res.status(403).json({ message: 'Invalid account roles', roles: req.uesr.roles })
  }

  const [updateErr, result] = await to(queries.update({
    reservationId: req.body.reservationId,
    updateMap: req.body.updateMap
  }))

  if (updateErr) {
    console.log(updateErr);
    return res.status(500).json({ message: 'Internal server error.' })
  }

  if (result.rowCount === 0) {
    return res.status(500).json({ message: 'Reservation not updated.' })
  }

  res.json({ message: `Reservation updated with reservationId ${req.body.reservationId}` })
}

router.put('*',
  passport.authenticate('jwt', { session: false }),
  routeHandler)

module.exports = router
