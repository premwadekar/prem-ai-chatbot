require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

// MEMORY ARRAY
let messages = [];

app.use(cors());
app.use(express.json());

// GROQ CLIENT
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("AI Server Running");
});

// CHAT ROUTE
app.post("/chat", async (req, res) => {

  try {

    const userMessage =
      req.body.message;

    // STORE USER MESSAGE
    messages.push({
      role: "user",
      content: userMessage
    });

    // CREATE AI RESPONSE
    const completion =
      await client.chat.completions.create({

        model:
          "llama-3.3-70b-versatile",

        messages: [

          {
            role: "system",
            content:
              "You are a futuristic AI assistant."
          },

          ...messages

        ],

        stream: true

      });

    // STREAM HEADERS
    res.setHeader(
      "Content-Type",
      "text/plain"
    );

    // STORE FULL AI RESPONSE
    let aiReply = "";

    // STREAM RESPONSE
    for await (
      const chunk of completion
    ) {

      const content =
        chunk.choices[0]?.delta?.content;

      if (content) {

        aiReply += content;

        res.write(content);

      }

    }

    // STORE AI MESSAGE
    messages.push({
      role: "assistant",
      content: aiReply
    });

    // END STREAM
    res.end();

  } catch (error) {

    console.log(error);

    res.status(500).send(
      "Something went wrong"
    );

  }

});

// START SERVER
app.listen(5000, () => {

  console.log(
    "AI server running on port 5000"
  );

});