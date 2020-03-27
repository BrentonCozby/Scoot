const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const { update: updateScooter } = require('@services/scooters/queries/index.js')

function uploadScooterImage({ scooterId, image, filepath }) {
  params = {
    Bucket: 'scoot-cozby',
    Key: filepath,
    Body: image,
    ACL: 'public-read'
  }

  return new Promise((resolve, reject) => {
    s3.putObject(params, async (err) => {
      if (err) {
        return reject(err)
      }

      const photoUrl = `https://s3-us-west-2.amazonaws.com/scoot-cozby/${filepath}?t=${new Date().getTime()}`

      updateScooter({
        scooterId,
        updateMap: {
          photo: photoUrl
        }
      })
      .then(() => {
        resolve(photoUrl)
      })
      .catch(reject)
    })
  })
}

module.exports.uploadScooterImage = uploadScooterImage
