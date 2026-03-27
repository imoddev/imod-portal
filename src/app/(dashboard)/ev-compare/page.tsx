"use client";

import { useState, useRef, useEffect } from "react";
import { Download, Plus, X, Search, GripVertical, Settings } from "lucide-react";

interface EVSpec {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  image?: string;
  specs: {
    [key: string]: string | number;
  };
}

interface SpecField {
  key: string;
  label: string;
  enabled: boolean;
}

// Sample car database (will be replaced with API data)
const sampleCarDatabase: EVSpec[] = [
  {
    id: "1",
    name: "Tesla Model 3 Long Range",
    brand: "Tesla",
    model: "Model 3 LR",
    price: 1999000,
    specs: {
      power: "346 kW",
      horsepower: "471 hp",
      torque: "660 Nm",
      battery: "82 kWh",
      batteryType: "NMC (Lithium Nickel Manganese Cobalt)",
      range: "629 km (WLTP)",
      acceleration: "4.4 วินาที",
      topSpeed: "233 km/h",
      drivetrain: "AWD",
      chargingDC: "DC 250 kW (10-80% ใน 27 นาที)",
      chargingAC: "AC 11 kW",
      v2l: "ไม่รองรับ",
      warranty: "8 ปี/192,000 km (แบต), 4 ปี/80,000 km (รถ)",
      safety: "Autopilot, AEB, LDW, BSM, RCTA, Airbags 8 ตัว",
      length: "4,720 มม.",
      width: "1,933 มม.",
      height: "1,441 มม.",
      wheelbase: "2,875 มม.",
      weight: "1,844 กก.",
      seats: 5,
      trunk: "561 ลิตร"
    }
  },
  {
    id: "2",
    name: "BYD ATTO 3",
    brand: "BYD",
    model: "ATTO 3",
    price: 999000,
    specs: {
      power: "150 kW",
      horsepower: "204 hp",
      torque: "310 Nm",
      battery: "60.48 kWh",
      batteryType: "LFP (Lithium Iron Phosphate) - Blade Battery",
      range: "480 km (NEDC)",
      acceleration: "7.3 วินาที",
      topSpeed: "160 km/h",
      drivetrain: "FWD",
      chargingDC: "DC 80 kW (30-80% ใน 29 นาที)",
      chargingAC: "AC 7 kW",
      v2l: "รองรับ 3.3 kW",
      warranty: "6 ปี/150,000 km (แบต), 6 ปี/150,000 km (รถ)",
      safety: "AEB, LDW, BSM, RCTA, ACC, Airbags 7 ตัว",
      length: "4,455 มม.",
      width: "1,875 มม.",
      height: "1,615 มม.",
      wheelbase: "2,720 มม.",
      weight: "1,750 กก.",
      seats: 5,
      trunk: "440 ลิตร"
    }
  },
  {
    id: "3",
    name: "MG4 Electric",
    brand: "MG",
    model: "MG4",
    price: 799900,
    specs: {
      power: "150 kW",
      horsepower: "204 hp",
      torque: "250 Nm",
      battery: "64 kWh",
      batteryType: "LFP (Lithium Iron Phosphate)",
      range: "450 km (WLTP)",
      acceleration: "7.7 วินาที",
      topSpeed: "160 km/h",
      drivetrain: "RWD",
      chargingDC: "DC 87 kW (10-80% ใน 35 นาที)",
      chargingAC: "AC 6.6 kW",
      v2l: "ไม่รองรับ",
      warranty: "8 ปี/175,000 km (แบต), 5 ปี/100,000 km (รถ)",
      safety: "AEB, LDW, BSM, ACC, Airbags 6 ตัว",
      length: "4,287 มม.",
      width: "1,836 มม.",
      height: "1,516 มม.",
      wheelbase: "2,705 มม.",
      weight: "1,655 กก.",
      seats: 5,
      trunk: "363 ลิตร"
    }
  },
  {
    id: "4",
    name: "Mercedes-Benz CLA EV",
    brand: "Mercedes-Benz",
    model: "CLA EV",
    price: 2290000,
    specs: {
      power: "200 kW",
      horsepower: "272 hp",
      torque: "390 Nm",
      battery: "85 kWh",
      batteryType: "NMC",
      range: "750 km (WLTP)",
      acceleration: "6.2 วินาที",
      topSpeed: "210 km/h",
      drivetrain: "RWD",
      chargingDC: "DC 200 kW (10-80% ใน 20 นาที)",
      chargingAC: "AC 22 kW",
      v2l: "ไม่รองรับ",
      warranty: "8 ปี/160,000 km (แบต), 3 ปี/ไม่จำกัด (รถ)",
      safety: "Mercedes-Benz Intelligent Drive, AEB, LDW, BSM, ACC, Airbags 9 ตัว",
      length: "4,859 มม.",
      width: "1,851 มม.",
      height: "1,428 มม.",
      wheelbase: "2,865 มม.",
      weight: "1,950 กก.",
      seats: 5,
      trunk: "435 ลิตร"
    }
  },
  {
    id: "5",
    name: "BMW iX3",
    brand: "BMW",
    model: "iX3",
    price: 2890000,
    specs: {
      power: "345 kW",
      horsepower: "469 hp",
      torque: "700 Nm",
      battery: "113.4 kWh",
      batteryType: "NMC",
      range: "805 km (WLTP)",
      acceleration: "4.9 วินาที",
      topSpeed: "210 km/h",
      drivetrain: "AWD",
      chargingDC: "DC 250 kW (10-80% ใน 25 นาที)",
      chargingAC: "AC 11 kW",
      v2l: "ไม่รองรับ",
      warranty: "8 ปี/160,000 km (แบต), 3 ปี/ไม่จำกัด (รถ)",
      safety: "BMW Intelligent Personal Assistant, AEB, LDW, BSM, ACC, Airbags 8 ตัว",
      length: "4,755 มม.",
      width: "2,005 มม.",
      height: "1,616 มม.",
      wheelbase: "2,950 มม.",
      weight: "2,360 กก.",
      seats: 5,
      trunk: "570 ลิตร"
    }
  },
  {
    id: "6",
    name: "NIO Firefly",
    brand: "NIO",
    model: "Firefly",
    price: 799000,
    specs: {
      power: "100 kW",
      horsepower: "136 hp",
      torque: "210 Nm",
      battery: "38.5 kWh",
      batteryType: "LFP",
      range: "340 km (CLTC)",
      acceleration: "8.9 วินาที",
      topSpeed: "140 km/h",
      drivetrain: "FWD",
      chargingDC: "DC 70 kW (20-80% ใน 30 นาที)",
      chargingAC: "AC 7 kW",
      v2l: "รองรับ 2.2 kW",
      warranty: "8 ปี/200,000 km (แบต), 3 ปี/100,000 km (รถ)",
      safety: "NIO Pilot, AEB, LDW, BSM, ACC, Airbags 6 ตัว",
      length: "4,010 มม.",
      width: "1,865 มม.",
      height: "1,655 มม.",
      wheelbase: "2,660 มม.",
      weight: "1,450 กก.",
      seats: 5,
      trunk: "280 ลิตร"
    }
  },
  {
    id: "7",
    name: "Honda e:N2",
    brand: "Honda",
    model: "e:N2",
    price: 1429000,
    specs: {
      power: "150 kW",
      horsepower: "204 hp",
      torque: "310 Nm",
      battery: "68.8 kWh",
      batteryType: "NCM",
      range: "530 km (NEDC)",
      acceleration: "7.6 วินาที",
      topSpeed: "160 km/h",
      drivetrain: "FWD",
      chargingDC: "DC 80 kW (30-80% ใน 35 นาที)",
      chargingAC: "AC 6.6 kW",
      v2l: "ไม่รองรับ",
      warranty: "8 ปี/200,000 km (แบต), 3 ปี/100,000 km (รถ)",
      safety: "Honda Sensing, AEB, LDW, BSM, ACC, Airbags 6 ตัว",
      length: "4,390 มม.",
      width: "1,790 มม.",
      height: "1,560 มม.",
      wheelbase: "2,610 มม.",
      weight: "1,680 กก.",
      seats: 5,
      trunk: "380 ลิตร"
    }
  },
  {
    id: "8",
    name: "MG IM5",
    brand: "MG",
    model: "IM5",
    price: 1549900,
    specs: {
      power: "250 kW",
      horsepower: "340 hp",
      torque: "450 Nm",
      battery: "90 kWh",
      batteryType: "NMC",
      range: "860 km (NEDC)",
      acceleration: "5.4 วินาที",
      topSpeed: "200 km/h",
      drivetrain: "RWD",
      chargingDC: "DC 150 kW (10-80% ใน 30 นาที)",
      chargingAC: "AC 11 kW",
      v2l: "รองรับ 3.3 kW",
      warranty: "8 ปี/175,000 km (แบต), 7 ปี/150,000 km (รถ)",
      safety: "MG Pilot, AEB, LDW, BSM, ACC, 360° Camera, Airbags 6 ตัว",
      length: "5,098 มม.",
      width: "1,960 มม.",
      height: "1,485 มม.",
      wheelbase: "3,000 มม.",
      weight: "2,100 กก.",
      seats: 5,
      trunk: "500 ลิตร"
    }
  },
];

