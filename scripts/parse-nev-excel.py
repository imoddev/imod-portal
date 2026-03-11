#!/usr/bin/env python3
"""
Parse Master-NEV-Database-2026.xlsx and output JSON
"""
import pandas as pd
import json
import re
from pathlib import Path

EXCEL_PATH = '/Volumes/Video_Creator/สเปคชีตรถ/Master-NEV-Database-2026.xlsx'
OUTPUT_PATH = 'data/nev-import.json'

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
        return float(val)
    except:
        return None

def safe_int(val):
    """Safely convert to int"""
    if pd.isna(val):
        return None
    try:
        return int(float(val))
    except:
        return None

def parse_excel():
    print('📖 Reading Excel file...')
    xl = pd.ExcelFile(EXCEL_PATH)
    
    brands = []
    models = []
    variants = []
    
    # Skip first sheet (Dashboard)
    sheet_names = xl.sheet_names[1:]
    
    print(f'📊 Found {len(sheet_names)} brand sheets\n')
    
    for idx, sheet_name in enumerate(sheet_names):
        print(f'[{idx+1}/{len(sheet_names)}] Processing: {sheet_name}')
        
        # Create brand
        brand_name = sheet_name
        brand_slug = slugify(brand_name)
        
        brand = {
            'name': brand_name,
            'nameTh': None,
            'slug': brand_slug,
            'logoUrl': None,
            'country': None,
            'website': None,
        }
        brands.append(brand)
        
        # Read sheet
        df = pd.read_excel(EXCEL_PATH, sheet_name=sheet_name)
        
        if df.empty:
            print('  ⏭️  Empty sheet')
            continue
        
        print(f'  📊 Rows: {len(df)}')
        
        # Process rows (simplified - adjust based on actual structure)
        model_count = 0
        variant_count = 0
        
        for _, row in df.iterrows():
            # Skip empty rows
            if pd.isna(row.iloc[0]):
                continue
            
            # You'll need to adjust column mapping based on actual Excel structure
            model_name = str(row.iloc[0]) if not pd.isna(row.iloc[0]) else None
            variant_name = str(row.iloc[1]) if not pd.isna(row.iloc[1]) else None
            
            if not model_name or not variant_name:
                continue
            
            model_slug = slugify(f'{brand_slug}-{model_name}')
            variant_slug = slugify(f'{brand_slug}-{model_name}-{variant_name}')
            
            # Check if model exists
            if not any(m['slug'] == model_slug for m in models):
                models.append({
                    'brandSlug': brand_slug,
                    'name': model_name,
                    'nameTh': None,
                    'slug': model_slug,
                    'fullName': f'{brand_name} {model_name}',
                    'year': 2026,
                    'bodyType': None,
                    'segment': None,
                    'seats': None,
                    'powertrain': 'BEV',
                    'assembly': None,
                    'madeIn': 'Thailand',
                    'imageUrl': None,
                    'overview': None,
                    'highlights': [],
                    'isNewModel': False,
                    'launchDate': None,
                })
                model_count += 1
            
            # Create variant
            variant = {
                'modelSlug': model_slug,
                'name': variant_name,
                'fullName': f'{brand_name} {model_name} {variant_name}',
                'slug': variant_slug,
                'priceBaht': safe_int(row.iloc[2]) if len(row) > 2 else None,
                'priceNote': None,
                'batteryKwh': safe_float(row.iloc[3]) if len(row) > 3 else None,
                'rangeKm': safe_int(row.iloc[4]) if len(row) > 4 else None,
                'rangeStandard': 'CLTC',
                'motorCount': 1,
                'motorKw': safe_float(row.iloc[5]) if len(row) > 5 else None,
                'motorHp': safe_int(row.iloc[6]) if len(row) > 6 else None,
                'torqueNm': safe_int(row.iloc[7]) if len(row) > 7 else None,
                'topSpeedKmh': None,
                'accel0100': None,
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
                'dataSource': 'excel',
            }
            variants.append(variant)
            variant_count += 1
        
        print(f'  ✅ Models: {model_count} | Variants: {variant_count}')
    
    return brands, models, variants

def main():
    print('🚀 NEV Database - Excel Parser\n')
    
    # Check if file exists
    if not Path(EXCEL_PATH).exists():
        print(f'❌ File not found: {EXCEL_PATH}')
        return
    
    brands, models, variants = parse_excel()
    
    print(f'\n📊 Summary:')
    print(f'   Brands: {len(brands)}')
    print(f'   Models: {len(models)}')
    print(f'   Variants: {len(variants)}')
    
    # Create output
    output = {
        'brands': brands,
        'models': models,
        'variants': variants,
        'metadata': {
            'importedAt': pd.Timestamp.now().isoformat(),
            'source': EXCEL_PATH,
            'version': '1.0.0-beta.1',
        }
    }
    
    # Save
    Path(OUTPUT_PATH).parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f'\n✅ Saved to: {OUTPUT_PATH}')
    print(f'\n📤 Ready to import!')

if __name__ == '__main__':
    main()
