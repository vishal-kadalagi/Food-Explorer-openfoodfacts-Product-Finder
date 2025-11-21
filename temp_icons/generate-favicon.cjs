import fs from 'fs';
import path from 'path';
import svg2png from 'svg2png';

async function generateFavicon() {
  try {
    // Read the SVG file
    const svgBuffer = fs.readFileSync(path.join(process.cwd(), 'temp_icons', 'food-icon.svg'));
    
    // Convert to PNG
    const pngBuffer = await svg2png(svgBuffer, { width: 32, height: 32 });
    
    // Write the PNG file
    fs.writeFileSync(path.join(process.cwd(), 'temp_icons', 'favicon-32x32.png'), pngBuffer);
    
    console.log('Favicon generated successfully!');
  } catch (error) {
    console.error('Error generating favicon:', error);
  }
}

generateFavicon();