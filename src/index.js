import {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
} from "discord.js";

/**
 * ENV you must set on Fly:
 * - DISCORD_TOKEN
 * - GUILD_ID
 * - WELCOME_CHANNEL_ID
 * - TRAINING_CHANNEL_ID
 * - TRAINING_LINK (your Google Drive folder URL)
 */

const {
  DISCORD_TOKEN,
  GUILD_ID,
  WELCOME_CHANNEL_ID,
  TRAINING_CHANNEL_ID,
  TRAINING_LINK,
} = process.env;

if (!DISCORD_TOKEN || !GUILD_ID || !WELCOME_CHANNEL_ID || !TRAINING_CHANNEL_ID || !TRAINING_LINK) {
  console.error("❌ Missing required environment variables.");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel] // needed to receive DMs
});

const welcomeVariants = [
  (member) => `🎉 Welcome, ${member}! Check your DMs for your training link. If DMs are off, type **training** in <#${TRAINING_CHANNEL_ID}>.`,
  (member) => `👋 Hey ${member}, we’re glad you’re here! I sent your training folder in DMs. DMs off? Just say **training** in <#${TRAINING_CHANNEL_ID}>.`,
  (member) => `🧠 ${member} joined! Your training link is on the way via DM. If you don’t see it, type **training** in <#${TRAINING_CHANNEL_ID}>.`,
  (member) => `⚡️Welcome ${member}! I’ve DM’d your onboarding link. DMs closed? No worries—type **training** in <#${TRAINING_CHANNEL_ID}>.`
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function safeDM(user, content) {
  try {
    await user.send(content);
    return true;
  } catch (err) {
    // 50007 = Cannot send messages to this user (DMs off or privacy blocked)
    if (err?.code !== 50007) console.error("DM error:", err);
    return false;
  }
}

client.once(Events.ClientReady, () => {
  console.log(`✅ Ashley is online as @${client.user.tag}`);
});

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    if (member.guild.id !== GUILD_ID) return;

    // 1) DM the new member (may fail if DMs are closed)
    const dmOk = await safeDM(
      member.user,
      `Hi ${member.user.username}! 👋\n\nWelcome to the server.\nHere’s your training folder: ${TRAINING_LINK}\n\nIf your DMs are off, just type **training** in <#${TRAINING_CHANNEL_ID}> and I’ll post it there too.`
    );

    // 2) Post a randomized welcome in the welcome channel
    const welcomeChannel = await client.channels.fetch(WELCOME_CHANNEL_ID).catch(() => null);
    if (welcomeChannel && welcomeChannel.isTextBased()) {
      const msg = pick(welcomeVariants)(member.toString());
      await welcomeChannel.send(msg + (dmOk ? "" : `\n*(Looks like your DMs are off—use **training** in <#${TRAINING_CHANNEL_ID}>.)*`));
    }
  } catch (e) {
    console.error("Error in GuildMemberAdd:", e);
  }
});

// Listen for "training" keyword in the training channel
client.on(Events.MessageCreate, async (message) => {
  try {
    if (message.author.bot) return;
    if (message.guild?.id !== GUILD_ID) return;

    const isTrainingChannel = message.channel?.id === TRAINING_CHANNEL_ID;
    const saysTraining = /^\s*training\s*$/i.test(message.content);

    if (isTrainingChannel && saysTraining) {
      await message.channel.send(`Here’s the training folder link: ${TRAINING_LINK}`);
    }
  } catch (e) {
    console.error("Error in MessageCreate:", e);
  }
});

client.login(DISCORD_TOKEN);
