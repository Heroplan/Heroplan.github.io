// special-views.js: 管理特殊视图，如通缉任务、材料指南和聊天模拟器。

/**
 * `?view=` 的**保留字**（地址里写的短名）：命中即当"主视图"处理，没命中才当英雄身份键（`?view=<heroId>` 分享链接）。
 * 短名 → 内部视图名（`history.state.view` 用的那套，也是 `setMainViewHistory` / `applyMainView` 的入参）：
 *   地址要短要好读（`?view=lottery`），内部名沿用既有标志（`lotterySimulator`），两者靠下面这张表换。
 * ⚠ 新增视图要同时改这张表、`applyMainView` 的派发与 `main.js` 的解析。
 *   现有 2121 个 heroId 与这些短名零冲突（heroId 都是 `color_class_name` / `seasonN_xxx` 形态）。
 */
const VIEW_NAME_BY_URL_KEYWORD = {
    wanted: 'wanted',
    farming: 'farming',
    chat: 'chat',
    team: 'teamSimulator',
    lottery: 'lotterySimulator'
};
const VIEW_URL_KEYWORDS = Object.keys(VIEW_NAME_BY_URL_KEYWORD);
const VIEW_URL_KEYWORD_BY_NAME = VIEW_URL_KEYWORDS.reduce((m, k) => { m[VIEW_NAME_BY_URL_KEYWORD[k]] = k; return m; }, {});

/** 地址参数值是不是"主视图"保留字？ */
const isViewUrlKeyword = (v) => typeof v === 'string' && Object.prototype.hasOwnProperty.call(VIEW_NAME_BY_URL_KEYWORD, v);
/** 地址短名 → 内部视图名；不是保留字时返回 null。 */
const viewNameFromUrlParam = (v) => (isViewUrlKeyword(v) ? VIEW_NAME_BY_URL_KEYWORD[v] : null);

/**
 * 生成"只改指定参数、其余参数原样保留"的相对地址（供 pushState/replaceState 用）。
 * 值为 `null`/`''` ⇒ 删掉该参数；值为 `undefined` ⇒ 该参数不动。
 * ⚠ 视图名要换成地址短名再传进来（`VIEW_URL_KEYWORD_BY_NAME`）—— 地址用短名（`?view=lottery`），
 *   内部 `history.state.view` 用长名（`lotterySimulator`）。
 * @param {Object<string, string|null|undefined>} params
 * @returns {string}
 */
function urlWithParams(params) {
    const u = new URL(window.location.href);
    Object.keys(params).forEach(k => {
        const v = params[k];
        if (v === undefined) return;                     // 不动这个参数
        if (v === null || v === '') u.searchParams.delete(k);
        else u.searchParams.set(k, v);
    });
    return u.pathname + u.search + u.hash;
}

/**
 * 根据当前历史状态智能地设置主视图的历史记录**与地址**。
 * 如果当前已在一个主视图中，则替换状态；否则，添加新状态。
 * @param {string} viewName - 要设置的新视图名称 ('wanted', 'farming', 'chat', 'teamSimulator', 'lotterySimulator')。
 */
function setMainViewHistory(viewName) {
    const mainViews = ['wanted', 'farming', 'chat', 'teamSimulator', 'lotterySimulator'];
    const currentState = history.state || {};
    // 切到**别的**视图时把抽奖的子参数 `pool` 一起清掉（留着就是陈旧状态）；
    // 进抽奖本身不能清 —— 抽奖的进入分支会先 `handleActivityClick` 写好 `pool`，再调本函数。
    const poolParam = viewName === 'lotterySimulator'
        ? (new URLSearchParams(window.location.search).get('pool') || null) : null;
    const st = { view: viewName };
    if (poolParam) st.pool = poolParam;              // state 与地址保持一致
    const url = urlWithParams({
        view: VIEW_URL_KEYWORD_BY_NAME[viewName] || null,
        pool: poolParam
    });
    if (currentState.view && mainViews.includes(currentState.view)) {
        history.replaceState(st, '', url);
    } else {
        history.pushState(st, '', url);
    }
}

