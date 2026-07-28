import { TargetAudiences } from '../types';
import { createApiClient } from '../api/apiClient'
import { CHAT_COMPLETIONS, describeApiError, fallbacksDisabled, getModel } from '../api/llmConfig'
// Simplify text based on user group in a chosen language
const simplifyText = async (text: string, userGroup: TargetAudiences, outputLanguage: string, apiKey: string, context?: string): Promise<string> => {
  const instructions = `
  1. Do no write very long sentences.
  2. Do not add any quotation marks, special characters or symbols unless the original input text contains it.
  3. If the provided text is a URL, you need to visit the URL, summarise the contents, and finally simplify the summary into plain language.
  4. If I provide you with a language, you need to first simplify the text into plain language and then translate it into the provided language.
  5. Your response should only the contain the summary and nothing else.
  `;

  // Map user groups to audience-specific prompts
  const targetAudience: Record<TargetAudiences, string> = {
    [TargetAudiences.ScientistsResearchers]: "scientists and researchers",
    [TargetAudiences.StudentsAcademics]: "students and academics",
    [TargetAudiences.IndustryProfessionals]: "industry professionals",
    [TargetAudiences.JournalistsMedia]: "journalists and media professionals",
    [TargetAudiences.GeneralPublic]: "the general public (non-expert audience)",
  };

  const audience = targetAudience[userGroup];
  // The frontend sends `language: outputLanguage || null`, so this can arrive empty.
  const language = outputLanguage || "the same language as the input text";
  const basePrompt = `
Simplify the following text for ${audience}:

"${text.trim()}"

Instructions: ${instructions}

Language: ${language}
  `;

  const furtherSimplifyInstructions = `
  1. Do not write very long sentences, your response should be very brief.
  2. Do not add any quotation marks, special characters or symbols unless the original input text contains it.
  3. Write the simplified sentence in the language given under "Language", translating it if the sentence is in a different language.
  4. Try to adhere to the context provided and ensure that the simplified text is clear and concise and makes sense in the context of the original text however don't add unnecessary details and make your response as brief as possible.
  5. Your response should only the contain the simplification of the sentence and nothing else.
  `;
  const furtherSimplifyPrompt = `
Simplify the following sentence for ${audience} based on the context provided:

sentence to simplify: "${text.trim()}"

Instructions: ${furtherSimplifyInstructions}
Context: ${context}

Language: ${language}
  `;

  const userPrompt = context ? furtherSimplifyPrompt : basePrompt;

  try {
    const apiClient = createApiClient(apiKey);
    const response = await apiClient.post(CHAT_COMPLETIONS, {
      model: getModel(),
      messages: [{ role: "user", content: userPrompt }],
      max_tokens: 200,
      temperature: 0.7,
      disable_fallbacks: fallbacksDisabled(),
    });
    return response.data.choices[0].message.content.trim();
  } catch (error: unknown) {
    const errorMessage = describeApiError(error);
    console.error(`Error during text simplification: ${errorMessage}`);
    throw new Error(`Text simplification failed: ${errorMessage}`);
  }
};

export { simplifyText };