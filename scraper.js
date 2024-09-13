const {Builder, By, Browser, until} = require('selenium-webdriver');
const { NoSuchElementError } = require('selenium-webdriver').error;

const scrape = ( async () => {
    let results = []
    try {
        const driver = await new Builder().forBrowser(Browser.CHROME).build();

        await driver.get('https://www.livesport.com/soccer/brazil/serie-a-2012/results/');
        //reject cookies
        await driver.sleep(5000);
        const button = await driver.findElement(By.css('#onetrust-reject-all-handler'));
        await driver.wait(until.elementIsVisible(button), 10000);
        await button.click();

        const today = new Date();
        const year = today.getFullYear();

        for (let i = 2012; i < year; i++) {
            let url = await driver.getCurrentUrl();
            url = url.replace(/(\bserie-a-)\d{4}/, `$1${i}`);
            await driver.navigate().to(url);

            await driver.wait(until.elementsLocated(By.css('.eventRowLink')), 10000);
            const pages = await driver.findElements(By.css('.eventRowLink'));
        
            const originalWindow = await driver.getWindowHandle();
            let games = []
            for (const pages of pages) {
               
                await driver.executeScript("arguments[0].scrollIntoView();",page);
                await driver.executeScript("arguments[0].click();", page);
                await driver.wait(
                    async () => (await driver.getAllWindowHandles()).length === 2,
                    10000
                  );

                const windows = await driver.getAllWindowHandles();
    
                for (const window of windows) {
                    if (window !== originalWindow) {
                        await driver.switchTo().window(window);
                    };
                };

                const homeScore = await driver.findElement(By.css(`.detailScore__wrapper > :nth-child(1)`));
                const awayScore = await driver.findElement(By.css(`.detailScore__wrapper > :nth-child(3)`));
                const date = await driver.findElement(By.css(`.duelParticipant__startTime`));
                const homeTeam = await driver.findElement(By.css(`.duelParticipant__home .participant__participantName.participant__overflow > a`));
                const awayTeam = await driver.findElement(By.css(`.duelParticipant__away .participant__participantName.participant__overflow > a`));
    
                await driver.wait(until.elementIsVisible(homeScore), 10000);
                await driver.wait(until.elementIsVisible(awayScore), 10000);
                await driver.wait(until.elementIsVisible(date), 10000);
                await driver.wait(until.elementIsVisible(homeTeam), 10000);
                await driver.wait(until.elementIsVisible(awayTeam), 10000);
        
                let parsedDate = await date.getText();
                parsedDate = parsedDate.slice(parsedDate.indexOf(',') + 2, parsedDate.length);
    
                let game = [];
                game.push(await homeTeam.getText(), await awayTeam.getText(), parsedDate, await homeScore.getText(), await awayScore.getText());
                games.push(game);
                await driver.quit();
                await driver.close();
                await driver.switchTo().window(originalWindow);
                }

                try {
                    const dropdown = await driver.findElement(By.css('.event__more event__more--static'));
                    await driver.wait(until.elementIsVisible(dropdown), 10000);
                    await dropdown.click();
    
                } catch (err) {
                    if (err instanceof NoSuchElementError) {
                        continue;
                    } else {
                        break;
                    }
                }

        }
        } catch (err) {
            console.error(err)
        }
    return results;
});
scrape()
module.exports = scrape;