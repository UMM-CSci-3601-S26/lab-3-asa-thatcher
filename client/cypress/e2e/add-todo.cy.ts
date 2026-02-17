import { Todo } from 'src/app/todos/todo';
import { AddTodoPage } from '../support/add-todo.po';

describe('Add todo', () => {
  const page = new AddTodoPage();

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getTitle().should('have.text', 'New Todo');
  });

  it('Should enable and disable the add todo button', () => {
    // ADD USER button should be disabled until all the necessary fields
    // are filled. Once the last (`#emailField`) is filled, then the button should
    // become enabled.
    page.addTodoButton().should('be.disabled');
    page.getFormField('owner').type('test');
    page.addTodoButton().should('be.disabled');
    page.getFormField('body').type('test');
    page.addTodoButton().should('be.disabled');
    page.getFormField('category').type('test');
    page.addTodoButton().should('be.disabled');
    // all the required fields have valid input, then it should be enabled
    page.addTodoButton().should('be.enabled');
  });

  it('Should show error messages for invalid inputs', () => {
    // Before doing anything there shouldn't be an error
    cy.get('[data-test=ownerError]').should('not.exist');
    // Just clicking the name field without entering anything should cause an error message
    page.getFormField('owner').click().blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    // Some more tests for various invalid name inputs
    page.getFormField('owner').type('J').blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    page
      .getFormField('owner')
      .clear()
      .type('This is a very long name that goes beyond the 50 character limit')
      .blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    // Entering a valid name should remove the error.
    page.getFormField('owner').clear().type('John Smith').blur();
    cy.get('[data-test=ownerError]').should('not.exist');

    // Before doing anything there shouldn't be an error
    cy.get('[data-test=categoryError]').should('not.exist');
    // Just clicking the category field without entering anything should cause an error message
    page.getFormField('category').click().blur();
    // Some more tests for various invalid category inputs
    cy.get('[data-test=categoryError]').should('exist').and('be.visible');
    page.getFormField('category').type('t').blur();
    cy.get('[data-test=categoryError]').should('exist').and('be.visible');
    // Entering a valid category should remove the error.
    page.getFormField('category').clear().type('work').blur();
    cy.get('[data-test=categoryError]').should('not.exist');

    // Before doing anything there shouldn't be an error
    cy.get('[data-test=bodyError]').should('not.exist');
    // Just clicking the email field without entering anything should cause an error message
    page.getFormField('body').click().blur();
    // Some more tests for various invalid email inputs
    cy.get('[data-test=bodyError]').should('exist').and('be.visible');
    page.getFormField('body').type('t').blur();
    cy.get('[data-test=bodyError]').should('exist').and('be.visible');
    // Entering a valid email should remove the error.
    page.getFormField('body').clear().type('todo test here').blur();
    cy.get('[data-test=emailError]').should('not.exist');
  });

  describe('Adding a new todo', () => {
    beforeEach(() => {
      cy.task('seed:database');
    });

    it('Should go to the right page, and have the right info', () => {
      const todo: Todo = {
        _id: null,
        owner: 'Test Todo',
        category: 'test',
        body: 'Test body',
        status: true,
      };

      // The `page.addTodo(todo)` call ends with clicking the "Add Todo"
      // button on the interface. That then leads to the client sending an
      // HTTP request to the server, which has to process that request
      // (including making calls to add the todo to the database and wait
      // for those to respond) before we get a response and can update the GUI.
      // By calling `cy.intercept()` we're saying we want Cypress to "notice"
      // when we go to `/api/todos`. The `AddTodoComponent.submitForm()` method
      // routes to `/api/todos/{MongoDB-ID}` if the REST request to add the todo
      // succeeds, and that routing will get "noticed" by the Cypress because
      // of the `cy.intercept()` call.
      //
      // The `.as('addTodo')` call basically gives that event a name (`addTodo`)
      // which we can use in things like `cy.wait()` to say which event or events
      // we want to wait for.
      //
      // The `cy.wait('@addTodo')` tells Cypress to wait until we have successfully
      // routed to `/api/todos` before we continue with the following checks. This
      // hopefully ensures that the server (and database) have completed all their
      // work, and that we should have a properly formed page on the client end
      // to check.
      cy.intercept('/api/todos').as('addTodo');
      page.addTodo(todo);
      cy.wait('@addTodo');

      // New URL should end in the 24 hex character Mongo ID of the newly added todo.
      // We'll wait up to five full minutes for this these `should()` assertions to succeed.
      // Hopefully that long timeout will help ensure that our Cypress tests pass in
      // GitHub Actions, where we're often running on slow VMs.
      cy.url({ timeout: 300000 })
        .should('match', /\/todos\/[0-9a-fA-F]{24}$/)
        .should('not.match', /\/todos\/new$/);

      // The new todo should have all the same attributes as we entered
      cy.get('.todo-card-owner').should('have.text', todo.owner);
      cy.get('.todo-card-body').should('have.text', todo.body);
      cy.get('.todo-card-status').should('have.text', todo.status);
      cy.get('.todo-card-category').should('have.text', todo.category);
      // We should see the confirmation message at the bottom of the screen
      page.getSnackBar().should('contain', `Added todo ${todo.owner}`);
    });

    it('Should fail with no company', () => {
      const todo: Todo = {
        _id: null,
        owner: 'Test Todo',
        category: 'test',
        body: null, // The company being set to null means nothing will be typed for it
        status: true,
      };

      // Here we're _not_ expecting to route to `/api/todos` since adding this
      // todo should fail. So we don't add `cy.intercept()` and `cy.wait()` calls
      // around this `page.addTodo(todo)` call. If we _did_ add them, the test wouldn't
      // actually fail because a `cy.wait()` that times out isn't considered a failure,
      // although we could catch the timeout and turn it into a failure if we needed to.
      page.addTodo(todo);

      // We should get an error message
      page.getSnackBar().should('contain', 'Tried to add an illegal new todo');

      // We should have stayed on the new todo page
      cy.url()
        .should('not.match', /\/todos\/[0-9a-fA-F]{24}$/)
        .should('match', /\/todos\/new$/);

      // The things we entered in the form should still be there
      page.getFormField('owner').should('have.value', todo.owner);
      page.getFormField('category').should('have.value', todo.category);
      page.getFormField('status').should('have.value', true);
    });
  });
});
