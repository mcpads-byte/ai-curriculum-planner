'use client';
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [resultRows, setResultRows] = useState<any[]>([]);

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
      return alert("Please ensure all input fields (including Content & Performance Standards) are filled out!");
    }

    setLoading(true);
    setResultRows([]);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject, grade, competencies, topics, contentStandard, performanceStandard, coreValues
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      // Save the array of parsed rows returned by the AI
      setResultRows(data.rows || []);
    } catch (error) {
      alert("Failed to build out aligned curriculum maps. Please check your setup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Title */}
        <header className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Curriculum Design & Alignment Matrix</h1>
          <p className="text-xs text-slate-500 mt-0.5">Input your standards, topics, and competencies. The system will build out beautifully separated rows for each competency.</p>
        </header>

        {/* Complete Input Form Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <form onSubmit={handleMapGeneration} className="space-y-4">
            
            {/* Subject & Grade Rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Subject Title</label>
                <input type="text" placeholder="e.g., Mathematics 10" className="w-full border border-slate-300 p-2 rounded text-xs bg-white outline-none focus:ring-2 focus:ring-blue-600" value={subject} onChange={e => setSubject(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Target Grade Level</label>
                <input type="text" placeholder="e.g., Grade 10" className="w-full border border-slate-300 p-2 rounded text-xs bg-white outline-none focus:ring-2 focus:ring-blue-600" value={grade} onChange={e => setGrade(e.target.value)} />
              </div>
            </div>

            {/* Standards Input Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Content Standard</label>
                <textarea rows={2} placeholder="What should learners conceptually understand..." className="w-full border border-slate-300 p-2 rounded text-xs bg-white outline-none focus:ring-2 focus:ring-blue-600" value={contentStandard} onChange={e => setContentStandard(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Performance Standard</label>
                <textarea rows={2} placeholder="What should learners be able to produce/perform transferably..." className="w-full border border-slate-300 p-2 rounded text-xs bg-white outline-none focus:ring-2 focus:ring-blue-600" value={performanceStandard} onChange={e => setPerformanceStandard(e.target.value)} />
              </div>
            </div>

            {/* Topics & Competencies Rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Learning Competencies (You can paste multiple items here)</label>
                <textarea rows={4} placeholder="e.g., M10AL-Ia-1: Solves problems involving quadratic equations..." className="w-full border border-slate-300 p-2 rounded text-xs bg-white outline-none focus:ring-2 focus:ring-blue-600" value={competencies} onChange={e => setCompetencies(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Target Topics / Chapters</label>
                <textarea rows={4} placeholder="e.g., Quadratic Equations, Factoring Radicals..." className="w-full border border-slate-300 p-2 rounded text-xs bg-white outline-none focus:ring-2 focus:ring-blue-600" value={topics} onChange={e => setTopics(e.target.value)} />
              </div>
            </div>

            {/* Core Institutional Values */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-1">Institutional Core Values Integration</label>
              <input type="text" className="w-full border border-slate-300 p-2 rounded text-xs bg-white font-bold text-emerald-800 outline-none focus:ring-2 focus:ring-blue-600" value={coreValues} onChange={e => setCoreValues(e.target.value)} />
            </div>

            {/* Submit Action */}
            <button type="submit" disabled={loading} className="w-full p-2.5 rounded-lg font-bold text-xs uppercase tracking-wider text-white bg-slate-900 hover:bg-blue-900 transition-colors">
              {loading ? 'Analyzing Tracks & Aligning Rows...' : 'Map Aligned Resources & Assessments'}
            </button>
          </form>
        </div>

        {/* Separated Row Curriculum Map Registry Output View */}
        {resultRows.length > 0 && (
          <div className="bg-white p-6 rounded-xl border border-slate-300 shadow-md space-y-4">
            <div className="text-center font-serif text-base font-bold uppercase tracking-tight border-b border-slate-900 pb-2">
              Official Curriculum Mapping Registry — {subject} ({grade})
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-2 border-slate-900 text-xs font-serif" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                <thead>
                  <tr className="bg-slate-100 font-bold border-b-2 border-slate-900 text-center uppercase tracking-tight">
                    <th className="border-r border-slate-900 p-2 w-1/5">Global Standards & Topics</th>
                    <th className="border-r border-slate-900 p-2 w-1/5">Target Competency</th>
                    <th className="border-r border-slate-900 p-2 w-1/4">AI Aligned Activities</th>
                    <th className="border-r border-slate-900 p-2 w-1/4">AI Aligned Assessments</th>
                    <th className="p-2 w-1/6">Resources & Values</th>
                  </tr>
                </thead>
                <tbody className="align-top divide-y divide-slate-900">
                  {resultRows.map((rowItem, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      {/* Left Column: Prints your global setup data only on the first row, or neatly matches it down */}
                      {index === 0 ? (
                        <td className="border-r border-slate-900 p-2 bg-slate-50/70 space-y-2 font-sans" rowSpan={resultRows.length}>
                          <div><strong className="block text-[9px] uppercase tracking-wider text-slate-500">Topic Base:</strong> <span className="italic font-serif text-slate-900 text-xs font-bold">{topics}</span></div>
                          <hr className="border-slate-300" />
                          <div><strong className="block text-[9px] uppercase tracking-wider text-slate-500">Content Standard:</strong> <span className="text-slate-700 text-xs">{contentStandard}</span></div>
                          <hr className="border-slate-300" />
                          <div><strong className="block text-[9px] uppercase tracking-wider text-slate-500">Performance Standard:</strong> <span className="text-slate-700 text-xs">{performanceStandard}</span></div>
                        </td>
                      ) : null}

                      {/* Mapped Competency (One unique block per row!) */}
                      <td className="border-r border-slate-900 p-2 whitespace-pre-line font-bold text-slate-900 bg-slate-50/20">
                        {rowItem.competency}
                      </td>

                      {/* Aligned Activities specific to this row's competency */}
                      <td className="border-r border-slate-900 p-2 whitespace-pre-line text-slate-700 leading-relaxed">
                        {rowItem.alignedActivities}
                      </td>

                      {/* Aligned Assessments specific to this row's competency */}
                      <td className="border-r border-slate-900 p-2 whitespace-pre-line text-slate-700 leading-relaxed">
                        {rowItem.alignedAssessments}
                      </td>

                      {/* Aligned Resources and Global Values column */}
                      <td className="p-2 space-y-3">
                        <div className="whitespace-pre-line text-slate-700">
                          {rowItem.alignedResources}
                        </div>
                        <div className="p-1.5 bg-emerald-50 border border-emerald-200 text-[10px] font-sans font-bold text-emerald-800 rounded">
                          <span className="block text-[8px] uppercase tracking-widest text-emerald-600 mb-0.5 font-black">Values Framework:</span>
                          {coreValues}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}