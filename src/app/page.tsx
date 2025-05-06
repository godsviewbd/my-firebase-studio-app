"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
	scriptureRetrieval,
	type ScriptureRetrievalInput,
	type ScriptureRetrievalOutput,
} from "@/ai/flows/scripture-retrieval";
import { 
	translateText,
	type TranslateTextInput,
	type TranslateTextOutput,
} from "@/ai/flows/translate-text";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
	Loader2,
	Search,
	AlertCircle,
	BookOpenText,
	Sparkles,
	ScrollText,
	BookHeart,
	HandHeart,
	Gem,
	Palette,
	LucideProps,
	Wheat,
	MoonStar,
	Flower2,
	Hand,
	Star,
	Circle as CircleIcon,
	Languages, // Icon for translation
} from "lucide-react";

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

const formSchema = z.object({
	question: z.string().min(10, {
		message: "Question must be at least 10 characters.",
	}),
	selectedReligions: z
		.array(z.string())
		.refine((value) => value.some(item => ALL_RELIGIONS.includes(item as Religion)), {
			message: "You have to select at least one religion.",
		})
		.refine((value) => value.length > 0, {
			message: "You have to select at least one religion.",
		}),
});

interface TranslatedTexts {
  [key: string]: { // key will be entry.scripture + '-' + entry.chapter + '-' + entry.verses + '-quote' or '-insight'
    text?: string;
    isLoading: boolean;
  }
}

