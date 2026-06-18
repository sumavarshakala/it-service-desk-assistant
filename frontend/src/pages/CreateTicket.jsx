import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Sparkles, Paperclip, X, Upload, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import AIInsightPanel from '../components/AIInsightPanel';
import { ticketAPI } from '../services/api';

const CATEGORIES = ['Network Issues', 'Software Issues', 'Hardware Issues', 'Email Problems', 'Account Access', 'Security Issues', 'Printer Issues', 'Other'];
const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Operations', 'Sales', 'Marketing', 'Legal'];

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
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handlePredict = async () => {
    if (!title || !description) return toast.error('Please enter title and description first');
    setPredicting(true);
    try {
      const res = await ticketAPI.predict({ title, description });
      setPrediction(res.data);
    } catch {
      toast.error('AI prediction failed. Please try again.');
    } finally {
      setPredicting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeAttachment = (idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Layout
      title="Create Support Ticket"
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="card border-slate-200/80 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Issue Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Issue Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="input-field"
                      placeholder="Brief description of the issue, e.g. 'VPN not connecting from home'"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Detailed Description <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="input-field min-h-[140px] resize-y leading-relaxed"
                      placeholder="Provide all relevant details: steps taken, error messages seen, affected systems, urgency..."
                      required
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                      {description.length} characters · Minimum 10 required
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Context fields */}
            <div className="card border-slate-200/80 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Request Context</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Your Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Issue Category
                    <span className="text-brand-teal ml-1 text-[10px] font-bold">(AI auto-detected)</span>
                  </label>
                  <select
                    value={prediction?.category || category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {prediction?.category && (
                    <p className="text-[10px] text-brand-teal-dark font-semibold mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI predicted: {prediction.category} ({(prediction.category_confidence * 100).toFixed(0)}% confidence)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="card border-slate-200/80 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attachments</h3>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  dragging
                    ? 'border-brand-blue bg-brand-blue/5 scale-[1.01]'
                    : 'border-slate-200 hover:border-brand-blue/40 hover:bg-slate-50/70'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt,.log"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs font-semibold text-slate-600">
                  {dragging ? 'Drop files here' : 'Drag & drop files or click to browse'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, PDF, DOCX, LOG up to 25MB each · Max 5 files</p>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="p-1.5 bg-white border border-slate-200 rounded text-brand-blue shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-400">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handlePredict}
                disabled={predicting || !title || !description}
                className="btn-secondary"
              >
                <Brain className="w-4 h-4" />
                {predicting ? 'Analyzing...' : 'AI Preview'}
              </button>
              <button
                type="submit"
                disabled={submitting || !title || !description}
                className="btn-primary px-8"
              >
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>

        {/* AI Insight Panel */}
        <div className="lg:col-span-1">
          <AIInsightPanel prediction={prediction} predicting={predicting} />
        </div>
      </div>
    </Layout>
  );
}
