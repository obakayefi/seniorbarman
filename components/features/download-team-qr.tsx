"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, QrCode } from 'lucide-react';
import { toast } from 'sonner';

type TeamQrData = {
    _id: string;
    name: string;
    stadium?: string;
};

export function DownloadTeamQR({ team }: { team: TeamQrData }) {
    const [generating, setGenerating] = useState(false);

    const downloadQr = async () => {
        setGenerating(true);
        let qrUrl: string | undefined;
        try {
            const QRCodeStyling = (await import('qr-code-styling')).default;
            const shareUrl = `${window.location.origin}/teams/${team._id}`;
            const qr = new QRCodeStyling({
                width: 480,
                height: 480,
                data: shareUrl,
                dotsOptions: { color: '#172033', type: 'rounded' },
                backgroundOptions: { color: '#FFFFFF' },
                cornersSquareOptions: { color: '#EA580C', type: 'extra-rounded' },
                cornersDotOptions: { color: '#EA580C', type: 'dot' },
            });
            const raw = await qr.getRawData('png');
            if (!raw) throw new Error('QR generation returned no image');

            const qrBlob = raw instanceof Blob ? raw : new Blob([raw as BlobPart], { type: 'image/png' });
            qrUrl = URL.createObjectURL(qrBlob);
            const qrImage = await new Promise<HTMLImageElement>((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = reject;
                image.src = qrUrl!;
            });

            const canvas = document.createElement('canvas');
            canvas.width = 720;
            canvas.height = 860;
            const context = canvas.getContext('2d');
            if (!context) throw new Error('Could not create the QR image');

            context.fillStyle = '#FFFFFF';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = '#EA580C';
            context.fillRect(0, 0, canvas.width, 14);
            context.textAlign = 'center';
            context.fillStyle = '#EA580C';
            context.font = '700 22px Arial, sans-serif';
            context.fillText('SENIORBARMAN · TEAM HUB', 360, 76);
            context.fillStyle = '#111827';
            context.font = '700 38px Arial, sans-serif';
            context.fillText(team.name, 360, 142, 640);
            context.drawImage(qrImage, 120, 190, 480, 480);
            context.fillStyle = '#374151';
            context.font = '600 20px Arial, sans-serif';
            context.fillText('SCAN TO VIEW TEAM & UPCOMING MATCHES', 360, 720);
            if (team.stadium) {
                context.fillStyle = '#6B7280';
                context.font = '16px Arial, sans-serif';
                context.fillText(team.stadium, 360, 754, 640);
            }
            context.fillStyle = '#9CA3AF';
            context.font = '14px Arial, sans-serif';
            context.fillText('seniorbarman.com', 360, 812);

            const imageBlob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not export the QR image')), 'image/png');
            });
            const downloadUrl = URL.createObjectURL(imageBlob);
            const anchor = document.createElement('a');
            anchor.href = downloadUrl;
            anchor.download = `SeniorBarman_${team.name.replace(/[^a-z0-9]+/gi, '_')}_Team_QR.png`;
            anchor.click();
            URL.revokeObjectURL(downloadUrl);
            toast.success('Team QR downloaded');
        } catch (error) {
            console.error('Team QR generation failed:', error);
            toast.error('Could not generate the team QR');
        } finally {
            if (qrUrl) URL.revokeObjectURL(qrUrl);
            setGenerating(false);
        }
    };

    return (
        <Button type="button" variant="outline" onClick={downloadQr} disabled={generating} className="border-orange-500/30 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 dark:text-orange-400">
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <QrCode className="mr-2 h-4 w-4" />}
            {generating ? 'Generating QR…' : 'Share Team QR'}
        </Button>
    );
}
