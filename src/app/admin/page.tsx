"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useLang } from "@/lib/LangContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Property, Service, Contact, ZoneInfo, Document as DocType } from "@/lib/types";
import { serviceIcons, contactCategoryIcons, zoneCategoryIcons } from "@/lib/icons";

type Tab = "info" | "services" | "contacts" | "zone" | "documents";

export default function AdminPage() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const { t, lang, setLang } = useLang();
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);
  const [tab, setTab] = useState<Tab>("info");
  const [services, setServices] = useState<Service[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [zones, setZones] = useState<ZoneInfo[]>([]);
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/");
    if (!loading && user && !isAdmin) router.push("/dashboard");
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    supabase.from("cs_properties").select("*").order("name").then(({ data }) => {
      setProperties(data || []);
      setDataLoading(false);
    });
  }, [user, isAdmin]);

  const loadPropertyData = async (p: Property) => {
    setSelectedProp(p);
    setTab("info");
    const [svc, cont, zone, docs, own] = await Promise.all([
      supabase.from("cs_services").select("*").eq("property_id", p.id).order("type"),
      supabase.from("cs_contacts").select("*").or(`property_id.eq.${p.id},is_global.eq.true`).order("category"),
      supabase.from("cs_zone_info").select("*").or(`property_id.eq.${p.id},is_global.eq.true`).order("category"),
      supabase.from("cs_documents").select("*").eq("property_id", p.id).order("category"),
      supabase.from("cs_owners").select("*").eq("property_id", p.id),
    ]);
    setServices(svc.data || []);
    setContacts(cont.data || []);
    setZones(zone.data || []);
    setDocuments(docs.data || []);
    setOwners(own.data || []);
  };

  const saveProperty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProp) return;
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const updates: any = {};
    ["name","address","type","notes","fideicomiso","fideicomiso_bank","fideicomiso_number","photo_url"].forEach(k => {
      updates[k] = form.get(k) || null;
    });
    const { error } = await supabase.from("cs_properties").update(updates).eq("id", selectedProp.id);
    setMsg(error ? `Error: ${error.message}` : "✅ Saved");
    if (!error) setSelectedProp({ ...selectedProp, ...updates });
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  };

  const updateOwner = async (id: string, updates: any) => {
    await supabase.from("cs_owners").update(updates).eq("id", id);
    setOwners(owners.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const deleteOwner = async (id: string) => {
    if (!confirm("Delete this owner? This will remove their access.")) return;
    await supabase.from("cs_owners").delete().eq("id", id);
    setOwners(owners.filter(o => o.id !== id));
  };

  const addProperty = async () => {
    const name = prompt("Property name:");
    if (!name) return;
    const { data, error } = await supabase.from("cs_properties").insert({ name, address: "", type: "Condo", bedrooms: 0, bathrooms: 0, sqft: 0 }).select().single();
    if (data) { setProperties([...properties, data]); loadPropertyData(data); }
    if (error) alert(error.message);
  };

  const deleteProperty = async (id: string) => {
    if (!confirm("Delete this property and all its data? This cannot be undone.")) return;
    await supabase.from("cs_services").delete().eq("property_id", id);
    await supabase.from("cs_contacts").delete().eq("property_id", id);
    await supabase.from("cs_zone_info").delete().eq("property_id", id);
    await supabase.from("cs_documents").delete().eq("property_id", id);
    await supabase.from("cs_owners").delete().eq("property_id", id);
    const { error } = await supabase.from("cs_properties").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    setProperties(properties.filter(p => p.id !== id));
    setSelectedProp(null);
  };

  // Generic CRUD helpers
  const addService = async () => {
    if (!selectedProp) return;
    const { data } = await supabase.from("cs_services").insert({ property_id: selectedProp.id, type: "CFE", provider: "" }).select().single();
    if (data) setServices([...services, data]);
  };

  const updateService = async (id: string, updates: Partial<Service>) => {
    await supabase.from("cs_services").update(updates).eq("id", id);
    setServices(services.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteService = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("cs_services").delete().eq("id", id);
    setServices(services.filter(s => s.id !== id));
  };

  const addContact = async () => {
    if (!selectedProp) return;
    const { data } = await supabase.from("cs_contacts").insert({ property_id: selectedProp.id, category: "Maintenance", name: "", phone: "", is_global: false }).select().single();
    if (data) setContacts([...contacts, data]);
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    await supabase.from("cs_contacts").update(updates).eq("id", id);
    setContacts(contacts.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteContact = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("cs_contacts").delete().eq("id", id);
    setContacts(contacts.filter(c => c.id !== id));
  };

  const addZone = async () => {
    if (!selectedProp) return;
    const { data } = await supabase.from("cs_zone_info").insert({ property_id: selectedProp.id, category: "Restaurant", name: "", is_global: false }).select().single();
    if (data) setZones([...zones, data]);
  };

  const updateZone = async (id: string, updates: Partial<ZoneInfo>) => {
    await supabase.from("cs_zone_info").update(updates).eq("id", id);
    setZones(zones.map(z => z.id === id ? { ...z, ...updates } : z));
  };

  const deleteZone = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("cs_zone_info").delete().eq("id", id);
    setZones(zones.filter(z => z.id !== id));
  };

  const uploadDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedProp || !e.target.files?.length) return;
    const file = e.target.files[0];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) { alert(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 5MB.`); return; }
    const path = `${selectedProp.id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("documents").upload(path, file);
    if (upErr) { alert(upErr.message); return; }
    const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(path);
    const cat = prompt("Category (Legal/Tax/Utility/Insurance/Other):", "Legal") || "Other";
    const { data } = await supabase.from("cs_documents").insert({ property_id: selectedProp.id, name: file.name, category: cat, file_url: publicUrl }).select().single();
    if (data) setDocuments([...documents, data]);
  };

  const deleteDoc = async (id: string) => {
    if (!confirm("Delete document?")) return;
    await supabase.from("cs_documents").delete().eq("id", id);
    setDocuments(documents.filter(d => d.id !== id));
  };

  if (loading || dataLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream">
      <div className="animate-pulse text-brand-navy text-lg">{t.common.loading}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <header className="bg-brand-navy text-white py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/logo_small.png" alt="Expat Advisor MX" className="h-8 w-auto" />
          <h1 className="text-lg font-serif font-bold">Admin Panel</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={signOut} className="text-white/80 hover:text-white text-xs bg-white/10 px-3 py-1.5 rounded-full">{t.nav.logout}</button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {!selectedProp ? (
          /* Property List */
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="section-title">Properties</h2>
              <button onClick={addProperty} className="btn-primary text-sm">+ Add Property</button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map(p => (
                <div key={p.id} className="card-premium text-left hover:border-brand-navy/30 relative">
                  <button onClick={() => loadPropertyData(p)} className="w-full text-left">
                    <h3 className="font-semibold text-brand-navy">{p.name || "Untitled"}</h3>
                    <p className="text-xs text-brand-dark mt-1">{p.address || "No address"}</p>
                    <p className="text-xs text-brand-dark mt-1">{p.type}</p>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deleteProperty(p.id); }} className="absolute top-2 right-2 text-xs text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded">✕</button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Property Editor */
          <div>
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => setSelectedProp(null)} className="text-sm text-brand-dark hover:text-brand-navy inline-block">← Back to properties</button>
              <button onClick={() => deleteProperty(selectedProp.id)} className="text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg">Delete Property</button>
            </div>
            <h2 className="section-title">{selectedProp.name || "Untitled Property"}</h2>

            {msg && <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg mb-4 text-sm">{msg}</div>}

            {/* Tabs */}
            <div className="flex gap-1 mb-6 overflow-x-auto">
              {(["info","services","contacts","zone","documents"] as Tab[]).map(t => (
                <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === t ? "bg-brand-navy text-white" : "bg-white text-brand-dark hover:bg-gray-50"}`}>
                  {t === "info" ? "🏠 Property" : t === "services" ? "⚡ Services" : t === "contacts" ? "📋 Contacts" : t === "zone" ? "🗺️ Zone" : "📄 Documents"}
                </button>
              ))}
            </div>

            {/* TAB: INFO */}
            {tab === "info" && (
              <form onSubmit={saveProperty} className="card-premium space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input label="Name" name="name" defaultValue={selectedProp.name} />
                  <Input label="Address" name="address" defaultValue={selectedProp.address} />
                  <Select label="Type" name="type" defaultValue={selectedProp.type} options={["Condo","House","Lot","Villa"]} />
                  <Input label="Property Image URL" name="photo_url" defaultValue={selectedProp.photo_url || ""} />
                  <Input label="Deed / Escritura" name="fideicomiso" defaultValue={selectedProp.fideicomiso || ""} />
                  <Input label="Trust Number" name="fideicomiso_bank" defaultValue={selectedProp.fideicomiso_bank || ""} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-1">Notes</label>
                  <textarea name="notes" defaultValue={selectedProp.notes || ""} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-brand-navy/50 outline-none" />
                </div>
                <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? "Saving..." : "Save Changes"}</button>
              </form>

              {/* Owner Section within Property tab */}
              <div className="mt-6">
                <h3 className="font-semibold text-brand-navy mb-3">👤 Property Owner</h3>
                {owners.map(o => (
                  <div key={o.id} className="card-premium mb-3">
                    <div className="grid md:grid-cols-3 gap-3">
                      <Input label="Owner Name" defaultValue={o.name} onBlur={(v: string) => updateOwner(o.id, { name: v })} />
                      <Input label="Owner Email" defaultValue={o.email} onBlur={(v: string) => updateOwner(o.id, { email: v })} />
                      <Input label="Owner Phone" defaultValue={o.phone || ""} onBlur={(v: string) => updateOwner(o.id, { phone: v })} />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <a href={`/preview/${selectedProp.id}`} target="_blank" rel="noopener" className="text-xs bg-brand-navy text-white px-3 py-1.5 rounded-lg hover:bg-opacity-90 transition-all">View as Owner →</a>
                      <button onClick={() => deleteOwner(o.id)} className="text-xs text-red-500 hover:underline">Remove Owner</button>
                    </div>
                  </div>
                ))}
                {owners.length === 0 && (
                  <p className="text-sm text-brand-dark italic">No owner assigned yet. Create one below.</p>
                )}
                <CreateOwnerInline propertyId={selectedProp.id} onCreated={async () => {
                  const { data } = await supabase.from("cs_owners").select("*").eq("property_id", selectedProp.id);
                  setOwners(data || []);
                }} />
              </div>
            )}

            {/* TAB: SERVICES */}
            {tab === "services" && (
              <div className="space-y-4">
                <button onClick={addService} className="btn-primary text-sm">+ Add Service</button>
                {services.map(s => (
                  <div key={s.id} className="card-premium">
                    <div className="grid md:grid-cols-3 gap-3">
                      <Select label="Type" defaultValue={s.type} options={["CFE","Telmex","Water","Predial","Internet","Gas","HOA","Insurance","Bank Trust","Car Insurance","Vehicle Tax"]} onChange={v => updateService(s.id, { type: v })} />
                      <Input label="Account #" defaultValue={s.account_number || ""} onBlur={v => updateService(s.id, { account_number: v })} />
                      <Select label="Frequency" defaultValue={s.payment_freq || ""} options={["Monthly","Bimonthly","Annual","One-time"]} onChange={v => updateService(s.id, { payment_freq: v })} />
                    </div>
                    <button onClick={() => deleteService(s.id)} className="text-xs text-red-500 mt-2 hover:underline">Delete</button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: CONTACTS */}
            {tab === "contacts" && (
              <div className="space-y-4">
                <button onClick={addContact} className="btn-primary text-sm">+ Add Contact</button>
                {contacts.map(c => (
                  <div key={c.id} className="card-premium">
                    <div className="grid md:grid-cols-3 gap-3">
                      <Select label="Category" defaultValue={c.category} options={["Emergency","Medical","Attorney","Maintenance","Government","Broker","Administration"]} onChange={v => updateContact(c.id, { category: v })} />
                      <Input label="Name" defaultValue={c.name} onBlur={v => updateContact(c.id, { name: v })} />
                      <Input label="Specialty" defaultValue={c.specialty || ""} onBlur={v => updateContact(c.id, { specialty: v })} />
                      <Input label="Phone" defaultValue={c.phone} onBlur={v => updateContact(c.id, { phone: v })} />
                      <Input label="Email" defaultValue={c.email || ""} onBlur={v => updateContact(c.id, { email: v })} />
                    </div>
                    <Input label="Notes" defaultValue={c.notes || ""} onBlur={v => updateContact(c.id, { notes: v })} />
                    <button onClick={() => deleteContact(c.id)} className="text-xs text-red-500 mt-2 hover:underline">Delete</button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: ZONE */}
            {tab === "zone" && (
              <div className="space-y-4">
                <button onClick={addZone} className="btn-primary text-sm">+ Add Place</button>
                {zones.map(z => (
                  <div key={z.id} className="card-premium">
                    <div className="grid md:grid-cols-3 gap-3">
                      <Select label="Category" defaultValue={z.category} options={["Beach","Restaurant","Hotel","Supermarket","Bank","Transport","Activity"]} onChange={v => updateZone(z.id, { category: v })} />
                      <Input label="Name" defaultValue={z.name} onBlur={v => updateZone(z.id, { name: v })} />
                      <Input label="Description" defaultValue={z.description || ""} onBlur={v => updateZone(z.id, { description: v })} />
                      <Input label="Address" defaultValue={z.address || ""} onBlur={v => updateZone(z.id, { address: v })} />
                      <Input label="Phone" defaultValue={z.phone || ""} onBlur={v => updateZone(z.id, { phone: v })} />
                      <Input label="Website" defaultValue={z.website || ""} onBlur={v => updateZone(z.id, { website: v })} />
                      <Input label="Distance" defaultValue={z.distance || ""} onBlur={v => updateZone(z.id, { distance: v })} placeholder="e.g. 5 min walk" />
                    </div>
                    <label className="flex items-center gap-2 mt-2 text-sm">
                      <input type="checkbox" checked={z.is_global} onChange={e => updateZone(z.id, { is_global: e.target.checked })} />
                      Global (applies to all properties)
                    </label>
                    <button onClick={() => deleteZone(z.id)} className="text-xs text-red-500 mt-2 hover:underline">Delete</button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: DOCUMENTS */}
            {tab === "documents" && (
              <div className="space-y-4">
                <label className="btn-primary text-sm cursor-pointer inline-block">
                  📎 Upload Document
                  <input type="file" className="hidden" onChange={uploadDoc} />
                </label>
                {documents.map(d => (
                  <div key={d.id} className="card-premium flex items-center justify-between">
                    <div>
                      <p className="font-medium text-brand-navy text-sm">{d.name}</p>
                      <p className="text-xs text-brand-dark">{d.category} · {new Date(d.uploaded_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={d.file_url} target="_blank" rel="noopener" className="text-xs bg-brand-navy text-white px-3 py-1 rounded-lg">View</a>
                      <button onClick={() => deleteDoc(d.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: OWNER */}
            {/* Preview button */}
            <div className="mt-8 text-center">
              
            </div>
          </div>
        )}
      </div>

      <footer className="bg-brand-navy text-white/40 text-center py-4 mt-8 text-xs">
        Hecho por duendes.app 2026
      </footer>
    </div>
  );
}

// Inline create owner component
function CreateOwnerInline({ propertyId, onCreated }: { propertyId: string; onCreated: () => void }) {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState("");

  const createOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMsg("");
    try {
      const res = await fetch("/api/auth/create-owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, property_id: propertyId }),
      });
      const data = await res.json();
      if (data.error) { setMsg(`Error: ${data.error}`); }
      else {
        setMsg(`✅ Owner created: ${email}`);
        setEmail(""); setName(""); setPassword("");
        setShow(false);
        onCreated();
      }
    } catch (err: any) { setMsg(`Error: ${err.message}`); }
    setCreating(false);
  };

  if (!show) return (
    <button onClick={() => setShow(true)} className="text-xs text-brand-navy hover:underline mt-2">+ Add Owner Account</button>
  );

  return (
    <div className="card-premium border-dashed border-2 border-brand-navy/20 mt-3">
      <form onSubmit={createOwner} className="grid md:grid-cols-2 gap-3">
        <Input label="Name" value={name} onInput={setName} required />
        <Input label="Email" type="email" value={email} onInput={setEmail} required />
        <Input label="Password" type="password" value={password} onInput={setPassword} required />
        <div className="flex items-end gap-2">
          <button type="submit" disabled={creating} className="btn-primary text-sm flex-1">{creating ? "Creating..." : "Create"}</button>
          <button type="button" onClick={() => setShow(false)} className="text-xs text-brand-dark hover:underline">Cancel</button>
        </div>
      </form>
      {msg && <p className="text-sm mt-2">{msg}</p>}
    </div>
  );
}

// Reusable form components
function Input({ label, name, type, defaultValue, value, onBlur, onInput, placeholder, required }: any) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-brand-dark mb-1">{label}</label>}
      <input
        name={name}
        type={type || "text"}
        defaultValue={defaultValue}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={onInput ? (e) => onInput(e.target.value) : undefined}
        onBlur={onBlur ? (e) => onBlur(e.target.value) : undefined}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-brand-navy/50 outline-none"
      />
    </div>
  );
}

function Select({ label, name, defaultValue, options, onChange }: any) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-brand-dark mb-1">{label}</label>}
      <select
        name={name}
        defaultValue={defaultValue}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-brand-navy/50 outline-none"
      >
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