export default function WisdomWellPage() {
	const [isLoading, setIsLoading] = React.useState(false);
	const [scriptureData, setScriptureData] =
		React.useState<ScriptureRetrievalOutput | null>(null);
	const [error, setError] = React.useState<string | null>(null);
	const [submittedQuestion, setSubmittedQuestion] = React.useState<string | null>(null);
	const { toast } = useToast();
	const [currentYear, setCurrentYear] = React.useState<number | null>(null);
	const [translatedTexts, setTranslatedTexts] = React.useState<TranslatedTexts>({});


	React.useEffect(() => {
		setCurrentYear(new Date().getFullYear());
	}, []);


	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			question: "",
			selectedReligions: [],
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsLoading(true);
		setError(null);
		setScriptureData(null);
		setSubmittedQuestion(values.question);
		setTranslatedTexts({}); // Reset translations for new search

		try {
			const input: ScriptureRetrievalInput = {
				question: values.question,
				religions: values.selectedReligions as Religion[],
			};
			const result = await scriptureRetrieval(input);
			setScriptureData(result);
			if (result.scriptureEntries.length === 0 && values.selectedReligions.length > 0) {
				toast({
					title: "No scriptures found",
					description: "Please try a different question or broaden your religion selection.",
					variant: "default",
				});
			}
		} catch (e) {
			const errorMessage =
				e instanceof Error ? e.message : "An unexpected error occurred.";
			setError(errorMessage);
			toast({
				variant: "destructive",
				title: "Error fetching wisdom",
				description: errorMessage,
			});
		} finally {
			setIsLoading(false);
		}
	}

	const handleTranslate = async (textToTranslate: string, entryIndex: number, type: 'quote' | 'insight') => {
		const entry = scriptureData?.scriptureEntries[entryIndex];
		if (!entry) return;
		
		const key = `${entry.scripture}-${entry.chapter}-${entry.verses}-${type}`;
		setTranslatedTexts(prev => ({ ...prev, [key]: { isLoading: true } }));

		try {
			const input: TranslateTextInput = { textToTranslate, targetLanguage: 'bn' };
			const result = await translateText(input);
			setTranslatedTexts(prev => ({ ...prev, [key]: { text: result.translatedText, isLoading: false } }));
		} catch (e) {
			const errorMessage = e instanceof Error ? e.message : "Translation failed.";
			toast({
				variant: "destructive",
				title: "Translation Error",
				description: errorMessage,
			});
			setTranslatedTexts(prev => ({ ...prev, [key]: { text: undefined, isLoading: false } }));
		}
	};

	const getReligionIcon = (religion: string): React.FC<LucideProps> => {
		const religionIcons: Record<string, React.FC<LucideProps>> = {
			Hinduism: Palette,
			Islam: MoonStar,
			Christianity: BookHeart,
			Buddhism: Flower2,
			Judaism: Star,
			Jainism: Hand,
			Sikhism: Gem,
			Taoism: CircleIcon,
			Default: Wheat,
		};
		return religionIcons[religion] || religionIcons["Default"];
	};

	const religionIconColors: Record<string, string> = {
		Hinduism: "text-orange-500",
		Islam: "text-emerald-500",
		Christianity: "text-sky-500",
		Buddhism: "text-pink-500",
		Judaism: "text-blue-600",
		Jainism: "text-yellow-600",
		Sikhism: "text-purple-500",
		Taoism: "text-gray-600",
		Default: "text-slate-500",
	};

	const religionBadgeStyles: Record<string, string> = {
		Hinduism: "bg-orange-100 text-orange-800 border-orange-300",
		Islam: "bg-emerald-100 text-emerald-800 border-emerald-300",
		Christianity: "bg-sky-100 text-sky-800 border-sky-300",
		Buddhism: "bg-pink-100 text-pink-800 border-pink-300",
		Judaism: "bg-blue-100 text-blue-800 border-blue-300",
		Jainism: "bg-yellow-100 text-yellow-800 border-yellow-300",
		Sikhism: "bg-purple-100 text-purple-800 border-purple-300",
		Taoism: "bg-gray-100 text-gray-800 border-gray-300",
		Default: "bg-slate-100 text-slate-800 border-slate-300",
	};


	const getReligionIconColor = (religion: string) => {
		return religionIconColors[religion] || religionIconColors["Default"];
	};

	const getReligionBadgeStyle = (religion: string) => {
		return religionBadgeStyles[religion] || religionBadgeStyles["Default"];
	};

	return (
		<div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 md:p-8 selection:bg-accent/30 selection:text-accent-foreground">
			<header className="w-full max-w-3xl mb-8 md:mb-12 text-center">
				<div className="flex items-center justify-center mb-4">
					<ScrollText className="w-12 h-12 md:w-16 md:h-16 text-accent" />
					<h1 className="text-4xl md:text-5xl font-bold ml-3 text-primary">
						WisdomWell
					</h1>
				</div>
				<p className="text-lg md:text-xl text-muted-foreground">
					Ask a question and receive wisdom from sacred texts.
				</p>
			</header>

			<main className="w-full max-w-3xl">
				<Card className="mb-8 shadow-lg rounded-xl">
					<CardHeader>
						<CardTitle className="text-2xl text-primary">
							Seek Wisdom
						</CardTitle>
						<CardDescription>
							Enter your question and select the religions whose sacred texts you'd like to explore.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-6"
							>
								<FormField
									control={form.control}
									name="question"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-lg font-semibold">Your Question</FormLabel>
											<FormControl>
												<Textarea
													placeholder="e.g., How can I find peace?"
													className="resize-none focus:ring-accent focus:border-accent rounded-lg shadow-sm text-base"
													rows={3}
													{...field}
													aria-label="Your Question"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="selectedReligions"
									render={({ field }) => (
										<FormItem>
											<div className="mb-3">
												<FormLabel className="text-lg font-semibold">
													Select Religions
												</FormLabel>
												<p className="text-sm text-muted-foreground">Choose at least one religion.</p>
											</div>
											<div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
												{ALL_RELIGIONS.map((religion) => {
													const ReligionIcon = getReligionIcon(religion);
													const iconColor = getReligionIconColor(religion);
													return (
														<FormItem
															key={religion}
															className="flex flex-row items-center space-x-2 p-2.5 rounded-md hover:bg-muted/50 transition-colors cursor-pointer border border-input hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
														>
															<FormControl>
																<Checkbox
																	checked={form.getValues("selectedReligions")?.includes(religion)}
																	onCheckedChange={(checked) => {
																		const currentValues = form.getValues("selectedReligions") || [];
																		let newValues: string[];
																		if (checked) {
																			newValues = [...currentValues, religion];
																		} else {
																			newValues = currentValues.filter(
																				(value) => value !== religion
																			);
																		}
																		form.setValue("selectedReligions", newValues, { shouldValidate: true });
																	}}
																	aria-labelledby={`religion-label-${religion}`}
																	id={`religion-checkbox-${religion}`}
																	className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
																/>
															</FormControl>
															<FormLabel id={`religion-label-${religion}`} htmlFor={`religion-checkbox-${religion}`} className="font-normal flex items-center cursor-pointer text-sm select-none w-full">
																<ReligionIcon className={`w-4 h-4 mr-2 ${iconColor} flex-shrink-0`} />
																{religion}
															</FormLabel>
														</FormItem>
													);
												})}
											</div>
											<FormMessage>{form.formState.errors.selectedReligions?.message}</FormMessage>
										</FormItem>
									)}
								/>


								<Button
									type="submit"
									className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg py-3 text-lg font-medium shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-[1.01]"
									disabled={isLoading || !form.formState.isValid}
									aria-label="Search for Wisdom"
								>
									{isLoading ? (
										<>
											<Loader2 className="mr-2 h-5 w-5 animate-spin" />
											Seeking Wisdom...
										</>
									) : (
										<>
											<Search className="mr-2 h-5 w-5" />
											Search for Wisdom
										</>
									)}
								</Button>
							</form>
						</Form>
					</CardContent>
				</Card>

				{isLoading && (
					<div className="flex flex-col justify-center items-center p-10 rounded-xl bg-card shadow-lg border animate-fadeIn">
						<Loader2 className="mr-3 h-10 w-10 animate-spin text-primary mb-4" />
						<p className="text-xl text-muted-foreground font-medium">Seeking wisdom from the ancients...</p>
						<p className="text-sm text-muted-foreground/80">Please wait a moment.</p>
					</div>
				)}

				{error && !isLoading && (
					<Alert variant="destructive" className="mb-8 animate-fadeIn rounded-lg shadow-md p-5">
						<AlertCircle className="h-6 w-6" />
						<AlertTitle className="font-semibold text-lg">An Error Occurred</AlertTitle>
						<AlertDescription className="mt-1">{error}</AlertDescription>
					</Alert>
				)}

				{submittedQuestion && !isLoading && (scriptureData || error) && (
					<Card className="mb-6 shadow-lg rounded-xl animate-fadeIn border">
						<CardHeader className="pb-3 pt-4">
							<CardTitle className="text-lg text-primary flex items-center">
								<HandHeart className="w-5 h-5 mr-2.5 text-accent flex-shrink-0" />
								Your Question:
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-0 pb-4">
							<p className="text-md text-foreground/90 italic">"{submittedQuestion}"</p>
						</CardContent>
					</Card>
				)}

				{scriptureData && scriptureData.scriptureEntries.length > 0 && !isLoading && (
					<div className="space-y-6">
						<h2 className="text-2xl font-semibold text-primary mb-4 mt-2">Wisdom Found:</h2>
						{scriptureData.scriptureEntries.map((entry, index) => {
							const ReligionIcon = getReligionIcon(entry.religion);
							const iconColor = getReligionIconColor(entry.religion);
							const badgeStyle = getReligionBadgeStyle(entry.religion);
							const quoteKey = `${entry.scripture}-${entry.chapter}-${entry.verses}-quote`;
							const insightKey = `${entry.scripture}-${entry.chapter}-${entry.verses}-insight`;

							return (
								<Card
									key={index}
									className="shadow-lg animate-fadeIn rounded-xl overflow-hidden border"
									style={{ animationDelay: `${index * 100}ms`, animationDuration: '0.4s' }}
								>
									<CardHeader className={`pb-3 pt-4 px-5 bg-muted/20 border-b`}>
										<div className="flex items-center justify-between">
											<CardTitle className="text-lg text-primary flex items-center">
												<ReligionIcon
													className={`w-5 h-5 mr-2.5 ${iconColor} flex-shrink-0`}
												/>
												{entry.religion}
											</CardTitle>
											<Badge
												variant="outline"
												className={`ml-2 ${badgeStyle} rounded-full px-2.5 py-0.5 text-xs font-medium`}
											>
												{entry.scripture}
											</Badge>
										</div>
										<CardDescription className="text-xs text-muted-foreground pt-1 pl-[calc(1.25rem+0.625rem)]"> {/* 1.25rem for icon width, 0.625rem for mr */}
											From: {entry.scripture}{entry.category ? ` (${entry.category})` : ''}, Chapter {entry.chapter}, Verse(s) {entry.verses}
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-3 p-5">
										<div>
											<div className="flex justify-between items-center mb-1.5">
												<h3 className="font-semibold text-base text-primary flex items-center">
													<BookOpenText className="w-4 h-4 mr-2 text-accent flex-shrink-0" />
													Quote:
												</h3>
												<Button variant="ghost" size="sm" onClick={() => handleTranslate(entry.answer, index, 'quote')} disabled={translatedTexts[quoteKey]?.isLoading}>
													{translatedTexts[quoteKey]?.isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Languages className="w-4 h-4"/>}
													<span className="ml-1.5 text-xs">বাংলা</span>
												</Button>
											</div>
											<blockquote className="text-foreground/90 leading-relaxed border-l-4 border-accent pl-3.5 py-1 italic text-[0.9rem]">
												{translatedTexts[quoteKey]?.text || entry.answer}
											</blockquote>
										</div>
										{entry.aiInsight && (
											<div>
												<div className="flex justify-between items-center mb-1.5">
													<h3 className="font-semibold text-base text-primary flex items-center">
														<Sparkles className="w-4 h-4 mr-2 text-accent flex-shrink-0" />
														{`Purpose according to ${entry.scripture}:`}
													</h3>
													<Button variant="ghost" size="sm" onClick={() => handleTranslate(entry.aiInsight, index, 'insight')} disabled={translatedTexts[insightKey]?.isLoading}>
														{translatedTexts[insightKey]?.isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Languages className="w-4 h-4"/>}
														<span className="ml-1.5 text-xs">বাংলা</span>
													</Button>
												</div>
												<p className="text-foreground/80 leading-relaxed text-[0.9rem]">
													{translatedTexts[insightKey]?.text || entry.aiInsight}
												</p>
											</div>
										)}
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}
				{scriptureData && scriptureData.scriptureEntries.length === 0 && !isLoading && !error && (
					<Card className="shadow-md animate-fadeIn text-center rounded-xl p-6 border-2 border-dashed border-muted-foreground/30 bg-card">
						<CardHeader className="p-0 mb-3">
							<CardTitle className="text-xl text-primary font-medium">No Scriptures Found</CardTitle>
						</CardHeader>
						<CardContent className="p-0">
							<p className="text-muted-foreground">
								We couldn't find any scriptures matching your query for the selected religions.
								<br />
								Please try rephrasing your question or selecting different religions.
							</p>
						</CardContent>
					</Card>
				)}
			</main>
			<footer className="w-full max-w-3xl mt-16 pt-8 pb-4 border-t border-border/80 text-center">
				<p className="text-sm text-muted-foreground">
					WisdomWell &copy; {currentYear ?? ""} - Your guide to multi-faith scriptural insights.
				</p>
				<p className="text-xs text-muted-foreground/80 mt-1">
					Created by SOZIB SORKAR
				</p>
				<p className="text-xs text-muted-foreground/70 mt-2">
					Remember to approach sacred texts with respect and an open mind. Interpretations may vary. This tool is for informational purposes.
				</p>
			</footer>
		</div>
	);
}
