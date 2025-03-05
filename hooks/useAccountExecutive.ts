import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getAccountExecutives, getAccountExecutiveByEmail, AccountExecutive } from "@/services/account-executives";

export function useAccountExecutive() {
  const { data: session } = useSession();
  const [accountExec, setAccountExec] = useState<string | null>(null);
  const [accountExecutives, setAccountExecutives] = useState<AccountExecutive[]>([]);

  // Fetch all account executives
  useEffect(() => {
    async function fetchAccountExecutives() {
      const data = await getAccountExecutives();
      setAccountExecutives(data);
    }
    
    fetchAccountExecutives();
  }, []);

  // Match the user to an account executive
  useEffect(() => {
    async function matchAccountExecutive() {
      if (!session?.user || accountExecutives.length === 0) return;
      
      // Special case for Alex Lewkowict
      if (session.user.name?.toLowerCase().includes('alex lewkowict') || 
          session.user.email?.toLowerCase().includes('alex') || 
          session.user.email?.toLowerCase().includes('lewkowict')) {
        
        const alexLewkowict = accountExecutives.find(ae => 
          ae.full_name.toLowerCase() === 'alex lewkowict'
        );
        
        if (alexLewkowict) {
          console.log("Found direct match for Alex Lewkowict");
          setAccountExec(alexLewkowict.full_name);
          return;
        }
      }
      
      // Try to match by email format (first.last@shiphero.com)
      if (session.user.email?.endsWith('@shiphero.com')) {
        const matchedByEmail = await getAccountExecutiveByEmail(session.user.email);
        if (matchedByEmail) {
          setAccountExec(matchedByEmail.full_name);
          return;
        }
      }
      
      // If email matching fails, try to match by name
      if (session.user.name) {
        const matchByName = accountExecutives.find(
          ae => ae.full_name.toLowerCase() === session.user.name?.toLowerCase()
        );
        
        if (matchByName) {
          setAccountExec(matchByName.full_name);
          return;
        }
        
        // Try to match by first name
        const firstName = session.user.name.split(' ')[0];
        const matchByFirstName = accountExecutives.find(
          ae => ae.full_name.toLowerCase().includes(firstName.toLowerCase())
        );
        
        if (matchByFirstName) {
          setAccountExec(matchByFirstName.full_name);
        }
      }
    }
    
    matchAccountExecutive();
  }, [session, accountExecutives]);

  return accountExec;
} 