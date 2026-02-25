import type { Test, Category, Track } from '../types'

// ==============================
// SHARED TESTS (JS, TS, CSS)
// ==============================

// JS (Regex evaluation enabled because output in console must match exactly)
export const jsAdvanced1: Test = {
  id: 'js-adv-1',
  name: 'JS 1: Event Loop',
  category: 'JavaScript',
  difficulty: 'advanced',
  description: `# Senior JS Test 1\n\n**Goal:** Understand the JavaScript Event Loop, Promise microtasks, and Macrotasks.\n\n### Requirements:\n1. Formulate the exact \`console.log\` output sequence of a mixed \`setTimeout\` and \`Promise\` resolution block.\n2. Ensure your code sequentially logs the expected output to the console for validation.\n\n*Note: The automatic evaluator expects the final output to contain the string 'Resolved' in the console.*`,
  initialCode: `// Evaluator expects 'Resolved' in console`,
  evaluationRegex: 'Resolved'
}
export const jsAdvanced2: Test = {
  id: 'js-adv-2',
  name: 'JS 2: Array Reduce',
  category: 'JavaScript',
  difficulty: 'advanced',
  description: `# Senior JS Test 2\n\n**Goal:** Master the \`Array.prototype.reduce\` method for complex data transformation.\n\n### Requirements:\n1. Transform an array of objects representing transactions into a grouped dictionary/map by category.\n2. Log the resulting object to the console.\n\n*Note: The automatic evaluator expects to see the key 'b' in the final console output.*`,
  initialCode: `// Evaluator expects 'b' in console`,
  evaluationRegex: 'b'
}
export const jsMiddle1: Test = {
  id: 'js-mid-1',
  name: 'JS 1: Closures',
  category: 'JavaScript',
  difficulty: 'medium',
  description: `# Middle JS Test 1\n\n**Goal:** Demonstrate lexical scoping and closures in JavaScript.\n\n### Requirements:\n1. Create a function \`createCounter()\` that returns an object with \`increment\` and \`getValue\` methods.\n2. The internal counter state must be private and inaccessible from the outside.\n3. Log the result of an increment operation to the console.\n\n*Note: Evaluator expects '2' in the console.*`,
  initialCode: `// Evaluator expects '2' in console`,
  evaluationRegex: '2'
}
export const jsMiddle2: Test = {
  id: 'js-mid-2',
  name: 'JS 2: Map & Filter',
  category: 'JavaScript',
  difficulty: 'medium',
  description: `# Middle JS Test 2\n\n**Goal:** Filter and map an array.\n\n### Requirements:\n1. Given an array of users, filter those over 18 and map their names into a new array.\n2. Log the resulting array to the console.\n\n*Note: Evaluator expects 'filtered' in the console.*`,
  initialCode: `// Evaluator expects 'filtered' in console`,
  evaluationRegex: 'filtered'
}
export const jsEasy1: Test = {
  id: 'js-easy-1',
  name: 'JS 1: String Reversal',
  category: 'JavaScript',
  difficulty: 'easy',
  description: `# Junior JS Test 1\n\n**Goal:** Manipulate strings.\n\n### Requirements:\n1. Write a function that takes a string and returns it reversed.\n2. Do NOT use the built-in \`Array.reverse()\` method.\n3. Log 'reversed' to the console.\n\n*Note: Evaluator expects 'reversed' in console.*`,
  initialCode: `// Evaluator expects 'reversed' in console`,
  evaluationRegex: 'reversed'
}
export const jsEasy2: Test = {
  id: 'js-easy-2',
  name: 'JS 2: FizzBuzz',
  category: 'JavaScript',
  difficulty: 'easy',
  description: `# Junior JS Test 2\n\n**Goal:** Implement Fizzbuzz logic.\n\n### Requirements:\n1. Write a function that counts from 1 to 15.\n2. Log "FizzBuzz" when divisble by 3 and 5.\n\n*Note: Evaluator expects 'FizzBuzz' in console output.*`,
  initialCode: `// Evaluator expects 'FizzBuzz' in console`,
  evaluationRegex: 'FizzBuzz'
}

