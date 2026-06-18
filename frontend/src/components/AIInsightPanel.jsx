import { Brain, Lightbulb, Search, Sparkles, CheckCircle, ExternalLink, HelpCircle } from 'lucide-react';
import { PriorityBadge } from './StatusBadge';

export default function AIInsightPanel({ prediction, predicting, onSelectSuggestion }) {
  if (predicting) {
    return (
      <div className="card border-brand-teal/30 bg-brand-teal/5 flex flex-col items-center justify-center p-8 text-center gap-3 animate-pulse">
        <div className="w-12 h-12 rounded-full bg-brand-teal/20 text-brand-teal flex items-center justify-center animate-spin">
          <Brain className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">AI Engine Analyzing</h4>
        <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
          Reading title and description to classify category, priority, and retrieve matching knowledge bases...
        </p>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="card text-center py-8 flex flex-col items-center justify-center border-slate-200 bg-slate-50/50">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
          <Brain className="w-6 h-6 text-slate-400" />
        </div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">AI Assistant Panel</h4>
        <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
          Type the issue title and description, then click "AI Preview" to get auto-classifications and instant solutions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Classification Card */}
      <div className="card border-brand-blue/20 bg-gradient-to-b from-brand-blue/5 to-white">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-brand-blue text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">AI Classification</h4>
            <p className="text-[10px] text-slate-400">Machine learning real-time predictions</p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
            <span className="font-semibold text-slate-500">Predicted Category</span>
            <span className="font-bold text-slate-900">{prediction.category}</span>
          </div>

          <div className="border-b border-slate-100 pb-2.5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-semibold text-slate-500">Category Confidence</span>
              <span className="font-bold text-brand-blue">{(prediction.category_confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-brand-blue h-full rounded-full transition-all duration-500" 
                style={{ width: `${prediction.category_confidence * 100}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
            <span className="font-semibold text-slate-500">Predicted Priority</span>
            <PriorityBadge priority={prediction.priority} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-semibold text-slate-500">Priority Confidence</span>
              <span className="font-bold text-brand-teal">{(prediction.priority_confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-brand-teal h-full rounded-full transition-all duration-500" 
                style={{ width: `${prediction.priority_confidence * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Solutions Card */}
      {prediction.suggestions?.length > 0 && (
        <div className="card border-slate-200">
          <div className="flex items-center gap-2 mb-3.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Suggested Solutions</h4>
              <p className="text-[10px] text-slate-400">Knowledge Base quick fixes</p>
            </div>
          </div>

          <ul className="space-y-2.5">
            {prediction.suggestions.map((s, i) => (
              <li 
                key={i} 
                className="text-xs text-slate-600 p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg transition-colors cursor-pointer"
                onClick={() => onSelectSuggestion && onSelectSuggestion(s)}
              >
                <div className="flex items-start gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-brand-blue shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800 leading-snug hover:underline">{s.suggestion}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Source: {s.source}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Similar tickets Card */}
      {prediction.similar_tickets?.length > 0 && (
        <div className="card border-slate-200">
          <div className="flex items-center gap-2 mb-3.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Similar Past Tickets</h4>
              <p className="text-[10px] text-slate-400">Compare with resolved requests</p>
            </div>
          </div>

          <ul className="space-y-3">
            {prediction.similar_tickets.map((t) => (
              <li key={t.ticket_id} className="text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-brand-blue-dark font-bold text-[11px]">#{t.ticket_id}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    {(t.similarity_score * 100).toFixed(0)}% match
                  </span>
                </div>
                <p className="text-slate-800 font-semibold leading-snug">{t.title}</p>
                {t.resolution && (
                  <div className="mt-1.5 p-2 bg-emerald-50/50 border border-emerald-100 rounded text-[11px] text-slate-600">
                    <span className="font-bold text-emerald-700 flex items-center gap-1 mb-0.5">
                      <CheckCircle className="w-3 h-3 shrink-0" /> Resolution:
                    </span>
                    <p className="italic leading-normal">{t.resolution}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
