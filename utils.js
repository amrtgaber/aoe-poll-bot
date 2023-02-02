import fetch from 'node-fetch';
import { verifyKey } from 'discord-interactions';

export const CHANNEL_IDS = {
  'bot': '339669015234478080',
  'aoechat': '744707026302533652',
};

export function VerifyDiscordRequest(clientKey) {
  return function (req, res, buf, encoding) {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send('Bad request signature');
      throw new Error('Bad request signature');
    }
  };
}

export async function DiscordRequest(endpoint, options) {
  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  // Use node-fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)'
    },
    ...options
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

export async function SendMessage(channel, body) {
  const endpoint = `/channels/${channel}/messages`;
  const options = { method: 'POST', body: body};
  
  try {
    const res = await DiscordRequest(endpoint, options);
    return res;
  } catch (err) {
    console.error(err);
  }
}

export async function AddReaction(channel, message, emoji) {
  const endpoint = `/channels/${channel}/messages/${message}/reactions/${emoji}/@me`;
  
  try {
    const res = await DiscordRequest(endpoint, { method: 'PUT' });
    return res;
  } catch (err) {
    console.error(err);
  }
}

export async function DeleteOldCommands() {
  // applications/<my_application_id>/commands/<command_id>
  const applicationId = process.env.APP_ID;
  const guildId = process.env.GUILD_ID;
  
  // const getCommandsRes = await DiscordRequest(`/applications/${applicationId}/commands`, { method: 'GET'});
  // const commands = await getCommandsRes.json();
  // console.log(commands);
  
  const endpoint = `applications/${applicationId}/guilds/${guildId}/commands`;
  const commandsRes = await DiscordRequest(endpoint, { method: 'GET' });
  const commands = await commandsRes.json();
  console.log(commands);
  
  commands.forEach(command => {
    const endpoint = `applications/${appId}/guilds/${guildId}/commands/${command.id}`;  
    await DiscordRequest(endpoint, { method: 'DELETE' });
  })
}

function DeleteCommand(endpoint) {
  await DiscordRequest(endpoint, { method: 'DELETE' });
}

// Simple method that returns a random emoji from list
export function getRandomEmoji() {
  const emojiList = ['😭','😄','😌','🤓','😎','😤','🤖','😶‍🌫️','🌏','📸','💿','👋','🌊','✨'];
  return emojiList[Math.floor(Math.random() * emojiList.length)];
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
