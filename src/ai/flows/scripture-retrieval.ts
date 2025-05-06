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
      category: z.string().optional().describe('A brief category for the scripture, if applicable (e.g., Veda, Upanishad, Hadith Collection, Gospel). This helps users understand the source type.')
    })
  ).describe('An array of scripture entries relevant to the question from the selected religions.'),
});
export type ScriptureRetrievalOutput = z.infer<typeof ScriptureRetrievalOutputSchema>;


const HINDUISM_SCRIPTURES = `🕉️ Hinduism:
    Sruti (Apaurusheya - "not of human agency", considered revealed):
        Vedas (Primary texts, e.g., Rig, Yajur, Sama, Atharva) - Category: Veda
        Upanishads (Philosophical texts, often part of Vedas, e.g., Isha, Kena, Katha, Brihadaranyaka, Chandogya, Mundaka, Mandukya, Prashna, Aitareya, Taittiriya, Shvetashvatara) - Category: Upanishad
        Aranyakas (Forest treatises, part of Vedas) - Category: Aranyaka
        Brahmanas (Commentaries on Vedas) - Category: Brahmana
    Smriti (Remembered texts, composed by sages):
        Bhagavad Gita (Part of Mahabharata, highly revered) - Category: Epic / Smriti
        Manusmriti, Yajnavalkya Smriti, Narada Smriti, Brihaspati Smriti (Law books) - Category: Smriti / Dharmashastra
        18 Major Puranas (Mythological and narrative texts, e.g., Vishnu Purana, Bhagavata Purana, Shiva Purana, Markandeya Purana, Garuda Purana, Padma Purana) and 18 Upapuranas - Category: Purana
        Epics: Mahabharata, Ramayana - Category: Epic
        Darshanas (Philosophical Schools): Nyaya Sutras, Vaisheshika Sutras, Samkhya Karika, Yoga Sutras of Patanjali, Mimamsa Sutras, Vedanta (Brahma Sutras) - Category: Darshana / Sutra
        Agamas (Tantric texts) - Category: Agama
        Sutras: Narada Bhakti Sutra, Shandilya Bhakti Sutra (Devotional texts) - Category: Sutra
        Upa-Vedas: Ayurveda (medicine), Dhanurveda (archery), Gandharvaveda (music/dance), Shilpaveda (architecture) - Category: Upa-Veda\n\n`;

const ISLAM_SCRIPTURES = `☪️ Islam:
    Primary:
        Qur'an - Category: Qur'an
    Secondary (Hadith Collections - sayings and actions of Prophet Muhammad):
        Sahih al-Bukhari - Category: Hadith Collection
        Sahih Muslim - Category: Hadith Collection
        Sunan Abu Dawood - Category: Hadith Collection
        Jami' at-Tirmidhi - Category: Hadith Collection
        Sunan an-Nasa'i - Category: Hadith Collection
        Sunan Ibn Majah - Category: Hadith Collection
        Muwatta Imam Malik - Category: Hadith Collection\n\n`;

const CHRISTIANITY_SCRIPTURES = `✝️ Christianity:
    Holy Bible:
        Old Testament (e.g., Genesis, Exodus, Psalms, Proverbs, Isaiah, Ecclesiastes, Micah) - Category: Old Testament
        New Testament (e.g., Gospels - Matthew, Mark, Luke, John; Epistles - Romans, Corinthians, Ephesians; Revelation) - Category: New Testament (specify Gospel, Epistle, etc. if possible for 'scripture' field, e.g. Gospel of Matthew)\n\n`;

const BUDDHISM_SCRIPTURES = `☸️ Buddhism:
    Pali Canon (Tipitaka - "Three Baskets", primary scriptures for Theravada Buddhism):
        Vinaya Pitaka (Monastic discipline) - Category: Vinaya Pitaka
        Sutta Pitaka (Discourses - e.g., Digha Nikaya, Majjhima Nikaya, Samyutta Nikaya, Anguttara Nikaya, Khuddaka Nikaya which includes Dhammapada, Sutta Nipata, Jataka tales) - Category: Sutta Pitaka (Dhammapada can be 'scripture')
        Abhidhamma Pitaka (Philosophy/psychology) - Category: Abhidhamma Pitaka
    Mahayana Sutras (Key texts for Mahayana Buddhism):
        Prajnaparamita Sutras (e.g., Heart Sutra, Diamond Sutra) - Category: Mahayana Sutra
        Lotus Sutra - Category: Mahayana Sutra
        Avatamsaka Sutra - Category: Mahayana Sutra
        Lankavatara Sutra - Category: Mahayana Sutra
        Pure Land Sutras - Category: Mahayana Sutra
    Tibetan Book of the Dead (Bardo Thodol) - Category: Vajrayana Text (Tibetan Buddhism)\n\n`;

