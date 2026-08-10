
async function test() {
  const response = await fetch('https://my-all-classes.pages.dev/api/data');
  const txt = await response.text();
  const idx = txt.indexOf('sessions');
  console.log(txt.substring(idx, idx + 1000));
}
test().catch(console.error);

