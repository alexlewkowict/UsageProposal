"use client";

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { FileText, ExternalLink, Settings, LogIn, LogOut, User } from "lucide-react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ProposalHeader() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  return (
    <div className="w-full max-w-7xl mb-10">
      {/* Main header with shadow and subtle background */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <div className="flex items-center justify-between">
          {/* Logo and brand section */}
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 bg-gradient-to-br from-blue-600 to-green-400 rounded-lg shadow-sm overflow-hidden flex items-center justify-center">
              <Image 
                src="/favicon.ico" 
                alt="ProposalHero Logo" 
                width={32}
                height={32}
                className="object-contain z-10"
                priority
              />
              <div className="absolute inset-0 bg-white opacity-20 mix-blend-overlay"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                  ProposalHero
                </h1>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">
                  Beta
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Streamlined proposal generation for ShipHero
              </p>
            </div>
          </div>
          
          {/* Navigation links */}
          <div className="flex items-center gap-3">
            <Link 
              href="/admin/variable-mapping"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Settings size={16} />
              <span>Variable Mapping</span>
            </Link>
            
            <div className="h-6 w-px bg-gray-200"></div>
            
            <Link 
              href="https://shiphero.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <ExternalLink size={16} />
              <span>ShipHero.com</span>
            </Link>
            
            <Link 
              href="/proposals"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors ml-2"
            >
              <FileText size={16} />
              <span>My Proposals</span>
            </Link>
            
            {!session && (
              <Button 
                onClick={() => signIn("google")}
                className="flex items-center gap-2 ml-4"
                disabled={isLoading}
              >
                <LogIn size={16} />
                <span>{isLoading ? "Loading..." : "Sign in with Google"}</span>
              </Button>
            )}
            
            {session && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-4 flex items-center gap-2">
                    {session.user?.image ? (
                      <Image 
                        src={session.user.image} 
                        alt={session.user.name || "User"} 
                        width={24} 
                        height={24} 
                        className="rounded-full"
                      />
                    ) : (
                      <User size={16} />
                    )}
                    <span className="max-w-[100px] truncate">
                      {session.user?.name || "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{session.user?.name}</span>
                      <span className="text-xs text-gray-500 truncate">{session.user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
      
      {/* Animated progress indicator */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-400 mt-2 rounded-full overflow-hidden relative">
        <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
      </div>
    </div>
  )
} 