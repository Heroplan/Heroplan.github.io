// render.js: 负责将数据渲染到页面上，主要是英雄列表和详情模态框。



/**
 * 从英雄名称中分离出皮肤信息和基础名称。
 * @param {object} hero - 英雄对象。
 * @returns {{skinIdentifier: string|null, baseName: string}} 包含皮肤标识符和基础名称的对象。
 */
function getSkinInfo(hero) {
    const name = hero.name || '';
    if (!name) return { skinIdentifier: null, baseName: name };

    // ▼▼▼▼▼ 专门处理拟态兽的颜色后缀 ▼▼▼▼▼
    const isMimic = name.includes('Mimic') || name.includes('拟态兽') || name.includes('模仿怪');
    if (isMimic) {
        const afterParenthesesIndex = name.lastIndexOf(')');
        if (afterParenthesesIndex !== -1 && afterParenthesesIndex < name.length - 1) {
            const potentialSuffix = name.substring(afterParenthesesIndex + 1).trim().toLowerCase();
            const allowedSuffixes = ['ice', 'nature', 'dark', 'holy', 'fire'];
            if (allowedSuffixes.includes(potentialSuffix)) {
                // 如果是拟态兽且后面跟着有效的颜色后缀，则移除后缀进行显示
                const baseName = name.substring(0, afterParenthesesIndex + 1).trim();
                return { skinIdentifier: null, baseName: baseName };
            }
        }
    }

    const skinPattern = /\s*(?:\[|\()?(C\d+|\S+?)(?:\]|\))?\s*$/;
    const skinMatch = name.match(skinPattern);

    if (skinMatch && skinMatch[1] && hero.costume_id !== 0) {
        const potentialSkin = skinMatch[1].toLowerCase();
        if (potentialSkin.match(/^c\d+$/) || ['glass', 'toon', '玻璃'].includes(potentialSkin) || potentialSkin.endsWith('卡通') || potentialSkin.endsWith('皮肤') || potentialSkin.endsWith('皮膚')) {
            return {
                skinIdentifier: skinMatch[1],
                baseName: name.substring(0, name.length - skinMatch[0].length).trim()
            };
        }
    }
    return { skinIdentifier: null, baseName: name };
}

/**
 * 根据皮肤标识符获取对应的图标文件名。
 * @param {string} skinIdentifier - 皮肤标识符 (e.g., 'C1', 'Toon')。
 * @returns {string|null} 图标文件名或null。
 */
