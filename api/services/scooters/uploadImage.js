const router = require('express-promise-router')()
const { authMiddleware } = require('@root/authMiddleware.js')
const { verifyOneOfRolesMiddleware, validateRequiredParams, to } = require('@utils/index.js')
const { uploadScooterImage } = require('@utils/aws-s3.js')
const multer = require('multer')
const upload = multer()

async function routeHandler(req, res) {
  const validation = validateRequiredParams(['scooterId'], req.body)

  const { scooterId } = req.body
  const image = req.file

  if (!validation.isValid) {
    return res.status(409).json({
      message: 'Missing parameters',
      messageMap: validation.messageMap
    })
  }

  if (!image) {
    return res.status(409).json({
      message: 'Image missing. Please provide an image.',
      messageMap: {}
    })
  }

  const [uploadErr, imageUrl] = await to(uploadScooterImage({
    scooterId,
    image: image.buffer,
    filepath: `scooter-photos/scooter-id-${scooterId}.${image.mimetype.split('/')[1]}`
  }))

  if (uploadErr) {
    console.log(uploadErr)
    return res.status(500).json({ message: 'Internal server error.' })
  }

  res.json({ message: `Image uploaded with scooterId: ${req.body.scooterId}. ${imageUrl}` })
}

router.put('*',
  authMiddleware,
  verifyOneOfRolesMiddleware(['admin', 'manager']),
  upload.single('image'),
  routeHandler)

module.exports = router
