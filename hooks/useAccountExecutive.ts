import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ACCOUNT_EXECUTIVES } from "@/data/account-executives";

export function useAccountExecutive() {
  const { data: session } = useSession();
  const [accountExec, setAccountExec] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.name) {
      // Try to find a matching account executive by name
      const matchedAE = ACCOUNT_EXECUTIVES.find(ae => 
        ae.name.toLowerCase() === session.user?.name?.toLowerCase()
      );
      
      // If found, set the account executive
      if (matchedAE) {
        setAccountExec(matchedAE.name);
      } else {
        // Try to match by first name
        const firstName = session.user.name.split(' ')[0];
        const matchedByFirstName = ACCOUNT_EXECUTIVES.find(ae => 
          ae.name.toLowerCase().startsWith(firstName.toLowerCase())
        );
        
        if (matchedByFirstName) {
          setAccountExec(matchedByFirstName.name);
        }
      }
    }
  }, [session]);

  return accountExec;
} 