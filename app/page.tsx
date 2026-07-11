'use client';
import { useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'curriculum' | 'weekly'>('curriculum');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [competencies, setCompetencies] = useState('');
  const [topics, setTopics] = useState('');
  const [week, setWeek] = useState('Week 1');
  
  const [resultData, setResultData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !grade || !competencies) return alert("Please fill out Subject, Grade, and Competencies fields!");
    
    setLoading(true);
    setResultData(null);
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          subject,
          grade,
          competenciesInput: competencies,
          topicsInput: topics,
          selectedWeek: week
        }),
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResultData(data);
    } catch (error) {
      alert("Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Workspace Title */}
        <header className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Instructional Design Suite</h1>
            <p className="text-sm text-slate-500 mt-1">Automate official Curriculum Maps and detailed dual-column Weekly Plans with UbD frameworks.</p>
          </div>
          
          {/* Engine Selector Buttons */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 w-full md:w-auto">
            <button 
              onClick={() => { setActiveTab('curriculum'); setResultData(null); }}
              className={`flex-1 md:flex-initial px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'curriculum' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Curriculum Map
            </button>
            <button 
              onClick={() => { setActiveTab('weekly'); setResultData(null); }}
              className={`flex-1 md:flex-initial px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'weekly' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Weekly Learning Plan
            </button>
          </div>
        </header>

        {/* Input Interface Layout */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Subject Name</label>
                <input type="text" placeholder="e.g., Mathematics 10" className="w-full border border-slate-300 p-2 rounded text-sm bg-white outline-none focus:ring-2 focus:ring-blue-600" value={subject} onChange={e => setSubject(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Grade Level</label>
                <input type="text" placeholder="e.g., Grade 10" className="w-full border border-slate-300 p-2 rounded text-sm bg-white outline-none focus:ring-2 focus:ring-blue-600" value={grade} onChange={e => setGrade(e.target.value)} />
              </div>
              {activeTab === 'weekly' ? (
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Target Week</label>
                  <select className="w-full border border-slate-300 p-2 rounded text-sm bg-white outline-none focus:ring-2 focus:ring-blue-600" value={week} onChange={e => setWeek(e.target.value)}>
                    <option>Week 1</option><option>Week 2</option><option>Week 3</option><option>Week 4</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Topics Mapping (Optional)</label>
                  <input type="text" placeholder="e.g., Quadratic Equations, Functions" className="w-full border border-slate-300 p-2 rounded text-sm bg-white outline-none focus:ring-2 focus:ring-blue-600" value={topics} onChange={e => setTopics(e.target.value)} />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-1">Learning Competencies for Processing</label>
              <textarea rows={3} placeholder="Paste your official DepEd / institutional learning competencies text here..." className="w-full border border-slate-300 p-2 rounded text-sm bg-white outline-none focus:ring-2 focus:ring-blue-600" value={competencies} onChange={e => setCompetencies(e.target.value)} />
            </div>

            <button type="submit" disabled={loading} className={`w-full p-2.5 rounded-lg font-bold text-sm text-white transition-colors ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-900 hover:bg-slate-900'}`}>
              {loading ? 'Processing Instructional Design Blueprints...' : `Generate Official ${activeTab === 'curriculum' ? 'Curriculum Map' : 'Weekly Plan Sheet'}`}
            </button>
          </form>
        </div>

        {/* Results Render Output Workspace */}
        {resultData && activeTab === 'curriculum' && (
          <div className="bg-white p-8 rounded-xl border-2 border-slate-800 shadow-md space-y-6">
            <div className="border-b-2 border-slate-800 pb-4 text-sm grid grid-cols-2 md:grid-cols-4 gap-2 font-bold text-slate-700">
              <div>Subject: <span className="font-normal">{subject}</span></div>
              <div>Grade Level: <span className="font-normal">{grade}</span></div>
              <div>Teacher: <span className="font-normal">_________________</span></div>
              <div>Term: <span className="font-normal">{resultData.term || 'Term 1'}</span></div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-2 border-slate-800 text-xs bg-white">
                <thead>
                  <tr className="bg-slate-100 font-black text-slate-900 border-b-2 border-slate-800 uppercase">
                    <th className="border-r border-slate-400 p-2 w-32">TOPIC/QUARTER</th>
                    <th className="border-r border-slate-400 p-2 w-44">CONTENT STANDARD</th>
                    <th className="border-r border-slate-400 p-2 w-44">PERFORMANCE STANDARD</th>
                    <th className="border-r border-slate-400 p-2 w-1/4">LEARNING COMPETENCIES</th>
                    <th className="border-r border-slate-400 p-2">ASSESSMENTS</th>
                    <th className="border-r border-slate-400 p-2">ACTIVITIES</th>
                    <th className="border-r border-slate-400 p-2">RESOURCES</th>
                    <th className="p-2">INSTITUTIONAL CORE VALUES</th>
                  </tr>
                </thead>
                <tbody className="align-top divide-y divide-slate-800">
                  {/* Acquisition Stage Row */}
                  <tr>
                    <td className="border-r border-slate-400 p-2 font-black bg-slate-50 text-blue-900">ACQUISITION</td>
                    <td className="border-r border-slate-400 p-2 whitespace-pre-line" rowSpan={3}>{resultData.contentStandard}</td>
                    <td className="border-r border-slate-400 p-2 whitespace-pre-line" rowSpan={3}>{resultData.performanceStandard}</td>
                    <td className="border-r border-slate-400 p-2 whitespace-pre-line">{resultData.acquisition?.competencies}</td>
                    <td className="border-r border-slate-400 p-2 whitespace-pre-line">{resultData.acquisition?.assessments}</td>
                    <td className="border-r border-slate-400 p-2 whitespace-pre-line">{resultData.acquisition?.activities}</td>
                    <td className="border-r border-slate-400 p-2 whitespace-pre-line" rowSpan={3}>{resultData.resources}</td>
                    <td className="p-2 text-emerald-900 font-bold whitespace-pre-line" rowSpan={3}>{resultData.coreValuesIntegration}</td>
                  </tr>
                  {/* Meaning Stage Row */}
                  <tr>
                    <td className="border-r border-slate-400 p-2 font-black bg-slate-50 text-blue-900">MAKE MEANING</td>
                    <td className="border-r border-slate-400 p-2 whitespace-pre-line">{resultData.makeMeaning?.competencies}</td>
                    <td className="border-r border-slate-400 p-2 whitespace-pre-line">{resultData.makeMeaning?.assessments}</td>
                    <td className="border-r border-slate-400 p-2 whitespace-pre-line">{resultData.makeMeaning?.activities}</td>
                  </tr>
                  {/* Transfer Stage Row */}
                  <tr>
                    <td className="border-r border-slate-400 p-2 font-black bg-slate-50 text-blue-900">TRANSFER</td>
                    <td className="border-r border-slate-400 p-2 whitespace-pre-line">{resultData.transfer?.competencies}</td>
                    <td className="border-r border-slate-400 p-2 whitespace-pre-line">{resultData.transfer?.assessments}</td>
                    <td className="border-r border-slate-400 p-2 whitespace-pre-line">{resultData.transfer?.activities}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Weekly Plan Blueprint Layout View */}
        {resultData && activeTab === 'weekly' && (
          <div className="bg-white p-8 rounded-xl border border-slate-300 shadow-md space-y-8 max-w-4xl mx-auto font-serif" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            <h2 className="text-center text-lg font-bold uppercase border-b-2 border-slate-900 pb-2">
              {week} Lesson Blueprint: {subject} ({grade})
            </h2>

            {/* I. Explore Section Table */}
            <section className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wide text-blue-900">I. EXPLORE</h3>
              <table className="w-full border-collapse border border-slate-900 text-xs">
                <tbody>
                  <tr className="border-b border-slate-900 align-top">
                    <td className="w-1/3 border-r border-slate-900 p-2 font-bold space-y-2 bg-slate-50">
                      <div>Topic: {resultData.explore?.topic}</div>
                      <div>Content Standard: {resultData.explore?.contentStandard}</div>
                      <div>Performance Standard: {resultData.explore?.performanceStandard}</div>
                    </td>
                    <td className="p-2 space-y-3 whitespace-pre-line">
                      <div><strong className="block uppercase text-[10px] text-slate-500">Unit Overview:</strong>{resultData.explore?.overview}</div>
                      <div><strong className="block uppercase text-[10px] text-slate-500">This Unit Is About:</strong>{resultData.explore?.thisUnitIsAbout}</div>
                      <div><strong className="block uppercase text-[10px] text-slate-500">You Will Learn To:</strong>{resultData.explore?.youWillLearnTo}</div>
                      <div><strong className="block uppercase text-[10px] text-slate-500">Essential Question:</strong>{resultData.explore?.essentialQuestion}</div>
                      <div><strong className="block uppercase text-[10px] text-slate-500">Conceptual Change Activity:</strong>{resultData.explore?.conceptualChangeActivity}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* II. Acquisition Section Table */}
            <section className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wide text-blue-900">II. ACQUISITION</h3>
              <table className="w-full border-collapse border border-slate-900 text-xs">
                <tbody>
                  <tr className="border-b border-slate-900 align-top">
                    <td className="w-1/3 border-r border-slate-900 p-2 font-bold space-y-4 bg-slate-50">
                      <div>Competency: {resultData.acquisition?.competency}</div>
                      <div>Learning Targets: <div className="font-normal text-slate-700 whitespace-pre-line mt-1">{resultData.acquisition?.targets}</div></div>
                      <div>Success Criteria: <div className="font-normal text-slate-700 whitespace-pre-line mt-1">{resultData.acquisition?.criteria}</div></div>
                      <div>Look-Fors: <div className="font-normal text-slate-700 whitespace-pre-line mt-1">{resultData.acquisition?.lookFors}</div></div>
                    </td>
                    <td className="p-2 space-y-3 whitespace-pre-line">
                      <div><strong>Activity Introduction:</strong> {resultData.acquisition?.activityIntro}</div>
                      <div><strong>Step-by-Step Instructions:</strong> {resultData.acquisition?.activitySteps}</div>
                      <div><strong>Analysis Questions:</strong> {resultData.acquisition?.activityQuestions}</div>
                      <div><strong>Resources & Clickable Scaffolds:</strong> <span className="text-blue-700 underline cursor-pointer">{resultData.acquisition?.resourcesLinks}</span></div>
                      <div><strong>Sample Student Worksheet Draft:</strong> {resultData.acquisition?.sampleWorksheet}</div>
                      <div><strong>Modular Activity Matrix:</strong> {resultData.acquisition?.modularActivity}</div>
                      <div><strong>Asynchronous Extension:</strong> {resultData.acquisition?.asynchronousActivity}</div>
                      <div className="bg-slate-50 p-2 border border-slate-200 rounded"><strong>Summative Evaluation Items:</strong> {resultData.acquisition?.assessmentItems}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* III. Make Meaning Section Table */}
            <section className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wide text-blue-900">III. MAKE MEANING</h3>
              <table className="w-full border-collapse border border-slate-900 text-xs">
                <tbody>
                  <tr className="border-b border-slate-900 align-top">
                    <td className="w-1/3 border-r border-slate-900 p-2 font-bold space-y-4 bg-slate-50">
                      <div>Competency: {resultData.makeMeaning?.competency}</div>
                      <div>Learning Targets: <div className="font-normal text-slate-700 whitespace-pre-line mt-1">{resultData.makeMeaning?.targets}</div></div>
                      <div>Success Criteria: <div className="font-normal text-slate-700 whitespace-pre-line mt-1">{resultData.makeMeaning?.criteria}</div></div>
                    </td>
                    <td className="p-2 space-y-3 whitespace-pre-line">
                      <div className="bg-blue-50/50 p-2 border border-blue-200"><strong>Claim-Evidence-Reasoning (CER) Task:</strong> {resultData.makeMeaning?.cerActivityIntro}</div>
                      <div><strong>CER Operational Steps:</strong> {resultData.makeMeaning?.cerActivitySteps}</div>
                      <div><strong>Divided CER Prompts (Claim / Evidence / Reasoning):</strong> {resultData.makeMeaning?.cerWorksheetQuestions}</div>
                      <div><strong>Handout References:</strong> {resultData.makeMeaning?.cerResources}</div>
                      <div className="text-emerald-800 bg-emerald-50/50 p-2 border border-emerald-200"><strong>Completed Sample Answer Worksheet Key:</strong> {resultData.makeMeaning?.cerSampleCompletedWorksheet}</div>
                      <div><strong>Modular Framework:</strong> {resultData.makeMeaning?.modularActivity}</div>
                      <div><strong>Asynchronous Matrix:</strong> {resultData.makeMeaning?.asynchronousActivity}</div>
                      <div><strong>Assessment Items:</strong> {resultData.makeMeaning?.assessmentItems}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* IV. Transfer Section Table */}
            <section className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wide text-blue-900">IV. TRANSFER</h3>
              <table className="w-full border-collapse border border-slate-900 text-xs">
                <tbody>
                  <tr className="align-top">
                    <td className="w-1/3 border-r border-slate-900 p-2 font-bold space-y-4 bg-slate-50">
                      <div>Performance Standard: {resultData.transfer?.performanceStandard}</div>
                      <div>Competency: {resultData.transfer?.competency}</div>
                    </td>
                    <td className="p-2 space-y-3 whitespace-pre-line">
                      <div className="p-2 bg-amber-50/50 border border-amber-200 font-bold">Values Integration & Reflection Focus: {resultData.transfer?.valuesIntro}</div>
                      <div><strong>Implementation Steps:</strong> {resultData.transfer?.valuesSteps}</div>
                      <div><strong>Enrichment Application Activity:</strong> {resultData.transfer?.valuesEnrichmentActivity}</div>
                      <div className="text-slate-600 italic"><strong>Core Values Alignment Justification Matrix:</strong> {resultData.transfer?.valuesEnrichmentExplanation}</div>
                      <div><strong>Modular Task Instructions:</strong> {resultData.transfer?.modularActivity}</div>
                      <div><strong>Asynchronous Task Instructions:</strong> {resultData.transfer?.asynchronousActivity}</div>
                      <div><strong>Assessment Items:</strong> {resultData.transfer?.assessmentItems}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}