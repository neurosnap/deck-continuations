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

function* async<T>(): Computation<{
  resolve: (r: T) => void;
  reject: (e: Error) => void;
}> {
  return yield* shift(function* (k) {
    const promise = new Promise((resolve, reject) => {
      k({ resolve, reject });
    });

    return promise;
  });
}

const ev = evaluate<Promise<number>>(function* () {
  const { resolve } = yield* async();

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
  resolve(result);
});

const result = await ev;
console.log(result);
