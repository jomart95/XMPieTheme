const postcss = require('postcss')
const fs = require('fs')

const plugin = () => ({
  postcssPlugin: 'postcss-extract-css-variables',
  prepare(result) {
    result.messages = {}
    return {
      Declaration(decl) {
        if (/^--/.test(decl.prop)) {
          if (decl.parent.type === 'rule') {
            if (decl.parent?.parent.type === 'atrule' && decl.parent.parent.name === 'media') {
              result.messages[`@media ${decl.parent.parent.params}`] = result.messages[`@media ${decl.parent.parent.params}`] || {}
              result.messages[`@media ${decl.parent.parent.params}`][`${decl.parent.selector}`] = result.messages[`@media ${decl.parent.parent.params}`][`${decl.parent.selector}`] || {}
              result.messages[`@media ${decl.parent.parent.params}`][`${decl.parent.selector}`][decl.prop] = decl.value

            } else {
              if (decl.parent.selector.indexOf('[data-bs-theme=dark]') === -1) {
                result.messages[decl.prop] = decl.value
              }
            }
          }
        }
      }
    }
  }

})
plugin.postcss = true

const webComponentCssFileName = './out_wc/static/css/x-store.css'
const css = fs.readFileSync(webComponentCssFileName, 'utf8')

const output = postcss([plugin]).process(css).messages
const result = []
for (const key in output) {
  if (key.startsWith('@media')) {
    result.push(`  ${key} {`)
    for (const prop in output[key]) {
      result.push(`  ${prop} {`)
      for (const prop2 in output[key][prop]) {
        result.push(`   ${prop2}: ${output[key][prop][prop2].replace(/\r?\n|\r/, '')};`)
      }
      result.push('   }')
    }
    result.push('  }')
    continue
  }
  result.unshift(`  ${key}: ${output[key].replace(/\r?\n|\r/, '')};`)
}
result.unshift(':host {')
result.push('}')
fs.writeFileSync(webComponentCssFileName, result.join('\n') + css)

