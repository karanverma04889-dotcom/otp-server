const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ⚠️ YAHAN APNI 5SIM API KEY DALNA (Jo 5sim.net se mili hai)
const API_KEY = "YOUR_5SIM_API_KEY_HERE"; 

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
