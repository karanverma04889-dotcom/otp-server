const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ⚠️ YAHAN SMS-ACTIVATE KI API KEY DALNA
const API_KEY = "821f10Ac0376756b28A20f7A5483efbc"; 

// 1. BUY NUMBER (India = 22)
app.post('/buy-number', async (req, res) => {
    const { product } = req.body; // Product e.g. 'wa' for WhatsApp
    
    // Service Codes: whatsapp -> wa, telegram -> tg, instagram -> ig
    let serviceCode = 'wa'; 
    if(product.includes('telegram')) serviceCode = 'tg';
    if(product.includes('instagram')) serviceCode = 'ig';
    if(product.includes('google')) serviceCode = 'go';

    try {
        // 22 is code for India
        const url = `https://api.sms-activate.org/stubs/handler_api.php?api_key=${API_KEY}&action=getNumber&service=${serviceCode}&country=22`;
        
        const response = await axios.get(url);
        const data = response.data; // Example: ACCESS_NUMBER:123456:919876543210

        if (data.includes('ACCESS_NUMBER')) {
            const parts = data.split(':');
            res.json({ 
                success: true, 
                data: { id: parts[1], phone: '+' + parts[2] } 
            });
        } else {
            res.json({ success: false, message: "No Stock: " + data });
        }
    } catch (error) {
        res.json({ success: false, message: "Server Error" });
    }
});

// 2. CHECK OTP
app.get('/check-otp/:orderId', async (req, res) => {
    try {
        const url = `https://api.sms-activate.org/stubs/handler_api.php?api_key=${API_KEY}&action=getStatus&id=${req.params.orderId}`;
        const response = await axios.get(url);
        const data = response.data; // Example: STATUS_OK:123456

        if (data.includes('STATUS_OK')) {
            const otp = data.split(':')[1];
            res.json({ success: true, otp: otp });
        } else {
            res.json({ success: false, message: "Waiting..." });
        }
    } catch (error) {
        res.json({ success: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
