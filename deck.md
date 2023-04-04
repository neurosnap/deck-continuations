---
paginate: true
---

# Delimited continuations are all you need

![bg right contain](./img/qrcode.png)

<!--
Hello, everyone!

I hope you all have your thinking caps on because this is going require your full attention.

In this presentation I'm going to show you a brand new paradigm for handling
async flow control in your code.

So buckle up, because we have a lot of ground to cover, and it's going to be a wild ride.
-->

---

Flow **control** is how imperative programs make a choice about what code is to
be run.[^1]

<!--
Let's start by asking a simple question.

What is flow control?

Flow **control** is how imperative programs make a choice about what code is to
be run.

I want to emphasize that control doesn't just mean the visual design of the source
code ... but also how much control **you** the end-developer has over the tools you
can leverage.

This is a subtle but important distinction that will be demonstrated throughout
this presentation.
-->

---

Async flow control is the same definition but using asynchronous constructs.

<!--
Let's continue.

What is async flow control?

Pause for effect. Count to 5.

Async flow control is the same definition but using asynchronous constructs.

I hope you are now recalling all the async constructs you know about.

I'll give you a second to think about them in your head.

Pause for effect. Count to 5.
-->

---

There a lot of familiar paradigms we can employ in Typescript:

- callbacks
- promises
- generators
- observables
- `async`/`await`

<!--
I'm sure at some point in time we've employed all of these constructs to
express async flow control ... with varying degress of success.

However, some are considered by the dev community better than others.

Can you rank-order these async constructs in your head from worst-to-best?

Pause for effect. Count to 5.

Callbacks are regarded as less-than-ideal.  We've all heard the term "callback
hell" and do everything we can to avoid falling into the trap of callbacks
within callbacks within callbacks.
-->

---

# Why are callbacks within callbacks a bad paradigm?

![bg right:66% contain](./img/callback-hell.jpg)

<!--
Why are callbacks within callbacks a bad paradigm?

Pause for effect. Count to 5.

What about the image on the right is less-than-ideal?

Pause for effect. Count to 5.

The zen of python dictates that "flat is better than nested" ... but why?

When thinking about the visual design of code, there are a couple of features
we care about:

- Readability
- Maintainability
- The likelyhood of missing an error

These are mission critical features of our code that require our thoughtful
consideration.  It is **imperative** that we are able to understand the code that
we are writing ... and possibly more importantly, reading.

Can you think of any other features we should care about?

Pause for effect. Count to 5.
-->

---

You'll read countless articles about how great `async`/`await` is and everyone
should use it.

However, can we think of any downsides to using `async`/`await`?

<!--
You'll read countless articles about how great `async`/`await` is and everyone
should use it.

You probably ranked `async`/`await` pretty high on your list, didn't you?

Pause for effect. Count to 5.

However, can we think of any downsides to using `async`/`await`?

Pause for effect. Count to 5.
-->

---

# Downsides of `async`/`await`

- Everything is a promise
- Everything is now async
- The browser controls the flow of execution for `async`/`await`
- Unhandled promise rejections are pernicious

<!--
Here's a list of downsides I could think of quickly.

Pause for effect. Count to 5.

You're probably thinking: wait, I don't understand, some of these "downsides"
are things that have never negatively impacted me.

Trust your intuition.
-->

---

What if I told you there was a better way to express `async` flow control?

<!--
But what if I told you there was a better way to express `async` flow control?

Would you believe me?

Pause for effect. Count to 5.

But first, a detour.
-->

---

# Detour: What color is your function?[^2]

---

Did you know functions have a color?

- `function() {}` -> blue
- `async function() {}` -> red
- `function*() {}` -> green
- `async function*() {}` -> yellow

<!--
Did you know functions have a color?

Huh?! Excuse me?

Pause for effect. Count to 3.

Yes!  Not all functions are created equal.  They are not always interchangable.

Functions behave differently depending on their **color**.
-->

---

- `function() {}` -> `blue`
- `async function() {}` -> `red`

There's no problem with `blue` functions calling other `blue` functions: you'll
get a return value synchronously.

There's also no problem with `red` functions calling `blue` functions: you'll
still get a promise that you can `await`.

However, what happens when you call a `red` function inside a `blue` one?

<!--
There's no problem with `blue` functions calling other `blue` functions: you'll
get a return value synchronously.

There's also no problem with `red` functions calling `blue` functions: you'll
still get a promise that you can `await`.

However, what happens when you call a `red` function inside a `blue` one?

Pause for effect. Count to 3.

