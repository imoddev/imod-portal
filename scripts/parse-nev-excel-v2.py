#!/usr/bin/env python3
"""
Parse Master-NEV-Database-2026.xlsx (CORRECT VERSION)
Excel structure: Columns = Variants, Rows = Specs
"""
import pandas as pd
import json
import re
from pathlib import Path

EXCEL_PATH = '/Volumes/Video_Creator/สเปคชีตรถ/Master-NEV-Database-2026.xlsx'
OUTPUT_PATH = 'data/nev-import-v2.json'

def slugify(text):
    """Convert text to URL-friendly slug"""
    text = str(text).lower()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'\s+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')

def safe_float(val):
    """Safely convert to float"""
    if pd.isna(val):
        return None
    try:
        # Remove commas and extract first number
        val_str = str(val).replace(',', '').strip()
        # Extract first number (handle "600 (WLTP)" -> 600)
        match = re.search(r'(\d+\.?\d*)', val_str)
        if match:
            return float(match.group(1))
        return None
    except:
        return None

def safe_int(val):
    """Safely convert to int"""
    f = safe_float(val)
    return int(f) if f else None

def parse_brand_sheet(brand_name, df):
    """Parse a single brand sheet"""
    print(f"\n📊 Processing: {brand_name}")
    print(f"   Shape: {df.shape}")
    
    # Get variant names from column headers (skip first column which is spec names)
    variant_columns = df.columns[1:]  # Skip first column
    
    if len(variant_columns) == 0:
        print(f"   ⏭️  No variants found")
        return [], []
    
    print(f"   Variants: {len(variant_columns)}")
    
    models = []
    variants = []
    model_set = set()
    
    # Process each variant (column)
    for col_name in variant_columns:
        if pd.isna(col_name) or str(col_name).startswith('Unnamed'):
            continue
        
        variant_name = str(col_name).strip()
        
        # Extract model name (remove variant suffix)
        # e.g., "Lotus Eletre 600" -> model="Eletre", variant="600"
        # e.g., "BYD Dolphin Extended Range" -> model="Dolphin", variant="Extended Range"
        
        parts = variant_name.replace(brand_name, '').strip().split()
        if len(parts) == 0:
            continue
        
        model_name = parts[0]  # First word after brand name
        variant_suffix = ' '.join(parts[1:]) if len(parts) > 1 else model_name
        
        model_slug = slugify(f"{brand_name}-{model_name}")
        variant_slug = slugify(variant_name)
        
        # Add model (only once per model name)
        if model_slug not in model_set:
            models.append({
                'brandSlug': slugify(brand_name),
                'name': model_name,
                'nameTh': None,
                'slug': model_slug,
                'fullName': f"{brand_name} {model_name}",
                'year': 2026,
                'bodyType': None,
                'segment': None,
                'seats': None,
                'powertrain': 'BEV',  # Default
                'assembly': None,
                'madeIn': 'Thailand',
                'imageUrl': None,
                'overview': None,
                'highlights': [],
                'isNewModel': False,
                'launchDate': None,
            })
            model_set.add(model_slug)
        
        # Extract specs from this column
        variant_data = df[col_name]
        
        # Try to find key specs by row labels
        specs = {}
        for idx, row in df.iterrows():
            spec_name = str(row.iloc[0]).strip()
            spec_value = row[col_name]
            
            # Skip empty or header rows
            if pd.isna(spec_value) or spec_name.startswith('【'):
                continue
            
            # Map Thai spec names to our fields
            if 'ระยะทาง' in spec_name and '(' in spec_name:  # ระยะทางสูงสุด (กม.)
                specs['rangeKm'] = safe_int(spec_value)
            elif 'ขนาดแบตเตอรี่' in spec_name and 'kWh' in spec_name:  # ขนาดแบตเตอรี่ (kWh)
                specs['batteryKwh'] = safe_float(spec_value)
            elif 'แรงม้า' in spec_name and 'Hp' in spec_name:  # แรงม้า (Hp)
                specs['motorHp'] = safe_int(spec_value)
            elif 'แรงบิด' in spec_name and 'เมตร' in spec_name:  # แรงบิดสูงสุด (นิวตัน-เมตร)
                specs['torqueNm'] = safe_int(spec_value)
            elif 'ราคา' in spec_name or 'Price' in spec_name:
                specs['priceBaht'] = safe_int(spec_value)
            elif '0-100' in spec_name:
                specs['accel0100'] = safe_float(spec_value)
            elif 'ที่นั่ง' in spec_name or 'Seats' in spec_name:
                specs['seats'] = safe_int(spec_value)
        
        # Create variant
        variant = {
            'modelSlug': model_slug,
            'name': variant_suffix,
            'fullName': variant_name,
            'slug': variant_slug,
            'priceBaht': specs.get('priceBaht'),
            'priceNote': None,
            'batteryKwh': specs.get('batteryKwh'),
            'rangeKm': specs.get('rangeKm'),
            'rangeStandard': 'WLTP',  # Most common in Excel
            'motorCount': 1,
            'motorKw': None,
            'motorHp': specs.get('motorHp'),
            'torqueNm': specs.get('torqueNm'),
            'topSpeedKmh': None,
            'accel0100': specs.get('accel0100'),
            'drivetrain': None,
            'dcChargeKw': None,
            'dcChargeMin': None,
            'acChargeKw': None,
            'chargePort': 'CCS2',
            'lengthMm': None,
            'widthMm': None,
            'heightMm': None,
            'wheelbaseMm': None,
            'groundClearanceMm': None,
            'curbWeightKg': None,
            'grossWeightKg': None,
            'trunkLitres': None,
            'warrantyVehicle': None,
            'warrantyBattery': None,
            'features': None,
            'hasV2l': False,
            'v2lKw': None,
            'hasV2g': False,
            'isBestSeller': False,
            'dataSource': 'excel-v2',
        }
        
        # Only add if it has meaningful data
        if variant['batteryKwh'] or variant['rangeKm'] or variant['motorHp']:
            variants.append(variant)
    
    print(f"   ✅ Models: {len(models)} | Variants: {len(variants)}")
    return models, variants

