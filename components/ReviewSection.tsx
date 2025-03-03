import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ReviewSectionProps {
  formData: any
}

export function ReviewSection({ formData }: ReviewSectionProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
  }

  // Calculate integration costs
  const calculateIntegrationCosts = () => {
    let setupCost = 0;
    let annualCost = 0;
    
    // SPS Commerce
    if (formData.spsIntegration.enabled) {
      // Setup costs
      setupCost += formData.spsIntegration.setupFee;
      setupCost += formData.spsIntegration.retailerSetupFee * formData.spsIntegration.retailerCount;
      
      // Annual support costs
      let spsAnnualCost = 0;
      const sortedTiers = [...formData.spsIntegration.supportTiers].sort((a, b) => a.fromQty - b.fromQty);
      
      for (let retailerNum = 1; retailerNum <= formData.spsIntegration.retailerCount; retailerNum++) {
        const tier = sortedTiers.find(t => retailerNum >= t.fromQty && retailerNum <= t.toQty);
        if (tier) {
          spsAnnualCost += tier.pricePerRetailer * 4; // Quarterly * 4
        }
      }
      
      annualCost += spsAnnualCost;
    }
    
    // Crstl
    if (formData.crstlIntegration.enabled) {
      // Setup costs
      setupCost += formData.crstlIntegration.setupFee;
      
      // Annual support costs
      annualCost += formData.crstlIntegration.supportFee * 4 * formData.crstlIntegration.retailerCount;
    }
    
    return { setupCost, annualCost };
  };

  const integrationCosts = calculateIntegrationCosts();

  const calculateSpsRetailerSupportCost = () => {
    if (!formData.spsIntegration.enabled || formData.spsIntegration.retailerCount <= 0) {
      return 0;
    }
    
    let totalCost = 0;
    const sortedTiers = [...formData.spsIntegration.supportTiers].sort((a, b) => a.fromQty - b.fromQty);
    
    for (let retailerNum = 1; retailerNum <= formData.spsIntegration.retailerCount; retailerNum++) {
      const tier = sortedTiers.find(t => retailerNum >= t.fromQty && retailerNum <= t.toQty);
      if (tier) {
        totalCost += tier.pricePerRetailer;
      }
    }
    
    return totalCost * 4; // Annual cost
  };

  const calculateCrstlSupportCost = () => {
    if (!formData.crstlIntegration.enabled || formData.crstlIntegration.retailerCount <= 0) {
      return 0;
    }
    
    return formData.crstlIntegration.supportFee * 4 * formData.crstlIntegration.retailerCount;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Account Executive:</strong> {formData.accountExec}
          </p>
          <p>
            <strong>Opportunity Name:</strong> {formData.opportunityName}
          </p>
          <p>
            <strong>Friendly Business Name:</strong> {formData.friendlyBusinessName}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Contract Term:</strong> {formData.contractTerm} months
          </p>
          <p>
            <strong>Billing Frequency:</strong> {formData.billingFrequency.charAt(0).toUpperCase() + formData.billingFrequency.slice(1)}
          </p>
          <p>
            <strong>Payment Method:</strong> {formData.paymentMethods?.map((method, index) => {
              let displayMethod = "";
              if (method === "ach") displayMethod = "ACH";
              if (method === "creditCard") displayMethod = "Credit Card";
              if (method === "check") displayMethod = "Check";
              
              return index === 0 
                ? displayMethod 
                : ` or ${displayMethod}`;
            })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SaaS Fee & Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Frequency:</strong> {formData.saasFee.frequency}
          </p>
          <p>
            <strong>Pallets:</strong> {formData.saasFee.pallets.value}
          </p>
          <p>
            <strong>Cases:</strong> {formData.saasFee.cases.value}
          </p>
          <p>
            <strong>Eaches:</strong> {formData.saasFee.eaches.value}
          </p>
          <p>
            <strong>SaaS Fee Discount:</strong> {formData.saasFeeDiscount}%
          </p>
          <p>
            <strong>Store Connections:</strong> {formData.storeConnections}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proposal Options</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.entries(formData.selectedOptions).map(([key, value]) => (
            <p key={key}>
              <strong>{key}:</strong> {value ? "Yes" : "No"}
            </p>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Implementation</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Package:</strong> {formData.implementationPackage}
          </p>
          <p>
            <strong>Onboarding Fee:</strong> {formatCurrency(Number(formData.onboardingFee))}
          </p>
          <p>
            <strong>Virtual Training Sessions:</strong> {formData.virtualTrainingHours} (30-60 min each)
          </p>
          <p>
            <strong>Onsite Support Days:</strong> {formData.onsiteSupportDays}
          </p>
          <p>
            <strong>Onsite Support Fee:</strong> {formatCurrency(Number(formData.onsiteSupportFee))}
          </p>
          <p>
            <strong>Optional Prof. Services Rate:</strong> {formatCurrency(Number(formData.optionalProfServicesRate))}
            /hour
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          {formData.spsIntegration.enabled && (
            <div>
              <h4 className="font-medium">SPS Commerce</h4>
              <div className="grid grid-cols-2 gap-2 ml-4">
                <span>Setup Fee:</span>
                <span>${formatCurrency(formData.spsIntegration.setupFee)}</span>
                
                <span>Retailer Setup Fee:</span>
                <span>${formatCurrency(formData.spsIntegration.retailerSetupFee)} × {formData.spsIntegration.retailerCount} retailers</span>
                
                <span>Annual Support Cost:</span>
                <span>${formatCurrency(calculateSpsRetailerSupportCost())}</span>
              </div>
            </div>
          )}
          
          {formData.crstlIntegration.enabled && (
            <div className="mt-2">
              <h4 className="font-medium">Crstl</h4>
              <div className="grid grid-cols-2 gap-2 ml-4">
                <span>Setup Fee:</span>
                <span>${formatCurrency(formData.crstlIntegration.setupFee)}</span>
                
                <span>Annual Support Cost:</span>
                <span>${formatCurrency(calculateCrstlSupportCost())}</span>
              </div>
            </div>
          )}
          
          {(formData.spsIntegration.enabled || formData.crstlIntegration.enabled) && (
            <div className="font-medium mt-2">
              <div className="grid grid-cols-2 gap-2">
                <span>Total Integration Setup Cost:</span>
                <span>${formatCurrency(integrationCosts.setupCost)}</span>
                
                <span>Total Annual Integration Cost:</span>
                <span>${formatCurrency(integrationCosts.annualCost)}</span>
              </div>
            </div>
          )}
          
          {!formData.spsIntegration.enabled && !formData.crstlIntegration.enabled && (
            <p>No integrations selected</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

