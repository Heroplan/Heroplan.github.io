// 收藏存储键
const FAVORITES_KEY = 'favorites_binary';

/**
 * 参与「英雄列表 / 筛选器选项」的英雄。
 * 默认排除**隐藏英雄**（判据见 `utils.js::isHiddenHero`：2200 年 / id 含 trainer|guestip|temp1，运行时动态判定），
 * 隐藏项不展示、不参与排序与筛选。
 * `state.showHiddenHeroes = true` 时全部返回（供后续开关使用）。
 *
 * ⚠ 另有 **`hero.excluded`**（id 命中 `utils.js::EXCLUDED_ID_KEYWORDS`，如 `_temp`）——
 *   那是"任何情况下都不展示"的硬排除，**不受 `showHiddenHeroes` 影响**。
 */
function listHeroes() {
    const base = state.showHiddenHeroes ? state.allHeroes : state.allHeroes.filter(h => !h.hidden);
    return base.filter(h => !h.excluded);
}
const LEGACY_FAVORITES_KEY = 'heroFavorites';

// 内存缓存：避免重复解码
const favoritesCache = {
    loaded: false,
    bitLen: 0,
    bitmap: null // Uint8Array
};

/**
 * 从 localStorage 加载位图到内存缓存（首次调用时执行，并触发旧数据迁移）。
 */
function loadFavoritesBitmap() {
    if (favoritesCache.loaded) return favoritesCache;

    try {
        let binaryStr = localStorage.getItem(FAVORITES_KEY);

        // --- 旧键迁移 ---
        if (binaryStr === null) {
            const legacy = localStorage.getItem(LEGACY_FAVORITES_KEY);
            if (legacy !== null) {
                try {
                    const arr = JSON.parse(legacy);
                    if (Array.isArray(arr)) {
                        const indices = [];
                        arr.forEach(fav => {
                            const hero = resolveHeroByIdentity(fav);
                            if (hero) indices.push(hero.originalIndex);
                        });

                        if (indices.length > 0) {
                            const maxIdx = Math.max(...indices);
                            const bitLen = maxIdx + 1;
                            const bitmap = new Uint8Array(Math.ceil(bitLen / 8));
                            indices.forEach(i => {
                                bitmap[Math.floor(i / 8)] |= (1 << (7 - (i % 8)));
                            });
                            favoritesCache.bitLen = bitLen;
                            favoritesCache.bitmap = bitmap;
                        } else {
                            favoritesCache.bitLen = 0;
                            favoritesCache.bitmap = new Uint8Array(0);
                        }
                        favoritesCache.loaded = true;
                        saveFavoritesBitmap();
                        localStorage.removeItem(LEGACY_FAVORITES_KEY);
                        console.log('收藏已迁移到二进制格式');
                        return favoritesCache;
                    }
                } catch (e) {
                    console.error('迁移收藏失败', e);
                }
            }
            // 全新用户
            favoritesCache.bitLen = 0;
            favoritesCache.bitmap = new Uint8Array(0);
            favoritesCache.loaded = true;
            return favoritesCache;
        }

        // --- 解析二进制数据 ---
        if (binaryStr === '') {
            favoritesCache.bitLen = 0;
            favoritesCache.bitmap = new Uint8Array(0);
        } else {
            const buffer = base64UrlDecode(binaryStr);
            const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

            if (buffer.length < 9) throw new Error('数据长度不足');

            const bitLen = view.getUint32(1, false);
            const bitmapLength = Math.ceil(bitLen / 8);
            const payloadLength = 1 + 4 + bitmapLength;

            const storedCrc = view.getUint32(payloadLength, false);
            const payload = new Uint8Array(buffer.buffer, buffer.byteOffset, payloadLength);
            if (crc32(payload) !== storedCrc) {
                console.warn('收藏位图 CRC 校验失败，按空处理');
                favoritesCache.bitLen = 0;
                favoritesCache.bitmap = new Uint8Array(0);
            } else {
                favoritesCache.bitLen = bitLen;
                favoritesCache.bitmap = new Uint8Array(
                    buffer.buffer, buffer.byteOffset + 5, bitmapLength
                );
            }
        }
    } catch (e) {
        console.error('加载收藏位图失败', e);
        favoritesCache.bitLen = 0;
        favoritesCache.bitmap = new Uint8Array(0);
    }

    favoritesCache.loaded = true;
    return favoritesCache;
}

/**
 * 把内存缓存写回 localStorage。
 */
function saveFavoritesBitmap() {
    if (!favoritesCache.loaded) return;

    const { bitLen, bitmap } = favoritesCache;

    if (bitLen === 0) {
        localStorage.setItem(FAVORITES_KEY, '');
        return;
    }

    const header = new Uint8Array(5);
    header[0] = 1;
    new DataView(header.buffer).setUint32(1, bitLen, false);

    const payload = new Uint8Array(header.length + bitmap.length);
    payload.set(header);
    payload.set(bitmap, header.length);

    const crc = crc32(payload);
    const finalBuffer = new Uint8Array(payload.length + 4);
    finalBuffer.set(payload);
    new DataView(finalBuffer.buffer).setUint32(payload.length, crc, false);

    localStorage.setItem(FAVORITES_KEY, base64UrlEncode(finalBuffer));
}

/**
 * 使缓存失效（导入等外部修改 localStorage 后调用）。
 */
function invalidateFavoritesCache() {
    favoritesCache.loaded = false;
    favoritesCache.bitLen = 0;
    favoritesCache.bitmap = null;
}

/**
 * 本地收藏的**下标集合**：直接读位图下标，不经过「位图→身份键→再解析」的往返。
 */
function favoritesIndexSet() {
    const cache = loadFavoritesBitmap();
    const out = new Set();
    for (let i = 0; i < cache.bitLen; i++) {
        if (cache.bitmap[Math.floor(i / 8)] & (1 << (7 - (i % 8)))) out.add(i);
    }
    return out;
}

/**
 * 把**身份键数组**（如分享链接的 `temporaryFavorites`）一次性解析成下标集合。
 * 反查索引只建一次（`byId` + `byLegacy`）⇒ O(n + m)。
 */
function favoritesIndexOf(identityList) {
    const out = new Set();
    if (!identityList || identityList.length === 0) return out;
    const byId = new Map();
    const byLegacy = new Map();
    for (const h of state.allHeroes) {
        if (!byId.has(h.heroId)) byId.set(h.heroId, h.originalIndex);
        const legacy = `${h.english_name}-${h.costume_id}`;
        if (!byLegacy.has(legacy)) byLegacy.set(legacy, h.originalIndex);
    }
    for (const key of identityList) {
        let idx = byId.get(key);
        if (idx === undefined) idx = byLegacy.get(key);
        if (idx !== undefined) out.add(idx);
    }
    return out;
}

/**
 * 返回收藏的字符串数组（保持旧接口）；元素为**规范身份键**（`heroIdentity`）。
 */
function getFavorites() {
    const cache = loadFavoritesBitmap();
    const favs = [];
    for (let i = 0; i < cache.bitLen; i++) {
        if (cache.bitmap[Math.floor(i / 8)] & (1 << (7 - (i % 8)))) {
            const hero = state.allHeroes.find(h => h.originalIndex === i);
            if (hero) favs.push(heroIdentity(hero));
        }
    }
    return favs;
}

/**
 * 保存收藏（保持旧接口：接收字符串数组）。
 */
