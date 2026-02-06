'use client'

import { useState } from 'react'
import { ServiceGrid } from '@/components/booking/service-grid'
import { BarberSelector } from '@/components/booking/barber-selector'
import { BookingCalendar } from '@/components/booking/booking-calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronRight, CheckCircle, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { sendConfirmationEmail } from '@/app/actions/send-email'
import { supabase } from '@/utils/supabase/client'

export default function BookingPage() {
  const [step, setStep] = useState(1)
  const [bookingData, setBookingData] = useState({
    service: null as any,
    barber: null as any,
    slot: null as Date | null,
    guest: {
      name: '',
      email: '',
      phone: ''
    }
  })
  const [loading, setLoading] = useState(false)

  const handleServiceSelect = (service: any) => {
    setBookingData(prev => ({ ...prev, service }))
    setStep(2)
  }

  const handleBarberSelect = (barber: any) => {
    setBookingData(prev => ({ ...prev, barber }))
    setStep(3)
  }

  const handleSlotSelect = (slot: Date) => {
    setBookingData(prev => ({ ...prev, slot }))
    setStep(4) // Go to details form
  }

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingData.guest.name || !bookingData.guest.email || !bookingData.guest.phone) return
    setStep(5) // Confirmation
  }

  const confirmBooking = async () => {
    setLoading(true)
    try {
      if (!bookingData.slot || !bookingData.barber || !bookingData.service) return

      // Prepare slot range for Postgres tstzrange
      const end = new Date(bookingData.slot.getTime() + bookingData.service.duration_min * 60000)
      const slotRange = `[${bookingData.slot.toISOString()},${end.toISOString()})`

      const { error } = await supabase.from('appointments').insert({
        barber_id: bookingData.barber.id,
        service_id: bookingData.service.id,
        slot: slotRange,
        guest_name: bookingData.guest.name,
        guest_email: bookingData.guest.email,
        guest_phone: bookingData.guest.phone,
        client_id: null, // Explicitly null for guest
        status: 'confirmed'
      })

      if (error) throw error

      // Trigger Server Action for Real Email
      const emailResult = await sendConfirmationEmail(
        bookingData.guest.name,
        bookingData.guest.email,
        {
          service: bookingData.service.name,
          barber: bookingData.barber.full_name,
          date: format(bookingData.slot, "PPPP", { locale: es }),
          time: format(bookingData.slot, "HH:mm"),
          price: bookingData.service.price
        }
      )

      if (!emailResult.success) {
        console.error("Email failed:", emailResult.error)
        // We don't block the UI success state, but maybe warn?
      } else {
        console.log("[EMAIL SENT] ID:", emailResult.data?.id)
      }

      setStep(6) // Success
    } catch (e: any) {
      console.error(e)
      alert("Error al reservar: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-12 text-center relative">
        <div className="absolute top-0 right-0 hidden md:block">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" asChild>
            <a href="/dashboard">Admin</a>
          </Button>
        </div>
        <h1 className="text-4xl font-bold mb-2 tracking-tight text-primary">StyleSync</h1>
        <p className="text-muted-foreground">Barbería Tradicional &bull; Experiencia Premium</p>
      </header>

      {/* Progress Steps */}
      <div className="flex justify-center mb-8 gap-2 md:gap-4 text-xs md:text-sm font-medium text-muted-foreground overflow-x-auto">
        <span className={step >= 1 ? "text-primary whitespace-nowrap" : "whitespace-nowrap"}>1. Servicio</span>
        <ChevronRight className="w-4 h-4 min-w-4" />
        <span className={step >= 2 ? "text-primary whitespace-nowrap" : "whitespace-nowrap"}>2. Barbero</span>
        <ChevronRight className="w-4 h-4 min-w-4" />
        <span className={step >= 3 ? "text-primary whitespace-nowrap" : "whitespace-nowrap"}>3. Horario</span>
        <ChevronRight className="w-4 h-4 min-w-4" />
        <span className={step >= 4 ? "text-primary whitespace-nowrap" : "whitespace-nowrap"}>4. Datos</span>
        <ChevronRight className="w-4 h-4 min-w-4" />
        <span className={step >= 5 ? "text-primary whitespace-nowrap" : "whitespace-nowrap"}>5. Confirmar</span>
      </div>

      {/* Back Button */}
      {step > 1 && step < 6 && (
        <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="mb-4 pl-0 hover:text-primary">
          <ArrowLeft className="mr-2 w-4 h-4" /> Volver
        </Button>
      )}

      {/* Steps Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-light text-center mb-8">Selecciona tu <span className="text-primary">Servicio</span></h2>
            <ServiceGrid onSelectService={handleServiceSelect} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-light text-center mb-8">Elige a tu <span className="text-primary">Experto</span></h2>
            <BarberSelector onSelectBarber={handleBarberSelect} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-light text-center mb-8">Agenda tu <span className="text-primary">Cita</span></h2>
            <BookingCalendar barberId={bookingData.barber?.id} onSelectSlot={handleSlotSelect} />
          </div>
        )}

        {step === 4 && (
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-light text-center mb-8">Tus <span className="text-primary">Datos</span></h2>
            <Card className="p-6 border-primary/20">
              <form onSubmit={handleGuestSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    placeholder="Ej. Juan Pérez"
                    required
                    value={bookingData.guest.name}
                    onChange={(e) => setBookingData(prev => ({ ...prev, guest: { ...prev.guest, name: e.target.value } }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan@ejemplo.com"
                    required
                    value={bookingData.guest.email}
                    onChange={(e) => setBookingData(prev => ({ ...prev, guest: { ...prev.guest, email: e.target.value } }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+54 11 ..."
                    required
                    value={bookingData.guest.phone}
                    onChange={(e) => setBookingData(prev => ({ ...prev, guest: { ...prev.guest, phone: e.target.value } }))}
                  />
                </div>
                <Button type="submit" className="w-full mt-4">Continuar</Button>
              </form>
            </Card>
          </div>
        )}

        {step === 5 && (
          <div className="max-w-md mx-auto">
            <Card className="p-6 border-primary/20">
              <h2 className="text-2xl font-semibold mb-6 text-center">Confirmar Reserva</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Servicio</span>
                  <span className="font-medium text-right">{bookingData.service?.name}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Barbero</span>
                  <span className="font-medium text-right">{bookingData.barber?.full_name}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Fecha</span>
                  <span className="font-medium text-right capitalise">
                    {bookingData.slot && format(bookingData.slot, "PPPP", { locale: es })}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Hora</span>
                  <span className="font-medium text-right text-primary text-lg">
                    {bookingData.slot && format(bookingData.slot, "HH:mm")}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Cliente</span>
                  <span className="font-medium text-right">{bookingData.guest.name}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-xl text-primary">${bookingData.service?.price}</span>
                </div>
              </div>
              <Button className="w-full text-lg py-6 font-bold" onClick={confirmBooking} disabled={loading}>
                {loading ? 'Confirmando...' : 'Confirmar Reserva'}
              </Button>
            </Card>
          </div>
        )}

        {step === 6 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 text-primary mb-6">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-bold mb-4">¡Reserva Confirmada!</h2>
            <p className="text-xl text-muted-foreground mb-2">Te esperamos el {bookingData.slot && format(bookingData.slot, "PPPP 'a las' HH:mm", { locale: es })}.</p>
            <p className="text-sm text-muted-foreground mb-8">Hemos enviado un email de confirmación a {bookingData.guest.email}</p>
            <Button variant="outline" onClick={() => {
              setStep(1);
              setBookingData({ service: null, barber: null, slot: null, guest: { name: '', email: '', phone: '' } })
            }}>
              Volver al Inicio
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
