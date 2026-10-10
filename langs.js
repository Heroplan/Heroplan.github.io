/* langs.js —— 新的语言/数据访问层（Heroplan_v2）
 *
 * 设计口径（用户 2026-10-10 定）：
 *   ① 数据里一律存 **ID**（color/class/speed/aetherGift/family/source/specialId…），
 *      显示时才查 `langs_json/<表>_<码>.json` 翻译；
 *   ② **先排序后翻译** —— 排序用语言无关的 `langs_json/sort_order.json`（ID 顺序），
 *      不再需要 language.js 里 20×speedOrder / 20×colorOrder 那些硬编码数组；
 *   ③ i18n 拆到 `langs_json/i18n_<码>.json`；页面**切换语言时整页重载** ⇒ 只需在启动时 await 一次；
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

    var _cache = {};        // 文件名 -> object（fetch 缓存，键含 .json）
    var _tables = {};       // 表名 -> object（**当前语言**的表，键不含 .json）
    var _i18n = null;       // 当前语言 UI 文案
    var _sortOrder = null;  // 语言无关排序表
    var _lang = null;

    function url(p) { return 'langs_json/' + p; }

    function getJSON(p) {
        if (_cache[p]) return Promise.resolve(_cache[p]);
        return fetch(url(p), { cache: 'no-cache' })
            .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + p); return r.json(); })
            .then(function (j) { _cache[p] = j; return j; });
    }

    /** 载入某语言的全部表 + i18n + 排序表（切换语言时整页重载 ⇒ 只调一次） */
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
            global.Lang.sortOrder = _sortOrder;
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

    /** 语言无关排序键：sort_order.<表> 里的下标（找不到给一个很大的值） */
    function orderIndex(table, id) {
        var arr = (_sortOrder && _sortOrder[table]) || [];
        var i = arr.indexOf(id);
        return i === -1 ? 9999 : i;
    }

    global.Lang = {
        LANGS: LANGS, TABLES: TABLES,
        loadAll: loadAll, t: t, idOf: idOf, i18n: i18n, orderIndex: orderIndex,
        get: function (table) { return _tables[table] || {}; },
        lang: function () { return _lang; }
    };
})(window);
