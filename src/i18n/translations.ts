export const translations = {
  en: {
    login: { title: "Welcome", subtitle: "Access your property information", email: "Email", password: "Password", submit: "Sign In", error: "Invalid credentials" },
    nav: { myProperty: "My Property", services: "Services", emergency: "Emergency", contacts: "Contacts", neighborhood: "Neighborhood", documents: "Documents", closing: "Closing Summary", logout: "Sign Out", install: "Install App", admin: "Admin Panel" },
    property: { title: "My Property", beds: "Bedrooms", baths: "Bathrooms", sqft: "Sq Ft", type: "Type", fideicomiso: "Deed", bank: "Bank", number: "Deed Number", closingDate: "Closing Date", notes: "Notes", downloadDocs: "Download Documents" },
    closing: { title: "Closing Summary", subtitle: "Key points from your deed, always at hand", address: "Property Address", type: "Property Type", trustInstitution: "Trust (Fideicomiso) Institution", trustNumber: "Trust Number", closingDate: "Closing Date", notarialNotes: "Notarial Notes", print: "Print Summary", disclaimer: "This is an executive summary for your reference. It does not replace the public deed (escritura pública), which is the legally binding document. Please consult your attorney or notary for legal matters.", empty: "Your Closing Summary will appear here once your closing data is loaded." },
    services: { title: "Services", account: "Account #", phone: "Phone", payOnline: "Pay Online", frequency: "Payment", notes: "Notes" },
    emergency: { title: "Emergency", call911: "Call 911", subtitle: "Tap to call emergency services" },
    contacts: { title: "Important Contacts", call: "Call", email: "Email", directions: "Directions" },
    zone: { title: "Neighborhood", distance: "Distance", navigate: "Navigate", recommended: "Recommended by Sergio" },
    documents: { title: "Documents", download: "Download", preview: "Preview", categories: { Legal: "Legal", Tax: "Tax", Utility: "Utility", Insurance: "Insurance", Other: "Other" } },
    footer: { powered: "Powered by", made: "Hecho por Colmena 2026" },
    common: { loading: "Loading...", noData: "No information available yet", back: "Back" }
  },
  es: {
    login: { title: "Bienvenido", subtitle: "Accede a la información de tu propiedad", email: "Correo", password: "Contraseña", submit: "Iniciar Sesión", error: "Credenciales inválidas" },
    nav: { myProperty: "Mi Propiedad", services: "Servicios", emergency: "Emergencias", contacts: "Contactos", neighborhood: "Zona", documents: "Documentos", closing: "Resumen del Cierre", logout: "Cerrar Sesión", install: "Instalar App", admin: "Panel Admin" },
    property: { title: "Mi Propiedad", beds: "Recámaras", baths: "Baños", sqft: "m²", type: "Tipo", fideicomiso: "Escritura", bank: "Banco", number: "Número de Escritura", closingDate: "Fecha de Cierre", notes: "Notas", downloadDocs: "Descargar Documentos" },
    closing: { title: "Resumen del Cierre", subtitle: "Puntos clave de tu escritura, siempre a la mano", address: "Dirección del Inmueble", type: "Tipo de Propiedad", trustInstitution: "Institución del Fideicomiso", trustNumber: "Número de Fideicomiso", closingDate: "Fecha de Cierre", notarialNotes: "Notas Notariales", print: "Imprimir Resumen", disclaimer: "Este es un resumen ejecutivo para tu referencia. No sustituye a la escritura pública, que es el documento jurídicamente vinculante. Consulta a tu abogado o notario para asuntos legales.", empty: "Tu Resumen del Cierre aparecerá aquí una vez que se carguen los datos del cierre." },
    services: { title: "Servicios", account: "# Cuenta", phone: "Teléfono", payOnline: "Pagar en Línea", frequency: "Pago", notes: "Notas" },
    emergency: { title: "Emergencias", call911: "Llamar 911", subtitle: "Toca para llamar a servicios de emergencia" },
    contacts: { title: "Contactos Importantes", call: "Llamar", email: "Correo", directions: "Cómo llegar" },
    zone: { title: "Zona", distance: "Distancia", navigate: "Navegar", recommended: "Recomendado por Sergio" },
    documents: { title: "Documentos", download: "Descargar", preview: "Vista previa", categories: { Legal: "Legal", Tax: "Fiscal", Utility: "Servicios", Insurance: "Seguros", Other: "Otros" } },
    footer: { powered: "Con tecnología de", made: "Hecho por Colmena 2026" },
    common: { loading: "Cargando...", noData: "Sin información disponible aún", back: "Atrás" }
  }
} as const;

export type Lang = keyof typeof translations;
export type TranslationKeys = typeof translations.en;
