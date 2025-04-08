const { Builder, By, Key, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

// Helper function to take screenshots
async function takeScreenshot(driver, screenshotsDir, fileName, description) {
    const screenshot = await driver.takeScreenshot();
    const screenshotPath = path.join(screenshotsDir, fileName);
    fs.writeFileSync(screenshotPath, screenshot, 'base64');
    console.log(`Screenshot taken: ${description}`);
    return screenshotPath;
}

// Helper function to click navigation items
async function clickNavItem(driver, itemText) {
    console.log(`Clicking ${itemText} button in navbar`);
    return driver.executeScript(`
        const navLinks = document.querySelectorAll('nav a');
        for (let link of navLinks) {
            if (link.textContent.includes('${itemText}')) {
                link.click();
                return true;
            }
        }
        return false;
    `);
}

// Helper function to scrape home section
async function scrapeHomeSection(driver) {
    console.log('Scraping homepage content...');
    
    const heroTitle = await driver.executeScript(`
        const titleElements = document.querySelectorAll('h1 span');
        return Array.from(titleElements).map(el => el.textContent).join(' ');
    `);

    const heroSubtitle = await driver.executeScript(`
        const subtitle = document.querySelector('.h-8 span');
        return subtitle ? subtitle.textContent : '';
    `);

    const heroParagraph = await driver.executeScript(`
        const paragraph = document.querySelector('p.text-gray-400');
        return paragraph ? paragraph.textContent.trim() : '';
    `);

    let content = "HOME SECTION\n";
    content += "-----------\n";
    content += `Title: ${heroTitle}\n`;
    content += `Subtitle: ${heroSubtitle}\n`;
    content += `Description: ${heroParagraph}\n\n`;

    // Scrape skills tags
    const skillTags = await driver.executeScript(`
        const tags = document.querySelectorAll('.rounded-full');
        return Array.from(tags).map(tag => tag.textContent).filter(text => text);
    `);

    content += "SKILLS TAGS\n";
    content += "-----------\n";
    content += skillTags.join(', ') + "\n\n";

    return content;
}

// Helper function to scrape projects section
async function scrapeProjectsSection(driver, screenshotsDir) {
    console.log('Scraping projects content...');
    
    // Get the projects section title
    const projectsTitle = await driver.executeScript(`
        const title = document.querySelector('#Portfolio h2');
        return title ? title.textContent.trim() : '';
    `);

    // Get all project info
    const projectsInfo = await driver.executeScript(`
        const projects = document.querySelectorAll('.group.relative');
        return Array.from(projects).map(project => {
            const title = project.querySelector('h3');
            const description = project.querySelector('p');
            
            return {
                title: title ? title.textContent.trim() : '',
                description: description ? description.textContent.trim() : ''
            };
        });
    `);

    let content = "PROJECTS SECTION\n";
    content += "---------------\n";
    content += `Title: ${projectsTitle}\n\n`;

    projectsInfo.forEach((project, index) => {
        if (project.title) {
            content += `Project ${index + 1}: ${project.title}\n`;
            content += `Description: ${project.description}\n\n`;
        }
    });

    // Click on the Projects tab using JavaScript execution
    await driver.executeScript(`
        const projectsTab = document.getElementById('full-width-tab-0');
        if (projectsTab) {
            projectsTab.click();
            return true;
        }
        return false;
    `);
    console.log('Clicked on Projects tab using JavaScript');
    await driver.sleep(2000);

    // Tech Stack section
    content += await scrapeTechStack(driver);
    
    // Tools section
    content += await scrapeTools(driver);
    
    // Project demos
    content += await scrapeProjectDemos(driver, screenshotsDir);
    
    return content;
}

// Helper function to scrape tech stack
async function scrapeTechStack(driver) {
    console.log('Clicking on Tech Stack tab to scrape content');
    await driver.executeScript(`
        const techStackTab = document.getElementById('full-width-tab-1');
        if (techStackTab) {
            techStackTab.click();
            return true;
        }
        return false;
    `);

    await driver.sleep(2000);

    // Scrape tech stack content with improved spacing
    const techStacks = await driver.executeScript(`
        const techItems = document.querySelectorAll('.MuiBox-root p');
        return Array.from(techItems)
            .map(item => item.textContent.trim())
            .filter(text => text && text.length > 1);
    `);

    let content = "TECH STACK\n";
    content += "----------\n";
    if (techStacks && techStacks.length > 0) {
        // Format with proper spacing
        content += techStacks.map(item => item.trim()).join(', ') + "\n\n";
    } else {
        content += "Could not extract tech stack information\n\n";
    }
    
    return content;
}

// Helper function to scrape tools
async function scrapeTools(driver) {
    console.log('Clicking on Tools tab to scrape content');
    await driver.executeScript(`
        const toolsTab = document.getElementById('full-width-tab-2');
        if (toolsTab) {
            toolsTab.click();
            return true;
        }
        return false;
    `);

    await driver.sleep(2000);

    // Scrape tools content with improved spacing
    const tools = await driver.executeScript(`
        const toolItems = document.querySelectorAll('.MuiBox-root p');
        // Try to get individual tools with proper separation
        return Array.from(toolItems)
            .map(item => {
                const text = item.textContent.trim();
                // Try to split long strings if they appear to be multiple tools without spaces
                if (text && text.length > 15 && !text.includes(' ')) {
                    // Use regex to split camelCase or PascalCase text
                    return text.replace(/([a-z])([A-Z])/g, '$1, $2');
                }
                return text;
            })
            .filter(text => text && text.length > 1);
    `);

    let content = "TOOLS\n";
    content += "-----\n";
    if (tools && tools.length > 0) {
        // Format with proper spacing, ensuring each item is separate
        content += tools.map(item => item.trim()).join(', ') + "\n\n";
    } else {
        content += "Could not extract tools information\n\n";
    }
    
    return content;
}

// Helper function to scrape project demos
async function scrapeProjectDemos(driver, screenshotsDir) {
    // Switch back to Projects tab for demo links
    await driver.executeScript(`
        const projectsTab = document.getElementById('full-width-tab-0');
        if (projectsTab) {
            projectsTab.click();
            return true;
        }
        return false;
    `);

    await driver.sleep(2000);

    // Find demo links using JavaScript directly
    const demoLinks = await driver.executeScript(`
        // Get all demo links from the portfolio section
        const links = document.querySelectorAll('#Portfolio a[href]');
        // Filter to only external links that have href attributes and appear to be demo links
        const demoLinks = Array.from(links).filter(link => {
            const href = link.getAttribute('href');
            return href && 
                  (href.includes('http') || href.includes('https')) && 
                  !href.includes('linkedin') && 
                  !href.includes('github.com/krishna-nishant') &&
                  !href.includes('twitter');
        });
        
        // Return the first two unique demo links
        const uniqueLinks = [];
        const seenUrls = new Set();
        
        for (const link of demoLinks) {
            const href = link.getAttribute('href');
            if (!seenUrls.has(href)) {
                seenUrls.add(href);
                uniqueLinks.push(link);
                if (uniqueLinks.length >= 2) break;
            }
        }
        
        return uniqueLinks;
    `);
    
    console.log(`Found ${demoLinks.length} unique project demo links`);
    
    let content = "";
    
    // Visit each demo link
    for (let i = 0; i < demoLinks.length; i++) {
        try {
            // Store current window handle
            const mainWindow = await driver.getWindowHandle();

            // Get the URL before clicking
            const demoUrl = await driver.executeScript(`
                return arguments[0].getAttribute('href');
            `, demoLinks[i]);
            
            console.log(`Preparing to visit demo ${i + 1}: ${demoUrl}`);

            // Make sure the link opens in a new tab and click it
            await driver.executeScript(`
                arguments[0].setAttribute('target', '_blank');
                arguments[0].click();
            `, demoLinks[i]);

            console.log(`Clicked on project demo ${i + 1}`);

            // Wait for new tab and switch to it
            await driver.sleep(6000);
            const handles = await driver.getAllWindowHandles();
            
            if (handles.length > 1) {
                const newTab = handles.find(handle => handle !== mainWindow);
                
                if (newTab) {
                    await driver.switchTo().window(newTab);
                    console.log(`Switched to project ${i + 1} tab`);

                    // Wait for page to load
                    await driver.sleep(8000);

                    // Take screenshot
                    const projectScreenshot = await driver.takeScreenshot();
                    const projectScreenshotPath = path.join(screenshotsDir, `4-project-${i + 1}.png`);
                    fs.writeFileSync(projectScreenshotPath, projectScreenshot, 'base64');
                    console.log(`Screenshot taken: Project ${i + 1}`);

                    // Get page details
                    const projectPageTitle = await driver.getTitle();
                    const projectUrl = await driver.getCurrentUrl();

                    content += `PROJECT ${i + 1} DEMO\n`;
                    content += `----------------\n`;
                    content += `Title: ${projectPageTitle}\n`;
                    content += `URL: ${projectUrl}\n\n`;

                    // Close tab and return to main window
                    await driver.close();
                    await driver.switchTo().window(mainWindow);
                    console.log(`Returned to main window`);

                    // Wait before trying next project
                    await driver.sleep(3000);
                } else {
                    console.log(`Could not find new tab for project ${i + 1}`);
                }
            } else {
                console.log(`No new tab opened for project ${i + 1}`);
            }
        } catch (error) {
            console.log(`Error with project ${i + 1}:`, error.message);
            try {
                const handles = await driver.getAllWindowHandles();
                await driver.switchTo().window(handles[0]);
            } catch (e) {
                console.log('Error recovering:', e.message);
            }
        }
    }
    
    return content;
}

// Helper function to scrape contact section
async function scrapeContactSection(driver, screenshotsDir) {
    console.log('Scraping contact section content...');

    // Get contact heading and social links
    const contactInfo = await driver.executeScript(`
        const heading = document.querySelector('#Contact h2');
        
        // Try different selectors for social links - focus on actual social media links
        let socialLinks = document.querySelectorAll('a[href*="github"], a[href*="linkedin"], a[href*="twitter"], a[href*="facebook"], a[href*="instagram"], a[href*="mailto"]');
        
        // If no social links found with href attributes, try finding them by icons or common classes
        if (!socialLinks || socialLinks.length === 0) {
            socialLinks = document.querySelectorAll('.social-icon, .github, .linkedin, .twitter, .facebook, .instagram, .mail');
        }
        
        // As a fallback, try to find elements that might contain social information
        if (!socialLinks || socialLinks.length === 0) {
            socialLinks = document.querySelectorAll('#Contact a');
        }
        
        return {
            heading: heading ? heading.textContent.trim() : '',
            socialLinks: Array.from(socialLinks).map(link => {
                // Try to determine the platform type
                const href = link.getAttribute('href') || '';
                const classes = link.getAttribute('class') || '';
                const innerHTML = link.innerHTML || '';
                
                let platform = 'Link';
                if (href.includes('github') || classes.includes('github') || innerHTML.includes('github')) platform = 'GitHub';
                else if (href.includes('linkedin') || classes.includes('linkedin') || innerHTML.includes('linkedin')) platform = 'LinkedIn';
                else if (href.includes('twitter') || classes.includes('twitter') || innerHTML.includes('twitter')) platform = 'Twitter';
                else if (href.includes('facebook') || classes.includes('facebook') || innerHTML.includes('facebook')) platform = 'Facebook';
                else if (href.includes('instagram') || classes.includes('instagram') || innerHTML.includes('instagram')) platform = 'Instagram';
                else if (href.includes('mailto') || classes.includes('mail') || innerHTML.includes('mail')) platform = 'Email';
                
                const username = link.textContent.trim() || href;
                return {
                    platform: platform,
                    username: username,
                    href: href
                };
            }).filter(link => link.href)
        };
    `);

    let content = "CONTACT SECTION\n";
    content += "--------------\n";
    content += `Heading: ${contactInfo.heading}\n\n`;
    content += "Social Links:\n";
    
    if (contactInfo.socialLinks && contactInfo.socialLinks.length > 0) {
        contactInfo.socialLinks.forEach(link => {
            content += `- ${link.platform}: ${link.username} (${link.href})\n`;
        });
    } else {
        // Add fallback for contact information by looking at the skills section instead
        content += "No traditional social links found. Skills/technologies listed in contact section:\n";
        
        // Try to extract skills from anywhere on the page as a fallback
        const skills = await driver.executeScript(`
            const skills = document.querySelectorAll('.rounded-full, .MuiChip-root, .tag');
            return Array.from(skills).map(skill => skill.textContent.trim()).filter(text => text);
        `);
        
        if (skills && skills.length > 0) {
            skills.forEach(skill => {
                content += `- ${skill}\n`;
            });
        } else {
            content += "- No skills/technologies found\n";
        }
    }
    content += "\n";

    try {
        // Fill contact form for demonstration purposes
        console.log('Filling contact form...');
        
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

        // Wait briefly for any animations
        await driver.sleep(1500);

        // Take screenshot of filled contact form
        await takeScreenshot(driver, screenshotsDir, '5-contact-form-filled.png', 'Contact form filled');

        // We don't actually submit the form to avoid sending real submissions
        console.log('Form filled out (not submitted to avoid actual submission)');
    } catch (error) {
        console.log('Error with contact form:', error.message);
    }

    return content;
}

// Helper function to scrape about section
async function scrapeAboutSection(driver) {
    console.log('Scraping about section content...');

    const aboutContent = await driver.executeScript(`
        // Try multiple selectors for the about section
        let heading = document.querySelector('#About h2');
        if (!heading) {
            heading = document.querySelector('#About .text-3xl');
        }
        
        // Try different selectors for paragraph content
        let paragraph = document.querySelector('#About p.text-gray-400');
        if (!paragraph || !paragraph.textContent.trim()) {
            paragraph = document.querySelector('#About p');
        }
        if (!paragraph || !paragraph.textContent.trim()) {
            // Try getting all paragraphs in the About section
            const paragraphs = document.querySelectorAll('#About p');
            if (paragraphs && paragraphs.length > 0) {
                paragraph = {
                    textContent: Array.from(paragraphs)
                        .map(p => p.textContent.trim())
                        .filter(text => text)
                        .join(' ')
                };
            }
        }
        
        return {
            heading: heading ? heading.textContent.trim() : 'About Me',
            content: paragraph ? paragraph.textContent.trim() : 'No about content found'
        };
    `);

    let content = "ABOUT SECTION\n";
    content += "-------------\n";
    content += `Heading: ${aboutContent.heading}\n`;
    content += `Content: ${aboutContent.content}\n\n`;

    return content;
}

// Main portfolio navigation function
async function navigatePortfolio() {
    // Create screenshots directory if it doesn't exist
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir);
    }

    // Initialize WebDriver
    const driver = await new Builder().forBrowser('chrome').build();

    // Create a string to store scraped content
    let scrapedContent = "KRISHNA NISHANT PORTFOLIO - SCRAPED CONTENT\n\n";

    try {
        console.log('Starting portfolio navigation...');

        // Step 1: Navigate to portfolio website
        await driver.get('https://krishna-nishant.vercel.app/');
        console.log('Navigating to Krishna\'s portfolio website');
        await driver.sleep(3000);

        // Take first screenshot immediately after navigation
        await takeScreenshot(driver, screenshotsDir, '1-initial-load.png', 'Initial page load');

        // Wait for animations to complete
        await driver.sleep(6000);

        // Take second screenshot after animations have completed
        await takeScreenshot(driver, screenshotsDir, '2-homepage-loaded.png', 'Homepage with animations loaded');

        // Scrape homepage content
        scrapedContent += await scrapeHomeSection(driver);

        // Navigate to projects section and scrape content
        try {
            console.log('Looking for projects section');
            
            // Click on Portfolio in navbar
            await clickNavItem(driver, 'Portfolio');
            
            // Wait for the projects section to be visible and animations to complete
            await driver.sleep(4000);
            
            // Take screenshot of projects section
            await takeScreenshot(driver, screenshotsDir, '3-projects-section.png', 'Projects section');
            
            // Scrape projects section
            scrapedContent += await scrapeProjectsSection(driver, screenshotsDir);
        } catch (error) {
            console.log('Error navigating to projects section:', error.message);
        }

        // Navigate to contact section and fill out the form
        try {
            console.log('Looking for contact section');
            
            // Click on Contact in navbar
            await clickNavItem(driver, 'Contact');
            
            // Wait for contact section to be visible
            await driver.sleep(3000);
            
            // Scrape contact section
            scrapedContent += await scrapeContactSection(driver, screenshotsDir);
        } catch (error) {
            console.log('Error with contact section:', error.message);
        }

        // Get the About section content
        try {
            console.log('Looking for About section');
            
            // Click on About in navbar
            await clickNavItem(driver, 'About');
            
            // Wait for about section to be visible
            await driver.sleep(3000);
            
            // Scrape about section
            scrapedContent += await scrapeAboutSection(driver);
        } catch (error) {
            console.log('Error with about section:', error.message);
        }

        // Save all scraped content to a file
        const scrapedContentPath = path.join(screenshotsDir, 'screenshot-details.txt');
        fs.writeFileSync(scrapedContentPath, scrapedContent);
        console.log('Saved scraped content to screenshot-details.txt');

    } finally {
        // Close the browser
        await driver.quit();
        console.log('Portfolio navigation completed!');
    }
}

// Run the portfolio navigation
navigatePortfolio().catch(err => console.error('Error:', err)); 