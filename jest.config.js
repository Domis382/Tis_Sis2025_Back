// jest.config.js  (ESM porque tu package.json tiene "type": "module")

export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests'], // aquí están tus tests
};
