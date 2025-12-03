describe("Employer Job Listing Flows", () => {
  
  beforeEach(() => {
    // ignore those annoying react errors so the test doesn't crash for no reason
    Cypress.on('uncaught:exception', (err) => {
      if (err.message.includes('Hydration failed') || err.message.includes('Minified React error')) {
        return false;
      }
    });

    // log in manually using sherwin's account lol
    cy.visit("http://hire.localhost:3000/login");
    cy.get('input[type="email"]').type("sherwin_yaun@dlsu.edu.ph");
    cy.get('input[type="password"]').type("we have one of the strongest passwords ever lol");
    cy.get('button[type="submit"]').click();

    cy.url().should("include", "/dashboard", { timeout: 10000 });

    // go straight to the specific job page where we can see applicants
    const jobId = "fedb61ca-77fe-49f0-b76a-5435abc5896e"; 
    cy.visit(`http://hire.localhost:3000/dashboard/manage?jobId=${jobId}`);
  });
  
    it("Visit Listing Information tab then return to Applicants", () => {
      cy.contains("Listing information").click();
      cy.contains("Job Details");
      cy.contains("Applicants").click();
      cy.contains("Applicant");
    });

  // it("Filters applicants by status (Shortlisted, Accepted, Rejected)", () => {
  //   // click shortlisted and make sure the list updates to show them
  //   cy.contains("button", "Shortlisted").click();
  //   cy.contains("Shortlisted", { timeout: 10000 }).should("be.visible");

  //   // do the same for accepted applicants
  //   cy.contains("button", "Accepted").click();
  //   cy.contains("Accepted").should("be.visible");

  //   // check if the rejected filter works too
  //   cy.contains("button", "Rejected").click();
  //   cy.contains("Rejected").should("be.visible");

  //   // click 'll to reset everything and show the whole list again
  //   cy.contains("button", "All").click();
  //   cy.contains("Applicant").should("be.visible"); 
  // });


  it("Change Job Listing Status to paused", () => {
    cy.contains("Active").parent().within(() => {
    cy.get("button").click()
  });
    cy.contains("Paused").click()
  });

  it("Change Job Listing Status to Active again", () => {
    
    cy.contains("Paused").parent().within(() => {
    cy.get("button").click()
  });
    cy.contains("Active").click()
  });

  
});
