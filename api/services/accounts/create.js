const { validateRequiredParams, to } = require('@utils/index.js')
const queries = require('./queries/index.js')
const santizeHtml = require('sanitize-html')

async function routeHandler(req, res, next) {
  const {email, password, firstName, lastName, roles} = req.body

  const bodyValidation = validateRequiredParams(['email', 'password', 'firstName', 'lastName'], req.body)

  if (!bodyValidation.isValid) {
    return res.status(400).json({
      message: 'Missing request body parameters',
      requestBodyErrors: bodyValidation.messageMap
    })
  }

  let [getErr, account] = await to(queries.get({
    where: { email }
  }))

  if (getErr) {
    return next(getErr)
  }

  if (account && account.length) {
    return res.status(409).json({
      message: `Account already exists with email: ${santizeHtml(email)}.`,
      queryParamsErrors: {
        email: 'Email already exists'
      }
    })
  }

  const [createErr, resultList] = await to(queries.create({ email, password, firstName, lastName, roles }))

  if (createErr) {
    return next(createErr)
  }

  if (!resultList[0]) {
    return next('Account not created.')
  }

  res.status(201).json({ message: 'Account created.', account: resultList[0] })
}

module.exports = [routeHandler]
