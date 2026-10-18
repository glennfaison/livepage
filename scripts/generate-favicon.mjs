import sharp from "sharp";
import fs from "fs";
import path from "path";

const sizes = [16, 32, 48, 64, 128, 256];

async function generateIco() {
  const inputSvg = fs.readFileSync(path.join(process.cwd(), "app/favicon-light.svg"));

  const pngBuffers = await Promise.all(
    sizes.map((size) =>
      sharp(inputSvg, { density: 300 })
        .resize(size, size)
        .png()
        .toBuffer()
    )
  );

  // Create ICO file manually (simple approach: concatenate PNGs with ICO header)
  // ICO format: 6-byte header + 16-byte directory entries + image data
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type: 1 = ICO
  header.writeUInt16LE(sizes.length, 4); // Number of images

  const dirEntries = Buffer.alloc(sizes.length * 16);
  let imageOffset = 6 + sizes.length * 16;

  pngBuffers.forEach((pngBuffer, i) => {
    const size = sizes[i];
    dirEntries.writeUInt8(size === 256 ? 0 : size, i * 16 + 0); // Width (0 = 256)
    dirEntries.writeUInt8(size === 256 ? 0 : size, i * 16 + 1); // Height (0 = 256)
    dirEntries.writeUInt8(0, i * 16 + 2); // Color palette
    dirEntries.writeUInt8(0, i * 16 + 3); // Reserved
    dirEntries.writeUInt16LE(1, i * 16 + 4); // Color planes
    dirEntries.writeUInt16LE(32, i * 16 + 6); // Bits per pixel
    dirEntries.writeUInt32LE(pngBuffer.length, i * 16 + 8); // Size of image data
    dirEntries.writeUInt32LE(imageOffset, i * 16 + 12); // Offset of image data
    imageOffset += pngBuffer.length;
  });

  const icoBuffer = Buffer.concat([header, dirEntries, ...pngBuffers]);
  fs.writeFileSync(path.join(process.cwd(), "app/favicon.ico"), icoBuffer);
  console.log("Generated favicon.ico with sizes:", sizes.join(", "));
}

generateIco().catch(console.error);