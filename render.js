// render.js: 负责将数据渲染到页面上，主要是英雄列表和详情模态框。



/**
 * 从英雄名称中分离出皮肤信息和基础名称。
 * @param {object} hero - 英雄对象。
 * @returns {{skinIdentifier: string|null, baseName: string}} 包含皮肤标识符和基础名称的对象。
 */
function getSkinInfo(hero) {
    let name = hero.name || '';

    const langCode = state.currentLang;
    // ⚠ 2026-10-10 用户口径：搜索语言选择已废弃 ⇒ 一律走 `current` 分支（用当前语言的官方名字）。
    {

        if (!window.langData?.name?.[langCode]) {
            console.warn(`未找到 ${langCode} 语言的数据`);
            return { skinIdentifier: null, baseName: name };
        }
        const langData = window.langData.name[langCode];

        if (!hero.heroId) return { skinIdentifier: null, baseName: name };

        // 使用部分匹配模式查找对应的翻译
        // 查找所有以 hero.heroId 开头的键
        const matchingKeys = Object.keys(langData).filter(key =>
            hero.heroId.startsWith(key)
        );

        if (matchingKeys.length > 0) {
            // 选择最长的匹配（最具体的匹配）
            const bestMatch = matchingKeys.reduce((longest, current) =>
                current.length > longest.length ? current : longest
            );

            // 应用翻译
            name = langData[bestMatch];
        }
    }

    if (hero.costume_id !== 0) {
        let costumeId = hero.costume_id;
        if (hero.family === 'classic') {
            if (hero.star === 3 && costumeId > 1) {
                costumeId = costumeId + 1;
            }
        }

        if (hero.family != 'classic') {
            if (costumeId === 2) {
                costumeId = 3;
            }
        }

        let classicMap;
        if (langCode === 'cn') {
            classicMap = {
                1: 'C1',
                2: 'C2',
                3: '卡通',
                4: '玻璃',
                5: '英姿'
            };
        } else if (langCode === 'tc') {
            classicMap = {
                1: 'C1',
                2: 'C2',
                3: '公仔',
                4: '玻璃',
                5: '有型'
            };
        } else {
            classicMap = {
                1: 'C1',
                2: 'C2',
                3: 'Toon',
                4: 'Glass',
                5: 'Stylish'
            };
        }
        
        let heroSkinIdentifier = classicMap[costumeId] || null;
        return { skinIdentifier: heroSkinIdentifier, baseName: name };
    }
    return { skinIdentifier: null, baseName: name };
}

/**
 * 根据皮肤标识符获取对应的图标文件名。
 * @param {string} skinIdentifier - 皮肤标识符 (e.g., 'C1', 'Toon')。
 * @returns {string|null} 图标文件名或null。
 */
