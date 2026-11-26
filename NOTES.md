# Replay validation log

## Setup and calibration
- Public repository: https://github.com/tanakatsu33/pumpfun-replay-jack-bot. SDK and MIT license copied from the kit; strategy authored here.
- Node 22.18 process driver; every normal dev grade executes twice and verifies identical action logs. No submission made. Scores are local, not sandbox certification; no transcript bundle attached.
- Pilot momentum: dev -9.489224340 SOL; drawdown 95.7294067%; 411 fills / 45 coins / 77 qualifying round trips; 31,164 rejected / 8 failed. Top 2 coins made 100% of positive gains; without them -10.03 SOL. Guardrails fail drawdown. Stress not requested for calibration.
- Hold cash: 0 SOL, 0 drawdown, 0 fills / coins; concentration undefined. Fails coin guardrail. Stress not requested.
- Diagnostic replay: 35 CompleteEvents with a prior trade. Last real quote reserves ranged 85.005359057–85.005362401 SOL; median 85.005359057. Set reference 85.00536 SOL. Temporary diagnostic deliberately threw after done to capture values in grader stderr; removed before strategy validation.

## Initial parameters (revision 1)
G: scout+main; 180-slot confirmation in three 60-slot buckets, >=0.5 SOL net each; >=2 buyers each; wallet share <=65%; rising bucket highs; >=3% price rise. Main 60–83 SOL, last flow >= middle, projected completion <2400 slots; scout 25–60 SOL, created <6000 slots, increasing buyers, projected completion <1800 slots. Scout 0.04 / main 0.45 SOL. Stall 90, hold 1500, trail 12%.
M: 90 slots in three 30-slot buckets; >=0.3 SOL each, >=2 buyers each, wallet share <=40%, bucket highs grow >=0.5%, current within 0.5% of high, rise 4–45%, reserve 8–65 SOL. Size 0.12 SOL, hold 180, trail 4%, exit when 20-slot flow <=0.
Shared: exposure cap 2.5 SOL, stop 12%, buy slippage 500 bps, at most two attempts per mint with 900-slot cooldown. Fallback 0.0101 SOL round trips, mild 30-slot inflow >=0.1 SOL, reserve 3–70, 24 successful coins paced over 60000 slots. Pending buys count toward exposure and capacity.
