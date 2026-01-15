const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ⚠️ YAHAN APNI 5SIM API KEY DALNA (Jo 5sim.net se mili hai)
const API_KEY = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3OTk5NDU0OTUsImlhdCI6MTc2ODQwOTQ5NSwicmF5IjoiYTllMjdjNTBmYzBjOTFiYjg0NDdhOTMzNmM4NTkxYjAiLCJzdWIiOjM3MzY1MzV9.xQZ1c7eV9d-kQF80sSohKjEc_7QQlNfUnHGIXys5-N0q6zD2bbuGoCG5tGo9ut_8HDIUFT0_1rAS3A5WJ9wK96rWYMK1F1L8q7__7XJpjudaAkMiJio5v7gKiXfs5KcQLRlBQSZ7042T7tgfV7hRlISCy8zaBaSgRj05K0TwJa5e4gR6MfG0heyXjPsqNs7dokcCEFNRFpdzI2jWmt9C9kgXjvDkVD0aWow9VU-UwhrzP_9aCbO4GaSZXPmf9HkROTSKPaMCTSSV-Aki39ukIkaObSbOFxIjodRFKZ6PT0yHd5RAcIO58yrsnI0pY154USSOun9ogBGsybiLmNu-bg"; 

// 1. BUY NUMBER API
app.post('/buy-number', async (req, res) => {
    const { country, operator, product } = req.body;
    try {
        const url = `https://5sim.net/v1/user/buy/activation/${country}/${operator}/${product}`;
        const response = await axios.get(url, {
            headers: { 'Authorization': 'Bearer ' + API_KEY, 'Accept': 'application/json' }
        });
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error or Low Balance" });
    }
});

// 2. CHECK OTP API
app.get('/check-otp/:orderId', async (req, res) => {
    try {
        const url = `https://5sim.net/v1/user/check/${req.params.orderId}`;
        const response = await axios.get(url, {
            headers: { 'Authorization': 'Bearer ' + API_KEY, 'Accept': 'application/json' }
        });
        
        if (response.data.sms && response.data.sms.length > 0) {
            res.json({ success: true, otp: response.data.sms[0].code });
        } else {
            res.json({ success: false, message: "Waiting..." });
        }
    } catch (error) {
        res.json({ success: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
