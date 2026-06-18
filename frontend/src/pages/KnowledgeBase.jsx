import { useState } from 'react';
import { Search, BookOpen, ChevronRight, ThumbsUp, HelpCircle, FileText, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';

const ARTICLES = [
  {
    id: 'vpn-issues',
    title: 'How to troubleshoot VPN Connection Issues',
    category: 'Network',
    summary: 'Step-by-step instructions to resolve connection timeout, authentication failures, and DNS issues with corporate VPN.',
    content: `
      ### Troubleshooting Corporate VPN Connections
      
      If you are unable to connect to the corporate VPN from your home network, please follow these steps to resolve the issue:
      
      1. **Check Your Internet Connectivity**: Ensure you have a stable local network connection. Try browsing to a public website to verify.
      2. **Restart the VPN Client**:
         - Fully exit the Cisco AnyConnect / GlobalProtect client.
         - Wait 10 seconds and launch it again.
      3. **Verify Gateway Address**: Make sure the gateway server is set to \`vpn.company.com\` (or your specific regional gateway).
      4. **Clear DNS Cache**:
         - Open Command Prompt (Windows) or Terminal (macOS).
         - Run: \`ipconfig /flushdns\` (Windows) or \`sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder\` (macOS).
      5. **Check Authentication Credentials**: Verify that your password hasn't expired and that your Authenticator App code is typed correctly.
      
      If you are still unable to connect, please submit an IT support request under "Network Issues" with a screenshot of the error code.
    `,
    readTime: '3 min read',
    helpful: 142
  },
  {
    id: 'password-reset',
    title: 'Self-Service Active Directory Password Reset Guide',
    category: 'Accounts',
    summary: 'Guidelines on how to reset your corporate Active Directory, email, and single sign-on passwords without contacting helpdesk.',
    content: `
      ### Active Directory Self-Service Password Reset
      
      You can reset your login password using our Azure Active Directory password recovery portal:
      
      1. **Visit Password Portal**: Navigate to [https://passwordreset.microsoftonline.com](https://passwordreset.microsoftonline.com).
      2. **Verify Identity**:
         - Enter your corporate email address (\`username@company.com\`).
         - Complete the captcha security check.
      3. **Multi-Factor Challenge**: Select your preferred MFA verification option (SMS, Authenticator App, or Security Questions).
      4. **Choose a New Password**:
         - Must be at least **14 characters** long.
         - Must contain letters, numbers, and special symbols (\`!@#$%^&*\`).
         - Cannot contain your name or parts of your email address.
         - Cannot match your previous 5 passwords.
      5. **Allow Sync Time**: Please wait 2-3 minutes for the new credentials to synchronize across all cloud services (Office 365, Slack, Salesforce).
    `,
    readTime: '2 min read',
    helpful: 288
  },
  {
    id: 'email-problems',
    title: 'Configuring Outlook and Fixing Email Synchronization',
    category: 'Software',
    summary: 'Fixing Outlook send/receive errors, calendar syncing glitches, and setting up corporate email client profiles.',
    content: `
      ### Fixing Outlook Email and Syncing Issues
      
      If Outlook is showing "Disconnected" or fails to download new emails, execute the following troubleshooting tasks:
      
      1. **Check Offline Mode**: Ensure Outlook isn't set to "Work Offline". Go to the **Send / Receive** tab and click the **Work Offline** button to toggle it.
      2. **Update Outlook Folder**:
         - Click on the **Send / Receive** tab.
         - Click **Send/Receive All Folders** to force a manual synchronization.
      3. **Repair Office Account Settings**:
         - In Outlook, go to **File** > **Info** > **Account Settings** > **Account Settings**.
         - Select your email address and click **Repair**.
         - Restart Outlook.
      4. **Rebuild Outlook Profile**:
         - Close Outlook. Open **Control Panel** > **Mail** (Windows) or Outlook Preferences (macOS).
         - Click **Show Profiles** and choose **Add** to configure a new clean profile.
         - Allow Outlook to download mailbox files from the exchange server (can take up to 30 minutes).
    `,
    readTime: '4 min read',
    helpful: 95
  },
  {
    id: 'software-installation',
    title: 'Requesting Software via Company Portal',
    category: 'Software',
    summary: 'A guide on how to browse, request, and automatically install pre-approved software packages on your work device.',
    content: `
      ### Standard Software Installation Guide
      
      Employees should install company software packages through the pre-packaged Company Portal to bypass local admin blocks:
      
      1. **Open Company Portal**:
         - **Windows**: Search for "Company Portal" in the Start menu.
         - **macOS**: Open the "Self Service" app in the Applications folder.
      2. **Browse Catalog**: Look up approved software packages like Adobe Acrobat, VS Code, Slack, or Docker.
      3. **Trigger Installation**: Click the **Install** button. The package will download and deploy in the background automatically.
      4. **Request Custom Software**:
         - If the tool is not in the Company Portal catalog, submit a ticket under "Software Issues".
         - Include the software name, URL, and manager approval email if licensing costs are involved.
    `,
    readTime: '3 min read',
    helpful: 120
  },
  {
    id: 'printer-setup',
    title: 'Connecting to Office Wi-Fi Printers',
    category: 'Hardware',
    summary: 'Instructions for connecting to network printers across different company buildings and floors.',
    content: `
      ### Connecting to Network Office Printers
      
      Follow these directions to connect to shared follow-me printing queues:
      
      1. **Connect to Corporate Network**: Make sure your device is connected to the secure Wi-Fi (\`Company-Secure\`). Printers are not reachable from guest networks.
      2. **Add Printer (Windows)**:
         - Go to **Settings** > **Devices** > **Printers & Scanners**.
         - Click **Add a printer or scanner**.
         - Select \`Follow-Me-Queue-Global\` from the populated listing.
      3. **Add Printer (macOS)**:
         - Go to **System Settings** > **Printers & Scanners**.
         - Click **Add Printer, Scanner, or Fax...** at the bottom.
         - Choose IP/Network printer and type: \`print.company.com\`.
      4. **Print and Release**:
         - Print your document selecting the Follow-Me queue.
         - Walk to any physically supported Xerox office printer, scan your employee security badge, and select **Release Print**.
    `,
    readTime: '3 min read',
    helpful: 54
  }
];

const CATEGORIES = ['All', 'Network', 'Accounts', 'Software', 'Hardware'];

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeArticle, setActiveArticle] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState({});

  const filteredArticles = ARTICLES.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || art.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleHelpful = (id) => {
    if (feedbackGiven[id]) return;
    setFeedbackGiven(prev => ({ ...prev, [id]: true }));
  };

  return (
    <Layout title="Knowledge Base Help Center">
      {/* Search Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-blue-dark to-brand-blue text-white rounded-2xl p-8 shadow-md mb-8">
        <div className="max-w-2xl relative z-10">
          <h3 className="text-2xl font-bold tracking-tight mb-2">How can we help you today?</h3>
          <p className="text-brand-blue-light text-xs font-medium mb-5">Search our documentation database for self-service solutions and step-by-step guides.</p>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search guides, setup directories, software FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-transparent rounded-xl pl-11 pr-4 py-3 text-slate-900 placeholder-slate-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-light transition-all text-sm font-semibold"
            />
          </div>
        </div>
        <div className="absolute right-8 bottom-0 opacity-10 hidden lg:block select-none pointer-events-none">
          <BookOpen className="w-64 h-64 translate-y-10" />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
              selectedCategory === cat
                ? 'bg-brand-blue text-white border-brand-blue'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Article Grid / Main Area */}
      {activeArticle ? (
        <div className="card bg-white border border-slate-200">
          <button
            onClick={() => setActiveArticle(null)}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 mb-6 font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Article List
          </button>

          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-brand-blue-light/45 text-brand-blue-dark text-[10px] font-bold uppercase tracking-wide">
                {activeArticle.category}
              </span>
              <span className="text-xs text-slate-400 font-semibold">{activeArticle.readTime}</span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 mb-6">{activeArticle.title}</h1>

            <div className="prose prose-slate max-w-none text-xs text-slate-600 leading-relaxed space-y-4">
              {activeArticle.content.split('\n\n').map((paragraph, index) => {
                // simple markdown rendering helper for headings & lists
                const trimmed = paragraph.trim();
                if (trimmed.startsWith('###')) {
                  return <h3 key={index} className="text-sm font-bold text-slate-800 pt-3">{trimmed.replace('###', '')}</h3>;
                }
                if (trimmed.startsWith('1.') || trimmed.startsWith('-')) {
                  return (
                    <ul key={index} className="list-inside list-disc pl-4 space-y-2.5 my-2">
                      {trimmed.split('\n').map((li, liIdx) => (
                        <li key={liIdx} className="leading-relaxed">
                          {li.replace(/^\d+\.\s+\*\*/, '').replace(/^-\s+\*\*/, '').replace(/^\d+\.\s+/, '').replace(/^-\s+/, '').replace(/\*\*/g, '')}
                        </li>
                      ))}
                    </ul>
                  );
                }
                return <p key={index}>{trimmed}</p>;
              })}
            </div>

            {/* Helpful feedback block */}
            <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs text-slate-500 font-medium">Was this article helpful to resolve your issue?</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleHelpful(activeArticle.id)}
                  disabled={feedbackGiven[activeArticle.id]}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    feedbackGiven[activeArticle.id]
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {feedbackGiven[activeArticle.id] ? 'Thank you!' : 'Yes, helpful'}
                </button>
                <span className="text-xs text-slate-400 font-medium">
                  ({activeArticle.helpful + (feedbackGiven[activeArticle.id] ? 1 : 0)} people found this helpful)
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.length === 0 ? (
            <div className="col-span-full card text-center py-12 text-slate-400">
              <HelpCircle className="w-12 h-12 mx-auto mb-2 text-slate-350" />
              <p className="text-xs font-semibold">No articles match your search criteria. Try a different query.</p>
            </div>
          ) : (
            filteredArticles.map((art) => (
              <div 
                key={art.id} 
                onClick={() => setActiveArticle(art)}
                className="card bg-white border border-slate-200/80 rounded-xl p-5 hover:border-brand-blue/30 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-brand-blue-light/45 text-brand-blue-dark text-[9px] font-bold uppercase tracking-wide">
                      {art.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{art.readTime}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 leading-snug group-hover:text-brand-blue mb-2">{art.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3 mb-4">{art.summary}</p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-2">
                  <span className="text-[10px] text-slate-400 font-semibold">{art.helpful} helpful ratings</span>
                  <span className="text-[10px] text-brand-blue font-bold flex items-center gap-1">
                    Read guide <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Layout>
  );
}
