import { Brain, Sparkles, Clock, Tag, AlertTriangle, Lightbulb, CheckCircle, Zap, Target } from 'lucide-react';

const CATEGORY_SUGGESTIONS = {
  'Network Issues': [
    { icon: '🔄', text: 'Restart your router/modem and reconnect' },
    { icon: '🔑', text: 'Re-enter VPN credentials and check token expiry' },
    { icon: '🔍', text: 'Run ipconfig /flushdns in Command Prompt' },
    { icon: '📡', text: 'Check network adapter settings and firewall rules' },
  ],
  'Software Issues': [
    { icon: '🔄', text: 'Restart the application and clear cache' },
    { icon: '📦', text: 'Check for available software updates' },
    { icon: '🗂️', text: 'Reinstall the application from Company Portal' },
    { icon: '🧹', text: 'Clear temp files and registry entries' },
  ],
  'Hardware Issues': [
    { icon: '🔌', text: 'Check all cable connections and power supply' },
    { icon: '🔄', text: 'Restart device and check device manager' },
    { icon: '💾', text: 'Run hardware diagnostics tool' },
    { icon: '🏥', text: 'Submit for physical inspection if issue persists' },
  ],
  'Email Problems': [
    { icon: '🔄', text: 'Toggle Work Offline mode in Outlook' },
    { icon: '📬', text: 'Run Send/Receive All Folders manually' },
    { icon: '🔧', text: 'Repair your email account profile' },
    { icon: '🔑', text: 'Re-authenticate your Microsoft 365 credentials' },
  ],
  'Account Access': [
    { icon: '🔑', text: 'Use the self-service password reset portal' },
    { icon: '📱', text: 'Check MFA device for expired codes' },
    { icon: '🔓', text: 'Verify account is not locked after failed attempts' },
    { icon: '👤', text: 'Contact IT if SSO tokens are expired' },
  ],
  'Security Issues': [
    { icon: '🛡️', text: 'Immediately isolate affected device from network' },
    { icon: '🔐', text: 'Change all passwords from a clean device' },
    { icon: '📊', text: 'Run full antivirus and malware scan' },
    { icon: '🚨', text: 'Report to Security team immediately' },
  ],
  'Printer Issues': [
    { icon: '🔌', text: 'Reconnect to Company-Secure WiFi network' },
    { icon: '🗑️', text: 'Clear print queue and restart print spooler' },
    { icon: '🖨️', text: 'Reinstall printer driver from Company Portal' },
    { icon: '📋', text: 'Use badge tap on printer to release queued jobs' },
  ],
};

const PRIORITY_META = {
  Critical: { color: 'rose', label: 'Critical', emoji: '🚨', eta: '1–2 Hours', bar: 'w-full' },
  High: { color: 'amber', label: 'High', emoji: '⚠️', eta: '2–4 Hours', bar: 'w-3/4' },
  Medium: { color: 'blue', label: 'Medium', emoji: '📌', eta: '8–24 Hours', bar: 'w-1/2' },
  Low: { color: 'slate', label: 'Low', emoji: '🔵', eta: '1–3 Days', bar: 'w-1/4' },
};

const CATEGORY_META = {
  'Network Issues': { color: 'indigo', emoji: '🌐' },
  'Software Issues': { color: 'blue', emoji: '💻' },
  'Hardware Issues': { color: 'slate', emoji: '🖥️' },
  'Email Problems': { color: 'purple', emoji: '📧' },
  'Account Access': { color: 'teal', emoji: '🔑' },
  'Security Issues': { color: 'rose', emoji: '🛡️' },
  'Printer Issues': { color: 'amber', emoji: '🖨️' },
  'Other': { color: 'slate', emoji: '📋' },
};

