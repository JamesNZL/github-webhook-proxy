## GitHub–Discord Webhook Proxy

This is a proxy to sit between GitHub and Discord, built with [Next.js](https://nextjs.org/) API routes.

Discord truncates commit messages to a length of ~`50` characters, which often cuts off closing backticks in commit messages.
> This is probably dependent on username length, but it works for me :shrug:

Currently, this proxy applies the following transformations to commit messages:
1. At the [`MAX_DISCORD_COMMIT_MESSAGE_LENGTH`](lib/format-commit-messages.ts), insert a closing <code>...`</code> if there is an uneven number of preceeding backticks.
2. Replace recognised [gitmoji](https://github.com/carloscuesta/gitmoji/blob/master/src/data/gitmojis.json) codes (eg `:technologist:` 👨‍💻) with the actual emoji character.
	> Discord does their message truncation calculations on the gitmoji code (but the actual emojis are rendered in the embed), which means long gitmoji codes result in lots of wasted space.

### Before
![Before](public/before.jpg)

### After
![After](public/after.jpg)

## Usage

See [Deploy on Vercel](#deploy-on-vercel) if you want to deploy your own proxy instance.

If you'd like to use my instance, simply configure your GitHub webhook URL to `github.jamesnzl.xyz/api/github/webhook?webhook_url=<DISCORD WEBHOOK URL>`.

## Running Locally

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Once the server is started, use a service such as [Ngrok](https://ngrok.com/) to expose your localhost for testing.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
