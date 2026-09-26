import React, { useState } from 'react';
import { INITIAL_STYLISTS } from '../data/mockData';

interface BusinessAnalyticsScreenProps {
  onTriggerToast: (msg: string, icon?: string) => void;
}

export const BusinessAnalyticsScreen: React.FC<BusinessAnalyticsScreenProps> = ({
  onTriggerToast
}) => {
  const [period, setPeriod] = useState<'7D' | '30D' | '90D' | 'Year'>('7D');

  const velocityPoints = [
    { day: 'Mon', rev: 12400, height: 50 },
    { day: 'Tue', rev: 15850, height: 65 },
    { day: 'Wed', rev: 11200, height: 45 },
    { day: 'Thu', rev: 18900, height: 78 },
    { day: 'Fri', rev: 22400, height: 90 },
    { day: 'Sat', rev: 24150, height: 100, peak: true },
    { day: 'Sun', rev: 8200, height: 32 }
  ];

  return (
    <div className="flex flex-col w-full pb-28 lg:pb-8 max-w-7xl mx-auto lg:px-6">
      {/* Analytics Header & Range Selector */}
      <section className="px-4 lg:px-0 pt-4 pb-2">
        <div className="p-4 rounded-2xl bg-white shadow-xs border border-[#e9edff] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#3525cd] uppercase tracking-wider">
              Studio Bloom Intelligence
            </span>
            <h1 className="text-[20px] font-bold text-[#141b2b] font-display">Performance</h1>
          </div>

          <div className="flex items-center bg-[#e9edff] p-0.5 rounded-xl">
            {(['7D', '30D', '90D', 'Year'] as const).map(p => (
              <button
                key={p}
                onClick={() => {
                  setPeriod(p);
                  onTriggerToast(`Updated analytics for ${p} range`, 'analytics');
                }}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  period === p ? 'bg-white text-[#3525cd] shadow-xs' : 'text-[#464555]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* KPI 4-Pack Cards */}
      <section className="px-4 lg:px-0 pt-2">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex flex-col gap-1">
            <div className="flex items-center justify-between text-[#464555]">
              <span className="text-[12px] font-semibold">Gross Revenue</span>
              <span className="material-symbols-outlined text-[18px] text-[#00702f]">trending_up</span>
            </div>
            <div className="text-[22px] font-bold text-[#141b2b] font-display">₱148,200</div>
            <span className="text-[11px] text-[#00702f] font-semibold">+22.4% vs prev period</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex flex-col gap-1">
            <div className="flex items-center justify-between text-[#464555]">
              <span className="text-[12px] font-semibold">Completed Appts</span>
              <span className="material-symbols-outlined text-[18px] text-[#3525cd]">verified</span>
            </div>
            <div className="text-[22px] font-bold text-[#141b2b] font-display">184</div>
            <span className="text-[11px] text-[#3525cd] font-semibold">+14 new clients</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex flex-col gap-1">
            <div className="flex items-center justify-between text-[#464555]">
              <span className="text-[12px] font-semibold">Avg Ticket</span>
              <span className="material-symbols-outlined text-[18px] text-[#3525cd]">receipt_long</span>
            </div>
            <div className="text-[22px] font-bold text-[#141b2b] font-display">₱805</div>
            <span className="text-[11px] text-[#00702f] font-semibold">+₱65 margin</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex flex-col gap-1">
            <div className="flex items-center justify-between text-[#464555]">
              <span className="text-[12px] font-semibold">Rebook Rate</span>
              <span className="material-symbols-outlined text-[18px] text-[#3525cd]">repeat</span>
            </div>
            <div className="text-[22px] font-bold text-[#141b2b] font-display">76%</div>
            <span className="text-[11px] text-[#00702f] font-semibold">Top tier salon</span>
          </div>
        </div>
      </section>

      {/* Analytics Content Grid: 2 Columns on Laptop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 px-4 lg:px-0">
        {/* Revenue Velocity Chart */}
        <section className="flex flex-col">
          <div className="p-4 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex flex-col gap-3 h-full">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-[#141b2b]">Revenue Velocity</h3>
                <p className="text-[11px] text-[#464555]">Daily collection trajectory</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#7ffc97] text-[#002109] text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">star</span>
                <span>Sat Peak: ₱24,150</span>
              </div>
            </div>

            {/* Bar Diagram */}
            <div className="h-44 flex items-end justify-between gap-2 pt-4">
              {velocityPoints.map((v, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[9px] font-bold text-[#464555]">
                    ₱{(v.rev / 1000).toFixed(1)}k
                  </span>
                  <div className="w-full bg-[#f1f3ff] rounded-lg h-32 relative flex items-end overflow-hidden">
                    <div
                      style={{ height: `${v.height}%` }}
                      className={`w-full rounded-t transition-all duration-500 ${
                        v.peak ? 'bg-[#3525cd] shadow-md' : 'bg-[#3525cd]/45 hover:bg-[#3525cd]/70'
                      }`}
                    ></div>
                  </div>
                  <span className={`text-[11px] font-bold ${v.peak ? 'text-[#3525cd]' : 'text-[#777587]'}`}>
                    {v.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stylist Efficiency Leaderboard */}
        <section className="flex flex-col">
          <div className="p-4 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex flex-col gap-3 h-full">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#141b2b]">Stylist Floor Efficiency</h3>
              <span className="text-[11px] text-[#464555]">Ranked by contribution</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {INITIAL_STYLISTS.map(st => (
                <div
                  key={st.id}
                  className="p-3 rounded-xl bg-[#f1f3ff] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <img referrerPolicy="no-referrer"  src={st.avatar} alt={st.name} className="w-10 h-10 rounded-full object-cover shadow-xs" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-[13px] font-bold text-[#141b2b]">{st.name}</h4>
                        {st.isTopEarner && (
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold">
                            Top Earner
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#464555]">{st.apptsCount} completed appts</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[14px] font-bold text-[#141b2b] font-display">
                      ₱{st.earnings.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-[#00702f] font-semibold">{st.goalPercentage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Top Performing Services Progress List */}
      <section className="px-4 lg:px-0 pt-4">
        <div className="p-4 rounded-2xl bg-white border border-[#e9edff] shadow-xs flex flex-col gap-3">
          <h3 className="text-[15px] font-bold text-[#141b2b]">Top Revenue Drivers</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between text-[13px] mb-1">
                <span className="font-bold text-[#141b2b]">Balayage &amp; Gloss Treatment</span>
                <span className="font-bold text-[#3525cd]">₱91,200 (36%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#f1f3ff] overflow-hidden">
                <div className="w-[36%] h-full bg-[#3525cd] rounded-full"></div>
              </div>
              <span className="text-[11px] text-[#464555] mt-0.5 block">38 bookings • Jamie Lim</span>
            </div>

            <div>
              <div className="flex items-center justify-between text-[13px] mb-1">
                <span className="font-bold text-[#141b2b]">Signature Haircut &amp; Wash</span>
                <span className="font-bold text-[#3525cd]">₱63,900 (25%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#f1f3ff] overflow-hidden">
                <div className="w-[25%] h-full bg-[#4f46e5] rounded-full"></div>
              </div>
              <span className="text-[11px] text-[#464555] mt-0.5 block">142 bookings • Maria Santos</span>
            </div>

            <div>
              <div className="flex items-center justify-between text-[13px] mb-1">
                <span className="font-bold text-[#141b2b]">Keratin Smooth Therapy</span>
                <span className="font-bold text-[#3525cd]">₱39,600 (15%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#f1f3ff] overflow-hidden">
                <div className="w-[15%] h-full bg-[#3525cd]/70 rounded-full"></div>
              </div>
              <span className="text-[11px] text-[#464555] mt-0.5 block">22 bookings • Jamie Lim</span>
            </div>

            <div>
              <div className="flex items-center justify-between text-[13px] mb-1">
                <span className="font-bold text-[#141b2b]">Gel Polish Manicure</span>
                <span className="font-bold text-[#3525cd]">₱29,700 (12%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#f1f3ff] overflow-hidden">
                <div className="w-[12%] h-full bg-[#3525cd]/50 rounded-full"></div>
              </div>
              <span className="text-[11px] text-[#464555] mt-0.5 block">54 bookings</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
