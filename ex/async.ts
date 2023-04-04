import { evaluate, shift } from "./deps.ts";

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
