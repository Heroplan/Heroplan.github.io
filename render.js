// render.js: 负责将数据渲染到页面上，主要是英雄列表和详情模态框。



// ⚠ 旧的 `getSkinInfo(hero)` 已删除：它的两个返回值都是**重复推导** ——
//   · `baseName`：用 `window.langData.name[码]` 做最长前缀匹配 ⇒ 与 `hero.name`
//     （`loadData`/`reloadLanguageData` 里 `_tPrefix('heroes_name', heroId)`）**逐条相同**
//     （实测 20 语言 × 2121 英雄零不一致）；
//   · `skinIdentifier`：硬编码 `classicMap`，**只覆盖 cn/tc**，其余 18 语言回落英文
//     （如 `ja` 出 "Toon" 而非 "アニメ風"）⇒ 改为查 `costume_type_<码>.json` 字典
//     （`Lang.t('costume_type', getCostumeIconName(hero))`），顺带修掉该本地化缺陷。

/**
 * 根据皮肤标识符获取对应的图标文件名。
 * @param {string} skinIdentifier - 皮肤标识符 (e.g., 'C1', 'Toon')。
 * @returns {string|null} 图标文件名或null。
 */
function getCostumeIconName(hero) {
    if (!hero || hero.costume_id === 0) return '';
    let costumeId = hero.costume_id;
    if (hero.family === 'classic') {
        if (hero.rarity === 3 && costumeId > 1) {
            costumeId = costumeId + 1;
        }
    }

    if (hero.family != 'classic') {
        if (costumeId === 2) {
            costumeId = 3;
        }
    }
    state.currentLang
    const classicMap = {
        1: 'c1',
        2: 'c2',
        3: 'toon',
        4: 'glass',
        5: 'stylish'
    };
    return classicMap[costumeId] || 'c1';
}

/**
 * 获取带服装图标的、格式化后的英雄名称HTML。
 * @param {object} hero - 英雄对象。
 * @returns {string} HTML字符串。
 */
function getFormattedHeroNameHTML(hero) {
    if (!hero) return '';
    let content = hero.name || '';
    const iconName = getCostumeIconName(hero);
    if (iconName) {
        // 服装类型标签走 `costume_type_<码>.json` 字典（全 20 语言齐全）。
        const skinLabel = (typeof Lang !== 'undefined') ? Lang.t('costume_type', iconName) : iconName;
        content = content + `<img loading="lazy" src="imgs/costume/${iconName}.webp" decoding="async" class="costume-icon" alt="${iconName} costume" title="${skinLabel}"/>`;
    }
    return content;
}

/**
 * 「平衡数据」切换（官方第二表）——**按节独立切换**。
 *
 * 数据口径：`hero._balanced` 是**差异档**解析来的（见 `utils.js::balancedFieldsFrom`），
 *   **键存在 = 该节与常规不同 = 该节要显示按钮**；`hero._normalSnapshot` 存常规版用于切回。
 * ⚠ `passiveSkills` 是对象数组、`effects` 是字符串数组，两者**分别**切换、互不牵连。
 */
const BALANCED_SECTIONS = ['effects', 'passiveSkills', 'familyBonus', 'stats'];
// 属性节的字段（切换三围时要整体换掉，战力 power 与 lb1/lb2 一并重算）
const BALANCED_STAT_KEYS = ['attack', 'defense', 'health', 'power', 'lb1', 'lb2'];

/** 记录"常规版"基线（必须在字段还是常规值时调用）。 */
function ensureBalancedSnapshot(hero) {
    if (!hero) return;
    const snap = { effects: hero.effects, passiveSkills: hero.passiveSkills, familyBonus: hero.familyBonus };
    BALANCED_STAT_KEYS.forEach(k => { snap[k] = hero[k]; });
    hero._normalSnapshot = snap;
}

/**
 * 按平衡三围重算属性。优先用 `hero._balancedDef`（`characters_balanced.json` 的第二表**完整定义**）；
 * 没有该档时退回"常规基底 + 差异字段合并"（`computeHeroStats` 只用 rarity/baseAttack/baseDefense/baseHealth）。
 */
function applyBalancedStats(hero) {
    if (typeof computeHeroStats !== 'function') return;
    const def = hero._balancedDef
        || (hero._balanced && hero._balanced.stats && hero._baseStats
            ? Object.assign({}, hero._baseStats, hero._balanced.stats) : null);
    if (!def) return;
    const s = computeHeroStats(def);
    hero.attack = s.attack; hero.defense = s.defense; hero.health = s.health; hero.power = s.power;
    hero.lb1 = s.lb1; hero.lb2 = s.lb2;
}

/** 恢复常规属性（从基线快照）。 */
function restoreNormalStats(hero) {
    const snap = hero._normalSnapshot;
    if (!snap) return;
    BALANCED_STAT_KEYS.forEach(k => { if (snap[k] !== undefined) hero[k] = snap[k]; });
}

/**
 * 重算列表/详情页展示用的 `displayStats`（改了三围后必须重算，否则显示的还是旧值）。
 * ⚠ `filters.js::applyFiltersAndRender` 里的 `defaultSettings` 是**函数内局部变量**取不到；
 *   这里的口径是**逐字段等价**：从筛选面板的"默认"选择器现场读同样的值。
 */
function refreshBalancedDisplayStats(hero) {
    const fi = uiElements && uiElements.filterInputs;
    if (typeof calculateHeroStats !== 'function' || !fi || !fi.defaultLimitBreakSelect) return;
    hero.displayStats = calculateHeroStats(hero, {
        lb: fi.defaultLimitBreakSelect.value,
        talent: fi.defaultTalentSelect.value,
        strategy: fi.defaultTalentStrategySelect.value,
        manaPriority: fi.defaultManaPriorityCheckbox.checked
    });
}

/** 按各节开关把 hero 字段指向平衡版 / 常规版。 */
function applyBalancedSections(hero) {
    const b = hero && hero._balanced;
    if (!b) return;
    const on = hero._balancedOn || (hero._balancedOn = {});
    const snap = hero._normalSnapshot;
    if (!snap) return;
    ['effects', 'passiveSkills', 'familyBonus'].forEach(k => {
        hero[k] = (on[k] && (k in b)) ? b[k] : snap[k];
    });
    if ('stats' in b && on.stats) applyBalancedStats(hero);
    else restoreNormalStats(hero);
    refreshBalancedDisplayStats(hero);
}

/**
 * 切换**某一节**的平衡数据（再点恢复）。只影响该节，其它节不动。
 * @param {object} hero
 * @param {'effects'|'passiveSkills'|'familyBonus'} section
 */
function toggleBalancedData(hero, section) {
    const b = hero && hero._balanced;
    if (!b || !(section in b)) return;
    if (!hero._normalSnapshot) ensureBalancedSnapshot(hero);
    hero._balancedOn = hero._balancedOn || {};
    hero._balancedOn[section] = !hero._balancedOn[section];
    applyBalancedSections(hero);
    // ⚠ 动态数值(`[#Dynamic]`→`<span class="dynamic-value">`)是按 `hero.effects` **解析**、且以
    //   `hero.attack` 为基准算系数的 ⇒ 换技能文本**或换三围**都必须重算，否则数值还是旧的。
    if (typeof parseAndStoreDoTInfo === 'function') parseAndStoreDoTInfo(hero);
    if (typeof renderDetailsInModal === 'function') renderDetailsInModal(hero);
}

/**
 * 平衡档的 `stats` 里是否含**三围**字段（baseAttack/baseDefense/baseHealth）。
 * ⚠ 只改魔力速度/元素/稀有度等的英雄，三围算出来是一样的 ⇒ 属性区不给按钮（点了没可见变化）。
 */
function hasBalancedBaseStats(hero) {
    // ① 差异档里直接带三围字段
    const b = hero && hero._balanced && hero._balanced.stats;
    if (b && ('baseAttack' in b || 'baseDefense' in b || 'baseHealth' in b)) return true;
    // ② 有第二表完整定义时，逐字段比对（覆盖"只改三围、技能文本没变"的英雄）
    const d = hero && hero._balancedDef, n = hero && hero._baseStats;
    if (d && n) {
        return d.baseAttack !== n.baseAttack || d.baseDefense !== n.baseDefense
            || d.baseHealth !== n.baseHealth;
    }
    return false;
}

/** 某节标题旁的「切换平衡数据」按钮 HTML；该节无平衡数据则返回空串。 */
function balancedToggleHTML(hero, section) {
    const b = hero && hero._balanced;
    if (!b || !(section in b)) return '';
    if (section === 'stats' && !hasBalancedBaseStats(hero)) return '';
    const on = !!(hero._balancedOn && hero._balancedOn[section]);
    const d = (typeof i18n !== 'undefined') ? (i18n[state.currentLang] || {}) : {};
    const label = on ? (d.balancedRestore || 'Restore Default') : (d.balancedToggle || 'Balanced Data');
    return ' <span class="balanced-toggle reset-tag" id="toggle-balanced-btn-' + section
        + '" data-section="' + section + '" title="' + label + '">' + label + '</span>';
}

// ── 分块渲染（改善 INP / LCP）──────────────────────────────────────────
// 一次性 `innerHTML` 塞进 2000+ 行会形成超长任务：既推迟首屏内容绘制（LCP），
// 又让主线程长时间无法响应交互（INP）。改为：先同步画出首屏若干行，
// 其余行在浏览器空闲时续渲 —— 每批都很短，主线程能及时让出。
var _tableRenderGen = 0;        // 渲染代号：防止上一次未完成的续渲继续往新结果里追加
const TABLE_ROW_CHUNK = 60;     // 每批渲染的行数（约一屏多一点）

function scheduleChunk(fn) {
    if (typeof requestIdleCallback === 'function') requestIdleCallback(fn, { timeout: 200 });
    else setTimeout(fn, 0);
}

/**
 * 渲染主列表的英雄表格。
 * @param {object[]} heroes - 要渲染的英雄对象数组。
 */
