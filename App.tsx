import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Mail, Phone, CheckCircle2, MapPin, 
  Upload, Download, RefreshCcw, Moon, Sun, Search, 
  Linkedin, ListFilter, Globe, MessageSquare, Briefcase 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, 
  Bar, XAxis, YAxis, Tooltip, Rectangle 
} from 'recharts';
import { UploadModal } from './components/UploadModal';
import { loadDefaultData, calculateMetrics, parseCSV } from './services/dataService';
import { Company } from './types';

// Constants for charts
const COLORS = {
  email: '#3b82f6',
  phone: '#10b981',
  linkedin: '#f59e0b',
  multiple: '#8b5cf6',
  background: '#18181b', // surface
  chartBg: '#27272a'
};

const PIE_DATA = [
  { name: 'Covered', value: 100 }
];

const App: React.FC = () => {
  const [data, setData] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'staff' | 'clients'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Initialize data
  useEffect(() => {
    loadDefaultData().then(initialData => {
      setData(initialData);
      setLoading(false);
    });
  }, []);

  // Filter Data based on viewMode
  const filteredData = useMemo(() => {
    let result = data;
    if (viewMode === 'staff') {
      result = data.filter(c => c.isStaff);
    } else if (viewMode === 'clients') {
      result = data.filter(c => !c.isStaff);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.category.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, viewMode, searchQuery]);

  // Calculate Metrics based on filtered data
  const metrics = useMemo(() => calculateMetrics(filteredData), [filteredData]);

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const newData = await parseCSV(text);
      setData(newData);
    };
    reader.readAsText(file);
  };

  const donutData = [
    { name: 'Email Only', value: metrics.distribution.emailOnly, color: COLORS.email },
    { name: 'Phone Only', value: metrics.distribution.phoneOnly, color: COLORS.phone },
    { name: 'LinkedIn Only', value: metrics.distribution.linkedInOnly, color: COLORS.linkedin },
    { name: 'Multiple', value: metrics.distribution.multiple, color: COLORS.multiple },
  ];

  // Pagination for table
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Pagination Logic Helper
  const getPaginationGroup = () => {
    let start = Math.floor((currentPage - 1) / 5) * 5;
    return new Array(Math.min(5, totalPages - start)).fill(0).map((_, i) => start + i + 1);
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0f0f11] text-gray-200 font-sans pb-10">
      
      {/* --- Top Navigation Bar --- */}
      <header className="sticky top-0 z-30 bg-[#0f0f11]/95 backdrop-blur-md border-b border-[#27272a] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Analytics</h1>
          <div className="flex items-center text-sm text-gray-400 mt-1 space-x-2">
            <span className="flex items-center text-green-500">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              Live
            </span>
            <span>•</span>
            <span>{new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 overflow-x-auto">
          <div className="flex bg-[#18181b] rounded-lg p-1 border border-[#27272a]">
            <button 
              onClick={() => setViewMode('all')}
              className={`px-4 py-1.5 text-sm rounded-md font-medium transition-all ${viewMode === 'all' ? 'bg-[#27272a] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              All
            </button>
            <button 
              onClick={() => setViewMode('staff')}
              className={`px-4 py-1.5 text-sm rounded-md font-medium transition-all flex items-center space-x-2 ${viewMode === 'staff' ? 'bg-[#27272a] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              <Briefcase size={14} className="mr-1.5" /> Staff & Services
            </button>
            <button 
              onClick={() => setViewMode('clients')}
              className={`px-4 py-1.5 text-sm rounded-md font-medium transition-all flex items-center space-x-2 ${viewMode === 'clients' ? 'bg-[#27272a] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
               <Building2 size={14} className="mr-1.5" /> Hiring Clients
            </button>
          </div>

          <div className="h-6 w-px bg-[#27272a] mx-2"></div>

          <button className="p-2 text-gray-400 hover:text-white bg-[#18181b] rounded-lg border border-[#27272a] transition-colors">
            <Moon size={18} />
          </button>
          
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#18181b] hover:bg-[#27272a] text-white rounded-lg border border-[#27272a] text-sm font-medium transition-all"
          >
            <Upload size={16} />
            <span>Upload</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-[#18181b] hover:bg-[#27272a] text-white rounded-lg border border-[#27272a] text-sm font-medium transition-all">
            <Download size={16} />
            <span>Export</span>
          </button>

          <button className="flex items-center space-x-2 px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-lg text-sm font-bold transition-all">
            <RefreshCcw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      <main className="px-6 py-8 max-w-[1600px] mx-auto space-y-6">
        
        {/* --- KPI Cards Row --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard icon={Building2} label="TOTAL COMPANIES" value={metrics.totalCompanies} sub="" />
          <KpiCard icon={Mail} label="WITH EMAIL" value={metrics.withEmailCount} sub={`${metrics.emailCoverage}% coverage`} />
          <KpiCard icon={Phone} label="WITH PHONE" value={metrics.withPhoneCount} sub={`${metrics.phoneCoverage}% coverage`} />
          <KpiCard icon={CheckCircle2} label="COMPLETENESS" value={`${metrics.completeness}%`} sub="" />
          <KpiCard icon={MapPin} label="LOCATIONS" value={metrics.locationCount} sub={`${metrics.locationCount} cities`} />
        </div>

        {/* --- Charts Row 1 --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Data Source Card */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#27272a] rounded-lg text-gray-400">
                  <ListFilter size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Data Source</h3>
                  <p className="text-xs text-gray-500">Provider breakdown</p>
                </div>
              </div>
            </div>
            <div className="h-48 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PIE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                     <Cell key="cell-0" fill="#ffffff" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-2xl font-bold text-white">100%</span>
                 <span className="text-xs text-gray-500 uppercase tracking-wider">Coverage</span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 text-sm border-t border-[#27272a] pt-4">
               <div className="flex items-center space-x-2">
                 <div className="w-2 h-2 rounded-full bg-white"></div>
                 <span className="text-gray-400">Google Maps</span>
               </div>
               <span className="font-semibold">{metrics.totalCompanies}</span>
            </div>
          </div>

          {/* Contact Quality Card */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#27272a] rounded-lg text-gray-400">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Contact Quality</h3>
                  <p className="text-xs text-gray-500">Data availability rates</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <QualityBar label="Email" count={metrics.withEmailCount} percentage={metrics.emailCoverage} />
              <QualityBar label="Phone" count={metrics.withPhoneCount} percentage={metrics.phoneCoverage} />
              <QualityBar label="LinkedIn" count={filteredData.filter(c => c.hasLinkedIn).length} percentage={metrics.linkedInCoverage} />
            </div>

            <div className="flex justify-between items-center mt-8 pt-4 border-t border-[#27272a]">
              <span className="text-sm text-gray-500 uppercase font-medium">Overall</span>
              <span className="text-2xl font-bold text-white">{metrics.completeness}%</span>
            </div>
          </div>

          {/* Distribution Card */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#27272a] rounded-lg text-gray-400">
                  <PieChartIcon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Distribution</h3>
                  <p className="text-xs text-gray-500">Contact breakdown</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#27272a', borderColor: '#3f3f46', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs mt-2">
              {donutData.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                   <span className="text-gray-400">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- Charts Row 2 --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Categories */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
             <div className="flex justify-between items-start mb-6">
               <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#27272a] rounded-lg text-gray-400">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Top Categories</h3>
                    <p className="text-xs text-gray-500">Top {metrics.topCategories.length} industries</p>
                  </div>
               </div>
               <div className="text-right">
                 <div className="text-2xl font-bold">{metrics.topCategories.reduce((acc, curr) => acc + curr.value, 0)}</div>
                 <div className="text-[10px] text-gray-500 uppercase tracking-widest">Entries</div>
               </div>
             </div>
             
             <div className="space-y-4">
                {metrics.topCategories.map((cat, idx) => {
                   const maxVal = metrics.topCategories[0]?.value || 1;
                   const width = (cat.value / maxVal) * 100;
                   // Cycle through bright colors
                   const colors = ['#3b82f6', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#6366f1', '#10b981'];
                   const color = colors[idx % colors.length];

                   return (
                     <div key={idx} className="flex items-center text-xs">
                        <div className="w-24 truncate text-gray-400 mr-2" title={cat.name}>{cat.name}</div>
                        <div className="flex-1 h-3 bg-[#27272a] rounded-full overflow-hidden">
                           <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: color }}></div>
                        </div>
                     </div>
                   );
                })}
             </div>
          </div>

          {/* Top Locations */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
             <div className="flex justify-between items-start mb-6">
               <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#27272a] rounded-lg text-gray-400">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Top Locations</h3>
                    <p className="text-xs text-gray-500">Top {metrics.topLocations.length} cities</p>
                  </div>
               </div>
               <div className="text-right">
                 <div className="text-2xl font-bold">{metrics.totalCompanies}</div>
                 <div className="text-[10px] text-gray-500 uppercase tracking-widest">Total</div>
               </div>
             </div>

             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.topLocations} barSize={20}>
                    <Tooltip 
                       cursor={{fill: 'rgba(255,255,255,0.05)'}}
                       contentStyle={{ backgroundColor: '#27272a', borderColor: '#3f3f46', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="value" fill="#ffffff" radius={[4, 4, 0, 0]} activeBar={<Rectangle fill="#3b82f6" />} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#71717a', fontSize: 10}} 
                      interval={0}
                    />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* --- Contact Directory --- */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
           <div className="mb-6">
             <h2 className="text-lg font-bold text-white">Contact Directory</h2>
             <p className="text-sm text-gray-500">Quick access to collected contact information</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Emails */}
              <ContactList 
                 icon={Mail} 
                 title="Email Addresses" 
                 count={filteredData.flatMap(c => c.emails).length} 
                 items={filteredData.flatMap(c => c.emails).filter(Boolean)} 
                 limit={6}
                 colorClass="text-blue-500 hover:text-blue-400"
              />
              {/* Phones */}
              <ContactList 
                 icon={Phone} 
                 title="Phone Numbers" 
                 count={filteredData.flatMap(c => c.phones).length} 
                 items={filteredData.flatMap(c => c.phones).filter(Boolean)} 
                 limit={6}
                 colorClass="text-blue-500 hover:text-blue-400"
              />
              {/* LinkedIn */}
              <ContactList 
                 icon={Linkedin} 
                 title="LinkedIn Profiles" 
                 count={filteredData.filter(c => c.hasLinkedIn).length} 
                 items={filteredData.flatMap(c => c.linkedIns).filter(Boolean)} 
                 limit={6}
                 colorClass="text-blue-500 hover:text-blue-400"
                 isLink
              />
              {/* WhatsApp */}
              <ContactList 
                 icon={MessageSquare} 
                 title="WhatsApp Numbers" 
                 count={filteredData.flatMap(c => c.whatsapps).length} 
                 items={filteredData.flatMap(c => c.whatsapps).filter(Boolean)} 
                 limit={6}
                 colorClass="text-blue-500 hover:text-blue-400"
                 emptyText="No WhatsApp numbers available"
              />
           </div>
        </div>

        {/* --- Companies Table --- */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#27272a] flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
               <h2 className="font-bold text-white">Companies</h2>
               <p className="text-xs text-gray-500">{filteredData.length} of {data.length} results</p>
             </div>
             
             <div className="flex flex-col md:flex-row gap-3">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                 <input 
                   type="text" 
                   placeholder="Search companies..." 
                   className="pl-10 pr-4 py-2 bg-[#0f0f11] border border-[#27272a] rounded-lg text-sm text-gray-300 focus:outline-none focus:border-blue-500 w-full md:w-64"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
               </div>
               
               <div className="flex items-center space-x-2">
                 <button className="px-3 py-2 bg-[#0f0f11] border border-[#27272a] rounded-lg text-xs font-medium text-gray-300 flex items-center">
                   <ListFilter size={14} className="mr-2" /> All Categories
                 </button>
                 <button className="px-3 py-2 bg-[#0f0f11] border border-[#27272a] rounded-lg text-xs font-medium text-gray-300 flex items-center">
                   All Cities
                 </button>
               </div>
             </div>
          </div>

          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-[#27272a] text-xs uppercase text-gray-500 font-semibold tracking-wider">
                   <th className="p-4">Company</th>
                   <th className="p-4">Category</th>
                   <th className="p-4">Location</th>
                   <th className="p-4">Contact</th>
                 </tr>
               </thead>
               <tbody className="text-sm">
                 {paginatedData.map((company, i) => (
                   <tr key={`${company.id}-${i}`} className="border-b border-[#27272a] hover:bg-[#27272a]/50 transition-colors">
                     <td className="p-4 font-medium text-white">{company.name}</td>
                     <td className="p-4 text-gray-400">{company.category}</td>
                     <td className="p-4 text-gray-400">{company.city || '—'}</td>
                     <td className="p-4">
                       <div className="flex space-x-2">
                         {company.hasPhone && (
                           <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 cursor-pointer hover:bg-blue-500/20" title={company.phones[0]}>
                             <Phone size={12} />
                           </div>
                         )}
                         {company.hasEmail && (
                           <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 cursor-pointer hover:bg-orange-500/20" title={company.emails[0]}>
                             <Mail size={12} />
                           </div>
                         )}
                         {company.hasLinkedIn && (
                           <div className="w-6 h-6 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 cursor-pointer hover:bg-blue-600/20">
                             <Linkedin size={12} />
                           </div>
                         )}
                         {company.googleMapsUrl && (
                            <a href={company.googleMapsUrl} target="_blank" rel="noreferrer" className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 cursor-pointer hover:bg-green-500/20">
                              <Globe size={12} />
                            </a>
                         )}
                       </div>
                     </td>
                   </tr>
                 ))}
                 {paginatedData.length === 0 && (
                   <tr>
                     <td colSpan={4} className="p-8 text-center text-gray-500">
                       No companies found matching your criteria.
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
          </div>

          <div className="p-4 border-t border-[#27272a] flex items-center justify-between text-xs text-gray-500">
             <div className="flex items-center space-x-2">
               <span>Show</span>
               <select className="bg-[#0f0f11] border border-[#27272a] rounded px-2 py-1 focus:outline-none">
                 <option>10</option>
                 <option>20</option>
                 <option>50</option>
               </select>
             </div>
             
             <div className="flex items-center space-x-1">
               <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#27272a] disabled:opacity-50"
               >
                 &lt;
               </button>
               {getPaginationGroup().map(item => (
                 <button 
                    key={item}
                    onClick={() => setCurrentPage(item)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full font-medium transition-colors ${currentPage === item ? 'bg-white text-black' : 'hover:bg-[#27272a]'}`}
                 >
                   {item}
                 </button>
               ))}
               <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#27272a] disabled:opacity-50"
               >
                 &gt;
               </button>
             </div>
          </div>
        </div>

      </main>

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

