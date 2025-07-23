// main.js: 应用程序的主入口和事件协调中心。

/**
 * 页面加载完成后执行的主函数。
 */
document.addEventListener('DOMContentLoaded', async function () {
    await initializeApp();
});

/**
 * 加载筛选器模态框内各区块的折叠状态。
 * 此函数在页面初始化时调用。
 */
function loadFilterCollapseStates() {
    const filterHeaders = document.querySelectorAll('#filters-modal .filter-header');
    filterHeaders.forEach(header => {
        const toggleButton = header.querySelector('.toggle-button');
        if (toggleButton) {
            const targetId = toggleButton.dataset.target;
            // 注意：这里的 cookie key 需要和保存时的一致。
            // 在你的 addEventListeners 中，cookie key 是 targetId + '_state'
            // 但在你的 render.js 中，data-cookie 属性直接就是 'modal_settings_state'
            // 为了统一和稳健，我们应该以 addEventListeners 中的逻辑为准。
            const cookieName = targetId + '_state';
            const savedState = getCookie(cookieName);
            const contentElement = document.getElementById(targetId);

            if (contentElement) {
                // 默认是展开的，只有当 cookie 明确记录为 'collapsed' 时才折叠
                const shouldCollapse = (savedState === 'collapsed');
                contentElement.classList.toggle('collapsed', shouldCollapse);
                toggleButton.classList.toggle('expanded', !shouldCollapse);
            }
        }
    });
}

/**
 * 初始化应用程序的核心函数。
 */
