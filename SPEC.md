# SPEC: CHEAT-SHEET
## Property Owner's Digital Concierge

### CONCEPTO
Cuando un broker cierra una venta de propiedad, en vez de entregar una carpeta laminada con papeles que se pierden en un cajón, entrega un link: la landing page personalizada del comprador con TODO lo que necesita saber sobre su propiedad. Siempre actualizada. Siempre en su celular.

**Objetivo:** Hacer al broker Sergio un héroe ante sus compradores gringos y diferenciarlo de cualquier otro broker en Puerto Vallarta.

### NOMBRE
`cheat-sheet`

### STACK
- **Frontend:** Next.js + TypeScript + Tailwind
- **Backend/DB:** Supabase (Auth + PostgreSQL + Storage)
- **Deploy:** Vercel
- **Idioma:** Bilingüe EN/ES con toggle (English default)
- **PWA:** Sí (instalable, offline básico)

### BRANDING
- Logo de Sergio (se proporcionará)
- Estética: luxury/refined — el comprador acaba de invertir en propiedad en PV, la experiencia digital debe reflejar eso
- Tipografía elegante, colores sobrios, sensación premium
- Footer: "Powered by [Sergio's Brand]"

### ROLES / AUTH
| Rol | Acceso |
|-----|--------|
| **Admin (Sergio)** | CRUD propiedades, CRUD compradores, editar toda la info |
| **Owner (Comprador)** | Ver solo SU propiedad, descargar documentos |

- Auth via Supabase (email/password)
- Sergio crea cuenta del comprador y le comparte credenciales
- Opción futura: magic link (sin password)

### MODELO DE DATOS

#### Tabla: `properties`
```
id              UUID PK
name            TEXT         -- "Villa Azul Unit 302"
address         TEXT         -- "Calle Las Garzas 142, Zona Romántica"
type            TEXT         -- "Condo" | "House" | "Lot"
bedrooms        INT
bathrooms       INT
sqft            INT
photo_url       TEXT         -- Hero image
fideicomiso     TEXT         -- Nombre del fideicomiso
fideicomiso_bank TEXT        -- Banco del fideicomiso
fideicomiso_number TEXT      -- Número del fideicomiso
closing_date    DATE         -- Fecha de cierre
notes           TEXT         -- Notas generales
created_at      TIMESTAMP
```

#### Tabla: `owners`
```
id              UUID PK
user_id         UUID FK → auth.users
property_id     UUID FK → properties
name            TEXT
email           TEXT
phone           TEXT
created_at      TIMESTAMP
```

#### Tabla: `services`
```
id              UUID PK
property_id     UUID FK → properties
type            TEXT         -- "CFE" | "Telmex" | "Water" | "Predial" | "Internet" | "Gas" | "HOA" | "Insurance"
provider        TEXT         -- "CFE Zona Vallarta"
account_number  TEXT         -- Número de cuenta/servicio
phone           TEXT         -- Teléfono de atención
website         TEXT         -- URL para pagar online
payment_freq    TEXT         -- "Monthly" | "Bimonthly" | "Annual"
notes           TEXT         -- "Predial se paga en enero con 15% descuento"
created_at      TIMESTAMP
```

#### Tabla: `documents`
```
id              UUID PK
property_id     UUID FK → properties
name            TEXT         -- "Escritura" | "Predial 2026" | "Fideicomiso"
category        TEXT         -- "Legal" | "Tax" | "Utility" | "Insurance" | "Other"
file_url        TEXT         -- Supabase Storage URL
uploaded_at     TIMESTAMP
```

#### Tabla: `contacts`
```
id              UUID PK
property_id     UUID FK → properties  (NULL = global/zona)
category        TEXT         -- "Emergency" | "Medical" | "Legal" | "Maintenance" | "Government"
name            TEXT         -- "Dr. Roberto Méndez"
specialty       TEXT         -- "General / English-speaking"
phone           TEXT
phone2          TEXT         -- Segundo teléfono (opcional)
email           TEXT
address         TEXT
website         TEXT
notes           TEXT         -- "24/7 emergency line"
is_global       BOOLEAN      -- true = aplica a todas las propiedades (hospitales, bomberos, etc.)
created_at      TIMESTAMP
```

#### Tabla: `zone_info`
```
id              UUID PK
property_id     UUID FK → properties  (NULL = global)
category        TEXT         -- "Beach" | "Restaurant" | "Hotel" | "Supermarket" | "Bank" | "Transport" | "Activity"
name            TEXT
description     TEXT
address         TEXT
latitude        DECIMAL
longitude       DECIMAL
phone           TEXT
website         TEXT
distance        TEXT         -- "5 min walk" | "10 min drive"
is_global       BOOLEAN
created_at      TIMESTAMP
```

### PANTALLAS

---

#### 1. LOGIN
- Email + password
- Logo de Sergio
- Toggle EN/ES
- Fondo con imagen sutil de PV (palmeras, playa, sunset)
- Clean, premium feel

