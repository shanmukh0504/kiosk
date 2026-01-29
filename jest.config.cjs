module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: './tsconfig.jest.json',
      astTransformers: {
        before: [
          {
            path: require.resolve('ts-jest-mock-import-meta'),
            options: {
              metaObjectReplacement: {
                env: {
                  VITE_ENVIRONMENT: process.env.VITE_ENVIRONMENT,
                  VITE_NETWORK: process.env.VITE_NETWORK,
                  VITE_BASE_URL: process.env.VITE_BASE_URL,
                  VITE_INFO_URL: process.env.VITE_INFO_URL,
                  VITE_QUOTE_URL: process.env.VITE_QUOTE_URL,
                  VITE_STAKING_URL: process.env.VITE_STAKING_URL,
                  VITE_EXPLORER_URL: process.env.VITE_EXPLORER_URL,
                  VITE_REWARD_URL: process.env.VITE_REWARD_URL,
                  VITE_API_KEY: process.env.VITE_API_KEY,
                  VITE_WALLETCONNECT_PROJECT_ID: process.env.VITE_WALLETCONNECT_PROJECT_ID,
                  VITE_BALANCE_URL: process.env.VITE_BALANCE_URL,
                },
              },
            },
          },
        ],
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  globals: {
    'import.meta': {
      env: {
        VITE_ENVIRONMENT: process.env.VITE_ENVIRONMENT,
        VITE_NETWORK: process.env.VITE_NETWORK,
        VITE_BASE_URL: process.env.VITE_BASE_URL,
        VITE_INFO_URL: process.env.VITE_INFO_URL,
        VITE_QUOTE_URL: process.env.VITE_QUOTE_URL,
        VITE_STAKING_URL: process.env.VITE_STAKING_URL,
        VITE_EXPLORER_URL: process.env.VITE_EXPLORER_URL,
        VITE_REWARD_URL: process.env.VITE_REWARD_URL,
        VITE_API_KEY: process.env.VITE_API_KEY,
        VITE_WALLETCONNECT_PROJECT_ID: process.env.VITE_WALLETCONNECT_PROJECT_ID,
        VITE_BALANCE_URL: process.env.VITE_BALANCE_URL,
      },
    },
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  testTimeout: 10000,
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@gardenfi|@tanstack|@mysten|@solana|@starknet|@tronweb3|@farcaster|@chainflip|@coral-xyz|@number-flow|wagmi|viem|starknet|starknetkit|framer-motion|react-lottie-player|react-parallax-tilt|react-qr-code|react-tooltip|react-router-dom|zustand|axios|bignumber.js|clsx|lodash-es|styled-components|tw-colors))',
  ],
};
