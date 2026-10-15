// ui.js: 处理UI交互、DOM元素获取和视觉更新。

// 集中管理所有需要操作的DOM元素
const uiElements = {
    // 按钮
    themeToggleButton: document.getElementById('theme-toggle-btn'),
    langSelectBtn: document.getElementById('lang-select-btn'),
    openFiltersBtn: document.getElementById('open-filters-btn'),
    shareFavoritesBtn: document.getElementById('share-favorites-btn'),
    openFavoritesBtn: document.getElementById('open-favorites-btn'),
    openGameHeroesBtn: document.getElementById('open-game-heroes-btn'),
    eva1ImporterInput: document.getElementById('eva1-importer-input'),
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

    // 4.1 处理 Title / Aria-label（图标类按钮内部只有符号，可访问名与提示都要过字典）
    document.querySelectorAll('[data-lang-key-title]').forEach(el => {
        const key = el.getAttribute('data-lang-key-title');
        const translation = langDict[key];
        if (!translation) return;
        el.title = translation;
        if (el.hasAttribute('aria-label')) el.setAttribute('aria-label', translation);
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
 * 同步 URL 的 `?lang=`（canonical 自指 / hreflang / 分享链接都依赖它）。
 * ⚠ 不重载的前提下必须自己改，否则刷新或分享出去的还是旧语言。
 */
function syncLanguageUrl(lang) {
    try {
        const u = new URL(window.location.href);
        u.searchParams.set('lang', lang);
        history.replaceState(null, '', u.toString());
    } catch (e) { /* URL 同步失败不影响切换本身 */ }
}

/**
 * 重刷筛选器标签：`populateFilters()` 会**清空** `multiSelectFilters` ⇒ 先存后还，再刷按钮态。
 * ⚠ 筛选值存的都是规范 ID（`colorId`/`classId`/…）⇒ 语言无关，可以原样还原。
 */
function refreshFiltersAfterLanguageChange() {
    const saved = JSON.parse(JSON.stringify(state.multiSelectFilters || {}));
    populateFilters();
    Object.keys(saved).forEach(k => { state.multiSelectFilters[k] = saved[k]; });
    Object.keys(state.multiSelectFilters).forEach(k => {
        if (typeof updateFilterButtonUI === 'function') updateFilterButtonUI(k);
    });
}

/**
 * 重渲染当前子视图（通缉令 /  Farming / 队伍模拟器）。
 * 列表视图由 `applyFiltersAndRender()` 负责，这里只管"非列表"的那几个。
 */
function refreshActiveViewAfterLanguageChange() {
    const vis = el => el && !el.classList.contains('hidden');
    try {
        // 抽奖池标题/加成文案是**按语言缓存**的字典 ⇒ 无条件重取（很便宜），
        // 否则用户切完语言再进抽奖模拟器会看到旧标题。
        if (typeof refreshLotteryTranslations === 'function') refreshLotteryTranslations();
        if (vis(uiElements.wantedMissionView) && typeof initAndShowWantedMissionView === 'function') {
            initAndShowWantedMissionView();
        } else if (vis(uiElements.farmingGuideView) && typeof initAndShowFarmingGuideView === 'function') {
            initAndShowFarmingGuideView();
        } else if (vis(uiElements.teamSimulatorWrapper)) {
            if (typeof renderTeamDisplay === 'function') renderTeamDisplay();
            if (typeof renderSavedTeams === 'function') renderSavedTeams(getSavedTeams());
            if (typeof updateTeamTags === 'function') updateTeamTags();
        } else if (vis(uiElements.lotterySimulatorWrapper)) {
            // 抽奖模拟器：先重取按语言缓存的字典（标题/加成文案），再调三个**纯渲染**函数
            // （不重新 initialize，避免重置抽奖状态）。
            if (typeof refreshLotteryTranslations === 'function') refreshLotteryTranslations();
            if (typeof renderActivityList === 'function') renderActivityList();
            if (typeof renderFeaturedHeroes === 'function') renderFeaturedHeroes();
            if (typeof renderSummonHistory === 'function') renderSummonHistory();
        } else if (vis(uiElements.chatSimulatorView) && typeof updateChatPreview === 'function') {
            updateChatPreview();
        }
    } catch (e) {
        console.warn('[lang] 子视图刷新失败（已忽略）：', e);
    }
}

/**
 * 切换并保存语言（**无缝**：不整页重载）。
 *
 * 新架构（数据存 ID + 显示时才过字典 + 排序表语言无关）已经具备不重载切换的条件，
 * 但切换时必须**显式补做**旧实现由 reload 免费拿到的几件事：
 *   ① 重取按语言分片的数据并重建英雄显示字段（`reloadLanguageData`）；
 *   ② `applyLanguage()` 刷 DOM 文案 / `<html lang>` / RTL / title / meta / canonical；
 *   ③ `history.replaceState` 同步 `?lang=`；
 *   ④ 重刷筛选器标签并保住已选条件；
 *   ⑤ 重渲染列表与当前子视图。
 *
 * ⚠ 任一步失败 ⇒ 回退到整页重载，避免停留在"半切换"的错乱状态。
 * @param {string} lang - 新的语言代码。
 */
async function changeLanguage(lang) {
    if (!lang || lang === state.currentLang) return;
    if (state._switchingLang) return;          // 连点保护
    state._switchingLang = true;

    setCookie('language', lang, 365);
    const loader = document.getElementById('page-loader-overlay');
    if (loader) loader.classList.remove('hidden');

    try {
        await reloadLanguageData(lang);
        applyLanguage(lang);
        syncLanguageUrl(lang);
        refreshFiltersAfterLanguageChange();
        applyFiltersAndRender();
        refreshActiveViewAfterLanguageChange();
    } catch (err) {
        console.error('[lang] 无缝切换失败，回退整页重载：', err);
        window.location.reload();
        return;
    } finally {
        state._switchingLang = false;
    }

    if (loader) loader.classList.add('hidden');
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

        if (state.temporaryOwnedHeroes) {
            // 「打开游戏英雄列表」：页头显示「游戏英雄列表共 N 位英雄」+ 重置 tag
            message = langDict.gameHeroesListCount(count);
            showResetButton = true;
        } else if (onlyFavoritesIsActive) {
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

        // --- 查看最新 按钮逻辑 ---
        // 仅在未应用任何筛选时显示「查看最新」按钮；一旦有筛选（含英雄学院10列表临时筛选）
        // 「查看最新」不再显示，header 改由上面的 showResetButton 分支呈现「重置」tag。
        if (!filtersAreActive) {
            const latestBtn = document.createElement('span');
            latestBtn.id = 'view-latest-btn';
            latestBtn.className = 'reset-tag'; // 复用样式
            latestBtn.textContent = langDict.viewLatest;
            latestBtn.title = langDict.viewLatest;
            uiElements.resultsCountEl.appendChild(latestBtn);
        }
        // --- 查看最新 按钮逻辑结束 ---

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
    // 列表上方便捷栏的同类型按钮：文案、计数、高亮一律与筛选页面保持一致
    const targets = [button, ...document.querySelectorAll(`.quick-filter-button[data-filter="${filterType}"]`)];

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

    let text = label;
    const active = selectedCount > 0;
    if (active && filterType === 'filterScope') {
        text = `${label}: ${langDict[`filterScope_${selectedValues[0]}`]}`;
    } else if (active) {
        text = `${label} (${selectedCount})`;
    }

    targets.forEach(target => {
        target.textContent = text;
        target.classList.toggle('active', active);
    });
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