# Play & Win: starter project

A blank app for the Ransack take-home. See the **[client brief](client-brief.pdf)** for what to build.

> **The data collection part of the brief is optional.** Get the games working first. If you have time, store the data however you like (e.g. `localStorage` or a free database) and explain your choice in your notes.

## Setup

1. Click **Use this template → Create a new repository** and make it **public**. Please don't fork. Email us the link to your repo as soon as you've created it, so we can follow your progress.
2. Clone your new repo and install [Node.js](https://nodejs.org) 20.19 or newer.
3. In the project folder, run:

   ```bash
   npm install
   npm run dev
   ```

4. Open `http://localhost:5173`. You should see **"Setup works!"**.

## Testing on mobile

Use either option. Testing on a real phone is best if you can.

**Option A: your phone**

1. Run `npm run host` instead of `npm run dev`.
2. On a phone connected to the **same Wi-Fi**, open the **Network** address it prints (e.g. `http://192.168.1.23:5173`).
3. Can't connect? On Windows, allow Node.js through the firewall. Some Wi-Fi networks block this, so try your phone's hotspot instead.

**Option B: browser developer tools**

1. With `npm run dev` running, open the app in Chrome or Edge.
2. Press **F12** (Mac: **Cmd + Option + I**), then click the **phone/tablet icon** (or press **Ctrl + Shift + M**).
3. Pick a phone (e.g. iPhone 14) from the dropdown at the top.

## What's inside

```
client-brief.pdf         What the client wants
public/bg.png            Background image
src/main.js              App entry point (placeholder screen)
src/style.css            Global styles
src/data/questions.json  The 5 quiz questions
```

Each question has an `answerIndex`: the position of the correct option, counting from 0.

```json
{ "question": "Which of these is a fruit?", "options": ["Carrot", "Tomato"], "answerIndex": 1 }
```

You can use any framework or library, as long as `npm install` and `npm run dev` work.

## Your notes

Replace this section before you submit.

- **What I prioritised, and why:**
  Prioritised the AR to minimally show how it works
  Prioritised getting the main functionality of the quiz and location tracking to work
  Prioritsed having spatial audio to know where the dinosaur is
- **What I left out or didn't finish, and why:**
  I left out adding custom button designs to make it look nicer, not necessary for prototype only for polishing
  I left out hand drawing dinosaurs as this is a prototype, not necessary for prototype only for polishing
  I left out adding proper path finding of the lines on the map. Currently its a straight line instead of following the road. Again not necessary for prototype only for polishing
- **Time planned vs. time spent:**
  Time planned 1hr on creating the framework and another hours on coding and AI prompting. Spent an hour testing and making adjustments by playtesting
- **How I used AI** (and one suggestion I changed or didn't use):
  I used claude to generate the code for the hunt and exploration. I changed the audio to be something more suitable.
- **Anything I'm unsure about:**
  nil
