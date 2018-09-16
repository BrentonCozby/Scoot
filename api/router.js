const express = require('express')
const router = require('express-promise-router')()
const fs = require('fs')
const { resolve } = require('path')

const IGNORED_FILEPATHS = ['queries']

fs.readdir(resolve(__dirname, 'services'), (err, categories) => {
  categories.forEach(category => {
    const categoryPath = resolve(__dirname, 'services', category)

    fs.readdir(categoryPath, (err, services) => {
      services.forEach(service => {
        const serviceName = service.split('.js')[0]

        if (IGNORED_FILEPATHS.includes(serviceName)) {
          return
        }

        const controller = require(`./services/${category}/${serviceName}.js`)

        router.all(`/${category}/${serviceName}`, controller)
      })
    })
  })
})

router.use(function(error, req, res, next) {
  res.json({ message: error.message });
})

module.exports = router