/**
 * 退出到主列表：把当前那条"视图"历史**原地替换**成列表（绝不 push —— 后退语义要留给浏览器）。
 * 只在用户主动点"退出"的两个分支里调用；`handlePopState` 里不需要（浏览器已把地址恢复好了）。
 */
function clearMainViewHistory() {
    // 退出视图时把它自己的子参数一起清掉（`pool` = 抽奖选中的奖池，见 lottery-simulator.js）
    history.replaceState({ view: 'list' }, '', urlWithParams({ view: null, pool: null }));
}

/**
 * 给两个模拟器"开关"函数收尾用：**只有确实停在列表上**才清地址。
 * ⚠ 必须延一拍再判：跨视图切换（进通缉任务/材料/聊天会先关抽奖，见各 `initAndShow*` 开头）时，
 *   目标视图的 `.hidden`/标志**还没落下**，当场判会误以为"回列表了"而把地址清掉 +
 *   把 `history.state.view` 打成 'list' ⇒ 随后那次 `setMainViewHistory(目标)` 就从 replace 变成 push，
 *   历史栈白多一条、后退语义跟着变。0ms 定时器跑在本次调用栈之后，那时目标视图已经就位。
 */
function syncViewUrlAfterToggle() {
    setTimeout(() => { if (currentMainViewName() === 'list') clearMainViewHistory(); }, 0);
}

/**
 * 当前显示中的主视图名（与 `setMainViewHistory` 用的那套激活标志同源）。
 * @returns {string} 'list' | VIEW_URL_KEYWORDS 之一
 */
function currentMainViewName() {
    if (state.lotterySimulatorActive) return 'lotterySimulator';
    if (state.teamSimulatorActive) return 'teamSimulator';
    const vis = el => el && !el.classList.contains('hidden');
    if (vis(uiElements.wantedMissionView)) return 'wanted';
    if (vis(uiElements.farmingGuideView)) return 'farming';
    if (vis(uiElements.chatSimulatorView)) return 'chat';
    return 'list';
}

/**
 * 打开指定主视图（**只做打开**，历史/地址由调用方或视图函数自己负责）。
 * 冷启动深链接（`main.js`）和浏览器前进后退（`handlePopState`）都走这里，避免两套派发漂移。
 * @param {string} viewName
 */
function applyMainView(viewName) {
    switch (viewName) {
        case 'wanted': initAndShowWantedMissionView(); break;
        case 'farming': initAndShowFarmingGuideView(); break;
        case 'chat': initAndShowChatSimulatorView(); break;
        // 两个模拟器是"开关"语义：只在没开的时候开，别把已开着的关掉
        case 'teamSimulator': if (!state.teamSimulatorActive) toggleTeamSimulator(); break;
        case 'lotterySimulator': if (!state.lotterySimulatorActive) LotterySimulator.toggle(); break;
        default:
            if (currentMainViewName() !== 'list') closeAllMainViews();
    }
}

/**
 * 回到主列表：按激活标志逐个关（复用各自的退出逻辑，不自己摘 `.hidden` ——
 * 队伍/抽奖的退出分支还要清 body class、恢复表头信息、重渲染列表）。
 */
function closeAllMainViews() {
    if (state.teamSimulatorActive) toggleTeamSimulator();
    if (state.lotterySimulatorActive) LotterySimulator.toggle();
    showHeroListViewUI();
}

/**
 * 保存当前活动视图的滚动位置。
 * 在切换视图前调用，以提供更好的用户体验。
 */
function saveCurrentViewScrollPosition() {
    const { heroTableView, wantedMissionView, farmingGuideView, chatSimulatorView, resultsWrapper } = uiElements;

    if (!heroTableView.classList.contains('hidden')) {
        state.scrollPositions.list.top = resultsWrapper.scrollTop;
        state.scrollPositions.list.left = resultsWrapper.scrollLeft;
    } else if (!wantedMissionView.classList.contains('hidden')) {
        state.scrollPositions.wanted.top = resultsWrapper.scrollTop;
        state.scrollPositions.wanted.left = resultsWrapper.scrollLeft;
    } else if (!farmingGuideView.classList.contains('hidden')) {
        state.scrollPositions.farming.top = resultsWrapper.scrollTop;
        state.scrollPositions.farming.left = resultsWrapper.scrollLeft;
    } else if (chatSimulatorView && !chatSimulatorView.classList.contains('hidden')) {
        state.scrollPositions.chat.top = resultsWrapper.scrollTop;
        state.scrollPositions.chat.left = resultsWrapper.scrollLeft;
    }
}

