

    //trying to see if the script working
    function hello(){
    console.log("Hello");
    }

    let currentLevel = 'Beginner'; // Default starting level
    let coveredTopics = [];
    console.log("script.js loaded successfully!");


    // Toggle tabs between Conversation and Progress
    async function toggleTab(tabName) {
      // Hide both sections
      document.getElementById('conversation').style.display = 'none';
      document.getElementById('progress').style.display = 'none';

      // Remove active tab highlight
      document.getElementById('conversation-tab').classList.remove('active-tab');
      document.getElementById('progress-tab').classList.remove('active-tab');

      // Show selected section
      if (tabName === 'conversation') {
        document.getElementById('conversation').style.display = 'flex';
        document.getElementById('conversation-tab').classList.add('active-tab');
      } else if (tabName === 'progress') {
  document.getElementById('progress').style.display = 'block';
  document.getElementById('progress-tab').classList.add('active-tab');
  await fetchProgressFromAI(); // NEW FUNCTION to get actual level and topics
}
    }

 async function fetchProgressFromAI() {
  console.log("Fetching progress from AI...");

  const response = await fetch("http://localhost:8000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "You are a backend system that ONLY formats output.Based on the user's conversation so far, give the progress report in this strict format:\n\n**English Level**\n\n* Beginner\n\n**Topics Covered**\n\n* Greetings\n* Introducing Yourself\n\n**Topics Remaining**\n\n* Daily Activities\n* Common Verbs\n* Numbers\n\nFollow these rules exactly:\n- Use double asterisks (**) for headings.\n- No colons (:) after headings.\n- Use an asterisk (*) followed by a space for each bullet point.\n- Do not add any explanations, greetings, extra text, or anything else.\n- Only output in this exact structure. Dont give the examples i gave here. If no level is reached then just beginner" })


  });

  const data = await response.json();
  const aiReply = data.reply;

  console.log(aiReply); // Check what we received from AI.

  // Split the response into lines
  const lines = aiReply.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  let currentSection = "";
  let level = "";
  let coveredTopics = [];
  let remainingTopics = [];

  for (let line of lines) {
    if (line.startsWith("**English Level**")) {
      currentSection = "level";
    } else if (line.startsWith("**Topics Covered**")) {
      currentSection = "covered";
    } else if (line.startsWith("**Topics Remaining**")) {
      currentSection = "remaining";
    } else if (line.startsWith("*")) {
      const content = line.replace("*", "").trim();
      if (currentSection === "level") {
        level = content;
      } else if (currentSection === "covered") {
        coveredTopics.push(content);
      } else if (currentSection === "remaining") {
        remainingTopics.push(content);
      }
    }
  }

  // Update frontend
  const progressList = document.getElementById("progress-list");
  progressList.innerHTML = `
    <li><strong>Level:</strong> ${level}</li>
    <li><strong>Topics Covered:</strong><ul>${coveredTopics.map(topic => `<li>${topic}</li>`).join('')}</ul></li>
    <li><strong>Topics Remaining:</strong><ul>${remainingTopics.map(topic => `<li>${topic}</li>`).join('')}</ul></li>
  `;
}

    // Send message function (for chat)
    async function sendMessage() {
      const input = document.getElementById("user-input");
      const message = input.value.trim();
      if (!message) return;

      const chatBox = document.getElementById("chat-box");
      chatBox.innerHTML += `<div class="user-message">You: ${message}</div>`;

      // Send message to the backend (API)
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message })
      });

      const data = await response.json();
      chatBox.innerHTML += `<div class="ai-message">AI: ${data.reply}</div>`;
      input.value = "";
      chatBox.scrollTop = chatBox.scrollHeight;


    }

    // Update progress section with current level and topics covered
    function updateProgress() {
      const progressList = document.getElementById("progress-list");
      progressList.innerHTML = `<li>Level: ${currentLevel}</li>`;
      progressList.innerHTML += `<li>Topics Covered: ${coveredTopics.join(', ')}</li>`;
    }
