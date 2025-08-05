// render.js: 负责将数据渲染到页面上，主要是英雄列表和详情模态框。



/**
 * 从英雄名称中分离出皮肤信息和基础名称。
 * @param {object} hero - 英雄对象。
 * @returns {{skinIdentifier: string|null, baseName: string}} 包含皮肤标识符和基础名称的对象。
 */
function getSkinInfo(hero) {
    const name = hero.name || '';
    if (!name) return { skinIdentifier: null, baseName: name };

    // ▼▼▼▼▼ 新增逻辑开始：专门处理拟态兽的颜色后缀 ▼▼▼▼▼
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
    // ▲▲▲▲▲ 新增逻辑结束 ▲▲▲▲▲

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
            content = `<img src="imgs/costume/${iconName}.png" class="costume-icon" alt="${iconName} costume" title="${skinInfo.skinIdentifier}"/>${content}`;
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

    let favHeaderIcon = state.teamSimulatorActive ? '⬆️' : (shouldPredictFavoriteAll ? '★' : '☆');

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
            if (state.teamSimulatorActive) return `<th class="col-fav"></th>`; // 模拟器模式下为空
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
                content = hero[key] || '';
            } else if (key === 'class' && hero[key]) {
                const englishClass = (classReverseMap[hero[key]] || hero[key]).toLowerCase();
                content = `<img src="imgs/classes/${englishClass}.png" class="class-icon" alt="${hero[key]}"/>${hero[key]}`;
            } else if (key === 'color' && hero[key]) {
                const englishColor = (colorReverseMap[String(hero[key]).toLowerCase()] || hero[key]).toLowerCase();
                return `<td class="col-color"><img src="imgs/colors/${englishColor}.png" class="color-icon" alt="${hero[key]}" title="${hero[key]}"/></td>`;
            } else if (key === 'fav') {
                if (!hero.english_name) return `<td class="col-fav"></td>`;
                const icon = state.teamSimulatorActive ? '⬆️' : (isHeroFavorite ? '★' : '☆');
                const favClass = state.teamSimulatorActive ? '' : (isHeroFavorite ? 'favorited' : '');
                return `<td class="col-fav"><span class="favorite-toggle-icon ${favClass}" data-hero-id="${hero.originalIndex}">${icon}</span></td>`;
            } else if (key === 'image') {
                const gradientBg = getHeroColorLightGradient(hero.color);
                const imageSrc = hero.heroId ? `imgs/hero_icon/${hero.heroId}.png` : getLocalImagePath(hero.image);
                const heroColorClass = getColorGlowClass(hero.color);

                // --- 检查英雄是否有皮肤并生成图标HTML ---
                let costumeIconHtml = '';
                const skinInfo = getSkinInfo(hero);
                if (skinInfo.skinIdentifier) {
                    const iconName = getCostumeIconName(skinInfo.skinIdentifier);
                    if (iconName) {
                        // 使用一个新的、专门用于头像的CSS类
                        costumeIconHtml = `<img src="imgs/costume/c1.png" class="table-avatar-costume-icon" alt="${iconName} costume" title="${skinInfo.skinIdentifier}"/>`;
                    }
                }

                return `<td class="col-image">
                            <div class="hero-avatar-container ${heroColorClass}">
                                <div class="hero-avatar-background" style="background: ${gradientBg};"></div>
                                <img src="${imageSrc}" class="hero-avatar-image" alt="${hero.name}" loading="lazy" onerror="this.src='imgs/heroes/not_found.png'">
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
    // 新增：为详情框头像准备变量
    const modalGradientBg = getHeroColorLightGradient(hero.color);
    const modalImageSrc = hero.heroId ? `imgs/hero_icon/${hero.heroId}.png` : getLocalImagePath(hero.image);

    // 根据星级生成星星的HTML
    let starsHTML = '';
    if (hero.star && hero.star > 0) {
        starsHTML = '<div class="hero-avatar-stars-container">';
        for (let i = 0; i < hero.star; i++) {
            starsHTML += '<img src="imgs/other/star.png" class="hero-avatar-star" alt="star">';
        }
        starsHTML += '</div>';
    }

    // 新增：根据 costume_id 生成服装图标HTML
    let costumeIconHTML = '';
    if (hero.costume_id && hero.costume_id !== 0) {
        costumeIconHTML = '<img src="imgs/other/costume.png" class="hero-avatar-costume-icon" alt="costume">';
    }

    // 新增：根据 family 生成家族图标HTML
    let familyIconHTML = '';
    if (hero.family) {
        const familyIconSrc = `imgs/family/${String(hero.family).toLowerCase()}.png`;
        familyIconHTML = `<img src="${familyIconSrc}" class="hero-avatar-family-icon" alt="${hero.family}" onerror="this.style.display='none'">`;
    }

    // 新增：根据 class 生成职业图标HTML
    let classIconHTML = '';
    if (hero.class) {
        const englishClass = (classReverseMap[hero.class] || hero.class).toLowerCase();
        classIconHTML = `<img src="imgs/classes/${englishClass}.png" class="hero-avatar-class-icon" alt="${hero.class}" title="${hero.class}">`;
    }


    // 内部帮助函数，用于将技能/被动数组渲染为HTML列表
    const renderListAsHTML = (itemsArray, filterType = null) => {
        if (!itemsArray || !Array.isArray(itemsArray) || itemsArray.length === 0) return `<li>${langDict.none}</li>`;
        return itemsArray.map(item => {
            let cleanItem = String(item).trim();
            if (filterType) {
                const mainDesc = cleanItem.split(' * ')[0].trim();
                const displayHTML = cleanItem.replace(/ \* /g, '<br><i>') + '</i>';
                return `<li class="skill-type-tag" data-filter-type="${filterType}" data-filter-value="${mainDesc}" title="${langDict.filterBy} ${mainDesc}">${displayHTML}</li>`;
            }
            if (cleanItem.includes(' * ')) {
                const parts = cleanItem.split(' * ');
                return `<li>${parts[0].trim()}<br><i>${parts.slice(1).join('</i><br><i>')}</i></li>`;
            }
            return `<li>${cleanItem}</li>`;
        }).join('');
    };

    // --- 解析英雄名称 ---
    const skinInfo = getSkinInfo(hero);
    const heroSkin = skinInfo.skinIdentifier;
    let mainHeroName = '', englishName = '', traditionalChineseName = '';
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
        } else {
            mainHeroName = skinInfo.baseName;
        }
    }
    const nameBlockHTML = `${englishName ? `<p class="hero-english-name">${englishName}</p>` : ''}<h1 class="hero-main-name skill-type-tag" data-filter-type="name" data-filter-value="${mainHeroName.trim()}" title="${langDict.filterBy} '${mainHeroName.trim()}'">${mainHeroName}</h1>${traditionalChineseName ? `<p class="hero-alt-name">${traditionalChineseName}</p>` : ''}`;

    const source = filterInputs.skillTypeSource.value;
    const uniqueSkillTypes = getSkillTagsForHero(hero, source);
    let heroTypesContent = '';

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
                        <div class="details-selector-item"><label for="modal-talent-strategy-select" data-lang-key="prioritySetting">${langDict.prioritySetting}</label><select id="modal-talent-strategy-select"><option value="atk-def-hp" data-lang-key="attackPriority">${langDict.attackPriority}</option><option value="atk-hp-def" data-lang-key="attackPriority2">${langDict.attackPriority2}</option><option value="def-hp-atk" data-lang-key="defensePriority">${langDict.defensePriority}</option><option value="hp-def-atk" data-lang-key="healthPriority">${langDict.healthPriority}</option></select></div>
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
                            <div class="cost-item"><img src="imgs/emblems/${englishClassKey}.png" class="cost-icon" alt="纹章图标">${langDict.emblemCostLabel}<span id="cost-emblem">0</span></div>
                            <div class="cost-item"><img src="imgs/farm/Food.png" class="cost-icon" alt="食物图标">${langDict.foodCostLabel}<span id="cost-food">0</span></div>
                            <div class="cost-item"><img src="imgs/farm/Iron.png" class="cost-icon" alt="铁矿图标">${langDict.ironCostLabel}<span id="cost-iron">0</span></div>
                            <div class="cost-item"><img src="imgs/emblems/master_${englishClassKey}.png" class="cost-icon" alt="大师纹章图标">${langDict.masterEmblemCostLabel}<span id="cost-master-emblem">0</span></div>
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
        specialSkillIconHTML = `<img src="imgs/skill_icon/special_${hero.specialId}.png" class="special-skill-icon" alt="${hero.specialId} icon" onerror="this.style.display='none'">`;
    }

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
                    <img src="${modalImageSrc}" id="modal-hero-avatar-img" class="hero-avatar-image-modal" alt="${hero.name}" onerror="this.src='imgs/heroes/not_found.png'">
                    
                    <div class="hero-avatar-overlays overlays-hidden">
                        ${starsHTML}
                        ${classIconHTML}
                        ${costumeIconHTML}
                        ${familyIconHTML}
                        <div id="modal-rank-container"></div>
                    </div>
                </div>
            </div>
            <div class="details-top-right">
                <div class="details-info-line">
                    ${hero.class ? `<span class="hero-info-block skill-type-tag" data-filter-type="class" data-filter-value="${hero.class}"><img src="imgs/classes/${(classReverseMap[hero.class] || hero.class).toLowerCase()}.png" class="class-icon"/>${hero.class}</span>` : ''}
                    ${heroSkin ? `<span class="hero-info-block skill-type-tag" data-filter-type="costume" data-filter-value="${heroSkin}">${langDict.modalSkin} <img src="imgs/costume/${getCostumeIconName(heroSkin)}.png" class="costume-icon"/></span>` : ''}
                    ${hero.AetherPower ? `<span class="hero-info-block skill-type-tag" data-filter-type="aetherpower" data-filter-value="${hero.AetherPower}">⏫<img src="imgs/Aether Power/${(aetherPowerReverseMap[hero.AetherPower] || hero.AetherPower).toLowerCase()}.png" class="aether-power-icon"/>${hero.AetherPower}</span>` : ''}
                    ${hero.source ? `<span class="hero-info-block skill-type-tag" data-filter-type="source" data-filter-value="${hero.source}"><img src="imgs/coins/${sourceIconMap[sourceReverseMap[hero.source]]}" class="source-icon"/>${getDisplayName(hero.source, 'source')}</span>` : ''}
                    ${hero['Release date'] ? `<span class="hero-info-block">📅 ${hero['Release date']}</span>` : ''}
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
                <p class="uniform-style">${langDict.modalSkillType}</p>
                ${heroTypesContent}
            </div>
            <div id="modal-skill-effects-section" class="skill-category-block"><p class="uniform-style">${langDict.modalSpecialSkill}</p><ul class="skill-list">${renderListAsHTML(hero.effects, 'effects')}</ul></div>
            <div class="skill-category-block"><p id="modal-passives-section" class="uniform-style">${langDict.modalPassiveSkill}</p><ul class="skill-list">${renderListAsHTML(hero.passives, 'passives')}</ul></div>
            ${familyBonus.length > 0 ? `<div id="modal-family-bonus-section" class="skill-category-block"><p class="uniform-style">${langDict.modalFamilyBonus(`<span class="skill-type-tag" data-filter-type="family" data-filter-value="${hero.family}"><img src="imgs/family/${String(hero.family).toLowerCase()}.png" class="family-icon"/>${getDisplayName(hero.family, 'family')}</span>`)}</p><ul class="skill-list">${renderListAsHTML(familyBonus)}</ul></div>` : ''}
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

    // 新增：滚动到指定区域的按钮事件监听
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

    // 新增：为标题添加返回顶部功能
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

    // 天赋系统相关逻辑
    if (filterInputs.showLbTalentDetailsCheckbox.checked) {
        const modalLbSelect = document.getElementById('modal-limit-break-select');
        const modalTalentSelect = document.getElementById('modal-talent-select');
        const modalStrategySelect = document.getElementById('modal-talent-strategy-select');
        const modalManaCheckbox = document.getElementById('modal-mana-priority-checkbox');
        // 新增：用于在内存中缓存天赋树计算出的最新加成状态
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
            if (settings.talent !== 'none') {
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
            const iconMap = { attack: 'attack.png', defense: 'defense.png', health: 'health.png', mana: 'mana.png', healing: 'healing.png', crit: 'critical.png' };
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
            const currentSettingsInModal = { lb: modalLbSelect.value, talent: modalTalentSelect.value };
            _updateModalStatsWithBonuses(hero, currentSettingsInModal, bonuses, nodeCount);
            let baseStats = { attack: hero.attack, defense: hero.defense, health: hero.health };
            if (currentSettingsInModal.lb === 'lb1' && hero.lb1) baseStats = { ...hero.lb1 };
            else if (currentSettingsInModal.lb === 'lb2' && hero.lb2) baseStats = { ...hero.lb2 };
            _updateBonusAndCostDisplay(bonuses, nodeCount, baseStats);

            // 将天赋树返回的实时点数 nodeCount 传递给更新函数
            updateRankDisplay(nodeCount);
        };

        // 新增：一个通用的UI更新函数
        const updateCommonUI = (bonuses, nodeCount) => {
            const settings = { lb: modalLbSelect.value, talent: modalTalentSelect.value };
            _updateModalStatsWithBonuses(hero, settings, bonuses, nodeCount);

            let baseStats = { attack: hero.attack, defense: hero.defense, health: hero.health };
            if (settings.lb === 'lb1' && hero.lb1) baseStats = { ...hero.lb1 };
            else if (settings.lb === 'lb2' && hero.lb2) baseStats = { ...hero.lb2 };
            _updateBonusAndCostDisplay(bonuses, nodeCount, baseStats);
            updateRankDisplay(nodeCount);
        };

        // 新增：仅用于“突破设置”的处理器，它不会触碰天赋树
        const handleStatUpdateOnly = () => {
            updateCommonUI(currentTalentBonuses, currentNodeCount);
        };

        // 新增：仅用于天赋相关设置的处理器，它会刷新天赋树
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

        modalLbSelect.addEventListener('change', handleStatUpdateOnly);
        modalTalentSelect.addEventListener('change', handleTreeAndStatUpdate);
        modalStrategySelect.addEventListener('change', handleTreeAndStatUpdate);
        modalManaCheckbox.addEventListener('change', handleTreeAndStatUpdate);

        // 1. 先初始化天赋树 (即使它会错误地设置下拉菜单)
        if (typeof TalentTree !== 'undefined' && hero.class) {
            TalentTree.init(document.getElementById('modal-talent-tree-wrapper'), hero.class, settingsToUse, talentChangeCallback, langDict.talentTerms);
        }

        // 2. 然后，用你保存的正确设置，强制覆盖下拉菜单的值
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
        const target = event.target.closest('.skill-type-tag');
        if (!target) return;

        const filterType = target.dataset.filterType;
        let filterValue = target.dataset.filterValue;
        if (!filterType || filterValue === undefined) return;

        // “一键搜索”复选框的逻辑保持不变
        const isQuickSearchEnabled = uiElements.filterInputs.enableSkillQuickSearchCheckbox.checked;
        if (['effects', 'passives'].includes(filterType) && !isQuickSearchEnabled) {
            return;
        }

        resetAllFilters();

        if (state.multiSelectFilters.hasOwnProperty(filterType)) {
            // 处理非文本输入的筛选器（如：颜色、职业、星级等），这部分逻辑不变
            state.multiSelectFilters[filterType] = [filterValue];
            updateFilterButtonUI(filterType);
        } else if (uiElements.filterInputs[filterType]) {
            switch (filterType) {
                case 'types':
                    // 如果点击的是技能“类别”，则使用方括号[]进行完全匹配
                    uiElements.filterInputs.types.value = `[${filterValue}]`;
                    break;
                case 'effects':
                case 'passives':
                    // 如果点击的是技能或被动“描述”，则使用圆括号()进行单句匹配
                    filterValue = generateGeneralSearchTerm(filterValue);
                    uiElements.filterInputs[filterType].value = `(${filterValue})`;
                    break;
                default:
                    // 其他类型（如英雄名）保持通用搜索
                    filterValue = generateGeneralSearchTerm(filterValue);
                    uiElements.filterInputs[filterType].value = filterValue;
                    break;
            }
        }

        closeDetailsModal();
        applyFiltersAndRender();
    });
}