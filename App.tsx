import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Mail, Phone, CheckCircle2, MapPin, 
  Upload, Download, RefreshCcw, Moon, Sun, Search, 
  Linkedin, ListFilter, Globe, MessageSquare, Briefcase,
  LayoutDashboard, PieChart as ChartIcon, Users, Settings,
  ChevronRight, X, Filter, ArrowUpRight, Plus, Star
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, 
  Bar, XAxis, YAxis, Tooltip, AreaChart, Area
} from 'recharts';
import Papa from 'papaparse';
import { UploadModal } from './components/UploadModal';
import { loadDefaultData, calculateMetrics, parseCSV } from './services/dataService';
import { Company } from './types';

// Apple-inspired colors
const COLORS = {
  blue: '#0A84FF',
  green: '#30D158',
  orange: '#FF9500',
  red: '#FF453A',
  purple: '#BF5AF2',
  gray: '#8E8E93',
  darkBg: '#1C1C1E',
  lightBg: '#FFFFFF',
};

const App: React.FC = () => {
  const [data, setData] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'companies' | 'insights'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  // Advanced Filters
  const [filterType, setFilterType] = useState<'all' | 'staff' | 'clients'>('all');
  const [minScore, setMinScore] = useState(0);

  // Initialize data
  useEffect(() => {
    loadDefaultData().then(initialData => {
      setData(initialData);
      setLoading(false);
    });
  }, []);

  // Theme Effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Filter Data
  const filteredData = useMemo(() => {
    let result = data;
    
    // Type Filter
    if (filterType === 'staff') result = result.filter(c => c.isStaff);
    else if (filterType === 'clients') result = result.filter(c => !c.isStaff);

    // Score Filter
    if (minScore > 0) result = result.filter(c => c.leadScore >= minScore);

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.category.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, filterType, minScore, searchQuery]);

  const metrics = useMemo(() => calculateMetrics(filteredData), [filteredData]);

  const handleUpload = (file: File) => {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const newData = await parseCSV(text);
      setData(newData);
      setLoading(false);
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    if (filteredData.length === 0) return;
    const csvRows = filteredData.map(c => ({
      Name: c.name,
      Category: c.category,
      City: c.city,
      'Lead Score': c.leadScore,
      'Phone': c.phones.join('; '),
      'Email': c.emails.join('; '),
      'LinkedIn': c.linkedIns.join('; '),
      'Type': c.isStaff ? 'Service Provider' : 'Client'
    }));
    const csv = Papa.unparse(csvRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `lead_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white font-medium">Initializing Workspace...</div>;
  }

  return (
    <div className="flex h-screen w-full bg-[#F5F5F7] dark:bg-black text-gray-900 dark:text-gray-100 font-sans overflow-hidden transition-colors duration-300">
      
      {/* --- Sidebar Navigation --- */}
      <aside className="w-64 bg-[#F2F2F7]/50 dark:bg-[#1C1C1E]/50 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 flex flex-col pt-6 pb-4">
        <div className="px-6 mb-8 flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ChartIcon className="text-white" size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight">LeadAnalytics</span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Building2} label="Companies" active={activeTab === 'companies'} onClick={() => setActiveTab('companies')} />
          <SidebarItem icon={ChartIcon} label="Insights" active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} />
          
          <div className="mt-8 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Smart Groups</div>
          <SidebarItem icon={Star} label="High Value Leads" onClick={() => { setMinScore(80); setActiveTab('companies'); }} active={minScore === 80} />
          <SidebarItem icon={Mail} label="Missing Emails" onClick={() => { /* Logic would go here */ setActiveTab('companies'); }} />
        </nav>

        <div className="px-3 mt-auto space-y-2">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            <Upload size={18} />
            <span>Import Data</span>
          </button>
          <div className="flex items-center justify-between px-3 py-2">
             <div className="flex items-center space-x-2 text-sm text-gray-500">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
               <span>Online</span>
             </div>
             <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
               {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
             </button>
          </div>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 overflow-y-auto h-full p-6 lg:p-10 relative">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 text-gray-900 dark:text-white">
              {activeTab === 'dashboard' ? 'Overview' : activeTab === 'companies' ? 'Company Directory' : 'Market Insights'}
            </h1>
            <p className="text-gray-500 text-sm">Welcome back, here's what's happening today.</p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
               <input 
                 type="text" 
                 placeholder="Search..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="pl-10 pr-4 py-2 w-64 bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-white/10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400"
               />
             </div>
             <button onClick={handleExport} className="p-2 bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-white/10 rounded-full hover:scale-105 transition-transform text-gray-700 dark:text-gray-200">
               <Download size={18} />
             </button>
          </div>
        </header>

        {/* --- DASHBOARD VIEW --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Bento Grid KPI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <BentoCard title="Total Leads" value={metrics.totalCompanies} trend="+12% vs last month" icon={Users} color="blue" />
              <BentoCard title="Avg Lead Score" value={metrics.avgLeadScore} trend="High Quality" icon={Star} color="orange" />
              <BentoCard title="Email Coverage" value={`${metrics.emailCoverage}%`} trend={`${metrics.withEmailCount} valid`} icon={Mail} color="green" />
              <BentoCard title="Top Location" value={metrics.topLocations[0]?.name || 'N/A'} trend={`${metrics.topLocations[0]?.value || 0} leads`} icon={MapPin} color="purple" />
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-panel rounded-3xl p-6 h-96 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Lead Distribution by City</h3>
                  <button className="text-xs font-medium text-blue-500 hover:underline">View Report</button>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.topLocations} barSize={32}>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: theme === 'dark' ? '#8E8E93' : '#6b7280', fontSize: 12}} 
                      dy={10} 
                    />
                    <Tooltip 
                      cursor={{fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}} 
                      content={<CustomTooltip theme={theme} />} 
                    />
                    <Bar dataKey="value" fill={COLORS.blue} radius={[6, 6, 6, 6]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-panel rounded-3xl p-6 h-96 flex flex-col">
                <h3 className="font-semibold text-lg mb-6 text-gray-900 dark:text-white">Completeness</h3>
                <div className="flex-1 flex items-center justify-center relative">
                   <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Complete', value: metrics.completeness },
                          { name: 'Incomplete', value: 100 - metrics.completeness }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        startAngle={90}
                        endAngle={-270}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill={COLORS.green} />
                        <Cell fill={theme === 'dark' ? '#2C2C2E' : '#E5E5EA'} />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.completeness}%</span>
                    <span className="text-xs text-gray-500 font-medium uppercase">Quality</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions / Recent */}
            <div className="glass-panel rounded-3xl p-6">
               <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Recent Companies</h3>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-white/5">
                       <th className="pb-3 pl-2">Company</th>
                       <th className="pb-3">Score</th>
                       <th className="pb-3">Category</th>
                       <th className="pb-3">City</th>
                       <th className="pb-3 text-right">Action</th>
                     </tr>
                   </thead>
                   <tbody>
                     {filteredData.slice(0, 5).map((company, idx) => (
                       <tr key={idx} className="group hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedCompany(company)}>
                         <td className="py-3 pl-2 border-b border-gray-100 dark:border-white/5 font-medium text-gray-900 dark:text-gray-100">{company.name}</td>
                         <td className="py-3 border-b border-gray-100 dark:border-white/5">
                           <ScoreBadge score={company.leadScore} />
                         </td>
                         <td className="py-3 border-b border-gray-100 dark:border-white/5 text-gray-500">{company.category}</td>
                         <td className="py-3 border-b border-gray-100 dark:border-white/5 text-gray-500">{company.city}</td>
                         <td className="py-3 border-b border-gray-100 dark:border-white/5 text-right">
                           <button className="text-blue-500 hover:bg-blue-500/10 p-1.5 rounded-full transition-colors">
                             <ChevronRight size={16} />
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {/* --- COMPANIES VIEW --- */}
        {activeTab === 'companies' && (
          <div className="animate-fade-in space-y-6">
            <div className="flex space-x-2 pb-2 overflow-x-auto">
               <FilterButton label="All" active={filterType === 'all'} onClick={() => setFilterType('all')} />
               <FilterButton label="Service Providers" active={filterType === 'staff'} onClick={() => setFilterType('staff')} />
               <FilterButton label="Hiring Clients" active={filterType === 'clients'} onClick={() => setFilterType('clients')} />
               <div className="h-8 w-px bg-gray-300 dark:bg-white/20 mx-2"></div>
               <select 
                className="bg-transparent text-sm font-medium focus:outline-none text-gray-600 dark:text-gray-300 border-none"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
               >
                 <option value={0} className="bg-white dark:bg-[#1C1C1E]">Any Score</option>
                 <option value={50} className="bg-white dark:bg-[#1C1C1E]">Score 50+</option>
                 <option value={80} className="bg-white dark:bg-[#1C1C1E]">Score 80+ (High Value)</option>
               </select>
            </div>

            <div className="glass-panel rounded-3xl overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead className="bg-gray-50/50 dark:bg-white/5">
                     <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                       <th className="p-5">Company Name</th>
                       <th className="p-5">Lead Score</th>
                       <th className="p-5">Role</th>
                       <th className="p-5">Contact Info</th>
                       <th className="p-5">Location</th>
                     </tr>
                   </thead>
                   <tbody className="text-sm">
                     {filteredData.slice(0, 50).map((company, i) => ( // Limiting render for perf
                       <tr 
                        key={i} 
                        onClick={() => setSelectedCompany(company)}
                        className="border-b border-gray-100 dark:border-white/5 hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer transition-colors group"
                       >
                         <td className="p-5 font-medium text-gray-900 dark:text-gray-100">{company.name}</td>
                         <td className="p-5">
                            <div className="flex items-center space-x-2">
                               <div className="w-16 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 rounded-full" style={{width: `${company.leadScore}%`}}></div>
                               </div>
                               <span className="text-xs text-gray-500">{company.leadScore}</span>
                            </div>
                         </td>
                         <td className="p-5">
                           <span className={`px-2 py-1 rounded-md text-xs font-medium ${company.isStaff ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300'}`}>
                             {company.isStaff ? 'Provider' : 'Client'}
                           </span>
                         </td>
                         <td className="p-5">
                            <div className="flex space-x-2 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                              {company.hasEmail && <Mail size={16} />}
                              {company.hasPhone && <Phone size={16} />}
                              {company.hasLinkedIn && <Linkedin size={16} />}
                            </div>
                         </td>
                         <td className="p-5 text-gray-500">{company.city || '-'}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
               {filteredData.length > 50 && (
                 <div className="p-4 text-center text-xs text-gray-500">
                   Showing first 50 of {filteredData.length} results
                 </div>
               )}
            </div>
          </div>
        )}

        {/* --- INSIGHTS VIEW --- */}
        {activeTab === 'insights' && (
          <div className="animate-fade-in space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="glass-panel rounded-3xl p-8">
                 <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-white">Category Distribution</h3>
                 <p className="text-sm text-gray-500 mb-6">Top sectors in your current dataset.</p>
                 <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={metrics.topCategories}>
                        <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#0A84FF" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" hide />
                        <Tooltip content={<CustomTooltip theme={theme} />} />
                        <Area type="monotone" dataKey="value" stroke="#0A84FF" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="mt-4 space-y-3">
                   {metrics.topCategories.slice(0,5).map((cat, i) => (
                     <div key={i} className="flex justify-between text-sm items-center border-b border-gray-100 dark:border-white/5 pb-2">
                       <span className="font-medium text-gray-900 dark:text-gray-200">{cat.name}</span>
                       <span className="text-gray-500">{cat.value}</span>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="glass-panel rounded-3xl p-8">
                 <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-white">Contact Methods</h3>
                 <p className="text-sm text-gray-500 mb-6">Breakdown of available contact points.</p>
                 <div className="space-y-6">
                   <InsightRow label="Email Address" value={metrics.emailCoverage} color="bg-blue-500" icon={Mail} />
                   <InsightRow label="Phone Number" value={metrics.phoneCoverage} color="bg-green-500" icon={Phone} />
                   <InsightRow label="LinkedIn Profile" value={metrics.linkedInCoverage} color="bg-orange-500" icon={Linkedin} />
                 </div>
               </div>
             </div>
          </div>
        )}
      </main>

      {/* --- COMPANY DETAIL SLIDE-OVER (DRAWER) --- */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-[480px] bg-white dark:bg-[#1C1C1E] shadow-2xl border-l border-gray-200 dark:border-white/10 transform transition-transform duration-300 ease-in-out z-50 ${selectedCompany ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {selectedCompany && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-start">
               <div>
                  <div className="flex items-center space-x-2 mb-2">
                     <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${selectedCompany.isStaff ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {selectedCompany.isStaff ? 'Service Provider' : 'Hiring Client'}
                     </span>
                     <ScoreBadge score={selectedCompany.leadScore} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCompany.name}</h2>
                  <p className="text-gray-500 text-sm flex items-center mt-1">
                    <MapPin size={14} className="mr-1" /> {selectedCompany.city} • {selectedCompany.category}
                  </p>
               </div>
               <button onClick={() => setSelectedCompany(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500">
                 <X size={20} />
               </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
               
               {/* Quick Actions */}
               <div className="grid grid-cols-2 gap-3">
                 <button className="flex items-center justify-center space-x-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/30">
                    <Mail size={16} /> <span>Email Now</span>
                 </button>
                 <button className="flex items-center justify-center space-x-2 py-2.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-xl font-medium transition-colors text-gray-900 dark:text-white">
                    <Phone size={16} /> <span>Call</span>
                 </button>
               </div>

               {/* Contact Info */}
               <section>
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Contact Information</h3>
                 <div className="space-y-4">
                    <DetailRow icon={Mail} label="Emails" values={selectedCompany.emails} empty="No emails found" />
                    <DetailRow icon={Phone} label="Phones" values={selectedCompany.phones} empty="No phones found" />
                    <DetailRow icon={Linkedin} label="LinkedIn" values={selectedCompany.linkedIns} empty="No profiles found" isLink />
                    <DetailRow icon={MessageSquare} label="WhatsApp" values={selectedCompany.whatsapps} empty="No numbers found" />
                 </div>
               </section>

               {/* Metadata */}
               <section>
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Metadata</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                       <div className="text-xs text-gray-500 mb-1">Source</div>
                       <div className="font-medium text-gray-900 dark:text-white">CSV Import</div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                       <div className="text-xs text-gray-500 mb-1">Maps URL</div>
                       {selectedCompany.googleMapsUrl ? (
                         <a href={selectedCompany.googleMapsUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center text-sm">
                           View Map <ArrowUpRight size={12} className="ml-1" />
                         </a>
                       ) : <span className="text-sm text-gray-400">N/A</span>}
                    </div>
                 </div>
               </section>
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#1C1C1E]">
               <button className="w-full py-3 border border-gray-300 dark:border-white/20 rounded-xl text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/5 transition-colors">
                 Edit Company Details
               </button>
            </div>
          </div>
        )}
      </div>

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

// --- Helper Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      active 
        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10'
    }`}
  >
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

const BentoCard = ({ title, value, trend, icon: Icon, color }: any) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 cursor-default">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl ${colorMap[color]} flex items-center justify-center text-white shadow-lg`}>
          <Icon size={20} />
        </div>
        {/* <span className="px-2 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-wide text-gray-500">KPI</span> */}
      </div>
      <div>
        <h3 className="text-3xl font-bold tracking-tight mb-1 text-gray-900 dark:text-white">{value}</h3>
        <div className="flex justify-between items-end">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <span className="text-xs font-semibold text-green-500">{trend}</span>
        </div>
      </div>
    </div>
  );
};

const FilterButton = ({ label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
      active 
      ? 'bg-black dark:bg-white text-white dark:text-black shadow-md' 
      : 'bg-white dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/20'
    }`}
  >
    {label}
  </button>
);

const ScoreBadge = ({ score }: { score: number }) => {
  let color = 'bg-gray-100 text-gray-600';
  if (score >= 80) color = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  else if (score >= 50) color = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
  
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${color}`}>
      {score} / 100
    </span>
  );
};

const DetailRow = ({ icon: Icon, label, values, empty, isLink }: any) => (
  <div className="flex items-start space-x-4">
    <div className="mt-1 p-2 bg-gray-50 dark:bg-white/5 rounded-lg text-gray-400">
      <Icon size={16} />
    </div>
    <div className="flex-1">
      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{label}</div>
      {values && values.length > 0 ? (
        <div className="space-y-1">
          {values.map((v: string, i: number) => (
            <div key={i} className="text-sm text-gray-500 break-all">
              {isLink ? (
                <a href={v} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{v}</a>
              ) : v}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-400 italic">{empty}</div>
      )}
    </div>
  </div>
);

const InsightRow = ({ label, value, color, icon: Icon }: any) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <div className={`p-2 rounded-lg text-white shadow-md ${color}`}>
        <Icon size={16} />
      </div>
      <span className="font-medium text-gray-900 dark:text-white">{label}</span>
    </div>
    <div className="flex items-center space-x-3">
      <div className="w-32 h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }}></div>
      </div>
      <span className="text-sm font-bold w-8 text-right text-gray-900 dark:text-white">{value}%</span>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label, theme }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={`
        backdrop-blur-md p-3 rounded-xl shadow-xl border 
        ${theme === 'dark' ? 'bg-[#1C1C1E]/90 border-white/10 text-white' : 'bg-white/90 border-gray-100 text-gray-900'}
      `}>
        <p className="text-sm font-bold mb-1">{label}</p>
        <p className="text-sm text-blue-500">
          {payload[0].value} units
        </p>
      </div>
    );
  }
  return null;
};

export default App;