function renderTable(heroes) {
    const heroTable = uiElements.heroTable;
    if (!heroTable) return;

    updateResultsHeader(); // 首先更新结果头部信息

    const langDict = i18n[state.currentLang];
    const heroesToProcess = heroes.filter(h => h.english_name);
    const favoritedCount = heroesToProcess.filter(isFavorite).length;
    const shouldPredictFavoriteAll = heroesToProcess.length > 0 && favoritedCount < heroesToProcess.length;

    let favHeaderIcon = (state.teamSimulatorActive || state.lotterySimulatorActive) ? '⬆️' : (shouldPredictFavoriteAll ? '★' : '☆');

    // 定义表头
    // ⚠ 尾冒号只能**按需**去：`filter.charactersearch.*` 那 5 个标签（族系/元素/家族/法力速度/稀有度）
    //   用的是官方检索词条，**本身不带冒号** ⇒ 无条件 `.slice(0,-1)` 会把最后一个真字符砍掉
    //   （「稀有度」变「稀有」）。`filters.js` / `ui.js` 那两处早就是按需去的。
    const noColon = s => String(s == null ? '' : s).replace(/:\s*$/, '');
    const headers = {
        fav: favHeaderIcon, image: langDict.avatarLabel, name: noColon(langDict.nameLabel),
        element: noColon(langDict.elementLabel), rarity: noColon(langDict.rarityLabel),
        class: noColon(langDict.classLabel), speed: noColon(langDict.speedLabel),
        power: langDict.minPower, attack: langDict.minAttack,
        defense: langDict.minDefense, health: langDict.minHealth,
        types: noColon(langDict.skillTypeLabel)
    };
    const colKeys = Object.keys(headers);
    const sortableKeys = ['name', 'element', 'rarity', 'class', 'speed', 'power', 'attack', 'defense', 'health'];

    // 渲染表头
    let thead = heroTable.querySelector('thead');
    if (!thead) thead = heroTable.appendChild(document.createElement('thead'));

    thead.innerHTML = '<tr>' + colKeys.map(key => {
        const isSortable = sortableKeys.includes(key);
        let sortIndicator = '';
        if (isSortable && state.currentSort.key === key) {
            sortIndicator = state.currentSort.direction === 'asc' ? '▲' : '▼';
        }
        let headerText = headers[key];

        if (key === 'fav') {
            if (state.teamSimulatorActive || state.lotterySimulatorActive) return `<th class="col-fav"></th>`; // 模拟器模式下为空
            const favHeaderClass = shouldPredictFavoriteAll ? 'favorited' : '';
            headerText = shouldPredictFavoriteAll ? '★' : '☆';
            return `<th class="col-fav favorite-all-header ${favHeaderClass}" title="${langDict.favHeaderTitle}">${headerText}</th>`;
        }
        // 移动端稀有度列窄、列名又长 ⇒ 用 star.webp 代替文字（CSS 断点切换，桌面仍是文字）
        const headerInner = key === 'rarity'
            ? `<span class="th-label">${headerText}</span><img loading="lazy" src="imgs/other/star.webp" decoding="async" class="th-star-icon" alt="${headerText}">`
            : headerText;
        return `<th class="col-${key} ${isSortable ? 'sortable' : ''}" data-sort-key="${key}">${headerInner}<span class="sort-indicator">${sortIndicator}</span></th>`;
    }).join('') + '</tr>';

    // 渲染表格内容
    let tbody = heroTable.querySelector('tbody');
    if (!tbody) tbody = heroTable.appendChild(document.createElement('tbody'));

    if (heroes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${colKeys.length}" class="empty-results-message">${langDict.noResults}</td></tr>`;
        return;
    }

    const rows = heroes.map((hero, rowIdx) => {
        const isHeroFavorite = isFavorite(hero);
        const cellsHTML = colKeys.map(key => {
            let content = '';
            const displayStats = hero.displayStats || {};

            // 根据列键名格式化内容
            if (['power', 'attack', 'defense', 'health'].includes(key)) {
                const icons = { power: '💪', attack: '⚔️', defense: '🛡️', health: '❤️' };
                content = `${icons[key]} ${displayStats[key] || 0}`;
            } else if (key === 'rarity') {
                content = `${hero[key] || ''}⭐`;
            } else if (key === 'types') {
                // 技能标签列：渲染成图标
                const skillTags = getSkillTagsForHero(hero);

                // 处理不同类型的返回值
                let tagsArray = [];
                if (Array.isArray(skillTags)) {
                    tagsArray = skillTags;
                } else if (typeof skillTags === 'string') {
                    tagsArray = skillTags.split(',').map(tag => tag.trim());
                } else if (hero[key]) {
                    // 直接从 hero[key] 获取数据
                    const typesData = hero[key];
                    if (Array.isArray(typesData)) {
                        tagsArray = typesData;
                    } else if (typeof typesData === 'string') {
                        tagsArray = typesData.split(',').map(tag => tag.trim());
                    }
                }

                // 过滤空值
                tagsArray = tagsArray.filter(tag => tag);

                if (tagsArray.length === 0) {
                    return `<td class="col-types"></td>`;
                }

                let iconsHtml = '';
                tagsArray.forEach(tag => {
                    const chineseKey = tag;   // 标签本来就是 CN 键

                    // 2. 移除文件名中的斜杠等特殊字符
                    const sanitizedFilename = chineseKey.replace(/\//g, '');

                    // 3. 悬浮提示用当前语言文本（`skill_types_<码>.json`）
                    const tagLabel = (typeof Lang !== 'undefined') ? Lang.t('skill_types', chineseKey) : tag;

                    // 4. 构建单个图标HTML
                    iconsHtml += `<img loading="lazy" src="imgs/skill/${sanitizedFilename}.webp" decoding="async" 
                      class="skill-icon" 
                      alt="${tagLabel}" 
                      title="${tagLabel}" />`;
                });

                // 4. 返回包含多个图标的单元格
                return `<td class="col-types">${iconsHtml}</td>`;
            } else if (key === 'name') {
                // 名字直接用字典值。旧站在这里做「元素后缀 / 服装后缀」清洗，但现在的名字
                // 全部来自 `langs_json/heroes_name_<码>.json`，**本身就不带这些后缀**
                // （实测 20 语言 × 全部条目零命中）⇒ 整段清洗逻辑已移除。
                const displayName = hero.name || '';

                // 非英文界面时，**仅列表**在名字后附英文名，便于跨语言识别；
                // 详情页不加（见 renderDetailsInModal 的 nameBlockHTML）。英文界面下两者相同 ⇒ 自动不重复。
                // ⚠ 判据就是「英文名 ≠ 显示名」，**不要**改成「界面语言 ≠ en 就一律附」：fi/de/pl 的官方名
                //   有 1208/1205/1129 条（共 1384）本来就是英文，那些行按本判据不附括号是**预期行为**
                //   （用户 2026-10-20 试过后明确要求保持"不一样才显示"；改成按语言会让 fi 出现 `Niki (Niki)`）。
                //   副作用认知：Mimic 的 42 条在每种语言都已译 ⇒ 看起来"只有 Mimic 带括号"。
                const _enSuffix = (hero.english_name && hero.english_name !== displayName)
                    ? `<span class="hero-en-name">(${hero.english_name})</span>` : '';
                content = `${displayName}${_enSuffix}`;
            } else if (key === 'class' && hero[key]) {
                const classIcon = String(hero.classId || hero[key]).toLowerCase();
                content = `<img loading="lazy" src="imgs/classes/${classIcon}.webp" decoding="async" class="class-icon" alt="${hero[key]}"/>${hero[key]}`;
            } else if (key === 'element' && hero[key]) {
                const colorIcon = String(hero.elementId || hero[key]).toLowerCase();
                return `<td class="col-element"><img loading="lazy" src="imgs/element/${colorIcon}.webp" decoding="async" class="color-icon" alt="${hero[key]}" title="${hero[key]}"/></td>`;
            } else if (key === 'fav') {
                let icon;
                let cssClass = '';

                if (state.teamSimulatorActive || state.lotterySimulatorActive) {
                    icon = '⬆️';
                    if (state.lotterySimulatorActive) {
                        // 检查英雄是否已被添加
                        let isDisabled = false;

                        // 规则1: 英雄不是5星则禁用
                        if (hero.rarity !== 5) {
                            isDisabled = true;
                        }

                        // 规则2: 如果尚未被禁用，再检查是否已被添加
                        if (!isDisabled && state.customFeaturedHeroes) {
                            isDisabled = state.customFeaturedHeroes.some(fh => fh && fh.heroId === hero.heroId);
                        }

                        // 规则3: 如果尚未被禁用，再检查是否在允许列表中
                        const poolConfig = state.currentSummonData;
                        if (!isDisabled && poolConfig && poolConfig.entitiesToChooseFrom && poolConfig.entitiesToChooseFrom.length > 0) {
                            if (!poolConfig.entitiesToChooseFrom.includes(hero.heroId)) {
                                isDisabled = true;
                            }
                        }

                        // 最终根据 isDisabled 的结果来决定是否添加 'disabled' 类
                        if (isDisabled) {
                            cssClass = 'disabled';
                        }
                    }
                } else {
                    const isHeroFavorite = isFavorite(hero);
                    icon = isHeroFavorite ? '★' : '☆';
                    cssClass = isHeroFavorite ? 'favorited' : '';
                }
                return `<td class="col-fav"><span class="favorite-toggle-icon ${cssClass}" data-hero-id="${hero.originalIndex}">${icon}</span></td>`;
            } else if (key === 'image') {
                const gradientBg = getHeroColorLightGradient(hero.elementId);
                let imageSrc; // 先声明变量

                // ▼▼▼ 为训练师英雄设置特殊头像路径 ▼▼▼
                if (String(hero.family).toLowerCase() === 'trainer') {
                    // 如果是训练师，则强制使用 hero.image 属性中我们预设的路径
                    imageSrc = hero.image;
                } else {
                    // 对于所有其他英雄，保留原始逻辑
                    imageSrc = hero.heroId ? `imgs/hero_icon/${hero.heroId}.webp` : getLocalImagePath(hero.image);
                }
                const heroColorClass = getColorGlowClass(hero.elementId);

                // --- 检查英雄是否有皮肤并生成图标HTML ---
                let costumeIconHtml = '';
                const iconName = getCostumeIconName(hero);
                if (iconName) {
                    // 使用一个新的、专门用于头像的CSS类
                    costumeIconHtml = `<img loading="lazy" src="imgs/costume/${iconName}.webp" decoding="async" class="table-avatar-costume-icon" alt="${iconName} costume" title=""/>`;
                }

                return `<td class="col-image">
                            <div class="hero-avatar-container ${heroColorClass}">
                                <div class="hero-avatar-background" style="background: ${gradientBg};"></div>
                                <img src="${imageSrc}" class="hero-avatar-image" alt="${hero.name}" loading="${rowIdx < TABLE_ROW_CHUNK ? 'eager' : 'lazy'}" decoding="async"${rowIdx < TABLE_ROW_CHUNK ? ' fetchpriority="high"' : ''} onerror="this.src='imgs/not_found.webp'">
                                ${costumeIconHtml}
                            </div>
                        </td>`;
            } else {
                content = hero[key] || '';
            }

            if (key === 'family' && content) content = getDisplayName(content, 'family');
            if (Array.isArray(content) && key !== 'types') content = content.join(', ');

            return `<td class="col-${key}">${content}</td>`;
        }).join('');
        return `<tr class="table-row" data-hero-id="${hero.originalIndex}">${cellsHTML}</tr>`;
    });

    // ── 分块渲染：首屏若干行先同步画出（加快 LCP），其余在空闲时续渲（缩短长任务 ⇒ 改善 INP）──
    const gen = ++_tableRenderGen;
    tbody.innerHTML = rows.slice(0, TABLE_ROW_CHUNK).join('');
    adjustStickyHeaders();
    scrollToTableTop();

    if (rows.length > TABLE_ROW_CHUNK) {
        let i = TABLE_ROW_CHUNK;
        const step = () => {
            if (gen !== _tableRenderGen) return;   // 已有更新的渲染 ⇒ 放弃本次续渲
            const end = Math.min(i + TABLE_ROW_CHUNK, rows.length);
            tbody.insertAdjacentHTML('beforeend', rows.slice(i, end).join(''));
            i = end;
            if (i < rows.length) scheduleChunk(step);
            else adjustStickyHeaders();
        };
        scheduleChunk(step);
    }
}

/**
 * 根据用户的最新规则，从技能描述中生成一个通用搜索词条。
 * 规则：移除所有符号和数值，用单个空格代替，并清理多余的空格。
 * @param {string} text - 原始技能描述文本。
 * @returns {string} - 处理后的通用搜索词条。
 */
function generateGeneralSearchTerm(text) {
    if (!text) return '';
    // 【核心】使用 \p{L} 和 u 标志来正确处理所有非字母字符。
    // \p{L} -> 匹配任何语言的字母 (包括汉字)。
    // [^\p{L}] -> 匹配任何【非】字母的字符 (因此包括数字、所有中英文标点、所有符号)。
    // + -> 匹配一个或多个连续的非字母字符。
    // g -> 全局匹配。
    // u -> 必须添加，用来开启对 \p{L} 这种Unicode属性的支持。
    const withSpaces = text.replace(/[^\p{L}]+/gu, ' ');

    // 去除字符串首尾可能产生的多余空格。
    return withSpaces.trim();
}

/**
 * 根据英雄当前的攻击力，更新模态框中所有动态伤害的数值。
 *
 * 只认渲染侧打的 `<span class="dynamic-value">`（由 `[#Dynamic]` 标记转换而来，见 `_renderOneCore`）。
 * 对齐方式 = **文档顺序**：`parseAndStoreDoTInfo` 按 `hero.effects` 顺序扫标记，
 * `renderListAsHTML` 也按同样顺序吐 span ⇒ 第 k 个 span ↔ 第 k 个标记
 * （⚠ 不能用"词条下标 = `<li>` 下标"：以 `[*]` 开头的词条行会并进上一条 `<li>`，下标会错位）。
 * @param {object} hero - 英雄对象。
 * @param {number} currentAttack - 英雄当前计算后的攻击力。
 */
function updateDynamicDoTDisplay(hero, currentAttack) {
    if (!hero.dynamicDoTEffects || hero.dynamicDoTEffects.length === 0 || !currentAttack) return;

    // 记下本次用的攻击力：翻译工具栏等**重渲染 effects 列表**的地方要用它再刷一遍
    hero._lastDynamicAttack = currentAttack;

    // 只取「特殊技能」那一段的列表（被动/家族奖励段也有 .skill-list，不能用宽松选择器）
    const skillList = document.querySelector('#modal-skill-effects-section .skill-list');
    if (!skillList) return;

    const spans = skillList.querySelectorAll('.dynamic-value');
    hero.dynamicDoTEffects.forEach((dotInfo, k) => {
        const span = spans[k];
        if (!span) return;
        // 数值高亮会再套一层 <span style="color:…"> ⇒ 改写**最内层**，免得把颜色 span 一起抹掉
        const target = span.querySelector('span') || span;
        // **按游戏口径重算**（生成器 `dot()` 的公式）：`int(攻击力 × ‰ / 1000) × 回合`。
        // 导出值 v0 是在**参考攻击力** A0（= L80 × 服装奖励"最多套"）下算出来的
        // ⇒ 等效「‰×回合」可直接反推 `K = v0 × 1000 / A0`（在 A0 处严格成立），
        //   于是 `int(攻击力 × K / 1000)` 就是 `int(攻击力 × v0 / A0)`。
        // 取不到 v0/A0 时退回"系数 × 攻击力"的近似式（不会更差）。
        const v0 = dotInfo.originalDamage, A0 = dotInfo.refAttack;
        target.textContent = (A0 && v0)
            ? Math.floor(currentAttack * v0 / A0)
            : Math.round(dotInfo.coefficient * currentAttack);
    });
}

// --- 关键词高亮逻辑 ---

/**
 * 关键字词表来自 `langs_json/highlight_<码>.json`（`_tools/gen_highlight_terms.py`
 * 从游戏本地化表生成），组名 → 渲染标记。
 */
const HIGHLIGHT_GROUP_MARKUP = {
    elementblue: '[##elementblue]',
    elementgreen: '[##elementgreen]',
    elementpurple: '[##elementpurple]',
    elementred: '[##elementred]',
    elementyellow: '[##elementyellow]',
    special: '[#!]',
};

// 无词间空格、按子串匹配的文字系统（汉字/假名）；韩文靠词尾助词成词，多字词同样按子串匹配，
// 单字韩文（불/물/독）仍按整词匹配，否则会在 불가능 这类词里误命中。
const HIGHLIGHT_CJK_RE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
const HIGHLIGHT_HANGUL_RE = /\p{Script=Hangul}/u;

let _highlightTools = { data: null, regex: null, markup: null, pairs: null };

/** 词条查表键：`İ`.toLowerCase() 会留下组合点 U+0307，正则 `i` 不能折叠它 ⇒ 统一剥掉。 */
function highlightKey(str) {
    // NBSP（U+00A0）在官方文案里出现得很频繁（es 尤其多），归一成普通空格才能命中词表
    return str.toLowerCase().replace(/\u0307/g, '').replace(/\u00a0/g, ' ');
}

/**
 * 转义字符串中的正则表达式特殊字符。
 * @param {string} str 要转义的字符串。
 * @returns {string} 转义后的字符串。
 */
function escapeRegExp(str) {
    // $& 表示整个匹配到的字符串
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 把一组关键词编译成「长词优先」的正则源码。
 * 拉丁/西里尔/阿拉伯等**按词精确匹配**（`Ice` 不命中 `device`、`Лед` 不命中 `следующий`）；
 * CJK 与多字韩文按子串匹配（词尾助词、无空格分词），单字韩文按整词匹配。
 */
function buildHighlightPattern(words) {
    return words
        .sort((a, b) => b.length - a.length)
        .map(kw => {
            // 词条里的普通空格放宽为任意空白：官方文案常用 NBSP（U+00A0），否则西语等短语永远命中不了
            const esc = escapeRegExp(kw).replace(/ /g, '\\s');
            const bySubstring = HIGHLIGHT_CJK_RE.test(kw)
                || (HIGHLIGHT_HANGUL_RE.test(kw) && [...kw].length > 1);
            return bySubstring
                ? esc
                // 数字也算词边界，否则 `auf 1` 会命中 `auf 150%`、`إلى 1` 会命中 `إلى 1800`
                : `(?<![\\p{L}\\p{N}])(?:${esc})(?![\\p{L}\\p{N}])`;
        })
        .join('|');
}

/**
 * 取当前语言的词表并预编译正则（按词条长度降序，长词优先）。
 * `pairs` 是句子级共现对：同一句里所有 slot 都出现时，才高亮这些 slot 的词形。
 * @returns {{regex: RegExp|null, markup: Map<string,string>|null, pairs: Array|null}}
 */
function getHighlightingTools() {
    const data = (typeof Lang !== 'undefined' && typeof Lang.get === 'function')
        ? Lang.get('highlight')
        : null;
    if (!data || typeof data !== 'object') return { regex: null, markup: null, pairs: null };
    if (_highlightTools.data === data) return _highlightTools;

    const markup = new Map();
    const variants = new Set();
    for (const group of Object.keys(HIGHLIGHT_GROUP_MARKUP)) {
        const words = Array.isArray(data[group]) ? data[group] : [];
        for (const word of words) {
            if (typeof word !== 'string') continue;
            const kw = word.trim();
            if (!kw) continue;
            const key = highlightKey(kw);
            if (!markup.has(key)) markup.set(key, HIGHLIGHT_GROUP_MARKUP[group]);
            variants.add(kw);
        }
    }

    const pairs = [];
    if (Array.isArray(data.pairs)) {
        for (const pair of data.pairs) {
            const open = pair && HIGHLIGHT_GROUP_MARKUP[pair.group];
            if (!open || !Array.isArray(pair.slots) || pair.slots.length === 0) continue;
            const slots = [];
            for (const slotWords of pair.slots) {
                const words = (Array.isArray(slotWords) ? slotWords : [slotWords])
                    .filter(w => typeof w === 'string' && w.trim())
                    .map(w => w.trim());
                if (words.length === 0) { slots.length = 0; break; }
                slots.push({
                    regex: new RegExp(buildHighlightPattern(words), 'giu'),
                    markup: new Map(words.map(w => [highlightKey(w), open])),
                });
            }
            if (slots.length === pair.slots.length) pairs.push({ slots });
        }
    }

    if (markup.size === 0 && pairs.length === 0) {
        _highlightTools = { data, regex: null, markup: null, pairs: null };
        return _highlightTools;
    }

    _highlightTools = {
        data,
        regex: variants.size > 0 ? new RegExp(buildHighlightPattern([...variants]), 'giu') : null,
        markup,
        pairs,
    };
    return _highlightTools;
}

/**
 * 句子级共现高亮：只有同一句里所有 slot 都命中时，才给这些 slot 着色。
 * 句界取中文句末标点/分号/换行（技能描述按行分条，换行必须算句界）。
 */
function applyPairHighlighting(text, pairs) {
    if (!pairs || pairs.length === 0) return text;
    const parts = text.split(/([。！？!?；;\n])/);
    for (let i = 0; i < parts.length; i += 2) {
        const sentence = parts[i];
        if (!sentence) continue;
        for (const pair of pairs) {
            let allHit = true;
            for (const slot of pair.slots) {
                slot.regex.lastIndex = 0;
                if (!slot.regex.test(sentence)) { allHit = false; break; }
            }
            if (!allHit) continue;
            let out = sentence;
            for (const slot of pair.slots) {
                slot.regex.lastIndex = 0;
                out = out.replace(slot.regex, (match) => {
                    const open = slot.markup.get(highlightKey(match));
                    return open ? `${open}${match}[#]` : match;
                });
            }
            parts[i] = out;
        }
    }
    return parts.join('');
}

/**
 * 对文本字符串应用关键词高亮
 * @param {string} text - 原始文本 (例如，技能描述)。
 * @param {string} lang - 当前语言 ('en', 'zh-CN', 'zh-TW' 等)。
 * @param {string} filterType - 'effects', 'passives', 'familyBonus', 或 null。
 * @returns {string} - 添加了高亮标签的文本。
 */
function applyKeywordHighlighting(text, lang, filterType, noParen) {
    if (!text || typeof text !== 'string') return text;

    let textToProcess = text;
    let highlightedPrefix = '';

    // --- 如果 filterType 是 'effects' 或 'passives'，则进行特殊预处理 ---
    if ((filterType === 'effects' || filterType === 'passives' || filterType === 'familyBonus')) {

        const lengthLimit = (lang && lang.startsWith('en')) ? 75 : 30;
        const hasColon = (text.endsWith(':') || text.endsWith('：')) && text.length < lengthLimit;

        // --- 组合规则：同时满足 hasColon 且是 passives 或 familyBonus 的特殊情况 ---
        if (hasColon && (filterType === 'passives' || filterType === 'familyBonus')) {

            // 1. 找到第一个冒号，分离出标题
            const colonIndex = text.indexOf(':');
            const wideColonIndex = text.indexOf('：');
            let finalColonIndex = -1;

            if (colonIndex > -1 && wideColonIndex > -1) {
                finalColonIndex = Math.min(colonIndex, wideColonIndex);
            } else {
                finalColonIndex = colonIndex > -1 ? colonIndex : wideColonIndex;
            }

            if (finalColonIndex > -1) {
                const partToHighlight = text.substring(0, finalColonIndex + 1);
                const restOfText = text.substring(finalColonIndex + 1);

                // 2. [内层高亮] 先对标题应用 orange 高亮
                const passiveHighlightedTitle = `[##elementorange]${partToHighlight}[#]`;

                // 3. [外层高亮] 再将拼接后的完整文本用 [#!] 包裹
                highlightedPrefix = `[#!]${passiveHighlightedTitle}${restOfText}[#]`;

                // 4. 停止后续所有处理
                textToProcess = '';
            } else {
                // 这是一个理论上的边缘情况，如果找不到冒号，则按普通 hasColon 处理
                highlightedPrefix = `[#!]${text}[#]`;
                textToProcess = '';
            }
        }
        // --- 单独规则：只满足 hasColon (通常是 effects) ---
        else if (hasColon) {
            highlightedPrefix = `[##elementorange]${text}[#]`;
            textToProcess = '';
        }
        // ★★★ 专属规则：只针对 effects，处理注释用的括号内容 ★★★
        //   `noParen=true`：调用方（`renderListAsHTML`）已经在**整条**范围内处理了最外层括号
        //   ⇒ 这里绝不能再按"单行"去认括号，否则内层括号会被误当成注释。
        else if (filterType === 'effects' && !noParen) {
            let textToModify = text.trim();
            // 新增规则：如果以).或）。结尾，先移除最后的句点
            if (textToModify.endsWith(').') || textToModify.endsWith('）。')) {
                textToModify = textToModify.slice(0, -1); // 移除最后的句点
            }
            let modified = false;

            // 1. 条件检查：只处理以括号（或括号+句号）结尾的字符串
            if (textToModify.match(/[）)](?:\.|。)?$/)) {
                let parenLevel = 0;
                let matchStartIndex = -1;

                // 2. 从后向前遍历字符串，寻找配对的开括号
                for (let i = textToModify.length - 1; i >= 0; i--) {
                    const char = textToModify[i];
                    if (char === ')' || char === '）') parenLevel++;
                    else if (char === '(' || char === '（') parenLevel--;

                    if (parenLevel === 0) {
                        matchStartIndex = i;
                        break;
                    }
                }

                // 3. 如果成功找到了配对的括号
                if (matchStartIndex > -1) {
                    const precedingText = text.substring(0, matchStartIndex);
                    const openParen = text[matchStartIndex];
                    const remainingBlock = text.substring(matchStartIndex + 1);

                    const lastChar = remainingBlock.slice(-1);
                    let closeParen = '';
                    let content = '';
                    let trailingPeriod = '';

                    if (lastChar === '.' || lastChar === '。') {
                        trailingPeriod = lastChar;
                        closeParen = remainingBlock.slice(-2, -1);
                        content = remainingBlock.slice(0, -2);
                    } else {
                        closeParen = lastChar;
                        content = remainingBlock.slice(0, -1);
                    }

                    // 4. 构造最终的替换字符串，使用我们发明的 [!!underline!!] 自定义标记
                    textToProcess = precedingText.replace(/\s*$/, '') +
                        `[!!underline!!]` + // 自定义下划线块的开始标记
                        `[##elementorange]*${openParen}[#]` +
                        content +
                        `[##elementorange]${closeParen}[#]` +
                        trailingPeriod +
                        `[!!]`; // 自定义下划线块的结束标记

                    modified = true;
                }
            }

            if (!modified) {
                textToProcess = text;
            }
        }
        // --- 单独规则：只满足是 passives (通常是长文本) ---
        else if ((filterType === 'passives')) {
            if (!text.startsWith('-')){
                const colonIndex = text.indexOf(':');
                const wideColonIndex = text.indexOf('：');
                let finalColonIndex = -1;

                if (colonIndex > -1 && wideColonIndex > -1) {
                    finalColonIndex = Math.min(colonIndex, wideColonIndex);
                } else {
                    finalColonIndex = colonIndex > -1 ? colonIndex : wideColonIndex;
                }

                if (finalColonIndex > -1) {
                    const partToHighlight = text.substring(0, finalColonIndex + 1);
                    const restOfText = text.substring(finalColonIndex + 1);
                    textToProcess = `[##elementorange]${partToHighlight}[#]${restOfText}`;
                    }
            }

            // ========= 括号注释处理（与 effects 逻辑一致；`noParen` 时由调用方整条处理） =========
            if (textToProcess && !noParen) {
                let textToModify = textToProcess.trim();

                // 如果以).或）。结尾，先移除最后的句点
                if (textToModify.endsWith(').') || textToModify.endsWith('）。')) {
                    textToModify = textToModify.slice(0, -1);
                }

                let modified = false;

                // 条件检查：只处理以括号（或括号+句号）结尾的字符串
                if (textToModify.match(/[）)](?:\.|。)?$/)) {
                    let parenLevel = 0;
                    let matchStartIndex = -1;

                    for (let i = textToModify.length - 1; i >= 0; i--) {
                        const char = textToModify[i];
                        if (char === ')' || char === '）') parenLevel++;
                        else if (char === '(' || char === '（') parenLevel--;

                        if (parenLevel === 0) {
                            matchStartIndex = i;
                            break;
                        }
                    }

                    if (matchStartIndex > -1) {
                        const precedingText = textToProcess.substring(0, matchStartIndex);
                        const openParen = textToProcess[matchStartIndex];
                        const remainingBlock = textToProcess.substring(matchStartIndex + 1);

                        const lastChar = remainingBlock.slice(-1);
                        let closeParen = '';
                        let content = '';
                        let trailingPeriod = '';

                        if (lastChar === '.' || lastChar === '。') {
                            trailingPeriod = lastChar;
                            closeParen = remainingBlock.slice(-2, -1);
                            content = remainingBlock.slice(0, -2);
                        } else {
                            closeParen = lastChar;
                            content = remainingBlock.slice(0, -1);
                        }

                        textToProcess = precedingText.replace(/\s*$/, '') +
                            `[!!underline!!]` +
                            `[##elementorange]*${openParen}[#]` +
                            content +
                            `[##elementorange]${closeParen}[#]` +
                            trailingPeriod +
                            `[!!]`;

                        modified = true;
                    }
                }

                if (!modified) {
                    textToProcess = textToProcess;
                }
            }
        }
    }

    // 如果经过上面的处理后，没有剩余文本需要高亮，则直接返回前缀
    if (!textToProcess) {
        return highlightedPrefix;
    }

    // 用当前语言的词表给关键字套上分组标记
    const { regex, markup, pairs } = getHighlightingTools();
    const highlighted = regex ? textToProcess.replace(regex, (match) => {
        const open = markup.get(highlightKey(match));
        return open ? `${open}${match}[#]` : match;
    }) : textToProcess;
    return applyPairHighlighting(highlighted, pairs);
}

// ============================================================
// 动态立绘（Sprite-based 精灵动画）模块
// 移植自 WebView.html，立绘资源目录改为 imgs/animation/
// ============================================================

const HERO_ANIM_BASE = 'imgs/animation/';
const HERO_ANIM_PAD = 20;           // 与 compose_hero.py 的 MESH_PAD 保持一致

let _heroAnimationIndexCache = null;   // index.json 缓存
let _activeAnimationPlayer = null;     // 当前激活的播放器实例
let _portraitClickLock = false;        // 防止网络延迟期间重复点击打开多个立绘

