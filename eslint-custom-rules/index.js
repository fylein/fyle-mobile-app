module.exports = {
    rules: {
      'prefer-deep-freeze': require('./rules/eslint-plugin-prefer-deep-freeze'),
      'space-before-it-blocks': require('./rules/eslint-plugin-space-before-it-blocks'),
      'prefer-jasmine-matchers': require('./rules/eslint-plugin-prefer-jasmine-matchers'),
      'prefer-resolve-to-reject-with': require('./rules/eslint-plugin-prefer-resolve-to-reject-with'),
      'one-enum-per-file': require('./rules/eslint-plugin-one-enum-per-file'),
    },
};