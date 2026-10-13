// utils.js: 包含通用的辅助函数。

/**
 * 设置一个 Cookie。
 * @param {string} name - Cookie 的名称。
 * @param {string} value - Cookie 的值。
 * @param {number} days - Cookie 的有效天数。
 */
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value !== null && value !== undefined ? value : "") + expires + "; path=/; SameSite=Lax";
}

/**
 * 获取指定名称的 Cookie 值。
 * @param {string} name - 要获取的 Cookie 的名称。
 * @returns {string|null} 如果找到则返回 Cookie 的值，否则返回 null。
 */
function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

/**
 * 复制文本到剪贴板的后备方法 (用于不支持新API的浏览器)。
 * @param {string} text - 要复制的文本。
 * @returns {boolean} 是否复制成功。
 */
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
    } catch (err) {
        document.body.removeChild(textArea);
        return false;
    }
}

/**
 * 将文本复制到剪贴板 (优先使用现代API)。
 * @param {string} text - 要复制的文本。
 * @returns {Promise<void>} 一个在复制成功时解析的 Promise。
 */
function copyTextToClipboard(text) {
    return new Promise((resolve, reject) => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(resolve).catch(() => {
                if (fallbackCopyTextToClipboard(text)) resolve();
                else reject(new Error('Fallback copy command failed.'));
            });
        } else {
            if (fallbackCopyTextToClipboard(text)) resolve();
            else reject(new Error('Clipboard API not available and fallback failed.'));
        }
    });
}

/**
 * 获取用于显示的名称（如家族、来源），如果关闭了“显示活动名称”，则只显示核心名称。
 * @param {string} value - 原始值。
 * @param {string} type - 类型 ('family' 或 'source')。
 * @returns {string} 格式化后的显示名称。
 */
function getDisplayName(value, type) {
    const showEventNameCheckbox = document.getElementById('show-event-name-checkbox');
    // 来源（source）：选项值是规范 ID ⇒ 直接过字典拿到当前语言全名
    if (type === 'source' && typeof Lang !== 'undefined') {
        const full = Lang.t('source', String(value)) || String(value);
        if (!showEventNameCheckbox || showEventNameCheckbox.checked) return full;
        const parts = full.split(' - ');
        return parts.length > 1 ? parts.slice(1).join(' - ').trim() : full;
    }
    // 如果复选框不存在或已选中，直接返回翻译后的值
    if (!showEventNameCheckbox || showEventNameCheckbox.checked) {
        return state.family_values[String(value).toLowerCase()] || value;
    }

    // 如果未选中，则尝试去除前缀
    let translatedValue = state.family_values[String(value).toLowerCase()] || value;
    if (type === 'family' || type === 'source') {
        const parts = translatedValue.split(' - ');
        if (parts.length > 1) {
            return parts.slice(1).join(' - ').trim(); // 返回 " - " 之后的所有部分
        }
    }
    return translatedValue;
}

/**
 * 取某个英雄的**技能标签**（已按固定优先级 + 自定义顺序排好）。
 *
 * 数据源唯一：`data/heroes_skill_types.json`。
 * @param {object} hero - 英雄对象。
 * @returns {string[]} - 排序后的技能标签数组。
 */
function getSkillTagsForHero(hero) {
    if (!hero) return [];

    // 缓存：列表每渲染一次就要对全部英雄各算一遍（1973 次），代价明显。
    // ⚠ 结果里最后一步 `localeCompare` 只区分 cn / 非 cn ⇒ 按这两个"语言族"分键缓存即可。
    const ck = '_skillTagsCache_' + (state.currentLang === 'cn' ? 'cn' : 'other');
    if (hero[ck]) return hero[ck];

    // 排序规则：先按分类优先级（基础技能 → 特殊效果 → 增益效果 → 负面效果），
    // 同分类内按 sort_order.json 里的自定义顺序，最后按当前语言字典序。
    const sortSkillTags = (tags) => {
        const priorityCategories = ["基础技能", "特殊效果", "增益效果", "负面效果"];
        const orderArrays = {
        "基础技能": Lang.sortOrder('skillTag_base'),
        "特殊效果": Lang.sortOrder('skillTag_special'),
        "增益效果": Lang.sortOrder('skillTag_buff'),
        "负面效果": Lang.sortOrder('skillTag_debuff')
        };

        tags.sort((a, b) => {
            const categoryA = state.skillTagToCategoryMap[a];
            const categoryB = state.skillTagToCategoryMap[b];
            const priorityIndexA = categoryA ? priorityCategories.indexOf(categoryA) : -1;
            const priorityIndexB = categoryB ? priorityCategories.indexOf(categoryB) : -1;

            if (priorityIndexA !== priorityIndexB) {
                if (priorityIndexA !== -1 && priorityIndexB !== -1) return priorityIndexA - priorityIndexB;
                if (priorityIndexA !== -1) return -1;
                if (priorityIndexB !== -1) return 1;
            }
            if (priorityIndexA !== -1) {
                const sortOrder = orderArrays[categoryA];
                if (sortOrder) {
                    const chineseKeyA = a;   // 标签本来就是 CN 键
                    const chineseKeyB = b;
                    const indexA = sortOrder.indexOf(chineseKeyA);
                    const indexB = sortOrder.indexOf(chineseKeyB);
                    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                    if (indexA !== -1) return -1;
                    if (indexB !== -1) return 1;
                }
            }
            return a.localeCompare(b, state.currentLang === 'cn' ? 'zh-CN' : 'zh-TW');
        });
        return tags;
    };

    const out = sortSkillTags([...heroSkillTags(hero)]).filter(Boolean);
    hero[ck] = out;
    return out;
}


