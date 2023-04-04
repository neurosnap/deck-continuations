function plan() {
  const left = "hello";
  const right = "world";
  return `${left}, ${right}!`;
}

function dc() {
  // reify the continuation of this function in a function
  return (left: string) => {
    // reify the continuation of this function in a function
    return (right: string) => {
      // return the result
      return `${left}, ${right}!`;
    };
  };
}

const tmpl = dc();
const result = tmpl("hello")("world");
console.log(result);

function cps(cont: (s: string) => void) {
  return (left: string) => {
    return (right: string) => {
      cont(`${left}, ${right}!`);
    };
  };
}

const tmplCps = cps((result) => {
  console.log(result);
});
tmplCps('hello')('world');
