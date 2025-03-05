import { supabase } from '@/lib/supabase-client';

export type AccountExecutive = {
  id: number;
  full_name: string;
  role: string;
  profile_picture_url?: string;
  // Derived properties
  initials?: string;
  color?: string;
};

// Generate initials from full name
function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Generate a consistent color based on name
function getColorForName(name: string): string {
  const colors = [
    "bg-blue-200", "bg-green-200", "bg-purple-200", "bg-red-200", 
    "bg-yellow-200", "bg-indigo-200", "bg-pink-200", "bg-teal-200"
  ];
  
  // Simple hash function to get consistent color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

// Enhance account executive data with derived properties
function enhanceAccountExecutive(ae: AccountExecutive): AccountExecutive {
  return {
    ...ae,
    initials: getInitials(ae.full_name),
    color: getColorForName(ae.full_name)
  };
}

export async function getAccountExecutives(): Promise<AccountExecutive[]> {
  try {
    const response = await fetch('/api/account-executives');
    if (!response.ok) {
      throw new Error('Failed to fetch account executives');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching account executives:', error);
    return [];
  }
}

export async function getAccountExecutiveByEmail(email: string): Promise<AccountExecutive | null> {
  try {
    const response = await fetch(`/api/account-executives/by-email?email=${encodeURIComponent(email)}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch account executive by email');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching account executive by email:', error);
    return null;
  }
} 