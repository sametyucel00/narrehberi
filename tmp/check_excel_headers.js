
import { readFile, utils } from 'xlsx';
import { readFileSync } from 'fs';

try {
    const workbook = readFile('isletme.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = utils.sheet_to_json(worksheet);
    if (data.length > 0) {
        console.log('Headers:', Object.keys(data[0]));
        console.log('First Row:', JSON.stringify(data[0], null, 2));
    } else {
        console.log('No data found in sheet');
    }
} catch (error) {
    console.error('Error:', error);
}