async function initializeApp() {
    // 1. 处理URL参数和Cookie，确定语言
    const urlParams = new URLSearchParams(window.location.search);
    const viewHeroFromUrl = urlParams.get('view');
    const langFromUrl = urlParams.get('lang');
    const zfavsFromUrl = urlParams.get('zfavs');
    const favsFromUrl = urlParams.get('favs');
    const sharedTeamsFromUrl = urlParams.get('sharedTeams');
    const languageCookie = getCookie('language');

    let langToUse = 'cn';
    if (languageCookie && i18n[languageCookie]) {
        langToUse = languageCookie;
    } else if (langFromUrl && i18n[langFromUrl]) {
        langToUse = langFromUrl;
    } else {
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.includes('en')) langToUse = 'en';
        else if (browserLang.includes('zh-tw') || browserLang.includes('zh-hk')) langToUse = 'tc';
    }
    applyLanguage(langToUse);

    // 2. 加载核心数据
    const dataLoaded = await loadData(state.currentLang);
    if (!dataLoaded) {
        uiElements.pageLoader.classList.add('hidden');
        document.body.classList.remove('js-loading');
        return;
    }

    // 3. 数据后处理
    state.allHeroes.forEach((hero, index) => {
        hero.originalIndex = index;
        hero.english_name = extractEnglishName(hero, state.currentLang);
    });

    // 4. 初始化UI和筛选器
    populateFilters();
    Object.assign(uiElements.filterInputs, {
        name: document.getElementById('name-input'),
        types: document.getElementById('type-input'),
        effects: document.getElementById('effects-input'),
        passives: document.getElementById('passives-input'),
        power: document.getElementById('power-input'),
        attack: document.getElementById('attack-input'),
        defense: document.getElementById('defense-input'),
        health: document.getElementById('health-input'),
        skillTypeSource: document.getElementById('skill-type-source-select'),
        defaultLimitBreakSelect: document.getElementById('default-limit-break-select'),
        defaultTalentSelect: document.getElementById('default-talent-select'),
        defaultTalentStrategySelect: document.getElementById('default-talent-strategy-select'),
        defaultManaPriorityCheckbox: document.getElementById('default-mana-priority-checkbox'),
        showLbTalentDetailsCheckbox: document.getElementById('show-lb-talent-details-checkbox'),
        enableSkillQuickSearchCheckbox: document.getElementById('enable-skill-quick-search-checkbox'),
        filterHero730Btn: document.getElementById('filter-hero-730-btn'),
        filterCostume548Btn: document.getElementById('filter-costume-548-btn'),
    });

    // 从Cookie恢复用户之前的设置
    uiElements.filterInputs.defaultLimitBreakSelect.value = getCookie('defaultLB') || 'none';
    uiElements.filterInputs.defaultTalentSelect.value = getCookie('defaultTalent') || 'none';
    uiElements.filterInputs.defaultTalentStrategySelect.value = getCookie('defaultTalentStrategy') || 'atk-def-hp';
    uiElements.filterInputs.defaultManaPriorityCheckbox.checked = getCookie('defaultManaPriority') === 'true';
    uiElements.filterInputs.showLbTalentDetailsCheckbox.checked = getCookie('showLbTalentDetails') !== 'false';
    if (uiElements.filterInputs.enableSkillQuickSearchCheckbox) {
        uiElements.filterInputs.enableSkillQuickSearchCheckbox.checked = getCookie('enableSkillQuickSearch') !== 'false';
    }
    const initialTalentDisabled = uiElements.filterInputs.defaultTalentSelect.value === 'none';
    uiElements.filterInputs.defaultTalentStrategySelect.disabled = initialTalentDisabled;
    uiElements.filterInputs.defaultManaPriorityCheckbox.disabled = initialTalentDisabled;
    const savedSkillSource = getCookie('skillTypeSource');
    if (savedSkillSource && uiElements.filterInputs.skillTypeSource) {
        // 如果有已保存的偏好，則使用它
        uiElements.filterInputs.skillTypeSource.value = savedSkillSource;
    } else if (uiElements.filterInputs.skillTypeSource) {
        // 否則 (新用戶)，將預設值設為 'bbcamp'
        uiElements.filterInputs.skillTypeSource.value = 'bbcamp';
    }

    // 加载静态元素的折叠状态
    loadStaticCollapseStates();
    loadFilterCollapseStates();

    // 5. 绑定所有事件监听器
    addEventListeners();

    // 6. 根据URL参数执行特殊操作
    history.replaceState({ view: 'list' }, '');
    document.getElementById('one-click-max-date-display').textContent = oneClickMaxDate;
    document.getElementById('purchase-costume-date-display').textContent = purchaseCostumeDate;

    if (zfavsFromUrl || favsFromUrl) {
        try {
            const compressed = zfavsFromUrl || favsFromUrl;
            const favString = (zfavsFromUrl) ? LZString.decompressFromEncodedURIComponent(compressed) : decodeURIComponent(compressed);
            if (favString) {
                state.temporaryFavorites = favString.split(',');
                state.multiSelectFilters.filterScope = ['favorites'];
                updateFilterButtonUI('filterScope');
            }
        } catch (e) { console.error("从URL处理收藏夹失败", e); }
    }
    if (sharedTeamsFromUrl) {
        try {
            const decompressedJSON = LZString.decompressFromEncodedURIComponent(sharedTeamsFromUrl);
            const sharedData = JSON.parse(decompressedJSON);
            if (Array.isArray(sharedData)) {
                // 确保创建的对象具有 'name' 和 'heroes' 属性
                state.sharedTeamsDataFromUrl = sharedData.map(team => ({
                    name: team.n,
                    heroes: team.h
                }));
                state.isViewingSharedTeams = true;
                if (uiElements.sharedTeamsTabBtn) uiElements.sharedTeamsTabBtn.style.display = 'inline-flex';
                toggleTeamSimulator();
            }
        } catch (e) {
            console.error("从URL处理分享的队伍失败", e);
            state.isViewingSharedTeams = false;
        }
    }


    // 7. 最终渲染与收尾
    if (!state.isViewingSharedTeams) {
        applyFiltersAndRender();
    }

    if (viewHeroFromUrl && !zfavsFromUrl && !favsFromUrl) {
        const targetHero = state.allHeroes.find(h => h.english_name && `${h.english_name}-${h.costume_id}` === viewHeroFromUrl);
        if (targetHero) openDetailsModal(targetHero);
    }

    setTimeout(adjustStickyHeaders, 100);

    // --- 队伍模拟器：加载“已存队伍”列表的折叠状态 ---
    const savedTeamsCollapsed = getCookie('savedTeamsCollapsed');

    // 仅在Cookie为'true'且为移动端视图时执行
    if (savedTeamsCollapsed === 'true' && window.innerWidth <= 900) {
        const listContainer = document.getElementById('saved-teams-list-container');
        if (listContainer) {
            listContainer.classList.add('collapsed');

            // 使用 previousElementSibling 精准查找相邻的header
            const header = listContainer.previousElementSibling;

            if (header && header.classList.contains('saved-teams-header')) {
                const arrow = header.querySelector('.collapse-arrow');
                if (arrow) {
                    arrow.classList.remove('expanded');
                }
            }
        }
    }
    // --- 加载聊天模拟器面板的折叠状态 ---
    // 这个功能同样只在移动端视图下生效
    if (window.innerWidth <= 900) {
        const colorPanel = document.querySelector('.chat-panel-colors');
        const emojiPanel = document.querySelector('.chat-panel-emojis');

        // 检查颜色面板的Cookie
        if (colorPanel && getCookie('chatPanelColorsCollapsed') === 'true') {
            colorPanel.classList.add('collapsed');
            const toggleBtn = colorPanel.querySelector('.panel-toggle-btn');
            if (toggleBtn) toggleBtn.classList.remove('expanded');
        }

        // 检查表情面板的Cookie
        if (emojiPanel && getCookie('chatPanelEmojisCollapsed') === 'true') {
            emojiPanel.classList.add('collapsed');
            const toggleBtn = emojiPanel.querySelector('.panel-toggle-btn');
            if (toggleBtn) toggleBtn.classList.remove('expanded');
        }
    }
    uiElements.pageLoader.classList.add('hidden');
    document.body.classList.remove('js-loading');
}

