"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Settings, FileText, Database, Users } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Variable Mapping
            </CardTitle>
            <CardDescription>
              Configure variables used in proposal templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Map variables from your codebase to template placeholders for use in webhooks and document generation.
            </p>
            <Link href="/admin/variable-mapping">
              <Button>Manage Variables</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Configure application settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Manage general application settings and configurations.
            </p>
            <Button variant="outline">Manage Settings</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Manage application data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Import, export, and manage application data.
            </p>
            <Button variant="outline">Manage Data</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 