module.exports = {
  '*.{js,jsx,ts,tsx,!.*.js}': ['eslint --max-warnings 5', 'prettier --write'],
  '*.{json,css,md}': ['prettier --write'],
};
