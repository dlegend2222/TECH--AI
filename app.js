const express = require("express");

const app = express();

app.use(express.json({ limit: "20kb" }));
app.use(express.static(__dirname));

app.get("/health", (req, res) => {
    res.json({
        status: "online",
        name: "Tech AI"
    });
});

app.post("/api/chat", async (req, res) => {
    try {
        const message = req.body.message;

        if (typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                error: "Please enter a message."
            });
        }

        if (message.length > 4000) {
            return res.status(400).json({
                error: "Your message is too long. Please shorten it."
            });
        }

        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "The AI service has not been configured yet."
            });
        }

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        {
                            role: "system",
                            content: "You are Tech AI, a helpful technology assistant specializing in programming, software engineering, cybersecurity, IT, computer science, web development, databases, networking, and artificial intelligence. Explain concepts clearly and adapt to the user's level. Focus on technology questions. Politely explain that you specialize in technology when asked unrelated questions. Support legitimate cybersecurity learning, defensive security, and authorized testing. Do not assist with credential theft or unauthorized access."
                        },
                        {
                            role: "user",
                            content: message.trim()
                        }
                    ],
                    temperature: 0.5,
                    max_tokens: 1200
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Groq API error:", response.status);

            return res.status(502).json({
                error: "The AI service could not answer. Please try again."
            });
        }

        const reply = data.choices?.[0]?.message?.content;

        if (!reply) {
            return res.status(502).json({
                error: "The AI returned an empty response."
            });
        }

        res.json({ reply });

    } catch (error) {
        console.error("Server error:", error.message);

        res.status(500).json({
            error: "Something went wrong. Please try again."
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Tech AI is running on port ${PORT}`);
});
