# My Portfolio

Static HTML/CSS portfolio with an attach feature for quiz and activity pictures. Deploy on Vercel.

## Deploy on Vercel

1. Push this folder to a Git repo (e.g. GitHub).
2. Go to [vercel.com](https://vercel.com) and sign in.
3. Click **Add New** → **Project** and import your repo.
4. Leave settings as default (Vercel will detect a static site).
5. Click **Deploy**. Your portfolio will be live at a `*.vercel.app` URL.

## Local preview

Open `index.html` in your browser, or use a simple server:

```bash
npx serve .
```

Then open http://localhost:3000.

## Features

- **Attach a picture**: Use the button in "Quizzes & Activities" to select one or more images. They are shown in the gallery and saved in your browser (localStorage) so they stay when you revisit.
