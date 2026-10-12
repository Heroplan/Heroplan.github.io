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
    toggleDonateBtn: document.getElementById('toggle-donate-btn'),

    // 视图切换按钮
    showWantedMissionBtn: document.getElementById('show-wanted-mission-btn'),
    showFarmingGuideBtn: document.getElementById('show-farming-guide-btn'),
    showTeamSimulatorBtn: document.getElementById('show-team-simulator-btn'),
    showChatSimulatorBtn: document.getElementById('show-chat-simulator-btn'),
    showRedeemCodesBtn: document.getElementById('show-redeem-codes-btn'),

    // 容器与视图
    resultsWrapper: document.getElementById('results-wrapper'),
    resultsHeader: document.querySelector('.results-header'),
    resultsCountEl: document.getElementById('results-count'),
    heroTableView: document.getElementById('hero-table-view'),
    wantedMissionView: document.getElementById('wanted-mission-view'),
    farmingGuideView: document.getElementById('farming-guide-view'),
    chatSimulatorView: document.getElementById('chat-simulator-view'),
    teamSimulatorWrapper: document.getElementById('team-simulator-wrapper'),
    lotterySimulatorWrapper: document.getElementById('lottery-simulator-wrapper'),

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
    lbTalentHelpModal: document.getElementById('lb-talent-help-modal'),
    lbTalentHelpModalOverlay: document.getElementById('lb-talent-help-modal-overlay'),
    multiSelectModal: document.getElementById('multi-select-modal'),
    multiSelectModalOverlay: document.getElementById('multi-select-modal-overlay'),
    exportSettingsModal: document.getElementById('export-settings-modal'),
    exportSettingsModalOverlay: document.getElementById('export-settings-modal-overlay'),
    importSettingsModal: document.getElementById('import-settings-modal'),
    importSettingsModalOverlay: document.getElementById('import-settings-modal-overlay'),
    summonSummaryModal: document.getElementById('summon-summary-modal'),
    summonSummaryModalOverlay: document.getElementById('summon-summary-modal-overlay'),
    redeemCodesModal: document.getElementById('redeem-codes-modal'),
    redeemCodesModalOverlay: document.getElementById('redeem-codes-modal-overlay'),

    // 筛选器输入框 (在filters.js中定义并赋值)
    filterInputs: {},

    // 其他
    pageLoader: document.getElementById('page-loader-overlay'),
    headerInfoContainer: document.querySelector('.header-info-container'),
    donationlistcontainer:document.querySelector('.donation-list-container-wrapper'),
    teamDisplayGrid: document.getElementById('team-display-grid'),
    myTeamsTabBtn: document.getElementById('tab-my-teams'),
    sharedTeamsTabBtn: document.getElementById('tab-shared-teams'),
};

/** 站点语言码 → `og:locale`（Open Graph 用下划线形式）。 */
const OG_LOCALE = {
    cn: 'zh_CN', tc: 'zh_TW', en: 'en_US', ja: 'ja_JP', ko: 'ko_KR', fr: 'fr_FR',
    de: 'de_DE', es: 'es_ES', pt: 'pt_PT', it: 'it_IT', ru: 'ru_RU', ar: 'ar_SA',
    tr: 'tr_TR', pl: 'pl_PL', nl: 'nl_NL', sv: 'sv_SE', da: 'da_DK', no: 'nb_NO',
    fi: 'fi_FI', id: 'id_ID'
};

/** SEO 站点根（canonical / og:url / hreflang 都基于它）。 */
const SEO_ORIGIN = 'https://heroplan.github.io/';

/**
 * 应用指定的语言到整个页面。
 * @param {string} lang - 语言代码 ('cn', 'tc', 'en')。
 */
