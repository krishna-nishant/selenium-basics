# Portfolio Navigation with Selenium

This project uses Selenium WebDriver with JavaScript to navigate Krishna Nishant's portfolio website and capture key interactions.

## What it does

1. Navigates to Krishna's portfolio at [https://krishna-nishant.vercel.app/](https://krishna-nishant.vercel.app/)
2. Takes an immediate screenshot when the page begins loading
3. Takes a second screenshot once the homepage is fully loaded
4. Navigates to the projects section
5. Opens the first two project demos in new tabs and takes screenshots
6. Goes to the contact section and fills out the contact form

## Requirements

- Node.js
- Chrome browser
- ChromeDriver (installed via npm)

## Running the script

1. Make sure you have Node.js installed
2. Install dependencies:
   ```
   npm install
   ```
3. Run the portfolio navigation script:
   ```
   node portfolio-navigator.js
   ```

## Screenshots

The script will save all screenshots to the `screenshots` directory:
- `1-initial-load.png`: Initial page load
- `2-homepage-loaded.png`: After homepage fully loads
- `3-project-1.png`: First project demo
- `3-project-2.png`: Second project demo
- `4-contact-form-filled.png`: Contact form filled out

## Note

The script doesn't actually submit the contact form to avoid sending test data.

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```

## Running the Example

```
node example.js
```

## What You Can Do with Selenium

Selenium WebDriver enables you to automate browser interactions. Here are some common use cases:

1. **Web Scraping**: Extract data from websites
2. **Automated Testing**: Test web applications across different browsers
3. **Form Submission**: Automate filling and submitting forms
4. **Browser Automation**: Automate repetitive tasks in the browser
5. **Screenshots**: Capture screenshots of web pages
6. **UI Testing**: Test how your UI behaves under different conditions
7. **Cross-browser Testing**: Test your application in different browsers

## Basic Selenium Commands

- **Navigation**: `driver.get(url)`, `driver.navigate().back()`, `driver.navigate().forward()`
- **Finding Elements**: `driver.findElement(By.id('elementId'))`, `driver.findElement(By.css('.className'))`
- **Interacting with Elements**: `element.click()`, `element.sendKeys('text')`, `element.clear()`
- **Waiting**: `driver.wait(until.elementLocated(By.id('elementId')), timeout)`
- **Screenshots**: `driver.takeScreenshot()`
- **Browser Management**: `driver.manage().window().maximize()`, `driver.quit()`

## Additional Examples

You can extend the example.js file to:

1. Fill out forms
2. Click buttons and links
3. Handle alerts and pop-ups
4. Work with dropdowns and multi-select
5. Capture screenshots
6. Perform actions like drag and drop
7. Execute JavaScript in the browser

## Resources

- [Selenium Documentation](https://www.selenium.dev/documentation/)
- [Selenium WebDriver for JavaScript](https://www.selenium.dev/selenium/docs/api/javascript/index.html) 