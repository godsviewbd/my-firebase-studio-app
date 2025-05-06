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
  religions: z.array(z.enum(ALL_RELIGIONS)).describe('An array of selected religions to search scriptures from.'),
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
        .optional()
        .describe('A brief, respectful explanation or interpretation of the scripture\'s message in relation to the question, formatted as "Purpose according to [Scripture Name]: [explanation]".'),
      religion: z.string().describe('The religion associated with the scripture (e.g., Hinduism, Islam, Christianity).'),
    })
  ).describe('An array of scripture entries relevant to the question from the selected religions.'),
});
export type ScriptureRetrievalOutput = z.infer<typeof ScriptureRetrievalOutputSchema>;

export async function scriptureRetrieval(input: ScriptureRetrievalInput): Promise<ScriptureRetrievalOutput> {
  return scriptureRetrievalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scriptureRetrievalPrompt',
  input: {schema: ScriptureRetrievalInputSchema},
  output: {schema: ScriptureRetrievalOutputSchema},
  prompt: `You are a spiritually informed AI assistant for a multi-faith wisdom app. Your goal is to provide answers from authentic and verified scriptural sources based on the user's question and selected religions.

User's Question: "{{question}}"
Selected Religions for Search: {{#each religions}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

Instructions:
1.  For EACH selected religion, search its primary AND secondary sacred texts for the most relevant and direct answer to the user's question.
2.  If a direct answer is found in a scripture, prioritize that.
3.  If no direct answer is found, search across all holy books of that specific selected religion for a closely related answer or teaching.
4.  For each relevant scripture found, provide the output in the EXACT following format:
    -   Religion: The religion (e.g., Hinduism, Islam). This will be used to group entries.
    -   Scripture: The specific name of the scripture text (e.g., Bhagavad Gita, Qur'an, Bible, Dhammapada, Tanakh, Guru Granth Sahib).
    -   Chapter: The chapter, canto, or section (e.g., Chapter 3, Surah 51, Ecclesiastes Chapter 12, Verse 183, Micah Chapter 6, Ang 1).
    -   Verses: The verse number(s) (e.g., 19, 56, 13, 8, "First Mehl").
    -   Answer: The direct, translated quote from the scripture.
    -   AI Insight (Optional): A brief, respectful spiritual explanation, interpretation, or context of how the quote answers the question. This MUST be phrased as: "Purpose according to [Scripture Name]: [Your explanation here]". For example: "Purpose according to Bhagavad Gita: Fulfill your dharma (duty) selflessly to attain spiritual liberation (moksha)."

5.  If, for a particular selected religion, you cannot find any relevant scripture for the question (neither direct nor closely related), do NOT include an entry for that religion in the output.
6.  Ensure all references (scripture name, chapter, verses) are accurate and complete.
7.  The 'answer' field should contain ONLY the scriptural quote. The 'aiInsight' field should contain ONLY your respectful explanation.

Available Scriptures by Religion (search within these for the selected religions):

{{#includes religions "Hinduism"}}
🕉️ Hinduism:
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
        Upa-Vedas: Ayurveda (medicine), Dhanurveda (archery), Gandharvaveda (music/dance), Shilpaveda (architecture)
{{/includes}}

{{#includes religions "Islam"}}
☪️ Islam:
    Primary:
        Qur'an
    Secondary (Hadith Collections - provide specific collection if possible):
        Sahih al-Bukhari
        Sahih Muslim
        Sunan Abu Dawood
        Jami' at-Tirmidhi
        Sunan an-Nasa'i
        Sunan Ibn Majah
        Muwatta Imam Malik
{{/includes}}

{{#includes religions "Christianity"}}
✝️ Christianity:
    Holy Bible:
        Old Testament (e.g., Genesis, Exodus, Psalms, Proverbs, Isaiah, Ecclesiastes, Micah)
        New Testament (e.g., Gospels - Matthew, Mark, Luke, John; Epistles - Romans, Corinthians, Ephesians; Revelation)
{{/includes}}

{{#includes religions "Buddhism"}}
☸️ Buddhism:
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
    Tibetan Book of the Dead (Bardo Thodol) - Vajrayana
{{/includes}}

{{#includes religions "Judaism"}}
🕎 Judaism:
    Tanakh (Hebrew Bible):
        Torah (Pentateuch: Genesis, Exodus, Leviticus, Numbers, Deuteronomy)
        Nevi'im (Prophets: e.g., Joshua, Judges, Samuel, Kings, Isaiah, Jeremiah, Ezekiel, Micah)
        Ketuvim (Writings: e.g., Psalms, Proverbs, Job, Song of Songs, Ruth, Lamentations, Ecclesiastes, Esther, Daniel, Ezra-Nehemiah, Chronicles)
    Talmud:
        Mishnah
        Gemara
    Midrash
    Zohar (Kabbalah)
{{/includes}}

{{#includes religions "Jainism"}}
🛕 Jainism:
    Agamas (canonical scriptures, divided into Angas, Upangas, Prakirnakas, Chedasutras, Mulasutras)
        Example: Acharanga Sutra, Sutrakritanga Sutra, Kalpa Sutra
    Tattvartha Sutra (major philosophical text accepted by all sects)
    Samayasara (by Acharya Kundakunda)
    Ratnakaranda Sravakacara
{{/includes}}

{{#includes religions "Sikhism"}}
🛐 Sikhism:
    Primary:
        Guru Granth Sahib (referred to by Ang or Page number, and often by Mehl indicating the Guru)
    Secondary:
        Dasam Granth (writings attributed to Guru Gobind Singh)
        Varan Bhai Gurdas (commentaries by Bhai Gurdas)
        Janamsakhis (biographies of Guru Nanak)
{{/includes}}

{{#includes religions "Taoism"}}
☯️ Taoism:
    Tao Te Ching (Daodejing) - by Laozi
    Zhuangzi (Chuang Tzu)
    Liezi
    Daozang (Taoist Canon - a vast collection of texts)
{{/includes}}

Return an array of scripture entries in the 'scriptureEntries' field of the JSON output. If no relevant scriptures are found for ANY of the selected religions, return an empty array for 'scriptureEntries'.
`,
  helpers: {
    includes: function (array: any[], value: any, options: any) {
      if (array && array.includes(value)) {
        return options.fn(this);
      }
      return options.inverse(this);
    }
  }
});

const scriptureRetrievalFlow = ai.defineFlow(
  {
    name: 'scriptureRetrievalFlow',
    inputSchema: ScriptureRetrievalInputSchema,
    outputSchema: ScriptureRetrievalOutputSchema,
  },
  async (input) => {
    // Ensure at least one religion is selected, though form validation should handle this.
    if (!input.religions || input.religions.length === 0) {
        return { scriptureEntries: [] };
    }
    const {output} = await prompt(input);
    return output!;
  }
);

    
