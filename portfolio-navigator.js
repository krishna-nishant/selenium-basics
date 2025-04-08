const { Builder, By, Key, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

async function navigatePortfolio() {
  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  // Initialize WebDriver
  const driver = await new Builder().forBrowser('chrome').build();
  
  try {
    console.log('Starting portfolio navigation...');
    
    // Step 1: Navigate to portfolio website
    await driver.get('https://krishna-nishant.vercel.app/');
    console.log('Navigating to Krishna\'s portfolio website');
    
    // Take immediate screenshot (before full load)
    const screenshot1 = await driver.takeScreenshot();
    const screenshot1Path = path.join(screenshotsDir, '1-initial-load.png');
    fs.writeFileSync(screenshot1Path, screenshot1, 'base64');
    console.log('Screenshot 1 taken: Initial page load');
    
    // Wait for more elements to load
    await driver.sleep(2000);
    
    // Take second screenshot after short delay for rendering
    const screenshot2 = await driver.takeScreenshot();
    const screenshot2Path = path.join(screenshotsDir, '2-homepage-loaded.png');
    fs.writeFileSync(screenshot2Path, screenshot2, 'base64');
    console.log('Screenshot 2 taken: Homepage loaded');
    
    // Try to find and navigate to projects section
    try {
      console.log('Looking for projects section');
      
      // Try to find the Portfolio link in the navigation - case sensitive!
      const navLinks = await driver.findElements(By.css('nav a, a[href*="Portfolio"]'));
      
      let portfolioLink = null;
      for (const link of navLinks) {
        const text = await link.getText();
        if (text.includes('Portfolio')) {
          portfolioLink = link;
          console.log('Found Portfolio link in navigation');
          break;
        }
      }
      
      if (portfolioLink) {
        // Scroll to the element first to make sure it's in view
        await driver.executeScript("arguments[0].scrollIntoView(true);", portfolioLink);
        await driver.sleep(500);
        await portfolioLink.click();
        console.log('Clicked on Portfolio link');
      } else {
        // Try scrolling directly to the Portfolio section by ID
        console.log('No Portfolio link found, trying to scroll to Portfolio section');
        await driver.executeScript(`
          const element = document.getElementById('Portfolio');
          if (element) {
            element.scrollIntoView({behavior: 'smooth'});
            return true;
          }
          return false;
        `);
      }
      
      // Wait for the projects section to be visible
      await driver.sleep(2000);
      
      // Take screenshot of projects section
      const projectsSectionScreenshot = await driver.takeScreenshot();
      const projectsSectionPath = path.join(screenshotsDir, '3-projects-section.png');
      fs.writeFileSync(projectsSectionPath, projectsSectionScreenshot, 'base64');
      console.log('Screenshot 3 taken: Projects section');
      
      // Based on the HTML structure, target the project live demo links correctly
      console.log('Looking for project demo links');
      
      // First make sure we're in the Projects/Portfolio tab
      // This site has a tab structure, so we need to ensure the Projects tab is active
      const projectsTab = await driver.findElement(By.css('#full-width-tab-0'));
      await driver.executeScript("arguments[0].scrollIntoView(true);", projectsTab);
      await driver.sleep(500);
      await projectsTab.click();
      console.log('Clicked on Projects tab');
      await driver.sleep(1000);
      
      // Find the live demo links (based on the specific structure in this portfolio)
      const demoLinks = await driver.findElements(
        By.css('a[href*="vercel.app"][target="_blank"], .inline-flex.items-center.space-x-2.text-blue-400')
      );
      
      console.log(`Found ${demoLinks.length} project demo links`);
      
      // Visit first two project demos
      for (let i = 0; i < Math.min(2, demoLinks.length); i++) {
        try {
          // Store current window handle
          const mainWindow = await driver.getWindowHandle();
          
          // Make sure the link opens in a new tab
          await driver.executeScript('arguments[0].setAttribute("target", "_blank");', demoLinks[i]);
          
          // Scroll to the link to make sure it's visible
          await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", demoLinks[i]);
          await driver.sleep(500);
          
          // Click the link
          await demoLinks[i].click();
          console.log(`Clicked on project demo ${i+1}`);
          
          // Wait for new tab and switch to it
          await driver.sleep(3000);
          const handles = await driver.getAllWindowHandles();
          const newTab = handles.find(handle => handle !== mainWindow);
          
          if (newTab) {
            await driver.switchTo().window(newTab);
            console.log(`Switched to project ${i+1} tab`);
            
            // Wait for project page to load
            await driver.sleep(3000);
            
            // Take screenshot of the project
            const projectScreenshot = await driver.takeScreenshot();
            const projectScreenshotPath = path.join(screenshotsDir, `4-project-${i+1}.png`);
            fs.writeFileSync(projectScreenshotPath, projectScreenshot, 'base64');
            console.log(`Screenshot 4-${i+1} taken: Project ${i+1}`);
            
            // Close tab and return to main window
            await driver.close();
            await driver.switchTo().window(mainWindow);
            console.log(`Returned to main window`);
            
            // Wait a bit before trying the next project
            await driver.sleep(1000);
          } else {
            console.log(`Could not switch to new tab for project ${i+1}`);
          }
        } catch (error) {
          console.log(`Error with project ${i+1}:`, error.message);
        }
      }
    } catch (error) {
      console.log('Error navigating to projects section:', error.message);
    }
    
    // Navigate to contact section and fill out the form
    try {
      console.log('Looking for contact section');
      
      // Find the Contact link in the navigation - case sensitive!
      const navLinks = await driver.findElements(By.css('nav a, a[href*="Contact"]'));
      
      let contactLink = null;
      for (const link of navLinks) {
        const text = await link.getText();
        if (text.includes('Contact')) {
          contactLink = link;
          console.log('Found Contact link in navigation');
          break;
        }
      }
      
      if (contactLink) {
        // Scroll to the element first to ensure it's visible
        await driver.executeScript("arguments[0].scrollIntoView(true);", contactLink);
        await driver.sleep(500);
        await contactLink.click();
        console.log('Clicked on Contact link');
      } else {
        // Try scrolling directly to the Contact section by ID
        console.log('No Contact link found, trying to scroll to Contact section');
        await driver.executeScript(`
          const element = document.getElementById('Contact');
          if (element) {
            element.scrollIntoView({behavior: 'smooth'});
            return true;
          }
          return false;
        `);
      }
      
      // Wait for contact section to be visible
      await driver.sleep(2000);
      
      // Find the contact form fields
      const nameField = await driver.findElement(By.css('input[name="name"]'));
      const emailField = await driver.findElement(By.css('input[name="email"]'));
      const messageField = await driver.findElement(By.css('textarea[name="message"]'));
      
      // Fill out the form
      await nameField.clear();
      await nameField.sendKeys('Test User');
      console.log('Filled name field');
      
      await emailField.clear();
      await emailField.sendKeys('test@example.com');
      console.log('Filled email field');
      
      await messageField.clear();
      await messageField.sendKeys('This is a test message from Selenium. Great portfolio!');
      console.log('Filled message field');
      
      // Take screenshot of filled contact form
      const formScreenshot = await driver.takeScreenshot();
      const formScreenshotPath = path.join(screenshotsDir, '5-contact-form-filled.png');
      fs.writeFileSync(formScreenshotPath, formScreenshot, 'base64');
      console.log('Screenshot 5 taken: Contact form filled');
      
      // We don't actually submit the form to avoid sending real submissions
      console.log('Form filled out (not submitted to avoid actual submission)');
      
    } catch (error) {
      console.log('Error with contact form:', error.message);
    }
    
  } finally {
    // Close the browser
    await driver.quit();
    console.log('Portfolio navigation completed!');
  }
}

// Run the portfolio navigation
navigatePortfolio().catch(err => console.error('Error:', err)); 