"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash } from "lucide-react"

interface StoreConnectionTier {
  id: string;
  name: string;
  fromQty: number;
  toQty: number;
  pricePerStore: number;
}

interface StoreConnectionTiersEditorProps {
  tiers: StoreConnectionTier[];
  onChange: (tiers: StoreConnectionTier[]) => void;
}

export function StoreConnectionTiersEditor({ tiers, onChange }: StoreConnectionTiersEditorProps) {
  const [localTiers, setLocalTiers] = useState<StoreConnectionTier[]>(tiers);

  const handleTierChange = (id: string, field: keyof StoreConnectionTier, value: any) => {
    const updatedTiers = localTiers.map(tier => {
      if (tier.id === id) {
        return { ...tier, [field]: value };
      }
      return tier;
    });
    
    // Sort tiers by fromQty
    const sortedTiers = updatedTiers.sort((a, b) => a.fromQty - b.fromQty);
    
    // Update local state
    setLocalTiers(sortedTiers);
    
    // Notify parent
    onChange(sortedTiers);
  };

  function generateId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  const addTier = () => {
    // Find the highest toQty to set as the new fromQty
    const highestToQty = Math.max(...localTiers.map(t => t.toQty), 0);
    
    const newTier: StoreConnectionTier = {
      id: generateId(),
      name: `Tier ${localTiers.length + 1}`,
      fromQty: highestToQty + 1,
      toQty: highestToQty + 100,
      pricePerStore: 30,
    };
    
    const updatedTiers = [...localTiers, newTier].sort((a, b) => a.fromQty - b.fromQty);
    setLocalTiers(updatedTiers);
    onChange(updatedTiers);
  };

  const removeTier = (id: string) => {
    const updatedTiers = localTiers.filter(tier => tier.id !== id);
    setLocalTiers(updatedTiers);
    onChange(updatedTiers);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-2 font-medium text-sm">
        <div className="col-span-3">Tier Name</div>
        <div className="col-span-3">From Qty</div>
        <div className="col-span-3">To Qty</div>
        <div className="col-span-2">Price/Store</div>
        <div className="col-span-1"></div>
      </div>
      
      {localTiers.map((tier, index) => (
        <div key={tier.id} className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-3">
            <Input
              value={tier.name}
              onChange={(e) => handleTierChange(tier.id, "name", e.target.value)}
              placeholder="Tier name"
            />
          </div>
          <div className="col-span-3">
            <Input
              type="number"
              value={tier.fromQty}
              onChange={(e) => handleTierChange(tier.id, "fromQty", Number(e.target.value))}
              min={0}
            />
          </div>
          <div className="col-span-3">
            <Input
              type="number"
              value={tier.toQty === Number.MAX_SAFE_INTEGER ? "" : tier.toQty}
              onChange={(e) => {
                const value = e.target.value === "" ? Number.MAX_SAFE_INTEGER : Number(e.target.value);
                handleTierChange(tier.id, "toQty", value);
              }}
              min={tier.fromQty}
              placeholder="∞"
            />
          </div>
          <div className="col-span-2 relative">
            <Input
              type="number"
              value={tier.pricePerStore}
              onChange={(e) => handleTierChange(tier.id, "pricePerStore", Number(e.target.value))}
              min={0}
              step={0.01}
              className="pl-6"
            />
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2">$</span>
          </div>
          <div className="col-span-1">
            {localTiers.length > 1 && (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => removeTier(tier.id)}
              >
                <Trash className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        </div>
      ))}
      
      <Button type="button" variant="outline" onClick={addTier} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Tier
      </Button>
    </div>
  );
} 