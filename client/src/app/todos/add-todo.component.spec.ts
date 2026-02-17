import { Location } from '@angular/common';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, flush, tick, waitForAsync } from '@angular/core/testing';
import { AbstractControl, FormGroup } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { MockTodoService } from 'src/testing/todo.service.mock';
import { AddTodoComponent } from './add-todo.component';
import { TodoViewComponent } from './todo-view.component';
import { TodoService } from './todo.service';
import { provideHttpClient } from '@angular/common/http';

describe('AddTodoComponent', () => {
  let addTodoComponent: AddTodoComponent;
  let addTodoForm: FormGroup;
  let fixture: ComponentFixture<AddTodoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AddTodoComponent,
        MatSnackBarModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TodoService, useClass: MockTodoService }
      ]
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTodoComponent);
    addTodoComponent = fixture.componentInstance;
    fixture.detectChanges();
    addTodoForm = addTodoComponent.addTodoForm;
    expect(addTodoForm).toBeDefined();
    expect(addTodoForm.controls).toBeDefined();
  });

  // Not terribly important; if the component doesn't create
  // successfully that will probably blow up a lot of things.
  // Including it, though, does give us confidence that our
  // our component definitions don't have errors that would
  // prevent them from being successfully constructed.
  it('should create the component and form', () => {
    expect(addTodoComponent).toBeTruthy();
    expect(addTodoForm).toBeTruthy();
  });

  // Confirms that an initial, empty form is *not* valid, so
  // people can't submit an empty form.
  it('form should be invalid when empty', () => {
    expect(addTodoForm.valid).toBeFalsy();
  });

  describe('The owner field', () => {
    let ownerControl: AbstractControl;

    beforeEach(() => {
      ownerControl = addTodoComponent.addTodoForm.controls.owner;
    });

    it('should not allow empty owners', () => {
      ownerControl.setValue('');
      expect(ownerControl.valid).toBeFalsy();
    });

    it('should be fine with "Chris Smith"', () => {
      ownerControl.setValue('Chris Smith');
      expect(ownerControl.valid).toBeTruthy();
    });

    it('should fail on single character owners', () => {
      ownerControl.setValue('x');
      expect(ownerControl.valid).toBeFalsy();
      // Annoyingly, Angular uses lowercase 'l' here
      // when it's an upper case 'L' in `Validators.minLength(2)`.
      expect(ownerControl.hasError('minlength')).toBeTruthy();
    });

    // In the real world, you'd want to be pretty careful about
    // setting upper limits on things like owner lengths just
    // because there are people with really long owners.
    it('should fail on really long owners', () => {
      ownerControl.setValue('x'.repeat(100));
      expect(ownerControl.valid).toBeFalsy();
      // Annoyingly, Angular uses lowercase 'l' here
      // when it's an upper case 'L' in `Validators.maxLength(2)`.
      expect(ownerControl.hasError('maxlength')).toBeTruthy();
    });

    it('should allow digits in the owner', () => {
      ownerControl.setValue('Bad2Th3B0ne');
      expect(ownerControl.valid).toBeTruthy();
    });
  });

  describe('getErrorMessage()', () => {
    it('should return the correct error message', () => {
      // The type statement is needed to ensure that `controlName` isn't just any
      // random string, but rather one of the keys of the `addTodoValidationMessages`
      // map in the component.
      const controlOwner: keyof typeof addTodoComponent.addTodoValidationMessages = 'owner';
      addTodoComponent.addTodoForm.get(controlOwner).setErrors({'required': true});
      expect(addTodoComponent.getErrorMessage(controlOwner)).toEqual('Owner is required');

      // We don't need the type statement here because we're not using the
      // same (previously typed) variable. We could use a `let` and the type statement
      // if we wanted to create a new variable, though.
      // controlOwner = 'category';
      // addTodoComponent.addTodoForm.get(controlOwner).setErrors({'required': true});
      // expect(addTodoComponent.getErrorMessage(controlOwner)).toEqual('Category is required');
    });

    it('should return "Unknown error" if no error message is found', () => {
      // The type statement is needed to ensure that `controlName` isn't just any
      // random string, but rather one of the keys of the `addTodoValidationMessages`
      // map in the component.
      const controlOwner: keyof typeof addTodoComponent.addTodoValidationMessages = 'owner';
      addTodoComponent.addTodoForm.get(controlOwner).setErrors({'unknown': true});
      expect(addTodoComponent.getErrorMessage(controlOwner)).toEqual('Unknown error');
    });
  });
});

// A lot of these tests mock the service using an approach like this doc example
// https://angular.dev/guide/testing/components-scenarios#more-async-tests
// The same way that the following allows the mock to be used:
//
// TestBed.configureTestingModule({
//   providers: [{provide: TwainQuotes, useClass: MockTwainQuotes}], // A (more-async-tests) - provide + use class of the mock
// });
// const twainQuotes = TestBed.inject(TwainQuotes) as MockTwainQuotes; // B (more-async-tests) - inject the service as the mock
//
// Is how these tests work with the mock then being injected in

