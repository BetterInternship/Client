it("Employer checks the applicants of cypress test job listing 1", function () {
  cy.loginAsEmployer();

  cy.visit("http://hire.localhost:3000/dashboard");
  cy.contains("Job listings").click();
  cy.contains("cypress test job listing 1").click();
  cy.contains("Applicant")
    .parent()
    .parent()
    .within(() => {
      cy.contains("Janica Megan Reyes");
    });
});

it("Employer checks the applicants of cypress 2", function () {
  cy.loginAsEmployer();

  cy.visit("http://hire.localhost:3000/dashboard");
  cy.contains("Job listings").click();
  cy.contains("cypress 2").click();
  cy.contains("Applicant")
    .parent()
    .parent()
    .within(() => {
      cy.contains("Janica Megan Reyes");
    });
});

it("Employer checks the applicants of cypress 3", function () {
  cy.loginAsEmployer();

  cy.visit("http://hire.localhost:3000/dashboard");
  cy.contains("Job listings").click();
  cy.contains("cypress 3").click();
  cy.contains("Applicant")
    .parent()
    .parent()
    .within(() => {
      cy.contains("Janica Megan Reyes").should("not.exist");
    });
});
