export default {
  '*.{ts,tsx}': [
    'eslint --fix',
    'vitest related --run',
  ],
};