describe('AddTodoComponent#submitForm()', () => {
  let component: AddTodoComponent;
  let fixture: ComponentFixture<AddTodoComponent>;
  let todoService: TodoService;
  let location: Location;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AddTodoComponent,
        MatSnackBarModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: TodoService, useClass: MockTodoService }, // A (more-async-tests) - provide + use class of the mock
        provideRouter([
          { path: 'todos/1', component: TodoViewComponent }
        ])]
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTodoComponent);
    component = fixture.componentInstance;
    todoService = TestBed.inject(TodoService); // B (more-async-tests) - inject the service as the mock
    location = TestBed.inject(Location);
    // We need to inject the router and the HttpTestingController, but
    // never need to use them. So, we can just inject them into the TestBed
    // and ignore the returned values.
    TestBed.inject(Router);
    TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  beforeEach(() => {
    // Set up the form with valid values.
    // We don't actually have to do this, but it does mean that when we
    // check that `submitForm()` is called with the right arguments below,
    // we have some reason to believe that that wasn't passing "by accident".
    component.addTodoForm.controls.owner.setValue('Chris Smith');
    component.addTodoForm.controls.body.setValue('hello');
    component.addTodoForm.controls.category.setValue('homework');
  });

  // The `fakeAsync()` wrapper is necessary because the `submitForm()` method
  // calls `navigate()` on the router, which is an asynchronous operation, and we
  // need to wait (using `tick()`) for that to complete before we can check the
  // new location.
  it('should call addTodo() and handle success response', fakeAsync(() => {
    // "Spy" on the `.addTodo()` method in the todo service. Here we basically
    // intercept any calls to that method and return a canned response ('1').
    // This means we don't have to worry about the details of the `.addTodo()`,
    // or actually have a server running to receive the HTTP request that
    // `.addTodo()` would typically generate. Note also that the particular values
    // we set up in our form (e.g., 'Chris Smith') are actually ignored
    // thanks to our `spyOn()` call.
    const addTodoSpy = spyOn(todoService, 'addTodo').and.returnValue(of('1'));
    component.submitForm();
    // Check that `.addTodo()` was called with the form's values which we set
    // up above.
    expect(addTodoSpy).toHaveBeenCalledWith(component.addTodoForm.value);
    // Wait for the router to navigate to the new page. This is necessary since
    // navigation is an asynchronous operation.
    tick();
    // Now we can check that the router actually navigated to the right place.
    expect(location.path()).toBe('/todos/1');
    // Flush any pending microtasks. This is necessary to ensure that the
    // timer generated by `fakeAsync()` completes before the test finishes.
    flush();
  }));

  // This doesn't need `fakeAsync()`, `tick()`, or `flush() because the
  // error case doesn't navigate to another page. It just displays an error
  // message in the snackbar. So, we don't need to worry about the asynchronous
  // nature of navigation.
  it('should call addTodo() and handle error response', () => {
    // Save the original path so we can check that it doesn't change.
    const path = location.path();
    // A canned error response to be returned by the spy.
    const errorResponse = { status: 500, message: 'Server error' };
    // "Spy" on the `.addTodo()` method in the todo service. Here we basically
    // intercept any calls to that method and return the error response
    // defined above.
    const addTodoSpy = spyOn(todoService, 'addTodo')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    // Check that `.addTodo()` was called with the form's values which we set
    // up above.
    expect(addTodoSpy).toHaveBeenCalledWith(component.addTodoForm.value);
    // Confirm that we're still at the same path.
    expect(location.path()).toBe(path);
  });


  it('should call addTodo() and handle error response for illegal todo', () => {
    // Save the original path so we can check that it doesn't change.
    const path = location.path();
    // A canned error response to be returned by the spy.
    const errorResponse = { status: 400, message: 'Illegal todo error' };
    // "Spy" on the `.addTodo()` method in the todo service. Here we basically
    // intercept any calls to that method and return the error response
    // defined above.
    const addTodoSpy = spyOn(todoService, 'addTodo')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    // Check that `.addTodo()` was called with the form's values which we set
    // up above.
    expect(addTodoSpy).toHaveBeenCalledWith(component.addTodoForm.value);
    // Confirm that we're still at the same path.
    expect(location.path()).toBe(path);
  });

  it('should call addTodo() and handle unexpected error response if it arises', () => {
    // Save the original path so we can check that it doesn't change.
    const path = location.path();
    // A canned error response to be returned by the spy.
    const errorResponse = { status: 404, message: 'Not found' };
    // "Spy" on the `.addTodo()` method in the todo service. Here we basically
    // intercept any calls to that method and return the error response
    // defined above.
    const addTodoSpy = spyOn(todoService, 'addTodo')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    // Check that `.addTodo()` was called with the form's values which we set
    // up above.
    expect(addTodoSpy).toHaveBeenCalledWith(component.addTodoForm.value);
    // Confirm that we're still at the same path.
    expect(location.path()).toBe(path);
  });
});
