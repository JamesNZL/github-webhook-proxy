import type { NextApiRequest, NextApiResponse } from 'next';

import { formatCommitMessages } from '../../../lib/format-commit-messages';

const GITHUB_WEBHOOK_HEADERS = [
  'user-agent',
  'content-type',
  'x-github-delivery',
  'x-github-event',
  'x-github-hook-id',
  'x-github-hook-installation-target-id',
  'x-github-hook-installation-target-type',
];

export default async function webhook(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'You must POST to this endpoint.' });
  }

  const webhookUrl = req.query.webhook_url;

  if (!webhookUrl) {
    return res.status(400).json({
      error: 'You must specify a destination webhook_url.',
    });
  }

  if (typeof webhookUrl !== 'string') {
    return res.status(400).json({
      error: 'webhook_url must be a unique query parameter.',
    });
  }

  req.body = formatCommitMessages(req.body);

  const githubHeaders = GITHUB_WEBHOOK_HEADERS.flatMap(header => {
    const reqHeader = req.headers[header];
    if (!reqHeader || typeof reqHeader !== 'string') return [];
    return [[header, reqHeader]];
  });

  const webhookResponse = await fetch(webhookUrl, {
    method: 'POST',
    headers: Object.fromEntries(githubHeaders),
    body: JSON.stringify(req.body),
  });

  res.status(webhookResponse.status).send(await webhookResponse.text());
}