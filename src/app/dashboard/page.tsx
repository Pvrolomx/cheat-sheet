"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useLang } from "@/lib/LangContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Property, Service, Contact, ZoneInfo, Document } from "@/lib/types";
import { serviceIcons, contactCategoryIcons, zoneCategoryIcons, docCategoryIcons } from "@/lib/icons";

export default function DashboardPage() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const { t, lang, setLang } = useLang();
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [zones, setZones] = useState<ZoneInfo[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/");
    if (!loading && isAdmin) router.push("/admin");
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Get owner record to find property
      const { data: owner } = await supabase
        .from("cs_owners")
        .select("property_id")
        .eq("user_id", user.id)
        .single();

      if (!owner) { setDataLoading(false); return; }
      const pid = owner.property_id;

      const [propRes, svcRes, contRes, zoneRes, docRes] = await Promise.all([
        supabase.from("cs_properties").select("*").eq("id", pid).single(),
        supabase.from("cs_services").select("*").eq("property_id", pid).order("type"),
        supabase.from("cs_contacts").select("*").or(`property_id.eq.${pid},is_global.eq.true`).order("category"),
        supabase.from("cs_zone_info").select("*").or(`property_id.eq.${pid},is_global.eq.true`).order("category"),
        supabase.from("cs_documents").select("*").eq("property_id", pid).order("category"),
      ]);

      setProperty(propRes.data);
      setServices(svcRes.data || []);
      setContacts(contRes.data || []);
      setZones(zoneRes.data || []);
      setDocuments(docRes.data || []);
      setDataLoading(false);
    };
    load();
  }, [user]);

  if (loading || dataLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream">
      <div className="animate-pulse text-brand-navy text-lg">{t.common.loading}</div>
    </div>
  );

  if (!property) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream">
      <p className="text-brand-dark">{t.common.noData}</p>
    </div>
  );

  const emergencyContacts = contacts.filter(c => c.category === "Emergency" || c.category === "Medical");
  const otherContacts = contacts.filter(c => c.category !== "Emergency" && c.category !== "Medical");
  const groupedZones = zones.reduce((acc, z) => {
    (acc[z.category] = acc[z.category] || []).push(z);
    return acc;
  }, {} as Record<string, ZoneInfo[]>);
  const groupedDocs = documents.reduce((acc, d) => {
    (acc[d.category] = acc[d.category] || []).push(d);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${property.photo_url || "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1920&q=80"})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/40 to-transparent" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4">
          <img src="/logo-sergio.png" alt="Logo" className="h-10 w-auto" />
          <div className="flex items-center gap-2">
            {installPrompt && (
              <button onClick={() => installPrompt.prompt()} className="text-white/80 hover:text-white text-xs bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                📱 {t.nav.install}
              </button>
            )}
            <button onClick={() => setLang(lang === "en" ? "es" : "en")} className="text-white/80 hover:text-white text-xs bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
              {lang === "en" ? "🇲🇽 ES" : "🇺🇸 EN"}
            </button>
            <button onClick={signOut} className="text-white/80 hover:text-white text-xs bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
              {t.nav.logout}
            </button>
          </div>
        </div>

        {/* Property info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-1">{property.name}</h1>
          <p className="text-white/80 text-sm">{property.address}</p>
        </div>
      </div>

      {/* Quick nav */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto py-2 text-xs font-medium">
          {[
            { href: "#property", label: `🏠 ${t.nav.myProperty}` },
            { href: "#services", label: `⚡ ${t.nav.services}` },
            { href: "#emergency", label: `🚨 ${t.nav.emergency}` },
            { href: "#contacts", label: `📋 ${t.nav.contacts}` },
            { href: "#neighborhood", label: `🗺️ ${t.nav.neighborhood}` },
            { href: "#documents", label: `📄 ${t.nav.documents}` },
          ].map(n => (
            <a key={n.href} href={n.href} className="whitespace-nowrap px-3 py-1.5 rounded-full bg-brand-navy/5 hover:bg-brand-navy/10 text-brand-navy transition-all">
              {n.label}
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">

        {/* SECTION: MY PROPERTY */}
        <section id="property">
          <h2 className="section-title">🏠 {t.property.title}</h2>
          <div className="card-premium">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Stat label={t.property.beds} value={property.bedrooms} />
              <Stat label={t.property.baths} value={property.bathrooms} />
              <Stat label={t.property.sqft} value={property.sqft?.toLocaleString()} />
              <Stat label={t.property.type} value={property.type} />
            </div>
            {property.fideicomiso && (
              <div className="bg-brand-navy/5 rounded-lg p-4 mb-4">
                <p className="text-xs text-brand-dark uppercase tracking-wider mb-2">{t.property.fideicomiso}</p>
                <p className="text-sm text-brand-navy font-medium">{property.fideicomiso}</p>
                {property.fideicomiso_bank && <p className="text-xs text-brand-dark mt-1">{t.property.bank}: {property.fideicomiso_bank}</p>}
                {property.fideicomiso_number && <p className="text-xs text-brand-dark">{t.property.number}: {property.fideicomiso_number}</p>}
              </div>
            )}
            {property.closing_date && (
              <p className="text-sm text-brand-dark">{t.property.closingDate}: <span className="font-medium text-brand-navy">{new Date(property.closing_date).toLocaleDateString()}</span></p>
            )}
            {property.notes && <p className="text-sm text-brand-dark mt-2 italic">{property.notes}</p>}
          </div>
        </section>

        {/* SECTION: SERVICES */}
        <section id="services">
          <h2 className="section-title">⚡ {t.services.title}</h2>
          {services.length === 0 ? <p className="text-brand-dark text-sm">{t.common.noData}</p> : (
            <div className="grid md:grid-cols-2 gap-4">
              {services.map(s => (
                <div key={s.id} className="card-premium">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{serviceIcons[s.type] || "📌"}</span>
                    <div>
                      <h3 className="font-semibold text-brand-navy">{s.type}</h3>
                      <p className="text-xs text-brand-dark">{s.provider}</p>
                    </div>
                  </div>
                  {s.account_number && <p className="text-sm"><span className="text-brand-dark">{t.services.account}:</span> <span className="font-mono font-medium text-brand-navy">{s.account_number}</span></p>}
                  {s.phone && <p className="text-sm"><span className="text-brand-dark">{t.services.phone}:</span> <a href={`tel:${s.phone}`} className="text-brand-red font-medium hover:underline">{s.phone}</a></p>}
                  {s.payment_freq && <p className="text-sm text-brand-dark">{t.services.frequency}: {s.payment_freq}</p>}
                  {s.website && <a href={s.website} target="_blank" rel="noopener" className="inline-block mt-2 text-sm bg-brand-navy text-white px-4 py-1.5 rounded-lg hover:bg-opacity-90 transition-all">{t.services.payOnline} →</a>}
                  {s.notes && <p className="text-xs text-brand-dark mt-2 italic border-t pt-2">{s.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION: EMERGENCY */}
        <section id="emergency">
          <h2 className="section-title">🚨 {t.emergency.title}</h2>
          <a href="tel:911" className="block w-full bg-brand-red text-white text-center py-5 rounded-xl text-xl font-bold shadow-lg hover:bg-red-600 transition-all mb-6">
            📞 {t.emergency.call911}
            <span className="block text-sm font-normal opacity-80 mt-1">{t.emergency.subtitle}</span>
          </a>
          {emergencyContacts.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              {emergencyContacts.map(c => (
                <ContactCard key={c.id} contact={c} t={t} />
              ))}
            </div>
          )}
        </section>

        {/* SECTION: CONTACTS */}
        <section id="contacts">
          <h2 className="section-title">📋 {t.contacts.title}</h2>
          {otherContacts.length === 0 ? <p className="text-brand-dark text-sm">{t.common.noData}</p> : (
            <div className="grid md:grid-cols-2 gap-4">
              {otherContacts.map(c => (
                <ContactCard key={c.id} contact={c} t={t} />
              ))}
            </div>
          )}
        </section>

        {/* SECTION: NEIGHBORHOOD */}
        <section id="neighborhood">
          <h2 className="section-title">🗺️ {t.zone.title}</h2>
          {Object.keys(groupedZones).length === 0 ? <p className="text-brand-dark text-sm">{t.common.noData}</p> : (
            <div className="space-y-6">
              {Object.entries(groupedZones).map(([cat, items]) => (
                <div key={cat}>
                  <h3 className="text-lg font-semibold text-brand-navy mb-3">{zoneCategoryIcons[cat] || "📍"} {cat}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {items.map(z => (
                      <div key={z.id} className="card-premium">
                        <h4 className="font-semibold text-brand-navy">{z.name}</h4>
                        {z.description && <p className="text-sm text-brand-dark mt-1">{z.description}</p>}
                        {z.distance && <p className="text-xs text-brand-dark mt-1">📍 {z.distance}</p>}
                        <div className="flex gap-2 mt-3">
                          {z.phone && <a href={`tel:${z.phone}`} className="text-xs bg-brand-navy/10 text-brand-navy px-3 py-1 rounded-full">📞 {t.contacts.call}</a>}
                          {z.address && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(z.address)}`} target="_blank" rel="noopener" className="text-xs bg-brand-navy/10 text-brand-navy px-3 py-1 rounded-full">🗺️ {t.zone.navigate}</a>}
                          {z.website && <a href={z.website} target="_blank" rel="noopener" className="text-xs bg-brand-navy/10 text-brand-navy px-3 py-1 rounded-full">🌐 Web</a>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION: DOCUMENTS */}
        <section id="documents">
          <h2 className="section-title">📄 {t.documents.title}</h2>
          {Object.keys(groupedDocs).length === 0 ? <p className="text-brand-dark text-sm">{t.common.noData}</p> : (
            <div className="space-y-4">
              {Object.entries(groupedDocs).map(([cat, docs]) => (
                <div key={cat}>
                  <h3 className="text-md font-semibold text-brand-navy mb-2">{docCategoryIcons[cat] || "📄"} {(t.documents.categories as any)[cat] || cat}</h3>
                  <div className="space-y-2">
                    {docs.map(d => (
                      <div key={d.id} className="card-premium flex items-center justify-between">
                        <span className="text-sm font-medium text-brand-navy">{d.name}</span>
                        <a href={d.file_url} target="_blank" rel="noopener" download className="text-xs bg-brand-navy text-white px-4 py-1.5 rounded-lg hover:bg-opacity-90 transition-all">
                          {t.documents.download} ↓
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-brand-navy text-white/60 text-center py-6 mt-12">
        <img src="/logo-sergio.png" alt="Logo" className="h-8 w-auto mx-auto mb-2 opacity-60" />
        <p className="text-xs">Hecho por duendes.app 2026</p>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className="text-center p-3 bg-brand-navy/5 rounded-lg">
      <p className="text-2xl font-serif font-bold text-brand-navy">{value || "—"}</p>
      <p className="text-xs text-brand-dark mt-1">{label}</p>
    </div>
  );
}

function ContactCard({ contact, t }: { contact: Contact; t: any }) {
  return (
    <div className="card-premium">
      <div className="flex items-start gap-3">
        <span className="text-xl">{contactCategoryIcons[contact.category] || "📌"}</span>
        <div className="flex-1">
          <h4 className="font-semibold text-brand-navy">{contact.name}</h4>
          {contact.specialty && <p className="text-xs text-brand-dark">{contact.specialty}</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            <a href={`tel:${contact.phone}`} className="text-xs bg-brand-red/10 text-brand-red px-3 py-1 rounded-full font-medium">📞 {contact.phone}</a>
            {contact.phone2 && <a href={`tel:${contact.phone2}`} className="text-xs bg-brand-red/10 text-brand-red px-3 py-1 rounded-full font-medium">📞 {contact.phone2}</a>}
            {contact.email && <a href={`mailto:${contact.email}`} className="text-xs bg-brand-navy/10 text-brand-navy px-3 py-1 rounded-full">✉️ {t.contacts.email}</a>}
            {contact.address && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`} target="_blank" rel="noopener" className="text-xs bg-brand-navy/10 text-brand-navy px-3 py-1 rounded-full">🗺️ {t.contacts.directions}</a>}
          </div>
          {contact.notes && <p className="text-xs text-brand-dark mt-2 italic">{contact.notes}</p>}
        </div>
      </div>
    </div>
  );
}
