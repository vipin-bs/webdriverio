describe('Test File B', () => {
    it('should run test B1', async () => {
        await browser.url('https://webdriver.io/docs/gettingstarted');
        await expect(browser).toHaveUrlContaining('/docs/gettingstarted');
    });
    
    it('should run test B2', async () => {
        await browser.url('https://webdriver.io/docs/frameworks');
        await expect(browser).toHaveUrlContaining('/docs/frameworks');
    });
});
