
async function test() {
  const response = await fetch('https://my-all-classes.pages.dev/api/data');
  const { sessions } = await response.json();
  sessions.forEach(s => {
    if (s.starttime && s.starttime.includes('2026-08-03')) {
      console.log(s.starttime);
    }
  });
}
test().catch(console.error);