// TS (No regex evaluation, manually reviewed)
export const tsAdvanced1: Test = {
  id: 'ts-adv-1',
  name: 'TS 1: Utility Types',
  category: 'TypeScript',
  difficulty: 'advanced',
  description: `# Senior TS Test 1\n\n**Goal:** Use advanced TypeScript utility types.\n\n### Requirements:\n1. Combine \`Partial<T>\` and \`Omit<T, K>\` to create a complex mapped type.\n2. Create a generic type \`UpdatePayload<T>\` that makes all properties optional EXCEPT for 'id' which must be required.\n3. Write the necessary interfaces to demonstrate this.`,
  initialCode: `// Write your TS code here`
}
export const tsAdvanced2: Test = {
  id: 'ts-adv-2',
  name: 'TS 2: Constraints',
  category: 'TypeScript',
  difficulty: 'advanced',
  description: `# Senior TS Test 2\n\n**Goal:** Implement generic constraints.\n\n### Requirements:\n1. Create a generic function \`getProperty<T, K>\` that strictly accepts an object and a key that exists on that object.\n2. Ensure the constraint \`K extends keyof T\` is properly applied.`,
  initialCode: `// Write your TS code here`
}
export const tsMiddle1: Test = {
  id: 'ts-mid-1',
  name: 'TS 1: Advanced Interfaces',
  category: 'TypeScript',
  difficulty: 'medium',
  description: `# Middle TS Test 1\n\n**Goal:** Understand the difference between Interfaces and Types.\n\n### Requirements:\n1. Explain with code examples the difference between an \`interface\` and a \`type\` alias.\n2. Specifically, demonstrate Declaration Merging with an interface.`,
  initialCode: `// Write your TS code here`
}
export const tsMiddle2: Test = {
  id: 'ts-mid-2',
  name: 'TS 2: Enums & Types',
  category: 'TypeScript',
  difficulty: 'medium',
  description: `# Middle TS Test 2\n\n**Goal:** Use basic generics.\n\n### Requirements:\n1. Create a generic \`Box<T>\` interface with a \`value\` of type \`T\`.\n2. Write a function \`wrapInBox<T>(val: T): Box<T>\` that returns the wrapped value.`,
  initialCode: `// Write your TS code here`
}
export const tsEasy1: Test = {
  id: 'ts-easy-1',
  name: 'TS 1: Basic Typing',
  category: 'TypeScript',
  difficulty: 'easy',
  description: `# Junior TS Test 1\n\n**Goal:** Define basic primitive types.\n\n### Requirements:\n1. Declare variables explicitly typing them as \`string\`, \`number\`, and \`boolean\`.\n2. Create an array of strings explicitly typed.`,
  initialCode: `// Write your TS code here`
}
export const tsEasy2: Test = {
  id: 'ts-easy-2',
  name: 'TS 2: Interfaces',
  category: 'TypeScript',
  difficulty: 'easy',
  description: `# Junior TS Test 2\n\n**Goal:** Add type signatures to functions.\n\n### Requirements:\n1. Create a function \`add(a, b)\` and explicitly type both parameters as numbers.\n2. Explicitly type the return value of the function as a number.`,
  initialCode: `// Write your TS code here`
}

