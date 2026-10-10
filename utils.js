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

// 服装类型名「标识 → 类型键」（`getSkinInfo` 会按语言返回 CN/EN 两套标识，这里都收）
const _COSTUME_TYPE_KEY = {
    'C1': 'c1', 'C2': 'c2',
    '卡通': 'toon', '公仔': 'toon', 'Toon': 'toon',
    '玻璃': 'glass', 'Glass': 'glass',
    '英姿': 'stylish', '有型': 'stylish', 'Stylish': 'stylish'
};

/**
 * 服装类型名 → **当前语言**的名字（`langs_json/costume_type_<码>.json`）。
 * 认不出就原样返回（不臆造）。
 */
function localizeCostumeType(name) {
    const k = _COSTUME_TYPE_KEY[name];
    return (k && typeof Lang !== 'undefined') ? Lang.t('costume_type', k) : name;
}

// 技能类型「当前语言文本 → 简体中文键」的反查表（排序用；原 language.js 的 skillTypeTranslations_* 已弃用）。
// 直接由 langs_json/skill_types_<码>.json 反向构造。
function _skillTypeReverseMap(lang) {
    const m = (typeof Lang !== 'undefined') ? Lang.get('skill_types') : {};
    const out = {};
    for (const cnKey in m) { const v = m[cnKey]; if (v && v !== cnKey) out[v] = cnKey; }
    return out;
}
let nynaeveCnToEnMap = {};
let nynaeveTcToEnMap = {};
/**
 * 根据来源和自定义排序规则，获取英雄的技能标签数组。
 * @param {object} hero - 英雄对象。
 * @param {string} source - 来源 ('heroplan', 'nynaeve', 'bbcamp', 'both')。
 * @returns {string[]} - 排序后的技能标签数组。
 */
