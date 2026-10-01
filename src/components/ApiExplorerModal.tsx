import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Loader2,
  Copy,
  Check,
  Code2,
  CheckCircle2,
  Sparkles,
  Server,
  Layers,
} from 'lucide-react';

interface EndpointDoc {
  method: 'POST' | 'GET';
  path: string;
  title: string;
  description: string;
  defaultPayload?: any;
}

const endpoints: EndpointDoc[] = [
  {
    method: 'GET',
    path: '/api/health',
    title: 'Health & Service Spec',
    description: 'Returns server status, Gemini model engine status, and available REST routes.',
  },
  {
    method: 'POST',
    path: '/api/ask',
    title: 'Academic Question Answering',
    description: 'Returns structured, step-by-step academic solutions and conceptual explanations.',
    defaultPayload: {
      question: 'Derive the time complexity of merge sort and explain why it is always O(n log n).',
      subject: 'Computer Science & AI',
      academicLevel: 'Undergraduate',
      includeSteps: true,
    },
  },
  {
    method: 'POST',
    path: '/api/explain',
    title: 'Concept Simplification & Analogies',
    description: 'Generates ELI5 analogies, first-principles deconstructions, and debunked misconceptions.',
    defaultPayload: {
      topic: 'Quantum Superposition & Schrödinger’s Cat',
      mode: 'analogy',
      targetAudience: 'High School',
    },
  },
  {
    method: 'POST',
    path: '/api/summarize',
    title: 'Smart Text & Material Summarization',
    description: 'Transforms lengthy study materials into executive summaries, key takeaways, and exam tips.',
    defaultPayload: {
      text: 'Long-term potentiation (LTP) is a persistent strengthening of synapses based on recent patterns of activity. In hippocampal CA1 neurons, glutamate release activates AMPA and NMDA receptors. Strong depolarization expels magnesium ions, allowing calcium influx which triggers CaMKII phosphorylation and additional AMPA receptor insertion.',
      format: 'structured',
      focusArea: 'Key synaptic mechanisms & exam traps',
    },
  },
  {
    method: 'POST',
    path: '/api/quiz/generate',
    title: 'Automatic Quiz Generator',
    description: 'Produces calibrated MCQs and conceptual short answers with detailed answer keys.',
    defaultPayload: {
      topicOrText: 'Photosynthesis light-dependent reactions vs Calvin Cycle',
      count: 3,
      difficulty: 'medium',
      questionType: 'mixed',
    },
  },
  {
    method: 'POST',
    path: '/api/quiz/evaluate-short-answer',
    title: 'AI Short Answer Grader',
    description: 'Scores student free-text answers from 0-100 with actionable strengths & missing points.',
    defaultPayload: {
      question: 'Why does the sodium-potassium pump require ATP hydrolysis?',
      conceptTested: 'Active Cellular Transport',
      idealAnswer: 'It moves 3 Na+ ions out and 2 K+ ions in against their steep electrochemical gradients.',
      studentAnswer: 'Because it pumps ions uphill against the concentration gradient so it needs cellular energy.',
    },
  },
  {
    method: 'POST',
    path: '/api/learning-path',
    title: 'Personalized Learning Roadmap',
    description: 'Architects a milestone curriculum based on learner level, weekly hours, and targets.',
    defaultPayload: {
      goal: 'Master Microeconomics & Game Theory',
      currentLevel: 'beginner',
      timeframe: '4 weeks',
      weeklyHours: 6,
    },
  },
  {
    method: 'POST',
    path: '/api/flashcards/generate',
    title: 'Flashcard Deck Generator',
    description: 'Produces active-recall spaced-repetition flashcards with memory tags & hints.',
    defaultPayload: {
      topicOrText: 'Organic Chemistry: Aldehydes and Ketones nucleophilic addition',
      count: 4,
    },
  },
  {
    method: 'POST',
    path: '/api/chat',
    title: 'Interactive Multi-Turn Tutor Chat',
    description: 'Maintains conversational learning context with pedagogical tutoring instructions.',
    defaultPayload: {
      messages: [
        { role: 'user', content: 'What is the intuition behind Bayes theorem in simple terms?' },
      ],
      academicSubject: 'Mathematics & Statistics',
      currentTopic: 'Conditional Probability',
    },
  },
];

