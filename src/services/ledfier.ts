import axiosHelper from "./base";
import sharp from "sharp";
import nj from "@d4c/numjs";
import { ArbDimNumArray } from "@d4c/numjs/build/main/lib/ndarray";

async function ledfier(file: File): Promise<any> {
	try {
		const payload = new FormData();
		payload.append("data", file);
	    const response = await axiosHelper.post(
			"personal-projects/led-effect", 
			payload,
			{ headers: {
				"Content-Type": "multipart/form-data;"
			}}
		);

		return response.data;
	} catch(err: any) {
		console.error(err);
		return err?.response?.data;
	}
}

function generatePixels([red, green, blue]: Uint8Array): number[][] {
	const blackPixel = Uint8Array.from([0, 0, 0]);
	const redPixel = Uint8Array.from([red, 0, 0]);
	const greenPixel = Uint8Array.from([0, green, 0]);
	const bluePixel = Uint8Array.from([0, 0, blue]);
  
	return [...Array(18).keys()].map((rowKey) => {
		if (![0, 17].includes(rowKey)) {
			return [...Array(18).keys()].map((colKey) => {
				if (![0, 17].includes(colKey)) {
					if ([1, 2, 3, 4].includes(colKey)) {
						return redPixel;
					}
					if ([7, 8, 9, 10].includes(colKey)) {
						return greenPixel;
					}
					if ([13, 14, 15, 16].includes(colKey)) {
						return bluePixel;
					}
					return blackPixel;
				} else {
					return blackPixel;
				}
			});
		} else {
			return new Array(18).fill(blackPixel);
		}
	});
}
  

async function localLedfier(inputBuffer: Buffer, width = 80, height = 80) {
	const resizedBuffer = await sharp(inputBuffer)
		.resize(width, height, {
			fit: "inside",
		})
		.toBuffer();

	const { width: imageWidth, height: imageHeight } = await sharp(
		resizedBuffer,
	).metadata();

	const dataBuffer = await sharp(resizedBuffer)
		.toFormat("jpeg")
		.jpeg({
			quality: 100,
			chromaSubsampling: "4:4:4",
			force: true,
		})
		.flatten()
		.raw()
		.toBuffer();

	let { data: imageData }: { type: "Buffer"; data: number[] } =
      dataBuffer.toJSON();

	const formattedImagePixels = nj
		.array(imageData)
		.reshape(imageHeight || 80, imageWidth || 80, 3)
		.tolist();

	const imageArray: number[][] = [];

	(formattedImagePixels as unknown as number[][][]).forEach((pixelRow) => {
		const ledRow: number[][][] = [];
		pixelRow.forEach((pixelCol) => {
			ledRow.push(generatePixels(Uint8Array.from(pixelCol)));
		});
		let indexArray: Uint8Array | null = Uint8Array.from([
			...Array(18).keys(),
		]);

		indexArray.forEach((ledPixelRow) => {
			ledRow.forEach((ledCol) => {
				imageArray.push(ledCol[ledPixelRow].flat());
			});
		});

		indexArray = null;
	});

	let tempImageArray: ArbDimNumArray | null = nj.array(imageArray).flatten().tolist();

	const newBuffer = await sharp(
		Uint8Array.from(tempImageArray as unknown as number[]),
		{
			raw: {
				width: imageWidth || 80 * 18,
				height: imageHeight || 80 * 18,
				channels: 3,
			},
		},
	)
		.toFormat("jpeg")
		.toBuffer();

	tempImageArray = null;

	return `data:image/jpeg;base64,${newBuffer.toString("base64")}`;
}

export { ledfier, localLedfier };