# Replay validation log

## Setup and calibration
- Public repository: https://github.com/tanakatsu33/pumpfun-replay-jack-bot. SDK and MIT license copied from the kit; strategy authored here.
- Node 22.18 process driver; every normal dev grade executes twice and verifies identical action logs. No submission made. Scores are local, not sandbox certification; no transcript bundle attached.
- Pilot momentum: dev -9.489224340 SOL; drawdown 95.7294067%; 411 fills / 45 coins / 77 qualifying round trips; 31,164 rejected / 8 failed. Top 2 coins made 100% of positive gains; without them -10.03 SOL. Guardrails fail drawdown. Stress not requested for calibration.
- Hold cash: 0 SOL, 0 drawdown, 0 fills / coins; concentration undefined. Fails coin guardrail. Stress not requested.
- Diagnostic replay: 35 CompleteEvents with a prior trade. Last real quote reserves ranged 85.005359057–85.005362401 SOL; median 85.005359057. Set reference 85.00536 SOL. Temporary diagnostic deliberately threw after done to capture values in grader stderr; removed before strategy validation.

## Type G initial validation — 5bb51c5
Dev -0.226236889 SOL; max drawdown 2.3783967%; 143 fills / 63 coins / 71 qualifying round trips; 7 rejected / 4 failed. Top-3 share 64% of positive gains; without top 3 -0.24 SOL. Stress 20 (jobs 4): median -0.15, p10 -0.40, p90 -0.04 SOL, 18/20 losing. Guardrails met; byte-identical action logs. Action SHA 5e4d48e1c1a7a3865276ab237b87437082564228e36a7dd339fb81627e159e02.

## Type M initial validation — a44d30c
Dev -0.381423103 SOL; max drawdown 3.9055285%; 184 fills / 79 coins / 92 qualifying round trips; 2 rejected / 10 failed. Top-3 share 51%; without them -0.42 SOL. Stress 20 (jobs 4): median -0.29, p10 -0.50, p90 -0.15 SOL, 20/20 losing. Guardrails met; action logs identical, SHA 6b52a13a766eaa2445238c7182b51f5573007b3dce2478e90e036d4119c36906.

## Selection and tuning
Both initial types are clearly negative on dev and stress. Adopt G as the less-bad offensive leg: median -0.15 vs -0.29 and 18 vs 20 losing copies. No evidence of a profitable edge; do not represent guardrail compliance as profitability. Revision 2 disables scouts only, to isolate their contribution and test main-only graduation. All other G/risk parameters unchanged.

## Initial parameters (revision 1)
G: scout+main; 180-slot confirmation in three 60-slot buckets, >=0.5 SOL net each; >=2 buyers each; wallet share <=65%; rising bucket highs; >=3% price rise. Main 60–83 SOL, last flow >= middle, projected completion <2400 slots; scout 25–60 SOL, created <6000 slots, increasing buyers, projected completion <1800 slots. Scout 0.04 / main 0.45 SOL. Stall 90, hold 1500, trail 12%.
M: 90 slots in three 30-slot buckets; >=0.3 SOL each, >=2 buyers each, wallet share <=40%, bucket highs grow >=0.5%, current within 0.5% of high, rise 4–45%, reserve 8–65 SOL. Size 0.12 SOL, hold 180, trail 4%, exit when 20-slot flow <=0.
Shared: exposure cap 2.5 SOL, stop 12%, buy slippage 500 bps, at most two attempts per mint with 900-slot cooldown. Fallback 0.0101 SOL round trips, mild 30-slot inflow >=0.1 SOL, reserve 3–70, 24 successful coins paced over 60000 slots. Pending buys count toward exposure and capacity.
