import type { Config } from 'jest'

const config: Config = {
  displayName: 'backend',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['<rootDir>/test/**/*.e2e-spec.ts'],
  moduleNameMapper: {
    '^@smart-home/db$': '<rootDir>/../../libs/database/src/index.ts',
    '^@smart-home/db/client$': '<rootDir>/../../libs/database/src/client.ts',
    '^@smart-home/db/schema$':
      '<rootDir>/../../libs/database/src/schema/index.ts',
    '^@smart-home/db/shared$': '<rootDir>/../../libs/shared/src/index.ts',
  },
}

export default config
