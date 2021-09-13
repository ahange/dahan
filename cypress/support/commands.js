Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('[data-testid="emailField"]').type(email);
  cy.get('[data-testid="passwordField"]').type(password);
  cy.get('[data-testid="loginButton"').click();
})

Cypress.Commands.add('checkToastMessage', (toastId, message) => {
  cy.get(`[id=${toastId}]`).should('contain', message);
});

Cypress.Commands.add('addPostgresDataSource', fn => {

  cy.get('div[class="modal-title h4"] span[class="text-muted"]')
    .should('have.text', 'Add new datasource')
    .and('be.visible')

  cy.get('.modal-body')
    .find('div[class="row row-deck"]')
    .find('h4[class="text-muted mb-2"]')
    .should('have.text', 'DATABASES')

  cy.get('.modal-body')
    .find('.col-md-2')
    .contains('PostgreSQL')
    .and('be.visible')
    .click()

  cy.get('.row.mt-3')
    .find('.col-md-4')
    .find('.form-label')
    .contains('Database Name')

  cy.get('div[class="row mt-3"] div:nth-child(1)')
    .find('.form-control')
    .should('have.attr', 'type', 'text')
    .type(Cypress.env('TEST_PG_DB'))

  cy.get('.row.mt-3')
    .find('.col-md-4')
    .find('.form-label')
    .contains('Username')

  cy.get('div[class="row mt-3"] div:nth-child(2)')
    .find('.form-control')
    .should('have.attr', 'type', 'text')
    .type(Cypress.env('TEST_PG_USERNAME'))

  cy.get('.row.mt-3')
    .find('.col-md-4')
    .find('.form-label')
    .contains('Password')

  cy.get('div[class="row mt-3"] div:nth-child(3)')
    .find('.form-control')
    .should('have.attr', 'type', 'password')
    .type(Cypress.env('TEST_PG_PASSWORD'))

  cy.get('button[class="m-2 btn btn-success"]')
    .should('have.text', 'Test Connection')
    .click()

  cy.get('.badge')
    .should('have.text', 'connection verified')

  cy.get('div[class="col-auto"] button[type="button"]')
    .should('have.text', 'Save')
    .click()
});
