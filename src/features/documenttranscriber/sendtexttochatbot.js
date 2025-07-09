export const sendTextToChatbotForSummary = async (text) => {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `You are a legal expert. Simplify and summarize the following legal text for easy understanding while retaining important details:\n\n${text}`
      }),
    });

    if (!response.ok) {
      console.error("Chatbot summarization error:", response.statusText);
      return text;
    }

    const data = await response.json();
    return data.reply || text;
  } catch (error) {
    console.error("Error in chatbot summarization:", error);
    return text;
  }
};
