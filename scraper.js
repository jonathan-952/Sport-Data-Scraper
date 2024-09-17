const {Builder, By, Browser, until} = require('selenium-webdriver');
const { NoSuchElementError } = require('selenium-webdriver').error;

const scrape = ( async () => {
    let results = new Map();
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
        //loop through each series year
        for (let i = 2012; i < year; i++) {
            let url = await driver.getCurrentUrl();
            url = url.replace(/(\bserie-a-)\d{4}/, `$1${i}`);
            await driver.navigate().to(url);

            await driver.wait(until.elementsLocated(By.css('.eventRowLink')), 10000);
            let pages = await driver.findElements(By.css('.eventRowLink'));
        
            const originalWindow = await driver.getWindowHandle();
            let games = []

            //loop through each game summary
            for (let p = 0; p < pages.length; p++) {
                await driver.executeScript("arguments[0].scrollIntoView();", pages[p]);
                await driver.executeScript("arguments[0].click();", pages[p]);
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
   
                //get data from game summary
                const halftimeScore = await driver.wait(until.elementLocated(By.css('.smv__incidentsHeader.section__title > :nth-child(2)')), 10000);

                const homeFinalScore = await driver.findElement(By.css(`.detailScore__wrapper > :nth-child(1)`));
                const awayFinalScore = await driver.findElement(By.css(`.detailScore__wrapper > :nth-child(3)`));

                const date = await driver.findElement(By.css(`.duelParticipant__startTime`));

                const homeTeam = await driver.findElement(By.css(`.duelParticipant__home .participant__participantName.participant__overflow > a`));
                const awayTeam = await driver.findElement(By.css(`.duelParticipant__away .participant__participantName.participant__overflow > a`));
             
                await driver.wait(until.elementIsVisible(homeFinalScore), 10000);
                await driver.wait(until.elementIsVisible(awayFinalScore), 10000);

                await driver.wait(until.elementIsVisible(date), 10000);

                await driver.wait(until.elementIsVisible(homeTeam), 10000);
                await driver.wait(until.elementIsVisible(awayTeam), 10000);

                await driver.wait(until.elementIsVisible(halftimeScore), 10000);
        
                let parsedDate = await date.getText();
                parsedDate = parsedDate.slice(parsedDate.indexOf(',') + 2, parsedDate.length);
    
                let game = [];
                game.push(await homeTeam.getText(), await awayTeam.getText(), parsedDate, await homeFinalScore.getText(), await awayFinalScore.getText(), await halftimeScore.getText());
                games.push(game);

                await driver.close();
                await driver.switchTo().window(originalWindow);

                // if "show more games" is at bottom of page and loop has iterated through game summaries, click show more
                if (p == pages.length - 1) {
                    try {
                        const dropdown = await driver.findElement(By.css('.event__more.event__more--static'));
                        await driver.executeScript("arguments[0].scrollIntoView();", pages[p - 5]);
                        await driver.wait(until.elementIsVisible(dropdown), 10000);
                        await dropdown.click();

                        await driver.wait(async () => {
                            let newPages = await driver.findElements(By.css('.eventRowLink'));
                            return newPages.length > pages.length;
                        }, 10000);

                        pages = await driver.findElements(By.css('.eventRowLink'));
                    } catch (err) {
                        if (!(err instanceof NoSuchElementError)) {
                            console.log(err)
                            await driver.quit()
                        } 
                    }
                }
                }
            for (let g = games.length - 1; g >= 0; g--) {
                const halftimeScores = games[g][5]
                results[games[g].slice(0, 5).join('|')] = halftimeScores;
            }
        }
        } catch (err) {
            console.error(err)
        }
    return results;
});

module.exports = scrape;