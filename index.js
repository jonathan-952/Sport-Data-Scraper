const express = require("express");
const app = express();
const {GoogleSpreadsheet} = require("google-spreadsheet");
const {JWT} = require("google-auth-library");
const port = 8080;
const creds = require('./credentials.json');
const scrape = require('./scraper.js');
const DateConverter = require('./Handlers/dateConverter.js')



app.get('/', async (req, res) => {
    try {
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
        let counter = 0;
        const dateGS = rows[0].get('Date');
        const parsedDate = DateConverter(dateGS)
        for (let i = 0; i < rows.length; i++) {
            const homeGS = rows[i].get('Home');
            const awayGS = rows[i].get('Away');
            

            
            // const homeScore = ;
            // const awayScore = ;

        //     if ( homeGS == results1 && awayGS == results2 
        //         && homeScore == homeScoreGS && awayScore == awayScoreGS) {

        //         rows[i].assign({HTHG: halftimeHG, HTAG: halftimeAG});
        //         await rows[i].save();
        //     }
        //     else {
        //         counter++
        //     }
        }

        // find if row in sheet matches score and game details in website
        // date  && team names ? {add in score} else {cross out}
    
        res.send("hello worldddddd")
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
