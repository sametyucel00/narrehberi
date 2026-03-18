
import { readFile, utils } from 'xlsx';
import { readFileSync, writeFileSync } from 'fs';

try {
    const workbook = readFile('isletme.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = utils.sheet_to_json(worksheet);
    console.log(JSON.stringify(data, null, 2));
} catch (error) {
    console.error('Error reading excel:', error);
}
