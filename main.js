// main.js: 应用程序的主入口和事件协调中心。

/**
 * 页面加载完成后执行的主函数。
 */
document.addEventListener('DOMContentLoaded', async function () {
    await initializeApp();
});

/**
 * 从词条里的 `[#Dynamic]…[#]` 标记找出所有「攻击力参与计算」的伤害数值，并算好系数。
 *
 * 用户 2026-10-10：**完全抛弃**旧站那一套「技能标签门控 + 关键词组合 + 排除词」的启发式识别，
 * 只认生成器打的 `[#Dynamic]` 标记（`skill_desc_gen` 的 `lang_markup.mark_dynamic`）——
 * 标记出现在哪条词条里，哪条就是动态伤害；标记里的数值就是「80 级攻击力」下的展示值
 * ⇒ `系数 = 标记值 / hero.attack`；详情页切 LB / 服装加成时按 `系数 × 当前攻击力` 重算。
 * 渲染侧 `_renderOneCore` 会把标记换成 `<span class="dynamic-value">`（见 render.js），
 * 这里只负责"找 + 算系数"，两边按**出现顺序**一一对应（`index` = 词条下标，`subIndex` = 条内第几个）。
 * @param {object} hero - 要处理的英雄对象。
 */
function parseAndStoreDoTInfo(hero) {
    hero.dynamicDoTEffects = [];
    if (!hero.effects || !hero.attack) return;

    // ⚠ 系数基准必须是**生成器算这些数值时用的那个攻击力**：
    //   生成器对"攻击缩放型伤害"用的是 `hero_attack_at_max` = **L80 × 服装奖励（最多套满阶）**
    //   （见 passive_desc_gen.hero_attack_at_max / costume_bonus_level 的默认档）。
    //   用裸 `hero.attack` 会让系数偏大 ⇒ 一开服装奖励数值就整体飘高。
    const _refCb = (typeof costumeBonusEntry === 'function')
        ? costumeBonusEntry(hero, hero.costumeMaxSets || 0) : null;
    const refAttack = (_refCb && typeof applyStatPerMil === 'function')
        ? applyStatPerMil(hero.attack, _refCb.attackBonusPerMil) : hero.attack;
    if (!refAttack) return;

    // 标记内容 = `值`（生成器 `lang_markup.mark_dynamic` 打的就是纯数值）。
    const DYNAMIC_RE = /\[#Dynamic\]\s*([^\[\]]*?)\s*\[#\]/g;
    hero.effects.forEach((text, index) => {
        if (typeof text !== 'string' || text.indexOf('[#Dynamic]') < 0) return;
        DYNAMIC_RE.lastIndex = 0;
        let m, sub = 0;
        while ((m = DYNAMIC_RE.exec(text)) !== null) {
            const subIndex = sub++;
            const value = parseFloat(String(m[1]).split('|')[0]);
            if (!isFinite(value)) continue;
            hero.dynamicDoTEffects.push({
                index: index,
                subIndex: subIndex,
                originalDamage: value,
                refAttack: refAttack,          // 导出这些数值时用的攻击力（L80 × 服装奖励最多套）
                coefficient: value / refAttack
            });
        }
    });
}

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

    // ▼▼▼ 根据HTML中的全局开关，统一设置日志功能 ▼▼▼
    // 检查在 index.html 中定义的全局开关是否存在并且为 false
    if (window.ENABLE_DEBUG_LOGGING === false) {
        // 如果开关存在且被设为false，则关闭所有日志
        toggleConsoleLogging(false);
    } else {
        // 否则（开关为true，或未定义），则保持日志功能开启
        toggleConsoleLogging(true);
        // console.log("调试日志已开启。如需关闭，请修改 index.html 中的全局开关。");
    }

    // --- 防止因模态框导致页面滚动条消失而引起的布局跳动 ---
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const body = mutation.target;
                const hasModalOpen = body.classList.contains('modal-open');
                const wasModalOpen = mutation.oldValue ? mutation.oldValue.includes('modal-open') : false;

                if (hasModalOpen && !wasModalOpen) {
                    // 'modal-open' 类刚刚被添加
                    // console.log("检测到 modal-open 添加，准备添加 padding-right..."); // <-- 新增日志
                    if (window.innerWidth > document.documentElement.clientWidth) {
                        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
                        // console.log(`计算出滚动条宽度为: ${scrollbarWidth}px`); // <-- 新增日志
                        body.style.paddingRight = `${scrollbarWidth}px`;
                    }
                } else if (!hasModalOpen && wasModalOpen) {
                    // 'modal-open' 类刚刚被移除
                    // console.log("检测到 modal-open 移除，准备移除 padding-right..."); // <-- 新增日志
                    body.style.paddingRight = '';
                }
            }
        }
    });

    observer.observe(document.body, {
        attributes: true,
        attributeOldValue: true
    });
    // 1. 处理URL参数和Cookie，确定语言
    const urlParams = new URLSearchParams(window.location.search);
    const viewHeroFromUrl = urlParams.get('view');
    const langFromUrl = urlParams.get('lang');
    const zfavsFromUrl = urlParams.get('zfavs');
    const favsFromUrl = urlParams.get('favs');
    const sharedTeamsFromUrl = urlParams.get('sharedTeams');

    // 强制使用一次自动获取显示语言
    const languageUpdated = getCookie('languageUpdated');
    if (languageUpdated != '1') {
        setCookie('language', '', '');
        setCookie('languageUpdated', '1', '365');
    }

    const language = getCookie('language');
    // ⚠ 2026-10-10 用户口径：**搜索语言选择已废弃** ⇒ 不再读写 `search_lang` /
    //   `searchLanguageUpdated`，一律按当前界面语言处理（相关迁移逻辑整块移除）。

    const languageCookie = getCookie('language');

    let langToUse = 'en';

    // ⚠ 这里**不能**用 `i18n[码]` 判存在：`i18n` 要等 `loadAll()`（在 `loadData` 里）才填，
    //    此刻还是 `langs.js` 预初始化出来的空对象 ⇒ Cookie / URL 的语言**永远被判为无效**
    //    （重构回归：旧 `language.js` 在加载时就填好了 20 种语言）。改用 `Lang.LANGS` 白名单。
    const _knownLang = (c) => !!c && (typeof Lang !== 'undefined') && Lang.LANGS.indexOf(c) >= 0;

    // 1. 优先使用 Cookie
    if (_knownLang(languageCookie)) {
        langToUse = languageCookie;
    }

    // 2. 其次使用 URL 参数
    else if (_knownLang(langFromUrl)) {
        langToUse = langFromUrl;
    }

    // 3. 最后根据浏览器语言自动判断
    else {
        const browserLang = navigator.language.toLowerCase();

        // 中文
        if (browserLang.startsWith('zh')) {
            if (
                browserLang.includes('tw') ||
                browserLang.includes('hk') ||
                browserLang.includes('mo') ||
                browserLang.includes('hant')
            ) {
                langToUse = 'tc';
            } else {
                langToUse = 'cn';
            }
        }

        // 英文
        else if (browserLang.startsWith('en')) {
            langToUse = 'en';
        }

        // 日语
        else if (browserLang.startsWith('ja')) {
            langToUse = 'ja';
        }

        // 韩语
        else if (browserLang.startsWith('ko')) {
            langToUse = 'ko';
        }

        // 法语
        else if (browserLang.startsWith('fr')) {
            langToUse = 'fr';
        }

        // 德语
        else if (browserLang.startsWith('de')) {
            langToUse = 'de';
        }

        // 西班牙语
        else if (browserLang.startsWith('es')) {
            langToUse = 'es';
        }

        // 葡萄牙语
        else if (browserLang.startsWith('pt')) {
            langToUse = 'pt';
        }

        // 意大利语
        else if (browserLang.startsWith('it')) {
            langToUse = 'it';
        }

        // 俄语
        else if (browserLang.startsWith('ru')) {
            langToUse = 'ru';
        }

        // 阿拉伯语
        else if (browserLang.startsWith('ar')) {
            langToUse = 'ar';
        }

        // 土耳其语
        else if (browserLang.startsWith('tr')) {
            langToUse = 'tr';
        }

        // 波兰语
        else if (browserLang.startsWith('pl')) {
            langToUse = 'pl';
        }

        // 荷兰语
        else if (browserLang.startsWith('nl')) {
            langToUse = 'nl';
        }

        // 瑞典语
        else if (browserLang.startsWith('sv')) {
            langToUse = 'sv';
        }

        // 丹麦语
        else if (browserLang.startsWith('da')) {
            langToUse = 'da';
        }

        // 挪威语
        else if (browserLang.startsWith('no')) {
            langToUse = 'no';
        }

        // 芬兰语
        else if (browserLang.startsWith('fi')) {
            langToUse = 'fi';
        }

        // 印尼语
        else if (browserLang.startsWith('id')) {
            langToUse = 'id';
        }
    }

    // 应用语言
    applyLanguage(langToUse);

    // 2. 加载核心数据
    const dataLoaded = await loadData(state.currentLang);
    if (!dataLoaded) {
        uiElements.pageLoader.classList.add('hidden');
        document.body.classList.remove('js-loading');
        const animationBlocker = document.getElementById('animation-blocker-overlay');
        if (animationBlocker) {
            animationBlocker.classList.add('hidden');
        }
        return;
    }


    // 2.5 i18n 已随 loadData 载入 ⇒ 再套一次文案（首次调用只设了 state.currentLang）
    applyLanguage(state.currentLang);

    // 3. 数据后处理
    populateOriginToFamiliesMap();
    state.allHeroes.forEach((hero, index) => {
        hero.originalIndex = index;
        parseAndStoreDoTInfo(hero);
        // ▼▼▼ 如果英雄没有发布日期，则添加特殊标记 ▼▼▼
        if (!hero['Release date'] && !hero.specialId) {
            hero.isFeaturedOnly = true;
        }
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
        filterHeroAcademyBtn: document.getElementById('filter-hero-academy-btn'),
        filterHero730Btn: document.getElementById('filter-hero-730-btn'),
        filterCostume548Btn: document.getElementById('filter-costume-548-btn'),
    });

    // ▼▼▼ 加载抽奖配置文件 ▼▼▼
    try {
        const [poolsResponse, typesResponse, extraResponse] = await Promise.all([
            fetch('./lottery.json'),      // 读取 lottery.json
            fetch('./lottery_config.json'), // 读取 lottery_config.json
            fetch('./lottery_config_extra.json') // 读取 lottery_config_extra.json
        ]);
        const allPoolsConfig = await poolsResponse.json();
        const summonTypesConfig = await typesResponse.json();
        const extraConfig = await extraResponse.json();
        //console.log("[main.js] extraConfig 加载成功:", extraConfig);

        // 将组合后的标题字典传递给初始化函数
        LotterySimulator.initialize(allPoolsConfig, summonTypesConfig, extraConfig);

    } catch (error) {
        console.error("加载抽奖配置文件失败:", error);
        // 即使抽奖文件加载失败，也让网站继续运行
    }

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
    uiElements.filterInputs.skillTypeSource.value = 'bbcamp';

    // 加载静态元素的折叠状态
    loadStaticCollapseStates();
    loadFilterCollapseStates();

    // 5. 绑定所有事件监听器
    addEventListeners();

    // 6. 根据URL参数执行特殊操作
    history.replaceState({ view: 'list' }, '');
    document.getElementById('hero-academy-date-display').textContent = formatLocalDate(new Date().toISOString().split('T')[0]);
    document.getElementById('one-click-max-date-display').textContent = formatLocalDate(oneClickMaxDate);
    document.getElementById('purchase-costume-date-display').textContent = formatLocalDate(purchaseCostumeDate);
    // 初始化灵魂交换行
    const soulExchangeDateDisplay = document.getElementById('soul-exchange-date-display');
    const showSoulExchangeBtn = document.getElementById('show-soul-exchange-btn');
    if (soulExchangeDateDisplay && showSoulExchangeBtn) {
        soulExchangeDateDisplay.textContent = formatLocalDate(soulExchange.Date);
        showSoulExchangeBtn.disabled = !soulExchange.show;
    }

    const bfavsFromUrl = urlParams.get('bfavs');

    if (bfavsFromUrl) {
        // 新二进制分享格式
        try {
            const favArray = decodeFavoritesFromBinary(bfavsFromUrl);
            if (favArray && favArray.length > 0) {
                state.temporaryFavorites = favArray;
                state.multiSelectFilters.filterScope = ['favorites'];
                updateFilterButtonUI('filterScope');
            }
        } catch (e) {
            console.error("从URL处理二进制收藏夹失败", e);
        }
    } else if (zfavsFromUrl || favsFromUrl) {
        // 旧格式兼容
        try {
            const compressed = zfavsFromUrl || favsFromUrl;
            const favString = (zfavsFromUrl)
                ? LZString.decompressFromEncodedURIComponent(compressed)
                : decodeURIComponent(compressed);
            if (favString) {
                state.temporaryFavorites = favString.split(',');
                state.multiSelectFilters.filterScope = ['favorites'];
                updateFilterButtonUI('filterScope');
            }
        } catch (e) {
            console.error("从URL处理收藏夹失败", e);
        }
    }
    const bsharedTeamsFromUrl = urlParams.get('bsharedTeams');
    if (bsharedTeamsFromUrl) {
        // 新二进制格式
        try {
            const sharedData = decodeTeamsFromBinary(bsharedTeamsFromUrl);
            if (Array.isArray(sharedData) && sharedData.length > 0) {
                state.sharedTeamsDataFromUrl = sharedData.map(team => ({
                    name: team.name,
                    heroes: team.heroes
                }));
                state.isViewingSharedTeams = true;
                if (uiElements.sharedTeamsTabBtn) uiElements.sharedTeamsTabBtn.style.display = 'inline-flex';
                uiElements.sharedTeamsTabBtn.classList.add('active');
                if (uiElements.myTeamsTabBtn) {
                    uiElements.myTeamsTabBtn.classList.remove('active');
                }
            }
            toggleTeamSimulator();
        } catch (e) {
            console.error("从URL处理二进制分享的队伍失败", e);
            state.isViewingSharedTeams = false;
        }
    } else if (sharedTeamsFromUrl) {
        // 旧格式兼容
        try {
            const decompressedJSON = LZString.decompressFromEncodedURIComponent(sharedTeamsFromUrl);
            const sharedData = JSON.parse(decompressedJSON);
            if (Array.isArray(sharedData)) {
                state.sharedTeamsDataFromUrl = sharedData.map(team => ({
                    name: team.n,
                    heroes: team.h
                }));
                state.isViewingSharedTeams = true;
                if (uiElements.sharedTeamsTabBtn) uiElements.sharedTeamsTabBtn.style.display = 'inline-flex';
                uiElements.sharedTeamsTabBtn.classList.add('active');
                if (uiElements.myTeamsTabBtn) {
                    uiElements.myTeamsTabBtn.classList.remove('active');
                }
            }
            toggleTeamSimulator();
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
        // 1. 新格式：按 heroId 查找
        let targetHero = state.allHeroes.find(h => h.heroId === viewHeroFromUrl);

        // 2. 向后兼容：旧的 english_name-costume_id 格式
        if (!targetHero) {
            targetHero = state.allHeroes.find(
                h => h.english_name && `${h.english_name}-${h.costume_id}` === viewHeroFromUrl
            );
        }

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
    // 同步移除加载遮罩、js-loading类和点击阻断层
    uiElements.pageLoader.classList.add('hidden');
    document.body.classList.remove('js-loading');
    const animationBlocker = document.getElementById('animation-blocker-overlay');
    if (animationBlocker) {
        animationBlocker.classList.add('hidden');
    }

    // 渲染捐赠者列表
    const sortedDonationList = sortDonationListByLanguage(donationList);
    const shouldScroll = renderDonationList(sortedDonationList);
    // 启动捐赠列表滚动动画（无需阻断层）
    if (shouldScroll) {
        const container = document.getElementById('donation-list-box');
        if (container) {
            container.classList.add('is-scrolling');
        }
    }
    // 检查赞助显示状态并相应处理
    // 如果cookie不存在（默认显示赞助）或者cookie存在且值为false，则加载赞助脚本
    if (!isDonateHidden()) {
        loadDonateScript();
    }

    // 更新赞助按钮文本
    updateDonateButton();

    // 设置高亮技能词条的初始值
    const highlightSkillTermsCheckbox = document.getElementById('highlight-skill-terms-checkbox');
    if (highlightSkillTermsCheckbox) {
        highlightSkillTermsCheckbox.checked = getCookie('highlightSkillTerms') !== 'false';
        highlightSkillTermsCheckbox.addEventListener('change', () => {
            setCookie('highlightSkillTerms', highlightSkillTermsCheckbox.checked, 365);
            applyFiltersAndRender(); // 重新渲染以应用更改
        });
    }

    // 初始化技能类别显示设置
    const showSkillTypesInDetailsCheckbox = document.getElementById('show-skill-types-in-details-checkbox');
    const showSkillTypesInTeamCheckbox = document.getElementById('show-skill-types-in-team-checkbox');

    if (showSkillTypesInDetailsCheckbox) {
        showSkillTypesInDetailsCheckbox.checked = getCookie('showSkillTypesInDetails') !== 'false';
        showSkillTypesInDetailsCheckbox.addEventListener('change', function () {
            setCookie('showSkillTypesInDetails', showSkillTypesInDetailsCheckbox.checked, 365);
            // 如果当前正在显示详情页，则需要重新渲染
            if (!uiElements.modal.classList.contains('hidden')) {
                const currentHero = state.modalContext.hero;
                if (currentHero) {
                    renderDetailsInModal(currentHero, state.modalContext);
                }
            }
        });
    }

    if (showSkillTypesInTeamCheckbox) {
        showSkillTypesInTeamCheckbox.checked = getCookie('showSkillTypesInTeam') !== 'false';
        showSkillTypesInTeamCheckbox.addEventListener('change', function () {
            setCookie('showSkillTypesInTeam', showSkillTypesInTeamCheckbox.checked, 365);
            // 重新渲染队伍模拟器
            if (state.teamSimulatorActive) {
                renderTeamDisplay();
            }
        });
    }

    // 设置立绘中光效的初始值
    const showCircleRayCheckbox = document.getElementById('show-circle-ray-checkbox');
    if (showCircleRayCheckbox) {
        showCircleRayCheckbox.checked = getCookie('showCircleRay') !== 'false';
        showCircleRayCheckbox.addEventListener('change', () => {
            setCookie('showCircleRay', showCircleRayCheckbox.checked, 365);
        });
    }
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
    // --- 为图片展示弹窗添加关闭事件 ---
    const imageModal = document.getElementById('image-modal');
    const imageModalOverlay = document.getElementById('image-modal-overlay');

    if (imageModalOverlay) {
        imageModalOverlay.addEventListener('click', function (event) {
            history.back();
        });
    }
    const {
        themeToggleButton, langSelectBtn, langOptions, openFiltersBtn, closeFiltersModalBtn, filtersModalOverlay,
        showWantedMissionBtn, showFarmingGuideBtn, showTeamSimulatorBtn,
        heroTable, teamDisplayGrid, myTeamsTabBtn, sharedTeamsTabBtn,
        openFavoritesBtn, shareFavoritesBtn, resetFiltersBtn,
        modalOverlay, advancedFilterHelpBtn, helpModalOverlay, skillTypeHelpBtn, skillTypeHelpModalOverlay,
        lbTalentHelpBtn, lbTalentHelpModalOverlay,
        exportSettingsBtn, importSettingsBtn, multiSelectModalOverlay, showRedeemCodesBtn
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
    // “查看最新”按钮
    uiElements.resultsHeader.addEventListener('click', (event) => {
        if (event.target.id === 'view-latest-btn') {
            // 设置全局排序状态为按发布日期降序
            state.currentSort = { key: 'Release date', direction: 'desc' };
            // 应用筛选并重新渲染表格
            applyFiltersAndRender();
        }
    });

    // --- 特殊视图切换事件 ---
    showWantedMissionBtn.addEventListener('click', () => initAndShowWantedMissionView());
    showFarmingGuideBtn.addEventListener('click', () => initAndShowFarmingGuideView());
    addChatSimulatorEventListeners();
    showRedeemCodesBtn.addEventListener('click', openRedeemCodesModal);

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
    document.getElementById('close-redeem-codes-modal-btn').addEventListener('click', closeRedeemCodesModal);
    document.getElementById('redeem-codes-footer-close-btn').addEventListener('click', closeRedeemCodesModal);
    uiElements.redeemCodesModalOverlay.addEventListener('click', closeRedeemCodesModal);
    // 更新兑换码数量
    updateRedeemCodeCount();

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

        const binaryStr = encodeTeamsToBinary(teams);
        const url = `${window.location.origin}${window.location.pathname}?bsharedTeams=${binaryStr}&lang=${state.currentLang}`;

        copyTextToClipboard(url).then(() => {
            const btn = document.getElementById('share-team-list-btn');
            const originalText = btn.innerText;
            btn.innerText = langDict.shareTeamListCopied;
            btn.disabled = true;
            setTimeout(() => { btn.innerText = originalText; btn.disabled = false; }, 2000);
        }).catch(err => {
            console.error('复制分享链接失败:', err);
            alert(langDict.copyLinkFailed);
        });
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
        if (favorites.length === 0) {
            alert(i18n[state.currentLang].noFavoritesToShare);
            return;
        }

        const binaryStr = encodeFavoritesToBinary(favorites);
        const url = `${window.location.origin}${window.location.pathname}?bfavs=${binaryStr}&lang=${state.currentLang}`;

        copyTextToClipboard(url).then(() => {
            const originalText = shareFavoritesBtn.innerText;
            shareFavoritesBtn.innerText = i18n[state.currentLang].shareFavoritesCopied;
            shareFavoritesBtn.disabled = true;
            setTimeout(() => {
                shareFavoritesBtn.innerText = originalText;
                shareFavoritesBtn.disabled = false;
            }, 2000);
        }).catch(err => {
            console.error('复制链接失败：', err);
            alert(i18n[state.currentLang].copyLinkFailed);
        });
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
        initialTalentDisabled = uiElements.filterInputs.defaultTalentSelect.value === 'none';
        uiElements.filterInputs.defaultTalentStrategySelect.disabled = initialTalentDisabled;
        uiElements.filterInputs.defaultManaPriorityCheckbox.disabled = initialTalentDisabled;
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
    if (filterInputs.filterHeroAcademyBtn) {
        filterInputs.filterHeroAcademyBtn.addEventListener('click', () => {
            resetAllFilters(); // 重置所有筛选条件
            state.temporaryAcademyFilter = true; // 激活英雄学院筛选模式
            applyFiltersAndRender(); // 应用筛选并重新渲染
        });
    }

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


    // 为灵魂交换的“展示列表”按钮添加点击事件
    const showSoulExchangeBtn = document.getElementById('show-soul-exchange-btn');
    if (showSoulExchangeBtn) {
        showSoulExchangeBtn.addEventListener('click', () => {
            // 检查按钮是否被禁用
            if (!showSoulExchangeBtn.disabled) {
                // ▼▼▼ 在显示列表前，先关闭筛选框 ▼▼▼
                closeFiltersModal();
                // ▼▼▼ 新增 setTimeout 以解决执行时机问题 ▼▼▼
                setTimeout(() => {
                    showSoulExchangeModal();
                }, 100);
            }
        });
    }

    // --- 灵魂交换图标长按：输入自定义英雄ID列表并展示列表 ---
    const soulExchangeIcon = document.querySelector('img.event-icon[alt="Soul Exchange"]');
    if (soulExchangeIcon) {
        let soulExchangeLongPressTimer = null;
        const SOUL_EXCHANGE_LONG_PRESS = 800; // 长按阈值（毫秒）

        const startSoulExchangePress = () => {
            if (soulExchangeLongPressTimer) clearTimeout(soulExchangeLongPressTimer);
            soulExchangeLongPressTimer = setTimeout(() => {
                soulExchangeLongPressTimer = null;

                const defaultJSON = JSON.stringify(
                    { five: [], fifteen: [], thirty: [] },
                    null, 2
                );

                const input = window.prompt(
                    '输入自定义英雄列表（JSON）：\n' +
                    '结构对应灵魂交换的三个分组：\n' +
                    '{ "five": [英雄ID...], "fifteen": [...], "thirty": [...] }\n' +
                    '也可直接输入一个数组 [...]，将全部归入第一组。',
                    defaultJSON
                );
                if (input === null) return; // 用户取消

                // 解析输入，兼容两种格式：数组 或 带 five/fifteen/thirty 的对象
                let customData;
                try {
                    const parsed = JSON.parse(input);
                    if (Array.isArray(parsed)) {
                        customData = {
                            five: parsed.filter(v => typeof v === 'string' && v),
                            fifteen: [],
                            thirty: []
                        };
                    } else if (parsed && typeof parsed === 'object') {
                        const pick = (v) => Array.isArray(v) ? v.filter(x => typeof x === 'string' && x) : [];
                        customData = {
                            five: pick(parsed.five),
                            fifteen: pick(parsed.fifteen),
                            thirty: pick(parsed.thirty)
                        };
                    } else {
                        alert('格式错误：请提供 JSON 数组，或包含 five/fifteen/thirty 的对象。');
                        return;
                    }
                } catch (err) {
                    alert('JSON 解析失败：' + err.message);
                    return;
                }

                const total = customData.five.length + customData.fifteen.length + customData.thirty.length;
                if (total === 0) {
                    alert('列表为空或没有有效的英雄ID。');
                    return;
                }

                // 备份原 soulExchange 的三个分组
                const backup = {
                    five: soulExchange.five,
                    fifteen: soulExchange.fifteen,
                    thirty: soulExchange.thirty
                };

                // 临时替换为用户输入的数据
                soulExchange.five = customData.five;
                soulExchange.fifteen = customData.fifteen;
                soulExchange.thirty = customData.thirty;

                // 直接调用模态框函数（与“展示列表”按钮等效）
                showSoulExchangeModal();

                // showSoulExchangeModal 在构造 DOM 时是同步读取的，渲染完毕后即可恢复原数据
                soulExchange.five = backup.five;
                soulExchange.fifteen = backup.fifteen;
                soulExchange.thirty = backup.thirty;

            }, SOUL_EXCHANGE_LONG_PRESS);
        };

        const endSoulExchangePress = () => {
            if (soulExchangeLongPressTimer) {
                clearTimeout(soulExchangeLongPressTimer);
                soulExchangeLongPressTimer = null;
            }
        };

        // 鼠标事件
        soulExchangeIcon.addEventListener('mousedown', startSoulExchangePress);
        soulExchangeIcon.addEventListener('mouseup', endSoulExchangePress);
        soulExchangeIcon.addEventListener('mouseleave', endSoulExchangePress);
        // 触摸事件
        soulExchangeIcon.addEventListener('touchstart', startSoulExchangePress, { passive: true });
        soulExchangeIcon.addEventListener('touchend', endSoulExchangePress);
        soulExchangeIcon.addEventListener('touchcancel', endSoulExchangePress);
        // 阻止长按时的右键菜单（桌面 Firefox / 移动端 Safari）
        soulExchangeIcon.addEventListener('contextmenu', (e) => e.preventDefault());
        // 防止图片拖拽干扰长按
        soulExchangeIcon.draggable = false;
        soulExchangeIcon.style.userSelect = 'none';
        soulExchangeIcon.style.webkitUserSelect = 'none';
        soulExchangeIcon.style.webkitTouchCallout = 'none';
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
    // --- 抽奖模拟器事件 ---

    const showLotterySimulatorBtn = document.getElementById('show-lottery-simulator-btn');
    if (showLotterySimulatorBtn) {
        showLotterySimulatorBtn.addEventListener('click', LotterySimulator.toggle);
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

                // 根据面板类型，写入对应的Cookie
                const cookieName = panel.classList.contains('chat-panel-colors')
                    ? 'chatPanelColorsCollapsed'
                    : 'chatPanelEmojisCollapsed';

                setCookie(cookieName, isCollapsing, 365); // isCollapsing 是一个布尔值，会被转为 "true" 或 "false"
            }
        });
    });
    // 添加赞助按钮事件监听
    const toggleDonateBtn = document.getElementById('toggle-donate-btn');
    if (toggleDonateBtn) {
        toggleDonateBtn.addEventListener('click', toggleDonate);
    }



    // --- 浏览器历史与窗口事件 ---
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('resize', adjustStickyHeaders);
}

