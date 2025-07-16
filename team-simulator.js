// team-simulator.js: 管理队伍模拟器的所有功能。

// --- 帮助函数 (Helpers) ---

/**
 * 动态调整队伍模拟器左侧面板的高度，以适应内容，并同步到右侧面板
 */
function adjustTeamDisplayHeight() {
    const teamSimulatorDisplay = document.getElementById('team-simulator-display');
    if (!teamSimulatorDisplay || (teamSimulatorDisplay.closest('#team-simulator-wrapper') && teamSimulatorDisplay.closest('#team-simulator-wrapper').classList.contains('collapsed'))) {
        return;
    }

    requestAnimationFrame(() => {
        const desktopHeader = teamSimulatorDisplay.querySelector('.team-display-desktop-header');
        let desktopHeaderHeight = 0;
        if (desktopHeader && window.getComputedStyle(desktopHeader).display !== 'none') {
            const style = window.getComputedStyle(desktopHeader);
            desktopHeaderHeight = desktopHeader.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom);
        }

        const tagsContainer = document.getElementById('team-tags-summary-container');
        let tagsHeight = 0;
        if (tagsContainer && tagsContainer.style.display !== 'none') {
            const style = window.getComputedStyle(tagsContainer);
            tagsHeight = tagsContainer.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom);
        }

        let vLayoutHeight = 0;
        const visibleInfoCards = teamSimulatorDisplay.querySelectorAll('.team-info-slot:not([style*="display: none"])');
        const gridContainer = document.getElementById('team-display-grid');

        if (visibleInfoCards.length > 0) {
            let maxBottomPosition = 0;
            visibleInfoCards.forEach(card => {
                const bottomPosition = card.offsetTop + card.offsetHeight;
                if (bottomPosition > maxBottomPosition) {
                    maxBottomPosition = bottomPosition;
                }
            });
            vLayoutHeight = maxBottomPosition;
        } else if (gridContainer) {
            vLayoutHeight = gridContainer.offsetHeight;
        }

        const calculatedLeftPanelHeight = desktopHeaderHeight + tagsHeight + vLayoutHeight + 20;
        teamSimulatorDisplay.style.minHeight = `${calculatedLeftPanelHeight}px`;

        const savedTeamsPanel = document.getElementById('saved-teams-panel');
        if (savedTeamsPanel && window.innerWidth > 900) {
            const minPanelHeight = 450;
            if (calculatedLeftPanelHeight > minPanelHeight) {
                savedTeamsPanel.style.height = `${calculatedLeftPanelHeight}px`;
            } else {
                savedTeamsPanel.style.height = '';
            }
        } else if (savedTeamsPanel) {
            savedTeamsPanel.style.height = 'auto';
        }
    });
}

/**
 * 【新增】根据多语言环境和预设顺序对技能标签进行排序。
 * 这是从您原始脚本中提取并封装的核心排序逻辑。
 * @param {string[]} tags - 未排序的技能标签数组。
 * @returns {string[]} 排序后的技能标签数组。
 */
