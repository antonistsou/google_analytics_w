// index.js (Backend: Node.js with Express)
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

//Credentials ... 
//Should be private
const PORT = 3000;
const API_KEY = "nqOfcMF2oRpnynTcMy595a36AYsGjG0lwZshQC5G+L0Ea0t83GPQayAdlGcQQcUY5DHqllTikr14bca3H3WCiYOH73Ca4AvO1Yb/fPBA1Yz16dAE8CF6FEz1FsQFuUGNtL69OUOKAzuoHzuSgcmQ1w==";
const LIST_ID = "fb3c14b948000175ca46cee11beca6fa";
const CLIENT_ID = "51a71e47721ad9a59514280d29bd47af";
const BASE_URL = "https://api.createsend.com/api/v3.3/";
// Fetch subscribers
app.get('/subscribers', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/lists/${LIST_ID}/active.json`, {
            auth: { username: API_KEY, password: 'x' }
        });
        res.json(response.data.Results);
        console.log('Fetching Subscribers accomplished!', response.data.Results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add subscriber
app.post('/subscribers', async (req, res) => {
    const { name, email } = req.body;
    try {
        await axios.post(`${BASE_URL}/subscribers/${LIST_ID}.json`, {
            EmailAddress: email,
            Name: name,
            Resubscribe: true,
            RestartSubscriptionBasedAutoresponders: true,
            ConsentToTrack: "Yes",
            ConsentToSendSms: "Yes"
        }
            , {
                auth: { username: API_KEY, password: 'x' }
            });
        res.json({ message: 'Subscriber added' });
        console.log(`Adding ${name} ${email}`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Delete a subscriber
app.delete('/subscribers', async (req, res) => {
    const { email } = req.body;
    console.log(email);
    try {
        await axios.delete(`${BASE_URL}/subscribers/${LIST_ID}.json?email=${email}`, {
            auth: { username: API_KEY, password: 'x' }
        });
        res.json({ message: 'Subscriber removed' });
        console.log(`Deleting ${email}`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
