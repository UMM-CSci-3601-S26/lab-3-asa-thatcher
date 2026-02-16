import { HttpClient, HttpParams, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { Todo } from './todo';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  // A small collection of test todos
  const testTodos: Todo[] = [
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
      body: "Shwabalooby doo",
      category: 'homework',
    },
    {
      _id: 'jamie_id',
      owner: 'Jamie',
      status: false,
      body: "Lodalee doowaa",
      category: 'software design',
    }
  ];

  let todoService: TodoService;
  // These are used to mock the HTTP requests so that we (a) don't have to
  // have the server running and (b) we can check exactly which HTTP
  // requests were made to ensure that we're making the correct requests.
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    // Construct an instance of the service with the mock
    // HTTP client.
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    todoService = TestBed.inject(TodoService);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });
  /*
  describe('When getCompanies() is called with no parameters', () => {
    it('calls `api/todosByCompany`', waitForAsync(() => {
      // Mock the `httpClient.get()` method, so that instead of making an HTTP request,
      // it just returns our test data.
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testCompanies));

      todoService.getCompanies().subscribe(() => {
        // The mocked method (`httpClient.get()`) should have been called
        // exactly one time.
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(todoService.todosByCompanyUrl);
      });
    }));
  });*/

  describe('When getTodos() is called with no parameters', () => {
    /* We really don't care what `getTodos()` returns. Since all the
    * filtering (when there is any) is happening on the server,
    * `getTodos()` is really just a "pass through" that returns whatever it receives,
    * without any "post processing" or manipulation. The test in this
    * `describe` confirms that the HTTP request is properly formed
    * and sent out in the world, but we don't _really_ care about
    * what `getTodos()` returns as long as it's what the HTTP
    * request returns.
    *
    * So in this test, we'll keep it simple and have
    * the (mocked) HTTP request return the entire list `testTodos`
    * even though in "real life" we would expect the server to
    * return return a filtered subset of the todos. Furthermore, we
    * won't actually check what got returned (there won't be an `expect`
    * about the returned value). Since we don't use the returned value in this test,
    * It might also be fine to not bother making the mock return it.
    */
    it('calls `api/todos`', waitForAsync(() => {
      // Mock the `httpClient.get()` method, so that instead of making an HTTP request,
      // it just returns our test data.
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

      // Call `todoService.getTodos()` and confirm that the correct call has
      // been made with the correct arguments.
      //
      // We have to `subscribe()` to the `Observable` returned by `getTodos()`.
      // The `todos` argument in the function is the array of Todos returned by
      // the call to `getTodos()`.
      todoService.getTodos().subscribe(() => {
        // The mocked method (`httpClient.get()`) should have been called
        // exactly one time.
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        // The mocked method should have been called with two arguments:
        //   * the appropriate URL ('/api/todos' defined in the `TodoService`)
        //   * An options object containing an empty `HttpParams`
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams() });
      });
    }));
  });

  describe('When getTodos() is called with parameters, it correctly forms the HTTP request (Javalin/Server filtering)', () => {
    /*
    * As in the test of `getTodos()` that takes in no filters in the params,
    * we really don't care what `getTodos()` returns in the cases
    * where the filtering is happening on the server. Since all the
    * filtering is happening on the server, `getTodos()` is really
    * just a "pass through" that returns whatever it receives, without
    * any "post processing" or manipulation. So the tests in this
    * `describe` block all confirm that the HTTP request is properly formed
    * and sent out in the world, but don't _really_ care about
    * what `getTodos()` returns as long as it's what the HTTP
    * request returns.
    *
    * So in each of these tests, we'll keep it simple and have
    * the (mocked) HTTP request return the entire list `testTodos`
    * even though in "real life" we would expect the server to
    * return return a filtered subset of the todos. Furthermore, we
    * won't actually check what got returned (there won't be an `expect`
    * about the returned value).
    */

    it('correctly calls api/todos with filter parameter \'complete\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

      todoService.getTodos({ status: 'complete' }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        // The mocked method should have been called with two arguments:
        //   * the appropriate URL ('/api/todos' defined in the `TodoService`)
        //   * An options object containing an `HttpParams` with the `role`:`admin`
        //     key-value pair.
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(todoService.todoUrl, { params: new HttpParams().set('status', 'complete') });
      });
    });

    it('correctly calls api/todos with multiple filter parameters', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testTodos));

      todoService.getTodos({ owner: 'Chris', category: 'groceries', status: 'complete' }).subscribe(() => {
        // This test checks that the call to `todoService.getTodos()` does several things:
        //   * It calls the mocked method (`HttpClient#get()`) exactly once.
        //   * It calls it with the correct endpoint (`todoService.todoUrl`).
        //   * It calls it with the correct parameters:
        //      * There should be three parameters (this makes sure that there aren't extras).
        //      * There should be a "owner:Chris" key-value pair.
        //      * And a "category:groceries" pair.
        //      * And a "status:complete" pair.

        // This gets the arguments for the first (and in this case only) call to the `mockMethod`.
        const [url, options] = mockedMethod.calls.argsFor(0);
        // Gets the `HttpParams` from the options part of the call.
        // `options.param` can return any of a broad number of types;
        // it is in fact an instance of `HttpParams`, and I need to use
        // that fact, so I'm casting it (the `as HttpParams` bit).
        const calledHttpParams: HttpParams = (options.params) as HttpParams;
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(url)
          .withContext('talks to the correct endpoint')
          .toEqual(todoService.todoUrl);
        expect(calledHttpParams.keys().length)
          .withContext('should have 3 params')
          .toEqual(3);
        expect(calledHttpParams.get('owner'))
          .withContext('owner of Chris')
          .toEqual('Chris');
        expect(calledHttpParams.get('category'))
          .withContext('category being groceries')
          .toEqual('groceries');
        expect(calledHttpParams.get('status'))
          .withContext('status being complete')
          .toEqual('complete');
      });
    });
  });

  describe('When getTodoById() is given an ID', () => {
    /* We really don't care what `getTodoById()` returns. Since all the
    * interesting work is happening on the server, `getTodoById()`
    * is really just a "pass through" that returns whatever it receives,
    * without any "post processing" or manipulation. The test in this
    * `describe` confirms that the HTTP request is properly formed
    * and sent out in the world, but we don't _really_ care about
    * what `getTodoById()` returns as long as it's what the HTTP
    * request returns.
    *
    * So in this test, we'll keep it simple and have
    * the (mocked) HTTP request return the `targetTodo`
    * Furthermore, we won't actually check what got returned (there won't be an `expect`
    * about the returned value). Since we don't use the returned value in this test,
    * It might also be fine to not bother making the mock return it.
    */
    it('calls api/todos/id with the correct ID', waitForAsync(() => {
      // We're just picking a Todo "at random" from our little
      // set of Todos up at the top.
      const targetTodo: Todo = testTodos[1];
      const targetId: string = targetTodo._id;

      // Mock the `httpClient.get()` method so that instead of making an HTTP request
      // it just returns one todo from our test data
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(targetTodo));

      // Call `todoService.getTodo()` and confirm that the correct call has
      // been made with the correct arguments.
      //
      // We have to `subscribe()` to the `Observable` returned by `getTodoById()`.
      // The `todo` argument in the function below is the thing of type Todo returned by
      // the call to `getTodoById()`.
      todoService.getTodoById(targetId).subscribe(() => {
        // The `Todo` returned by `getTodoById()` should be targetTodo, but
        // we don't bother with an `expect` here since we don't care what was returned.
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(`${todoService.todoUrl}/${targetId}`);
      });
    }));
  });

  describe('Filtering on the client using `filterTodos()` (Angular/Client filtering)', () => {
    /*
     * Since `filterTodos` actually filters "locally" (in
     * Angular instead of on the server), we do want to
     * confirm that everything it returns has the desired
     * properties. Since this doesn't make a call to the server,
     * though, we don't have to use the mock HttpClient and
     * all those complications.
     */
    it('filters by owner', () => {
      const todoOwner = 'Chris';
      const filteredTodos = todoService.filterTodos(testTodos, { owner: todoOwner });
      // There should be one todo with an owner of 'Chris'.
      expect(filteredTodos.length).toBe(1);
      // Every returned todo's owner should be 'Chris'.
      filteredTodos.forEach(todo => {
        expect(todo.owner.indexOf(todoOwner)).toBeGreaterThanOrEqual(0);
      });
    });

    it('filters by category', () => {
      const todoCategory = 'groceries';
      const filteredTodos = todoService.filterTodos(testTodos, { category: todoCategory });
      // There should be just one todo that has groceries as their category.
      expect(filteredTodos.length).toBe(1);
      // Every returned todo's category should contain 'groceries'.
      filteredTodos.forEach(todo => {
        expect(todo.category.indexOf(todoCategory)).toBeGreaterThanOrEqual(0);
      });
    });

    it('filters by owner and category', () => {
      // Only two todos meet these criteria
      const todoOwner = 'i';
      const todoCategory = 'g';
      const filters = { owner: todoOwner, category: todoCategory };
      const filteredTodos = todoService.filterTodos(testTodos, filters);
      // There should be just two todos with these properties.
      expect(filteredTodos.length).toBe(2);
      // Every returned todo should have _both_ these properties.
      filteredTodos.forEach(todo => {
        expect(todo.owner.indexOf(todoOwner)).toBeGreaterThanOrEqual(0);
        expect(todo.category.indexOf(todoCategory)).toBeGreaterThanOrEqual(0);
      });
    });
  });

  // Coverage requires tests for filtering body and status, which will be part of a future PR

  /* Commented out since `addTodo()` isn't implemented yet
  describe('Adding a todo using `addTodo()`', () => {
    it('talks to the right endpoint and is called once', waitForAsync(() => {
      const todo_id = 'pat_id';
      const expected_http_response = { id: todo_id } ;

      // Mock the `httpClient.addTodo()` method, so that instead of making an HTTP request,
      // it just returns our expected HTTP response.
      const mockedMethod = spyOn(httpClient, 'post')
        .and
        .returnValue(of(expected_http_response));

      todoService.addTodo(testTodos[1]).subscribe((new_todo_id) => {
        expect(new_todo_id).toBe(todo_id);
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(todoService.todoUrl, testTodos[1]);
      });
    }));
  });*/
});