function sortSkillTags(tags) {
    // 简体和繁体中文的技能名到英文键名的反向映射
    const reverseSkillTypeMap_cn = Object.fromEntries(Object.entries(skillTypeTranslations_cn).map(([key, value]) => [value, key]));
    const reverseSkillTypeMap_tc = Object.fromEntries(Object.entries(skillTypeTranslations_tc).map(([key, value]) => [value, key]));

    return tags.sort((a, b) => {
        // 定义一个内部函数，用于获取排序所依赖的英文键名
        const getEnglishKey = (tag) => {
            if (state.currentLang === 'cn') return reverseSkillTypeMap_cn[tag] || tag;
            if (state.currentLang === 'tc') return reverseSkillTypeMap_tc[tag] || tag;
            return tag; // 如果当前是英文或找不到翻译，则直接使用原标签
        };

        const englishA = getEnglishKey(a);
        const englishB = getEnglishKey(b);

        // 从 nynaeveSkillTypeOrder 预设顺序数组中查找索引
        const indexA = nynaeveSkillTypeOrder.indexOf(englishA);
        const indexB = nynaeveSkillTypeOrder.indexOf(englishB);

        // 如果两个标签都能在排序标准中找到，则按索引排序
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        // 如果只有 A 能找到，A 排在前面
        if (indexA !== -1) return -1;
        // 如果只有 B 能找到，B 排在前面
        if (indexB !== -1) return 1;

        // 如果都找不到，则按当前语言的默认字符顺序排序 (例如中文按拼音/笔画)
        const locale = { cn: 'zh-CN', tc: 'zh-TW', en: 'en-US' }[state.currentLang];
        const options = state.currentLang === 'tc' ? { collation: 'stroke' } : {};
        return a.localeCompare(b, locale, options);
    });
}

/**
 * 获取英雄的技能类别数组，用于标签汇总 (修改为调用中央函数)。
 * @param {object} hero - 英雄对象。
 * @returns {string[]} 技能类别字符串数组。
 */
function getSkillTypesArray(hero) {
    if (!hero) return [];
    // ▼▼▼▼▼【修改】▼▼▼▼▼
    const skillTypeSource = uiElements.filterInputs.skillTypeSource.value;
    return getSkillTagsForHero(hero, skillTypeSource);
}

/**
 * 获取用于显示的格式化、已排序的技能类型文本，用于英雄信息卡 (修改为调用中央函数)。
 * @param {object} hero - 英雄对象。
 * @returns {string} 逗号分隔的技能类型字符串。
 */
function getSkillTypesText(hero) {
    if (!hero) return '';
    const skillTypeSource = uiElements.filterInputs.skillTypeSource.value;
    return getSkillTagsForHero(hero, skillTypeSource).join(', ');
}


// --- 主要功能函数 ---

/**
 * 切换队伍模拟器视图的显示和隐藏。
 */
function toggleTeamSimulator() {
    state.teamSimulatorActive = !state.teamSimulatorActive;
    const { teamSimulatorWrapper, showTeamSimulatorBtn, headerInfoContainer, heroTableView, wantedMissionView, farmingGuideView, chatSimulatorView, myTeamsTabBtn, sharedTeamsTabBtn } = uiElements;

    if (state.teamSimulatorActive) {
        headerInfoContainer.classList.add('hidden');
        if (teamSimulatorWrapper) teamSimulatorWrapper.classList.remove('hidden');
        if (showTeamSimulatorBtn) {
            showTeamSimulatorBtn.classList.add('simulator-exit-btn');
            showTeamSimulatorBtn.title = i18n[state.currentLang].returnToList;
        }
        heroTableView.classList.remove('hidden');
        wantedMissionView.classList.add('hidden');
        farmingGuideView.classList.add('hidden');
        if (chatSimulatorView) chatSimulatorView.classList.add('hidden');
        state.multiSelectFilters.filterScope = ['favorites'];
        updateFilterButtonUI('filterScope');
        state.temporaryFavorites = null;
        applyFiltersAndRender();
        renderActiveTabList();
        setMainViewHistory('teamSimulator');

    } else {
        if (showTeamSimulatorBtn) {
            showTeamSimulatorBtn.classList.remove('simulator-exit-btn');
            showTeamSimulatorBtn.title = "队伍模拟器";
        }
        headerInfoContainer.classList.remove('hidden');
        if (teamSimulatorWrapper) teamSimulatorWrapper.classList.add('hidden');
        state.multiSelectFilters.filterScope = ['all'];
        updateFilterButtonUI('filterScope');
        applyFiltersAndRender();
    }
}

/**
 * 从 Cookie 中获取已保存的队伍列表。
 * @returns {Array} 队伍对象数组。
 */
