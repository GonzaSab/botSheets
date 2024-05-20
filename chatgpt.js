const OpenAI = require("openai")

require("dotenv").config();
const openaiApiKey = process.env.OPENAI_API_KEY;

const chat = async (prompt, text) => {
    try {
        const openai = new OpenAI({
            apiKey: openaiApiKey,
        });
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: prompt },
                { role: "user", content: text },
            ],
        });
        const answ = completion.choices[0].message.content
        return answ;
    } catch (err) {
        console.error("Error al conectar con OpenAI:", err);
        return "ERROR";
    }
};

module.exports = { chat }