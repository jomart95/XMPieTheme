const fse = require('fs-extra')
const theme = process.env.THEME_PAGES || 'AquaBlue'
const path = require('path')
const relpath = path.join.bind(path, __dirname)

const main = (xmpieBuild) => {
  if(xmpieBuild){
    fse.copySync(relpath(`../../${theme}/assets/`), relpath('../../../out/assets/'))
  }
  else{
    fse.copySync(relpath(`../../assets/`), relpath('../../../out/assets/'))
  }
}

module.exports = main