/**
 * 切换回主英雄列表视图，并恢复其滚动位置。
 */
function showHeroListViewUI() {
    saveCurrentViewScrollPosition(); // 保存当前视图的位置
    applyFiltersAndRender(); // 重新应用筛选并渲染英雄列表

    // 显示英雄列表，隐藏其他所有特殊视图
    uiElements.heroTableView.classList.remove('hidden');
    uiElements.wantedMissionView.classList.add('hidden');
    uiElements.farmingGuideView.classList.add('hidden');
    if (uiElements.chatSimulatorView) uiElements.chatSimulatorView.classList.add('hidden');
    if (uiElements.lotterySimulatorWrapper) uiElements.lotterySimulatorWrapper.classList.add('hidden');

    // 恢复英雄列表的滚动位置
    uiElements.resultsWrapper.scrollTop = state.scrollPositions.list.top;
    uiElements.resultsWrapper.scrollLeft = state.scrollPositions.list.left;

    // 停在列表 ⇒ 地址不该再留着 `?view=<某个视图>`（刷新会又跳回那个视图）。
    //   ⚠ 这里只能 replace：本函数也是 `handlePopState` 的后退目的地，push 会破坏后退。
    clearMainViewHistory();

    updateResultsHeader(); // 更新结果头部信息
}

/**
 * 初始化并显示通缉任务视图。
 * 如果表格尚未创建，则动态生成。
 */
function initAndShowWantedMissionView() {
    // 如果当前在抽奖模拟器中，先退出
    if (state.lotterySimulatorActive) LotterySimulator.toggle();
    // 如果当前在队伍模拟器中，先退出
    if (state.teamSimulatorActive) toggleTeamSimulator();
    if (uiElements.chatSimulatorView) uiElements.chatSimulatorView.classList.add('hidden');
    saveCurrentViewScrollPosition();

    const { wantedMissionTable, heroTableView, farmingGuideView, wantedMissionView, resultsWrapper, resultsCountEl } = uiElements;

    // 检查表格是否已渲染，如果没有则只渲染一次
    if (wantedMissionTable.innerHTML.trim() === '') {
        const headers = {
            season: '', daily: 'imgs/farm/wanted_normal.webp', red: 'imgs/farm/wanted_red.webp',
            green: 'imgs/farm/wanted_green.webp', blue: 'imgs/farm/wanted_blue.webp',
            purple: 'imgs/farm/wanted_purple.webp', yellow: 'imgs/farm/wanted_yellow.webp'
        };
        // 创建表头
        let thead = wantedMissionTable.querySelector('thead') || wantedMissionTable.appendChild(document.createElement('thead'));
        thead.innerHTML = '<tr>' + Object.keys(headers).map(key =>
            key === 'season' ? `<th></th>` : `<th><img loading="lazy" src="${headers[key]}" decoding="async" alt="${key}" style="height: 32px; vertical-align: middle;"></th>`
        ).join('') + '</tr>';

        // 创建表格内容
        let tbody = wantedMissionTable.querySelector('tbody') || wantedMissionTable.appendChild(document.createElement('tbody'));
        tbody.innerHTML = wantedMissionData.map(row => `<tr>${Object.keys(headers).map(key => {
            const value = row[key];
            const colorMap = { red: 'var(--hero-color-red)', green: 'var(--hero-color-green)', blue: 'var(--hero-color-blue)', purple: 'var(--hero-color-purple)', yellow: 'var(--hero-color-yellow)' };
            const style = colorMap[key] ? `style="color: ${colorMap[key]}; font-weight: bold;"` : '';
            return `<td ${style}>${Array.isArray(value) ? value.join('<br>') : value}</td>`;
        }).join('')}</tr>`).join('');
    }

    // 切换视图的可见性
    heroTableView.classList.add('hidden');
    farmingGuideView.classList.add('hidden');
    wantedMissionView.classList.remove('hidden');

    // 恢复此视图的滚动位置
    resultsWrapper.scrollTop = state.scrollPositions.wanted.top;
    resultsWrapper.scrollLeft = state.scrollPositions.wanted.left;

    // 更新结果头部
    const langDict = i18n[state.currentLang];
    resultsCountEl.innerHTML = `<span>${langDict.wantedMissionTableTitle}</span>`;
    const returnTag = document.createElement('span');
    returnTag.className = 'reset-tag';
    returnTag.textContent = langDict.returnToList;
    returnTag.onclick = () => { history.back(); };
    resultsCountEl.appendChild(returnTag);

    setTimeout(adjustStickyHeaders, 0);
    // 更新浏览器历史记录，以便后退按钮可以返回列表视图
    setMainViewHistory('wanted');
}

