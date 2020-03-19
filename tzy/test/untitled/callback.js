function func2() {
  // Mimic async function
  return new Promise(resolve => {
    setTimeout(() => {
      resolve("Hello World!");
    }, 1000);
  });
}

func2().then(results => {
  console.log(results);
});