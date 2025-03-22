const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const https = require("https");

function deleteAfterTimeout(filePath, timeout = 5000) {
  setTimeout(() => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (!err) {
          console.log(`✅ Deleted file: ${filePath}`);
        } else {
          console.error(`❌ Error deleting file: ${error.message}`);
        }
      });
    }
  }, timeout);
}

module.exports = {
  config: {
    name: "music",
    version: "2.0.1",
    hasPermssion: 0,
    credits: "Mirrykal",
    description: "Download YouTube song or video",
    commandCategory: "Media",
    usages: "[songName] [optional: video]",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    if (args.length === 0) {
      return api.sendMessage("⚠️ Gaane ka naam to likho na! 😒", event.threadID);
    }

    const mediaType = args[args.length - 1].toLowerCase() === "video" ? "video" : "audio";
    const songName = mediaType === "video" ? args.slice(0, -1).join(" ") : args.join(" ");

    const processingMessage = await api.sendMessage(
      `🔍 "${songName}" dhoondh rahi hoon... Ruko zara! 😏`,
      event.threadID,
      null,
      event.messageID
    );

    try {
      // 🔎 **YouTube Search**
      const searchResults = await ytSearch(songName);
      if (!searchResults || !searchResults.videos.length) {
        throw new Error("Kuch nahi mila! Gaane ka naam sahi likho. 😑");
      }

      // 🎵 **Top Result ka URL**
      const topResult = searchResults.videos[0];
      const videoUrl = `https://www.youtube.com/watch?v=${topResult.videoId}`;

      // 🖥 **API Call to YouTube Downloader**
      const apiUrl = `https://mirrykal.onrender.com/download?url=${encodeURIComponent(videoUrl)}&type=${mediaType}`;
      const downloadResponse = await axios.get(apiUrl);

      if (!downloadResponse.data.file_url) {
        throw new Error("Download fail ho gaya. 😭");
      }

      const downloadUrl = downloadResponse.data.file_url.replace("http:", "https:");

      // 📂 **Set Download Path**
      const downloadDir = path.join(__dirname, "cache");
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
      }

      const safeTitle = topResult.title.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `${safeTitle}.${mediaType === "video" ? "mp4" : "mp3"}`;
      const downloadPath = path.join(downloadDir, filename);

      // ⬇️ **Download File**
      const file = fs.createWriteStream(downloadPath);
      await new Promise((resolve, reject) => {
        https.get(downloadUrl, (response) => {
          if (response.statusCode === 200) {
            response.pipe(file);
            file.on("finish", () => {
              file.close(resolve);
            });
          } else {
            reject(new Error(`Download fail ho gaya. Status: ${response.statusCode}`));
          }
        }).on("error", (error) => {
          fs.unlinkSync(downloadPath);
          reject(new Error(`Error downloading file: ${error.message}`));
        });
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      // 🎧 **Send the MP3/MP4 File**
      await api.sendMessage(
        {
          attachment: fs.createReadStream(downloadPath),
          body: `🎶 **Title:** ${topResult.title}\nLijiye! ${mediaType === "video" ? "Video 🎥" : "Gaana 🎵"} aapke liye! 😍`,
        },
        event.threadID,
        event.messageID
      );

      // 🗑 **Auto Delete File After 5 Seconds**
      deleteAfterTimeout(downloadPath, 5000);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      api.sendMessage(`❌ Error: ${error.message} 😢`, event.threadID, event.messageID);
    }
  },
};
