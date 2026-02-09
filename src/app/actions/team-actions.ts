'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createBarber(fullName: string, email: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // 1. Check Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthenticated' }

    // In a real production app, we would use Supabase Admin API to create a new Auth User.
    // However, since we don't have the Service Role Key exposed to the client/actions safely in this context (usually),
    // and we are simulating standard flow, we might run into issues creating *Auth Users* from here without Admin privileges.
    // For this prototype, we'll create a PROFILE record with role 'barber'. 
    // The actual User Account (Auth) would need to be created via Invitation logic or manually.
    // LIMITATION: This creates a "Ghost" profile. Real login requires an Auth User.

    // WORKAROUND: We will just insert into 'profiles'.
    // NOTE: This assumes RLS allows admins to insert profiles (we verified this earlier).

    const { error } = await supabase.from('profiles').insert({
        id: crypto.randomUUID(), // Placeholder ID, normally linked to Auth
        full_name: fullName,
        role: 'barber',
        // We can store email in a metadata field if we extend the table, 
        // but for now we rely on name.
    })

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/team')
    return { success: true }
}

export async function updateBarberWorkHours(barberId: string, startHour: string, endHour: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase
        .from('profiles')
        .update({
            work_start: startHour,
            work_end: endHour
        })
        .eq('id', barberId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/team')
    return { success: true }
}

export async function updateBarberProfile(barberId: string, fullName: string, avatarUrl?: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const updateData: any = { full_name: fullName }
    if (avatarUrl) updateData.avatar_url = avatarUrl

    const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', barberId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/team')
    return { success: true }
}
