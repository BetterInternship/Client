
  it('Employer delete cypress test job 1', () => {
    cy.loginAsEmployer();
    cy.visit("http://hire.localhost:3000/dashboard");

    cy.contains("cypress test job listing 1").click();
    cy.contains("Delete").click();
    cy.contains("Are you sure you want to delete").parent().within(() => {
      cy.contains("Delete").click();
  });
  });

  it('Employer delete cypress 2', () => {
    cy.loginAsEmployer();
    cy.visit("http://hire.localhost:3000/dashboard");

    cy.contains("cypress 2").click();
    cy.contains("Delete").click();
    cy.contains("Are you sure you want to delete").parent().within(() => {
      cy.contains("Delete").click();
  });
  });

  it('Employer delete cypress 3', () => {
    cy.loginAsEmployer();
    cy.visit("http://hire.localhost:3000/dashboard");

    cy.contains("cypress 3").click();
    cy.contains("Delete").click();
    cy.contains("Are you sure you want to delete").parent().within(() => {
    cy.contains("Delete").click();
  });
  });