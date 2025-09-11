describe('Test File C', () => {
    it('should run test C1', async () => {
        await browser.url('https://webdriver.io/docs/browserstack-service');
        await expect(browser).toHaveUrlContaining('/docs/browserstack-service');
    });
    
    it('should run test C2', async () => {
        await browser.url('https://webdriver.io/docs/organizingsuites');
        await expect(browser).toHaveUrlContaining('/docs/organizingsuites');
    });
});
