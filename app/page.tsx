import ProposalForm from "@/components/ProposalForm"
import { AccountExecDebug } from "@/components/AccountExecDebug"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col w-full px-40 py-2 bg-gray-100">
      <ProposalForm />
      <AccountExecDebug />
    </main>
  )
}

