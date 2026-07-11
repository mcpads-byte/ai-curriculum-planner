'use client';
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [mapData, setMapData] = useState<any>(null);

  // Form Inputs
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [competencies, setCompetencies] = useState('');
  const [topics, setTopics] = useState('');
  const [contentStandard, setContentStandard] = useState('');
  const [performanceStandard, setPerformanceStandard] = useState('');
  const [coreValues, setCoreValues] = useState('God Fearing, Respectfulness, Initiative, Love of Nature, Leadership');

  const handleMapGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !grade || !competencies || !topics || !contentStandard || !performanceStandard) {
      return alert("Please ensure all fields are filled out completely!");
    }

    setLoading(true);
    setMapData(null);

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
      let buffer = '';

      while (!done) {
        const { value, done: readingDone } = await reader.read();
        done = readingDone;
        buffer += decoder.decode(value, { stream: !done });
      }

      const cleanJson = buffer.replace(/```json/g, '').replace(/```/g, '').trim();
      setMapData(JSON.parse(cleanJson));
    } catch (error) {
      console.error(error);
      alert("Failed to build curriculum matrix mapping.");
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

        {/* Input Interface */}
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
        {mapData && (
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
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line" rowSpan={3}>{contentStandard}</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line" rowSpan={3}>{performanceStandard}</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line bg-slate-50/10">{mapData.acquisition?.competencies}</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line text-slate-700">{mapData.acquisition?.assessments}</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line text-slate-700">{mapData.acquisition?.activities}</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line text-slate-700">{mapData.acquisition?.resources}</td>
                    <td className="p-2 font-sans text-xs font-bold text-emerald-800 text-center" rowSpan={3}>{coreValues}</td>
                  </tr>

                  {/* Row 2: MAKE MEANING */}
                  <tr>
                    <td className="border-r border-slate-900 p-2 font-bold bg-slate-50 text-center">MAKE MEANING</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line bg-slate-50/10">{mapData.makeMeaning?.competencies}</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line text-slate-700">{mapData.makeMeaning?.assessments}</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line text-slate-700">{mapData.makeMeaning?.activities}</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line text-slate-700">{mapData.makeMeaning?.resources}</td>
                  </tr>

                  {/* Row 3: TRANSFER */}
                  <tr>
                    <td className="border-r border-slate-900 p-2 font-bold bg-slate-50 text-center">TRANSFER</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line bg-slate-50/10">{mapData.transfer?.competencies}</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line text-slate-700">{mapData.transfer?.assessments}</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line text-slate-700">{mapData.transfer?.activities}</td>
                    <td className="border-r border-slate-900 p-2 whitespace-pre-line text-slate-700">{mapData.transfer?.resources}</td>
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