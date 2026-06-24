import { useState } from 'react';
import {
  Search, BookOpen, Clock, ThumbsUp, ArrowLeft,
  Wifi, Mail, Lock, Monitor, Printer, Shield, HelpCircle, Terminal,
  PlusCircle, ChevronRight, X
} from 'lucide-react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { id: 'network',  label: 'Network & VPN',       icon: Wifi,        count: 12 },
  { id: 'email',    label: 'Email & Calendar',     icon: Mail,        count: 8  },
  { id: 'password', label: 'Account & Access',     icon: Lock,        count: 10 },
  { id: 'hardware', label: 'Hardware & Devices',   icon: Monitor,     count: 7  },
  { id: 'printer',  label: 'Printing & Scanning',  icon: Printer,     count: 5  },
  { id: 'security', label: 'Security & Malware',   icon: Shield,      count: 9  },
  { id: 'software', label: 'Software & Apps',      icon: Terminal,    count: 14 },
  { id: 'other',    label: 'General Help',         icon: HelpCircle,  count: 6  },
];

const ARTICLES = [
  { id: 1, category: 'password', title: 'How to Reset Your Active Directory Password', summary: 'Complete step-by-step guide to resetting your company domain password through SSPR or IT Helpdesk portal.', readTime: '3 min', helpful: 142, views: 1840, tags: ['password', 'AD'], steps: ['Navigate to the password reset portal', 'Enter your corporate email', 'Verify via MFA', 'Enter new password meeting complexity requirements', 'Wait 5–10 min for sync across all systems'] },
  { id: 2, category: 'network',  title: 'Fix VPN Connection Issues – GlobalProtect',    summary: 'Troubleshoot GlobalProtect VPN connectivity problems when working remotely.', readTime: '4 min', helpful: 118, views: 2230, tags: ['vpn', 'network'], steps: ['Close GlobalProtect from system tray', 'Open Command Prompt as Administrator', 'Run: ipconfig /release && ipconfig /flushdns && ipconfig /renew', 'Restart GlobalProtect service via Windows Services', 'Reconnect using your SSO credentials'] },
  { id: 3, category: 'email',    title: 'Resolve Outlook "Not Responding" or Sync Issues', summary: 'Quick fixes when Outlook freezes, crashes, or fails to sync inbox and calendar.', readTime: '5 min', helpful: 95, views: 1650, tags: ['outlook', 'email'], steps: ['Hold Ctrl + click Outlook shortcut to launch in Safe Mode', 'Disable add-ins via File → Options → Add-ins', 'Use scanpst.exe to fix corrupted OST/PST files', 'Delete profile and re-add account', 'Clear Outlook cache in AppData'] },
  { id: 4, category: 'software', title: 'Installing Software via Company Self-Service Portal', summary: 'Install approved corporate software through the IT-managed Company Portal without admin rights.', readTime: '2 min', helpful: 76, views: 980, tags: ['software', 'install'], steps: ['Open Company Portal from Start menu', 'Search for your required software', 'Click Install — no admin password needed', 'App installs within 5–15 minutes', 'If not listed, submit a Software Request ticket'] },
  { id: 5, category: 'printer',  title: 'Connect to Office Printers via Network',    summary: 'Add a shared office printer to your Windows or Mac device using the corporate print server.', readTime: '3 min', helpful: 63, views: 720, tags: ['printer', 'driver'], steps: ['Open Control Panel → Devices and Printers → Add a Printer', 'Select "The printer isn\'t listed"', 'Enter path: \\\\print-server\\[PrinterName]', 'Install suggested driver or download from IT SharePoint', 'Set as default if primary printer'] },
  { id: 6, category: 'security', title: 'What To Do If You Clicked a Phishing Link', summary: 'Immediate response steps if you accidentally clicked a suspicious email link or attachment.', readTime: '3 min', helpful: 104, views: 1340, tags: ['security', 'phishing'], steps: ['Disconnect your device from network IMMEDIATELY', 'Call IT Security Hotline: ext. 2999', 'Change passwords for critical accounts from a DIFFERENT device', 'Run full CrowdStrike Falcon scan', 'Do NOT reconnect until IT clears it'] },
];