// ⚠ 已删除的「额外名称语言」整条链（原「搜索语言」功能的残留）：
//   · `window.langData` + `loadExtraNameData()` —— 最后一个读取方 `render.js::getSkinInfo`
//     已随本次清理删除 ⇒ 零读取方。且它拉的 3 个文件（`heroes_name_*` / `heroes_name_fancy_*` /
//     `skill_name_*`）**`Lang.loadAll()` 本来就拉**（都在 `TABLES` 里）⇒ 属重复请求。
//   · `applyHeroNames` / `applyFancyNames` / `applySkillNames` / `applyCustomLanguageNames`
//     —— 只能由已废弃的 `savedLang !== 'current'` 分支到达 ⇒ 不可达。
//   名字 / fancy 名 / 技能名的翻译统一由 `Lang.loadAll()` + `_tPrefix()` 负责
//   （见 `loadData` / `reloadLanguageData`）。

/**
 * 从「平衡数据」档取出某英雄的**平衡版**技能三件套。
 *
 * 档格式与常规 `heroes_skills_<码>.json` 完全相同（`{hid:[{familyBonus,passiveSkills,skills}]}`），
 * 但它是**差异档**：只包含第二表有定义、且**与常规不同**的节（生成器 `--site-export-balanced`
 * 逐节比对后过滤）。⇒ **键存在与否就是"该节要不要显示切换按钮"的判据**：
 *   · 有 `skills`        ⇒ 「✨ 技能效果:」旁加按钮
 *   · 有 `passiveSkills` ⇒ 「🧿 被动技能:」旁加按钮
 *   · 三节都与常规相同   ⇒ 该英雄整个不在档里 ⇒ 不加按钮
 * @param {object|null} balSkills 平衡档（缺失传 null）
 * @param {string} hid 规范英雄 ID
 * @returns {{effects?:Array,passiveSkills?:Array,familyBonus?:Array}|null} 无平衡数据返回 null
 */
function balancedFieldsFrom(balSkills, hid) {
    const b = balSkills && balSkills[hid] && balSkills[hid][0];
    if (!b) return null;
    const out = {};
    // ⚠ 只放**档里真正存在**的节（用 in 判断，空数组也算"有差异"）
    if ('skills' in b) out.effects = (b.skills && b.skills[0] && b.skills[0].lines) || [];
    if ('passiveSkills' in b) out.passiveSkills = b.passiveSkills || [];
    if ('familyBonus' in b) out.familyBonus = b.familyBonus || [];
    // 属性（三围等）：第二表可能**只改属性**而技能文本完全相同（如 vegetable_cauliver），
    //   这类英雄在档里只有 `stats` 一节 ⇒ 是"要不要在属性区显示按钮"的判据。
    if ('stats' in b) out.stats = b.stats;
    return Object.keys(out).length ? out : null;
}

/**
 * **无缝切换语言**：重新载入「按语言分片」的数据，并重建英雄对象上所有语言相关字段。
 *
 * ⚠ 为什么需要它：`loadData()` 在启动时把两类内容**按语言固化**了 ——
 *   ① 词表（`Lang.loadAll` 的 13 张表 + i18n）；
 *   ② 技能文本 `data/heroes_skills_<lang>.json`（`effects`/`passives`/`passiveSkills`/
 *      `passivesSearchPool`/`familyBonus`）；
 *   ③ hero 对象上用 `Lang.t()` 写死的显示字段（name/fancy_name/skill/color/class/
 *      speed/source/AetherPower）与 `state.family_values`。
 *   旧实现靠**整页重载**重跑 loadData；无缝切换必须在这里等价重刷，否则列表/详情仍是旧语言。
 *
 * 只改**显示字段**，不动任何 ID（`heroId`/`colorId`/`classId`/`speedId`/`sourceId`/`aetherPowerId`），
 * 与 `loadData` 的口径完全一致（含最长前缀回退 `_tPrefix`）。
 * @param {string} lang 目标语言码
 */
