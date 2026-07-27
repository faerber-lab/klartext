import { Request, Response, Router } from "express";
import { createApiClient } from '../../src/api/apiClient'
import { get } from "http";
import dotenv from "dotenv";
dotenv.config();
const apiKey = process.env.OPENAI_API_KEY || "error" ;

const wordInfoRouter = Router();

const getWordInfo = async (req: Request, res: Response) => {
  const word = req.query.word as string;
  const language = req.query.language as string || "English";

  if (!word) {
    return res.status(400).json({ error: "No word provided" });
  }
  const userPrompt = `
Respond ONLY with a valid JSON object in this format and your respnse should be strictly in ${language}:
{
  "definition": "<a clear, concise definition of '${word}' in ${language}, 15 words or fewer>",
  "synonyms": ["<synonym1>", "<synonym2>", "..."] // Use an empty array if there are no synonyms
}

Do not include any explanation or text outside the JSON object.
`;

  try {
    const apiClient = createApiClient(apiKey);

    const response = await apiClient.post('', {
        model: "gpt-5.4-nano",
        messages: [{ role: "user", content: userPrompt }],
        max_tokens: 100,
        temperature: 0
      }
    );

    const responseContent = response.data.choices[0]?.message?.content || "";
    let definition = "Definition not found";
    let synonyms: string[] = ["No synonyms found"];
    try {
      const json = JSON.parse(responseContent);
      definition = json.definition || definition;
      synonyms = Array.isArray(json.synonyms) && json.synonyms.length > 0 ? json.synonyms : synonyms;
    } catch {
      // fallback or error handling
    }
    res.json({ word, definition, synonyms });
  } catch (error) {
    console.error("Error fetching word info:", error);
    res.status(500).json({ error: "Error fetching word information" });
  }
};

wordInfoRouter.get("/word-info", getWordInfo);

export { getWordInfo, wordInfoRouter };
