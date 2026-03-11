import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/nev/import
 * นำเข้าข้อมูล NEV จาก Excel/JSON
 * Body: { brands: [...], models: [...], variants: [...] }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { brands, models, variants } = body;

    if (!brands || !models || !variants) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    // Begin transaction
    const result = await prisma.$transaction(async (tx) => {
      // Import brands
      const brandMap = new Map<string, string>();
      for (const brand of brands) {
        const created = await tx.nevBrand.upsert({
          where: { slug: brand.slug },
          update: {
            name: brand.name,
            nameTh: brand.nameTh,
            logoUrl: brand.logoUrl,
            country: brand.country,
            website: brand.website,
          },
          create: {
            name: brand.name,
            nameTh: brand.nameTh,
            slug: brand.slug,
            logoUrl: brand.logoUrl,
            country: brand.country,
            website: brand.website,
          },
        });
        brandMap.set(brand.slug, created.id);
      }

      // Import models
      const modelMap = new Map<string, string>();
      for (const model of models) {
        const brandId = brandMap.get(model.brandSlug);
        if (!brandId) continue;

        const created = await tx.nevModel.upsert({
          where: { slug: model.slug },
          update: {
            name: model.name,
            nameTh: model.nameTh,
            fullName: model.fullName,
            year: model.year,
            bodyType: model.bodyType,
            segment: model.segment,
            seats: model.seats,
            powertrain: model.powertrain,
            assembly: model.assembly,
            madeIn: model.madeIn,
            imageUrl: model.imageUrl,
            overview: model.overview,
            highlights: model.highlights || [],
            isNewModel: model.isNewModel || false,
            launchDate: model.launchDate ? new Date(model.launchDate) : null,
          },
          create: {
            brandId,
            name: model.name,
            nameTh: model.nameTh,
            slug: model.slug,
            fullName: model.fullName,
            year: model.year,
            bodyType: model.bodyType,
            segment: model.segment,
            seats: model.seats,
            powertrain: model.powertrain,
            assembly: model.assembly,
            madeIn: model.madeIn,
            imageUrl: model.imageUrl,
            overview: model.overview,
            highlights: model.highlights || [],
            isNewModel: model.isNewModel || false,
            launchDate: model.launchDate ? new Date(model.launchDate) : null,
          },
        });
        modelMap.set(model.slug, created.id);
      }

      // Import variants
      let variantCount = 0;
      for (const variant of variants) {
        const modelId = modelMap.get(variant.modelSlug);
        if (!modelId) continue;

        await tx.nevVariant.upsert({
          where: { slug: variant.slug },
          update: {
            name: variant.name,
            fullName: variant.fullName,
            priceBaht: variant.priceBaht,
            priceNote: variant.priceNote,
            batteryKwh: variant.batteryKwh,
            rangeKm: variant.rangeKm,
            rangeStandard: variant.rangeStandard,
            motorCount: variant.motorCount || 1,
            motorKw: variant.motorKw,
            motorHp: variant.motorHp,
            torqueNm: variant.torqueNm,
            topSpeedKmh: variant.topSpeedKmh,
            accel0100: variant.accel0100,
            drivetrain: variant.drivetrain,
            dcChargeKw: variant.dcChargeKw,
            dcChargeMin: variant.dcChargeMin,
            acChargeKw: variant.acChargeKw,
            chargePort: variant.chargePort,
            engineCc: variant.engineCc,
            engineHp: variant.engineHp,
            combinedHp: variant.combinedHp,
            fuelTankL: variant.fuelTankL,
            fuelConsumption: variant.fuelConsumption,
            lengthMm: variant.lengthMm,
            widthMm: variant.widthMm,
            heightMm: variant.heightMm,
            wheelbaseMm: variant.wheelbaseMm,
            groundClearanceMm: variant.groundClearanceMm,
            curbWeightKg: variant.curbWeightKg,
            grossWeightKg: variant.grossWeightKg,
            trunkLitres: variant.trunkLitres,
            warrantyVehicle: variant.warrantyVehicle,
            warrantyBattery: variant.warrantyBattery,
            features: variant.features ? JSON.stringify(variant.features) : null,
            hasV2l: variant.hasV2l || false,
            v2lKw: variant.v2lKw,
            hasV2g: variant.hasV2g || false,
            isBestSeller: variant.isBestSeller || false,
            dataSource: variant.dataSource || 'excel',
            lastVerified: new Date(),
          },
          create: {
            modelId,
            name: variant.name,
            fullName: variant.fullName,
            slug: variant.slug,
            priceBaht: variant.priceBaht,
            priceNote: variant.priceNote,
            batteryKwh: variant.batteryKwh,
            rangeKm: variant.rangeKm,
            rangeStandard: variant.rangeStandard,
            motorCount: variant.motorCount || 1,
            motorKw: variant.motorKw,
            motorHp: variant.motorHp,
            torqueNm: variant.torqueNm,
            topSpeedKmh: variant.topSpeedKmh,
            accel0100: variant.accel0100,
            drivetrain: variant.drivetrain,
            dcChargeKw: variant.dcChargeKw,
            dcChargeMin: variant.dcChargeMin,
            acChargeKw: variant.acChargeKw,
            chargePort: variant.chargePort,
            engineCc: variant.engineCc,
            engineHp: variant.engineHp,
            combinedHp: variant.combinedHp,
            fuelTankL: variant.fuelTankL,
            fuelConsumption: variant.fuelConsumption,
            lengthMm: variant.lengthMm,
            widthMm: variant.widthMm,
            heightMm: variant.heightMm,
            wheelbaseMm: variant.wheelbaseMm,
            groundClearanceMm: variant.groundClearanceMm,
            curbWeightKg: variant.curbWeightKg,
            grossWeightKg: variant.grossWeightKg,
            trunkLitres: variant.trunkLitres,
            warrantyVehicle: variant.warrantyVehicle,
            warrantyBattery: variant.warrantyBattery,
            features: variant.features ? JSON.stringify(variant.features) : null,
            hasV2l: variant.hasV2l || false,
            v2lKw: variant.v2lKw,
            hasV2g: variant.hasV2g || false,
            isBestSeller: variant.isBestSeller || false,
            dataSource: variant.dataSource || 'excel',
            lastVerified: new Date(),
          },
        });
        variantCount++;
      }

      return {
        brands: brandMap.size,
        models: modelMap.size,
        variants: variantCount,
      };
    });

    // Create audit log
    await prisma.nevAuditLog.create({
      data: {
        userId: 'system',
        userName: 'System Import',
        action: 'import',
        targetType: 'bulk',
        targetId: 'import',
        targetName: 'Bulk Import',
        changes: JSON.stringify(result),
      },
    });

    return NextResponse.json({
      success: true,
      imported: result,
    });
  } catch (error) {
    console.error('Error importing NEV data:', error);
    return NextResponse.json(
      { error: 'Import failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
