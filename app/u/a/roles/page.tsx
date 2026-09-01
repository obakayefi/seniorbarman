"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldUser, Save, Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

const MOCK_ROLES = [
  { id: "dev", name: "Developer" },
  { id: "admin", name: "Admin" },
  { id: "organizer", name: "Organizer" },
  { id: "team_manager", name: "Team Manager" },
  { id: "bouncer", name: "Bouncer" },
  { id: "user", name: "User" },
]

const AVAILABLE_PERMISSIONS = [
  { id: "manage_users", label: "Manage Users", description: "Can change roles and block users." },
  { id: "create_events", label: "Create Events", description: "Can create and publish new events." },
  { id: "manage_teams", label: "Manage Teams", description: "Can create and edit team profiles." },
  { id: "view_analytics", label: "View Analytics", description: "Can view financial and attendance reports." },
  { id: "scan_tickets", label: "Scan Tickets", description: "Can use the scanner app at the gate." },
  { id: "manage_staff", label: "Manage Staff", description: "Can add bouncers and other staff." },
  { id: "system_config", label: "System Configuration", description: "Can edit global system settings." },
]

const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  "dev": ["manage_users", "create_events", "manage_teams", "view_analytics", "scan_tickets", "manage_staff", "system_config"],
  "admin": ["manage_users", "create_events", "manage_teams", "view_analytics", "scan_tickets", "manage_staff"],
  "organizer": ["create_events", "view_analytics", "scan_tickets", "manage_staff"],
  "team_manager": ["view_analytics"],
  "bouncer": ["scan_tickets"],
  "user": []
}

const DynamicRolesPage = () => {
  const [selectedRole, setSelectedRole] = useState("admin")
  const [permissions, setPermissions] = useState<Record<string, string[]>>(DEFAULT_PERMISSIONS)
  const [isSaving, setIsSaving] = useState(false)

  const handleTogglePermission = (permId: string) => {
    setPermissions(prev => {
      const currentRolePerms = prev[selectedRole] || []
      const hasPerm = currentRolePerms.includes(permId)

      return {
        ...prev,
        [selectedRole]: hasPerm
          ? currentRolePerms.filter(p => p !== permId)
          : [...currentRolePerms, permId]
      }
    })
  }

  const handleSave = () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      toast.success(`${MOCK_ROLES.find(r => r.id === selectedRole)?.name} permissions updated!`)
    }, 800)
  }

  const currentPerms = permissions[selectedRole] || []

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen text-foreground">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
          <ShieldUser className="text-orange-500" /> Dynamic Role Permissions
        </h1>
        <p className="text-muted-foreground">Configure access levels and capabilities for each role in the system.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Roles Sidebar */}
        <Card className="lg:col-span-4 ">
          <CardHeader>
            <CardTitle className="text-foreground">System Roles</CardTitle>
            <CardDescription className="text-muted-foreground">Select a role to configure its permissions.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col">
              {MOCK_ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-4 text-left border-l-4 transition-all duration-200 ${selectedRole === role.id
                      ? "border-orange-500 bg-orange-500/10 text-foreground font-bold"
                      : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="capitalize">{role.name}</span>
                    {selectedRole === role.id && <Check className="w-4 h-4 text-orange-500" />}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Permissions Configuration */}
        <Card className="lg:col-span-8 ">
          <CardHeader className="flex flex-row items-start justify-between -b pb-4">
            <div>
              <CardTitle className="text-foreground text-xl capitalize">{MOCK_ROLES.find(r => r.id === selectedRole)?.name} Permissions</CardTitle>
              <CardDescription className="text-muted-foreground mt-1">Enable or disable specific actions for this role.</CardDescription>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-orange-500 hover:bg-orange-600 text-foreground gap-2"
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <><Save className="w-4 h-4" /> Save Changes</>
              )}
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {AVAILABLE_PERMISSIONS.map((perm) => {
                const isChecked = currentPerms.includes(perm.id)
                return (
                  <div
                    key={perm.id}
                    className="flex items-start space-x-4 p-4 rounded-sm bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={perm.id}
                      checked={isChecked}
                      onCheckedChange={() => handleTogglePermission(perm.id)}
                      className="mt-1 border-border data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    />
                    <div className="flex-1 space-y-1">
                      <label
                        htmlFor={perm.id}
                        className="text-base font-medium text-foreground cursor-pointer"
                      >
                        {perm.label}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {perm.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-sm">
              <p className="text-sm text-blue-400">
                <strong>Note:</strong> This is currently a dummy UI for conceptualizing dynamic roles. Changes made here are only stored in memory and do not affect the live system policies.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DynamicRolesPage
