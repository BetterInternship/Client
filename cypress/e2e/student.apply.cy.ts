it("Student tries to find a job listing; will fail if search didnt show the job in the main panel", () => {
  // This handles the authentication; if u wanna use another account, just replace the email in the link
  cy.visit(
    "http://localhost:5000/api/auth/google/cypress/janica_megan_reyes@dlsu.edu.ph",
  );

  // This happens automatically, don't change this line
  cy.url().should("contain", "preload");

  cy.get('input[placeholder="Search Internship Listings"]').type(
    "cypress test job listing {enter}",
  );

  cy.contains("Job Details").parent().parent().within(() => {
    cy.contains("cypress test job listing");
    cy.contains("Apply Now").should("exist");
  });
  
});

it("Student has to click the left panel to show the job listing searched", () => {
  // This handles the authentication; if u wanna use another account, just replace the email in the link
  cy.visit(
    "http://localhost:5000/api/auth/google/cypress/janica_megan_reyes@dlsu.edu.ph",
  );

  // This happens automatically, don't change this line
  cy.url().should("contain", "preload");

  cy.get('input[placeholder="Search Internship Listings"]').type(
    "cypress test job listing{enter}",
  );
  cy.contains("cypress test job listing").click();

  cy.contains("Job Details").parent().parent().within(() => {
    cy.contains("cypress test job listing");
    cy.contains("Apply Now").click();
  });
    cy.contains("Cancel").click();
    cy.contains("Submit Application").should("not.exist");

});

it("Student tries to apply and cant apply because there is no portfolio link added by the student", () => {
  
  cy.visit(
    "http://localhost:5000/api/auth/google/cypress/janica_megan_reyes@dlsu.edu.ph",
  );

  // This happens automatically, don't change this line
  cy.url().should("contain", "preload");

  cy.get('input[placeholder="Search Internship Listings"]').type(
    "cypress test job listing{enter}",
  );
  //make sure we are applying to the right job
  cy.contains("cypress test job listing").click();

  cy.contains("Job Details").parent().parent().within(() => {
    cy.contains("cypress test job listing");
    cy.contains("Apply Now").click();
  });
  cy.contains("Submit Application").should("be.disabled");
  

});