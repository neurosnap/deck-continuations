import { reset, shift, evaluate } from "./deps.ts";

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

const start = evaluate<Count>(useCounter);

const once = start.increment();
const twice = once.increment();
const thrice = twice.increment();

console.dir([once.value, twice.value, thrice.value]); // [1, 2, 3]
