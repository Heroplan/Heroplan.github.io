// filters.js: 处理所有与英雄筛选相关的功能。

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

/**
 * 填充所有筛选器按钮和选项。
 * 此函数会遍历所有英雄数据，提取出所有唯一的星级、颜色、职业等，并动态创建筛选按钮。
 */
function populateFilters() {
    // 定义需要动态生成按钮的筛选器类型
    const filtersToConvert = ['filterScope', 'star', 'color', 'speed', 'class', 'costume', 'family', 'source', 'aetherpower'];
    const langDict = i18n[state.currentLang];
    const allHeroes = state.allHeroes;

    filtersToConvert.forEach(key => {
        let values;
        // 从所有英雄数据中提取该筛选器的唯一值
        if (key === 'filterScope') {
            values = ['all', 'hero', 'skin', 'favorites'];
        } else if (key === 'costume') {
            values = [...new Set(allHeroes.map(h => getSkinInfo(h).skinIdentifier).filter(Boolean))];
        } else {
            const heroDataKey = key === 'aetherpower' ? 'AetherPower' : key;
            values = [...new Set(allHeroes.map(h => h[heroDataKey]).filter(v => v != null && v !== '').map(String))];
        }

        const locale = { cn: 'zh-CN', tc: 'zh-TW' }[state.currentLang] || 'en-US';
        const sortOptions = state.currentLang === 'tc' ? { usage: 'sort', collation: 'stroke' } : { usage: 'sort' };

        // 对不同类型的筛选器进行自定义排序
        if (key === 'speed') {
            const speedOrder = { cn: speedOrder_cn, tc: speedOrder_tc, en: speedOrder_en }[state.currentLang];
            if (speedOrder) values.sort((a, b) => speedOrder.indexOf(a) - speedOrder.indexOf(b));
        } else if (key === 'color') {
            const colorOrder = { cn: colorOrder_cn, tc: colorOrder_tc, en: colorOrder_en }[state.currentLang];
            if (colorOrder) values.sort((a, b) => colorOrder.indexOf(a) - colorOrder.indexOf(b));
        } else if (key === 'family') {
            values.sort((a, b) => {
                const translatedA = state.family_values[String(a).toLowerCase()] || a;
                const translatedB = state.family_values[String(b).toLowerCase()] || b;
                return translatedA.localeCompare(translatedB, locale, sortOptions);
            });
        } else if (key === 'costume') {
            const costumeOrder_cn = ['C1', 'C2', '卡通', '玻璃'];
            const costumeOrder_tc = ['C1', 'C2', '卡通', '玻璃'];
            const costumeOrder_en = ['C1', 'C2', 'Toon', 'Glass'];
            const order = { cn: costumeOrder_cn, tc: costumeOrder_tc, en: costumeOrder_en }[state.currentLang] || costumeOrder_en;
            values.sort((a, b) => {
                const indexA = order.indexOf(a), indexB = order.indexOf(b);
                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                return a.localeCompare(b);
            });
        } else {
            values.sort((a, b) => String(a).localeCompare(String(b), locale));
        }

        // 将排序后的选项和初始筛选状态存入全局 state
        state.availableOptions[key] = values;
        state.multiSelectFilters[key] = (key === 'filterScope') ? ['all'] : [];
    });

    // 动态创建筛选器按钮到DOM中
    const container = document.getElementById('standard-filters-container');
    if (!container) return;
    container.innerHTML = '';

    filtersToConvert.forEach(key => {
        const button = document.createElement('button');
        button.id = `btn-filter-${key}`;
        button.className = 'filter-button';
        let title = key;
        if (key === 'filterScope') title = langDict.filterHeroes;
        else {
            const labelKey = key === 'aetherpower' ? 'aetherPowerLabel' : (key === 'costume' ? 'costumeTypeLabel' : `${key}Label`);
            title = langDict[labelKey] ? langDict[labelKey].slice(0, -1) : key;
        }
        button.addEventListener('click', () => openMultiSelectModal(key, title));
        container.appendChild(button);
        updateFilterButtonUI(key);
    });

    // 创建“显示活动名称”复选框
    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.className = 'filter-button checkbox-wrapper';
    checkboxWrapper.style.padding = '0';
    checkboxWrapper.style.border = 'none';
    checkboxWrapper.style.backgroundColor = 'transparent';
    checkboxWrapper.innerHTML = `
        <div class="checkbox-container" style="width: 100%; height: 100%;">
            <input type="checkbox" id="show-event-name-checkbox">
            <label for="show-event-name-checkbox" class="checkbox-label" data-lang-key="showEventNameLabel">${langDict.showEventNameLabel}</label>
        </div>`;
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
            if (englishName) return `imgs/Aether Power/${englishName.trim().toLowerCase()}.png`;
            return null;
        case 'family':
            return `imgs/family/${String(optionValue).toLowerCase()}.png`;
        case 'source':
            const sourceKey = sourceReverseMap[optionValue];
            const iconFilename = sourceIconMap[sourceKey];
            return iconFilename ? `imgs/coins/${iconFilename}` : null;
        case 'costume':
            const iconName = getCostumeIconName(optionValue);
            return iconName ? `imgs/costume/${iconName}.png` : null;
        default:
            return null;
    }
}