const defaultSpecFields: SpecField[] = [
  { key: "power", label: "กำลังไฟฟ้า", enabled: true },
  { key: "horsepower", label: "แรงม้า", enabled: true },
  { key: "torque", label: "แรงบิด", enabled: true },
  { key: "battery", label: "แบตเตอรี่", enabled: true },
  { key: "batteryType", label: "ชนิดแบตเตอรี่", enabled: true },
  { key: "range", label: "ระยะทาง", enabled: true },
  { key: "acceleration", label: "0-100 km/h", enabled: true },
  { key: "topSpeed", label: "ความเร็วสูงสุด", enabled: true },
  { key: "drivetrain", label: "ระบบขับเคลื่อน", enabled: true },
  { key: "chargingDC", label: "การชาร์จ DC", enabled: true },
  { key: "chargingAC", label: "การชาร์จ AC", enabled: true },
  { key: "v2l", label: "V2L", enabled: true },
  { key: "warranty", label: "การรับประกัน", enabled: true },
  { key: "safety", label: "ความปลอดภัย", enabled: true },
  { key: "length", label: "ความยาว", enabled: false },
  { key: "width", label: "ความกว้าง", enabled: false },
  { key: "height", label: "ความสูง", enabled: false },
  { key: "wheelbase", label: "ฐานล้อ", enabled: false },
  { key: "weight", label: "น้ำหนัก", enabled: false },
  { key: "seats", label: "ที่นั่ง", enabled: false },
  { key: "trunk", label: "พื้นที่เก็บของ", enabled: false },
];

