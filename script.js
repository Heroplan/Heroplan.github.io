document.addEventListener('DOMContentLoaded', function () {
    // --- 全局變量 ---
    let filteredHeroes = [];
    let allHeroes = [];
    let families_bonus = [];
    let family_values = {};
    let currentLang = 'cn';
    let currentSort = { key: 'power', direction: 'desc' };
    const speedOrder_cn = ['充能', '魔法', '冥河', '飞速', '快速', '潮汐', '中等', '杀手', '慢', '非常慢'];
    const speedOrder_tc = ['充能', '魔法', '冥河', '飛速', '快速', '潮汐', '中等', '殺手', '慢速', '非常慢'];


    // --- DOM 元素 ---
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const langToggleButton = document.getElementById('lang-toggle-btn');
    const resultsWrapper = document.getElementById('results-wrapper');
    const resultsTable = resultsWrapper ? resultsWrapper.querySelector('.manual-table') : null;
    const resultsCountEl = document.getElementById('results-count');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    const modal = document.getElementById('modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    const openFiltersBtn = document.getElementById('open-filters-btn');
    const filtersModal = document.getElementById('filters-modal');
    const filtersModalOverlay = document.getElementById('filters-modal-overlay');
    const closeFiltersModalBtn = document.getElementById('close-filters-modal-btn');
    const pageLoader = document.getElementById('page-loader-overlay');
    const filterInputs = {
        name: document.getElementById('name-input'), star: document.getElementById('star-select'),
        color: document.getElementById('color-select'), speed: document.getElementById('speed-select'),
        class: document.getElementById('class-select'), family: document.getElementById('family-select'),
        source: document.getElementById('source-select'),
        aetherpower: document.getElementById('aetherpower-select'),
        types: document.getElementById('type-input'),
        effects: document.getElementById('effects-input'), passives: document.getElementById('passives-input'),
        power: document.getElementById('power-input'), attack: document.getElementById('attack-input'),
        defense: document.getElementById('defense-input'), health: document.getElementById('health-input'),
        releaseDateType: document.getElementById('release-date-type'),
        releaseDateInput: document.getElementById('release-date-input'),
    };

    // --- 語言和文本管理 ---
    const i18n = {
        cn: {
            pageTitle: "Heroplan 浏览器", headerTitle: "Heroplan浏览器", poweredBy: "由", driven: "驱动",
            sponsoredBy: "独家赞助", translatedBy: "译者制作", footerInfo: "英雄数据持续更新 | 简繁体中文版",
            filterHeroes: "筛选英雄", standardFilters: "标准筛选", nameLabel: "名称:", avatarLabel: "头像", namePlaceholder: "输入英雄名称",
            starLabel: "星级:", colorLabel: "颜色:", speedLabel: "法速:", classLabel: "职业:", familyLabel: "家族:",
            sourceLabel: "起源:", aetherPowerLabel: "以太力量:", advancedFilters: "高级筛选",
            skillTypeLabel: "特殊技能类别:", skillTypePlaceholder: "例如：增益,异常,治疗", skillTextLabel: "特殊技能文本:",
            passiveSkillLabel: "被动技能文本:", filterBy: "筛选:", all: "全部", hero: "英雄", skin: "服装",
            daysSinceRelease: "距离发布日期天数大于:", daysPlaceholder: "1年半548 2年730", minPower: "最低战力",
            minAttack: "最低攻击", minDefense: "最低防御", minHealth: "最低生命", resetFilters: "重置筛选",
            footerGameName: "《帝国与谜题》", footerPlatform: "英雄数据查询平台",
            footerCredit: "© 2025 heroplan.github.io | 非官方资料站",
            resultsCountText: (count) => `筛选列表中有 ${count} 位英雄`, noResults: "没有找到匹配的英雄", modalHeroDetails: "ℹ️ 英雄详情",
            closeBtnTitle: "关闭", modalOrigin: "起源", modalCoreStats: "📊 核心属性", modalSkillDetails: "📖 技能详情",
            modalSkillName: "📄 名称:", modalSpeed: "⌛ 法速:", modalSkillType: "🏷️ 技能类型:",
            modalSpecialSkill: "✨ 特殊技能:", modalPassiveSkill: "🧿 被动技能:",
            modalFamilyBonus: (family) => `👪 家族加成 (${family}):`, modalSkin: "服装:", none: "无", detailsCloseBtn: "关闭",
        },
        tc: {
            pageTitle: "Heroplan 瀏覽器", headerTitle: "Heroplan瀏覽器", poweredBy: "由", driven: "驅動",
            sponsoredBy: "獨家贊助", translatedBy: "譯者製作", footerInfo: "英雄數據持續更新 | 簡繁中文版",
            filterHeroes: "篩選英雄", standardFilters: "標準篩選", nameLabel: "名稱:", avatarLabel: "頭像", namePlaceholder: "輸入英雄名稱",
            starLabel: "星級:", colorLabel: "顏色:", speedLabel: "法速:", classLabel: "職業:", familyLabel: "家族:",
            sourceLabel: "起源:", aetherPowerLabel: "以太力量:", advancedFilters: "高級篩選",
            skillTypeLabel: "特殊技能類別:", skillTypePlaceholder: "例如：增益,異常,治療", skillTextLabel: "特殊技能文本:",
            passiveSkillLabel: "被動技能文本:", filterBy: "篩選:", all: "全部", hero: "英雄", skin: "服裝",
            daysSinceRelease: "距離發佈日期天數大於:", daysPlaceholder: "1年半548 2年730", minPower: "最低戰力",
            minAttack: "最低攻擊", minDefense: "最低防禦", minHealth: "最低生命", resetFilters: "重置篩選",
            footerGameName: "《帝國與謎題》", footerPlatform: "英雄數據查詢平台",
            footerCredit: "© 2025 heroplan.github.io | 非官方資料站",
            resultsCountText: (count) => `篩選清單中有 ${count} 位英雄`, noResults: "沒有找到匹配的英雄", modalHeroDetails: "ℹ️ 英雄詳情",
            closeBtnTitle: "關閉", modalOrigin: "起源", modalCoreStats: "📊 核心屬性", modalSkillDetails: "📖 技能詳情",
            modalSkillName: "📄 名稱:", modalSpeed: "⌛ 法速:", modalSkillType: "🏷️ 技能類型:",
            modalSpecialSkill: "✨ 特殊技能:", modalPassiveSkill: "🧿 被動技能:",
            modalFamilyBonus: (family) => `👪 家族加成 (${family}):`, modalSkin: "服裝:", none: "無", detailsCloseBtn: "關閉",
        }
    };

    function applyLanguage(lang) {
        document.documentElement.lang = lang === 'cn' ? 'zh-CN' : 'zh-TW';
        document.body.setAttribute('data-lang', lang);
        currentLang = lang;
        document.querySelectorAll('[data-lang-key]').forEach(el => {
            const key = el.getAttribute('data-lang-key');
            if (i18n[lang][key]) { el.textContent = i18n[lang][key]; }
        });
        document.querySelectorAll('[data-lang-key-placeholder]').forEach(el => {
            const key = el.getAttribute('data-lang-key-placeholder');
            if (i18n[lang][key]) { el.placeholder = i18n[lang][key]; }
        });
    }

    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            let date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
    }

    function getCookie(name) {
        let nameEQ = name + "=";
        let ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // --- 主題管理 ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark-theme');
        } else {
            document.documentElement.classList.remove('dark-theme');
        }
    }

    function toggleTheme() {
        const isDark = document.documentElement.classList.contains('dark-theme');
        const newTheme = isDark ? 'light' : 'dark';
        applyTheme(newTheme);
        setCookie('theme', newTheme, 365);
    }

    // --- 語言切換 ---
    function toggleLanguage() {
        const newLang = currentLang === 'cn' ? 'tc' : 'cn';
        setCookie('language', newLang, 365);
        window.location.reload();
    }

    function initializeLanguage() {
        const savedLang = getCookie('language') || 'cn';
        applyLanguage(savedLang);
    }

    // --- 数据加载方式更新 ---
    async function loadData(lang) {
        try {
            const response = await fetch(`./data_${lang}.json?v=${new Date().getTime()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            allHeroes = data.allHeroes;
            families_bonus = data.families_bonus;
            family_values = data.family_values;

            if (!allHeroes || !families_bonus || !family_values) {
                throw new Error("一个或多个数据键在JSON文件中缺失。");
            }
            return true;
        } catch (error) {
            console.error("加载或解析数据文件失败:", error);
            if (resultsWrapper) resultsWrapper.innerHTML = `<p style='color: var(--md-sys-color-error); font-weight: bold;'>错误: 数据加载失败，请检查控制台获取详情。</p>`;
            if (pageLoader) pageLoader.classList.add('hidden');
            return false;
        }
    }

    function adjustStickyHeaders() {
        const resultsHeader = document.querySelector('.results-header');
        const tableThead = document.querySelector('.manual-table > thead');

        if (resultsHeader && tableThead) {
            const headerHeight = resultsHeader.offsetHeight;
            tableThead.style.top = `${headerHeight - 1}px`;
        }
    }

    const getColorGlowClass = (colorName) => {
        switch (String(colorName).toLowerCase()) {
            case '红色': case '紅色': return 'red-glow-border';
            case '蓝色': case '藍色': return 'blue-glow-border';
            case '绿色': case '綠色': return 'green-glow-border';
            case '黄色': case '黃色': return 'yellow-glow-border';
            case '紫色': case '紫色': return 'purple-glow-border';
            case '白色': case '白色': return 'white-glow-border';
            case '黑色': case '黑色': return 'black-glow-border';
            default: return '';
        }
    };

    const getColorHex = (colorName) => {
        switch (String(colorName).toLowerCase()) {
            case '红色': case '紅色': return '#ff7a4c';
            case '蓝色': case '藍色': return '#41d8fe';
            case '绿色': case '綠色': return '#70e92f';
            case '黄色': case '黃色': return '#f2e33a';
            case '紫色': case '紫色': return '#e290ff';
            default: return 'inherit';
        }
    };

    function populateFilters() {
        const CUSTOM_SORT_CN = {
            'speed': ['充能', '魔法', '冥河', '飞速', '快速', '潮汐', '中等', '杀手', '慢', '非常慢'],
            'star': ['5', '4', '3', '2', '1'],
        };
        const CUSTOM_SORT_TC = {
            'speed': ['充能', '魔法', '冥河', '飛速', '快速', '潮汐', '中等', '殺手', '慢速', '非常慢'],
            'star': ['5', '4', '3', '2', '1'],
        };
        const CUSTOM_SORT = currentLang === 'cn' ? CUSTOM_SORT_CN : CUSTOM_SORT_TC;
        const getSortedValues = (key, values) => {
            values = values.map(v => String(v || ''));
            const locale = currentLang === 'cn' ? 'zh-CN' : 'zh-TW';
            if (key === 'family' || key === 'source') {
                const translatedValues = values.map(v => ({
                    original: v,
                    translated: family_values[v.toLowerCase()] || v
                }));
                return translatedValues.sort((a, b) => a.translated.localeCompare(b.translated, locale)).map(item => item.original);
            }
            if (key === 'AetherPower') { return values.sort((a, b) => a.localeCompare(b, locale)); }
            if (CUSTOM_SORT[key]) {
                return CUSTOM_SORT[key].filter(v => values.includes(String(v))).concat(values.filter(v => !CUSTOM_SORT[key].includes(String(v))).sort());
            }
            return values.sort((a, b) => a.localeCompare(b, locale));
        };
        const createOptions = (values, key) => {
            const sortedValues = getSortedValues(key, values);
            const options = [`<option value="无">${i18n[currentLang].none}</option>`, ...sortedValues.map(opt => {
                const displayText = (key === 'family' || key === 'source') ? (family_values[String(opt).toLowerCase()] || opt) : opt;
                return `<option value="${opt}">${displayText}</option>`;
            })];
            return options.join('');
        };
        const initFilter = (key, dataKey) => {
            const heroDataKey = key === 'aetherpower' ? 'AetherPower' : key;
            const uniqueValues = [...new Set(allHeroes.map(h => h[heroDataKey]).filter(v => v != null && v !== ''))];
            filterInputs[key].innerHTML = createOptions(uniqueValues, heroDataKey);
        };
        initFilter('star');
        initFilter('color');
        initFilter('speed');
        initFilter('class');
        initFilter('family');
        initFilter('source');
        initFilter('aetherpower', 'AetherPower');
        document.querySelectorAll('.filter-card select').forEach(select => { select.style.textAlign = 'center'; });
    }

    function openDetailsModal(hero) {
        renderDetailsInModal(hero);
        modal.classList.remove('hidden');
        modalOverlay.classList.remove('hidden');
        document.body.classList.add('modal-open');
        modal.scrollTop = 0;
        history.pushState({ modal: 'details' }, null);
    }
    function closeDetailsModal() { if (!modal.classList.contains('hidden')) { history.back(); } }
    function openFiltersModal() {
        filtersModal.classList.remove('hidden');
        filtersModalOverlay.classList.remove('hidden');
        document.body.classList.add('modal-open');
        history.pushState({ modal: 'filters' }, null);
    }
    function closeFiltersModal() { if (!filtersModal.classList.contains('hidden')) { history.back(); } }
    function loadFilterStates() {
        const filterSections = [
            { contentId: 'standard-filters-content', button: document.querySelector('#standard-filters-header .toggle-button') },
            { contentId: 'advanced-filters-content', button: document.querySelector('#advanced-filters-header .toggle-button') }
        ];
        filterSections.forEach(section => {
            if (!section.contentId || !section.button) return;
            const contentElement = document.getElementById(section.contentId);
            const savedState = getCookie(section.contentId + '_state');
            if (savedState === 'expanded') {
                contentElement.classList.remove('collapsed');
                section.button.classList.add('expanded');
            } else {
                contentElement.classList.add('collapsed');
                section.button.classList.remove('expanded');
            }
        });
    }

    function applyFiltersAndRender() {
        const filters = Object.fromEntries(Object.entries(filterInputs).map(([key, el]) => [key, el.value.toLowerCase()]));
        const noneValue = i18n[currentLang].none.toLowerCase();
        const containsAllKeywords = (text, keywords) => {
            if (!text) return false;
            text = String(text).toLowerCase();
            return keywords.every(keyword => text.includes(keyword));
        };
        filteredHeroes = allHeroes.filter(hero => {
            if (filters.name) {
                const keywords = filters.name.split(' ').filter(k => k);
                if (keywords.length > 0 && !containsAllKeywords(hero.name, keywords)) return false;
            }
            if (filters.effects) {
                const keywords = filters.effects.split(' ').filter(k => k);
                const heroEffectsCombined = (hero.effects && Array.isArray(hero.effects)) ? hero.effects.join(' ') : '';
                if (keywords.length > 0 && !containsAllKeywords(heroEffectsCombined, keywords)) return false;
            }
            if (filters.passives) {
                const keywords = filters.passives.split(' ').filter(k => k);
                const heroPassivesCombined = (hero.passives && Array.isArray(hero.passives)) ? hero.passives.join(' ') : '';
                if (keywords.length > 0 && !containsAllKeywords(heroPassivesCombined, keywords)) return false;
            }
            if (filters.types) {
                const keywords = filters.types.split(' ').filter(k => k);
                const heroTypesCombined = (hero.types && Array.isArray(hero.types)) ? hero.types.join(' ') : '';
                if (keywords.length > 0 && !containsAllKeywords(heroTypesCombined, keywords)) return false;
            }
            if (filters.star !== '无' && filters.star !== noneValue && String(hero.star) !== filters.star) return false;
            if (filters.color !== '无' && filters.color !== noneValue && String(hero.color).toLowerCase() !== filters.color) return false;
            if (filters.speed !== '无' && filters.speed !== noneValue && String(hero.speed).toLowerCase() !== filters.speed) return false;
            if (filters.class !== '无' && filters.class !== noneValue && String(hero.class).toLowerCase() !== filters.class) return false;
            if (filters.family !== '无' && filters.family !== noneValue && String(hero.family).toLowerCase() !== filters.family) return false;
            if (filters.source !== '无' && filters.source !== noneValue && String(hero.source).toLowerCase() !== filters.source) return false;
            if (filters.aetherpower !== '无' && filters.aetherpower !== noneValue && String(hero.AetherPower).toLowerCase() !== filters.aetherpower) return false;
            const releaseDateType = filters.releaseDateType;
            const releaseDateDays = Number(filters.releaseDateInput);
            const isSkin = hero.costume_id !== 0;
            if (releaseDateType === 'hero' && isSkin) return false;
            if (releaseDateType === 'skin' && !isSkin) return false;
            if (releaseDateDays > 0) {
                if (!hero['Release date']) return false;
                const releaseDate = new Date(hero['Release date']);
                if (isNaN(releaseDate.getTime())) return false;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                releaseDate.setHours(0, 0, 0, 0);
                const diffTime = today - releaseDate;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays < releaseDateDays) return false;
            }
            if (Number(filters.power) > 0 && Number(hero.power) < Number(filters.power)) return false;
            if (Number(filters.attack) > 0 && Number(hero.attack) < Number(filters.attack)) return false;
            if (Number(filters.defense) > 0 && Number(hero.defense) < Number(filters.defense)) return false;
            if (Number(filters.health) > 0 && Number(hero.health) < Number(filters.health)) return false;
            return true;
        });

        filteredHeroes.sort((a, b) => {
            const key = currentSort.key;
            const direction = currentSort.direction === 'asc' ? 1 : -1;
            let valA = a[key];
            let valB = b[key];

            let comparison = 0;
            const numericKeys = ['star', 'power', 'attack', 'defense', 'health'];

            if (key === 'speed') {
                const speedOrder = currentLang === 'cn' ? speedOrder_cn : speedOrder_tc;
                const indexA = speedOrder.indexOf(String(valA));
                const indexB = speedOrder.indexOf(String(valB));
                const finalIndexA = indexA === -1 ? Infinity : indexA;
                const finalIndexB = indexB === -1 ? Infinity : indexB;
                comparison = finalIndexA - finalIndexB;
            } else if (numericKeys.includes(key)) {
                comparison = (Number(valA) || 0) - (Number(valB) || 0);
            } else {
                valA = String(valA || '');
                valB = String(valB || '');
                if (currentLang === 'tc') {
                    comparison = valA.localeCompare(valB, 'zh-TW', { collation: 'stroke' });
                } else {
                    comparison = valA.localeCompare(valB, 'zh-CN');
                }
            }

            comparison *= direction;

            if (comparison === 0 && key !== 'power') {
                return (Number(b.power) || 0) - (Number(a.power) || 0);
            }

            return comparison;
        });

        renderTable(filteredHeroes);
    }

    function renderTable(heroes) {
        if (!resultsTable) return;
        if (resultsCountEl) {
            resultsCountEl.textContent = i18n[currentLang].resultsCountText(heroes.length);
        }

        const headers = {
            image: i18n[currentLang].avatarLabel,
            name: i18n[currentLang].nameLabel.slice(0, -1),
            color: i18n[currentLang].colorLabel.slice(0, -1),
            star: i18n[currentLang].starLabel.slice(0, -1),
            class: i18n[currentLang].classLabel.slice(0, -1),
            speed: i18n[currentLang].speedLabel.slice(0, -1),
            power: i18n[currentLang].minPower.substring(2),
            attack: i18n[currentLang].minAttack.substring(2),
            defense: i18n[currentLang].minDefense.substring(2),
            health: i18n[currentLang].minHealth.substring(2),
            types: i18n[currentLang].skillTypeLabel.slice(0, -1)
        };
        const colKeys = Object.keys(headers);
        const sortableKeys = ['name', 'color', 'star', 'class', 'speed', 'power', 'attack', 'defense', 'health'];

        let thead = resultsTable.querySelector('thead');
        if (!thead) {
            thead = document.createElement('thead');
            resultsTable.appendChild(thead);
        }
        thead.innerHTML = '<tr>' + colKeys.map(key => {
            const isSortable = sortableKeys.includes(key);
            let sortIndicator = '';
            if (isSortable && currentSort.key === key) {
                sortIndicator = currentSort.direction === 'asc' ? '▲' : '▼';
            }
            const headerText = headers[key];
            return `<th class="col-${key} ${isSortable ? 'sortable' : ''}" data-sort-key="${key}">
                        ${headerText}
                        <span class="sort-indicator">${sortIndicator}</span>
                    </th>`;
        }).join('') + '</tr>';

        let tbody = resultsTable.querySelector('tbody');
        if (!tbody) {
            tbody = document.createElement('tbody');
            resultsTable.appendChild(tbody);
        }

        if (heroes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${colKeys.length}" class="empty-results-message">${i18n[currentLang].noResults}</td></tr>`;
            return;
        }

        const rowsHTML = heroes.map(hero => {
            const cellsHTML = colKeys.map(key => {
                let content = hero[key] || '';
                if (key === 'image') {
                    const heroColorClass = getColorGlowClass(hero.color);
                    return `<td class="col-image"><img src="${getLocalImagePath(hero.image)}" class="hero-image ${heroColorClass}" alt="${hero.name}" loading="lazy"></td>`;
                }
                if (key === 'color') {
                    const colorHex = getColorHex(content);
                    return `<td class="col-color"><span class="color-text-outlined" style="color: ${colorHex}; font-weight: bold;">${content}</span></td>`;
                }
                if (key === 'family' && content) {
                    content = family_values[String(content).toLowerCase()] || content;
                }
                if (Array.isArray(content)) content = content.join(', ');
                return `<td class="col-${key}">${content}</td>`;
            }).join('');
            return `<tr class="table-row" data-hero-id="${hero.originalIndex}">${cellsHTML}</tr>`;
        }).join('');

        tbody.innerHTML = rowsHTML;

        if (resultsWrapper) {
            resultsWrapper.scrollTop = 0;
        }
    }

    function getLocalImagePath(url) {
        if (!url || typeof url !== 'string') return '';
        try {
            const filename = url.substring(url.lastIndexOf('/') + 1).split('?')[0];
            return 'imgs/' + filename;
        } catch (e) { return ''; }
    }

    function renderDetailsInModal(hero) {
        const langDict = i18n[currentLang];

        const renderListAsHTML = (itemsArray) => {
            if (!itemsArray || !Array.isArray(itemsArray) || itemsArray.length === 0) return `<li>${langDict.none}</li>`;
            return itemsArray.map(item => {
                let cleanItem = String(item).trim();
                if (cleanItem.includes(' * ')) {
                    const parts = cleanItem.split(' * ');
                    let subHtml = `<li>${parts[0].trim()}</li>`;
                    for (let i = 1; i < parts.length; i++) {
                        subHtml += `<li><i>${parts[i].trim()}</i></li>`;
                    }
                    return subHtml;
                }
                return `<li>${cleanItem}</li>`;
            }).join('');
        };

        let rawHeroName = hero.name || '未知英雄';
        let tempName = rawHeroName;

        let heroSkin = '';
        const skinPattern = /\s*(?:\[|\()?(C\d+|\S+?)(?:\]|\))?\s*$/;
        const skinMatch = tempName.match(skinPattern);
        if (skinMatch && skinMatch[1]) {
            const potentialSkin = skinMatch[1];
            if (potentialSkin.match(/^C\d+$/i) || potentialSkin.toLowerCase() === '玻璃' || potentialSkin.toLowerCase().endsWith('皮肤') || potentialSkin.toLowerCase().endsWith('皮膚')) {
                heroSkin = potentialSkin;
                tempName = tempName.substring(0, tempName.length - skinMatch[0].length).trim();
            }
        }

        let mainHeroName = tempName;
        let englishName = '';
        let traditionalChineseName = '';

        const multiLangNamePattern = /^(.*?)\s+([^\s\(]+)\s+\((.*?)\)$/;
        const singleAltLangNamePattern = /^(.*?)\s+\((.*?)\)$/;
        const multiLangMatch = tempName.match(multiLangNamePattern);
        const singleAltLangMatch = tempName.match(singleAltLangNamePattern);

        if (multiLangMatch) {
            mainHeroName = multiLangMatch[1].trim();
            traditionalChineseName = multiLangMatch[2].trim();
            englishName = multiLangMatch[3].trim();
        } else if (singleAltLangMatch) {
            mainHeroName = singleAltLangMatch[1].trim();
            const altName = singleAltLangMatch[2].trim();
            if (/[a-zA-Z]/.test(altName) && !/[\u4e00-\u9fa5]/.test(altName)) {
                englishName = altName;
            } else {
                traditionalChineseName = altName;
            }
        }

        const nameBlockHTML = `
            ${englishName ? `<p class="hero-english-name">${englishName}</p>` : ''}
            <h1 class="hero-main-name">${mainHeroName}</h1>
            ${traditionalChineseName ? `<p class="hero-alt-name">${traditionalChineseName}</p>` : ''}
        `;

        const heroFamily = String(hero.family || '').toLowerCase();
        const familyBonus = (families_bonus.find(f => f.name.toLowerCase() === heroFamily) || {}).bonus || [];
        const translatedFamily = family_values[heroFamily] || hero.family;
        const heroTypesContent = (hero.types && hero.types.length > 0) ? hero.types.join('、') : langDict.none;
        const localImagePath = getLocalImagePath(hero.image);
        const avatarGlowClass = getColorGlowClass(hero.color);
        const fancyNameHTML = hero.fancy_name ? `<p class="hero-fancy-name">${hero.fancy_name}</p>` : '';

        const detailsHTML = `
            <div class="details-header">
                <h2>${langDict.modalHeroDetails}</h2>
                <button class="close-btn" id="hide-details-btn" title="${langDict.closeBtnTitle}">✖</button>
            </div>
            
            <div class="hero-title-block">
                ${nameBlockHTML}
                ${fancyNameHTML}
            </div>
            
            <div class="details-body">
                <div class="details-top-left">
                    <img src="${localImagePath}" class="hero-image-modal ${avatarGlowClass}" alt="${hero.name}">
                </div>
                <div class="details-top-right">
                     <div class="details-info-line">
                        ${hero.class ? `<span class="hero-info-block">🎓 ${hero.class}</span>` : ''}
                        ${hero.source ? `<span class="hero-info-block">🌍 ${hero.source}</span>` : ''}
                        ${heroSkin ? `<span class="hero-info-block">👕 ${langDict.modalSkin} ${heroSkin}</span>` : ''}
                        ${hero.AetherPower ? `<span class="hero-info-block">⏫ ${hero.AetherPower}</span>` : ''}
                        ${hero['Release date'] ? `<span class="hero-info-block">📅 ${hero['Release date']}</span>` : ''}
                    </div>
                    
                    <h3>${langDict.modalCoreStats}</h3>
                    <div class="details-stats-grid">
                        <div><p class="metric-value-style">💪 ${hero.power || 0}</p></div>
                        <div><p class="metric-value-style">⚔️ ${hero.attack || 0}</p></div>
                        <div><p class="metric-value-style">🛡️ ${hero.defense || 0}</p></div>
                        <div><p class="metric-value-style">❤️ ${hero.health || 0}</p></div>
                    </div>
                </div>
            </div>
            
            <div class="details-bottom-section">
                <h3>${langDict.modalSkillDetails}</h3>
                
                <div class="skill-category-block">
                    <p class="uniform-style">${langDict.modalSkillName} <span class="skill-value">${hero.skill && hero.skill !== 'nan' ? hero.skill : langDict.none}</span></p>
                    <p class="uniform-style">${langDict.modalSpeed} <span class="skill-value">${hero.speed || langDict.none}</span></p>
                    <p class="uniform-style">${langDict.modalSkillType} <span class="skill-value">${heroTypesContent}</span></p>
                </div>

                <div class="skill-category-block">
                    <p class="uniform-style">${langDict.modalSpecialSkill}</p>
                    <ul class="skill-list">${renderListAsHTML(hero.effects)}</ul>
                </div>
                
                <div class="skill-category-block">
                    <p class="uniform-style">${langDict.modalPassiveSkill}</p>
                    <ul class="skill-list">${renderListAsHTML(hero.passives)}</ul>
                </div>
                
                ${familyBonus.length > 0 ? `
                <div class="skill-category-block">
                    <p class="uniform-style">${langDict.modalFamilyBonus(translatedFamily || hero.family)}</p>
                    <ul class="skill-list">${renderListAsHTML(familyBonus)}</ul>
                </div>` : ''}
            </div>
            
            <div class="modal-footer">
                <button class="close-bottom-btn" id="hide-details-bottom-btn">${langDict.detailsCloseBtn}</button>
            </div>`;
        modalContent.innerHTML = detailsHTML;
        document.getElementById('hide-details-btn').addEventListener('click', closeDetailsModal);
        document.getElementById('hide-details-bottom-btn').addEventListener('click', closeDetailsModal);
    }


    // --- 事件监听器绑定 ---
    function addEventListeners() {
        if (themeToggleButton) {
            themeToggleButton.addEventListener('click', toggleTheme);
        }
        if (langToggleButton) {
            langToggleButton.addEventListener('click', toggleLanguage);
        }
        for (const key in filterInputs) {
            if (filterInputs[key]) filterInputs[key].addEventListener('input', applyFiltersAndRender);
        }
        if (modalOverlay) modalOverlay.addEventListener('click', closeDetailsModal);

        if (resultsTable) {
            const thead = resultsTable.querySelector('thead');
            if (thead) {
                thead.addEventListener('click', (event) => {
                    const header = event.target.closest('th.sortable');
                    if (header) {
                        const sortKey = header.dataset.sortKey;
                        if (currentSort.key === sortKey) {
                            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
                        } else {
                            currentSort.key = sortKey;
                            const numericKeys = ['power', 'attack', 'defense', 'health', 'star'];
                            currentSort.direction = numericKeys.includes(sortKey) ? 'desc' : 'asc';
                        }
                        applyFiltersAndRender();
                    }
                });
            }
            resultsTable.addEventListener('click', (event) => {
                const row = event.target.closest('.table-row');
                if (row) {
                    const heroId = parseInt(row.dataset.heroId, 10);
                    const selectedHero = allHeroes.find(h => h.originalIndex === heroId);
                    if (selectedHero) { openDetailsModal(selectedHero); }
                }
            });
        }
        if (openFiltersBtn) openFiltersBtn.addEventListener('click', openFiltersModal);
        if (closeFiltersModalBtn) closeFiltersModalBtn.addEventListener('click', closeFiltersModal);
        if (filtersModalOverlay) filtersModalOverlay.addEventListener('click', closeFiltersModal);

        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => {
                for (const key in filterInputs) {
                    const element = filterInputs[key];
                    if (element.tagName === 'SELECT') {
                        element.value = element.id === 'release-date-type' ? 'all' : '无';
                    } else { element.value = ''; }
                }
                applyFiltersAndRender();
            });
        }
        document.querySelectorAll('#filters-modal .filter-header').forEach(header => {
            header.addEventListener('click', function (event) {
                if (event.target.classList.contains('toggle-button')) { return; }
                const toggleButton = this.querySelector('.toggle-button');
                if (toggleButton) { toggleButton.click(); }
            });
        });
        document.querySelectorAll('#filters-modal .toggle-button').forEach(button => {
            button.addEventListener('click', function () {
                const targetId = this.dataset.target;
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.classList.toggle('collapsed');
                    this.classList.toggle('expanded');
                    const currentState = targetElement.classList.contains('collapsed') ? 'collapsed' : 'expanded';
                    setCookie(targetId + '_state', currentState, 365);
                }
            });
        });
        window.addEventListener('popstate', function (event) {
            if (modal) modal.classList.add('hidden');
            if (modalOverlay) modalOverlay.classList.add('hidden');
            if (filtersModal) filtersModal.classList.add('hidden');
            if (filtersModalOverlay) filtersModalOverlay.classList.add('hidden');
            document.body.classList.remove('modal-open');
        });

        window.addEventListener('resize', adjustStickyHeaders);
    }

    // --- 应用初始化 ---
    async function initializeApp() {
        initializeLanguage();
        const dataLoaded = await loadData(currentLang);
        if (dataLoaded) {
            allHeroes.forEach((hero, index) => hero.originalIndex = index);
            populateFilters();
            addEventListeners();
            applyFiltersAndRender();
            loadFilterStates();

            setTimeout(adjustStickyHeaders, 100);
        }

        if (pageLoader) {
            pageLoader.classList.add('hidden');
        }
        document.body.classList.remove('js-loading');
    }

    // --- 启动 ---
    initializeApp();
});