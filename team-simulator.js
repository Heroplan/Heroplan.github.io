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
 * 获取英雄的技能类别数组，用于标签汇总 (修改为调用中央函数)。
 * @param {object} hero - 英雄对象。
 * @returns {string[]} 技能类别字符串数组。
 */
function getSkillTypesArray(hero) {
    if (!hero) return [];
    // ▼▼▼▼▼【保持】此處邏輯正確，它會調用 utils.js 中已修復的 getSkillTagsForHero 函數 ▼▼▼▼▼
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
    const isActive = state.teamSimulatorActive; // 使用变量判断是开启还是关闭

    // 如果要“激活”队伍模拟器，并且抽奖模拟器当前是“激活”的，则先调用关闭函数把它关掉。
    if (isActive && state.lotterySimulatorActive) {
        LotterySimulator.toggle();
    }
    const { teamSimulatorWrapper, showTeamSimulatorBtn, headerInfoContainer, heroTableView, wantedMissionView, farmingGuideView, chatSimulatorView, myTeamsTabBtn, sharedTeamsTabBtn } = uiElements;

    if (state.teamSimulatorActive) {
        headerInfoContainer.classList.add('hidden');
        uiElements.donationlistcontainer.classList.add('hidden');
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
        document.body.classList.add('team-mode-active');

    } else {
        if (showTeamSimulatorBtn) {
            showTeamSimulatorBtn.classList.remove('simulator-exit-btn');
            showTeamSimulatorBtn.title = "队伍模拟器";
        }
        headerInfoContainer.classList.remove('hidden');
        uiElements.donationlistcontainer.classList.remove('hidden');
        if (teamSimulatorWrapper) teamSimulatorWrapper.classList.add('hidden');
        state.multiSelectFilters.filterScope = ['all'];
        updateFilterButtonUI('filterScope');
        applyFiltersAndRender();
        document.body.classList.remove('team-mode-active');
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

    // 检查是否显示技能类别
    const showSkillTypesInTeam = getCookie('showSkillTypesInTeam') !== 'false';

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

            // ▼▼▼使用新的HTML结构来添加背景色▼▼▼
            const avatarContainer = document.createElement('div');
            avatarContainer.className = `sim-hero-avatar-container ${getColorGlowClass(hero.color)}`;
            avatarContainer.style.width = '60px';
            avatarContainer.style.height = '60px';

            const avatarBackground = document.createElement('div');
            avatarBackground.className = 'hero-avatar-background';
            avatarBackground.style.background = getHeroColorLightGradient(hero.color);

            const avatar = document.createElement('img');
            avatar.src = hero.heroId ? `imgs/hero_icon/${hero.heroId}.webp` : getLocalImagePath(hero.image);
            avatar.className = 'hero-avatar-image';
            avatar.alt = hero.name;

            avatarContainer.appendChild(avatarBackground);
            avatarContainer.appendChild(avatar);
            heroSlot.appendChild(avatarContainer);
            // 根据设置决定是否显示技能文本
            if (showSkillTypesInTeam) {
                infoSlot.innerHTML = `<div class="team-hero-name">${getFormattedHeroNameHTML(hero)}</div><div class="team-hero-skills">${getSkillTypesText(hero) || i18n[state.currentLang].none}</div>`;
            } else {
                infoSlot.innerHTML = `<div class="team-hero-name">${getFormattedHeroNameHTML(hero)}</div>`;
            }
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
            // --- 处理空槽位 ---
            if (state.swapModeActive) {
                const actionIcon = document.createElement('div');
                actionIcon.className = 'hero-action-icon empty-slot-target-icon';
                actionIcon.textContent = '⬆️';
                actionIcon.title = '移到此处';
                actionIcon.dataset.action = 'move';
                actionIcon.dataset.index = i;
                heroSlot.appendChild(actionIcon);
            }
        }
    }
    updateTeamTags();
    adjustTeamDisplayHeight();
}

/**
 * 更新队伍的技能标签汇总区域，并使用正确的、统一的排序逻辑，且根据来源条件显示图标。
 */
