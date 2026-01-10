import axios from 'axios'

export async function sendTestWebhook() {
    await axios.post("http://localhost:3000/api/webhooks/test", {
        message: "Hello from my app",
        time: new Date().toDateString()
    })
}