/**
 * 加载 imgs/animation/index.json。
 * 结构约定：{ heroes: ["heroId1", "heroId2", ...] }
 * 结果会被缓存，只请求一次。
 */
async function loadHeroAnimationIndex() {
    if (_heroAnimationIndexCache !== null) return _heroAnimationIndexCache;
    try {
        const res = await fetch(HERO_ANIM_BASE + 'index.json', { cache: 'no-cache' });
        if (!res.ok) {
            console.warn('[立绘动画] index.json 不可用，使用静态立绘。');
            _heroAnimationIndexCache = { heroes: [] };
            return _heroAnimationIndexCache;
        }
        const data = await res.json();
        _heroAnimationIndexCache = (data && Array.isArray(data.heroes)) ? data : { heroes: [] };
        return _heroAnimationIndexCache;
    } catch (e) {
        console.warn('[立绘动画] index.json 加载失败，使用静态立绘：', e);
        _heroAnimationIndexCache = { heroes: [] };
        return _heroAnimationIndexCache;
    }
}

/**
 * 判断某个 heroId 是否在动态立绘索引中。
 * 兼容字符串数组与对象数组两种写法。
 */
function heroHasAnimation(index, heroId) {
    if (!index || !Array.isArray(index.heroes) || !heroId) return false;
    return index.heroes.some(h => {
        if (typeof h === 'string') return h === heroId;
        if (h && typeof h === 'object') return h.id === heroId || h.heroId === heroId;
        return false;
    });
}

/**
 * 释放当前激活的动画播放器。
 */
function disposeActiveAnimationPlayer() {
    if (_activeAnimationPlayer) {
        try {
            _activeAnimationPlayer.pause();
            _activeAnimationPlayer.dispose();
        } catch (e) { /* noop */ }
        _activeAnimationPlayer = null;
    }
}

// heroId -> Promise<{manifest, images}>
// 详情页打开时就开始预加载，点击打开立绘时直接复用，避免二次请求
const _heroAnimationPreloadCache = new Map();

/**
 * 预加载某个英雄的动态立绘资源（manifest + 所有 sprite）。
 * 结果会被缓存；同一英雄重复调用只会加载一次。
 * 加载失败时自动从缓存移除，方便下次重试。
 * @param {string} heroId
 * @returns {Promise<{manifest: object, images: Record<string, HTMLImageElement>}>}
 */
async function preloadHeroAnimation(heroId) {
    if (_heroAnimationPreloadCache.has(heroId)) {
        return _heroAnimationPreloadCache.get(heroId);
    }

    const promise = (async () => {
        const base = HERO_ANIM_BASE + heroId + '/';

        const getJSON = async (rel) => {
            const r = await fetch(base + rel, { cache: 'no-cache' });
            if (!r.ok) throw new Error(`HTTP ${r.status} → ${base + rel}`);
            return r.json();
        };
        const loadImage = (url) => new Promise((resolve, reject) => {
            const im = new Image();
            im.onload = () => resolve(im);
            im.onerror = () => reject(new Error('图片加载失败: ' + url));
            im.src = url;
        });

        const manifest = await getJSON('manifest.json');
        const images = {};
        await Promise.all(Object.entries(manifest.sprites).map(async ([key, rel]) => {
            images[key] = await loadImage(base + rel);
        }));

        return { manifest, images };
    })();

    _heroAnimationPreloadCache.set(heroId, promise);
    // 失败时清掉缓存，下次可以重试
    promise.catch(() => _heroAnimationPreloadCache.delete(heroId));

    return promise;
}

/**
 * 创建并挂载动画播放器。
 * @param {HTMLElement} container - 承载 canvas 的容器（通常就是 portraitContainer）
 * @param {string} heroId - 英雄的 heroId
 * @returns {Promise<{canvas: HTMLCanvasElement, pause: Function, dispose: Function}>}
 */
async function createHeroAnimationPlayer(container, heroId, options = {}) {
    const { onCanvasResize } = options;

    // ▼▼▼ 从预加载缓存取（没有则会触发加载）▼▼▼
    const { manifest: mf, images } = await preloadHeroAnimation(heroId);

    // ▼▼▼ canvas 挂到立绘位（外层容器内、z-index=2、和 heroImage 同款样式）▼▼▼
    const cv = document.createElement('canvas');
    cv.className = 'hero-portrait-image hero-animation-canvas';
    Object.assign(cv.style, {
        position: 'relative',
        zIndex: '2',
        display: 'block',
        transform: 'translateY(8%)',
        maxWidth: '85vw',
        maxHeight: '85vh',
        width: 'auto',
        height: 'auto',
        opacity: '0',
    });
    container.appendChild(cv);
    const ctx = cv.getContext('2d');

    const S = {
        manifest: mf, images,
        spriteMeta: mf.sprite_meta,
        staticBounds: null,
        anims: Array.isArray(mf.anim) ? mf.anim : (mf.anim ? [mf.anim] : []),
        clipBounds: [],
        animIdx: -1, frameIdx: 0,
        playing: false, rafId: 0, lastT: 0, acc: 0,
        disposed: false,
    };

    // ---------- 几何 ----------
    function sourceToWorld(L, sm, img) {
        const iw = img.naturalWidth, ih = img.naturalHeight;
        const minx = sm.bounds[0], miny = sm.bounds[1];
        const maxx = sm.bounds[2], maxy = sm.bounds[3];
        const rect = sm.rect;
        const sized = (Array.isArray(L.sized) && L.sized.length === 2) ? L.sized : rect;
        const rw = sized[0], rh = sized[1];
        const sw = rect[0], sh = rect[1];
        const ppu = sm.ppu || 100;

        let fx = rw / sw * ppu;
        let fy = rh / sh * ppu;

        const px = L.pivotX != null ? L.pivotX : 0.5;
        const py = L.pivotY != null ? L.pivotY : 0.5;

        const ma = L.matrix[0], mb = L.matrix[1], mtx = L.matrix[2];
        const md = L.matrix[3], me = L.matrix[4], mty = L.matrix[5];

        const du = (maxx - minx) / iw;
        const dv = -(maxy - miny) / ih;

        const itype = L.image_type | 0;
        if (itype !== 0) {
            const sasp = sw / sh, rasp = rw / rh;
            if (L.preserve_aspect) {
                if (sasp > rasp) fy = fx * sasp / rasp;
                else fx = fy * rasp / sasp;
            }
            if (itype === 3) { const c = Math.max(fx, fy); fx = fy = c; }
        } else if (L.preserve_aspect) {
            const fit = Math.min(fx, fy); fx = fy = fit;
        }

        const renderW = sw * fx / ppu;
        const renderH = sh * fy / ppu;
        let pivotOffX = 0, pivotOffY = 0;
        if (!(L.ignore_pivot_offset || itype !== 0)) {
            pivotOffX = (0.5 - px) * renderW;
            pivotOffY = (0.5 - py) * renderH;
        }

        const cx0 = fx * (minx + du * 0.5) + pivotOffX;
        const cy0 = fy * (maxy + dv * 0.5) + pivotOffY;

        return {
            a: ma * fx * du, b: mb * fy * dv,
            c: mtx + ma * cx0 + mb * cy0,
            d: md * fx * du, e: me * fy * dv,
            f: mty + md * cx0 + me * cy0,
        };
    }

    function layerBounds(layers) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const L of layers) {
            const img = S.images[L.sprite], sm = S.spriteMeta[L.sprite];
            if (!img || !sm) continue;
            const m = sourceToWorld(L, sm, img);
            const iw = img.naturalWidth, ih = img.naturalHeight;
            for (const [x, y] of [[0, 0], [iw, 0], [iw, ih], [0, ih]]) {
                const wx = m.a * x + m.b * y + m.c;
                const wy = m.d * x + m.e * y + m.f;
                if (wx < minX) minX = wx;
                if (wx > maxX) maxX = wx;
                if (wy < minY) minY = wy;
                if (wy > maxY) maxY = wy;
            }
        }
        return { minX, minY, maxX, maxY };
    }

    function unionBounds(a, b) {
        if (!a) return b;
        if (!b) return a;
        return {
            minX: Math.min(a.minX, b.minX), minY: Math.min(a.minY, b.minY),
            maxX: Math.max(a.maxX, b.maxX), maxY: Math.max(a.maxY, b.maxY),
        };
    }

    S.staticBounds = layerBounds(mf.static);
    S.clipBounds = S.anims.map(a => {
        let b = null;
        for (const fr of (a.frames || [])) b = unionBounds(b, layerBounds(fr));
        return b;
    });

    const currentLayers = () => (S.animIdx < 0 ? S.manifest.static : S.anims[S.animIdx]?.frames[S.frameIdx]);
    const currentBounds = () => (S.animIdx < 0 ? S.staticBounds : (S.clipBounds[S.animIdx] || null));
    const currentAnim = () => (S.animIdx < 0 ? null : S.anims[S.animIdx]);

    // ---------- 渲染 ----------
    function drawFrame(layers, bounds) {
        if (!bounds || !isFinite(bounds.minX)) return;
        const W = Math.max(1, Math.ceil(bounds.maxX - bounds.minX) + 2 * HERO_ANIM_PAD);
        const H = Math.max(1, Math.ceil(bounds.maxY - bounds.minY) + 2 * HERO_ANIM_PAD);
        if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, W, H);

        // order 与 Unity UI 兄弟绘制顺序一致
        for (const L of layers.slice().sort((a, b) => a.order - b.order)) {
            const img = S.images[L.sprite], sm = S.spriteMeta[L.sprite];
            if (!img || !sm) continue;

            const m = sourceToWorld(L, sm, img);

            // 源像素 (x,y) -> 输出像素 (X,Y)：
            //   X = m.a*x + m.b*y + (m.c - minX) + PAD
            //   Y = -m.d*x - m.e*y + H - PAD - (m.f - minY)
            // Canvas setTransform(a, b, c, d, e, f) 里的 (a,b,c,d,e,f) 与
            // 上式一一对应：X = a*x + c*y + e ; Y = b*x + d*y + f
            const a = m.a;
            const b = -m.d;
            const c = m.b;
            const d = -m.e;
            const e = m.c - bounds.minX + HERO_ANIM_PAD;
            const f = H - HERO_ANIM_PAD - (m.f - bounds.minY);

            ctx.save();
            ctx.globalAlpha = L.alpha != null ? L.alpha : 1;
            ctx.setTransform(a, b, c, d, e, f);

            // Image.Filled 填充裁剪：mimic_titan 火苗按 fill_amount 从
            // 圆心展开（fill_method=4 Radial360；0/1 为横/竖线性）。
            // 裁剪路径在 setTransform 后的本地（图片）坐标空间。
            if (L.image_type === 3 && L.fill_amount != null && L.fill_amount < 1) {
                const iw2 = img.width, ih2 = img.height;
                const cx2 = iw2 / 2, cy2 = ih2 / 2;
                const method = L.fill_method | 0;
                const origin = L.fill_origin != null ? L.fill_origin : 0;
                const cw = L.fill_clockwise ? true : false;
                ctx.beginPath();
                if (method === 0) {
                    const wFrac = L.fill_amount * iw2;
                    if (origin === 0) ctx.rect(0, 0, wFrac, ih2);
                    else ctx.rect(iw2 - wFrac, 0, wFrac, ih2);
                } else if (method === 1) {
                    const hFrac = L.fill_amount * ih2;
                    if (origin === 0) ctx.rect(0, ih2 - hFrac, iw2, hFrac);
                    else ctx.rect(0, 0, iw2, hFrac);
                } else {
                    // Radial：origin 0底/1右/2顶/3左。Canvas y-down 角度
                    // 0=右、正方向=视觉顺时针，与 Unity y-up 语义换算后：
                    // cw=true 顺时针从 start 扫到 start+sweep。
                    const full = method === 2 ? Math.PI / 2 : method === 3 ? Math.PI : 2 * Math.PI;
                    const start = [Math.PI / 2, 0, -Math.PI / 2, Math.PI][origin];
                    const sweep = L.fill_amount * full;
                    ctx.moveTo(cx2, cy2);
                    if (cw) ctx.arc(cx2, cy2, Math.hypot(cx2, cy2), start, start + sweep, false);
                    else ctx.arc(cx2, cy2, Math.hypot(cx2, cy2), start, start - sweep, true);
                    ctx.closePath();
                }
                ctx.clip();
            }

            // m_Color.r/g/b tint：Canvas 'multiply' 合成保持 alpha、RGB
            // 乘 tint（fables 卡片 0.575~1 变暗）。仅分量 !=1 时开销。
            let drawImg = img;
            if (L.color && (L.color[0] !== 1 || L.color[1] !== 1 || L.color[2] !== 1)) {
                const tc = document.createElement('canvas');
                tc.width = img.width; tc.height = img.height;
                const tctx = tc.getContext('2d');
                tctx.drawImage(img, 0, 0);
                tctx.globalCompositeOperation = 'multiply';
                tctx.fillStyle = 'rgb(' + L.color.map(function (v) {
                    return Math.round(Math.max(0, Math.min(1, v)) * 255);
                }).join(',') + ')';
                tctx.fillRect(0, 0, tc.width, tc.height);
                drawImg = tc;
            }
            // HSVRangeHandler._hue/_saturation/_value：像素级 HSV 调整
            // （口径与 compose_hero._apply_tint_fill 一致：hue 绝对替换、
            // sat/val 乘原值，未驱动分量保留原色）。
            if (L.hsv && L.hsv.some(function (v) { return v != null; })) {
                const tc = document.createElement('canvas');
                tc.width = img.width; tc.height = img.height;
                const tctx = tc.getContext('2d');
                tctx.drawImage(drawImg, 0, 0);
                const id = tctx.getImageData(0, 0, tc.width, tc.height);
                const px = id.data;
                const hue = L.hsv[0] != null ? L.hsv[0] * 360 : null;
                const sat = L.hsv[1], val = L.hsv[2];
                for (let p = 0; p < px.length; p += 4) {
                    let r = px[p] / 255, g = px[p + 1] / 255, b = px[p + 2] / 255;
                    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
                    const d = mx - mn;
                    let hh = d === 0 ? 0 : (
                        mx === r ? (((g - b) / d) % 6)
                            : mx === g ? ((b - r) / d + 2)
                                : ((r - g) / d + 4)) * 60;
                    let ss = mx === 0 ? 0 : d / mx;
                    let vv = mx;
                    if (hue != null) hh = hue;
                    if (sat != null) ss *= sat;
                    if (val != null) vv *= val;
                    hh = ((hh % 360) + 360) % 360 / 60;
                    const i = Math.floor(hh) % 6, f = hh - Math.floor(hh);
                    const pp = vv * (1 - ss), q = vv * (1 - f * ss), t = vv * (1 - (1 - f) * ss);
                    const r2 = i === 0 ? vv : i === 1 ? q : i === 2 ? pp : i === 3 ? pp : i === 4 ? t : vv;
                    const g2 = i === 0 ? t : i === 1 ? vv : i === 2 ? vv : i === 3 ? q : i === 4 ? pp : pp;
                    const b2 = i === 0 ? pp : i === 1 ? pp : i === 2 ? t : i === 3 ? vv : i === 4 ? vv : q;
                    px[p] = Math.round(Math.max(0, Math.min(1, r2)) * 255);
                    px[p + 1] = Math.round(Math.max(0, Math.min(1, g2)) * 255);
                    px[p + 2] = Math.round(Math.max(0, Math.min(1, b2)) * 255);
                }
                tctx.putImageData(id, 0, 0);
                drawImg = tc;
            }
            ctx.drawImage(drawImg, 0, 0);
            ctx.restore();
        }
    }

    // ▼▼▼ 和静态 heroImage 完全一致的空间约束：85vw × 85vh ▼▼▼
    function fitCanvasToViewport() {
        if (!cv.width || !cv.height) return;
        const maxW = window.innerWidth * 0.85;
        const maxH = window.innerHeight * 0.85;
        const scale = Math.min(maxW / cv.width, maxH / cv.height, 1);
        const finalW = Math.round(cv.width * scale);
        const finalH = Math.round(cv.height * scale);
        cv.style.width = finalW + 'px';
        cv.style.height = finalH + 'px';
        if (typeof onCanvasResize === 'function') onCanvasResize(finalW, finalH);
    }

    function play() {
        if (S.playing || S.disposed) return;
        const a = currentAnim();
        if (!a) return;
        S.playing = true;
        S.lastT = performance.now();
        S.acc = 0;
        cancelAnimationFrame(S.rafId);
        S.rafId = requestAnimationFrame(tick);
    }
    function pause() {
        S.playing = false;
        cancelAnimationFrame(S.rafId);
    }
    function tick(now) {
        if (!S.playing || S.disposed) return;
        const anim = currentAnim();
        if (!anim) { pause(); return; }
        const frameMs = 1000 / anim.fps;
        S.acc += now - S.lastT;
        S.lastT = now;
        const n = anim.frames.length;
        while (S.acc >= frameMs) {
            S.acc -= frameMs;
            S.frameIdx = (S.frameIdx + 1) % n;
        }
        drawFrame(anim.frames[S.frameIdx], currentBounds());
        S.rafId = requestAnimationFrame(tick);
    }

    function selectClip(idx) {
        idx = parseInt(idx, 10);
        if (isNaN(idx)) idx = -1;
        if (idx >= S.anims.length) idx = S.anims.length ? 0 : -1;
        S.animIdx = idx;
        S.frameIdx = 0;
        const hasAnim = idx >= 0 && S.anims[idx];
        pause();
        drawFrame(currentLayers(), currentBounds());
        fitCanvasToViewport();
        if (hasAnim) play();
    }

    // 初始播放 default_clip
    const defaultClip = (mf.default_clip !== undefined && mf.default_clip >= 0)
        ? mf.default_clip
        : (S.anims.length ? 0 : -1);
    selectClip(defaultClip);

    // 淡入（和静态 heroImage 一致）
    setTimeout(() => {
        if (S.disposed) return;
        cv.style.opacity = '1';
        cv.style.transition = 'opacity 0.3s ease';
    }, 10);

    const onResize = () => fitCanvasToViewport();
    window.addEventListener('resize', onResize);

    return {
        canvas: cv,
        pause,
        dispose() {
            S.disposed = true;
            pause();
            window.removeEventListener('resize', onResize);
            if (cv.parentNode) cv.parentNode.removeChild(cv);
        }
    };
}

/**
 * 显示一个轻量的复制提示（toast）。
 */
function showCopyToast(message) {
    let toast = document.getElementById('copy-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'copy-toast';
        Object.assign(toast.style, {
            position: 'fixed',
            left: '50%',
            bottom: '12%',
            transform: 'translateX(-50%) translateY(10px)',
            background: 'rgba(20, 20, 20, 0.88)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '999px',
            fontSize: '0.9rem',
            lineHeight: '1.2',
            zIndex: '99999',
            pointerEvents: 'none',
            opacity: '0',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
            whiteSpace: 'nowrap',
            maxWidth: '90vw',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        });
        document.body.appendChild(toast);
    }

    toast.textContent = message;

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(10px)';
    }, 1600);
}

/**
 * 安全地把任意 hero.element 值转成英文小写颜色 key（'red'/'blue'/'green'/'yellow'/'purple'）。
 * 兼容：英文、中文简体、中文繁体、大小写、未知值（兜底 'red'，绝不返回 undefined）。
 */
function getSafeColorKey(colorValue) {
    const FALLBACK = 'red';
    const VALID = ['red', 'blue', 'green', 'yellow', 'purple'];

    if (colorValue === null || colorValue === undefined) return FALLBACK;
    const raw = String(colorValue).trim();
    if (!raw) return FALLBACK;

    // 入参 raw 已是颜色规范 ID
    if (true) {
        const mapped = ['red','blue','green','yellow','purple'].includes(raw.toLowerCase()) ? raw.toLowerCase() : null;
        if (mapped && VALID.includes(String(mapped).toLowerCase())) {
            return String(mapped).toLowerCase();
        }
    }

    // 2) 本身就是英文（'Red' / 'red' / 'RED'）
    const lower = raw.toLowerCase();
    if (VALID.includes(lower)) return lower;

    // 3) 完全无法识别 —— 打印一次方便定位，但不要崩
    console.warn('[getSafeColorKey] 未识别的颜色值:', colorValue);
    return FALLBACK;
}

