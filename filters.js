

/**
 * 从 localStorage 获取收藏列表。
 * @returns {string[]} 收藏的英雄标识符数组。
 */
function getFavorites() {
    try {
        const favorites = localStorage.getItem('heroFavorites');
        return favorites ? JSON.parse(favorites) : [];
    } catch (e) {
        console.error("从 localStorage 获取收藏夹失败", e);
        return [];
    }
}

/**
 * 将收藏列表保存到 localStorage。
 * @param {string[]} favoritesArray - 要保存的收藏英雄数组。
 */
function saveFavorites(favoritesArray) {
    try {
        localStorage.setItem('heroFavorites', JSON.stringify(favoritesArray));
    } catch (e) {
        console.error("保存收藏夹到 localStorage 失败", e);
    }
}

/**
 * 检查一个英雄是否已被收藏。
 * @param {object} hero - 英雄对象。
 * @returns {boolean} 是否被收藏。
 */
function isFavorite(hero) {
    if (!hero.english_name) return false;
    const favorites = getFavorites();
    const identifier = `${hero.english_name}-${hero.costume_id}`;
    return favorites.includes(identifier);
}

/**
 * 切换一个英雄的收藏状态。
 * @param {object} hero - 英雄对象。
 * @returns {boolean} 切换后的收藏状态 (true 为已收藏)。
 */
function toggleFavorite(hero) {
    if (!hero.english_name) {
        console.warn("无法收藏没有英文名的英雄:", hero.name);
        return false;
    }
    let favorites = getFavorites();
    const identifier = `${hero.english_name}-${hero.costume_id}`;
    const index = favorites.indexOf(identifier);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(identifier);
    }
    saveFavorites(favorites);
    return index === -1;
}

// ▼▼▼▼▼ 定义四个技能分类的排序规则 ▼▼▼▼▼
const skillTagOrder_base = ["治疗：复活", "治疗：即时", "治疗：提高生命", "治疗：持续", "治疗：特殊", "治疗：伤害量", "攻击：单体", "攻击：随机", "攻击-额外攻击", "攻击：数量变化", "攻击：两侧", "攻击：邻近轻伤", "攻击：范围", "攻击-连锁", "攻击：全体", "伤害：持续伤害"];
const skillTagOrder_special = ["法力-削减法力", "法力-摧毁小兵获得法力", "法力-法力恢复（击杀）", "法力-面板：法力生成", , "攻击-偷取小兵", "攻击-回溯/偷取技能", "攻击-摧毁小兵", "攻击-无视闪避", "攻击-穿透/绕过", "攻击-穿透小兵", "攻击-赌博/随机效果", "攻击-面板：攻击力", "攻击-面板：暴击", "伤害-伤害↑：冰霜", "伤害-伤害↑：暗黑", "伤害-伤害↑：火焰", "伤害-伤害↑：神圣", "伤害-伤害↑：自然", "伤害-爆炸", "伤害-移除小兵造成伤害", "伤害-面板：提高伤害", "伤害-额外伤害", "治疗-自我恢复", "治疗-通过伤害治疗", "治疗-通过小兵治疗", "召唤-小兵", "召唤-恶魔", "召唤-摧毁恶魔", "召唤-超级小兵", "召唤-超级恶魔", "状态-偷取增益", "状态-减少状态异常回合", "状态-减少增益回合", "状态-替换为增益", "状态-替换为负面效果", "状态-增益重新分配", "状态-负面效果重新分配", "状态-重置增益回合", "状态-重置负面效果回合"];
const skillTagOrder_buff = ["状态-驱散增益", "状态-阻止增益驱散", "状态-免疫状态异常", "状态-阻止负面效果", "状态-反弹负面效果", "法力-法力生成↑", "法力-法力恢复", "法力-叠加：法力生成↑", "攻击-攻击力↑", "攻击-成长：攻击力↑", "攻击-叠加：攻击力↑", "攻击-暴击率↑", "攻击-穿透/绕过", "防御-拟态", "防御-闪避", "防御-伤害减免", "防御-伤害分担", "防御-防御力↑", "防御-成长：防御力↑", "防御-叠加：防御力↑", "防御-防御↑：特殊技能", "防御-反击/反弹", "防御-反击/反弹：冰霜", "防御-反击/反弹：暗黑", "防御-反击/反弹：火焰", "防御-反击/反弹：神圣", "防御-反击/反弹：自然", "防御-防御↑：冰霜", "防御-防御↑：暗黑", "防御-防御↑：火焰", "防御-防御↑：神圣", "防御-防御↑：自然", "防御-嘲讽", "治疗-自我复活", "治疗-自我恢复", "治疗-治疗量↑", "治疗-叠加：生命恢复", "治疗-阻止最大生命值↓", "状态-潜行/幽灵形态", "状态-阻止恶魔"];
const skillTagOrder_debuff = ["状态-净化状态异常", "状态-阻止净化", "状态-增益无效化", "状态-反弹增益", "法力-法力偷取", "法力-法力生成↓/阻止", "法力-叠加：法力生成↓", "法力-混乱/沉默/睡眠", "法力-麻痹", "攻击-攻击力↓", "攻击-衰退：攻击力↓", "攻击-叠加：攻击力↓", "攻击-命中率↓", "伤害-叠加：持续伤害", "伤害-持续伤害：冰冻", "伤害-持续伤害：毒", "伤害-持续伤害：水", "伤害-持续伤害：沙", "伤害-持续伤害：流血", "伤害-持续伤害：燃烧", "伤害-持续伤害：生命偷取", "伤害-持续伤害：诅咒", "防御-受到伤害↑", "防御-叠加：受到伤害↑", "防御-防御力↓", "防御-衰退：防御力↓", "防御-叠加：防御力↓", "防御-防御↓：特殊技能", "防御-防御↓：冰霜", "防御-防御↓：暗黑", "防御-防御↓：火焰", "防御-防御↓：神圣", "防御-防御↓：自然", "防御-改变颜色/位置", "治疗-偷取治疗","治疗-最大生命值↓","治疗-治疗量↓","治疗-阻止复活","治疗-阻止治疗","状态-吞噬粘物","状态-天赋技能无效化","状态-狂乱","状态-自我减益","状态-重置负面效果回合","状态-阻止小兵"];

