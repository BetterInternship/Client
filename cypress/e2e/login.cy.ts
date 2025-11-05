it("Employer make a new Job", function () {
  cy.loginAsEmployer();

  cy.visit("http://hire.localhost:3000/dashboard");
  //   cy.get('input[placeholder="Email Address"]').type("janciamegan@gmail.com");
  //   cy.get('input[placeholder="Password..."]').type("6m*=&LNM7+");
  //   cy.get('button[type="submit"]').click();
  //   cy.get("p.text-sm").should("contain", "Invalid");

  //   cy.get('input[placeholder="Email Address"]').clear();
  //   cy.get('input[placeholder="Email Address"]').type("janicamegan@gmail.com");
  //   cy.get('button[type="submit"]').click();
  //   cy.url().should("include", "/dashboard");

  //   cy.contains("Add Listing").click();
  //   cy.url().should("include", "/listings/create");
  //   cy.get('input[placeholder="Enter job title here..."]').type(
  //     "cypress test job listing",
  //   );
  //   cy.get("div.max-w-5xl").should("contain", "cypress test job listing");
});
