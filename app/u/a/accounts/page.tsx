"use client"
import React, { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/axios"
import { hasSecureOchEnv } from "@/app/actions/getSecureEnv"

const Accounts = () => {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [canEscalateDev, setCanEscalateDev] = useState(false)
  
  // Pagination state
  const [page, setPage] = useState(1)
  const [paginationData, setPaginationData] = useState<any>(null)
  const limit = 10

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1) // Reset to page 1 on new search
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get(`/admin/users/all?page=${page}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}`)
      setUsers(res.data.users || [])
      setPaginationData(res.data.pagination)
    } catch (error: any) {
      toast.error("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    hasSecureOchEnv().then(setCanEscalateDev)
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId)
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole })
      if (res.data.success) {
        toast.success("Role updated successfully")
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u))
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update role")
    } finally {
      setUpdatingUserId(null)
    }
  }

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'dev': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'admin': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'bouncer': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'organizer': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
    }
  }

  return (
    <div className="p-6 space-y-6 bg-black min-h-screen text-white">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
          <Users className="text-orange-500" /> User Management
        </h1>
        <p className="text-zinc-500">View and manage administrative roles and user accounts</p>
      </header>

      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader className="border-b border-zinc-900 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <Input
              placeholder="Search users by name or email..."
              className="bg-zinc-900 border-zinc-800 pl-10 h-11 text-white focus:border-orange-500 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 flex flex-col">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-500">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <p className="font-medium animate-pulse">Fetching user database...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader className="bg-zinc-900/50">
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">User</TableHead>
                    <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Email</TableHead>
                    <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Joined</TableHead>
                    <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest text-right">Administrative Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-zinc-600 italic">
                        No users found matching your search
                      </TableCell>
                    </TableRow>
                  ) : users.map((user) => (
                    <TableRow key={user._id} className="border-zinc-800 hover:bg-zinc-900/30 transition-colors">
                      <TableCell className="font-bold text-white">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell className="text-zinc-400 font-mono text-xs">{user.email}</TableCell>
                      <TableCell className="text-zinc-500 text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Badge variant="outline" className={`${getRoleBadgeStyle(user.role)} capitalize font-bold`}>
                            {user.role}
                          </Badge>
                          <Select
                            disabled={updatingUserId === user._id}
                            onValueChange={(v) => handleRoleChange(user._id, v)}
                            defaultValue={user.role}
                          >
                            <SelectTrigger className="w-32 bg-zinc-900 border-zinc-800 text-xs h-8 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="organizer">Organizer</SelectItem>
                              <SelectItem value="bouncer">Bouncer</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              {canEscalateDev && <SelectItem value="dev">Developer</SelectItem>}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination Controls */}
              {paginationData && paginationData.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-900 bg-zinc-950/50">
                  <p className="text-xs text-zinc-500">
                    Showing <span className="font-medium text-white">{(page - 1) * limit + 1}</span> to <span className="font-medium text-white">{Math.min(page * limit, paginationData.total)}</span> of <span className="font-medium text-white">{paginationData.total}</span> users
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={!paginationData.hasPrevPage}
                      className="p-2 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center px-3 text-sm text-zinc-400">
                      Page {page} of {paginationData.totalPages}
                    </div>
                    <button
                      onClick={() => setPage(p => Math.min(paginationData.totalPages, p + 1))}
                      disabled={!paginationData.hasNextPage}
                      className="p-2 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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