function saveFavorites(favoritesArray) {
    if (!favoritesArray || favoritesArray.length === 0) {
        favoritesCache.loaded = true;
        favoritesCache.bitLen = 0;
        favoritesCache.bitmap = new Uint8Array(0);
        localStorage.setItem(FAVORITES_KEY, '');
        return;
    }

    const indices = [];
    favoritesArray.forEach(fav => {
        const hero = resolveHeroByIdentity(fav);
        if (hero) indices.push(hero.originalIndex);
    });

    if (indices.length === 0) {
        favoritesCache.loaded = true;
        favoritesCache.bitLen = 0;
        favoritesCache.bitmap = new Uint8Array(0);
        localStorage.setItem(FAVORITES_KEY, '');
        return;
    }

    const maxIdx = Math.max(...indices);
    const bitLen = maxIdx + 1;
    const bitmap = new Uint8Array(Math.ceil(bitLen / 8));
    indices.forEach(i => {
        bitmap[Math.floor(i / 8)] |= (1 << (7 - (i % 8)));
    });

    favoritesCache.loaded = true;
    favoritesCache.bitLen = bitLen;
    favoritesCache.bitmap = bitmap;
    saveFavoritesBitmap();
}

/**
 * 收藏解锁判定：
 *   发布时间 = 官方配置的 `canBeReceivedDate`（形如 `2026-10-19 07:00:00`，**UTC**），
 *   到点之前**禁止收藏**，到点（当天 UTC 07:00）自动解锁。
 *   —— 数据源：`data/characters.json` 的 `canBeReceivedDate`（`loadData` 会挂到 `hero.releaseDate`）。
 *   兼容旧字段 `Release date`（仅日期、无时间）⇒ 按当天 UTC 00:00 处理。
 *   解析一律按 UTC（`YYYY-MM-DD HH:mm:ss` → `YYYY-MM-DDTHH:mm:ssZ`），避免本地时区把日期挪一天。
 */
function isFavoritable(hero) {
    const raw = hero && (hero.releaseDate || hero['Release date']);
    if (!raw) return true;                       // 无发布日期 ⇒ 视为已发布
    let s = String(raw).trim();
    if (!s) return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s) && !/[Zz]|[+-]\d\d:?\d\d$/.test(s)) {
        s = s.replace(' ', 'T') + 'Z';           // 无时区标记 ⇒ 按 UTC
    }
    const t = Date.parse(s);
    return isNaN(t) ? true : Date.now() >= t;
}

/**
 * 检查一个英雄是否已被收藏（直接查位，不解码整个位图）。
 */
function isFavorite(hero) {
    if (!hero || !hero.english_name) return false;
    if (typeof hero.originalIndex !== 'number') return false;

    const cache = loadFavoritesBitmap();
    const i = hero.originalIndex;
    if (i >= cache.bitLen) return false;
    return (cache.bitmap[Math.floor(i / 8)] & (1 << (7 - (i % 8)))) !== 0;
}

/**
 * 切换一个英雄的收藏状态（只翻转对应位，不重建整个位图）。
 */
function toggleFavorite(hero) {
    if (!hero || !hero.english_name) {
        console.warn("无法收藏没有英文名的英雄:", hero && hero.name);
        return false;
    }
    // 未到发布时间（UTC 07:00）⇒ 禁止收藏
    if (!isFavoritable(hero)) {
        console.warn("该英雄尚未发布，暂不可收藏:", hero.heroId, hero.releaseDate);
        return false;
    }
    if (typeof hero.originalIndex !== 'number') return false;

    const cache = loadFavoritesBitmap();
    const i = hero.originalIndex;

    // 若索引超出当前位图，按需扩展
    if (i >= cache.bitLen) {
        const newBitLen = i + 1;
        const newBitmap = new Uint8Array(Math.ceil(newBitLen / 8));
        if (cache.bitmap && cache.bitmap.length > 0) {
            newBitmap.set(cache.bitmap);
        }
        cache.bitmap = newBitmap;
        cache.bitLen = newBitLen;
    }

    const byteIdx = Math.floor(i / 8);
    const mask = 1 << (7 - (i % 8));
    const wasSet = (cache.bitmap[byteIdx] & mask) !== 0;

    if (wasSet) {
        cache.bitmap[byteIdx] &= ~mask;
    } else {
        cache.bitmap[byteIdx] |= mask;
    }

    saveFavoritesBitmap();
    return !wasSet;
}

/**
 * 填充所有筛选器按钮和选项。
 * 此函数会遍历所有英雄数据，提取出所有唯一的星级、颜色、职业等，并动态创建筛选按钮。
 */
