it("Visit Student Profile and check clickable tabs available", () => {
  // This handles the authentication; if u wanna use another account, just replace the email in the link
  cy.visit(
    "http://localhost:5000/api/auth/google/cypress/modavid.1964@gmail.com",
  );

  // This happens automatically, don't change this line
  cy.url().should("contain", "preload");

  cy.contains("Malks Mogen David").click();
  cy.contains("Profile").click();
  cy.contains("Internship Details").click();
  cy.contains("Type of internship");
  cy.contains("Preferences");

  cy.contains("Student Profile").click();
  cy.contains("Identity");
  cy.contains("Educational Background");
  cy.contains("External Profiles");
  cy.contains("Personal Bio");


  cy.contains("Malks Mogen David").click();
  cy.contains("Saved Jobs").click();

  cy.contains("Malks Mogen David").click();
  cy.contains("Forms").click();
});

it("Visit Student Applications and check clickable tabs available", () => {
  // This handles the authentication; if u wanna use another account, just replace the email in the link
  cy.visit(
    "http://localhost:5000/api/auth/google/cypress/modavid.1964@gmail.com",
  );

  // This happens automatically, don't change this line
  cy.url().should("contain", "preload");

  cy.contains("Malks Mogen David").click();
  cy.contains("Applications").click();

  cy.contains("Malks Mogen David").click();
  cy.contains("Saved Jobs").click();

  cy.contains("Malks Mogen David").click();
  cy.contains("Forms").click();
});