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

const ALL_RELIGIONS = [
	"Hinduism",
	"Islam",
	"Christianity",
	"Buddhism",
	"Judaism",
	"Jainism",
	"Sikhism",
	"Taoism",
] as const;

type Religion = (typeof ALL_RELIGIONS)[number];


const ScriptureRetrievalInputSchema = z.object({
  question: z.string().describe('The question to be answered using scripture.'),
  religions: z.array(z.enum(ALL_RELIGIONS)).min(1,"At least one religion must be selected.").describe('An array of selected religions to search scriptures from.'),
});
export type ScriptureRetrievalInput = z.infer<typeof ScriptureRetrievalInputSchema>;

const ScriptureRetrievalOutputSchema = z.object({
  scriptureEntries: z.array(
    z.object({
      scripture: z.string().describe('The name of the scripture (e.g., Bhagavad Gita, Qur\'an, Bible).'),
      chapter: z.string().describe('The chapter of the scripture (e.g., 3, 51, Ecclesiastes 12).'),
      verses: z.string().describe('The verse(s) from the scripture (e.g., 19, 56, 13).'),
      answer: z.string().describe('The direct quote from the scripture.'),
      aiInsight: z
        .string()
        .describe('A brief, respectful explanation or interpretation of the scripture\'s message in relation to the question. This should be the explanation part ONLY, do NOT include "Purpose according to [Scripture Name]:" as this prefix will be added by the UI.'),
      religion: z.enum(ALL_RELIGIONS).describe('The religion associated with the scripture (e.g., Hinduism, Islam, Christianity).'),
    })
  ).describe('An array of scripture entries relevant to the question from the selected religions.'),
});
export type ScriptureRetrievalOutput = z.infer<typeof ScriptureRetrievalOutputSchema>;


const HINDUISM_SCRIPTURES = `🕉️ Hinduism:
    Sruti (Apaurusheya):
        Vedas – Rig, Yajur, Sama, Atharva
        Upanishads (e.g., Isha, Kena, Katha, Brihadaranyaka, Chandogya, Mundaka, Mandukya, Prashna, Aitareya, Taittiriya, Shvetashvatara)
        Aranyakas
        Brahmanas
    Smriti:
        Bhagavad Gita (part of Mahabharata)
        Manusmriti, Yajnavalkya Smriti, Narada Smriti, Brihaspati Smriti
        18 Major Puranas (e.g., Vishnu Purana, Bhagavata Purana, Shiva Purana, Markandeya Purana, Garuda Purana, Padma Purana) and 18 Upapuranas
        Epics: Mahabharata, Ramayana
        Darshanas (Philosophical Schools): Nyaya Sutras, Vaisheshika Sutras, Samkhya Karika, Yoga Sutras of Patanjali, Mimamsa Sutras, Vedanta (Brahma Sutras)
        Agamas (Tantric texts)
        Sutras: Narada Bhakti Sutra, Shandilya Bhakti Sutra
        Upa-Vedas: Ayurveda (medicine), Dhanurveda (archery), Gandharvaveda (music/dance), Shilpaveda (architecture)\n\n`;

const ISLAM_SCRIPTURES = `☪️ Islam:
    Primary:
        Qur'an
    Secondary (Hadith Collections - provide specific collection if possible):
        Sahih al-Bukhari
        Sahih Muslim
        Sunan Abu Dawood
        Jami' at-Tirmidhi
        Sunan an-Nasa'i
        Sunan Ibn Majah
        Muwatta Imam Malik\n\n`;

const CHRISTIANITY_SCRIPTURES = `✝️ Christianity:
    Holy Bible:
        Old Testament (e.g., Genesis, Exodus, Psalms, Proverbs, Isaiah, Ecclesiastes, Micah)
        New Testament (e.g., Gospels - Matthew, Mark, Luke, John; Epistles - Romans, Corinthians, Ephesians; Revelation)\n\n`;

const BUDDHISM_SCRIPTURES = `☸️ Buddhism:
    Pali Canon (Tipitaka):
        Vinaya Pitaka (monastic discipline)
        Sutta Pitaka (discourses - e.g., Digha Nikaya, Majjhima Nikaya, Samyutta Nikaya, Anguttara Nikaya, Khuddaka Nikaya which includes Dhammapada, Sutta Nipata, Jataka tales)
        Abhidhamma Pitaka (philosophy/psychology)
    Mahayana Sutras:
        Prajnaparamita Sutras (e.g., Heart Sutra, Diamond Sutra)
        Lotus Sutra
        Avatamsaka Sutra
        Lankavatara Sutra
        Pure Land Sutras
    Tibetan Book of the Dead (Bardo Thodol) - Vajrayana\n\n`;

const JUDAISM_SCRIPTURES = `🕎 Judaism:
    Tanakh (Hebrew Bible):
        Torah (Pentateuch: Genesis, Exodus, Leviticus, Numbers, Deuteronomy)
        Nevi'im (Prophets: e.g., Joshua, Judges, Samuel, Kings, Isaiah, Jeremiah, Ezekiel, Micah)
        Ketuvim (Writings: e.g., Psalms, Proverbs, Job, Song of Songs, Ruth, Lamentations, Ecclesiastes, Esther, Daniel, Ezra-Nehemiah, Chronicles)
    Talmud:
        Mishnah
        Gemara
    Midrash
    Zohar (Kabbalah)\n\n`;

const JAINISM_SCRIPTURES = `🛕 Jainism:
    Agamas (canonical scriptures, divided into Angas, Upangas, Prakirnakas, Chedasutras, Mulasutras)
        Example: Acharanga Sutra, Sutrakritanga Sutra, Kalpa Sutra
    Tattvartha Sutra (major philosophical text accepted by all sects)
    Samayasara (by Acharya Kundakunda)
    Ratnakaranda Sravakacara\n\n`;

