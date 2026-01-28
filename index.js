const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ⚠️ YOUR SMS-ACTIVATE API KEY
const API_KEY = "821f10Ac0376756b28A20f7A5483efbc"; 

// Country Code Mapping (Dialing Code -> SMS-Activate ID)
const countryMapping = {
    '91': 22,   // India
    '1': 187,   // USA
    '7': 0,     // Russia
    '44': 16,   // UK
    '62': 6,    // Indonesia
    '55': 73,   // Brazil
    '84': 10,   // Vietnam
    '63': 4,    // Philippines
    '66': 52,   // Thailand
    '92': 66,   // Pakistan
    '880': 60,  // Bangladesh
    '234': 19,  // Nigeria
    '254': 8,   // Kenya
    '20': 21,   // Egypt
    '27': 31,   // South Africa
    '60': 7,    // Malaysia
    '86': 3,    // China
    '49': 43,   // Germany
    '33': 78,   // France
    '34': 56,   // Spain
    '380': 1,   // Ukraine
    '977': 81,  // Nepal
    '94': 64,   // Sri Lanka
    '1000': 36  // Canada (Internal Code to separate from USA)
};

// 1. BUY NUMBER API
app.post('/buy-number', async (req, res) => {
    // Frontend sends 'country' as dialing code (e.g., '91', '1')
    let { country, product } = req.body; 
    
    // Service Codes Mapping
    let serviceCode = 'wa'; // Default WhatsApp
    if(product.includes('telegram')) serviceCode = 'tg';
    if(product.includes('instagram')) serviceCode = 'ig';
    if(product.includes('google') || product.includes('gmail')) serviceCode = 'go';
    if(product.includes('facebook')) serviceCode = 'fb';
    if(product.includes('amazon')) serviceCode = 'am';
    if(product.includes('flipkart')) serviceCode = 'bd'; 
    if(product.includes('twitter')) serviceCode = 'tw';
    if(product.includes('uber')) serviceCode = 'ub';
    if(product.includes('tinder')) serviceCode = 'oi';

    // Get SMS-Activate Country ID (Default to 22/India if not found)
    const countryId = countryMapping[country] || 22;

    try {
        const url = `https://api.sms-activate.org/stubs/handler_api.php?api_key=${API_KEY}&action=getNumber&service=${serviceCode}&country=${countryId}`;
        
        const response = await axios.get(url);
        const data = response.data; // Example: ACCESS_NUMBER:123456:919876543210

        if (data.includes('ACCESS_NUMBER')) {
            const parts = data.split(':');
            res.json({ 
                success: true, 
                data: { id: parts[1], phone: '+' + parts[2] } 
            });
        } else {
            // Error handling (NO_NUMBERS, NO_BALANCE etc.)
            res.json({ success: false, message: "Stock Out: " + data });
        }
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Server Error" });
    }
});

// 2. CHECK OTP API
app.get('/check-otp/:orderId', async (req, res) => {
    try {
        const url = `https://api.sms-activate.org/stubs/handler_api.php?api_key=${API_KEY}&action=getStatus&id=${req.params.orderId}`;
        const response = await axios.get(url);
        const data = response.data; 

        // Response format: STATUS_OK:123456
        if (data.includes('STATUS_OK')) {
            const otp = data.split(':')[1];
            res.json({ success: true, otp: otp });
        } else {
            // STATUS_WAIT_CODE or others
            res.json({ success: false, message: "Waiting..." });
        }
    } catch (error) {
        res.json({ success: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
