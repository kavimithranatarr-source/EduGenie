import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Loader2,
  Copy,
  Check,
  Download,
  BookOpen,
  Clock,
  Sparkles,
  Layers,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { SummaryFormat, SummaryResult } from '../types';
import { summarizeText } from '../utils/api';
import { addHistoryItem } from '../utils/storage';

interface SummarizerViewProps {
  onNotify?: (msg: string) => void;
  onSendToQuiz?: (content: string) => void;
  onSendToFlashcards?: (content: string) => void;
}

const formats: Array<{ id: SummaryFormat; label: string; desc: string }> = [
  { id: 'structured', label: 'Structured Study Note', desc: 'Balanced summary, glossary, formulas & tips' },
  { id: 'bullet-points', label: 'High-Yield Bullets', desc: 'Fast, scannable key takeaways' },
  { id: 'exam-cram', label: 'Exam Cram Sheet', desc: 'Concentrated rules, definitions, and trap warnings' },
  { id: 'action-items', label: 'Actionable Study Guide', desc: 'Step-by-step revision milestones & exercises' },
];

const sampleTexts = [
  {
    title: 'Operating Systems: Virtual Memory & Page Replacement',
    text: `Virtual memory is a memory management capability of an operating system that uses hardware and software to allow a computer to compensate for physical memory shortages by temporarily transferring data from random access memory to disk storage. It maps virtual addresses used by an application onto physical addresses in computer memory. The primary architecture uses paging, dividing address space into fixed-size blocks called pages, typically 4KB in size. The Memory Management Unit (MMU) handles translation via page tables, accelerated by the Translation Lookaside Buffer (TLB). When a program accesses a page not resident in RAM, a Page Fault exception is raised, triggering the OS kernel to fetch the page from backing store. Page replacement algorithms include FIFO, Least Recently Used (LRU), Clock algorithm, and Optimal (Belady's). LRU approximates the optimal strategy by replacing pages that have not been referenced for the longest duration, though strict LRU has high hardware overhead, so modern kernels like Linux implement clock/second-chance variants with active/inactive page lists. Thrashing occurs when the working set of active processes exceeds physical memory, causing continuous page faults and near-zero CPU throughput.`,
  },
  {
    title: 'Neuroscience: Long-Term Potentiation & Memory Formation',
    text: `Long-term potentiation (LTP) is a persistent strengthening of synapses based on recent patterns of activity. These are patterns of synaptic activity that produce a long-lasting increase in signal transmission between two neurons. It is widely considered one of the major cellular mechanisms that underlies learning and memory. In the CA1 region of the hippocampus, LTP induction requires glutamate release from the presynaptic terminal acting on AMPA and NMDA receptors. At resting membrane potential, NMDA receptor channels are blocked by extracellular magnesium ions (Mg2+). Strong depolarization of the postsynaptic membrane via AMPA receptor activation expels the Mg2+ block, allowing calcium ions (Ca2+) to enter through NMDA channels. The influx of Ca2+ activates calcium/calmodulin-dependent protein kinase II (CaMKII) and protein kinase C. CaMKII phosphorylates existing AMPA receptors, increasing their single-channel conductance, and facilitates the insertion of additional AMPA receptors into the postsynaptic density. Late-phase LTP involves gene transcription and protein synthesis, regulated by cAMP response element-binding protein (CREB), leading to structural dendritic spine remodeling.`,
  },
];