function applyLanguage(lang) {
    // 1. 设置 HTML 语言属性
    switch (lang) {
        // 中文按**书写系统**声明（与 index.html 的 hreflang `zh-Hans`/`zh-Hant` 一致）：
        // `zh-Hans` 覆盖所有简体用户，`zh-Hant` 覆盖港/澳/台等所有繁体用户，比 `zh-CN`/`zh-HK` 更准确。
        case 'cn':
            document.documentElement.lang = 'zh-Hans';
            break;
        case 'tc':
            document.documentElement.lang = 'zh-Hant';
            break;
        case 'en':
            document.documentElement.lang = 'en';
            break;
        case 'ja':
            document.documentElement.lang = 'ja';
            break;
        case 'ko':
            document.documentElement.lang = 'ko';
            break;
        case 'fr':
            document.documentElement.lang = 'fr';
            break;
        case 'de':
            document.documentElement.lang = 'de';
            break;
        case 'es':
            document.documentElement.lang = 'es';
            break;
        case 'pt':
            document.documentElement.lang = 'pt';
            break;
        case 'it':
            document.documentElement.lang = 'it';
            break;
        case 'ru':
            document.documentElement.lang = 'ru';
            break;
        case 'ar':
            document.documentElement.lang = 'ar';
            break;
        case 'tr':
            document.documentElement.lang = 'tr';
            break;
        case 'pl':
            document.documentElement.lang = 'pl';
            break;
        case 'nl':
            document.documentElement.lang = 'nl';
            break;
        case 'sv':
            document.documentElement.lang = 'sv';
            break;
        case 'da':
            document.documentElement.lang = 'da';
            break;
        case 'no':
            document.documentElement.lang = 'no';
            break;
        case 'fi':
            document.documentElement.lang = 'fi';
            break;
        case 'id':
            document.documentElement.lang = 'id';
            break;
        default:
            document.documentElement.lang = 'en';
            break;
    }

    // 1.5 书写方向：RTL 语言（阿拉伯语等）⇒ `<html dir="rtl">`，其余 `ltr`。
    //     20 种语言里只有 `ar` 是 RTL；多列几个常见 RTL 码以防以后加语言。
    //     ⚠ 只设 `dir` 不够：CSS 里写死的 `padding-left` / `margin-left` / `border-left` / `left:`
    //       等**物理属性不会自动镜像** ⇒ style.css 末尾有一整段 `html[dir="rtl"]` 覆盖。
    const RTL_LANGS = ['ar', 'he', 'fa', 'ur', 'yi'];
    const dir = RTL_LANGS.indexOf(lang) >= 0 ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.setAttribute('dir', dir);
    document.body.setAttribute('data-dir', dir);

    document.body.setAttribute('data-lang', lang);

    // 2. 更新状态和页面标题
    state.currentLang = lang;
    // i18n 由 langs.js 的 Lang.loadAll() 异步载入 ⇒ 首次调用（数据加载前）可能还没有字典：
    // 这里容错成空对象，只设状态；loadData 完成后 main.js 会再调一次把文案真正套上。
    const langDict = i18n[lang] || i18n.cn || {};
    if (langDict.pageTitle) document.title = langDict.pageTitle;

    // 3. 通用文本/属性更新逻辑
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.getAttribute('data-lang-key');

        // 3.1 特殊处理 H1 里的链接
        if (key === 'headerTitle' && el.tagName === 'H1') {
            const link = el.querySelector('a');
            if (link) link.textContent = langDict[key];
            return; // 处理完直接跳过后续逻辑
        }

        const translation = langDict[key];

        // 3.2 正常的翻译应用逻辑
        if (translation !== undefined && typeof translation !== 'function') {

            if (el.tagName === 'SELECT') {
                // 如果是 Select 标签，我们通常是想修改它的 title 提示，而不是内容
                // 如果修改 innerHTML 会导致下拉选项消失
                el.setAttribute('title', translation);
            }
            else if (el.tagName === 'OPTION') {
                // Option 标签修改文本
                el.textContent = translation;
            }
            else {
                // 其他标签 (div, span, label, p) 使用 innerHTML 支持富文本
                el.innerHTML = translation;
            }
        }
    });

    // 4. 处理 Placeholder (输入框占位符)
    document.querySelectorAll('[data-lang-key-placeholder]').forEach(el => {
        const key = el.getAttribute('data-lang-key-placeholder');
        if (langDict[key]) el.placeholder = langDict[key];
    });

    // 5. 处理特定 ID 的 Title (工具栏按钮等)
    const titles = {
        'theme-toggle-btn': 'toggleThemeTitle',
        'lang-select-btn': 'toggleLanguageTitle',
        'show-wanted-mission-btn': 'showWantedMissionTitle',
        'open-filters-btn': 'openFiltersTitle',
        'calendar-btn': 'calendarTitle',
        'close-filters-modal-btn': 'closeBtnTitle',
        'advanced-filter-help-btn': 'filterSyntaxTitle',
        'show-lottery-simulator-btn': 'showLotterySimulatorTitle',
        'show-team-simulator-btn': 'showTeamSimulatorTitle',
        'show-chat-simulator-btn': 'showChatSimulatorTitle',
        'show-farming-guide-btn': 'showFarmingGuideTitle',
        'show-redeem-codes-btn': 'showRedeemCodesTitle'
    };

    for (const id in titles) {
        const element = document.getElementById(id);
        if (element && langDict[titles[id]]) element.title = langDict[titles[id]];
    }

    // 6. SEO：Meta Description + canonical + Open Graph / Twitter
    //
    // ⚠ 多语言 SEO 的关键：20 个语言版本用 `?lang=<码>` 区分
    //   （见 index.html 里的 `rel="alternate" hreflang`），每个语言版本必须
    //   **把 canonical 指向自身**；若一律指向站点根，Google 会把 20 个版本判成
    //   同一页面、hreflang 注解随之失效。
    //   ⚠ 依赖 JS 执行（爬虫需渲染）。title/description 同理。
    const metaDesc = document.getElementById('meta-description');
    if (metaDesc && langDict.metaDescription) metaDesc.setAttribute('content', langDict.metaDescription);

    const _setAttr = (id, attr, val) => {
        const el = document.getElementById(id);
        if (el && val) el.setAttribute(attr, val);
    };
    const canonicalUrl = SEO_ORIGIN + '?lang=' + lang;
    const seoTitle = langDict.pageTitle || document.title;
    const seoDesc = langDict.metaDescription || '';

    _setAttr('canonical-link', 'href', canonicalUrl);
    _setAttr('og-url', 'content', canonicalUrl);
    _setAttr('og-title', 'content', seoTitle);
    _setAttr('og-description', 'content', seoDesc);
    _setAttr('og-locale', 'content', OG_LOCALE[lang] || lang);
    _setAttr('tw-title', 'content', seoTitle);
    _setAttr('tw-description', 'content', seoDesc);
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
    const langDict = i18n[state.currentLang] || {};
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

        // --- 新增逻辑开始 ---
        // 仅在未应用任何筛选时显示“查看最新”按钮
        if (!filtersAreActive) {
            const latestBtn = document.createElement('span');
            latestBtn.id = 'view-latest-btn';
            latestBtn.className = 'reset-tag'; // 复用样式
            latestBtn.textContent = langDict.viewLatest;
            latestBtn.title = langDict.viewLatest;
            uiElements.resultsCountEl.appendChild(latestBtn);
        }
        // --- 新增逻辑结束 ---

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

    const selectedValues = state.multiSelectFilters[filterType] || [];
    const selectedCount = selectedValues.length;
    const langDict = i18n[state.currentLang] || {};

    const labelKey = filterType.startsWith('skillTag_')
        ? filterType.replace('skillTag_', 'cnSkill_') + 'Label'
        : (filterType === 'aetherpower' ? 'aetherPowerLabel' : (filterType === 'costume' ? 'costumeTypeLabel' : `${filterType}Label`));

    let label = langDict[labelKey] || filterType;
    if (label.endsWith(':')) {
        label = label.slice(0, -1);
    }

    if (selectedCount === 0) {
        button.textContent = label;
        button.classList.remove('active');
    } else if (filterType === 'filterScope') {
        const scope_label = langDict[`filterScope_${selectedValues[0]}`];
        button.textContent = `${label}: ${scope_label}`;
        button.classList.add('active');
    } else {
        button.textContent = `${label} (${selectedCount})`;
        button.classList.add('active');
    }
}