/**
 * 填充所有筛选器按钮和选项。
 * 此函数会遍历所有英雄数据，提取出所有唯一的星级、颜色、职业等，并动态创建筛选按钮。
 */
function populateFilters() {
    // 这部分构建映射的逻辑不变，请保留
    state.allHeroes.forEach(hero => {
        const skillInfo = hero.cn_skill_info || hero.jp_skill_info;
        if (Array.isArray(skillInfo)) {
            skillInfo.forEach(categoryObject => {
                const categoryName = Object.keys(categoryObject)[0];
                const tags = categoryObject[categoryName];
                if (Array.isArray(tags)) {
                    tags.forEach(tag => {
                        if (!state.skillTagToCategoryMap[tag]) {
                            state.skillTagToCategoryMap[tag] = categoryName;
                        }
                    });
                }
            });
        }
    });

    const filtersToConvert = [
        'filterScope', 'star', 'color', 'speed', 'class', 'costume', 'family', 'source', 'aetherpower',
        'skillTag_base', 'skillTag_special', 'skillTag_buff', 'skillTag_debuff'
    ];

    const langDict = i18n[state.currentLang];
    const allFilterKeys = filtersToConvert;

    allFilterKeys.forEach(key => {
        let values;

        // --- 步骤 1: 收集当前语言的原始数据 ---
        if (key === 'filterScope') {
            values = ['all', 'hero', 'skin', 'favorites'];
        } else if (key === 'costume') {
            values = [...new Set(state.allHeroes.map(h => getSkinInfo(h).skinIdentifier).filter(Boolean))];
        } else if (key.startsWith('skillTag_')) {
            const dataKeyMap = { skillTag_base: '基础技能', skillTag_special: '特殊效果', skillTag_buff: '增益效果', skillTag_debuff: '负面效果' };
            const targetDataKey = dataKeyMap[key];
            const skillSet = new Set();
            state.allHeroes.forEach(hero => {
                const skillInfo = hero.cn_skill_info || hero.jp_skill_info;
                if (Array.isArray(skillInfo)) {
                    skillInfo.forEach(categoryObject => {
                        if (categoryObject[targetDataKey]) {
                            categoryObject[targetDataKey].forEach(tag => skillSet.add(tag));
                        }
                    });
                }
            });
            values = [...skillSet];
        } else {
            const heroDataKey = key === 'aetherpower' ? 'AetherPower' : key;
            values = [...new Set(state.allHeroes.map(h => h[heroDataKey]).filter(v => v != null && v !== '').map(String))];
        }

        // --- 步骤 2: 根据 key 的类型，应用唯一的、正确的排序逻辑 ---
        const locale = { cn: 'zh-CN', tc: 'zh-TW' }[state.currentLang] || 'en-US';
        const sortOptions = state.currentLang === 'tc' ? { usage: 'sort', collation: 'stroke' } : { usage: 'sort' };

        if (key.startsWith('skillTag_')) {
            const orderMap = { skillTag_base: skillTagOrder_base, skillTag_special: skillTagOrder_special, skillTag_buff: skillTagOrder_buff, skillTag_debuff: skillTagOrder_debuff };
            const sortOrder = orderMap[key];
            if (sortOrder) {
                values.sort((a, b) => {
                    // ▼▼▼▼▼【核心修复】在排序时，使用回溯表将当前语言文本转回简体中文ID ▼▼▼▼▼
                    const chineseKeyA = skillTagReverseMap[a] || a;
                    const chineseKeyB = skillTagReverseMap[b] || b;

                    // 使用回溯后的简体中文ID在排序规则中查找位置
                    const indexA = sortOrder.indexOf(chineseKeyA);
                    const indexB = sortOrder.indexOf(chineseKeyB);
                    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

                    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                    if (indexA !== -1) return -1;
                    if (indexB !== -1) return 1;
                    return a.localeCompare(b, locale, sortOptions);
                });
            }
        } else if (key === 'speed') {
            const speedOrder = { cn: speedOrder_cn, tc: speedOrder_tc, en: speedOrder_en }[state.currentLang];
            if (speedOrder) values.sort((a, b) => speedOrder.indexOf(a) - speedOrder.indexOf(b));
        } else if (key === 'color') {
            const colorOrder = { cn: colorOrder_cn, tc: colorOrder_tc, en: colorOrder_en }[state.currentLang];
            if (colorOrder) values.sort((a, b) => colorOrder.indexOf(a) - colorOrder.indexOf(b));
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
}

/**
 * 根据筛选器类型和值获取对应的图标路径。
 * @param {string} filterType - 筛选器类型。
 * @param {string} optionValue - 选项值。
 * @returns {string|null} 图标路径。
 */
function getIconForFilter(filterType, optionValue) {
    if (!optionValue) return null;
    switch (filterType) {
        case 'color':
        case 'class':
            return (iconMaps[filterType] && iconMaps[filterType][optionValue]) || null;
        case 'aetherpower':
            let englishName = (state.currentLang === 'en') ? optionValue : aetherPowerReverseMap[optionValue];
            if (englishName) return `imgs/Aether Power/${englishName.trim().toLowerCase()}.webp`;
            return null;
        case 'family':
            return `imgs/family/${String(optionValue).toLowerCase()}.webp`;
        case 'source':
            const sourceKey = sourceReverseMap[optionValue];
            const iconFilename = sourceIconMap[sourceKey];
            return iconFilename ? `imgs/coins/${iconFilename}` : null;
        case 'costume':
            const iconName = getCostumeIconName(optionValue);
            return iconName ? `imgs/costume/${iconName}.webp` : null;
        case 'skillTag_base':
        case 'skillTag_special':
        case 'skillTag_buff':
        case 'skillTag_debuff':
            // 1. 使用回溯表找到简体中文键名
            const chineseKey = skillTagReverseMap[optionValue] || optionValue;

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
    const langDict = i18n[state.currentLang];

    // ▼▼▼▼▼ 【修正】使用 state. 前缀访问全局状态 ▼▼▼▼▼
    const options = state.availableOptions[filterType];
    const currentSelections = new Set([...(state.multiSelectFilters[filterType] || [])]);

    // ▼▼▼【重构】在 options.map 中使用回溯表来查找图标 ▼▼▼
    let optionsHTML = options.map(optionValue => {
        const isSelected = currentSelections.has(optionValue);
        // getIconForFilter 使用的是 optionValue (中文键)，这部分是正确的
        const iconSrc = getIconForFilter(filterType, optionValue);
        const iconHTML = iconSrc ? `<img src="${iconSrc}" class="option-icon" alt="" onerror="this.style.display='none'">` : '';

        // --- 核心修复：为所有选项查找对应的翻译文本 ---
        let displayText = langDict[optionValue] || optionValue;

        // 对于“家族”和“起源”，如果关闭了“显示活动名称”，还需要特殊处理
        if (filterType === 'family' || filterType === 'source') {
            displayText = getDisplayName(optionValue, filterType);
        }
        // 对于“筛选范围”，使用独立的语言key
        else if (filterType === 'filterScope') {
            displayText = langDict[`filterScope_${optionValue}`] || optionValue;
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
    if (state.temporaryDateFilter !== null || state.temporaryFavorites !== null) {
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
    let finalStats = { attack: baseStats.attack, defense: baseStats.defense, health: baseStats.health };
    if (talent !== 'none' && hero.class && typeof TalentTree !== 'undefined') {
        const talentBonuses = TalentTree.getBonusesForPath(hero.class, strategy, manaPriority, talent);
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
 * 核心函数：应用所有筛选条件并重新渲染结果。
 */
function applyFiltersAndRender() {
    const { filterInputs } = uiElements;
    const nameFilter = filterInputs.name ? filterInputs.name.value.trim().toLowerCase() : '';
    const effectsFilter = filterInputs.effects ? filterInputs.effects.value.trim() : '';
    const passivesFilter = filterInputs.passives ? filterInputs.passives.value.trim() : '';
    const skillTypeFilter = filterInputs.types ? filterInputs.types.value.trim() : '';
    const skillTypeSource = filterInputs.skillTypeSource ? filterInputs.skillTypeSource.value : 'both';
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

    state.filteredHeroes = state.allHeroes.filter(hero => {
        // 范围筛选
        if (filterScope === 'hero' && hero.costume_id !== 0) return false;
        if (filterScope === 'skin' && hero.costume_id === 0) return false;
        if (filterScope === 'favorites') {
            const favoritesList = state.temporaryFavorites || getFavorites();
            const heroIdentifier = `${hero.english_name}-${hero.costume_id}`;
            if (!favoritesList.includes(heroIdentifier)) return false;
        }

        // 文本筛选
        if (nameFilter && !hero.name.toLowerCase().includes(nameFilter)) return false;
        if (effectsFilter && !matchesComplexQuery(hero.effects, effectsFilter)) return false;
        if (passivesFilter && !matchesComplexQuery(hero.passives, passivesFilter)) return false;
        if (skillTypeFilter) {
            const skillTypesToSearch = getSkillTagsForHero(hero, skillTypeSource);
            if (!matchesComplexQuery(skillTypesToSearch, skillTypeFilter)) return false;
        }

        // 标准多选筛选器循环
        for (const key in state.multiSelectFilters) {
            if (key === 'filterScope' || key.startsWith('skillTag_')) continue;
            const selectedValues = state.multiSelectFilters[key];
            if (selectedValues.length === 0) continue;
            let heroValue = (key === 'costume') ? getSkinInfo(hero).skinIdentifier : hero[key === 'aetherpower' ? 'AetherPower' : key];
            if (!selectedValues.includes(String(heroValue))) return false;
        }

        // 新的技能标签筛选逻辑
        const heroAllSkillTags = new Set(hero.cn_skill_info?.flatMap(category => Object.values(category)[0]) || []);
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

        // 临时日期筛选
        if (state.temporaryDateFilter) {
            if (!hero['Release date']) return false;
            const releaseDate = new Date(hero['Release date']);
            if (isNaN(releaseDate.getTime())) return false;
            const baseDate = new Date(state.temporaryDateFilter.base);
            baseDate.setHours(0, 0, 0, 0);
            releaseDate.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((baseDate - releaseDate) / (1000 * 60 * 60 * 24));
            if (diffDays < state.temporaryDateFilter.days) return false;
        }

        return true;
    });

    // 为筛选出的英雄计算并附加用于显示的属性
    state.filteredHeroes.forEach(hero => {
        hero.displayStats = calculateHeroStats(hero, defaultSettings);
    });

    // 排序
    state.filteredHeroes.sort((a, b) => {
        const key = state.currentSort.key;
        const direction = state.currentSort.direction === 'asc' ? 1 : -1;
        const numericKeys = ['star', 'power', 'attack', 'defense', 'health'];
        let valA, valB;
        if (numericKeys.includes(key) && key !== 'star') {
            valA = a.displayStats[key];
            valB = b.displayStats[key];
        } else {
            valA = a[key];
            valB = b[key];
        }
        let comparison = 0;
        if (key === 'speed') {
            const speedOrder = { cn: speedOrder_cn, tc: speedOrder_tc, en: speedOrder_en }[state.currentLang];
            comparison = speedOrder.indexOf(String(valA)) - speedOrder.indexOf(String(valB));
        } else if (numericKeys.includes(key)) {
            comparison = (Number(valA) || 0) - (Number(valB) || 0);
        } else {
            valA = String(valA || '');
            valB = String(valB || '');
            const locale = { cn: 'zh-CN', tc: 'zh-TW', en: 'en-US' }[state.currentLang];
            comparison = valA.localeCompare(valB, locale, state.currentLang === 'tc' ? { collation: 'stroke' } : {});
        }
        comparison *= direction;
        if (comparison === 0 && key !== 'power') {
            return (Number(b.displayStats.power) || 0) - (Number(a.displayStats.power) || 0);
        }
        return comparison;
    });

    // 渲染结果
    renderTable(state.filteredHeroes);
}