// Spelling/contrast cues, deliberately labelled as memory aids rather than etymologies.
export const memoryNotes = {
    aggressive: "拼写分块 ag | gress | ive：两个 g、两个 s。想象一个人在讨论中步步紧逼，态度咄咄逼人。名词 aggression，词尾换成 -ion。",
    congress: "对照记忆：congress 常指国会或代表大会；council 常指委员会、理事会或地方议会。拼写 con | gress，保留两个 s。",
    conquer: "拼写分块 con | quer。征服 conquer，征服者 conqueror，征服或攻占 conquest；变成 conquest 时，后半段不是 quer。",
    proceed: "拼写对照：pro | ceed 有两个 e，表示继续进行、前进；pre | cede 只有一个 e，表示先于。海水 recede 退去后，队伍 proceed 前进。",
    precede: "pre | cede：先于。对照 proceed（继续进行）：前者 pre-、词尾 -cede；后者 pro-、词尾 -ceed。把“先于”和“继续”连同拼写一起回忆。",
    recede: "re | cede：退去、减弱。记一个画面：潮水 recede，海岸露出；队伍继续前进 proceed。前者 -cede，后者 -ceed。",
    emerge: "拼写联想：潜艇 submerge 潜入水下，又 emerge 浮出水面。e | merg | e 与 sub | merg | e 共享 merg；联想仅帮助记形记义。",
    submerge: "对照画面：submerge 潜入或淹没，emerge 浮出或出现。拼写 sub | merg | e；不要漏掉 sub 中的 b。",
    emergency: "拼写分块 emerg | ency，紧急情况。对照 emergence（出现）：紧急情况 emergency 以 -ency 结尾，出现 emergence 以 -ence 结尾。",
    annual: "对照记忆：annual 是“每年的、一年一次的”；anniversary 是“周年纪念日”。一份 annual report 是年度报告。拼写 ann | ual，两个 n。",
    portray: "拼写联想（非词源）：把一个 tray 托盘想成小舞台，上面描绘人物、扮演角色。按 por | tray 拼回 portray，记住尾部是 tray。",
    access: "access：进入、使用权。对照 assess：评估。两者都有两个 s，但 access 中间是 cc，assess 的中间是 ss。",
    assess: "assess：评估；access：进入、使用权。按 a | ss | e | ss 记 assess，两个位置各有一对 s。",
    compliment: "compliment 是赞美；complement 是补充、使完整。记忆联想：我 I 喜欢听赞美，compliment 中间是 i；只是拼写提示，不是词源。",
    terrific: "terrific 常用来表示极好的、了不起的，也可强调数量巨大；terrible 是糟糕的、可怕的。拼写 terr | ific，两词都有两个 r。",
    subordinate: "拼写分块 sub | ordin | ate。把上面一层和下面一层想成组织结构：下面一层是下属 subordinate；也可表示次要的。",
    commonplace: "common + place：常见的、普通的。这个拼写可以直接按两个熟词拼回；不要因故事里的“地方”而把词义只记成地点。",
    tremendous: "拼写联想：trem | end | ous，中间保留完整 end。把“巨大”画成一件怎么做都到不了 end 的大工程；这是记忆联想。",
    magnitude: "对照：magnificent 壮丽的，magnitude 巨大程度或重要性，magnify 放大。记词群共享 magn，分别留意后半段 -ificent、-itude、-ify。",
};
export function similarWords(word, all) {
    function distance(a, b) { let row = Array.from({ length: b.length + 1 }, (_, i) => i); for (let i = 1; i <= a.length; i++) {
        const next = [i];
        for (let j = 1; j <= b.length; j++)
            next[j] = Math.min(next[j - 1] + 1, row[j] + 1, row[j - 1] + Number(a[i - 1] !== b[j - 1]));
        row = next;
    } return row[b.length]; }
    return [...new Map(all.map(w => [w.word, w])).values()].filter(w => w.word !== word && Math.abs(w.word.length - word.length) <= 3).map(w => ({ ...w, d: distance(word, w.word) })).filter(w => w.d <= 2 && word.length >= 5).sort((a, b) => a.d - b.d).slice(0, 3);
}
