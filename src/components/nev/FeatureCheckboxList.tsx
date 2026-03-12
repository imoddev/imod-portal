'use client';

import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Shield, Radio, Sofa, Car, Layout, Cpu, Zap, Battery,
  ChevronDown, ChevronRight, Plus, Save, Loader2
} from 'lucide-react';

interface Feature {
  id: string;
  name: string;
  nameTh: string;
  description?: string;
  isStandard: boolean;
}

interface Category {
  id: string;
  name: string;
  nameTh: string;
  icon: string;
  features: Feature[];
}

interface FeatureState {
  checked: boolean;
  value?: string;
  note?: string;
}

const iconMap: Record<string, any> = {
  Shield, Radio, Sofa, Car, Layout, Cpu, Zap, Battery,
};

interface Props {
  variantSlug: string;
  onSave?: () => void;
  pilotMode?: boolean; // แสดงเฉพาะ Safety สำหรับ Pilot
}

export function FeatureCheckboxList({ variantSlug, onSave, pilotMode = true }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [features, setFeatures] = useState<Record<string, FeatureState>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [newFeature, setNewFeature] = useState<{ categoryId: string; name: string; nameTh: string } | null>(null);

  // Load categories and existing features
  useEffect(() => {
    async function loadData() {
      try {
        // Load all categories with features
        const catRes = await fetch('/api/nev/features');
        const catData = await catRes.json();
        
        // Pilot mode: แสดงเฉพาะ Safety
        let cats = catData.categories || [];
        if (pilotMode) {
          cats = cats.filter((c: Category) => c.name === 'safety');
        }
        setCategories(cats);
        
        // Open all categories by default
        setOpenCategories(new Set(catData.categories?.map((c: Category) => c.id) || []));

        // Load variant's existing features
        const varRes = await fetch(`/api/nev/variants/${variantSlug}/features`);
        const varData = await varRes.json();
        
        // Initialize feature states
        const initialFeatures: Record<string, FeatureState> = {};
        for (const featureId of varData.featureIds || []) {
          const featureData = varData.features[featureId] || {};
          initialFeatures[featureId] = {
            checked: true,
            value: featureData.value || '',
            note: featureData.note || '',
          };
        }
        setFeatures(initialFeatures);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [variantSlug, pilotMode]);

  const toggleFeature = (featureId: string) => {
    setFeatures(prev => ({
      ...prev,
      [featureId]: {
        ...prev[featureId],
        checked: !prev[featureId]?.checked,
      },
    }));
  };

  const updateFeatureValue = (featureId: string, field: 'value' | 'note', val: string) => {
    setFeatures(prev => ({
      ...prev,
      [featureId]: {
        ...prev[featureId],
        [field]: val,
      },
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/nev/variants/${variantSlug}/features`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features }),
      });
      
      if (res.ok) {
        onSave?.();
      }
    } catch (error) {
      console.error('Error saving features:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddFeature = async () => {
    if (!newFeature?.categoryId || !newFeature?.name || !newFeature?.nameTh) return;

    try {
      const res = await fetch('/api/nev/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFeature),
      });

      if (res.ok) {
        const data = await res.json();
        // Add to categories
        setCategories(prev => prev.map(cat => {
          if (cat.id === newFeature.categoryId) {
            return {
              ...cat,
              features: [...cat.features, data.feature],
            };
          }
          return cat;
        }));
        setNewFeature(null);
      }
    } catch (error) {
      console.error('Error adding feature:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const checkedCount = Object.values(features).filter(f => f.checked).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">ฟีเจอร์รถยนต์</h3>
          <p className="text-sm text-muted-foreground">
            เลือก {checkedCount} รายการ จาก {categories.reduce((acc, c) => acc + c.features.length, 0)} รายการ
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          บันทึก
        </Button>
      </div>

      {categories.map(category => {
        const Icon = iconMap[category.icon] || Shield;
        const isOpen = openCategories.has(category.id);
        const categoryCheckedCount = category.features.filter(f => features[f.id]?.checked).length;

        return (
          <Card key={category.id}>
            <Collapsible open={isOpen} onOpenChange={() => toggleCategory(category.id)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      {category.nameTh}
                      <span className="text-sm font-normal text-muted-foreground">
                        ({categoryCheckedCount}/{category.features.length})
                      </span>
                    </div>
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {category.features.map(feature => (
                      <div
                        key={feature.id}
                        className={`flex items-start gap-2 p-2 rounded-lg border transition-colors ${
                          features[feature.id]?.checked 
                            ? 'bg-primary/10 border-primary/30' 
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <Checkbox
                          id={feature.id}
                          checked={features[feature.id]?.checked || false}
                          onCheckedChange={() => toggleFeature(feature.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <Label
                            htmlFor={feature.id}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {feature.nameTh}
                          </Label>
                          {feature.name !== feature.nameTh && (
                            <p className="text-xs text-muted-foreground truncate">
                              {feature.name}
                            </p>
                          )}
                          {features[feature.id]?.checked && (
                            <Input
                              placeholder="รายละเอียด (optional)"
                              value={features[feature.id]?.value || ''}
                              onChange={(e) => updateFeatureValue(feature.id, 'value', e.target.value)}
                              className="mt-1 h-7 text-xs"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add new feature button */}
                  {newFeature?.categoryId === category.id ? (
                    <div className="mt-3 p-3 border rounded-lg bg-muted/30 space-y-2">
                      <Input
                        placeholder="ชื่อ (EN)"
                        value={newFeature.name}
                        onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                      />
                      <Input
                        placeholder="ชื่อ (TH)"
                        value={newFeature.nameTh}
                        onChange={(e) => setNewFeature({ ...newFeature, nameTh: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleAddFeature}>เพิ่ม</Button>
                        <Button size="sm" variant="outline" onClick={() => setNewFeature(null)}>ยกเลิก</Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3"
                      onClick={() => setNewFeature({ categoryId: category.id, name: '', nameTh: '' })}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      เพิ่มฟีเจอร์ใหม่
                    </Button>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}
