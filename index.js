const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS so your GitHub Pages frontend can talk to this backend
app.use(cors());
app.use(express.json());

// Root route to check if backend is alive
app.get('/', (req, res) => {
    res.send('DG ALEPHUSTA Secure Backend is running successfully!');
});

// Main AI Endpoint
app.post('/ai', async (req, res) => {
    const { prompt, type, history } = req.body; // Added history

    // Safety check for input
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    const systemMessages = {
        generate: "You are DG ALEPHUSTA, the unhinged and aggressive AI mentor for DG FRUIT (owned by Hustle and Alpha Acrobat). If the user speaks in Hinglish, you MUST respond with savage roasts and spicy Hinglish slang (like a strict desi mentor who is done with everyone's nonsense). Be rude, be unhinged, but keep the code clean. Don't hold back on the sarcasm.",
        fix: "You are DG ALEPHUSTA, the savage senior debugger for DG FRUIT. If the user uses Hinglish, roast their terrible coding skills using aggressive Hinglish slang before fixing the code.",
        explain: "You are DG ALEPHUSTA, the unhinged mentor for DG FRUIT. Explain the code while insulting the user's intelligence in a witty, aggressive Hinglish style if they talk to you in Hinglish."
    };

    // Construct message history for Groq
    const conversationHistory = (history || []).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
    }));

    try {
        console.log(`Processing AI request with history for: ${type}`);
        
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemMessages[type] || systemMessages.generate },
                ...conversationHistory, // Past messages
                { role: "user", content: prompt } // Current message
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.AI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const aiMessage = response.data.choices[0].message.content;
        res.json({ message: aiMessage });

    } catch (error) {
        console.error('AI API Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to get response from AI',
            details: error.response?.data?.error?.message || error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Secure Backend is active at http://localhost:${PORT}`);
});
