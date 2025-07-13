// ui.js: 处理UI交互、DOM元素获取和视觉更新。

// 集中管理所有需要操作的DOM元素
const uiElements = {
    // 按钮
    themeToggleButton: document.getElementById('theme-toggle-btn'),
    langSelectBtn: document.getElementById('lang-select-btn'),
    openFiltersBtn: document.getElementById('open-filters-btn'),
    shareFavoritesBtn: document.getElementById('share-favorites-btn'),
    openFavoritesBtn: document.getElementById('open-favorites-btn'),
    resetFiltersBtn: document.getElementById('reset-filters-btn'),
    advancedFilterHelpBtn: document.getElementById('advanced-filter-help-btn'),
    skillTypeHelpBtn: document.getElementById('skill-type-help-btn'),
    lbTalentHelpBtn: document.getElementById('lb-talent-help-btn'),
    exportSettingsBtn: document.getElementById('export-settings-btn'),
    importSettingsBtn: document.getElementById('import-settings-btn'),

    // 视图切换按钮
    showWantedMissionBtn: document.getElementById('show-wanted-mission-btn'),
    showFarmingGuideBtn: document.getElementById('show-farming-guide-btn'),
    showTeamSimulatorBtn: document.getElementById('show-team-simulator-btn'),
    showChatSimulatorBtn: document.getElementById('show-chat-simulator-btn'),

    // 容器与视图
    resultsWrapper: document.getElementById('results-wrapper'),
    resultsHeader: document.querySelector('.results-header'),
    resultsCountEl: document.getElementById('results-count'),
    heroTableView: document.getElementById('hero-table-view'),
    wantedMissionView: document.getElementById('wanted-mission-view'),
    farmingGuideView: document.getElementById('farming-guide-view'),
    chatSimulatorView: document.getElementById('chat-simulator-view'),
    teamSimulatorWrapper: document.getElementById('team-simulator-wrapper'),

    // 表格
    heroTable: document.getElementById('hero-table'),
    wantedMissionTable: document.getElementById('wanted-mission-table'),
    farmingGuideTable: document.getElementById('farming-guide-table'),

    // 语言选项
    langOptions: document.getElementById('lang-options'),

    // 模态框 (Modal)
    modal: document.getElementById('modal'),
    modalOverlay: document.getElementById('modal-overlay'),
    modalContent: document.getElementById('modal-content'),
    filtersModal: document.getElementById('filters-modal'),
    filtersModalOverlay: document.getElementById('filters-modal-overlay'),
    closeFiltersModalBtn: document.getElementById('close-filters-modal-btn'),
    helpModal: document.getElementById('help-modal'),
    helpModalOverlay: document.getElementById('help-modal-overlay'),
    skillTypeHelpModal: document.getElementById('skill-type-help-modal'),
    skillTypeHelpModalOverlay: document.getElementById('skill-type-help-modal-overlay'),
    lbTalentHelpModal: document.getElementById('lb-talent-help-modal'),
    lbTalentHelpModalOverlay: document.getElementById('lb-talent-help-modal-overlay'),
    multiSelectModal: document.getElementById('multi-select-modal'),
    multiSelectModalOverlay: document.getElementById('multi-select-modal-overlay'),
    exportSettingsModal: document.getElementById('export-settings-modal'),
    exportSettingsModalOverlay: document.getElementById('export-settings-modal-overlay'),
    importSettingsModal: document.getElementById('import-settings-modal'),
    importSettingsModalOverlay: document.getElementById('import-settings-modal-overlay'),

    // 筛选器输入框 (在filters.js中定义并赋值)
    filterInputs: {},

    // 其他
    pageLoader: document.getElementById('page-loader-overlay'),
    headerInfoContainer: document.querySelector('.header-info-container'),
    teamDisplayGrid: document.getElementById('team-display-grid'),
    myTeamsTabBtn: document.getElementById('tab-my-teams'),
    sharedTeamsTabBtn: document.getElementById('tab-shared-teams'),
};

