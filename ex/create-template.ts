import { Computation, shift, evaluate } from "./deps.ts";

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
const result = tmpl("hello")("world");
console.log(result);