/**
 * 初始化并显示材料出处指南视图。
 */
function initAndShowFarmingGuideView() {
    if (state.lotterySimulatorActive) LotterySimulator.toggle();
    if (state.teamSimulatorActive) toggleTeamSimulator();
    if (uiElements.chatSimulatorView) uiElements.chatSimulatorView.classList.add('hidden');
    saveCurrentViewScrollPosition();

    const { farmingGuideTable, heroTableView, wantedMissionView, farmingGuideView, resultsWrapper, resultsCountEl } = uiElements;

    // 只在首次点击时渲染表格
    if (farmingGuideTable.innerHTML.trim() === '') {
        const headers = { item: '', s1: 'S1', s2: 'S2', s3: 'S3', s4: 'S4', s5: 'S5', s6: 'UT1' };
        const headerKeys = Object.keys(headers);

        let thead = farmingGuideTable.querySelector('thead') || farmingGuideTable.appendChild(document.createElement('thead'));
        thead.innerHTML = '<tr>' + headerKeys.map((key, index) => `<th data-col-index="${index}">${headers[key]}</th>`).join('') + '</tr>';

        let tbody = farmingGuideTable.querySelector('tbody') || farmingGuideTable.appendChild(document.createElement('tbody'));
        tbody.innerHTML = farmingGuideData.map((row, rowIndex) => {
            const isSecondRow = rowIndex === 0; // 第二行（索引为0）

            return `<tr data-row-index="${rowIndex}">${headerKeys.map((key, colIndex) => {
                let value = row[key] || '';

                if (key === 'item') {
                    // 修复：恢复第一列物品图标的渲染
                    if (value) {
                        return `<td data-col-index="${colIndex}"><img loading="lazy" src="imgs/farm/${value}.webp" decoding="async" alt="${value}" class="farm-item-image"></td>`;
                        return `<td data-col-index="${colIndex}">${String(value).replace(/\n/g, '<br>')}</td>`;
                    }
                    return `<td data-col-index="${colIndex}"></td>`;
                }

                // 为第二行的非第一列添加点击事件
                if (isSecondRow && key !== 'item') {
                    const fileName = String(value).replace(/\n/g, '');
                    return `<td data-col-index="${colIndex}" class="clickable-avatar-mission" data-filename="${fileName}" style="cursor: pointer; text-decoration: underline; color: blue;">${String(value).replace(/\n/g, '<br>')}</td>`;
                }

                return `<td data-col-index="${colIndex}">${String(value).replace(/\n/g, '<br>')}</td>`;
            }).join('')}</tr>`;
        }).join('');

        // 添加点击事件监听器
        tbody.addEventListener('click', event => {
            if (farmingGuideView.classList.contains('hidden')) return;

            const target = event.target.closest('.clickable-avatar-mission');
            if (target) {
                const fileName = target.dataset.filename;
                if (fileName) {
                    // 在新标签页打开对应的webp文件
                    window.open(`imgs/avatar_mission/${fileName}.webp`, '_blank');
                }
                event.stopPropagation(); // 更可靠地阻止事件冒泡
                return;
            }

            // 原有的高亮逻辑保持不变
            const cell = event.target.closest('td');
            if (cell) applyHighlight(cell);
        });

        // 为表格单元格添加高亮事件
        const isMobile = window.innerWidth < 769;
        tbody.addEventListener(isMobile ? 'click' : 'mouseover', event => {
            if (farmingGuideView.classList.contains('hidden')) return;
            const cell = event.target.closest('td');
            if (cell && !cell.classList.contains('clickable-avatar-mission')) {
                applyHighlight(cell);
            }
        });
        if (!isMobile) {
            tbody.addEventListener('mouseout', clearFarmGuideHighlight);
        }
    }

    // 切换视图可见性
    heroTableView.classList.add('hidden');
    wantedMissionView.classList.add('hidden');
    farmingGuideView.classList.remove('hidden');

    // 恢复滚动位置
    resultsWrapper.scrollTop = state.scrollPositions.farming.top;
    resultsWrapper.scrollLeft = state.scrollPositions.farming.left;

    // 更新头部信息
    const langDict = i18n[state.currentLang];
    resultsCountEl.innerHTML = `<span>${langDict.farmingGuideTableTitle}</span>`;
    const returnTag = document.createElement('span');
    returnTag.className = 'reset-tag';
    returnTag.textContent = langDict.returnToList;
    returnTag.onclick = () => { history.back(); };
    resultsCountEl.appendChild(returnTag);

    setTimeout(adjustStickyHeaders, 0);
    setMainViewHistory('farming');
}

