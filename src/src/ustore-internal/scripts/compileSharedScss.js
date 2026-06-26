const sass = require('sass')
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const rpath = path.join.bind(path, __dirname)

const xmpieBuild = fs.existsSync(rpath('../../../.xmpie'))
const { includeCssPaths } = xmpieBuild ? require('../../../template.config') : require('../../../dev.config.js')

const main = (files, output) => {
  fse.ensureDirSync(output)

  for (const {file, outFile} of files) {
    const target = `${output}/${outFile}`

    const renderedSass = sass.compile(file,{
      outputStyle: 'nested',
      includeCssPaths
    })

    fs.writeFileSync(target, renderedSass.css.toString())
  }
}

module.exports = main
