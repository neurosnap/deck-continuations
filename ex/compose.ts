import { shift, evaluate, Computation, Continuation } from "./deps.ts";

type ShiftProp<T = unknown> = (
  res: Continuation<T>,
  rej?: Continuation<Error>
) => Computation;

function* add(
  lhs: ShiftProp<number>,
  rhs: ShiftProp<number>
): Computation<number> {
  const left = yield* shift(lhs);
  const right = yield* shift(rhs);
  return left + right;
}

const sync = (value: number) =>
  function* (k: Continuation<number>) {
    return k(value);
  };

const ev = evaluate(function* () {
  const first = yield* add(sync(13), function* (k) {
    return Promise.resolve(55).then(k);
  });

  const second = yield* add(
    function* (k) {
      setTimeout(() => k(21), 1000);
    },
    function* (k) {
      k(Math.random());
    }
  );

  const result = yield* add(sync(first), sync(second));
  return result;
});

console.log(ev);
