it("Employer checks the applicants of a job listing", function () {
  cy.loginAsEmployer();


  cy.visit("http://hire.localhost:3000/dashboard");
  cy.contains("Job listings").click();
  cy.contains("Intestship 102").click();
  
});