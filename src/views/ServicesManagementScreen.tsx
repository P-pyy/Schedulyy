import React, { useState, useEffect } from 'react';
import { SalonService } from '../types';
import { INITIAL_SERVICES, ASSETS } from '../data/mockData';
import {
  getServices,
  createService,
  updateService,
  deleteService,
  getBusinessByOwnerId,
  getFullStaff,
  createStaff,
  updateStaff,
  toggleStaffActive,
  getStaffServices,
  setStaffServices,
  getStaffHours,
  updateStaffHours
} from '../lib/database';
import { DbStaff, DbStaffHours } from '../lib/database.types';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface ServicesManagementScreenProps {
  initialSection?: 'services' | 'staff';
  onPreviewPublicStore: () => void;
  onTriggerToast: (msg: string, icon?: string) => void;
}

const DAYS_OF_WEEK = [
  { day: 0, label: 'Sunday', short: 'Sun' },
  { day: 1, label: 'Monday', short: 'Mon' },
  { day: 2, label: 'Tuesday', short: 'Tue' },
  { day: 3, label: 'Wednesday', short: 'Wed' },
  { day: 4, label: 'Thursday', short: 'Thu' },
  { day: 5, label: 'Friday', short: 'Fri' },
  { day: 6, label: 'Saturday', short: 'Sat' }
];