function populateFilters() {
    // 这部分构建映射的逻辑不变，请保留
    listHeroes().forEach(hero => {
        const skillInfo = heroSkillTypes(hero);       // 新数据 {分类:[标签]}；旧数据自动归一
        for (const categoryName in skillInfo) {
            (skillInfo[categoryName] || []).forEach(tag => {
                if (!state.skillTagToCategoryMap[tag]) {
                    state.skillTagToCategoryMap[tag] = categoryName;
                }
            });
        }
    });

    const filtersToConvert = [
        'filterScope', 'star', 'color', 'speed', 'class', 'costume', 'family', 'source', 'aetherpower',
        'skillTag_base', 'skillTag_special', 'skillTag_buff', 'skillTag_debuff'
    ];

    const langDict = i18n[state.currentLang] || {};
    const allFilterKeys = filtersToConvert;

    allFilterKeys.forEach(key => {
        let values;

        // --- 步骤 1: 收集当前语言的原始数据 ---
        if (key === 'filterScope') {
            values = ['all', 'hero', 'skin', 'favorites'];
        } else if (key === 'costume') {
            // 服装规范 ID（c1/c2/toon/glass/stylish）= 图标名 = costume_type 字典键
            values = [...new Set(listHeroes().map(h => getCostumeIconName(h)).filter(Boolean))];
        } else if (key.startsWith('skillTag_')) {
            const dataKeyMap = { skillTag_base: '基础技能', skillTag_special: '特殊效果', skillTag_buff: '增益效果', skillTag_debuff: '负面效果' };
            const targetDataKey = dataKeyMap[key];
            const skillSet = new Set();
            listHeroes().forEach(hero => {
                const skillInfo = heroSkillTypes(hero);
                (skillInfo[targetDataKey] || []).forEach(tag => skillSet.add(tag));
            });
            values = [...skillSet];
        } else {
            // 运算用规范 ID：这 4 类直接收 ID 字段，显示时才用字典翻译
            const dataField = ID_FIELD[key] || (key === 'aetherpower' ? 'AetherPower' : key);
            values = [...new Set(listHeroes().map(h => h[dataField]).filter(v => v != null && v !== '').map(String))];
        }

        // --- 步骤 2: 根据 key 的类型，应用唯一的、正确的排序逻辑 ---
        const locale = { cn: 'zh-CN', tc: 'zh-TW' }[state.currentLang] || 'en-US';
        const sortOptions = state.currentLang === 'tc' ? { usage: 'sort', collation: 'stroke' } : { usage: 'sort' };

        // 搜索语言已废弃 ⇒ 排序一律按当前界面语言
        const lang = state.currentLang;

        if (key.startsWith('skillTag_')) {
            // 排序顺序同样来自 langs_json/sort_order.json（键名 = 筛选器类型）
            values.sort((a, b) => {
                const ia = Lang.orderIndex(key, a);   // 9999 = 未收录
                const ib = Lang.orderIndex(key, b);
                if (ia !== 9999 && ib !== 9999) return ia - ib;
                if (ia !== 9999) return -1;
                if (ib !== 9999) return 1;
                return a.localeCompare(b, locale, sortOptions);
            });
        } else if (key === 'speed' || key === 'color' || key === 'class' || key === 'aetherpower' || key === 'costume') {
            // 「先排序后翻译」：用语言无关的 ID 顺序（langs_json/sort_order.json），
            // 不再依赖 language.js 的 speedOrder_<码> / colorOrder_<码> 数组。
            const _tbl = { speed: 'speed', color: 'color', class: 'class', aetherpower: 'aether_power', costume: 'costume' }[key];
            const _idKey = { speed: 'speedId', color: 'colorId', class: 'classId', aetherpower: 'aetherPowerId' }[key];
            const _ord = {};
            if (_idKey) {
                // 这几类的选项值来自英雄身上的 <key>Id 字段
                listHeroes().forEach(h => {
                    const id = h[_idKey];
                    if (id && !(id in _ord)) _ord[id] = Lang.orderIndex(_tbl, id);
                });
            } else {
                // costume：选项值本身就是规范 ID（c1/c2/toon/glass/stylish）
                values.forEach(v => { if (!(v in _ord)) _ord[v] = Lang.orderIndex(_tbl, v); });
            }
            values.sort((a, b) => {
                const ia = _ord[a], ib = _ord[b];
                return (ia === undefined ? 9999 : ia) - (ib === undefined ? 9999 : ib);
            });
        } else if (key === 'family' || key === 'source') {
            values.sort((a, b) => {
                // 使用 getDisplayName 获取将要显示的文本来进行排序
                const nameA = getDisplayName(a, key);
                const nameB = getDisplayName(b, key);
                return nameA.localeCompare(nameB, locale, sortOptions);
            });
        } else {
            values.sort((a, b) => String(a).localeCompare(String(b), locale, sortOptions));
        }

        state.availableOptions[key] = values;
        state.multiSelectFilters[key] = [];
    });

    // --- 步骤 3: 创建UI按钮 ---
    const container = document.getElementById('standard-filters-container');
    if (!container) return;
    container.innerHTML = '';

    filtersToConvert.forEach(key => {
        const button = document.createElement('button');
        button.id = `btn-filter-${key}`;
        button.className = 'filter-button';
        let title;
        if (key === 'filterScope') {
            title = langDict.filterHeroes;
        } else {
            const labelKey = key.startsWith('skillTag_')
                ? key.replace('skillTag_', 'cnSkill_') + 'Label'
                : (key === 'aetherpower' ? 'aetherPowerLabel' : (key === 'costume' ? 'costumeTypeLabel' : `${key}Label`));
            let titleText = langDict[labelKey] || key;
            if (titleText.endsWith(':')) {
                titleText = titleText.slice(0, -1);
            }
            title = titleText;
        }
        button.addEventListener('click', () => openMultiSelectModal(key, title));
        container.appendChild(button);
        updateFilterButtonUI(key);
    });

    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.className = 'filter-button checkbox-wrapper';
    checkboxWrapper.innerHTML = `<div class="checkbox-container"><input type="checkbox" id="show-event-name-checkbox"><label for="show-event-name-checkbox" class="checkbox-label" data-lang-key="showEventNameLabel">${langDict.showEventNameLabel}</label></div>`;
    container.appendChild(checkboxWrapper);
    const showEventNameCheckbox = document.getElementById('show-event-name-checkbox');
    const cookieValue = getCookie('showEventNameState');
    showEventNameCheckbox.checked = (cookieValue === null) ? true : (cookieValue !== 'false');
    showEventNameCheckbox.addEventListener('change', () => {
        setCookie('showEventNameState', showEventNameCheckbox.checked.toString(), 365);
        applyFiltersAndRender();
    });
    setTimeout(() => {
        initializeNameAutocomplete();
    }, 100);
}

/**
 * 根据筛选器类型和值获取对应的图标路径。
 * @param {string} filterType - 筛选器类型。
 * @param {string} optionValue - 选项值。
 * @returns {string|null} 图标路径。
 */
// 筛选类型 → 官方字典表名 / 图标目录 / 英雄的规范 ID 字段（**选项值一律是规范 ID**）
const ICON_TABLE = { color: 'color', class: 'class', source: 'source', aetherpower: 'aether_power' };
const ICON_DIR = { color: 'colors/', class: 'classes/', aetherpower: 'Aether Power/' };
const ID_FIELD = { speed: 'speedId', color: 'colorId', class: 'classId', source: 'sourceId', aetherpower: 'aetherPowerId' };

