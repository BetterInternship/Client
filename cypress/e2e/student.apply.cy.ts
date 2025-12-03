it("Student tries to find a job listing; will fail if search didnt show the job in the main panel", () => {
  // This handles the authentication; if u wanna use another account, just replace the email in the link
  cy.visit(
    "http://localhost:5000/api/auth/google/cypress/janica_megan_reyes@dlsu.edu.ph",
  );

  // This happens automatically, don't change this line
  cy.url().should("contain", "preload");

  cy.get('input[placeholder="Search Internship Listings"]').type(
    "cypress test job listing{enter}",
  );

  cy.contains("Job Details").parent().parent().within(() => {
    cy.contains("cypress test job listing");
    cy.contains("Apply Now").should("exist");
  });
  
});

it("Student has to click the left panel to show the job listing searched; apply now but cancel", () => {
  // This handles the authentication; if u wanna use another account, just replace the email in the link
  cy.visit(
    "http://localhost:5000/api/auth/google/cypress/janica_megan_reyes@dlsu.edu.ph",
  );

  // This happens automatically, don't change this line
  cy.url().should("contain", "preload");

  cy.get('input[placeholder="Search Internship Listings"]').type(
    "cypress test job listing{enter}",
  );
  cy.contains("cypress test job listing 1").click();

  cy.contains("Job Details").parent().parent().within(() => {
    cy.contains("cypress test job listing 1");
    cy.contains("Apply Now").click();
  });
    cy.contains("Cancel").click();
    cy.contains("Submit Application").should("not.exist");

});

it("Student tries to apply to cypress test job listing 1 and submit application", () => {
  
  cy.visit(
    "http://localhost:5000/api/auth/google/cypress/janica_megan_reyes@dlsu.edu.ph",
  );

  // This happens automatically, don't change this line
  cy.url().should("contain", "preload");

  cy.get('input[placeholder="Search Internship Listings"]').type(
    "cypress test job listing 1{enter}",
  );
  //make sure we are applying to the right job
  cy.contains("cypress test job listing 1").click();

  cy.contains("Job Details").parent().parent().within(() => {
    cy.contains("cypress test job listing 1");
    cy.contains("Apply Now").click();
  });
  cy.contains("Submit Application").click();
  cy.contains("Application Sent!");
});

it("Student saves the cypress 2 then uses the apply now button", () => {
  
  cy.visit(
    "http://localhost:5000/api/auth/google/cypress/janica_megan_reyes@dlsu.edu.ph",
  );

  // This happens automatically, don't change this line
  cy.url().should("contain", "preload");

  cy.get('input[placeholder="Search Internship Listings"]').type(
    "cypress 2{enter}",
  );
  //make sure we are applying to the right job
  cy.contains("cypress 2").click();

  cy.contains("Job Details").parent().parent().within(() => {
    cy.contains("cypress 2");
    cy.contains("Save").click();
    cy.contains("Saved");
  });
  cy.contains("Janica Megan Reyes").click();
  cy.contains("Saved Jobs").click();
  cy.contains("cypress 2").parent().parent().within(() => {
    cy.contains("View Details").click();
  });
  cy.contains("Saved");
  cy.contains("Apply Now").click();
  cy.contains("Submit Application").click();
  cy.contains("Application Sent!");
});