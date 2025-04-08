const { By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

const seleniumUtils = {
    async takeScreenshot(driver, fileName) {
        const screenshotsDir = path.join(__dirname, 'screenshots');

        // Create directory if it doesn't exist
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir);
        }

        const filePath = path.join(screenshotsDir, fileName);
        const screenshot = await driver.takeScreenshot();
        fs.writeFileSync(filePath, screenshot, 'base64');
        return filePath;
    },

    async waitForElement(driver, locator, timeout = 10000) {
        await driver.wait(until.elementLocated(locator), timeout);
        const element = await driver.findElement(locator);
        await driver.wait(until.elementIsVisible(element), timeout);
        return element;
    },

    async fillFormField(driver, locator, text) {
        const element = await this.waitForElement(driver, locator);
        await element.clear();
        await element.sendKeys(text);
    },

    async clickElement(driver, locator) {
        const element = await this.waitForElement(driver, locator);
        await driver.wait(until.elementIsEnabled(element), 5000);
        await element.click();
    },

    async getElementText(driver, locator) {
        const element = await this.waitForElement(driver, locator);
        return await element.getText();
    },

    async elementExists(driver, locator) {
        try {
            await driver.findElement(locator);
            return true;
        } catch (error) {
            return false;
        }
    }
};

module.exports = seleniumUtils; 