async function reloadLanguageData(lang) {
    await Lang.loadAll(lang);
    const res = await fetch(`data/heroes_skills_${lang}.json?v=${Date.now()}`);
    if (!res.ok) throw new Error('heroes_skills HTTP ' + res.status);
    const skills = await res.json();
    // 平衡数据档：与常规档**同步重载**（否则切语言后按钮切换的还是旧语言的平衡文本）。
    // ⚠ 该档可能不存在（生成器未跑 --site-export-balanced）⇒ 缺失时降级为 null，不算失败。
    const balRes = await fetch(`data/heroes_skills_balanced_${lang}.json?v=${Date.now()}`)
        .catch(() => null);
    const balSkills = (balRes && balRes.ok) ? await balRes.json() : null;

    const familyValues = {};
    (state.allHeroes || []).forEach(hero => {
        const hid = hero.heroId;
        const st = (skills[hid] && skills[hid][0]) || {};
        // ── 显示字段（与 loadData 同口径）──
        hero.name = _tPrefix('heroes_name', hid);
        hero.fancy_name = _tPrefix('heroes_name_fancy', hid);
        hero.skill = Lang.t('skill_name', hero.specialId || '');
        hero.color = Lang.t('color', hero.colorId);
        hero.class = Lang.t('class', hero.classId);
        hero.speed = Lang.t('speed', hero.speedId);
        hero.source = Lang.t('source', hero.sourceId);
        hero.AetherPower = Lang.t('aether_power', hero.aetherPowerId);
        // ── 技能文本（按语言分片）──
        hero.effects = (st.skills && st.skills[0] && st.skills[0].lines) || [];
        hero.passiveSkills = st.passiveSkills || [];
        hero.passives = (st.passiveSkills || []).map(x => x.text).filter(Boolean);
        hero.passivesSearchPool = (st.passiveSkills || []).reduce((a, x) => {
            if (x && x.text) a.push(x.text);
            if (x && x.title) a.push(x.title);
            return a;
        }, []);
        hero.familyBonus = st.familyBonus || [];
        // 平衡数据（差异档）：键存在与否 = 该节要不要显示「切换平衡数据」按钮
        hero._balanced = balancedFieldsFrom(balSkills, hid);
        // ⚠ 常规基线**随语言重建**（旧基线是上一语言的文本，必须作废）；
        //   若该英雄此前切到了平衡版，这里按原开关重新套用到新语言的平衡文本上。
        hero._normalSnapshot = {
            effects: hero.effects, passiveSkills: hero.passiveSkills, familyBonus: hero.familyBonus,
            attack: hero.attack, defense: hero.defense, health: hero.health,
            power: hero.power, lb1: hero.lb1, lb2: hero.lb2
        };
        if (typeof applyBalancedSections === 'function') applyBalancedSections(hero);
        if (hero.family != null && !(hero.family in familyValues)) {
            familyValues[hero.family] = Lang.t('family', hero.family);
        }
    });
    state.family_values = familyValues;
}

/**
 * 从服务器加载核心数据 (英雄、家族等)。
 * @param {string} lang - 要加载的语言版本 ('cn', 'tc', 'en')。
 * @returns {Promise<boolean>} 数据是否加载成功。
 */
/** 稀有度参数（满级/突破成长） */
const RARITY_PARAMS = {
    5: { m1: 4, m2: 265, lb1: 20, lb2: 40 }, 4: { m1: 5, m2: 225, lb1: 23, lb2: 46 },
    3: { m1: 6, m2: 123, lb1: 29, lb2: 58 }, 2: { m1: 7, m2: 93, lb1: 0, lb2: 0 },
    1: { m1: 8, m2: 31, lb1: 0, lb2: 0 }
};
const STAR_BASE_POWER = { 1: 0, 2: 10, 3: 30, 4: 50, 5: 90 };

/** 单个属性：基础 → 80 级 → LB1 → LB2（每步整除截断，与游戏一致） */
function _statLadder(base, rarity) {
    const p = RARITY_PARAMS[rarity] || { m1: 0, m2: 0, lb1: 0, lb2: 0 };
    const lv80 = Math.trunc(base + (base * p.m1 / 1000 * p.m2));
    const lb1 = Math.trunc(lv80 + (base * p.lb1 / 1000 * 8));
    const lb2 = Math.trunc(lb1 + (base * p.lb2 / 1000 * 8));
    return [lv80, lb1, lb2];
}

/**
 * 英雄三档属性（80 级 / LB1 / LB2）+ 战力。
 * 口径与旧数据一致（实测本体英雄 1309/1309 逐字段复现）：
 *   power = starBase[star] + int(atk*0.35 + def*0.28 + hp*0.14) + (8-1)*5
 */
function computeHeroStats(c) {
    const r = c.rarity;
    const [a0, a1, a2] = _statLadder(c.baseAttack || 0, r);
    const [d0, d1, d2] = _statLadder(c.baseDefense || 0, r);
    const [h0, h1, h2] = _statLadder(c.baseHealth || 0, r);
    const pw = (a, d, h) => STAR_BASE_POWER[r] !== undefined
        ? STAR_BASE_POWER[r] + Math.floor(a * 0.35 + d * 0.28 + h * 0.14) + 35
        : Math.floor(a * 0.35 + d * 0.28 + h * 0.14) + 35;
    return {
        attack: a0, defense: d0, health: h0, power: pw(a0, d0, h0),
        lb1: { attack: a1, defense: d1, health: h1, power: pw(a1, d1, h1) },
        lb2: { attack: a2, defense: d2, health: h2, power: pw(a2, d2, h2) }
    };
}

/**
 * 服装奖励条目：取「`sets` 套、满阶」那一档。
 * 表按「每套 `stages` 阶连续」排布 ⇒ `idx = sets×stages - 1`（越界钳到末档）。
 * `sets <= 0` / 该英雄没有服装奖励表 ⇒ `null`（= 不施加服装奖励）。
 */
function costumeBonusEntry(hero, sets) {
    if (!hero || !hero.costumeBonusLevels || !sets || sets <= 0) return null;
    const bl = hero.costumeBonusLevels, st = hero.costumeStages || 4;
    const idx = Math.min(sets * st - 1, bl.length - 1);
    return (idx >= 0) ? bl[idx] : null;
}

/** 官方 `apply_stat_per_mil`：`stat × (1000+‰) / 1000`，**整除截断**（不是浮点乘完再 round）。 */
function applyStatPerMil(v, perMil) {
    return perMil ? Math.floor((v || 0) * (1000 + perMil) / 1000) : (v || 0);
}

