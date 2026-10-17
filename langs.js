/* langs.js —— 新的语言/数据访问层（Heroplan_v2）
 *
 * 设计口径（定）：
 *   ① 数据里一律存 **ID**（color/class/speed/aetherGift/family/source/specialId…），
 *      显示时才查 `langs_json/<表>_<码>.json` 翻译；
 *   ② **先排序后翻译** —— 排序用语言无关的 `langs_json/sort_order.json`（ID 顺序），
 *      不再需要 language.js 里 20×speedOrder / 20×colorOrder 那些硬编码数组；
 *   ③ i18n 拆到 `langs_json/i18n_<码>.json`；切语言时 `loadAll()` 再调一次即可（**无需整页重载**，
 *      见 `ui.js::changeLanguage`；表按文件缓存 ⇒ 切回已加载过的语言是纯内存操作）；
 *   ④ 不再需要任何"回溯表"（base_values_dict_other 那类"文本→文本"映射）。
 *
 * 用法：
 *   await Lang.loadAll(state.currentLang);   // 启动时一次
 *   Lang.t('color', 'red')                   // → "烈火"
 *   Lang.t('skill_name', hero.specialId)
 *   Lang.i18n('nameLabel')                   // 当前语言的 UI 文案
 *   Lang.orderIndex('speed', hero.speedId)   // 排序键（语言无关）
 */
