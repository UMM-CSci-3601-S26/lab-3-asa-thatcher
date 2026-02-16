import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { throwError } from 'rxjs';
import { ActivatedRouteStub } from '../../testing/activated-route-stub';
import { MockTodoService } from '../../testing/todo.service.mock';
import { Todo } from './todo';
import { TodoViewComponent } from './todo-view.component';
import { TodoService } from './todo.service';

describe('TodoViewComponent', () => {
  let component: TodoViewComponent;
  let fixture: ComponentFixture<TodoViewComponent>;
  let todoService: TodoService;
  const chrisId = 'chris_id';
  const activatedRoute: ActivatedRouteStub = new ActivatedRouteStub({
    // Using the constructor here lets us try that branch in `activated-route-stub.ts`
    // and then we can choose a new parameter map in the tests if we choose
    id: chrisId,
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TodoViewComponent,
      ],
      providers: [
        { provide: TodoService, useClass: MockTodoService },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoViewComponent);
    todoService = TestBed.inject(TodoService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to a specific todo view', () => {
    const expectedTodo: Todo = MockTodoService.testTodos[0];
    // Setting this should cause anyone subscribing to the paramMap
    // to update. Our `TodoViewComponent` subscribes to that, so
    // it should update right away.
    activatedRoute.setParamMap({ id: expectedTodo._id });
    expect(component.todo()).toEqual(expectedTodo);
  });

  it('should navigate to correct todo when the id parameter changes', () => {
    let expectedTodo: Todo = MockTodoService.testTodos[0];
    // Setting this should cause anyone subscribing to the paramMap
    // to update. Our `TodoViewComponent` subscribes to that, so
    // it should update right away.
    activatedRoute.setParamMap({ id: expectedTodo._id });
    expect(component.todo()).toEqual(expectedTodo);

    // Changing the paramMap should update the displayed todo view.
    expectedTodo = MockTodoService.testTodos[1];
    activatedRoute.setParamMap({ id: expectedTodo._id });
    expect(component.todo()).toEqual(expectedTodo);
  });

  it('should have `null` for the todo for a bad ID', () => {
    activatedRoute.setParamMap({ id: 'badID' });

    // If the given ID doesn't map to a todo, we expect the service
    // to return `null`, so we would expect the component's todo
    // to also be `null`.
    expect(component.todo()).toBeNull();
  });

  it('should set error data on observable error', () => {
    const mockError = {
      message: 'Test Error',
      error: { title: 'Error Title' },
    };

    // "Spy" on the `.addTodo()` method in the todo service. Here we basically
    // intercept any calls to that method and return the error response
    // defined above.
    const getTodoSpy = spyOn(todoService, 'getTodoById').and.returnValue(
      throwError(() => mockError)
    );

    activatedRoute.setParamMap({ id: chrisId });

    expect(component.error()).toEqual({
      help: 'There was a problem loading the todo – try again.',
      httpResponse: mockError.message,
      message: mockError.error.title,
    });
    expect(getTodoSpy).toHaveBeenCalledWith(chrisId);
  });
});
