export default {
  "*.{ts,cts,mts}": [
    "oxlint --fix --no-error-on-unmatched-pattern",
    "oxfmt --no-error-on-unmatched-pattern",
  ],
  "*.{js,mjs,cjs,json,md,yml,yaml}": "oxfmt --no-error-on-unmatched-pattern",
};
