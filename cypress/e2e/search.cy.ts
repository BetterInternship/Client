it("Bring the user to the Internship Dashboard and search for Intestship", function () {
  cy.visit("http://localhost:3000/");
//NEED TO FIX
  cy.contains("Find Internships").click();

  cy.url().should("include", "/search");

  cy.get('input[placeholder="Search Internship Listings"]').type(
    "cypress test job listing{enter}",
  );

  cy.contains("cypress test job listing").should("exist").click();

  cy.get("div.flex-1").should("contain", "cypress test job listing");
});