export const ApiExplorerModal: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDoc>(endpoints[1]);
  const [payloadText, setPayloadText] = useState(
    JSON.stringify(endpoints[1].defaultPayload || {}, null, 2)
  );
  const [loading, setLoading] = useState(false);
  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const handleSelect = (ep: EndpointDoc) => {
    setSelectedEndpoint(ep);
    setPayloadText(JSON.stringify(ep.defaultPayload || {}, null, 2));
    setResponseOutput(null);
  };

  const handleRunRequest = async () => {
    setLoading(true);
    setResponseOutput(null);

    try {
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (selectedEndpoint.method !== 'GET') {
        options.body = payloadText;
      }

      const res = await fetch(selectedEndpoint.path, options);
      const data = await res.json();
      setResponseOutput({ status: res.status, data });
    } catch (err: any) {
      setResponseOutput({ error: err.message || 'Request failed' });
    } finally {
      setLoading(false);
    }
  };

  const curlCommand = `curl -X ${selectedEndpoint.method} "https://ais-dev-...run.app${selectedEndpoint.path}" \\
  -H "Content-Type: application/json"${
    selectedEndpoint.method !== 'GET' ? ` \\\n  -d '${payloadText.replace(/'/g, "\\'")}'` : ''
  }`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            <span>FastAPI / REST API Integration Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            EduGenie REST API Engine & Interactive Explorer
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Directly test backend API endpoints connecting the educational Gemini AI logic with web
            and mobile interfaces. Live request sandbox with JSON payloads and cURL export.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoints Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 py-1">
            Available API Routes
          </h3>
          <div className="space-y-1">
            {endpoints.map((ep) => {
              const isSelected = selectedEndpoint.path === ep.path;
              return (
                <button
                  key={ep.path}
                  type="button"
                  onClick={() => handleSelect(ep)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-950 font-semibold shadow-2xs'
                      : 'border-transparent hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      ep.method === 'GET'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <div className="flex-1 truncate">
                    <div className="font-mono text-slate-900 truncate">{ep.path}</div>
                    <div className="text-[11px] text-slate-500 font-normal">{ep.title}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Playground Area */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-xs font-bold px-2 py-1 rounded ${
                    selectedEndpoint.method === 'GET'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono text-sm font-bold text-slate-900">
                  {selectedEndpoint.path}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyCurl}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-all"
                >
                  {copiedCurl ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>{copiedCurl ? 'Copied cURL' : 'cURL'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleRunRequest}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Send Request</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600">{selectedEndpoint.description}</p>

            {/* Request Body Editor */}
            {selectedEndpoint.method !== 'GET' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Request Payload (JSON Body)
                </label>
                <textarea
                  value={payloadText}
                  onChange={(e) => setPayloadText(e.target.value)}
                  rows={7}
                  className="w-full font-mono text-xs p-3.5 rounded-xl border border-slate-200 bg-slate-900 text-emerald-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Response Output Box */}
            {responseOutput && (
              <div className="space-y-2 pt-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Live Response Payload
                  </label>
                  {responseOutput.status && (
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      HTTP {responseOutput.status} OK
                    </span>
                  )}
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto max-h-96 border border-slate-800">
                  {JSON.stringify(responseOutput.data || responseOutput, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Architecture notes */}
          <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Full-Stack REST Architecture</span>
            </div>
            <p className="leading-relaxed">
              EduGenie implements dedicated JSON REST endpoints with CORS support, structured schema
              validation, and model telemetry headers. The backend protects the Gemini API key while
              providing responsive generation for web, mobile, or external integrations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
