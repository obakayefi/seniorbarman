"use client"
import React, { useState, useEffect } from 'react'

const ExamplePage = () => {
    // 1. We need the target event ID to know which stream to listen to
    const [eventId, setEventId] = useState('')
    const [connected, setConnected] = useState(false)

    // 2. These holding states will capture the live data from the stream
    const [scans, setScans] = useState<any[]>([])
    const [stats, setStats] = useState<any>(null)

    // 3. Setup the SSE connection whenever we turn it "on"
    useEffect(() => {
        if (!connected || !eventId) return;

        console.log(`📡 Connecting to SSE for event: ${eventId}...`);

        // This opens the persistent HTTP stream natively in the browser
        const eventSource = new EventSource(`/api/events/${eventId}/stream`);

        eventSource.onmessage = (event) => {
            // Parse the data published by Redis in the backend!
            const data = JSON.parse(event.data);
            console.log("📨 Received live SSE data:", data);

            // Our stream sends a "connected" event on startup
            if (data.type === "connected") {
                console.log("✅ Successfully connected to stream!");
            }

            // If the chunk contains new capacity stats, update the state
            if (data.eventTicketStats) {
                setStats(data.eventTicketStats);
            }

            // If the chunk is our "new_scan" event we published, push it to UI
            if (data.type === "new_scan" && data.scan) {
                setScans(prev => [data.scan, ...prev]); // Prepend new scan to top
            }
        };

        eventSource.onerror = (err) => {
            console.error("❌ SSE Error (stream dropped / eventId invalid):", err);
            eventSource.close();
            setConnected(false);
        };

        // CLEANUP: Close the connection automatically when leaving the page or disconnecting
        return () => {
            console.log("🔌 Cleaning up SSE connection...");
            eventSource.close();
        };
    }, [connected, eventId]);

    return (
        <div className="p-8 min-h-screen bg-black text-white">
            <h1 className="text-3xl font-bold mb-2">SSE Example Sandbox 📻</h1>
            <p className="text-zinc-400 text-sm mb-8">
                Paste any valid Event ID below, click Connect, and watch the live payloads stream from Redis whenever a ticket is checked in on another device.
            </p>

            {/* Connection Form */}
            <div className="flex gap-4 mb-10 max-w-xl">
                <input
                    type="text"
                    placeholder="Paste an active Event ID..."
                    value={eventId}
                    onChange={e => setEventId(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-white placeholder-zinc-600 focus:ring-2 focus:ring-orange-500 outline-none"
                    disabled={connected}
                />
                <button
                    onClick={() => setConnected(!connected)}
                    className={`px-8 py-3 rounded-lg font-bold transition-colors ${connected ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                >
                    {connected ? 'Disconnect' : 'Listen Live'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visualizing Live Scans */}
                <div className="border border-zinc-800 p-6 rounded-2xl bg-zinc-900/50">
                    <h2 className="text-xl mb-4 font-black flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-zinc-700'}`}></div>
                        LIVE SCANS
                    </h2>

                    {scans.length === 0 ? (
                        <p className="text-zinc-600 italic text-sm py-4">Waiting for incoming check-ins...</p>
                    ) : (
                        <ul className="space-y-3">
                            {scans.map((scan, i) => (
                                <li key={i} className="p-4 rounded-xl border border-white/5 bg-zinc-900 flex justify-between items-center">
                                    <div>
                                        <div className="font-bold">{scan.userName}</div>
                                        <div className="text-xs text-zinc-500">{scan.time} • Stand: {scan.stand}</div>
                                    </div>
                                    <div className="bg-green-500/10 text-green-500 font-black px-3 py-1 rounded-full text-xs">
                                        {scan.status}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Visualizing Live Stats */}
                <div className="border border-zinc-800 p-6 rounded-2xl bg-zinc-900/50">
                    <h2 className="text-xl mb-4 font-black">EVENT STATS (RAW JSON)</h2>
                    {stats ? (
                        <pre className="text-xs text-orange-200/80 bg-black p-4 rounded-xl overflow-x-auto border border-white/5">
                            {JSON.stringify(stats, null, 2)}
                        </pre>
                    ) : (
                        <p className="text-zinc-600 italic text-sm py-4">Waiting for stats payload update...</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ExamplePage