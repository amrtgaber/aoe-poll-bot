import express from "express";
import { InteractionType, InteractionResponseType } from "discord-interactions";
import {
  VerifyDiscordRequest,
  DiscordRequest,
  SendMessage,
  AddReaction,
  PollOnce,
  CHANNEL_IDS,
} from "./utils.js";
import {
  START_COMMAND,
  STOP_COMMAND,
  POLL_ONCE_COMMAND,
  HasGuildCommands,
} from "./commands.js";

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

let intervalId;
const msInADay = 24 * 60 * 60 * 1000; // 24 hrs in a day * 60 minutes in an hour * 60 seconds in a minute * 1000 miliseconds in a second
const channelId = CHANNEL_IDS.bot;
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

    if (name === "start-poll") {
      if (intervalId) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `poll has already started`,
          },
        });
      }

      PollOnce(channelId, body);
      intervalId = setInterval(() => PollOnce(channelId, body), msInADay);

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `polling started`,
        },
      });
    }

    if (name === "stop-poll") {
      clearInterval(intervalId);
      intervalId = undefined;

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `polling stopped`,
        },
      });
    }

    if (name === "poll-once") {
      PollOnce(channelId, body);
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "",
        },
      });
    }
  }
});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);

  // Check if guild commands from commands.json are installed (if not, install them)
  HasGuildCommands(process.env.APP_ID, process.env.GUILD_ID, [
    START_COMMAND,
    STOP_COMMAND,
    POLL_ONCE_COMMAND,
  ]);
});
