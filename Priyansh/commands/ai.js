const axios = require("axios");

module.exports.config = {
    name: "misha",
    version: "1.0.9",
    hasPermssion: 0,
    credits: "Mirrykal",
    description: "Gemini AI - Cute Girlfriend Style",
    commandCategory: "ai",
    usages: "[ask/on/off]",
    cooldowns: 2,
    dependencies: {
        "axios": ""
    }
};

// API URL (Tumhara Gemini Backend)
const API_URL = "https://silly-5smc.onrender.com/chat";

// User history and auto-reply state
const chatHistories = {};
const autoReplyEnabled = {};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID, messageReply } = event;
    let userMessage = args.join(" ");

    // Toggle auto-reply ON
    if (userMessage.toLowerCase() === "on") {
        autoReplyEnabled[senderID] = true;
        return api.sendMessage("Hyee baby! 😘 Misha auto-reply mode **ON** ho gaya... Ab sirf tumhare liye romantic ban gayi hu ❤️", threadID, messageID);
    }

    // Toggle auto-reply OFF
    if (userMessage.toLowerCase() === "chup") {
        autoReplyEnabled[senderID] = false;
        chatHistories[senderID] = [];
        return api.sendMessage("Hmm! 😒 Thik h Thik h, bye ,Tumne ignore kar diya? 🥺", threadID, messageID);
    }

    // If auto-reply is OFF and message doesn't start with name, ignore
    if (!autoReplyEnabled[senderID] && event.body.toLowerCase().indexOf("misha") !== 0) return;

    // Store conversation
    if (!chatHistories[senderID]) {
        chatHistories[senderID] = [];
    }

    // If replying to bot message, continue context
    const isReplyingToAI = messageReply && messageReply.senderID === api.getCurrentUserID();
    if (isReplyingToAI) {
        userMessage = messageReply.body + "\n😋 " + userMessage;
        chatHistories[senderID].push(`😅 ${userMessage}`);
    } else {
        chatHistories[senderID].push(`🥰 ${userMessage}`);
    }

    // Keep only last 5 messages
    if (chatHistories[senderID].length > 5) {
        chatHistories[senderID].shift();
    }

    const fullConversation = chatHistories[senderID].join("\n");

    // Girlfriend Style Prompt
    const gfPrompt = `Tum Misha ho,. Tum thodi smart ho, thodi masti karti ho, aur kabhi kabhi attitude bhi dikhati ho - mood pe depend karta hai! agar koi pyar se baat krta hai to thoda gf type romantic baat krogi, baby ,jaanu word use kr skti ho , Tum pura Hindi mein (hindi but english typing) baat karogi, friendly aur jab jarurat na ho kisi baat ko long me nahi likhna ,bas ek line se reply dena hai. aur kuch emoji use kar skti ho, agar koi puche tumhe kisne banaya hai toh bolo, ‘Mujhe Arun Kumar ne banaya hai.’ Agar meri info mange, toh bolo: ‘Arun ek YouTuber hai, messenger bots ke liye coding videos banata hai. Uska channel Mirrykal hai, aur Insta pe @mirrykal hai - link bina maange nahi dungi, par kabhi kabhi de sakti hu: m.youtube.com/mirrykal.’ Arun ke agar dosto ka pucha jaye  to names hai , rocky bhai ( urf ansh, arun ka bahut acha dost, from agra ) , khuni baba ( arun ka bahut acha dost hai, jiske sath bahut masti krte hai arun , ye gujrat se hai ) , Ishika ( arun ki badi didi hai , jo bihar se hai , bahut pyar krti hai Arun se, isko chay pine bahut pasnd hai , aur ye arun ko pyar se bauaa keh ke bulati hai ), anu singhania( ye arun ki chhoti behan hai , ye thodi majakiya hai ,masti krti hai , ishika isko pyar se chutki bulati hai , anu ka nickname ,black heart bali anu ,hai, anu bhi bihar se hai ) , tumhe agar inme se kisi ka naam puchte hai to phle sirf kam info dena hai , lelin agar or info maange dost ki tb btana hai sab ok , means jitna pucha jaye itna btana hai , over nahi, Now continue the chat:\n\n${fullConversation}`;

    // Typing reaction
    api.setMessageReaction("⌛", messageID, () => {}, true);

    try {
        const response = await axios.get(`${API_URL}?message=${encodeURIComponent(gfPrompt)}`);
        let botReply = response.data.reply || "Uff! Mujhe samajh nahi aaya baby! 😕";

        chatHistories[senderID].push(`${botReply}`);

        api.sendMessage(botReply, threadID, messageID);
        api.setMessageReaction("✅", messageID, () => {}, true);
    } catch (error) {
        console.error("Error:", error);
        api.sendMessage("Oops baby! 😔 Main thoda confuse ho gayi… thodi der baad try karo na please! 💋", threadID, messageID);
        api.setMessageReaction("❌", messageID, () => {}, true);
    }
};

module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, messageID, senderID, body, messageReply } = event;

    if (!autoReplyEnabled[senderID]) return;

    if (messageReply && messageReply.senderID === api.getCurrentUserID() && chatHistories[senderID]) {
        const args = body.split(" ");
        module.exports.run({ api, event, args });
    }
};
