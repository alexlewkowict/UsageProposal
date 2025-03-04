"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export default function SignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Redirect to home if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative h-20 w-20 bg-gradient-to-br from-blue-600 to-green-400 rounded-lg shadow-sm overflow-hidden flex items-center justify-center">
            <Image 
              src="/favicon.ico" 
              alt="ProposalHero Logo" 
              width={48}
              height={48}
              className="object-contain z-10"
              priority
            />
            <div className="absolute inset-0 bg-white opacity-20 mix-blend-overlay"></div>
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
            ProposalHero
          </h1>
          
          <p className="text-gray-600 text-center max-w-sm">
            Sign in to create and manage professional proposals for ShipHero customers
          </p>
        </div>
        
        <div className="pt-6">
          <Button 
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 py-6"
            disabled={status === "loading"}
          >
            <Image 
              src="/google-logo.svg" 
              alt="Google" 
              width={20} 
              height={20} 
            />
            <span>{status === "loading" ? "Loading..." : "Sign in with Google"}</span>
          </Button>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Authorized ShipHero personnel only</p>
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-gray-400">
        <p>© {new Date().getFullYear()} ShipHero. All rights reserved.</p>
      </div>
    </div>
  );
} 