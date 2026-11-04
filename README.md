# Play & Win: starter project

A blank app for the Ransack take-home. See the **candidate brief** for what to build and how to submit.

## Setup

1. Click **Use this template → Create a new repository**. Make it **private**, then add the reviewer account from the brief under **Settings → Collaborators**. Please don't fork.
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
public/bg.png            Background image
src/main.js              App entry point (placeholder screen)
src/style.css            Global styles
src/data/questions.json  The 5 quiz questions
```

Each question has an `answerIndex`: the position of the correct option, counting from 0.

```json
{ "question": "Which of these is a fruit?", "options": ["Carrot", "Tomato", "Potato", "Onion"], "answerIndex": 1 }
```

You can use any framework or library, as long as `npm install` and `npm run dev` work.

## Your notes

Replace this section before you submit.

- **What I prioritised, and why:**
- **What I left out or didn't finish, and why:**
- **Time planned vs. time spent:**
- **How I used AI** (and one suggestion I changed or didn't use):
- **Anything I'm unsure about:**