/**
 * 在模态框中渲染英雄的详细信息。
 * @param {object} hero - 英雄对象。
 * @param {object} context - 上下文对象，主要用于队伍模拟器。
 */
function renderDetailsInModal(hero, context = {}) {

    const { teamSlotIndex } = context;
    // 兜底：`displayStats` 平时由 `applyFiltersAndRender` 预计算，但从队伍模拟器/分享链接等
    //   入口打开详情时该英雄可能不在 `filteredHeroes` 里 ⇒ 这里懒算一次，避免模板读 undefined 崩溃。
    if (hero && !hero.displayStats) refreshBalancedDisplayStats(hero);
    const langDict = i18n[state.currentLang];
    const { modalContent, filterInputs } = uiElements;
    const classIcon = String(hero.classId || hero.class).toLowerCase();
    const avatarGlowClass = getColorGlowClass(hero.elementId);
    // 为详情框头像准备变量
    const modalGradientBg = getHeroColorLightGradient(hero.elementId);
    const modalImageSrc = hero.heroId ? `imgs/hero_icon/${hero.heroId}.webp` : getLocalImagePath(hero.image);

    // 根据星级生成星星的HTML
    let starsHTML = '';
    if (hero.rarity && hero.rarity > 0) {
        starsHTML = '<div class="hero-avatar-stars-container">';
        for (let i = 0; i < hero.rarity; i++) {
            starsHTML += '<img loading="lazy" src="imgs/other/star.webp" decoding="async" class="hero-avatar-star" alt="star">';
        }
        starsHTML += '</div>';
    }

    // 根据 costume_id 生成服装图标HTML
    let costumeIconHTML = '';
    if (hero.costume_id && hero.costume_id !== 0) {
        costumeIconHTML = '<img loading="lazy" src="imgs/costume/c1.webp" decoding="async" class="hero-avatar-costume-icon" alt="costume">';
    }

    // 根据 family 生成家族图标HTML
    let familyIconHTML = '';
    if (hero.family) {
        const familyIconSrc = `imgs/family/${String(hero.family).toLowerCase()}.webp`;
        familyIconHTML = `<img loading="lazy" src="${familyIconSrc}" decoding="async" class="hero-avatar-family-icon" alt="${hero.family}" onerror="this.style.display='none'">`;
    }

    // 根据 class 生成职业图标HTML
    let classIconHTML = '';
    if (hero.class) {
        const classIcon = String(hero.classId || hero.class).toLowerCase();
        classIconHTML = `<img loading="lazy" src="imgs/classes/${classIcon}.webp" decoding="async" class="hero-avatar-class-icon" alt="${hero.class}" title="${hero.class}">`;
    }
    // --- 生成被动技能图标(包含两种来源) ---
    let passiveSkillsHtml = '';

    // `hero.passiveSkills` 在新数据里是 `[{id,title,text}]`（旧数据是纯字符串数组）⇒ 统一取 `id`
    //   当图标 key（旧实现直接拿对象去查表 ⇒ 恒 undefined，头像被动图标一直不显示）。
    const _pid = (x) => (x && typeof x === 'object') ? (x.id || '') : String(x || '');
    const basePassives = (hero.passiveSkills || []).map(_pid).filter(Boolean);
    const costumePassives = (hero.costumeBonusPassiveSkillIds || []).map(_pid).filter(Boolean);

    // **展示逆序**（2026-10-19 用户口径）：普通被动与服装奖励被动**各自内部**倒序，服装奖励留在下面。
    //   ⚠ `hero.passiveSkills` 里**已经追加了**服装奖励被动（生成器合并的结果，含"从第一套服装继承"那种
    //   本行没有 `costumeBonusPassiveSkillIds` 字段的情况）⇒ 必须按 `costumeBonusPassiveSkillIds`
    //   先拆组再分别翻，整条倒序会把服装奖励顶到第一位。
    //   判别样本：`magic_telonius_costume_brew`、`forest_god_zeline_costume_cute`。
    //   数据与导出侧仍是官方配置数组原序（`passive_desc_gen.ORDER_MODE = 'config'`），只在渲染时翻。
    const _bonusSet = new Set(costumePassives);
    const _orderedPassives = [
        ...basePassives.filter(id => !_bonusSet.has(id)).reverse(),
        ...basePassives.filter(id => _bonusSet.has(id)).reverse()
    ];
    const allPassiveSkills = _orderedPassives;

    // --- 生成头像上的 Aether Power 叠加图标 ---
    let aetherPowerIconHTML = '';
    // 检查英雄是否有 AetherPower 属性
    if (hero.AetherPower) {
        const framePath = 'imgs/Aether Power/frame.webp';

        const iconFileName = String(hero.aetherPowerId || hero.AetherPower).toLowerCase()

        const iconPath = `imgs/Aether Power/${iconFileName}.webp`;

        aetherPowerIconHTML = `
            <div class="hero-aether-power-icon-container" title="${hero.AetherPower}">
                <img loading="lazy" src="${framePath}" decoding="async" class="hero-aether-power-frame" alt="Aether Power Frame">
                <img loading="lazy" src="${iconPath}" decoding="async" class="hero-aether-power-image" alt="${hero.AetherPower}" onerror="this.style.display='none'">
            </div>
        `;
    }

    if (allPassiveSkills.length > 0) {
        const passiveIconsHtml = allPassiveSkills.map(skillKey => {
            const iconName = PassiveSkillIconCollection[skillKey];
            if (iconName) {
                const skillTitle = i18n[state.currentLang][skillKey] || skillKey;

                // 这是“原本”的图标路径 (例如 resist_fire 的火焰图标)
                const originalIconPath = `imgs/passive_icon/${iconName}.webp`;

                let baseIconHtml = '';    // 底层图标 (30x30)
                let overlayIconHtml = ''; // 顶层叠加图标 (18x18)

                if (skillKey.startsWith('resist_')) {
                    // --- Resist 技能 ---
                    const shieldPath = 'imgs/passive_icon/resist_shield.webp';

                    // 基础层是盾牌
                    baseIconHtml = `<img loading="lazy" src="${shieldPath}" decoding="async" class="hero-avatar-passive-icon" alt="${skillKey}" title="${skillTitle}">`;

                    // 叠加层是 "原本" 的图标 (缩小)
                    // 注意: alt="" 是故意的，避免屏幕阅读器重复播报，title 保留悬停提示
                    overlayIconHtml = `<img loading="lazy" src="${originalIconPath}" decoding="async" class="hero-avatar-passive-overlay-icon" alt="" title="${skillTitle}" onerror="this.style.display='none'">`;

                } else {
                    // --- 普通技能 ---
                    // 基础层就是 "原本" 的图标
                    baseIconHtml = `<img loading="lazy" src="${originalIconPath}" decoding="async" class="hero-avatar-passive-icon" alt="${skillKey}" title="${skillTitle}" onerror="this.style.display='none'">`;
                }

                // 总是返回一个包裹容器，用于正确定位
                return `
                <div class="hero-avatar-passive-wrapper">
                    ${baseIconHtml}
                    ${overlayIconHtml}
                </div>
            `;
            }
            return '';
        }).join('');

        if (passiveIconsHtml) {
            passiveSkillsHtml = `<div class="hero-avatar-passives-container">${passiveIconsHtml}</div>`;
        }
    }


    // 内部帮助函数，用于将技能/被动数组渲染为HTML列表
    // `opts.clickable === false` ⇒ 词条**不带** `.skill-type-tag`（不可点筛选）。
    //   被动段用它：把被动的点击词条改为点击技能标题 ——
    //   词条只负责展示，点标题才触发一键快速搜索。
    const renderListAsHTML = (itemsArray, filterType = null, opts = null) => {
        const clickable = !(opts && opts.clickable === false);
        if (!itemsArray || !Array.isArray(itemsArray) || itemsArray.length === 0) return `<li>${langDict.none}</li>`;


        // 定义一个正则表达式，用于匹配“纯星号标题行”
        // (从头到尾只包含空格或星号)
        const starHeaderPattern = /^[\s*]+$/;

        // ▼▼▼ 定义颜色映射表 ▼▼▼
        const colorNameMap = {
            'purple': '#e290ff', // 暗黑系 (紫)
            'green': '#70e92f',  // 自然系 (绿)
            'red': '#ef3838ff',    // 烈火系 (红，与负数同色)
            'yellow': '#f2e33a', // 神圣系 (黄)
            'blue': '#41d8fe',   // 冰雪系 (蓝)
            'orange': '#ff7800ff'   // 被动天赋 (橙)
        };
        const specialColor = '#2d81e2ff'; // [#!] 词条使用的颜色

        // 检查是否启用了高亮技能词条
        const shouldHighlight = getCookie('highlightSkillTerms') !== 'false';

        // 过滤/悬浮提示用的"纯文本"：把 `[#Dynamic]…[#]` 注记剥成裸数值
        // （否则标记会漏进 `data-filter-value` / `title`，动态伤害场景）。
        // `[*]` 也要从筛选值/提示里去掉（否则 `data-filter-value` 会带出 `[*]보드의…` 这种残留）
        const _plainItem = (s) => String(s)
            .replace(/\[#Dynamic\]([^\[\]]*)\[#\]/g, (m, v) => v)
            .replace(/\[\*+\]/g, '')
            .trim();

        // `[*]` = **子行标记**（缩进 + 保留未着色的 `*`，见下方外层组装）；行首 `*` 才是"括号补充说明"的虚线标记。
        // `opts.noParen=true` ⇒ 括号注释由外层 `_renderEntryInner` 在**整条**范围内统一处理，
        //   这里不再按单行认括号（否则内层括号会被误判）。
        const _renderOneCore = (item, opts) => {
            const noParen = !!(opts && opts.noParen);
            // ▼▼▼ 行首 `*`：括号补充说明行（橙色 * + 虚线下划线）▼▼▼
            if (filterType === 'passives') {
                const rawItem = String(item);
                const trimmedItem = rawItem.trim();
                if (trimmedItem.startsWith('*')) {
                    // 提取星号和后面的内容（保留原始空格）
                    const starMatch = rawItem.match(/^(\s*\*)(.*)/);
                    if (starMatch) {
                        const star = starMatch[1];      // 包含前导空格和星号
                        const content = starMatch[2];   // 星号后的内容（包括空格）
                        const orangeColor = '#ff7800ff';
                        // 返回带样式的列表项，不进行其他高亮处理
                        return `<li style="text-decoration: underline dashed ${orangeColor};"><span style="color: ${orangeColor};">${star}</span>${content}</li>`;
                    }
                }
            }

            let cleanItem = String(item).trim();

            // 在执行任何分割操作之前，检查它是否为“纯星号标题行”
            // 这一步必须在添加任何标签 *之前* 完成
            if (cleanItem.includes('*') && starHeaderPattern.test(cleanItem)) {
                const compactStars = cleanItem.replace(/\s/g, '');
                return `<li>${compactStars}</li>`;
            }

            // ▼▼▼ `[#Dynamic]…[#]` 注记：**在数值高亮之后**才换成 `<span class="dynamic-value">` ▼▼▼
            //   （见下面 "HTML结构化逻辑" 之前那一段；放早了会被数值高亮套一层蓝色 inline 样式）

            // --- 文本美化处理 ---
            if (shouldHighlight) {

                // 只有在用户启用高亮时，才执行“添加标签”的步骤
                cleanItem = applyKeywordHighlighting(cleanItem, state.currentLang, filterType, noParen);

                // 处理数字高亮
                const numberRegex = /([+-]?\d+[%]?)/g;

                // 1. 替换回调函数现在接收所有参数 (match, p1, offset, fullString)
                //    - match: 匹配到的完整字符串 (例如 "-700")
                //    - offset: 匹配开始的位置索引
                //    - fullString: 整个被搜索的字符串
                // 2. 增加了对 "范围" 的检查，防止 "300 -700" 中的 "-700" 被标红
                //
                cleanItem = cleanItem.replace(numberRegex, (match, p1, offset, fullString) => {

                    // 判断匹配到的字符串是否以 '-' 开头
                    if (match.startsWith('-')) {
                        // 如果是负数，检查它是否是一个范围的一部分

                        let precedingCharIndex = offset - 1;

                        // 1. 向后跳过所有空格 (例如 "300 -700" 中的空格)
                        while (precedingCharIndex >= 0 && fullString[precedingCharIndex] === ' ') {
                            precedingCharIndex--;
                        }

                        // 2. 检查跳过空格后的第一个非空字符
                        const precedingChar = fullString[precedingCharIndex];

                        // 3. 如果该字符是数字 (e.g., "300 -700" 中的 '0')
                        //    那么它是一个范围，不应该标红。
                        if (precedingChar >= '0' && precedingChar <= '9') {
                            // 这是范围的后半部分，使用标准蓝色
                            return `<span style="color: ${specialColor};">${match}</span>`;
                        }

                        // 如果不是范围（例如，前面是空格、字母、或字符串开头），
                        // 那么它是一个真正的负值 (e.g., "-30% 攻击")，应该标红
                        return `<span style="color: #ef3838ff;">${match}</span>`;

                    } else {
                        // 否则 (正数)，使用原有的蓝色
                        return `<span style="color: ${specialColor};">${match}</span>`;
                    }
                });
                // ★★★ 步骤 1: 首先处理最外层的自定义“下划线”标记 ★★★
                // 使用 .replace(/.../gs, ...) 来确保可以正确处理包含换行的内容
                cleanItem = cleanItem.replace(/\[!!underline!!\](.*?)\[!!\]/gs, (match, innerText) => {
                    // 将其转换为带 <br> 和虚线 span 的 HTML
                    // 在 text-decoration 样式中，直接添加 orange 颜色
                    const orangeColor = colorNameMap.orange;
                    // text-decoration: underline(下划线) dashed(虚线) orangeColor(颜色)
                    return `<br><span style="text-decoration: underline dashed ${orangeColor};">${innerText}</span>`;
                });

                // 步骤 2: 处理元素词条 (将 [##...] 标签转换为 <span> HTML)
                // 定义只匹配“最内层”标签的正则表达式。
                // 关键在于 [^\[\]]*，它匹配任何不包含 '[' 或 ']' 的内容。
                const innermostElementPattern = /\[##element(purple|green|red|yellow|blue|orange)\]([^\[\]]*)\[#\]/;
                const innermostSpecialPattern = /\[#!\]([^\[\]]*)\[#\]/;

                // 只要字符串中还存在任何一个最内层标签，就持续循环。
                while (innermostElementPattern.test(cleanItem) || innermostSpecialPattern.test(cleanItem)) {

                    // 每次循环都先处理 element 标签
                    cleanItem = cleanItem.replace(innermostElementPattern, (match, colorName, text) => {
                        const color = colorNameMap[colorName] || '#FFFFFF';
                        // 将最内层的标签替换为HTML，这样外层标签的内容就变成了 "...<span>...</span>..."
                        return `<span style="color: ${color};">${text}</span>`;
                    });

                    // 然后处理 special 标签
                    cleanItem = cleanItem.replace(innermostSpecialPattern, (match, text) => {
                        return `<span style="color: ${specialColor};">${text}</span>`;
                    });
                }
            }


            // ▼▼▼ `[#Dynamic]…[#]` 注记 → `<span class="dynamic-value">` ▼▼▼
            //   ⚠ **必须放在数值高亮之后**：数值高亮会在标记里面再套一层
            //   `<span style="color:#2d81e2ff">`（inline 样式压过任何 CSS 选择器），
            //   动态值就会变成"普通蓝色数字"。
            //   这里把标记换成 span 时**顺手剥掉内层 span**，让 `.dynamic-value` 自己的橙色加粗生效；
            //   数值**前后的空格留在 span 外面**，否则改写 textContent 时会把空格一起吃掉。
            //   放在高亮开关之外：它不是"高亮"，无论开关都必须换掉。
            cleanItem = cleanItem.replace(/\[#Dynamic\]([\s\S]*?)\[#\]/g, (m, v) => {
                const lead = (v.match(/^\s*/) || [''])[0];
                const trail = (v.match(/\s*$/) || [''])[0];
                // 标记内容 = `值` 或 `值|‰|回合`（后者是生成器带出来的**游戏公式参数**，
                // `main.js` 直接从 `hero.effects` 解析，DOM 里只放展示值）
                const fields = v.trim().replace(/<\/?span[^>]*>/g, '').split('|');
                return `${lead}<span class="dynamic-value">${fields[0].trim()}</span>${trail}`;
            });


            // --- HTML结构化逻辑 ---

            // 首先统一处理包含 ' * ' 的情况
            if (cleanItem.includes(' * ')) {
                const parts = cleanItem.split(' * ');

                // 将第一部分作为主标题，后续所有部分都用 <i> 标签包裹，并用 <br> 连接。
                // 这个 .map() 和 .join() 的组合可以确保每个<i>标签都正确闭合。
                const displayHTML = parts[0].trim() +
                    '<br><i>' +
                    parts.slice(1).map(p => p.trim()).join('</i><br><i>') +
                    '</i>';

                if (filterType && clickable) {
                    // 如果有 filterType，使用原始 item 来获取数据属性，然后渲染上面生成好的 displayHTML
                    const mainDesc = _plainItem(String(item).trim().split(' * ')[0].trim());
                    return `<li class="skill-type-tag" data-filter-type="${filterType}" data-filter-value="${mainDesc}" title="${langDict.filterBy} ${mainDesc}">${displayHTML}</li>`;
                } else {
                    // 没有 filterType（或明确要求不可点），直接渲染
                    return `<li>${displayHTML}</li>`;
                }
            } else {
                // 如果 cleanItem 中不包含 ' * '，则按原样处理
                if (filterType && clickable) {
                    const mainDesc = _plainItem(String(item).trim());
                    return `<li class="skill-type-tag" data-filter-type="${filterType}" data-filter-value="${mainDesc}" title="${langDict.filterBy} ${mainDesc}">${cleanItem}</li>`;
                } else {
                    return `<li>${cleanItem}</li>`;
                }
            }
        };

        // 我们导出的词条把「子行」并入同一字符串（`\n` + `[*]`）⇒ 先按行拆开、再逐行渲染：
        //   · `[*]` 行渲染成「橙色 *」的子行（与被动里 `*` 开头行的样式一致）；
        //   · 括号 `(...)` 仍留在同一行内（同词条）；
        //   · 顺带修掉「`[##elementorange]…[#]` 内含 `[*]`」导致高亮正则 `[^\[\]]*` 匹配失败、
        //     颜色标记裸露成 `[##elementorange]…` 的问题（construct_bonechill_costume_bedrock）。
        // 我们导出的词条里，子行有两种承载方式：
        //   ① 并入同一字符串（`\n` + `[*]`）—— 如 passiveSkills[].text；
        //   ② 拆成**数组的独立元素**且以 `[*]` 开头 —— 如 familyBonus。
        // 两种都要**留在同一个 <li> 里**：主行照常渲染，子行用 `<br>` 接在后面，
        // 加 `.skill-subline` 缩进，`*` 保留在行首但**不着色**。
        // 子行的正文**必须走完整处理链**（关键字着色 + 数值高亮 + 标记转 HTML），
        // 否则会出现「子行不着色 / 数值不高亮」（titan_hunter_borgholf）。
        // 做法：复用 `_renderOneCore` 拿到 <li>，抽出内层 HTML 再包进 .skill-subline。
        const _splitLi = (li) => {
            const m = String(li).match(/^(<li[^>]*>)([\s\S]*)(<\/li>)\s*$/);
            return m ? { open: m[1], inner: m[2], close: m[3] } : { open: '<li>', inner: String(li), close: '</li>' };
        };
        const _appendSubs = (li, subs) => subs ? li.replace(/<\/li>\s*$/, subs + '</li>') : li;

        // ── 括号注释块（「括号只适用最外层，内层的括号不作为换行注释解析」）──
        //   规则：从左往右找第一个**配对完整**的括号；同时满足两条才算注释块：
        //     ① 闭括号是**本行最后一个字符**（允许后面跟 `.` / `。` / 空白）；
        //     ② 开括号在**行首**——位于串首、前面是空白，或本行在它前面只有 `[*]`/`[**]` 子行标记。
        //   ②是 2026-10-22 补的：我们的导出里注释块一律是"正文 (…)"（`skill_desc_gen._wrap_extra`
        //   写死 `EXTRA_OPEN=' ('`），而**官方原文自带**的行内括号紧贴前一个词，比如俄语的复数提示
        //   `на 4 ходов(а).`、波兰语 `obrażeń(y)`、简中`（最多： 10 层）`。只按①判会把它们切成虚线子行
        //   （用户报的"俄语词条缺失/多出 `* а.`"）。第②条里"只有子行标记"那一半不能省：
        //   阿语等有 480 条 `[*](…)` 形式的真注释，只认空白会把它们错杀回正文。
        //   全量核对站点导出 20 语言 392,435 条词条：加②后保留 38,135 条真注释块，
        //   只把 1,959 条"紧贴词尾的官方行内括号"改回正文（ru 626 / pl 1150 / ja 99 / cn 31 / tc 23 …）。
        //   ⇒ `使所有盟友（包括自己）获得增益。` 这种**句中**括号本来就因①不成立而不受影响。
        //   ⚠ 注释块**可以跨行**（旧实现按单行找配对，会把内层括号误判成注释，就是用户报的那个 bug）。
        const _matchParen = (s, start) => {
            let depth = 0;
            for (let i = start; i < s.length; i++) {
                const c = s[i];
                if (c === '(' || c === '（') depth++;
                else if (c === ')' || c === '）') { depth--; if (depth === 0) return i; }
            }
            return -1;
        };
        const _isLineTail = (s, i) => {
            for (let k = i + 1; k < s.length; k++) {
                const c = s[k];
                if (c === '\n') return true;
                if (c === '.' || c === '。' || c === ' ' || c === '\t' || c === '\r') continue;
                return false;
            }
            return true;
        };
        // 开括号算不算"在行首"：串首 / 前面是空白 / 本行它前面只有一个子行标记 `[*]`、`[**]` …
        const _isLineHead = (s, i) => {
            if (i === 0 || /[\s]/.test(s[i - 1])) return true;
            const ls = s.lastIndexOf('\n', i - 1) + 1;
            return /^\s*\[\*+\]\s*$/.test(s.slice(ls, i));
        };
        // 一条词条 → [{kind:'text',text}, {kind:'paren',text,tail}]（保持原顺序）
        const _splitAnnotations = (s) => {
            const parts = [];
            let seg = '', i = 0;
            while (i < s.length) {
                const c = s[i];
                if (c === '(' || c === '（') {
                    const m = _matchParen(s, i);
                    if (m > -1 && _isLineTail(s, m) && _isLineHead(s, i)) {
                        if (seg) { parts.push({ kind: 'text', text: seg }); seg = ''; }
                        let end = m + 1, tail = '';
                        while (end < s.length && (s[end] === '.' || s[end] === '。')) { tail += s[end]; end++; }
                        parts.push({ kind: 'paren', text: s.slice(i + 1, m), tail });
                        i = end;
                        continue;
                    }
                }
                seg += c; i++;
            }
            if (seg) parts.push({ kind: 'text', text: seg });
            return parts;
        };

        // 一条词条 → `{open, inner, lastLvl}`：`open` = 主行的 `<li …>` 开标签（没有主行时为 null）；
        // `lastLvl` = 本段**最后出现的行层级**（主词条 = 0、`[*]` = 1 …）—— 供"并进上一条 `<li>`"
        // 的场景（`forceSub=true`）把上一条的层级续进来，否则括号块的缩进会退回一级。
        // 全部内容留在**同一个 <li>** 里：主行照常，`[*]` 行 = `.skill-subline` 子行，括号注释块 = 虚线块。
        // 三条排版口径：
        //   ① 括号注释块**去掉前后括号**，只留橙色 `*` + 着色虚线下划线；
        //   ② 注释块**比它所说明的那一行多缩进一级**（`.paren-note` 的 padding 由内联给出）；
        //   ③ 词条**开头不产生空行**（整条都是 `[*]` 子行时，第一行不再补 `<br>`）。
        const _renderEntryInner = (raw, forceSub, startLvl) => {
            // `forceSub=true` ⇒ 这段内容要**接到已有 `<li>` 后面** ⇒ 第一行也要补 `<br>`（否则会和上文黏在一起）
            let open = null, inner = '', headDone = false, hasContent = !!forceSub;
            // 上一条产出的是不是 `[*]` 子行 —— 括号注释块要**比它再多缩进一级**
            //   （谦逊分组后的词条本来就有缩进，括号块跟它一样深就看不出差别）
            let lastWasSub = !!startLvl;
            // 上一条产出行的**层级**（主词条 = 0、`[*]` = 1、`[**]` = 2 …）。
            // 括号注释块的缩进 = 本层级 + 1 级（每级 1.4em）—— 
            //   「`ninja_peridot_costume_herbalist` 最后那句明明着色和下划线了，为什么没有比主词条多缩进」
            //   「`goblin_kettle_costume_field_cook` 成长为主词条，下面的都着色了但缩进都是一样的」。
            //   旧实现把缩进**写死两档**（`.paren-note` 1.4em / `.paren-note-sub` 2.8em），
            //   只覆盖"宿主是主词条"和"宿主是 `[*]`"两种；层级化之后宿主是 `[**]` 时括号块
            //   仍是 2.8em ⇒ 与宿主**平齐**，从属关系看不出来。
            //   `forceSub=true` 时由调用方传入**上一条 `<li>` 的末尾层级**（`startLvl`），
            //   否则"整条只有括号、并入上一条"的元素（如 `[*](…括号说明…)`）会退回一级。
            let lastLvl = startLvl || 0;
            // 层级标记 = `[` + N 个 `*` + `]`（`[*]` 一级 / `[**]` 二级 …）。
            // 这样"子词条 / 说明词条 / 新词条"各有各的深度，不再全挤成 `[*]`。
            const _LVL_RE = /^\[(\*+)\]\s*/;
            const _subCls = (lvl) => 'skill-subline' + (lvl > 1 ? (' skill-subline-l' + lvl) : '');
            const _one = (line) => {
                const m = line.match(_LVL_RE);
                const lvl = m ? m[1].length : 0;
                const isSub = forceSub || lvl > 0;
                const txt = m ? line.slice(m[0].length).trim() : line;
                const sp = _splitLi(_renderOneCore(txt, { noParen: true }));
                return { isSub, lvl, inner: sp.inner, open: sp.open };
            };
            // 子行：**只有前面已有内容时才补 `<br>`**，否则词条会以一条无意义空行开头。
            // 空内容（例如整行只有 `[*]`，后面紧跟括号注释块）⇒ 不产出空子行。
            // `openTag` 只在"整条都是子行"时用来继承首行 `<li …>` 的属性（`data-filter-type` 等）。
            const _pushSub = (h, openTag, lvl) => {
                if (!h) return;
                if (!hasContent && openTag) open = openTag;
                inner += (hasContent ? '<br>' : '') + `<span class="${_subCls(lvl || 1)}">* ${h}</span>`;
                hasContent = true;
                lastWasSub = true;
                lastLvl = lvl || 1;
            };
            _splitAnnotations(String(raw)).forEach(p => {
                if (p.kind === 'text') {
                    p.text.split('\n').map(s => s.trim()).filter(s => s !== '').forEach(l => {
                        const r = _one(l);
                        if (!headDone && !r.isSub) { headDone = true; open = r.open; inner += r.inner; hasContent = true; lastWasSub = false; lastLvl = 0; }
                        else { headDone = true; _pushSub(r.inner, r.open, r.lvl); }
                    });
                    return;
                }
                // 括号注释块：去掉 `(` `)`，整块套虚线 + 左侧多缩进。
                // ⚠ （`ghost_xiwang_gui`「2 个额外说明合并为一个括号了 但缩进却不一样
                //   应该为同一级别」）：块内各行**缩进必须一致** —— 原来第 2 行起套 `.skill-subline`
                //   （+1.4em）比第 1 行深，看着像两级。现在除首行外只加 `<br>` + `* ` 项目符，
                //   **不再加缩进类**；虚线由 `.paren-note` 直接继承（也省掉 `.paren-note .skill-subline`
                //   那条 inherit 规则的作用）。
                const hadContent = hasContent;
                let body = '', bodyHas = false;
                p.text.split('\n').map(s => s.trim()).filter(s => s !== '').forEach((l, i) => {
                    const r = _one(l);
                    // 行头 = `.paren-mark` 的 `*` + **一个空格**（「补上」）
                    //   —— 首行原来直接 `*内容`（无空格），与续行 `* 内容`、与 `[*]` 子行的
                    //   `* ${h}` 都不一致；现在块内**所有行**统一成 `* 内容`。
                    const _head = `<span class="paren-mark">*</span> `;
                    if (i === 0) {                          // 第一行接着 `*` 同行显示
                        if (!headDone && !hadContent) { headDone = true; open = r.open; }
                        body += (r.inner ? _head + r.inner : '');
                    } else {                                // 其余行 = 同一缩进层级的续行
                        headDone = true;
                        body += (bodyHas ? '<br>' : '') + _head + r.inner;
                    }
                    bodyHas = true;
                });
                // 缩进 = **宿主行层级 + 1 级**（1.4em / 级）⇒ 括号块永远比它说明的那一行深一级。
                // 用 `padding-inline-start` 内联（逻辑属性，LTR/RTL 自动镜像；内联优先级高于
                // CSS 里的 `.paren-note{padding-left}` / `html[dir="rtl"]` 镜像规则，故不必再改 CSS）。
                const _pad = ((lastLvl || 0) + 1) * 1.4;
                inner += (hadContent ? '<br>' : '')
                    + `<span class="paren-note${lastWasSub ? ' paren-note-sub' : ''}" style="padding-inline-start:${_pad}em">`
                    + (body ? '' : `<span class="paren-mark">*</span>`) + body + p.tail + '</span>';
                hasContent = true;
            });
            return { open, inner, lastLvl };
        };

        // `[*]` 数组元素要不要并进上一条 `<li>` —— **按列表类型分**：
        //   · `familyBonus`：`[*]` 是「奖励表头」下的子项 ⇒ **并进上一条**（用户点名要求）；
        //   · `effects`（`skills[].lines`）：**每个数组元素各自成一个 `<li>`**
        //     —— 旧站就是这么拍的（`谦逊低于 40 时：` / `[*]对目标…` … 共 7 条扁平行），
        //     谦逊这种选择性的技能要按词条分组元素，不能被当成 2 个大组别元素。
        //   · `passives` 传进来的是单元素数组（子行在字符串内用 `\n[*]`）⇒ 这里不涉及。
        const _mergeSubItems = (filterType === 'familyBonus');
        // 「整条只有括号注释」的元素（如 `[*](头目、泰坦和神话泰坦不受此状态效果影响。)`）：
        //   它**归属于上一行词条**（数据里就是那行的括注）⇒ 必须并进上一条 `<li>`，
        //   不能单独成一个网页元素。
        const _isPureParen = (s) => {
            const parts = _splitAnnotations(String(s).replace(/^\s*\[\*+\]\s*/, ''));
            return parts.length > 0 && parts.every(p => p.kind === 'paren');
        };

        // ── 官方 `[*]` 是**行内 token**（`…持续 2 回合。 [*]每回合结束时…` / `([*]安全地偷取…`），
        //   而本站只按「**行首** `[*]`」识别子行 ⇒ 渲染前先归一到行首。
        //   生成器侧已归一（`skill_desc_gen.norm_sublines`），这里是**防御层**：
        //   旧档 / 手工数据 / 其它来源也不会把 `[*]` 裸露给用户
        //   ⚠ 必须放在 `_isPureParen` / `_renderEntryInner` **之前**（两者都按行首判据工作）。
        const _normBullets = (s) => String(s)
            .replace(/[ \t\u00a0]*(\[\*+\])[ \t\u00a0]*/g, '\n$1')
            .replace(/\n{2,}/g, '\n')
            .replace(/^\n+|\n+$/g, '');

        // 上一条 `<li>` 内**最后出现的行层级** —— `forceSub` 追加时续进去，括号块的缩进才跟得住
        let lastLiLvl = 0;
        return itemsArray.reduce((acc, item) => {
            const raw = _normBullets(item);
            if (!raw.replace(/^\s+/, '')) return acc;
            // ② 并进上一条 <li>：familyBonus 的所有 `[*]` 子项；以及**任何**列表里"整条只有括号"的元素
            const _merge = acc.length && ((_mergeSubItems && /^\s*\[\*+\]/.test(raw)) || _isPureParen(raw));
            if (_merge) {
                const _r = _renderEntryInner(raw, true, lastLiLvl);
                acc[acc.length - 1] = _appendSubs(acc[acc.length - 1], _r.inner);
                lastLiLvl = _r.lastLvl;
                return acc;
            }
            // ① 其余情况：整条自成一个 <li>（首行作主行，其余 `[*]` 行作缩进子行；括号注释块可跨行）
            const r = _renderEntryInner(raw, false);
            acc.push(`${r.open || '<li>'}${r.inner}</li>`);
            lastLiLvl = r.lastLvl;
            return acc;
        }, []).join('');
    };

    // --- 解析英雄名称 ---
    const displayName = hero.name;              // 当前语言显示名（= `_tPrefix('heroes_name', heroId)`）
    const identityName = hero.english_name;      // 跨语言稳定身份键

    // 使用所有三个变量来构建最终的HTML
    // ▼ 统一使用主英雄名作为筛选填充值 ▼
    // 旧站会在这里去掉名字末尾的「元素后缀」（dark/holy/ice/nature/fire）；但现有名字字典
    // （含英文名 1384 条）里该正则**零命中** ⇒ 清理逻辑已移除，直接用原名。
    const cleanedFilterValue = displayName;
    const cleanedIdentityName = identityName || '';

    const nameBlockHTML = `
        ${identityName ? `<p class="hero-english-name">${cleanedIdentityName}</p>` : ''}
        <h1 class="hero-main-name skill-type-tag" data-filter-type="name" data-filter-value="${cleanedFilterValue}" title="${langDict.filterBy} '${displayName.trim()}'">${displayName}</h1>
    `;

    const uniqueSkillTypes = getSkillTagsForHero(hero);
    let heroTypesContent = '';
    // 检查是否显示技能类别
    const showSkillTypesInDetails = getCookie('showSkillTypesInDetails') !== 'false';

    // 在技能类别部分添加条件渲染
    if (showSkillTypesInDetails) {
        if (uniqueSkillTypes.length > 0) {
            // 技能类型标签：显示用**当前语言文本**（`langs_json/skill_types_<码>.json`）；
            // `data-filter-value` 仍是**简体中文键**（筛选与 `getSkillTagsForHero` 的 CN 输出比对）。
            const _stLabel = (cn) => (typeof Lang !== 'undefined') ? Lang.t('skill_types', cn) : cn;
            const tagsHTML = uniqueSkillTypes.map(type => {
                const label = _stLabel(type);
                // 图标文件名按 **CN 键** 取（不能跟着翻译走）；图标查找只依赖 tag 值本身
                const iconSrc = getIconForFilter('skillTag_base', type);
                // 复用 option-icon class（已定义合适尺寸）
                const iconHTML = iconSrc ? `<img loading="lazy" src="${iconSrc}" decoding="async" class="option-icon" alt="" onerror="this.style.display='none'"/>` : '';
                const innerHTML = `${iconHTML}${label}`;

                return `<span class="hero-info-block skill-type-tag" data-filter-type="types" data-filter-value="${type}" title="${langDict.filterBy} ${label}">${innerHTML}</span>`;
            }).join('');
            heroTypesContent = `<div class="skill-types-container">${tagsHTML}</div>`;
        } else {
            heroTypesContent = `<span class="skill-value">${langDict.none}</span>`;
        }
    }

    // 家族奖励：新数据直接挂在英雄上（`data/heroes_skills_<码>.json` 的 familyBonus）；
    // 旧数据走 state.families_bonus（按家族名匹配）—— 保留作兜底。
    const familyBonus = (hero.familyBonus && hero.familyBonus.length)
        ? hero.familyBonus
        : ((state.families_bonus.find(f => String(f.name || '').toLowerCase() === String(hero.family || '').toLowerCase()) || {}).bonus || []);

    // 被动技能 / 家族奖励的**大图标**（
    //   「被动奖励和家族奖励要大图标展示，右边渲染被动名，下一元素是被动词条」；
    //   后续又反馈「图标太大、标题文字要加大」⇒ 图标 40px、名字 `.big-skill-name`）。
    //   图标名走 `PassiveSkillIconCollection`（data.js）；`resist_*` 仍是「盾牌底 + 原图标」两层。
    //   没有图标定义 / `NULL_SPRITE` 占位 ⇒ 返回 ''（调用方只剩名字，不留破图）。
    const bigPassiveIconHTML = (key) => {
        if (!key) return '';
        const coll = (typeof PassiveSkillIconCollection !== 'undefined') ? PassiveSkillIconCollection : null;
        const iconName = coll ? coll[key] : null;
        if (!iconName || iconName === 'NULL_SPRITE') return '';
        const src = `imgs/passive_icon/${iconName}.webp`;
        if (String(key).startsWith('resist_')) {
            return `<span class="big-passive-icon-wrap">`
                + `<img loading="lazy" src="imgs/passive_icon/resist_shield.webp" decoding="async" class="big-skill-icon" alt="${key}">`
                + `<img loading="lazy" src="${src}" decoding="async" class="big-passive-overlay-icon" alt="" onerror="this.style.display='none'">`
                + `</span>`;
        }
        return `<img loading="lazy" src="${src}" decoding="async" class="big-skill-icon" alt="${key}" onerror="this.style.display='none'">`;
    };

    // ── 被动技能段：每个被动 = 大图标 + 被动名（同一行），下一元素是该被动的词条 ──
    // 新数据 `hero.passiveSkills = [{id,title,text}]`；旧形状（纯文本数组）走 `hero.passives` 兜底。
    // **展示逆序**（与头像被动图标同一口径）：本体组与服装奖励组**各自内部**倒序、本体组在前 ——
    //   `hero.passiveSkills` 已把服装奖励被动追加在尾部，所以按 `costumeBonusPassiveSkillIds` 先拆组再翻。
    const _passiveItemsRaw = (hero.passiveSkills && hero.passiveSkills.length)
        ? hero.passiveSkills.filter(p => p && (p.text || p.id))
        : (hero.passives || []).map(t => ({ id: '', title: '', text: t }));
    const _bonusIds = (hero.costumeBonusPassiveSkillIds || []).map(x => (x && typeof x === 'object') ? (x.id || '') : String(x || ''));
    const _baseItems = _passiveItemsRaw.filter(p => _bonusIds.indexOf(p.id) < 0);
    const _bonusItems = _passiveItemsRaw.filter(p => _bonusIds.indexOf(p.id) >= 0);
    const _passiveItems = [..._baseItems].reverse().concat([..._bonusItems].reverse());
    const passivesSectionHTML = `<div id="modal-passives-section" class="skill-category-block">
        <p class="uniform-style">${langDict.modalPassiveSkill}${balancedToggleHTML(hero, 'passiveSkills')}</p>
        ${_passiveItems.length ? _passiveItems.map(p => {
            const _title = p.title || p.id || '';
            // 被动名可点 ⇒ **一键快速搜索该被动**（复用既有的 `.skill-type-tag` 点击逻辑；
            // 没有标题的旧数据就不挂，免得点出一空筛选）
            const _nameAttrs = p.title
                ? ` class="uniform-style big-skill-name skill-type-tag" data-filter-type="passives" data-filter-value="${p.title}" title="${langDict.filterBy} ${p.title}"`
                : ' class="uniform-style big-skill-name"';
            return `
            <div class="skill-header-container">
                ${bigPassiveIconHTML(p.id)}
                <div class="skill-name-speed-block"><p${_nameAttrs}>${_title}</p></div>
            </div>
            <ul class="skill-list">${renderListAsHTML([p.text], 'passives', { clickable: false })}</ul>`;
        }).join('')
        : `<ul class="skill-list"><li>${langDict.none}</li></ul>`}
    </div>`;

    // ── 家族奖励段：**原标题保持原样**（图标和标题是"额外添加"不是"替代"），
    //    标题下面再加一行「大图标 + 家族名」，下一元素是家族奖励词条 ──
    //    大图标旁的家族名走**官方 `family_title` 表**（`langs_json/family_title_<码>.json`，
    //    如 `asgard → 阿斯加德王国`），不是 `family` 表里的分组短名（`S3 - 阿斯加德`）；
    //    表外家族（123 条之外）回退 `getDisplayName`。
    //    ⚠ 二次调整：
    //      ① 「家族奖励」那行的**家族名隐藏**（原来"小图标 + 家族名"和下面的大图标行重复，
    //         `langDict.modalFamilyBonus('')` ⇒ 只留标题，模板已支持空家族名）；
    //      ② 大图标那行的**家族名标题改为可点** ⇒ **一键筛选该家族**
    //         （复用 `.skill-type-tag` 的点击逻辑，见 `modalContent.addEventListener('click')`）。
    const _familyTitleTable = (typeof Lang !== 'undefined') ? Lang.get('family_title') : {};
    const familyTitleName = (hero.family && _familyTitleTable[hero.family])
        || getDisplayName(hero.family, 'family');
    const familyTitleTag = hero.family
        ? ` class="uniform-style big-skill-name skill-type-tag" data-filter-type="family" data-filter-value="${hero.family}" title="${langDict.filterBy} ${familyTitleName}"`
        : ' class="uniform-style big-skill-name"';
    const familyBonusSectionHTML = familyBonus.length > 0 ? `
        <div id="modal-family-bonus-section" class="skill-category-block">
            <p class="uniform-style">${langDict.modalFamilyBonus('')}</p>
            <div class="skill-header-container">
                <img loading="lazy" src="imgs/family/${String(hero.family).toLowerCase()}.webp" decoding="async" class="big-skill-icon" alt="${hero.family}" onerror="this.style.display='none'">
                <div class="skill-name-speed-block"><p${familyTitleTag}>${familyTitleName}</p></div>
            </div>
            <ul class="skill-list">${renderListAsHTML(familyBonus, 'familyBonus')}</ul>
        </div>` : '';

    // ── 「服装奖励」下拉──
    // 只有带服装奖励表的英雄（688/702 个服装）才显示；**默认 = 最多套**。
    // 选项 = 「无」+ 每一套对应的**服装图标 + 服装名**（`C1/C2/卡通/玻璃/英姿`，按当前语言）。
    // ⚠ 原生 `<select>` 的 `<option>` 放不了图片 ⇒ 用一排小按钮当选择器。
    // ⚠ 这只影响**详情页**显示；列表属性仍按"该英雄自身的服装顺序"算（见 filters.js::calculateHeroStats）。
    const _costumeSkinOf = (k) => {
        let cid = k;
        if (hero.family === 'classic') { if (hero.rarity === 3 && cid > 1) cid += 1; }
        if (hero.family !== 'classic') { if (cid === 2) cid = 3; }
        // 档位 → 服装类型键（与 `getCostumeIconName` 同一套映射）；
        // 类型名走 `langs_json/costume_type_<码>.json`（20 语言，见 _tools/_costume_names.py 的推导）
        const keys = { 1: 'c1', 2: 'c2', 3: 'toon', 4: 'glass', 5: 'stylish' };
        const icons = { 1: 'c1', 2: 'c2', 3: 'toon', 4: 'glass', 5: 'stylish' };
        const key = keys[cid] || 'c1';
        const name = (typeof Lang !== 'undefined') ? Lang.t('costume_type', key) : key;
        return { name: name, icon: icons[cid] || 'c1' };
    };
    const costumePickerHTML = (() => {
        if (!hero.costumeBonusLevels) return '';
        const N = hero.costumeMaxSets || 1;
        let out = `<button type="button" class="costume-opt" data-value="0">${langDict.costumeSetsNone}</button>`;
        for (let k = 1; k <= N; k++) {
            const sk = _costumeSkinOf(k);
            out += `<button type="button" class="costume-opt${k === N ? ' selected' : ''}" data-value="${k}" title="${sk.name}">`
                + `<img loading="lazy" src="imgs/costume/${sk.icon}.webp" decoding="async" alt="" onerror="this.style.display='none'"><span>${sk.name}</span></button>`;
        }
        return `<div class="details-selector-item"><label data-lang-key="costumeBonusSetting">${langDict.costumeBonusSetting}</label>`
            + `<div class="costume-bonus-picker" id="modal-costume-picker">${out}</div></div>`;
    })();

    // 读当前选中的服装档位：选择器不存在（无服装奖励表 / 未开天赋面板）⇒ 默认最多套
    const readCostumeSets = () => {
        const el = document.getElementById('modal-costume-picker');
        if (el) {
            const s = el.querySelector('.costume-opt.selected');
            return s ? (parseInt(s.dataset.value, 10) || 0) : 0;
        }
        return hero.costumeMaxSets || 0;
    };

    const talentSystemHTML = filterInputs.showLbTalentDetailsCheckbox.checked ? `
        <div id="modal-talent-system-wrapper">
            <div class="filter-header" data-target="modal-talent-settings-content" data-cookie="modal_settings_state">
                <h2 data-lang-key="modalTalentSettingsTitle">${langDict.modalTalentSettingsTitle}</h2>
                <button class="toggle-button">▼</button>
            </div>
            <div id="modal-talent-settings-content" class="filter-content collapsed">
                <div class="modal-talent-settings-wrapper">
                    <div class="modal-talent-settings-grid">
                        <div class="details-selector-item"><label for="modal-limit-break-select" data-lang-key="limitBreakSetting">${langDict.limitBreakSetting}</label><select id="modal-limit-break-select"><option value="none" data-lang-key="noLimitBreak">${langDict.noLimitBreak}</option><option value="lb1" data-lang-key="lb1">${langDict.lb1}</option><option value="lb2" data-lang-key="lb2">${langDict.lb2}</option></select></div>
                        <div class="details-selector-item"><label for="modal-talent-select" data-lang-key="talentSetting">${langDict.talentSetting}</label><select id="modal-talent-select"><option value="none" data-lang-key="noTalent">${langDict.noTalent}</option><option value="talent20" data-lang-key="talent20">${langDict.talent20}</option><option value="talent25" data-lang-key="talent25">${langDict.talent25}</option></select></div>
                        <div class="details-selector-item"><label for="modal-talent-strategy-select" data-lang-key="prioritySetting">${langDict.prioritySetting}</label><select id="modal-talent-strategy-select"><option value="atk-def-hp" data-lang-key="attackPriority">${langDict.attackPriority}</option><option value="atk-hp-def" data-lang-key="attackPriority2">${langDict.attackPriority2}</option><option value="def-hp-atk" data-lang-key="defensePriority">${langDict.defensePriority}</option><option value="hp-def-atk" data-lang-key="healthPriority">${langDict.healthPriority}</option><option value="def-atk-hp" data-lang-key="defensePriority2">${langDict.defensePriority2}</option><option value="hp-atk-def" data-lang-key="healthPriority2">${langDict.healthPriority2}</option></select></div>
                        <div class="details-selector-item"><label for="modal-mana-priority-checkbox" data-lang-key="manaPriorityLabel">${langDict.manaPriorityLabel}</label><div class="checkbox-container"><input type="checkbox" id="modal-mana-priority-checkbox"><label for="modal-mana-priority-checkbox" class="checkbox-label" data-lang-key="manaPriorityToggle">${langDict.manaPriorityToggle}</label></div></div>
                        ${costumePickerHTML}
                    </div>
                </div>
            </div>

            <div class="filter-header" data-target="modal-custom-talent-content" data-cookie="modal_custom_talent_state">
                <h2 data-lang-key="customTalentTitle">${langDict.customTalentTitle || '自定义天赋'}</h2>
                <button class="toggle-button">▼</button>
            </div>
            <div id="modal-custom-talent-content" class="filter-content collapsed">
                <div class="mobile-tabs-container">
                    <button class="tab-link active" data-tab="bonus-cost-panel">${langDict.bonusAndCostTitle}</button>
                    <button class="tab-link" data-tab="talent-tree-panel">${langDict.talentTreeTitle}</button>
                </div>
                <div class="desktop-side-by-side">
                    <div id="bonus-cost-panel" class="mobile-tab-content active">
                        <h3 class="desktop-only-header">${langDict.bonusAndCostTitle}</h3>
                        <div id="modal-talent-bonus-display"></div>
                        <hr class="divider">
                        <div id="modal-talent-cost-display">
                            <div class="cost-item"><img loading="lazy" src="imgs/emblems/${classIcon}.webp" decoding="async" class="cost-icon" alt="纹章图标">${langDict.emblemCostLabel}<span id="cost-emblem">0</span></div>
                            <div class="cost-item"><img loading="lazy" src="imgs/farm/Food.webp" decoding="async" class="cost-icon" alt="食物图标">${langDict.foodCostLabel}<span id="cost-food">0</span></div>
                            <div class="cost-item"><img loading="lazy" src="imgs/farm/Iron.webp" decoding="async" class="cost-icon" alt="铁矿图标">${langDict.ironCostLabel}<span id="cost-iron">0</span></div>
                            <div class="cost-item"><img loading="lazy" src="imgs/emblems/master_${classIcon}.webp" decoding="async" class="cost-icon" alt="大师纹章图标">${langDict.masterEmblemCostLabel}<span id="cost-master-emblem">0</span></div>
                        </div>
                    </div>
                    <div id="talent-tree-panel" class="mobile-tab-content">
                        <h3 class="desktop-only-header">${langDict.talentTreeTitle}</h3>
                        <div id="modal-talent-tree-wrapper" style="padding:0;">
                            <div class="loader-spinner" style="margin: 3rem auto;"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ` : '';
    
    const specialId = hero.parent_specialId || hero.specialId;
    const specialSkillIconHTML = specialId
        ? `<img loading="lazy" src="imgs/skill_icon/special_${specialId}.webp" decoding="async" class="special-skill-icon" alt="${specialId} icon" onerror="this.style.display='none'">`
        : '';

    // 技能类别部分 - 根据设置决定是否显示
    const skillTypesSection = showSkillTypesInDetails ? `
    <p class="uniform-style">${langDict.modalSkillType}</p>
    ${heroTypesContent}
  ` : '';


    const detailsHTML = `
        <div class="details-header">
            <div class="details-header-main">
                 <h2 id="modal-title-h2" style="cursor: pointer;" title="返回顶部">${langDict.modalHeroDetails}</h2>
                 <div class="scroll-to-section-btns">
                    <button id="scroll-to-stats-btn" class="scroll-btn action-button">${langDict.modalAttributeTalentBtn}</button>
                    <button id="scroll-to-skill-tags-btn" class="scroll-btn action-button">${langDict.modalSkillDetailsBtn}</button>
                    <button id="scroll-to-skill-effects-btn" class="scroll-btn action-button">${langDict.modalSkillEffectBtn}</button>
                    <button id="scroll-to-passives-btn" class="scroll-btn action-button">${langDict.modalPassiveBtn}</button>
                    ${familyBonus.length > 0 ? `<button id="scroll-to-family-btn" class="scroll-btn action-button">${langDict.modalFamilyBonusBtn}</button>` : ''}
                 </div>
            </div>
            <div class="details-header-buttons">
                <button class="favorite-btn" id="favorite-hero-btn" title="${langDict.favoriteButtonTitle}">☆</button>
                <button class="share-btn" id="share-hero-btn" title="${langDict.shareButtonTitle}">🔗</button>
                <button class="close-btn" id="hide-details-btn" title="${langDict.closeBtnTitle}">✖</button>
            </div>
        </div>
        <div class="hero-title-block">${nameBlockHTML}${hero.fancy_name ? `<p class="hero-fancy-name">${hero.fancy_name}</p>` : ''}</div>
        <div class="details-body">
            <div class="details-top-left">
                <div class="hero-avatar-container-modal ${avatarGlowClass}">
                    <div class="hero-avatar-background-modal" style="background: ${modalGradientBg};"></div>
                    <img src="${modalImageSrc}" decoding="async" id="modal-hero-avatar-img" class="hero-avatar-image-modal" alt="${hero.name}" loading="lazy" onerror="this.src='imgs/not_found.webp'">
                    
                    <div class="hero-avatar-overlays overlays-hidden">
                        ${starsHTML}
                        ${classIconHTML}
                        ${costumeIconHTML}
                        ${familyIconHTML}
                        <div id="modal-rank-container"></div>
                        ${passiveSkillsHtml}
                        ${aetherPowerIconHTML}
                    </div>
                </div>
            </div>
            <div class="details-top-right">
                <div class="details-info-line">
                    ${hero.class ? `<span class="hero-info-block skill-type-tag" data-filter-type="class" data-filter-value="${hero.classId}"><img loading="lazy" src="imgs/classes/${String(hero.classId || hero.class).toLowerCase()}.webp" decoding="async" class="class-icon"/>${hero.class}</span>` : ''}
                    ${getCostumeIconName(hero) ? `<span class="hero-info-block skill-type-tag" data-filter-type="costume" data-filter-value="${getCostumeIconName(hero)}">${langDict.modalSkin} <img loading="lazy" src="imgs/costume/${getCostumeIconName(hero)}.webp" decoding="async" class="costume-icon"/></span>` : ''}
                    ${hero.AetherPower ? `<span class="hero-info-block skill-type-tag" data-filter-type="aetherpower" data-filter-value="${hero.aetherPowerId}">⏫<img loading="lazy" src="imgs/Aether Power/${String(hero.aetherPowerId || hero.AetherPower).toLowerCase()}.webp" decoding="async" class="aether-power-icon"/>${hero.AetherPower}</span>` : ''}
                    ${hero.family ? `<span class="hero-info-block skill-type-tag" data-filter-type="family" data-filter-value="${hero.family}"><img loading="lazy" src="imgs/family/${String(hero.family).toLowerCase()}.webp" decoding="async" class="family-icon"/>${getDisplayName(hero.family, 'family')}</span>` : ''}
                    ${hero.source ? `<span class="hero-info-block skill-type-tag" data-filter-type="source" data-filter-value="${hero.sourceId}"><img loading="lazy" src="imgs/coins/${sourceIconMap[hero.sourceId]}" decoding="async" class="source-icon"/>${getDisplayName(hero.source, 'source')}</span>` : ''}
                    ${hero['Release date'] ? `<span class="hero-info-block">📅 ${formatLocalDate(hero['Release date'])}</span>` : ''}
                </div>
                <h3 id="modal-core-stats-header">${langDict.modalCoreStats}${balancedToggleHTML(hero, 'stats')}</h3>
                <div class="details-stats-grid">
                    <div><p class="metric-value-style">💪 ${hero.displayStats.power || 0}</p></div>
                    <div><p class="metric-value-style">⚔️ ${hero.displayStats.attack || 0}</p></div>
                    <div><p class="metric-value-style">🛡️ ${hero.displayStats.defense || 0}</p></div>
                    <div><p class="metric-value-style">❤️ ${hero.displayStats.health || 0}</p></div>
                </div>
            </div>
        </div>
        <div class="details-bottom-section">
            ${talentSystemHTML}
            <h3 id="modal-skill-details-header">${langDict.modalSkillTagsHeader}</h3>
            <div class="skill-category-block">
                <div class="skill-header-container">
                    ${specialSkillIconHTML}
                    <div class="skill-name-speed-block">
                        <p class="uniform-style">${langDict.modalSkillName} <span class="skill-value">${hero.skill && hero.skill !== 'nan' ? hero.skill : langDict.none}</span></p>
                        <p class="uniform-style">${langDict.modalSpeed} <span class="skill-value skill-type-tag" data-filter-type="speed" data-filter-value="${hero.speed}">${hero.speed || langDict.none}</span></p>
                    </div>
                </div>
                ${skillTypesSection}
            </div>
            <div id="modal-skill-effects-section" class="skill-category-block">
                <p class="uniform-style">${langDict.modalSpecialSkill}${balancedToggleHTML(hero, 'effects')}</p>
                <ul class="skill-list">${renderListAsHTML(hero.effects, 'effects')}</ul>
            </div>
            ${passivesSectionHTML}
            ${familyBonusSectionHTML}
        </div>
        <div class="modal-footer"><button class="close-bottom-btn" id="hide-details-bottom-btn">${langDict.detailsCloseBtn}</button></div>
    `;

    modalContent.innerHTML = detailsHTML;

    // 「切换平衡数据」按钮：每个按钮只切自己那一节（`data-section`）
    (modalContent.querySelectorAll ? modalContent.querySelectorAll('.balanced-toggle') : []).forEach(el => {
        el.addEventListener('click', () => toggleBalancedData(hero, el.getAttribute('data-section')));
    });

    // --- JS逻辑部分 ---
    const modalHeroImg = document.getElementById('modal-hero-avatar-img');
    const overlaysContainer = modalContent.querySelector('.hero-avatar-overlays');

    if (modalHeroImg && overlaysContainer) {
        const showOverlays = () => {
            overlaysContainer.classList.remove('overlays-hidden');
            overlaysContainer.classList.add('overlays-visible');
        };

        if (modalHeroImg.complete) {
            showOverlays();
        } else {
            modalHeroImg.addEventListener('load', showOverlays);
        }
        modalHeroImg.addEventListener('error', showOverlays);
    }

    // 滚动到指定区域的按钮事件监听
    const scrollToSection = (sectionId) => {
        const section = modalContent.querySelector(`#${sectionId}`);
        const header = modalContent.querySelector('.details-header');
        if (section && header) {
            // 计算滚动位置，需要减去sticky header的高度
            const headerHeight = header.offsetHeight;
            const sectionTop = section.offsetTop;

            uiElements.modal.scrollTo({
                top: sectionTop - headerHeight - 15, // 额外减去15px作为缓冲
                behavior: 'smooth'
            });
        }
    };

    document.getElementById('scroll-to-stats-btn')?.addEventListener('click', () => scrollToSection('modal-core-stats-header'));
    document.getElementById('scroll-to-skill-tags-btn')?.addEventListener('click', () => scrollToSection('modal-skill-details-header'));
    document.getElementById('scroll-to-skill-effects-btn')?.addEventListener('click', () => scrollToSection('modal-skill-effects-section'));
    document.getElementById('scroll-to-passives-btn')?.addEventListener('click', () => scrollToSection('modal-passives-section'));
    document.getElementById('scroll-to-family-btn')?.addEventListener('click', () => scrollToSection('modal-family-bonus-section'));

    // 为标题添加返回顶部功能
    document.getElementById('modal-title-h2')?.addEventListener('click', () => {
        uiElements.modal.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // ============================================================
    // 长按标题 → 复制英雄 ID
    // ============================================================
    const detailsTitleEl = document.getElementById('modal-title-h2');
    if (detailsTitleEl && hero.heroId) {
        const LONG_PRESS_DURATION = 600; // 长按判定时长（毫秒）

        let longPressTimer = null;
        let longPressFired = false;
        let resetFiredTimer = null;

        const clearLongPressTimer = () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        };

        // 避免长按选中文字 / 弹出系统菜单
        detailsTitleEl.style.userSelect = 'none';
        detailsTitleEl.style.webkitUserSelect = 'none';
        detailsTitleEl.style.webkitTouchCallout = 'none';
        detailsTitleEl.style.touchAction = 'manipulation';

        detailsTitleEl.addEventListener('pointerdown', (e) => {
            // 只响应鼠标左键（触摸 / 笔一律响应）
            if (e.pointerType === 'mouse' && e.button !== 0) return;

            longPressFired = false;
            clearTimeout(resetFiredTimer);
            clearLongPressTimer();

            longPressTimer = setTimeout(async () => {
                longPressTimer = null;
                longPressFired = true;

                // 兜底：若随后的 click 未触发（移动端长按常见），
                // 800ms 后自动复位，避免误吞下一次正常点击
                resetFiredTimer = setTimeout(() => { longPressFired = false; }, 800);

                const copiedLabel = langDict.heroIdCopied ||
                    ((state.currentLang === 'cn' || state.currentLang === 'tc')
                        ? '已复制英雄ID'
                        : 'Hero ID copied');

                try {
                    await copyTextToClipboard(String(hero.heroId));
                    showCopyToast(`✅ ${copiedLabel}: ${hero.heroId}`);
                } catch (err) {
                    console.error('复制英雄ID失败:', err);
                    showCopyToast('❌ Copy failed');
                }
            }, LONG_PRESS_DURATION);
        });

        detailsTitleEl.addEventListener('pointerup', clearLongPressTimer);
        detailsTitleEl.addEventListener('pointerleave', clearLongPressTimer);
        detailsTitleEl.addEventListener('pointercancel', clearLongPressTimer);

        // 阻止移动端长按弹出"保存图片 / 复制"等系统菜单
        detailsTitleEl.addEventListener('contextmenu', (e) => e.preventDefault());

        // 长按已触发时，拦截随后的 click，避免触发原本绑在
        // #modal-title-h2 上的"滚动回顶部"逻辑。
        // 注意：#modal-title-h2 自身已有 click 处理器，同元素上的捕获
        // 监听器不保证先执行，所以在父元素 .details-header-main 捕获阶段拦截。
        const headerMain = modalContent.querySelector('.details-header-main');
        if (headerMain) {
            headerMain.addEventListener('click', (e) => {
                if (longPressFired && e.target.closest('#modal-title-h2')) {
                    longPressFired = false;
                    clearTimeout(resetFiredTimer);
                    e.stopPropagation();
                    e.preventDefault();
                }
            }, true);
        }
    }


    // 统一处理所有可折叠区块及其状态记忆
    modalContent.querySelectorAll('[data-cookie]').forEach(header => {
        const button = header.querySelector('.toggle-button');
        const contentId = header.dataset.target;
        const cookieName = header.dataset.cookie;
        const contentElement = document.getElementById(contentId);

        if (!button || !contentElement || !cookieName) return;

        // 1. 恢复状态：从Cookie读取状态并应用
        const savedState = getCookie(cookieName);
        const shouldExpand = (savedState === 'expanded'); // 默认折叠，只有当cookie明确记录为'expanded'时才展开
        contentElement.classList.toggle('collapsed', !shouldExpand);
        button.classList.toggle('expanded', shouldExpand);

        // 2. 绑定事件到整个header
        header.addEventListener('click', () => {
            // 【核心修改】移除了之前限制点击区域的if判断，现在整个header都可触发
            const isCurrentlyCollapsed = contentElement.classList.contains('collapsed');

            contentElement.classList.toggle('collapsed', !isCurrentlyCollapsed);
            button.classList.toggle('expanded', isCurrentlyCollapsed);

            // 3. 保存新状态到Cookie
            const newState = isCurrentlyCollapsed ? 'expanded' : 'collapsed';
            setCookie(cookieName, newState, 365);
        });
    });
    // 动态伤害值计算逻辑，确保始终执行
    // 1. 定义一个 settings 对象，从“高级筛选”面板获取当前的全局设置。
    const settingsToUse = {
        lb: filterInputs.defaultLimitBreakSelect.value,
        talent: filterInputs.defaultTalentSelect.value,
        strategy: filterInputs.defaultTalentStrategySelect.value,
        manaPriority: filterInputs.defaultManaPriorityCheckbox.checked,
        // 服装奖励：读选择器（默认已选中「最多套」）；
        // 没有选择器（无服装奖励表 / 未开天赋面板）⇒ 直接用最多套（无表时 costumeBonusEntry 返回 null，等于不加）
        costume: readCostumeSets()
    };

    // 2. 无论天赋详情UI是否显示，都根据全局设置计算英雄的最终属性。
    const initialStats = calculateHeroStats(hero, settingsToUse);

    // 3. 立即调用函数，使用计算出的攻击力去更新模态框中的DoT伤害值。
    updateDynamicDoTDisplay(hero, initialStats.attack);

    // 移动端选项卡切换逻辑
    const tabsContainer = modalContent.querySelector('.mobile-tabs-container');
    if (tabsContainer) {
        tabsContainer.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON') {
                const tabId = event.target.dataset.tab;
                modalContent.querySelectorAll('.tab-link').forEach(btn => btn.classList.remove('active'));
                modalContent.querySelectorAll('.mobile-tab-content').forEach(panel => panel.classList.remove('active'));
                event.target.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            }
        });
    }

    // ▼▼▼ 将头像容器的 CSS 类切换逻辑移至外部，确保始终执行 ▼▼▼
    const avatarContainerModal = modalContent.querySelector('.hero-avatar-container-modal');
    if (avatarContainerModal) {
        // 根据全局设置，判断是否为 LB2 状态并切换 .is-lb2 类
        avatarContainerModal.classList.toggle('is-lb2', settingsToUse.lb === 'lb2');

        // 根据全局设置，判断是否有天赋节点并切换 .has-talents 类
        const initialNodeCount = parseInt(settingsToUse.talent.replace('talent', ''), 10) || 0;
        avatarContainerModal.classList.toggle('has-talents', initialNodeCount > 0);
    }

    // ▼▼▼ 始终根据全局默认设置，渲染初始段位信息 ▼▼▼
    const rankContainer = document.getElementById('modal-rank-container');
    if (rankContainer) {
        // 1. 从全局筛选器获取默认设置
        const defaultLbSetting = uiElements.filterInputs.defaultLimitBreakSelect.value;
        const defaultTalentSetting = uiElements.filterInputs.defaultTalentSelect.value;

        // 2. 根据默认天赋设置，近似计算初始天赋节点数
        const initialNodeCount = parseInt(defaultTalentSetting.replace('talent', ''), 10) || 0;

        // 3. 生成并插入HTML
        const rankHtml = generateRankHtml(hero, defaultLbSetting, defaultTalentSetting, initialNodeCount);
        if (rankHtml) {
            rankContainer.innerHTML = rankHtml;
            // 首次渲染时添加入场动画
            const rankContainerInner = rankContainer.querySelector('.hero-avatar-rank-container');
            if (rankContainerInner) {
                rankContainerInner.classList.add('animate-rank-in');
            }
        }
    }

    // 天赋系统相关逻辑 (如果启用)
    if (filterInputs.showLbTalentDetailsCheckbox.checked) {
        const modalLbSelect = document.getElementById('modal-limit-break-select');
        const modalTalentSelect = document.getElementById('modal-talent-select');
        const modalStrategySelect = document.getElementById('modal-talent-strategy-select');
        const modalManaCheckbox = document.getElementById('modal-mana-priority-checkbox');
        // 用于在内存中缓存天赋树计算出的最新加成状态
        let currentTalentBonuses = { attack_flat: 0, attack_percent: 0, defense_flat: 0, defense_percent: 0, health_flat: 0, health_percent: 0, mana_percent: 0, healing_percent: 0, crit_percent: 0 };
        let currentNodeCount = 0;

        const updateRankDisplay = (currentNodeCount = -1) => {
            const lbSetting = modalLbSelect.value;
            const talentSetting = modalTalentSelect.value;
            const rankContainer = document.getElementById('modal-rank-container');

            if (!rankContainer) return;

            // 检查容器在更新前是否已有内容
            const hadContent = rankContainer.hasChildNodes();

            let talentCountToUse = 0;
            if (currentNodeCount !== -1) {
                talentCountToUse = currentNodeCount;
            } else {
                talentCountToUse = parseInt(talentSetting.replace('talent', ''), 10) || 0;
            }

            const newHtml = generateRankHtml(hero, lbSetting, talentSetting, talentCountToUse);
            const hasNewContent = newHtml.trim() !== '';

            // 更新HTML内容
            rankContainer.innerHTML = newHtml;

            // 仅在容器之前为空、现在有内容时，才触发一次动画
            // 由于现在总是预先渲染，hadContent 几乎总是 true，所以这个动画逻辑主要由上面的初始渲染代码触发。
            if (!hadContent && hasNewContent) {
                const newRankContainerInner = rankContainer.querySelector('.hero-avatar-rank-container');
                if (newRankContainerInner) {
                    newRankContainerInner.classList.add('animate-rank-in');
                }
            }
        };

        const settingsToUse = {
            lb: filterInputs.defaultLimitBreakSelect.value,
            talent: filterInputs.defaultTalentSelect.value,
            strategy: filterInputs.defaultTalentStrategySelect.value,
            manaPriority: filterInputs.defaultManaPriorityCheckbox.checked
        };

        modalLbSelect.value = settingsToUse.lb;
        modalTalentSelect.value = settingsToUse.talent;
        modalStrategySelect.value = settingsToUse.strategy;
        modalManaCheckbox.checked = settingsToUse.manaPriority;

        function _updateModalStatsWithBonuses(hero, settings, bonuses, nodeCount) {
            let baseStats = { power: hero.power || 0, attack: hero.attack || 0, defense: hero.defense || 0, health: hero.health || 0 };
            if (settings.lb === 'lb1' && hero.lb1) baseStats = { ...hero.lb1 };
            else if (settings.lb === 'lb2' && hero.lb2) baseStats = { ...hero.lb2 };
            // 服装奖励（「服装奖励」下拉；默认最多套）
            const _cb = costumeBonusEntry(hero, settings.costume);
            if (_cb) {
                baseStats.attack = applyStatPerMil(baseStats.attack, _cb.attackBonusPerMil);
                baseStats.defense = applyStatPerMil(baseStats.defense, _cb.defenseBonusPerMil);
                baseStats.health = applyStatPerMil(baseStats.health, _cb.healthBonusPerMil);
            }
            let finalStats = { ...baseStats };
            if (nodeCount > 0 && bonuses) {
                finalStats.attack += bonuses.attack_flat + Math.floor(baseStats.attack * (bonuses.attack_percent / 100));
                finalStats.defense += bonuses.defense_flat + Math.floor(baseStats.defense * (bonuses.defense_percent / 100));
                finalStats.health += bonuses.health_flat + Math.floor(baseStats.health * (bonuses.health_percent / 100));
            }
            const STAR_BASE_POWER = { 1: 0, 2: 10, 3: 30, 4: 50, 5: 90 };
            finalStats.power = (STAR_BASE_POWER[hero.rarity] || 0) + Math.floor((baseStats.attack * 0.35) + (baseStats.defense * 0.28) + (baseStats.health * 0.14)) + 35 + (nodeCount * 5);
            modal.querySelector('.details-stats-grid > div:nth-child(1) p').innerHTML = `💪 ${finalStats.power || 0}`;
            modal.querySelector('.details-stats-grid > div:nth-child(2) p').innerHTML = `⚔️ ${finalStats.attack || 0}`;
            modal.querySelector('.details-stats-grid > div:nth-child(3) p').innerHTML = `🛡️ ${finalStats.defense || 0}`;
            modal.querySelector('.details-stats-grid > div:nth-child(4) p').innerHTML = `❤️ ${finalStats.health || 0}`;
            updateDynamicDoTDisplay(hero, finalStats.attack);
        }

        function _updateBonusAndCostDisplay(bonuses, nodeCount, baseStats) {
            const bonusDisplay = document.getElementById('modal-talent-bonus-display');
            const calculatedBonuses = {
                attack: bonuses.attack_flat + Math.floor((baseStats.attack || 0) * (bonuses.attack_percent / 100)),
                defense: bonuses.defense_flat + Math.floor((baseStats.defense || 0) * (bonuses.defense_percent / 100)),
                health: bonuses.health_flat + Math.floor((baseStats.health || 0) * (bonuses.health_percent / 100)),
                mana: bonuses.mana_percent,
                healing: bonuses.healing_percent,
                crit: bonuses.crit_percent
            };
            const iconMap = { attack: 'attack.webp', defense: 'defense.webp', health: 'health.webp', mana: 'mana.webp', healing: 'healing.webp', crit: 'critical.webp' };
            const bonusMap = {
                attack: { value: calculatedBonuses.attack, label: langDict.attackBonusLabel, isPercent: false },
                defense: { value: calculatedBonuses.defense, label: langDict.defenseBonusLabel, isPercent: false },
                health: { value: calculatedBonuses.health, label: langDict.healthBonusLabel, isPercent: false },
                mana: { value: calculatedBonuses.mana, label: langDict.manaBonusLabel, isPercent: true },
                healing: { value: calculatedBonuses.healing, label: langDict.healingBonusLabel, isPercent: true },
                crit: { value: calculatedBonuses.crit, label: langDict.critBonusLabel, isPercent: true }
            };
            let bonusHTML = '';
            for (const key in bonusMap) {
                const bonus = bonusMap[key];
                if (bonus.value > 0) {
                    bonusHTML += `<div class="bonus-item"><img loading="lazy" src="imgs/talents/${iconMap[key]}" decoding="async" class="bonus-icon" alt="${bonus.label}">${bonus.label}<span>+${bonus.value}${bonus.isPercent ? '%' : ''}</span></div>`;
                }
            }
            bonusDisplay.innerHTML = bonusHTML || `<div class="bonus-item">${langDict.noBonusLabel}</div>`;

            const costs = { emblem: 0, food: 0, iron: 0, masterEmblem: 0 };
            const relevantCosts = costData.filter(item => Math.floor(item.slot / 100) === hero.rarity);
            for (let i = 0; i < nodeCount; i++) {
                if (relevantCosts[i]) {
                    costs.emblem += parseInt(relevantCosts[i].emblem) || 0;
                    costs.food += parseInt(String(relevantCosts[i].food).replace(/,/g, '')) || 0;
                    costs.iron += parseInt(String(relevantCosts[i].iron).replace(/,/g, '')) || 0;
                    costs.masterEmblem += parseInt(relevantCosts[i].masteremblem) || 0;
                }
            }
            document.getElementById('cost-emblem').textContent = costs.emblem.toLocaleString();
            document.getElementById('cost-food').textContent = costs.food.toLocaleString();
            document.getElementById('cost-iron').textContent = costs.iron.toLocaleString();
            document.getElementById('cost-master-emblem').textContent = costs.masterEmblem.toLocaleString();
        }

        const talentChangeCallback = (bonuses, nodeCount) => {
            currentTalentBonuses = bonuses;
            currentNodeCount = nodeCount;
            updateCommonUI(bonuses, nodeCount);
        };

        // 一个通用的UI更新函数
        const updateCommonUI = (bonuses, nodeCount) => {
            const settings = {
                lb: modalLbSelect.value,
                talent: modalTalentSelect.value,
                costume: readCostumeSets()
            };
            _updateModalStatsWithBonuses(hero, settings, bonuses, nodeCount);

            let baseStats = { attack: hero.attack, defense: hero.defense, health: hero.health };
            if (settings.lb === 'lb1' && hero.lb1) baseStats = { ...hero.lb1 };
            else if (settings.lb === 'lb2' && hero.lb2) baseStats = { ...hero.lb2 };
            // 天赋百分比是相对"含服装奖励"的属性算的 ⇒ 这里也要先套上服装奖励
            const _cb2 = costumeBonusEntry(hero, settings.costume);
            if (_cb2) {
                baseStats.attack = applyStatPerMil(baseStats.attack, _cb2.attackBonusPerMil);
                baseStats.defense = applyStatPerMil(baseStats.defense, _cb2.defenseBonusPerMil);
                baseStats.health = applyStatPerMil(baseStats.health, _cb2.healthBonusPerMil);
            }
            _updateBonusAndCostDisplay(bonuses, nodeCount, baseStats);
            const avatarContainerModal = modalContent.querySelector('.hero-avatar-container-modal');
            if (avatarContainerModal) {
                // 根据是否为 LB2，切换 .is-lb2 类
                avatarContainerModal.classList.toggle('is-lb2', settings.lb === 'lb2');

                // 根据是否有天赋节点，切换 .has-talents 类
                avatarContainerModal.classList.toggle('has-talents', nodeCount > 0);
            }

            updateRankDisplay(nodeCount);
        };

        // 仅用于“突破设置”的处理器，它不会触碰天赋树
        const handleStatUpdateOnly = () => {
            updateCommonUI(currentTalentBonuses, currentNodeCount);
        };

        // 仅用于天赋相关设置的处理器，它会刷新天赋树
        const handleTreeAndStatUpdate = () => {
            const newTalentLevel = modalTalentSelect.value;
            const isDisabled = (newTalentLevel === 'none');
            modalStrategySelect.disabled = isDisabled;
            modalManaCheckbox.disabled = isDisabled;

            if (typeof TalentTree !== 'undefined' && hero.class) {
                if (newTalentLevel === 'none') {
                    TalentTree.clear();
                } else {
                    TalentTree.setPath(modalStrategySelect.value, modalManaCheckbox.checked, newTalentLevel);
                }
            } else {
                handleStatUpdateOnly();
            }
        };

        // 1. 先初始化天赋树 (即使它会错误地设置下拉菜单)
        if (typeof TalentTree !== 'undefined' && hero.class) {
            TalentTree.init(document.getElementById('modal-talent-tree-wrapper'), hero.classId, settingsToUse, talentChangeCallback, langDict.talentTerms);
        }

        // 2. 然后，保存的正确设置，强制覆盖下拉菜单的值
        modalLbSelect.value = settingsToUse.lb;
        modalTalentSelect.value = settingsToUse.talent;
        modalStrategySelect.value = settingsToUse.strategy;
        modalManaCheckbox.checked = settingsToUse.manaPriority;

        // 3. 绑定事件监听器
        // 职责分离的事件监听器
        modalLbSelect.addEventListener('change', handleStatUpdateOnly);
        modalTalentSelect.addEventListener('change', handleTreeAndStatUpdate);
        modalStrategySelect.addEventListener('change', handleTreeAndStatUpdate);
        modalManaCheckbox.addEventListener('change', handleTreeAndStatUpdate);
        // 「服装奖励」选择器：点一个档位就选中它（只影响属性数值 ⇒ 走"不触碰天赋树"的那条路）
        const costumePicker = document.getElementById('modal-costume-picker');
        if (costumePicker) {
            costumePicker.addEventListener('click', (ev) => {
                const btn = ev.target.closest('.costume-opt');
                if (!btn) return;
                costumePicker.querySelectorAll('.costume-opt').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                handleStatUpdateOnly();
            });
        }

        // 4. 最后，调用一次 handleTreeAndStatUpdate 来确保天赋树的显示和段位图标都与正确的设置同步
        handleTreeAndStatUpdate();
    } else {
        // 没开"突破与天赋详情"面板 ⇒ 属性栏原来直接显示 `hero.displayStats`（那是**列表口径** =
        // 该英雄自身的服装顺序）；这里改用 `initialStats`（含「服装奖励」下拉的档位），保持与详情页一致。
        const grid = modalContent.querySelectorAll('.details-stats-grid > div p');
        if (grid.length >= 4) {
            grid[0].innerHTML = `💪 ${initialStats.power || 0}`;
            grid[1].innerHTML = `⚔️ ${initialStats.attack || 0}`;
            grid[2].innerHTML = `🛡️ ${initialStats.defense || 0}`;
            grid[3].innerHTML = `❤️ ${initialStats.health || 0}`;
        }
    }

    document.getElementById('hide-details-btn').addEventListener('click', closeDetailsModal);
    document.getElementById('hide-details-bottom-btn').addEventListener('click', closeDetailsModal);

    const favoriteBtn = document.getElementById('favorite-hero-btn');
    if (favoriteBtn) {
        const canFav = isFavoritable(hero);      // 未到发布时间(UTC 07:00) ⇒ 禁止收藏
        const updateFavoriteButton = () => {
            if (isFavorite(hero)) {
                favoriteBtn.textContent = '★';
                favoriteBtn.classList.add('favorited');
            } else {
                favoriteBtn.textContent = '☆';
                favoriteBtn.classList.remove('favorited');
            }
        };
        if (!canFav) {
            favoriteBtn.disabled = true;
            favoriteBtn.classList.add('favorite-locked');
            favoriteBtn.title = (langDict.favoriteLockedTitle || '尚未发布，暂不可收藏')
                + (hero.releaseDate ? ` (${hero.releaseDate})` : '');
        }
        favoriteBtn.addEventListener('click', () => {
            if (!isFavoritable(hero)) return;
            toggleFavorite(hero);
            updateFavoriteButton();
            const tableStar = document.querySelector(`.favorite-toggle-icon[data-hero-id="${hero.originalIndex}"]`);
            if (tableStar) {
                tableStar.textContent = isFavorite(hero) ? '★' : '☆';
                tableStar.classList.toggle('favorited', isFavorite(hero));
            }
        });
        updateFavoriteButton();
    }

    const shareBtn = document.getElementById('share-hero-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            // 身份键 = 规范 heroId（见 utils.js::heroIdentity）
            const identifier = heroIdentity(hero);
            // 分享链接**只带 `hero` 一个参数**：
            //   ⚠ 不带 `lang` —— 英雄数据存的是语言无关的身份键，接收方按自己的 cookie / 浏览器语言
            //      渲染即可；带上等于把分享者的语言强加给对方（`?lang=` 的优先级还高于 cookie）。
            //   也不带当前视图/筛选（地址栏那边才会保留，见 ui.js::openDetailsModal）。
            const url = heroUrl(identifier, false);
            copyTextToClipboard(url).then(() => {
                const originalText = shareBtn.innerHTML;
                shareBtn.innerText = '✔️';
                shareBtn.disabled = true;
                setTimeout(() => {
                    shareBtn.innerHTML = originalText;
                    shareBtn.disabled = false;
                }, 2000);
            }).catch(err => {
                console.error('复制链接失败:', err);
                alert(langDict.copyLinkFailed);
            });
        });
    }

    // 为技能标签点击筛选功能
    modalContent.addEventListener('click', (event) => {
        // ▼▼▼ 在抽奖或队伍模拟器模式下，禁用此功能 ▼▼▼
        if (state.lotterySimulatorActive || state.teamSimulatorActive) {
            return; // 直接退出
        }
        const target = event.target.closest('.skill-type-tag');
        if (!target) return;

        const filterType = target.dataset.filterType;
        let filterValue = target.dataset.filterValue;
        if (!filterType || filterValue === undefined) return;

        // 禁用“家族奖励”快速搜索功能
        if (filterType === 'familyBonus') {
            return;
        }

        // “一键搜索”复选框的逻辑保持不变
        const isQuickSearchEnabled = uiElements.filterInputs.enableSkillQuickSearchCheckbox.checked;
        if (['effects', 'passives'].includes(filterType) && !isQuickSearchEnabled) {
            return;
        }

        resetAllFilters();

        if (state.multiSelectFilters.hasOwnProperty(filterType)) {
            // 处理非文本输入的筛选器（如：颜色、职业、星级等）
            state.multiSelectFilters[filterType] = [filterValue];
            updateFilterButtonUI(filterType);
        } else if (uiElements.filterInputs[filterType]) {
            // 在生成通用搜索词之后，精准移除5个元素的关键字。
            // 使用正则表达式匹配这些单词，并用空字符串替换它们。
            // \b 是单词边界，确保我们不会错误地替换包含这些词的更长的词。
            // i 是不区分大小写标志。
            const elementKeywordsRegex = /\b(elementred|elementpurple|elementgreen|elementyellow|elementblue|elementorange)\b/gi;
            switch (filterType) {
                case 'types':
                    // 如果点击的是技能“类别”，则使用方括号[]进行完全匹配
                    uiElements.filterInputs.types.value = `[${filterValue}]`;
                    break;
                case 'effects':
                case 'passives':
                    // 如果点击的是技能或被动“描述”，则使用圆括号()进行单句匹配
                    filterValue = generateGeneralSearchTerm(filterValue);
                    filterValue = filterValue.replace(elementKeywordsRegex, '').trim(); // 移除后调用 trim() 清理多余空格
                    uiElements.filterInputs[filterType].value = `(${filterValue})`;
                    break;
                default:
                    // 其他类型（如英雄名）保持通用搜索
                    filterValue = generateGeneralSearchTerm(filterValue);
                    filterValue = filterValue.replace(elementKeywordsRegex, '').trim(); // 移除后调用 trim() 清理多余空格
                    uiElements.filterInputs[filterType].value = filterValue;
                    break;
            }
        }

        closeDetailsModal();
        applyFiltersAndRender();
    });

    // --- 检查立绘是否存在并绑定点击事件 ---
    const avatarContainer = modalContent.querySelector('.hero-avatar-container-modal');

    if (hero.heroId && avatarContainer && overlaysContainer) {
        const avatarSrc = `imgs/avatar/${hero.heroId}.webp`;

        /**
         * 判定是否显示放大镜，并返回"点击时该走动态还是静态"。
         * 优先级：
         *   1. index.json 里有此 heroId → 预加载动态（成功则用动态，失败则回退）
         *   2. 预加载失败或无动态 → 检查静态 avatar 是否存在
         *   3. 都没有 → 隐藏放大镜
         */
        const checkPortraitAvailability = async () => {
            // 1. 优先看动态立绘
            if (hero.heroId) {
                const animIndex = await loadHeroAnimationIndex();
                if (heroHasAnimation(animIndex, hero.heroId)) {
                    try {
                        await preloadHeroAnimation(hero.heroId);   // ← 缓存动态
                        return true;                                // 动态就绪
                    } catch (e) {
                        console.warn('[立绘动画] 预加载失败，尝试静态回退：', e);
                    }
                }
            }

            // 2. 动态不可用，检查静态 avatar
            try {
                const response = await fetch(avatarSrc, { method: 'HEAD' });
                return response.status === 200;
            } catch (error) {
                return false;
            }
        };

        checkPortraitAvailability().then(exists => {
            if (exists) {
                avatarContainer.classList.add('is-clickable');
                overlaysContainer.style.pointerEvents = 'auto'; // 让覆盖层可点击

                // 在英雄图标下半部分添加查看立绘提示图标
                const viewAvatarIcon = document.createElement('img');
                viewAvatarIcon.src = 'imgs/other/view_avatar.webp';
                viewAvatarIcon.className = 'view-avatar-icon';
                viewAvatarIcon.style.position = 'absolute';
                viewAvatarIcon.style.top = '33px';
                viewAvatarIcon.style.right = '9px';
                viewAvatarIcon.style.zIndex = '5';
                viewAvatarIcon.style.width = '32px';
                viewAvatarIcon.style.height = '32px';
                viewAvatarIcon.style.opacity = '1';
                viewAvatarIcon.style.pointerEvents = 'none'; // 确保不干扰点击
                viewAvatarIcon.style.userSelect = 'none'; // 防止用户选择

                // 将提示图标添加到头像容器
                avatarContainer.appendChild(viewAvatarIcon);

                const openImageModal = async () => {
                    // 防止网络延迟期间重复点击
                    if (_portraitClickLock) return;
                    _portraitClickLock = true;
                    const imageModal = document.getElementById('image-modal');
                    const imageModalOverlay = document.getElementById('image-modal-overlay');
                    const imageModalContent = document.getElementById('image-modal-content');

                    if (!imageModal || !imageModalOverlay || !imageModalContent) return;

                    // 清空之前的内容
                    imageModalContent.innerHTML = '';

                    // ▼▼▼ 新增：释放上一次可能残留的动态立绘播放器 ▼▼▼
                    disposeActiveAnimationPlayer();

                    // ---------- 判断该英雄是否有动态立绘 ----------
                    // 读取 imgs/animation/index.json，判断 heroId 是否在列表中
                    // 有则走 canvas 精灵动画；无则回退到原来的静态立绘逻辑
                    let hasAnimation = false;
                    if (hero.heroId) {
                        const animIndex = await loadHeroAnimationIndex();
                        hasAnimation = heroHasAnimation(animIndex, hero.heroId);
                    }

                    // ---------- 1. 搭好外层容器（背景卡 + 光效）----------
                    // 定义获取背景后缀的函数
                    const getBackgrounSuffix = (family, costumeId) => {
                        // ✅ 只在这里算一次，全程复用，杜绝任何裸调用
                        const colorKey = getSafeColorKey(hero.elementId);

                        // 优先处理 classic 家族
                        if (family === 'classic') {
                            const classicMap = {
                                3: 'cute',
                                4: 'stainedglass',
                                5: 'stylish'
                            };
                            if (hero.rarity === 3) {
                                costumeId = costumeId + 1;
                            }
                            if (costumeId <= 2) {
                                return colorKey;
                            } else if (costumeId === 3) {
                                return colorKey + "_" + classicMap[costumeId];
                            } else if (costumeId >= 4) {
                                return classicMap[costumeId] + "_" + colorKey;
                            }
                            return colorKey;
                        }

                        // 家族 → 背景后缀映射
                        const familyToBgMap = {
                            'abyss': 's4',
                            'tales1_goodies': 'tales1',
                            'tales1_baddies': 'tales1',
                            'nidavellir': 'tales2',
                            'myrkheim': 'tales2',
                            'astral_elves': 'astral',
                            'astral_dwarfs': 'astral',
                            'astral_demons': 'astral',
                            'investigator': 'shadow',
                            'cultist': 'shadow',
                            'forsaken': 'shadow',
                            'institute': 'shadow',
                            'garrison': 'garrison_guard',
                            'super_elemental': 'elemental',
                            'wolf': 'castle',
                            'raven': 'castle',
                            'stag': 'castle',
                            'bear': 'castle',
                            'plains_hunter': 'monsterisland',
                            'abyss_hunter': 'monsterisland',
                            'jungle_hunter': 'monsterisland',
                            'zodiac': 'lunar',
                            'cupid': 'valentines',
                            'easter': 'spring',
                            'halloween': 'vampires',
                            'fleur_de_sang': 'fleurdesang',
                            'winter': 'christmas',
                            'opera': 'ballerina',
                            'knight': 'knights',
                            'fable': 'fables',
                            'shady_scoundrels': 'scoundrel',
                        };

                        const srcKey = String(hero.sourceId || '').toLowerCase();

                        if (hero.family && (hero.family.includes('hotm') || hero.family === 'mystery')) {
                            return colorKey + "_alt";
                        } else if (srcKey === 'season2') {
                            if (hero.family === 'japanese') {
                                return "s2oriental";
                            } else {
                                return "s2" + family;
                            }
                        } else if (srcKey === 'season3') {
                            if (hero.family === 'jotunheim' || hero.family === 'niflheim') {
                                return "s3stronghold";
                            } else if (hero.family === 'midgard' || hero.family === 'alfheim') {
                                return "s3mountains";
                            } else {
                                return "s3menacing";
                            }
                        } else if (srcKey === 'season5') {
                            return "s5" + family;
                        } else if (hero.family === 'gargoyle') {
                            if (hero.passiveSkills && hero.passiveSkills.includes('gargoyle_soft_skin')) {
                                return "fluffygargoyle";
                            } else {
                                return "gargoyle";
                            }
                        } else if (hero.family === 'sand') {
                            if (costumeId === 0) {
                                return "summer";
                            } else {
                                return "beachparty";
                            }
                        } else if (hero.family === 'mimic' || hero.family === 'trainer') {
                            return "mimic_training_" + colorKey;
                        } else {
                            return familyToBgMap[family] || family;
                        }
                    };

                    // 创建英雄立绘外层容器
                    const portraitContainer = document.createElement('div');
                    portraitContainer.className = 'hero-portrait-container';
                    portraitContainer.style.position = 'relative';
                    portraitContainer.style.display = 'inline-block';
                    portraitContainer.style.maxWidth = '85vw';
                    portraitContainer.style.maxHeight = '85vh';

                    // 添加点击关闭功能
                    portraitContainer.addEventListener('click', closeHeroPortraitModal);

                    const bgSuffix = getBackgrounSuffix(hero.family, hero.costume_id);

                    // 创建最底层背景图片元素
                    const cardBgImage = document.createElement('img');
                    cardBgImage.src = `imgs/herocard/herocard_${bgSuffix}.webp`;
                    cardBgImage.className = 'hero-card-bg';
                    cardBgImage.style.position = 'absolute';
                    cardBgImage.style.top = '50%';
                    cardBgImage.style.left = '50%';
                    cardBgImage.style.transform = 'translate(-50%, -50%)';
                    cardBgImage.style.zIndex = '0'; // 最底层
                    cardBgImage.style.opacity = '1';
                    cardBgImage.style.pointerEvents = 'none';
                    cardBgImage.style.maxWidth = '110vw';
                    cardBgImage.style.maxHeight = '110vh';
                    cardBgImage.style.borderRadius = '20%';

                    // --- 调整渐变范围 ---
                    const maskStyle = 'radial-gradient(circle at center, black 50%, rgba(0,0,0,0.3) 80%, transparent 100%)';

                    // 应用遮罩
                    cardBgImage.style.maskImage = maskStyle;
                    cardBgImage.style.setProperty('-webkit-mask-image', maskStyle);

                    portraitContainer.appendChild(cardBgImage);

                    // 检查是否立绘光效
                    const showCircleRay = getCookie('showCircleRay') !== 'false';
                    let raysImage = null;
                    if (showCircleRay) {
                        // 创建光效图片（作为子元素）
                        /*
                        // 可以定义不同家族对应的光效范围
                        const getRaysRangeForFamily = (family) => {
                            const ranges = {
                                'magic_carpet': { min: 46, max: 47 },
                                // 其他家族的特殊范围
                                // 'other_family': { min: 48, max: 50 },
                            };
                            return ranges[family] || { min: 1, max: 45 };
                        };
                        const range = getRaysRangeForFamily(hero.family);
                        const randomRaysNumber = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
                        */
                        const randomRaysNumber = Math.floor(Math.random() * 94) + 1;
                        raysImage = document.createElement('img');
                        raysImage.src = `imgs/circle_rays/${randomRaysNumber}.webp`;
                        raysImage.className = 'rays-background';
                        raysImage.style.position = 'absolute';
                        raysImage.style.top = '60%';
                        raysImage.style.left = '50%';
                        raysImage.style.transform = 'translate(-50%, -50%)';
                        raysImage.style.zIndex = '1';
                        raysImage.style.opacity = '1';
                        raysImage.style.pointerEvents = 'none';
                        raysImage.style.maxWidth = '110vw';
                        raysImage.style.maxHeight = '110vh';

                        // 根据英雄颜色设置光效滤镜
                        const colorFilter = getColorFilterForHero(hero.elementId);
                        const brightnessLevel = 1.2; // 1 为默认亮度，值越大，亮度越高
                        raysImage.style.filter = `${colorFilter} brightness(${brightnessLevel})`;
                        portraitContainer.appendChild(raysImage);
                    }

                    // ---------- 2. 立绘位：根据是否有动态立绘，选择 canvas 或 avatar 图片 ----------
                    // 两者共用同一位置（z-index=2），尺寸规则也完全一致（85vw × 85vh）

                    // ▼▼▼ 动态立绘路径（新增）▼▼▼
                    if (hasAnimation) {
                        try {
                            _activeAnimationPlayer = await createHeroAnimationPlayer(portraitContainer, hero.heroId, {
                                // 让 canvas 尺寸确定后，同步光效尺寸（与静态逻辑一致）
                                onCanvasResize: (w, h) => {
                                    if (raysImage) {
                                        raysImage.style.width = w + 'px';
                                        raysImage.style.height = h + 'px';
                                    }
                                }
                            });
                        } catch (e) {
                            console.error('[立绘动画] 加载失败，回退到静态立绘：', e);
                            // 清理可能残留的 canvas
                            portraitContainer.querySelectorAll('canvas').forEach(c => c.remove());
                            disposeActiveAnimationPlayer();
                            hasAnimation = false;
                        }
                    }

                    // ▼▼▼ 静态立绘路径（原有逻辑）▼▼▼
                    if (!hasAnimation) {
                        // 创建英雄立绘图片
                        const heroImage = document.createElement('img');
                        heroImage.src = `imgs/avatar/${hero.heroId}.webp`;
                        heroImage.className = 'hero-portrait-image';
                        heroImage.style.position = 'relative';
                        heroImage.style.zIndex = '2';
                        heroImage.style.display = 'block';
                        heroImage.style.transform = 'translateY(8%)';
                        heroImage.style.maxWidth = '85vw';
                        heroImage.style.maxHeight = '85vh';
                        heroImage.style.width = 'auto';
                        heroImage.style.height = 'auto';
                        heroImage.style.opacity = '0';

                        // 立绘图片添加点击关闭功能
                        heroImage.addEventListener('click', closeHeroPortraitModal);

                        // 将立绘添加到容器
                        portraitContainer.appendChild(heroImage);

                        // 图片加载完成后计算精确尺寸
                        heroImage.onload = function () {
                            const maxWidth = window.innerWidth * 0.85;
                            const maxHeight = window.innerHeight * 0.85;

                            const imgWidth = this.naturalWidth;
                            const imgHeight = this.naturalHeight;

                            const widthRatio = maxWidth / imgWidth;
                            const heightRatio = maxHeight / imgHeight;
                            const scale = Math.min(widthRatio, heightRatio, 1);

                            const finalWidth = imgWidth * scale;
                            const finalHeight = imgHeight * scale;

                            this.style.width = finalWidth + 'px';
                            this.style.height = finalHeight + 'px';

                            if (showCircleRay) {
                                raysImage.style.width = finalWidth + 'px';
                                raysImage.style.height = finalHeight + 'px';
                            }

                            setTimeout(() => {
                                this.style.opacity = '1';
                                this.style.transition = 'opacity 0.3s ease';
                            }, 10);
                        };
                    }

                    // ---------- 3. 将外层容器挂到模态框并显示 ----------
                    imageModalContent.appendChild(portraitContainer);

                    // 显示立绘模态框并添加到堆栈
                    imageModal.classList.add('show-hero-portrait');
                    imageModal.classList.remove('hidden');
                    imageModalOverlay.classList.remove('hidden');

                    // 将立绘模态框加入到模态框堆栈
                    history.pushState({ modal: 'heroPortrait' }, null);
                    state.modalStack.push('heroPortrait');

                    // 解锁，允许后续再次点击打开
                    _portraitClickLock = false;
                };

                overlaysContainer.addEventListener('click', openImageModal);
            } else {
                overlaysContainer.style.pointerEvents = 'none';
            }
        });
    }


}