/**
 * 处理主英雄列表 tbody 区域的点击事件（事件委托）。
 */
function handleTableBodyClick(event) {
    const target = event.target;
    // 处理收藏/添加图标的点击
    if (target.classList.contains('favorite-toggle-icon')) {
        event.stopPropagation();

        // 检查图标是否被禁用
        if (target.classList.contains('disabled')) {
            return; // 如果被禁用，则不执行任何后续操作
        }

        const heroId = parseInt(target.dataset.heroId, 10);
        const hero = state.allHeroes.find(h => h.originalIndex === heroId);
        if (hero) {
            if (state.lotterySimulatorActive) {
                LotterySimulator.addHeroToFeaturedSlot(hero);
            } else if (state.teamSimulatorActive) {
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
        // 处理行的点击
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
 * 该函数现在能够区分“关闭模态框”和“从主视图返回”两种情况。
 */
function handlePopState(event) {
    // 优先检查模态框堆栈。如果堆栈不为空，则后退操作旨在关闭模态框。
    if (state.modalStack.length > 0) {
        const modalType = state.modalStack.pop(); // 从堆栈中弹出模态框类型

        // --- 特殊情况：处理堆叠式模态框（例如，在抽奖结果上打开英雄详情）---
        if (modalType === 'details' && state.modalContext && typeof state.modalContext.onClose === 'function') {
            uiElements.modal.classList.add('hidden');
            uiElements.modalOverlay.classList.add('hidden');
            state.modalContext.onClose(); // 调用回调以恢复下层模态框
            return; // `onClose` 已处理状态，直接返回
        }

        // --- 标准模态框关闭逻辑 ---
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
            case 'summonSummary': modal = uiElements.summonSummaryModal; overlay = uiElements.summonSummaryModalOverlay; break;
            case 'redeemCodes': modal = uiElements.redeemCodesModal; overlay = uiElements.redeemCodesModalOverlay; break;
            case 'heroPortrait':
                modal = document.getElementById('image-modal');
                overlay = document.getElementById('image-modal-overlay');
                if (modal) modal.classList.remove('show-hero-portrait');
                break;
        }

        if (modal) modal.classList.add('hidden');
        if (overlay) overlay.classList.add('hidden');

        // 仅当最后一个模态框关闭时，才恢复页面滚动
        if (state.modalStack.length === 0) {
            document.body.classList.remove('modal-open');
        }
        return; // 已处理模态框关闭，结束函数
    }

    // --- 如果模态框堆栈为空，则后退操作旨在切换主视图 ---
    if (state.teamSimulatorActive) {
        toggleTeamSimulator();
    } else if (state.lotterySimulatorActive) {
        LotterySimulator.toggle();
    } else {
        // 作为备用，处理从其他特殊视图（如通缉任务）返回的情况
        showHeroListViewUI();
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

/**
 * 遍历所有英雄，生成一个从“起源”到其下所有“家族”的映射表。
 * 这个函数在应用启动时调用一次。
 */
function populateOriginToFamiliesMap() {
    //console.log("[日志-映射生成] 开始生成 起源->家族 映射表...");
    const tempMap = {};

    state.allHeroes.forEach(hero => {
        if (hero.source && hero.family) {
            // 使用 sourceReverseMap 将本地化的起源名称转为标准的英文ID
            const englishOrigin = sourceReverseMap[hero.source];
            if (englishOrigin) {
                const originKey = englishOrigin.toLowerCase();
                const familyKey = String(hero.family).toLowerCase();

                if (!tempMap[originKey]) {
                    tempMap[originKey] = new Set(); // 使用 Set 自动去重
                }
                tempMap[originKey].add(familyKey);
            }
        }
    });

    // 将 Set 转换为数组，并赋值给在 data.js 中声明的全局变量
    for (const origin in tempMap) {
        originToFamiliesMap[origin] = Array.from(tempMap[origin]);
    }
    //console.log("[日志-映射生成] 映射表生成完毕:", originToFamiliesMap);
}

/**
 * 根据用户语言优先排序捐赠名单
 * @param {Array} originalList - 原始捐赠名单
 * @param {string} userLang - 用户语言偏好
 * @returns {Array} 排序后的捐赠名单
 */
function sortDonationListByLanguage(originalList) {
    // 搜索语言已废弃 ⇒ 一律用当前界面语言
    const userLang = state.currentLang;

    // 如果用户语言无效或不在映射中，返回原始顺序
    if (!userLang || !langDonorsMap[userLang]) {
        return [...originalList]; // 返回副本避免修改原数组[1](@ref)
    }

    // 获取当前语言的捐赠者
    const langSpecificDonors = langDonorsMap[userLang];

    // 分离捐赠者：当前语言的捐赠者和其他捐赠者
    const currentLangDonors = [];
    const otherDonors = [];

    originalList.forEach(donor => {
        if (langSpecificDonors.includes(donor)) {
            currentLangDonors.push(donor);
        } else {
            otherDonors.push(donor);
        }
    });

    // 按语言映射中的顺序排序当前语言捐赠者
    const sortedCurrentLangDonors = langSpecificDonors.filter(donor =>
        currentLangDonors.includes(donor)
    );

    // 合并数组：当前语言捐赠者在前，其他捐赠者保持原顺序在后
    return [...sortedCurrentLangDonors, ...otherDonors];
}

/**
 * 动态渲染捐赠者列表。
 * 该函数根据列表内容长度智能调整滚动速度和名单总长度，以实现无缝、自然的滚动效果。
 */
function renderDonationList(sortedDonationList) {
    const wrapper = document.querySelector('.donation-list-wrapper');
    const container = document.getElementById('donation-list-box');

    if (!wrapper || !container) {
        console.error('找不到捐赠者列表的容器元素。');
        return false; // 返回 false 表示未成功渲染，以便外部逻辑判断
    }

    // 清空旧内容，先渲染一次原始名单以测量长度
    container.innerHTML = '';
    // 遍历字符串数组并创建元素
    sortedDonationList.forEach(donorName => {
        const donationItem = document.createElement('span');
        donationItem.classList.add('donation-item');
        donationItem.textContent = donorName;
        container.appendChild(donationItem);
    });

    const originalListWidth = container.scrollWidth;
    const wrapperWidth = wrapper.offsetWidth;

    // 根据列表长度判断是否需要滚动
    if (originalListWidth > wrapperWidth) {
        // 列表本身已经够长，为了无缝循环，复制一次即可
        const donorsToRender = [...sortedDonationList, ...sortedDonationList];

        container.innerHTML = ''; // 清空并重新渲染
        donorsToRender.forEach(donorName => {
            const donationItem = document.createElement('span');
            donationItem.classList.add('donation-item');
            donationItem.textContent = donorName;
            container.appendChild(donationItem);
        });

        const totalWidth = container.scrollWidth;
        const duration = totalWidth / 50; // 假设每秒滚动50像素
        container.style.animationDuration = `${duration}s`;

        return true; // 返回 true 表示列表已准备好滚动
    } else {
        // 列表太短，不进行任何复制和动画
        container.style.animationDuration = '0s';
        return false; // 返回 false 表示不需要滚动
    }
}

/**
 * 检查赞助是否被隐藏
 */
function isDonateHidden() {
    const cookieValue = getCookie('hideDonate');
    // 如果cookie不存在，默认显示赞助（不隐藏）
    return cookieValue === 'true';
}

/**
 * 切换赞助显示状态
 */
function toggleDonate() {
    const currentlyHidden = isDonateHidden();
    const newState = !currentlyHidden;
    setCookie('hideDonate', newState.toString(), 365);

    // 更新按钮文本
    updateDonateButton();

    // 控制赞助脚本的加载/移除
    if (newState) {
        removeDonateScript();
    } else {
        loadDonateScript();
    }
}

/**
 * 更新赞助按钮的显示文本
 */
function updateDonateButton() {
    const button = document.getElementById('toggle-donate-btn');
    if (button) {
        const langDict = i18n[state.currentLang];
        const isHidden = isDonateHidden();
        button.textContent = isHidden ? langDict.showDonate : langDict.hideDonate;
    }
}

/**
 * 加载赞助脚本
 */
function loadDonateScript() {
    return;
    // 检查是否已存在赞助脚本
    if (document.querySelector('script[src*="overlay-widget.js"]')) {
        return;
    }

    // 创建并加载脚本
    const script = document.createElement('script');
    script.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
    script.onload = function () {
        if (typeof kofiWidgetOverlay !== 'undefined') {
            kofiWidgetOverlay.draw('heroplan', {
                'type': 'floating-chat',
                'floating-chat.donateButton.text': '',
                'floating-chat.donateButton.background-color': '#794bc4',
                'floating-chat.donateButton.text-color': '#fff'
            });
        }
    };
    document.head.appendChild(script);
}

/**
 * 移除赞助脚本和相关的DOM元素
 */
function removeDonateScript() {
    // 移除脚本
    const scripts = document.querySelectorAll('script[src*="overlay-widget.js"]');
    scripts.forEach(script => script.remove());

    // 移除Ko-fi创建的浮动聊天元素
    const kofiElements = document.querySelectorAll('[id*="kofi"], .kofi-overlay, .floatingchat-container-wrap, .floatingchat-container-wrap-mobi');
    kofiElements.forEach(element => element.remove());

    // 清理全局变量（如果存在）
    if (typeof kofiWidgetOverlay !== 'undefined') {
        delete window.kofiWidgetOverlay;
    }
}

// ==================== 二进制收藏编码/解码 ====================

function crc32(data) {
    let crc = -1;
    for (let i = 0; i < data.length; i++) {
        crc ^= data[i];
        for (let j = 0; j < 8; j++) {
            crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
        }
    }
    return (crc ^ -1) >>> 0;
}

function base64UrlEncode(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

/**
 * 将收藏数组（如 ['hero1-0', 'hero2-1']）编码为二进制 Base64 URL 字符串
 */
function encodeFavoritesToBinary(favoritesArray) {
    if (!favoritesArray || favoritesArray.length === 0) return '';

    const selectedIndices = [];
    favoritesArray.forEach(fav => {
        const hero = state.allHeroes.find(h => `${h.english_name}-${h.costume_id}` === fav);
        if (hero) selectedIndices.push(hero.originalIndex);
    });

    if (selectedIndices.length === 0) return '';

    const maxIndex = Math.max(...selectedIndices);
    const bitLen = maxIndex + 1;
    const bitmap = new Uint8Array(Math.ceil(bitLen / 8));

    selectedIndices.forEach(i => {
        bitmap[Math.floor(i / 8)] |= (1 << (7 - (i % 8)));
    });

    const version = 1;
    const header = new Uint8Array(5);
    header[0] = version;
    new DataView(header.buffer).setUint32(1, bitLen, false); // 大端

    const payload = new Uint8Array(header.length + bitmap.length);
    payload.set(header);
    payload.set(bitmap, header.length);

    const crc = crc32(payload);
    const finalBuffer = new Uint8Array(payload.length + 4);
    finalBuffer.set(payload);
    new DataView(finalBuffer.buffer).setUint32(payload.length, crc, false);

    return base64UrlEncode(finalBuffer);
}

/**
 * 从二进制 Base64 URL 字符串解码为收藏数组
 */
function decodeFavoritesFromBinary(binaryStr) {
    if (!binaryStr) return [];

    try {
        const buffer = base64UrlDecode(binaryStr);
        const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

        if (buffer.length < 9) return [];

        const version = view.getUint8(0);
        const bitLen = view.getUint32(1, false);
        const bitmapLength = Math.ceil(bitLen / 8);
        const expectedLength = 1 + 4 + bitmapLength + 4;

        if (buffer.length !== expectedLength) {
            console.warn('二进制收藏数据长度不匹配');
            return [];
        }

        const payloadLength = 1 + 4 + bitmapLength;
        const payload = new Uint8Array(buffer.buffer, buffer.byteOffset, payloadLength);
        const storedCrc = view.getUint32(payloadLength, false);
        const calculatedCrc = crc32(payload);

        if (storedCrc !== calculatedCrc) {
            console.warn('二进制收藏数据 CRC 校验失败');
            return [];
        }

        const bitmap = new Uint8Array(buffer.buffer, buffer.byteOffset + 5, bitmapLength);
        const selectedIndices = [];

        for (let i = 0; i < bitLen; i++) {
            if (bitmap[Math.floor(i / 8)] & (1 << (7 - (i % 8)))) {
                selectedIndices.push(i);
            }
        }

        const favorites = [];
        selectedIndices.forEach(idx => {
            const hero = state.allHeroes.find(h => h.originalIndex === idx);
            if (hero) favorites.push(`${hero.english_name}-${hero.costume_id}`);
        });

        return favorites;
    } catch (e) {
        console.error('解码二进制收藏失败', e);
        return [];
    }
}