'use client';
import { useState } from 'react';

export default function Home() {
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !grade) return alert("Please fill out both fields!");
    
    setLoading(true);
    setPlan(null);
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, grade }),
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setPlan(data);
    } catch (error) {
      alert("Failed to generate plan. Please try again.");
    } finally {
      loading && setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8 text-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header section */}
        <header className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold text-blue-900">AI Curriculum Map & UbD Planner</h1>
          <p className="text-gray-600 mt-1 text-sm">Generate structured, high-quality curriculum maps instantly formatted around Acquisition, Meaning, and Transfer.</p>
        </header>

        {/* Input Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Subject / Course Name</label>
              <input 
                type="text" 
                placeholder="e.g., Mathematics 10" 
                className="w-full border border-gray-300 p-2 rounded text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={subject} 
                onChange={e => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Grade / Level</label>
              <input 
                type="text" 
                placeholder="e.g., Grade 10" 
                className="w-full border border-gray-300 p-2 rounded text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={grade} 
                onChange={e => setGrade(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full p-2 rounded font-semibold text-sm text-white transition-colors ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-800 hover:bg-blue-900'}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Generating Map...
                </span>
              ) : 'Generate Curriculum Map'}
            </button>
          </form>
        </div>

        {/* Results Display Area */}
        {plan && (
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-300 space-y-6 animate-fadeIn">
            
            {/* Document Institutional Header Layout */}
            <div className="border-b-2 border-gray-800 pb-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-medium text-gray-700">
                <div><span className="font-bold text-gray-900">Subject:</span> {subject}</div>
                <div><span className="font-bold text-gray-900">Grade Level:</span> {grade}</div>
                <div><span className="font-bold text-gray-900">Teacher:</span> ________________________</div>
                <div><span className="font-bold text-gray-900">Term:</span> {plan.term || 'Term 1'}</div>
              </div>
              <h2 className="text-center text-xl font-black text-gray-900 uppercase tracking-wider mt-4">
                Curriculum Map
              </h2>
            </div>
            
            {/* Main Curriculum Map Blueprint Grid */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-2 border-gray-800 text-left text-xs bg-white">
                <thead>
                  <tr className="bg-gray-100 text-gray-900 uppercase font-black border-b-2 border-gray-800">
                    <th className="border-r border-gray-400 p-2 w-32">TOPIC/QUARTER</th>
                    <th className="border-r border-gray-400 p-2 w-48">CONTENT STANDARD</th>
                    <th className="border-r border-gray-400 p-2 w-48">PERFORMANCE STANDARD</th>
                    <th className="border-r border-gray-400 p-2 w-1/4">LEARNING COMPETENCIES</th>
                    <th className="border-r border-gray-400 p-2">ASSESSMENTS</th>
                    <th className="border-r border-gray-400 p-2">ACTIVITIES</th>
                    <th className="border-r border-gray-400 p-2">RESOURCES</th>
                    <th className="p-2">INSTITUTIONAL CORE VALUES</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Row 1: ACQUISITION */}
                  <tr className="border-b border-gray-800 align-top">
                    <td className="border-r border-gray-400 p-2 font-bold bg-gray-50 uppercase text-blue-900" rowSpan={1}>
                      ACQUISITION
                    </td>
                    {/* Share Content/Performance/Resources across the rows uniformly */}
                    <td className="border-r border-gray-400 p-2 text-gray-800 whitespace-pre-line" rowSpan={3}>
                      {plan.contentStandard}
                    </td>
                    <td className="border-r border-gray-400 p-2 text-gray-800 whitespace-pre-line" rowSpan={3}>
                      {plan.performanceStandard}
                    </td>
                    <td className="border-r border-gray-400 p-2 text-gray-800 whitespace-pre-line">
                      {plan.acquisition?.competencies}
                    </td>
                    <td className="border-r border-gray-400 p-2 text-gray-800 whitespace-pre-line">
                      {plan.acquisition?.assessments}
                    </td>
                    <td className="border-r border-gray-400 p-2 text-gray-800 whitespace-pre-line">
                      {plan.acquisition?.activities}
                    </td>
                    <td className="border-r border-gray-400 p-2 text-gray-800 whitespace-pre-line" rowSpan={3}>
                      {plan.resources}
                    </td>
                    <td className="p-2 text-gray-800 whitespace-pre-line font-medium text-green-800" rowSpan={3}>
                      {plan.coreValues}
                    </td>
                  </tr>

                  {/* Row 2: MAKE MEANING */}
                  <tr className="border-b border-gray-800 align-top">
                    <td className="border-r border-gray-400 p-2 font-bold bg-gray-50 uppercase text-blue-900">
                      MAKE MEANING
                    </td>
                    <td className="border-r border-gray-400 p-2 text-gray-800 whitespace-pre-line">
                      {plan.makeMeaning?.competencies}
                    </td>
                    <td className="border-r border-gray-400 p-2 text-gray-800 whitespace-pre-line">
                      {plan.makeMeaning?.assessments}
                    </td>
                    <td className="border-r border-gray-400 p-2 text-gray-800 whitespace-pre-line">
                      {plan.makeMeaning?.activities}
                    </td>
                  </tr>

                  {/* Row 3: TRANSFER */}
                  <tr className="align-top">
                    <td className="border-r border-gray-400 p-2 font-bold bg-gray-50 uppercase text-blue-900">
                      TRANSFER
                    </td>
                    <td className="border-r border-gray-400 p-2 text-gray-800 whitespace-pre-line">
                      {plan.transfer?.competencies}
                    </td>
                    <td className="border-r border-gray-400 p-2 text-gray-800 whitespace-pre-line">
                      {plan.transfer?.assessments}
                    </td>
                    <td className="border-r border-gray-400 p-2 text-gray-800 whitespace-pre-line">
                      {plan.transfer?.activities}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Formal Sign-off Approvals Section */}
            <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-[11px] font-medium text-gray-700">
              <div className="space-y-1">
                <p className="font-bold text-gray-900">Prepared by:</p>
                <div className="pt-8 border-b border-gray-400 w-4/5 mx-auto"></div>
                <p className="font-bold uppercase text-gray-800 mt-1">Subject Teacher</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-gray-900">Checked By:</p>
                <div className="pt-8 border-b border-gray-400 w-4/5 mx-auto"></div>
                <p className="font-bold uppercase text-gray-800 mt-1">Implementing Officer</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-gray-900">Noted by:</p>
                <div className="pt-8 border-b border-gray-400 w-4/5 mx-auto"></div>
                <p className="font-bold uppercase text-gray-800 mt-1">JHS Academic Coordinator</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-gray-900">Approved by:</p>
                <div className="pt-8 border-b border-gray-400 w-4/5 mx-auto"></div>
                <p className="font-bold uppercase text-gray-800 mt-1">School Principal</p>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}