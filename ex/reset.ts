import { evaluate, reset } from "https://deno.land/x/continuation@0.1.5/mod.ts";
import {
  createEventStream,
  Result,
  sleep,
} from "https://deno.land/x/effection/mod.ts";

function init() {
  let results = createEventStream<void, Result<void>>();
  const children = new Set();

  function* run(op: any) {
    children.add(op);
    yield* reset(function* () {
      yield* results;
      console.log("cleanup");
    });
    return child;
  }

  return run;
}
