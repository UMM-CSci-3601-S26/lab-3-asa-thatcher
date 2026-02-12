import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { Todo } from '../app/todos/todo';
import { TodoService } from 'src/app/todos/todo.service';

/**
 * A "mock" version of the `TodoService` that can be used to test components
 * without having to create an actual service. It needs to be `Injectable` since
 * that's how services are typically provided to components.
 */
@Injectable({
  providedIn: AppComponent
})
export class MockTodoService implements Pick<TodoService, 'getTodos' | 'getTodoById' | 'addTodo' | 'filterTodos'> {
  static testTodos: Todo[] = [
    {
      _id: 'chris_id',
      owner: 'Chris',
      status: true,
      body: "Shwoopy doopy",
      category: 'groceries',
    },
    {
      _id: 'pat_id',
      owner: 'Pat',
      status: true,
      body: "Shwoopy doopy",
      category: 'homework',
    },
    {
      _id: 'jamie_id',
      owner: 'Jamie',
      status: false,
      body: "Shwoopy doopler",
      category: 'software design',
    }
  ];

  // skipcq: JS-0105
  // It's OK that the `_filters` argument isn't used here, so we'll disable
  // this warning for just his function.
  /* eslint-disable @typescript-eslint/no-unused-vars */
  getTodos(_filters: {  owner?: string; category?: string }): Observable<Todo[]> {
    // Our goal here isn't to test (and thus rewrite) the service, so we'll
    // keep it simple and just return the test todos regardless of what
    // filters are passed in.
    //
    // The `of()` function converts a regular object or value into an
    // `Observable` of that object or value.
    return of(MockTodoService.testTodos);
  }

  // skipcq: JS-0105
  getTodoById(id: string): Observable<Todo> {
    // If the specified ID is for one of the first two test todos,
    // return that todo, otherwise return `null` so
    // we can test illegal todo requests.
    // If you need more, just add those in too.
    if (id === MockTodoService.testTodos[0]._id) {
      return of(MockTodoService.testTodos[0]);
    } else if (id === MockTodoService.testTodos[1]._id) {
      return of(MockTodoService.testTodos[1]);
    } else {
      return of(null);
    }
  }

  addTodo(newTodo: Partial<Todo>): Observable<string> {
    // Send post request to add a new todo with the todo data as the body.
    // `res.id` should be the MongoDB ID of the newly added `Todo`.
    return of('')
  }

  filterTodos(todos: Todo[], filters: {
    owner?: string;
    category?: string;
  }): Todo[] {
    return []
  }
}
