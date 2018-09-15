'use strict'

const manifest = require('../src/manifest.json')
const path = require('path')
const AdmZip = require('adm-zip')

const projectDir = path.resolve(__dirname, '..')
const srcDir = path.join(projectDir, 'src')
const distDir = path.join(projectDir, 'dist')
const outputFilename = `owa-notifications-${manifest.version}.xpi`

const zip = new AdmZip()
zip.addLocalFolder(srcDir)
zip.writeZip(path.join(distDir, outputFilename))
