describe('Employer delete a Job', () => {
  it('Delete the job', () => {
    cy.loginAsEmployer();
    cy.visit("http://hire.localhost:3000/dashboard");

    cy.contains("cypress test job listing").click();
    cy.contains("Delete").click();
    cy.contains("Are you sure you want to delete").parent().within(() => {
      cy.contains("Delete").click();
  });
  })
})