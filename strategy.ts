import type { Bot, BotState, OrderInput } from './vendor/agentfun-bot.ts';

export const MODE: 'G' | 'M' = 'G';
export const PARAMS = {
  mode: MODE, scouts: true, graduation: 85.00536,
  gWindow: 180, gZone: 60, gUpper: 83, gMain: 0.45, gScout: 0.04,
  gMinFlow: 0.5, gHold: 1500, gStall: 90, gTrail: 0.12,
  mWindow: 90, mMinFlow: 0.3, mSize: 0.12, mHold: 180, mTrail: 0.04,
  exposure: 2.5, stop: 0.12, slip: 500,
  targetCoins: 24, paceSlots: 60000, probe: 0.0101,
};
type Params = typeof PARAMS;
type Tick = { s: number; q: number; p: number; r: number; u: string; buy: boolean };
type Tape = { born: number | null; ticks: Tick[]; attempts: number; exit: number };
type Leg = { start: number; peak: number; probe: boolean; exiting: boolean; added: boolean };

export function createStrategy(p: Params): Bot {
  const tapes = new Map<string, Tape>();
  const legs = new Map<string, Leg>();
  const bought = new Map<string, number>();
  const roundTrips = new Set<string>();
  let firstSlot: number | null = null;
  const tape = (mint: string) => {
    let t = tapes.get(mint);
    if (!t) { t = { born: null, ticks: [], attempts: 0, exit: -1e12 }; tapes.set(mint, t); }
    return t;
  };
  const net = (t: Tape, now: number, window: number) => {
    let n = 0;
    for (let i = t.ticks.length - 1; i >= 0 && t.ticks[i].s > now - window; i--) n += t.ticks[i].q;
    return n;
  };
  const confirmation = (t: Tape, now: number, w: number) => {
    const flow = [0, 0, 0], highs = [0, 0, 0];
    const buyers = [new Set<string>(), new Set<string>(), new Set<string>()];
    const wallet = new Map<string, number>();
    let buy = 0, first = 0, last = 0, startReserve = 0;
    for (const x of t.ticks) {
      if (x.s <= now - w) continue;
      const b = Math.min(2, Math.floor((x.s - (now - w)) / (w / 3)));
      flow[b] += x.q; highs[b] = Math.max(highs[b], x.p);
      if (!first) { first = x.p; startReserve = x.r; }
      last = x.p;
      if (x.buy) {
        buyers[b].add(x.u); buy += x.q;
        wallet.set(x.u, (wallet.get(x.u) ?? 0) + x.q);
      }
    }
    let largest = 0;
    for (const amount of wallet.values()) largest = Math.max(largest, amount);
    return { flow, highs, buyers, share: buy > 0 ? largest / buy : 1,
      rise: first > 0 ? last / first - 1 : 0, startReserve, last };
  };
  const signal = (t: Tape, now: number, reserve: number): 'main' | 'scout' | null => {
    if (p.mode === 'G') {
      const c = confirmation(t, now, p.gWindow);
      if (reserve > p.gUpper || c.flow.some(x => x < p.gMinFlow)) return null;
      if (c.buyers.some(x => x.size < 2) || c.share > 0.65 || c.rise < 0.03) return null;
      if (c.highs[1] <= c.highs[0] || c.highs[2] <= c.highs[1]) return null;
      const growth = reserve - c.startReserve;
      const eta = growth > 0 ? (p.graduation - reserve) * p.gWindow / growth : Infinity;
      if (reserve >= p.gZone && c.flow[2] >= c.flow[1] && eta < 2400) return 'main';
      if (p.scouts && reserve >= 25 && reserve < p.gZone && t.born !== null && now - t.born < 6000
          && c.buyers[2].size > c.buyers[0].size && eta < 1800) return 'scout';
      return null;
    }
    if (reserve < 8 || reserve > 65) return null;
    const c = confirmation(t, now, p.mWindow);
    if (c.flow.some(x => x < p.mMinFlow) || c.buyers.some(x => x.size < 2) || c.share > 0.4) return null;
    if (c.highs[1] <= c.highs[0] * 1.005 || c.highs[2] <= c.highs[1] * 1.005) return null;
    if (c.last < c.highs[2] * 0.995 || c.rise < 0.04 || c.rise > 0.45) return null;
    return 'main';
  };
  const closeValue = (s: BotState, mint: string) => {
    const h = s.positions.get(mint)!, c = s.curves.get(mint)!;
    const tokens = Number(h.token_amount);
    return Math.min(Number(c.real_quote_reserves), tokens * Number(c.virtual_quote_reserves) /
      (Number(c.virtual_token_reserves) + tokens)) / 1e9 * 0.9875 - Number(s.txFeeLamports()) / 1e9;
  };
  return {
    onBatch(s, batch) {
      const now = batch.slot;
      if (firstSlot === null) firstSlot = now;
      for (const f of batch.fills) {
        if (f.status !== 'filled') continue;
        if (f.side === 'buy') bought.set(f.mint, (bought.get(f.mint) ?? 0) + Number(f.quote_lamports) / 1e9);
        else if ((bought.get(f.mint) ?? 0) >= 0.01) roundTrips.add(f.mint);
      }
      const touched = new Set<string>();
      for (const e of batch.events) {
        const t = tape(e.mint);
        if (e.event === 'CreateEvent') t.born = e.slot;
        if (e.event !== 'TradeEvent') continue;
        touched.add(e.mint);
        t.ticks.push({ s: e.slot, q: Number(e.quote_amount) / 1e9 * (e.is_buy ? 1 : -1),
          p: Number(e.virtual_quote_reserves) / Number(e.virtual_token_reserves),
          r: Number(e.real_quote_reserves) / 1e9, u: e.user, buy: e.is_buy });
        let cut = 0;
        while (cut < t.ticks.length && t.ticks[cut].s < now - 650) cut++;
        if (cut) t.ticks.splice(0, cut);
      }
      const pending = new Set<string>();
      let exposure = 0;
      for (const h of s.positions.values()) exposure += Number(h.cost_lamports) / 1e9;
      for (const o of s.pending.values()) {
        pending.add(o.order.mint);
        if (o.order.side === 'buy') exposure += Number(o.order.quote_lamports) / 1e9;
      }
      const orders: OrderInput[] = [];
      const cap = s.hello.caps.max_orders_per_batch;
      for (const [mint, leg] of legs) {
        if (pending.has(mint)) continue;
        const h = s.positions.get(mint), c = s.curves.get(mint);
        if (!h) { legs.delete(mint); tape(mint).exit = now; continue; }
        if (!c || c.complete) continue;
        const value = closeValue(s, mint), cost = Number(h.cost_lamports) / 1e9;
        const ratio = value / cost;
        leg.peak = Math.max(leg.peak, ratio);
        const t = tape(mint), age = now - leg.start;
        const fade = p.mode === 'M' ? net(t, now, 20) <= 0 : net(t, now, 30) < -0.5;
        const stall = p.mode === 'G' && age > p.gStall && net(t, now, p.gStall) <= 0;
        if (leg.probe || leg.exiting || ratio < 1 - p.stop || fade || stall ||
            ratio < leg.peak * (1 - (p.mode === 'G' ? p.gTrail : p.mTrail)) ||
            age > (p.mode === 'G' ? p.gHold : p.mHold)) {
          leg.exiting = true;
          if (orders.length < cap) orders.push({ side: 'sell', mint, token_amount: h.token_amount, max_slippage_bps: 10000 });
        }
      }
      let free = Number(s.freeCashLamports()) / 1e9;
      let room = s.hello.caps.max_open_positions - s.committedPositionCount();
      const buy = (mint: string, want: number, probe: boolean, add: boolean) => {
        if (orders.length >= cap || (!add && room <= 0)) return false;
        const amount = Math.min(want, Number(s.maxBuyLamports(mint)) / 1e9, p.exposure - exposure, free - 0.001);
        if (amount < (probe ? p.probe : 0.0101)) return false;
        orders.push({ side: 'buy', mint, quote_lamports: BigInt(Math.floor(amount * 1e9)), max_slippage_bps: p.slip });
        free -= amount + Number(s.txFeeLamports()) / 1e9; exposure += amount;
        pending.add(mint);
        if (!add) {
          room--; tape(mint).attempts++;
          legs.set(mint, { start: now, peak: 1, probe, exiting: false, added: false });
        } else legs.get(mint)!.added = true;
        return true;
      };
      for (const mint of touched) {
        if (pending.has(mint)) continue;
        const c = s.curves.get(mint)!;
        if (c.complete) continue;
        const t = tape(mint), h = s.positions.get(mint), leg = legs.get(mint);
        if (leg && (leg.probe || leg.exiting || leg.added)) continue;
        if (!h && (t.attempts >= 2 || now - t.exit < 900)) continue;
        const kind = signal(t, now, Number(c.real_quote_reserves) / 1e9);
        if (!kind) continue;
        if (h) {
          if (p.mode !== 'G' || kind !== 'main' || closeValue(s, mint) < Number(h.cost_lamports) / 1e9 * 1.03) continue;
          buy(mint, Math.max(0, p.gMain - Number(h.cost_lamports) / 1e9), false, true);
        } else buy(mint, p.mode === 'M' ? p.mSize : kind === 'scout' ? p.gScout : p.gMain, false, false);
      }
      // Pace successful round trips, not submitted orders. Reserve a fifth slot for fallback.
      const target = Math.ceil(p.targetCoins * Math.min(1, (now - firstSlot) / p.paceSlots));
      let outstanding = 0;
      for (const mint of legs.keys()) if (!roundTrips.has(mint)) outstanding++;
      if (roundTrips.size + outstanding < target && room > 0) {
        for (const mint of touched) {
          if (pending.has(mint) || legs.has(mint) || roundTrips.has(mint)) continue;
          const c = s.curves.get(mint)!, t = tape(mint);
          if (c.complete || c.real_quote_reserves < 3000000000n || c.real_quote_reserves > 70000000000n) continue;
          if (t.attempts >= 2 || net(t, now, 30) < 0.1) continue;
          if (buy(mint, p.probe, true, false)) break;
        }
      }
      return orders;
    },
  };
}
