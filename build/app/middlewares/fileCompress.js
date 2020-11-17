"use strict";const fs = require('fs')
const sharp = require('sharp')

exports.compressImage = (file, size) => {
  const newPath = `${file.path.split('.')[0]}.webp`
  const newFilename = `${file.filename.split('.')[0]}.webp`

  return sharp(file.path)
    .resize(size)
    .toFormat('webp')
    .webp({
      quality: 80,
    })
    .toBuffer()
    .then(data => {
      fs.access(file.path, err => {
        if (!err) {
          fs.unlink(file.path, error => {
            if (error) console.log(error)
          })
        }
      })

      fs.writeFile(newPath, data, err => {
        if (err) {
          throw err
        }
      })

      return { path: newPath, filename: newFilename }
    })
}
