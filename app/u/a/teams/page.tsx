"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search, Shield, MapPin, Users, Ticket, Edit, Trash2, Archive, RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { TeamModal, TeamData } from "@/components/teams/TeamModal";
import { toast } from "sonner";
import { CLUBS } from "@/lib/utils";

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterArchived, setFilterArchived] = useState<"all" | "active" | "archived">("active");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null);
  const [isBulkImporting, setIsBulkImporting] = useState(false);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teams");
      const data = await res.json();
      if (res.ok && data.teams) {
        setTeams(data.teams);
      } else {
        toast.error(data.error || "Failed to load teams");
      }
    } catch (err) {
      toast.error("Network error while fetching teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleOpenCreate = () => {
    setSelectedTeam(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (team: TeamData) => {
    setSelectedTeam(team);
    setIsModalOpen(true);
  };

  const handleDelete = async (teamId: string, teamName: string) => {
    if (!confirm(`Are you sure you want to delete team "${teamName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/teams/${teamId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Team "${teamName}" deleted successfully`);
        fetchTeams();
      } else {
        toast.error(data.error || "Failed to delete team");
      }
    } catch (err) {
      toast.error("Error deleting team");
    }
  };

  const handleBulkImportPresets = async () => {
    if (!confirm("This will import all standard NPFL club presets into the system. Continue?")) return;

    setIsBulkImporting(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams: CLUBS })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Bulk import complete");
        fetchTeams();
      } else {
        toast.error(data.error || "Bulk import failed");
      }
    } catch (err) {
      toast.error("Error running bulk import");
    } finally {
      setIsBulkImporting(false);
    }
  };

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesSearch =
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (team.stadium && team.stadium.toLowerCase().includes(searchTerm.toLowerCase()));

      if (filterArchived === "active") {
        return matchesSearch && !team.isArchived;
      }
      if (filterArchived === "archived") {
        return matchesSearch && team.isArchived;
      }
      return matchesSearch;
    });
  }, [teams, searchTerm, filterArchived]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teams Management</h1>
          <p className="text-sm text-muted-foreground">
            Add, configure, and manage football clubs, stadium venues, managers, and default ticket tiers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBulkImportPresets} disabled={isBulkImporting}>
            <Upload className="h-4 w-4 mr-2" />
            {isBulkImporting ? "Importing..." : "Seed Presets"}
          </Button>
          <Button size="sm" onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Team
          </Button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams or stadiums..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex bg-muted p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterArchived("active")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterArchived === "active"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Active ({teams.filter((t) => !t.isArchived).length})
            </button>
            <button
              onClick={() => setFilterArchived("archived")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterArchived === "archived"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Archived ({teams.filter((t) => t.isArchived).length})
            </button>
            <button
              onClick={() => setFilterArchived("all")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterArchived === "all"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({teams.length})
            </button>
          </div>

          <Button variant="ghost" size="icon" onClick={fetchTeams} title="Refresh Teams">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Teams Grid View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-10">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-48 border rounded-xl animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-muted/10 space-y-3">
          <Shield className="h-10 w-10 mx-auto text-muted-foreground/60" />
          <h3 className="font-semibold text-lg">No teams found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {searchTerm
              ? `No teams match "${searchTerm}". Try clearing your search.`
              : "Get started by adding your first team or seeding default NPFL clubs."}
          </p>
          {!searchTerm && (
            <Button size="sm" onClick={handleOpenCreate} className="mt-2">
              <Plus className="h-4 w-4 mr-2" /> Add First Team
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Card key={team._id} className="relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              {team.isArchived && (
                <div className="absolute top-3 right-3">
                  <Badge variant="destructive" className="text-[10px]">Archived</Badge>
                </div>
              )}

              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-3">
                <div className="h-14 w-14 rounded-lg border bg-muted/20 p-1 flex items-center justify-center shrink-0">
                  <img
                    src={team.logo || "/clubs/rangers-logo.png"}
                    alt={team.name}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/clubs/rangers-logo.png";
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base font-bold truncate">{team.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs mt-1 truncate">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{team.stadium || "No Stadium Specified"}</span>
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs flex-1">
                {team.description && (
                  <p className="text-muted-foreground line-clamp-2">{team.description}</p>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-3.5 w-3.5 text-primary/70" />
                    <span>
                      <strong className="text-foreground">{team.managers?.length || 0}</strong> Manager(s)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Ticket className="h-3.5 w-3.5 text-primary/70" />
                    <span>
                      <strong className="text-foreground">{team.ticketTypes?.length || 0}</strong> Ticket Tiers
                    </span>
                  </div>
                </div>

                {team.managers && team.managers.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {team.managers.map((m: any, idx: number) => (
                      <span key={idx} className="bg-muted px-2 py-0.5 rounded text-[11px] font-medium text-foreground">
                        {typeof m === "object" ? `${m.firstName} ${m.lastName}` : "Manager"}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-3 border-t flex justify-end gap-2 bg-muted/10">
                <Button variant="outline" size="sm" onClick={() => handleOpenEdit(team)}>
                  <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(team._id!, team.name)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <TeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTeams}
        team={selectedTeam}
      />
    </div>
  );
}
