import { evaluate } from "./deps.ts";

function* fun() {
  return 1;
}

function* raw(): Generator {
  const val = yield fun();
  return val;
}

function* typed() {
  const val = yield* fun();
  return val;
}

console.log(evaluate(typed));
