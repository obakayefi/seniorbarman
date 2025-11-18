import { Suspense } from "react";
import VerifyPageClient from "./VerifyPageClient";

export default function VerifyPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
            <VerifyPageClient />
        </Suspense>
    );
}
