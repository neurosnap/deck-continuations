---
paginate: true
---

# Delimited continuations are all you need

---

Flow control is how imperative programs make a choice about what code is to be
run.[^1]

---

Async flow control is the same concept but using asynchronous constructs.

---

There a lot of familiar paradigms we can employ in Typescript:

- callbacks
- promises
- generators
- observables
- `try`/`catch`/`finally`
- `async`/`await`

---

You'll read countless articles about how great `async`/`await` is and everyone
should use it.

What if I told you there was a better way to express `async` flow control?

---

# What color is your function?[^2]

---

Did you know functions have a color?

- `function() {}` -> blue
- `async function() {}` -> red
- `function*() {}` -> green
- `async function*() {}` -> yellow

---

There's no problem with `blue` functions calling other `blue` functions: you'll
get a return value synchronously.

However, what happens when you call a `red` function inside a `blue` one?

---

It's easy enough to just make every function `red` and then you just `.then()`
it inside the initial script:

```ts
async function init() {
  // do some flow control
}

init().then(console.log).catch(console.error);
```

---

That's all fine and good but it has real implications to how the code functions.

You are now living in the world where everything is a **promise**.

---

Promises are great, right? Yes, but they always create a **microtask**, which
has implications that we need to consider. You also need to be careful to handle
all promises properly:

- How can I cancel a promise?
- How do I handle promise errors?
- How do I compose promises?

---

- macrotasks:
  - `setTimeout`
  - `setInterval`
  - `setImmediate`
  - `requestAnimationFrame`
  - UI rendering
- microtasks:
  - `Promise`
  - `process.nextTick`
  - `queueMicrotask`
  - `MutationObserver`

Read more about microtasks.[^3]

---

# What are delimited continuations (DC)?

- It's all about flow control
  - Doesn't matter if it's synch or async, DCs look the same
  - DC is the abstraction upon which all flow control paradigms can be built
- **continuation:** The rest of code execution **reified (A)** inside a function
- **delimited:** The **reified (A)** function can return a value -- which allows
  for composition
- Two primitives -- `shift()` and `reset()` -- are all you need for complex
  async flow control

---

# Yield delegates

Typescript has basic support for generators but not for the type of constructs
we are building.[^4]

```ts
function* fun() {
  return number;
}

function*() {
  const value = yield fun(); // value = any
}
```

---

Yield delegates `yield *` provide a way to reach into the generator and have it
output the proper type.

```ts
function* fun() {
  return number;
}

function* () {
  const value = yield* fun(); // value = number
}
```

Now we can use some clever tricks to get the proper types out of our `yield`
statements.

---

# Demo

Using `continuation`[^5]

---

## sync example

The first example I would like to show is a simple string concatenation example.

---

The entire flow of the `evaluate()` function is synchronous in this example and
as such we can use it like a normal sync function.

```ts
const { evaluate, shift } = require('@frontside/continuation');

const createTemplate = () =>
  evaluate(function* () {
    let greeting = yield* shift(function* (k) {
      return k;
    });

    let thing = yield* shift(function* (k) {
      return k;
    });

    return `${greeting}, ${thing}!`;
  });

let say = createTemplate();
say('Hello')('World'); // Hello, World!
```

<!--
### key points

- `k` is the continuation "callback"
- When you return `k` from a shift, the evaluate function returns that `k`
  function as its value
- Inside the evaluate function `greeting` and `thing` are the values passed into
  it from outside the `evaluate` body function
  - `shift()` can be thought of as slots that eventually get filled by values
    passed into `evaluate()`!
-->

---

### key points

- `k` is the continuation "callback"
- When you return `k` from a shift, the evaluate function returns that `k`
  function as its value
- Inside the evaluate function `greeting` and `thing` are the values passed into
  it from outside the `evaluate` body function
  - `shift()` can be thought of as slots that eventually get filled by values
    passed into `evaluate()`!

---

## async example

In the next example, I would like to show how we can incorporate async flow
control.

```ts
const { evaluate, shift } = require('@frontside/continuation');

const run = evaluate(function* () {
  let left = yield* shift(function* (k) {
    return k;
  });

  let right = yield* shift(function* (resolve) {
    return Promise.resolve(55).then(resolve);
  });

  return left + right;
});

const result = await run(13);
console.log(result); // 68
```

<!--
### Key points

- It doesn't matter if it's sync or async, delimited continuations can handle
  that flow control
- The `right` shift returns a promise which is what gets returned when calling
  `run(13)`
- Since the return value is a promise, we `await` the answer
- I renamed the `shift` `k` variable to `resolve` to demonstrate how similar it
  is to a promise "continuation."
- When you use a promise, it will always be async
  - When you use a delimited continuation, it might be async
- It doesn't matter if the flow of code execution is sync or async, delimited
  continuations handle them the exact same
