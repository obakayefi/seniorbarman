"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, redirect } from "next/navigation";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { CircleCheckBig, CircleX, Hourglass } from "lucide-react";
import axios from "axios";
import NButton from "@/components/native/NButton";

type VerifyStatus = "loading" | "success" | "pending" | "failed";


const GenerateTickets = () => {
  // fetch ticket id
  // send ticket_id to the db to generate tickets and check status as paid
  // once the tickets are generated we can notify the frontend with a response
  return (
    <div className="flex items-center gap-2">
      <h3 className="text">Wait a minute let's generate your tickets</h3>
      <span><Spinner /> </span>
    </div>
  )
}

const FinishGeneratingTickets = () => {
  // the finished version, when 
  return (
    <div>
      <p className="text mb-2">Your tickets have been generated and sent to your mailbox</p>
      <NButton onClick={() => redirect('/user/tickets')}>Go to Tickets</NButton>
    </div>
  )
}

const FailedGeneratingTickets = ({ errorMsg }: { errorMsg: string }) => {
  return (
    <div>
      <p className="text-gray-400">We could not generate tickets at this time, try again</p>
      <span className="text-sm text-red-300">{errorMsg}</span>
    </div>
  )
}

export default function VerifyPage() {
  const [ticketGenerationStatus, setTicketGenerationStatus] = useState<'pending' | 'generating' | 'completed' | 'failed'>('pending')
  const [errorMsg, setErrorMsg] = useState('')
  const [generatedTickets, setGeneratedTickets] = useState([])
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState<VerifyStatus>("pending");
  const [ticket, setTicket] = useState<any>(null);

  const startTicketGeneration = () => {
    setTicketGenerationStatus('generating')
  }

  const endTicketGeneration = () => {
    setTicketGenerationStatus('completed')
  }

  useEffect(() => {
    // const getTicketOrders = async () => {
    //   try {
    //     const ticketOrder = await axios.get(`/api/ticket-order/${reference}`)
    //     console.log({ ticketOrder })
    //   } catch (error: any) {
    //     console.error('Error creating tickets [verify]', error.message)
    //   }
    // }
    // getTicketOrders()

    if (!reference) return;

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/payment/verify?reference=${reference}`);
        const data = await res.json();

        if (data.status !== 'success') {
          setStatus('failed')
          setTicketGenerationStatus('failed')
        }

        // console.log({ dataForVerify: data })
        if (data.status === "success") {
          setTicket(data.ticket);
          setStatus("success");
          // begin generating tickets 
          setTicketGenerationStatus('generating')
          const response = await fetch(`/api/ticket-order?reference=${reference}`)
          const ticketOrder = await response.json()
          console.log({ ticketOrder })
          if (!ticketOrder.createdTickets || ticketOrder.error) {
            setErrorMsg(ticketOrder.error)
            setTicketGenerationStatus('failed')
            return
          }
          setGeneratedTickets(ticketOrder.createdTickets)
          setTicketGenerationStatus('completed')
        } else if (data.status === "pending") {
          setStatus("pending");
        } else {
          setStatus("failed");
        }
      } catch (err: any) {
        setTicketGenerationStatus('failed')
        setStatus("failed");
        throw Error("Error verifying payment");
      }
    };

    verifyPayment();
  }, [reference]);

  // Optional redirect after success
  // useEffect(() => {
  //   if (status === "success") {
  //     const timeout = setTimeout(() => router.push("/user/tickets"), 6000);
  //     return () => clearTimeout(timeout);
  //   }
  // }, [status, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      {status === "loading" && (
        <div className="flex flex-col items-center ">
          <Spinner className="w-32 h-18 text-orange-600" />
          <h2 className="mt-4 text-lg font-semibold text-gray-700">
            Verifying your payment…
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Please wait while we confirm your transaction.
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="bg-white items-center flex flex-col shadow-md rounded-lg p-6 w-full max-w-md">
          <CircleCheckBig className="text-green-400" size={80} />
          <h2 className="mt-4 text-2xl font-bold text-green-600">
            Payment Successful 🎉
          </h2>
          <p className="mt-2 text-gray-600">
            Your payment <strong>{ticket?.event?.name}</strong> has been confirmed!
          </p>
          <section className="border-t-1 mt-4 border-gray-200 pt-4">
            {((ticketGenerationStatus === 'pending') || (ticketGenerationStatus === 'generating')) ? (
              <GenerateTickets />
            ) : ticketGenerationStatus === 'completed' ? (
              <FinishGeneratingTickets />
            ) : ticketGenerationStatus === 'failed' ? (
              <FailedGeneratingTickets errorMsg={errorMsg} />
            ) : null}
          </section>
        </div>
      )}

      {status === "pending" && (
        <div className="flex flex-col items-center">
          <Hourglass className="text-orange-500" size={80} />
          <h2 className="mt-4 text-xl font-semibold text-yellow-600">
            Payment Pending
          </h2>
          <p className="text-gray-600 mt-2">
            We’re still waiting for confirmation from Paystack.
          </p>
        </div>
      )}

      {status === "failed" && (
        <div className="flex flex-col items-center">
          <CircleX size={80} className="text-red-600" />
          <h2 className="mt-4 text-xl font-semibold text-red-600">
            Payment Failed
          </h2>
          <p className="text-gray-600 mt-2">
            Your payment could not be verified. Please try again.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 transition"
          >
            Go Home
          </Link>
        </div>
      )}
    </div>
  );
}
