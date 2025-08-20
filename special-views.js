// special-views.js: 管理特殊视图，如通缉任务、材料指南和聊天模拟器。

/**
 * 根据当前历史状态智能地设置主视图的历史记录。
 * 如果当前已在一个主视图中，则替换状态；否则，添加新状态。
 * @param {string} viewName - 要设置的新视图名称 ('wanted', 'farming', 'chat', 'teamSimulator')。
 */
function setMainViewHistory(viewName) {
    const mainViews = ['wanted', 'farming', 'chat', 'teamSimulator', 'lotterySimulator'];
    const currentState = history.state || {};

    if (currentState.view && mainViews.includes(currentState.view)) {
        // 如果当前已在一个主视图中，则替换历史状态
        history.replaceState({ view: viewName }, '');
    } else {
        // 否则（例如首次进入或从弹窗返回），则添加新的历史状态
        history.pushState({ view: viewName }, '');
    }
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
            key === 'season' ? `<th></th>` : `<th><img src="${headers[key]}" alt="${key}" style="height: 32px; vertical-align: middle;"></th>`
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
        const headers = { item: '', s1: 'S1', s2: 'S2', s3: 'S3', s4: 'S4', s5: 'S5', s6: 'S6' };
        const headerKeys = Object.keys(headers);

        let thead = farmingGuideTable.querySelector('thead') || farmingGuideTable.appendChild(document.createElement('thead'));
        thead.innerHTML = '<tr>' + headerKeys.map((key, index) => `<th data-col-index="${index}">${headers[key]}</th>`).join('') + '</tr>';

        let tbody = farmingGuideTable.querySelector('tbody') || farmingGuideTable.appendChild(document.createElement('tbody'));
        tbody.innerHTML = farmingGuideData.map((row, rowIndex) => `<tr data-row-index="${rowIndex}">${headerKeys.map((key, colIndex) => {
            let value = row[key] || '';
            if (key === 'item') return `<td data-col-index="${colIndex}"><img src="imgs/farm/${value}.webp" alt="${value}" class="farm-item-image"></td>`;
            return `<td data-col-index="${colIndex}">${String(value).replace(/\n/g, '<br>')}</td>`;
        }).join('')}</tr>`).join('');

        // 为表格单元格添加高亮事件
        const isMobile = window.innerWidth < 769;
        tbody.addEventListener(isMobile ? 'click' : 'mouseover', event => {
            if (farmingGuideView.classList.contains('hidden')) return;
            const cell = event.target.closest('td');
            if (cell) applyHighlight(cell);
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

    const langDict = i18n[state.currentLang];
    const modalTitle = summaryModal.querySelector('h3');
    if (modalTitle) {
        modalTitle.textContent = langDict.soulExchangeModalTitle;
    }

    scrollContainer.innerHTML = ''; // 清空之前的内容

    // ▼▼▼ 【核心修改】辅助函数增加一个 options 参数，用于控制显示细节 ▼▼▼
    const createSoulExchangeCard = (hero, options = {}) => {
        const card = document.createElement('div');
        card.className = `summary-hero-card ${getColorGlowClass(hero.color)}`;
        card.title = hero.name;

        if (hero.star === 5) {
            card.classList.add('star-5-marquee');
        }

        const avatar = document.createElement('div');
        avatar.className = 'summary-avatar';
        avatar.style.background = getHeroColorLightGradient(hero.color);

        const avatarImage = document.createElement('img');
        avatarImage.className = 'summary-avatar-image';
        avatarImage.src = hero.heroId ? `imgs/hero_icon/${hero.heroId}.webp` : hero.image;
        avatar.appendChild(avatarImage);

        const detailsOverlay = document.createElement('div');
        detailsOverlay.className = 'summary-hero-details'; // 使用新的 class 以便精确控制样式

        let starsContent = '';
        // ▼▼▼ 只有在 options.hideStars 不为 true 时才显示星星 ▼▼▼
        if (!options.hideStars && hero.star) {
            starsContent = `${hero.star}⭐`;
        }

        const starsHTML = starsContent
            ? `<div class="summary-hero-stars star-level-${hero.star}">${starsContent}</div>`
            : '';

        const englishColor = (colorReverseMap[String(hero.color).toLowerCase()] || hero.color || 'default').toLowerCase();
        const colorIconHTML = `<img class="summary-color-icon" src="imgs/colors/${englishColor}.webp">`;

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
        soulExchange.ten,
        soulExchange.fifteen,
        soulExchange.twenty
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