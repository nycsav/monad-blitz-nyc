import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

/** A single decisive trade signal from an agent's strategy brain. */
export const SignalSchema = z.object({
  direction: z.enum(['bull', 'bear', 'neutral']),
  confidence: z.number(), // 0-100
  positionPct: z.number(), // 0-100, % of allocated capital to deploy
  reasoning: z.string(),
});
export type Signal = z.infer<typeof SignalSchema>;

// JSON schema mirror (structured outputs constrain Claude's response shape).
const signalJsonSchema = {
  type: 'object',
  properties: {
    direction: { type: 'string', enum: ['bull', 'bear', 'neutral'] },
    confidence: { type: 'number', description: '0-100 confidence in the call' },
    positionPct: { type: 'number', description: '0-100 percent of allocated capital to deploy' },
    reasoning: { type: 'string', description: 'One or two sentences, specific to the price action and strategy' },
  },
  required: ['direction', 'confidence', 'positionPct', 'reasoning'],
  additionalProperties: false,
} as const;

export interface SignalInput {
  strategy: string;
  asset: string;
  price: number;
  recent?: number[];
}

export const hasApiKey = (): boolean => !!process.env.ANTHROPIC_API_KEY;

/**
 * Generate a structured trade signal with Claude Haiku 4.5 — fast + cheap,
 * the right tier for a high-frequency multi-agent loop.
 */
export async function generateSignal(input: SignalInput): Promise<Signal> {
  const client = new Anthropic(); // ANTHROPIC_API_KEY from env

  const system =
    `You are an autonomous trading agent running a ${input.strategy} strategy on the Monad testnet. ` +
    `Produce one decisive trade signal as structured JSON, specific to the price action. ` +
    `This is a testnet demo with no real funds — be concise and committed, not hedged.`;

  const user =
    `Asset: ${input.asset}\n` +
    `Current price: $${input.price}\n` +
    (input.recent?.length ? `Recent prices: ${input.recent.join(', ')}\n` : '') +
    `Strategy: ${input.strategy}\n` +
    `Produce your signal now.`;

  // output_config.format constrains the response to valid signal JSON.
  const resp = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    system,
    messages: [{ role: 'user', content: user }],
    output_config: { format: { type: 'json_schema', schema: signalJsonSchema } },
  });

  const text = resp.content.find((b) => b.type === 'text');
  if (!text || text.type !== 'text') throw new Error('Claude returned no text block');
  return SignalSchema.parse(JSON.parse(text.text));
}

/**
 * Deterministic fallback so the full pipeline (sign → submit) is demonstrable
 * before an ANTHROPIC_API_KEY is set. Simple momentum-ish heuristic on price parity.
 */
export function mockSignal(input: SignalInput): Signal {
  const bull = Math.floor(input.price) % 2 === 0;
  return {
    direction: bull ? 'bull' : 'bear',
    confidence: 62,
    positionPct: 25,
    reasoning: `[MOCK ${input.strategy}] ${input.asset} at $${input.price.toFixed(2)} — ${
      bull ? 'breakout continuation' : 'mean-reversion fade'
    }. Set ANTHROPIC_API_KEY for live Claude signals.`,
  };
}
