"use client"
import React, { useEffect, useState } from 'react'
import { useQRCode } from 'next-qrcode'
import { Scanner } from '@yudiel/react-qr-scanner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '@/lib/axios';
import { Delete, ShieldCheck, ShieldCheckIcon, User2Icon, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NButton from '@/components/native/NButton';
import { toast } from 'sonner';

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
      onClick={() => {}}
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




const Dashboard = () => {
  const { SVG } = useQRCode()
  const [openApprovalModal, setOpenApprovalModal] = useState(false)
  const [currentTicket, setCurrentTicket] = useState<TicketSummary>({} as TicketSummary)
  const [loading, setLoading] = useState(false)
  const [ticketStatus, setTicketStatus] = useState('')

  useEffect(() => {
    console.log({ currentTicket })
  }, [currentTicket])


  // useEffect(() => {
  //   // set
  // }, [currentTicket])


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
    <div className='p-15'>
      <h2 className='text-2xl'>Dashboard</h2>
      <section>
        <Scanner
          onScan={handleScan}
          onError={(error: any) => console.log(error?.message)}
        />
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
  )
}

export default Dashboard