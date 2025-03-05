import ProposalForm from "@/components/ProposalForm"
import { AccountExecDebug } from "@/components/AccountExecDebug"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100">
      <ProposalForm />
      <AccountExecDebug />
    </main>
  )
}