// --- Sub-components for cleaner App.tsx ---

const KpiCard = ({ icon: Icon, label, value, sub }: { icon: any, label: string, value: string | number, sub: string }) => (
  <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 flex flex-col justify-between h-32 hover:border-gray-600 transition-colors group">
     <div className="w-8 h-8 rounded-lg bg-[#27272a] flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-[#3f3f46] transition-all mb-4">
       <Icon size={16} />
     </div>
     <div>
       <div className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-1">{label}</div>
       <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
       {sub && <div className="text-[10px] text-gray-500 mt-1">{sub}</div>}
     </div>
  </div>
);

const QualityBar = ({ label, count, percentage }: { label: string, count: number, percentage: number }) => (
  <div>
    <div className="flex items-center space-x-2 text-xs mb-1.5">
       <span className={`
         ${label === 'Email' ? 'text-gray-400' : ''}
         ${label === 'Phone' ? 'text-gray-400' : ''}
         ${label === 'LinkedIn' ? 'text-gray-400' : ''}
       `}>
         <span className={`inline-block w-3 h-3 mr-2 ${
           label === 'Email' ? 'bg-white text-black' : 
           label === 'Phone' ? 'text-white' : 
           'text-gray-500' 
         }`}>
           {label === 'Email' ? <Mail size={12} className="text-black"/> : 
            label === 'Phone' ? <Phone size={12} className="text-gray-400"/> : 
            <Linkedin size={12} className="text-gray-400"/>}
         </span>
         {label}
       </span>
    </div>
    <div className="flex items-center">
       <div className="flex-1 h-2 bg-[#27272a] rounded-full overflow-hidden mr-4">
          <div className="h-full bg-white rounded-full" style={{ width: `${percentage}%` }}></div>
       </div>
       <div className="flex items-center space-x-3 w-20 justify-end text-xs">
          <span className="text-gray-400">{count}</span>
          <span className="font-bold text-white w-8 text-right">{percentage}%</span>
       </div>
    </div>
  </div>
);

const ContactList = ({ icon: Icon, title, count, items, limit, colorClass, isLink, emptyText }: any) => (
  <div>
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center space-x-2 text-white">
        <Icon size={16} className="text-gray-400" />
        <span className="font-medium text-sm">{title}</span>
      </div>
      <span className="px-2 py-0.5 bg-[#27272a] text-[10px] text-gray-400 rounded-md">{count}</span>
    </div>
    <div className="space-y-3">
       {items.slice(0, limit).map((item: string, idx: number) => (
         <div key={idx} className={`text-xs truncate ${colorClass} cursor-pointer`}>
           {isLink ? (
             <a href={item} target="_blank" rel="noreferrer" className="hover:underline truncate block w-full">{item}</a>
           ) : item}
         </div>
       ))}
       {items.length === 0 && (
         <div className="text-xs text-blue-500">{emptyText || 'No data available'}</div>
       )}
       {items.length > limit && (
         <div className="text-[10px] text-gray-500 pt-1">Show {items.length - limit} more</div>
       )}
    </div>
  </div>
);

// Icon wrapper for Charts
const PieChartIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
    <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
  </svg>
);

const TrendingUp = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

export default App;