export const SummarizerView: React.FC<SummarizerViewProps> = ({
  onNotify,
  onSendToQuiz,
  onSendToFlashcards,
}) => {
  const [text, setText] = useState('');
  const [format, setFormat] = useState<SummaryFormat>('structured');
  const [focusArea, setFocusArea] = useState('Key concepts & exam readiness');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setText(content);
        if (onNotify) onNotify(`Imported ${file.name} (${content.length} characters)`);
      }
    };
    reader.readAsText(file);
  };

  const handleSummarize = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const data = await summarizeText(text.trim(), format, focusArea);
      setResult(data);
      addHistoryItem({
        type: 'summary',
        title: data.title || 'Study Material Summary',
        summary: data.executiveSummary?.slice(0, 140) + '...',
      });
      if (onNotify) onNotify('Summary generated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to summarize text.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const content = `# ${result.title}
## Executive Summary
${result.executiveSummary}

## Key Takeaways
${result.keyTakeaways.map((k) => `- ${k}`).join('\n')}

## Core Concepts
${result.coreConcepts.map((c) => `- **${c.term}**: ${c.definition} (Significance: ${c.significance})`).join('\n')}

## Formulas / Key Rules
${result.formulasOrKeyRules.map((f) => `- ${f}`).join('\n')}

## Exam Tips
${result.examTips.map((t) => `- ${t}`).join('\n')}`;

    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const content = `# ${result.title}
## Executive Summary
${result.executiveSummary}

## Key Takeaways
${result.keyTakeaways.map((k) => `- ${k}`).join('\n')}

## Core Concepts
${result.coreConcepts.map((c) => `- **${c.term}**: ${c.definition}\n  *Significance*: ${c.significance}`).join('\n')}

## Formulas & Key Rules
${result.formulasOrKeyRules.map((f) => `- ${f}`).join('\n')}

## Exam Tips & Traps
${result.examTips.map((t) => `- ${t}`).join('\n')}

## Actionable Next Steps
${result.actionItems.map((a) => `- [ ] ${a}`).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(result.title || 'study-summary').toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>Smart Text & Notes Summarizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Condense Dense Chapters, Papers & Lecture Notes
          </h1>
          <p className="mt-2 text-teal-200 text-sm sm:text-base leading-relaxed">
            Transform 10-page textbook readings and research articles into high-retention revision
            notes, essential definitions, and exam traps in seconds.
          </p>
        </div>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-4">
        <form onSubmit={handleSummarize} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              Input Study Material, Article, or Lecture Notes
            </label>

            {/* File Upload Button */}
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 cursor-pointer transition-all">
              <Upload className="w-3.5 h-3.5 text-teal-600" />
              <span>Import Text/Markdown File</span>
              <input
                type="file"
                accept=".txt,.md,.markdown,.csv,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="Paste your study text, textbook chapter excerpt, research abstract, or lecture notes here..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-sans"
          />

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{text.length} characters ({Math.round(text.split(/\s+/).filter(Boolean).length)} words)</span>
            {text && (
              <button
                type="button"
                onClick={() => setText('')}
                className="text-slate-400 hover:text-slate-600 underline"
              >
                Clear
              </button>
            )}
          </div>

          {/* Formats Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2">
            {formats.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFormat(f.id)}
                className={`text-left p-3 rounded-xl border text-xs transition-all ${
                  format === f.id
                    ? 'border-teal-600 bg-teal-50/70 ring-1 ring-teal-600 text-teal-950 font-semibold'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="font-semibold text-slate-900 mb-0.5">{f.label}</div>
                <div className="text-[11px] text-slate-500">{f.desc}</div>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
            <div className="w-full sm:w-auto flex-1 max-w-sm">
              <input
                type="text"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                placeholder="Specific focus (e.g., 'Exam traps', 'Mathematical formulas')"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:border-teal-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white text-sm font-semibold shadow-md shadow-teal-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing High-Yield Summary...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Smart Summary</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Sample text picker */}
        <div className="pt-3 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Try a sample reading excerpt:
          </p>
          <div className="flex flex-wrap gap-2">
            {sampleTexts.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setText(s.text)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-900 text-slate-700 transition-all"
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {/* Summary Output */}
      {result && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          {/* Header & Meta */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
                <FileCheck className="w-4 h-4" />
                <span>Executive Study Overview</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{result.title}</h2>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Est. reading time: ~{result.estimatedReadingTimeMinutes || 2} mins</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Markdown</span>
              </button>
            </div>
          </div>

          {/* Executive Summary Box */}
          <div className="p-5 rounded-xl bg-teal-50/60 border border-teal-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 mb-2">
              Summary
            </h3>
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal">
              {result.executiveSummary}
            </p>
          </div>

          {/* Key Takeaways */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              High-Yield Key Takeaways
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {result.keyTakeaways.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Core Concept Glossary */}
          {result.coreConcepts && result.coreConcepts.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Key Terms & Concept Glossary
              </h3>
              <div className="space-y-2.5">
                {result.coreConcepts.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all text-xs sm:text-sm"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm">{c.term}</span>
                      <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        Key Concept
                      </span>
                    </div>
                    <p className="text-slate-600 mb-1.5">{c.definition}</p>
                    <div className="text-xs text-indigo-900 bg-indigo-50/70 p-2 rounded-lg border border-indigo-100/60">
                      <strong>Significance:</strong> {c.significance}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulas / Rules & Exam Tips Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.formulasOrKeyRules && result.formulasOrKeyRules.length > 0 && (
              <div className="p-5 rounded-xl bg-slate-900 text-slate-100 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  Formulas & Governing Principles
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm font-mono text-slate-200">
                  {result.formulasOrKeyRules.map((f, idx) => (
                    <li key={idx} className="p-2 rounded bg-white/5 border border-white/10">
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.examTips && result.examTips.length > 0 && (
              <div className="p-5 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Exam Tips & Watch Outs
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-amber-950">
                  {result.examTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">&#9888;</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Items */}
          {result.actionItems && result.actionItems.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Action Items & Revision Checklist
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                {result.actionItems.map((act, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-teal-600 focus:ring-teal-500" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Convert into quiz or flashcards */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 bg-slate-50/60 p-4 rounded-xl">
            <span className="text-xs font-medium text-slate-600">
              Transform this summary into active recall resources:
            </span>
            <div className="flex items-center gap-2">
              {onSendToQuiz && (
                <button
                  type="button"
                  onClick={() => onSendToQuiz(result.executiveSummary || text)}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Generate Quiz</span>
                </button>
              )}
              {onSendToFlashcards && (
                <button
                  type="button"
                  onClick={() => onSendToFlashcards(result.executiveSummary || text)}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Create Flashcards Deck</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
