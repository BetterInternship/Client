// jest.config.js for testing purposes with Jest and TypeScript
// In cmd, npm install --save-dev jest ts-jest @types/jest --legacy-peer-deps
// npx jest 
    // npx jest --clearCache 


const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    
    //moduleNameMapper tells Jest what @/ means. 
    // <rootDir> refers to your project root (the folder with package.json. 
    // ^@/(.*)$ matches imports
    
    "^@/(.*)$": "<rootDir>/$1", 
  },
  moduleDirectories: ["node_modules", "<rootDir>"],
};



