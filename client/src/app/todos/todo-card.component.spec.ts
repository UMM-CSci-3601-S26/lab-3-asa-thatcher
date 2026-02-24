import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TodoCardComponent } from './todo-card.component';
import { Todo } from './todo';

describe('TodoCardComponent', () => {
  let component: TodoCardComponent;
  let fixture: ComponentFixture<TodoCardComponent>;
  let expectedTodo: Todo;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TodoCardComponent
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoCardComponent);
    component = fixture.componentInstance;
    expectedTodo = {
      _id: 'chris_id',
      owner: 'Chris',
      body: 'Shwoopy doopy',
      category: 'homework',
      status: true
    };
    fixture.componentRef.setInput('todo', expectedTodo);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be associated with the correct todo', () => {
    expect(component.todo()).toEqual(expectedTodo);
  });

  it('should be the todo named Chris', () => {
    expect(component.todo().owner).toEqual('Chris');
  });
});
