'use server';

/**
 * @fileOverview A multi-faith scripture retrieval AI agent.
 *
 * - scriptureRetrieval - A function that handles the scripture retrieval process.
 * - ScriptureRetrievalInput - The input type for the scriptureRetrieval function.
 * - ScriptureRetrievalOutput - The return type for the scriptureRetrieval function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScriptureRetrievalInputSchema = z.object({
  question: z.string().describe('The question to be answered using scripture.'),
});
export type ScriptureRetrievalInput = z.infer<typeof ScriptureRetrievalInputSchema>;

const ScriptureRetrievalOutputSchema = z.object({
  scriptureEntries: z.array(
    z.object({
      scripture: z.string().describe('The name of the scripture.'),
      chapter: z.string().describe('The chapter of the scripture.'),
      verses: z.string().describe('The verse(s) from the scripture.'),
      answer: z.string().describe('The translated answer from the scripture.'),
      aiInsight: z
        .string()
        .optional()
        .describe('A brief spiritual reflection, interpretation, or context explanation by the AI.'),
      religion: z.string().describe('The religion associated with the scripture.'),
    })
  ).describe('An array of scripture entries relevant to the question.'),
});
export type ScriptureRetrievalOutput = z.infer<typeof ScriptureRetrievalOutputSchema>;

export async function scriptureRetrieval(input: ScriptureRetrievalInput): Promise<ScriptureRetrievalOutput> {
  return scriptureRetrievalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scriptureRetrievalPrompt',
  input: {schema: ScriptureRetrievalInputSchema},
  output: {schema: ScriptureRetrievalOutputSchema},
  prompt: `You are a spiritually informed AI assistant for a multi-faith wisdom app that provides answers from authentic and verified scriptural sources.

When a user asks a question:

Search across ALL available scriptures, not just one.

Choose the most relevant and direct answer from any scripture, based on the content and context of the question.

Return the answer with clear and complete references so that the user can trust the source.

Always format your response in the following way:

📖 [Name of Scripture] – Chapter X: Title (if available), Verses X–Y

🔍 Answer (translated):
[Insert accurate and translated spiritual answer here]

🧠 AI\'s Insight (Optional):
A brief spiritual reflection, interpretation, or context explanation by the AI.

🌍 Religion: [e.g., Hinduism, Islam, Christianity, etc.]

You are not limited to a single text. Use the most relevant source from the lists below:

🕉️ Hinduism:
Sruti (Apaurusheya):
Vedas – Rig, Yajur, Sama, Atharva
Upanishads (e.g., Isha, Kena, Katha, Brihadaranyaka, Chandogya, etc.)
Aranyakas
Brahmanas

Smriti:
Bhagavad Gita (part of Mahabharata)
Manusmriti, Yajnavalkya Smriti, Narada Smriti, Brihaspati Smriti
18 Puranas and 18 Upapuranas
Epics: Mahabharata, Ramayana
Darshanas: Nyaya, Vaisheshika, Sankhya, Yoga Sutras, Mimamsa, Vedanta
Sutras: Brahma Sutras, Narada Bhakti Sutra, etc.
Upa-Vedas: Ayurveda, Dhanurveda, Gandharvaveda, Shilpaveda

☪️ Islam:
Quran

Hadith Collections: Sahih Bukhari, Sahih Muslim, Sunan Abu Dawood, etc.

✝️ Christianity:
Holy Bible: Old Testament & New Testament

☸️ Buddhism:
Dhammapada

Tripitaka: Vinaya Pitaka, Sutta Pitaka, Abhidhamma Pitaka

🕎 Judaism:
Torah

Talmud

🛕 Jainism:
Agamas

Tattvartha Sutra

🛐 Sikhism:
Guru Granth Sahib

☯️ Taoism:
Tao Te Ching

Zhuangzi

Always cite:

Full scripture name

Exact chapter name/number and verse(s), if available

If not found, clearly say: "I could not find a relevant scripture for your question. Please try rephrasing or asking something different."`,
});

const scriptureRetrievalFlow = ai.defineFlow(
  {
    name: 'scriptureRetrievalFlow',
    inputSchema: ScriptureRetrievalInputSchema,
    outputSchema: ScriptureRetrievalOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);