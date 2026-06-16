import React, { useState } from 'react';
import { Activity, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useAdminData } from './AdminDataContext';
import { format } from 'date-fns';

export function AdminActivity() {
  const { activityLogs } = useAdminData();
  const [search, setSearch] = useState('');
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const filteredLogs = activityLogs.filter(log => 
    log.user.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.target.toLowerCase().includes(search.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    setExpandedLogs(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderDetailedData = (jsonString?: string) => {
    if (!jsonString) return null;
    try {
      const data = JSON.parse(jsonString);
      return (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-black/30 rounded-lg border border-gray-100 dark:border-white/5 overflow-x-auto">
          <pre className="text-xs font-mono text-gray-700 dark:text-gray-300">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-royal-purple dark:text-gold-light mb-2">Activity Log</h1>
          <p className="text-gray-500 dark:text-gray-400 font-sans text-sm">Detailed audit trail of all changes made in the admin portal.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden flex flex-col transition-colors">
        <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center gap-4 bg-gray-50/50 dark:bg-white/5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by user, action, or target..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:border-royal-purple outline-none transition-all dark:text-white"
            />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{filteredLogs.length} events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white dark:bg-[#1e1e1e] border-b border-gray-100 dark:border-white/10">
                <th className="py-3 px-6 font-sans text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold">Timestamp</th>
                <th className="py-3 px-6 font-sans text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold">User</th>
                <th className="py-3 px-6 font-sans text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold">Action</th>
                <th className="py-3 px-6 font-sans text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold">Target</th>
                <th className="py-3 px-6 font-sans text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold">Summary</th>
                <th className="py-3 px-6"></th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const isExpanded = expandedLogs.has(log.id);
                const hasDetails = !!log.detailedData;

                return (
                  <React.Fragment key={log.id}>
                    <tr 
                      className={`border-b border-gray-50 dark:border-white/5 transition-colors ${hasDetails ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5' : ''}`}
                      onClick={() => hasDetails && toggleExpand(log.id)}
                    >
                      <td className="py-3 px-6 font-sans text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {format(log.timestamp, 'MMM dd, yyyy HH:mm:ss')}
                      </td>
                      <td className="py-3 px-6">
                        <span className="font-sans text-sm font-semibold text-royal-purple dark:text-gold-light bg-royal-purple/5 dark:bg-gold-light/10 px-2.5 py-1 rounded-md">
                          {log.user}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <span className={`font-sans text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded ${
                          log.action === 'EDIT' || log.action === 'STOCK' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                          log.action === 'ADD' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          log.action === 'DELETE' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                          'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-6 font-sans text-sm font-medium text-gray-900 dark:text-white">
                        {log.target}
                      </td>
                      <td className="py-3 px-6 font-sans text-sm text-gray-600 dark:text-gray-300">
                        {log.details}
                      </td>
                      <td className="py-3 px-6 text-right">
                        {hasDetails && (
                          <button 
                            className="p-1 rounded-full text-gray-400 hover:text-royal-purple dark:hover:text-gold-light hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                          >
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && hasDetails && (
                      <tr className="bg-white dark:bg-[#1e1e1e] border-b border-gray-100 dark:border-white/10">
                        <td colSpan={6} className="px-6 pb-6 pt-2">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Detailed Change Payload</span>
                            <div className="h-px flex-1 bg-gray-100 dark:bg-white/5"></div>
                          </div>
                          {renderDetailedData(log.detailedData)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400 font-sans text-sm">
                    No activity logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