// CSS (No regex evaluation, manually reviewed)
export const cssAdvanced1: Test = {
  id: 'css-adv-1',
  name: 'CSS 1: SCSS Mixins',
  category: 'CSS',
  difficulty: 'advanced',
  description: `# Senior CSS Test 1\n\n**Goal:** Create a robust SCSS Mixin architecture.\n\n### Requirements:\n1. Write an SCSS Mixin for responsive media queries (e.g., \`@include respond-to('tablet')\`).\n2. Demonstrate its usage applying different \`font-size\` properties based on the breakpoint.`,
  initialCode: `/* Write your SCSS code here */`
}
export const cssAdvanced2: Test = {
  id: 'css-adv-2',
  name: 'CSS 2: CSS Grid Adv',
  category: 'CSS',
  difficulty: 'advanced',
  description: `# Senior CSS Test 2\n\n**Goal:** Implement a complex layout using CSS Grid.\n\n### Requirements:\n1. Create a holy grail layout structure (Header, Sidebar, Main, Right Aside, Footer) using \`grid-template-areas\`.\n2. Ensure the layout gracefully stacks on mobile devices using media queries.`,
  initialCode: `/* Write your CSS code here */`
}
export const cssMiddle1: Test = {
  id: 'css-mid-1',
  name: 'CSS 1: Specificity',
  category: 'CSS',
  difficulty: 'medium',
  description: `# Middle CSS Test 1\n\n**Goal:** Understand CSS specificity and the cascade.\n\n### Requirements:\n1. Given an element with an ID, a Class, and an inline style, write a CSS rule that successfully overrides the inline style WITHOUT editing the HTML.\n2. Explain in comments how specificity weight works in your solution.`,
  initialCode: `/* Write your CSS code here */`
}
export const cssMiddle2: Test = {
  id: 'css-mid-2',
  name: 'CSS 2: Flexbox Layout',
  category: 'CSS',
  difficulty: 'medium',
  description: `# Middle CSS Test 2\n\n**Goal:** Align items using Flexbox.\n\n### Requirements:\n1. Create a flex container that vertically centers its children.\n2. Distribute 3 children evenly across the horizontal space using \`justify-content\`.`,
  initialCode: `/* Write your CSS code here */`
}
export const cssEasy1: Test = {
  id: 'css-easy-1',
  name: 'CSS 1: Box Model',
  category: 'CSS',
  difficulty: 'easy',
  description: `# Junior CSS Test 1\n\n**Goal:** Understand the CSS Box Model.\n\n### Requirements:\n1. Create a \`div\` block that visually looks like a card.\n2. Apply padding, border, and margin correctly.\n3. Explain the difference between \`box-sizing: content-box\` and \`border-box\` in comments.`,
  initialCode: `/* Write your CSS code here */`
}
export const cssEasy2: Test = {
  id: 'css-easy-2',
  name: 'CSS 2: Positioning',
  category: 'CSS',
  difficulty: 'easy',
  description: `# Junior CSS Test 2\n\n**Goal:** Master basic CSS positioning.\n\n### Requirements:\n1. Create a parent \`div\` set to \`relative\` positioning.\n2. Create a child \`div\` set to \`absolute\` positioning, and pin it to the bottom-right corner of the parent.`,
  initialCode: `/* Write your CSS code here */`
}


// ==============================
// REACT TRACKS (No regex evaluation for framework tests)
// ==============================

export const rs1: Test = { id: 'rs-1', name: 'React 1: Custom Hooks', category: 'React', difficulty: 'advanced', description: `# Senior React Test 1\n\n**Goal:** Create an advanced custom hook \`useDebounce\`.\n\n### Requirements:\n1. Implement a custom hook \`useDebounce(value, delay)\` that returns a debounced version of the passed value.\n2. Ensure it handles the cleanup phase automatically when unmounting or when \`value\`/\`delay\` changes to avoid memory leaks.\n\n### Expected Hook Behavior:\n\`\`\`tsx\n// Example Usage:\nconst [searchTerm, setSearchTerm] = useState("");\nconst debouncedSearchTerm = useDebounce(searchTerm, 500);\n\nuseEffect(() => {\n  // API call triggered only after 500ms of user inactivity\n  fetchResults(debouncedSearchTerm);\n}, [debouncedSearchTerm]);\n\`\`\`\n\n*Note: Write the complete hook function in the editor. You can use imports and JSX if necessary.*`, initialCode: `// Write your React code here. You can use JSX and imports.` }
export const rs2: Test = { id: 'rs-2', name: 'React 2: Render Optimization', category: 'React', difficulty: 'advanced', description: `# Senior React Test 2\n\n**Goal:** Optimize a React component render cycle using native React APIs.\n\n### Requirements:\n1. Demonstrate how to prevent unnecessary re-renders of a heavy child component when the parent's state updates.\n2. Apply \`useMemo\` and/or \`React.memo\` conceptually in an example component structure.\n\n*Write an example pattern illustrating this optimization.*`, initialCode: `// Write your React code here` }
export const rs3: Test = { id: 'rs-3', name: 'React 3: Context API', category: 'React', difficulty: 'advanced', description: `# Senior React Test 3\n\n**Goal:** Create a robust Context API Provider for authentication or theming.\n\n### Requirements:\n1. Create a conceptual Context Provider component (\`ThemeProvider\` or \`AuthProvider\`).\n2. Expose a state and an updater function to its children.\n3. Create a custom hook to consume this context reliably (e.g., throwing an error if used outside the provider).`, initialCode: `// Write your React code here` }

