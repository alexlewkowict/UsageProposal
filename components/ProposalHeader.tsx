"use client";

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { FileText, Settings, LogIn, LogOut, User, LayoutDashboard, CheckCircle, UserPlus, Sun, Moon } from "lucide-react"
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
import { usePathname } from "next/navigation"

export function ProposalHeader() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sample notifications data
  const notifications = [
    {
      id: 1,
      type: "proposal_created",
      title: "New proposal created",
      message: "Your proposal \"Q1 Marketing Strategy\" has been successfully created.",
      time: "5 minutes ago",
      icon: <FileText className="h-5 w-5 text-blue-500" />
    },
    {
      id: 2,
      type: "proposal_approved",
      title: "Proposal approved",
      message: "\"Website Redesign Project\" has been approved by the client.",
      time: "2 hours ago",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />
    },
    {
      id: 3,
      type: "team_member",
      title: "New team member",
      message: "Sarah Johnson has joined your team.",
      time: "Yesterday",
      icon: <UserPlus className="h-5 w-5 text-gray-500" />
    }
  ];

  // Toggle dark mode and save preference to localStorage
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode ? 'true' : 'false');
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    // Check localStorage first
    const savedMode = localStorage.getItem('darkMode');
    
    if (savedMode !== null) {
      const darkModeOn = savedMode === 'true';
      setIsDarkMode(darkModeOn);
      
      if (darkModeOn) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // If no saved preference, check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  return (
    <div className="w-full mb-6">
      {/* Main header with shadow and subtle background */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md px-3 py-2 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          {/* Logo and brand section */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-4">
              <div className="relative h-12 w-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden flex items-center justify-center border border-gray-100 dark:border-gray-700">
                <Image 
                  src="/favicon.ico" 
                  alt="ProposalHero Logo" 
                  width={32}
                  height={32}
                  className="object-contain z-10"
                  priority
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    ProposalHero
                  </h1>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full font-medium">
                    BETA
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Streamlined proposal generation
                </p>
              </div>
            </Link>
          </div>
          
          {/* Navigation links */}
          <div className="flex items-center gap-6">
            {/* Main navigation tabs */}
            <nav className="hidden md:flex items-center gap-4">
              <Link 
                href="/dashboard"
                className={`
                  flex flex-col items-center justify-center space-y-2 p-2 rounded-lg transition-colors
                  ${pathname === "/dashboard" 
                    ? "bg-white dark:bg-white text-primary dark:text-primary" 
                    : "text-gray-400 dark:text-gray-300 hover:text-primary dark:hover:text-white"}
                `}
              >
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${pathname === "/dashboard" 
                    ? "bg-primary/10 dark:bg-primary/20" 
                    : "bg-gray-100 dark:bg-gray-700"}
                `}>
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium">Dashboard</span>
              </Link>
              
              <Link 
                href="/proposals"
                className={`
                  flex flex-col items-center justify-center space-y-2 p-2 rounded-lg transition-colors
                  ${pathname === "/proposals" 
                    ? "bg-white dark:bg-white text-primary dark:text-primary" 
                    : "text-gray-400 dark:text-gray-300 hover:text-primary dark:hover:text-white"}
                `}
              >
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${pathname === "/proposals" 
                    ? "bg-primary/10 dark:bg-primary/20" 
                    : "bg-gray-100 dark:bg-gray-700"}
                `}>
                  <FileText className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium">My Proposals</span>
              </Link>
              
              <Link 
                href="/create"
                className={`
                  flex flex-col items-center justify-center space-y-2 p-2 rounded-lg transition-colors
                  ${pathname === "/create" 
                    ? "bg-white dark:bg-white text-primary dark:text-primary" 
                    : "text-gray-400 dark:text-gray-300 hover:text-primary dark:hover:text-white"}
                `}
              >
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${pathname === "/create" 
                    ? "bg-primary/10 dark:bg-primary/20" 
                    : "bg-gray-100 dark:bg-gray-700"}
                `}>
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <span className="text-xs font-medium">Create</span>
              </Link>
            </nav>
            
            {/* Notification bell */}
            <div className="relative">
              <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">3</span>
                </div>
                <DropdownMenuContent align="end" className="w-80 p-0 bg-white dark:bg-gray-900 border dark:border-gray-700">
                  <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h3 className="font-semibold text-lg dark:text-white">Notifications</h3>
                    <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                      Mark all as read
                    </button>
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className="p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer flex gap-3"
                      >
                        <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                          {notification.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{notification.title}</h4>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">{notification.message}</p>
                          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{notification.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 text-center border-t dark:border-gray-700">
                    <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                      View all notifications
                    </button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Theme toggle */}
            <button 
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={toggleDarkMode}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            
            {!session && (
              <Button 
                onClick={() => signIn("google")}
                className="flex items-center gap-2 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600"
                disabled={isLoading}
              >
                <LogIn size={16} />
                <span>{isLoading ? "Loading..." : "Sign in with Google"}</span>
              </Button>
            )}
            
            {session && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 rounded-full p-1 h-auto">
                    {session.user?.image ? (
                      <div className="relative">
                        <Image 
                          src={session.user.image} 
                          alt={session.user.name || "User"} 
                          width={40} 
                          height={40} 
                          className="rounded-full border border-gray-200 dark:border-gray-700"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-red-200 dark:bg-red-900 flex items-center justify-center text-red-800 dark:text-red-200 font-bold">
                        AL
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-white dark:bg-gray-900 border dark:border-gray-700">
                  <DropdownMenuLabel className="dark:text-white">
                    <div className="flex flex-col">
                      <span className="font-medium">{session.user?.name || "Alex Lewkowict"}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user?.email || "alex@example.com"}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="dark:border-gray-700" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/variable-mapping">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Variable Mapping</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="dark:border-gray-700" />
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
    </div>
  )
}

export default ProposalHeader; 