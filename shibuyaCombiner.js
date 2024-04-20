const fs = require('fs');
const Jimp = require('jimp');

// Function to remove background color from an image
async function removeBackgroundColor(image, bgColor) {
    const imageBuffer = await Jimp.read(image);
    const { width, height } = imageBuffer.bitmap;

    // Iterate over each pixel
    imageBuffer.scan(0, 0, width, height, function (x, y, idx) {
        const pixelColor = this.getPixelColor(x, y);
        const hexColor = Jimp.intToRGBA(pixelColor);

        // Check if pixel color matches the background color
        if (hexColor.r === bgColor.r && hexColor.g === bgColor.g && hexColor.b === bgColor.b) {
            // Set pixel to transparent
            this.setPixelColor(0x00000000, x, y);
        }
    });

    return imageBuffer;
}

// Function to combine images into one image by overlaying them
async function overlayImages(imageFiles, outputFilename) {
    // Load the first image to get its dimensions
    const firstImage = await Jimp.read(imageFiles[0]);
    const combinedImage = new Jimp(firstImage.bitmap.width, firstImage.bitmap.height);

    // Overlay each image onto the combined image
    for (const imageFile of imageFiles) {
        const image = await removeBackgroundColor(imageFile, { r: 25, g: 25, b: 25 }); // Remove white background
        combinedImage.composite(image, 0, 0, { mode: Jimp.BLEND_SOURCE_OVER });
    }

    // Save the combined image
    await combinedImage.writeAsync(outputFilename);
    console.log(`Combined image saved as ${outputFilename}`);
}

// Specify the folder containing images
const folderPath = 'C:\\Users\\spenc\\Downloads\\shibuya\\';

// Read the list of image files from the folder
fs.readdir(folderPath, async (err, files) => {
    if (err) {
        console.error('Error reading folder:', err);
        return;
    }

    // Filter out non-image files
    const imageFiles = files.filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'));

    // Combine images by overlaying them and save the result
    await overlayImages(imageFiles.map(file => folderPath + file), 'combined_image.jpg');
});



