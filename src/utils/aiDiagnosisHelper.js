export const generateDiagnosisStream = async ({ allFindings, onChunk, onComplete, onError }) => {
  try {
    let contextStr = Object.entries(allFindings)
      .map(([spec, findings]) => `${spec.toUpperCase()}: ${findings}`)
      .join("\n");

    const API_KEY = import.meta.env.VITE_OPENAI_API_KEY; // Replace with your key or use env
    if (!API_KEY) {
      throw new Error("OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env file.");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // or your preferred model
        messages: [
          {
            role: "system",
            content: "You are a professional medical assistant. Provide a numbered list of standard clinical diagnoses based on the findings (1., 2., etc.). For each diagnosis, include a brief (1-2 sentence) description of the condition and its typical treatment. If only one condition is found, provide it clearly. Output only the diagnosis and description, no preamble."
          },
          {
            role: "user",
            content: `Clinical Findings:\n${contextStr}\n\nPlease provide a unified standard medical diagnosis and description for this patient.`
          }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to fetch from OpenAI");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ") && line !== "data: [DONE]") {
          try {
            const json = JSON.parse(line.replace("data: ", ""));
            const content = json.choices[0]?.delta?.content || "";
            if (content) {
              fullText += content;
              onChunk(fullText);
            }
          } catch (e) {
            console.error("Error parsing JSON chunk:", e);
          }
        }
      }
    }

    if (onComplete) onComplete(fullText);
  } catch (err) {
    console.error("AI Diagnosis Error:", err);
    if (onError) onError(err.message);
  }
};
