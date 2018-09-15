'use strict'

const newVersion = process.argv[2]

if (!newVersion) {
  throw new Error('New version was not provided.')
}

const fs = require('fs')
const path = require('path')
const exec = require('child_process').execSync

const manifestFile = path.resolve(__dirname, '..', 'src', 'manifest.json')
const manifestContent = fs.readFileSync(manifestFile).toString()

const updatedManifestContent = manifestContent.replace(/([\s]*"version": )"([0-9.]+)",/, `$1"${newVersion}",`)
fs.writeFileSync(manifestFile, updatedManifestContent)

exec(`git add "${manifestFile}" && git commit -m "${newVersion}" && git tag v${newVersion}`)
