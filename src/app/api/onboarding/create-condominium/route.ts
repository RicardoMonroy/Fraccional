// API route to create condominium during onboarding
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      nombre, 
      direccion, 
      ciudad, 
      estado, 
      codigoPostal, 
      telefono, 
      email, 
      numeroCasas, 
      paqueteId 
    } = body

    console.log('Onboarding request received:', {
      nombre,
      ciudad,
      estado,
      numeroCasas,
      paqueteId
    })

    // Validate required fields
    if (!nombre || !direccion || !ciudad || !estado || !numeroCasas || !paqueteId) {
      console.error('Missing required fields:', { nombre, direccion, ciudad, estado, numeroCasas, paqueteId })
      return NextResponse.json(
        { error: 'Campos requeridos faltantes' },
        { status: 400 }
      )
    }

    // Get the current user from auth with better error handling
    console.log('Getting current user...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      return NextResponse.json(
        { error: 'Error de sesión' },
        { status: 401 }
      )
    }

    if (!session?.user) {
      console.error('No user in session')
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    const user = session.user
    console.log('Authenticated user:', user.id, user.email)

    // Check if user already has a fraccionamiento
    const { data: existingRoles } = await supabase
      .from('usuarios_roles_fraccionamiento')
      .select('fraccionamiento_id')
      .eq('usuario_id', user.id)
      .not('fraccionamiento_id', 'is', null)

    if (existingRoles && existingRoles.length > 0) {
      console.log('User already has fraccionamiento assigned')
      return NextResponse.json(
        { error: 'Usuario ya tiene un condominio asignado' },
        { status: 400 }
      )
    }

    // Start transaction-like operations
    // 1. Create the fraccionamiento
    console.log('Creating fraccionamiento...')
    const { data: fraccionamiento, error: fraccionamientoError } = await supabase
      .from('fraccionamientos')
      .insert({
        nombre,
        direccion,
        ciudad,
        estado,
        codigo_postal: codigoPostal,
        telefono,
        email,
        estado_servicio: 'ACTIVO',
        activo: true
      })
      .select()
      .single()

    if (fraccionamientoError) {
      console.error('Error creating fraccionamiento:', fraccionamientoError)
      return NextResponse.json(
        { error: 'Error al crear el condominio', details: fraccionamientoError.message },
        { status: 500 }
      )
    }

    console.log('Fraccionamiento created:', fraccionamiento.id)

    // 2. Create houses automatically
    const casas = []
    for (let i = 1; i <= numeroCasas; i++) {
      casas.push({
        fraccionamiento_id: fraccionamiento.id,
        numero_casa: i.toString(),
        activo: true
      })
    }

    console.log('Creating houses...')
    const { error: casasError } = await supabase
      .from('casas')
      .insert(casas)

    if (casasError) {
      console.error('Error creating casas:', casasError)
      // Rollback fraccionamiento creation
      await supabase.from('fraccionamientos').delete().eq('id', fraccionamiento.id)
      return NextResponse.json(
        { error: 'Error al crear las casas', details: casasError.message },
        { status: 500 }
      )
    }

    console.log('Houses created successfully')

    // 3. Create subscription
    console.log('Creating subscription...')
    const { data: suscripcion, error: suscripcionError } = await supabase
      .from('condominios_suscripciones')
      .insert({
        fraccionamiento_id: fraccionamiento.id,
        paquete_id: paqueteId,
        fecha_inicio: new Date().toISOString().split('T')[0],
        estado: 'ACTIVA'
      })
      .select()
      .single()

    if (suscripcionError) {
      console.error('Error creating suscripcion:', suscripcionError)
      // Rollback previous operations
      await supabase.from('casas').delete().eq('fraccionamiento_id', fraccionamiento.id)
      await supabase.from('fraccionamientos').delete().eq('id', fraccionamiento.id)
      return NextResponse.json(
        { error: 'Error al crear la suscripción', details: suscripcionError.message },
        { status: 500 }
      )
    }

    console.log('Subscription created successfully')

    // 4. Update user role to include fraccionamiento-specific ADMIN_CONDOMINIO role
    console.log('Updating user role...')
    const { error: roleError } = await supabase
      .from('usuarios_roles_fraccionamiento')
      .update({
        fraccionamiento_id: fraccionamiento.id,
        es_principal: true
      })
      .eq('usuario_id', user.id)
      .eq('rol_id', 3) // ADMIN_CONDOMINIO role ID

    if (roleError) {
      console.error('Error updating user role:', roleError)
      // This is not critical, so we don't rollback
      console.log('Continuing despite role update error')
    }

    console.log('User role updated successfully')

    // 5. Also ensure the user exists in the usuarios table
    console.log('Checking user in usuarios table...')
    const { error: userCheckError } = await supabase
      .from('usuarios')
      .upsert({
        id: user.id,
        email: user.email,
        nombre: user.user_metadata?.nombre || '',
        activo: true
      })

    if (userCheckError) {
      console.error('Error ensuring user in usuarios table:', userCheckError)
      // Not critical, continue
    }

    console.log('Onboarding completed successfully')

    return NextResponse.json({
      success: true,
      fraccionamiento: fraccionamiento,
      suscripcion: suscripcion,
      message: 'Condominio creado exitosamente'
    })

  } catch (error) {
    console.error('Error in create-condominium:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}