// --- 模态框管理 ---
function openDetailsModal(hero, context = {}) {
    state.modalContext = context; // 在打开模态框时存储上下文
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
    const langDict = i18n[state.currentLang] || {};
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
        if (modalElement === uiElements.lbTalentHelpModal) closeLbTalentHelpModal();
    });
}

function openHelpModal() {
    renderHelpModalContent(uiElements.helpModal, 'filterHelpTitle', 'filterHelpIntro', ['filterHelpAnd', 'filterHelpOr', 'filterHelpNot', 'filterHelpGroup', 'filterHelpExample']); //, 'filterHelpExact'
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

function openLbTalentHelpModal() {
    renderHelpModalContent(uiElements.lbTalentHelpModal, 'lbTalentHelpTitle', null, ['lbTalentHelpLine2']);
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

/**
 * 更新兑换码悬浮按钮上的数量。
 */
function updateRedeemCodeCount() {
    const count = redeemcodes ? redeemcodes.length : 0;
    const countElement = document.getElementById('redeem-code-count');
    if (countElement) {
        countElement.textContent = count;
    }
}

function openRedeemCodesModal() {
    renderRedeemCodesModal(); // 动态生成内容
    uiElements.redeemCodesModal.classList.remove('hidden');
    uiElements.redeemCodesModalOverlay.classList.remove('hidden');
    document.body.classList.add('modal-open');
    history.pushState({ modal: 'redeemCodes' }, null);
    state.modalStack.push('redeemCodes');
}

function closeRedeemCodesModal() {
    if (!uiElements.redeemCodesModal.classList.contains('hidden')) history.back();
}

/**
 * 将结果表格的滚动条滚动到最顶部。
 */
function scrollToTableTop() {
    if (uiElements.resultsWrapper) {
        uiElements.resultsWrapper.scrollTo({
            top: 0,
            behavior: 'smooth' // 使用平滑滚动效果
        });
    }
}

/**
 * 关闭英雄立绘模态框
 */
function closeHeroPortraitModal() {
    const imageModal = document.getElementById('image-modal');
    const imageModalOverlay = document.getElementById('image-modal-overlay');

    if (imageModal && !imageModal.classList.contains('hidden')) {
        imageModal.classList.add('hidden');
        imageModalOverlay.classList.add('hidden');

        // 移除尺寸控制类
        imageModal.classList.remove('show-hero-portrait');

        // 释放动态立绘播放器
        if (typeof disposeActiveAnimationPlayer === 'function') {
            disposeActiveAnimationPlayer();
        }

        // 从堆栈中移除立绘模态框状态
        if (state.modalStack.length > 0 && state.modalStack[state.modalStack.length - 1] === 'heroPortrait') {
            state.modalStack.pop();
            // 更新 lastModal 变量
            lastModal = state.modalStack.length > 0 ? state.modalStack[state.modalStack.length - 1] : null;
        }

        // 检查是否还有其他模态框打开
        if (state.modalStack.length === 0) {
            document.body.classList.remove('modal-open');
        }
    }
}