const SIKHISM_SCRIPTURES = `🛐 Sikhism:
    Primary:
        Guru Granth Sahib (referred to by Ang or Page number, and often by Mehl indicating the Guru)
    Secondary:
        Dasam Granth (writings attributed to Guru Gobind Singh)
        Varan Bhai Gurdas (commentaries by Bhai Gurdas)
        Janamsakhis (biographies of Guru Nanak)\n\n`;

const TAOISM_SCRIPTURES = `☯️ Taoism:
    Tao Te Ching (Daodejing) - by Laozi
    Zhuangzi (Chuang Tzu)
    Liezi
    Daozang (Taoist Canon - a vast collection of texts)\n\n`;


const getScriptureListForPrompt = (selectedReligions: Religion[]): string => {
  let content = "";
  if (selectedReligions.includes("Hinduism")) content += HINDUISM_SCRIPTURES;
  if (selectedReligions.includes("Islam")) content += ISLAM_SCRIPTURES;
  if (selectedReligions.includes("Christianity")) content += CHRISTIANITY_SCRIPTURES;
  if (selectedReligions.includes("Buddhism")) content += BUDDHISM_SCRIPTURES;
  if (selectedReligions.includes("Judaism")) content += JUDAISM_SCRIPTURES;
  if (selectedReligions.includes("Jainism")) content += JAINISM_SCRIPTURES;
  if (selectedReligions.includes("Sikhism")) content += SIKHISM_SCRIPTURES;
  if (selectedReligions.includes("Taoism")) content += TAOISM_SCRIPTURES;
  return content;
};

const PromptInputSchema = z.object({
  question: z.string(),
  religionsForDisplay: z.string().describe("Comma-separated string of selected religions for display in the prompt."),
  dynamicScriptureText: z.string().describe("The dynamically generated list of scriptures based on selected religions."),
});

const retrievalPrompt = ai.definePrompt({
  name: 'scriptureRetrievalPrompt',
  input: { schema: PromptInputSchema },
  output: { schema: ScriptureRetrievalOutputSchema },
  prompt: `You are a spiritually informed AI assistant for a multi-faith wisdom app. Your goal is to provide answers from authentic and verified scriptural sources based on the user's question and selected religions.

User's Question: "{{question}}"
Selected Religions for Search: {{religionsForDisplay}}

Instructions:
1.  For EACH selected religion (as indicated in "Selected Religions for Search"), search its primary AND secondary sacred texts (as detailed in the "Available Scriptures by Selected Religion" section below) for the most relevant and direct answer to the user's question.
2.  If a direct answer is found in a specific scripture, prioritize that.
3.  If no direct answer is found in primary texts, search across all holy books of that specific selected religion (from the detailed list for that religion below) for a closely related answer or teaching.
4.  For each relevant scripture found, provide the output in the EXACT JSON format specified. The 'religion' field must be one of the selected religions.
    -   The 'aiInsight' field should be a brief, respectful spiritual explanation or interpretation. It should contain ONLY the explanation itself. Do NOT include "Purpose according to [Scripture Name]:" as a prefix; the UI will handle this. For example, if the scripture is Bhagavad Gita, and the insight is about fulfilling dharma, the 'aiInsight' field should just be "Fulfill your dharma (duty) selflessly to attain spiritual liberation (moksha)."

5.  If, for a particular selected religion, you cannot find any relevant scripture for the question (neither direct nor closely related), do NOT include an entry for that religion in the output.
6.  Ensure all references (scripture name, chapter, verses) are accurate and complete.
7.  The 'answer' field should contain ONLY the scriptural quote.

Available Scriptures by Selected Religion (search within these for the selected religions):
{{{dynamicScriptureText}}}

Return an array of scripture entries in the 'scriptureEntries' field of the JSON output. If no relevant scriptures are found for ANY of the selected religions, return an empty array for 'scriptureEntries'.
`,
});

const scriptureRetrievalFlow = ai.defineFlow(
  {
    name: 'scriptureRetrievalFlow',
    inputSchema: ScriptureRetrievalInputSchema, 
    outputSchema: ScriptureRetrievalOutputSchema,
  },
  async (flowInput) => {
    // Input validation (already done by Zod schema on flowInput, but good for direct calls)
    if (!flowInput.religions || flowInput.religions.length === 0) {
        // console.warn("scriptureRetrievalFlow called with no religions.");
        return { scriptureEntries: [] };
    }

    const dynamicScriptureText = getScriptureListForPrompt(flowInput.religions);
    const religionsForDisplay = flowInput.religions.join(', ');

    const promptPayload = {
        question: flowInput.question,
        religionsForDisplay: religionsForDisplay,
        dynamicScriptureText: dynamicScriptureText,
    };
    
    const {output} = await retrievalPrompt(promptPayload);
    
    // Ensure aiInsight doesn't accidentally contain the prefix, though prompt instructs against it.
    if (output && output.scriptureEntries) {
        output.scriptureEntries = output.scriptureEntries.map(entry => {
            if (entry.aiInsight && entry.scripture && entry.aiInsight.toLowerCase().startsWith(`purpose according to ${entry.scripture.toLowerCase()}:`)) {
                const prefixLength = `Purpose according to ${entry.scripture}:`.length;
                entry.aiInsight = entry.aiInsight.substring(prefixLength).trim();
            }
            return entry;
        });
    }
    return output!;
  }
);

export async function scriptureRetrieval(input: ScriptureRetrievalInput): Promise<ScriptureRetrievalOutput> {
  return scriptureRetrievalFlow(input);
}

    