function getCostumeIconName(hero) {
    if (!hero || hero.costume_id === 0) return '';
    let costumeId = hero.costume_id;
    if (hero.family === 'classic') {
        if (hero.star === 3 && costumeId > 1) {
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
    const skinInfo = getSkinInfo(hero);
    let content = skinInfo.baseName;
    const iconName = getCostumeIconName(hero);
    if (iconName) {
        content = content + `<img src="imgs/costume/${iconName}.webp" class="costume-icon" alt="${iconName} costume" title="${skinInfo.skinIdentifier}"/>`;
    }
    return content;
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
    const headers = {
        fav: favHeaderIcon, image: langDict.avatarLabel, name: langDict.nameLabel.slice(0, -1),
        color: langDict.colorLabel.slice(0, -1), star: langDict.starLabel.slice(0, -1),
        class: langDict.classLabel.slice(0, -1), speed: langDict.speedLabel.slice(0, -1),
        power: langDict.minPower, attack: langDict.minAttack,
        defense: langDict.minDefense, health: langDict.minHealth,
        types: langDict.skillTypeLabel.slice(0, -1)
    };
    const colKeys = Object.keys(headers);
    const sortableKeys = ['name', 'color', 'star', 'class', 'speed', 'power', 'attack', 'defense', 'health'];

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
        return `<th class="col-${key} ${isSortable ? 'sortable' : ''}" data-sort-key="${key}">${headerText}<span class="sort-indicator">${sortIndicator}</span></th>`;
    }).join('') + '</tr>';

    // 渲染表格内容
    let tbody = heroTable.querySelector('tbody');
    if (!tbody) tbody = heroTable.appendChild(document.createElement('tbody'));

    if (heroes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${colKeys.length}" class="empty-results-message">${langDict.noResults}</td></tr>`;
        return;
    }

    const rowsHTML = heroes.map(hero => {
        const isHeroFavorite = isFavorite(hero);
        const cellsHTML = colKeys.map(key => {
            let content = '';
            const displayStats = hero.displayStats || {};

            // 根据列键名格式化内容
            if (['power', 'attack', 'defense', 'health'].includes(key)) {
                const icons = { power: '💪', attack: '⚔️', defense: '🛡️', health: '❤️' };
                content = `${icons[key]} ${displayStats[key] || 0}`;
            } else if (key === 'star') {
                content = `${hero[key] || ''}⭐`;
            } else if (key === 'types') {
                const source = uiElements.filterInputs.skillTypeSource.value;
                if (source === 'bbcamp') {
                    // 获取文本形式的技能标签
                    const skillTags = getSkillTagsForHero(hero, source);

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
                        // 1. 使用回溯表找到简体中文键名（图标文件名按 CN 键取）
                        const chineseKey = skillTagReverseMap[tag] || tag;

                        // 2. 移除文件名中的斜杠等特殊字符
                        const sanitizedFilename = chineseKey.replace(/\//g, '');

                        // 3. 悬浮提示用当前语言文本（`skill_types_<码>.json`）
                        const tagLabel = (typeof Lang !== 'undefined') ? Lang.t('skill_types', chineseKey) : tag;

                        // 4. 构建单个图标HTML
                        iconsHtml += `<img src="imgs/skill/${sanitizedFilename}.webp" 
                          class="skill-icon" 
                          alt="${tagLabel}" 
                          title="${tagLabel}" />`;
                    });

                    // 4. 返回包含多个图标的单元格
                    return `<td class="col-types">${iconsHtml}</td>`;
                } else {
                    content = getSkillTagsForHero(hero, source).join(', ')
                }
            } else if (key === 'name') {
                let displayName = hero.name;

                // 第1步: 移除元素后缀
                const ignorableElementSuffixes = ['dark', 'holy', 'ice', 'nature', 'fire', 'red', 'blue', 'green', 'yellow', 'purple'];
                // 匹配元素后缀，但保留括号结构
                const elementSuffixRegex = new RegExp(`\\s+(?:\\()?(${ignorableElementSuffixes.join('|')})(?:\\))?$`, 'i');

                // 先检查是否需要处理
                if (elementSuffixRegex.test(displayName)) {
                    // 如果名字以右括号结尾，先特殊处理
                    if (displayName.endsWith(')')) {
                        // 找到最后一个右括号的位置
                        const lastParenIndex = displayName.lastIndexOf(')');
                        const beforeParen = displayName.substring(0, lastParenIndex);
                        const afterParen = displayName.substring(lastParenIndex);

                        // 只对括号前的内容应用替换
                        const cleanedBeforeParen = beforeParen.replace(elementSuffixRegex, '').trim();
                        displayName = cleanedBeforeParen + afterParen;
                    } else {
                        // 正常替换
                        displayName = displayName.replace(elementSuffixRegex, '').trim();
                    }
                }

                // ▼▼▼ 移除服装后缀 ▼▼▼
                // 第2步: 移除 C1, C2, 玻璃, 卡通等服装后缀
                const costumeSuffixRegex = /\s*(?:\[|\()?(C\d+|stylish|glass|toon|玻璃|卡通|英姿|公仔|有型)(?:\]|\))?\s*$/i;
                displayName = displayName.replace(costumeSuffixRegex, '').trim();

                // 非英文界面时，**仅列表**在名字后附英文名，便于跨语言识别（用户 2026-10-10）；
                // 详情页不加（见 renderDetailsInModal 的 nameBlockHTML）。英文界面下两者相同 ⇒ 自动不重复。
                const _enSuffix = (hero.english_name && hero.english_name !== displayName)
                    ? ` (${hero.english_name})` : '';
                content = `${displayName || ''}${_enSuffix}`;
            } else if (key === 'class' && hero[key]) {
                const englishClass = (classReverseMap[hero[key]] || hero[key]).toLowerCase();
                content = `<img src="imgs/classes/${englishClass}.webp" class="class-icon" alt="${hero[key]}"/>${hero[key]}`;
            } else if (key === 'color' && hero[key]) {
                const englishColor = (colorReverseMap[String(hero[key]).toLowerCase()] || hero[key]).toLowerCase();
                return `<td class="col-color"><img src="imgs/colors/${englishColor}.webp" class="color-icon" alt="${hero[key]}" title="${hero[key]}"/></td>`;
            } else if (key === 'fav') {
                let icon;
                let cssClass = '';

                if (state.teamSimulatorActive || state.lotterySimulatorActive) {
                    icon = '⬆️';
                    if (state.lotterySimulatorActive) {
                        // 检查英雄是否已被添加
                        let isDisabled = false;

                        // 规则1: 英雄不是5星则禁用
                        if (hero.star !== 5) {
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
                const gradientBg = getHeroColorLightGradient(hero.color);
                let imageSrc; // 先声明变量

                // ▼▼▼ 为训练师英雄设置特殊头像路径 ▼▼▼
                if (String(hero.family).toLowerCase() === 'trainer') {
                    // 如果是训练师，则强制使用 hero.image 属性中我们预设的路径
                    imageSrc = hero.image;
                } else {
                    // 对于所有其他英雄，保留原始逻辑
                    imageSrc = hero.heroId ? `imgs/hero_icon/${hero.heroId}.webp` : getLocalImagePath(hero.image);
                }
                const heroColorClass = getColorGlowClass(hero.color);

                // --- 检查英雄是否有皮肤并生成图标HTML ---
                let costumeIconHtml = '';
                const iconName = getCostumeIconName(hero);
                if (iconName) {
                    // 使用一个新的、专门用于头像的CSS类
                    costumeIconHtml = `<img src="imgs/costume/${iconName}.webp" class="table-avatar-costume-icon" alt="${iconName} costume" title=""/>`;
                }

                return `<td class="col-image">
                            <div class="hero-avatar-container ${heroColorClass}">
                                <div class="hero-avatar-background" style="background: ${gradientBg};"></div>
                                <img src="${imageSrc}" class="hero-avatar-image" alt="${hero.name}" loading="lazy" onerror="this.src='imgs/not_found.webp'">
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
    }).join('');

    tbody.innerHTML = rowsHTML;
    adjustStickyHeaders();
    scrollToTableTop();
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
 * 用于关键词高亮的字典，按语言和数据类型分离。
 */
const highlightDictionaries = {
    en: {
        // 英文通用字典
        common: {
            'Dark': '[##elementpurple]Dark[#]',
            'Nature': '[##elementgreen]Nature[#]',
            'Fire': '[##elementred]Fire[#]',
            'Holy': '[##elementyellow]Holy[#]',
            'Ice': '[##elementblue]Ice[#]',
            'Mindless Attack': '[##elementred]Mindless Attack[#]',
            'Mindless Heal': '[##elementred]Mindless Heal[#]',
            'Max stacks: 10': '[##elementred]Max stacks: 10[#]',
            'Stack (Max: 10)': '[##elementred]Stack (Max: 10)[#]',
            'stack (Max: 10)': '[##elementred]Stack (Max: 10)[#]',
            'stacks': '[##elementred]stacks[#]',
            'stack': '[##elementred]stack[#]',
            'Soul Bound': '[##elementred]Soul Bound[#]',
            'Greed': '[##elementred]Greed[#]',
            'Deep Sleep': '[##elementred]Deep Sleep[#]',
            'falls asleep': '[##elementred]falls asleep[#]',
            'fall asleep': '[##elementred]fall asleep[#]',
            'asleep': '[##elementred]asleep[#]',
            'Wither': '[##elementred]Wither[#]',
            'spreads': '[##elementred]spreads[#]',
            'Mana generation': '[#!]Mana generation[#]',
            'mana generation': '[#!]mana generation[#]',
            'Mana': '[#!]Mana[#]',
            'mana': '[#!]mana[#]',
            'accuracy': '[##elementyellow]accuracy[#]',
            'never misses': '[##elementyellow]never misses[#]',
            'Growth': '[##elementgreen]Growth[#]',
            'Growth Boon': '[##elementgreen]Growth Boon[#]',
            'reflects': '[##elementred]reflects[#]',
            'reflect': '[##elementred]reflect[#]',
            'steals': '[##elementred]steals[#]',
            'steal': '[##elementred]steal[#]',
            'critical': '[##elementred]critical[#]',
            'immune to new status ailments': '[#!]immune to new status ailments[#]',
            'immune to new status effect buffs': '[##elementred]immune to new status effect buffs[#]',
            'immune': '[##elementgreen]immune[#]',
            'dodge': '[#!]dodge[#]',
            'bypasses': '[#!]bypasses[#]',
            'Taunt': '[##elementred]Taunt[#]',
            'silenced': '[##elementred]silenced[#]',
            'Safely cleanses': '[##elementgreen]Safely cleanses[#]',
            'safely cleanses': '[##elementgreen]safely cleanses[#]',
            'safely cleanse': '[##elementgreen]safely cleanse[#]',
            'Safely dispels': '[##elementgreen]Safely dispels[#]',
            'safely dispels': '[##elementgreen]safely dispels[#]',
            'safely dispel': '[##elementgreen]safely dispel[#]',
            'cleanable': '[#!]cleanable[#]',
            'Cleanses': '[##elementgreen]Cleanses[#]',
            'undispellable': '[##elementgreen]undispellable[#]',
            'dispellable': '[#!]dispellable[#]',
            'Dispels': '[#!]Dispels[#]',
            'revived': '[##elementgreen]revived[#]',
            'revive': '[##elementgreen]revive[#]',
            'drop any received damage': '[##elementyellow]drop any received damage[#]',
            'reduce all received damage': '[##elementyellow]reduce all received damage[#]',
            'Full Removal': '[#!]Full Removal[#]',
            'Blocks': '[##elementred]Blocks[#]',
            'block': '[##elementred]block[#]',
            'prevents': '[##elementred]prevents[#]',
            'prevent': '[##elementred]prevent[#]',
            'can\'t be dispelled': '[##elementgreen]can\'t be dispelled[#]',
            'can\’t be dispelled': '[##elementgreen]can\’t be dispelled[#]',
            'uncleansable': '[##elementred]uncleansable[#]',
            'can\'t be cleansed': '[##elementred]can\'t be cleansed[#]',
            'Paralyzed': '[##elementred]Paralyzed[#]',
            'Curse damage': '[#!]Curse damage[#]',
            'Poison damage': '[##elementpurple]Poison damage[#]',
            'Corrosive Poison': '[##elementpurple]Corrosive Poison[#]',
            'Burn damage': '[##elementred]Burn damage[#]',
            'Corrosive Burn': '[##elementred]Corrosive Burn[#]',
            'Surge Bleed damage': '[##elementred]Surge Bleed damage[#]',
            'Bleed damage': '[##elementred]Bleed damage[#]',
            'Sand damage': '[##elementyellow]Sand damage[#]',
            'Water damage': '[##elementblue]Water damage[#]',
            'Frost damage': '[##elementblue]Frost damage[#]',
            'Corrosive Frost': '[##elementblue]Corrosive Frost[#]',
            'Stubborn': '[##elementred]Stubborn[#]',
            'Uproots': '[##elementgreen]Uproots[#]',
            'Uproot': '[##elementgreen]Uproot[#]',
            'Harvests': '[##elementred]Harvests[#]',
            'Harvest': '[##elementred]Harvest[#]', 
            'Special Skills': '[##elementblue]Special Skills[#]',
            'Special Skill': '[##elementblue]Special Skill[#]',
            
        },
        // 英文 effects 专属字典
        effects: {
            // 在这里添加 'en' effects 专属词条
        },
        // 英文 passives 专属字典
        passives: {
            // 在这里添加 'en' passives 专属词条
        },
        // 英文 familyBonus 专属字典
        familyBonus: {
            // 在这里添加 'en' familyBonus 专属词条
        }
    },
    zh: { // 包含简体 (cn) 和繁体 (tc)
        // 中文通用字典
        common: {
            '暗黑系': '[##elementpurple]暗黑系[#]',
            '自然系': '[##elementgreen]自然系[#]',
            '烈火系': '[##elementred]烈火系[#]',
            '神圣系': '[##elementyellow]神圣系[#]',
            '神聖系': '[##elementyellow]神聖系[#]',
            '冰雪系': '[##elementblue]冰雪系[#]',
            '暗黑': '[##elementpurple]暗黑[#]',
            '自然': '[##elementgreen]自然[#]',
            '烈火': '[##elementred]烈火[#]',
            '神圣': '[##elementyellow]神圣[#]',
            '神聖': '[##elementyellow]神聖[#]',
            '冰雪': '[##elementblue]冰雪[#]',
            '冰霜': '[##elementblue]冰霜[#]',
            '莽夫乱拳': '[##elementred]莽夫乱拳[#]',
            '莽夫亂拳': '[##elementred]莽夫亂拳[#]',
            '盲目治疗': '[##elementred]盲目治疗[#]',
            '莽夫治療': '[##elementred]莽夫治療[#]',
            '无限回合': '[#!]无限回合[#]',
            '叠加（最多： 10 层 ）': '[##elementred]叠加（最多： 10 层 ）[#]',
            '疊加（最大值： 10 ）': '[##elementred]疊加（最大值： 10 ）[#]',
            '叠加 +2 （最多： 10 层）': '[##elementred]叠加 +2 （最多： 10 层）[#]',
            '疊加 +2 （最大值： 10 ）': '[##elementred]疊加 +2 （最大值： 10 ）[#]',
            '叠加': '[##elementred]叠加[#]',
            '疊加': '[##elementred]疊加[#]',
            '无法': '[##elementred]无法[#]',
            '無法': '[##elementred]無法[#]',
            '阻止': '[##elementred]阻止[#]',
            '缚魂': '[##elementred]缚魂[#]',
            '靈魂绑定': '[##elementred]靈魂绑定[#]',
            '贪婪': '[##elementred]贪婪[#]',
            '貪婪': '[##elementred]貪婪[#]',
            '沉睡': '[##elementred]沉睡[#]',
            '深眠': '[##elementred]深眠[#]',
            '深沉睡眠': '[##elementred]深沉睡眠[#]',
            '衰退': '[##elementred]衰退[#]',
            '枯萎': '[##elementred]枯萎[#]',
            '蔓延': '[##elementred]蔓延[#]',
            '擴散': '[##elementred]擴散[#]',
            '法力': '[#!]法力[#]',
            '法力生成': '[#!]法力生成[#]',
            '法力產出': '[#!]法力產出[#]',
            '精准度': '[##elementyellow]精准度[#]',
            '精準度': '[##elementyellow]精準度[#]',
            '必定命中': '[##elementyellow]必定命中[#]',
            '成长恩赐': '[##elementgreen]成长恩赐[#]',
            '成長恩惠': '[##elementgreen]成長恩惠[#]',
            '成长': '[##elementgreen]成长[#]',
            '成長': '[##elementgreen]成長[#]',
            '反弹': '[##elementred]反弹[#]',
            '反彈': '[##elementred]反彈[#]',
            '反射': '[##elementred]反射[#]',
            '偷取': '[##elementred]偷取[#]',
            '偷走': '[##elementred]偷走[#]',
            '窃取': '[##elementred]窃取[#]',
            '竊取': '[##elementred]竊取[#]',
            '暴击几率': '[##elementred]暴击几率[#]',
            '暴擊率': '[##elementred]暴擊率[#]',
            '暴击': '[##elementred]暴击[#]',
            '暴擊': '[##elementred]暴擊[#]',
            '免疫': '[##elementgreen]免疫[#]',
            '状态异常免疫': '[##elementgreen]状态异常免疫[#]',
            '狀態異常免疫': '[##elementgreen]狀態異常免疫[#]',
            '增益状态效果免疫': '[##elementred]增益状态效果免疫[#]',
            '免疫新的狀態效果增益': '[##elementred]免疫新的狀態效果增益[#]',
            '闪避': '[#!]闪避[#]',
            '閃避': '[#!]閃避[#]',
            '无视防御增益': '[#!]无视防御增益[#]',
            '無視防禦增益': '[#!]無視防禦增益[#]',
            '嘲讽': '[##elementred]嘲讽[#]',
            '嘲諷': '[##elementred]嘲諷[#]',
            '沉默': '[##elementred]沉默[#]',
            '安全净化': '[##elementgreen]安全净化[#]',
            '安全淨化': '[##elementgreen]安全淨化[#]',
            '安全驱散': '[##elementgreen]安全驱散[#]',
            '安全驅散': '[##elementgreen]安全驅散[#]',
            '可净化': '[##elementgreen]可净化[#]',
            '可淨化': '[##elementgreen]可淨化[#]',
            '净化': '[##elementgreen]净化[#]',
            '淨化': '[##elementgreen]淨化[#]',
            '可驱散': '[#!]可驱散[#]',
            '可驅散': '[#!]可驅散[#]',
            '驱散': '[#!]驱散[#]',
            '驅散': '[#!]驅散[#]',
            '复活': '[##elementgreen]复活[#]',
            '復活': '[##elementgreen]復活[#]',
            '伤害减少': '[##elementyellow]伤害减少[#]',
            '傷害減少': '[##elementyellow]傷害減少[#]',
            '伤害降低': '[##elementyellow]伤害降低[#]',
            '傷害降低': '[##elementyellow]傷害降低[#]',
            '完全移除': '[#!]完全移除[#]',
            '完整移除': '[#!]完整移除[#]',
            '无法驱散': '[##elementgreen]无法驱散[#]',
            '無法驅散': '[##elementgreen]無法驅散[#]',
            '不可净化': '[##elementred]不可净化[#]',
            '不可淨化': '[##elementred]不可淨化[#]',
            '无法净化': '[##elementred]无法净化[#]',
            '無法淨化': '[##elementred]無法淨化[#]',
            '麻木': '[##elementred]麻木[#]',
            '麻痺': '[##elementred]麻痺[#]',
            '诅咒伤害': '[#!]诅咒伤害[#]',
            '詛咒傷害': '[#!]詛咒傷害[#]',
            '剧毒伤害': '[##elementpurple]剧毒伤害[#]',
            '劇毒傷害': '[##elementpurple]劇毒傷害[#]',
            '腐蚀剧毒': '[##elementpurple]腐蚀剧毒[#]',
            '腐蝕劇毒': '[##elementpurple]腐蝕劇毒[#]',
            '燃烧伤害': '[##elementred]燃烧伤害[#]',
            '燃燒傷害': '[##elementred]燃燒傷害[#]',
            '腐蚀燃烧': '[##elementred]腐蚀燃烧[#]',
            '腐蝕燃燒': '[##elementred]腐蝕燃燒[#]',
            '奔涌流血伤害': '[##elementred]奔涌流血伤害[#]',
            '重傷流血傷害': '[##elementred]重傷流血傷害[#]',
            '流血伤害': '[##elementred]流血伤害[#]',
            '流血傷害': '[##elementred]流血傷害[#]',
            '沙系伤害': '[##elementyellow]沙系伤害[#]',
            '飛沙傷害': '[##elementyellow]飛沙傷害[#]',
            '水系伤害': '[##elementblue]水系伤害[#]',
            '水系傷害': '[##elementblue]水系傷害[#]',
            '冰冻伤害': '[##elementblue]冰冻伤害[#]',
            '冰霜傷害': '[##elementblue]冰霜傷害[#]',
            '腐蚀冰冻': '[##elementblue]腐蚀冰冻[#]',
            '腐蝕冰霜': '[##elementblue]腐蝕冰霜[#]',
            '顽固': '[##elementred]顽固[#]',
            '根除': '[##elementgreen]根除[#]',
            '收割': '[##elementred]收割[#]',
            '拔除': '[##elementgreen]拔除[#]',
            '豐收': '[##elementred]豐收[#]',
            '特殊技能': '[##elementblue]特殊技能[#]',
        }, 
        // 中文 effects 专属字典
        effects: {
            // 在这里添加 'zh' effects 专属词条
        },
        // 中文 passives 专属字典
        passives: {
            '剧毒': '[##elementpurple]剧毒[#]',
            '劇毒': '[##elementpurple]劇毒[#]',
            '燃烧': '[##elementred]燃烧[#]',
            '燃焼': '[##elementred]燃焼[#]',
            '流血': '[##elementred]流血[#]',
            '沙系': '[##elementyellow]沙系[#]',
            '水系': '[##elementblue]水系[#]',
            '冰冻': '[##elementblue]冰冻[#]',
            '冰霜': '[##elementblue]冰霜[#]',
        },
        // 中文 familyBonus 专属字典
        familyBonus: {
            // 在这里添加 'zh' familyBonus 专属词条
        }
    }
};

/**
 * 用于预编译高亮工具（正则表达式、替换器等）的缓存。
 * (Memoization)
 */
const highlightingToolsCache = {};

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
 * 获取或创建用于高亮的已编译工具（正则表达式、保护列表）。
 * 这是为了性能而进行的“记忆化”处理。
 * @param {string} lang - 'en' 或 'zh' (来自 state.currentLang)
 * @param {string} type - 'effects', 'passives', 'familyBonus', 或 'common' (null)。
 * @returns {{regex: RegExp, protectionValues: string[], replacer: function}}
 */
function getHighlightingTools(lang, type) {
    // 统一将其它语言处理为 'en'
    const isChinese = lang === 'cn' || lang === 'tc';
    const langKey = isChinese ? 'zh' : 'en';
    const typeKey = type || 'common';
    const cacheKey = `${langKey}_${typeKey}`;

    // 1. 检查缓存
    if (highlightingToolsCache[cacheKey]) {
        return highlightingToolsCache[cacheKey];
    }

    // --- 2. 构建工具 ---
    const langDicts = highlightDictionaries[langKey];
    if (!langDicts) {
        // 如果没有该语言的字典，缓存一个空操作
        return (highlightingToolsCache[cacheKey] = { regex: null, protectionValues: [], replacer: null });
    }

    const commonDict = langDicts.common || {};
    const specificDict = (typeKey !== 'common' && langDicts[typeKey]) ? langDicts[typeKey] : {};

    // 专属字典会覆盖通用字典中的相同键
    const combinedDict = { ...commonDict, ...specificDict };

    if (Object.keys(combinedDict).length === 0) {
        // 如果没有替换规则，缓存一个空操作
        return (highlightingToolsCache[cacheKey] = { regex: null, protectionValues: [], replacer: null });
    }

    // 按键的长度降序排序 (例如，优先匹配 "Corrosive Fire" 而不是 "Fire")
    const allKeys = Object.keys(combinedDict).sort((a, b) => b.length - a.length);

    // 创建正则表达式
    const regexPattern = allKeys.map(escapeRegExp).join('|');
    const regex = new RegExp(regexPattern, 'g');

    // 获取所有唯一的 *值* 用于保护步骤 (例如 "[##elementred]Fire[#]")
    const protectionValues = [...new Set(Object.values(combinedDict))].sort((a, b) => b.length - a.length);

    // 替换函数 (replacer)
    const replacer = (match) => combinedDict[match];

    // 3. 存入缓存并返回
    highlightingToolsCache[cacheKey] = { regex, protectionValues, replacer };
    return highlightingToolsCache[cacheKey];
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
        //   ⇒ 这里绝不能再按"单行"去认括号，否则内层括号会被误当成注释（用户 2026-10-10）。
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

    // 1. 获取预编译的工具
    const { regex, protectionValues, replacer } = getHighlightingTools(lang, filterType);

    // 如果没有规则，直接返回原文
    if (!regex) {
        return text;
    }

    let tempText = textToProcess;
    const protectionMap = {};
    let placeholderCount = 0;

    // 步骤 1: 保护文本中已存在的、符合格式的值
    for (const value of protectionValues) {
        // 使用 while 循环，因为 .replace(string, string) 只替换第一个匹配项
        while (tempText.includes(value)) {
            const placeholder = `__KEYWORD_PROTECT_${placeholderCount}__`;
            // .replace() 只替换第一个，所以 while 循环是安全的
            tempText = tempText.replace(value, placeholder);
            protectionMap[placeholder] = value;
            placeholderCount++;
        }
    }

    // 步骤 2: 应用替换
    // .replace(regex, function) 会替换所有匹配项
    let replacedText = tempText.replace(regex, replacer);

    // 步骤 3: 恢复被保护的值
    // 按占位符长度降序排序，防止 `__P_1__` 错误地替换 `__P_10__` 的一部分
    const sortedPlaceholders = Object.keys(protectionMap).sort((a, b) => b.length - a.length);
    for (const placeholder of sortedPlaceholders) {
        // 同样使用 while 循环，以防同一个占位符需要恢复多次
        while (replacedText.includes(placeholder)) {
            replacedText = replacedText.replace(placeholder, protectionMap[placeholder]);
        }
    }

    return replacedText;
}

// ============================================================
// 动态立绘（Sprite-based 精灵动画）模块
// 移植自 WebView.html，立绘资源目录改为 imgs/animation/
// ============================================================

const HERO_ANIM_BASE = 'imgs/animation/';
const HERO_ANIM_PAD = 20;           // 与 compose_hero.py 的 MESH_PAD 保持一致
const HERO_ANIM_VIEW_RATIO = 0.85;  // 与静态立绘相同的可用空间比例（85vw/85vh）

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
 * 安全地把任意 hero.color 值转成英文小写颜色 key（'red'/'blue'/'green'/'yellow'/'purple'）。
 * 兼容：英文、中文简体、中文繁体、大小写、未知值（兜底 'red'，绝不返回 undefined）。
 */
function getSafeColorKey(colorValue) {
    const FALLBACK = 'red';
    const VALID = ['red', 'blue', 'green', 'yellow', 'purple'];

    if (colorValue === null || colorValue === undefined) return FALLBACK;
    const raw = String(colorValue).trim();
    if (!raw) return FALLBACK;

    // 1) 通过 colorReverseMap 反查（兼容中文、繁体、大小写）
    if (typeof colorReverseMap !== 'undefined' && colorReverseMap) {
        const mapped = colorReverseMap[raw.toLowerCase()];
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
    const langDict = i18n[state.currentLang];
    const { modalContent, filterInputs } = uiElements;
    const englishClassKey = (classReverseMap[hero.class] || hero.class).toLowerCase();
    const avatarGlowClass = getColorGlowClass(hero.color);
    // 为详情框头像准备变量
    const modalGradientBg = getHeroColorLightGradient(hero.color);
    const modalImageSrc = hero.heroId ? `imgs/hero_icon/${hero.heroId}.webp` : getLocalImagePath(hero.image);

    // 根据星级生成星星的HTML
    let starsHTML = '';
    if (hero.star && hero.star > 0) {
        starsHTML = '<div class="hero-avatar-stars-container">';
        for (let i = 0; i < hero.star; i++) {
            starsHTML += '<img src="imgs/other/star.webp" class="hero-avatar-star" alt="star">';
        }
        starsHTML += '</div>';
    }

    // 根据 costume_id 生成服装图标HTML
    let costumeIconHTML = '';
    if (hero.costume_id && hero.costume_id !== 0) {
        costumeIconHTML = '<img src="imgs/costume/c1.webp" class="hero-avatar-costume-icon" alt="costume">';
    }

    // 根据 family 生成家族图标HTML
    let familyIconHTML = '';
    if (hero.family) {
        const familyIconSrc = `imgs/family/${String(hero.family).toLowerCase()}.webp`;
        familyIconHTML = `<img src="${familyIconSrc}" class="hero-avatar-family-icon" alt="${hero.family}" onerror="this.style.display='none'">`;
    }

    // 根据 class 生成职业图标HTML
    let classIconHTML = '';
    if (hero.class) {
        const englishClass = (classReverseMap[hero.class] || hero.class).toLowerCase();
        classIconHTML = `<img src="imgs/classes/${englishClass}.webp" class="hero-avatar-class-icon" alt="${hero.class}" title="${hero.class}">`;
    }
    // --- 生成被动技能图标(包含两种来源) ---
    let passiveSkillsHtml = '';

    // `hero.passiveSkills` 在新数据里是 `[{id,title,text}]`（旧数据是纯字符串数组）⇒ 统一取 `id`
    //   当图标 key（旧实现直接拿对象去查表 ⇒ 恒 undefined，头像被动图标一直不显示）。
    const _pid = (x) => (x && typeof x === 'object') ? (x.id || '') : String(x || '');
    const basePassives = (hero.passiveSkills || []).map(_pid).filter(Boolean);
    const costumePassives = (hero.costumeBonusPassiveSkillIds || []).map(_pid).filter(Boolean);

    // ⚠ **不要再倒序**（用户 2026-10-10）：导出侧已取消逆序、按官方配置数组原序输出
    //   （`passive_desc_gen.ORDER_MODE = 'config'`）⇒ 网站**原样使用**即可。
    //   这里的 `[...].reverse()` 是当年为"对冲导出侧的逆序"加的补偿，导出改原序后它会
    //   把头像被动图标又翻回去，与详情页被动段（原样渲染导出顺序）**互相打架** ⇒ 已移除。
    const allPassiveSkills = [
        ...basePassives,
        ...costumePassives
    ];

    // --- 生成头像上的 Aether Power 叠加图标 ---
    let aetherPowerIconHTML = '';
    // 检查英雄是否有 AetherPower 属性
    if (hero.AetherPower) {
        const framePath = 'imgs/Aether Power/frame.webp';

        // 使用已有的 aether_powerReverseMap 和逻辑来获取正确的图标文件名
        const iconFileName = (aether_powerReverseMap[String(hero.AetherPower).toLowerCase()] || hero.AetherPower)
            .toLowerCase()

        const iconPath = `imgs/Aether Power/${iconFileName}.webp`;

        aetherPowerIconHTML = `
            <div class="hero-aether-power-icon-container" title="${hero.AetherPower}">
                <img src="${framePath}" class="hero-aether-power-frame" alt="Aether Power Frame">
                <img src="${iconPath}" class="hero-aether-power-image" alt="${hero.AetherPower}" onerror="this.style.display='none'">
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
                    baseIconHtml = `<img src="${shieldPath}" class="hero-avatar-passive-icon" alt="${skillKey}" title="${skillTitle}">`;

                    // 叠加层是 "原本" 的图标 (缩小)
                    // 注意: alt="" 是故意的，避免屏幕阅读器重复播报，title 保留悬停提示
                    overlayIconHtml = `<img src="${originalIconPath}" class="hero-avatar-passive-overlay-icon" alt="" title="${skillTitle}" onerror="this.style.display='none'">`;

                } else {
                    // --- 普通技能 ---
                    // 基础层就是 "原本" 的图标
                    baseIconHtml = `<img src="${originalIconPath}" class="hero-avatar-passive-icon" alt="${skillKey}" title="${skillTitle}" onerror="this.style.display='none'">`;
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
    //   被动段用它：用户 2026-10-10「把被动的点击词条改为点击技能标题」——
    //   词条只负责展示，点标题才触发一键快速搜索。
    const renderListAsHTML = (itemsArray, filterType = null, opts = null) => {
        const clickable = !(opts && opts.clickable === false);
        if (!itemsArray || !Array.isArray(itemsArray) || itemsArray.length === 0) return `<li>${langDict.none}</li>`;


        // 定义一个正则表达式，用于匹配“纯星号标题行”
        // (从头到尾只包含空格或星号)
        const starHeaderPattern = /^[\s*]+$/;

        // ▼▼▼ 定义颜色映射表 ▼▼▼
        const colorNameMap = {
            'purple': '#ca4bf8ff', // 暗黑系 (紫)
            'green': '#70e92f',  // 自然系 (绿)
            'red': '#ef3838ff',    // 烈火系 (红)
            'yellow': '#c2b52dff', // 神圣系 (黄)
            'blue': '#26d0faff',   // 冰雪系 (蓝)
            'orange': '#ff7800ff'   // 被动天赋 (橙)
        };
        const specialColor = '#2d81e2ff'; // [#!] 词条使用的颜色

        // 检查是否启用了高亮技能词条
        const shouldHighlight = getCookie('highlightSkillTerms') !== 'false';

        // 过滤/悬浮提示用的"纯文本"：把 `[#Dynamic]…[#]` 注记剥成裸数值
        // （否则标记会漏进 `data-filter-value` / `title`，用户 2026-10-10 报的动态伤害场景）。
        // `[*]` 也要从筛选值/提示里去掉（否则 `data-filter-value` 会带出 `[*]보드의…` 这种残留）
        const _plainItem = (s) => String(s)
            .replace(/\[#Dynamic\]([^\[\]]*)\[#\]/g, (m, v) => v)
            .replace(/\[\*+\]/g, '')
            .trim();

        // `[*]` = **子行标记**（缩进 + 保留未着色的 `*`，见下方外层组装）；行首 `*` 才是"括号补充说明"的虚线标记。
        // `opts.noParen=true` ⇒ 括号注释由外层 `_renderEntryInner` 在**整条**范围内统一处理，
        //   这里不再按单行认括号（否则内层括号会被误判，用户 2026-10-10）。
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
            //   动态值就会变成"普通蓝色数字"（用户 2026-10-10 报的）。
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
        //     颜色标记裸露成 `[##elementorange]…` 的问题（用户 2026-10-10 报的 construct_bonechill_costume_bedrock）。
        // 我们导出的词条里，子行有两种承载方式：
        //   ① 并入同一字符串（`\n` + `[*]`）—— 如 passiveSkills[].text；
        //   ② 拆成**数组的独立元素**且以 `[*]` 开头 —— 如 familyBonus。
        // 两种都要**留在同一个 <li> 里**（用户 2026-10-10）：主行照常渲染，子行用 `<br>` 接在后面，
        // 加 `.skill-subline` 缩进，`*` 保留在行首但**不着色**。
        // 子行的正文**必须走完整处理链**（关键字着色 + 数值高亮 + 标记转 HTML），
        // 否则会出现「子行不着色 / 数值不高亮」（用户 2026-10-10 titan_hunter_borgholf）。
        // 做法：复用 `_renderOneCore` 拿到 <li>，抽出内层 HTML 再包进 .skill-subline。
        const _splitLi = (li) => {
            const m = String(li).match(/^(<li[^>]*>)([\s\S]*)(<\/li>)\s*$/);
            return m ? { open: m[1], inner: m[2], close: m[3] } : { open: '<li>', inner: String(li), close: '</li>' };
        };
        const _appendSubs = (li, subs) => subs ? li.replace(/<\/li>\s*$/, subs + '</li>') : li;

        // ── 括号注释块（用户 2026-10-10：「括号只适用最外层，内层的括号不作为换行注释解析」）──
        //   规则：从左往右找第一个**配对完整**的括号；只有当它的闭括号是**本行最后一个字符**
        //   （允许后面跟 `.` / `。`）时才算注释块，否则算普通正文、继续往后找。
        //   ⇒ `被…获得血莲标记。 (来自…（最高：10）。\n[*]…\n[*]…。)` 里**外层** `(来自…）` 才是注释块，
        //     内层的 `（最高：10）` 原样留在正文；`使所有盟友（包括自己）获得增益。` 这种行内括号完全不受影响。
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
        // 一条词条 → [{kind:'text',text}, {kind:'paren',text,tail}]（保持原顺序）
        const _splitAnnotations = (s) => {
            const parts = [];
            let seg = '', i = 0;
            while (i < s.length) {
                const c = s[i];
                if (c === '(' || c === '（') {
                    const m = _matchParen(s, i);
                    if (m > -1 && _isLineTail(s, m)) {
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

        // 一条词条 → `{open, inner}`：`open` = 主行的 `<li …>` 开标签（没有主行时为 null）。
        // 全部内容留在**同一个 <li>** 里：主行照常，`[*]` 行 = `.skill-subline` 子行，括号注释块 = 虚线块。
        // 用户 2026-10-10 的三条排版口径：
        //   ① 括号注释块**去掉前后括号**，只留橙色 `*` + 着色虚线下划线；
        //   ② 注释块**比主词条多缩进**（`.paren-note{padding-left}`），块内子词条**也保持虚线**
        //      （`.skill-subline` 是 inline-block，`text-decoration` 不会自动传下去 ⇒ 显式 inherit）；
        //   ③ 词条**开头不产生空行**（整条都是 `[*]` 子行时，第一行不再补 `<br>`）。
        const _renderEntryInner = (raw, forceSub) => {
            // `forceSub=true` ⇒ 这段内容要**接到已有 `<li>` 后面** ⇒ 第一行也要补 `<br>`（否则会和上文黏在一起）
            let open = null, inner = '', headDone = false, hasContent = !!forceSub;
            // 上一条产出的是不是 `[*]` 子行 —— 括号注释块要**比它再多缩进一级**
            //   （用户 2026-10-10：谦逊分组后的词条本来就有缩进，括号块跟它一样深就看不出差别）
            let lastWasSub = false;
            // 层级标记 = `[` + N 个 `*` + `]`（用户 2026-10-10：`[*]` 一级 / `[**]` 二级 …）。
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
            };
            _splitAnnotations(String(raw)).forEach(p => {
                if (p.kind === 'text') {
                    p.text.split('\n').map(s => s.trim()).filter(s => s !== '').forEach(l => {
                        const r = _one(l);
                        if (!headDone && !r.isSub) { headDone = true; open = r.open; inner += r.inner; hasContent = true; lastWasSub = false; }
                        else { headDone = true; _pushSub(r.inner, r.open, r.lvl); }
                    });
                    return;
                }
                // 括号注释块：去掉 `(` `)`，整块套虚线 + 左侧多缩进。
                // ⚠ 2026-10-10 用户口径（`ghost_xiwang_gui`「2 个额外说明合并为一个括号了 但缩进却不一样
                //   应该为同一级别」）：块内各行**缩进必须一致** —— 原来第 2 行起套 `.skill-subline`
                //   （+1.4em）比第 1 行深，看着像两级。现在除首行外只加 `<br>` + `* ` 项目符，
                //   **不再加缩进类**；虚线由 `.paren-note` 直接继承（也省掉 `.paren-note .skill-subline`
                //   那条 inherit 规则的作用）。
                const hadContent = hasContent;
                let body = '', bodyHas = false;
                p.text.split('\n').map(s => s.trim()).filter(s => s !== '').forEach((l, i) => {
                    const r = _one(l);
                    // 行头 = `.paren-mark` 的 `*` + **一个空格**（用户 2026-10-10：「补上」）
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
                inner += (hadContent ? '<br>' : '')
                    + `<span class="paren-note${lastWasSub ? ' paren-note-sub' : ''}">`
                    + (body ? '' : `<span class="paren-mark">*</span>`) + body + p.tail + '</span>';
                hasContent = true;
            });
            return { open, inner };
        };

        // `[*]` 数组元素要不要并进上一条 `<li>` —— **按列表类型分**（用户 2026-10-10）：
        //   · `familyBonus`：`[*]` 是「奖励表头」下的子项 ⇒ **并进上一条**（用户点名要求）；
        //   · `effects`（`skills[].lines`）：**每个数组元素各自成一个 `<li>`**
        //     —— 旧站就是这么拍的（`谦逊低于 40 时：` / `[*]对目标…` … 共 7 条扁平行），
        //     用户 2026-10-10：「谦逊这种选择性的技能被直接当成 2 个大组别元素了，需要修复回按词条分组元素」。
        //   · `passives` 传进来的是单元素数组（子行在字符串内用 `\n[*]`）⇒ 这里不涉及。
        const _mergeSubItems = (filterType === 'familyBonus');
        // 「整条只有括号注释」的元素（如 `[*](头目、泰坦和神话泰坦不受此状态效果影响。)`）：
        //   它**归属于上一行词条**（数据里就是那行的括注）⇒ 必须并进上一条 `<li>`，
        //   不能单独成一个网页元素（用户 2026-10-10）。
        const _isPureParen = (s) => {
            const parts = _splitAnnotations(String(s).replace(/^\s*\[\*+\]\s*/, ''));
            return parts.length > 0 && parts.every(p => p.kind === 'paren');
        };

        // ── 官方 `[*]` 是**行内 token**（`…持续 2 回合。 [*]每回合结束时…` / `([*]安全地偷取…`），
        //   而本站只按「**行首** `[*]`」识别子行 ⇒ 渲染前先归一到行首。
        //   生成器侧已归一（`skill_desc_gen.norm_sublines`），这里是**防御层**：
        //   旧档 / 手工数据 / 其它来源也不会把 `[*]` 裸露给用户
        //   （2026-10-10 实测 ar 87 / tc 44 / ja 40 / fr 7 行内 `[*]` 裸露）。
        //   ⚠ 必须放在 `_isPureParen` / `_renderEntryInner` **之前**（两者都按行首判据工作）。
        const _normBullets = (s) => String(s)
            .replace(/[ \t\u00a0]*(\[\*+\])[ \t\u00a0]*/g, '\n$1')
            .replace(/\n{2,}/g, '\n')
            .replace(/^\n+|\n+$/g, '');

        return itemsArray.reduce((acc, item) => {
            const raw = _normBullets(item);
            if (!raw.replace(/^\s+/, '')) return acc;
            // ② 并进上一条 <li>：familyBonus 的所有 `[*]` 子项；以及**任何**列表里"整条只有括号"的元素
            const _merge = acc.length && ((_mergeSubItems && /^\s*\[\*+\]/.test(raw)) || _isPureParen(raw));
            if (_merge) {
                acc[acc.length - 1] = _appendSubs(acc[acc.length - 1],
                    _renderEntryInner(raw, true).inner);
                return acc;
            }
            // ① 其余情况：整条自成一个 <li>（首行作主行，其余 `[*]` 行作缩进子行；括号注释块可跨行）
            const r = _renderEntryInner(raw, false);
            acc.push(`${r.open || '<li>'}${r.inner}</li>`);
            return acc;
        }, []).join('');
    };

    // --- 解析英雄名称 ---
    const skinInfo = getSkinInfo(hero);
    const heroSkin = skinInfo.skinIdentifier;
    const mainHeroName = skinInfo.baseName;
    const englishName = hero.english_name;

    // 使用所有三个变量来构建最终的HTML
    // ▼ 统一使用主英雄名作为筛选填充值 ▼
    const filterValue = mainHeroName;

    // 移除最右边的元素后缀
    const ignorableElementSuffixes = ['dark', 'holy', 'ice', 'nature', 'fire'];
    const elementSuffixRegex = new RegExp(`\\s+(${ignorableElementSuffixes.join('|')})$`, 'i');
    let cleanedFilterValue = filterValue;

    // 检查是否需要移除后缀
    if (elementSuffixRegex.test(filterValue)) {
        cleanedFilterValue = filterValue.replace(elementSuffixRegex, '').trim();
    }

    // 英文名的后缀清理（跟 filterValue 一样的处理）
    let cleanedEnglishName = englishName || '';
    if (elementSuffixRegex.test(cleanedEnglishName)) {
        cleanedEnglishName = cleanedEnglishName.replace(elementSuffixRegex, '').trim();
    }
    
    const nameBlockHTML = `
        ${englishName ? `<p class="hero-english-name">${cleanedEnglishName}</p>` : ''}
        <h1 class="hero-main-name skill-type-tag" data-filter-type="name" data-filter-value="${cleanedFilterValue}" title="${langDict.filterBy} '${mainHeroName.trim()}'">${mainHeroName}</h1>
    `;

    const source = filterInputs.skillTypeSource.value;
    const uniqueSkillTypes = getSkillTagsForHero(hero, source);
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
                let innerHTML = label; // 默认只显示文字

                // 如果来源是 bbcamp，则添加图标（图标文件名按 **CN 键** 取，不能跟着翻译走）
                if (source === 'bbcamp') {
                    const iconSrc = getIconForFilter('skillTag_base', type);
                    // 这里我们复用 option-icon class，因为它已经定义了合适的尺寸
                    const iconHTML = iconSrc ? `<img src="${iconSrc}" class="option-icon" alt="" onerror="this.style.display='none'"/>` : '';
                    innerHTML = `${iconHTML}${label}`;
                }

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

    // 被动技能 / 家族奖励的**大图标**（用户 2026-10-10：
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
                + `<img src="imgs/passive_icon/resist_shield.webp" class="big-skill-icon" alt="${key}">`
                + `<img src="${src}" class="big-passive-overlay-icon" alt="" onerror="this.style.display='none'">`
                + `</span>`;
        }
        return `<img src="${src}" class="big-skill-icon" alt="${key}" onerror="this.style.display='none'">`;
    };

    // ── 被动技能段：每个被动 = 大图标 + 被动名（同一行），下一元素是该被动的词条 ──
    // 新数据 `hero.passiveSkills = [{id,title,text}]`；旧形状（纯文本数组）走 `hero.passives` 兜底。
    const _passiveItems = (hero.passiveSkills && hero.passiveSkills.length)
        ? hero.passiveSkills.filter(p => p && (p.text || p.id))
        : (hero.passives || []).map(t => ({ id: '', title: '', text: t }));
    const passivesSectionHTML = `<div id="modal-passives-section" class="skill-category-block">
        <p class="uniform-style">${langDict.modalPassiveSkill}</p>
        ${_passiveItems.length ? _passiveItems.map(p => {
            const _title = p.title || p.id || '';
            // 被动名可点 ⇒ **一键快速搜索该被动**（复用既有的 `.skill-type-tag` 点击逻辑；
            // 没有标题的旧数据就不挂，免得点出一空筛选，用户 2026-10-10）
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

    // ── 家族奖励段：**原标题保持原样**（用户 2026-10-10：图标和标题是"额外添加"不是"替代"），
    //    标题下面再加一行「大图标 + 家族名」，下一元素是家族奖励词条 ──
    //    大图标旁的家族名走**官方 `family_title` 表**（`langs_json/family_title_<码>.json`，
    //    如 `asgard → 阿斯加德王国`），不是 `family` 表里的分组短名（`S3 - 阿斯加德`）；
    //    表外家族（123 条之外）回退 `getDisplayName`（用户 2026-10-10）。
    const _familyTitleTable = (typeof Lang !== 'undefined') ? Lang.get('family_title') : {};
    const familyTitleName = (hero.family && _familyTitleTable[hero.family])
        || getDisplayName(hero.family, 'family');
    const familyBonusSectionHTML = familyBonus.length > 0 ? `
        <div id="modal-family-bonus-section" class="skill-category-block">
            <p class="uniform-style">${langDict.modalFamilyBonus(`<span class="skill-type-tag" data-filter-type="family" data-filter-value="${hero.family}"><img src="imgs/family/${String(hero.family).toLowerCase()}.webp" class="family-icon"/>${getDisplayName(hero.family, 'family')}</span>`)}</p>
            <div class="skill-header-container">
                <img src="imgs/family/${String(hero.family).toLowerCase()}.webp" class="big-skill-icon" alt="${hero.family}" onerror="this.style.display='none'">
                <div class="skill-name-speed-block"><p class="uniform-style big-skill-name">${familyTitleName}</p></div>
            </div>
            <ul class="skill-list">${renderListAsHTML(familyBonus, 'familyBonus')}</ul>
        </div>` : '';

    // ── 「服装奖励」下拉（用户 2026-10-10）──
    // 只有带服装奖励表的英雄（688/702 个服装）才显示；**默认 = 最多套**。
    // 选项 = 「无」+ 每一套对应的**服装图标 + 服装名**（`C1/C2/卡通/玻璃/英姿`，按当前语言）。
    // ⚠ 原生 `<select>` 的 `<option>` 放不了图片 ⇒ 用一排小按钮当选择器（用户 2026-10-10）。
    // ⚠ 这只影响**详情页**显示；列表属性仍按"该英雄自身的服装顺序"算（见 filters.js::calculateHeroStats）。
    const _costumeSkinOf = (k) => {
        let cid = k;
        if (hero.family === 'classic') { if (hero.star === 3 && cid > 1) cid += 1; }
        if (hero.family !== 'classic') { if (cid === 2) cid = 3; }
        // 档位 → 服装类型键（与 `getSkinInfo` / `getCostumeIconName` 同一套映射）；
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
                + `<img src="imgs/costume/${sk.icon}.webp" alt="" onerror="this.style.display='none'"><span>${sk.name}</span></button>`;
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
                            <div class="cost-item"><img src="imgs/emblems/${englishClassKey}.webp" class="cost-icon" alt="纹章图标">${langDict.emblemCostLabel}<span id="cost-emblem">0</span></div>
                            <div class="cost-item"><img src="imgs/farm/Food.webp" class="cost-icon" alt="食物图标">${langDict.foodCostLabel}<span id="cost-food">0</span></div>
                            <div class="cost-item"><img src="imgs/farm/Iron.webp" class="cost-icon" alt="铁矿图标">${langDict.ironCostLabel}<span id="cost-iron">0</span></div>
                            <div class="cost-item"><img src="imgs/emblems/master_${englishClassKey}.webp" class="cost-icon" alt="大师纹章图标">${langDict.masterEmblemCostLabel}<span id="cost-master-emblem">0</span></div>
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
        ? `<img src="imgs/skill_icon/special_${specialId}.webp" class="special-skill-icon" alt="${specialId} icon" onerror="this.style.display='none'">`
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
                    <img src="${modalImageSrc}" id="modal-hero-avatar-img" class="hero-avatar-image-modal" alt="${hero.name}" loading="lazy" onerror="this.src='imgs/not_found.webp'">
                    
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
                    ${hero.class ? `<span class="hero-info-block skill-type-tag" data-filter-type="class" data-filter-value="${hero.class}"><img src="imgs/classes/${(classReverseMap[hero.class] || hero.class).toLowerCase()}.webp" class="class-icon"/>${hero.class}</span>` : ''}
                    ${heroSkin ? `<span class="hero-info-block skill-type-tag" data-filter-type="costume" data-filter-value="${heroSkin}">${langDict.modalSkin} <img src="imgs/costume/${getCostumeIconName(hero)}.webp" class="costume-icon"/></span>` : ''}
                    ${hero.AetherPower ? `<span class="hero-info-block skill-type-tag" data-filter-type="aetherpower" data-filter-value="${hero.AetherPower}">⏫<img src="imgs/Aether Power/${(aether_powerReverseMap[hero.AetherPower.toLowerCase()] || hero.AetherPower).toLowerCase()}.webp" class="aether-power-icon"/>${hero.AetherPower}</span>` : ''}
                    ${hero.family ? `<span class="hero-info-block skill-type-tag" data-filter-type="family" data-filter-value="${hero.family}"><img src="imgs/family/${String(hero.family).toLowerCase()}.webp" class="family-icon"/>${getDisplayName(hero.family, 'family')}</span>` : ''}
                    ${hero.source ? `<span class="hero-info-block skill-type-tag" data-filter-type="source" data-filter-value="${hero.source}"><img src="imgs/coins/${sourceIconMap[sourceReverseMap[hero.source]]}" class="source-icon"/>${getDisplayName(hero.source, 'source')}</span>` : ''}
                    ${hero['Release date'] ? `<span class="hero-info-block">📅 ${formatLocalDate(hero['Release date'])}</span>` : ''}
                </div>
                <h3 id="modal-core-stats-header">${langDict.modalCoreStats}</h3>
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
                <p class="uniform-style">${langDict.modalSpecialSkill}</p>
                <ul class="skill-list">${renderListAsHTML(hero.effects, 'effects')}</ul>
            </div>
            ${passivesSectionHTML}
            ${familyBonusSectionHTML}
        </div>
        <div class="modal-footer"><button class="close-bottom-btn" id="hide-details-bottom-btn">${langDict.detailsCloseBtn}</button></div>
    `;

    modalContent.innerHTML = detailsHTML;

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
            finalStats.power = (STAR_BASE_POWER[hero.star] || 0) + Math.floor((baseStats.attack * 0.35) + (baseStats.defense * 0.28) + (baseStats.health * 0.14)) + 35 + (nodeCount * 5);
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
                    bonusHTML += `<div class="bonus-item"><img src="imgs/talents/${iconMap[key]}" class="bonus-icon" alt="${bonus.label}">${bonus.label}<span>+${bonus.value}${bonus.isPercent ? '%' : ''}</span></div>`;
                }
            }
            bonusDisplay.innerHTML = bonusHTML || `<div class="bonus-item">${langDict.noBonusLabel}</div>`;

            const costs = { emblem: 0, food: 0, iron: 0, masterEmblem: 0 };
            const relevantCosts = costData.filter(item => Math.floor(item.slot / 100) === hero.star);
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
            TalentTree.init(document.getElementById('modal-talent-tree-wrapper'), hero.class, settingsToUse, talentChangeCallback, langDict.talentTerms);
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
            // 优先使用 heroId，若不存在则回退到旧格式（保险）
            const identifier = hero.heroId
                ? hero.heroId
                : `${hero.english_name}-${hero.costume_id}`;
            const url = `${window.location.origin}${window.location.pathname}?view=${encodeURIComponent(identifier)}&lang=${state.currentLang}`;
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
                        const colorKey = getSafeColorKey(hero.color);

                        // 优先处理 classic 家族
                        if (family === 'classic') {
                            const classicMap = {
                                3: 'cute',
                                4: 'stainedglass',
                                5: 'stylish'
                            };
                            if (hero.star === 3) {
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

                        // ✅ sourceReverseMap 也可能拿不到，改成安全取值
                        const srcKey = (typeof sourceReverseMap !== 'undefined' && sourceReverseMap && hero.source)
                            ? String(sourceReverseMap[hero.source]).toLowerCase()
                            : '';

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
                        const colorFilter = getColorFilterForHero(hero.color);
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
                <img src="${reward.img}" alt="Reward Image" class="reward-icon">
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

    const englishColor = (colorReverseMap[String(color).toLowerCase()] || color).toLowerCase();
    return colorMap[englishColor] || colorMap['white']; // 默认使用白色光效
}
