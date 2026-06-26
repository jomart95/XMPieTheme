const util = require('util')
const exec = util.promisify(require('child_process').exec)

const execCommandInTheme = async (command) => {
  console.log(`executing command ${command}`)
  const { stdout, stderr } = await exec(`${command}`)
  console.log(`done command ${command}`)
  console.log(stdout)
  if (stderr) {
    console.error(stderr)
  }
}

module.exports = execCommandInTheme
