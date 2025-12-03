it("Visits student forms page after log in", () => {
  // This handles the authentication; if u wanna use another account, just replace the email in the link
  cy.visit(
    "http://localhost:5000/api/auth/google/cypress/modavid.1964@gmail.com",
  );

  // This happens automatically, don't change this line
  cy.url().should("contain", "preload");

  // !
  // !
  // You can change the tests below this line
  cy.url().should("contain", "search"); // Check if on search page (this is where user shud be after log in)
  cy.visit("http://localhost:3000/forms"); // Visit user forms page
  cy.contains("Forms"); // Check if on forms page
});