export const rm1: Test = { id: 'rm-1', name: 'React 1: useEffect deps', category: 'React', difficulty: 'medium', description: `# Middle React Test 1\n\n**Goal:** Fix a common infinite loop scenario in \`useEffect\`.\n\n### Requirements:\n1. Write a component that fetches data on mount based on an object prop or state.\n2. Explain/Demonstrate how to structure dependencies to avoid infinite re-renders.`, initialCode: `// Write your React code here` }
export const rm2: Test = { id: 'rm-2', name: 'React 2: Controlled Forms', category: 'React', difficulty: 'medium', description: `# Middle React Test 2\n\n**Goal:** Build a robust controlled form component.\n\n### Requirements:\n1. Create a form with an \`email\` and \`password\` input.\n2. Add basic validation (e.g., email format, password length) handling submit states.`, initialCode: `// Write your React code here` }
export const rm3: Test = { id: 'rm-3', name: 'React 3: Custom Portals', category: 'React', difficulty: 'medium', description: `# Middle React Test 3\n\n**Goal:** Render a component outside the main DOM tree.\n\n### Requirements:\n1. Implement a React Portal modal component using \`ReactDOM.createPortal\`.\n2. Provide the basic markup for it to escape the root node.`, initialCode: `// Write your React code here` }

export const rj1: Test = { id: 'rj-1', name: 'React 1: Custom Hook (useToggle)', category: 'React', difficulty: 'easy', description: `# Junior React Test 1\n\n**Goal:** Create a simple custom hook named \`useToggle\`.\n\n### Requirements:\n1. Implement a custom hook \`useToggle(initialValue)\` that returns a tuple \`[value, toggleFunction]\`.\n2. The \`toggleFunction\` should switch the boolean value from \`true\` to \`false\` and vice-versa, without needing arguments.\n\n### Expected Hook Behavior:\n\`\`\`tsx\n// Example usage:\nconst [isModalOpen, toggleModal] = useToggle(false);\n\nreturn (\n  <button onClick={toggleModal}>\n    {isModalOpen ? 'Close' : 'Open'}\n  </button>\n);\n\`\`\`\n\n*Write the logic for the useToggle hook.*`, initialCode: `// Write your React code here` }
export const rj2: Test = { id: 'rj-2', name: 'React 2: Props Passing', category: 'React', difficulty: 'easy', description: `# Junior React Test 2\n\n**Goal:** Create a parent and child component demonstrating Props passing.\n\n### Requirements:\n1. Pass a \`name\` prop from \`ParentComponent\` to \`ChildComponent\`.\n2. Render the prop inside an \`<h1>\` tag in the child.`, initialCode: `// Write your React code here` }
export const rj3: Test = { id: 'rj-3', name: 'React 3: Basic map()', category: 'React', difficulty: 'easy', description: `# Junior React Test 3\n\n**Goal:** Render a list of elements from an array.\n\n### Requirements:\n1. Given an array of users: \`[{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]\`.\n2. Map over the array to return a list of \`<li>\` elements displaying the name.\n3. Make sure to assign a unique \`key\` prop to each list item.`, initialCode: `// Write your React code here` }

export const rs4: Test = {
  id: 'rs-4',
  name: 'React 4: Testing Library (Hook)',
  category: 'React',
  difficulty: 'advanced',
  description: `# Senior React Test 4\n\n**Goal:** Write a complete test suite for a complex React Hook using \`@testing-library/react-hooks\` or equivalent.\n\n### Requirements:\n1. Assume you are testing the following \`useDebounce\` hook.\n2. Write the Jest / React Testing Library code to test that the debounced value does NOT update immediately upon change.\n3. Write the assertion to verify that the value DOES update after the timer advances in a \`jest.useFakeTimers()\` simulation.\n\n### Hook Code:\n\`\`\`tsx\n// Hook to test\nimport { useState, useEffect } from 'react';\n\nexport function useDebounce(value, delay) {\n  const [debouncedValue, setDebouncedValue] = useState(value);\n\n  useEffect(() => {\n    const handler = setTimeout(() => {\n      setDebouncedValue(value);\n    }, delay);\n\n    return () => clearInterval(handler);\n  }, [value, delay]);\n\n  return debouncedValue;\n}\n\`\`\`\n\n### Expected Pattern:\n\`\`\`tsx\n// Write your test suite using describe() and it()\ndescribe('useDebounce', () => {\n  it('should update value after delay', () => {\n     // Setup testing logic here\n  })\n})\n\`\`\`\n\n*Note: Focus on the testing syntax and assertions.*`,
  initialCode: `// Write your Jest / RTL code here`
}

