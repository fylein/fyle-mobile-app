module.exports = {
    rules: {
      'prefer-deep-freeze': require('./rules/eslint-plugin-prefer-deep-freeze'),
      'space-before-it-blocks': require('./rules/eslint-plugin-space-before-it-blocks'),
      'prefer-jasmine-matchers': require('./rules/eslint-plugin-prefer-jasmine-matchers'),
      'prefer-resolve-to-reject-with': require('./rules/eslint-plugin-prefer-resolve-to-reject-with'),
      'one-interface-per-file': require('./rules/eslint-plugin-one-interface-per-file'),
      'one-enum-per-file': require('./rules/eslint-plugin-one-enum-per-file'),
      'prefer-semantic-extension-name': require('./rules/eslint-plugin-prefer-semantic-extension-name'),
    },
};