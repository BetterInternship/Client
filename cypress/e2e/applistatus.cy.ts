it("Employer changes the status of an application", function () {
  //cy.loginAsEmployer();
  cy.visit("http://hire.localhost:3000/login");

  cy.get('input[type="email"]').type("janicamegan@gmail.com");
  cy.get('input[type="password"]').type("6m*=&LNM7+");
  cy.get('button[type="submit"]').click();

  cy.visit("http://hire.localhost:3000/dashboard");
  cy.contains("Job listings").click();
  cy.contains("Intestship 102").click();







});