function getSavedTeams() {
    try {
        const teamsJSON = getCookie('savedTeams');
        return teamsJSON ? JSON.parse(teamsJSON) : [];
    } catch (e) {
        console.error("从Cookie解析已存队伍失败", e);
        return [];
    }
}

/**
 * 将队伍列表保存到 Cookie。
 * @param {Array} teams - 要保存的队伍对象数组。
 */
function saveTeams(teams) {
    try {
        const teamsJSON = JSON.stringify(teams);
        setCookie('savedTeams', teamsJSON, 365);
    } catch (e) {
        console.error("保存队伍到Cookie失败", e);
    }
}

/**
 * 清空当前正在配置的队伍阵容。
 */
function clearTeamDisplay() {
    state.teamSlots = Array(5).fill(null);
    renderTeamDisplay();
}

/**
 * 将一个已保存的队伍加载到模拟器中进行显示和编辑。
 * @param {object} teamToShow - 要显示的队伍对象。
 */
function displayTeamInSimulator(teamToShow) {
    const newTeamSlots = Array(5).fill(null);
    const defaultSettings = {
        lb: uiElements.filterInputs.defaultLimitBreakSelect.value,
        talent: uiElements.filterInputs.defaultTalentSelect.value,
        strategy: uiElements.filterInputs.defaultTalentStrategySelect.value,
        manaPriority: uiElements.filterInputs.defaultManaPriorityCheckbox.checked
    };

    teamToShow.heroes.forEach((heroIdentifier, index) => {
        if (heroIdentifier && index < 5) {
            const hero = state.allHeroes.find(h => `${h.english_name}-${h.costume_id}` === heroIdentifier);
            if (hero) {
                newTeamSlots[index] = {
                    instanceId: state.teamMemberInstanceCounter++,
                    hero: hero,
                };
            }
        }
    });

    state.teamSlots = newTeamSlots;
    renderTeamDisplay();

    const teamSimulatorWrapper = document.getElementById('team-simulator-wrapper');
    if (teamSimulatorWrapper && window.innerWidth <= 900 && !teamSimulatorWrapper.classList.contains('collapsed')) {
        window.scrollTo(0, 200);
    }
}

/**
 * 将一个英雄添加到队伍的第一个空位。
 * @param {object} hero - 要添加的英雄对象。
 */
function addHeroToTeam(hero) {
    const emptySlotIndex = state.teamSlots.findIndex(slot => slot === null);
    if (emptySlotIndex !== -1) {
        const defaultSettings = {
            lb: uiElements.filterInputs.defaultLimitBreakSelect.value,
            talent: uiElements.filterInputs.defaultTalentSelect.value,
            strategy: uiElements.filterInputs.defaultTalentStrategySelect.value,
            manaPriority: uiElements.filterInputs.defaultManaPriorityCheckbox.checked
        };
        const teamMember = {
            instanceId: state.teamMemberInstanceCounter++,
            hero: hero,
        };
        state.teamSlots[emptySlotIndex] = teamMember;
        renderTeamDisplay();
    }
}

/**
 * 渲染左侧的队伍配置区域（5个英雄槽位和信息卡）。
 */
