describe("Student Application Flows", () => {
  beforeEach(() => {
    cy.loginAsEmployer();
    cy.visit("http://hire.localhost:3000/dashboard");
  });

  it('Employer tries delete cypress test job 1 but cancels', () => {
    cy.contains("cypress test job listing 1").click();
    cy.contains("Delete").click();
    cy.contains("Are you sure you want to delete").parent().within(() => {
      cy.contains("Cancel").click();
  });
  });

  it('Employer deletes cypress 2', () => {
    cy.contains("cypress 2").click();
    cy.contains("Delete").click();
    cy.contains("Are you sure you want to delete").parent().within(() => {
      cy.contains("Delete").click();
  });
  });

  it('Employer deletes cypress 3', () => {
    cy.contains("cypress 3").click();
    cy.contains("Delete").click();
    cy.contains("Are you sure you want to delete").parent().within(() => {
    cy.contains("Delete").click();

    cy.url().should("include", "/dashboard");
    });
  });
});