function getSkillTagsForHero(hero, source) {
    if (!hero) return [];

    // 根据当前语言获取对应的 Nynaeve 反向查找表
    const nynaeveReverseMap = state.currentLang === 'cn' ? nynaeveCnToEnMap :
        state.currentLang === 'tc' ? nynaeveTcToEnMap : null;

    // 为 Nynaeve 标签定义统一的排序函数
    const sortNynaeveTags = (tags) => {
        tags.sort((a, b) => {
            // 在排序前，将中文标签转换回英文键
            const englishA = nynaeveReverseMap ? (nynaeveReverseMap[a] || a) : a;
            const englishB = nynaeveReverseMap ? (nynaeveReverseMap[b] || b) : b;

            const indexA = nynaeveSkillTypeOrder.indexOf(englishA);
            const indexB = nynaeveSkillTypeOrder.indexOf(englishB);

            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });
        return tags;
    };

    // 为 bbcamp 标签定义统一的排序函数
    const sortBbcampTags = (tags) => {
        const priorityCategories = ["基础技能", "特殊效果", "增益效果", "负面效果"];
        const orderArrays = { "基础技能": skillTagOrder_base, "特殊效果": skillTagOrder_special, "增益效果": skillTagOrder_buff, "负面效果": skillTagOrder_debuff };

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
                    const chineseKeyA = skillTagReverseMap[a] || a;
                    const chineseKeyB = skillTagReverseMap[b] || b;
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

    const cnTags = heroSkillTags(hero);
    const nynaeveTags = hero.skill_types || [];
    const heroplanTags = hero.types || [];

    if (source === 'both') {
        const sortedCnTags = sortBbcampTags([...cnTags]);
        const sortedNynaeveTags = sortNynaeveTags([...nynaeveTags]);
        const sortedHeroplanTags = [...heroplanTags].sort((a, b) => a.localeCompare(b));

        const combinedTags = [...sortedCnTags, ...sortedNynaeveTags, ...sortedHeroplanTags];
        return Array.from(new Set(combinedTags)).filter(Boolean);
    }

    let tags = [];
    switch (source) {
        case 'heroplan':
            tags = [...heroplanTags].sort((a, b) => a.localeCompare(b));
            break;
        case 'nynaeve':
            tags = sortNynaeveTags([...nynaeveTags]);
            break;
        case 'bbcamp':
        default:
            tags = sortBbcampTags([...cnTags]);
            break;
    }

    return tags.filter(Boolean);
}

/**
 * 从多语言混合的英雄名称中提取英文名 (v3 - 详情页权威规则版)
 * @param {object} hero - 英雄对象。
 * @returns {string|null} 提取出的英文名。
 */
function extractEnglishName(hero) {
    if (!hero || !hero.name) return null;

    let heroName = hero.name;

    // --- 步骤 1: 提取详情页 getSkinInfo 函数的逻辑，用于分离出基础名称 ---
    // 这个逻辑会先尝试移除名称末尾的皮肤标识（如 C1, 玻璃, 卡通等）
    const skinPattern = /\s*(?:\[|\()?(C\d+|\S+?)(?:\]|\))?\s*$/;
    const skinMatch = heroName.match(skinPattern);
    let baseName = heroName; // 默认为完整名称

    if (skinMatch && skinMatch[1]) {
        const potentialSkin = skinMatch[1].toLowerCase();
        if (potentialSkin.match(/^c\d+$/) ||
            ['glass', 'toon', '玻璃'].includes(potentialSkin) ||
            potentialSkin.endsWith('卡通') ||
            potentialSkin.endsWith('公仔') ||
            potentialSkin.endsWith('有型')) {
            baseName = heroName.substring(0, heroName.length - skinMatch[0].length).trim();
        }
    }

    // --- 步骤 2: 应用详情页的括号解析规则到处理过的 baseName 上 ---
    // 这是你确认过的“100%准确”的逻辑
    const singleAltLangNamePattern = /^(.*?)\s*\(([^)]+)\)/;
    const singleAltLangMatch = baseName.match(singleAltLangNamePattern);

    if (singleAltLangMatch && singleAltLangMatch[2] && /[a-zA-Z]/.test(singleAltLangMatch[2]) && !/[\u4e00-\u9fa5]/.test(singleAltLangMatch[2])) {
        return singleAltLangMatch[2].trim();
    }

    // 如果上述规则不匹配（例如纯英文名），我们提供一个备用方案
    const multiLangMatch = baseName.match(/^(.*?)\s+([^\s\(]+)\s+\((.*?)\)$/);
    if (multiLangMatch && multiLangMatch[3] && /[a-zA-Z]/.test(multiLangMatch[3])) {
        return multiLangMatch[3].trim();
    }

    // 最后的备用方案，适用于没有括号的纯英文名
    if (!/\(/.test(baseName)) {
        return baseName;
    }

    return null;
}


// 全局变量存储不同类别的语言数据
window.langData = {
    name: {},      // heroes_name_
    fancy_name: {}, // heroes_name_fancy_
    skill: {}  // skill_name_
};

// 加载所有语言数据
async function loadExtraNameData(lang) {
    const [nameRes, fancyRes, skillRes] = await Promise.all([
        fetch(`langs_json/heroes_name_${lang}.json`),
        fetch(`langs_json/heroes_name_fancy_${lang}.json`),
        fetch(`langs_json/skill_name_${lang}.json`)
    ]);
    window.langData.name[lang] = await nameRes.json();
    window.langData.fancy_name[lang] = await fancyRes.json();
    window.langData.skill[lang] = await skillRes.json();
}

// 应用英雄名称 (name)
function applyHeroNames(langCode) {
    const data = window.langData.name[langCode];
    if (!data) return;
    let count = 0;
    state.allHeroes.forEach(hero => {
        if (!hero.heroId) return;
        const keys = Object.keys(data).filter(k => hero.heroId.startsWith(k));
        if (keys.length) {
            const best = keys.reduce((a, b) => a.length > b.length ? a : b);
            hero.name = data[best];
            count++;
        }
    });
    console.log(`更新了 ${count} 个英雄的 name`);
}

// 应用 fancy 名称
function applyFancyNames(langCode) {
    const data = window.langData.fancy_name[langCode];
    if (!data) return;
    let count = 0;
    state.allHeroes.forEach(hero => {
        const key = Object.keys(data).find(k => hero.heroId.startsWith(k));
        if (key) {
            hero.fancy_name = data[key];
            count++;
        }
    });
    console.log(`更新了 ${count} 个英雄的 fancy_name`);
}

// 应用技能名称
function applySkillNames(langCode) {
    const data = window.langData.skill[langCode];
    if (!data) return;
    let count = 0;
    state.allHeroes.forEach(hero => {
        if (hero.skill && data[hero.specialId]) {
            hero.skill = data[hero.specialId];
            count++;
        }
    });
    console.log(`更新了 ${count} 个英雄的技能名称`);
}

/**
 * 应用自定义语言数据到英雄数据
 * @param {string} langCode - 语言代码
 */
function applyCustomLanguageNames(langCode) {
    applyHeroNames(langCode);
    applyFancyNames(langCode);
    applySkillNames(langCode);
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
 * （与旧实现 `getSkinInfo`/`applyHeroNames` 一致；例 `nordic_chained_werewolf_costume_raccoon` → `nordic_chained_werewolf`）。
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

/** 服装槽位（图标/皮肤标识用）：toon=3 glass=4 stylish=5，其余按同父英雄的发布顺序 1/2 */
function _costumeSlot(heroId, ord) {
    // 槽位 = **同父英雄下按发布日期编的序号**（1/2/3…）。
    // ⚠ 不要再按 id 里的 `toon`/`glass`/`stylish` 关键字覆写：`getSkinInfo` / `getCostumeIconName`
    //   还会对「classic 3★」再做一次 `+1` 映射，两处叠加会把 `stylish` 顶到 6
    //   ⇒ 查不到 → 回退成 `C1`（用户 2026-10-10 报的 `dwarven_smasher_costume_stylish`）。
    //   实测：序号法 + 那次 +1 与"按 id 关键字"在 240 个带类型名的服装里 **238 个一致**，
    //   不一致的 2 个（`*_costume_cute` 排在第 1 位）旧站也是按序号出的。
    return ord;
}

/**
 * 英雄 id 命中这些关键字 ⇒ **不进列表**（用户 2026-10-10：排除 `_temp1`）。
 * 与 `data/hero_order.json` 的 `hidden` 名单**分开**：那是可切换的"隐藏"，
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
 * 从服务器加载核心数据。
 *
 * 数据源（全部来自官方配置 + 我们导出的词条，**不再用 data_{cn,en,tc}.json**）：
 *   data/hero_order.json         英雄序号表（收藏位图按此下标）+ hidden 列表
 *   data/characters.json         官方英雄配置（id/rarity/基础三维/element/family/manaSpeedId/classType/aetherGift…）
 *   data/heroes_skills_<码>.json 我们导出的词条（familyBonus / passiveSkills / skills[].lines）
 *   data/heroes_skill_types.json 技能类型标签（简体中文键）
 *   data/source_info.json        source → 家族 关系
 *   langs_json/*_<码>.json       各语言词表 + i18n + sort_order
 * 语言：整页重载 ⇒ 启动时 await 一次即可。
 * @param {string} lang - 当前语言码（cn/tc/en/…）。
 */
async function loadData(lang) {
    // ⚠ 2026-10-10 用户口径：**搜索语言选择已废弃** —— 不论 cookie 如何一律按 `current`
    //   （= 当前界面语言）处理 ⇒ `search_lang` cookie 与选择器同步整块移除。
    const savedLang = 'current';

    try {
        // ① 语言表（i18n + 各词表 + 排序表）
        await Lang.loadAll(lang);
        nynaeveCnToEnMap = _skillTypeReverseMap(lang);

        // ② 数据
        const [orderRes, charsRes, typesRes, srcRes, skillsRes, enNameRes, costumeRes] = await Promise.all([
            fetch(`data/hero_order.json?v=${Date.now()}`),
            fetch(`data/characters.json?v=${Date.now()}`),
            fetch(`data/heroes_skill_types.json?v=${Date.now()}`),
            fetch(`data/source_info.json?v=${Date.now()}`),
            fetch(`data/heroes_skills_${lang}.json?v=${Date.now()}`),
            fetch(`langs_json/heroes_name_en.json?v=${Date.now()}`).catch(() => null),
            fetch(`data/costume_bonuses.json?v=${Date.now()}`).catch(() => null)
        ]);
        const orderDoc = await orderRes.json();
        const charsDoc = await charsRes.json();
        const typesDoc = await typesRes.json();
        const srcDoc = await srcRes.json();
        const skills = await skillsRes.json();
        const enNames = enNameRes ? await enNameRes.json() : {};
        const costumeBonuses = costumeRes ? await costumeRes.json() : {};
        window.langData.name['en'] = enNames;

        // ②.5 兼容既有调用点：data.js 里的 *ReverseMap 是「本地化文本 → 标准英文/ID」，
        //      但只覆盖部分语言（colorReverseMap 84 条、无日文）。新数据存的是 ID ⇒
        //      这里把**当前语言**的显示文本补进反查表 ⇒ 头像辉光 / 来源图标 / 导入导出等旧调用点零改动。
        (function augmentReverseMaps() {
            const add = (map, table, valFn) => {
                if (typeof map === 'undefined' || !map) return;
                const m = Lang.get(table);
                for (const id in m) {
                    const txt = m[id];
                    if (txt && map[txt] === undefined) map[txt] = valFn(id);
                }
            };
            add(typeof colorReverseMap !== 'undefined' ? colorReverseMap : null, 'color', id => id);
            add(typeof classReverseMap !== 'undefined' ? classReverseMap : null, 'class',
                id => id.charAt(0).toUpperCase() + id.slice(1));
            add(typeof aether_powerReverseMap !== 'undefined' ? aether_powerReverseMap : null, 'aether_power', id => id);
            add(typeof sourceReverseMap !== 'undefined' ? sourceReverseMap : null, 'source', id => id);
            // 技能类型标签：skillTagReverseMap 只覆盖简/繁（其它语言缺）⇒ 用当前语言表补上
            if (typeof skillTagReverseMap !== 'undefined' && skillTagReverseMap) {
                const st = Lang.get('skill_types');
                for (const cnKey in st) {
                    const txt = st[cnKey];
                    if (txt && skillTagReverseMap[txt] === undefined) skillTagReverseMap[txt] = cnKey;
                }
            }
        })();

        // ③ family → source
        const fam2src = {};
        for (const sid in srcDoc) {
            for (const f of (srcDoc[sid] || [])) if (!(f in fam2src)) fam2src[f] = sid;
        }
        fam2src['classic'] = 'season1';

        // ④ 组装（严格按 hero_order 的下标顺序；表外的新英雄追加到末尾）
        const order = orderDoc.order || [];
        const hiddenSet = new Set(orderDoc.hidden || []);
        const heroes = charsDoc.charactersConfig.heroes || [];
        const byId = {};
        heroes.forEach(h => { byId[h.id] = h; });
        const seen = new Set(order);
        const ids = order.filter(x => byId[x]).concat(heroes.map(h => h.id).filter(x => !seen.has(x)));

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
        // 有服装的本体英雄 id 集合（用户 2026-10-10：本体也要显示「服装奖励」选择器）
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
            //（用户 2026-10-10：它们本来就是同一个"农历生肖"家族下的生肖变体）
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
            // 取表用的 id：**服装英雄看父英雄**；**本体英雄看自己** —— 用户 2026-10-10：
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
                // ⇒ 技能图标回退到**本体英雄**的 specialId（用户 2026-10-10：服装英雄的技能图标用父英雄的）。
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
                // 被动筛选的文本池 = **正文 + 标题**（用户 2026-10-10：被动搜索也要能搜到标题；
                // 详情页点被动名"一键快速搜索"用的就是这个池子）
                passivesSearchPool: (st.passiveSkills || []).reduce((a, x) => {
                    if (x && x.text) a.push(x.text);
                    if (x && x.title) a.push(x.title);
                    return a;
                }, []),
                familyBonus: st.familyBonus || [],
                skill_types: typesDoc[hid] || {},
                originalIndex: idx,
                // `hidden` = hero_order 的隐藏名单（`showHiddenHeroes` 可切回来）；
                // `excluded` = **id 关键字排除**（`EXCLUDED_ID_KEYWORDS`）—— 任何情况下都不展示。
                hidden: hiddenSet.has(hid),
                excluded: isExcludedById(hid),
                attack: s.attack, defense: s.defense, health: s.health, power: s.power,
                lb1: s.lb1, lb2: s.lb2
            };
            // 英文名（收藏/分享/图标等沿用；最长前缀匹配，与旧实现一致）
            let en = '';
            const keys = Object.keys(enNames).filter(k => hid.startsWith(k));
            if (keys.length) en = enNames[keys.reduce((a, b) => a.length > b.length ? a : b)];
            hero.english_name = en || hid;
            list.push(hero);
            if (!(hero.family in familyValues)) familyValues[hero.family] = Lang.t('family', hero.family);
        });

        state.allHeroes = list;
        state.families_bonus = [];            // 家族加成改由每个英雄的 familyBonus 提供
        state.family_values = familyValues;   // getDisplayName(family/source) 用

        // ⑤ 「额外名称语言」：名字/技能名改用另一语言（数据本身不变）
        if (savedLang === 'current') {
            await loadExtraNameData(lang);
        } else {
            await loadExtraNameData(savedLang);
            applyCustomLanguageNames(savedLang);
        }
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
const getColorGlowClass = (colorName) => {

    let standardColor = null;

    // 使用全局 colorReverseMap
    if (typeof colorReverseMap !== 'undefined' && colorReverseMap !== null) {
        const mapped = colorReverseMap[String(colorName).toLowerCase()];
        if (mapped) {
            // colorReverseMap 的值是首字母大写的英文，如 "Red"，转为小写
            standardColor = mapped.toLowerCase();
        }
    }

    return standardColor ? `${standardColor}-glow-border` : '';
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
    const mapped = colorReverseMap?.[String(colorName).toLowerCase()];
    const key = mapped ? mapped.toLowerCase() : null;
    return key && colorMap[key] ? colorMap[key] : 'inherit';
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
    const mapped = colorReverseMap?.[String(colorName).toLowerCase()];
    const key = mapped ? mapped.toLowerCase() : String(colorName).toLowerCase();
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