What I'm really trying to demonstrate here is kind of subtle ...
which is async/await **forces** our entire flow control to be async by default.

You **must** always await the result of a `red` function.

Don't worry, this is all leading to delimited continuations and why they are so interesting.
-->

---

It's easy enough to just make every function `red` and then you `await` it
inside the initial script:

```ts
async function init() {
  // do some flow control
}

init().then(console.log).catch(console.error);
```

<!--
It's easy enough to just make every function `red` and then you `await`
it inside the initial script ... right?

So, what's the problem?
-->

---

That's all fine and good but it has real implications to how the code functions.

You are now living in the world where everything is a **promise**.

<!--
That's all fine and good but it has real implications to how the code functions.

You are now living in the world where everything is a **promise**.

Pause for effect.

Ahhh, this is interesting.

I want you to think about everything being a promise and with it all the pros and cons.

Why would everything being a promise, be an issue?
-->

---

Promises are great, right?

Questions to think about:

- How do I compose promises to express flow control? (e.g. parallel, race, etc.)
- How do I handle promise errors?
- What happens if I forget to `.catch()` every promise?
- How can I cancel a promise?

Finally, the JS engine resolves a promise via a **microtask**.

<!--
Promises are great, right?

Yes, they are! I use promises all the time, but there are a lot of questions to
ask yourself when using them.

Pause for effect. Count to 5.

Finally, the JS engine resolves a promise via a **microtask**.

Oh this is interesting.

We've found a rabbit hole ... but here are some questions to ask yourself:

- What is a microtask?
- Why do I care that a Promise is a microtask?
- What does that mean for the flow control of my code?

I'm not going to answer these questions today, but rather ask you all to
investigate further.

Instead I'll just list some examples of micro- and macro-tasks
-->

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

<!--
Here's the list.

Pause for effect. Count to 5.
-->

---

# What are delimited continuations (DC)?

- It's all about flow control
  - Doesn't matter if it's sync or async, DCs look the same
  - DC is the abstraction upon which all flow control paradigms can be built
- **continuation:** The rest of code execution **reified (A)** inside a function
- **delimited:** The **reified (A)** function can return a value -- which allows
  for composition
- Two primitives -- `shift()` and `reset()` -- are all you need for complex
  async flow control

<!--
Finally!  We made it!

So what are delimited continuations?

I'm going to try to explain delimited continuations and fail.

This is something that I'm still struggling to grok as someone who is actively
using them.  I don't have all the answers and I'm **not** the expert.

But that's okay, this presentation is designed to be an introduction and prompt you
all to learn more.

Before we go any further, I must make a detour.
-->

---

# Detour: Yield delegates

Typescript has basic support for generators but not for the type of constructs
we are building.[^4]

```ts
function* fun() {
  return number;
}

function* raw() {
  const value = yield fun(); // value = any
}
```

<!--
Typescript has basic support for generators but not for the type of constructs
we are building.

This ... is a big problem.  If we can't leverage typescript to resolve types
properly we lose a ton of value in using delimited continuations as the
foundation for async flow control.

However, there's a hack and it's called yield delegates.
-->

---

Yield delegates `yield *` provide a way to reach into the generator and have it
output the proper type.

```ts
function* fun() {
  return number;
}

function* typed() {
  const value = yield* fun(); // value = number
}
```

Now we can use some clever tricks to get the proper types out of our `yield`
statements.

<!--
Yield delegates (the `yield *` syntax) provides a way to reach into the generator and have it output the proper type for us.

It's a hack to be sure, but it works very well for our use-case.
-->

---

# Code examples

Using `continuation`[^5]

<!--
Finally, you might be thinking, some code!

This is where things get weird.

Continuation is a library built by the team at frontside where most of the
experimentation is happening.
-->

---

## Sync example

The first example I would like to show is one of simple string concatenation.

---

The entire flow of the `evaluate()` function is synchronous in this example and
as such we can use it like a normal sync function.

```ts
import { Computation, shift, evaluate } from './deps.ts';

function slot<T>(): Computation<T> {
  return shift<T>(function* (k) {
    return k;
  });
}

function dc() {
  return evaluate<(s: string) => (s: string) => string>(function* () {
    const greeting = yield* slot<string>();
    const thing = yield* slot<string>();
    return `${greeting}, ${thing}!`;
  });
}

const tmpl = dc();
const result = tmpl('hello')('world');
console.log(result); // hello, world!
```

<!--
As you can see at the bottom, we are doing nothing fancy.  We are simply
combining two strings together using a template function.

You'll see references to `k` a lot in these examples.  That is the continuation
function.  When called, it continues the yield from the shift onto the next
yield statement.  It is the continuation mechanism.  Think of is like a
callback.
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