/**
 * 渲染兑换码模态框内容（升级版）
 */
function renderRedeemCodesModal() {
    const langDict = i18n[state.currentLang];
    const contentEl = document.getElementById('redeem-codes-content');

    contentEl.innerHTML = '';

    redeemcodes.forEach(codeData => {
        const isRedeemed = state.redeemedCodes.has(codeData.code);
        const buttonText = isRedeemed ? `${langDict.redeemBtn} ✅` : langDict.redeemBtn;
        const buttonClass = isRedeemed ? 'action-button redeem-btn redeemed' : 'action-button redeem-btn';

        // 创建奖励物品HTML
        const rewardsHTML = codeData.rewards.map(reward => `
            <div class="reward-item">
                <img loading="lazy" src="${reward.img}" decoding="async" alt="Reward Image" class="reward-icon">
                <span class="reward-count">×${reward.num}</span>
            </div>
        `).join('');

        const codeRowHTML = `
            <div class="redeem-code-row">
                <div class="rewards-container">
                    ${rewardsHTML}
                </div>
                <div class="redeem-code-actions">
                <span class="code-text">${codeData.code}</span>
                    <a href="https://www.empiresandpuzzles.com/redeem?code=${codeData.code}" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="${buttonClass}" 
                       data-code="${codeData.code}">
                       ${buttonText}
                    </a>
                </div>
            </div>
        `;

        contentEl.innerHTML += codeRowHTML;
    })

    // 添加事件监听器
    contentEl.addEventListener('click', function (event) {
        const redeemButton = event.target.closest('.redeem-btn');
        if (redeemButton) {
            const code = redeemButton.dataset.code;
            if (code) {
                state.redeemedCodes.add(code);
                try {
                    localStorage.setItem('redeemedCodes', JSON.stringify(Array.from(state.redeemedCodes)));
                } catch (e) {
                    console.error("无法保存兑换码到 localStorage:", e);
                }
                redeemButton.innerHTML = `${langDict.redeemBtn} ✅`;
                redeemButton.classList.add('redeemed');
            }
        }
    });

    // 更新兑换码数量显示
    updateRedeemCodeCount();
}

/**
 * 根据英雄颜色获取对应的光效滤镜
 * @param {string} color - 英雄颜色
 * @returns {string} CSS滤镜字符串
 */
function getColorFilterForHero(color) {
    const colorMap = {
        'red': 'drop-shadow(0 0 20px #ff7a4c) brightness(1.2)',
        'blue': 'drop-shadow(0 0 20px #41d8fe) brightness(1.2)',
        'green': 'drop-shadow(0 0 20px #70e92f) brightness(1.2)',
        'yellow': 'drop-shadow(0 0 20px #f2e33a) brightness(1.2)',
        'purple': 'drop-shadow(0 0 20px #e290ff) brightness(1.2)'
    };

    const colorKey = String(color || '').toLowerCase();
    return colorMap[colorKey] || colorMap['white']; // 默认使用白色光效
}
