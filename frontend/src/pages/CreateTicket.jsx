import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain, Sparkles, Paperclip, X, Upload, FileText,
  ChevronRight, AlertCircle, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import AIInsightPanel from '../components/AIInsightPanel';
import { ticketAPI } from '../services/api';

const CATEGORIES = ['Network Issues', 'Software Issues', 'Hardware Issues', 'Email Problems', 'Account Access', 'Security Issues', 'Printer Issues', 'Other'];
const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Operations', 'Sales', 'Marketing', 'Legal'];
const PRIORITY_LABELS = { Low: 'bg-slate-100 text-slate-600', Medium: 'bg-blue-100 text-blue-700', High: 'bg-amber-100 text-amber-700', Critical: 'bg-rose-100 text-rose-700' };

export default function CreateTicket() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [step, setStep] = useState(1); // 1: details, 2: context, 3: attachments
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  // Auto-predict as user types (debounced)
  useEffect(() => {
    if (title.length > 10 && description.length > 20) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setPredicting(true);
        try {
          const res = await ticketAPI.predict({ title, description });
          setPrediction(res.data);
          if (res.data?.category) setCategory(res.data.category);
        } catch {
          // silent fail
        } finally {
          setPredicting(false);
        }
      }, 1200);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [title, description]);

  const handlePredict = async () => {
    if (!title || !description) return toast.error('Please enter title and description first');
    setPredicting(true);
    try {
      const res = await ticketAPI.predict({ title, description });
      setPrediction(res.data);
      if (res.data?.category) setCategory(res.data.category);
      toast.success('AI analysis complete!');
    } catch {
      toast.error('AI prediction failed');
    } finally {
      setPredicting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (description.length < 10) return toast.error('Description must be at least 10 characters');
    setSubmitting(true);
    try {
      const res = await ticketAPI.create({ title, description });
      toast.success('Ticket submitted successfully!');
      navigate(`/tickets/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files).slice(0, 5 - attachments.length);
    setAttachments(prev => [...prev, ...newFiles]);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const steps = [
    { id: 1, label: 'Issue Details', desc: 'Describe your problem' },
    { id: 2, label: 'Context', desc: 'Department & category' },
    { id: 3, label: 'Attachments', desc: 'Upload supporting files' },
  ];

  return (
    <Layout
      title="Submit Support Ticket"
      actions={
        <button
          type="button"
          onClick={handlePredict}
          disabled={predicting || !title || !description}
          className="btn-secondary"
        >
          <Brain className="w-4 h-4" />
          {predicting ? 'Analyzing...' : 'AI Preview'}
        </button>
      }
    >
      {/* Progress Steps */}
      <div className="flex items-center gap-0 mb-8 bg-white border border-slate-200/70 rounded-xl p-4 shadow-card">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <button
              onClick={() => setStep(s.id)}
              className={`flex items-center gap-3 flex-1 transition-all ${step === s.id ? 'opacity-100' : 'opacity-60 hover:opacity-80'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border-2 transition-all ${
                step > s.id
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : step === s.id
                  ? 'bg-brand-blue border-brand-blue text-white'
                  : 'bg-white border-slate-300 text-slate-400'
              }`}>
                {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
              </div>
              <div className="hidden sm:block text-left">
                <p className={`text-xs font-bold ${step === s.id ? 'text-brand-blue-dark' : 'text-slate-500'}`}>{s.label}</p>
                <p className="text-[10px] text-slate-400">{s.desc}</p>
              </div>
            </button>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-8 mx-2 rounded-full transition-all ${step > s.id ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
          {/* Step 1 – Issue Details */}
          <div className="card border-slate-200/80 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-6 h-6 rounded-full bg-brand-blue text-white text-xs font-bold flex items-center justify-center">1</div>
              <h3 className="text-sm font-bold text-slate-800">Issue Details</h3>
              <span className="text-[10px] text-rose-500 font-bold">Required</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Issue Title <span className="text-rose-500">*</span>
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="input-field"
                placeholder="e.g. VPN not connecting from home, Outlook not loading..."
                required
              />
              <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Be specific — AI uses this to classify and prioritize</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="input-field min-h-[160px] resize-y leading-relaxed"
                placeholder="Provide all details: steps taken, error messages, affected systems, when it started, how urgent it is..."
                required
              />
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-[10px] text-slate-400 font-medium">{description.length} characters · Min 10 required</p>
                {description.length >= 10 && title.length >= 5 && (
                  <span className="flex items-center gap-1 text-[10px] text-brand-teal font-semibold">
                    <Sparkles className="w-3 h-3" /> AI auto-analyzing...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Step 2 – Context */}
          <div className="card border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-6 h-6 rounded-full bg-brand-blue/20 text-brand-blue-dark text-xs font-bold flex items-center justify-center">2</div>
              <h3 className="text-sm font-bold text-slate-800">Request Context</h3>
              <span className="text-[10px] text-slate-400 font-semibold">Optional but helpful</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Your Department</label>
                <select value={department} onChange={e => setDepartment(e.target.value)} className="input-field">
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Issue Category
                  <span className="ml-1.5 text-[10px] text-brand-teal font-bold">(AI auto-detected)</span>
                </label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="input-field">
                  <option value="">Select Category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {prediction?.category && (
                  <p className="text-[10px] text-brand-teal-dark font-semibold mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI detected: {prediction.category} ({Math.round((prediction.category_confidence || 0) * 100)}% confidence)
                  </p>
                )}
              </div>
            </div>

            {prediction && (
              <div className="grid grid-cols-2 gap-3 mt-1">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">AI Priority</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${PRIORITY_LABELS[prediction.priority] || ''}`}>
                    {prediction.priority}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Est. Resolution</p>
                  <p className="text-xs font-bold text-slate-700">
                    {prediction.priority === 'Critical' ? '1–2h' : prediction.priority === 'High' ? '2–4h' : prediction.priority === 'Medium' ? '8–24h' : '1–3 days'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Step 3 – Attachments */}
          <div className="card border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-6 h-6 rounded-full bg-brand-blue/20 text-brand-blue-dark text-xs font-bold flex items-center justify-center">3</div>
              <h3 className="text-sm font-bold text-slate-800">Attachments</h3>
              <span className="text-[10px] text-slate-400 font-semibold">Optional</span>
            </div>

            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragging ? 'border-brand-blue bg-brand-blue/5 scale-[1.01]' : 'border-slate-200 hover:border-brand-blue/40 hover:bg-slate-50/80'
              }`}
            >
              <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt,.log" className="hidden" onChange={e => handleFiles(e.target.files)} />
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">
                {dragging ? 'Drop files here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-slate-400">PNG, JPG, PDF, DOCX, LOG — up to 25MB each · Max 5 files</p>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="p-2 bg-white border border-slate-200 rounded-lg text-brand-blue shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-400">{formatFileSize(file.size)}</p>
                    </div>
                    <button type="button" onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-50">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Your ticket will be AI-classified and routed automatically
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={handlePredict} disabled={predicting || !title || !description} className="btn-secondary">
                <Brain className="w-4 h-4" />
                {predicting ? 'Analyzing...' : 'AI Preview'}
              </button>
              <button type="submit" disabled={submitting || !title || !description} className="btn-primary px-8">
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                ) : (
                  <><ChevronRight className="w-4 h-4" /> Submit Ticket</>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* AI Insight Panel */}
        <div>
          <AIInsightPanel prediction={prediction} predicting={predicting} />
        </div>
      </div>
    </Layout>
  );
}