function getCostumeIconName(skinIdentifier) {
    if (!skinIdentifier) return null;
    const lowerSkin = String(skinIdentifier).toLowerCase();
    if (lowerSkin.startsWith('c')) {
        const match = lowerSkin.match(/^c\d+/);
        if (match) return match[0];
    }
    if (lowerSkin.includes('glass') || lowerSkin.includes('玻璃')) return 'glass';
    if (lowerSkin.includes('toon') || lowerSkin.includes('卡通')) return 'toon';
    return null;
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
    if (skinInfo.skinIdentifier) {
        const iconName = getCostumeIconName(skinInfo.skinIdentifier);
        if (iconName) {
            content = `<img src="imgs/costume/${iconName}.webp" class="costume-icon" alt="${iconName} costume" title="${skinInfo.skinIdentifier}"/>${content}`;
        }
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
                content = getSkillTagsForHero(hero, source).join(', ');
            } else if (key === 'name') {
                let displayName = hero.name;

                // 第1步: 移除元素后缀 (现有逻辑)
                const ignorableElementSuffixes = ['dark', 'holy', 'ice', 'nature', 'fire', 'red', 'blue', 'green', 'yellow', 'purple'];
                const elementSuffixRegex = new RegExp(`\\s+(?:\\()?(${ignorableElementSuffixes.join('|')})(?:\\))?$`, 'i');
                displayName = displayName.replace(elementSuffixRegex, '').trim();

                // ▼▼▼ 移除服装后缀 ▼▼▼
                // 第2步: 移除 C1, C2, 玻璃, 卡通等服装后缀
                const costumeSuffixRegex = /\s*(?:\[|\()?(C\d+|glass|toon|玻璃|卡通|皮肤|皮膚)(?:\]|\))?\s*$/i;
                displayName = displayName.replace(costumeSuffixRegex, '').trim();

                content = displayName || '';
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
                const skinInfo = getSkinInfo(hero);
                if (skinInfo.skinIdentifier) {
                    const iconName = getCostumeIconName(skinInfo.skinIdentifier);
                    if (iconName) {
                        // 使用一个新的、专门用于头像的CSS类
                        costumeIconHtml = `<img src="imgs/costume/c1.webp" class="table-avatar-costume-icon" alt="${iconName} costume" title="${skinInfo.skinIdentifier}"/>`;
                    }
                }

                return `<td class="col-image">
                            <div class="hero-avatar-container ${heroColorClass}">
                                <div class="hero-avatar-background" style="background: ${gradientBg};"></div>
                                <img src="${imageSrc}" class="hero-avatar-image" alt="${hero.name}" loading="lazy" onerror="this.src='imgs/heroes/not_found.webp'">
                                ${costumeIconHtml}
                            </div>
                        </td>`;
            }
            else {
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
 * 根据英雄当前的攻击力，更新模态框中所有DoT技能的伤害数值。
 * @param {object} hero - 英雄对象。
 * @param {number} currentAttack - 英雄当前计算后的攻击力。
 */
function updateDynamicDoTDisplay(hero, currentAttack) {
    if (!hero.dynamicDoTEffects || hero.dynamicDoTEffects.length === 0) return;

    hero.dynamicDoTEffects.forEach(dotInfo => {
        const skillList = document.querySelector('#modal .skill-category-block .skill-list');
        if (!skillList || !skillList.children[dotInfo.index]) return;

        const liElement = skillList.children[dotInfo.index];

        const newDisplayDamage = dotInfo.isPerTurn
            ? Math.round((dotInfo.coefficient * currentAttack) / dotInfo.turns)
            : Math.round(dotInfo.coefficient * currentAttack);

        const dynamicSpanId = `dot-value-${dotInfo.index}`;
        let dynamicSpan = liElement.querySelector(`#${dynamicSpanId}`);

        if (!dynamicSpan) {
            const regex = new RegExp(`\\b${dotInfo.originalDamage}\\b`);
            liElement.innerHTML = liElement.innerHTML.replace(
                regex,
                `<span id="${dynamicSpanId}" class="dynamic-value">${newDisplayDamage}</span>`
            );
        } else {
            dynamicSpan.textContent = newDisplayDamage;
        }
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
            'Stack (Max: 10)': '[##elementred]Stack (Max: 10)[#]',
            'stack (Max: 10)': '[##elementred]Stack (Max: 10)[#]',
            'stacks': '[##elementred]stacks[#]',
            'stack': '[##elementred]stack[#]',
            'Soul Bound': '[##elementred]Soul Bound[#]',
            'Greed': '[##elementred]Greed[#]',
            'Deep Sleep': '[##elementred]Deep Sleep[#]',
            'falls asleep': '[##elementred]falls asleep[#]',
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
            '暴击几率': '[##elementred]暴击几率[#]',
            '暴擊率': '[##elementred]暴擊率[#]',
            '暴击': '[##elementred]暴击[#]',
            '暴擊': '[##elementred]暴擊[#]',
            '免疫': '[##elementgreen]免疫[#]',
            '状态异常免疫': '[#!]状态异常免疫[#]',
            '狀態異常免疫': '[#!]狀態異常免疫[#]',
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
            '沙系傷害': '[##elementyellow]沙系伤害[#]',
            '水系伤害': '[##elementblue]水系伤害[#]',
            '水系傷害': '[##elementblue]水系傷害[#]',
            '冰冻伤害': '[##elementblue]冰冻伤害[#]',
            '冰霜傷害': '[##elementblue]冰霜傷害[#]',
            '腐蚀冰冻': '[##elementblue]腐蚀冰冻[#]',
            '腐蝕冰霜': '[##elementblue]腐蝕冰霜[#]',
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
    // 统一将 'zh-CN', 'zh-TW' 等处理为 'zh'
    const langKey = (lang === 'en') ? 'en' : 'zh';
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
function applyKeywordHighlighting(text, lang, filterType) {
    if (!text || typeof text !== 'string') return text;

    let textToProcess = text;
    let highlightedPrefix = '';

    // --- 如果 filterType 是 'effects' 或 'passives'，则进行特殊预处理 ---
    if ((filterType === 'effects' || filterType === 'passives')) {

        const lengthLimit = (lang && lang.startsWith('en')) ? 75 : 30;
        const hasColon = (text.endsWith(':') || text.endsWith('：')) && text.length < lengthLimit;

        // --- 组合规则：同时满足 hasColon 且是 passives 的特殊情况 ---
        if (hasColon && filterType === 'passives') {

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
            highlightedPrefix = `[#!]${text}[#]`;
            textToProcess = '';
        }
        // ★★★ 专属规则：只针对 effects，处理注释用的括号内容 ★★★
        else if (filterType === 'effects') {
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
        else if ((filterType === 'passives') && !text.startsWith('-')) {
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

                // 仅应用 orange 高亮，并让文本继续后续处理
                textToProcess = `[##elementorange]${partToHighlight}[#]${restOfText}`;
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


/**
 * 在模态框中渲染英雄的详细信息。
 * @param {object} hero - 英雄对象。
 * @param {object} context - 上下文对象，主要用于队伍模拟器。
 */
function renderDetailsInModal(hero, context = {}) {

    const { teamSlotIndex } = context;
    const langDict = i18n[state.currentLang];
    const { modalContent, filterInputs } = uiElements;
    const englishClassKey = (classReverseMap[hero.class] || '').toLowerCase();
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

    const basePassives = hero.passiveSkills || [];
    const costumePassives = hero.costumeBonusPassiveSkillIds || [];

    // 将 数组倒序后，再与合并
    const allPassiveSkills = [
        ...[...basePassives].reverse(),
        ...[...costumePassives].reverse() // 使用 ... 创建副本再倒序，避免修改原始数据
    ];

    // --- 生成头像上的 Aether Power 叠加图标 ---
    let aetherPowerIconHTML = '';
    // 检查英雄是否有 AetherPower 属性
    if (hero.AetherPower) {
        const framePath = 'imgs/Aether Power/frame.webp';

        // 使用已有的 aetherPowerReverseMap 和逻辑来获取正确的图标文件名
        const iconFileName = (aetherPowerReverseMap[hero.AetherPower] || hero.AetherPower)
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
    const renderListAsHTML = (itemsArray, filterType = null) => {
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
        const shouldHighlight = getHighlightSkillTermsSetting();

        return itemsArray.map(item => {

            let cleanItem = String(item).trim();

            // 在执行任何分割操作之前，检查它是否为“纯星号标题行”
            // 这一步必须在添加任何标签 *之前* 完成
            if (cleanItem.includes('*') && starHeaderPattern.test(cleanItem)) {
                const compactStars = cleanItem.replace(/\s/g, '');
                return `<li>${compactStars}</li>`;
            }

            // --- 文本美化处理 ---
            if (shouldHighlight) {

                // 只有在用户启用高亮时，才执行“添加标签”的步骤
                cleanItem = applyKeywordHighlighting(cleanItem, state.currentLang, filterType);

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

                if (filterType) {
                    // 如果有 filterType，使用原始 item 来获取数据属性，然后渲染上面生成好的 displayHTML
                    const mainDesc = String(item).trim().split(' * ')[0].trim();
                    return `<li class="skill-type-tag" data-filter-type="${filterType}" data-filter-value="${mainDesc}" title="${langDict.filterBy} ${mainDesc}">${displayHTML}</li>`;
                } else {
                    // 如果没有 filterType，直接渲染
                    return `<li>${displayHTML}</li>`;
                }
            } else {
                // 如果 cleanItem 中不包含 ' * '，则按原样处理
                if (filterType) {
                    const mainDesc = String(item).trim();
                    return `<li class="skill-type-tag" data-filter-type="${filterType}" data-filter-value="${mainDesc}" title="${langDict.filterBy} ${mainDesc}">${cleanItem}</li>`;
                } else {
                    return `<li>${cleanItem}</li>`;
                }
            }
        }).join('');
    };

    // --- 解析英雄名称 ---
    const skinInfo = getSkinInfo(hero);
    const heroSkin = skinInfo.skinIdentifier;
    let mainHeroName = '';
    let englishName = '';
    let traditionalChineseName = '';

    if (state.currentLang === 'en') {
        mainHeroName = skinInfo.baseName;
    } else {
        const multiLangMatch = skinInfo.baseName.match(/^(.*?)\s+([^\s\(]+)\s+\((.*?)\)$/);
        const singleAltLangMatch = skinInfo.baseName.match(/^(.*?)\s*\(([^)]+)\)/);

        if (multiLangMatch) {
            mainHeroName = multiLangMatch[1].trim();
            traditionalChineseName = multiLangMatch[2].trim();
            englishName = multiLangMatch[3].trim();
        } else if (singleAltLangMatch && /[a-zA-Z]/.test(singleAltLangMatch[2])) {
            mainHeroName = singleAltLangMatch[1].trim();
            englishName = singleAltLangMatch[2].trim();
            // 在这种情况下，没有独立的繁体中文名，所以 traditionalChineseName 保持为空字符串
        } else {
            // 如果两种正则都不匹配，则将整个基础名称作为主名称
            mainHeroName = skinInfo.baseName;
        }
    }

    // 使用所有三个变量来构建最终的HTML
    // 使用英文名进行筛选，而不是当前语言显示的名字
    const nameBlockHTML = `
        ${englishName ? `<p class="hero-english-name">${englishName}</p>` : ''}
        <h1 class="hero-main-name skill-type-tag" data-filter-type="name" data-filter-value="${hero.english_name || englishName || mainHeroName.trim()}" title="${langDict.filterBy} '${mainHeroName.trim()}'">${mainHeroName}</h1>
        ${traditionalChineseName ? `<p class="hero-alt-name">${traditionalChineseName}</p>` : ''}
    `;

    const source = filterInputs.skillTypeSource.value;
    const uniqueSkillTypes = getSkillTagsForHero(hero, source);
    let heroTypesContent = '';
    // 检查是否显示技能类别
    const showSkillTypesInDetails = getCookie('showSkillTypesInDetails') !== 'false';

    // 在技能类别部分添加条件渲染
    if (showSkillTypesInDetails) {
        if (uniqueSkillTypes.length > 0) {
            const tagsHTML = uniqueSkillTypes.map(type => {
                let innerHTML = type; // 默认只显示文字

                // 如果来源是 bbcamp，则添加图标
                if (source === 'bbcamp') {
                    const iconSrc = getIconForFilter('skillTag_base', type);
                    // 这里我们复用 option-icon class，因为它已经定义了合适的尺寸
                    const iconHTML = iconSrc ? `<img src="${iconSrc}" class="option-icon" alt="" onerror="this.style.display='none'"/>` : '';
                    innerHTML = `${iconHTML}${type}`;
                }

                return `<span class="hero-info-block skill-type-tag" data-filter-type="types" data-filter-value="${type}" title="${langDict.filterBy} ${type}">${innerHTML}</span>`;
            }).join('');
            heroTypesContent = `<div class="skill-types-container">${tagsHTML}</div>`;
        } else {
            heroTypesContent = `<span class="skill-value">${langDict.none}</span>`;
        }
    }

    const familyBonus = (state.families_bonus.find(f => f.name.toLowerCase() === String(hero.family || '').toLowerCase()) || {}).bonus || [];

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

    let specialSkillIconHTML = '';
    if (hero.specialId) {
        specialSkillIconHTML = `<img src="imgs/skill_icon/special_${hero.specialId}.webp" class="special-skill-icon" alt="${hero.specialId} icon" onerror="this.style.display='none'">`;
    }

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
                    <img src="${modalImageSrc}" id="modal-hero-avatar-img" class="hero-avatar-image-modal" alt="${hero.name}" onerror="this.src='imgs/heroes/not_found.webp'">
                    
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
                    ${heroSkin ? `<span class="hero-info-block skill-type-tag" data-filter-type="costume" data-filter-value="${heroSkin}">${langDict.modalSkin} <img src="imgs/costume/${getCostumeIconName(heroSkin)}.webp" class="costume-icon"/></span>` : ''}
                    ${hero.AetherPower ? `<span class="hero-info-block skill-type-tag" data-filter-type="aetherpower" data-filter-value="${hero.AetherPower}">⏫<img src="imgs/Aether Power/${(aetherPowerReverseMap[hero.AetherPower] || hero.AetherPower).toLowerCase()}.webp" class="aether-power-icon"/>${hero.AetherPower}</span>` : ''}
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
            <div id="modal-skill-effects-section" class="skill-category-block"><p class="uniform-style">${langDict.modalSpecialSkill}</p><ul class="skill-list">${renderListAsHTML(hero.effects, 'effects')}</ul></div>
            <div class="skill-category-block"><p id="modal-passives-section" class="uniform-style">${langDict.modalPassiveSkill}</p><ul class="skill-list">${renderListAsHTML(hero.passives, 'passives')}</ul></div>
            ${familyBonus.length > 0 ? `<div id="modal-family-bonus-section" class="skill-category-block"><p class="uniform-style">${langDict.modalFamilyBonus(`<span class="skill-type-tag" data-filter-type="family" data-filter-value="${hero.family}"><img src="imgs/family/${String(hero.family).toLowerCase()}.webp" class="family-icon"/>${getDisplayName(hero.family, 'family')}</span>`)}</p><ul class="skill-list">${renderListAsHTML(familyBonus, 'familyBonus')}</ul></div>` : ''}
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
        manaPriority: filterInputs.defaultManaPriorityCheckbox.checked
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
            const settings = { lb: modalLbSelect.value, talent: modalTalentSelect.value };
            _updateModalStatsWithBonuses(hero, settings, bonuses, nodeCount);

            let baseStats = { attack: hero.attack, defense: hero.defense, health: hero.health };
            if (settings.lb === 'lb1' && hero.lb1) baseStats = { ...hero.lb1 };
            else if (settings.lb === 'lb2' && hero.lb2) baseStats = { ...hero.lb2 };
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

        // 4. 最后，调用一次 handleTreeAndStatUpdate 来确保天赋树的显示和段位图标都与正确的设置同步
        handleTreeAndStatUpdate();
    }

    document.getElementById('hide-details-btn').addEventListener('click', closeDetailsModal);
    document.getElementById('hide-details-bottom-btn').addEventListener('click', closeDetailsModal);

    const favoriteBtn = document.getElementById('favorite-hero-btn');
    if (favoriteBtn) {
        const updateFavoriteButton = () => {
            if (isFavorite(hero)) {
                favoriteBtn.textContent = '★';
                favoriteBtn.classList.add('favorited');
            } else {
                favoriteBtn.textContent = '☆';
                favoriteBtn.classList.remove('favorited');
            }
        };
        favoriteBtn.addEventListener('click', () => {
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
            const identifier = `${hero.english_name}-${hero.costume_id}`;
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

        // 检查文件是否存在
        const checkAvatarExists = async () => {
            try {
                const response = await fetch(avatarSrc, { method: 'HEAD' });
                return response.status === 200;
            } catch (error) {
                return false;
            }
        };

        checkAvatarExists().then(exists => {
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

                const openImageModal = () => {
                    const imageModal = document.getElementById('image-modal');
                    const imageModalOverlay = document.getElementById('image-modal-overlay');
                    const imageModalContent = document.getElementById('image-modal-content');

                    if (imageModal && imageModalOverlay && imageModalContent) {
                        // 清空之前的内容
                        imageModalContent.innerHTML = '';

                        // 创建英雄立绘容器
                        const portraitContainer = document.createElement('div');
                        portraitContainer.className = 'hero-portrait-container';
                        portraitContainer.style.position = 'relative';
                        portraitContainer.style.display = 'inline-block';
                        portraitContainer.style.maxWidth = '85vw';
                        portraitContainer.style.maxHeight = '85vh';

                        // 添加点击关闭功能
                        portraitContainer.addEventListener('click', closeHeroPortraitModal);


                        // 定义获取背景后缀的函数
                        const getBackgrounSuffix = (family, costumeId) => {
                            // 优先处理 classic 家族
                            if (family === 'classic') {
                                // 定义 costume_id 对应的后缀
                                sourceReverseMap[hero.source].toLowerCase()
                                const classicMap = {
                                    3: 'cute',
                                    4: 'stainedglass'
                                };
                                if (hero.star === 3) {
                                    costumeId = costumeId + 1
                                }
                                if (costumeId <= 2) {
                                    return colorReverseMap[hero.color].toLowerCase();
                                } else if (costumeId === 3) {
                                    return colorReverseMap[hero.color].toLowerCase() + "_" + classicMap[costumeId];
                                } else if (costumeId === 4) {
                                    return classicMap[costumeId] + "_" + colorReverseMap[hero.color].toLowerCase();
                                }

                                // 如果找不到对应的ID，默认返回各颜色背景
                                return colorReverseMap[hero.color].toLowerCase();
                            }

                            // 处理家族映射数组
                            // 键是家族ID，值是文件名后缀
                            const familyToBgMap = {
                                // Astral 系列
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

                                // 如果家族名本身就是文件名后缀，直接用 default 处理
                            };

                            // 如果在映射表中找到了，返回映射值；否则直接使用 family 字段
                            if (hero.family.includes('hotm') || hero.family === 'mystery') {
                                return (colorReverseMap[hero.color].toLowerCase() + "_alt");
                            } else if (sourceReverseMap[hero.source].toLowerCase() === 'season2') {
                                if (hero.family === 'japanese') {
                                    return "s2oriental";
                                } else {
                                    return "s2" + family;
                                }
                            } else if (sourceReverseMap[hero.source].toLowerCase() === 'season3') {
                                if (hero.family === 'jotunheim' || hero.family === 'niflheim') {
                                    return "s3stronghold";
                                } else if (hero.family === 'midgard' || hero.family === 'alfheim') {
                                    return "s3mountains";
                                } else {
                                    return "s3menacing";
                                }
                            } else if (sourceReverseMap[hero.source].toLowerCase() === 'season5') {
                                return "s5" + family;
                            } else if (hero.family === 'gargoyle') {
                                if (hero.passiveSkills.includes('gargoyle_soft_skin')) {
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
                            } else if ((hero.family === 'mimic') || (hero.family === 'trainer')) {
                                return "mimic_training_" + colorReverseMap[hero.color].toLowerCase();
                            } else {
                                return familyToBgMap[family] || family;
                            }
                        };

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



                        /*
                        // 创建光效图片（作为子元素）
                        const raysImage = document.createElement('img');
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
                        const randomRaysNumber = Math.floor(Math.random() * 45) + 1;
                        raysImage.src = `imgs/circle_rays/${randomRaysNumber}.webp`;
                        raysImage.className = 'rays-background';
                        raysImage.style.position = 'absolute';
                        raysImage.style.top = '50%';
                        raysImage.style.left = '50%';
                        raysImage.style.transform = 'translate(-50%, -50%)';
                        raysImage.style.zIndex = '1';
                        raysImage.style.opacity = '1';
                        raysImage.style.pointerEvents = 'none';
                        raysImage.style.maxWidth = '110vw';
                        raysImage.style.maxHeight = '110vh';

                        // 根据英雄颜色设置光效滤镜
                        const colorFilter = getColorFilterForHero(hero.color);
                        const brightnessLevel = 1; // 1 为默认亮度，值越大，亮度越高
                        raysImage.style.filter = `${colorFilter} brightness(${brightnessLevel})`;
                        */

                        // 创建英雄立绘图片
                        const heroImage = document.createElement('img');
                        heroImage.src = avatarSrc;
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

                        // 将光效和立绘添加到容器
                        portraitContainer.appendChild(cardBgImage);
                        //portraitContainer.appendChild(raysImage);
                        portraitContainer.appendChild(heroImage);
                        imageModalContent.appendChild(portraitContainer);

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

                            //raysImage.style.width = finalWidth + 'px';
                            //raysImage.style.height = finalHeight + 'px';

                            setTimeout(() => {
                                this.style.opacity = '1';
                                this.style.transition = 'opacity 0.3s ease';
                            }, 10);
                        };

                        // 显示立绘模态框并添加到堆栈
                        imageModal.classList.add('show-hero-portrait');
                        imageModal.classList.remove('hidden');
                        imageModalOverlay.classList.remove('hidden');

                        // 将立绘模态框加入到模态框堆栈
                        history.pushState({ modal: 'heroPortrait' }, null);
                        state.modalStack.push('heroPortrait');
                    }
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