export const rj4: Test = {
  id: 'rj-4',
  name: 'React 4: Testing Library (Hook)',
  category: 'React',
  difficulty: 'easy',
  description: `# Junior React Test 4\n\n**Goal:** Test a basic React custom hook using React Testing Library.\n\n### Requirements:\n1. Assume you have the following \`useToggle\` custom hook.\n2. Write a Jest / React Testing Library test using \`renderHook\`.\n3. Assert that the initial value is what you expect.\n4. Call the toggle function using \`act()\` and verify the value changed.\n\n### Hook Code:\n\`\`\`tsx\nimport { useState, useCallback } from 'react';\n\nexport const useToggle = (initialValue = false) => {\n  const [value, setValue] = useState(initialValue);\n  const toggle = useCallback(() => setValue((v) => !v), []);\n  return [value, toggle];\n};\n\`\`\`\n\n### Expected Pattern:\n\`\`\`tsx\nimport { renderHook, act } from '@testing-library/react';\n// Or '@testing-library/react-hooks'\n\ndescribe('useToggle Hook', () => {\n  it('should toggle boolean value', () => {\n     // Your test logic here using act()\n  })\n})\n\`\`\`\n\n*Note: Focus on the testing syntax and assertions.*`,
  initialCode: `// Write your Jest / RTL code here`
}

// React Tracks (Already declared below or logic moved)



// ==============================
// ANGULAR TRACKS (No regex evaluation for framework tests)
// ==============================

export const as1: Test = {
  id: 'as-1',
  name: 'Angular 1: Custom Directives',
  category: 'Angular',
  difficulty: 'advanced',
  description: `# Senior Angular Test 1

**Goal:** Create a structural directive that changes the DOM layout (similar in concept to \`*ngIf\` or \`*ngFor\`).

### Requirements:
1. Create a directive class with the \`*\` prefix syntax (structural directive).
2. Inject \`TemplateRef\` and \`ViewContainerRef\` to add or remove the host view based on a condition.
3. Implement at least one \`@Input()\` that controls when the template is rendered (e.g. a boolean or expression).

### Example pattern:

\`\`\`ts
@Directive({ selector: '[appShowWhen]' })
export class ShowWhenDirective {
  constructor(
    private templateRef: TemplateRef<any>,
    private vcr: ViewContainerRef
  ) {}
  // Add logic to create/clear the embedded view based on an @Input()
}
\`\`\`

*Note: Write the complete directive in the editor. Use the selector and inputs that you find clearest.*`,
  initialCode: `// Write your Angular code here`
}
export const as2: Test = {
  id: 'as-2',
  name: 'Angular 2: RxJS Operators',
  category: 'Angular',
  difficulty: 'advanced',
  description: `# Senior Angular Test 2

**Goal:** Use \`switchMap\` (or equivalent) to handle a stream that depends on another (e.g. search term → HTTP request), cancelling previous inner subscriptions when the outer value changes.

### Requirements:
1. Assume you have an observable source (e.g. user typing in a search box or route params).
2. For each emission, trigger an async operation (e.g. \`HttpClient.get\` or a service method returning \`Observable\`).
3. Use \`switchMap\` so that when the source emits again before the inner observable completes, the previous inner subscription is cancelled and the new one is used.
4. Log or return the final stream of results (you can mock the HTTP call with \`of()\` or \`timer()\` if needed).

### Example pattern:

\`\`\`ts
searchTerm$.pipe(
  switchMap(term => this.http.get('/api/search?q=' + term))
).subscribe(results => console.log(results));
\`\`\`

*Note: Write a short component or service snippet that demonstrates \`switchMap\` usage.*`,
  initialCode: `// Write your Angular code here`
}
export const as3: Test = {
  id: 'as-3',
  name: 'Angular 3: Resolvers',
  category: 'Angular',
  difficulty: 'advanced',
  description: `# Senior Angular Test 3

**Goal:** Implement a route resolver that fetches data before the route activates, so the component can assume data is already available.

### Requirements:
1. Create a class that implements \`Resolve<T>\` (or the functional resolver approach with \`resolve\` function).
2. Inject the service you need to load data (e.g. \`UserService\`) and return an \`Observable\` or \`Promise\` from \`resolve()\`.
3. Register the resolver in the route configuration under \`resolve: { key: YourResolver }\`.
4. Optionally show how the component would read the resolved data from \`ActivatedRoute.data\`.

### Example pattern:

\`\`\`ts
@Injectable({ providedIn: 'root' })
export class UserResolver implements Resolve<User> {
  constructor(private userService: UserService) {}
  resolve(route: ActivatedRouteSnapshot): Observable<User> {
    return this.userService.getUser(route.params['id']);
  }
}
// In routes: { path: 'user/:id', component: UserComponent, resolve: { user: UserResolver } }
\`\`\`

*Note: Write the resolver and, if you like, the route config or component usage.*`,
  initialCode: `// Write your Angular code here`
}