function renderTeamDisplay() {
    const teamDisplayGrid = document.getElementById('team-display-grid');
    if (!teamDisplayGrid) return;

    for (let i = 0; i < 5; i++) {
        const slot = state.teamSlots[i];
        const hero = slot ? slot.hero : null;
        const pos = i + 1;
        const heroSlot = teamDisplayGrid.querySelector(`.team-hero-slot[data-pos="${pos}"]`);
        const infoSlot = teamDisplayGrid.querySelector(`.team-info-slot[data-info-pos="${pos}"]`);
        if (!heroSlot || !infoSlot) continue;

        // 清理旧内容
        heroSlot.innerHTML = '';
        infoSlot.innerHTML = '';
        heroSlot.classList.remove('filled');
        infoSlot.style.display = 'none';
        heroSlot.removeAttribute('data-instance-id');
        infoSlot.removeAttribute('data-instance-id');

        if (hero) {
            // --- 处理有英雄的槽位 ---
            heroSlot.classList.add('filled');
            heroSlot.dataset.instanceId = slot.instanceId;
            const avatar = document.createElement('img');
            avatar.src = getLocalImagePath(hero.image);
            avatar.className = `team-hero-avatar ${getColorGlowClass(hero.color)}`;
            avatar.alt = hero.name;
            heroSlot.appendChild(avatar);

            infoSlot.innerHTML = `<div class="team-hero-name">${getFormattedHeroNameHTML(hero)}</div><div class="team-hero-skills">${getSkillTypesText(hero) || i18n[state.currentLang].none}</div>`;
            infoSlot.dataset.instanceId = slot.instanceId;
            infoSlot.style.display = 'block';

            if (state.swapModeActive) {
                const actionIcon = document.createElement('div');
                actionIcon.className = 'hero-action-icon';
                actionIcon.textContent = (i === state.selectedForSwapIndex) ? '✖' : '🔄';
                actionIcon.classList.add((i === state.selectedForSwapIndex) ? 'remove-hero-icon' : 'swap-hero-icon');
                actionIcon.dataset.action = (i === state.selectedForSwapIndex) ? 'remove' : 'swap';
                actionIcon.dataset.index = i;
                heroSlot.appendChild(actionIcon);
            }
        } else {
            // --- 【新增】处理空槽位 ---
            // 如果正处于换位模式，就在空槽位显示“移到此处”的图标
            if (state.swapModeActive) {
                const actionIcon = document.createElement('div');
                actionIcon.className = 'hero-action-icon empty-slot-target-icon';
                actionIcon.textContent = '⬆️'; // 您可以换成其他喜欢的符号
                actionIcon.title = '移到此处';
                actionIcon.dataset.action = 'move'; // 定义新的动作类型
                actionIcon.dataset.index = i;
                heroSlot.appendChild(actionIcon);
            }
        }
    }
    updateTeamTags();
    adjustTeamDisplayHeight();
}

/**
 * 更新队伍的技能标签汇总区域。
 */
function updateTeamTags() {
    const summaryContainer = document.getElementById('team-tags-summary-container');
    if (!summaryContainer) return;

    const tagCounts = {};
    let teamHasHeroes = state.teamSlots.some(s => s && s.hero);

    if (!teamHasHeroes) {
        summaryContainer.innerHTML = '';
        summaryContainer.style.display = 'none';
        return;
    }

    summaryContainer.style.display = 'flex';
    state.teamSlots.forEach(slot => {
        if (slot && slot.hero) {
            getSkillTypesArray(slot.hero).forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        }
    });

    // 【修正】调用新的排序函数
    const sortedTags = sortSkillTags(Object.keys(tagCounts));

    if (sortedTags.length === 0) {
        summaryContainer.innerHTML = `<div class="no-tags-message">${i18n[state.currentLang].noTeamTags}</div>`;
    } else {
        summaryContainer.innerHTML = sortedTags.map(tag => {
            const count = tagCounts[tag];
            const countHTML = count > 1 ? `<span class="tag-count">x${count}</span>` : '';
            return `<span class="team-tag-item">${tag}${countHTML}</span>`;
        }).join('');
    }
}

/**
 * 根据当前激活的标签页（我的队伍/分享的队伍）渲染列表。
 */
function renderActiveTabList() {
    const { myTeamsTabBtn, sharedTeamsTabBtn } = uiElements;
    if (!myTeamsTabBtn) return;

    if (sharedTeamsTabBtn.classList.contains('active')) {
        renderSavedTeams(state.sharedTeamsDataFromUrl, true);
    } else {
        renderSavedTeams(getSavedTeams(), false);
    }
}

