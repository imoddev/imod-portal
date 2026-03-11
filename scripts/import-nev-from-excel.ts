/**
 * Import NEV Database from Excel
 * Usage: npx ts-node scripts/import-nev-from-excel.ts
 */

import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const EXCEL_PATH = '/Volumes/Video_Creator/สเปคชีตรถ/Master-NEV-Database-2026.xlsx';
const OUTPUT_PATH = path.join(__dirname, '../data/nev-import.json');

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function parseExcel() {
  console.log('📖 Reading Excel file...');
  const workbook = xlsx.readFile(EXCEL_PATH);
  
  const brands: any[] = [];
  const models: any[] = [];
  const variants: any[] = [];

  // Process each sheet (skip the first "Dashboard" sheet)
  const sheetNames = workbook.SheetNames.slice(1);
  
  console.log(`📊 Found ${sheetNames.length} brand sheets`);

  sheetNames.forEach((sheetName, index) => {
    console.log(`\n[${index + 1}/${sheetNames.length}] Processing: ${sheetName}`);
    
    const sheet = workbook.Sheets[sheetName];
    const data: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Skip empty sheets
    if (data.length < 2) {
      console.log('  ⏭️  Empty sheet, skipping');
      return;
    }

    // Create brand
    const brandName = sheetName;
    const brandSlug = slugify(brandName);
    
    const brand = {
      name: brandName,
      nameTh: null, // TODO: Extract from data if available
      slug: brandSlug,
      logoUrl: null,
      country: null,
      website: null,
    };
    
    brands.push(brand);
    console.log(`  ✅ Brand: ${brandName} (${brandSlug})`);

    // Parse models and variants from sheet
    // This is a simplified version - adjust based on actual Excel structure
    // Assuming columns: Model, Variant, Price, Battery, Range, Motor, etc.
    
    const headers = data[0];
    const rows = data.slice(1);

    let currentModel: string | null = null;
    let currentModelSlug: string | null = null;
    let modelCount = 0;
    let variantCount = 0;

    rows.forEach((row, rowIndex) => {
      // Skip empty rows
      if (!row || row.every(cell => !cell)) return;

      const modelName = row[0]; // Assuming first column is model name
      const variantName = row[1]; // Second column is variant name
      
      if (!modelName || !variantName) return;

      // New model?
      if (modelName !== currentModel) {
        currentModel = modelName;
        currentModelSlug = slugify(`${brandSlug}-${modelName}`);
        
        models.push({
          brandSlug,
          name: modelName,
          nameTh: null,
          slug: currentModelSlug,
          fullName: `${brandName} ${modelName}`,
          year: 2026, // Default
          bodyType: null,
          segment: null,
          seats: null,
          powertrain: 'BEV', // Default
          assembly: null,
          madeIn: 'Thailand',
          imageUrl: null,
          overview: null,
          highlights: [],
          isNewModel: false,
          launchDate: null,
        });
        
        modelCount++;
      }

      // Create variant
      const variant = {
        modelSlug: currentModelSlug,
        name: variantName,
        fullName: `${brandName} ${modelName} ${variantName}`,
        slug: slugify(`${brandSlug}-${modelName}-${variantName}`),
        priceBaht: parseFloat(row[2]) || null,
        priceNote: null,
        batteryKwh: parseFloat(row[3]) || null,
        rangeKm: parseInt(row[4]) || null,
        rangeStandard: row[5] || 'CLTC',
        motorCount: 1,
        motorKw: parseFloat(row[6]) || null,
        motorHp: parseInt(row[7]) || null,
        torqueNm: parseInt(row[8]) || null,
        topSpeedKmh: parseInt(row[9]) || null,
        accel0100: parseFloat(row[10]) || null,
        drivetrain: row[11] || null,
        dcChargeKw: parseFloat(row[12]) || null,
        dcChargeMin: parseInt(row[13]) || null,
        acChargeKw: parseFloat(row[14]) || null,
        chargePort: row[15] || null,
        lengthMm: parseInt(row[16]) || null,
        widthMm: parseInt(row[17]) || null,
        heightMm: parseInt(row[18]) || null,
        wheelbaseMm: parseInt(row[19]) || null,
        groundClearanceMm: parseInt(row[20]) || null,
        curbWeightKg: parseInt(row[21]) || null,
        grossWeightKg: parseInt(row[22]) || null,
        trunkLitres: parseInt(row[23]) || null,
        warrantyVehicle: row[24] || null,
        warrantyBattery: row[25] || null,
        features: null,
        hasV2l: false,
        v2lKw: null,
        hasV2g: false,
        isBestSeller: false,
        dataSource: 'excel',
      };

      variants.push(variant);
      variantCount++;
    });

    console.log(`  📦 Models: ${modelCount} | Variants: ${variantCount}`);
  });

  return { brands, models, variants };
}

async function main() {
  try {
    console.log('🚀 Starting NEV Database Import\n');
    console.log(`📂 Excel file: ${EXCEL_PATH}\n`);

    // Check if file exists
    if (!fs.existsSync(EXCEL_PATH)) {
      console.error('❌ Excel file not found!');
      console.error(`   Path: ${EXCEL_PATH}`);
      process.exit(1);
    }

    const { brands, models, variants } = parseExcel();

    console.log('\n📊 Summary:');
    console.log(`   Brands: ${brands.length}`);
    console.log(`   Models: ${models.length}`);
    console.log(`   Variants: ${variants.length}`);

    // Ensure data directory exists
    const dataDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Save to JSON
    const output = {
      brands,
      models,
      variants,
      metadata: {
        importedAt: new Date().toISOString(),
        source: EXCEL_PATH,
        version: '1.0.0-beta.1',
      },
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
    console.log(`\n✅ Data exported to: ${OUTPUT_PATH}`);

    console.log('\n📤 Next step:');
    console.log('   POST this JSON to /api/nev/import');
    console.log('   Or run: curl -X POST http://localhost:3000/api/nev/import -H "Content-Type: application/json" -d @data/nev-import.json');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