![bg contain](./img/calc.png)

<!--
Are we having fun yet?

Laugh manically.
-->

---

```ts
function dc() {
  return (left: string) => {
    return (right: string) => {
      return `${left}, ${right}!`;
    };
  };
}

const tmpl = dc();
const result = tmpl('hello')('world');
console.log(result); // hello, world!
```

<!--
Let's take a step back for a second.  How could we implement something similar
using plain `blue` functions?

We have a function return a function return a function.

This is a variant of callback hell, it's not ideal, but it works for the example we
demonstrated previously.
-->

---

Continuation-passing style[^6]

```ts
function cps(cont: (s: string) => void) {
  return (left: string) => {
    return (right: string) => {
      cont(`${left}, ${right}!`);
    };
  };
}

const tmpl = cps((result) => {
  console.log(result); // hello, world!
});
tmpl('hello')('world');
```

<!--
Let's try this again but using a coninuation-passing style `blue` function.

Here we receive the templated string as a callback to our `cps` function.

This is also a variant of callback hell.  Not great and in this example
unnecessary.

But, you can imagine when you start adding `red` functions here that it will
eventually become necessary.

Let's continue.
-->

---

## Async example

In the next example, I would like to show how we can incorporate async flow
control.

```ts
import { evaluate, shift } from './deps.ts';

const run = evaluate<(n: number) => Promise<number>>(function* () {
  const left = yield* shift(function* (k) {
    return k;
  });

  const right = yield* shift(function* (resolve) {
    return Promise.resolve(55).then(resolve);
  });

  return left + right;
});

const result = await run(13);
console.log(result); // 68
```

<!--
Back to delimited continuations.  Except this time, we are going to mix some
`red` functions into our flow control.
-->

---

### key points

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

## Composition example

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

<!--
Using deliminited continuations, we can compose `shift()` to do some complex
flow control.

I'd love to focus on this example, however, for the sake of preventing our
collective **minds** from exploding, I'll spare us the details and briefly
summarize.

- Here we are adding a bunch of numbers together
- Some numbers are resolved syncronously and some are async
- The key idea I want to illustrate is that composition using `shift()` is not
  only possible but relatively flat and easy to do

Please feel free to grab the github repo for this slide deck and run this
example at your leisure.
-->

---

# Counter example

```ts
interface Count {
  value: number;
  increment(): Count;
}

function useCounter() {
  return reset<Count>(function* () {
    for (let i = 0; ; i++) {
      yield* shift<void>(function* (k) {
        return { value: i, increment: k };
      });
    }
  });
}

let start = evaluate<Count>(useCounter);

let once = start.increment();
let twice = once.increment();
let thrice = twice.increment();

console.dir([once.value, twice.value, thrice.value]); // [1, 2, 3]
```

<!--
Finally, I want to demonstrate computation in a bottle which is what `reset()`
is all about.

Here we are using `reset()` to make the counter reusable.

Now we can call `useCounter` as many times as we want in order to create new
instances of our counter.

```ts
evaluate(function*() {
  let x = yield* useCounter();
  let y = yield* useCounter();
});
```

I'm going to stop there.  There is so much more to learn about this paradigm
but unfortunately we have to move on.
-->

---

![bg left](./img/db_vader.jpg)

# wat

---

![bg left](./img/arrow.jpg)

# wat

---

I'm still very confused by the coding paradigm. Everytime I look at this code I
get a headache.

Most end-developers aren't going to be using delimited continuations directly.

Rather, this tool will allow library developers to build on top of it.

---

## effection v3[^7]

`effection` takes `continuation` and builds a task tree. All tasks are cleaned
up automatically via a set of cancellation strategies:

- tasks spawn other tasks
- tasks can be `halt()`ed
  - All descendants are `halt()`ed
  - All ancestors are `halt()`ed

<!--
It's time to go higher level.
-->

---

`effection` also has higher level compositions of `shift()` and `reset()` which
grants us a flourish of functionality. For example:

- `suspend()`: permenantly suspend a generator function at a `yield` point.
- `action()`: which is a wrapper for `shift()` with proper cleanup of the task
- `spawn()`: creates a sub-task
- `createChannel()`: kind of like an event emitter but using DC
- `sleep(n)`: temporarily suspend generator function for for (n) milliseconds

---

![bg left](./img/confused.jpg)

# I still don't get it

<!--
I know what you're thinking.

This is a lot to handle.

I'd like to take a second for us all to take a deep breathe because we aren't
done yet.

