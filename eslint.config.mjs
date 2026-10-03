// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'lib/api/generated/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // ARCH-025: pages, hooks and components reach Career-Server through the
    // facade in lib/api (services.ts and friends, lib/api/urls.ts for
    // navigations and file URLs). They never import generated code, and never
    // build an API URL from the environment themselves.
    // lib/signed-url.ts is the one exception: it still posts to a hand-built
    // path (see the batch 7 report) until the owner decides how to fix it.
    files: ['**/*.{ts,tsx}'],
    ignores: ['lib/api/**', 'lib/signed-url.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/lib/api/generated/**', '**/generated/endpoints/**'],
              message:
                'Go through the facade in lib/api (services.ts, urls.ts, ...); generated code is imported only from lib/api.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "MemberExpression[object.object.name='process'][object.property.name='env'][property.name='NEXT_PUBLIC_API_URL']",
          message:
            'Do not build API URLs by hand; use lib/api/urls.ts (navigations, file URLs) or the facade (requests).',
        },
      ],
    },
  },
  {
    rules: {
      'linebreak-style': 0,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          'varsIgnorePattern': '^_',
          'argsIgnorePattern': '^_',
        },
      ],
    },
  },
);
