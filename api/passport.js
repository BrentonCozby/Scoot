const passport = require("passport")
const passportJWT = require("passport-jwt")
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy
const { to } = require('@utils/index.js')
const { getWhere } = require('@services/accounts/queries/index.js')

require('dotenv').config({ path: '../api.env' })

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: new Buffer(process.env.JWT_SECRET, 'base64')
}

const strategy = new JwtStrategy(jwtOptions, async function(jwtPayload, next) {
  const selectFields = ['email', 'first_name', 'last_name', 'roles']

  const [err, result] = await to(getWhere({
    where: {
      accountId: jwtPayload.accountId
    },
    selectFields
  }))

  if (err) {
    console.log(err)
    return next(err, false)
  }

  if (result && result.length) {
    return next(null, {
      accountId: result[0].accountId,
      email: result[0].email,
      firstName: result[0].firstName,
      lastName: result[0].lastName,
      roles: result[0].roles
    })
  } else {
    return next(null, false)
  }
})

passport.use(strategy)

module.exports.jwtOptions = jwtOptions
module.exports.passport = passport
