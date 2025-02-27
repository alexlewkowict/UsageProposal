import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ReviewSectionProps {
  formData: any
}

export function ReviewSection({ formData }: ReviewSectionProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
  }

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
    </div>
  )
}

