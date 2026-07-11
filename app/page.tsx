'use client';
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  
  const [mapData, setMapData] = useState({
    acqComp: '', acqAsst: '', acqAct: '', acqRes: '',
    mmComp: '', mmAsst: '', mmAct: '', mmRes: '',
    transComp: '', transAsst: '', transAct: '', transRes: ''
  });

  // Form Inputs
  const [subject, setSubject] = useState('MATHEMATICS');
  const [grade, setGrade] = useState('10');
  const [competencies, setCompetencies] = useState('');
  const [topics, setTopics] = useState('');
  const [contentStandard, setContentStandard] = useState('');
  const [performanceStandard, setPerformanceStandard] = useState('');
  const [coreValues, setCoreValues] = useState('God Fearing, Respectfulness, Initiative, Love of Nature, Leadership');

  // Flexible RegEx extractor to prevent parsing drops
  const extractBlock = (text: string, currentTag: string, nextTag?: string): string => {
    const escapedTag = currentTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const startRegex = new RegExp(`${escapedTag}\\s*\\n?`, 'i');
    const match = text.match(startRegex);
    
    if (!match || match.index === undefined) return '';
    const startPos = match.index + match[0].length;
    
    let endPos = text.length;
    if (nextTag) {
      const escapedNext = nextTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const endRegex = new RegExp(escapedNext, 'i');
      const nextMatch = text.match(endRegex);
      if (nextMatch && nextMatch.index !== undefined && nextMatch.index > startPos) {
        endPos = nextMatch.index;
      }
    }
    
    return text.substring(startPos, endPos).trim();
  };

  const handleMapGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !grade || !competencies || !topics || !contentStandard || !performanceStandard) {
      return alert("Please ensure all fields are filled out completely!");
    }

    setLoading(true);
    setHasGenerated(false);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, grade, competencies, topics, contentStandard, performanceStandard, coreValues }),
      });

      if (!res.body) throw new Error("Stream connection failed");
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let rawText = '';

      while (!done) {
        const { value, done: readingDone } = await reader.read();
        done = readingDone;
        if (value) {
          rawText += decoder.decode(value, { stream: !done });
        }
      }

      // Safely extract content matching template structural tags
      const acqComp = extractBlock(rawText, '[ACQUISITION_COMPETENCIES]', '[ACQUISITION_ASSESSMENTS]');
      const acqAsst = extractBlock(rawText, '[ACQUISITION_ASSESSMENTS]', '[ACQUISITION_ACTIVITIES]');
      const acqAct = extractBlock(rawText, '[ACQUISITION_ACTIVITIES]', '[ACQUISITION_RESOURCES]');
      const acqRes = extractBlock(rawText, '[ACQUISITION_RESOURCES]', '[MEANING_COMPETENCIES]');

      const mmComp = extractBlock(rawText, '[MEANING_COMPETENCIES]', '[MEANING_ASSESSMENTS]');
      const mmAsst = extractBlock(rawText, '[MEANING_ASSESSMENTS]', '[MEANING_ACTIVITIES]');
      const mmAct = extractBlock(rawText, '[MEANING_ACTIVITIES]', '[MEANING_RESOURCES]');
      const mmRes = extractBlock(rawText, '[MEANING_RESOURCES]', '[TRANSFER_COMPETENCIES]');

      const transComp = extractBlock(rawText, '[TRANSFER_COMPETENCIES]', '[TRANSFER_ASSESSMENTS]');
      const transAsst = extractBlock(rawText, '[TRANSFER_ASSESSMENTS]', '[TRANSFER_ACTIVITIES]');
      const transAct = extractBlock(rawText, '[TRANSFER_ACTIVITIES]', '[TRANSFER_RESOURCES]');
      const transRes = extractBlock(rawText, '[TRANSFER_RESOURCES]');

      setMapData({
        acqComp, acqAsst, acqAct, acqRes,
        mmComp, mmAsst, mmAct, mmRes,
        transComp, transAsst, transAct, transRes
      });
      
      setHasGenerated(true);

    } catch (error) {
      console.error(error);
      alert("System processing timeout or streaming interruption occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <header className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Curriculum Map Alignment Studio</h1>
          <p className="text-xs text-slate-500 mt-0.5">Generate and parse standard metrics directly into formatted curriculum grid layouts.</p>
        </header>

        {/* Form Controls */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <form onSubmit={handleMapGeneration} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Subject</label>
                <input type="text" className="w-full border border-slate-300 p-2 rounded text-xs bg-white outline-none font-bold" value={subject} onChange={e => setSubject(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Grade Level</label>
                <input type="text" className="w-full border border-slate-300 p-2 rounded text-xs bg-white outline-none font-bold" value={grade} onChange={e => setGrade(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Content Standard</label>
                <textarea rows={3} placeholder="Paste content standards..." className="w-full border border-slate-300 p-2 rounded text-xs bg-white outline-none" value={contentStandard} onChange={e => setContentStandard(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Performance Standard</label>
                <textarea rows={3} placeholder="Paste performance standards..." className="w-full border border-slate-300 p-2 rounded text-xs bg-white outline-none" value={performanceStandard} onChange={e => setPerformanceStandard(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Learning Competencies</label>
                <textarea rows={3} placeholder="Paste targeting competencies..." className="w-full border border-slate-300 p-2 rounded text-xs bg-white outline-none" value={competencies} onChange={e => setCompetencies(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Topic / Quarter</label>
                <textarea rows={3} placeholder="e.g., First Quarter..." className="w-full border border-slate-300 p-2 rounded text-xs bg-white outline-none" value={topics} onChange={e => setTopics(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-1">Institutional Core Values</label>
              <input type="text" className="w-full border border-slate-300 p-2 rounded text-xs bg-white font-bold text-emerald-800 outline-none" value={coreValues} onChange={e => setCoreValues(e.target.value)} />
            </div>

            <button type="submit" disabled={loading} className="w-full p-2.5 rounded-lg font-bold text-xs uppercase tracking-wider text-white bg-slate-900 hover:bg-emerald-700 transition-colors">
              {loading ? 'Analyzing & Populating Table Matrix...' : 'Process Map Document'}
            </button>
          </form>
        </div>

        {/* Output Matrix Structure matching the template perfectly */}
        {hasGenerated && (
          <div className="bg-white p-6 rounded-xl border border-slate-300 shadow-md space-y-4">
            <div className="text-sm font-serif text-slate-700 border-b pb-2 flex justify-between">
              <div><strong>Subject:</strong> {subject.toUpperCase()} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Grade Level:</strong> {grade}</div>
              <div className="text-xs text-slate-400 font-sans">Term: Term 1</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-2 border-slate-900 text-xs font-serif" style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '11pt' }}>
                <thead>
                  <tr className="bg-slate-100 font-bold border-b-2 border-slate-900 text-center uppercase tracking-tight">
                    <th className="border-r border-slate-900 p-2 w-32">TOPIC/QUARTER</th>
                    <th className="border-r border-slate-900 p-2 w-48">CONTENT STANDARD</th>
                    <th className="border-r border-slate-900 p-2 w-48">PERFORMANCE STANDARD</th>
                    <th className="border-r border-slate-900 p-2 w-64">LEARNING COMPETENCIES</th>
                    <th className="border-r border-slate-900 p-2 w-56">ASSESSMENTS</th>
                    <th className="border-r border-slate-900 p-2 w-56">ACTIVITIES</th>
                    <th className="border-r border-slate-900 p-2 w-44">RESOURCES</th>
                    <th className="p-2 w-44">INSTITUTIONAL CORE VALUES</th>
                  </tr>
                </thead>
                <tbody className="align-top divide-y divide-slate-900">
                  
                  {/* Row 1: ACQUISITION */}
                  <tr>
                    <td className="border-r border-slate-900 p-2 font-bold bg-slate-50 text-center">ACQUISITION</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line font-serif" rowSpan={3}>
                      <div className="font-bold mb-2">{topics}</div>
                      {contentStandard}
                    </td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line font-serif" rowSpan={3}>{performanceStandard}</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line bg-slate-50/10">{mapData.acqComp}</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line text-slate-700">{mapData.acqAsst}</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line text-slate-700">{mapData.acqAct}</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line text-slate-700">{mapData.acqRes}</td>
                    <td className="p-2 font-sans text-xs font-bold text-emerald-800 text-center" rowSpan={3}>{coreValues}</td>
                  </tr>

                  {/* Row 2: MAKE MEANING */}
                  <tr>
                    <td className="border-r border-slate-900 p-2 font-bold bg-slate-50 text-center">MAKE MEANING</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line bg-slate-50/10">{mapData.mmComp}</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line text-slate-700">{mapData.mmAsst}</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line text-slate-700">{mapData.mmAct}</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line text-slate-700">{mapData.mmRes}</td>
                  </tr>

                  {/* Row 3: TRANSFER */}
                  <tr>
                    <td className="border-r border-slate-900 p-2 font-bold bg-slate-50 text-center">TRANSFER</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line bg-slate-50/10">{mapData.transComp}</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line text-slate-700">{mapData.transAsst}</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line text-slate-700">{mapData.transAct}</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line text-slate-700">{mapData.transRes}</td>
                  </tr>

                </tbody>
              </table>
            </div>

            {/* Verification Signatures block matching bottom layout context */}
            <div className="grid grid-cols-4 gap-4 pt-8 text-center text-[10pt] font-sans text-slate-600">
              <div>
                <div className="border-b border-slate-400 h-8"></div>
                <div className="mt-1 font-bold">Subject Teacher</div>
              </div>
              <div>
                <div className="border-b border-slate-400 h-8"></div>
                <div className="mt-1 font-bold">Implementing Officer</div>
              </div>
              <div>
                <div className="border-b border-slate-400 h-8"></div>
                <div className="mt-1 font-bold">JHS Academic Coordinator</div>
              </div>
              <div>
                <div className="border-b border-slate-400 h-8"></div>
                <div className="mt-1 font-bold">School Principal</div>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}