it("Employer checks the applicants of a job listing", function () {
  //cy.loginAsEmployer();
  cy.visit("http://hire.localhost:3000/login");

  cy.get('input[type="email"]').type("janicamegan@gmail.com");
  cy.get('input[type="password"]').type("6m*=&LNM7+");
  cy.get('button[type="submit"]').click();

  //cy.visit("http://hire.localhost:3000/dashboard");
  cy.contains("Job listings").click();
  cy.contains("Intestship 102").click();
});