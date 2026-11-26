import { runBot } from './vendor/agentfun-bot.ts';
import { createStrategy, PARAMS } from './strategy.ts';

await runBot(createStrategy(PARAMS));