export const am1: Test = {
  id: 'am-1',
  name: 'Angular 1: Reactive Forms',
  category: 'Angular',
  difficulty: 'medium',
  description: `# Middle Angular Test 1

**Goal:** Build a reactive form using \`FormGroup\` and \`FormControl\` (from \`@angular/forms\`).

### Requirements:
1. Create a \`FormGroup\` with at least two controls (e.g. \`email\` and \`password\`).
2. Use \`FormControl\` with optional validators (e.g. \`Validators.required\`, \`Validators.email\`).
3. In the template or in the class, show how you would read the form value or subscribe to value changes.
4. Optionally add a simple submit handler that logs the form value or validity.

### Example pattern:

\`\`\`ts
form = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
  password: new FormControl('', [Validators.required, Validators.minLength(6)])
});
// In template: formGroup, formControlName, and (ngSubmit)
\`\`\`

*Note: Write the FormGroup setup in the component class; template markup is optional.*`,
  initialCode: `// Write your Angular code here`
}
export const am2: Test = {
  id: 'am-2',
  name: 'Angular 2: Services',
  category: 'Angular',
  difficulty: 'medium',
  description: `# Middle Angular Test 2

**Goal:** Create an injectable singleton service and inject it into a component or another service.

### Requirements:
1. Create a service class with \`@Injectable({ providedIn: 'root' })\` so it is a singleton app-wide.
2. Add at least one method or property that the consumer will use (e.g. \`getData()\`, \`state\`).
3. Show how a component (or another service) injects it via the constructor and uses it (e.g. calls the method or reads the property).
4. Do not use \`providedIn: 'root'\` only if you explicitly show providing it in a module or component and explain why.

### Example pattern:

\`\`\`ts
@Injectable({ providedIn: 'root' })
export class DataService {
  getItems(): Observable<Item[]> { return this.http.get<Item[]>('/api/items'); }
}
// In component:
constructor(private dataService: DataService) {}
ngOnInit() { this.dataService.getItems().subscribe(...); }
\`\`\`

*Note: You can mock the HTTP call with \`of([])\` if you prefer not to use HttpClient.*`,
  initialCode: `// Write your Angular code here`
}
export const am3: Test = {
  id: 'am-3',
  name: 'Angular 3: Pipes',
  category: 'Angular',
  difficulty: 'medium',
  description: `# Middle Angular Test 3

**Goal:** Create a custom pipe that transforms input data for use in the template.

### Requirements:
1. Create a class with the \`@Pipe\` decorator and a \`name\` (e.g. \`appReverse\`).
2. Implement \`PipeTransform\` and the \`transform(value, ...args)\` method.
3. Return a value that can be used in the template (e.g. reversed string, formatted number, filtered list).
4. Show example usage in a template: \`{{ value | appReverse }}\` or with arguments \`{{ value | myPipe:arg }}\`.

### Example pattern:

\`\`\`ts
@Pipe({ name: 'appReverse' })
export class ReversePipe implements PipeTransform {
  transform(value: string): string {
    return value ? value.split('').reverse().join('') : '';
  }
}
// Template: {{ title | appReverse }}
\`\`\`

*Note: Write the full pipe class and, if you like, one line of template usage.*`,
  initialCode: `// Write your Angular code here`
}