export const ServicesManagementScreen: React.FC<ServicesManagementScreenProps> = ({
  initialSection = 'services',
  onPreviewPublicStore,
  onTriggerToast
}) => {
  const { user } = useAuth();
  // Database-authoritative business context for authenticated owner
  const [ownerBusinessId, setOwnerBusinessId] = useState<string>('00000000-0000-0000-0000-000000000001');

  const [activeSection, setActiveSection] = useState<'services' | 'staff'>(initialSection);

  // ---------------- SERVICES STATE ----------------
  const [services, setServices] = useState<SalonService[]>(INITIAL_SERVICES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'HAIRCUTS' | 'COLOR' | 'CHEMICAL' | 'NAILS' | 'WELLNESS'>('HAIRCUTS');
  const [newPrice, setNewPrice] = useState('500');
  const [newDuration, setNewDuration] = useState('45 mins');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---------------- STAFF STATE ----------------
  const [staffList, setStaffList] = useState<DbStaff[]>([]);
  const [staffServicesMap, setStaffServicesMap] = useState<Record<string, string[]>>({});
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Senior Stylist Specialist');
  const [newStaffSpecialty, setNewStaffSpecialty] = useState('Styling & Precision Cuts');
  const [newStaffAvatar, setNewStaffAvatar] = useState(ASSETS.mariaAvatar);
  const [newStaffIsActive, setNewStaffIsActive] = useState(true);
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false);

  // Edit Staff Modal
  const [editStaffModalStaff, setEditStaffModalStaff] = useState<DbStaff | null>(null);
  const [editStaffName, setEditStaffName] = useState('');
  const [editStaffRole, setEditStaffRole] = useState('');
  const [editStaffSpecialty, setEditStaffSpecialty] = useState('');
  const [editStaffAvatar, setEditStaffAvatar] = useState('');

  // Assign Services Modal
  const [assignModalStaff, setAssignModalStaff] = useState<DbStaff | null>(null);
  const [assignedServiceIds, setAssignedServiceIds] = useState<string[]>([]);
  const [isSavingAssignments, setIsSavingAssignments] = useState(false);

  // Working Hours Modal
  const [hoursModalStaff, setHoursModalStaff] = useState<DbStaff | null>(null);
  const [staffHoursList, setStaffHoursList] = useState<{
    day_of_week: number;
    start_time: string | null;
    end_time: string | null;
    is_off: boolean;
  }[]>([]);
  const [isSavingHours, setIsSavingHours] = useState(false);

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    async function loadData() {
      let currentBizId = '00000000-0000-0000-0000-000000000001';
      if (user?.id && isSupabaseConfigured) {
        try {
          const ownerBiz = await getBusinessByOwnerId(user.id);
          if (ownerBiz?.id) {
            currentBizId = ownerBiz.id;
            setOwnerBusinessId(currentBizId);
          }
        } catch (err) {
          console.warn('Failed to resolve owner business:', err);
        }
      }

      try {
        const loadedServices = await getServices(currentBizId);
        if (loadedServices && loadedServices.length > 0) {
          setServices(loadedServices);
        }
      } catch (err) {
        console.warn('Failed to fetch services:', err);
      }

      try {
        const loadedStaff = await getFullStaff(currentBizId);
        if (loadedStaff) {
          setStaffList(loadedStaff);

          // Preload service assignment counts
          const map: Record<string, string[]> = {};
          for (const s of loadedStaff) {
            const assigned = await getStaffServices(s.id);
            map[s.id] = assigned;
          }
          setStaffServicesMap(map);
        }
      } catch (err) {
        console.warn('Failed to fetch staff:', err);
      }
    }
    loadData();
  }, [user?.id]);

  // ---------------- SERVICE ACTIONS ----------------
  const handleToggleActive = async (serviceId: string, current: boolean) => {
    const updatedState = !current;
    setServices(prev =>
      prev.map(s => (s.id === serviceId ? { ...s, isActive: updatedState } : s))
    );

    if (isSupabaseConfigured) {
      try {
        await updateService(serviceId, { is_active: updatedState });
      } catch (err: any) {
        console.warn('Supabase service update error:', err);
      }
    }

    onTriggerToast(
      updatedState ? 'Service activated for online booking! 🟢' : 'Service deactivated from public menu',
      updatedState ? 'check_circle' : 'visibility_off'
    );
  };

  const handleSaveNewService = async () => {
    if (!newTitle.trim()) {
      onTriggerToast('Please enter a service title', 'warning');
      return;
    }

    setIsSubmitting(true);
    const durationNum = parseInt(newDuration.replace(/\D/g, ''), 10) || 45;
    const priceNum = Number(newPrice) || 500;

    let createdId = `srv-${Date.now()}`;

    if (isSupabaseConfigured) {
      try {
        const result = await createService({
          business_id: ownerBusinessId,
          title: newTitle.trim(),
          category: newCategory,
          description: newDesc.trim() || 'Custom salon service designed for clients.',
          duration_minutes: durationNum,
          price: priceNum,
          image_url: ASSETS.haircutService
        });
        if (result?.id) {
          createdId = result.id;
        }
      } catch (err: any) {
        console.warn('Supabase create service:', err);
      }
    }

    const newService: SalonService = {
      id: createdId,
      title: newTitle.trim(),
      category: newCategory,
      description: newDesc.trim() || 'Custom salon service designed for clients.',
      duration: `${durationNum} mins`,
      price: priceNum,
      isActive: true,
      bookingsThisMonth: 0,
      grossRevenue: 0,
      staffAssigned: 'All Staff',
      image: services[0]?.image || ASSETS.haircutService
    };

    setServices([newService, ...services]);
    setShowAddModal(false);
    setNewTitle('');
    setNewDesc('');
    setIsSubmitting(false);
    onTriggerToast(`Added "${newService.title}" to services menu! 🎉`, 'add_task');
  };

  // ---------------- STAFF ACTIONS ----------------
  const handleToggleStaffActiveStatus = async (staffId: string, current: boolean) => {
    const nextState = !current;
    // Optimistic update
    setStaffList(prev =>
      prev.map(s => (s.id === staffId ? { ...s, is_active: nextState } : s))
    );

    try {
      await toggleStaffActive(staffId, nextState);
      onTriggerToast(
        nextState ? 'Specialist activated for bookings! 🟢' : 'Specialist marked as on leave / inactive',
        nextState ? 'how_to_reg' : 'person_off'
      );
    } catch (err: any) {
      console.warn('Failed to toggle staff status:', err);
      onTriggerToast(err.message || 'Failed to update staff status', 'error');
    }
  };

  const handleCreateStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) {
      onTriggerToast('Please provide a staff name', 'warning');
      return;
    }

    setIsSubmittingStaff(true);
    try {
      const created = await createStaff({
        business_id: ownerBusinessId,
        name: newStaffName.trim(),
        role: newStaffRole.trim(),
        specialty: newStaffSpecialty.trim(),
        avatar_url: newStaffAvatar,
        is_active: newStaffIsActive
      });

      setStaffList(prev => [...prev, created]);
      setShowAddStaffModal(false);
      setNewStaffName('');
      onTriggerToast(`Added ${created.name} to team roster! ✂️`, 'person_add');
    } catch (err: any) {
      console.warn('Failed to create staff:', err);
      onTriggerToast(err.message || 'Failed to create staff member', 'error');
    } finally {
      setIsSubmittingStaff(false);
    }
  };

  const handleOpenEditStaff = (staff: DbStaff) => {
    setEditStaffModalStaff(staff);
    setEditStaffName(staff.name);
    setEditStaffRole(staff.role || 'Senior Stylist Specialist');
    setEditStaffSpecialty(staff.specialty || 'Styling & Precision Cuts');
    setEditStaffAvatar(staff.avatar_url || ASSETS.julianAvatar);
  };

  const handleSaveEditStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStaffModalStaff) return;
    if (!editStaffName.trim()) {
      onTriggerToast('Please provide a staff name', 'warning');
      return;
    }

    try {
      const updated = await updateStaff(editStaffModalStaff.id, {
        name: editStaffName.trim(),
        role: editStaffRole.trim(),
        specialty: editStaffSpecialty.trim(),
        avatar_url: editStaffAvatar
      });

      setStaffList(prev =>
        prev.map(s => (s.id === updated.id ? updated : s))
      );
      setEditStaffModalStaff(null);
      onTriggerToast(`Updated details for ${updated.name}! ✨`, 'check_circle');
    } catch (err: any) {
      console.warn('Failed to update staff:', err);
      onTriggerToast(err.message || 'Failed to update staff member', 'error');
    }
  };

  const handleOpenAssignServices = async (staff: DbStaff) => {
    setAssignModalStaff(staff);
    try {
      const assigned = await getStaffServices(staff.id);
      setAssignedServiceIds(assigned);
    } catch (err) {
      console.warn('Failed to fetch assigned services:', err);
      setAssignedServiceIds([]);
    }
  };

  const handleToggleServiceAssignment = (serviceId: string) => {
    setAssignedServiceIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSaveAssignmentsSubmit = async () => {
    if (!assignModalStaff) return;
    setIsSavingAssignments(true);
    try {
      await setStaffServices(assignModalStaff.id, assignedServiceIds);
      setStaffServicesMap(prev => ({
        ...prev,
        [assignModalStaff.id]: assignedServiceIds
      }));
      setAssignModalStaff(null);
      onTriggerToast(`Updated service allocation for ${assignModalStaff.name}! 📋`, 'done_all');
    } catch (err: any) {
      console.warn('Failed to save service assignments:', err);
      onTriggerToast(err.message || 'Failed to assign services', 'error');
    } finally {
      setIsSavingAssignments(false);
    }
  };

  const handleOpenWorkingHours = async (staff: DbStaff) => {
    setHoursModalStaff(staff);
    try {
      const loadedHours = await getStaffHours(staff.id);
      if (loadedHours && loadedHours.length > 0) {
        // Map 0-6 days
        const fullSchedule = DAYS_OF_WEEK.map(d => {
          const match = loadedHours.find(h => h.day_of_week === d.day);
          return {
            day_of_week: d.day,
            start_time: match?.start_time || '09:00',
            end_time: match?.end_time || '19:00',
            is_off: match ? match.is_off : d.day === 0
          };
        });
        setStaffHoursList(fullSchedule);
      } else {
        // Default standard salon schedule: Mon-Sat 9AM-7PM, Sun off
        const defaultSchedule = DAYS_OF_WEEK.map(d => ({
          day_of_week: d.day,
          start_time: d.day === 0 ? null : '09:00',
          end_time: d.day === 0 ? null : '19:00',
          is_off: d.day === 0
        }));
        setStaffHoursList(defaultSchedule);
      }
    } catch (err) {
      console.warn('Failed to load staff hours:', err);
    }
  };

  const handleSaveWorkingHoursSubmit = async () => {
    if (!hoursModalStaff) return;
    setIsSavingHours(true);
    try {
      await updateStaffHours(hoursModalStaff.id, ownerBusinessId, staffHoursList);
      setHoursModalStaff(null);
      onTriggerToast(`Updated schedule & working hours for ${hoursModalStaff.name}! 🕒`, 'schedule');
    } catch (err: any) {
      console.warn('Failed to save staff hours:', err);
      onTriggerToast(err.message || 'Failed to update working hours', 'error');
    } finally {
      setIsSavingHours(false);
    }
  };

  const filteredServices = services.filter(s => {
    if (selectedCategory === 'all') return true;
    return s.category === selectedCategory;
  });

  const totalRevenue = services.reduce((acc, s) => acc + s.grossRevenue, 0);

  return (
    <div className="flex flex-col w-full pb-28 lg:pb-8 max-w-7xl mx-auto lg:px-6">
      {/* Public Booking Link Banner */}
      <section className="px-4 lg:px-0 pt-4 pb-2">
        <div className="p-4 rounded-2xl bg-[#3525cd] text-white shadow-md flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#7ffc97]">link</span>
              <span className="text-[12px] font-bold uppercase tracking-wider text-white/90">
                Public Booking Link
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
              Live Online
            </span>
          </div>

          <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-xl p-2.5">
            <span className="font-mono text-[13px] text-white/90 truncate">
              scheduly.ph/studiobloom
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText('https://scheduly.ph/studiobloom');
                  onTriggerToast('Copied public booking link to clipboard! 📋', 'content_copy');
                }}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                title="Copy Link"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
              </button>
              <button
                onClick={onPreviewPublicStore}
                className="px-2.5 py-1 rounded-lg bg-white text-[#3525cd] text-[11px] font-bold hover:bg-white/90 transition-colors cursor-pointer"
              >
                Preview
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Segmented Control: Services vs Staff */}
      <section className="px-4 lg:px-0 pt-3 pb-1">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-[#e9edff] shadow-xs w-fit">
          <button
            onClick={() => setActiveSection('services')}
            className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSection === 'services'
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'text-[#464555] hover:text-[#141b2b] hover:bg-[#f1f3ff]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">spa</span>
            <span>Services Catalog ({services.length})</span>
          </button>
          <button
            onClick={() => setActiveSection('staff')}
            className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSection === 'staff'
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'text-[#464555] hover:text-[#141b2b] hover:bg-[#f1f3ff]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">badge</span>
            <span>Staff &amp; Specialists ({staffList.length})</span>
          </button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 1: SERVICES CATALOG                               */}
      {/* ========================================================= */}
      {activeSection === 'services' && (
        <>
          <section className="px-4 lg:px-0 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[18px] font-bold text-[#141b2b] font-display">Manage Services</h1>
                <p className="text-[12px] text-[#464555]">
                  {services.filter(s => s.isActive).length} active • ₱{totalRevenue.toLocaleString()} monthly revenue
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-2 rounded-xl bg-[#3525cd] text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-xs hover:bg-[#4f46e5] active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Service</span>
              </button>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3">
              {['all', 'HAIRCUTS', 'COLOR', 'CHEMICAL', 'NAILS', 'WELLNESS'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#3525cd] text-white shadow-xs'
                      : 'bg-white text-[#464555] border border-[#e9edff]'
                  }`}
                >
                  {cat === 'all' ? 'All Services' : cat}
                </button>
              ))}
            </div>
          </section>

          {/* Services Grid List */}
          <section className="px-4 lg:px-0 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredServices.map(srv => (
              <div
                key={srv.id}
                className={`p-4 rounded-2xl bg-white border transition-all flex flex-col justify-between gap-3 shadow-xs ${
                  srv.isActive ? 'border-[#e9edff]' : 'border-gray-200 opacity-60 bg-gray-50/70'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#e9edff] overflow-hidden shrink-0">
                      <img
                        referrerPolicy="no-referrer"
                        src={srv.image}
                        alt={srv.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f1f3ff] text-[#3525cd] uppercase">
                          {srv.category}
                        </span>
                        {srv.isPopular && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e8f5e9] text-[#00702f]">
                            Popular
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-[14px] text-[#141b2b] mt-1">{srv.title}</h3>
                      <p className="text-[12px] text-[#464555] line-clamp-2 mt-0.5">
                        {srv.description}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Active Switch */}
                  <button
                    onClick={() => handleToggleActive(srv.id, srv.isActive)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${
                      srv.isActive ? 'bg-[#3525cd]' : 'bg-gray-300'
                    }`}
                    title={srv.isActive ? 'Active - click to hide' : 'Hidden - click to activate'}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        srv.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#f1f3ff] text-[12px]">
                  <div>
                    <span className="font-bold text-[15px] text-[#3525cd]">₱{srv.price.toLocaleString()}</span>
                    <span className="text-[#777587] ml-1.5">• {srv.duration}</span>
                  </div>
                  <span className="text-[#464555]">
                    {srv.bookingsThisMonth} bookings this month
                  </span>
                </div>
              </div>
            ))}
          </section>
        </>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: STAFF TEAM & WORKING HOURS                     */}
      {/* ========================================================= */}
      {activeSection === 'staff' && (
        <>
          <section className="px-4 lg:px-0 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[18px] font-bold text-[#141b2b] font-display">Manage Staff &amp; Specialists</h1>
                <p className="text-[12px] text-[#464555]">
                  {staffList.filter(s => s.is_active).length} active for bookings • Working hours &amp; service allocation
                </p>
              </div>
              <button
                onClick={() => setShowAddStaffModal(true)}
                className="px-3.5 py-2 rounded-xl bg-[#3525cd] text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-xs hover:bg-[#4f46e5] active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                <span>Add Specialist</span>
              </button>
            </div>
          </section>

          {/* Staff Cards List */}
          <section className="px-4 lg:px-0 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {staffList.map(staff => {
              const assignedCount = staffServicesMap[staff.id]?.length ?? 0;

              return (
                <div
                  key={staff.id}
                  className={`p-4 rounded-2xl bg-white border transition-all flex flex-col justify-between gap-3 shadow-xs ${
                    staff.is_active ? 'border-[#e9edff]' : 'border-gray-200 opacity-70 bg-gray-50/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <img
                          referrerPolicy="no-referrer"
                          src={staff.avatar_url || ASSETS.jamieAvatar}
                          alt={staff.name}
                          className="w-13 h-13 rounded-full object-cover ring-2 ring-[#3525cd]/20"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-white ${
                            staff.is_active ? 'bg-[#7ffc97]' : 'bg-gray-400'
                          }`}
                          title={staff.is_active ? 'Active' : 'Inactive'}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-[15px] text-[#141b2b]">{staff.name}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              staff.is_active
                                ? 'bg-[#eafaf1] text-[#00702f]'
                                : 'bg-[#dee2ef] text-[#424751]'
                            }`}
                          >
                            {staff.is_active ? 'Active' : 'On Leave'}
                          </span>
                        </div>
                        <p className="text-[12px] font-medium text-[#3525cd] mt-0.5">
                          {staff.role || 'Stylist Specialist'}
                        </p>
                        <p className="text-[11px] text-[#464555] line-clamp-1 mt-0.5">
                          {staff.specialty || 'General Salon Care'}
                        </p>
                      </div>
                    </div>

                    {/* Toggle Active Switch */}
                    <button
                      onClick={() => handleToggleStaffActiveStatus(staff.id, staff.is_active)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${
                        staff.is_active ? 'bg-[#3525cd]' : 'bg-gray-300'
                      }`}
                      title={staff.is_active ? 'Deactivate (mark on leave)' : 'Activate for bookings'}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                          staff.is_active ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Actions & Assignments Footer */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-[#f1f3ff]">
                    <div className="flex items-center justify-between text-[11px] text-[#464555]">
                      <span className="flex items-center gap-1 font-semibold text-[#141b2b]">
                        <span className="material-symbols-outlined text-[14px] text-[#3525cd]">assignment</span>
                        <span>{assignedCount > 0 ? `${assignedCount} services assigned` : 'All salon services'}</span>
                      </span>
                      <span className="text-[#00702f] font-medium">9AM – 7PM Regular</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button
                        onClick={() => handleOpenAssignServices(staff)}
                        className="py-1.5 px-2 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] text-[#3525cd] text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                        title="Assign which services this staff performs"
                      >
                        <span className="material-symbols-outlined text-[14px]">checklist</span>
                        <span>Services</span>
                      </button>

                      <button
                        onClick={() => handleOpenWorkingHours(staff)}
                        className="py-1.5 px-2 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] text-[#3525cd] text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                        title="Configure working hours and off days"
                      >
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        <span>Hours</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditStaff(staff)}
                        className="py-1.5 px-2 rounded-xl bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                        title="Edit specialist details"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        </>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD SERVICE                                        */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e9edff] pb-3">
              <h2 className="text-[18px] font-bold text-[#141b2b]">Add New Service</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-[#e9edff] flex items-center justify-center text-[#141b2b] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[12px] font-bold text-[#141b2b] block mb-1">Service Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Scalp Detox & Hydration Treatment"
                  className="w-full p-2.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[12px] font-bold text-[#141b2b] block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
                  >
                    <option value="HAIRCUTS">HAIRCUTS</option>
                    <option value="COLOR">COLOR</option>
                    <option value="CHEMICAL">CHEMICAL</option>
                    <option value="NAILS">NAILS</option>
                    <option value="WELLNESS">WELLNESS</option>
                  </select>
                </div>

                <div>
                  <label className="text-[12px] font-bold text-[#141b2b] block mb-1">Price (₱)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[12px] font-bold text-[#141b2b] block mb-1">Duration</label>
                  <input
                    type="text"
                    value={newDuration}
                    onChange={e => setNewDuration(e.target.value)}
                    placeholder="e.g. 45 mins"
                    className="w-full p-2.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-[#141b2b] block mb-1">Staff Access</label>
                  <select className="w-full p-2.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]">
                    <option>All Staff</option>
                    {staffList.map(s => (
                      <option key={s.id} value={s.id}>{s.name} only</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#141b2b] block mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Includes consultation, shampoo, treatment and styling..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#e9edff]">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#dee2ef] text-[#424751] text-[13px] font-semibold hover:bg-gray-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewService}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-[#3525cd] text-white text-[13px] font-semibold hover:bg-[#4f46e5] cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? 'Saving...' : 'Publish Service'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD SPECIALIST / STAFF                             */}
      {/* ========================================================= */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e9edff] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#3525cd] text-[22px]">person_add</span>
                <h2 className="text-[17px] font-bold text-[#141b2b]">Add New Specialist</h2>
              </div>
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="w-8 h-8 rounded-full bg-[#e9edff] flex items-center justify-center text-[#141b2b] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateStaffSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={e => setNewStaffName(e.target.value)}
                  placeholder="e.g. Elena Cruz"
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                    Role Title
                  </label>
                  <input
                    type="text"
                    value={newStaffRole}
                    onChange={e => setNewStaffRole(e.target.value)}
                    placeholder="e.g. Senior Stylist"
                    className="w-full mt-1 p-2.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                    Specialty Area
                  </label>
                  <input
                    type="text"
                    value={newStaffSpecialty}
                    onChange={e => setNewStaffSpecialty(e.target.value)}
                    placeholder="e.g. Balayage & Cuts"
                    className="w-full mt-1 p-2.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                  Avatar Preset
                </label>
                <div className="flex items-center gap-2 mt-1">
                  {[ASSETS.mariaAvatar, ASSETS.jamieAvatar, ASSETS.julianAvatar, ASSETS.camilleAvatar, ASSETS.marcoAvatar].map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewStaffAvatar(av)}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                        newStaffAvatar === av ? 'border-[#3525cd] scale-110 shadow-xs' : 'border-transparent opacity-60'
                      }`}
                    >
                      <img referrerPolicy="no-referrer" src={av} alt="Avatar option" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#f1f3ff] mt-1">
                <div>
                  <span className="text-[13px] font-bold text-[#141b2b] block">Available for Online Bookings</span>
                  <span className="text-[11px] text-[#464555]">Clients can select this specialist at checkout</span>
                </div>
                <input
                  type="checkbox"
                  checked={newStaffIsActive}
                  onChange={e => setNewStaffIsActive(e.target.checked)}
                  className="w-5 h-5 text-[#3525cd] rounded cursor-pointer"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#e9edff]">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#dee2ef] text-[#424751] text-[13px] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStaff}
                  className="flex-1 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[13px] font-semibold shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {isSubmittingStaff ? 'Saving...' : 'Add Specialist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT SPECIALIST                                    */}
      {/* ========================================================= */}
      {editStaffModalStaff && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e9edff] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#3525cd] text-[22px]">edit</span>
                <h2 className="text-[17px] font-bold text-[#141b2b]">Edit Specialist Details</h2>
              </div>
              <button
                onClick={() => setEditStaffModalStaff(null)}
                className="w-8 h-8 rounded-full bg-[#e9edff] flex items-center justify-center text-[#141b2b] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEditStaffSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editStaffName}
                  onChange={e => setEditStaffName(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                    Role Title
                  </label>
                  <input
                    type="text"
                    value={editStaffRole}
                    onChange={e => setEditStaffRole(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                    Specialty Area
                  </label>
                  <input
                    type="text"
                    value={editStaffSpecialty}
                    onChange={e => setNewStaffSpecialty(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-[#f9f9ff] border border-[#e9edff] text-[13px] text-[#141b2b] focus:outline-none focus:border-[#3525cd]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                  Avatar Preset
                </label>
                <div className="flex items-center gap-2 mt-1">
                  {[ASSETS.mariaAvatar, ASSETS.jamieAvatar, ASSETS.julianAvatar, ASSETS.camilleAvatar, ASSETS.marcoAvatar].map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditStaffAvatar(av)}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                        editStaffAvatar === av ? 'border-[#3525cd] scale-110 shadow-xs' : 'border-transparent opacity-60'
                      }`}
                    >
                      <img referrerPolicy="no-referrer" src={av} alt="Avatar option" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#e9edff]">
                <button
                  type="button"
                  onClick={() => setEditStaffModalStaff(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#dee2ef] text-[#424751] text-[13px] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[13px] font-semibold shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ASSIGN SERVICES (service_staff table)               */}
      {/* ========================================================= */}
      {assignModalStaff && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e9edff] pb-3">
              <div>
                <h2 className="text-[17px] font-bold text-[#141b2b]">Assign Services</h2>
                <p className="text-[12px] text-[#464555]">
                  Select services {assignModalStaff.name} is authorized to perform
                </p>
              </div>
              <button
                onClick={() => setAssignModalStaff(null)}
                className="w-8 h-8 rounded-full bg-[#e9edff] flex items-center justify-center text-[#141b2b] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#464555]">
                {assignedServiceIds.length} of {services.length} selected
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAssignedServiceIds(services.map(s => s.id))}
                  className="text-[11px] font-semibold text-[#3525cd] hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-gray-300">•</span>
                <button
                  type="button"
                  onClick={() => setAssignedServiceIds([])}
                  className="text-[11px] font-semibold text-gray-500 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {services.map(srv => {
                const isChecked = assignedServiceIds.includes(srv.id);

                return (
                  <label
                    key={srv.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      isChecked ? 'bg-[#f1f3ff] border-[#3525cd]/40' : 'bg-white border-[#e9edff] hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleServiceAssignment(srv.id)}
                        className="w-4 h-4 text-[#3525cd] rounded cursor-pointer"
                      />
                      <div>
                        <span className="text-[13px] font-bold text-[#141b2b] block">{srv.title}</span>
                        <span className="text-[11px] text-[#464555]">{srv.duration} • ₱{srv.price.toLocaleString()}</span>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white border border-[#e9edff] text-[#3525cd]">
                      {srv.category}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#e9edff]">
              <button
                type="button"
                onClick={() => setAssignModalStaff(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#dee2ef] text-[#424751] text-[13px] font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAssignmentsSubmit}
                disabled={isSavingAssignments}
                className="flex-1 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[13px] font-semibold shadow-xs cursor-pointer disabled:opacity-60"
              >
                {isSavingAssignments ? 'Saving...' : 'Save Allocation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: STAFF WORKING HOURS (staff_hours table)            */}
      {/* ========================================================= */}
      {hoursModalStaff && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#e9edff] pb-3">
              <div>
                <h2 className="text-[17px] font-bold text-[#141b2b]">Staff Working Hours</h2>
                <p className="text-[12px] text-[#464555]">
                  Weekly schedule &amp; shift availability for {hoursModalStaff.name}
                </p>
              </div>
              <button
                onClick={() => setHoursModalStaff(null)}
                className="w-8 h-8 rounded-full bg-[#e9edff] flex items-center justify-center text-[#141b2b] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {staffHoursList.map(h => {
                const dayInfo = DAYS_OF_WEEK.find(d => d.day === h.day_of_week) || DAYS_OF_WEEK[0];

                return (
                  <div
                    key={h.day_of_week}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                      h.is_off ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-[#f9f9ff] border-[#e9edff]'
                    }`}
                  >
                    <div className="w-24">
                      <span className="text-[13px] font-bold text-[#141b2b] block">{dayInfo.label}</span>
                      <span className={`text-[10px] font-semibold uppercase ${h.is_off ? 'text-gray-500' : 'text-[#00702f]'}`}>
                        {h.is_off ? 'Day Off' : 'Working'}
                      </span>
                    </div>

                    {!h.is_off ? (
                      <div className="flex items-center gap-2 flex-1 justify-center">
                        <input
                          type="time"
                          value={h.start_time || '09:00'}
                          onChange={e => {
                            const val = e.target.value;
                            setStaffHoursList(prev =>
                              prev.map(item => item.day_of_week === h.day_of_week ? { ...item, start_time: val } : item)
                            );
                          }}
                          className="px-2 py-1 rounded-lg bg-white border border-[#e9edff] text-[12px] text-[#141b2b] font-mono"
                        />
                        <span className="text-[12px] text-[#464555]">to</span>
                        <input
                          type="time"
                          value={h.end_time || '19:00'}
                          onChange={e => {
                            const val = e.target.value;
                            setStaffHoursList(prev =>
                              prev.map(item => item.day_of_week === h.day_of_week ? { ...item, end_time: val } : item)
                            );
                          }}
                          className="px-2 py-1 rounded-lg bg-white border border-[#e9edff] text-[12px] text-[#141b2b] font-mono"
                        />
                      </div>
                    ) : (
                      <div className="flex-1 text-center text-[12px] text-gray-500 italic">
                        Not scheduled for client bookings
                      </div>
                    )}

                    <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={h.is_off}
                        onChange={e => {
                          const isOff = e.target.checked;
                          setStaffHoursList(prev =>
                            prev.map(item =>
                              item.day_of_week === h.day_of_week
                                ? {
                                    ...item,
                                    is_off: isOff,
                                    start_time: isOff ? null : '09:00',
                                    end_time: isOff ? null : '19:00'
                                  }
                                : item
                            )
                          );
                        }}
                        className="w-4 h-4 text-[#ba1a1a] rounded cursor-pointer"
                      />
                      <span className="text-[11px] font-semibold text-[#464555]">Off</span>
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#e9edff]">
              <button
                type="button"
                onClick={() => setHoursModalStaff(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#dee2ef] text-[#424751] text-[13px] font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveWorkingHoursSubmit}
                disabled={isSavingHours}
                className="flex-1 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[13px] font-semibold shadow-xs cursor-pointer disabled:opacity-60"
              >
                {isSavingHours ? 'Saving Schedule...' : 'Save Weekly Hours'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
