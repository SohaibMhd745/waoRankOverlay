const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3000;
const SUMMONER_NAME = 'wao-0000';
const REGION = 'euw';
let currentRank = 0;
let remaining = 0;

const getRank = async () => {
    try {
        const url = `https://op.gg/summoners/${REGION}/${SUMMONER_NAME}`;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const ladderText = $('a[href*="leaderboards/tier"] span.text-main-600').first().text();
        const rankNumber = parseInt(ladderText.replace(/,/g, ''), 10);

        if (!isNaN(rankNumber)) {
            currentRank = rankNumber || 0;
            remaining = Math.abs(50 - rankNumber);
        } else {
            currentRank = 0;
        }
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
        rank: currentRank,
        remaining: remaining,
    });
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
