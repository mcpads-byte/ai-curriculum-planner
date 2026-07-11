'use client';
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  
  // Dedicated explicit states for each column to eliminate JSON object dropouts
  const [mapData, setMapData] = useState({
    acqComp: '', acqAsst: '', acqAct: '', acqRes: '',
    mmComp: '', mmAsst: '', mmAct: '', mmRes: '',
    transComp: '', transAsst: '', transAct: '', transRes: ''
  });

  // Form Inputs
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [competencies, setCompetencies] = useState('');
  const [topics, setTopics] = useState('');
  const [contentStandard, setContentStandard] = useState('');
  const [performanceStandard, setPerformanceStandard] = useState('');
  const [coreValues, setCoreValues] = useState('God Fearing, Respectfulness, Initiative, Love of Nature, Leadership');
  const [hasGenerated, setHasGenerated] = useState(false);

  // Bulletproof extraction helper function
  const extractSection = (text: string, currentTag: string, nextTag: string): string => {
    const startIndex = text.indexOf(currentTag);
    if (startIndex === -1) return '';
    const startPos = startIndex + currentTag.length;
    const endIndex = nextTag ? text.indexOf(nextTag, startPos) : text.length;
    return text.substring(startPos, endIndex === -1 ? text.length : endIndex).trim();
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

      if (!res.body) throw new Error("Stream error");
      
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

      // Extract each field safely using the plain text tags
      const acqComp = extractSection(rawText, '[ACQUISITION_COMPETENCIES]', '[ACQUISITION_ASSESSMENTS]');
      const acqAsst = extractSection(rawText, '[ACQUISITION_ASSESSMENTS]', '[ACQUISITION_ACTIVITIES]');
      const acqAct = extractSection(rawText, '[ACQUISITION_ACTIVITIES]', '[ACQUISITION_RESOURCES]');
      const acqRes = extractSection(rawText, '[ACQUISITION_RESOURCES]', '[MEANING_COMPETENCIES]');

      const mmComp = extractSection(rawText, '[MEANING_COMPETENCIES]', '[MEANING_ASSESSMENTS]');
      const mmAsst = extractSection(rawText, '[MEANING_ASSESSMENTS]', '[MEANING_ACTIVITIES]');
      const mmAct = extractSection(rawText, '[MEANING_ACTIVITIES]', '[MEANING_RESOURCES]');
      const mmRes = extractSection(rawText, '[MEANING_RESOURCES]', '[TRANSFER_COMPETENCIES]');

      const transComp = extractSection(rawText, '[TRANSFER_COMPETENCIES]', '[TRANSFER_ASSESSMENTS]');
      const transAsst = extractSection(rawText, '[TRANSFER_ASSESSMENTS]', '[TRANSFER_ACTIVITIES]');
      const transAct = extractSection(rawText, '[TRANSFER_ACTIVITIES]', '[TRANSFER_RESOURCES]');
      const transRes = extractSection(rawText, '[TRANSFER_RESOURCES]', '');

      setMapData({
        acqComp, acqAsst, acqAct, acqRes,
        mmComp, mmAsst, mmAct, mmRes,
        transComp, transAsst, transAct, transRes
      });
      
      setHasGenerated(true);

    } catch (error) {
      console.error(error);
      alert("Failed to compile curriculum mapping blocks reliably.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <header className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Official Curriculum Map Generator</h1>
          <p className="text-xs text-slate-500 mt-0.5">Enter standards and competencies to automatically distribute content across structured AMT rows.</p>
        </header>

        {/* Input Form Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <form onSubmit={handleMapGeneration} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Subject</label>
                <input type="text" placeholder="e.g., Mathematics" className="w-full border border-slate-300 p-2 rounded text-xs bg-white outline-none" value={subject} onChange={e => setSubject(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Grade Level</label>
                <input type="text" placeholder="e.g., Grade 10" className="w-full border border-slate-300 p-2 rounded text-xs bg-white outline-none" value={grade} onChange={e => setGrade(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Content Standard</label>
                <textarea rows={2} placeholder="Paste content standard..." className="w-full border border-slate-300 p-2 rounded text-xs bg-white outline-none" value={contentStandard} onChange={e => setContentStandard(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Performance Standard</label>
                <textarea rows={2} placeholder="Paste performance standard..." className="w-full border border-slate-300 p-2 rounded text-xs bg-white outline-none" value={performanceStandard} onChange={e => setPerformanceStandard(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Learning Competencies</label>
                <textarea rows={3} placeholder="Paste all competencies here..." className="w-full border border-slate-300 p-2 rounded text-xs bg-white outline-none" value={competencies} onChange={e => setCompetencies(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Topic / Quarter</label>
                <textarea rows={3} placeholder="e.g., First Quarter - Quadratic Equations..." className="w-full border border-slate-300 p-2 rounded text-xs bg-white outline-none" value={topics} onChange={e => setTopics(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-1">Institutional Core Values</label>
              <input type="text" className="w-full border border-slate-300 p-2 rounded text-xs bg-white font-bold text-emerald-800 outline-none" value={coreValues} onChange={e => setCoreValues(e.target.value)} />
            </div>

            <button type="submit" disabled={loading} className="w-full p-2.5 rounded-lg font-bold text-xs uppercase tracking-wider text-white bg-slate-900 hover:bg-blue-900 transition-colors">
              {loading ? 'Processing & Aligning Map...' : 'Generate Curriculum Map Document'}
            </button>
          </form>
        </div>

        {/* Official Template Table Matrix Output */}
        {hasGenerated && (
          <div className="bg-white p-6 rounded-xl border border-slate-300 shadow-md space-y-4">
            <div className="text-sm font-serif text-slate-700 border-b pb-2">
              <div><strong>Subject:</strong> {subject} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Grade Level:</strong> {grade}</div>
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
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line" rowSpan={3}>{topics}<br/><br/>{contentStandard}</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line" rowSpan={3}>{performanceStandard}</td>
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
          </div>
        )}
      </div>
    </main>
  );
}