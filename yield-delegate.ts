import { evaluate } from "https://deno.land/x/continuation/mod.ts";

function* fun() {
  return 1;
}

function* run() {
  const val = yield* fun();
  return val;
}

console.log(evaluate(run));
