import express from "express";
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from "discord-interactions";
import {
  VerifyDiscordRequest,
  getRandomEmoji,
  DiscordRequest,
  SendMessage,
  AddReaction,
  CHANNEL_IDS,
} from "./utils.js";
import { getShuffledOptions, getResult } from "./game.js";
import {
  TEST_COMMAND,
  START_COMMAND,
  STOP_COMMAND,
  HasGuildCommands,
} from "./commands.js";

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

let intervalId;
const msInADay = 24 * 60 * 60 * 1000; // 24 hrs in a day * 60 minutes in an hour * 60 seconds in a minutes * 1000 miliseconds in a second
const msInAnHour = 60 * 60 * 1000; // 60 minutes in an hour * 60 seconds in a minutes * 1000 miliseconds in a second
const channelId = CHANNEL_IDS.aoechat;
const body = { content: "who's down for aoe today?" };

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post("/interactions", async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" guild command
    if (name === "test") {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: "hello world " + getRandomEmoji(),
        },
      });
    }

    if (name === "start-poll") {
      /**
      // intervalId = setInterval(() => {
          SendMessage(channelId, body)
        }, 2000);
      */
      // const rawRes = await SendMessage(channelId, body);
      // const messageRes = await rawRes.json();
      // await AddReaction(channelId, messageRes.id, '👍');

      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: `polling started`,
        },
      });
    }

    if (name === "stop") {
      clearInterval(intervalId);
      intervalId = undefined;

      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: `polling stopped`,
        },
      });
    }
  }
});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);

  // Check if guild commands from commands.json are installed (if not, install them)
  HasGuildCommands(process.env.APP_ID, process.env.GUILD_ID, [
    TEST_COMMAND,
    START_COMMAND,
    STOP_COMMAND,
  ]);
});