function updateTeamTags() {
    const summaryContainer = document.getElementById('team-tags-summary-container');
    if (!summaryContainer) return;

    const tagCounts = {};
    let teamHasHeroes = state.teamSlots.some(s => s && s.hero);

    // 检查是否显示技能类别
    const showSkillTypesInTeam = getCookie('showSkillTypesInTeam') !== 'false';

    if (!teamHasHeroes || !showSkillTypesInTeam) {
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

    const uniqueTags = Object.keys(tagCounts);

    // 【保留】完整的、正確的排序邏輯
    const nynaeveReverseMap = state.currentLang === 'cn' ? nynaeveCnToEnMap : (state.currentLang === 'tc' ? nynaeveTcToEnMap : null);
    const bbcampPriorityCategories = ["基础技能", "特殊效果", "增益效果", "负面效果"];
    const bbcampOrderArrays = { "基础技能": skillTagOrder_base, "特殊效果": skillTagOrder_special, "增益效果": skillTagOrder_buff, "负面效果": skillTagOrder_debuff };

    uniqueTags.sort((a, b) => {
        const categoryA_bbcamp = state.skillTagToCategoryMap[skillTagReverseMap[a] || a];
        const categoryB_bbcamp = state.skillTagToCategoryMap[skillTagReverseMap[b] || b];
        const priorityA_bbcamp = categoryA_bbcamp ? bbcampPriorityCategories.indexOf(categoryA_bbcamp) : -1;
        const priorityB_bbcamp = categoryB_bbcamp ? bbcampPriorityCategories.indexOf(categoryB_bbcamp) : -1;

        if (priorityA_bbcamp !== -1 || priorityB_bbcamp !== -1) {
            if (priorityA_bbcamp !== priorityB_bbcamp) return priorityA_bbcamp - priorityB_bbcamp;
            const sortOrder = bbcampOrderArrays[categoryA_bbcamp];
            if (sortOrder) {
                const keyA = skillTagReverseMap[a] || a;
                const keyB = skillTagReverseMap[b] || b;
                const indexA = sortOrder.indexOf(keyA);
                const indexB = sortOrder.indexOf(keyB);
                if (indexA !== -1 || indexB !== -1) {
                    if (indexA === indexB) return 0;
                    return indexA !== -1 ? (indexB !== -1 ? indexA - indexB : -1) : 1;
                }
            }
        }

        const englishA_nynaeve = nynaeveReverseMap ? (nynaeveReverseMap[a] || a) : a;
        const englishB_nynaeve = nynaeveReverseMap ? (nynaeveReverseMap[b] || b) : b;
        const indexA_nynaeve = nynaeveSkillTypeOrder.indexOf(englishA_nynaeve);
        const indexB_nynaeve = nynaeveSkillTypeOrder.indexOf(englishB_nynaeve);

        if (indexA_nynaeve !== -1 || indexB_nynaeve !== -1) {
            if (indexA_nynaeve === indexB_nynaeve) return 0;
            return indexA_nynaeve !== -1 ? (indexB_nynaeve !== -1 ? indexA_nynaeve - indexB_nynaeve : -1) : 1;
        }

        return a.localeCompare(b);
    });

    const sortedTags = uniqueTags;

    // --- 【核心修正】条件渲染逻辑 ---
    const skillTypeSource = uiElements.filterInputs.skillTypeSource.value;

    if (sortedTags.length === 0) {
        summaryContainer.innerHTML = `<div class="no-tags-message">${i18n[state.currentLang].noTeamTags}</div>`;
    } else {
        summaryContainer.innerHTML = sortedTags.map(tag => {
            const count = tagCounts[tag];
            const countHTML = count > 1 ? `<span class="tag-count">x${count}</span>` : '';

            // 仅当来源为 'bbcamp' 时，才加入图标
            if (skillTypeSource === 'bbcamp') {
                // 使用一个代表性的类型（如'skillTag_base'）来调用getIconForFilter，因为图标查找逻辑只依赖于tag值本身
                const iconSrc = getIconForFilter('skillTag_base', tag);
                const iconHTML = iconSrc ? `<img src="${iconSrc}" class="option-icon" alt="" onerror="this.style.display='none'"/>` : '';

                // 修正了 class 语法的错误
                return `<span class="team-tag-item">${iconHTML}${tag}${countHTML}</span>`;
            } else {
                // 对于其他所有来源，使用原始的纯文本样式
                return `<span class="team-tag-item">${tag}${countHTML}</span>`;
            }
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

        // ▼▼▼【修改】使用新的HTML结构来添加背景色▼▼▼
        let avatarsHTML = team.heroes.map(id => {
            if (!id) return `<div class="saved-team-avatar" style="border: 1px dashed var(--md-sys-color-outline); width: 36px; height: 36px; display: inline-block;"></div>`;
            const hero = state.allHeroes.find(h => `${h.english_name}-${h.costume_id}` === id);
            if (hero) {
                const imageSrc = `imgs/hero_icon/${hero.heroId}.webp`;
                return `
                    <div class="saved-team-avatar-container ${getColorGlowClass(hero.color)}" title="${hero.name}">
                        <div class="saved-team-avatar-background" style="background: ${getHeroColorLightGradient(hero.color)};"></div>
                        <img src="${imageSrc}" class="saved-team-avatar-image" alt="${hero.name}">
                    </div>
                `;
            } else {
                return `<div class="saved-team-avatar" style="border: 1px dashed var(--md-sys-color-error); width: 36px; height: 36px; display: inline-block;">?</div>`;
            }
        }).join('');
        // ▲▲▲【修改结束】▲▲▲

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