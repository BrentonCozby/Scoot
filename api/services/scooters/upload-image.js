const { authMiddleware } = require('@root/authMiddleware.js')
const { verifyOneOfRolesMiddleware, validateRequiredParams, to } = require('@utils/index.js')
const { uploadScooterImage } = require('@utils/aws-s3.js')
const multer = require('multer')
const upload = multer()

async function routeHandler(req, res, next) {
  const {scooterId} = req.params
  const image = req.file

  const pathValidation = validateRequiredParams(['scooterId'], req.params)
  const fileValidation = validateRequiredParams(['image'], {image})

  if (!pathValidation.isValid || !fileValidation.isValid) {
    return res.status(400).json({
      message: 'Missing parameters',
      pathParamsErrors: pathValidation.messageMap,
      fileErrors: fileValidation.messageMap
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

  res.json({ message: `Image uploaded with scooterId: ${req.body.scooterId}. ${imageUrl}` })
}

module.exports = [
  authMiddleware,
  verifyOneOfRolesMiddleware(['admin', 'manager']),
  upload.single('image'),
  routeHandler
]
