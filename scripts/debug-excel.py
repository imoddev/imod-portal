#!/usr/bin/env python3
import pandas as pd

EXCEL_PATH = '/Volumes/Video_Creator/สเปคชีตรถ/Master-NEV-Database-2026.xlsx'

xl = pd.ExcelFile(EXCEL_PATH)
df = pd.read_excel(xl, 'BYD')

print("📊 BYD Sheet Analysis\n")
print(f"Shape: {df.shape}")
print(f"\nFirst column (Spec Names):")
print(df.iloc[:, 0].head(30))

print("\n\nSearching for battery-related rows:")
for idx, row in df.iterrows():
    spec_name = str(row.iloc[0]).strip()
    if 'แบต' in spec_name or 'Battery' in spec_name or 'kWh' in spec_name:
        print(f"Row {idx}: {spec_name}")
        print(f"  Values: {list(row[1:4])}")  # Show first 3 variant values
