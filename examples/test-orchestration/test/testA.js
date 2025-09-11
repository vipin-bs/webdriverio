describe('Test File A', () => {
    it('should run test A1', async () => {
        await browser.url('https://webdriver.io');
        await expect(browser).toHaveTitle('WebdriverIO · Next-gen browser and mobile automation test framework for Node.js | WebdriverIO');
    });
    
    it('should run test A2', async () => {
        await browser.url('https://webdriver.io/docs/api');
        await expect(browser).toHaveUrlContaining('/docs/api');
    });
});