export default function EVComparePage() {
  const [carDatabase, setCarDatabase] = useState<EVSpec[]>(sampleCarDatabase);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedCars, setSelectedCars] = useState<EVSpec[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [specFields, setSpecFields] = useState<SpecField[]>(defaultSpecFields);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportResolution, setExportResolution] = useState<number>(2);
  const [showResolutionPicker, setShowResolutionPicker] = useState(false);
  
  // Search filters
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [sortBy, setSortBy] = useState<"price" | "range" | "power">("price");
  
  // Auto-save state
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const comparisonRef = useRef<HTMLDivElement>(null);

  // Load data from NEV Database
  useEffect(() => {
    async function loadEVData() {
      try {
        const response = await fetch('/api/nev/cars');
        if (response.ok) {
          const data = await response.json();
          setCarDatabase(data);
        } else {
          console.error('Failed to load EV data, using sample data');
        }
      } catch (error) {
        console.error('Error loading EV data:', error);
      } finally {
        setIsLoadingData(false);
      }
    }
    loadEVData();
  }, []);

  // Get unique brands
  const brands = Array.from(new Set(carDatabase.map((ev) => ev.brand))).sort();

  // Filter and sort
  const filteredEVs = carDatabase
    .filter((ev) => {
      // Already selected
      if (selectedCars.find((c) => c.id === ev.id)) return false;
      
      // Search term
      if (searchTerm && !ev.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !ev.brand.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !ev.model.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Brand filter
      if (selectedBrand !== "all" && ev.brand !== selectedBrand) return false;
      
      // Price range
      if (ev.price < priceRange[0] || ev.price > priceRange[1]) return false;
      
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "range") {
        const rangeA = parseInt(String(a.specs.range || "0").split(" ")[0] || "0");
        const rangeB = parseInt(String(b.specs.range || "0").split(" ")[0] || "0");
        return rangeB - rangeA;
      }
      if (sortBy === "power") {
        const powerA = parseInt(String(a.specs.horsepower || "0").split(" ")[0] || "0");
        const powerB = parseInt(String(b.specs.horsepower || "0").split(" ")[0] || "0");
        return powerB - powerA;
      }
      return 0;
    });

  const addCar = (car: EVSpec) => {
    if (selectedCars.length < 6) {
      setSelectedCars([...selectedCars, car]);
      setSearchTerm("");
      setShowSearch(false);
    }
  };

  const removeCar = (id: string) => {
    setSelectedCars(selectedCars.filter((c) => c.id !== id));
  };

  const updateCarSpec = (carId: string, specKey: string, value: string) => {
    // อัปเดต local state ทันที
    setSelectedCars(
      selectedCars.map((car) =>
        car.id === carId
          ? { ...car, specs: { ...car.specs, [specKey]: value } }
          : car
      )
    );

    // Auto-save หลัง 2 วินาที (debounced)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        const response = await fetch('/api/nev/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            variantId: carId,
            field: specKey,
            value: value,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setLastUpdated(new Date(result.updatedAt));
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, 2000);
  };

  const requestDataEnrichment = async (car: EVSpec) => {
    if (!confirm(`🔍 ต้องการให้ AI ค้นหาข้อมูล ${car.name} เพิ่มเติมใช่หรือไม่?\n\nAI จะค้นหาจากเว็บไซต์อย่างเป็นทางการและอัปเดตลงฐานข้อมูล`)) {
      return;
    }

    try {
      const response = await fetch('/api/nev/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: car.id,
          variantName: car.name,
          brand: car.brand,
          model: car.model,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ ${result.message}\n\nระบบจะอัปเดตข้อมูลโดยอัตโนมัติในภายหลัง`);
      } else {
        const error = await response.json();
        alert(`❌ เกิดข้อผิดพลาด: ${error.error || 'ไม่สามารถส่งคำขอได้'}`);
      }
    } catch (error) {
      console.error('Enrich request failed:', error);
      alert('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const toggleSpecField = (key: string) => {
    setSpecFields(
      specFields.map((field) =>
        field.key === key ? { ...field, enabled: !field.enabled } : field
      )
    );
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newCars = [...selectedCars];
    const draggedCar = newCars[draggedIndex];
    newCars.splice(draggedIndex, 1);
    newCars.splice(index, 0, draggedCar);
    
    setSelectedCars(newCars);
    setDraggedIndex(index);
  };

  const exportImage = async (scale: number) => {
    if (!comparisonRef.current) {
      alert("ไม่พบตารางเปรียบเทียบ");
      return;
    }

    setIsExporting(true);
    setShowResolutionPicker(false);

    try {
      // Wait for UI update
      await new Promise((resolve) => setTimeout(resolve, 100));

      const { domToPng } = await import("modern-screenshot");

      const dataUrl = await domToPng(comparisonRef.current, {
        scale: scale,
        backgroundColor: "#ffffff",
        quality: 1,
        features: {
          removeControlCharacter: true,
        },
      });

      const resolutionLabel = scale === 2 ? "FHD" : scale === 4 ? "4K" : "8K";
      const link = document.createElement("a");
      link.download = `ev-comparison-${resolutionLabel}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
      alert(`Export ล้มเหลว: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsExporting(false);
    }
  };

  const enabledSpecs = specFields.filter((f) => f.enabled);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            เปรียบเทียบรถ EV
          </h1>
          <p className="text-gray-600">
            เลือกรถได้สูงสุด 6 คัน เพื่อเปรียบเทียบ specs ครบวงจร
            {isLoadingData && " — กำลังโหลดข้อมูล..."}
            {!isLoadingData && ` — ${carDatabase.length} คันในระบบ`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
            disabled={selectedCars.length >= 6}
          >
            <Plus size={20} />
            เพิ่มรถ ({selectedCars.length}/6)
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Settings size={20} />
            เลือก Specs
          </button>

          {selectedCars.length >= 2 && (
            <div className="relative">
              <button
                onClick={() => setShowResolutionPicker(!showResolutionPicker)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:shadow-lg transition-all"
                disabled={isExporting}
              >
                <Download size={20} />
                {isExporting ? "กำลัง Export..." : "Export ภาพ"}
              </button>

              {showResolutionPicker && !isExporting && (
                <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[200px] z-10">
                  <h4 className="font-semibold text-sm mb-3 text-gray-700">เลือกความละเอียด</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => exportImage(2)}
                      className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium">FHD (1920×1080)</div>
                      <div className="text-xs text-gray-500">ขนาดไฟล์เล็ก เหมาะสำหรับแชร์</div>
                    </button>
                    <button
                      onClick={() => exportImage(4)}
                      className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium">4K (3840×2160)</div>
                      <div className="text-xs text-gray-500">คมชัดสูง เหมาะสำหรับพิมพ์</div>
                    </button>
                    <button
                      onClick={() => exportImage(8)}
                      className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium">8K (7680×4320)</div>
                      <div className="text-xs text-gray-500">คมชัดสูงสุด ไฟล์ใหญ่</div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-semibold text-lg mb-4">เลือก Specs ที่จะแสดง</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {specFields.map((field) => (
                <label key={field.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.enabled}
                    onChange={() => toggleSpecField(field.key)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-sm">{field.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Search Panel */}
        {showSearch && (
          <div className="mb-6 bg-white rounded-lg shadow-lg p-6">
            {/* Search Box */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="ค้นหารถ EV..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                autoFocus
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">แบรนด์</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">ทุกแบรนด์</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ช่วงราคา: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} บาท
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 5000000])}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เรียงตาม</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="price">ราคา (ถูก → แพง)</option>
                  <option value="range">ระยะทาง (มาก → น้อย)</option>
                  <option value="power">กำลัง (มาก → น้อย)</option>
                </select>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <button
                onClick={() => {
                  setSelectedBrand("all");
                  setPriceRange([0, 1000000]);
                }}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
              >
                ราคาไม่เกิน 1 ล้าน
              </button>
              <button
                onClick={() => {
                  setSelectedBrand("all");
                  setPriceRange([1000000, 2000000]);
                }}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
              >
                1-2 ล้าน
              </button>
              <button
                onClick={() => {
                  setSelectedBrand("all");
                  setPriceRange([2000000, 5000000]);
                }}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm"
              >
                Premium (2 ล้าน+)
              </button>
              <button
                onClick={() => {
                  setSelectedBrand("all");
                  setPriceRange([0, 5000000]);
                  setSearchTerm("");
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                ล้างฟิลเตอร์
              </button>
            </div>

            {/* Results Count */}
            <p className="text-sm text-gray-600 mb-4">
              พบ {filteredEVs.length} คัน
            </p>

            {/* Car List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
              {filteredEVs.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => addCar(ev)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all text-left"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg leading-tight">{ev.name}</h3>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded shrink-0">{ev.brand}</span>
                  </div>
                  <p className="text-purple-600 font-bold text-xl mb-2">
                    {ev.price.toLocaleString()} ฿
                  </p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>⚡ {ev.specs.horsepower || '-'}</p>
                    <p>🔋 {ev.specs.battery || '-'}</p>
                    <p>📍 {ev.specs.range || '-'}</p>
                  </div>
                </button>
              ))}
              
              {filteredEVs.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <p className="text-lg">ไม่พบรถที่ตรงกับเงื่อนไข</p>
                  <p className="text-sm mt-2">ลองปรับฟิลเตอร์ใหม่</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comparison Table */}
        {selectedCars.length >= 2 ? (
          <div ref={comparisonRef} className="bg-white rounded-lg shadow-2xl p-8">
            {/* Header with Logo */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-purple-600">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                เปรียบเทียบรถ EV
              </h2>
              <div className="text-right">
                <p className="text-sm text-gray-500">iMoD Drive</p>
                <p className="text-xs text-gray-400">ev.iphonemod.net</p>
              </div>
            </div>

            {/* Comparison Grid */}
            <div
              className="grid gap-6"
              style={{ gridTemplateColumns: `200px repeat(${selectedCars.length}, 1fr)` }}
            >
              {/* Header Row - Car Names */}
              <div></div>
              {selectedCars.map((car, index) => {
                // นับจำนวนข้อมูลที่ขาด
                const missingCount = enabledSpecs.filter(
                  (field) => !car.specs[field.key] || car.specs[field.key] === '-'
                ).length;
                const hasIncompleteData = missingCount > 0;

                return (
                  <div
                    key={car.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg relative cursor-move"
                  >
                    <GripVertical className="absolute top-2 left-2 text-gray-400" size={16} />
                    {!isExporting && (
                      <>
                        <button
                          onClick={() => removeCar(car.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
                        >
                          <X size={16} />
                        </button>
                        {hasIncompleteData && (
                          <button
                            onClick={() => requestDataEnrichment(car)}
                            className="absolute top-2 right-2 bg-blue-500 text-white rounded-full px-2 py-1 hover:bg-blue-600 text-xs flex items-center gap-1 z-10"
                            title={`ข้อมูลไม่ครบ ${missingCount} รายการ — คลิกเพื่อให้ AI ค้นหา`}
                          >
                            <Search size={12} />
                            <span>ค้นหา</span>
                          </button>
                        )}
                      </>
                    )}
                    <h3 className="font-bold text-lg mb-1">{car.model}</h3>
                    <p className="text-sm text-gray-600 mb-2">{car.brand}</p>
                    <p className="text-purple-600 font-bold">{car.price.toLocaleString()} ฿</p>
                    {hasIncompleteData && !isExporting && (
                      <p className="text-xs text-orange-600 mt-1">
                        ข้อมูลไม่ครบ {missingCount} รายการ
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Specs Rows */}
              {enabledSpecs.map((field) => (
                <div key={field.key} className="contents">
                  <div className="font-semibold text-gray-700 py-3 px-4 bg-gray-50 rounded-lg flex items-center">
                    {field.label}
                  </div>
                  {selectedCars.map((car) => (
                    <div key={car.id} className="py-3 px-4 text-center border-b border-gray-100">
                      <input
                        type="text"
                        value={car.specs[field.key] || "-"}
                        onChange={(e) => updateCarSpec(car.id, field.key, e.target.value)}
                        className="w-full text-center bg-transparent border-none focus:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-purple-200 rounded px-2 py-1"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t text-center">
              <div className="text-sm text-gray-500 mb-2">
                สร้างโดย iMoD Drive — ข้อมูล ณ วันที่{" "}
                {new Date().toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              {!isExporting && (
                <div className="text-xs text-gray-400 space-y-1">
                  {isSaving && (
                    <p className="text-blue-600">💾 กำลังบันทึก...</p>
                  )}
                  {lastUpdated && (
                    <p>
                      อัปเดตล่าสุด:{" "}
                      {lastUpdated.toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      {lastUpdated.toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} น.
                    </p>
                  )}
                  <p className="text-green-600">
                    ✅ แก้ไขข้อมูลได้ — บันทึกอัตโนมัติลง NEV Database
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              เลือกรถอย่างน้อย 2 คัน
            </h3>
            <p className="text-gray-500">กดปุ่ม "เพิ่มรถ" เพื่อเริ่มเปรียบเทียบ</p>
          </div>
        )}
      </div>
    </div>
  );
}
