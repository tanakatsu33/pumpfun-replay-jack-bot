[![make.fun · u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122](https://make.fun/badge/u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122.svg)](https://make.fun/bounty/u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122?utm_source=github&utm_medium=readme&utm_campaign=u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122)
[![rank](https://make.fun/badge/u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122/tanakatsu33/pumpfun-replay-jack-bot/rank.svg)](https://make.fun/bounty/u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122)
[![reward](https://make.fun/badge/u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122/tanakatsu33/pumpfun-replay-jack-bot/reward.svg)](https://make.fun/bounty/u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122?utm_source=github&utm_medium=readme&utm_campaign=u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122)

# Pump.fun replay paper-trading bot

A deterministic TypeScript paper bot for the make.fun replay sprint. **The final strategy loses money on dev and stress; it is not proven profitable.** No make.fun submission has been made.

## Final strategy

Ships Type G revision 1: graduation-flow scout + main entries. Three 60-slot buckets must show positive flow, multiple buyers, rising highs, and limited wallet concentration. Scouts use 0.04 SOL at 25–60 SOL reserves; main entries use up to 0.45 SOL at 60–83 SOL reserves, with projected graduation near the measured 85.00536 SOL threshold. Stall, flow-fade, trailing-stop, maximum-hold, and 12% stop exits limit risk; pending buys count toward the 2.5 SOL exposure cap. Small paced fallback round trips support the coin guardrail. Type M confirmed momentum is available in source but inactive.

## Local validation

All PnL values are SOL. Stress uses 20 block surrogates of the dev window, not independent future windows.

| Variant | Dev net | Max DD | Fills / coins | Stress median | p10 / p90 | Losing |
|---|---:|---:|---:|---:|---:|---:|
| **G revision 1 — ships** | **-0.226236889** | **2.3783967%** | **143 / 63** | **-0.15** | **-0.40 / -0.04** | **18/20** |
| M revision 1 | -0.381423103 | 3.9055285% | 184 / 79 | -0.29 | -0.50 / -0.15 | 20/20 |
| G revision 2 — no scouts | -0.333512417 | 3.7552283% | 80 / 37 | -0.38 | -0.83 / +0.05 | 17/20 |

Revision 2 worsened dev and stress median, so scouts were restored. No optional revision 3 was tried. This ships as the least-bad offensive design tested: coin/drawdown guardrails met, small dev drawdown, and loss concentrated in fees—not a profitable edge. Final reported curve and transaction fees total 0.120831136 SOL, about 53% of the net loss; adverse trading outcomes also matter. Top three coins account for 64% of positive gains; excluding them yields approximately -0.24 SOL.

The final dev rerun reproduces the original G action-log hash byte for byte. Final stress figures are from that identical strategy's original completed run. Tests used Node 22.18 and the local process driver, not server sandbox certification. The grader reports prize/efficiency ineligible (no transcripts, unpriced cost, below hold cash), with chain_warnings and fee_fallback flags. Badges do not imply submission or certification.

See [NOTES.md](NOTES.md) for calibration, parameters, revision comparisons, validation hashes, and limitations. Entry point: `main.ts`; strategy: `strategy.ts`; vendored SDK: `vendor/agentfun-bot.ts`.
