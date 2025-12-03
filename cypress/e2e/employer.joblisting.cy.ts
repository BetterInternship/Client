it("Employer checks the applicants of a job listing", function () {
  cy.loginAsEmployer();


  cy.visit("http://hire.localhost:3000/dashboard");
  cy.contains("Job listings").click();
  cy.contains("cypress test job listing").click();
  cy.contains("Applicant").parent().parent().within(() => {
    cy.contains("Janica Megan Reyes").click();
  });

});