export const generateDiagnosisStream = async ({
  allFindings,
  detailedFindings,
  onChunk,
  onComplete,
  onError,
}) => {
  try {
    const response = await fetch(
      "http://194.195.117.79:5100/api/V1/doctor/generate-ai-diagnosis",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ allFindings, detailedFindings }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to generate AI diagnosis from server",
      );
    }

    const result = await response.json();
    const fullText = result.data || "";

    // Simulate streaming for UI smoothness if desired, or just return full text
    // Since we switched to non-streaming backend for reliability:
    onChunk(fullText);

    if (onComplete) onComplete(fullText);
  } catch (err) {
    console.error("AI Diagnosis Error:", err);
    if (onError) onError(err.message);
  }
};
