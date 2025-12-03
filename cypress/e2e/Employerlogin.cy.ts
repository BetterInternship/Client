it("prevents invalid credentials from logging in", () => {
  cy.visit("http://hire.localhost:3000/login");

  cy.get('input[type="email"]').type("fakeemail@gmail.com");
  cy.get('button[type="submit"]').click();

  cy.contains("Invalid password.");
});

it("prevents invalid credentials from logging in", () => {
  cy.visit("http://hire.localhost:3000/login");

  cy.get('input[type="password"]').type("fakepassword");
  cy.get('button[type="submit"]').click();

  cy.contains("Email is required.");
});

it("prevents invalid credentials from logging in", () => {
  cy.visit("http://hire.localhost:3000/login");

  cy.get('input[type="email"]').type("fakeemail@gmail.com");
  cy.get('input[type="password"]').type("fakepassword");
  cy.get('button[type="submit"]').click();

  cy.contains("Invalid password.");
});