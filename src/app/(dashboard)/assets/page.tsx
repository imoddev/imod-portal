"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera,
  Plus,
  Search,
  Package,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRightLeft,
} from "lucide-react";

interface Asset {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  status: string;
  condition: string;
  location: string | null;
  borrowings?: { borrowerName: string; borrowDate: string }[];
}

const categories = [
  { id: "camera", name: "กล้อง", icon: "📷" },
  { id: "lens", name: "เลนส์", icon: "🔭" },
  { id: "mic", name: "ไมค์", icon: "🎤" },
  { id: "tripod", name: "ขาตั้ง", icon: "📐" },
  { id: "drone", name: "โดรน", icon: "🚁" },
  { id: "car", name: "รถทดสอบ", icon: "🚗" },
  { id: "laptop", name: "โน๊ตบุ๊ค", icon: "💻" },
  { id: "other", name: "อื่นๆ", icon: "📦" },
];

const statusColors: Record<string, string> = {
  available: "bg-green-500/20 text-green-500",
  "in-use": "bg-yellow-500/20 text-yellow-500",
  maintenance: "bg-red-500/20 text-red-500",
  retired: "bg-gray-500/20 text-gray-500",
};

const statusLabels: Record<string, string> = {
  available: "ว่าง",
  "in-use": "ใช้งานอยู่",
  maintenance: "ซ่อมบำรุง",
  retired: "ปลดระวาง",
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [summary, setSummary] = useState({ total: 0, available: 0, inUse: 0, maintenance: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBorrowDialog, setShowBorrowDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    brand: "",
    model: "",
    serialNumber: "",
    location: "",
  });

  const [borrowForm, setBorrowForm] = useState({
    borrowerName: "",
    purpose: "",
    dueDate: "",
  });

  // Mock current user
  const currentUser = {
    id: "1465635163466633308",
    name: "พี่ต้อม",
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/assets");
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
        setSummary(data.summary || { total: 0, available: 0, inUse: 0, maintenance: 0 });
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAsset = async () => {
    if (!form.name || !form.category) {
      alert("กรุณากรอกชื่อและประเภท");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowAddDialog(false);
        setForm({ name: "", category: "", brand: "", model: "", serialNumber: "", location: "" });
        fetchAssets();
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBorrow = async () => {
    if (!selectedAsset || !borrowForm.borrowerName) {
      alert("กรุณากรอกชื่อผู้ยืม");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/assets/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "borrow",
          assetId: selectedAsset.id,
          borrowerId: currentUser.id,
          borrowerName: borrowForm.borrowerName,
          purpose: borrowForm.purpose,
          dueDate: borrowForm.dueDate,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setShowBorrowDialog(false);
        setBorrowForm({ borrowerName: "", purpose: "", dueDate: "" });
        setSelectedAsset(null);
        fetchAssets();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturn = async (asset: Asset) => {
    if (!confirm(`คืนอุปกรณ์ "${asset.name}"?`)) return;

    try {
      const res = await fetch("/api/assets/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "return",
          assetId: asset.id,
        }),
      });

      if (res.ok) {
        fetchAssets();
      }
    } catch (e) {
      console.error("Error:", e);
    }
  };

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    const matchSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       asset.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       asset.model?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = filterCategory === "all" || asset.category === filterCategory;
    const matchStatus = filterStatus === "all" || asset.status === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Asset Management
          </h1>
          <p className="text-muted-foreground">
            จัดการอุปกรณ์ ({assets.length} รายการ)
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มอุปกรณ์
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มอุปกรณ์ใหม่</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>ชื่ออุปกรณ์ *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="เช่น Sony A7IV"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ประเภท *</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกประเภท" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ยี่ห้อ</Label>
                  <Input
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    placeholder="เช่น Sony"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>รุ่น</Label>
                  <Input
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    placeholder="เช่น A7IV"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Serial Number</Label>
                  <Input
                    value={form.serialNumber}
                    onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>ที่เก็บ</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="เช่น ตู้อุปกรณ์ A"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>ยกเลิก</Button>
              <Button onClick={handleAddAsset} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                บันทึก
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{summary.total}</p>
              <p className="text-sm text-muted-foreground">อุปกรณ์ทั้งหมด</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">{summary.available}</p>
              <p className="text-sm text-muted-foreground">ว่าง</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-500">{summary.inUse}</p>
              <p className="text-sm text-muted-foreground">ใช้งานอยู่</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500">{summary.maintenance}</p>
              <p className="text-sm text-muted-foreground">ซ่อมบำรุง</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="ค้นหาอุปกรณ์..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกประเภท</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกสถานะ</SelectItem>
            <SelectItem value="available">ว่าง</SelectItem>
            <SelectItem value="in-use">ใช้งานอยู่</SelectItem>
            <SelectItem value="maintenance">ซ่อมบำรุง</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Asset Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredAssets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>ไม่พบอุปกรณ์</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssets.map((asset) => {
            const category = categories.find(c => c.id === asset.category);
            const borrower = asset.borrowings?.[0];

            return (
              <Card key={asset.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category?.icon || "📦"}</span>
                      <div>
                        <p className="font-medium">{asset.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {asset.brand} {asset.model}
                        </p>
                      </div>
                    </div>
                    <Badge className={statusColors[asset.status]}>
                      {statusLabels[asset.status]}
                    </Badge>
                  </div>

                  {borrower && (
                    <div className="mb-3 p-2 rounded bg-yellow-500/10 text-sm">
                      <p className="text-yellow-500">📍 ยืมโดย: {borrower.borrowerName}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {asset.status === "available" ? (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedAsset(asset);
                          setShowBorrowDialog(true);
                        }}
                      >
                        <ArrowRightLeft className="h-4 w-4 mr-1" />
                        ยืม
                      </Button>
                    ) : asset.status === "in-use" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleReturn(asset)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        คืน
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Borrow Dialog */}
      <Dialog open={showBorrowDialog} onOpenChange={setShowBorrowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืมอุปกรณ์: {selectedAsset?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>ชื่อผู้ยืม *</Label>
              <Input
                value={borrowForm.borrowerName}
                onChange={(e) => setBorrowForm({ ...borrowForm, borrowerName: e.target.value })}
                placeholder="ชื่อผู้ยืม"
              />
            </div>
            <div className="space-y-2">
              <Label>วัตถุประสงค์</Label>
              <Textarea
                value={borrowForm.purpose}
                onChange={(e) => setBorrowForm({ ...borrowForm, purpose: e.target.value })}
                placeholder="ระบุวัตถุประสงค์การยืม"
              />
            </div>
            <div className="space-y-2">
              <Label>กำหนดคืน</Label>
              <Input
                type="date"
                className="[color-scheme:dark]"
                value={borrowForm.dueDate}
                onChange={(e) => setBorrowForm({ ...borrowForm, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBorrowDialog(false)}>ยกเลิก</Button>
            <Button onClick={handleBorrow} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              ยืนยันยืม
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
