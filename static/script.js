const chatArea = document.getElementById("chatArea");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const typing = document.getElementById("typing");
const clearChat = document.getElementById("clearChat");
const welcome = document.getElementById("welcome");

let messages = [];
let waiting = false;

function addMessage(role, content) {
    const wrapper = document.createElement("div");
    wrapper.className = `message ${role}`;

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = content;

    wrapper.appendChild(bubble);
    chatArea.appendChild(wrapper);
    chatArea.scrollTop = chatArea.scrollHeight;
}

async function sendMessage(text) {
    if (!text.trim() || waiting) return;

    waiting = true;
    sendButton.disabled = true;
    welcome.hidden = true;

    messages.push({ role: "user", content: text });
    addMessage("user", text);
    messageInput.value = "";
    messageInput.style.height = "auto";
    typing.hidden = false;

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong.");
        }

        messages.push({ role: "assistant", content: data.reply });
        addMessage("assistant", data.reply);

    } catch (error) {
        addMessage("assistant", "Sorry, " + error.message);
    } finally {
        typing.hidden = true;
        waiting = false;
        sendButton.disabled = false;
        messageInput.focus();
    }
}

chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(messageInput.value);
});

messageInput.addEventListener("input", () => {
    messageInput.style.height = "auto";
    messageInput.style.height =
        Math.min(messageInput.scrollHeight, 140) + "px";
});

messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        chatForm.requestSubmit();
    }
});

document.querySelectorAll(".suggestion").forEach((button) => {
    button.addEventListener("click", () => {
        sendMessage(button.textContent);
    });
});

clearChat.addEventListener("click", () => {
    messages = [];
    chatArea.innerHTML = "";
    chatArea.appendChild(welcome);
    welcome.hidden = false;
    messageInput.value = "";
    messageInput.focus();
});