/**
 * 技能类型（统一成新格式 `{分类: [标签…]}`）。
 * 新数据 `hero.skill_types` 就是这个形状（`data/heroes_skill_types.json`）；
 * 旧数据 `hero.cn_skill_info` 是 `[{分类:[标签]}, …]` ⇒ 这里统一，调用方不必再判格式。
 */
function heroSkillTypes(hero) {
    if (!hero) return {};
    const st = hero.skill_types;
    if (st && !Array.isArray(st)) return st;
    const src = st || hero.cn_skill_info;
    const out = {};
    if (Array.isArray(src)) {
        src.forEach(cat => { for (const k in cat) out[k] = (out[k] || []).concat(cat[k] || []); });
    }
    return out;
}

/** 技能类型标签的扁平数组 */
function heroSkillTags(hero) {
    return Object.values(heroSkillTypes(hero)).flat().filter(Boolean);
}

/**
 * 取词（**最长前缀匹配**）：服装英雄没有自己的名字条目 ⇒ 回退到其本体条目
 * （例 `nordic_chained_werewolf_costume_raccoon` → `nordic_chained_werewolf`）。
 */
function _tPrefix(table, id) {
    if (!id) return '';
    const m = Lang.get(table);
    if (m[id] !== undefined) return m[id];
    let best = '', bestLen = -1;
    for (const k in m) {
        if (k.length > bestLen && id.startsWith(k)) { best = k; bestLen = k.length; }
    }
    return best ? m[best] : id;
}

/**
 * 英雄的**规范身份键**（收藏 / 分享 / 队伍存储等一切持久化标识）。
 * ⚠ **不要**用 `${english_name}-${costume_id}` 当身份键：`english_name` 会回退到
 *   **父英雄名**（见 `_tPrefix`），而元素变体英雄（如 `mimic_aether_blue/green/…`）
 *   英文名相同且 `costume_id` 均为 0 ⇒ 键完全相同 ⇒ 收藏 1 个会命中一整组
 *   （曾实测 10 组 / 72 个英雄）。
 */
function heroIdentity(hero) {
    if (!hero) return '';
    if (hero.heroId) return hero.heroId;
    return `${hero.english_name}-${hero.costume_id}`;
}

/**
 * 由身份键解析回英雄对象：**优先精确匹配 `heroId`**，
 * 再兼容旧格式 `english_name-costume_id`（同名组多命中 ⇒ 取第一个）。
 */
function resolveHeroByIdentity(identity) {
    if (!identity) return null;
    const byId = state.allHeroes.find(h => h.heroId === identity);
    if (byId) return byId;
    return state.allHeroes.find(h => `${h.english_name}-${h.costume_id}` === identity) || null;
}

/** 服装槽位（图标/皮肤标识用）：toon=3 glass=4 stylish=5，其余按同父英雄的发布顺序 1/2 */
function _costumeSlot(heroId, ord) {
    // 槽位 = **同父英雄下按发布日期编的序号**（1/2/3…）。
    // ⚠ 不要再按 id 里的 `toon`/`glass`/`stylish` 关键字覆写：`getCostumeIconName`
    //   还会对「classic 3★」再做一次 `+1` 映射，两处叠加会把 `stylish` 顶到 6
    //   ⇒ 查不到 → 回退成 `C1`（`dwarven_smasher_costume_stylish`）。
    //   实测：序号法 + 那次 +1 与"按 id 关键字"在 240 个带类型名的服装里 **238 个一致**，
    //   不一致的 2 个（`*_costume_cute` 排在第 1 位）旧站也是按序号出的。
    return ord;
}

/**
 * 英雄 id 命中这些关键字（如 `_temp1`）⇒ **不进列表**。
 * 与"默认隐藏"**分开**：那是 `isHiddenHero()` 运行时判定的可切换隐藏，
 * 这里是**硬排除**（`hero.excluded`），任何情况下都不展示（含抽奖奖池）。
 * 消费点：`filters.js::listHeroes()` / `applyFiltersAndRender()`、`lottery-simulator.js::getSimHeroPool()`。
 * 想加/减关键字就改这里。
 * ⚠ 别写成 `_temp`：那会把 `oriental_female_templar*`、`ninja_cobalt_costume_tempest`
 *   这些正常英雄一起排掉（`_templar` / `_tempest` 里都含 `_temp`）。
 */
const EXCLUDED_ID_KEYWORDS = ['_temp1'];

/**
 * 该英雄是否被"id 关键字"排除。
 */
function isExcludedById(heroId) {
    const s = String(heroId || '');
    return EXCLUDED_ID_KEYWORDS.some(k => k && s.indexOf(k) >= 0);
}

/**
 * 「默认隐藏」判据（运行时动态判定，不落盘）。
 * 命中 ⇒ `hero.hidden = true` ⇒ 默认不进列表（`state.showHiddenHeroes` 可切回来）。
 *
 * 以前是 `data/hero_order.json` 里写死的 `hidden` 名单，缺点是每次配置更新都要重算一遍、
 * 且容易和"固定段"口径打架；现在规则就这一处，改关键字改这里即可。
 *
 * 判据（两条取并集）：
 *   ① id 含 `trainer` / `guestip` / `temp1`
 *   ② 发布日期（`canBeReceivedDate`）是 **2200 年** —— 官方"未发布"哨兵
 * ⚠ 隐藏必须是**标记**而不是从数组删除：`mahayoddha_sangeeta` 这类 2200 英雄**落在固定段内**，
 *   真删会让其后下标全部前移 ⇒ 收藏位图错位。
 * ⚠ 与 `isExcludedById`（`_temp1`，硬排除，任何情况都不展示含抽奖奖池）**是两套机制**。
 */
