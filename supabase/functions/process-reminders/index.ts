import { createClient } from 'jsr:@supabase/supabase-js@2'
import { Resend } from 'npm:resend'

const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

export default async function handler(req: Request) {
    try {
        const now = new Date()

        // Fetch appointments (simplified for demo)
        const { data: appointments, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('status', 'confirmed')
            .gt('slot', `[${now.toISOString()},)`)

        if (error) throw error

        let emailsSent = 0
        let lastError = null

        for (const app of appointments) {
            // Parse slot
            const slotStr = app.slot
            const startDateStr = slotStr.replace(/[\[\(\)\"\]]/g, '').split(',')[0]
            const slotStart = new Date(startDateStr)

            const status = app.notification_status || { confirmed: false, reminded_24h: false, reminded_2h: false }
            let type = null

            // Check 24h Reminder
            const timeDiff = slotStart.getTime() - now.getTime()
            const hoursDiff = timeDiff / (1000 * 60 * 60)

            if (hoursDiff > 23.5 && hoursDiff < 24.5 && !status.reminded_24h) {
                type = '24h'
                status.reminded_24h = true
            }

            // Check 2h Reminder
            if (hoursDiff > 1.5 && hoursDiff < 2.5 && !status.reminded_2h) {
                type = '2h'
                status.reminded_2h = true
            }

            if (type) {
                const email = app.guest_email || 'client@example.com' // Fallback
                // Send Email via Resend
                try {
                    await resend.emails.send({
                        from: 'StyleSync Reminders <onboarding@resend.dev>',
                        to: [email],
                        subject: `Recordatorio de Turno: ${type === '24h' ? 'Mañana' : 'En breve'}`,
                        html: `<p>Hola, tu turno es el ${slotStart.toLocaleString()}. Te esperamos!</p>`
                    })

                    await supabase.from('appointments').update({ notification_status: status }).eq('id', app.id)
                    console.log(`[EMAIL SENT] ${type} reminder to ${email}`)
                    emailsSent++
                } catch (e) {
                    console.error("Resend Error", e)
                    lastError = e
                }
            }
        }

        return new Response(JSON.stringify({
            success: true,
            message: `Processed reminders. Sent ${emailsSent} emails.`,
            lastError: lastError ? lastError.message : null
        }), {
            headers: { 'Content-Type': 'application/json' },
        })

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 })
    }
}
