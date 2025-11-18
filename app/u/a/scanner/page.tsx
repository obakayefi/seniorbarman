"use client"
import React, { useEffect, useState } from 'react'
import { useQRCode } from 'next-qrcode'
import { Scanner } from '@yudiel/react-qr-scanner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '@/lib/axios';
import { Delete, Power, QrCode, ShieldCheck, ShieldCheckIcon, User2Icon, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NButton from '@/components/native/NButton';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type TicketSummary = {
  event: {
    homeTeam: string;
    awayTeam: string;
  };
  user: string;
  ticket: {
    status: string;
    id: string;
    stand: string;
  }
}


type PreCheckInActionsProps = {
  loading: boolean;
  handleCheckingUserIn: () => void;
}

const PreCheckInActions = ({ loading, handleCheckingUserIn }: PreCheckInActionsProps) => (
  <section className='border-t-1 flex justify-between gap-2 border-slate-200 pt-4'>
    <NButton
      loading={loading}
      disabled={loading}
      onClick={handleCheckingUserIn}
      icon={<ShieldCheckIcon />}
      className='cursor-pointer font-light active:translate-x-2 border-2 border-transparent duration-50 bg-orange-500'>
      Check User In
    </NButton>

    <NButton
      loading={false}
      disabled={false}
      onClick={() => { }}
      icon={<Delete />}
      className='cursor-pointer font-light active:translate-x-2 border-2 border-transparent duration-50 bg-orange-500'>
      Block Ticket
    </NButton>
  </section>
)



type PostCheckInActionsProps = {
  loading: boolean;
  handleCheckingUserIn: () => void;
}

const PostCheckInActions = ({ loading, handleCheckingUserIn }: PostCheckInActionsProps) => (
  <section className='border-t-1 flex justify-between gap-2 border-slate-200 pt-4'>
    <NButton
      loading={loading}
      disabled={loading}
      onClick={handleCheckingUserIn}
      icon={<ShieldCheckIcon />}
      className='cursor-pointer font-light active:translate-x-2 border-2 border-transparent duration-50 bg-red-500'>
      Void Ticket
    </NButton>

    <NButton
      loading={loading}
      disabled={loading}
      onClick={handleCheckingUserIn}
      icon={<Delete />}
      className='cursor-pointer font-light active:translate-x-2 border-2 border-transparent duration-50 bg-white text-red-500'>
      Block Ticket
    </NButton>
  </section>
)




const AdminTicketScanner = () => {
  const { SVG } = useQRCode()
  const [openApprovalModal, setOpenApprovalModal] = useState(false)
  const [currentTicket, setCurrentTicket] = useState<TicketSummary>({} as TicketSummary)
  const [loading, setLoading] = useState(false)
  const [ticketStatus, setTicketStatus] = useState('')
  const [canScan, setCanScan] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState('')

  const toggleScanMode = () => setCanScan(scan => !scan)

  useEffect(() => {
    console.log({ currentTicket })
  }, [currentTicket])

  const handleScan = async (detectedCodes: any) => {
    const scanResult = JSON.parse(detectedCodes[0].rawValue)
    // console.log({ result: scanResult, ticketId: scanResult.ticket })
    const _ticket = await api.get(`/tickets/${scanResult.ticket}`)
    setCurrentTicket(_ticket.data.response)
    setTicketStatus(_ticket.data.response.ticket.status)
    // 
    // console.log({ _ticket })
    setOpenApprovalModal(true)

    // detectedCodes.forEach((code: any) => {
    //   console.log(`Format: ${code.format}, Value: ${code.rawValue}`);
    // });
  };

  const handleCheckingUserIn = async () => {
    setLoading(true)
    const _updatedTicket = await api.post(`/tickets/${currentTicket.ticket.id}/check-in`)
    console.log({ _updatedTicket })
    setTicketStatus(_updatedTicket.data.ticket.status)
    toast.info('User checked in!')
    setLoading(false)
  }

  return (
    <div className='p-15 h-screen overflow-y-auto'>
      <h2 className='text-4xl flex text-orange-400 items-center gap-2'>
        <span>Ticket Scanner</span> <span><QrCode className='text-orange-400 mt-0.5' /></span>
      </h2>
      <div className="flex lg:flex-row flex-col-reverse gap-2">
        <section className='w-4/4'>
          {/* <h2 className="text-4xl">Info</h2> */}

          <section className="flex mt-2 lg:mt-10 mb-4 flex-col">
            <h2 className="text-2xl mb-4 text-slate-600">Pick Event To Monitor</h2>
            <div className="bg-gray-200  w-1/2">
              <Select
                value={selectedEvent}
                onValueChange={(value: string) => { setSelectedEvent(value); }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick an event to scan for" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rangersvsenyimba"> Rangers vs Enyimba | 12 December 2025</SelectItem>
                  <SelectItem value="bouncer"> Rangers vs Lobi Stars | 28 December 2025</SelectItem>

                </SelectContent>
              </Select>
            </div>
          </section>

          <div className="h-auto bg-slate-100 md:hidden w-full flex flex-col gap-1">
            <section>
              {canScan ? (
                <Scanner
                  onScan={handleScan}
                  onError={(error: any) => console.log(error?.message)}
                />
              ) : null}

            </section>
            <NButton className={`${canScan ? 'bg-orange-500' : ''}`} icon={<Power />} onClick={toggleScanMode}>{canScan ? 'Turn Scan Off' : 'Activate Scanner'} </NButton>
          </div>

          <div className="flex mt-10 flex-col md:flex-row gap-2 w-full">
            <h2 className='text-3xl text-slate-600'>Fan Stats</h2>
            <div className='flex gap-4 flex-col md:flex-row'>
              <section className="bg-green-100 p-2 rounded lg:w-54">
                <h2 className='text-sm text-slate-500'>Total Check In</h2>
                <span className='text-5xl text-slate-800'>5,984</span>
              </section>
              <section className="bg-blue-100 p-2 rounded lg:w-54">
                <h2 className='text-sm text-slate-500'>Inside Stadium</h2>
                <span className='text-5xl text-slate-800'>4,250</span>
              </section>
              <section className="bg-red-100/50 p-2 rounded lg:w-54">
                <h2 className='text-sm text-slate-800'>Outside Stadium</h2>
                <span className='text-5xl text-slate-800'>960</span>
              </section>
            </div>
          </div>

          <div className='mt-10'>
            <h2 className="text-3xl text-slate-600 mb-2">Recent Scans</h2>
            <section className='border border-slate-200 max-h-76 overflow-y-auto flex flex-col gap-4 p-2'>
              <div className='flex gap-2 items-center justify-between bg-gray-100/50 p-4 rounded'>
                <h3>Rangers vs Enyimba</h3>
                <p className=''>Popular stand</p>
                <p className='text-gray-600'>25 December 2025</p>
                <p className='bg-slate-800 text-slate-300 px-6 p-0.5 rounded-full'>14:00</p>
              </div>

              <div className='flex gap-2 items-center justify-between bg-gray-100/50 p-4 rounded'>
                <h3>Rangers vs Enyimba</h3>
                <p className=''>Popular stand</p>
                <p className='text-gray-600'>25 December 2025</p>
                <p className='bg-slate-800 text-slate-300 px-6 p-0.5 rounded-full'>14:00</p>
              </div>

              <div className='flex gap-2 items-center justify-between bg-gray-100/50 p-4 rounded'>
                <h3>Rangers vs Enyimba</h3>
                <p className=''>Popular stand</p>
                <p className='text-gray-600'>25 December 2025</p>
                <p className='bg-slate-800 text-slate-300 px-6 p-0.5 rounded-full'>14:00</p>
              </div>

              <div className='flex gap-2 items-center justify-between bg-gray-100/50 p-4 rounded'>
                <h3>Rangers vs Enyimba</h3>
                <p className=''>Popular stand</p>
                <p className='text-gray-600'>25 December 2025</p>
                <p className='bg-slate-800 text-slate-300 px-6 p-0.5 rounded-full'>14:00</p>
              </div>

              <div className='flex gap-2 items-center justify-between bg-gray-100/50 p-4 rounded'>
                <h3>Rangers vs Enyimba</h3>
                <p className=''>Popular stand</p>
                <p className='text-gray-600'>25 December 2025</p>
                <p className='bg-slate-800 text-slate-300 px-6 p-0.5 rounded-full'>14:00</p>
              </div>
              <div className='flex gap-2 items-center justify-between bg-gray-100/50 p-4 rounded'>
                <h3>Rangers vs Enyimba</h3>
                <p className=''>Popular stand</p>
                <p className='text-gray-600'>25 December 2025</p>
                <p className='bg-slate-800 text-slate-300 px-6 p-0.5 rounded-full'>14:00</p>
              </div>
              <div className='flex gap-2 items-center justify-between bg-gray-100/50 p-4 rounded'>
                <h3>Rangers vs Enyimba</h3>
                <p className=''>Popular stand</p>
                <p className='text-gray-600'>25 December 2025</p>
                <p className='bg-slate-800 text-slate-300 px-6 p-0.5 rounded-full'>14:00</p>
              </div>
              <div className='flex gap-2 items-center justify-between bg-gray-100/50 p-4 rounded'>
                <h3>Rangers vs Enyimba</h3>
                <p className=''>Popular stand</p>
                <p className='text-gray-600'>25 December 2025</p>
                <p className='bg-slate-800 text-slate-300 px-6 p-0.5 rounded-full'>14:00</p>
              </div>

            </section>
          </div>

        </section>


        <section className='md:border-2 bg-transparent md:bg-slate-100 rounded p-8 flex items-center justify-center overflow-hidden h-auto md:border-slate-200 w-full'>
          <div className="h-auto w-96 hidden md:flex flex-col gap-1">
            <section>
              {canScan ? (
                <Scanner
                  onScan={handleScan}
                  onError={(error: any) => console.log(error?.message)}
                />
              ) : null}

            </section>
            <NButton className={`${canScan ? 'bg-orange-500' : ''}`} icon={<Power />} onClick={toggleScanMode}>{canScan ? 'Turn Scan Off' : 'Activate Scanner'} </NButton>
          </div>
          <Dialog open={openApprovalModal} onOpenChange={setOpenApprovalModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ticket Information</DialogTitle>
              </DialogHeader>
              <DialogDescription className='flex justify-between'>
                <div className='flex items-center gap-1'>
                  <h2 className='text-lg text-slate-800'>{currentTicket.event?.homeTeam}</h2> <span>vs</span>
                  <h2 className='text-lg text-slate-800'>{currentTicket.event?.awayTeam}</h2>
                </div>
                <div className='flex items-center gap-1'>
                  <h4>{ticketStatus}</h4>
                </div>
              </DialogDescription>
              <section className='flex items-center w-full justify-between'>
                <div>
                  <h5 className='text-sm text-slate-400'>{currentTicket.ticket?.stand}</h5>
                </div>

                <div className='text-slate-300 px-2 py-1 rounded text-sm flex items-center bg-slate-800 inline-flex w-max-fit'>
                  <span className='flex items-center gap-1'>{currentTicket?.user}</span> <span className='mb-0.5'><User2Icon size={16} /></span>
                </div>
              </section>

              {/* ACTIONS */}
              {
                ticketStatus !== "Not Checked In" ?
                  <PostCheckInActions
                    handleCheckingUserIn={handleCheckingUserIn}
                    loading={loading}
                  />
                  : <PreCheckInActions
                    handleCheckingUserIn={handleCheckingUserIn}
                    loading={loading}
                  />
              }

            </DialogContent>
          </Dialog>
        </section>
      </div>
    </div>
  )
}

export default AdminTicketScanner