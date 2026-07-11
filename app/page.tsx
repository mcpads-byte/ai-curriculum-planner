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
        if (value) {
          buffer += decoder.decode(value, { stream: !done });
        }
      }

      // Safeguard: Strip any markdown code wraps or trailing white space if present
      const cleanJson = buffer
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      
      setMapData(JSON.parse(cleanJson));
    } catch (error) {
      console.error("Parsing Error:", error);
      alert("Failed to build curriculum matrix mapping due to formatting timeout limits.");
    } finally {
      setLoading(false);
    }
  };