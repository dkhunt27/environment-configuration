module.exports = {
  extends: ['@commitlint/config-conventional', '@commitlint/parse'],
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w*)(?:\((.*)\))?!?: (.*)$/,
      referenceActions: null,
      issuePrefixes: ['ISS-']
    }
  }
};
