// AI Assistant JavaScript

class AIAssistant {
    constructor() {
        this.messages = [];
        this.isTyping = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.autoResizeTextarea();
        this.updateCharCounter();
    }

    bindEvents() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const clearBtn = document.getElementById('clear-chat');
        const suggestions = document.querySelectorAll('.suggestion-chip');

        // Send message events
        sendBtn.addEventListener('click', () => this.sendMessage());
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Input events
        messageInput.addEventListener('input', () => {
            this.updateCharCounter();
            this.toggleSendButton();
            this.autoResizeTextarea();
        });

        // Clear chat
        clearBtn.addEventListener('click', () => this.clearChat());

        // Suggestion chips
        suggestions.forEach(chip => {
            chip.addEventListener('click', () => {
                const text = chip.getAttribute('data-text');
                messageInput.value = text;
                this.updateCharCounter();
                this.toggleSendButton();
                this.hideSuggestions();
                messageInput.focus();
            });
        });

        // Hide suggestions when typing
        messageInput.addEventListener('focus', () => {
            if (messageInput.value.trim()) {
                this.hideSuggestions();
            }
        });
    }

    async sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const userPrompt = messageInput.value.trim();

    if (userPrompt === '') {
        return;
    }

    this.addMessage(userPrompt, 'user');
    messageInput.value = '';
    this.toggleSendButton();
    this.scrollToBottom();
    this.showTyping();

    // Get AI response from the backend
    const geminiResponse = await getGeminiResponse(userPrompt);
    this.addMessage(geminiResponse, 'bot');
    this.hideTyping();
    this.scrollToBottom();
    }



    addMessage(text, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        const isBot = sender === 'bot';
        
        messageDiv.className = `message ${isBot ? 'bot-message' : 'user-message'}`;
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <div class="${isBot ? 'bot-avatar' : 'user-avatar'}">
                    <i class="bi ${isBot ? 'bi-robot' : 'bi-person'}"></i>
                </div>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    <p>${this.formatMessage(text)}</p>
                </div>
                <div class="message-time">${this.getCurrentTime()}</div>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        this.scrollToBottom();

        // Add to messages array
        this.messages.push({ text, sender, timestamp: new Date() });
    }

    simulateAIResponse(userMessage) {
        const responses = this.generateAIResponse(userMessage);
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        this.hideTyping();
        this.addMessage(randomResponse, 'bot');
    }

    generateAIResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Programming/Coding responses
        if (message.includes('code') || message.includes('python') || message.includes('javascript') || message.includes('programming')) {
            return [
                "I'd be happy to help you with coding! Could you share the specific code you're working with or describe the problem you're trying to solve?",
                "Programming questions are my specialty! What language are you working with and what would you like assistance with?",
                "Let's debug that together! Please share your code snippet and I'll help you identify any issues and suggest improvements."
            ];
        }
        
        // Creative writing responses
        if (message.includes('story') || message.includes('creative') || message.includes('write')) {
            return [
                "I love creative writing! What genre or theme interests you? I can help you craft an engaging story with compelling characters and plot.",
                "Let's create something amazing together! Would you like me to write a short story, help with character development, or brainstorm plot ideas?",
                "Creative writing is one of my favorite activities! What kind of story are you envisioning - adventure, mystery, sci-fi, romance, or something else?"
            ];
        }
        
        // Technical explanations
        if (message.includes('quantum') || message.includes('explain') || message.includes('how does')) {
            return [
                "Great question! I'd be happy to break down complex topics into easy-to-understand explanations. What specifically would you like me to explain?",
                "I love explaining technical concepts! I can provide detailed explanations with examples and analogies to make it crystal clear.",
                "Technical topics are fascinating! Let me explain this in a way that's both comprehensive and easy to follow."
            ];
        }
        
        // Marketing/Business responses
        if (message.includes('marketing') || message.includes('business') || message.includes('startup')) {
            return [
                "I can help you brainstorm innovative marketing strategies! What's your target audience and what kind of business or product are you promoting?",
                "Marketing is all about connecting with your audience authentically. Tell me about your business and I'll suggest some creative approaches!",
                "Let's develop a marketing strategy that stands out! What industry are you in and what are your main goals?"
            ];
        }
        
        // General/Greeting responses
        if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
            return [
                "Hello! I'm excited to help you today. Whether you need help with coding, creative writing, explanations, or just want to have an interesting conversation, I'm here for you!",
                "Hi there! I'm your AI assistant, ready to tackle any questions or projects you have. What can I help you with today?",
                "Hey! Great to meet you. I'm here to assist with anything from technical questions to creative projects. What's on your mind?"
            ];
        }
        
        // Default responses
        return [
            "That's a fascinating topic! I'd love to dive deeper into this with you. Could you tell me more about what specific aspect interests you most?",
            "Interesting question! I can help you explore this further. What particular angle or approach would you like me to focus on?",
            "I'm intrigued by your question! Let me provide you with a comprehensive response that addresses your needs.",
            "Great point! I can offer you several perspectives on this. Would you like me to start with the fundamentals or dive into more advanced concepts?",
            "That's something I can definitely help with! Let me break this down for you in a clear and useful way."
        ];
    }

    showTyping() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        const chatMessages = document.getElementById('chatMessages');
        const typingTemplate = document.querySelector('.typing-indicator-template');
        const typingIndicator = typingTemplate.cloneNode(true);
        
        typingIndicator.style.display = 'block';
        typingIndicator.classList.remove('typing-indicator-template');
        typingIndicator.classList.add('typing-indicator');
        
        chatMessages.appendChild(typingIndicator);
        this.scrollToBottom();
    }

    hideTyping() {
        this.isTyping = false;
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    clearChat() {
        const chatMessages = document.getElementById('chatMessages');
        const initialMessage = chatMessages.querySelector('.message');
        
        // Keep only the initial bot message
        chatMessages.innerHTML = '';
        chatMessages.appendChild(initialMessage);
        
        this.messages = [];
        this.showSuggestions();
    }

    updateCharCounter() {
        const messageInput = document.getElementById('messageInput');
        const charCount = document.getElementById('charCount');
        const currentLength = messageInput.value.length;
        
        charCount.textContent = currentLength;
        
        // Change color based on character count
        if (currentLength > 1800) {
            charCount.style.color = '#ef4444';
        } else if (currentLength > 1500) {
            charCount.style.color = '#f59e0b';
        } else {
            charCount.style.color = '#94a3b8';
        }
    }

    toggleSendButton() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const hasText = messageInput.value.trim().length > 0;
        
        sendBtn.disabled = !hasText || this.isTyping;
        
        if (hasText && !this.isTyping) {
            sendBtn.classList.add('active');
        } else {
            sendBtn.classList.remove('active');
        }
    }

    autoResizeTextarea() {
        const messageInput = document.getElementById('messageInput');
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
    }

    hideSuggestions() {
        const suggestions = document.getElementById('quickSuggestions');
        suggestions.classList.add('hidden');
    }

    showSuggestions() {
        const suggestions = document.getElementById('quickSuggestions');
        suggestions.classList.remove('hidden');
    }

    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    formatMessage(text) {
        // Basic text formatting
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }
}

async function getGeminiResponse(prompt) {
    try {
        const response = await fetch('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: prompt }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error('Error fetching from backend:', error);
        return 'Sorry, I am unable to connect to the AI at the moment.';
    }
}

// Initialize the AI Assistant when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AIAssistant();
});

// Add some CSS for the active send button
const style = document.createElement('style');
style.textContent = `
    .send-btn.active {
        background: linear-gradient(135deg, #667eea, #764ba2) !important;
        transform: scale(1.02);
    }
    
    .message code {
        background: rgba(102, 126, 234, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 0.9em;
    }
    
    .message strong {
        font-weight: 600;
    }
    
    .message em {
        font-style: italic;
    }
`;
document.head.appendChild(style);