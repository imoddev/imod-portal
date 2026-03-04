"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ExternalLink,
  Smartphone,
  Car,
  Zap,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";

interface RateCard {
  id: string;
  name: string;
  category: string;
  icon: typeof Smartphone;
  color: string;
  slidesId: string;
  shortUrl: string;
  description: string;
}

const rateCards: RateCard[] = [
  {
    id: "it-gadget",
    name: "IT & Gadget",
    category: "iPhoneMod.net",
    icon: Smartphone,
    color: "bg-blue-100 text-blue-700",
    slidesId: "1VXHvld1JeHUPBKg6rwHZEhX9UzwbEQR9iFmcV21OyrE",
    shortUrl: "imods.cc/itgadget2026",
    description: "Rate Card สำหรับสินค้า IT, Gadget, Smartphone",
  },
  {
    id: "automotive",
    name: "Automotive",
    category: "EVMoD",
    icon: Car,
    color: "bg-green-100 text-green-700",
    slidesId: "1qFZ3zSTBwOHn3tOBja8oqBtzlV2EO3eO",
    shortUrl: "imods.cc/automotive2026",
    description: "Rate Card สำหรับรถยนต์ไฟฟ้า, EV, Automotive",
  },
  {
    id: "energy",
    name: "Energy",
    category: "EVMoD",
    icon: Zap,
    color: "bg-yellow-100 text-yellow-700",
    slidesId: "1kiuW-8r7CegHrJqAzLgObRFgqlw9OPJjyu868Eq90FA",
    shortUrl: "imods.cc/energy2026",
    description: "Rate Card สำหรับพลังงาน, Solar, Battery",
  },
];

const packages = [
  {
    name: "Article Review",
    description: "บทความรีวิวสินค้า/บริการ",
    features: ["บทความ 1 ชิ้น", "รูปภาพประกอบ", "SEO Optimized", "Social Share"],
    price: "฿15,000 - ฿25,000",
  },
  {
    name: "Video Review",
    description: "วิดีโอรีวิวบน YouTube",
    features: ["วิดีโอ 10-15 นาที", "YouTube + Facebook", "Thumbnail", "Description"],
    price: "฿35,000 - ฿80,000",
  },
  {
    name: "Bundle Package",
    description: "บทความ + วิดีโอ",
    features: ["บทความ 1 ชิ้น", "วิดีโอ 1 ชิ้น", "Social Coverage", "Special Rate"],
    price: "฿45,000 - ฿100,000",
  },
  {
    name: "Event Coverage",
    description: "งานเปิดตัว/Press Event",
    features: ["Live Coverage", "บทความสรุป", "วิดีโอ Highlight", "Social Posts"],
    price: "฿50,000 - ฿150,000",
  },
];

export default function RateCardPage() {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(`https://${url}`);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Rate Card 2026
        </h1>
        <p className="text-muted-foreground">
          ใบเสนอราคามาตรฐานสำหรับทีม Sales
        </p>
      </div>

      {/* Rate Card Links */}
      <div className="grid gap-4 md:grid-cols-3">
        {rateCards.map((card) => {
          const Icon = card.icon;
          const isCopied = copiedUrl === card.shortUrl;
          
          return (
            <Card key={card.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline">{card.category}</Badge>
                </div>
                <CardTitle className="text-lg">{card.name}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <a
                      href={`https://docs.google.com/presentation/d/${card.slidesId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      เปิด Slides
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyUrl(card.shortUrl)}
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  {card.shortUrl}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pricing Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Overview</CardTitle>
          <CardDescription>ราคามาตรฐาน (ปรับตามขอบเขตงานจริง)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {packages.map((pkg) => (
              <div key={pkg.name} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{pkg.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                <ul className="text-sm space-y-1 mb-3">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <p className="font-bold text-primary">{pkg.price}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Copy */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Copy</CardTitle>
          <CardDescription>ลิงก์สำหรับส่งลูกค้า</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {rateCards.map((card) => (
              <Button
                key={card.id}
                variant="outline"
                className="justify-between"
                onClick={() => copyUrl(card.shortUrl)}
              >
                <span>{card.name}</span>
                {copiedUrl === card.shortUrl ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
