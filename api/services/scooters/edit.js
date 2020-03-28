const { authMiddleware } = require('@root/authMiddleware.js')
const { verifyOneOfRolesMiddleware, validateRequiredParams, to } = require('@utils/index.js')
const queries = require('./queries/index.js')
const { uploadScooterImage } = require('@utils/aws-s3.js')
const multer = require('multer')
const upload = multer()

async function routeHandler(req, res, next) {
  const image = req.file

  if (image) {
    return handleImageUpload(req, res, next)
  }

  return handleUpdateMap(req, res, next)
}

async function handleImageUpload(req, res, next) {
  const {scooterId} = req.params
  const image = req.file

  const pathValidation = validateRequiredParams(['scooterId'], req.params)

  if (!pathValidation.isValid) {
    return res.status(400).json({
      message: 'Missing parameters',
      pathParamsErrors: pathValidation.messageMap
    })
  }

  const [uploadErr, imageUrl] = await to(uploadScooterImage({
    scooterId,
    image: image.buffer,
    filepath: `scooter-photos/scooter-id-${scooterId}.${image.mimetype.split('/')[1]}`
  }))

  if (uploadErr) {
    return next(uploadErr)
  }

  res.json({ message: `Image uploaded with scooterId: ${scooterId}`, imageUrl })
}

async function handleUpdateMap(req, res, next) {
  const {scooterId} = req.params
  const {updateMap} = req.body

  const pathValidation = validateRequiredParams(['scooterId'], req.params)
  const bodyValidation = validateRequiredParams(['updateMap'], req.body)

  if (!pathValidation.isValid || !bodyValidation.isValid) {
    return res.status(400).json({
      message: 'Missing parameters',
      pathParamsErrors: pathValidation.messageMap,
      requestBodyErrors: bodyValidation.messageMap
    })
  }

  const [getErr, resultList] = await to(queries.get({
    selectFields: ['scooterId'],
    where: {
      scooterId
    }
  }))

  if (getErr) {
    return next(getErr)
  }

  if (!resultList[0]) {
    return res.status(404).json({
      message: `Could not find scooter with scooterId: ${scooterId}`,
      pathParamsErrors: {
        scooterId: 'Not found'
      }
    })
  }

  const [updateErr] = await to(queries.update({scooterId, updateMap}))

  if (updateErr) {
    return next(updateErr)
  }

  res.json({ message: `Scooter updated with scooterId: ${scooterId}` })
}

module.exports = [
  authMiddleware,
  verifyOneOfRolesMiddleware(['admin', 'manager']),
  upload.single('image'),
  routeHandler
]
