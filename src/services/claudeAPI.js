import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateElaboration(text) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that elaborates on given text, providing more context and details."
        },
        {
          role: "user",
          content: `Please elaborate on the following text: "${text}"`
        }
      ],
      max_tokens: 150
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Elaboration error:", error);
    throw new Error("Failed to elaborate text: " + error.message);
  }
}