# Mirror Mirror

Hey! Welcome to **Mirror Mirror** — a project I built to help people slow down, check in with themselves, and celebrate small wins, one day at a time.

**What is Mirror Mirror?**  
It's a daily self-reflection companion where you chat mindfully, receive personalized affirmations based on your mood, and—if you want—snap a selfie. Each selfie is saved alongside your daily affirmation, so you can literally watch your self-growth over time in your own private gallery.

**Key Features:**  
- Guided, empathetic chat to help you reflect and process your feelings  
- Personalized, uplifting affirmations & encouragement  
- Daily selfie feature: Look yourself in the eye, capture a photo, and pair it with your affirmation  
- Private gallery: Revisit your journey—see your photos and words of kindness to yourself

**Tech Stack:**  
- Vite (development & build)  
- React + TypeScript (UI & logic)  
- shadcn-ui & Tailwind CSS (design system)  
- Supabase for backend & storage  
- Deno for running serverless functions  
- Google Gemini API for conversational AI and personalized affirmations

**Running locally:**  
1. Clone the repo and install dependencies:  
   ```sh
   git clone <YOUR_GIT_URL> # to be updated!!
   cd mirror-mirror
   npm install
   ```

2. Set up the Google Gemini API key:  
   - [Sign up for access to the Gemini API](https://ai.google.dev/) and create an API key.
   - Create a `.env` file at the root of the project with the following line:
     ```
     GOOGLE_GEMINI_API_KEY=your-key-here
     ```
   - If you're running the Supabase Edge Functions locally, export the variable in your shell as well:
     ```sh
     export GOOGLE_GEMINI_API_KEY=your-key-here
     ```

3. Run the development server:  
   ```sh
   npm run dev
   ```

You can deploy Mirror Mirror anywhere—Vercel, Netlify, your own server, etc. Just make sure environment variables are set up for any APIs in use.

---

If you try this out, I'd love to hear how the experience feels or if you have feature ideas!  
Thanks for checking out my project.  
— Grace
