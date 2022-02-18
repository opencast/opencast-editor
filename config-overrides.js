
  // Overrides to make emotion css work with createReactApp
  const { override, addBabelPreset } = require('customize-cra')
  
  module.exports = override(
    addBabelPreset('@emotion/babel-preset-css-prop')
    resolve: {
      alias: {
  
      process: “process/browser”
  
      }}
  )