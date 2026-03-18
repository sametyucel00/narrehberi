const fs = require('fs');
const path = require('path');

const targetDir = 'c:/Users/Samet/Downloads/NarRehberi4/NarRehberi4/SRC';

function walk(dir) {
    let files = [];
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (item !== 'node_modules' && item !== '.git') {
                files = files.concat(walk(fullPath));
            }
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx') || fullPath.endsWith('.css') || fullPath.endsWith('.html')) {
            files.push(fullPath);
        }
    }
    return files;
}

const fontsToReplace = [
    'Cinzel',
    'Outfit',
    'Playfair Display',
    'Montserrat',
    'Cormorant Garamond',
    'Jost',
    'Poppins',
    'Inter' // We want to standardize Inter as well
];

const allFiles = walk(targetDir);
// Include index.html specifically
allFiles.push('c:/Users/Samet/Downloads/NarRehberi4/NarRehberi4/index.html');

let totalReplaced = 0;

for (const file of allFiles) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace specific font names with 'Inter'
    for (const font of fontsToReplace) {
        const regex = new RegExp(font, 'g');
        content = content.replace(regex, 'Inter');
    }

    // Standardize fontFamily strings in JSX
    // Handle "'Inter', serif" -> "'Inter', sans-serif"
    // Handle "'Inter', Georgia, serif" -> "'Inter', sans-serif"
    content = content.replace(/['"]Inter['"],\s*(Georgia,\s*)?serif/g, "'Inter', sans-serif");
    content = content.replace(/['"]Inter['"],\s*serif/g, "'Inter', sans-serif");

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        totalReplaced++;
        console.log(`Replaced fonts in: ${file}`);
    }
}

console.log(`Finished. Total files updated: ${totalReplaced}`);