const HIDDEN_ID_KEYWORDS = ['trainer', 'guestip', 'temp1'];
const HIDDEN_YEAR_PREFIX = '2200';

function isHiddenHero(hero) {
    if (!hero) return false;
    const id = String(hero.id || '').toLowerCase();
    if (HIDDEN_ID_KEYWORDS.some(k => id.indexOf(k) >= 0)) return true;
    return String(hero.canBeReceivedDate || '').slice(0, 4) === HIDDEN_YEAR_PREFIX;
}

/**
 * 字符串比较：一律按**码点**序，不用 `localeCompare`
 * （后者受语言环境影响，排序结果会随界面语言漂移 ⇒ 序号不稳定 ⇒ 收藏错位）。
 */
function _cmpStr(a, b) {
    const x = String(a || ''), y = String(b || '');
    return x > y ? 1 : (x < y ? -1 : 0);
}

/**
 * 自动段（固定段以外的英雄）排序键：【发布日期 → 战力(低→高) → 英雄ID】。
 * 与 `data/hero_order.json` 的生成脚本 `_tools/_hero_order.py` 自检口径一致。
 */
function _cmpAutoOrder(ha, hb) {
    if (!ha || !hb) return 0;
    return _cmpStr(ha.canBeReceivedDate, hb.canBeReceivedDate)
        || (computeHeroStats(ha).power - computeHeroStats(hb).power)
        || _cmpStr(ha.id, hb.id);
}

/**
 * 从服务器加载核心数据。
 *
 * 数据源（全部来自官方配置 + 我们导出的词条，**不再用 data_{cn,en,tc}.json**）：
 *   data/hero_order.json         英雄序号表**只存固定段 1953**（收藏位图按此下标）；
 *                                其余序号由本函数运行时按【日期→战力→id】追加，hidden 动态判定
 *   data/characters.json         官方英雄配置（id/rarity/基础三维/element/family/manaSpeedId/classType/aetherGift…）
 *   data/heroes_skills_<码>.json 我们导出的词条（familyBonus / passiveSkills / skills[].lines）
 *   data/heroes_skill_types.json 技能类型标签（简体中文键）
 *   data/source_info.json        source → 家族 关系
 *   langs_json/*_<码>.json       各语言词表 + i18n + sort_order
 * 语言：整页重载 ⇒ 启动时 await 一次即可。
 * @param {string} lang - 当前语言码（cn/tc/en/…）。
 */
