import "babel-polyfill";

const { setDefaultOptions } = require("expect-puppeteer");
const puppeteer = require("puppeteer");
const { port } = require("../jest-puppeteer.config").server;

setDefaultOptions({ timeout: 1000 });

const siteRoot = `http://localhost:${port}`;

describe("Homepage", () => {
  let browser = "";
  let page = "";

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();

    page.emulate({
      viewport: {
        width: 500,
        height: 500
      },
      userAgent: ""
    });

    await page.goto(`${siteRoot}/`);
  });

  it("Should display the title", async () => {
    expect.assertions(1);
    await expect(page).toMatch("WEB DEVELOPER.");
  });

  afterAll(async () => {
    await browser.close();
  });
});
