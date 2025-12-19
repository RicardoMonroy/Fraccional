// Database types for Fraccional
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          email: string
          nombre: string | null
          telefono: string | null
          activo: boolean
          creado_en: string
          actualizado_en: string
        }
        Insert: {
          id?: string
          email: string
          nombre?: string | null
          telefono?: string | null
          activo?: boolean
          creado_en?: string
          actualizado_en?: string
        }
        Update: {
          id?: string
          email?: string
          nombre?: string | null
          telefono?: string | null
          activo?: boolean
          creado_en?: string
          actualizado_en?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          id: number
          nombre: string
          descripcion: string | null
          nivel_permisos: number
          activo: boolean
          creado_en: string
          actualizado_en: string
        }
        Insert: {
          id?: number
          nombre: string
          descripcion?: string | null
          nivel_permisos?: number
          activo?: boolean
          creado_en?: string
          actualizado_en?: string
        }
        Update: {
          id?: number
          nombre?: string
          descripcion?: string | null
          nivel_permisos?: number
          activo?: boolean
          creado_en?: string
          actualizado_en?: string
        }
        Relationships: []
      }
      usuarios_roles_fraccionamiento: {
        Row: {
          id: string
          usuario_id: string
          fraccionamiento_id: string | null
          rol_id: number
          es_principal: boolean
          acceso_habilitado: boolean
          fecha_asignacion: string
          creado_en: string
        }
        Insert: {
          id?: string
          usuario_id: string
          fraccionamiento_id?: string | null
          rol_id: number
          es_principal?: boolean
          acceso_habilitado?: boolean
          fecha_asignacion?: string
          creado_en?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          fraccionamiento_id?: string | null
          rol_id?: number
          es_principal?: boolean
          acceso_habilitado?: boolean
          fecha_asignacion?: string
          creado_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_roles_fraccionamiento_fraccionamiento_id_fkey"
            columns: ["fraccionamiento_id"]
            isOneToOne: false
            referencedRelation: "fraccionamientos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_roles_fraccionamiento_rol_id_fkey"
            columns: ["rol_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_roles_fraccionamiento_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      fraccionamientos: {
        Row: {
          id: string
          nombre: string
          direccion: string | null
          ciudad: string | null
          estado: string | null
          codigo_postal: string | null
          telefono: string | null
          email: string | null
          logo_url: string | null
          configuracion: Json | null
          estado_servicio: string
          fecha_suspension: string | null
          activo: boolean
          creado_en: string
          actualizado_en: string
        }
        Insert: {
          id?: string
          nombre: string
          direccion?: string | null
          ciudad?: string | null
          estado?: string | null
          codigo_postal?: string | null
          telefono?: string | null
          email?: string | null
          logo_url?: string | null
          configuracion?: Json | null
          estado_servicio?: string
          fecha_suspension?: string | null
          activo?: boolean
          creado_en?: string
          actualizado_en?: string
        }
        Update: {
          id?: string
          nombre?: string
          direccion?: string | null
          ciudad?: string | null
          estado?: string | null
          codigo_postal?: string | null
          telefono?: string | null
          email?: string | null
          logo_url?: string | null
          configuracion?: Json | null
          estado_servicio?: string
          fecha_suspension?: string | null
          activo?: boolean
          creado_en?: string
          actualizado_en?: string
        }
        Relationships: []
      }
      paquetes: {
        Row: {
          id: number
          nombre: string
          descripcion: string | null
          precio_mensual: number
          max_casas: number
          caracteristicas: Json | null
          activo: boolean
          creado_en: string
          actualizado_en: string
        }
        Insert: {
          id?: number
          nombre: string
          descripcion?: string | null
          precio_mensual: number
          max_casas: number
          caracteristicas?: Json | null
          activo?: boolean
          creado_en?: string
          actualizado_en?: string
        }
        Update: {
          id?: number
          nombre?: string
          descripcion?: string | null
          precio_mensual?: number
          max_casas?: number
          caracteristicas?: Json | null
          activo?: boolean
          creado_en?: string
          actualizado_en?: string
        }
        Relationships: []
      }
      casas: {
        Row: {
          id: string
          fraccionamiento_id: string
          numero_casa: string
          direccion_especifica: string | null
          metraje: number | null
          habitaciones: number
          banos: number
          cochera: boolean
          caracteristicas: Json | null
          activo: boolean
          creado_en: string
          actualizado_en: string
        }
        Insert: {
          id?: string
          fraccionamiento_id: string
          numero_casa: string
          direccion_especifica?: string | null
          metraje?: number | null
          habitaciones?: number
          banos?: number
          cochera?: boolean
          caracteristicas?: Json | null
          activo?: boolean
          creado_en?: string
          actualizado_en?: string
        }
        Update: {
          id?: string
          fraccionamiento_id?: string
          numero_casa?: string
          direccion_especifica?: string | null
          metraje?: number | null
          habitaciones?: number
          banos?: number
          cochera?: boolean
          caracteristicas?: Json | null
          activo?: boolean
          creado_en?: string
          actualizado_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "casas_fraccionamiento_id_fkey"
            columns: ["fraccionamiento_id"]
            isOneToOne: false
            referencedRelation: "fraccionamientos"
            referencedColumns: ["id"]
          }
        ]
      }
      // Add other tables as needed...
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}