(function (global) {
    'use strict';

    // 预初始化：别处在 `loadAll()` 之前就会写 `i18n[state.currentLang]`（原 language.js 是立即定义的）
    global.i18n = global.i18n || {};

    var LANGS = ['cn', 'tc', 'en', 'ja', 'ko', 'ru', 'ar', 'da', 'nl', 'fi', 'fr', 'de',
                 'id', 'it', 'no', 'pl', 'pt', 'es', 'sv', 'tr'];

    // 单语言表（文件名前缀）
    var TABLES = ['heroes_name', 'heroes_name_fancy', 'skill_name', 'class', 'color', 'speed',
                  'aether_power', 'family_title', 'source', 'family', 'skill_types', 'costume_type',
                  'lottery_title'];

    // ── 外部语言标签 → 站点语言码 ────────────────────────────────────────
    // 用途：`?hl=<标签>` 别名（`hl` 是 Google 的"界面语言"参数，属于事实标准；
    // 见 main.js 的 URL 参数解析）。也用于浏览器 `navigator.language` 之外的通用标签。
    // ⚠ **站点不支持的语言一律返回 `null`**（例如 `he` 希伯来语、`iw` 旧码）——
    //   调用方据此回落到 cookie / 浏览器语言，**不要**臆造一个不存在的语言码。
    var ALIAS = {
        // 中文：按**书写系统**优先（与 index.html 的 hreflang 用 zh-Hans / zh-Hant 一致）
        'zh-hans': 'cn', 'zh-cn': 'cn', 'zh-sg': 'cn', 'zh-my': 'cn',
        'zh-hant': 'tc', 'zh-tw': 'tc', 'zh-hk': 'tc', 'zh-mo': 'tc',
        'in': 'id',                 // 印尼语的旧代码（Google 仍可能发这个）
        'nb': 'no', 'nn': 'no',     // 挪威语的两种书面形式 → 站点统一用 no
        'pt-br': 'pt', 'pt-pt': 'pt',
        'he': null, 'iw': null      // 希伯来语：站点无此语言 ⇒ 明确返回 null
    };

    /**
     * 把外部语言标签归一化成站点语言码；不支持则返回 `null`。
     * `'zh-Hant'` → `'tc'`；`'ja-JP'` → `'ja'`；`'he'` → `null`。
     */
    function normalizeCode(tag) {
        if (!tag) return null;
        var t = String(tag).trim().toLowerCase();
        if (!t) return null;
        if (LANGS.indexOf(t) >= 0) return t;                                  // 直接命中站点码
        if (Object.prototype.hasOwnProperty.call(ALIAS, t)) return ALIAS[t];  // 显式别名（含 null）
        var base = t.split('-')[0];                                           // 只取主语言子标签
        return (base && LANGS.indexOf(base) >= 0) ? base : null;
    }

    var _cache = {};        // 文件名 -> object（fetch 缓存，键含 .json）
    var _tables = {};       // 表名 -> object（**当前语言**的表，键不含 .json）
    var _i18n = null;       // 当前语言 UI 文案
    var _sortOrder = null;  // 语言无关排序表
    var _lang = null;

    // 版本串来自 asset_ver.js 的 window.AV（每个文件的内容哈希，拼法见 utils.js::av）
    // ⇒ 未改动的表命中缓存、改动过的立刻失效；没有登记时 av() 自动退回 Date.now()。
    function url(p) { return av('langs_json/' + p); }

    function getJSON(p) {
        if (_cache[p]) return Promise.resolve(_cache[p]);
        // ⚠ 不再用 `cache: 'no-cache'`：URL 已按内容哈希变化，强制复验只会白白多打一次请求
        return fetch(url(p))
            .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + p); return r.json(); })
            .then(function (j) { _cache[p] = j; return j; });
    }

    /** 载入某语言的全部表 + i18n + 排序表（启动时调一次；**切换语言时再调一次**即可无缝切换） */
    function loadAll(lang) {
        _lang = lang;
        var jobs = TABLES.map(function (t) { return getJSON(t + '_' + lang + '.json').catch(function () { return {}; }); });
        jobs.push(getJSON('i18n_' + lang + '.json').catch(function () { return {}; }));
        jobs.push(getJSON('sort_order.json').catch(function () { return {}; }));
        return Promise.all(jobs).then(function (res) {
            // ⚠ 必须在这里把表按「表名」存下来：`getJSON` 的缓存键是文件名（含 .json），
            //   而 t()/idOf()/get() 用的是表名（不含 .json）—— 直接查 _cache 会永远落空。
            _tables = {};
            TABLES.forEach(function (tb, i) { _tables[tb] = res[i] || {}; });
            _i18n = res[TABLES.length] || {};
            // 函数型 i18n 条目（JSON 存不下）由 i18n_funcs.js 提供，合并进来（见 _tools/gen_i18n_funcs.js）
            var fns = (global.I18N_FUNCS || {})[lang];
            if (fns) for (var k in fns) _i18n[k] = fns[k];
            _sortOrder = res[TABLES.length + 1] || {};
            // 兼容既有调用点：别处都写 `i18n[state.currentLang]`（原 language.js 的全局 const）
            global.i18n = {};
            global.i18n[lang] = _i18n;
            global.Lang.i18nDict = _i18n;
            return true;
        });
    }

    /** 取词：t('color','red') → 当前语言的显示文本；查不到回退到 ID 本身 */
    function t(table, id) {
        if (id === null || id === undefined || id === '') return '';
        var m = _tables[table];
        if (m && m[id] !== undefined) return m[id];
        return String(id);
    }

    /** 反查：本地化文本 → ID（用于筛选器里"当前语言文本"的场景） */
    function idOf(table, text) {
        var m = _tables[table];
        if (!m) return text;
        for (var k in m) if (m[k] === text) return k;
        return text;
    }

    function i18n(key, fallback) {
        if (_i18n && _i18n[key] !== undefined) return _i18n[key];
        return fallback !== undefined ? fallback : key;
    }

    /** 语言无关排序表：sort_order.<表>（完整数组；找不到给空数组） */
    function sortOrder(table) {
        return (_sortOrder && _sortOrder[table]) || [];
    }

    /** 语言无关排序键：sort_order.<表> 里的下标（找不到给 9999） */
    function orderIndex(table, id) {
        var i = sortOrder(table).indexOf(id);
        return i === -1 ? 9999 : i;
    }

    global.Lang = {
        LANGS: LANGS, TABLES: TABLES,
        loadAll: loadAll, t: t, idOf: idOf, i18n: i18n, orderIndex: orderIndex,
        normalizeCode: normalizeCode, sortOrder: sortOrder, orderIndex: orderIndex,
        get: function (table) { return _tables[table] || {}; },
        lang: function () { return _lang; }
    };
})(window);
