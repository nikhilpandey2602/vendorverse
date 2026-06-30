/**
 * VendorVerse — AI Copilot API Route
 * Proxies chat requests to Google Gemini API.
 */

const express = require('express');
const router = express.Router();

// Log API key on startup (first 10 chars only)
const geminiKey = process.env.GEMINI_API_KEY || '';
console.log(`[AI Route] GEMINI_API_KEY loaded: "${geminiKey.substring(0, 10)}..." (${geminiKey.length} chars)`);

/* ─── System Prompt ─── */
const SYSTEM_PROMPT = `You are VendorVerse AI — the copilot for VendorVerse, an Indian multi-vendor marketplace.

Platform: vendors sell products, creators promote via "Creator Drops" (limited-time collabs), shoppers discover products through a Smart Feed. Revenue split: Creator 12%, Platform 7%, Vendor 81%. Features: Smart Feed, Creator Drops, Drop Rooms (live shopping), AI Creator Matchmaking, Wishlist, Cart. Categories: Electronics, Fashion, Home & Living, Beauty, Grocery, Sports, Books. Currency: ₹.

You help vendors with product descriptions, pricing, store optimization, drop strategy. You help creators with drop timing, audience growth, collaboration tips. You help shoppers find products, compare items, discover deals.

Response style: concise (2-3 paragraphs max), use **bold** and bullet points, be specific and actionable, use emojis sparingly. Never refuse to help.`;

/* ─── POST /api/ai/chat ─── */
router.post('/chat', async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            return res.status(500).json({
                success: false,
                message: 'AI service is not configured. Please add your Gemini API key to the backend .env file.'
            });
        }

        const { messages, context } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Messages array is required.'
            });
        }

        // Build context-enhanced system prompt
        let systemPrompt = SYSTEM_PROMPT;
        if (context) {
            systemPrompt += `\nUser is on the "${context}" page. Tailor your response accordingly.`;
        }

        // Only send last 4 messages, map assistant → model for Gemini
        const recent = messages
            .filter(m => m.role === 'user' || m.role === 'assistant')
            .slice(-4);

        const geminiContents = recent.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        // Call Gemini API
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        console.log('[AI Route] Calling Gemini API...');

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: geminiContents,
                generationConfig: {
                    maxOutputTokens: 512,
                    temperature: 0.7
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[AI Route] Gemini API error:', response.status, JSON.stringify(data, null, 2));

            if (response.status === 429) {
                return res.status(429).json({
                    success: false,
                    message: "I'm thinking, please try again in a minute! The AI service is a bit busy right now."
                });
            }

            return res.status(500).json({
                success: false,
                message: 'AI service error. Please try again.'
            });
        }

        // Extract reply
        const aiText = data.candidates[0].content.parts[0].text;

        console.log('[AI Route] Gemini response OK, length:', aiText.length);

        return res.json({
            success: true,
            message: aiText,
            model: 'gemini-2.5-flash',
            usage: data.usageMetadata || null
        });

    } catch (error) {
        console.error('[AI Route] Fatal error:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong with the AI service. Please try again.'
        });
    }
});

module.exports = router;