/**
 * 应用指定的语言到整个页面。
 * @param {string} lang - 语言代码 ('cn', 'tc', 'en')。
 */
function applyLanguage(lang) {
    if (lang === 'cn') document.documentElement.lang = 'zh-CN';
    else if (lang === 'tc') document.documentElement.lang = 'zh-TW';
    else document.documentElement.lang = 'en';

    document.body.setAttribute('data-lang', lang);
    state.currentLang = lang;
    const langDict = i18n[lang] || i18n.cn;
    document.title = langDict.pageTitle;

    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.getAttribute('data-lang-key');
        if (key === 'headerTitle' && el.tagName === 'H1') {
            const link = el.querySelector('a');
            if (link) link.textContent = langDict[key];
        } else {
            const translation = langDict[key];
            if (typeof translation === 'function') { }
            else if (translation !== undefined) {
                if (el.tagName === 'OPTION') el.textContent = translation;
                else el.innerHTML = translation;
            }
        }
    });

    document.querySelectorAll('[data-lang-key-placeholder]').forEach(el => {
        const key = el.getAttribute('data-lang-key-placeholder');
        if (langDict[key]) el.placeholder = langDict[key];
    });

    const titles = {
        'theme-toggle-btn': 'toggleThemeTitle', 'lang-select-btn': 'toggleLanguageTitle',
        'show-wanted-mission-btn': 'showWantedMissionTitle', 'open-filters-btn': 'openFiltersTitle',
        'calendar-btn': 'calendarTitle', 'close-filters-modal-btn': 'closeBtnTitle',
        'advanced-filter-help-btn': 'filterSyntaxTitle', 'skill-type-help-btn': 'skillTypeSourceHelpTitle',
    };
    for (const id in titles) {
        const element = document.getElementById(id);
        if (element && langDict[titles[id]]) element.title = langDict[titles[id]];
    }

    const metaDesc = document.getElementById('meta-description');
    if (metaDesc && langDict.metaDescription) metaDesc.setAttribute('content', langDict.metaDescription);
}

/**
 * 应用指定的主题（亮色/暗色）。
 * @param {string} theme - 'light' 或 'dark'。
 */
function applyTheme(theme) {
    if (theme === 'dark') document.documentElement.classList.add('dark-theme');
    else document.documentElement.classList.remove('dark-theme');
}

/**
 * 切换并保存主题。
 */
function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark-theme');
    const newTheme = isDark ? 'light' : 'dark';
    applyTheme(newTheme);
    setCookie('theme', newTheme, 365);
}

/**
 * 切换并保存语言，然后刷新页面。
 * @param {string} lang - 新的语言代码。
 */
function changeLanguage(lang) {
    setCookie('language', lang, 365);
    window.location.reload();
}

/**
 * 调整粘性表头的位置，确保其在结果头下方。
 */
function adjustStickyHeaders() {
    if (!uiElements.resultsHeader) return;
    const headerHeight = uiElements.resultsHeader.offsetHeight;
    const theads = document.querySelectorAll('#results-wrapper thead');
    theads.forEach(thead => {
        if (thead) thead.style.top = `${headerHeight - 1}px`;
    });
}

/**
 * 更新结果区域头部的文本信息（如英雄数量）。
 */