Pause for effect. Count to 5.

Ok, here we go
-->

---

Building on top of `effection` we now have a set of middle-level primitives that
allow us to build any flow control paradigm we want.

<!--
Building on top of `effection` we now have a set of middle-level primitives that
allow us to build any flow control paradigm we want.

Using suspend, action, spawn, createChannel, and sleep we have everything we
need to express all forms of async flow control.  This is the one paradigm to
rule all paradigms.

I know it probably hasn't clicked yet, and I'm probably not doing the best job
explaining its full potential.

But give it time, stay engaged, join the discord where we are actively
developing this technology.
-->

---

Jake Archibald recently wrote an interesting article about unhandled
rejections.[^8]

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

<!--
Here is a function that fetches all book chapters in parallel but processes
them in sequence using `for await ... of`.

Pretty cool.

Pause for effect. Count to 5.
-->

---

He goes on to describe the the potential for bugs because of
`unhandled rejections`. Below is the "final" solution.

```diff
async function showChapters(chapterURLs) {
  const chapterPromises = chapterURLs.map(async (url) => {
    const response = await fetch(url);
    return response.json();
  });

+ for (const promise of chapterPromises) promise.catch(() => {});

  for await (const chapterData of chapterPromises) {
    appendChapter(chapterData);
  }
}
```

<!--
The key point I want to make here is the end-user needs to be thoughtful about
the promises they activate while at the same time leveraging the JS engine to
handle async flow control for them.

This is tough because there are no signals -- not even in typescript -- that
aid you in detecting unhandle promise rejections.

Ouch.
-->

---

# `starfx`[^9]

![bg right:66%](./img/starfx.png)

<!--
Let's go higher level.

`starfx` builds off of effection in order to be used inside the browser.

It is an experimental library that could eventually supersede redux-saga as
well as react-query and more.
-->

---

Using `starfx`[^9] we could do something like this:

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

<!--
Here we use a couple APIs from `starfx` to do the same thing but with a bunch
of safety mechanisms built in.

`request` is a wrapper around `fetch` that will automatically abort when a task
is `halt()`ed.

`parallel` is a function to call all functions it receives at the same time and
returns a channel that the user can loop over in sequence -- or even as they become
available.  It's dealers choice.

Further, `parallel` will never throw, it automatically catches errors, and returns
a `Result` for each request.

`Result` is inspired by rust's `Result` type which is highly regarded.

To be clear, this is a proposed API, we are stilling working on the initial
implementation.
-->

---

No uncaught exceptions, code is just as simple to understand.

Further, we automatically pass an `AbortController.signal` to all http requests
because of the `request` fx we wrote.

When a task is `halt()`ed or crashes, we trigger the signal to abort the `fetch`
call.

Automatic cleanup!

<!--
So what do we have?

Read slide.

We are not restricted to the async flow control `Promise` and `async`/`await` provides.

We are able to create as many different flow control structures as we want, all leveraging delimited continuations.
-->

---

# We are just getting started

![bg right](./img/tree.png)

Things we plan on building:

- Inspector / debugger for `effection`
- Side-effect system for `redux` (ala `redux-saga`)
- Query and cache management (ala `react-query`)
- Web server (ala `express`)
- View library (ala `react`)

<!--
We are just getting started.

This is an area of active development and a foundation on which we can build
any async flow control constructs.

I don't know if it has clicked for anyone else, but it has pretty much consumed
all my free time and energy.
-->

---

![bg](./img/yellow-to-lavender.svg)

![aptible logo](./img/aptible.svg) [^10]

The most successful PaaS you didn't know existed.

https://aptible.com

<!--
I wanted to give a quick shout out to Aptible, the most successful PaaS you
didn't know existed.

I've been working there for 4+ years.

Please feel free to contact me or aptible if you are interested in learning
more.
-->

---

# The Frontside[^11]

https://frontside.com

https://discord.gg/frontside

<!--
Also a shout out to the team at Frontside who created most of the paradigms and
libraries I've been talking about today.
-->

---

# fin

[^1]: https://blog.container-solutions.com/is-it-imperative-to-be-declarative
[^2]: https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function
[^3]: https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules
[^4]: https://github.com/microsoft/TypeScript/issues/32523
[^5]: https://github.com/thefrontside/continuation
[^6]: https://en.wikipedia.org/wiki/Continuation-passing_style
[^7]: https://github.com/thefrontside/effection
[^8]: https://jakearchibald.com/2023/unhandled-rejections/
[^9]: https://github.com/neurosnap/starfx
[^10]: https://aptible.com
[^11]: https://frontside.com
