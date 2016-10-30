module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "jasmine": true,
    "node": true
  },
  "rules": {
    "indent": [
      "error",
      2
    ],

    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ],
    "jasmine/no-focused-tests": 2,
    "jasmine/no-disabled-tests": 1,
    "jasmine/no-suite-dupes": 1,
    "jasmine/no-spec-dupes": 1,
    "jasmine/valid-expect": 0,
    "jasmine/no-suite-callback-args": 2,
    "react/jsx-uses-react": "error",
    "react/jsx-uses-vars": "error",
  },
  "plugins": [
    "react",
    "jasmine"
  ],
  "parserOptions": {
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true,
      "jsx": true
    },
    "sourceType": "module"
  },
  "extends": [
    "eslint:recommended", 
    "plugin:jasmine/recommended"
  ]
};