/**
 * 重置所有筛选条件到初始状态。
 */
function resetAllFilters() {
    // 重置多选筛选器
    if (typeof state.multiSelectFilters !== 'undefined') {
        Object.keys(state.multiSelectFilters).forEach(key => {
            state.multiSelectFilters[key] = (key === 'filterScope') ? ['all'] : [];
            if (typeof updateFilterButtonUI === 'function') updateFilterButtonUI(key);
        });
    }

    // 重置文本输入框
    const filterInputs = uiElements.filterInputs;
    for (const key in filterInputs) {
        if (state.multiSelectFilters.hasOwnProperty(key)) continue;
        const element = filterInputs[key];
        if (element && element.tagName === 'INPUT') element.value = '';
    }
    // 重置临时筛选状态
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

    const options = state.availableOptions[filterType];
    const currentSelections = new Set([...state.multiSelectFilters[filterType]]);

    // 构建模态框的HTML内容
    let optionsHTML = options.map(optionValue => {
        const isSelected = currentSelections.has(optionValue);
        const iconSrc = getIconForFilter(filterType, optionValue);
        const iconHTML = iconSrc ? `<img src="${iconSrc}" class="option-icon" alt="">` : '';
        let displayText = optionValue;
        if (filterType === 'family' || filterType === 'source') {
            displayText = getDisplayName(optionValue, filterType);
        } else if (filterType === 'filterScope') {
            displayText = i18n[state.currentLang][`filterScope_${optionValue}`] || optionValue;
        }
        const starSuffix = filterType === 'star' ? '⭐' : '';
        return `
            <div class="multi-select-option ${isSelected ? 'selected' : ''}" data-value="${optionValue}">
                ${iconHTML}
                <span>${displayText}${starSuffix}</span>
            </div>`;
    }).join('');

    modalContent.innerHTML = `
        <div class="multi-select-header">
            <h3>${title}</h3>
            <button class="close-btn" id="close-multi-select-modal-top">✖</button>
        </div>
        <div class="multi-select-options-grid">${optionsHTML}</div>
        <div class="multi-select-footer">
            <button class="action-button" id="clear-multi-select">${i18n[state.currentLang].clearSelection}</button>
            <button class="action-button" id="close-multi-select-modal-bottom">${i18n[state.currentLang].detailsCloseBtn}</button>
        </div>`;

    // 显示模态框
    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
    document.body.classList.add('modal-open');
    modalContent.scrollTop = 0;

    // 为模态框内的元素绑定事件
    modal.querySelectorAll('.multi-select-option').forEach(optionDiv => {
        optionDiv.addEventListener('click', () => {
            const value = optionDiv.dataset.value;
            if (filterType === 'filterScope') { // 单选逻辑
                if (state.multiSelectFilters[filterType][0] === value) return;
                state.multiSelectFilters[filterType] = [value];
                modal.querySelectorAll('.multi-select-option.selected').forEach(div => div.classList.remove('selected'));
                optionDiv.classList.add('selected');
            } else { // 多选逻辑
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
    if (filterType === 'filterScope') {
        clearButton.style.display = 'none';
    } else {
        clearButton.addEventListener('click', () => {
            state.multiSelectFilters[filterType] = [];
            modal.querySelectorAll('.multi-select-option.selected').forEach(div => div.classList.remove('selected'));
            applyFiltersAndRender();
            updateFilterButtonUI(filterType);
        });
    }

    document.getElementById('close-multi-select-modal-top').addEventListener('click', () => history.back());
    document.getElementById('close-multi-select-modal-bottom').addEventListener('click', () => history.back());

    // 添加历史记录以便浏览器后退可以关闭此模态框
    history.pushState({ modal: 'multiSelect' }, null);
    state.modalStack.push('multiSelect');
}

/**
 * 将字符串标准化，用于后续比较。
 * @param {string} str - 输入字符串。
 * @returns {string} 标准化后的字符串。
 */
function normalizeStringForSearch(str) {
    if (typeof str !== 'string') return String(str || '');
    // 替换全角标点为半角，然后转为小写
    return str.replace(/（/g, '(').replace(/）/g, ')')
        .replace(/【/g, '[').replace(/】/g, ']')
        .replace(/：/g, ':').replace(/；/g, ';')
        .replace(/，/g, ',').replace(/ /g, ' ') // 全角空格
        .toLowerCase();
}

/**
 * 转义字符串中的正则表达式特殊字符。
 * @param {string} str - 输入字符串。
 * @returns {string} 转义后的字符串。
 */
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& 表示匹配到的整个字符串
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

    const normalizedQuery = normalizeStringForSearch(query);
    const dataAsArray = Array.isArray(data) ?
        data.map(item => normalizeStringForSearch(item)) : [normalizeStringForSearch(data)];

    function evaluate(expr, text) {
        expr = expr.trim();
        if (!expr) return true;

        // 优先级 1: 处理最外层的括号
        if (expr.startsWith('(') && expr.endsWith(')')) {
            let balance = 0;
            let isOuter = true;
            for (let i = 1; i < expr.length - 1; i++) {
                if (expr[i] === '(') balance++;
                else if (expr[i] === ')') balance--;
                if (balance < 0) {
                    isOuter = false;
                    break;
                }
            }
            if (isOuter && balance === 0) {
                return evaluate(expr.substring(1, expr.length - 1), text);
            }
        }

        // 优先级 2: 处理 OR (|)
        let balance = 0;
        let inBracket = false;
        for (let i = expr.length - 1; i >= 0; i--) {
            const char = expr[i];
            if (char === ']') inBracket = true;
            else if (char === '[') inBracket = false;
            else if (char === ')') balance++;
            else if (char === '(') balance--;

            if (char === '|' && balance === 0 && !inBracket) {
                return evaluate(expr.substring(0, i), text) || evaluate(expr.substring(i + 1), text);
            }
        }

        // 优先级 3: 处理 AND (空格)
        balance = 0;
        inBracket = false;
        for (let i = expr.length - 1; i >= 0; i--) {
            const char = expr[i];
            if (char === ']') inBracket = true;
            else if (char === '[') inBracket = false;
            else if (char === ')') balance++;
            else if (char === '(') balance--;

            if (/\s/.test(char) && balance === 0 && !inBracket) {
                const left = expr.substring(0, i);
                const right = expr.substring(i + 1);
                if (left.trim() === '' || right.trim() === '') continue;
                return evaluate(left, text) && evaluate(right, text);
            }
        }

        // 优先级 4: 处理 NOT (!) 和原子词 (包括 [])
        if (expr.startsWith('!')) {
            const term = expr.substring(1).trim();
            return !evaluate(term, text);
        }

        if (expr.startsWith('[') && expr.endsWith(']')) {
            const term = expr.substring(1, expr.length - 1).trim();
            if (term === '') return true;

            // 新逻辑：将文本按分隔符拆分为词条列表，进行精确匹配
            const effectsList = text.split(/[,;]/).map(effect => effect.trim());
            return effectsList.includes(term);
        }

        // 默认作为普通词语进行包含匹配
        return text.includes(expr);
    }

    const usePerLineSearch = /[()\[\]|!]/.test(normalizedQuery) || /\s/.test(normalizedQuery);
    return usePerLineSearch ?
        dataAsArray.some(line => evaluate(normalizedQuery, line)) :
        evaluate(normalizedQuery, dataAsArray.join(' '));
}

/**
 * 检查是否有任何筛选器处于激活状态。
 * @returns {boolean}
 */
function areFiltersActive() {
    const filterInputs = uiElements.filterInputs;
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
    for (const key in state.multiSelectFilters) {
        const selectedValues = state.multiSelectFilters[key];
        if (key === 'filterScope') {
            if (selectedValues.length > 0 && selectedValues[0] !== 'all') return true;
        } else {
            if (selectedValues.length > 0) return true;
        }
    }
    if (state.temporaryDateFilter !== null || state.temporaryFavorites !== null) return true;
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

    // 应用极限突破的属性
    if (lb === 'lb1' && hero.lb1) baseStats = { ...hero.lb1 };
    else if (lb === 'lb2' && hero.lb2) baseStats = { ...hero.lb2 };

    let finalStats = { attack: baseStats.attack, defense: baseStats.defense, health: baseStats.health };

    // 应用天赋加成
    if (talent !== 'none' && hero.class && typeof TalentTree !== 'undefined') {
        const talentBonuses = TalentTree.getBonusesForPath(hero.class, strategy, manaPriority, talent);
        const attackPercentBonus = Math.floor((baseStats.attack || 0) * (talentBonuses.attack_percent / 100));
        finalStats.attack = (baseStats.attack || 0) + talentBonuses.attack_flat + attackPercentBonus;
        const defensePercentBonus = Math.floor((baseStats.defense || 0) * (talentBonuses.defense_percent / 100));
        finalStats.defense = (baseStats.defense || 0) + talentBonuses.defense_flat + defensePercentBonus;
        const healthPercentBonus = Math.floor((baseStats.health || 0) * (talentBonuses.health_percent / 100));
        finalStats.health = (baseStats.health || 0) + talentBonuses.health_flat + healthPercentBonus;
    }

    // 计算最终战力
    const STAR_BASE_POWER = { 1: 0, 2: 10, 3: 30, 4: 50, 5: 90 };
    const star_power = STAR_BASE_POWER[hero.star] || 0;
    const stats_raw_power = (baseStats.attack * 0.35) + (baseStats.defense * 0.28) + (baseStats.health * 0.14);
    const stats_final_power = Math.floor(stats_raw_power);
    const skill_power = (8 - 1) * 5; // 假设技能等级为8
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

    // 获取全局默认的突破/天赋设置
    const defaultSettings = {
        lb: filterInputs.defaultLimitBreakSelect.value,
        talent: filterInputs.defaultTalentSelect.value,
        strategy: filterInputs.defaultTalentStrategySelect.value,
        manaPriority: filterInputs.defaultManaPriorityCheckbox.checked
    };

    // 1. 过滤英雄
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
            let skillTypesToSearch = getSkillTypesArray(hero, skillTypeSource, true);
            if (!matchesComplexQuery(skillTypesToSearch.filter(Boolean), skillTypeFilter)) return false;
        }

        // 多选按钮筛选
        for (const key in state.multiSelectFilters) {
            if (key === 'filterScope') continue;
            const selectedValues = state.multiSelectFilters[key];
            if (selectedValues.length === 0) continue;
            let heroValue = (key === 'costume') ? getSkinInfo(hero).skinIdentifier : hero[key === 'aetherpower' ? 'AetherPower' : key];
            if (!selectedValues.includes(String(heroValue))) return false;
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

    // 2. 为每个筛选出的英雄计算并附加用于显示的属性
    state.filteredHeroes.forEach(hero => {
        hero.displayStats = calculateHeroStats(hero, defaultSettings);
    });

    // 3. 排序
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

        // 如果主排序相同，则按战力降序作为第二排序
        if (comparison === 0 && key !== 'power') {
            return (Number(b.displayStats.power) || 0) - (Number(a.displayStats.power) || 0);
        }
        return comparison;
    });

    // 4. 渲染结果
    renderTable(state.filteredHeroes);
}