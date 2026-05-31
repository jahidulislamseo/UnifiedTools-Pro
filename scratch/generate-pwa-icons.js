const sharp = require('sharp');
const path = require('path');

const src = path.join(__dirname, '../public/favicon.svg');
const dest192 = path.join(__dirname, '../public/icon-192.png');
const dest512 = path.join(__dirname, '../public/icon-512.png');

console.log('Generating PWA icons from:', src);

sharp(src)
  .resize(192, 192)
  .png()
  .toFile(dest192)
  .then(() => console.log('Successfully generated icon-192.png'))
  .catch(err => console.error('Error generating icon-192.png:', err));

sharp(src)
  .resize(512, 512)
  .png()
  .toFile(dest512)
  .then(() => console.log('Successfully generated icon-512.png'))
  .catch(err => console.error('Error generating icon-512.png:', err));
