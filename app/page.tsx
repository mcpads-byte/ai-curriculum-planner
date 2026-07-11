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
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12 text-gray-800">
      <div className="max-w-5xl mx-auto">
        {/* Header section */}
        <header className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-blue-900">AI Curriculum Map & Weekly Planner</h1>
          <p className="text-gray-600 mt-2">Generate structured 4-week learning guides instantly powered by Gemini.</p>
        </header>

        {/* Input Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Subject / Course Name</label>
              <input 
                type="text" 
                placeholder="e.g., Mathematics, Oral Communication" 
                className="w-full border border-gray-300 p-2.5 rounded text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={subject} 
                onChange={e => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Grade / Level</label>
              <input 
                type="text" 
                placeholder="e.g., Grade 7, Grade 11" 
                className="w-full border border-gray-300 p-2.5 rounded text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={grade} 
                onChange={e => setGrade(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full p-2.5 rounded font-medium text-white transition-colors ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Generating Plan...
                </span>
              ) : 'Generate Dashboard'}
            </button>
          </form>
        </div>

        {/* Results Display Area */}
        {plan && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-fadeIn">
            <h2 className="text-2xl font-bold text-blue-900 mb-6 pb-2 border-b-2 border-blue-100">
              {plan.title}
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 text-left text-sm">
                <thead>
                  <tr className="bg-blue-900 text-white font-semibold">
                    <th className="border border-gray-200 p-3 w-24">Week</th>
                    <th className="border border-gray-200 p-3 w-1/4">Core Topic / Unit</th>
                    <th className="border border-gray-200 p-3 w-1/3">Learning Objectives</th>
                    <th className="border border-gray-200 p-3">Suggested Learning Activities</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {plan.weeks.map((w: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="border border-gray-200 p-3 font-bold text-blue-700 align-top">
                        {w.weekNumber}
                      </td>
                      <td className="border border-gray-200 p-3 font-semibold text-gray-900 align-top">
                        {w.topic}
                      </td>
                      <td className="border border-gray-200 p-3 text-gray-700 whitespace-pre-line align-top">
                        {w.objectives}
                      </td>
                      <td className="border border-gray-200 p-3 text-gray-700 whitespace-pre-line align-top">
                        {w.activities}
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