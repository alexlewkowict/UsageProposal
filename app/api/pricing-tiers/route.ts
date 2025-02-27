import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const pricingTiers = [
  {
    tier: "Starter",
    lower_limit: 0,
    upper_limit: 1000,
    platform_fee_list_price: 99,
    platform_fee_sales_price: 79,
    shipped_unit_list_price: 0.50,
    shipped_unit_sales_price: 0.45,
    shipped_unit_overage_rate: 0.55
  },
  {
    tier: "Growth",
    lower_limit: 1001,
    upper_limit: 10000,
    platform_fee_list_price: 199,
    platform_fee_sales_price: 159,
    shipped_unit_list_price: 0.45,
    shipped_unit_sales_price: 0.40,
    shipped_unit_overage_rate: 0.50
  },
  // Add more tiers as needed
]

export async function GET() {
  console.log("Returning dummy pricing tiers using hard-coded data.")
  const dummyPricingTiers = [
    {
      tier: "Tier 2",
      lower_limit: 500001,
      upper_limit: 1000000,
      platform_fee_list_price: 64750.00,
      platform_fee_sales_price: 42087.50,
      shipped_unit_list_price: 0.06,
      shipped_unit_sales_price: 0.039,
      shipped_unit_overage_rate: 0.09
    }
  ]
  return NextResponse.json(dummyPricingTiers)
}

