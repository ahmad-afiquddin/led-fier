"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription, } from "@/components/ui/alert";
import { Dropzone } from "@/components/dropzone/dropzone";
import { GithubIcon, FileImageIcon, X, AlertTriangle, Loader2 } from "lucide-react";
import { ledfier, localLedfier } from "@/services/ledfier";

export default function Home() {
	const [isLoading, setIsLoading] = useState(false);
	const [width, setWidth] = useState(0);
	const [height, setHeight] = useState(0);
	const [file, setFile] = useState<File | null>();
	const [processedImage, setProcessedImage] = useState("");
	const { toast } = useToast();
	const formSchema = z.object({
		width: z.number().min(80, {
			message: "Minimum base width is 80 pixels",
		}).max(400, {
			message: "Maximum base width is 400 pixels, your device might still fail to run the led/fier",
		}),
		height: z.number().min(80, {
			message: "Minimum base height is 80 pixels",
		}).max(400, {
			message: "Maximum base height is 400 pixels, your device might still fail to run the led/fier",
		}),
	});
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
		  width: 80,
		  height: 80,
		},
	});
	
	async function onSubmit(values: z.infer<typeof formSchema>) {
		setProcessedImage("");
		setIsLoading(true);
		if ([values.width, values.height].every((dimension) => dimension === 80)) {
			try {
				const response = file && await ledfier(file) || "";
				setProcessedImage(response);
			} catch(err) {
				toast({
					title: "Something went wrong",
					description: "An error occured, please try again",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		} else {
			try {
				const reader = new FileReader();
				reader.onload = async function (event) {
					if(event?.target?.result) {
						const response = await localLedfier(event.target.result as unknown as Buffer);
						setProcessedImage(response);
					} else {
						toast({
							title: "Something went wrong",
							description: "An error occured, please try again",
							variant: "destructive",
						});
					}
				}; 
				file && reader.readAsArrayBuffer(file);
			} catch(err) {
				toast({
					title: "Something went wrong",
					description: "An error occured, please try again. (Your device might not have enough memory for your set of base dimensions)",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		}
	}

	return (
		<main className="container px-4 md:px-8 min-h-screen">
			<header>
				<h1 className="mt-10 text-4xl text-white font-semibold tracking-tighter">
          led/fy your images.
				</h1>
				<p className="w-full md:w-3/4 lg:w-2/3 mt-3 text-xl text-gray-400 font-light">
          Do you remember looking closely at an old LED television, and seeing the individual LEDs light up?
          With my led/fier you can now achieve the same effect with your images.
				</p>
				<div className="mt-5 flex space-x-2">
					<a href="#form"><Button variant="secondary">Get Started</Button></a>
					<Link href="https://github.com/ahmad-afiquddin" target="_blank">
						<Button className="flex items-center space-x-2" variant="default">
							<GithubIcon size={15} />
							<span>GitHub</span>
						</Button>
					</Link>
				</div>
			</header>
			<article id="form" className="w-full md:w-3/4 lg:w-2/3 mt-20">
				<Dropzone onLoading={setIsLoading} onWidth={setWidth} onHeight={setHeight} onUploadSuccess={(file) => {
					setFile(file);
					setProcessedImage("");
				}} />
				{file?
					<>
						<div className="mt-5 p-2 flex justify-between items-center text-white border rounded-md">
							<span className="flex items-center space-x-2">
								<FileImageIcon size={15} /> 
								<span>
									{file.name}
								</span>
								<small className="text-sm text-gray-500">{width} x {height} pixels</small>
							</span>
							<button className="" onClick={() => {
								setFile(null);
								setProcessedImage("");
							}}><X /></button>
						</div> 
						<Alert className="mt-5">
							<AlertTriangle className="w-4 h-4"/>
							<AlertTitle>Disclaimer</AlertTitle>
							<AlertDescription>
								<p>
									By default, your image will be resized to fit within 80 by 80 
									pixels before the led/fier is applied.
								</p>
								<p>
									Selecting different base dimensions will result in better looking results,
									but instead of the algorithm running on a server,
									it will be run on your device instead
									{" (and there's still a possibility that it won't run)."}
								</p>
							</AlertDescription>
						</Alert>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2 items-center">
								<FormField
									control={form.control}
									name="width"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Width</FormLabel>
											<FormControl>
												<Input type="number" placeholder="Width" {...field} onChange={event => field.onChange(parseInt(event.target.value))} />
											</FormControl>
											<FormDescription>
											Base image width
											</FormDescription>
											<FormMessage />
										</FormItem>
										
									)}
								/>
								<FormField
									control={form.control}
									name="height"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Height</FormLabel>
											<FormControl>
												<Input type="number" placeholder="Height" {...field} onChange={event => field.onChange(parseInt(event.target.value))} />
											</FormControl>
											<FormDescription>
											Base image height
											</FormDescription>
											<FormMessage />
										</FormItem>
										
									)}
								/>
								<Button type="submit" disabled={isLoading}>
									{isLoading? <Loader2 className="mr-2 h-4 w-4 animate-spin" />:""}
									Process
								</Button>
								{processedImage && <Link className="text-white text-sm underline" href="#results">Go to results</Link>}
							</form>
						</Form>
					</>
					: ""
				}
				{file && processedImage?
					<Image 
						id="results"
						className="mt-10"
						alt={`${file.name} led image`} 
						src={processedImage} 
						width={500}
      					height={500}
					/>: ""
				}
			</article>
		</main>
	);
}
