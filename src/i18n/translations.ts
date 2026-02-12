export const translations = {
  en: {
    login: { title: "Welcome", subtitle: "Access your property information", email: "Email", password: "Password", submit: "Sign In", error: "Invalid credentials" },
    nav: { myProperty: "My Property", services: "Services", emergency: "Emergency", contacts: "Contacts", neighborhood: "Neighborhood", documents: "Documents", logout: "Sign Out", install: "Install App", admin: "Admin Panel" },
    property: { title: "My Property", beds: "Bedrooms", baths: "Bathrooms", sqft: "Sq Ft", type: "Type", fideicomiso: "Fideicomiso", bank: "Bank", number: "Number", closingDate: "Closing Date", notes: "Notes", downloadDocs: "Download Documents" },
    services: { title: "Services", account: "Account #", phone: "Phone", payOnline: "Pay Online", frequency: "Payment", notes: "Notes" },
    emergency: { title: "Emergency", call911: "Call 911", subtitle: "Tap to call emergency services" },
    contacts: { title: "Important Contacts", call: "Call", email: "Email", directions: "Directions" },
    zone: { title: "Neighborhood", distance: "Distance", navigate: "Navigate", recommended: "Recommended by Sergio" },
    documents: { title: "Documents", download: "Download", preview: "Preview", categories: { Legal: "Legal", Tax: "Tax", Utility: "Utility", Insurance: "Insurance", Other: "Other" } },
    footer: { powered: "Powered by", made: "Hecho por duendes.app 2026" },
    common: { loading: "Loading...", noData: "No information available yet", back: "Back" }
  },
  es: {
    login: { title: "Bienvenido", subtitle: "Accede a la información de tu propiedad", email: "Correo", password: "Contraseña", submit: "Iniciar Sesión", error: "Credenciales inválidas" },
    nav: { myProperty: "Mi Propiedad", services: "Servicios", emergency: "Emergencias", contacts: "Contactos", neighborhood: "Zona", documents: "Documentos", logout: "Cerrar Sesión", install: "Instalar App", admin: "Panel Admin" },
    property: { title: "Mi Propiedad", beds: "Recámaras", baths: "Baños", sqft: "m²", type: "Tipo", fideicomiso: "Fideicomiso", bank: "Banco", number: "Número", closingDate: "Fecha de Cierre", notes: "Notas", downloadDocs: "Descargar Documentos" },
    services: { title: "Servicios", account: "# Cuenta", phone: "Teléfono", payOnline: "Pagar en Línea", frequency: "Pago", notes: "Notas" },
    emergency: { title: "Emergencias", call911: "Llamar 911", subtitle: "Toca para llamar a servicios de emergencia" },
    contacts: { title: "Contactos Importantes", call: "Llamar", email: "Correo", directions: "Cómo llegar" },
    zone: { title: "Zona", distance: "Distancia", navigate: "Navegar", recommended: "Recomendado por Sergio" },
    documents: { title: "Documentos", download: "Descargar", preview: "Vista previa", categories: { Legal: "Legal", Tax: "Fiscal", Utility: "Servicios", Insurance: "Seguros", Other: "Otros" } },
    footer: { powered: "Con tecnología de", made: "Hecho por duendes.app 2026" },
    common: { loading: "Cargando...", noData: "Sin información disponible aún", back: "Atrás" }
  }
} as const;

export type Lang = keyof typeof translations;
export type TranslationKeys = typeof translations.en;
