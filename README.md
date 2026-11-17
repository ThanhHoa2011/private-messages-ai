# Private Messages — AI chat demo

A two-character chat website for Han Su Gang (*Brave Citizen*) and Geum Seong-je (*Weak Hero Class 2*). The frontend calls a Node.js backend; the Gemini API key is stored only as a server environment variable. Chat history is kept in the browser's local storage.

## Important privacy note
The Gemini API free tier is subject to quotas and Google's current terms. Google states that content processed on the unpaid tier may be used to improve its products. Do not put your real name, address, passwords, school details, private photos, or other sensitive information in these chats. Check the current provider terms and ask a parent/guardian to help with account setup if required.

## Deploy to a public web URL (Render)
1. Extract this ZIP.
2. Upload the project folder to a GitHub repository. Do not add an API key or `.env` file to GitHub.
3. In Render, create a new Blueprint or Web Service from that repository. The included `render.yaml` sets Node, `npm install`, `npm start`, and asks for `GEMINI_API_KEY`.
4. Create a Gemini API key in Google AI Studio if the account is eligible. In Render's Environment settings, add it as `GEMINI_API_KEY`. Never paste the key into the website, source code, or a public chat.
5. Deploy. Render provides a public `onrender.com` URL when deployment succeeds.

Render's free service plan has limitations and may sleep when idle. Provider quotas and free-tier availability can change.

## Run locally
Requires Node.js 18+.
1. `npm install`
2. Set `GEMINI_API_KEY` in your local environment.
3. `npm start`
4. Open `http://localhost:3000`.

The app sends only the latest 20 messages in the selected chat to the model. It does not initiate messages on its own. The role prompts ask for chat-only replies without narration or story directions.