function getIconForFilter(filterType, optionValue) {
    if (!optionValue) return null;
    switch (filterType) {
        case 'color':
        case 'class':
        case 'aetherpower':
            // ID 直查：图标文件名就是规范 ID（显示层才过字典）
            if (typeof Lang !== 'undefined' && Lang.get(ICON_TABLE[filterType])[String(optionValue)] !== undefined) {
                return `imgs/${ICON_DIR[filterType]}${String(optionValue).toLowerCase()}.webp`;
            }
            return null;
        case 'family':
            return `imgs/family/${String(optionValue).toLowerCase()}.webp`;
        case 'source':
            const iconFilename = sourceIconMap[String(optionValue)];
            return iconFilename ? `imgs/coins/${iconFilename}` : null;
        case 'costume':
            // 选项值就是服装规范 ID（c1/c2/toon/glass/stylish）= 图标名（小写）
            return `imgs/costume/${String(optionValue).toLowerCase()}.webp`;
        case 'skillTag_base':
        case 'skillTag_special':
        case 'skillTag_buff':
        case 'skillTag_debuff':
            const chineseKey = String(optionValue);   // 标签本来就是 CN 键

            // 2. ▼▼▼▼▼【核心修改】移除文件名中的所有斜杠字符 ▼▼▼▼▼
            const sanitizedFilename = chineseKey.replace(/\//g, '');

            // 3. 使用处理过的安全文件名构建路径
            return `imgs/skill/${sanitizedFilename}.webp`;
        default:
            return null;
    }
}

/**
 * 重置所有筛选条件到初始状态。
 */
function resetAllFilters() {
    if (typeof state.multiSelectFilters !== 'undefined') {
        Object.keys(state.multiSelectFilters).forEach(key => {
            if (key === 'filterScope') state.multiSelectFilters[key] = ['all'];
            else if (key === 'skillTag') state.multiSelectFilters[key] = {};
            else state.multiSelectFilters[key] = [];

            if (key.startsWith('skillTag_')) {
                updateFilterButtonUI(key);
            } else if (typeof updateFilterButtonUI === 'function') {
                updateFilterButtonUI(key);
            }
        });
    }

    const filterInputs = uiElements.filterInputs;
    for (const key in filterInputs) {
        if (state.multiSelectFilters.hasOwnProperty(key)) continue;
        const element = filterInputs[key];
        if (element && element.tagName === 'INPUT') element.value = '';
    }
    state.temporaryFavorites = null;
    state.temporaryDateFilter = null;
    state.temporaryAcademyFilter = false;
    state.temporaryOwnedHeroes = null;
}

/**
 * 打开多选筛选模态框。
 * @param {string} filterType - 筛选器类型。
 * @param {string} title - 模态框标题。
 */
function openMultiSelectModal(filterType, title) {
    const modal = uiElements.multiSelectModal;
    const overlay = uiElements.multiSelectModalOverlay;
    const modalContent = modal.querySelector('#multi-select-modal-content');
    const langDict = i18n[state.currentLang] || {};

    // ▼▼▼▼▼ 【修正】使用 state. 前缀访问全局状态 ▼▼▼▼▼
    const options = state.availableOptions[filterType];
    const currentSelections = new Set([...(state.multiSelectFilters[filterType] || [])]);

    let optionsHTML = options.map(optionValue => {
        const isSelected = currentSelections.has(optionValue);
        const iconSrc = getIconForFilter(filterType, optionValue);
        const iconHTML = iconSrc ? `<img src="${iconSrc}" class="option-icon" alt="" onerror="this.style.display='none'">` : '';

        // --- 核心：选项值是规范 ID，**只有显示时才过字典** ---
        let displayText;
        if (filterType === 'filterScope') {
            displayText = langDict[`filterScope_${optionValue}`] || optionValue;
        } else if (filterType === 'family') {
            displayText = getDisplayName(optionValue, 'family');
        } else if (filterType === 'source') {
            displayText = getDisplayName(optionValue, 'source');
        } else if (filterType === 'costume') {
            displayText = (typeof Lang !== 'undefined') ? Lang.t('costume_type', String(optionValue).toLowerCase()) : optionValue;
        } else if (filterType.startsWith('skillTag_')) {
            displayText = (typeof Lang !== 'undefined') ? Lang.t('skill_types', optionValue) : optionValue;
        } else if (filterType === 'speed') {
            displayText = (typeof Lang !== 'undefined') ? Lang.t('speed', optionValue) : optionValue;
        } else if (ICON_TABLE[filterType]) {
            displayText = (typeof Lang !== 'undefined') ? Lang.t(ICON_TABLE[filterType], optionValue) : optionValue;
        } else {
            displayText = langDict[optionValue] || optionValue;
        }

        const starSuffix = filterType === 'star' ? '⭐' : '';

        // data-value 始终是简体中文，而 <span> 中显示的是翻译后的文本
        return `<div class="multi-select-option ${isSelected ? 'selected' : ''}" data-value="${optionValue}">${iconHTML}<span>${displayText}${starSuffix}</span></div>`;

    }).join('');

    modalContent.innerHTML = `
        <div class="multi-select-header"><h3>${title}</h3><button class="close-btn" id="close-multi-select-modal-top">✖</button></div>
        <div class="multi-select-options-grid">${optionsHTML}</div>
        <div class="multi-select-footer">
            <button class="action-button" id="clear-multi-select">${langDict.clearSelection}</button>
            <button class="action-button" id="close-multi-select-modal-bottom">${langDict.detailsCloseBtn}</button>
        </div>
    `;

    modal.querySelectorAll('.multi-select-option').forEach(optionDiv => {
        optionDiv.addEventListener('click', () => {
            const value = optionDiv.dataset.value;
            if (filterType === 'filterScope') {
                if (state.multiSelectFilters[filterType][0] === value) return;
                state.multiSelectFilters[filterType] = [value];
                modal.querySelectorAll('.multi-select-option.selected').forEach(div => div.classList.remove('selected'));
                optionDiv.classList.add('selected');
            } else {
                const selections = new Set(state.multiSelectFilters[filterType]);
                if (selections.has(value)) selections.delete(value);
                else selections.add(value);
                state.multiSelectFilters[filterType] = Array.from(selections);
                optionDiv.classList.toggle('selected');
            }
            applyFiltersAndRender();
            updateFilterButtonUI(filterType);
        });
    });

    const clearButton = document.getElementById('clear-multi-select');
    if (filterType === 'filterScope') clearButton.style.display = 'none';
    else {
        clearButton.addEventListener('click', () => {
            state.multiSelectFilters[filterType] = [];
            modal.querySelectorAll('.multi-select-option.selected').forEach(div => div.classList.remove('selected'));
            applyFiltersAndRender();
            updateFilterButtonUI(filterType);
        });
    }

    // --- 通用模态框逻辑 ---
    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
    document.body.classList.add('modal-open');
    modalContent.scrollTop = 0;
    document.getElementById('close-multi-select-modal-top').addEventListener('click', () => history.back());
    document.getElementById('close-multi-select-modal-bottom').addEventListener('click', () => history.back());
    history.pushState({ modal: 'multiSelect' }, null);
    state.modalStack.push('multiSelect');
}

/**
 * 解析复杂的文本查询，支持 AND, OR, NOT, (), []。
 * @param {string|string[]} data - 要搜索的文本或文本数组。
 * @param {string} query - 用户的查询字符串。
 * @returns {boolean} 是否匹配。
 */
function matchesComplexQuery(data, query) {
    if (!query) return true;
    if (!data || (Array.isArray(data) && data.length === 0)) return false;
    const lowerCaseQuery = query.toLowerCase();
    const dataAsArray = Array.isArray(data) ?
        data.map(item => String(item || '').toLowerCase()) : [String(data || '').toLowerCase()];

    function evaluate(expr, text) {
        expr = expr.trim();
        if (!expr) return true;

        // 优先级 1：精确匹配。最先处理，防止内容被后续逻辑错误解析。
        if (expr.startsWith('![')) {
            if (expr.endsWith(']')) {
                // 处理 `![完整字符串]`
                return text.trim() !== expr.substring(2, expr.length - 1).trim();
            }
        } else if (expr.startsWith('[')) {
            if (expr.endsWith(']')) {
                // 处理 `[完整字符串]`
                return text.trim() === expr.substring(1, expr.length - 1).trim();
            }
        }

        // 优先级 2：处理分组圆括号 `()`
        if (expr.startsWith('(') && expr.endsWith(')')) {
            let balance = 0,
                validOuter = true;
            for (let i = 1; i < expr.length - 1; i++) {
                if (expr[i] === '(') balance++;
                if (expr[i] === ')') balance--;
                if (balance < 0) {
                    validOuter = false;
                    break;
                }
            }
            if (validOuter && balance === 0) return evaluate(expr.substring(1, expr.length - 1), text);
        }

        // 优先级 3：处理 OR `|`
        let balance = 0;
        for (let i = 0; i < expr.length; i++) {
            if (expr[i] === '(') balance++;
            if (expr[i] === ')') balance--;
            if (expr[i] === '|' && balance === 0) {
                return evaluate(expr.substring(0, i), text) || evaluate(expr.substring(i + 1), text);
            }
        }

        // 优先级 4：处理 AND (空格)
        const andTerms = [];
        let currentTerm = '';
        balance = 0;
        for (let i = 0; i <= expr.length; i++) {
            const char = expr[i];
            if (i === expr.length || (/\s/.test(char) && balance === 0)) {
                if (currentTerm) {
                    andTerms.push(currentTerm);
                    currentTerm = '';
                }
            } else {
                if (char === '(') balance++;
                if (char === ')') balance--;
                currentTerm += char;
            }
        }
        if (currentTerm) andTerms.push(currentTerm);
        if (andTerms.length > 1) return andTerms.every(term => evaluate(term, text));

        // 优先级 5：处理普通 NOT `!` 及默认的包含匹配
        if (expr.startsWith('!')) {
            const term = expr.substring(1).trim();
            // 此处的 ![...] 已在优先级1处理，这里只处理 !term
            return !text.includes(term);
        }

        return text.includes(expr);
    }

    const usePerLineSearch = /[()\[\]]/.test(lowerCaseQuery);
    return usePerLineSearch ?
        dataAsArray.some(line => evaluate(lowerCaseQuery, line)) :
        evaluate(lowerCaseQuery, dataAsArray.join(' '));
}

/**
 * 检查是否有任何筛选器处于激活状态。
 * @returns {boolean}
 */
function areFiltersActive() {
    const filterInputs = uiElements.filterInputs;
    // 检查所有文本和数值输入框
    if ((filterInputs.name && filterInputs.name.value.trim() !== '') ||
        (filterInputs.types && filterInputs.types.value.trim() !== '') ||
        (filterInputs.effects && filterInputs.effects.value.trim() !== '') ||
        (filterInputs.passives && filterInputs.passives.value.trim() !== '') ||
        (filterInputs.power && filterInputs.power.value.trim() !== '') ||
        (filterInputs.attack && filterInputs.attack.value.trim() !== '') ||
        (filterInputs.defense && filterInputs.defense.value.trim() !== '') ||
        (filterInputs.health && filterInputs.health.value.trim() !== '')) {
        return true;
    }

    // 检查所有多选筛选器
    for (const key in state.multiSelectFilters) {
        const selectedValues = state.multiSelectFilters[key];
        if (!selectedValues || selectedValues.length === 0) continue;

        if (key === 'filterScope') {
            if (selectedValues[0] !== 'all') return true;
        } else {
            // 只要任何一个其他筛选器有值，就说明筛选已激活
            return true;
        }
    }

    // 检查临时筛选
    if (state.temporaryDateFilter !== null || state.temporaryFavorites !== null
        || state.temporaryOwnedHeroes !== null) {
        return true;
    }

    return false;
}

/**
 * 检查是否仅有指定的筛选范围被激活，而无任何其他筛选条件。
 * @param {string} scopeName - 要检查的筛选范围名称。
 * @returns {boolean}
 */
function isOnlySpecificScopeFilterActive(scopeName) {
    if (!state.multiSelectFilters.filterScope || state.multiSelectFilters.filterScope[0] !== scopeName) return false;
    const filterInputs = uiElements.filterInputs;
    if ((filterInputs.name && filterInputs.name.value.trim() !== '') ||
        (filterInputs.types && filterInputs.types.value.trim() !== '') ||
        (filterInputs.effects && filterInputs.effects.value.trim() !== '') ||
        (filterInputs.passives && filterInputs.passives.value.trim() !== '') ||
        (filterInputs.power && filterInputs.power.value.trim() !== '') ||
        (filterInputs.attack && filterInputs.attack.value.trim() !== '') ||
        (filterInputs.defense && filterInputs.defense.value.trim() !== '') ||
        (filterInputs.health && filterInputs.health.value.trim() !== '')) {
        return false;
    }
    for (const key in state.multiSelectFilters) {
        if (key === 'filterScope') continue;
        if (state.multiSelectFilters[key] && state.multiSelectFilters[key].length > 0) return false;
    }
    if (state.temporaryDateFilter !== null || state.temporaryFavorites !== null) return false;
    return true;
}

/**
 * 根据英雄、突破和天赋设置计算最终属性。
 * @param {object} hero - 英雄对象。
 * @param {object} settings - 设置对象 { lb, talent, strategy, manaPriority }。
 * @returns {object} 包含最终 power, attack, defense, health 的对象。
 */
function calculateHeroStats(hero, settings) {
    const { lb, talent, strategy, manaPriority } = settings;
    let baseStats = {
        power: hero.power || 0, attack: hero.attack || 0,
        defense: hero.defense || 0, health: hero.health || 0
    };
    if (lb === 'lb1' && hero.lb1) baseStats = { ...hero.lb1 };
    else if (lb === 'lb2' && hero.lb2) baseStats = { ...hero.lb2 };

    // ── 服装奖励──
    // 详情页传 `settings.costume`（"突破与天赋设置"里的「服装奖励」下拉，默认最多套）；
    // **列表不传** ⇒ 用该英雄自身的服装顺序 `hero.costumeListSets`
    //   —— 即"英雄发布当时"的属性（旧数据 638/638 逐字段吻合）。
    const _costumeSets = (settings && settings.costume !== undefined && settings.costume !== null)
        ? settings.costume : (hero.costumeListSets || 0);
    const _cb = (typeof costumeBonusEntry === 'function') ? costumeBonusEntry(hero, _costumeSets) : null;
    if (_cb) {
        baseStats.attack = applyStatPerMil(baseStats.attack, _cb.attackBonusPerMil);
        baseStats.defense = applyStatPerMil(baseStats.defense, _cb.defenseBonusPerMil);
        baseStats.health = applyStatPerMil(baseStats.health, _cb.healthBonusPerMil);
    }

    let finalStats = { attack: baseStats.attack, defense: baseStats.defense, health: baseStats.health };
    if (talent !== 'none' && hero.class && typeof TalentTree !== 'undefined') {
        const talentBonuses = TalentTree.getBonusesForPath(hero.classId, strategy, manaPriority, talent);
        const attackPercentBonus = Math.floor((baseStats.attack || 0) * (talentBonuses.attack_percent / 100));
        finalStats.attack = (baseStats.attack || 0) + talentBonuses.attack_flat + attackPercentBonus;
        const defensePercentBonus = Math.floor((baseStats.defense || 0) * (talentBonuses.defense_percent / 100));
        finalStats.defense = (baseStats.defense || 0) + talentBonuses.defense_flat + defensePercentBonus;
        const healthPercentBonus = Math.floor((baseStats.health || 0) * (talentBonuses.health_percent / 100));
        finalStats.health = (baseStats.health || 0) + talentBonuses.health_flat + healthPercentBonus;
    }
    const STAR_BASE_POWER = { 1: 0, 2: 10, 3: 30, 4: 50, 5: 90 };
    const star_power = STAR_BASE_POWER[hero.star] || 0;
    const stats_raw_power = (baseStats.attack * 0.35) + (baseStats.defense * 0.28) + (baseStats.health * 0.14);
    const stats_final_power = Math.floor(stats_raw_power);
    const skill_power = (8 - 1) * 5;
    let talent_power = 0;
    if (talent === 'talent20') talent_power = 20 * 5;
    else if (talent === 'talent25') talent_power = 25 * 5;
    finalStats.power = star_power + stats_final_power + skill_power + talent_power;
    return finalStats;
}

/**
 * 核心函数：应用所有筛选条件并重新渲染结果
 */
function applyFiltersAndRender() {
    // 1. 确定筛选的英雄数据源
    // 如果在抽奖模拟器中查看奖池，则使用奖池的英雄子集；否则，使用全部英雄。
    const baseHeroes = state.activeHeroSubset || state.allHeroes;

    // 2. 获取所有筛选器的当前值
    const { filterInputs } = uiElements;
    const nameFilter = filterInputs.name ? filterInputs.name.value.trim().toLowerCase() : '';
    const effectsFilter = filterInputs.effects ? filterInputs.effects.value.trim() : '';
    const passivesFilter = filterInputs.passives ? filterInputs.passives.value.trim() : '';
    const skillTypeFilter = filterInputs.types ? filterInputs.types.value.trim() : '';
    const filterScope = (state.multiSelectFilters.filterScope && state.multiSelectFilters.filterScope[0]) || 'all';
    const powerFilter = filterInputs.power ? (Number(filterInputs.power.value) || 0) : 0;
    const attackFilter = filterInputs.attack ? (Number(filterInputs.attack.value) || 0) : 0;
    const defenseFilter = filterInputs.defense ? (Number(filterInputs.defense.value) || 0) : 0;
    const healthFilter = filterInputs.health ? (Number(filterInputs.health.value) || 0) : 0;

    const defaultSettings = {
        lb: filterInputs.defaultLimitBreakSelect.value,
        talent: filterInputs.defaultTalentSelect.value,
        strategy: filterInputs.defaultTalentStrategySelect.value,
        manaPriority: filterInputs.defaultManaPriorityCheckbox.checked
    };

    // 3. 执行筛选
    // 「收藏」范围判据**预计算**成下标集合（否则在回调里逐英雄重建 ⇒ O(n²×m)，曾慢 7~13×）。
    let favoriteIndexSet = null;
    if (filterScope === 'favorites') {
        favoriteIndexSet = state.temporaryFavorites
            ? favoritesIndexOf(state.temporaryFavorites)
            : favoritesIndexSet();
    }
    state.filteredHeroes = baseHeroes.filter(hero => {
        // **硬排除**（id 命中 `EXCLUDED_ID_KEYWORDS`，如 `_temp`）：任何情况下都不展示，
        // 不受 `showHiddenHeroes` / 抽奖模式影响。
        if (hero.excluded) return false;
        // 默认隐藏的英雄（`trainer_*` / `guestip*` / 发布日期 2200 未发布）**不进英雄列表、不参与排序**
        // （判据见 `utils.js::isHiddenHero`，运行时动态判定）。
        // `state.showHiddenHeroes = true` 时展示 —— 供后续"切换展示 2200 英雄"的开关使用。
        // 抽奖模拟器模式除外：那里 trainer 是有意保留的（见下面的既有分支）。
        if (hero.hidden && !state.showHiddenHeroes && !state.lotterySimulatorActive) return false;
        // 如果是抽奖模拟器模式，并且当前英雄是训练师，则无条件保留，不进行任何筛选。
        if (state.lotterySimulatorActive && String(hero.family).toLowerCase() === 'trainer') {
            return true;
        }
        // 范围筛选
        if (filterScope === 'hero' && hero.costume_id !== 0) return false;
        if (filterScope === 'skin' && hero.costume_id === 0) return false;
        // 「打开游戏英雄列表」：只列存档里已拥有的英雄，并排除 1~2 星
        // （存档键与站点 heroId 完全同名 ⇒ 直接 Set.has，零映射）。
        if (state.temporaryOwnedHeroes) {
            if (!state.temporaryOwnedHeroes.has(hero.heroId)) return false;
            if (Number(hero.star) <= 2) return false;
        }
        if (filterScope === 'favorites') {
            if (!favoriteIndexSet || !favoriteIndexSet.has(hero.originalIndex)) return false;
        }

        // 文本筛选
        // ▼▼▼ 名字筛选逻辑：空格作为"且"条件，同时匹配中文名和英文名 ▼▼▼
        if (nameFilter) {
            const searchTerms = nameFilter.split(/\s+/).filter(term => term.length > 0);
            // 名字搜索：同时匹配「当前语言名 / 英文名 / 英雄ID」
            const haystack = (
                (hero.name || '') + ' ' + (hero.english_name || '') + ' ' + (hero.heroId || '')
            ).toLowerCase();

            if (searchTerms.length > 1) {
                // 所有搜索词都必须出现在「名字 + 英文名」的合并串里
                const allTermsMatch = searchTerms.every(term => haystack.includes(term));
                if (!allTermsMatch) return false;
            } else if (searchTerms.length === 1) {
                if (!haystack.includes(searchTerms[0])) return false;
            }
        }
        if (effectsFilter && !matchesComplexQuery(hero.effects, effectsFilter)) return false;
        // 被动：搜「正文 + 标题」（`passivesSearchPool` 由 utils.js 组装；老数据没有则退回正文）
        if (passivesFilter && !matchesComplexQuery(hero.passivesSearchPool || hero.passives, passivesFilter)) return false;
        if (skillTypeFilter) {
            const skillTypesToSearch = getSkillTagsForHero(hero);
            if (!matchesComplexQuery(skillTypesToSearch, skillTypeFilter)) return false;
        }

        // 标准多选筛选器循环
        for (const key in state.multiSelectFilters) {
            if (key === 'filterScope' || key.startsWith('skillTag_')) continue;
            const selectedValues = state.multiSelectFilters[key];
            if (selectedValues.length === 0) continue;
            let heroValue = (key === 'costume') ? getCostumeIconName(hero) : hero[ID_FIELD[key] || key];
            if (!selectedValues.includes(String(heroValue))) return false;
        }

        // 新的技能标签筛选逻辑
        const heroAllSkillTags = new Set(heroSkillTags(hero));
        const skillTagKeys = ['skillTag_base', 'skillTag_special', 'skillTag_buff', 'skillTag_debuff'];
        for (const key of skillTagKeys) {
            const selections = state.multiSelectFilters[key];
            if (selections && selections.length > 0) {
                const hasMatch = selections.some(tag => heroAllSkillTags.has(tag));
                if (!hasMatch) return false;
            }
        }

        // 属性筛选（基于计算后的属性）
        const calculatedStats = calculateHeroStats(hero, defaultSettings);
        if (powerFilter > 0 && calculatedStats.power < powerFilter) return false;
        if (attackFilter > 0 && calculatedStats.attack < attackFilter) return false;
        if (defenseFilter > 0 && calculatedStats.defense < defenseFilter) return false;
        if (healthFilter > 0 && calculatedStats.health < healthFilter) return false;

        // --- 统一处理临时日期和英雄学院筛选 ---
        if (state.temporaryDateFilter || state.temporaryAcademyFilter) {
            const releaseDateStr = hero['Release date'];
            if (!releaseDateStr) return false; // 两种筛选都需要发布日期

            // --- 解析英雄的发布日期 ---
            const heroParts = releaseDateStr.split('-');
            if (heroParts.length !== 3) return false;
            const heroYear = parseInt(heroParts[0], 10);
            const heroMonth = parseInt(heroParts[1], 10) - 1;
            const heroDay = parseInt(heroParts[2], 10);
            const releaseDate = new Date(heroYear, heroMonth, heroDay);
            releaseDate.setHours(0, 0, 0, 0);

            // --- 根据不同的筛选模式执行逻辑 ---
            if (state.temporaryAcademyFilter) {
                if (hero.star !== 5) return false;
                const baseDate = new Date();
                baseDate.setHours(0, 0, 0, 0);
                const diffDays = Math.ceil((baseDate - releaseDate) / (1000 * 60 * 60 * 24));

                const isHero = hero.costume_id === 0;
                const isSkin = hero.costume_id !== 0;

                // 因为范围筛选已经执行过，所以这里只需要判断当前英雄是否满足其对应的日期条件即可
                if (isHero && diffDays < 730) return false; // 英雄不满足条件
                if (isSkin && diffDays < 365) return false; // 皮肤不满足条件

            } else if (state.temporaryDateFilter) {
                // 这是处理“一键满级”和“购买服装”的原有逻辑
                const baseParts = state.temporaryDateFilter.base.split('-');
                if (baseParts.length !== 3) return false;
                const baseYear = parseInt(baseParts[0], 10);
                const baseMonth = parseInt(baseParts[1], 10) - 1;
                const baseDay = parseInt(baseParts[2], 10);
                const baseDate = new Date(baseYear, baseMonth, baseDay);
                baseDate.setHours(0, 0, 0, 0);

                const diffDays = Math.ceil((baseDate - releaseDate) / (1000 * 60 * 60 * 24));
                if (diffDays < state.temporaryDateFilter.days) return false;
            }
        }

        return true;
    });

    // 从已筛选的结果中，再次过滤掉那些被标记为“仅限精选”的特殊英雄
    state.filteredHeroes = state.filteredHeroes.filter(hero => !hero.isFeaturedOnly);

    // 4. 为筛选出的英雄计算并附加用于显示的属性
    state.filteredHeroes.forEach(hero => {
        hero.displayStats = calculateHeroStats(hero, defaultSettings);
    });

    // ▼▼▼ 在排序开始前，创建一个精选英雄ID的集合，用于快速查找 ▼▼▼
    const featuredHeroIds = new Set();
    if (state.lotterySimulatorActive) {
        (state.customFeaturedHeroes || [])
            .filter(Boolean) // 过滤掉 null 或 undefined
            .forEach(hero => featuredHeroIds.add(hero.heroId));
    }

    // 5. 执行排序
    state.filteredHeroes.sort((a, b) => {
        // ▼▼▼ 置顶逻辑 ▼▼▼
        // 仅当抽奖模拟器激活时，才执行精选英雄置顶规则
        if (state.lotterySimulatorActive) {
            const poolConfig = state.currentSummonData;

            // --- 规则1: 已被设置为精选的英雄，永远排在最顶部 ---
            const aIsFeatured = featuredHeroIds.has(a.heroId);
            const bIsFeatured = featuredHeroIds.has(b.heroId);
            if (aIsFeatured && !bIsFeatured) return -1;
            if (!aIsFeatured && bIsFeatured) return 1;

            // --- 规则2 (新增): 如果配置了 entitiesToChooseFrom，则“可选”的英雄排第二 ---
            // 这个规则只在两个英雄都“未被精选”时生效
            if (poolConfig && poolConfig.entitiesToChooseFrom && poolConfig.entitiesToChooseFrom.length > 0) {
                const aIsEligible = poolConfig.entitiesToChooseFrom.includes(a.heroId);
                const bIsEligible = poolConfig.entitiesToChooseFrom.includes(b.heroId);

                // 如果 a 可选而 b 不可选，a 排在前面
                if (aIsEligible && !bIsEligible) return -1;
                // 如果 b 可选而 a 不可选，b 排在前面
                if (!aIsEligible && bIsEligible) return 1;
            }
        }
        // ▲▲▲ 逻辑结束 ▲▲▲

        // 如果两个都是精选，或者两个都不是（或模拟器未激活），则执行原有的排序逻辑
        const key = state.currentSort.key;
        const direction = state.currentSort.direction === 'asc' ? 1 : -1;

        let valA, valB;

        // 为不同类型的排序键获取正确的值
        if (['power', 'attack', 'defense', 'health'].includes(key)) {
            valA = a.displayStats[key];
            valB = b.displayStats[key];
        } else if (key === 'Release date') {
            valA = new Date(a[key] || '1970-01-01'); // 为没有日期的英雄提供一个很早的默认值
            valB = new Date(b[key] || '1970-01-01');
        } else {
            valA = a[key];
            valB = b[key];
        }

        let comparison = 0;

        // 执行比较
        if (key === 'speed') {
            // 先排序后翻译：按语言无关的 ID 顺序（sort_order.json）
            comparison = Lang.orderIndex('speed', Lang.idOf('speed', String(valA)))
                       - Lang.orderIndex('speed', Lang.idOf('speed', String(valB)));
        } else if (typeof valA === 'number' || valA instanceof Date) {
            comparison = (Number(valA) || 0) - (Number(valB) || 0);
        } else {
            valA = String(valA || '');
            valB = String(valB || '');
            const locale = { cn: 'zh-CN', tc: 'zh-TW', en: 'en-US' }[state.currentLang];
            comparison = valA.localeCompare(valB, locale, state.currentLang === 'tc' ? { collation: 'stroke' } : {});
        }

        // 应用排序方向
        comparison *= direction;

        // 如果主要排序键相同，则使用战力作为次要排序
        if (comparison === 0 && key !== 'power') {
            return (b.displayStats.power || 0) - (a.displayStats.power || 0);
        }

        return comparison;
    });

    // 6. 渲染最终结果
    renderTable(state.filteredHeroes);
}

/**
 * 初始化名字搜索的候选提示功能
 */
function initializeNameAutocomplete() {
    const nameInput = document.getElementById('name-input');
    const autocompleteList = document.getElementById('name-autocomplete-list');
    const clearButton = document.getElementById('clear-input'); // 获取清除按钮
    // ⚠ **搜索语言选择已废弃** —— 不论 cookie 如何，一律按 `current`
    //   （= 当前界面语言）处理 ⇒ 选择器元素与监听逻辑一并移除。

    if (!nameInput || !autocompleteList) return;

    let currentFocus = -1;
    let currentSuggestions = [];
    let isComposing = false;

    // 清除按钮点击事件
    if (clearButton) {
        clearButton.addEventListener('click', function () {
            nameInput.value = '';
            nameInput.focus();
            closeAutocompleteList();
            applyFiltersAndRender(); // 重新应用筛选（显示所有英雄）
        });
    }

    // 输入法事件处理
    nameInput.addEventListener('compositionstart', function () {
        isComposing = true;
    });

    nameInput.addEventListener('compositionend', function () {
        isComposing = false;
        // 输入法结束后立即更新候选列表
        const value = this.value;
        if (value.length > 0) {
            updateAutocompleteSuggestions(value);
        }
    });

    // 输入事件处理
    nameInput.addEventListener('input', function (e) {
        if (isComposing) return;

        const value = this.value;
        currentFocus = -1;

        if (value.length < 1) {
            closeAutocompleteList();
            return;
        }

        updateAutocompleteSuggestions(value);
    });

    // 键盘导航
    nameInput.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.code === 'Space' || e.key === 'Backspace' || e.code === 'Backspace') {
            // 延迟处理，确保输入法已完成转换
            setTimeout(() => {
                const value = this.value;
                if (value.length > 0) {
                    updateAutocompleteSuggestions(value);
                } else {
                    closeAutocompleteList();
                }
            }, 500);
            return;
        }

        if (!autocompleteList.classList.contains('hidden')) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                currentFocus = (currentFocus + 1) % currentSuggestions.length;
                updateSelectedItem();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                currentFocus = (currentFocus - 1 + currentSuggestions.length) % currentSuggestions.length;
                updateSelectedItem();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (currentFocus > -1) {
                    selectAutocompleteItem(currentFocus);
                } else {
                    applyFiltersAndRender();
                }
            } else if (e.key === 'Escape') {
                closeAutocompleteList();
            }
        }
    });

    // 点击外部关闭候选列表
    document.addEventListener('click', function (e) {
        if (!autocompleteList.contains(e.target) && e.target !== nameInput) {
            closeAutocompleteList();
        }
    });

    // 更新候选建议
    function updateAutocompleteSuggestions(searchTerm) {
        // 搜索语言已废弃 ⇒ 一律用当前界面语言
        currentSuggestions = getHeroNameSuggestions(searchTerm, 'current');
        showAutocompleteSuggestions(currentSuggestions, searchTerm);
    }

    // 更新选中项样式
    function updateSelectedItem() {
        const items = autocompleteList.querySelectorAll('.autocomplete-item');
        items.forEach((item, index) => {
            item.classList.toggle('selected', index === currentFocus);
        });

        if (currentFocus > -1 && items[currentFocus]) {
            items[currentFocus].scrollIntoView({ block: 'nearest' });
        }
    }

    // 选择候选项
    function selectAutocompleteItem(index) {
        if (currentSuggestions[index]) {
            const selected = currentSuggestions[index];
            nameInput.value = selected.fillValue || selected.name;
            closeAutocompleteList();
            applyFiltersAndRender();
        }
    }

    // 显示候选建议（添加英雄头像）
    function showAutocompleteSuggestions(suggestions, searchTerm) {
        const autocompleteList = document.getElementById('name-autocomplete-list');
        const langDict = i18n[state.currentLang] || {};

        if (suggestions.length === 0) {
            autocompleteList.innerHTML = `<div class="autocomplete-empty">${langDict.noMatchingResults || '无匹配结果'}</div>`;
            autocompleteList.classList.remove('hidden');
            return;
        }

        autocompleteList.innerHTML = '';
        suggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            const displayName = suggestion.name;
            const colorClass = suggestion.color ? 'hero-' + suggestion.color : '';
            const heroId = suggestion.heroId;

            // 获取头像路径
            const avatarPath = heroId ? `imgs/hero_icon/${heroId}.webp` : null;

            item.className = `autocomplete-item ${colorClass}`;

            // 构建包含头像的HTML
            let itemHTML = '';

            if (avatarPath) {
                itemHTML += `<img src="${avatarPath}" alt="${displayName}" class="autocomplete-avatar" onerror="this.style.display='none'">`;
            }

            itemHTML += `<div class="autocomplete-text">${highlightText(displayName, searchTerm)}</div>`;

            item.innerHTML = itemHTML;

            item.addEventListener('click', () => {
                nameInput.value = suggestion.fillValue || suggestion.name;
                closeAutocompleteList();
                applyFiltersAndRender();
            });
            autocompleteList.appendChild(item);
        });

        autocompleteList.classList.remove('hidden');
    }

    // 高亮匹配文本（支持任意位置匹配）
    function highlightText(text, searchTerm) {
        if (!text || !searchTerm || searchTerm.length === 0) return text;

        const textLower = text.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        const matchIndex = textLower.indexOf(searchLower);

        if (matchIndex === -1) return text; // 没有匹配

        // 高亮匹配的部分
        const beforeMatch = text.substring(0, matchIndex);
        const matchText = text.substring(matchIndex, matchIndex + searchTerm.length);
        const afterMatch = text.substring(matchIndex + searchTerm.length);

        return `${beforeMatch}<span class="autocomplete-highlight">${matchText}</span>${afterMatch}`;
    }

    // 转义正则表达式特殊字符
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // 关闭候选列表
    function closeAutocompleteList() {
        autocompleteList.classList.add('hidden');
        currentFocus = -1;
    }
}

