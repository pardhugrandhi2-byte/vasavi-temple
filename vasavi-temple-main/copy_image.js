import fs from 'fs';
import path from 'path';

const src = 'C:\\Users\\pc\\.gemini\\antigravity-ide\\brain\\5ca04919-cce1-4a8f-9c04-bdd4a2bb3a67\\media__1785909332751.jpg';
const publicDir = 'a:\\vasavi temple\\public';
const assetsDir = 'a:\\vasavi temple\\src\\assets';
const destPublic = path.join(publicDir, 'temple_hero.jpg');
const destAssets = path.join(assetsDir, 'temple_hero.jpg');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

fs.copyFileSync(src, destPublic);
fs.copyFileSync(src, destAssets);
console.log('Successfully copied temple hero image to:', destPublic, 'and', destAssets);
