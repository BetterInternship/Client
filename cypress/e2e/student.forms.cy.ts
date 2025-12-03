it("prevents invalid credentials from logging in", () => {
  cy.visit(
    "http://localhost:5000/api/auth/google/cypress/modavid.1964@gmail.com",
  );
  cy.url().should("contain", "preload");
  cy.url().should("contain", "search");
  cy.visit("http://localhost:3000/forms");
  cy.contains("Forms");
});
