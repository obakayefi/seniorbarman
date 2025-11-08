
"use client"
import QrCodeScanner from '@/components/ui/QrCodeScanner';
import { useState } from 'react';
import { QrReader } from 'react-qr-reader'

const CheckIn = () => {
    const [data, setData] = useState('No result');

    const onNewScanResult = (decodedText, decodedResult) => {
        // handle decoded results here
        console.log({ decodedResult, decodedText })
    };

    return (
        <div className='p-10'>
            <section className="flex flex-col gap-1">
                <h1 className="text-3xl">Check In</h1>
                <p className='text-gray-400'>Verify tickets upon entry efficiently.</p>
            </section>

            <section>
                <QrCodeScanner
                    fps={10}
                    qrbox={250}
                    disableFlip={false}
                    qrCodeSuccessCallback={onNewScanResult}
                />
            </section>
        </div>
    )
}

export default CheckIn