/**
 * 加载页面静态元素的折叠状态。
 * 此函数在页面初始化时调用。
 */
function loadStaticCollapseStates() {
    document.querySelectorAll('.toggle-button[data-cookie]').forEach(button => {
        const cookieName = button.dataset.cookie;
        const savedState = getCookie(cookieName);
        const targetId = button.dataset.target;
        const contentElement = document.getElementById(targetId);

        if (contentElement && savedState) {
            const shouldCollapse = (savedState === 'collapsed');
            contentElement.classList.toggle('collapsed', shouldCollapse);
            button.classList.toggle('expanded', !shouldCollapse);
        }
    });

    const teamDisplayWrapper = document.getElementById('team-simulator-wrapper');
    const teamDisplayCookie = getCookie('teamDisplayCollapsed');
    if (teamDisplayWrapper && teamDisplayCookie === 'true' && window.innerWidth <= 900) {
        teamDisplayWrapper.classList.add('collapsed');
    }
}

/**
 * 绑定页面上所有主要的事件监听器。
 */
function addEventListeners() {
    const {
        themeToggleButton, langSelectBtn, langOptions, openFiltersBtn, closeFiltersModalBtn, filtersModalOverlay,
        showWantedMissionBtn, showFarmingGuideBtn, showTeamSimulatorBtn,
        heroTable, teamDisplayGrid, myTeamsTabBtn, sharedTeamsTabBtn,
        openFavoritesBtn, shareFavoritesBtn, resetFiltersBtn,
        modalOverlay, advancedFilterHelpBtn, helpModalOverlay, skillTypeHelpBtn, skillTypeHelpModalOverlay,
        lbTalentHelpBtn, lbTalentHelpModalOverlay,
        exportSettingsBtn, importSettingsBtn,  multiSelectModalOverlay
    } = uiElements;

    // --- 主界面UI事件 ---
    themeToggleButton.addEventListener('click', toggleTheme);
    langSelectBtn.addEventListener('click', (e) => { e.stopPropagation(); langOptions.classList.toggle('hidden'); });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.lang-selector-container')) {
            if (langOptions && !langOptions.classList.contains('hidden')) {
                langOptions.classList.add('hidden');
            }
        }
    });
    langOptions.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.closest('.lang-option');
        if (target) {
            const newLang = target.getAttribute('data-lang');
            if (newLang && newLang !== state.currentLang) changeLanguage(newLang);
        }
    });

    // --- 特殊视图切换事件 ---
    showWantedMissionBtn.addEventListener('click', () => initAndShowWantedMissionView());
    showFarmingGuideBtn.addEventListener('click', () => initAndShowFarmingGuideView());
    addChatSimulatorEventListeners();

    // --- 模态框事件 ---
    openFiltersBtn.addEventListener('click', openFiltersModal);
    closeFiltersModalBtn.addEventListener('click', closeFiltersModal);
    filtersModalOverlay.addEventListener('click', closeFiltersModal);
    modalOverlay.addEventListener('click', closeDetailsModal);
    multiSelectModalOverlay.addEventListener('click', () => { if (uiElements.multiSelectModal && !uiElements.multiSelectModal.classList.contains('hidden')) history.back(); });
    advancedFilterHelpBtn.addEventListener('click', openHelpModal);
    helpModalOverlay.addEventListener('click', closeHelpModal);
    skillTypeHelpBtn.addEventListener('click', openSkillTypeHelpModal);
    skillTypeHelpModalOverlay.addEventListener('click', closeSkillTypeHelpModal);
    lbTalentHelpBtn.addEventListener('click', openLbTalentHelpModal);
    lbTalentHelpModalOverlay.addEventListener('click', closeLbTalentHelpModal);

    // --- 导入/导出事件 ---
    exportSettingsBtn.addEventListener('click', openExportModal);
    importSettingsBtn.addEventListener('click', openImportModal);
    initializeExportModalListeners();
    initializeImportModalListeners();

    // --- 英雄列表表格交互事件 ---
    heroTable.querySelector('tbody').addEventListener('click', handleTableBodyClick);
    heroTable.querySelector('thead').addEventListener('click', handleTableHeaderClick);

    // --- 队伍模拟器事件 ---
    showTeamSimulatorBtn.addEventListener('click', toggleTeamSimulator);
    teamDisplayGrid.addEventListener('click', handleTeamGridClick);
    document.addEventListener('click', handleGlobalClickForSwapCancel);
    myTeamsTabBtn.addEventListener('click', () => switchTeamTab(false));
    sharedTeamsTabBtn.addEventListener('click', () => switchTeamTab(true));
    document.getElementById('clear-team-btn').addEventListener('click', () => {
        if (state.teamSlots.some(s => s !== null) && window.confirm(i18n[state.currentLang].confirmClearTeam)) {
            clearTeamDisplay();
        } else if (!state.teamSlots.some(s => s !== null)) {
            clearTeamDisplay();
        }
    });
    document.getElementById('save-team-btn').addEventListener('click', () => {
        const langDict = i18n[state.currentLang];
        if (!state.teamSlots.some(s => s !== null)) { alert(langDict.noHeroesInTeam); return; }
        const teamName = prompt(langDict.promptTeamName);
        if (!teamName || !teamName.trim()) { if (teamName !== null) alert(langDict.teamNameRequired); return; }
        const newTeam = { name: teamName.trim(), heroes: state.teamSlots.map(s => s ? `${s.hero.english_name}-${s.hero.costume_id}` : null) };
        const teams = getSavedTeams();
        teams.push(newTeam);
        saveTeams(teams);
        renderActiveTabList();
    });
    document.getElementById('share-team-list-btn').addEventListener('click', () => {
        const teams = getSavedTeams();
        const langDict = i18n[state.currentLang];
        if (teams.length === 0) { alert(langDict.noTeamsToShare); return; }
        const shareableData = teams.map(t => ({ n: t.name, h: t.heroes }));
        const compressedData = LZString.compressToEncodedURIComponent(JSON.stringify(shareableData));
        const url = `${window.location.origin}${window.location.pathname}?sharedTeams=${compressedData}&lang=${state.currentLang}`;
        copyTextToClipboard(url).then(() => {
            const btn = document.getElementById('share-team-list-btn');
            const originalText = btn.innerText;
            btn.innerText = langDict.shareTeamListCopied;
            btn.disabled = true;
            setTimeout(() => { btn.innerText = originalText; btn.disabled = false; }, 2000);
        }).catch(err => { console.error('复制分享链接失败:', err); alert(langDict.copyLinkFailed); });
    });

    // --- 筛选器面板按钮事件 ---
    openFavoritesBtn.addEventListener('click', () => {
        state.temporaryFavorites = null;
        state.multiSelectFilters.filterScope = ['favorites'];
        updateFilterButtonUI('filterScope');
        applyFiltersAndRender();
    });
    shareFavoritesBtn.addEventListener('click', () => {
        const favorites = getFavorites();
        if (favorites.length === 0) { alert(i18n[state.currentLang].noFavoritesToShare); return; }
        const favString = favorites.join(',');
        const compressedFavs = LZString.compressToEncodedURIComponent(favString);
        const url = `${window.location.origin}${window.location.pathname}?zfavs=${compressedFavs}&lang=${state.currentLang}`;
        copyTextToClipboard(url).then(() => {
            const originalText = shareFavoritesBtn.innerText;
            shareFavoritesBtn.innerText = i18n[state.currentLang].shareFavoritesCopied;
            shareFavoritesBtn.disabled = true;
            setTimeout(() => { shareFavoritesBtn.innerText = originalText; shareFavoritesBtn.disabled = false; }, 2000);
        }).catch(err => { console.error('复制链接失败：', err); alert(i18n[state.currentLang].copyLinkFailed); });
    });
    resetFiltersBtn.addEventListener('click', () => { resetAllFilters(); applyFiltersAndRender(); });

    // --- 所有筛选器输入框的事件 ---
    const debouncedRender = debounce(applyFiltersAndRender, 300);
    const { filterInputs } = uiElements;

    // 1. 为需要延迟触发的文本/数字输入框绑定事件
    ['name', 'types', 'effects', 'passives', 'power', 'attack', 'defense', 'health'].forEach(key => {
        if (filterInputs[key]) {
            filterInputs[key].addEventListener('input', debouncedRender);
        }
    });

    // 2. 为普通的下拉框绑定事件
    if (filterInputs.skillTypeSource) {
        filterInputs.skillTypeSource.addEventListener('change', () => {
            setCookie('skillTypeSource', filterInputs.skillTypeSource.value, 365);
            applyFiltersAndRender();
        });
    }

    // 3. 为“默认突破/天赋设置”的整个组绑定统一的处理器
    const defaultSettingsControls = [
        filterInputs.defaultLimitBreakSelect,
        filterInputs.defaultTalentSelect,
        filterInputs.defaultTalentStrategySelect,
        filterInputs.defaultManaPriorityCheckbox
    ];

    const handleDefaultSettingsChange = () => {
        // 保存所有相关的Cookie
        setCookie('defaultLB', filterInputs.defaultLimitBreakSelect.value, 365);
        setCookie('defaultTalent', filterInputs.defaultTalentSelect.value, 365);
        setCookie('defaultTalentStrategy', filterInputs.defaultTalentStrategySelect.value, 365);
        setCookie('defaultManaPriority', filterInputs.defaultManaPriorityCheckbox.checked.toString(), 365);

        // 触发列表刷新
        applyFiltersAndRender();
    };

    defaultSettingsControls.forEach(control => {
        if (control) {
            control.addEventListener('change', handleDefaultSettingsChange);
        }
    });

    // 4. 为其他独立的、需要保存Cookie的复选框添加处理逻辑
    if (filterInputs.enableSkillQuickSearchCheckbox) {
        filterInputs.enableSkillQuickSearchCheckbox.addEventListener('change', () => {
            setCookie('enableSkillQuickSearch', filterInputs.enableSkillQuickSearchCheckbox.checked.toString(), 365);
        });
    }
    if (filterInputs.showLbTalentDetailsCheckbox) {
        filterInputs.showLbTalentDetailsCheckbox.addEventListener('change', () => {
            setCookie('showLbTalentDetails', filterInputs.showLbTalentDetailsCheckbox.checked.toString(), 365);
        });
    }
    // 为一键日期筛选按钮专门添加点击事件监听器
    if (filterInputs.filterHero730Btn) {
        filterInputs.filterHero730Btn.addEventListener('click', () => {
            resetAllFilters();
            state.multiSelectFilters.filterScope = ['hero'];
            updateFilterButtonUI('filterScope');
            state.temporaryDateFilter = { base: oneClickMaxDate, days: 730 };
            applyFiltersAndRender();
        });
    }

    if (filterInputs.filterCostume548Btn) {
        filterInputs.filterCostume548Btn.addEventListener('click', () => {
            resetAllFilters();
            state.multiSelectFilters.filterScope = ['skin'];
            updateFilterButtonUI('filterScope');
            state.temporaryDateFilter = { base: purchaseCostumeDate, days: 548 };
            applyFiltersAndRender();
        });
    }

    // --- 静态折叠功能事件 ---
    document.querySelectorAll('#filters-modal .filter-header').forEach(header => {
        header.addEventListener('click', function (event) {
            if (event.target.closest('.help-btn')) return;
            const toggleButton = this.querySelector('.toggle-button');
            if (toggleButton) {
                const targetId = toggleButton.dataset.target;
                const contentElement = document.getElementById(targetId);
                if (contentElement) {
                    const isCollapsing = !contentElement.classList.contains('collapsed');
                    contentElement.classList.toggle('collapsed', isCollapsing);
                    toggleButton.classList.toggle('expanded', !isCollapsing);

                    // 完全移植自原版 script.js 的逻辑
                    const cookieName = targetId + '_state';
                    const currentState = isCollapsing ? 'collapsed' : 'expanded';
                    setCookie(cookieName, currentState, 365);
                }
            }
        });
    });

    const teamDisplayHeader = document.getElementById('team-display-header');
    if (teamDisplayHeader) {
        teamDisplayHeader.addEventListener('click', () => {
            const wrapper = document.getElementById('team-simulator-wrapper');
            if (wrapper) {
                const isCollapsed = wrapper.classList.toggle('collapsed');
                setCookie('teamDisplayCollapsed', isCollapsed, 365);
            }
        });
    }

    // --- 队伍模拟器：处理“已存队伍”列表的折叠事件 ---
    const savedTeamsHeader = document.querySelector('.saved-teams-header');
    if (savedTeamsHeader) {
        savedTeamsHeader.addEventListener('click', (e) => {
            // 仅在移动端视图且未点击tab时生效
            if (window.innerWidth > 900 || e.target.closest('.tab-button')) {
                return;
            }

            const listContainer = document.getElementById('saved-teams-list-container');
            const arrow = savedTeamsHeader.querySelector('.collapse-arrow');

            if (listContainer && arrow) {
                // classList.toggle 的返回值正是我们需要的状态：true代表已折叠, false代表已展开
                const isCollapsed = listContainer.classList.toggle('collapsed');
                arrow.classList.toggle('expanded', !isCollapsed);

                // 使用原始的Cookie名称和值进行保存
                setCookie('savedTeamsCollapsed', isCollapsed, 365);
            }
        });
    }

    // --- 聊天模拟器面板折叠事件 (移动端) ---
    document.querySelectorAll('.chat-simulator-panel > h3').forEach(header => {
        header.addEventListener('click', () => {
            // 仅在移动端生效
            if (window.innerWidth > 900) return;

            const panel = header.closest('.chat-simulator-panel');
            if (panel && (panel.classList.contains('chat-panel-colors') || panel.classList.contains('chat-panel-emojis'))) {
                const isCollapsing = !panel.classList.contains('collapsed');
                panel.classList.toggle('collapsed', isCollapsing);

                const toggleBtn = header.querySelector('.panel-toggle-btn');
                if (toggleBtn) toggleBtn.classList.toggle('expanded', !isCollapsing);

                // 【新增】根据面板类型，写入对应的Cookie
                const cookieName = panel.classList.contains('chat-panel-colors')
                    ? 'chatPanelColorsCollapsed'
                    : 'chatPanelEmojisCollapsed';

                setCookie(cookieName, isCollapsing, 365); // isCollapsing 是一个布尔值，会被转为 "true" 或 "false"
            }
        });
    });


    // --- 浏览器历史与窗口事件 ---
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('resize', adjustStickyHeaders);
}

