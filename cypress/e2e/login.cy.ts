it('prevents invalid credentials from logging in', () => {
  cy.visit('http://hire.localhost:3000/login')
  cy.get('input[placeholder="Email Address"]').type("fakeemail@gmail.com")
  cy.get('input[placeholder="Password..."]').type("fakepassword")
  cy.get('button[type="submit"]').click()

  cy.contains("Invalid password.")
})