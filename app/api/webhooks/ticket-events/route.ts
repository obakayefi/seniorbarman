import {headers} from 'next/headers'

export async function POST(req: Request, res: Response) {
    const body = await req.json()
    const headersList = headers()

    console.log({ hooks_body: body })
    
    const secret = headersList.get('x-webhook-secret')

    if (secret !== process.env.WEBHOOK_SECRET) {
        return new Response('Unauthorized', {status: 401})
    }

    switch (body.type) {
        case "ticket.check_in":
            console.log("Checking in", body)
            break;
        case "ticket.check_out":
            console.log("Checking out", body)
            break
        default:
            console.log('Unknown type', body)
            break
    }

    return Response.json({received: true})
}