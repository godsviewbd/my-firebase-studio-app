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
	HelpingHand,
	Paintbrush,
	Moon,
	BookOpen,
	Sprout,
	Leaf,
	Circle as CircleIconTaoism,
	CircleHelp,
	LucideProps,
} from "lucide-react";

// Inline SVG for Star of David as Lucide doesn't have a direct equivalent
const StarOfDavidIcon: React.FC<LucideProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.73 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
  </svg>
);

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
		.refine((value) => value.length > 0, {
			message: "You have to select at least one religion.",
		}),
});

export default function WisdomWellPage() {
	const [isLoading, setIsLoading] = React.useState(false);
	const [scriptureData, setScriptureData] =
		React.useState<ScriptureRetrievalOutput | null>(null);
	const [error, setError] = React.useState<string | null>(null);
	const [submittedQuestion, setSubmittedQuestion] = React.useState<string | null>(null);
	const { toast } = useToast();

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

	const getReligionIcon = (religion: string): React.FC<LucideProps> => {
		const religionIcons: Record<string, React.FC<LucideProps>> = {
			Hinduism: Paintbrush,
			Islam: Moon,
			Christianity: BookOpen,
			Buddhism: Sprout,
			Judaism: StarOfDavidIcon,
			Jainism: HelpingHand,
			Sikhism: Leaf,
			Taoism: CircleIconTaoism,
			Default: HelpingHand,
		};
		return religionIcons[religion] || religionIcons["Default"];
	};

	const religionIconColors: Record<string, string> = {
		Hinduism: "text-orange-500",
		Islam: "text-emerald-500",
		Christianity: "text-sky-500",
		Buddhism: "text-pink-500",
		Judaism: "text-blue-600",
		Jainism: "text-yellow-500", // Adjusted for visibility
		Sikhism: "text-purple-500",
		Taoism: "text-gray-500",
		Default: "text-slate-400",
	};

	const religionBadgeStyles: Record<string, string> = {
		Hinduism: "bg-orange-100 text-orange-700 border-orange-200",
		Islam: "bg-emerald-100 text-emerald-700 border-emerald-200",
		Christianity: "bg-sky-100 text-sky-700 border-sky-200",
		Buddhism: "bg-pink-100 text-pink-700 border-pink-200",
		Judaism: "bg-blue-100 text-blue-700 border-blue-200",
		Jainism: "bg-yellow-100 text-yellow-700 border-yellow-200",
		Sikhism: "bg-purple-100 text-purple-700 border-purple-200",
		Taoism: "bg-gray-100 text-gray-700 border-gray-200",
		Default: "bg-slate-100 text-slate-700 border-slate-200",
	};

	const getReligionIconColor = (religion: string) => {
		return religionIconColors[religion] || religionIconColors["Default"];
	};

	const getReligionBadgeStyle = (religion: string) => {
		return religionBadgeStyles[religion] || religionBadgeStyles["Default"];
	};

	// Local state to manage selected religions for the UI
	const [selectedReligions, setSelectedReligions] = React.useState<string[]>([]);

	// Handler to update selected religions
	const handleReligionChange = (religion: string) => {
		setSelectedReligions((prev) => {
			if (prev.includes(religion)) {
				return prev.filter((r) => r !== religion);
			} else {
				return [...prev, religion];
			}
		});
	};

	React.useEffect(() => {
		// Set the form's selectedReligions field whenever the local state changes
		form.setValue("selectedReligions", selectedReligions);
	}, [selectedReligions, form.setValue]);

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
									render={() => (
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
															className="flex flex-row items-center space-x-2 p-2.5 rounded-md hover:bg-muted/50 transition-colors cursor-pointer border border-input hover:border-primary/50 data-[state=checked]:border-primary"
															onClick={() => handleReligionChange(religion)}
															data-state={selectedReligions.includes(religion) ? 'checked' : 'unchecked'}
														>
															<FormControl>
																<Checkbox
																	checked={selectedReligions.includes(religion)}
																	aria-labelledby={`religion-label-${religion}`}
																	id={`religion-checkbox-${religion}`}
																	onChange={() => handleReligionChange(religion)} // Ensure checkbox also triggers the change
																/>
															</FormControl>
															<FormLabel id={`religion-label-${religion}`} htmlFor={`religion-checkbox-${religion}`} className="font-normal flex items-center cursor-pointer text-sm select-none">
																<ReligionIcon className={`w-4 h-4 mr-2 ${iconColor} flex-shrink-0`} />
																{religion}
															</FormLabel>
														</FormItem>
													);
												})}
											</div>
											<FormMessage />
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
								<CircleHelp className="w-5 h-5 mr-2.5 text-accent flex-shrink-0" />
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
							return (
								<Card
									key={index}
									className="shadow-lg animate-fadeIn rounded-xl overflow-hidden border"
									style={{ animationDelay: `${index * 100}ms`, animationDuration: '0.4s' }}
								>
									<CardHeader className={`pb-3 pt-4 px-5 bg-muted/20 border-b ${entry.religion.toLowerCase()}-header-bg`}>
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
											{entry.scripture}, Chapter {entry.chapter}, Verse(s) {entry.verses}
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-3 p-5">
										<div>
											<h3 className="font-semibold text-base mb-1.5 text-primary flex items-center">
												<BookOpenText className="w-4 h-4 mr-2 text-accent flex-shrink-0" />
												Quote:
											</h3>
											<blockquote className="text-foreground/90 leading-relaxed border-l-4 border-accent pl-3.5 py-1 italic text-[0.9rem]">
												{entry.answer}
											</blockquote>
										</div>
										{entry.aiInsight && (
											<div>
												<h3 className="font-semibold text-base mb-1.5 text-primary flex items-center">
													<Sparkles className="w-4 h-4 mr-2 text-accent flex-shrink-0" />
													{`Purpose according to ${entry.scripture}:`}
												</h3>
												<p className="text-foreground/80 leading-relaxed text-[0.9rem]">
													{/* AI insight prefix is now handled by the prompt */}
													{entry.aiInsight}
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
					WisdomWell &copy; {new Date().getFullYear()} - Your guide to multi-faith scriptural insights.
				</p>
				<p className="text-xs text-muted-foreground/70 mt-2">
					Remember to approach sacred texts with respect and an open mind. Interpretations may vary. This tool is for informational purposes.
				</p>
			</footer>
		</div>
	);
}
