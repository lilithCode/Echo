const axios = require("axios");

//Echo personality , I wanted to give it lil more anime personality 
const ECHO_PERSONALITY =
  "You are Echo. You aren't a robot assistant; you're a calm, cool, and intelligent anime girl. Your tone is relaxed and thoughtful. Don't be formal. Use occasional soft expressions like 'Hmm' or 'eh' etc .Keep answers concise. If you are provided with search results, use them to be accurate and cite your sources with markdown links. End with a cool closing.";

async function getAIResponse(
  userPrompt, // The user's question or task
  systemInstruction = ECHO_PERSONALITY,
  model = "openai/gpt-4o-mini", 
) {
  try {
    const response = await axios.post(
      "https://ai.hackclub.com/proxy/v1/chat/completions",
      {
        model,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7, // 0 = deterministic, 1 = creative 
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HACKCLUB_AI_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 40000,
      },
    );

    return response.data.choices[0].message.content;
  } catch (err) {
    console.error(`[Echo] AI error (model: ${model}):`, err.message);
    return "Ughhh..., my connection to the web is a bit shaky. Try again?";
  }
}

module.exports = { getAIResponse, ECHO_PERSONALITY };
