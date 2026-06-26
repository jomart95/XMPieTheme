const postcss = require("postcss");
const fs = require("fs");
const path = require("path");

class ExtractCssVariablesPlugin {
  constructor(options = {}) {
    this.cssFileName = options.cssFileName || "dev.css"; // Default output file
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync("ExtractCssVariablesPlugin", (compilation, callback) => {
      const cssAsset = compilation.assets[this.cssFileName];

      if (!cssAsset) {
        console.warn(`[ExtractCssVariablesPlugin] ${this.cssFileName} not found in assets.`);
        callback();
        return;
      }

      const css = cssAsset.source();

      // PostCSS plugin for extracting CSS variables
      const plugin = () => ({
        postcssPlugin: "postcss-extract-css-variables",
        prepare(result) {
          result.messages = {};
          return {
            Declaration(decl) {
              if (/^--/.test(decl.prop)) {
                if (decl.parent.type === "rule") {
                  if (decl.parent?.parent.type === "atrule" && decl.parent.parent.name === "media") {
                    const mediaQuery = `@media ${decl.parent.parent.params}`;
                    result.messages[mediaQuery] = result.messages[mediaQuery] || {};
                    result.messages[mediaQuery][decl.parent.selector] =
                      result.messages[mediaQuery][decl.parent.selector] || {};
                    result.messages[mediaQuery][decl.parent.selector][decl.prop] = decl.value;
                  } else {
                    if (!decl.parent.selector.includes("[data-bs-theme=dark]")) {
                      result.messages[decl.prop] = decl.value;
                    }
                  }
                }
              }
            },
          };
        },
      });
      plugin.postcss = true;

      // Process the CSS with PostCSS
      const output = postcss([plugin]).process(css).messages;

      // Format the extracted CSS variables
      const result = [];
      for (const key in output) {
        if (key.startsWith("@media")) {
          result.push(`  ${key} {`);
          for (const selector in output[key]) {
            result.push(`  ${selector} {`);
            for (const prop in output[key][selector]) {
              result.push(`   ${prop}: ${output[key][selector][prop].replace(/\r?\n|\r/, "")};`);
            }
            result.push("   }");
          }
          result.push("  }");
        } else {
          result.unshift(`  ${key}: ${output[key].replace(/\r?\n|\r/, "")};`);
        }
      }
      result.unshift(":host {");
      result.push("}");

      // Modify the asset content in Webpack's output
      const finalCss = result.join("\n") + "\n" + css;
      compilation.assets[this.cssFileName] = {
        source: () => finalCss,
        size: () => finalCss.length,
      };

      console.log(`[ExtractCssVariablesPlugin] Processed ${this.cssFileName}`);
      callback();
    });
  }
}

module.exports = ExtractCssVariablesPlugin;
