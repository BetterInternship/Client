it("Employer make a new Job", function () {
  cy.loginAsEmployer();

  cy.visit("http://hire.localhost:3000/dashboard");

  
  cy.contains("Add Listing").click();
  cy.url().should("include", "/listings/create");
  cy.get('input[placeholder="Enter job title here..."]').type("cypress test job listing",);
  cy.get("div.max-w-5xl").should("contain", "cypress test job listing");

  // Look for 
  cy.contains("Credited Interns (Practicum)").parent().parent().within(() => {
    cy.get("[data-state=unchecked]")
    cy.get("button").click()
    cy.get("[data-state=checked]")
  });

  // cy.contains("Publish Listing").should("be.disabled");

  cy.contains("Voluntary Interns").parent().parent().within(() => {
    cy.get("[data-state=unchecked]")
    cy.get("button").click()
    cy.get("[data-state=checked]")
  });

  cy.get('input[placeholder="Enter job location here..."]').clear().type("cypress test location",);
  cy.get('input[placeholder="Enter job location here..."]').should('have.value', 'cypress test location');

  cy.contains("Part-time").parent().parent().within(() => {
    cy.get("[data-state=unchecked]")
    cy.get("button").click()
    cy.get("[data-state=checked]")
  });

  cy.contains("Full-time").parent().parent().within(() => {
    cy.get("[data-state=unchecked]")
    cy.get("button").click()
    cy.get("[data-state=checked]")
  });

  cy.contains("Flexible/Project-based").parent().parent().within(() => {
    cy.get("[data-state=unchecked]")
    cy.get("button").click()
    cy.get("[data-state=checked]")
  });

  cy.contains("On-site").parent().parent().within(() => {
    cy.get("[data-state=unchecked]")
    cy.get("button").click()
    cy.get("[data-state=checked]")
  });

  cy.contains("Hybrid").parent().parent().within(() => {
    cy.get("[data-state=unchecked]")
    cy.get("button").click()
    cy.get("[data-state=checked]")
  });

  cy.contains("Remote").parent().parent().within(() => {
    cy.get("[data-state=unchecked]")
    cy.get("button").click()
    cy.get("[data-state=checked]")
  });

  //Make sure toggles work correctly by toggling twice
  cy.contains("No").parent().within(() => {
    cy.get("[data-state=unchecked]")
    cy.get("button").click()
    cy.get("[data-state=checked]")
  });

  cy.contains("Yes").parent().within(() => {
    cy.get("[data-state=unchecked]")
    cy.get("button").click()
    cy.get("[data-state=checked]")
  });  

  cy.contains("No").parent().within(() => {
    cy.get("[data-state=unchecked]")
    cy.get("button").click()
    cy.get("[data-state=checked]")
  }); 

  cy.contains("Yes").parent().within(() => {
    cy.get("[data-state=unchecked]")
  });

  cy.contains("Description").parent().parent().within(() => {
    cy.get('div[aria-label="editable markdown"]').type("This is a cypress test job description.");
  });

  cy.contains("Publish Listing").should("be.disabled");

  cy.contains("Requirements").parent().within(() => {
    cy.get('div[aria-label="editable markdown"]').type("Requirements for cypress test job.");
  });

  cy.contains("GitHub Repository").parent().parent().within(() => {
    cy.get("[data-state=unchecked]")
    cy.get("button").click()
    cy.get("[data-state=checked]")
  }); 

  cy.contains("portfolio").parent().parent().within(() => {
    cy.get("[data-state=unchecked]")
    cy.get("button").click()
    cy.get("[data-state=checked]")
    cy.get("button").click()
    cy.get("[data-state=unchecked]")
  });

  cy.contains("Cover Letter").parent().parent().within(() => {
    cy.get("[data-state=unchecked]")
    cy.get("button").click()
    cy.get("[data-state=checked]")
    cy.get("button").click()
    cy.get("[data-state=unchecked]")
  });

  cy.contains("Publish Listing").should("be.enabled").click();

  cy.url().should("include", "/dashboard");
  cy.contains("cypress test job listing");

});
