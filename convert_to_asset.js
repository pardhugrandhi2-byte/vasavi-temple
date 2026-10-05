import fs from 'fs';
import path from 'path';

const src = 'C:\\Users\\pc\\.gemini\\antigravity-ide\\brain\\5213f425-dd06-4142-b582-00425cca784a\\media__1785823524470.jpg';
const assetsDir = 'a:\\vasavi temple\\src\\assets';

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const buffer = fs.readFileSync(src);
const base64 = buffer.toString('base64');
const dataUri = `data:image/jpeg;base64,${base64}`;

const content = `// Auto-generated Goddess Sree Vasavi Devi sacred photo asset
export const VASAVI_DEVI_PHOTO = ${JSON.stringify(dataUri)};
export default VASAVI_DEVI_PHOTO;
`;

fs.writeFileSync(path.join(assetsDir, 'vasavi_devi.js'), content, 'utf8');
console.log('Successfully created vasavi_devi.js asset');
