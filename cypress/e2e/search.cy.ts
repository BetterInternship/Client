it('Bring the user to the Internship Dashboard and search for Intestship', function() {
    cy.visit('http://localhost:3000/')

    cy.contains('Find Internships').click();

    cy.url().should('include', '/search')

    cy.get('input[placeholder="Search Internship Listings"]').type('Intestship{enter}');
    
    cy.contains('Intestship 102').should('exist').click();
    
    cy.get('div.flex-1').should('contain', 'Intestship 102');
});

