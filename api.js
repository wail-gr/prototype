async function askAI(userPrompt) {
  const res = await fetch("https://YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: userPrompt })
  });

  const data = await res.json();
  console.log("AI response:", data);
}