function updateResultsHeader() {
    const langDict = i18n[state.currentLang];
    const count = state.filteredHeroes.length;
    const filtersAreActive = areFiltersActive();
    const onlyFavoritesIsActive = isOnlySpecificScopeFilterActive('favorites');
    const onlyHeroIsActive = isOnlySpecificScopeFilterActive('hero');
    const onlyCostumeIsActive = isOnlySpecificScopeFilterActive('skin');

    if (uiElements.resultsCountEl) {
        uiElements.resultsCountEl.innerHTML = '';
        let message = '';
        let showResetButton = false;

        if (onlyFavoritesIsActive) {
            message = (count > 0) ? langDict.favoritesListCount(count) : langDict.favoritesListEmpty;
            showResetButton = true;
        } else if (onlyHeroIsActive) {
            message = langDict.resultsCountTextHeroOnly(count);
            showResetButton = true;
        } else if (onlyCostumeIsActive) {
            message = langDict.resultsCountTextCostumeOnly(count);
            showResetButton = true;
        } else if (filtersAreActive) {
            message = langDict.resultsCountTextFiltered(count);
            showResetButton = true;
        } else {
            message = langDict.resultsCountTextUnfiltered(count);
            showResetButton = false;
        }

        const messageSpan = document.createElement('span');
        messageSpan.innerHTML = message;
        uiElements.resultsCountEl.appendChild(messageSpan);

        if (showResetButton) {
            const resetTag = document.createElement('span');
            resetTag.className = 'reset-tag';
            resetTag.textContent = langDict.resultsReset;
            resetTag.onclick = (e) => {
                e.preventDefault();
                uiElements.resetFiltersBtn.click();
            };
            uiElements.resultsCountEl.appendChild(resetTag);
        }
    }
}

/**
 * 更新单个多选筛选按钮的UI（文本和激活状态）。
 * @param {string} filterType - 筛选器的类型 (e.g., 'color', 'class')。
 */
function updateFilterButtonUI(filterType) {
    const button = document.getElementById(`btn-filter-${filterType}`);
    if (!button) return;

    const selectedCount = state.multiSelectFilters[filterType].length;
    const langDict = i18n[state.currentLang];
    let labelKey;
    if (filterType === 'aetherpower') labelKey = 'aetherPowerLabel';
    else if (filterType === 'costume') labelKey = 'costumeTypeLabel';
    else if (filterType === 'filterScope') labelKey = 'filterScopeLabel';
    else labelKey = `${filterType}Label`;

    const label = langDict[labelKey] ? langDict[labelKey].slice(0, -1) : filterType;

    if (selectedCount === 0) {
        button.textContent = label;
        button.classList.remove('active');
    } else if (filterType === 'filterScope') {
        const scope_label = langDict[`filterScope_${state.multiSelectFilters[filterType][0]}`]
        button.textContent = `${label}: ${scope_label}`;
        button.classList.add('active');
    } else {
        button.textContent = `${label} (${selectedCount})`;
        button.classList.add('active');
    }
}

/**
 * 在页面加载时，读取所有保存了折叠状态的Cookie，并应用到对应的UI元素上。
 */
function loadCollapseStates() {
    // 查找所有带 data-cookie 属性的折叠按钮
    const toggleButtons = document.querySelectorAll('[data-cookie]');

    toggleButtons.forEach(button => {
        const cookieName = button.dataset.cookie;
        const savedState = getCookie(cookieName);

        const targetId = button.dataset.target;
        const contentElement = document.getElementById(targetId);

        if (contentElement && savedState) {
            // 根据Cookie的值来设置是否折叠
            const shouldCollapse = (savedState === 'collapsed');
            contentElement.classList.toggle('collapsed', shouldCollapse);
            button.classList.toggle('expanded', !shouldCollapse);
        }
    });

    // 单独处理队伍模拟器的折叠状态
    const teamDisplayWrapper = document.getElementById('team-simulator-wrapper');
    const teamDisplayCookie = getCookie('teamDisplayCollapsed');
    if (teamDisplayWrapper && teamDisplayCookie === 'true' && window.innerWidth <= 900) {
        teamDisplayWrapper.classList.add('collapsed');
    }
}

// --- 模态框管理 ---
function openDetailsModal(hero, context = {}) {
    renderDetailsInModal(hero, context); // 渲染内容
    uiElements.modal.classList.remove('hidden');
    uiElements.modalOverlay.classList.remove('hidden');
    document.body.classList.add('modal-open');
    uiElements.modal.scrollTop = 0;
    history.pushState({ modal: 'details' }, null); // 添加历史记录
    state.modalStack.push('details'); // 入栈
}

