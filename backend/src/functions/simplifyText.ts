import { TargetAudiences } from '../types';
import { createApiClient } from '../api/apiClient'
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
  const basePrompt = `
Simplify the following text for ${audience}:

"${text.trim()}"

Instructions: ${instructions}

Language: ${outputLanguage}
  `;

  const furtherSimplifyInstructions = `
  1. Do not write very long sentences, your response should be very brief.
  2. Do not add any quotation marks, special characters or symbols unless the original input text contains it.
  3. The language of the simplified text should match the language of the text I provide you with.
  4. Try to adhere to the context provided and ensure that the simplified text is clear and concise and makes sense in the context of the original text however don't add unnecessary details and make your response as brief as possible.
  5. Your response should only the contain the simplification of the sentence and nothing else.
  `;
  const furtherSimplifyPrompt = `
Simplify the following sentence for ${audience} based on the context provided:

sentence to simplify: "${text.trim()}"

Instructions: ${furtherSimplifyInstructions}
Context: ${context}
  `;

  const userPrompt = context ? furtherSimplifyPrompt : basePrompt;

  try {
    const apiClient = createApiClient(apiKey);
    const response = await apiClient.post('', {
      model: "gpt-5.4-nano",
      messages: [{ role: "user", content: userPrompt }],
      max_tokens: 200,
      temperature: 0.7,
    });
    return response.data.choices[0].message.content.trim();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error(`Error during text simplification: ${errorMessage}`);
    throw new Error(`Text simplification failed: ${errorMessage}`);
  }
};

export { simplifyText };