async function loadData(lang) {
    // ⚠ 「搜索语言 / 额外名称语言」选择已废弃 —— 名字与技能名一律按**当前界面语言**。
    try {
        // ① 语言表（i18n + 各词表 + 排序表）
        await Lang.loadAll(lang);

        // ② 数据
        const [orderRes, charsRes, typesRes, srcRes, skillsRes, enNameRes, costumeRes, balRes, charBalRes] = await Promise.all([
            fetch(`data/hero_order.json?v=${Date.now()}`),
            fetch(`data/characters.json?v=${Date.now()}`),
            fetch(`data/heroes_skill_types.json?v=${Date.now()}`),
            fetch(`data/source_info.json?v=${Date.now()}`),
            fetch(`data/heroes_skills_${lang}.json?v=${Date.now()}`),
            fetch(`langs_json/heroes_name_en.json?v=${Date.now()}`).catch(() => null),
            fetch(`data/costume_bonuses.json?v=${Date.now()}`).catch(() => null),
            // 平衡数据（官方第二表）：**可能没有这份档**（生成器未跑 --site-export-balanced）
            //   ⇒ 允许 404，缺失时全站无 `_balanced`，其余功能不受影响。
            fetch(`data/heroes_skills_balanced_${lang}.json?v=${Date.now()}`).catch(() => null),
            // 平衡版角色定义（第二表完整定义，语言无关）：按完整定义重算三围用；同样允许缺失。
            fetch(`data/characters_balanced.json?v=${Date.now()}`).catch(() => null)
        ]);
        const orderDoc = await orderRes.json();
        const charsDoc = await charsRes.json();
        const typesDoc = await typesRes.json();
        const srcDoc = await srcRes.json();
        const skills = await skillsRes.json();
        const enNames = enNameRes ? await enNameRes.json() : {};   // 供 `hero.english_name` 用
        const costumeBonuses = costumeRes ? await costumeRes.json() : {};
        // ⚠ 404 不会 reject（fetch 只在网络错误时 reject）⇒ 必须看 `.ok`，否则会把错误页当 JSON 解析而抛错
        const balSkills = (balRes && balRes.ok) ? await balRes.json() : null;
        // 平衡版角色定义（第二表完整定义，`heroes` 按 id 键）—— 切三围时按**完整定义**算，不必拼差异字段
        const charBal = (charBalRes && charBalRes.ok) ? await charBalRes.json() : null;

        // ②.5 旧的反查表补丁已移除：运算一律用规范 ID，显示才过字典。
        (function augmentReverseMaps() {
            const add = (map, table, valFn) => {
                if (typeof map === 'undefined' || !map) return;
                const m = Lang.get(table);
                for (const id in m) {
                    const txt = m[id];
                    if (txt && map[txt] === undefined) map[txt] = valFn(id);
                }
            };
        })();

        // ③ family → source
        const fam2src = {};
        for (const sid in srcDoc) {
            for (const f of (srcDoc[sid] || [])) if (!(f in fam2src)) fam2src[f] = sid;
        }
        fam2src['classic'] = 'season1';

        // ④ 组装（严格按 hero_order 的下标顺序；表外的新英雄追加到末尾）
        const order = orderDoc.order || [];
        const heroes = charsDoc.charactersConfig.heroes || [];
        const byId = {};
        heroes.forEach(h => { byId[h.id] = h; });
        const seen = new Set(order);
        // 固定段以外的英雄：**运行时**按【日期 → 战力(低→高) → 英雄ID】升序追加
        // （配置里只保留固定段 1953，后续序号自动算，不再落盘）
        const restIds = heroes.map(h => h.id).filter(x => !seen.has(x));
        restIds.sort((a, b) => _cmpAutoOrder(byId[a], byId[b]));
        const ids = order.filter(x => byId[x]).concat(restIds);

        // 服装槽位：同父英雄下按发布日期顺序编 1/2…
        const costumeOrd = {};
        heroes.filter(h => h.parentHeroId).sort((a, b) =>
            String(a.canBeReceivedDate || '').localeCompare(String(b.canBeReceivedDate || '')) ||
            a.id.localeCompare(b.id)
        ).forEach(h => {
            const p = h.parentHeroId;
            costumeOrd[p] = (costumeOrd[p] || 0) + 1;
            costumeOrd[h.id] = costumeOrd[p];
        });

        const list = [];
        const familyValues = {};
        // 有服装的本体英雄 id 集合（本体也要显示「服装奖励」选择器）
        const _parentIds = new Set();
        heroes.forEach(h => { if (h.parentHeroId) _parentIds.add(h.parentHeroId); });
        ids.forEach((hid, idx) => {
            const c = byId[hid];
            if (!c) return;
            const st = (skills[hid] && skills[hid][0]) || {};
            const s = computeHeroStats(c);
            const colorId = String(c.element || '').toLowerCase();
            const classId = String(c.classType || '').toLowerCase();
            const speedId = c.manaSpeedId || '';
            const aetherId = c.aetherGift || '';
            // 家族 id 归一化：`zodiac_dragon` / `zodiac_rat` … **一律并入 `zodiac`**
            //（它们本来就是同一个"农历生肖"家族下的生肖变体）
            const famId = (c.family || '').startsWith('zodiac') ? 'zodiac' : (c.family || '');
            const srcId = fam2src[famId] || '';
            const isCostume = !!c.parentHeroId;
            // ── 服装奖励（`data/costume_bonuses.json`）──
            // 只有**服装英雄**（有 parentHeroId）才有；规则取**父英雄**的 `costumeBonusesId`
            //   （与生成器 `passive_desc_gen._costume_rule_of` 同口径）。
            // 表按「每套 stages 阶连续」排布 ⇒ 套数 = len//stages，stages = 3(≤3★) / 4(≥4★)。
            // `costumeListSets` = **该英雄自身的服装顺序**（同父英雄下按发布日期编 1/2/…）——
            //   列表属性用它才能复现"英雄发布当时"的属性（旧数据 638/638 逐字段吻合）；
            //   详情页则用"服装奖励"下拉选的值（默认最多套）。
            const _cbRarity = c.rarity || 5;
            const _cbStages = (_cbRarity >= 4) ? 4 : 3;
            let _cbLevels = null, _cbMax = 0;
            // 取表用的 id：**服装英雄看父英雄**；**本体英雄看自己** —— 
            //   "只要本体存在服装，本体英雄也显示切换服装加成的图标"（`_parentIds` 见上面）。
            if (isCostume || _parentIds.has(hid)) {
                const _owner = isCostume ? (byId[c.parentHeroId] || {}) : c;
                const _rule = costumeBonuses[_owner.costumeBonusesId];
                const _sb = (_rule && Array.isArray(_rule.statBonuses)) ? _rule.statBonuses : null;
                const _bl = (_sb && _cbRarity <= _sb.length) ? ((_sb[_cbRarity - 1] || {}).bonusLevels) : null;
                if (Array.isArray(_bl) && _bl.length) {
                    _cbLevels = _bl;
                    _cbMax = Math.max(1, Math.floor(_bl.length / _cbStages));
                }
            }
            // ⚠ **列表口径只有服装英雄吃服装奖励**（本体不吃）—— 与旧数据一致；
            //   本体英雄的 `_cbLevels` 只给详情页的「服装奖励」选择器用。
            const _cbListSets = (isCostume && _cbLevels) ? Math.min(costumeOrd[hid] || 1, _cbMax) : 0;
            const hero = {
                heroId: hid,
                specialId: c.specialId || '',
                // 服装英雄自带的 specialId 基本没有图标（实测 702 个服装只有 7 个有，且都是通用 `tackle`）
                // ⇒ 技能图标回退到**本体英雄**的 specialId（服装英雄的技能图标用父英雄的）。
                parent_specialId: isCostume ? ((byId[c.parentHeroId] || {}).specialId || '') : '',
                star: c.rarity,
                family: famId,
                parentHeroId: c.parentHeroId || null,
                costume_id: isCostume ? _costumeSlot(hid, costumeOrd[hid] || 1) : 0,
                costumeBonusLevels: _cbLevels,
                costumeStages: _cbStages,
                costumeMaxSets: _cbMax,
                costumeListSets: _cbListSets,
                sourceId: srcId,
                source: Lang.t('source', srcId),
                colorId: colorId, color: Lang.t('color', colorId),
                classId: classId, class: Lang.t('class', classId),
                speedId: speedId, speed: Lang.t('speed', speedId),
                aetherPowerId: aetherId, AetherPower: Lang.t('aether_power', aetherId),
                name: _tPrefix('heroes_name', hid),
                fancy_name: _tPrefix('heroes_name_fancy', hid),
                skill: Lang.t('skill_name', c.specialId || ''),
                'Release date': (c.canBeReceivedDate || '').slice(0, 10),
                releaseDate: c.canBeReceivedDate || '',
                effects: (st.skills && st.skills[0] && st.skills[0].lines) || [],
                passives: (st.passiveSkills || []).map(x => x.text).filter(Boolean),
                passiveSkills: st.passiveSkills || [],
                // 被动筛选的文本池 = **正文 + 标题**（被动搜索也要能搜到标题；
                // 详情页点被动名"一键快速搜索"用的就是这个池子）
                passivesSearchPool: (st.passiveSkills || []).reduce((a, x) => {
                    if (x && x.text) a.push(x.text);
                    if (x && x.title) a.push(x.title);
                    return a;
                }, []),
                familyBonus: st.familyBonus || [],
                // 平衡数据（官方第二表）——**差异档**：只含与常规不同的节；无平衡数据为 null
                _balanced: balancedFieldsFrom(balSkills, hid),
                // 第二表完整定义（若有）：切"平衡属性"时按它算三围/战力，比"差异字段拼基底"更稳
                _balancedDef: (charBal && charBal.heroes && charBal.heroes[hid]) || undefined,
                // 三围基底：切换"平衡属性"时与 `_balanced.stats` 合并后重算（computeHeroStats 只用这 4 个字段）
                _baseStats: {
                    rarity: c.rarity, baseAttack: c.baseAttack,
                    baseDefense: c.baseDefense, baseHealth: c.baseHealth
                },
                skill_types: typesDoc[hid] || {},
                originalIndex: idx,
                // `hidden` = **运行时动态判定**（`isHiddenHero`：2200 年 / trainer|guestip|temp1），
                //   `showHiddenHeroes` 可切回来；`excluded` = **id 关键字硬排除**——任何情况下都不展示。
                hidden: isHiddenHero(c),
                excluded: isExcludedById(hid),
                attack: s.attack, defense: s.defense, health: s.health, power: s.power,
                lb1: s.lb1, lb2: s.lb2
            };
            // 英文名（收藏/分享/图标等沿用；最长前缀匹配，与旧实现一致）
            let en = '';
            const keys = Object.keys(enNames).filter(k => hid.startsWith(k));
            if (keys.length) en = enNames[keys.reduce((a, b) => a.length > b.length ? a : b)];
            hero.english_name = en || hid;
            // 平衡数据：开关初始全关 + 记下"常规版"基线（切换时按节取 `_balanced` / 这里的值）
            hero._balancedOn = {};
            hero._normalSnapshot = {
                effects: hero.effects, passiveSkills: hero.passiveSkills, familyBonus: hero.familyBonus,
                attack: hero.attack, defense: hero.defense, health: hero.health,
                power: hero.power, lb1: hero.lb1, lb2: hero.lb2
            };
            list.push(hero);
            if (!(hero.family in familyValues)) familyValues[hero.family] = Lang.t('family', hero.family);
        });

        state.allHeroes = list;
        state.families_bonus = [];            // 家族加成改由每个英雄的 familyBonus 提供
        state.family_values = familyValues;   // getDisplayName(family/source) 用
        return true;
    } catch (error) {
        console.error("加载或解析数据文件失败:", error);
        const resultsWrapper = document.getElementById('results-wrapper');
        if (resultsWrapper) {
            resultsWrapper.innerHTML = `<p style='color: var(--md-sys-color-error); font-weight: bold;'>错误：加载数据失败。请检查控制台获取详细信息。</p>`;
        }
        const pageLoader = document.getElementById('page-loader-overlay');
        if (pageLoader) pageLoader.classList.add('hidden');
        return false;
    }
}

