import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Palette,
  Settings,
  Activity,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  RotateCcw,
  Download,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import {
  AdminStats,
  ColorRule,
  ColorRuleType,
  DayOfWeekKey,
  SystemSettings,
  UserProfile,
  DAY_INFO_LIST,
} from '../types';
import { api } from '../services/api';

interface AdminViewProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onExitAdmin: () => void;
}

type AdminTab = 'dashboard' | 'members' | 'rules' | 'settings' | 'logs' | 'database';

export const AdminView: React.FC<AdminViewProps> = ({ onShowToast, onExitAdmin }) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [rules, setRules] = useState<ColorRule[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [memberSearch, setMemberSearch] = useState('');
  const [ruleDayFilter, setRuleDayFilter] = useState<string>('all');
  const [ruleTypeFilter, setRuleTypeFilter] = useState<string>('all');

  // Rule Form Modal State
  const [editingRule, setEditingRule] = useState<ColorRule | null>(null);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [ruleFormDay, setRuleFormDay] = useState<DayOfWeekKey>('sunday');
  const [ruleFormName, setRuleFormName] = useState('');
  const [ruleFormHex, setRuleFormHex] = useState('#DC2626');
  const [ruleFormType, setRuleFormType] = useState<ColorRuleType>('recommended');
  const [ruleFormPriority, setRuleFormPriority] = useState(1);
  const [ruleFormDesc, setRuleFormDesc] = useState('');

  // Load Admin Data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [s, m, r, st, l] = await Promise.all([
        api.getAdminDashboard(),
        api.getAdminMembers(),
        api.getAdminRules(),
        api.getSettings(),
        api.getAdminLogs(),
      ]);
      setStats(s);
      setMembers(m.members);
      setRules(r.rules);
      setSettings(st.settings);
      setLogs(l.logs);
    } catch (err: any) {
      console.error(err);
      onShowToast(err.message || 'ไม่สามารถโหลดข้อมูล Admin ได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Members Actions
  const handleToggleMember = async (id: string) => {
    try {
      const res = await api.toggleMemberStatus(id);
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: res.status as any } : m))
      );
      onShowToast(`เปลี่ยนสถานะสมาชิกเป็น ${res.status} แล้ว`, 'success');
    } catch (err: any) {
      onShowToast('เกิดข้อผิดพลาด', 'error');
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสมาชิกนี้?')) return;
    try {
      await api.deleteMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      onShowToast('ลบสมาชิกเรียบร้อยแล้ว', 'info');
    } catch (err) {
      onShowToast('ไม่สามารถลบได้', 'error');
    }
  };

  // Rule Actions
  const handleOpenNewRule = () => {
    setEditingRule(null);
    setRuleFormDay('sunday');
    setRuleFormName('');
    setRuleFormHex('#3B82F6');
    setRuleFormType('recommended');
    setRuleFormPriority(1);
    setRuleFormDesc('');
    setIsRuleModalOpen(true);
  };

  const handleOpenEditRule = (rule: ColorRule) => {
    setEditingRule(rule);
    setRuleFormDay(rule.dayOfWeek);
    setRuleFormName(rule.colorName);
    setRuleFormHex(rule.hexCode);
    setRuleFormType(rule.type);
    setRuleFormPriority(rule.priority);
    setRuleFormDesc(rule.description);
    setIsRuleModalOpen(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRule) {
        const res = await api.updateRule(editingRule.id, {
          dayOfWeek: ruleFormDay,
          colorName: ruleFormName,
          hexCode: ruleFormHex,
          type: ruleFormType,
          priority: ruleFormPriority,
          description: ruleFormDesc,
        });
        setRules((prev) => prev.map((r) => (r.id === editingRule.id ? res.rule : r)));
        onShowToast('แก้ไขกฎสีสำเร็จ ✓', 'success');
      } else {
        const res = await api.createRule({
          dayOfWeek: ruleFormDay,
          colorName: ruleFormName,
          hexCode: ruleFormHex,
          type: ruleFormType,
          priority: ruleFormPriority,
          description: ruleFormDesc,
        });
        setRules((prev) => [...prev, res.rule]);
        onShowToast('เพิ่มกฎสีใหม่สำเร็จ ✓', 'success');
      }
      setIsRuleModalOpen(false);
    } catch (err: any) {
      onShowToast(err.message || 'บันทึกกฎสีไม่สำเร็จ', 'error');
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('คุณแน่ใจว่าต้องการลบกฎสีนี้?')) return;
    try {
      await api.deleteRule(id);
      setRules((prev) => prev.filter((r) => r.id !== id));
      onShowToast('ลบกฎสีเรียบร้อยแล้ว', 'info');
    } catch (err) {
      onShowToast('ไม่สามารถลบได้', 'error');
    }
  };

  const handleResetRules = async () => {
    if (
      !confirm(
        'ต้องการคืนค่ากฎสีตั้งต้น (Seed Data) หรือไม่? การเปลี่ยนแปลงกฎสีก่อนหน้าจะถูกรีเซ็ต'
      )
    )
      return;
    try {
      const res = await api.resetRulesToSeed();
      setRules(res.rules);
      onShowToast('คืนค่ากฎสีตั้งต้นสำเร็จ ✓', 'success');
    } catch (err) {
      onShowToast('เกิดข้อผิดพลาด', 'error');
    }
  };

  // Settings Actions
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await api.updateSettings(settings);
      onShowToast('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว ✓', 'success');
    } catch (err) {
      onShowToast('ไม่สามารถบันทึกได้', 'error');
    }
  };

  const filteredRules = rules.filter((r) => {
    const matchDay = ruleDayFilter === 'all' || r.dayOfWeek === ruleDayFilter;
    const matchType = ruleTypeFilter === 'all' || r.type === ruleTypeFilter;
    return matchDay && matchType;
  });

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Admin Top Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-stone-900 rounded-3xl p-6 text-white flex items-center justify-between flex-wrap gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-purple-300">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">Admin Management Suite</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Online Production
              </span>
            </div>
            <p className="text-xs text-purple-200/80">
              ควบคุมฐานข้อมูลกฎสี สมาชิก สถิติระบบ และการตั้งค่าโดยตรง
            </p>
          </div>
        </div>

        <button
          onClick={onExitAdmin}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors cursor-pointer border border-white/20"
        >
          ← กลับไปหน้า User
        </button>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 bg-stone-100 rounded-2xl overflow-x-auto">
        {[
          { key: 'dashboard', label: 'Dashboard', icon: BarChart2 },
          { key: 'members', label: `สมาชิก (${members.length})`, icon: Users },
          { key: 'rules', label: `กฎสี (${rules.length})`, icon: Palette },
          { key: 'settings', label: 'ตั้งค่าระบบ', icon: Settings },
          { key: 'logs', label: 'บันทึกกิจกรรม', icon: Activity },
          { key: 'database', label: 'SQL / DB Schema', icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setCurrentTab(tab.key as AdminTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD */}
      {currentTab === 'dashboard' && stats && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {[
              {
                title: 'สมาชิกทั้งหมด',
                value: stats.totalMembers,
                sub: `ใช้งานอยู่ ${stats.activeMembers} คน`,
                color: 'text-purple-600',
              },
              {
                title: 'สมาชิกใหม่',
                value: stats.newMembers,
                sub: 'สัปดาห์นี้',
                color: 'text-emerald-600',
              },
              {
                title: 'การ Match สีทั้งหมด',
                value: stats.totalMatches,
                sub: `วันนี้ ${stats.todayMatches} ครั้ง`,
                color: 'text-rose-600',
              },
              {
                title: 'ชุดที่บันทึกไว้',
                value: stats.savedOutfitsCount,
                sub: 'ในระบบ',
                color: 'text-amber-600',
              },
            ].map((m, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-stone-200 p-4 shadow-xs">
                <div className="text-xs font-medium text-stone-500">{m.title}</div>
                <div className={`text-2xl font-black mt-1 ${m.color}`}>{m.value}</div>
                <div className="text-[11px] text-stone-400 mt-0.5">{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Popular Insights Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Popular Colors */}
            <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-purple-600" />
                <span>สียอดนิยมที่ผู้ใช้จับคู่</span>
              </h3>
              <div className="space-y-2.5">
                {stats.popularColors.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-md border border-black/10"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="font-semibold text-stone-800">{c.name}</span>
                    </div>
                    <span className="font-mono text-stone-400">{c.count} ครั้ง</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Styles */}
            <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-rose-500" />
                <span>สไตล์ที่ได้รับความนิยม</span>
              </h3>
              <div className="space-y-2.5">
                {stats.popularStyles.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800">{s.name}</span>
                    <span className="font-mono text-stone-500">{s.count} ผู้ใช้งาน</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Occasions */}
            <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>โอกาสในการแต่งตัว</span>
              </h3>
              <div className="space-y-2.5">
                {stats.popularOccasions.map((o, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800">{o.name}</span>
                    <span className="font-mono text-stone-500">{o.count} ครั้ง</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Growth Data Table / Visual representation */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wide mb-3">
              แนวโน้มการเติบโตของผู้ใช้และการแมทช์สี (Growth & Daily Activity)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              {stats.growthData.map((g, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
                  <div className="text-xs font-bold text-stone-800">{g.month}</div>
                  <div className="text-sm font-black text-purple-600 mt-1">+{g.members} สมาชิก</div>
                  <div className="text-[11px] text-stone-500">{g.matches} ครั้ง</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MEMBERS */}
      {currentTab === 'members' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-base font-bold text-stone-900">จัดการสมาชิก (Members Management)</h2>
              <p className="text-xs text-stone-500">ตรวจสอบรายชื่อ ค้นหา และระงับบัญชีผู้ใช้</p>
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ หรือ อีเมล..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-purple-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase border-b border-stone-200">
                <tr>
                  <th className="p-3">สมาชิก</th>
                  <th className="p-3">วันเกิด / สไตล์</th>
                  <th className="p-3">วันที่สมัคร</th>
                  <th className="p-3">สถานะ</th>
                  <th className="p-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-stone-50/50">
                    <td className="p-3">
                      <div className="font-bold text-stone-800">{m.name}</div>
                      <div className="text-[11px] text-stone-400">{m.email}</div>
                    </td>
                    <td className="p-3">
                      <div>{m.birthday || '-'}</div>
                      <div className="text-[11px] text-purple-600 font-semibold">{m.preferredStyle}</div>
                    </td>
                    <td className="p-3 text-stone-500">
                      {new Date(m.createdAt).toLocaleDateString('th-TH')}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1.5">
                      <button
                        onClick={() => handleToggleMember(m.id)}
                        className="px-2.5 py-1 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 cursor-pointer"
                      >
                        {m.status === 'active' ? 'ระงับ' : 'เปิดใช้งาน'}
                      </button>
                      <button
                        onClick={() => handleDeleteMember(m.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                        title="ลบบัญชี"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COLOR RULES */}
      {currentTab === 'rules' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                จัดการกฎสีในฐานข้อมูล (Color Rules Management)
              </h2>
              <p className="text-xs text-stone-500">
                แก้ไขสีมงคล สีกาลกิณี และลำดับ Priority ได้อย่างอิสระโดยไม่ต้องแก้ไข Code
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetRules}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>คืนค่า Seed</span>
              </button>

              <button
                onClick={handleOpenNewRule}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มกฎสีใหม่</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-stone-100">
            <div className="flex items-center gap-1.5 text-xs text-stone-600">
              <span>วัน:</span>
              <select
                value={ruleDayFilter}
                onChange={(e) => setRuleDayFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-stone-200 text-xs bg-white"
              >
                <option value="all">ทุกวัน ({rules.length})</option>
                {DAY_INFO_LIST.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.thaiName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-stone-600">
              <span>ประเภท:</span>
              <select
                value={ruleTypeFilter}
                onChange={(e) => setRuleTypeFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-stone-200 text-xs bg-white"
              >
                <option value="all">ทุกประเภท</option>
                <option value="recommended">สีมงคลหลัก (recommended)</option>
                <option value="secondary">สีมงคลรอง (secondary)</option>
                <option value="avoid">ควรเลี่ยง (avoid)</option>
                <option value="kali">สีกาลกิณี (kali)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase border-b border-stone-200">
                <tr>
                  <th className="p-3">สี & HEX</th>
                  <th className="p-3">วัน</th>
                  <th className="p-3">ประเภท</th>
                  <th className="p-3">คำอธิบาย</th>
                  <th className="p-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredRules.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded-lg border border-black/10 shadow-inner shrink-0"
                          style={{ backgroundColor: r.hexCode }}
                        />
                        <div>
                          <div className="font-bold text-stone-800">{r.colorName}</div>
                          <div className="text-[11px] font-mono text-stone-400">{r.hexCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-stone-700 capitalize">
                      {DAY_INFO_LIST.find((d) => d.key === r.dayOfWeek)?.thaiName || r.dayOfWeek}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.type === 'recommended'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : r.type === 'secondary'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : r.type === 'avoid'
                            ? 'bg-stone-100 text-stone-600'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {r.type === 'kali' ? '🛡️ กาลกิณี (ตัดออก)' : r.type}
                      </span>
                    </td>
                    <td className="p-3 text-stone-500 max-w-xs truncate">{r.description}</td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEditRule(r)}
                        className="p-1.5 text-stone-500 hover:text-purple-600 rounded-lg hover:bg-stone-100 cursor-pointer"
                        title="แก้ไขกฎสี"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(r.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                        title="ลบกฎสี"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS */}
      {currentTab === 'settings' && settings && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-stone-900 pb-2 border-b border-stone-100">
            การตั้งค่าระบบ (General & Matching Settings)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">ชื่อเว็บไซต์</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">เกณฑ์ขั้นต่ำ Color Harmony (%)</label>
              <input
                type="number"
                min="50"
                max="99"
                value={settings.harmonyThreshold}
                onChange={(e) => setSettings({ ...settings, harmonyThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
              />
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <div className="text-xs font-semibold text-stone-700 mb-2">ฟีเจอร์และ Animation</div>
            <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableWelcomePopup}
                onChange={(e) => setSettings({ ...settings, enableWelcomePopup: e.target.checked })}
                className="rounded-sm"
              />
              <span>เปิดใช้งาน Welcome Modal เมื่อเข้าเว็บไซต์ครั้งแรก</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableResultConfetti}
                onChange={(e) => setSettings({ ...settings, enableResultConfetti: e.target.checked })}
                className="rounded-sm"
              />
              <span>แสดง Confetti Animation เมื่อสร้างชุดสำเร็จ</span>
            </label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-xs transition-colors cursor-pointer"
            >
              บันทึกการตั้งค่า
            </button>
          </div>
        </form>
      )}

      {/* TAB 5: LOGS */}
      {currentTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-stone-900 pb-2 border-b border-stone-100">
            บันทึกการทำงานของระบบ (Activity Logs)
          </h2>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-purple-700 font-mono">{log.action}</span>
                  <span className="text-[10px] text-stone-400">
                    {new Date(log.timestamp).toLocaleString('th-TH')}
                  </span>
                </div>
                <div className="text-stone-700 mt-1">{log.details}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: DATABASE & SQL */}
      {currentTab === 'database' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Database Schema & Production Deployment
              </h2>
              <p className="text-xs text-stone-500">
                สคริปต์ SQL พร้อมใช้งานสำหรับนำไป Deploy บน Supabase PostgreSQL หรือ Cloud SQL
              </p>
            </div>
            <a
              href="/api/export-sql"
              download="daily_color_match_schema.sql"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลด .SQL</span>
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-stone-900 text-stone-200 font-mono text-xs overflow-x-auto max-h-96">
            <pre>{`-- Supabase / PostgreSQL DDL
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  birthday DATE,
  birth_day_of_week TEXT,
  preferred_style TEXT DEFAULT 'Minimal',
  status TEXT DEFAULT 'active'
);

CREATE TABLE public.color_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week TEXT NOT NULL,
  color_name TEXT NOT NULL,
  hex_code VARCHAR(7) NOT NULL,
  type TEXT CHECK (type IN ('recommended', 'secondary', 'avoid', 'kali')),
  priority INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE public.saved_outfits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  target_date DATE NOT NULL,
  combination JSONB NOT NULL
);`}</pre>
          </div>
        </div>
      )}

      {/* Rule Add/Edit Modal */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">
                {editingRule ? 'แก้ไขกฎสี' : 'เพิ่มกฎสีใหม่'}
              </h3>
              <button
                onClick={() => setIsRuleModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">วันประจำสัปดาห์</label>
                <select
                  value={ruleFormDay}
                  onChange={(e) => setRuleFormDay(e.target.value as DayOfWeekKey)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white"
                >
                  {DAY_INFO_LIST.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.thaiName} ({d.label})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">ชื่อสี (ภาษาไทย)</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น แดงทับทิม"
                    value={ruleFormName}
                    onChange={(e) => setRuleFormName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">รหัสสี (HEX)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={ruleFormHex}
                      onChange={(e) => setRuleFormHex(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-stone-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      required
                      value={ruleFormHex}
                      onChange={(e) => setRuleFormHex(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs font-mono rounded-xl border border-stone-200"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">ประเภทกฎสี</label>
                  <select
                    value={ruleFormType}
                    onChange={(e) => setRuleFormType(e.target.value as ColorRuleType)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="recommended">สีมงคลหลัก (recommended)</option>
                    <option value="secondary">สีมงคลรอง (secondary)</option>
                    <option value="avoid">ควรเลี่ยง (avoid)</option>
                    <option value="kali">สีกาลกิณี (kali - ตัดออก)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Priority (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={ruleFormPriority}
                    onChange={(e) => setRuleFormPriority(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">คำอธิบายเหตุผลมงคล</label>
                <textarea
                  rows={2}
                  value={ruleFormDesc}
                  onChange={(e) => setRuleFormDesc(e.target.value)}
                  placeholder="เช่น เสริมอำนาจบารมีและการเงิน..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-2 text-xs text-stone-500 hover:text-stone-700"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
                >
                  บันทึกกฎสี
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
