import { Todo } from 'src/app/todos/todo';

export class AddTodoPage {

  private readonly url = '/todos/new';
  private readonly title = '.add-todo-title';
  private readonly button = '[data-test=confirmAddTodoButton]';
  private readonly snackBar = '.mat-mdc-simple-snack-bar';
  private readonly ownerFieldName = '[data-test="owner"]';
  private readonly bodyFieldName = '[data-test="body"]';
  private readonly categoryFieldName = '[data-test="category"]';
  private readonly statusFieldName = '[data-test="status"]';
  private readonly formFieldSelector = 'mat-form-field';
  private readonly dropDownSelector = 'mat-option';

  navigateTo() {
    return cy.visit(this.url);
  }

  getTitle() {
    return cy.get(this.title);
  }

  addTodoButton() {
    return cy.get(this.button);
  }

  selectMatSelectValue(select: Cypress.Chainable, value: string) {
    // Find and click the drop down
    return select.click()
      // Select and click the desired value from the resulting menu
      .get(`${this.dropDownSelector}`).contains(value).click();
  }

  getFormField(fieldName: string) {
    return cy.get(`${this.formFieldSelector} ${fieldName}`);
  }

  getSnackBar() {
    // Since snackBars are often shown in response to errors,
    // we'll add a timeout of 10 seconds to help increase the likelihood that
    // the snackbar becomes visible before we might fail because it
    // hasn't (yet) appeared.
    return cy.get(this.snackBar, { timeout: 10000 });
  }

  addTodo(newTodo: Todo) {
    this.getFormField(this.ownerFieldName).type(newTodo.owner);
    if (newTodo.body) { // One test uses a null body, so we need to check it before typing
      this.getFormField(this.bodyFieldName).type(newTodo.body);
    }
    this.getFormField(this.categoryFieldName).type(newTodo.category);
    const statusLabel = newTodo.status ? 'Complete' : 'Incomplete'; // Since the form dropdown maps true/false to Complete/Incomplete, we need to convert before selecting the value
    this.selectMatSelectValue(this.getFormField(this.statusFieldName), statusLabel);
    return this.addTodoButton().click();
  }
}