const JUDAISM_SCRIPTURES = `🕎 Judaism:
    Tanakh (Hebrew Bible):
        Torah (Pentateuch: Genesis, Exodus, Leviticus, Numbers, Deuteronomy) - Category: Torah
        Nevi'im (Prophets: e.g., Joshua, Judges, Samuel, Kings, Isaiah, Jeremiah, Ezekiel, Micah) - Category: Nevi'im
        Ketuvim (Writings: e.g., Psalms, Proverbs, Job, Song of Songs, Ruth, Lamentations, Ecclesiastes, Esther, Daniel, Ezra-Nehemiah, Chronicles) - Category: Ketuvim
    Talmud (Rabbinic commentary and law):
        Mishnah - Category: Talmud / Mishnah
        Gemara - Category: Talmud / Gemara
    Midrash (Rabbinic exegesis) - Category: Midrash
    Zohar (Primary text of Kabbalah) - Category: Kabbalah / Mysticism\n\n`;

const JAINISM_SCRIPTURES = `🛕 Jainism:
    Agamas (Canonical scriptures, divided into Angas, Upangas, Prakirnakas, Chedasutras, Mulasutras)
        Example: Acharanga Sutra, Sutrakritanga Sutra, Kalpa Sutra - Category: Agama / Sutra
    Tattvartha Sutra (Major philosophical text accepted by all sects) - Category: Philosophical Text / Sutra
    Samayasara (by Acharya Kundakunda) - Category: Philosophical Text
    Ratnakaranda Sravakacara - Category: Ethical Text\n\n`;

const SIKHISM_SCRIPTURES = `🛐 Sikhism:
    Primary:
        Guru Granth Sahib (Referred to by Ang or Page number, and often by Mehl indicating the Guru) - Category: Guru Granth Sahib
    Secondary:
        Dasam Granth (Writings attributed to Guru Gobind Singh) - Category: Dasam Granth
        Varan Bhai Gurdas (Commentaries by Bhai Gurdas) - Category: Commentary
        Janamsakhis (Biographies of Guru Nanak) - Category: Biography\n\n`;

const TAOISM_SCRIPTURES = `☯️ Taoism:
    Tao Te Ching (Daodejing) - by Laozi - Category: Core Text / Philosophy
    Zhuangzi (Chuang Tzu) - Category: Core Text / Philosophy
    Liezi - Category: Core Text / Philosophy
    Daozang (Taoist Canon - a vast collection of texts) - Category: Canon / Collection\n\n`;


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
  dynamicScriptureText: z.string().describe("The dynamically generated list of scriptures based on selected religions, including category hints."),
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
    -   The 'scripture' field should be the specific name of the text (e.g., Bhagavad Gita, Qur'an, Gospel of Matthew, Dhammapada).
    -   The 'category' field should be a brief contextual category (e.g., Veda, Upanishad, Epic, Hadith Collection, Gospel, Mahayana Sutra). Refer to the "Category:" hints in the "Available Scriptures" section for this. If a scripture is listed without a specific category hint but is clearly part of a larger categorized group (like a specific Upanishad under "Upanishads"), infer the category. If unclear, you may omit 'category'.
    -   The 'aiInsight' field should be a brief, respectful spiritual explanation or interpretation. It should contain ONLY the explanation itself. Do NOT include "Purpose according to [Scripture Name]:" as a prefix; the UI will handle this. For example, if the scripture is Bhagavad Gita, and the insight is about fulfilling dharma, the 'aiInsight' field should just be "Fulfill your dharma (duty) selflessly to attain spiritual liberation (moksha)."

5.  If, for a particular selected religion, you cannot find any relevant scripture for the question (neither direct nor closely related), do NOT include an entry for that religion in the output.
6.  Ensure all references (scripture name, chapter, verses) are accurate and complete.
7.  The 'answer' field should contain ONLY the scriptural quote.

Available Scriptures by Selected Religion (search within these for the selected religions, paying attention to "Category:" hints for the 'category' field in your JSON output):
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
    if (!flowInput.religions || flowInput.religions.length === 0) {
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