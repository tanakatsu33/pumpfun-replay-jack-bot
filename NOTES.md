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

## Revision 2 validation — 3bf2c22
Main-only G: dev -0.333512417 SOL; max drawdown 3.7552283%; 80 fills / 37 coins / 40 qualifying round trips; win rate 10%; 3 rejected / 3 failed. Top-3 share 100% of positive gains; without them -0.37 SOL. Curve fees 0.181977799 SOL + tx fees 0.008715000 SOL; at 2x fees PnL -0.518028902 SOL. Stress 20 (jobs 4): median -0.38, p10 -0.83, p90 +0.05 SOL; 17/20 losing. Guardrails met; byte-identical dev action logs, SHA ba3602f95b27e64bfec0d68e8d7f247c46f4b78fedfb01463306277cbb14ed89. Results saved under `.local/g2` (ignored local artifacts). First stress attempt timed out after 16 cases; the complete rerun supplies the reported 20-case results.

Compared with G revision 1, removing scouts worsened dev by 0.107275528 SOL and stress median by approximately 0.23 SOL, raised drawdown from 2.3783967% to 3.7552283%, and reduced fills by 63 and traded coins by 26. Losing copies improved from 18 to 17, but the median and downside p10 worsened materially. Scouts therefore helped the combined design on this window; this is not an isolated scout PnL attribution, because entries, fallback pacing, and available capacity interact.

## Final selection
Restore G revision 1 (scout+main), the better stress median of the tested G variants. No optional parameter revision 3 was attempted; restoration is not a new tuned variant. M remains available in source for comparison but is not active. The final design is still negative: dev -0.226236889 SOL and stress median -0.15 SOL (p10 -0.40, p90 -0.04; 18/20 losing). It ships as the least-bad offensive design tested, not a proven profitable strategy. Coin and drawdown guardrails are met and dev drawdown is small (2.3783967%). Loss is concentrated in fees, but not exclusively: reported curve + transaction fees total 0.120831136 SOL (about 53% of the 0.226236889 SOL net loss); adverse trading outcomes also contribute. Guardrail compliance is not profitability. Hold cash beats every tested offensive design on dev PnL but fails the coin guardrail. Stress block surrogates are not independent out-of-sample evidence or forecasts.

## Final dev verification — b3d1611
Restored strategy reproduces revision 1 exactly: dev -0.226236889 SOL, drawdown 2.3783967%, 143 fills / 63 coins / 71 qualifying round trips, top-3 share 64%, 7 rejected / 4 failed. Curve fees 0.105396136 SOL + tx fees 0.015435000 SOL; 2x-fee net -0.343213188 SOL. Two executions reproduced byte for byte; action SHA 5e4d48e1c1a7a3865276ab237b87437082564228e36a7dd339fb81627e159e02 matches the original G validation. Saved under `.local/final`. Final stress statistics are from the original identical revision-1 strategy's completed 20-case run, not a new final stress run. Local grader reports ranked yes, prize no, efficiency no: no transcripts, unpriced cost, below hold cash; flags chain_warnings and fee_fallback. These are local Node 22 process-driver results, not server certification. No submission made.

## Initial parameters (revision 1)
G: scout+main; 180-slot confirmation in three 60-slot buckets, >=0.5 SOL net each; >=2 buyers each; wallet share <=65%; rising bucket highs; >=3% price rise. Main 60–83 SOL, last flow >= middle, projected completion <2400 slots; scout 25–60 SOL, created <6000 slots, increasing buyers, projected completion <1800 slots. Scout 0.04 / main 0.45 SOL. Stall 90, hold 1500, trail 12%.
M: 90 slots in three 30-slot buckets; >=0.3 SOL each, >=2 buyers each, wallet share <=40%, bucket highs grow >=0.5%, current within 0.5% of high, rise 4–45%, reserve 8–65 SOL. Size 0.12 SOL, hold 180, trail 4%, exit when 20-slot flow <=0.
Shared: exposure cap 2.5 SOL, stop 12%, buy slippage 500 bps, at most two attempts per mint with 900-slot cooldown. Fallback 0.0101 SOL round trips, mild 30-slot inflow >=0.1 SOL, reserve 3–70, 24 successful coins paced over 60000 slots. Pending buys count toward exposure and capacity.
