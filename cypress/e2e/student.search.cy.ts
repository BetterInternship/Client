describe("Using the Search or Filter", () => {
  
  beforeEach(() => {
    cy.visit("http://localhost:3000/");

    cy.contains("Find Internships").click();

    cy.url().should("include", "/search");
  });

  it("Search for a job", function () {
    cy.get('input[placeholder="Search Internship Listings"]').type(
      "cypress test job listing{enter}",
    );

    cy.contains("cypress test job listing").should("exist").click();

    cy.get("div.flex-1").should("contain", "cypress test job listing");
  });
  
  it("Student filters for 'For Credit' and verifies DLSU MOA badge on all results", () => {
  // click Filter
  cy.contains("button", "FOR CREDIT").click();

  cy.url().should("include", "moa=Has+MOA");

  // wait for results (at least one badge is visible)
  cy.contains("DLSU MOA", { timeout: 10000 }).should("be.visible");

  // check if all visible cards have the badge
  cy.get('button').filter(':contains("Apply Now")')
    .should('have.length.gt', 0) 
    .each(($btn, index) => {
      cy.log(`Checking Card #${index + 1}`); 

      cy.wrap($btn)
        .parents()
        .filter((i, el) => Cypress.$(el).text().includes("DLSU MOA"))
        .first()
        .should('exist')
        .within(() => {
            cy.contains("DLSU MOA").should("be.visible");
        });
    });
  });
});