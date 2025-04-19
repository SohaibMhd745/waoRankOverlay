const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3000;
const SUMMONER_NAME = 'wao-0000';
const REGION = 'euw';
let currentRank = 0;
let elo = '';
let lp = 0;

const getRank = async () => {
    try {
        const url = `https://op.gg/summoners/${REGION}/${SUMMONER_NAME}?queue_type=SOLORANKED`;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const ladderText = $('a[href*="leaderboards/tier"] span.text-main-600').first().text();
        currentRank = parseInt(ladderText.replace(/,/g, ''), 10);

        const eloDiv = $('div.flex.flex-col.gap-0\\.5').first();
        elo = eloDiv.find('strong').text().trim();

        const lpText = eloDiv.find('span').text().trim();
        lp = parseInt(lpText.replace('LP', '').trim(), 10);
    } catch (err) {
        console.error("Erreur lors du scraping :", err.message);
        currentRank = 0;
    }
};

getRank();
setInterval(getRank, 30000);

app.use(express.static('public'));

app.get('/rank', (req, res) => {
    res.send({
        rank: currentRank || 0,
        elo: elo || '',
        lp: lp || 0,
    });
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
