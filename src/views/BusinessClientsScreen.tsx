import React, { useState, useEffect } from 'react';
import { ClientProfile } from '../types';
import { INITIAL_CLIENTS } from '../data/mockData';
import { getClientCrm, createClientCrm, addClientNote } from '../lib/database';
import { isSupabaseConfigured } from '../lib/supabase';

interface BusinessClientsScreenProps {
  onTriggerToast: (msg: string, icon?: string) => void;
}

export const BusinessClientsScreen: React.FC<BusinessClientsScreenProps> = ({
  onTriggerToast
}) => {
  const [clients, setClients] = useState<ClientProfile[]>(INITIAL_CLIENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'VIP' | 'Regular' | 'New Client'>('all');
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  // Add Client Modal
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('+63 9');
  const [formEmail, setFormEmail] = useState('');
  const [formTier, setFormTier] = useState<'VIP' | 'Regular' | 'New Client'>('New Client');
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    async function loadCrmData() {
      if (isSupabaseConfigured) {
        try {
          const loaded = await getClientCrm();
          if (loaded && loaded.length > 0) {
            setClients(loaded);
          }
        } catch (err) {
          console.warn('Failed to load CRM data from Supabase:', err);
        }
      }
    }
    loadCrmData();
  }, []);

  const filtered = clients.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (tierFilter === 'all') return true;
    return c.tier === tierFilter;
  });

  const vipCount = clients.filter(c => c.tier === 'VIP').length;
  const newCount = clients.filter(c => c.tier === 'New Client').length;
  const regularCount = clients.filter(c => c.tier === 'Regular').length;

  const handleAddConsultationNote = async () => {
    if (!newNoteText.trim() || !selectedClient) return;
    const noteContent = newNoteText.trim();
    const updated = {
      ...selectedClient,
      clientNotes: `${selectedClient.clientNotes}\n• [Today] ${noteContent}`
    };
    setSelectedClient(updated);
    setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
    setNewNoteText('');

    if (isSupabaseConfigured) {
      try {
        await addClientNote(selectedClient.id, '00000000-0000-0000-0000-000000000001', noteContent);
      } catch (err) {
        console.warn('Failed to save client note to Supabase:', err);
      }
    }

    onTriggerToast('Consultation note appended to client CRM! 📝', 'note_add');
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      onTriggerToast('Please enter client name', 'error');
      return;
    }

    let createdId = `client-${Date.now()}`;
    const cleanPhone = formPhone.trim() || '+63 900 000 0000';
    const cleanEmail = formEmail.trim() || `${formName.toLowerCase().replace(/\s+/g, '')}@example.com`;

    if (isSupabaseConfigured) {
      try {
        const dbCrm = await createClientCrm({
          business_id: '00000000-0000-0000-0000-000000000001',
          name: formName.trim(),
          phone: cleanPhone,
          email: cleanEmail,
          tier: formTier === 'New Client' ? 'New' : formTier,
          formula_note: formNotes.trim() || undefined
        });
        if (dbCrm?.id) {
          createdId = dbCrm.id;
        }
      } catch (err) {
        console.warn('Failed to save client to Supabase:', err);
      }
    }

    const newClientObj: ClientProfile = {
      id: createdId,
      name: formName.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      tier: formTier,
      totalSpent: formTier === 'VIP' ? 8500 : 0,
      visits: formTier === 'VIP' ? 6 : 1,
      lastVisit: 'New Registration',
      clientNotes: formNotes.trim() ? `• ${formNotes.trim()}` : '• Newly registered client.',
      preferredStylist: 'Jamie Lim',
      punctualityRate: '100%'
    };

    setClients([newClientObj, ...clients]);
    setIsAddClientModalOpen(false);
    setFormName('');
    setFormEmail('');
    setFormNotes('');
    onTriggerToast(`Added ${newClientObj.name} to Studio Bloom CRM! 👤`, 'person_add');
  };

  return (
    <div className="flex flex-col w-full pb-28 lg:pb-8 max-w-7xl mx-auto px-4 lg:px-8">
      {/* Top CRM Pulse Header */}
      <section className="pt-4 pb-2">
        <div className="p-4 rounded-2xl bg-white shadow-xs border border-[#e9edff] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-[#3525cd] uppercase tracking-wider">
              Studio Bloom CRM
            </span>
            <h1 className="text-[20px] font-bold text-[#141b2b] font-display">Client Directory</h1>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex items-center gap-3 text-right">
              <div>
                <span className="text-[16px] font-bold text-[#141b2b] font-display">{clients.length}</span>
                <span className="text-[10px] text-[#777587] block uppercase font-semibold">Total</span>
              </div>
              <div className="w-[1px] h-6 bg-[#dee2ef]"></div>
              <div>
                <span className="text-[16px] font-bold text-[#3525cd] font-display">{vipCount}</span>
                <span className="text-[10px] text-[#777587] block uppercase font-semibold">VIPs</span>
              </div>
              <div className="w-[1px] h-6 bg-[#dee2ef]"></div>
              <div>
                <span className="text-[16px] font-bold text-[#00702f] font-display">+{newCount}</span>
                <span className="text-[10px] text-[#777587] block uppercase font-semibold">New</span>
              </div>
            </div>

            <button
              onClick={() => setIsAddClientModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span className="hidden sm:inline">Add Client</span>
            </button>
          </div>
        </div>
      </section>

      {/* Search & Tier Filter Bar */}
      <section className="sticky top-16 z-30 py-2.5 bg-[#f9f9ff]/95 backdrop-blur-md border-b border-[#e9edff]">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 h-11 rounded-xl bg-white border border-[#e9edff] shadow-xs">
            <span className="material-symbols-outlined text-[#777587] text-[20px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by client name, phone or formula..."
              className="w-full bg-transparent text-[13px] text-[#141b2b] placeholder:text-[#777587] focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[#777587] cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2">
          <button
            onClick={() => setTierFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer ${
              tierFilter === 'all'
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'bg-white text-[#464555] border border-[#e9edff]'
            }`}
          >
            All ({clients.length})
          </button>
          <button
            onClick={() => setTierFilter('VIP')}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer ${
              tierFilter === 'VIP'
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'bg-white text-[#464555] border border-[#e9edff]'
            }`}
          >
            VIP ({vipCount})
          </button>
          <button
            onClick={() => setTierFilter('Regular')}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer ${
              tierFilter === 'Regular'
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'bg-white text-[#464555] border border-[#e9edff]'
            }`}
          >
            Regular ({regularCount})
          </button>
          <button
            onClick={() => setTierFilter('New Client')}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer ${
              tierFilter === 'New Client'
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'bg-white text-[#464555] border border-[#e9edff]'
            }`}
          >
            New ({newCount})
          </button>
        </div>
      </section>

      {/* Client List Grid */}
      <section className="pt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(client => (
          <div
            key={client.id}
            onClick={() => setSelectedClient(client)}
            className="p-4 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex flex-col justify-between gap-3 hover:border-[#3525cd] transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#e1e8fd] text-[#3525cd] flex items-center justify-center font-bold text-[15px] shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[15px] font-bold text-[#141b2b] group-hover:text-[#3525cd] transition-colors">
                      {client.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        client.tier === 'VIP'
                          ? 'bg-[#dee2ef] text-[#3525cd]'
                          : client.tier === 'New Client'
                          ? 'bg-[#7ffc97] text-[#002109]'
                          : 'bg-[#f1f3ff] text-[#464555]'
                      }`}
                    >
                      {client.tier}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#464555]">{client.phone}</p>
                </div>
              </div>

              <span className="material-symbols-outlined text-[20px] text-[#777587] group-hover:text-[#3525cd]">
                chevron_right
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 py-2 px-3 rounded-xl bg-[#f1f3ff] text-[11px]">
              <div>
                <span className="text-[#777587] block">Visits</span>
                <strong className="text-[#141b2b] text-[13px]">{client.visits}</strong>
              </div>
              <div>
                <span className="text-[#777587] block">Spent</span>
                <strong className="text-[#3525cd] text-[13px]">₱{client.totalSpent.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-[#777587] block">Punctuality</span>
                <strong className="text-[#00702f] text-[13px]">{client.punctualityRate || '100%'}</strong>
              </div>
            </div>

            {client.formulaNote && (
              <div className="text-[11px] text-[#3525cd] bg-[#e9edff] px-2.5 py-1 rounded-lg truncate flex items-center gap-1 font-mono">
                <span className="material-symbols-outlined text-[13px]">science</span>
                <span>{client.formulaNote}</span>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* ================= MODAL: ADD CLIENT ================= */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e9edff] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#3525cd] text-[22px]">person_add</span>
                <h3 className="text-[16px] font-bold text-[#141b2b]">Add New Client</h3>
              </div>
              <button
                onClick={() => setIsAddClientModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f1f3ff] flex items-center justify-center text-[#464555] hover:text-[#141b2b] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Bianca Tan"
                  className="w-full mt-1 px-3 h-10 rounded-xl bg-[#f1f3ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+63 917..."
                    className="w-full mt-1 px-3 h-10 rounded-xl bg-[#f1f3ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                    Category Tier
                  </label>
                  <select
                    value={formTier}
                    onChange={(e) => setFormTier(e.target.value as any)}
                    className="w-full mt-1 px-2 h-10 rounded-xl bg-[#f1f3ff] border border-[#e9edff] text-[12px] text-[#141b2b] focus:outline-none"
                  >
                    <option value="New Client">New Client</option>
                    <option value="Regular">Regular</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="bianca@example.com"
                  className="w-full mt-1 px-3 h-10 rounded-xl bg-[#f1f3ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                  Initial Notes / Hair Preferences
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Prefers natural tone balayage, allergic to ammonia..."
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#f1f3ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#e9edff]">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-[#e9edff] text-[#464555] text-[13px] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[13px] font-semibold shadow-xs cursor-pointer"
                >
                  Save to Directory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CLIENT DETAILS SIDE DRAWER / MODAL ================= */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#e9edff] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#e1e8fd] text-[#3525cd] flex items-center justify-center font-bold text-[18px]">
                  {selectedClient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-[#141b2b]">{selectedClient.name}</h3>
                  <p className="text-[12px] text-[#464555]">{selectedClient.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="w-9 h-9 rounded-full bg-[#e9edff] flex items-center justify-center text-[#141b2b] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-[#f1f3ff] text-center">
                <span className="text-[11px] text-[#777587]">Visits</span>
                <div className="text-[16px] font-bold text-[#141b2b]">{selectedClient.visits}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f1f3ff] text-center">
                <span className="text-[11px] text-[#777587]">Total Spent</span>
                <div className="text-[16px] font-bold text-[#3525cd]">
                  ₱{selectedClient.totalSpent.toLocaleString()}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f1f3ff] text-center">
                <span className="text-[11px] text-[#777587]">Tier</span>
                <div className="text-[13px] font-bold text-[#00702f]">{selectedClient.tier}</div>
              </div>
            </div>

            {/* Hair Formula Card */}
            {selectedClient.formulaNote && (
              <div className="p-3 rounded-xl bg-[#e9edff] flex flex-col gap-1">
                <span className="text-[11px] font-bold text-[#3525cd] uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">science</span>
                  Formula &amp; Technical Notes
                </span>
                <p className="text-[13px] font-mono text-[#141b2b] font-medium">
                  {selectedClient.formulaNote}
                </p>
              </div>
            )}

            {/* Client Notes & Consultations */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[12px] font-bold text-[#141b2b] uppercase tracking-wider">
                Stylist Consultation History
              </span>
              <div className="p-3 rounded-xl bg-[#f1f3ff] text-[13px] text-[#464555] whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto border border-[#e9edff]">
                {selectedClient.clientNotes}
              </div>
            </div>

            {/* Add Note Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#464555] uppercase tracking-wider">
                Add Consultation Note
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNoteText}
                  onChange={e => setNewNoteText(e.target.value)}
                  placeholder="e.g. Likes toner slightly cooler next time..."
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
                />
                <button
                  onClick={handleAddConsultationNote}
                  className="px-4 py-2 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[13px] font-semibold cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </div>

            {/* Action Bar */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#e9edff]">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(selectedClient.phone);
                  onTriggerToast(`Copied phone: ${selectedClient.phone} 📞`, 'call');
                }}
                className="py-2.5 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-[#3525cd]">call</span>
                <span>Call Client</span>
              </button>
              <button
                onClick={() => onTriggerToast(`Sent appointment reminder to ${selectedClient.name}! 💬`, 'chat')}
                className="py-2.5 rounded-xl bg-[#e9edff] hover:bg-[#dce2f7] text-[#3525cd] text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>Send SMS / WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