/**
 * 为材料指南表格应用高亮效果。
 * @param {HTMLElement} cell - 被悬停或点击的单元格。
 */
function applyHighlight(cell) {
    if (uiElements.farmingGuideView.classList.contains('hidden') || !cell) return;
    clearFarmGuideHighlight();
    const row = cell.parentElement;
    const table = cell.closest('table');
    const colIndex = cell.dataset.colIndex;
    if (!table || !colIndex) return;

    cell.classList.add('highlight-cell');
    const header = table.querySelector(`thead th[data-col-index="${colIndex}"]`);
    if (header) header.classList.add('highlight-axis');
    const rowLabel = row.querySelector('td:first-child');
    if (rowLabel) rowLabel.classList.add('highlight-axis');
}

/**
 * 清除材料指南表格的所有高亮效果。
 */
function clearFarmGuideHighlight() {
    if (uiElements.farmingGuideView.classList.contains('hidden')) return;
    uiElements.farmingGuideView.querySelectorAll('.highlight-axis, .highlight-cell').forEach(el => {
        el.classList.remove('highlight-axis', 'highlight-cell');
    });
}

/**
 * 初始化并显示聊天模拟器视图。
 */
function initAndShowChatSimulatorView() {
    if (state.lotterySimulatorActive) LotterySimulator.toggle();
    if (state.teamSimulatorActive) toggleTeamSimulator();
    saveCurrentViewScrollPosition();

    // 切换视图可见性
    uiElements.heroTableView.classList.add('hidden');
    uiElements.wantedMissionView.classList.add('hidden');
    uiElements.farmingGuideView.classList.add('hidden');
    uiElements.chatSimulatorView.classList.remove('hidden');

    // 恢复滚动位置
    uiElements.resultsWrapper.scrollTop = state.scrollPositions.chat.top;
    uiElements.resultsWrapper.scrollLeft = state.scrollPositions.chat.left;

    // 更新头部
    const langDict = i18n[state.currentLang];
    uiElements.resultsCountEl.innerHTML = `<span>${langDict.chatSimulatorTitle || '聊天模拟器'}</span>`;
    const returnTag = document.createElement('span');
    returnTag.className = 'reset-tag';
    returnTag.textContent = langDict.returnToList;
    returnTag.onclick = () => { history.back(); };
    uiElements.resultsCountEl.appendChild(returnTag);

    setTimeout(adjustStickyHeaders, 0);
    setMainViewHistory('chat');
}

/**
 * 显示灵魂兑换英雄列表的模态框
 */

