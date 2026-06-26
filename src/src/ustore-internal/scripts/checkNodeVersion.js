const clc = require("cli-color")

const relevant = process.env.NODE_VERSION || 'v16'
const actual = process.version

module.exports = () => {
  if (!actual.startsWith(relevant)) {
    console.log(clc.yellow('************************************'))
    console.log('')
    console.log(clc.yellow(`You cannot run this theme because your current version of NodeJS is insufficient. Version ${relevant} or above is required.`))
    console.log(clc.yellow(`See Node.JS installation instructions`))
    console.log(clc.blue('https://github.com/XMPieLab/uStore-NG/wiki/Upgrading-a-Custom-Theme'))
    console.log('')
    console.log(clc.yellow('************************************'))

    return false
  } else {
    return true
  }
}