---

#### 2. OWNER DASHBOARD (lo que ve el comprador)

**Header:**
- Hero image de la propiedad
- Nombre de la propiedad grande
- Dirección
- Toggle EN/ES

**Secciones (scrollable, tipo one-page luxury):**

**A) 🏠 MY PROPERTY / MI PROPIEDAD**
- Foto principal
- Datos básicos (beds, baths, sqft, type)
- Fideicomiso info (banco, número)
- Fecha de cierre
- Notas del broker
- Botón: "Download Documents" → lista de PDFs descargables

**B) ⚡ SERVICES / SERVICIOS**
- Cards por servicio (CFE, Telmex, Agua, Predial, Internet, Gas, HOA, Seguro)
- Cada card muestra: proveedor, número de cuenta, teléfono, link para pagar
- Icono por tipo de servicio
- Notas útiles (ej: "Predial — 15% discount if paid in January")

**C) 🚨 EMERGENCY / EMERGENCIAS**
- Botón rojo grande: "Call 911"
- Cards: Hospital más cercano, Doctor de cabecera (English-speaking), Abogado, Bomberos, Cruz Roja, Policía turística, Consulado USA/CAN
- Cada card: nombre, teléfono (clickable), dirección, notas
- Mapa embebido con ubicaciones

**D) 📋 IMPORTANT CONTACTS / CONTACTOS**
- Plomero, Electricista, Cerrajero, Property Manager, HOA contact
- Organizados por categoría
- Click-to-call en móvil

**E) 🗺️ NEIGHBORHOOD / ZONA**
- Categorías: Playas, Restaurantes, Hoteles, Supermercados, Bancos, Transporte
- Cards con nombre, distancia, mapa
- Curadas por Sergio (no es Google Maps genérico — son SUS recomendaciones)

**F) 📄 DOCUMENTS / DOCUMENTOS**
- Lista de documentos subidos por Sergio
- Categorías: Legal, Fiscal, Servicios, Seguros
- Descarga directa
- Preview inline si es PDF/imagen

---

#### 3. ADMIN PANEL (lo que ve Sergio)

**Dashboard:**
- Lista de propiedades
- Buscar por nombre/comprador
- Botón "+" para agregar propiedad

**Editar propiedad:**
- Tabs: Property Info | Services | Contacts | Zone | Documents | Owner
- Forms CRUD para cada sección
- Upload de documentos (drag & drop)
- Toggle "Global" para contactos/zona que aplican a todas las propiedades
- Preview: "Ver como comprador" button

**Gestión de usuarios:**
- Crear cuenta de comprador (email + password temporal)
- Asignar a propiedad
- Revocar acceso

---

### FEATURES CLAVE

1. **Click-to-call** — Todos los teléfonos son links `tel:` clickeables
2. **Click-to-navigate** — Direcciones abren Google Maps/Waze
3. **Bilingual toggle** — EN/ES sin reload (i18n con JSON)
4. **Document vault** — PDFs seguros en Supabase Storage
5. **PWA** — Instalable como app, funciona offline con datos cacheados
6. **Premium feel** — No debe verse como "app genérica". Debe verse como servicio exclusivo
7. **Global vs Per-Property** — Contactos de emergencia y zona se configuran una vez y aplican a todas las propiedades. Sergio no repite datos.

### UX PRIORITIES
1. El comprador abre → ve su propiedad → encuentra lo que necesita en <10 segundos
2. Sergio configura una propiedad nueva en <15 minutos
3. Mobile-first (el comprador lo ve en su iPhone 90% del tiempo)
4. Todo clickeable (teléfonos, direcciones, links de pago)

### WHAT SUCCESS LOOKS LIKE
- Comprador gringo llega a PV, necesita pagar CFE → abre cheat-sheet → encuentra número de cuenta y link de pago en 3 taps
- Se descompone algo → Emergency → plomero recomendado por Sergio → click-to-call
- Quiere ir a cenar → Zone → restaurantes recomendados → click-to-navigate
- Necesita copia de escritura → Documents → download
- Todo sin llamar a Sergio. Sergio duerme tranquilo. El comprador se siente atendido.

### DIFICULTAD ESTIMADA
- **5/10** — Auth + CRUD + Storage + i18n. No es trivial pero el modelo de datos es directo.

### DATOS INICIALES (para demo)
Sergio puede proporcionar datos reales de una propiedad cerrada recientemente para poblar la demo.

### ENV VARS NECESARIAS
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### REPO
`github.com/Pvrolomx/cheat-sheet`

### DEPLOY
Vercel — `cheat-sheet.vercel.app`
(Dominio custom futuro: `myplace.mx` o `cheatsheet.sergiobroker.com`)

---

**De: La Colmena 🐝**
**Para: El duende que lo construya**
**Nivel: 5/10**
**Prioridad: Alta — hay negocio real detrás de esto**
