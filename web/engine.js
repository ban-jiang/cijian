export const defaults = { exam: "2026-12-12", budget: 30, baselinePage: 0, baselineWord: "" };
export const intervals = [1, 3, 7, 14, 28];
const spellingVariants = [["rigour", "rigor"], ["manoeuvre", "maneuver"], ["publicise", "publicize"], ["visualise", "visualize"], ["immunise", "immunize"], ["speciality", "specialty"], ["appal", "appall"]];
export function spellingMatches(answer, word, accepted = []) { const a = answer.trim().toLowerCase(), w = word.toLowerCase(); return a === w || accepted.some(v=>v.toLowerCase()===a) || spellingVariants.some(group => group.includes(w) && group.includes(a)); }
export function day(at = new Date()) {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(at));
}
export function addDays(date, days) { return new Date(Date.parse(date + "T00:00:00Z") + days * 86400000).toISOString().slice(0, 10); }
export function daysBetween(a, b) { return Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86400000); }
export function mergeEvents(...sources) {
    const m = new Map();
    for (const events of sources)
        for (const e of events)
            if (!m.has(e.id))
                m.set(e.id, e);
    return [...m.values()].sort((a, b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id));
}
export function fold(words, events, settings) {
    const cutoff = words.findIndex(w => w.word.toLowerCase() === settings.baselineWord.toLowerCase());
    const states = words.map((word, i) => ({ word, eligible: word.verified && word.kind!=="derived" && (cutoff >= 0 ? i <= cutoff : word.page <= settings.baselinePage) }));
    const byId = new Map(states.map(s => [s.word.id, s]));
    for (const e of mergeEvents(events)) {
        const d = day(e.at);
        if (e.type === "learn")
            for (const id of e.wordIds || []) {
                const s = byId.get(id);
                if (!s || !s.word.verified)
                    continue;
                s.eligible = true;
                if (!s.learnedOn)
                    s.learnedOn = e.learnedOn || d;
            }
        if (e.type !== "grade" || !e.wordId || !e.dimension)
            continue;
        const s = byId.get(e.wordId);
        if (!s)
            continue;
        const old = s[e.dimension];
        const v = old ? { ...old } : { stage: -1, due: d, weak: false, lapses: 0, attempts: 0, correct: 0 };
        v.attempts++;
        if (e.correct)
            v.correct++;
        const strong = e.correct && e.confidence === "sure";
        if (!strong) {
            v.weak = true;
            v.lapses += e.correct ? 0 : 1;
            v.stage = Math.max(0, v.stage - 1);
            v.due = addDays(d, 1);
        }
        else if (v.lastDay !== d && v.promotedDay !== d && (!old || v.due <= d)) {
            v.stage = Math.min(intervals.length - 1, v.stage + 1);
            v.promotedDay = d;
            v.due = addDays(d, intervals[v.stage]);
            v.weak = false;
        }
        v.lastDay = d;
        s[e.dimension] = v;
    }
    return states;
}
export function hash(s) { let v = 2166136261; for (const c of s)
    v = Math.imul(v ^ c.charCodeAt(0), 16777619); return v >>> 0; }
export function queue(states, today, mode, limit = 50) {
    const active = states.filter(s => s.eligible);
    const due = active.filter(s => s.meaning && s.meaning.due <= today && s.meaning.lastDay !== today);
    const unknown = active.filter(s => !s.meaning && (!s.learnedOn || s.learnedOn < today));
    const weak = active.filter(s => (s.meaning?.weak || s.spelling?.weak) && s.meaning?.lastDay !== today);
    const spelling = active.filter(s => s.meaning && s.meaning.stage >= 1 && (!s.spelling || s.spelling.due <= today) && s.spelling?.lastDay !== today);
    const priority = (a, b) => Number(!!b.meaning?.weak) - Number(!!a.meaning?.weak) || (a.meaning?.due || today).localeCompare(b.meaning?.due || today) || hash(a.word.id + today) - hash(b.word.id + today);
    due.sort(priority);
    unknown.sort((a, b) => Number(!!b.learnedOn) - Number(!!a.learnedOn) || hash(a.word.id + today) - hash(b.word.id + today));
    weak.sort(priority);
    if (mode === "weak")
        return weak.slice(0, limit).map(s => ({ word: s.word, dimension: s.spelling?.weak && !s.meaning?.weak ? "spelling" : "meaning" }));
    const result = [];
    const seen = new Set();
    const add = (s, dimension = "meaning") => { if (!seen.has(s.word.id)) {
        result.push({ word: s.word, dimension });
        seen.add(s.word.id);
    } };
    let d = 0, u = 0;
    while (result.length < limit && (d < due.length || u < unknown.length)) {
        for (let i = 0; i < 4 && d < due.length && result.length < limit; i++)
            add(due[d++]);
        if (u < unknown.length && result.length < limit)
            add(unknown[u++]);
    }
    let spellIndex = 0;
    if (mode !== "quick")
        for (const s of spelling.slice(0, Math.max(2, Math.floor(limit * .15)))) {
            const idx = result.findIndex(q => q.word.id === s.word.id);
            if (idx >= 0)
                result[idx] = { word: s.word, dimension: "spelling" };
            else
                result.splice(Math.min(result.length, 5 + (spellIndex++) * 6), 0, { word: s.word, dimension: "spelling" });
        }
    return result.slice(0, limit);
}
export function options(word, words, seed) {
    const tokens = (v) => v.replace(/\([^)]*\)|（[^）]*）/g, "").split(/[；;，,、]/).map(s => s.trim()).filter(s => s.length >= 2);
    const target = tokens(word.meaning);
    const candidates = words.filter(w => w.id !== word.id && w.verified && w.meaning !== word.meaning && !tokens(w.meaning).some(t => target.some(x => x.includes(t) || t.includes(x))));
    candidates.sort((a, b) => Number(b.pos === word.pos) - Number(a.pos === word.pos) || hash(a.id + seed) - hash(b.id + seed));
    const distinct = [word];
    for (const w of candidates)
        if (!distinct.some(x => x.meaning === w.meaning)) {
            distinct.push(w);
            if (distinct.length === 4)
                break;
        }
    return distinct.sort((a, b) => hash(seed + a.id) - hash(seed + b.id));
}
export function todayStats(events, today) {
    const es = events.filter(e => day(e.at) === today), gs = es.filter(e => e.type === "grade");
    return { seconds: es.filter(e => e.type === "time").reduce((s, e) => s + (e.seconds || 0), 0), answered: gs.length, correct: gs.filter(e => e.correct).length, unique: new Set(gs.map(e => e.wordId)).size };
}
