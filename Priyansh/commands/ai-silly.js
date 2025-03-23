const axios = require("axios");

module.exports.config = {
    name: "misha",
    version: "1.0.7",
    hasPermssion: 0,
    credits: "MirryKal",
    description: "Gemini AI with Memory, Reply Support & Fun Mode (Ladki Style)",
    commandCategory: "ai",
    usages: "[ask]",
    cooldowns: 2,
    dependencies: {
        "axios": "1.4.0"
    }
};

// 🔹 API URL (Apni API ka link yahan daalo)
const API_URL = "https://silly-5smc.onrender.com/chat";

// 🔹 User conversation history store karne ka system
const chatHistories = {};
const autoReplyEnabled = {};

// ✅ **AI Command Function**
module.exports.run = async function ({ api, event, args, Users }) {
    const { threadID, messageID, senderID, messageReply } = event;
    let userMessage = args.join(" ");

    // 🔹 Auto-reply toggle system
    if (userMessage.toLowerCase() === "on") {
        autoReplyEnabled[senderID] = true;
        return api.sendMessage("Hyee! 😘 AI auto-reply mode **ON** ho gaya baby! 💖", threadID, messageID);
    }
    if (userMessage.toLowerCase() === "off") {
        autoReplyEnabled[senderID] = false;
        return api.sendMessage("Uff! 😒 AI auto-reply mode **OFF** kar diya baby! 🤐", threadID, messageID);
    }

    // 🔹 User history store system
    if (!chatHistories[senderID]) {
        chatHistories[senderID] = [];
    }

    // 🔹 Agar AI ka pehle se koi context hai toh uske sath continue karo
    const isReplyingToAI = messageReply && chatHistories[senderID] && chatHistories[senderID].length > 0;
    if (isReplyingToAI && messageReply.senderID === api.getCurrentUserID()) {
        userMessage = messageReply.body + "\nUser: " + userMessage;
        chatHistories[senderID].push(`User: ${userMessage}`);
    } else {
        chatHistories[senderID] = [`User: ${userMessage}`];
    }

    // 🔹 Sirf last 5 messages yaad rakho
    if (chatHistories[senderID].length > 5) {
        chatHistories[senderID].shift();
    }

    // 🔹 AI ko pura conversation bhejna
    const fullConversation = chatHistories[senderID].join("\n");

    // 🔹 AI typing reaction
    api.setMessageReaction("⌛", messageID, () => {}, true);

    try {
        const response = await axios.get(`${API_URL}?message=${encodeURIComponent(fullConversation)}`);
        let botReply = response.data.reply || "Uff! Mujhe samajh nahi aaya baby! 😕";

        // 🔹 Fun Mode - Ladki Style
        const funReplies = [
            "Awww! Kitna cute bola tumne! 😍",
            "Hyee! Tum na bade naughty ho! 🤭",
            "Uff! Tum mujhe impress kar rahe ho kya? 😉",
            "Arre arre, kya baat hai! Tum toh bade interesting ho! 💃",
            "Hahaha! Tum na full mast lagte ho! 😘"
        ];

        botReply = `${botReply}\n\n💖 ${funReplies[Math.floor(Math.random() * funReplies.length)]}`;

        // 🔹 AI ka reply history me add karna
        chatHistories[senderID].push(`${botReply}`);

        // 🔹 AI ka response bhejna
        api.sendMessage(botReply, threadID, messageID);

        // 🔹 Reaction update karna
        api.setMessageReaction("✅", messageID, () => {}, true);
    } catch (error) {
        console.error("Error fetching AI response:", error);
        api.sendMessage("Uff! 😔 AI response me error aayi, thodi der baad try karo baby! 💋", threadID, messageID);
        api.setMessageReaction("❌", messageID, () => {}, true);
    }
};

// ✅ **Auto-Reply System (Reply pe AI reply de)**
module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, messageID, senderID, body, messageReply } = event;

    if (!autoReplyEnabled[senderID]) return;

    if (messageReply && messageReply.senderID === api.getCurrentUserID() && chatHistories[senderID]) {
        const args = body.split(" ");
        module.exports.run({ api, event, args });
    }
};
