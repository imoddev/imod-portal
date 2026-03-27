"use client";

import { useState, useRef, useEffect } from "react";
import { Download, Plus, X, Search, GripVertical, Settings, Upload, Image as ImageIcon } from "lucide-react";
import BrandAutocomplete from "@/components/BrandAutocomplete";
import ModelAutocomplete from "@/components/ModelAutocomplete";

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
  
  // Background & Export options
  const [bgTheme, setBgTheme] = useState<"light" | "dark" | "purple" | "custom">("light");
  const [customBgColor, setCustomBgColor] = useState("#ffffff");
  const [showCarImages, setShowCarImages] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  
  // Add new car modal
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [newCarForm, setNewCarForm] = useState({
    brand: '',
    model: '',
    variant: '',
    year: new Date().getFullYear(),
    url: '',
    brochure: null as File | null,
  });
  
  // Autocomplete data
  const [allBrands, setAllBrands] = useState<Array<{ id: string; name: string; nameTh: string; slug: string }>>([]);
  const [allModels, setAllModels] = useState<Array<{ id: string; name: string; nameTh: string; slug: string; brand: { name: string } }>>([]);
  const [filteredBrands, setFilteredBrands] = useState<typeof allBrands>([]);
  const [filteredModels, setFilteredModels] = useState<typeof allModels>([]);
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);
  
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
  
  // Load brands and models for autocomplete
  useEffect(() => {
    async function loadBrandsAndModels() {
      try {
        const [brandsRes, modelsRes] = await Promise.all([
          fetch('/api/nev/brands'),
          fetch('/api/nev/models')
        ]);
        
        if (brandsRes.ok) {
          const brandsData = await brandsRes.json();
          setAllBrands(brandsData);
          setFilteredBrands(brandsData);
        }
        
        if (modelsRes.ok) {
          const modelsData = await modelsRes.json();
          setAllModels(modelsData);
          setFilteredModels(modelsData);
        }
      } catch (error) {
        console.error('Error loading brands/models:', error);
      }
    }
    loadBrandsAndModels();
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

  const submitNewCar = async () => {
    if (!newCarForm.brand || !newCarForm.model || !newCarForm.variant) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน (แบรนด์, รุ่น, รุ่นย่อย)');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('brand', newCarForm.brand.trim());
      formData.append('model', newCarForm.model.trim());
      formData.append('variant', newCarForm.variant.trim());
      formData.append('year', newCarForm.year.toString());
      if (newCarForm.url?.trim()) {
        formData.append('url', newCarForm.url.trim());
      }
      if (newCarForm.brochure) {
        formData.append('brochure', newCarForm.brochure);
      }

      const response = await fetch('/api/nev/add-new', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ ${result.message}\n\nAI จะค้นหาข้อมูลและเพิ่มเข้าระบบโดยอัตโนมัติ (ประมาณ 5-10 นาที)\n\nแจ้งเตือนผ่าน Discord เมื่อเสร็จสิ้น`);
        setShowAddCarModal(false);
        setNewCarForm({
          brand: '',
          model: '',
          variant: '',
          year: new Date().getFullYear(),
          url: '',
          brochure: null,
        });
      } else {
        alert(`❌ เกิดข้อผิดพลาด: ${result.error || 'ไม่สามารถส่งคำขอได้'}`);
      }
    } catch (error: any) {
      console.error('Add new car request failed:', error);
      alert(`❌ เกิดข้อผิดพลาด: ${error.message || 'ไม่สามารถเชื่อมต่อได้'}`);
    }
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

  // Helper: Format spec values (trim verbose text)
  const formatSpecValue = (key: string, value: string | number | undefined): string => {
    if (!value || value === '-') return '-';
    
    const str = String(value);
    
    // DC Charging: "DC 70 kW (10-80% ใน 27 นาที)" → "70 kW"
    if (key === 'chargingDC') {
      const match = str.match(/(\d+\.?\d*)\s*kW/);
      return match ? `${match[1]} kW` : str;
    }
    
    // AC Charging: "AC 11 kW" → "11 kW"
    if (key === 'chargingAC') {
      const match = str.match(/(\d+\.?\d*)\s*kW/);
      return match ? `${match[1]} kW` : str;
    }
    
    // V2L: "รองรับ V2L 3.3 kW" → "3.3 kW" | "ไม่รองรับ" → "-"
    if (key === 'v2l') {
      if (str.includes('ไม่รองรับ')) return '-';
      const match = str.match(/(\d+\.?\d*)\s*kW/);
      return match ? `${match[1]} kW` : str;
    }
    
    return str;
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

      // Get background color based on theme
      const getBgColor = () => {
        if (bgTheme === "custom") return customBgColor;
        if (bgTheme === "dark") return "#1a1a1a";
        if (bgTheme === "purple") return "#9333ea";
        return "#ffffff";
      };

      const dataUrl = await domToPng(comparisonRef.current, {
        scale: scale,
        backgroundColor: getBgColor(),
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
          <p className="text-gray-800 text-lg font-medium">
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
                <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[250px] z-10">
                  {/* Theme Selector */}
                  <h4 className="font-semibold text-sm mb-3 text-gray-700">เลือกธีม</h4>
                  <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                    <button
                      onClick={() => setBgTheme("light")}
                      className={`w-full text-left px-4 py-2 rounded transition-colors ${
                        bgTheme === "light" ? "bg-purple-100 border-2 border-purple-500" : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="font-medium">☀️ พื้นหลังสว่าง</div>
                      <div className="text-sm text-gray-700">เหมาะสำหรับพิมพ์</div>
                    </button>
                    <button
                      onClick={() => setBgTheme("dark")}
                      className={`w-full text-left px-4 py-2 rounded transition-colors ${
                        bgTheme === "dark" ? "bg-purple-100 border-2 border-purple-500" : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="font-medium">🌙 พื้นหลังมืด</div>
                      <div className="text-sm text-gray-700">สไตล์ Premium</div>
                    </button>
                    <button
                      onClick={() => setBgTheme("purple")}
                      className={`w-full text-left px-4 py-2 rounded transition-colors ${
                        bgTheme === "purple" ? "bg-purple-100 border-2 border-purple-500" : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="font-medium">🌈 Gradient Purple</div>
                      <div className="text-sm text-gray-700">สไตล์ iMoD</div>
                    </button>
                  </div>
                  
                  <h4 className="font-semibold text-sm mb-3 text-gray-700">เลือกความละเอียด</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => exportImage(2)}
                      className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium">FHD (1920×1080)</div>
                      <div className="text-sm text-gray-700">ขนาดไฟล์เล็ก เหมาะสำหรับแชร์</div>
                    </button>
                    <button
                      onClick={() => exportImage(4)}
                      className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium">4K (3840×2160)</div>
                      <div className="text-sm text-gray-700">คมชัดสูง เหมาะสำหรับพิมพ์</div>
                    </button>
                    <button
                      onClick={() => exportImage(8)}
                      className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium">8K (7680×4320)</div>
                      <div className="text-sm text-gray-700">คมชัดสูงสุด ไฟล์ใหญ่</div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 bg-white rounded-lg shadow-lg p-6 space-y-8">
            {/* Background Theme */}
            <div>
              <h3 className="font-bold text-xl mb-4 text-gray-900">🎨 พื้นหลัง</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => setBgTheme("light")}
                  className={`p-4 rounded-lg border-2 transition ${bgTheme === "light" ? "border-purple-600 bg-purple-50" : "border-gray-300 hover:border-gray-400"}`}
                >
                  <div className="w-full h-16 bg-white rounded mb-2 border border-gray-200"></div>
                  <div className="text-sm font-medium">Light</div>
                </button>
                <button
                  onClick={() => setBgTheme("dark")}
                  className={`p-4 rounded-lg border-2 transition ${bgTheme === "dark" ? "border-purple-600 bg-purple-50" : "border-gray-300 hover:border-gray-400"}`}
                >
                  <div className="w-full h-16 bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 rounded mb-2"></div>
                  <div className="text-sm font-medium">Dark</div>
                </button>
                <button
                  onClick={() => setBgTheme("purple")}
                  className={`p-4 rounded-lg border-2 transition ${bgTheme === "purple" ? "border-purple-600 bg-purple-50" : "border-gray-300 hover:border-gray-400"}`}
                >
                  <div className="w-full h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded mb-2"></div>
                  <div className="text-sm font-medium">iMoD</div>
                </button>
                <button
                  onClick={() => setBgTheme("custom")}
                  className={`p-4 rounded-lg border-2 transition ${bgTheme === "custom" ? "border-purple-600 bg-purple-50" : "border-gray-300 hover:border-gray-400"}`}
                >
                  <div className="w-full h-16 rounded mb-2 border-2 border-dashed border-gray-400 flex items-center justify-center">
                    <input
                      type="color"
                      value={customBgColor}
                      onChange={(e) => {
                        setCustomBgColor(e.target.value);
                        setBgTheme("custom");
                      }}
                      className="w-12 h-12 cursor-pointer"
                    />
                  </div>
                  <div className="text-sm font-medium">Custom</div>
                </button>
              </div>
            </div>

            {/* Export Options */}
            <div>
              <h3 className="font-bold text-xl mb-4 text-gray-900">📸 Export</h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCarImages}
                    onChange={(e) => setShowCarImages(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                  <span className="text-base font-medium">แสดงรูปรถ</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLogo}
                    onChange={(e) => setShowLogo(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                  <span className="text-base font-medium">แสดง Logo</span>
                </label>
              </div>
            </div>

            {/* Specs Selection */}
            <div>
              <h3 className="font-bold text-xl mb-4 text-gray-900">📋 เลือก Specs</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {specFields.map((field) => (
                  <label key={field.key} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                    <input
                      type="checkbox"
                      checked={field.enabled}
                      onChange={() => toggleSpecField(field.key)}
                      className="w-5 h-5 text-purple-600 rounded border-2 border-gray-400 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    />
                    <span className="text-base font-medium text-gray-900">{field.label}</span>
                  </label>
                ))}
              </div>
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium placeholder-gray-400"
                style={{ color: '#000000' }}
                autoFocus
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Brand Filter */}
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">แบรนด์</label>
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
                <label className="block text-base font-semibold text-gray-900 mb-2">
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
                <label className="block text-base font-semibold text-gray-900 mb-2">เรียงตาม</label>
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
            <p className="text-base text-gray-800 mb-4 font-medium">
              พบ {filteredEVs.length} คัน
            </p>

            {/* Car List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
              {filteredEVs.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => addCar(ev)}
                  className="p-5 border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:shadow-lg transition-all text-left bg-white"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-xl leading-tight text-gray-900">{ev.name}</h3>
                    <span className="text-base font-semibold bg-gray-200 text-gray-900 px-3 py-1 rounded-full shrink-0">{ev.brand}</span>
                  </div>
                  <p className="text-purple-600 font-bold text-2xl mb-3">
                    {ev.price.toLocaleString()} ฿
                  </p>
                  <div className="text-lg text-gray-800 space-y-2 font-semibold">
                    <p>⚡ {ev.specs.horsepower || '-'}</p>
                    <p>🔋 {ev.specs.battery || '-'}</p>
                    <p>📍 {ev.specs.range || '-'}</p>
                  </div>
                </button>
              ))}
              
              {filteredEVs.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-500 mb-6">
                    <p className="text-lg font-semibold">ไม่พบรถที่ตรงกับเงื่อนไข</p>
                    <p className="text-sm mt-2">ลองปรับฟิลเตอร์ใหม่ หรือ</p>
                  </div>
                  <button
                    onClick={() => setShowAddCarModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    <Plus size={20} />
                    <span>เพิ่มรถใหม่เข้าระบบ</span>
                  </button>
                  <p className="text-sm text-gray-700 mt-4">
                    AI จะค้นหาข้อมูลและเพิ่มเข้า NEV Database ให้อัตโนมัติ
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comparison Table */}
        {selectedCars.length >= 2 ? (
          <div 
            ref={comparisonRef} 
            className="rounded-lg shadow-2xl p-8"
            style={{
              background: bgTheme === "dark" 
                ? "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #4a1a1a 100%)"
                : bgTheme === "purple"
                ? "linear-gradient(135deg, #9333ea 0%, #c026d3 50%, #db2777 100%)"
                : bgTheme === "custom"
                ? customBgColor
                : "#ffffff"
            }}
          >
            {/* Header with Logo */}
            <div className={`flex justify-between items-center mb-6 pb-4 border-b-2 ${bgTheme === "light" ? "border-purple-600" : "border-pink-500"}`}>
              <h2 className={`text-2xl font-bold ${
                bgTheme === "light" 
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                  : "text-white"
              }`}>
                เปรียบเทียบรถ EV
              </h2>
              <div className="text-right flex flex-col items-end gap-1">
                <img 
                  src="/logo-evmod.png" 
                  alt="iMoD Drive" 
                  className="h-12" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <p className={`text-sm ${bgTheme === "light" ? "text-gray-500" : "text-gray-300"}`}>iMoD Drive</p>
                <p className={`text-sm ${bgTheme === "light" ? "text-gray-700" : "text-white"}`}>ev.iphonemod.net</p>
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
                    className={`text-center p-4 rounded-lg relative cursor-move ${
                      bgTheme === "dark" || bgTheme === "purple" 
                        ? "bg-white/10 backdrop-blur-sm border border-white/20" 
                        : "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900"
                    }`}
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
                    {/* Car Image */}
                    {showCarImages && car.image && (
                      <div className="mb-3 relative group">
                        <img 
                          src={car.image} 
                          alt={car.name}
                          className="w-full h-32 object-contain"
                        />
                        {!isExporting && (
                          <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button
                              onClick={() => {
                                const url = prompt("แก้ไข URL รูปรถ:", car.image);
                                if (url !== null) {
                                  const updatedCars = selectedCars.map(c => 
                                    c.id === car.id ? { ...c, image: url || undefined } : c
                                  );
                                  setSelectedCars(updatedCars);
                                  triggerAutoSave(updatedCars);
                                }
                              }}
                              className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600"
                              title="แก้ไขรูป"
                            >
                              <Search size={12} />
                            </button>
                            <button
                              onClick={() => {
                                const updatedCars = selectedCars.map(c => 
                                  c.id === car.id ? { ...c, image: undefined } : c
                                );
                                setSelectedCars(updatedCars);
                                triggerAutoSave(updatedCars);
                              }}
                              className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              title="ลบรูป"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {showCarImages && !car.image && !isExporting && (
                      <div className="mb-3 relative">
                        <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 gap-2">
                          <ImageIcon size={24} className="text-gray-400" />
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const url = prompt("ใส่ URL รูปรถ:");
                                if (url) {
                                  const updatedCars = selectedCars.map(c => 
                                    c.id === car.id ? { ...c, image: url } : c
                                  );
                                  setSelectedCars(updatedCars);
                                  triggerAutoSave(updatedCars);
                                }
                              }}
                              className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition flex items-center gap-1"
                            >
                              <Search size={12} />
                              URL
                            </button>
                            <label className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition flex items-center gap-1 cursor-pointer">
                              <Upload size={12} />
                              Upload
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const dataUrl = event.target?.result as string;
                                      const updatedCars = selectedCars.map(c => 
                                        c.id === car.id ? { ...c, image: dataUrl } : c
                                      );
                                      setSelectedCars(updatedCars);
                                      triggerAutoSave(updatedCars);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className={`text-lg font-bold leading-tight mb-1 ${bgTheme === "dark" || bgTheme === "purple" ? "text-white" : "text-gray-900"}`}>
                      {car.brand} - {car.model}
                    </div>
                    <div className={`text-base leading-tight mb-1 ${bgTheme === "dark" || bgTheme === "purple" ? "text-white/80" : "text-gray-700"}`}>
                      {car.name.replace(`${car.brand} ${car.model} `, '')}
                    </div>
                    <div className={`font-bold text-xl leading-tight ${bgTheme === "dark" || bgTheme === "purple" ? "text-pink-400" : "text-purple-600"}`}>
                      {car.price.toLocaleString()} ฿
                    </div>
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
                  <div className={`font-bold text-lg py-1 px-3 rounded-lg flex items-center leading-tight ${
                    bgTheme === "dark" || bgTheme === "purple"
                      ? "text-white bg-white/10 border border-white/20"
                      : "text-gray-900 bg-gray-100"
                  }`}>
                    {field.label}
                  </div>
                  {selectedCars.map((car) => (
                    <div key={car.id} className={`py-1 px-3 text-center ${
                      bgTheme === "dark" || bgTheme === "purple" 
                        ? "border-b border-white/10" 
                        : "border-b border-gray-200"
                    }`}>
                      <input
                        type="text"
                        value={formatSpecValue(field.key, car.specs[field.key])}
                        onChange={(e) => updateCarSpec(car.id, field.key, e.target.value)}
                        className={`w-full text-center text-base font-normal bg-transparent border-none focus:outline-none focus:ring-2 rounded px-2 py-0.5 leading-tight ${
                          bgTheme === "dark" || bgTheme === "purple"
                            ? "text-white placeholder-white/50 focus:bg-white/10 focus:ring-pink-400"
                            : "text-gray-900 placeholder-gray-400 focus:bg-yellow-50 focus:ring-purple-300"
                        }`}
                        style={{ color: bgTheme === "dark" || bgTheme === "purple" ? '#ffffff' : '#000000' }}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className={`mt-6 pt-4 text-center ${
              bgTheme === "dark" || bgTheme === "purple" 
                ? "border-t border-white/20" 
                : "border-t border-gray-300"
            }`}>
              {showLogo && (
                <div className="flex justify-center items-center gap-8 mb-4">
                  <div className={`text-xl font-bold ${
                    bgTheme === "dark" || bgTheme === "purple" ? "text-white" : "text-gray-900"
                  }`}>
                    iMoD Drive
                  </div>
                  <div className="w-px h-8 bg-gray-300"></div>
                  <div className={`text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text ${
                    bgTheme === "dark" || bgTheme === "purple" ? "text-transparent" : "text-transparent"
                  }`}>
                    iMoD Official
                  </div>
                </div>
              )}
              <div className={`text-sm mb-2 ${
                bgTheme === "dark" || bgTheme === "purple" ? "text-white/70" : "text-gray-500"
              }`}>
                สร้างโดย iMoD Drive — ข้อมูล ณ วันที่{" "}
                {new Date().toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              {!isExporting && (
                <div className="text-sm text-gray-700 space-y-1">
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

        {/* Add New Car Modal */}
        {showAddCarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    เพิ่มรถใหม่เข้าระบบ
                  </h2>
                  <button
                    onClick={() => setShowAddCarModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Brand - Autocomplete */}
                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      แบรนด์ (Brand) <span className="text-red-500">*</span>
                    </label>
                    <BrandAutocomplete
                      value={newCarForm.brand}
                      onChange={(value) => setNewCarForm({ ...newCarForm, brand: value, model: '', variant: '' })}
                      onSelect={(brand) => setNewCarForm({ ...newCarForm, brand: brand.name, model: '', variant: '' })}
                      placeholder="พิมพ์เพื่อค้นหา (เช่น BYD, Tesla, MG)"
                      required
                    />
                  </div>

                  {/* Model - Autocomplete */}
                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      รุ่น (Model) <span className="text-red-500">*</span>
                    </label>
                    <ModelAutocomplete
                      value={newCarForm.model}
                      onChange={(value) => setNewCarForm({ ...newCarForm, model: value, variant: '' })}
                      onSelect={(model) => setNewCarForm({ ...newCarForm, model: model.name })}
                      brandName={newCarForm.brand}
                      placeholder="พิมพ์เพื่อค้นหา (เช่น SEAL, Model Y, MG4)"
                      disabled={!newCarForm.brand}
                      required
                    />
                  </div>

                  {/* Variant */}
                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      รุ่นย่อย (Sub-Model) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น Standard Range, Long Range AWD, Extended"
                      value={newCarForm.variant}
                      onChange={(e) => setNewCarForm({ ...newCarForm, variant: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      ปี (Model Year) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="2020"
                      max="2030"
                      value={newCarForm.year}
                      onChange={(e) => setNewCarForm({ ...newCarForm, year: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* URL */}
                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      URL เพิ่มเติม (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/car-spec"
                      value={newCarForm.url}
                      onChange={(e) => setNewCarForm({ ...newCarForm, url: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-700 mt-1">
                      URL ของหน้า spec ทางการ (ช่วย AI ค้นหาข้อมูล)
                    </p>
                  </div>

                  {/* Brochure Upload */}
                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-2">
                      แนบไฟล์โบรชัวร์ (Optional)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => setNewCarForm({ ...newCarForm, brochure: e.target.files?.[0] || null })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-700 mt-1">
                      PDF หรือรูปภาพ (AI จะใช้ OCR ถอดข้อมูล)
                    </p>
                    {newCarForm.brochure && (
                      <p className="text-sm text-green-600 mt-2">
                        ✅ ไฟล์: {newCarForm.brochure.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={submitNewCar}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                  >
                    ส่งคำขอ
                  </button>
                  <button
                    onClick={() => setShowAddCarModal(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                  >
                    ยกเลิก
                  </button>
                </div>

                <p className="text-sm text-gray-700 mt-4 text-center">
                  🤖 AI จะค้นหาข้อมูลและเพิ่มเข้าระบบโดยอัตโนมัติ (5-10 นาที)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
