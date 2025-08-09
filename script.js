// script.js — minimal chat wiring + graceful fallback to mock reply

const chatArea = document.getElementById('chatArea');
const composer = document.getElementById('composer');
const inputBox = document.getElementById('inputBox');

// helper to append messages
function appendMessage(text, role='assistant'){
  const el = document.createElement('div');
  el.className = `message ${role}`;
  el.textContent = text;
  chatArea.appendChild(el);
  chatArea.scrollTop = chatArea.scrollHeight;
}

// create the first assistant message if not already in DOM
(function ensureInitial(){
  const initial = document.getElementById('initialMessage');
  if (!initial) appendMessage("Salaam — I'm here. What would you like to talk about?", 'assistant');
})();

// basic safety: prevent empty send
composer.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const text = inputBox.value.trim();
  if (!text) return;
  appendMessage(text, 'user');
  inputBox.value = '';
  inputBox.disabled = true;
  try {
    const reply = await askServerForReply(text);
    appendMessage(reply, 'assistant');
  } catch (err) {
    console.error(err);
    appendMessage("Sorry — I couldn't reach the server. Try again later.", 'assistant');
  } finally {
    inputBox.disabled = false;
    inputBox.focus();
  }
});

// calls /api/chat with minimal payload. Expects { reply: "..." } JSON
async function askServerForReply(userText){
  // payload includes lightweight context if you want to extend
  const payload = { messages: [{ role: 'user', text: userText }] };

  try {
    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store'
    });

    if (!resp.ok) throw new Error('server-error');
    const j = await resp.json();
    if (j && j.reply) return j.reply;
    throw new Error('invalid-response');
  } catch (err) {
    // Fallback mock reply for local dev (so UI still shows behavior)
    await wait(600 + Math.random()*800);
    return mockReply(userText);
  }
}

function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }

function mockReply(userText){
  // tiny conversational mock — replace with backend response when available.
  if (/help|sad|depress|suicid|harm/i.test(userText)){
    return "I'm really sorry you're feeling this way. If you're in danger, please contact local emergency services right now. If you can, tell me more or say 'I need help' and I'll give steps.";
  }
  if (/anx|nervous|panic/i.test(userText)){
    return "Okay — try a 4-4-4 breath: inhale 4s, hold 4s, exhale 4s. Tell me how that felt. Small steps build momentum.";
  }
  // default empathetic reply
  return "Thanks for sharing. I hear you. One small step you could try: name one thing you can control right now. Want to try?";
}
