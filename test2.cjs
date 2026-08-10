
async function test() {
  const response = await fetch('https://my-all-classes.pages.dev/api/data');
  const txt = await response.text();
  console.log(txt.substring(0, 500));
}
test().catch(console.error);

