import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Toaster } from "@/components/ui/toaster";
import { Inter } from "next/font/google";
import { GithubIcon, Globe } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	icons: "./favicon.ico",
	title: "led/fier",
	description: "led/fy your images like the olden days of led TVs",
};

export default function RootLayout({
	children,
}: {
  children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body className={`${inter.className} bg-black`}>
				<nav className="py-4 px-1 md:px-4 sticky top-0 bg-black bg-opacity-50 border-b border-gray-600 backdrop-blur-lg">
					<div className="container px-4 md:px-8 !mx-0 !md:mx-auto flex space-x-8 items-baseline">
						<h1 className="text-white flex space-x-2 items-baseline tracking-tighter">
							<span className="text-2xl">&#128250;</span>
							<span className="text-lg font-semibold">led/fier</span>
						</h1>
						<Link href="https://afiquddin.com" target="_blank" className="text-gray-500 flex space-x-0.5 items-baseline transition-colors hover:text-gray-300">
							<Globe size={14} />
							<span className="hidden md:block">Portfolio</span>
						</Link>
						<Link href="https://github.com/ahmad-afiquddin" target="_blank" className="text-gray-500 flex space-x-0.5 items-baseline transition-colors hover:text-gray-300">
							<GithubIcon size={14} />
							<span className="hidden md:block">GitHub</span>
						</Link>
					</div>
				</nav>
				{children}
				<Toaster />
				<footer className="mt-10 border-t border-gray-600">
					<div className="container py-4 text-gray-400 tracking-tighter font-semibold">
						<span>Made with &#10084;&#65039; by <Link href="https://linktr.ee/ahmadafiquddin" target="_blank">Ahmad Afiquddin Ahmad</Link> &#169; 2023</span>
					</div>
				</footer>
			</body>
		</html>
	);
}
