"use client"
import React, { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search, Users, ChevronLeft, ChevronRight, Trophy } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/axios"
import { hasSecureOchEnv } from "@/app/actions/getSecureEnv"

// Inline component that handles the team_manager team-selection flow per row
function RoleCell({ user, onRoleUpdated, canEscalateDev }: { user: any; onRoleUpdated: (id: string, role: string) => void; canEscalateDev: boolean }) {
  const [pendingRole, setPendingRole] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string>("")
  const [teams, setTeams] = useState<any[]>([])
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleRoleSelect = async (newRole: string) => {
    if (newRole === "team_manager") {
      setPendingRole("team_manager")
      // Fetch teams to show the dropdown
      setLoadingTeams(true)
      try {
        const res = await api.get('/teams')
        setTeams(res.data.teams || [])
      } catch {
        toast.error("Failed to load teams")
      } finally {
        setLoadingTeams(false)
      }
    } else {
      // All other roles: save immediately
      setSaving(true)
      try {
        const res = await api.patch(`/admin/users/${user._id}/role`, { role: newRole })
        if (res.data.success) {
          toast.success("Role updated successfully")
          onRoleUpdated(user._id, newRole)
        }
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Failed to update role")
      } finally {
        setSaving(false)
      }
    }
  }

  const handleSaveTeamManager = async () => {
    if (!selectedTeam) {
      toast.error("Please select a team before saving")
      return
    }
    setSaving(true)
    try {
      const res = await api.patch(`/admin/users/${user._id}/role`, { role: "team_manager", teamId: selectedTeam })
      if (res.data.success) {
        toast.success("Role updated — user assigned as Team Manager")
        onRoleUpdated(user._id, "team_manager")
        setPendingRole(null)
        setSelectedTeam("")
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update role")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setPendingRole(null)
    setSelectedTeam("")
  }

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'dev': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'admin': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'bouncer': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'organizer': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'team_manager': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      default: return 'bg-zinc-500/10 text-muted-foreground border-zinc-500/20'
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-3">
        <Badge variant="outline" className={`${getRoleBadgeStyle(user.role)} capitalize font-bold`}>
          {user.role.replace('_', ' ')}
        </Badge>
        <Select
          disabled={saving}
          onValueChange={handleRoleSelect}
          defaultValue={user.role}
        >
          <SelectTrigger className="w-36 bg-card border-border text-xs h-8 text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border text-foreground">
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="team_manager">Team Manager</SelectItem>
            <SelectItem value="organizer">Organizer</SelectItem>
            <SelectItem value="bouncer">Bouncer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            {canEscalateDev && <SelectItem value="dev">Developer</SelectItem>}
          </SelectContent>
        </Select>
        {saving && <Loader2 className="w-4 h-4 animate-spin text-orange-500" />}
      </div>

      {/* Team assignment panel — slides in when team_manager is selected */}
      {pendingRole === "team_manager" && (
        <div className="flex flex-col gap-2 w-full max-w-xs bg-emerald-500/5 border border-emerald-500/20 rounded-sm p-3 animate-in slide-in-from-top-2 duration-200">
          <p className="text-emerald-400 text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Trophy size={11} /> Assign to Team (required)
          </p>
          {loadingTeams ? (
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Loader2 className="w-3 h-3 animate-spin" /> Loading teams...
            </div>
          ) : (
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="bg-card border-border text-xs h-8 text-foreground w-full">
                <SelectValue placeholder="Select a team..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                {teams.map(t => (
                  <SelectItem key={t._id} value={t._id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <div className="flex gap-2 mt-1">
            <Button
              size="sm"
              onClick={handleSaveTeamManager}
              disabled={saving || !selectedTeam}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-foreground text-xs h-7"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              className="text-muted-foreground hover:text-foreground text-xs h-7"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

const Accounts = () => {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [canEscalateDev, setCanEscalateDev] = useState(false)

  // Pagination state
  const [page, setPage] = useState(1)
  const [paginationData, setPaginationData] = useState<any>(null)
  const limit = 10

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get(`/admin/users/all?page=${page}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}`)
      setUsers(res.data.users || [])
      setPaginationData(res.data.pagination)
    } catch {
      toast.error("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => { hasSecureOchEnv().then(setCanEscalateDev) }, [])
  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleRoleUpdated = (userId: string, newRole: string) => {
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u))
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen text-foreground">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
          <Users className="text-orange-500" /> User Management
        </h1>
        <p className="text-muted-foreground">View and manage administrative roles and user accounts</p>
      </header>

      <Card className="">
        <CardHeader className="-b pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search users by name or email..."
              className="bg-muted border-border pl-10 h-11 text-foreground focus:border-orange-500 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 flex flex-col">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <p className="font-medium animate-pulse">Fetching user database...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">User</TableHead>
                    <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Email</TableHead>
                    <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Joined</TableHead>
                    <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest text-right">Administrative Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">
                        No users found matching your search
                      </TableCell>
                    </TableRow>
                  ) : users.map((user) => (
                    <TableRow key={user._id} className="border-border hover:bg-muted/30 transition-colors align-top">
                      <TableCell className="font-bold text-foreground pt-4">{user.firstName} {user.lastName}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs pt-4">{user.email}</TableCell>
                      <TableCell className="text-muted-foreground text-xs pt-4">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right pt-3 pb-3">
                        <RoleCell
                          user={user}
                          onRoleUpdated={handleRoleUpdated}
                          canEscalateDev={canEscalateDev}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {paginationData && paginationData.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
                  <p className="text-xs text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{(page - 1) * limit + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * limit, paginationData.total)}</span> of <span className="font-medium text-foreground">{paginationData.total}</span> users
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={!paginationData.hasPrevPage}
                      className="p-2 rounded-sm border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center px-3 text-sm text-muted-foreground">
                      Page {page} of {paginationData.totalPages}
                    </div>
                    <button
                      onClick={() => setPage(p => Math.min(paginationData.totalPages, p + 1))}
                      disabled={!paginationData.hasNextPage}
                      className="p-2 rounded-sm border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Accounts