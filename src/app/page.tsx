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
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
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
    CircleDot, // Replaced YinYang
} from "lucide-react";

const formSchema = z.object({
	question: z.string().min(10, {
		message: "Question must be at least 10 characters.",
	}),
});

export default function WisdomWellPage() {
	const [isLoading, setIsLoading] = React.useState(false);
	const [scriptureData, setScriptureData] =
		React.useState<ScriptureRetrievalOutput | null>(null);
	const [error, setError] = React.useState<string | null>(null);
	const { toast } = useToast();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			question: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsLoading(true);
		setError(null);
		setScriptureData(null);

		try {
			const input: ScriptureRetrievalInput = { question: values.question };
			const result = await scriptureRetrieval(input);
			setScriptureData(result);
			if (result.scriptureEntries.length === 0) {
				toast({
					title: "No scriptures found",
					description: "Please try a different question.",
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
			Hinduism: Palette,
			Islam: MoonStar,
			Christianity: BookHeart,
			Buddhism: Flower2,
			Judaism: Star,
			Jainism: Hand,
			Sikhism: Wheat,
			Taoism: CircleDot, // Replaced YinYang with CircleDot
			Default: HandHeart,
		};
		// For some reason, Tailwind tree-shaker removes the dynamic classes for icons
		// So, we need to list them here to ensure they are included in the build.
		// This is a workaround for a common issue with dynamic class names in Tailwind.
		// Do not remove this, otherwise icons might not show up.
		const dummy = {
			Hinduism: React.createElement(Palette, {
				className: "w-6 h-6 mr-3 bg-orange-500 text-white p-1 rounded-full",
			}),
			Islam: React.createElement(MoonStar, {
				className: "w-6 h-6 mr-3 bg-emerald-500 text-white p-1 rounded-full",
			}),
			Christianity: React.createElement(BookHeart, {
				className: "w-6 h-6 mr-3 bg-sky-500 text-white p-1 rounded-full",
			}),
			Buddhism: React.createElement(Flower2, { 
				className: "w-6 h-6 mr-3 bg-pink-500 text-white p-1 rounded-full",
			}),
			Judaism: React.createElement(Star, { 
				className: "w-6 h-6 mr-3 bg-blue-600 text-white p-1 rounded-full",
			}),
			Jainism: React.createElement(Hand, {
				className: "w-6 h-6 mr-3 bg-yellow-500 text-white p-1 rounded-full",
			}),
			Sikhism: React.createElement(Wheat, {
				className: "w-6 h-6 mr-3 bg-purple-500 text-white p-1 rounded-full",
			}),
			Taoism: React.createElement(CircleDot, { // Replaced YinYang with CircleDot
				className: "w-6 h-6 mr-3 bg-gray-500 text-white p-1 rounded-full",
			}),
			Default: React.createElement(HandHeart, {
				className: "w-6 h-6 mr-3 bg-gray-400 text-white p-1 rounded-full",
			}),
			BookOpenText: React.createElement(BookOpenText, {
				className: "w-5 h-5 mr-2 text-accent",
			}),
			Sparkles: React.createElement(Sparkles, {
				className: "w-5 h-5 mr-2 text-accent",
			}),
			ScrollText: React.createElement(ScrollText, {
				className: "w-12 h-12 md:w-16 md:h-16 text-accent",
			}),
			Search: React.createElement(Search, { className: "mr-2 h-4 w-4" }),
			Loader2: React.createElement(Loader2, {
				className: "mr-2 h-4 w-4 animate-spin",
			}),
			AlertCircle: React.createElement(AlertCircle, { className: "h-4 w-4" }),
			Gem: React.createElement(Gem, {
				className: "w-6 h-6 mr-3 bg-teal-500 text-white p-1 rounded-full",
			}),
		};
		return religionIcons[religion] || religionIcons["Default"];
	};

	const religionColors: Record<string, string> = {
		Hinduism: "bg-orange-500",
		Islam: "bg-emerald-500",
		Christianity: "bg-sky-500",
		Buddhism: "bg-pink-500",
		Judaism: "bg-blue-600",
		Jainism: "bg-yellow-500",
		Sikhism: "bg-purple-500",
		Taoism: "bg-gray-500",
		Default: "bg-gray-400",
	};

	const getReligionColor = (religion: string) => {
		return religionColors[religion] || religionColors["Default"];
	};

	return (
		<div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 md:p-8 font-sans">
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
											<FormLabel className="text-lg">Your Question</FormLabel>
											<FormControl>
												<Textarea
													placeholder="e.g., How can I find peace?"
													className="resize-none focus:ring-accent focus:border-accent rounded-lg"
													rows={3}
													{...field}
													aria-label="Your Question"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button
									type="submit"
									className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg py-3 text-lg"
									disabled={isLoading}
									aria-label="Search for Wisdom"
								>
									{isLoading ? (
										<>
											<Loader2 className="mr-2 h-5 w-5 animate-spin" />
											Searching...
										</>
									) : (
										<>
											<Search className="mr-2 h-5 w-5" />
											Search
										</>
									)}
								</Button>
							</form>
						</Form>
					</CardContent>
				</Card>

				{error && (
					<Alert variant="destructive" className="mb-8 animate-fadeIn rounded-lg">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{scriptureData && scriptureData.scriptureEntries.length > 0 && (
					<div className="space-y-6">
						{scriptureData.scriptureEntries.map((entry, index) => (
							<Card
								key={index}
								className="shadow-lg animate-fadeIn rounded-xl"
								style={{ animationDelay: `${index * 100}ms` }}
							>
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between">
										<CardTitle className="text-xl text-primary flex items-center">
											{React.createElement(getReligionIcon(entry.religion), {
												className: `w-7 h-7 mr-3 ${getReligionColor(
													entry.religion
												)} text-white p-1 rounded-full shadow-md`,
											})}
											{entry.scripture}
										</CardTitle>
										<Badge
											variant="secondary"
											className={`ml-2 ${getReligionColor(
												entry.religion
											)} text-white rounded-full px-3 py-1 text-xs shadow-sm`}
										>
											{entry.religion}
										</Badge>
									</div>
									<CardDescription className="text-sm text-muted-foreground pt-1 pl-10">
										Chapter {entry.chapter}, Verses {entry.verses}
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4 pt-2">
									<div className="pl-10">
										<h3 className="font-semibold text-lg mb-1 text-primary flex items-center">
											<BookOpenText className="w-5 h-5 mr-2 text-accent" />
											Answer (translated):
										</h3>
										<p className="text-foreground/90 leading-relaxed">
											{entry.answer}
										</p>
									</div>
									{entry.aiInsight && (
										<div className="pl-10">
											<h3 className="font-semibold text-lg mb-1 text-primary flex items-center">
												<Sparkles className="w-5 h-5 mr-2 text-accent" />
												AI's Insight:
											</h3>
											<p className="text-foreground/80 leading-relaxed italic">
												{entry.aiInsight}
											</p>
										</div>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				)}
				{scriptureData && scriptureData.scriptureEntries.length === 0 && !isLoading && (
                    <Card className="shadow-lg animate-fadeIn text-center rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-xl text-primary">No scriptures found</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                We couldn't find any scriptures matching your query. Please try a different question.
                            </p>
                        </CardContent>
                    </Card>
                )}
			</main>
			<Toaster />
		</div>
	);
}