export default function KnowledgeBase() {
  const [search,   setSearch]   = useState('');
  const [selCat,   setSelCat]   = useState(null);
  const [article,  setArticle]  = useState(null);

  const filtered = ARTICLES.filter(a => {
    const cat  = !selCat  || a.category === selCat;
    const srch = !search  || [a.title, a.summary, ...a.tags].some(s => s.toLowerCase().includes(search.toLowerCase()));
    return cat && srch;
  });

  if (article) {
    const cat  = CATEGORIES.find(c => c.id === article.category);
    const related = ARTICLES.filter(a => a.id !== article.id && a.category === article.category).slice(0, 4);
    return (
      <Layout
        title={article.title}
        actions={<button onClick={() => setArticle(null)} className="btn-secondary"><ArrowLeft className="w-4 h-4" /> Knowledge Base</button>}
      >
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 space-y-4">
            {/* Article meta */}
            <div className="card p-4 flex items-center gap-3 flex-wrap">
              {cat && <span className="badge badge-blue">{cat.label}</span>}
              <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.readTime} read</span>
              <span className="text-xs text-gray-400">{article.views.toLocaleString()} views</span>
              <span className="ml-auto text-xs text-gray-400 flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> {article.helpful} found helpful</span>
            </div>

            {/* Summary */}
            <div className="card p-4">
              <p className="text-sm text-gray-700 leading-relaxed">{article.summary}</p>
            </div>

            {/* Steps */}
            <div className="card p-4">
              <h3 className="section-title mb-4">Step-by-Step Guide</h3>
              <ol className="space-y-3">
                {article.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Tags + feedback */}
            <div className="card p-4 flex items-center gap-4 flex-wrap">
              <div className="flex gap-1.5 flex-wrap flex-1">
                {article.tags.map(t => <span key={t} className="badge badge-gray">#{t}</span>)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Was this helpful?</span>
                <button className="btn-secondary py-1 px-2 text-xs text-green-700 border-green-200 bg-green-50 hover:bg-green-100">
                  <ThumbsUp className="w-3.5 h-3.5" /> Yes
                </button>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            <div className="card p-4 border-l-4 border-l-amber-400">
              <p className="text-sm font-semibold text-gray-800 mb-1">Still need help?</p>
              <p className="text-xs text-gray-500 mb-3">If this guide didn't resolve your issue, our team is ready to help.</p>
              <Link to="/tickets/create" className="btn-primary w-full justify-center">
                <PlusCircle className="w-4 h-4" /> Submit a Ticket
              </Link>
            </div>

            {related.length > 0 && (
              <div className="card p-4">
                <h4 className="section-title mb-3">Related Articles</h4>
                <div className="space-y-1">
                  {related.map(a => (
                    <button key={a.id} onClick={() => setArticle(a)}
                      className="w-full text-left flex items-center gap-2 px-2 py-2 hover:bg-gray-50 rounded transition-colors group">
                      <BookOpen className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="text-sm text-gray-700 group-hover:text-primary-600 line-clamp-2 flex-1">{a.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Knowledge Base"
      subtitle="Self-service guides and IT documentation"
      actions={
        <Link to="/tickets/create" className="btn-primary">
          <PlusCircle className="w-4 h-4" /> Submit a Ticket
        </Link>
      }
    >
      {/* Search bar */}
      <div className="card p-3 mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles, keywords, topics..."
            className="input-field pl-8"
          />
        </div>
        {search && <button onClick={() => setSearch('')} className="btn-ghost"><X className="w-4 h-4" /></button>}
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <button
          onClick={() => setSelCat(null)}
          className={`text-xs px-3 py-1.5 rounded border font-medium transition-colors ${!selCat ? 'bg-primary-600 text-white border-primary-700' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
        >
          All
        </button>
        {CATEGORIES.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setSelCat(selCat === id ? null : id)}
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border font-medium transition-colors ${selCat === id ? 'bg-primary-600 text-white border-primary-700' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
            <span className={`text-2xs font-semibold ${selCat === id ? 'text-blue-200' : 'text-gray-400'}`}>({count})</span>
          </button>
        ))}
      </div>

      {/* Results count */}
      {(search || selCat) && (
        <p className="text-xs text-gray-500 mb-3">{filtered.length} article{filtered.length !== 1 ? 's' : ''} found</p>
      )}

      {/* Articles */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-700">No articles found</p>
          <p className="text-sm text-gray-400 mt-1">Try different keywords or clear filters.</p>
          <Link to="/tickets/create" className="btn-primary mt-4 inline-flex"><PlusCircle className="w-4 h-4" /> Submit a Ticket</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Article</th>
                <th className="w-32">Category</th>
                <th className="w-24">Read Time</th>
                <th className="w-24">Views</th>
                <th className="w-24">Helpful</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const cat = CATEGORIES.find(c => c.id === a.category);
                const Icon = cat?.icon || BookOpen;
                return (
                  <tr key={a.id} onClick={() => setArticle(a)} className="cursor-pointer">
                    <td>
                      <div className="flex items-start gap-2">
                        <BookOpen className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-primary-600 hover:underline">{a.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{a.summary}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                        <Icon className="w-3.5 h-3.5 text-gray-400" /> {cat?.label}
                      </span>
                    </td>
                    <td className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {a.readTime}</td>
                    <td className="text-xs text-gray-500">{a.views.toLocaleString()}</td>
                    <td className="text-xs text-gray-500 flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> {a.helpful}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-5 card p-4 border-l-4 border-l-primary-600 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Didn't find what you need?</p>
          <p className="text-xs text-gray-500 mt-0.5">Submit a support ticket and our team will assist you directly.</p>
        </div>
        <Link to="/tickets/create" className="btn-primary shrink-0">
          <PlusCircle className="w-4 h-4" /> Submit a Ticket
        </Link>
      </div>
    </Layout>
  );
}