/**
 * 处理主英雄列表 tbody 区域的点击事件（事件委托）。
 */
function handleTableBodyClick(event) {
    const target = event.target;
    if (target.classList.contains('favorite-toggle-icon')) {
        event.stopPropagation();
        const heroId = parseInt(target.dataset.heroId, 10);
        const hero = state.allHeroes.find(h => h.originalIndex === heroId);
        if (hero) {
            if (state.teamSimulatorActive) {
                addHeroToTeam(hero);
            } else {
                toggleFavorite(hero);
                target.textContent = isFavorite(hero) ? '★' : '☆';
                target.classList.toggle('favorited', isFavorite(hero));
                if (state.multiSelectFilters.filterScope[0] === 'favorites') {
                    applyFiltersAndRender();
                }
            }
        }
    } else {
        const row = target.closest('.table-row');
        if (row) {
            const heroId = parseInt(row.dataset.heroId, 10);
            const selectedHero = state.allHeroes.find(h => h.originalIndex === heroId);
            if (selectedHero) openDetailsModal(selectedHero);
        }
    }
}

/**
 * 处理主英雄列表 thead 区域的点击事件（用于排序和一键收藏）。
 */
function handleTableHeaderClick(event) {
    const header = event.target.closest('th');
    if (!header) return;
    if (header.classList.contains('sortable')) {
        const sortKey = header.dataset.sortKey;
        if (state.currentSort.key === sortKey) {
            state.currentSort.direction = state.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            state.currentSort.key = sortKey;
            state.currentSort.direction = ['power', 'attack', 'defense', 'health', 'star'].includes(sortKey) ? 'desc' : 'asc';
        }
        applyFiltersAndRender();
    }
    else if (header.classList.contains('favorite-all-header')) {
        if (state.filteredHeroes.length === 0) return;
        const langDict = i18n[state.currentLang];
        const heroesToProcess = state.filteredHeroes.filter(h => h.english_name);
        if (heroesToProcess.length === 0) return;
        const shouldFavoriteAll = heroesToProcess.filter(isFavorite).length < heroesToProcess.length;
        const message = shouldFavoriteAll ? langDict.confirmFavoriteAll : langDict.confirmUnfavoriteAll;
        if (window.confirm(message)) {
            let currentFavoritesSet = new Set(getFavorites());
            if (shouldFavoriteAll) {
                heroesToProcess.forEach(hero => currentFavoritesSet.add(`${hero.english_name}-${hero.costume_id}`));
            } else {
                heroesToProcess.forEach(hero => currentFavoritesSet.delete(`${hero.english_name}-${hero.costume_id}`));
            }
            saveFavorites(Array.from(currentFavoritesSet));
            applyFiltersAndRender();
        }
    }
}