export default function AIInsightPanel({ prediction, predicting }) {
  if (!predicting && !prediction) {
    return (
      <div className="sticky top-24 space-y-4">
        <div className="bg-white border border-slate-200/70 rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-brand-blue/5 to-brand-teal/5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-brand-blue/10 border border-brand-blue/20">
                <Brain className="w-4 h-4 text-brand-blue" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800">AI Intelligence</h3>
                <p className="text-[10px] text-slate-400">Powered by ML Classification</p>
              </div>
            </div>
          </div>
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-1">Ready to Analyze</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Fill in your ticket title and description, then click <span className="font-bold text-brand-blue">AI Preview</span> for instant classification.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {[
                { icon: Tag, label: 'Auto Category' },
                { icon: AlertTriangle, label: 'Priority Score' },
                { icon: Clock, label: 'ETA Estimate' },
                { icon: Lightbulb, label: 'Fix Suggestions' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium bg-slate-50 px-2.5 py-2 rounded-lg border border-slate-100">
                  <Icon className="w-3 h-3 text-slate-400" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (predicting) {
    return (
      <div className="sticky top-24 space-y-4">
        <div className="bg-white border border-brand-blue/20 rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-blue/10 bg-gradient-to-r from-brand-blue/8 to-brand-teal/8">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-brand-blue/15 border border-brand-blue/20">
                <Brain className="w-4 h-4 text-brand-blue animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-brand-blue-dark">AI Analyzing...</h3>
                <p className="text-[10px] text-brand-blue/70">Processing your ticket data</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {['Classifying category...', 'Predicting priority...', 'Finding solutions...'].map((text, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse" style={{ animationDelay: `${i * 200}ms` }}>
                <div className="skeleton w-8 h-8 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-2.5 rounded w-3/4" />
                  <div className="skeleton h-2 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const pMeta = PRIORITY_META[prediction.priority] || PRIORITY_META.Medium;
  const cMeta = CATEGORY_META[prediction.category] || CATEGORY_META.Other;
  const suggestions = CATEGORY_SUGGESTIONS[prediction.category] || CATEGORY_SUGGESTIONS['Software Issues'];
  const confidence = Math.round((prediction.category_confidence || 0) * 100);

  return (
    <div className="sticky top-24 space-y-4 animate-fade-up">
      {/* Main Prediction Card */}
      <div className="bg-white border border-brand-blue/25 rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-blue/10 bg-gradient-to-r from-brand-blue/8 to-brand-teal/8">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-blue/15 border border-brand-blue/20">
              <Sparkles className="w-4 h-4 text-brand-blue" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">AI Analysis Complete</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                <p className="text-[10px] text-emerald-600 font-semibold">{confidence}% Confidence</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Category */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Category
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-${cMeta.color}-50 text-${cMeta.color}-700 border border-${cMeta.color}-200`}>
              <span>{cMeta.emoji}</span>
              {prediction.category}
            </span>
          </div>

          {/* Priority */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Priority
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-${pMeta.color}-50 text-${pMeta.color}-700 border border-${pMeta.color}-200`}>
              <span>{pMeta.emoji}</span>
              {prediction.priority}
            </span>
          </div>

          {/* ETA */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Est. Resolution
            </span>
            <span className="text-xs font-bold text-slate-700">{pMeta.eta}</span>
          </div>

          {/* Confidence bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> AI Confidence
              </span>
              <span className="text-xs font-bold text-brand-blue">{confidence}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-blue to-brand-teal rounded-full transition-all duration-700"
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Fixes */}
      <div className="bg-white border border-slate-200/70 rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-800">Suggested Fixes</h3>
          </div>
        </div>
        <div className="p-4 space-y-2">
          {suggestions.map((fix, i) => (
            <div key={i} className="flex items-start gap-3 p-2.5 bg-slate-50 border border-slate-100 rounded-lg hover:bg-amber-50/50 hover:border-amber-100 transition-colors animate-fade-in" style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}>
              <span className="text-base shrink-0 mt-0.5">{fix.icon}</span>
              <p className="text-[11px] text-slate-700 font-medium leading-relaxed">{fix.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* KB Link */}
      <div className="bg-gradient-to-r from-brand-blue/8 to-brand-teal/8 border border-brand-blue/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-3.5 h-3.5 text-brand-blue" />
          <p className="text-[11px] font-bold text-brand-blue-dark">Pro Tip</p>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Check the <span className="font-bold text-brand-blue">Knowledge Base</span> for step-by-step self-service guides that may resolve this issue instantly.
        </p>
      </div>
    </div>
  );
}
