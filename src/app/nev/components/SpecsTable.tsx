'use client';

import { Variant } from '../data/dummy';

interface SpecsTableProps {
  variants: Variant[];
  selectedColor?: string;
  onColorChange?: (color: string) => void;
}

// Apple-style specs comparison table
export default function SpecsTable({ variants, selectedColor, onColorChange }: SpecsTableProps) {
  // Get unique colors (mock data)
  const colors = ['ขาว', 'ดำ', 'น้ำเงิน', 'เทา', 'แดง'];

  // Format price
  const formatPrice = (price: number | null) => {
    if (!price) return '-';
    return `฿${price.toLocaleString()}`;
  };

  // Format number with unit
  const formatWithUnit = (value: number | null | undefined, unit: string) => {
    if (value === null || value === undefined) return '-';
    return `${value} ${unit}`;
  };

  // Check if value is best in row
  const isBest = (value: number | null | undefined, key: keyof Variant) => {
    if (value === null || value === undefined) return false;
    
    const values = variants
      .map(v => v[key])
      .filter((v): v is number => v !== null && v !== undefined);
    
    if (values.length === 0) return false;
    
    // For price and accel, lower is better
    if (key === 'priceBaht' || key === 'accel0100' || key === 'dcChargeMin') {
      return value === Math.min(...values);
    }
    
    // For others, higher is better
    return value === Math.max(...values);
  };

  // Get highlight class
  const getHighlightClass = (value: number | null | undefined, key: keyof Variant) => {
    if (!isBest(value, key)) return '';
    return 'text-blue-600 font-bold';
  };

  return (
    <div className="w-full">
      {/* Color Selector - Apple Style */}
      {onColorChange && (
        <div className="mb-8">
          <p className="text-lg font-medium mb-4 text-gray-900">สี <span className="text-gray-500">{selectedColor || colors[0]}</span></p>
          <div className="flex gap-3">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  (selectedColor || colors[0]) === color 
                    ? 'border-blue-600 scale-110' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{
                  backgroundColor: 
                    color === 'ขาว' ? '#FFFFFF' :
                    color === 'ดำ' ? '#1D1D1F' :
                    color === 'น้ำเงิน' ? '#0066CC' :
                    color === 'เทา' ? '#86868B' :
                    color === 'แดง' ? '#BF001F' : '#FFFFFF'
                }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Specs Table - Apple Style */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left py-4 text-lg font-bold text-gray-900 border-b border-gray-200">
                สเปค
              </th>
              {variants.map((variant) => (
                <th 
                  key={variant.id} 
                  className="text-center py-4 text-lg font-bold text-gray-900 border-b border-gray-200 min-w-[200px]"
                >
                  {variant.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Price */}
            <tr className="hover:bg-gray-50">
              <td className="py-5 text-base font-medium text-gray-900">
                ราคา
              </td>
              {variants.map((variant) => (
                <td 
                  key={variant.id}
                  className={`py-5 text-center text-base ${getHighlightClass(variant.priceBaht, 'priceBaht')}`}
                >
                  {formatPrice(variant.priceBaht)}
                </td>
              ))}
            </tr>

            {/* Battery */}
            <tr className="hover:bg-gray-50">
              <td className="py-5 text-base font-medium text-gray-900">
                <div className="flex items-center gap-2">
                  <span>⚡</span>
                  <span>แบตเตอรี่</span>
                </div>
              </td>
              {variants.map((variant) => (
                <td 
                  key={variant.id}
                  className={`py-5 text-center text-base ${getHighlightClass(variant.batteryKwh, 'batteryKwh')}`}
                >
                  {formatWithUnit(variant.batteryKwh, 'kWh')}
                  {variant.batteryKwh && (
                    <div className="text-xs text-gray-500 mt-1">Blade Battery</div>
                  )}
                </td>
              ))}
            </tr>

            {/* Range */}
            <tr className="hover:bg-gray-50">
              <td className="py-5 text-base font-medium text-gray-900">
                <div className="flex items-center gap-2">
                  <span>🛣️</span>
                  <span>ระยะทาง</span>
                </div>
              </td>
              {variants.map((variant) => (
                <td 
                  key={variant.id}
                  className={`py-5 text-center text-base ${getHighlightClass(variant.rangeKm, 'rangeKm')}`}
                >
                  {formatWithUnit(variant.rangeKm, 'กม.')}
                  {variant.rangeStandard && (
                    <div className="text-xs text-gray-500 mt-1">({variant.rangeStandard})</div>
                  )}
                </td>
              ))}
            </tr>

            {/* Motor Power */}
            <tr className="hover:bg-gray-50">
              <td className="py-5 text-base font-medium text-gray-900">
                <div className="flex items-center gap-2">
                  <span>🔋</span>
                  <span>กำลังมอเตอร์</span>
                </div>
              </td>
              {variants.map((variant) => (
                <td 
                  key={variant.id}
                  className={`py-5 text-center text-base ${getHighlightClass(variant.motorHp, 'motorHp')}`}
                >
                  {variant.motorHp && (
                    <>
                      <div>{variant.motorHp} แรงม้า</div>
                      <div className="text-xs text-gray-500 mt-1">({variant.motorKw} kW)</div>
                    </>
                  )}
                </td>
              ))}
            </tr>

            {/* Torque */}
            <tr className="hover:bg-gray-50">
              <td className="py-5 text-base font-medium text-gray-900">
                <div className="flex items-center gap-2">
                  <span>💪</span>
                  <span>แรงบิด</span>
                </div>
              </td>
              {variants.map((variant) => (
                <td 
                  key={variant.id}
                  className={`py-5 text-center text-base ${getHighlightClass(variant.torqueNm, 'torqueNm')}`}
                >
                  {formatWithUnit(variant.torqueNm, 'Nm')}
                </td>
              ))}
            </tr>

            {/* 0-100 */}
            <tr className="hover:bg-gray-50">
              <td className="py-5 text-base font-medium text-gray-900">
                <div className="flex items-center gap-2">
                  <span>🚀</span>
                  <span>0-100 กม./ชม.</span>
                </div>
              </td>
              {variants.map((variant) => (
                <td 
                  key={variant.id}
                  className={`py-5 text-center text-base ${getHighlightClass(variant.accel0100, 'accel0100')}`}
                >
                  {variant.accel0100 && `${variant.accel0100} วินาที`}
                </td>
              ))}
            </tr>

            {/* Top Speed */}
            <tr className="hover:bg-gray-50">
              <td className="py-5 text-base font-medium text-gray-900">
                <div className="flex items-center gap-2">
                  <span>🏁</span>
                  <span>ความเร็วสูงสุด</span>
                </div>
              </td>
              {variants.map((variant) => (
                <td 
                  key={variant.id}
                  className={`py-5 text-center text-base ${getHighlightClass(variant.topSpeedKmh, 'topSpeedKmh')}`}
                >
                  {formatWithUnit(variant.topSpeedKmh, 'กม./ชม.')}
                </td>
              ))}
            </tr>

            {/* Drivetrain */}
            <tr className="hover:bg-gray-50">
              <td className="py-5 text-base font-medium text-gray-900">
                <div className="flex items-center gap-2">
                  <span>⚙️</span>
                  <span>ระบบขับเคลื่อน</span>
                </div>
              </td>
              {variants.map((variant) => (
                <td key={variant.id} className="py-5 text-center text-base">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    variant.drivetrain === 'AWD' 
                      ? 'bg-blue-100 text-blue-700' 
                      : variant.drivetrain === 'RWD'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {variant.drivetrain}
                  </span>
                </td>
              ))}
            </tr>

            {/* DC Charging */}
            <tr className="hover:bg-gray-50">
              <td className="py-5 text-base font-medium text-gray-900">
                <div className="flex items-center gap-2">
                  <span>⚡</span>
                  <span>ชาร์จ DC</span>
                </div>
              </td>
              {variants.map((variant) => (
                <td 
                  key={variant.id}
                  className={`py-5 text-center text-base ${getHighlightClass(variant.dcChargeKw, 'dcChargeKw')}`}
                >
                  {variant.dcChargeKw && (
                    <>
                      <div>{variant.dcChargeKw} kW</div>
                      {variant.dcChargeMin && (
                        <div className="text-xs text-gray-500 mt-1">10-80%: {variant.dcChargeMin} นาที</div>
                      )}
                    </>
                  )}
                </td>
              ))}
            </tr>

            {/* Warranty - Vehicle */}
            <tr className="hover:bg-gray-50">
              <td className="py-5 text-base font-medium text-gray-900">
                <div className="flex items-center gap-2">
                  <span>🛡️</span>
                  <span>รับประกันรถ</span>
                </div>
              </td>
              {variants.map((variant) => (
                <td key={variant.id} className="py-5 text-center text-base text-gray-600">
                  {variant.warrantyVehicle}
                </td>
              ))}
            </tr>

            {/* Warranty - Battery */}
            <tr className="hover:bg-gray-50">
              <td className="py-5 text-base font-medium text-gray-900">
                <div className="flex items-center gap-2">
                  <span>🔋</span>
                  <span>รับประกันแบต</span>
                </div>
              </td>
              {variants.map((variant) => (
                <td key={variant.id} className="py-5 text-center text-base text-gray-600">
                  {variant.warrantyBattery}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* CTA Buttons - Apple Style */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        {variants.map((variant) => (
          <button
            key={variant.id}
            className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
          >
            เลือก {variant.name}
          </button>
        ))}
      </div>
    </div>
  );
}