/**
 * 获取英雄名字候选建议（支持任意位置匹配）
 * @param {string} searchTerm - 用户输入的搜索词
 * @param {string} searchLang - 当前选择的搜索语言 ('current', 'ja', 'tc' 等)
 */
function getHeroNameSuggestions(searchTerm, searchLang) {
    // 确保有可搜索的数据
    if (!state.filteredHeroes || state.filteredHeroes.length === 0) {
        return [];
    }

    const searchLower = searchTerm.toLowerCase().trim();
    if (searchLower.length === 0) return [];

    const suggestions = [];
    const seenIds = new Set();

    // 元素后缀清理（与详情页 data-filter-value 一致）
    const ignorableElementSuffixes = ['dark', 'holy', 'ice', 'nature', 'fire'];
    const elementSuffixRegex = new RegExp(`\\s+(${ignorableElementSuffixes.join('|')})$`, 'i');

    state.filteredHeroes.forEach(hero => {
        // 1. 确定要用来搜索/显示的名字
        let nameToSearch = hero.name;
        let displayName = hero.name;

        if (searchLang !== 'current' && window.langData?.name?.[searchLang] && hero.heroId) {
            // 最长前缀匹配（与 getSkinInfo 保持一致）
            const langDict = window.langData.name[searchLang];
            const matchingKeys = Object.keys(langDict).filter(k => hero.heroId.startsWith(k));
            if (matchingKeys.length > 0) {
                const bestMatch = matchingKeys.reduce((a, b) =>
                    a.length > b.length ? a : b
                );
                nameToSearch = langDict[bestMatch];
                displayName = langDict[bestMatch];
            }
        }

        if (!nameToSearch) return;

        // ▼▼▼ 同时拿「当前语言名 / 英文名 / 英雄ID」做匹配▼▼▼
        const nameLower = nameToSearch.toLowerCase();
        const englishLower = (hero.english_name || '').toLowerCase();
        const idLower = (hero.heroId || '').toLowerCase();

        const idxName = nameLower.indexOf(searchLower);
        const idxEn = englishLower.indexOf(searchLower);
        const idxId = idLower.indexOf(searchLower);

        let matchIndex = -1;
        if (idxName !== -1) matchIndex = idxName;              // 当前语言名命中，位置原样
        else if (idxEn !== -1) matchIndex = 1000 + idxEn;      // 英文名命中，加偏移让其排后
        else if (idxId !== -1) matchIndex = 2000 + idxId;      // 英雄ID命中，再排后

        if (matchIndex === -1) return;
        // ▲▲▲

        const uniqueKey = hero.heroId + '_' + hero.costume_id;
        if (seenIds.has(uniqueKey)) return;
        seenIds.add(uniqueKey);

        // 计算 fillValue（与详情页 data-filter-value 一致）
        const skinInfo = getSkinInfo(hero);
        let fillValue = (skinInfo.baseName || hero.name || '').trim();

        // 兜底：如果还带 "(Kalo)" 这种括号，且主体是 CJK，就截掉括号部分
        if (/\([^)]*\)\s*$/.test(fillValue) &&
            /[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/.test(fillValue)) {
            fillValue = fillValue.replace(/\s*\([^)]*\)\s*$/, '').trim();
        }

        // 去元素后缀
        if (elementSuffixRegex.test(fillValue)) {
            fillValue = fillValue.replace(elementSuffixRegex, '').trim();
        }

        suggestions.push({
            name: displayName,
            english_name: hero.english_name,
            fillValue: fillValue,
            heroId: hero.heroId,
            color: hero.colorId ? String(hero.colorId).toLowerCase() : '',
            matchIndex: matchIndex
        });
    });

    // 改进排序逻辑
    const sortedSuggestions = suggestions.sort((a, b) => {
        // 1. 完全匹配的排在前面
        const aExactMatch = a.name.toLowerCase() === searchLower;
        const bExactMatch = b.name.toLowerCase() === searchLower;

        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;

        // 2. 匹配位置靠前的排在前面
        if (a.matchIndex !== b.matchIndex) return a.matchIndex - b.matchIndex;

        // 3. 匹配词长度更长的排在前面
        const aLen = a.name.length;
        const bLen = b.name.length;
        if (aLen !== bLen) return aLen - bLen;

        // 4. 最后按字母顺序排序
        return a.name.localeCompare(b.name);
    });

    return sortedSuggestions.slice(0, 99);
}