function showSoulExchangeModal() {

    const overlay = uiElements.summonSummaryModalOverlay;
    const summaryModal = uiElements.summonSummaryModal;
    // 直接通过ID获取，确保稳健性
    const scrollContainer = document.getElementById('summon-summary-scroll-container');
    if (!overlay || !summaryModal || !scrollContainer) {
        return;
    }
    summaryModal.classList.remove('single-pull-result-view', 'summon-result-view');
    summaryModal.classList.add('soul-exchange-view');


    const langDict = i18n[state.currentLang];
    const modalTitle = summaryModal.querySelector('h3');
    if (modalTitle) {
        modalTitle.textContent = langDict.soulExchangeModalTitle;
    }

    scrollContainer.innerHTML = ''; // 清空之前的内容

    // ▼▼▼ 辅助函数增加一个 options 参数，用于控制显示细节 ▼▼▼
    const createSoulExchangeCard = (hero, options = {}) => {
        const card = document.createElement('div');
        card.className = `summary-hero-card ${getColorGlowClass(hero.elementId)}`;
        card.title = hero.name;

        if (hero.rarity === 5) {
            card.classList.add('star-5-marquee');
        }

        const avatar = document.createElement('div');
        avatar.className = 'summary-avatar';
        avatar.style.background = getHeroColorLightGradient(hero.elementId);

        const avatarImage = document.createElement('img');
        avatarImage.className = 'summary-avatar-image';
        avatarImage.src = hero.heroId ? `imgs/hero_icon/${hero.heroId}.webp` : hero.image;
        avatar.appendChild(avatarImage);

        const detailsOverlay = document.createElement('div');
        detailsOverlay.className = 'summary-hero-details'; // 使用新的 class 以便精确控制样式

        let starsContent = '';
        // ▼▼▼ 只有在 options.hideStars 不为 true 时才显示星星 ▼▼▼
        if (!options.hideStars && hero.rarity) {
            starsContent = `${hero.rarity}⭐`;
        }

        const starsHTML = starsContent
            ? `<div class="summary-hero-stars star-level-${hero.rarity}">${starsContent}</div>`
            : '';

        const colorIcon = String(hero.elementId || 'default').toLowerCase();
        const colorIconHTML = `<img loading="lazy" class="summary-color-icon" src="imgs/element/${colorIcon}.webp" decoding="async">`;

        detailsOverlay.innerHTML = `${colorIconHTML}${starsHTML}`;

        card.appendChild(avatar);
        card.appendChild(detailsOverlay);

        if (hero.type !== 'trainer' && hero.originalIndex !== undefined) {
            const targetHero = state.allHeroes.find(h => h.originalIndex === hero.originalIndex);
            if (targetHero) {
                card.classList.add('is-clickable');
                card.addEventListener('click', () => {
                    summaryModal.classList.add('hidden');
                    overlay.classList.add('hidden');
                    openDetailsModal(targetHero, {
                        onClose: () => {
                            summaryModal.classList.remove('hidden');
                            overlay.classList.remove('hidden');
                            document.body.classList.add('modal-open');
                        }
                    });
                });
            }
        }
        return card;
    };

    // ▼▼▼ 手动构建每个分组并在之间添加分隔线 ▼▼▼
    const allGroups = [
        soulExchange.five,
        soulExchange.fifteen,
        soulExchange.thirty
    ];

    allGroups.forEach((heroIds, index) => {
        // 在第二个和第三个分组前添加分隔线
        if (index > 0) {
            const separator = document.createElement('hr');
            separator.className = 'soul-exchange-separator';
            scrollContainer.appendChild(separator);
        }

        const heroesContainer = document.createElement('div');
        heroesContainer.className = 'soul-exchange-heroes-container';

        heroIds.forEach(id => {
            const hero = state.heroesByIdMap.get(id);
            if (hero) {
                // 调用卡片创建函数，并传入 hideStars: true 选项
                const card = createSoulExchangeCard(hero, { hideStars: true });
                heroesContainer.appendChild(card);
            }
        });

        scrollContainer.appendChild(heroesContainer);
    });

    // 显示弹窗的逻辑保持不变
    setTimeout(() => { scrollContainer.scrollTop = 0; }, 0);
    summaryModal.classList.remove('hidden');
    overlay.classList.remove('hidden');
    document.body.classList.add('modal-open');
    history.pushState({ modal: 'summonSummary' }, null);
    state.modalStack.push('summonSummary');
}