/**
 * 根据颜色名称获取对应的辉光边框CSS类名。
 * @param {string} colorName - 颜色名称 (如 '红', 'blue')。
 * @returns {string} CSS类名 (如 'red-glow-border')。
 */
// 入参就是**颜色规范 ID**（red/blue/green/yellow/purple）
const getColorGlowClass = (colorId) => {
    return colorId ? `${colorId}-glow-border` : '';
};

/**
 * 根据颜色名称获取对应的十六进制颜色代码。
 * @param {string} colorName - 颜色名称。
 * @returns {string} 十六进制颜色代码。
 */
const getColorHex = (colorName) => {
    const colorMap = {
        'red': '#ff7a4c',
        'blue': '#41d8fe',
        'green': '#70e92f',
        'yellow': '#f2e33a',
        'purple': '#e290ff',
    };
    const key = String(colorName || '').toLowerCase();
    return colorMap[key] ? colorMap[key] : 'inherit';
};

/**
 * 根据英雄颜色返回对应的亮色到标准色的CSS线性渐变背景。
 * @param {string} colorName - 英雄的颜色名称。
 * @returns {string} CSS background 字符串。
 */
function getHeroColorLightGradient(colorName) {
    const colorMap = {
        'red': { light: '#ef8b38', standard: '#660610' },
        'blue': { light: '#83e2f6', standard: '#113159' },
        'green': { light: '#b4e48b', standard: '#175b07' },
        'yellow': { light: '#e6e402', standard: '#725404' },
        'purple': { light: '#c177c3', standard: '#491b4c' }
    };
    const key = String(colorName || '').toLowerCase();
    const colors = colorMap[key];
    return colors ? `linear-gradient(to bottom, ${colors.standard} 0%, ${colors.light} 100%)` : 'none';
}

