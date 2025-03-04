import React from "react"
import Image from "next/image"
import Link from "next/link"
import { FileText, ExternalLink, Settings } from "lucide-react"

export function ProposalHeader() {
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