-->

---

### Key points

- It doesn't matter if it's sync or async, delimited continuations can handle
  that flow control
- The `right` shift returns a promise which is what gets returned when calling
  `run(13)`
- Since the return value is a promise, we `await` the answer
- I renamed the `shift` `k` variable to `resolve` to demonstrate how similar it
  is to a promise "continuation."
- When you use a promise, it will always be async
  - When you use a delimited continuation, it might be async
- It doesn't matter if the flow of code execution is sync or async, delimited
  continuations handle them the exact same

---

## composition example

```ts
function* add(lhs, rhs) {
  let left = yield* shift(lhs);
  let right = yield* shift(rhs);
  return left + right;
}

const sync = function* (k) {
  k(value);
};

evaluate(function* () {
  let first = yield* add(sync(13), function* (k) {
    Promise.resolve(55).then(k);
  });

  let second = yield* add(
    function* (k) {
      setTimeout(() => k(21), 1000);
    },
    function* (k) {
      k(Math.random());
    },
  );

  let result = yield* add(sync(first), sync(second));

  return result;
});
```

---

TODO: demonstrate `reset()` with an event stream?

---

These examples could easily be implemented with `async`/`await`, but the
implications of the flow control primitives created by deliminited continuations
have a huge impact when we continue to build on this foundation.

---

# This is confusing

I'm still very confused by the coding paradigm. Everytime I look at this code I
get a headache.

Most end-developers aren't going to be using delimited continuations directly.
Rather, this tool will allow library developers to build on top of it.

---

## effection v3[^6]

`effection` takes `continuation` and builds a task tree. All tasks are cleaned
up automatically via a set of cancellation strategies:

- tasks spawn other tasks
- tasks can be `halt()`ed
  - All descendants are `halt()`ed
  - All ancestors are `halt()`ed

<!--
`effection` also has higher level compositions of `shift()` and `reset()` which
grants us a flourish of functionality:

- `suspend()`: permenantly suspend a generator function at a `yield` point.
- `action()`: `shift()` with proper task cleanup of the task
- `spawn()`: create a sub-task
- `createChannel()`: an event emitter using DC
- `sleep(n)`: sleep for n ms
-->

---

# I still don't get it

---

Building on top of `effection` we now have a set of middle-level primitives that
allow us to build any flow control paradigm we want.

---

Jake Archibald recently wrote an interesting article about unhandle
rejections.[^7]

In it he talks about the use case of wanting to fetch book chapters in parallel
but process them in sequence:

```ts
async function showChapters(chapterURLs) {
  const chapterPromises = chapterURLs.map(async (url) => {
    const response = await fetch(url);
    return response.json();
  });

  for await (const chapterData of chapterPromises) {
    appendChapter(chapterData);
  }
}
```

---

He goes on to describe the the potential for bugs because of
`unhandled rejections`. Below is the "final" solution.

```ts
async function showChapters(chapterURLs) {
  const chapterPromises = chapterURLs.map(async (url) => {
    const response = await fetch(url);
    return response.json();
  });

  for (const promise of chapterPromises) promise.catch(() => {});

  for await (const chapterData of chapterPromises) {
    appendChapter(chapterData);
  }
}
```

---

Using `starfx`[^8] we could do something like this:

```ts
import { request, json, call, parallel, forEach } from 'starfx';

function* showChapters(chapterURLs) {
  const reqs = chapterURLs.map(function (url) {
    return function* () {
      const response = yield* request(url);
      return yield* json(response);
    };
  });

  const chapters = yield* parallel(reqs);

  yield* forEach(chapters.sequence, function* () {
    const result = yield* chapter;
    if (result.ok) {
      appendChapter(result.error);
    } else {
      console.error(result.error);
    }
  });
}
```

---

No uncaught exceptions, code is just as simple to understand.

Further, we automatically pass an `AbortController.signal` to all http requests
because of the `request` fx we wrote.

When a task is `halt()`ed or crashes, we trigger the signal.

Automatic cleanup!

<!--
We are not restricted to the async flow control `Promise` provides, we are able
to create as many different flow control structures as we want, all leveraging
deliminited continuations.
-->

---

# We are just getting started

---

# Aptible[^9]

The most successful PaaS you didn't know existed.

https://aptible.com

---

# The Frontside[^10]

https://frontside.com

---

fin

[^1]: https://blog.container-solutions.com/is-it-imperative-to-be-declarative
[^2]: https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function
[^3]: https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules
[^4]: https://github.com/microsoft/TypeScript/issues/32523
[^5]: https://github.com/thefrontside/continuation
[^6]: https://github.com/thefrontside/effection
[^7]: https://jakearchibald.com/2023/unhandled-rejections/
[^8]: https://github.com/neurosnap/starfx
[^9]: https://aptible.com
[^10]: https://frontside.com
