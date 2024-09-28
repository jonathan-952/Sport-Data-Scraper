const express = require("express");
const app = express();
const {GoogleSpreadsheet} = require("google-spreadsheet");
const {JWT} = require("google-auth-library");
const port = 3000;
const creds = require('./credentials.json');
const scrape = require('./scraper.js');
const DateConverter = require('./Handlers/dateConverter.js')

app.get('/', async (req, res) => {
    try {
        const results = await scrape();
        const serviceAccountAuth = new JWT ({
            email: creds.client_email,
            key: creds.private_key,
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
                    'https://www.googleapis.com/auth/drive.file'
            ],
        });

        const doc = new GoogleSpreadsheet('1XgCyA0QGsRwP0HES8hxrKR2CNsIHi-wJDzlt4Hyu5-4', serviceAccountAuth);
        await doc.loadInfo();
        
        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();

        function wait(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
          };

        let retries = 0;
        const maxBackoff = 32000; //32 secs
        for (let i = 0; i < rows.length; i++) {
            try {
                const dateGS = rows[i].get('Date');
                const parsedDate = DateConverter(dateGS)

                const homeTeamGS = rows[i].get('Home');
                const awayTeamGS = rows[i].get('Away');

                const homeFinalScoreGS = rows[i].get('HG');
                const awayFinalScoreGS = rows[i].get('AG');

                const gameGS = [homeTeamGS, awayTeamGS, parsedDate, homeFinalScoreGS, awayFinalScoreGS].join('|')

                if (results[gameGS]) {
                    rows[i].set('HTHG', results[gameGS][0]);
                    rows[i].set('HTAG', results[gameGS][4]);
                } else {
                    rows[i].assign({HTHG: '-', HTAG: '-'});
                }
                await rows[i].save();
                retries = 0;
            } catch (err) {
                if (err.response?.status  === 429) {
                    const timeout = Math.min(2 ** retries * 1000, maxBackoff);
                    retries++
                    await wait(timeout);
                    i--
                    continue;
                }
            }
        }
        console.log("successful!");
        res.send(results)
    } catch (err) {
        if (err.response) {
            console.error('Error details:', err.response?.data)
        }
        else {
             console.log(err)
        }
    }
});

app.listen(port, () => {
    console.log('Server is listening on port', port);
})
