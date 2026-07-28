import { Request, Response, Router } from 'express';
import multer from 'multer';
import { TargetAudiences } from '../../src/types';
import { handleFileInput } from '../../src/functions/handleFileInputs';
import { validateUrl } from '../../src/./utils/validateUrl'
import { simplifyText } from '../../src/functions/simplifyText';
import { saveToRedis } from '../../src/functions/saveToRedis';

const apiKey = process.env.LLM_API_KEY || "error" ;
const wordLimit = Number(process.env.WORD_LIMIT) || 5000;


const upload = multer();
const simplifyRouter = Router();

const handleSimplify = async (req: Request, res: Response) => {
  console.log("Simplify request received");

  const audience = req.body.audience as TargetAudiences;
  const text = req.body.text as string;
  const file = req.file;
  const url = req.body.url;
  const outputLanguage = req.body.language as string;
  const context = req.body.context as string;

  // Map input type to processing logic
  try {
    const inputText = await (() => {
      if (file) return handleFileInput(file); // Handle file input
      if (url) return url; // Use URL directly
      if (text) return text; // Use text directly
      throw new Error("No valid input provided"); // Fallback for missing input
    })();

    // Validate input length for text (not URL)
    if (!url && inputText.length > wordLimit) {
      return res.status(400).json({ error: `Text exceeds the word limit of ${wordLimit} characters.` });
    } else if (url) {
      await validateUrl(url);
    }

    // Simplify input and cache result
    const simplifiedText = await simplifyText(inputText, audience, outputLanguage, apiKey, context);
    await saveToRedis(inputText, audience, simplifiedText);

    // Respond with simplified text
    res.json({ simplifiedText });
  } catch (error) {
    console.error("Error in /simplify endpoint:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    res.status(500).json({ error: errorMessage || "An error occurred during text simplification." });
  }
};

simplifyRouter.post('/simplify', upload.single('file'), handleSimplify);


export { simplifyRouter, handleSimplify };