export const aj1: Test = {
  id: 'aj-1',
  name: 'Angular 1: Components',
  category: 'Angular',
  difficulty: 'easy',
  description: `# Junior Angular Test 1

**Goal:** Create a basic Angular component with a template and a simple property.

### Requirements:
1. Create a component class with \`@Component\` decorator (selector and template or templateUrl).
2. Add at least one property on the class (e.g. \`title: string = 'Hello'\`) and display it in the template.
3. Use the appropriate module or standalone \`imports\` so the component can be used (you can assume the component is declared in a module or marked \`standalone: true\`).

### Example pattern:

\`\`\`ts
@Component({
  selector: 'app-greeting',
  template: '<h1>{{ title }}</h1>'
})
export class GreetingComponent {
  title = 'Hello, Angular!';
}
\`\`\`

*Note: Write the component class and inline template.*`,
  initialCode: `// Write your Angular code here`
}
export const aj2: Test = {
  id: 'aj-2',
  name: 'Angular 2: Data Binding',
  category: 'Angular',
  difficulty: 'easy',
  description: `# Junior Angular Test 2

**Goal:** Use interpolation and (optionally) property or event binding in a template.

### Requirements:
1. In the component class, define a string property (e.g. \`name\` or \`message\`).
2. In the template, use interpolation \`{{ propertyName }}\` to show that value.
3. Optionally add a simple event binding (e.g. \`(click)="method()"\`) or property binding (e.g. \`[disabled]="flag"\`) to show you understand the syntax.

### Example pattern:

\`\`\`ts
// Class
name = 'World';
// Template
<p>Hello, {{ name }}!</p>
<button (click)="name = 'Angular'">Change</button>
\`\`\`

*Note: Focus on correct \`{{ }}\` and at least one binding.*`,
  initialCode: `// Write your Angular code here`
}
export const aj3: Test = {
  id: 'aj-3',
  name: 'Angular 3: ngFor',
  category: 'Angular',
  difficulty: 'easy',
  description: `# Junior Angular Test 3

**Goal:** Render a list of items from an array using \`*ngFor\`.

### Requirements:
1. In the component class, define an array of objects (e.g. \`items = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }]\`).
2. In the template, use \`*ngFor\` to loop over the array and render each item (e.g. in \`<li>\` or \`<p>\`).
3. Use a unique \`trackBy\` or ensure each item has a unique identifier to avoid key issues (optional but good practice).

### Example pattern:

\`\`\`ts
items = [{ id: 1, name: 'Apple' }, { id: 2, name: 'Banana' }];
\`\`\`

\`\`\`html
<ul>
  <li *ngFor="let item of items">{{ item.name }}</li>
</ul>
\`\`\`

*Note: Write the component array and the template with \`*ngFor\`.*`,
  initialCode: `// Write your Angular code here`
}

