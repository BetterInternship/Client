/// <reference types="cypress" />

Cypress.Commands.add("loginAsEmployer", () => {
  cy.request({
    method: "POST",
    url: "http://localhost:5000/api/auth/hire/login",
    body: {
      email: "janicamegan@gmail.com",
      password: "6m*=&LNM7+",
    },
  }).then((resp) => {
    const token = (resp.body as { token: string }).token;
    console.log(resp.body);
    cy.setCookie("employer-user-token", token, { secure: true, path: "/" });
  });
});