/**
 * 根据英雄星级、突破和天赋等级生成段位图标的完整HTML。
 * @param {object} hero - 英雄对象。
 * @param {string} lbSetting - 当前的突破设置 ('none', 'lb1', 'lb2')。
 * @param {string} talentSetting - 当前的天赋设置 ('none', 'talent20', 'talent25')。
 * @param {number} nodeCount - 当前已激活的天赋节点数量。
 * @returns {string} 包含所有段位元素的HTML字符串。
 */
function generateRankHtml(hero, lbSetting, talentSetting, nodeCount = 0) {
    if (!hero || !hero.star) return '';

    let ascensionLevels = 0;
    if (hero.star === 1) ascensionLevels = 2;
    else if (hero.star === 2 || hero.star === 3) ascensionLevels = 3;
    else if (hero.star >= 4) ascensionLevels = 4;

    if (ascensionLevels === 0) return '';

    let lbCount = 0;
    if (lbSetting === 'lb1') lbCount = 1;
    else if (lbSetting === 'lb2') lbCount = 2;

    let barsHtml = '';
    for (let i = 0; i < ascensionLevels; i++) {
        const isLimitBreakBar = i < lbCount;
        const barImage = isLimitBreakBar ? 'ascension_bar_limitbreak.webp' : 'ascension_bar.webp';
        barsHtml += `<img src="imgs/other/${barImage}" class="ascension-bar" alt="ascension bar">`;
    }

    let talentNodeHtml = '';
    // 使用传入的实际节点数量 nodeCount
    const talentCount = nodeCount;

    if (talentCount > 0) {
        // 判断使用哪个图标，并显示实际的天赋点数
        const nodeImage = talentCount >= 21 ? 'node_master.webp' : 'node.webp';
        talentNodeHtml = `
            <div class="talent-node-container">
                <img src="imgs/talents/${nodeImage}" class="talent-node-image" alt="talent node">
                <span class="talent-node-text">${talentCount}</span>
            </div>
        `;
    }

    return `<div class="hero-avatar-rank-container">${barsHtml}${talentNodeHtml}</div>`;
}


// 用于保存原始 console 方法的全局对象
const _originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug,
};

// 空函数，用于“静音”console
const _emptyFunc = () => { };

/**
 * 全局切换所有 console 日志记录的开关
 * @param {boolean} enable - true为开启日志, false为关闭日志
 */
function toggleConsoleLogging(enable) {
    if (enable) {
        // 开启日志: 恢复所有原始的 console 方法
        console.log = _originalConsole.log;
        console.warn = _originalConsole.warn;
        console.error = _originalConsole.error;
        console.info = _originalConsole.info;
        console.debug = _originalConsole.debug;
        //console.log("日志记录功能已开启。");
    } else {
        // 关闭日志: 将所有 console 方法替换为空函数
        //console.log("日志记录功能已关闭。");
        console.log = _emptyFunc;
        console.warn = _emptyFunc;
        console.error = _emptyFunc;
        console.info = _emptyFunc;
        console.debug = _emptyFunc;
    }
}

/**
 * 预加载一组指定的静态资源（图片、音频），让浏览器提前缓存它们
 * @param {string[]} assetUrls - 要预加载的资源URL数组
 */
function preloadAssets(assetUrls) {
    if (!Array.isArray(assetUrls)) {
        console.error("preloadAssets: 提供的参数不是一个数组。");
        return;
    }

    assetUrls.forEach(url => {
        try {
            const fileExtension = url.split('.').pop().toLowerCase();

            // 根据文件扩展名判断是图片还是音频
            if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExtension)) {
                const img = new Image();
                img.src = url;
            } else if (['mp3', 'wav', 'ogg'].includes(fileExtension)) {
                const audio = new Audio();
                audio.preload = 'auto'; // 设置为自动预加载
                audio.src = url;
            }
        } catch (e) {
            console.warn(`预加载资源失败: ${url}`, e);
        }
    });
}

/**
 * 将 "YYYY-MM-DD" 格式的日期字符串格式化为用户本地化的日期格式。
 * @param {string} dateString - "YYYY-MM-DD" 格式的日期字符串。
 * @returns {string} 本地化格式的日期字符串，或原始字符串（如果格式无效）。
 */
function formatLocalDate(dateString) {
    // 检查输入是否为有效的 "YYYY-MM-DD" 格式
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString; // 如果格式不符或为空，直接返回原始值
    }

    try {
        // 拆分字符串以避免因时区问题导致的日期偏差
        const parts = dateString.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // 月份在JavaScript中是从0开始的
        const day = parseInt(parts[2], 10);
        const date = new Date(year, month, day);

        // 让浏览器根据用户的系统/浏览器设置自动决定区域格式
        // 传入 undefined 作为第一个参数，会使用运行时的默认locale
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (e) {
        console.error("日期格式化失败:", dateString, e);
        return dateString; // 如果发生错误，返回原始字符串
    }
}
