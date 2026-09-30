const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/apply');
  
  // Wait for the input to be visible
  await page.waitForSelector('input[name="firstName"]');
  
  // Type 'hello world'
  await page.type('input[name="firstName"]', 'hello world');
  
  // Get the value
  const firstNameValue = await page.$eval('input[name="firstName"]', el => el.value);
  console.log('firstName after typing "hello world":', firstNameValue);

  // Clear and type numbers
  await page.click('input[name="firstName"]', { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type('input[name="firstName"]', '1234abcd');
  const firstNameValue2 = await page.$eval('input[name="firstName"]', el => el.value);
  console.log('firstName after typing "1234abcd":', firstNameValue2);

  // Type contact number
  await page.type('input[name="phone"]', 'abc123def4567890');
  const phoneValue = await page.$eval('input[name="phone"]', el => el.value);
  console.log('phone after typing "abc123def4567890":', phoneValue);

  await browser.close();
})();