/**
 * 渲染右侧的“已存队伍”或“分享的队伍”列表。
 * @param {Array} teams - 要渲染的队伍数组。
 * @param {boolean} isSharedView - 是否为分享视图。
 */
function renderSavedTeams(teams, isSharedView = false) {
    const savedTeamsList = document.getElementById('saved-teams-list');
    if (!savedTeamsList) return;

    savedTeamsList.innerHTML = '';
    const langDict = i18n[state.currentLang];

    if (!teams || teams.length === 0) {
        savedTeamsList.innerHTML = `<p style="text-align: center; color: var(--md-sys-color-outline);">${langDict[isSharedView ? 'noTeamsToShare' : 'noSavedTeams']}</p>`;
        return;
    }

    const myTeams = getSavedTeams();
    teams.forEach((team, index) => {
        const row = document.createElement('div');
        row.className = 'saved-team-row is-clickable';
        let avatarsHTML = team.heroes.map(id => {
            if (!id) return `<div class="saved-team-avatar" style="border: 1px dashed var(--md-sys-color-outline);"></div>`;
            const hero = state.allHeroes.find(h => `${h.english_name}-${h.costume_id}` === id);
            return hero ? `<img src="${getLocalImagePath(hero.image)}" class="saved-team-avatar ${getColorGlowClass(hero.color)}" alt="${hero.name}" title="${hero.name}">` : `<div class="saved-team-avatar" style="border: 1px dashed var(--md-sys-color-error);">?</div>`;
        }).join('');

        let buttonHTML = '';
        if (isSharedView) {
            const isImported = myTeams.some(myTeam => myTeam.name === team.name && JSON.stringify(myTeam.heroes) === JSON.stringify(team.heroes));
            buttonHTML = `<button class="action-button ${isImported ? 'disabled' : 'import-team-btn'}" data-team-index="${index}">${langDict[isImported ? 'importedBtn' : 'importTeamBtn']}</button>`;
        } else {
            buttonHTML = `<button class="remove-team-btn" data-team-index="${index}" title="${langDict.removeTeamBtnTitle}">✖</button>`;
        }

        row.innerHTML = `
            <div class="team-row-main-content">
                <div class="saved-team-name" title="${team.name}">${team.name}</div>
                <div class="saved-team-avatars">${avatarsHTML}</div>
            </div>
            ${buttonHTML}`;

        row.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            displayTeamInSimulator(team);
        });

        savedTeamsList.appendChild(row);
    });

    if (isSharedView) {
        savedTeamsList.querySelectorAll('.import-team-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const teamIndex = parseInt(button.dataset.teamIndex, 10);
                const teamToImport = JSON.parse(JSON.stringify(state.sharedTeamsDataFromUrl[teamIndex]));
                if (!teamToImport) return;
                let currentMyTeams = getSavedTeams();
                currentMyTeams.push(teamToImport);
                saveTeams(currentMyTeams);
                alert(langDict.importSuccess(teamToImport.name));
                renderSavedTeams(state.sharedTeamsDataFromUrl, true);
            });
        });
    } else {
        savedTeamsList.querySelectorAll('.remove-team-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const teamIndex = parseInt(button.dataset.teamIndex, 10);
                let teams = getSavedTeams();
                const teamToRemove = teams[teamIndex];
                if (teamToRemove && window.confirm(langDict.confirmRemoveTeam(teamToRemove.name))) {
                    teams.splice(teamIndex, 1);
                    saveTeams(teams);
                    renderActiveTabList();
                }
            });
        });
    }
}

/**
 * 进入英雄交换模式。
 * @param {number} index - 被选中的英雄的索引。
 */
function enterSwapMode(index) {
    state.swapModeActive = true;
    state.selectedForSwapIndex = index;
    renderTeamDisplay();
}

/**
 * 退出英雄交换模式。
 */
function exitSwapMode() {
    state.swapModeActive = false;
    state.selectedForSwapIndex = -1;
    renderTeamDisplay();
}