function closeDetailsModal() {
    if (!uiElements.modal.classList.contains('hidden')) history.back();
}

function openFiltersModal() {
    uiElements.filtersModal.classList.remove('hidden');
    uiElements.filtersModalOverlay.classList.remove('hidden');
    document.body.classList.add('modal-open');
    history.pushState({ modal: 'filters' }, null);
    state.modalStack.push('filters');
}

function closeFiltersModal() {
    if (!uiElements.filtersModal.classList.contains('hidden')) history.back();
}

/**
 * 渲染帮助类型模态框的通用函数。
 */
function renderHelpModalContent(modalElement, titleKey, introKey, listKeys) {
    const langDict = i18n[state.currentLang];
    const introHTML = introKey ? `<p>${langDict[introKey]}</p>` : '';
    const listHTML = listKeys.map(key => langDict[key] || '').join('');
    modalElement.innerHTML = `
        <h3>${langDict[titleKey]}</h3>
        ${introHTML}
        <ul>${listHTML}</ul>
        <div class="modal-footer">
            <button class="close-bottom-btn" id="close-${modalElement.id}-btn">${langDict.detailsCloseBtn}</button>
        </div>
    `;
    document.getElementById(`close-${modalElement.id}-btn`).addEventListener('click', () => {
        if (modalElement === uiElements.helpModal) closeHelpModal();
        if (modalElement === uiElements.skillTypeHelpModal) closeSkillTypeHelpModal();
        if (modalElement === uiElements.lbTalentHelpModal) closeLbTalentHelpModal();
    });
}

function openHelpModal() {
    renderHelpModalContent(uiElements.helpModal, 'filterHelpTitle', 'filterHelpIntro', ['filterHelpAnd', 'filterHelpOr', 'filterHelpNot', 'filterHelpGroup', 'filterHelpExact', 'filterHelpExample']);
    uiElements.helpModal.classList.add('stacked-modal');
    uiElements.helpModalOverlay.classList.add('stacked-modal-overlay');
    uiElements.helpModal.classList.remove('hidden');
    uiElements.helpModalOverlay.classList.remove('hidden');
    document.body.classList.add('modal-open');
    history.pushState({ modal: 'help' }, null);
    state.modalStack.push('help');
}

function closeHelpModal() {
    if (!uiElements.helpModal.classList.contains('hidden')) history.back();
}

function openSkillTypeHelpModal() {
    renderHelpModalContent(uiElements.skillTypeHelpModal, 'skillTypeHelpTitle', null, ['skillTypeHelpContent']);
    uiElements.skillTypeHelpModal.classList.add('stacked-modal');
    uiElements.skillTypeHelpModalOverlay.classList.add('stacked-modal-overlay');
    uiElements.skillTypeHelpModal.classList.remove('hidden');
    uiElements.skillTypeHelpModalOverlay.classList.remove('hidden');
    document.body.classList.add('modal-open');
    history.pushState({ modal: 'skillTypeHelp' }, null);
    state.modalStack.push('skillTypeHelp');
}

function closeSkillTypeHelpModal() {
    if (!uiElements.skillTypeHelpModal.classList.contains('hidden')) history.back();
}

function openLbTalentHelpModal() {
    renderHelpModalContent(uiElements.lbTalentHelpModal, 'lbTalentHelpTitle', null, ['lbTalentHelpLine1', 'lbTalentHelpLine2']);
    uiElements.lbTalentHelpModal.classList.add('stacked-modal');
    uiElements.lbTalentHelpModalOverlay.classList.add('stacked-modal-overlay');
    uiElements.lbTalentHelpModal.classList.remove('hidden');
    uiElements.lbTalentHelpModalOverlay.classList.remove('hidden');
    document.body.classList.add('modal-open');
    history.pushState({ modal: 'lbTalentHelp' }, null);
    state.modalStack.push('lbTalentHelp');
}

function closeLbTalentHelpModal() {
    if (!uiElements.lbTalentHelpModal.classList.contains('hidden')) history.back();
}