export const as4: Test = {
  id: 'as-4',
  name: 'Angular 4: Unit Testing (Component)',
  category: 'Angular',
  difficulty: 'advanced',
  description: `# Senior Angular Test 4

**Goal:** Write a test for an Angular component that depends on a service, using \`TestBed\` and a mocked dependency.

### Requirements:
1. Use \`TestBed.configureTestingModule\` and \`TestBed.createComponent\` to create the component under test.
2. Provide a mock (or stub) for the service injected by the component (e.g. \`{ provide: MyService, useValue: mockService }\`).
3. Trigger the behavior that calls the service (e.g. \`fixture.detectChanges()\` or a user action).
4. Verify a specific outcome in the DOM (e.g. \`expect(fixture.nativeElement.textContent).toContain('...')\`) or that the service method was called.

### Example pattern:

\`\`\`ts
const mockService = { getData: jasmine.createSpy('getData').and.returnValue(of({ title: 'Test' })) };
TestBed.configureTestingModule({
  declarations: [MyComponent],
  providers: [ { provide: MyService, useValue: mockService } ]
});
const fixture = TestBed.createComponent(MyComponent);
fixture.detectChanges();
expect(mockService.getData).toHaveBeenCalled();
expect(fixture.nativeElement.textContent).toContain('Test');
\`\`\`

*Note: You can use Jasmine or Jest syntax; focus on TestBed setup, mocking, and one DOM or spy assertion.*`,
  initialCode: `// Write your Angular test here`
}
export const am4: Test = {
  id: 'am-4',
  name: 'Angular 4: Component Communication',
  category: 'Angular',
  difficulty: 'medium',
  description: `# Middle Angular Test 4

**Goal:** Implement parent-child communication using \`@Input\` and \`@Output\` with an \`EventEmitter\`.

### Requirements:
1. Create a child component with at least one \`@Input()\` property (e.g. \`title\` or \`item\`).
2. Add at least one \`@Output()\` property of type \`EventEmitter<T>\` (e.g. \`itemSelected\` or \`closed\`).
3. In the child template, use the input and emit an event on a user action (e.g. button click).
4. Show how the parent would bind to the input and subscribe to the output: \`[input]="value"\` and \`(output)="handler($event)"\`.

### Example pattern:

\`\`\`ts
// Child
@Input() label: string;
@Output() clicked = new EventEmitter<void>();
// Template: <button (click)="clicked.emit()">{{ label }}</button>

// Parent template: <app-child [label]="'Submit'" (clicked)="onSubmit()"></app-child>
\`\`\`

*Note: Write the child component class (and optionally template) and a short parent usage example.*`,
  initialCode: `// Write your Angular code here`
}
export const aj4: Test = {
  id: 'aj-4',
  name: 'Angular 4: Basic Validation',
  category: 'Angular',
  difficulty: 'easy',
  description: `# Junior Angular Test 4

**Goal:** Add the \`required\` validator to a reactive form control and check the control's validity.

### Requirements:
1. Create at least one \`FormControl\` with \`Validators.required\` (and optionally an initial value like \`''\`).
2. In the template or in the class, show how you would display or read the control's validity (e.g. \`control.invalid\`, \`control.errors\`).
3. Optionally bind the control to an input with \`formControlName\` (if you use a \`FormGroup\`) or show \`control.valueChanges\` / \`control.statusChanges\`.

### Example pattern:

\`\`\`ts
import { FormControl, Validators } from '@angular/forms';

email = new FormControl('', Validators.required);
// email.valid / email.invalid / email.errors?.['required']
\`\`\`

\`\`\`html
<input [formControl]="email" />
<span *ngIf="email.invalid && email.touched">Required</span>
\`\`\`

*Note: Write the FormControl with \`Validators.required\` and one way to use its validity.*`,
  initialCode: `// Write your Angular code here`
}

export const reactSenior: Track = { id: 'react-senior', name: 'React Senior', tests: [rs1, rs2, rs3, jsAdvanced1, jsAdvanced2, tsAdvanced1, tsAdvanced2, cssAdvanced1, cssAdvanced2, rs4] }
export const reactMiddle: Track = { id: 'react-middle', name: 'React Middle', tests: [rm1, rm2, rm3, jsMiddle1, jsMiddle2, tsMiddle1, tsMiddle2, cssMiddle1, cssMiddle2, jsAdvanced1] }
export const reactJunior: Track = { id: 'react-junior', name: 'React Junior', tests: [rj1, rj2, rj3, jsEasy1, jsEasy2, tsEasy1, tsEasy2, cssEasy1, cssEasy2, rj4] }

export const angularSenior: Track = { id: 'angular-senior', name: 'Angular Senior', tests: [as1, as2, as3, jsAdvanced1, jsAdvanced2, tsAdvanced1, tsAdvanced2, cssAdvanced1, cssAdvanced2, as4] }
export const angularMiddle: Track = { id: 'angular-middle', name: 'Angular Middle', tests: [am1, am2, am3, jsMiddle1, jsMiddle2, tsMiddle1, tsMiddle2, cssMiddle1, cssMiddle2, am4] }
export const angularJunior: Track = { id: 'angular-junior', name: 'Angular Junior', tests: [aj1, aj2, aj3, jsEasy1, jsEasy2, tsEasy1, tsEasy2, cssEasy1, cssEasy2, aj4] }


export const tracks: Track[] = [
  reactSenior,
  reactMiddle,
  reactJunior,
  angularSenior,
  angularMiddle,
  angularJunior
]

export const categories: Category[] = [
  {
    name: 'React',
    tracks: [reactSenior, reactMiddle, reactJunior],
  },
  {
    name: 'Angular',
    tracks: [angularSenior, angularMiddle, angularJunior],
  },
]
// Maintain this for backward compat in components until migrated fully
export const tests: Test[] = [...reactSenior.tests, ...reactMiddle.tests, ...reactJunior.tests, ...angularSenior.tests, ...angularMiddle.tests, ...angularJunior.tests]
