module.exports.config = {
    name: "magic",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "MirryKal",
    description: "A mind-reading magic trick game.",
    commandCategory: "fun",
    usages: "",
    cooldowns: 5
};

const userSteps = {}; // हर यूजर का स्टेप track करने के लिए

module.exports.run = async function ({ api, event }) {
    const { threadID, senderID } = event;

    userSteps[senderID] = { step: 1, number: null, added: null };

    return api.sendMessage("🎩 Magic Trick शुरू होने वाली है!\n\n🤔 कोई भी एक नंबर सोचो 1 से 100 तक।\n\n✔️ जब सोच लो, तो इस मैसेज पर कोई भी reaction दो।", threadID, (err, info) => {
        userSteps[senderID].messageID = info.messageID;
    });
};

module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, senderID, messageID, body, reaction } = event;

    if (!userSteps[senderID]) return;

    const step = userSteps[senderID].step;

    if (reaction && messageID === userSteps[senderID].messageID) {
        switch (step) {
            case 1:
                userSteps[senderID].step++;
                return api.sendMessage("👥 अब अपने दोस्त के लिए भी उतना ही नंबर जोड़ दो जितना तुमने सोचा था।\n\n✔️ जब कर लो, तो इस मैसेज पर कोई भी reaction दो।", threadID, (err, info) => {
                    userSteps[senderID].messageID = info.messageID;
                });

            case 2:
                const randomAdd = [30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150][Math.floor(Math.random() * 13)];
                userSteps[senderID].added = randomAdd;
                userSteps[senderID].step++;
                return api.sendMessage(`➕ अब जो भी नंबर आया उसमें *${randomAdd}* जोड़ दो।\n\n✔️ जब कर लो, तो इस मैसेज पर कोई भी reaction दो।`, threadID, (err, info) => {
                    userSteps[senderID].messageID = info.messageID;
                });

            case 3:
                userSteps[senderID].step++;
                return api.sendMessage("⚖️ अब जो भी total आया है, उसका आधा कर दो और admin को बता दो।\n\n✔️ जब कर लो, तो इस मैसेज पर कोई भी reaction दो।", threadID, (err, info) => {
                    userSteps[senderID].messageID = info.messageID;
                });

            case 4:
                userSteps[senderID].step++;
                return api.sendMessage("➖ अब जो भी नंबर तुमने अपने दोस्त के लिए जोड़ा था, उसे वापस घटा दो।\n\n✔️ जब कर लो, तो इस मैसेज पर कोई भी reaction दो।", threadID, (err, info) => {
                    userSteps[senderID].messageID = info.messageID;
                });

            case 5:
                const answer = userSteps[senderID].added / 2;
                delete userSteps[senderID]; // डेटा क्लियर कर दिया
                return api.sendMessage(`🎩 Great Job! 🎩\n\nतुम्हारा Answer *${answer}* है! 🤯🔥\n\nअगर trick पसंद आई तो *WOW* भेजो!`, threadID);
        }
    }
};

module.exports.handleReaction = module.exports.handleEvent;
