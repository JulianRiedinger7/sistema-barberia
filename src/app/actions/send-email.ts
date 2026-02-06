'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendConfirmationEmail(
    toName: string,
    toEmail: string,
    details: {
        service: string,
        barber: string,
        date: string,
        time: string,
        price: number
    }
) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'StyleSync <onboarding@resend.dev>', // Default Resend testing domain
            to: [toEmail], // In Resend test mode, this must be YOUR email (the one you signed up with). 
            // If user puts another email, it might fail unless domain is verified.
            // For now we assume the user is testing with their own email or verified domain.
            subject: 'Confirmación de Reserva - StyleSync',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #d4af37;">¡Tu reserva está confirmada!</h1>
                    <p>Hola ${toName},</p>
                    <p>Te esperamos para una experiencia premium.</p>
                    
                    <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <ul style="list-style: none; padding: 0;">
                            <li><strong>Servicio:</strong> ${details.service}</li>
                            <li><strong>Experto:</strong> ${details.barber}</li>
                            <li><strong>Fecha:</strong> ${details.date} a las ${details.time}</li>
                            <li><strong>Total:</strong> $${details.price}</li>
                        </ul>
                    </div>
                    
                    <p>Si necesitas cancelar, por favor avísanos con anticipación.</p>
                    <p>Saludos,<br>El equipo de StyleSync</p>
                </div>
            `
        })

        if (error) {
            console.error("Resend Error:", error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (e: any) {
        console.error("Server Action Error:", e)
        return { success: false, error: e.message }
    }
}