/**
 * 处理队伍模拟器网格区域的点击事件。
 */
function handleTeamGridClick(event) {
    event.stopPropagation();
    const targetIcon = event.target.closest('.hero-action-icon');
    const targetSlotElement = event.target.closest('.team-hero-slot[data-instance-id]');
    const targetInfoCard = event.target.closest('.team-info-slot[data-instance-id]');

    if (state.swapModeActive) {
        if (targetIcon) {
            const action = targetIcon.dataset.action;
            const targetIndex = parseInt(targetIcon.dataset.index, 10);

            if (action === 'remove') {
                // 移除英雄
                state.teamSlots[targetIndex] = null;
            } else if (action === 'swap') {
                // 交换英雄
                [state.teamSlots[state.selectedForSwapIndex], state.teamSlots[targetIndex]] = [state.teamSlots[targetIndex], state.teamSlots[state.selectedForSwapIndex]];
            } else if (action === 'move') {
                // 【新增】移动英雄到空位
                state.teamSlots[targetIndex] = state.teamSlots[state.selectedForSwapIndex];
                state.teamSlots[state.selectedForSwapIndex] = null;
            }
            // 无论执行何种操作，都退出换位模式
            exitSwapMode();
        }
        return; // 在换位模式下，点击后立即返回，不执行后续逻辑
    }

    if (targetInfoCard) {
        const instanceId = parseInt(targetInfoCard.dataset.instanceId, 10);
        const slotIndex = state.teamSlots.findIndex(slot => slot && slot.instanceId === instanceId);
        if (slotIndex > -1) {
            const slot = state.teamSlots[slotIndex];
            openDetailsModal(slot.hero, { teamSlotIndex: slotIndex });
        }
    } else if (targetSlotElement && !targetIcon) {
        const instanceId = parseInt(targetSlotElement.dataset.instanceId, 10);
        const slotIndex = state.teamSlots.findIndex(slot => slot && slot.instanceId === instanceId);
        if (slotIndex > -1) enterSwapMode(slotIndex);
    }
}

