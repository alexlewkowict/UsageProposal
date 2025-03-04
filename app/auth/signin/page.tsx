"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function SignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState("");
  
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
    
    // Check for error in URL
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get("error");
    if (errorParam) {
      setError(`Authentication error: ${errorParam}`);
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
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
            Sign in to create and manage proposals and agreements
          </p>
        </div>
        
        <div className="pt-6">
          <a 
            href="/api/auth/signin/google?callbackUrl=/"
            className="w-full flex items-center justify-center gap-3 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google" 
              className="w-5 h-5"
            />
            <span>{status === "loading" ? "Loading..." : "Sign in with Google"}</span>
          </a>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Authorized ShipHero personnel only</p>
        </div>
        
        <div className="mt-4 text-center text-xs text-gray-400">
          <p>Status: {status}</p>
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-gray-400">
        <p>© {new Date().getFullYear()} ShipHero. All rights reserved.</p>
      </div>
    </div>
  );
} 