def main():
    print('🚀 NEV Database - Excel Parser V2 (CORRECT)\n')
    
    if not Path(EXCEL_PATH).exists():
        print(f'❌ File not found: {EXCEL_PATH}')
        return
    
    xl = pd.ExcelFile(EXCEL_PATH)
    
    # Skip first sheet (Dashboard) and last sheet (YouTube Index)
    brand_sheets = [s for s in xl.sheet_names if s not in ['EV Brands Thailand', 'YouTube Index']]
    
    print(f'📊 Found {len(brand_sheets)} brand sheets')
    
    all_brands = []
    all_models = []
    all_variants = []
    
    for brand_name in brand_sheets:
        # Create brand
        brand = {
            'name': brand_name,
            'nameTh': None,
            'slug': slugify(brand_name),
            'logoUrl': None,
            'country': None,
            'website': None,
        }
        all_brands.append(brand)
        
        # Parse brand sheet
        df = pd.read_excel(EXCEL_PATH, sheet_name=brand_name)
        models, variants = parse_brand_sheet(brand_name, df)
        
        all_models.extend(models)
        all_variants.extend(variants)
    
    print(f'\n📊 Summary:')
    print(f'   Brands: {len(all_brands)}')
    print(f'   Models: {len(all_models)}')
    print(f'   Variants: {len(all_variants)}')
    
    # Save
    output = {
        'brands': all_brands,
        'models': all_models,
        'variants': all_variants,
        'metadata': {
            'importedAt': pd.Timestamp.now().isoformat(),
            'source': EXCEL_PATH,
            'version': '2.0.0-beta.1',
            'parser': 'v2-horizontal',
        }
    }
    
    Path(OUTPUT_PATH).parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f'\n✅ Saved to: {OUTPUT_PATH}')

if __name__ == '__main__':
    main()
