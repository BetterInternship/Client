it("Employer make a new Job", function () {
  cy.loginAsEmployer();

  cy.visit("http://hire.localhost:3000/dashboard");

  
  cy.contains("Add Listing").click();
  cy.url().should("include", "/listings/create");
  cy.get('input[placeholder="Enter job title here..."]').type("cypress test job listing 1",);
  cy.get("div.max-w-5xl").should("contain", "cypress test job listing 1");

  // Look for 
  cy.contains("Credited Interns (Practicum)").parent().parent().within(() => {
    cy.get("[data-state=unchecked]")
    cy.get("button").click()
    cy.get("[data-state=checked]")
  });

  cy.contains("Publish Listing").should("be.disabled");

  cy.get('input[placeholder="Enter job location here..."]').clear().type("cypress test location",);
  cy.get('input[placeholder="Enter job location here..."]').should('have.value', 'cypress test location');

  cy.contains("Part-time").parent().parent().within(() => {
    cy.get("[data-state=unchecked]")
    cy.get("button").click()
    cy.get("[data-state=checked]")
  });

  cy.contains("On-site").parent().parent().within(() => {
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


  cy.contains("Description").parent().parent().within(() => {
    cy.get('div[aria-label="editable markdown"]').type("This is a cypress test job description.");
  });

  cy.contains("Publish Listing").should("be.disabled");

  cy.contains("Requirements").parent().within(() => {
    cy.get('div[aria-label="editable markdown"]').type("Requirements for cypress test job.");
  });

  cy.contains("Publish Listing").should("be.enabled").click();

  cy.url().should("include", "/dashboard");
  cy.contains("cypress test job listing 1");

});

it("Employer make a new Job with credited, flexible, remote", function () {
  cy.loginAsEmployer();

  cy.visit("http://hire.localhost:3000/dashboard");

  
  cy.contains("Add Listing").click();
  cy.url().should("include", "/listings/create");
  cy.get('input[placeholder="Enter job title here..."]').type("cypress 2",);
  cy.get("div.max-w-5xl").should("contain", "cypress 2");

  // Look for 
  cy.contains("Credited Interns (Practicum)").parent().parent().within(() => {
    cy.get("[data-state=unchecked]")
    cy.get("button").click()
    cy.get("[data-state=checked]")
  });

  cy.get('input[placeholder="Enter job location here..."]').clear().type("cyp 2 location",);
  cy.get('input[placeholder="Enter job location here..."]').should('have.value', 'cyp 2 location');

  cy.contains("Flexible/Project-based").parent().parent().within(() => {
    cy.get("[data-state=unchecked]")
    cy.get("button").click()
    cy.get("[data-state=checked]")
  });

  cy.contains("Remote").parent().parent().within(() => {
    cy.get("[data-state=unchecked]")
    cy.get("button").click()
    cy.get("[data-state=checked]")
  });

  cy.contains("Yes").parent().within(() => {
    cy.get("[data-state=unchecked]")
    cy.get("button").click()
    cy.get("[data-state=checked]")
  });  

  cy.contains("Description").parent().parent().within(() => {
    cy.get('div[aria-label="editable markdown"]').type("This is a cyp 2 description.");
  });

  cy.contains("Publish Listing").should("be.disabled");

  cy.contains("Requirements").parent().within(() => {
    cy.get('div[aria-label="editable markdown"]').type("Requirements for cyp 2.");
  });

  cy.contains("GitHub Repository").parent().parent().within(() => {
    cy.get("[data-state=unchecked]")
    cy.get("button").click()
    cy.get("[data-state=checked]")
  }); 

  cy.contains("Publish Listing").should("be.enabled").click();

  cy.url().should("include", "/dashboard");
  cy.contains("cypress 2");

});


it("Employer make a new Job with everything turned on", function () {
  cy.loginAsEmployer();

  cy.visit("http://hire.localhost:3000/dashboard");

  
  cy.contains("Add Listing").click();
  cy.url().should("include", "/listings/create");
  cy.get('input[placeholder="Enter job title here..."]').type("cypress 3",);
  cy.get("div.max-w-5xl").should("contain", "cypress 3");

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

  cy.get('input[placeholder="Enter job location here..."]').clear().type("cyp 3 location",);
  cy.get('input[placeholder="Enter job location here..."]').should('have.value', 'cyp 3 location');

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
    cy.get('div[aria-label="editable markdown"]').type("This is a cyp 3 description.");
  });

  cy.contains("Publish Listing").should("be.disabled");

  cy.contains("Requirements").parent().within(() => {
    cy.get('div[aria-label="editable markdown"]').type("Requirements for cyp 3.");
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
  });

  cy.contains("Cover Letter").parent().parent().within(() => {
    cy.get("[data-state=unchecked]")
    cy.get("button").click()
    cy.get("[data-state=checked]")
  });

  cy.contains("Publish Listing").should("be.enabled").click();

  cy.url().should("include", "/dashboard");
  cy.contains("cypress 3");

});
