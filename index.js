import axios from 'axios';
import fs from 'fs/promises';
import readline from 'readline';
import hitamlegam from './src/lomgo.js';
import { HttpsProxyAgent } from 'https-proxy-agent';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const rli = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const processChats = async (NodeID, proxy) => {
  try {
    console.clear();
    console.log(
      '\x1b[36m%s\x1b[0m',
      `
╔═══════════════════════════════════════╗
║        Auto Throughputs Gaianet       ║
║         By: Aethereal Team            ║
╚═══════════════════════════════════════╝
`
    );
    console.log("🔄 Initializing...");
    console.log(hitamlegam);

    const addressList = await fs.readFile("cersex.txt", "utf-8");
    const addressListArray = addressList.split("\n");

    const totalChats = addressListArray.length - 11;
    console.log(`Total chats to process: ${totalChats}`);

    // Create an agent for the proxy
    const agent = new HttpsProxyAgent(proxy);

    for (let index = 11; index < addressListArray.length; index++) {
      const chet = addressListArray[index];
      const currentIndex = index - 10;
      console.log(`Processing Chat ${currentIndex}/${totalChats}`);
      console.log("Content Chat: " + chet + "\n");

      try {
        const response = await axios.post(
          `https://${NodeID}.gaia.domains/v1/chat/completions`,
          {
            messages: [
              {
                role: "system",
                content: "You are a helpful assistant.",
              },
              {
                role: "user",
                content: `${chet}`,
              },
            ],
          },
          {
            headers: {
              accept: "application/json",
              "Content-Type": "application/json",
            },
            httpsAgent: agent, // Here we use the proxy agent
          }
        );

        console.log("Response: [" + response.data.choices[0].message.content + "]\n");
        console.log(`⌛ Waiting 20 seconds... (${currentIndex}/${totalChats})`);
        await delay(20000);
      } catch (postError) {
        console.error("Error during axios post: ", postError);
      }
    }

    console.log(`? Completed processing ${totalChats} chats.`);
    console.log('⏩ Restarting the process...\n');
    await delay(2000);
    processChats(NodeID, proxy); // Pass the proxy to the recursive call
  } catch (error) {
    console.error("Error: ", error);
    console.log('⏩ Restarting due to an error...\n');
    await delay(2000);
    processChats(NodeID, proxy); // Pass the proxy to the error recovery call
  }
};

(async () => {
  try {
    console.clear();
    const NodeID = await new Promise((resolve) =>
      rli.question("↪ Enter your Node ID: ", (input) => resolve(input.trim()))
    );

    if (!NodeID) {
      console.error("🚫 Error: Node ID is required.");
      rli.close();
      return;
    }

    const proxy = await new Promise((resolve) =>
      rli.question("↪ Enter your proxy URL (e.g., http://user:pass@host:port): ", (input) => resolve(input.trim()))
    );

    if (!proxy) {
      console.error("🚫 Error: Proxy URL is required.");
      rli.close();
      return;
    }

    processChats(NodeID, proxy);
  } catch (error) {
    console.error("Error: ", error);
    rli.close();
  }
})();
