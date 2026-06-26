const compileSharedScss = require('./compileSharedScss')

const filesToCompile = [
  {
    file: 'src/styles/fonts.scss',
    outFile: 'fonts.css'
  },
  {
    file: 'src/styles/variables.scss',
    outFile: 'variables.css'
  },
]

compileSharedScss(filesToCompile, 'out/assets' )
