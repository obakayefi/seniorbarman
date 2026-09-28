"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft, Search, Loader2, CheckCircle, Clock, AlertCircle,
  Ticket, Wallet, ShoppingBag, Calculator, RefreshCw, Sparkles, MapPin, Calendar
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { paginateArray } from "@/lib/pagination";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function OrganizerEventTicketOrdersPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "pending" | "failed">("all");
  const [generatingRef, setGeneratingRef] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/events/${eventId}/orders`);
      if (res.data.success) {
        setData(res.data);
      } else {
        toast.error("Failed to fetch ticket orders");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error loading ticket orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) fetchOrders();
  }, [eventId]);

  // Reset pagination when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  const handleGenerateTickets = async (reference: string) => {
    setGeneratingRef(reference);
    try {
      const res = await api.get(`/ticket-order?reference=${reference}`);
      if (res.data.createdTickets || res.status === 200) {
        toast.success("Tickets generated successfully!");
        fetchOrders();
      }
    } catch (err: any) {
      toast.error("Generation failed: " + (err.response?.data?.error || err.message));
    } finally {
      setGeneratingRef(null);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!data?.orders) return [];
    return data.orders.filter((order: any) => {
      const matchesStatus = statusFilter === "all" || order.paymentStatus === statusFilter;
      const searchLower = searchTerm.toLowerCase();

      const userName = `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.toLowerCase();
      const userEmail = (order.user?.email || "").toLowerCase();
      const reference = (order.reference || "").toLowerCase();

      const matchesSearch =
        userName.includes(searchLower) ||
        userEmail.includes(searchLower) ||
        reference.includes(searchLower);

      return matchesStatus && matchesSearch;
    });
  }, [data?.orders, statusFilter, searchTerm]);

  // Paginated data result
  const paginatedResult = useMemo(() => {
    return paginateArray(filteredOrders, { page, limit });
  }, [filteredOrders, page, limit]);

  // Column definitions for reusable DataTable
  const columns: ColumnDef<any>[] = [
    {
      header: "Order Reference",
      cell: (order) => (
        <div className="space-y-0.5">
          <span className="font-mono font-bold text-foreground text-xs">{order.reference}</span>
          <div className="text-[10px] text-muted-foreground font-medium">
            {format(new Date(order.createdAt), "MMM dd, yyyy · HH:mm")}
          </div>
        </div>
      ),
    },
    {
      header: "Buyer Details",
      cell: (order) => (
        <div className="flex flex-col text-xs">
          <span className="font-bold text-foreground">
            {order.user?.firstName} {order.user?.lastName}
          </span>
          <span className="text-[11px] text-muted-foreground font-mono">{order.user?.email}</span>
        </div>
      ),
    },
    {
      header: "Purchased Tiers",
      cell: (order) => (
        <div className="space-y-1">
          {order.parsedTickets?.map((item: any, idx: number) => (
            <div key={idx} className="text-xs flex items-center gap-1.5">
              <span className="font-semibold text-foreground">{item.name}</span>
              <span className="text-muted-foreground font-bold text-[11px]">x{item.quantity}</span>
              <span className="text-muted-foreground text-[10px]">
                (₦{(item.price || 0).toLocaleString()})
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      header: "Total Amount",
      cell: (order) => (
        <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
          ₦{(order.totalAmount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Payment Status",
      cell: (order) => {
        if (order.paymentStatus === "success") {
          return (
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold py-0.5 rounded-xs">
              <CheckCircle className="h-3 w-3 mr-1" /> Paid
            </Badge>
          );
        }
        if (order.paymentStatus === "failed") {
          return (
            <Badge variant="destructive" className="text-[10px] font-bold py-0.5 rounded-xs">
              <AlertCircle className="h-3 w-3 mr-1" /> Failed
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-500/30 text-[10px] font-bold py-0.5 rounded-xs">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      },
    },
    {
      header: "Generation Status",
      headerClassName: "text-right",
      className: "text-right",
      cell: (order) => {
        if (order.isGenerated) {
          return (
            <span className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Generated
            </span>
          );
        }
        return (
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-muted-foreground">Not Generated</span>
            {order.paymentStatus === "success" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleGenerateTickets(order.reference)}
                disabled={generatingRef === order.reference}
                className="h-7 text-[10px] font-bold text-orange-600 border-orange-500/30 hover:bg-orange-50 rounded-sm"
              >
                {generatingRef === order.reference ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Generate Now"
                )}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-muted-foreground gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        <p className="text-sm font-medium animate-pulse">Calculating event ticket orders & revenue...</p>
      </div>
    );
  }

  if (!data?.event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-muted-foreground gap-4">
        <p className="text-xl">Event not found</p>
        <Button asChild variant="outline">
          <Link href="/u/organizer/events/manage">Back to Management</Link>
        </Button>
      </div>
    );
  }

  const { event, summary } = data;
  const eventTitle =
    event.type === "sports"
      ? `${event.homeTeam?.name || event.homeTeam} vs ${event.awayTeam?.name || event.awayTeam}`
      : event.title;

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-8 min-h-screen bg-background text-foreground pb-24">
      {/* Header Container */}
      <div className="p-5 sm:p-6 bg-card border border-border dark:border-zinc-800 rounded-sm shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Link
              href={`/u/organizer/events/${eventId}`}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs font-semibold uppercase tracking-wider group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to Event Details
            </Link>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <Badge variant="outline" className="text-[10px] uppercase font-bold bg-orange-500/10 border-orange-500/30 text-orange-500 dark:text-orange-400 px-2.5 py-0.5 rounded-xs">
                  Ticket Orders & Revenue Report
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">Ref: {event._id.slice(-8)}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight">{eventTitle}</h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-medium pt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-orange-500" />
                  {format(new Date(event.date), "EEEE, MMMM dd, yyyy")}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-orange-500" />
                  {event.venue}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <Button variant="outline" size="sm" onClick={fetchOrders} className="h-10 px-4 font-semibold rounded-sm border-border dark:border-zinc-800 bg-card hover:bg-muted text-foreground text-xs uppercase tracking-wider">
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
            <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-10 px-4 rounded-sm shadow-sm text-xs uppercase tracking-wider">
              <Link href={`/u/organizer/events/${eventId}/generate-wizard`}>
                <Sparkles className="h-4 w-4 mr-2" /> Generate Tickets
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Financial Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border dark:border-zinc-800 shadow-sm rounded-sm p-5 space-y-2 hover:border-emerald-500/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
              Total Paid Revenue
            </CardTitle>
            <Wallet className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              ₦{summary.totalPaidRevenue.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">
              From {summary.successfulOrders} successful order(s)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border dark:border-zinc-800 shadow-sm rounded-sm p-5 space-y-2 hover:border-orange-500/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
              Paid Tickets Sold
            </CardTitle>
            <Ticket className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl sm:text-3xl font-black text-foreground">{summary.totalTicketsSold}</div>
            <p className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">
              Issued across paid orders
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border dark:border-zinc-800 shadow-sm rounded-sm p-5 space-y-2 hover:border-blue-500/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
              Successful Orders
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl sm:text-3xl font-black text-foreground">{summary.successfulOrders}</div>
            <p className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">
              Out of {summary.totalOrders} total order attempts
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border dark:border-zinc-800 shadow-sm rounded-sm p-5 space-y-2 hover:border-amber-500/40 transition-all">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
              Pending / Failed
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl sm:text-3xl font-black text-foreground">
              {summary.pendingOrders + summary.failedOrders}
            </div>
            <p className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">
              {summary.pendingOrders} pending · {summary.failedOrders} failed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Calculation & Ticket Tier Breakdown Card */}
      <Card className="border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/10 rounded-sm p-5 sm:p-6 space-y-4 shadow-sm">
        <CardHeader className="p-0 pb-2 space-y-1">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-base font-bold text-foreground">
              Revenue Calculation Breakdown
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Itemized formula breakdown of ticket revenue calculated directly from completed buyer transactions.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 space-y-4">
          {summary.tierBreakdown && summary.tierBreakdown.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {summary.tierBreakdown.map((tier: any, idx: number) => (
                <div key={idx} className="bg-background border border-border dark:border-zinc-800 rounded-sm p-4 space-y-1.5 text-xs shadow-xs">
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span>{tier.name}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-black">₦{tier.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-[11px]">
                    <span>Calculation:</span>
                    <span className="font-mono">
                      {tier.qtySold} tickets × ₦{tier.unitPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No paid ticket transactions completed yet for this event.
            </p>
          )}

          <div className="pt-3 border-t border-border/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold">
            <span className="text-muted-foreground">Formula:</span>
            <span className="font-mono bg-background px-4 py-2 rounded-sm border border-border dark:border-zinc-800 text-foreground shadow-xs">
              Total Ticket Revenue = ∑ (Paid Orders × Unit Tier Price) = <strong className="text-emerald-600 dark:text-emerald-400 font-black">₦{summary.totalPaidRevenue.toLocaleString()}</strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Filter and Search Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-card border border-border dark:border-zinc-800 rounded-sm shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by buyer name, email, or ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 text-xs rounded-sm bg-background border-border dark:border-zinc-800"
            />
          </div>

          <div className="flex items-center gap-1 bg-muted dark:bg-zinc-900 p-1 rounded-sm text-xs font-semibold w-full sm:w-auto justify-end border border-border dark:border-zinc-800">
            {(["all", "success", "pending", "failed"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-xs capitalize transition-colors text-xs ${
                  statusFilter === status
                    ? "bg-card text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {status} ({status === "all" ? data?.orders?.length || 0 : data?.orders?.filter((o: any) => o.paymentStatus === status).length || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Paginated Data Table */}
        <DataTable
          columns={columns}
          data={paginatedResult.data}
          loading={loading}
          emptyMessage="No ticket orders found matching your criteria."
          emptyIcon={<ShoppingBag className="h-10 w-10 opacity-40" />}
          pagination={paginatedResult.pagination}
          onPageChange={(p) => setPage(p)}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
          limitOptions={[5, 10, 20, 50]}
        />
      </div>
    </div>
  );
}
