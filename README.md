# Play & Win: starter project

This is the starter project for the Ransack take-home. It's a blank app that runs with one command. Everything else is up to you.

Please read the **candidate brief** for what to build and how to submit.

---

## 1. Get your own copy

1. Click the green **Use this template** button at the top of this page, then **Create a new repository**.
2. Choose your own account as the owner. Make it **private**, then add the reviewer account from the brief as a collaborator (**Settings → Collaborators**).
3. Clone **your** new repository to your computer.

Please don't fork this repository.

---

## 2. Run it on your computer

You need **Node.js 20.19 or newer** (the LTS version from [nodejs.org](https://nodejs.org) is fine). To check, run:

```bash
node -v
```

Then, inside the project folder:

```bash
npm install
```

```bash
npm run dev
```

Open the address it prints (usually `http://localhost:5173`). You should see **"Setup works!"** on a forest background.

Changes you save will appear in the browser straight away.

---

## 3. Test it on your phone

The app is for mobile, so please test it on a real phone.

1. Run the app with the `host` command instead of `dev`:

   ```bash
   npm run host
   ```

2. It prints two addresses. Use the one labelled **Network**, e.g. `http://192.168.1.23:5173`.
3. Make sure your phone is on the **same Wi-Fi** as your computer, then open that address in your phone's browser.

**If your phone can't connect:**

- **Windows:** if a firewall pop-up appears, allow Node.js on **private networks**. If you missed the pop-up, search Windows for "Allow an app through Windows Firewall" and tick Node.js.
- **Some Wi-Fi networks (school, office, cafés) block devices from seeing each other.** Turn on your phone's hotspot, connect your computer to it, run `npm run host` again, and use the new Network address.
- **Still stuck?** Use your browser's mobile view (in Chrome: right-click → Inspect → the phone icon) and mention it in your notes below.

---

## 4. What's in here

```
public/
  bg.png               Background image you can use
src/
  main.js              Where the app starts (currently a placeholder screen)
  style.css            Global styles
  data/
    questions.json     The 5 quiz questions
index.html             The page that loads src/main.js
```

Each quiz question looks like this:

```json
{
  "id": 1,
  "question": "Which of these is a fruit?",
  "options": ["Carrot", "Tomato", "Potato", "Onion"],
  "answerIndex": 1
}
```

`answerIndex` is the position of the correct option, counting from 0. In this example the answer is `"Tomato"`.

You can use any framework or library you like (React, Vue, plain JavaScript, anything else), as long as we can run it with `npm install` and `npm run dev`. Restructure the project however you want.

---

## 5. Your notes

Replace this section with your notes before you submit.

**What I prioritised, and why:**

**What I left out or didn't finish, and why:**

**Time I planned vs. time I actually spent:**

**How I used AI** (including one thing it suggested that I changed or didn't use):

**Anything I'm unsure about:**