/**
 * 处理全局点击事件，用于在点击队伍模拟器外部时取消交换模式。
 */
function handleGlobalClickForSwapCancel(event) {
    if (state.swapModeActive && !event.target.closest('#team-display-grid')) {
        exitSwapMode();
    }
}

/**
 * 处理队伍模拟器中“我的队伍”和“分享的队伍”标签页的切换。
 */
function switchTeamTab(toShared) {
    const { myTeamsTabBtn, sharedTeamsTabBtn } = uiElements;
    if ((toShared && sharedTeamsTabBtn.classList.contains('active')) || (!toShared && myTeamsTabBtn.classList.contains('active'))) {
        return;
    }
    sharedTeamsTabBtn.classList.toggle('active', toShared);
    myTeamsTabBtn.classList.toggle('active', !toShared);
    renderActiveTabList();
}

/**
 * 处理浏览器后退/前进按钮的事件。
 */
function handlePopState(event) {
    // 1. 优先处理模态框的关闭
    if (state.modalStack.length > 0) {
        const modalType = state.modalStack.pop();
        let modal, overlay;
        switch (modalType) {
            case 'details': modal = uiElements.modal; overlay = uiElements.modalOverlay; break;
            case 'filters': modal = uiElements.filtersModal; overlay = uiElements.filtersModalOverlay; break;
            case 'help': modal = uiElements.helpModal; overlay = uiElements.helpModalOverlay; break;
            case 'skillTypeHelp': modal = uiElements.skillTypeHelpModal; overlay = uiElements.skillTypeHelpModalOverlay; break;
            case 'lbTalentHelp': modal = uiElements.lbTalentHelpModal; overlay = uiElements.lbTalentHelpModalOverlay; break;
            case 'multiSelect': modal = uiElements.multiSelectModal; overlay = uiElements.multiSelectModalOverlay; break;
            case 'importSettings': modal = uiElements.importSettingsModal; overlay = uiElements.importSettingsModalOverlay; break;
            case 'exportSettings': modal = uiElements.exportSettingsModal; overlay = uiElements.exportSettingsModalOverlay; break;
        }
        if (modal) modal.classList.add('hidden');
        if (overlay) overlay.classList.add('hidden');
        if (modal && modal.classList.contains('stacked-modal')) {
            modal.classList.remove('stacked-modal');
            if (overlay) overlay.classList.remove('stacked-modal-overlay');
        }
        if (state.modalStack.length === 0) document.body.classList.remove('modal-open');
        return;
    }

    // 2. 处理视图切换
    const previousState = event.state || { view: 'list' };

    // 检查是否应该返回到主列表视图
    // 只有当历史状态明确为 'list' 时才执行
    if (previousState.view === 'list') {

        // 如果队伍模拟器当前是激活的，则调用 toggle 函数关闭它
        // toggleTeamSimulator 内部会处理UI和状态，但不会再错误地操作历史记录
        if (state.teamSimulatorActive) {
            toggleTeamSimulator();
        }
        // 对于其他视图（通缉任务、材料、聊天），我们只需确保主列表视图被显示即可
        else if (uiElements.heroTableView.classList.contains('hidden')) {
            showHeroListViewUI();
        }
    }
}

/**
 * 创建一个防抖函数，防止函数被高频触发。
 * @param {Function} func - 要防抖的函数。
 * @param {number} delay - 延迟毫秒数。
 * @returns {Function} 防抖后的函数。
 */
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}