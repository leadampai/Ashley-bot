# Ashley Bot (LeadAmp AI)

## What it does
- DMs every new member a hello + training link
- If DMs are off, tells them to type `training` in the training channel
- Greets in the welcome channel with 4 rotating variants
- Replies with the link when someone types `training` in the training channel

## Discord setup (one time)
1. Go to https://discord.com/developers/applications → **New Application** → name it `Ashley`.
2. **Bot** tab → Add Bot → Reset Token (keep it safe).
3. **Privileged Gateway Intents** (Bot tab): enable **SERVER MEMBERS INTENT** and **MESSAGE CONTENT INTENT**.
4. **OAuth2 → URL Generator**: scopes **bot**, permissions:
   - View Channels, Send Messages, Read Message History
   - (Optional) Send Messages in Threads
   Copy the URL and invite the bot to your server.

> Get Channel IDs: Discord → Settings → Advanced → **Developer Mode ON** → right-click a channel → **Copy ID**.

## Fly.io deploy
```bash
# one-time: create the app (say 'no' to public ports; this is a worker)
flyctl launch --no-deploy --no-public-ports --name ashley-bot-<your-suffix>

# set secrets
flyctl secrets set \
  DISCORD_TOKEN=<your_bot_token> \
  GUILD_ID=<your_server_id> \
  WELCOME_CHANNEL_ID=<welcome_channel_id> \
  TRAINING_CHANNEL_ID=<training_channel_id> \
  TRAINING_LINK="https://drive.google.com/your-training-folder"

# deploy
flyctl deploy

# logs
flyctl logs -f
