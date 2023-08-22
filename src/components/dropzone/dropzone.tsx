"use client";

import { HTMLProps, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import { useToast } from "../ui/use-toast";
import { FileImageIcon } from "lucide-react";

type DropZoneProps = {
    onLoading: (state: boolean) => void;
    onWidth: (width: number) => void;
    onHeight: (height: number) => void;
    onUploadSuccess: (file: File) => void;
} & HTMLProps<HTMLDivElement>;

export function Dropzone({
	className,
	onLoading,
	onWidth,
	onHeight,
	onUploadSuccess,
}: DropZoneProps) {
	const { toast } = useToast();
	const onDrop = useCallback((acceptedFiles: File[]) => {
		if (acceptedFiles.length) {
			const file = acceptedFiles[0];
			const reader = new FileReader();
			reader.onload = function() {
				const image = new Image();
				image.onload = function() {
					onLoading && onLoading(false);
					onWidth && onWidth(image.width);
					onHeight && onHeight(image.height);
					onUploadSuccess && onUploadSuccess(file);
				};
				image.onerror = function() {
					toast({
						title: "An error occured!",
						description: "Something went wrong while processing your image",
						variant: "destructive",
					});
				};
				if (reader.result) {
					image.src = reader.result as unknown as string;
				}
			};
			reader.onprogress = function() {
				onLoading && onLoading(true);
			};
			reader.readAsDataURL(file);
		}
	}, [onHeight, onLoading, onUploadSuccess, onWidth, toast]);
	const {getRootProps, getInputProps, isDragActive, isDragReject} = useDropzone({ onDrop, accept: {"image/jpeg": [], "image/png": []}, maxFiles: 1, });

	useEffect(() => {
		if (isDragReject) {
			toast({
				title: "Not an image!",
				description: "Make sure only .jpeg and .png files are uploaded!",
				variant: "destructive",
			});
		}
	}, [isDragReject, toast]);
    

	return (
		<div 
			{...getRootProps()} 
			className={cn(
				"p-8 flex flex-col items-center border border-gray-600 rounded-md cursor-pointer hover:bg-gray-900 hover:border-gray-300 transition-all duration-200 ease-in-out",
				isDragActive? "bg-gray-900":"",
				className
			)}
		>
			<input {...getInputProps()} />
			<h1 className="text-xl text-center text-white font-semibold tracking-tighter">Get started by uploading your image here</h1>
			<h3 className="hidden lg:block text-sm text-center text-gray-500">You can also drag and drop your image</h3>
			<div className="my-10 text-white">
				<FileImageIcon size={50} />
			</div>
			<small className="mt-2 text-sm text-gray-500">Only .jpeg and .png files are accepted</small>
		</div>
	);
}
