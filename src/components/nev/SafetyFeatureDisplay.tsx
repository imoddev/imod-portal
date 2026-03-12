'use client';

import { useState, useEffect } from 'react';
import { Shield, Check, Loader2 } from 'lucide-react';

interface Feature {
  id: string;
  name: string;
  nameTh: string;
  value?: string;
  note?: string;
}

interface Props {
  variantId: string;
  className?: string;
}

export function SafetyFeatureDisplay({ variantId, className = '' }: Props) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatures() {
      try {
        // Get variant's features
        const res = await fetch(`/api/nev/variants/${variantId}/features`);
        const data = await res.json();
        
        // Get all features to get nameTh
        const allRes = await fetch('/api/nev/features');
        const allData = await allRes.json();
        
        // Find safety category
        const safetyCategory = allData.categories?.find(
          (c: any) => c.name === 'safety'
        );
        
        if (!safetyCategory) {
          setFeatures([]);
          return;
        }

        // Map variant features with feature details
        const variantFeatureIds = data.featureIds || [];
        const variantFeatureData = data.features || {};
        
        const safetyFeatures = safetyCategory.features
          .filter((f: any) => variantFeatureIds.includes(f.id))
          .map((f: any) => ({
            ...f,
            value: variantFeatureData[f.id]?.value,
            note: variantFeatureData[f.id]?.note,
          }));

        setFeatures(safetyFeatures);
      } catch (error) {
        console.error('Error loading safety features:', error);
      } finally {
        setLoading(false);
      }
    }
    loadFeatures();
  }, [variantId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (features.length === 0) {
    return null;
  }

  return (
    <div className={`bg-slate-800/50 rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-5 w-5 text-emerald-400" />
        <h3 className="font-semibold text-white">ระบบความปลอดภัย</h3>
        <span className="text-xs text-slate-400">({features.length} รายการ)</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="flex items-start gap-2 text-sm"
          >
            <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-slate-200">{feature.nameTh}</span>
              {feature.value && (
                <span className="text-slate-400 ml-1">({feature.value})</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
