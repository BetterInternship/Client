import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    //Instead of typing it in every visit command, use cy.visit('/')
    baseUrl: 'http://localhost:3000', 
  },
});
