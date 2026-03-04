"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Copy,
  Check,
  Building2,
  User,
  Mail,
  Phone,
  Calculator,
} from "lucide-react";

interface QuotationItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface ClientInfo {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
}

const serviceTemplates = [
  { name: "Article Review", price: 20000, description: "บทความรีวิวสินค้า/บริการ 1 ชิ้น" },
  { name: "Video Review (Short)", price: 45000, description: "วิดีโอรีวิว 5-10 นาที" },
  { name: "Video Review (Long)", price: 75000, description: "วิดีโอรีวิว 15-20 นาที" },
  { name: "Social Media Post", price: 8000, description: "โพสต์บน Facebook/Twitter" },
  { name: "Instagram Story", price: 5000, description: "Story 3-5 slides" },
  { name: "Event Coverage", price: 80000, description: "งาน Press Event / เปิดตัว" },
  { name: "Sponsored Content", price: 35000, description: "บทความ Advertorial" },
  { name: "Banner Ad (1 month)", price: 25000, description: "แบนเนอร์หน้าแรก" },
];

export default function QuotationPage() {
  const [client, setClient] = useState<ClientInfo>({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [items, setItems] = useState<QuotationItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [copied, setCopied] = useState(false);

  const addItem = (template: typeof serviceTemplates[0]) => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      name: template.name,
      description: template.description,
      quantity: 1,
      unitPrice: template.price,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof QuotationItem, value: any) => {
    setItems(items.map((item) => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;
  const vat = total * 0.07;
  const grandTotal = total + vat;

  const generateQuotationText = () => {
    const date = new Date().toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let text = `ใบเสนอราคา / Quotation\n`;
    text += `วันที่: ${date}\n`;
    text += `เลขที่: QT-${Date.now().toString().slice(-8)}\n\n`;
    
    text += `ลูกค้า:\n`;
    text += `${client.companyName}\n`;
    text += `${client.contactName}\n`;
    text += `${client.email} | ${client.phone}\n\n`;
    
    text += `รายการ:\n`;
    text += `${"─".repeat(50)}\n`;
    
    items.forEach((item, index) => {
      text += `${index + 1}. ${item.name}\n`;
      text += `   ${item.description}\n`;
      text += `   จำนวน: ${item.quantity} x ฿${item.unitPrice.toLocaleString()} = ฿${(item.quantity * item.unitPrice).toLocaleString()}\n\n`;
    });

    text += `${"─".repeat(50)}\n`;
    text += `ยอดรวม: ฿${subtotal.toLocaleString()}\n`;
    if (discount > 0) {
      text += `ส่วนลด ${discount}%: -฿${discountAmount.toLocaleString()}\n`;
    }
    text += `หลังหักส่วนลด: ฿${total.toLocaleString()}\n`;
    text += `VAT 7%: ฿${vat.toLocaleString()}\n`;
    text += `รวมทั้งสิ้น: ฿${grandTotal.toLocaleString()}\n`;

    return text;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateQuotationText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Quotation Generator
          </h1>
          <p className="text-muted-foreground">
            สร้างใบเสนอราคาสำหรับลูกค้า
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyToClipboard} disabled={items.length === 0}>
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? "Copied!" : "Copy Text"}
          </Button>
          <Button disabled={items.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              ข้อมูลลูกค้า
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>ชื่อบริษัท</Label>
              <Input
                placeholder="บริษัท ABC จำกัด"
                value={client.companyName}
                onChange={(e) => setClient({ ...client, companyName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>ผู้ติดต่อ</Label>
              <Input
                placeholder="คุณสมชาย"
                value={client.contactName}
                onChange={(e) => setClient({ ...client, contactName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="contact@company.com"
                value={client.email}
                onChange={(e) => setClient({ ...client, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>เบอร์โทร</Label>
              <Input
                placeholder="02-xxx-xxxx"
                value={client.phone}
                onChange={(e) => setClient({ ...client, phone: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Service Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-4 w-4" />
              เลือกบริการ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {serviceTemplates.map((template) => (
                <Button
                  key={template.name}
                  variant="outline"
                  className="w-full justify-between h-auto py-2"
                  onClick={() => addItem(template)}
                >
                  <div className="text-left">
                    <p className="font-medium">{template.name}</p>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  </div>
                  <Badge variant="secondary">฿{template.price.toLocaleString()}</Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quotation Items & Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              รายการ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                เลือกบริการจากด้านซ้าย
              </p>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-600"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                        className="w-16 h-8 text-sm"
                      />
                      <span className="text-sm text-muted-foreground">x</span>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, "unitPrice", parseInt(e.target.value) || 0)}
                        className="flex-1 h-8 text-sm"
                      />
                    </div>
                    <p className="text-right text-sm font-medium">
                      ฿{(item.quantity * item.unitPrice).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">ส่วนลด (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
                      className="w-20 h-8"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>ยอดรวม</span>
                    <span>฿{subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>ส่วนลด {discount}%</span>
                      <span>-฿{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>หลังหักส่วนลด</span>
                    <span>฿{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT 7%</span>
                    <span>฿{vat.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>รวมทั้งสิ้น</span>
                    <span className="text-primary">฿{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
