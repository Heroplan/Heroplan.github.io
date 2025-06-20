window.onload = function () {
    // --- Global variables ---
    let filteredHeroes = [];

    // --- Cookie Helper Functions ---
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
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // --- Theme Management ---
    const themeToggleButton = document.getElementById('theme-toggle-btn');

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }

    function toggleTheme() {
        const currentTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
        applyTheme(currentTheme);
        setCookie('theme', currentTheme, 365);
    }

    function initializeTheme() {
        const savedTheme = getCookie('theme');
        if (savedTheme) {
            applyTheme(savedTheme);
        } else {
            const hour = new Date().getHours();
            if (hour >= 20 || hour < 8) {
                applyTheme('dark');
            } else {
                applyTheme('light');
            }
        }
    }

    themeToggleButton.addEventListener('click', toggleTheme);
    initializeTheme();


    // --- Get all DOM elements ---
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
    const resultsTableContainer = document.getElementById('results-table-container');
    const resultsCountEl = document.getElementById('results-count');
    const lastUpdatedEl = document.getElementById('last-updated');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');

    // Hero Details Modal Elements
    const modal = document.getElementById('modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');

    // Filter Modal Elements
    const openFiltersBtn = document.getElementById('open-filters-btn');
    const filtersModal = document.getElementById('filters-modal');
    const filtersModalOverlay = document.getElementById('filters-modal-overlay');
    const closeFiltersModalBtn = document.getElementById('close-filters-modal-btn');


    const getColorGlowClass = (colorName) => {
        switch (String(colorName).toLowerCase()) {
            case '红色': return 'red-glow-border';
            case '蓝色': return 'blue-glow-border';
            case '绿色': return 'green-glow-border';
            case '黄色': return 'yellow-glow-border';
            case '紫色': return 'purple-glow-border';
            case '白色': return 'white-glow-border';
            case '黑色': return 'black-glow-border';
            default: return '';
        }
    };


    function populateFilters() {
        const CUSTOM_SORT = {
            'speed': ['充能', '魔法', '冥河', '飞速', '快速', '潮汐', '中等', '杀手', '慢', '非常慢'],
            'star': ['5', '4', '3', '2', '1'],
        };

        const getSortedValues = (key, values) => {
            values = values.map(v => String(v || ''));
            if (key === 'family' || key === 'source') {
                const translatedValues = values.map(v => ({
                    original: v,
                    translated: family_values[v.toLowerCase()] || v
                }));
                return translatedValues
                    .sort((a, b) => a.translated.localeCompare(b.translated, 'zh-CN'))
                    .map(item => item.original);
            }

            if (key === 'AetherPower') {
                return values.sort((a, b) => a.localeCompare(b, 'zh-CN'));
            }

            if (CUSTOM_SORT[key]) {
                return CUSTOM_SORT[key]
                    .filter(v => values.includes(String(v)))
                    .concat(values.filter(v => !CUSTOM_SORT[key].includes(String(v))).sort());
            }
            return values.sort((a, b) => a.localeCompare(b, 'zh-CN'));
        };

        const createOptions = (values, key) => {
            const sortedValues = getSortedValues(key, values);
            const options = ['无', ...sortedValues].map(opt => {
                const displayText = (key === 'family' || key === 'source')
                    ? (family_values[String(opt).toLowerCase()] || opt)
                    : opt;
                return `<option value="${opt}">${displayText}</option>`;
            });
            return options.join('');
        };

        const initFilter = (key, dataKey) => {
            const heroDataKey = key === 'aetherpower' ? 'AetherPower' : key;
            const uniqueValues = [...new Set(allHeroes
                .map(h => h[heroDataKey])
                .filter(v => v != null && v !== ''))];
            filterInputs[key].innerHTML = createOptions(uniqueValues, heroDataKey);
        };

        initFilter('star');
        initFilter('color');
        initFilter('speed');
        initFilter('class');
        initFilter('family');
        initFilter('source');
        initFilter('aetherpower', 'AetherPower');
        document.querySelectorAll('.filter-card select').forEach(select => {
            select.style.textAlign = 'center';
        });
    }

    // --- Modal Control Functions ---
    function openDetailsModal(hero) {
        renderDetailsInModal(hero);
        modal.classList.remove('hidden');
        modalOverlay.classList.remove('hidden');
        document.body.classList.add('modal-open');
        modal.scrollTop = 0;
        history.pushState({ modal: 'details' }, null);
    }

    function closeDetailsModal() {
        if (!modal.classList.contains('hidden')) {
            history.back();
        }
    }

    function openFiltersModal() {
        filtersModal.classList.remove('hidden');
        filtersModalOverlay.classList.remove('hidden');
        document.body.classList.add('modal-open');
        history.pushState({ modal: 'filters' }, null);
    }

    function closeFiltersModal() {
        if (!filtersModal.classList.contains('hidden')) {
            history.back();
        }
    }

    // --- Mobile collapsible filter logic ---
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

    // --- Bind events ---
    function addFilterEventListeners() {
        for (const key in filterInputs) {
            filterInputs[key].addEventListener('input', applyFiltersAndRender);
        }

        modalOverlay.addEventListener('click', closeDetailsModal);
        resultsTableContainer.addEventListener('click', (event) => {
            const row = event.target.closest('.table-row');
            if (row) {
                const heroId = parseInt(row.dataset.heroId, 10);
                const selectedHero = allHeroes.find(h => h.originalIndex === heroId);
                if (selectedHero) {
                    openDetailsModal(selectedHero);
                }
            }
        });

        openFiltersBtn.addEventListener('click', openFiltersModal);
        closeFiltersModalBtn.addEventListener('click', closeFiltersModal);
        filtersModalOverlay.addEventListener('click', closeFiltersModal);

        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => {
                for (const key in filterInputs) {
                    const element = filterInputs[key];
                    if (element.tagName === 'SELECT') {
                        element.value = element.id === 'release-date-type' ? 'all' : '无';
                    } else if (element.type === 'number') {
                        element.value = '';
                    } else {
                        element.value = '';
                    }
                }
                applyFiltersAndRender();
            });
        }

        document.querySelectorAll('#filters-modal .filter-header').forEach(header => {
            header.addEventListener('click', function (event) {
                if (event.target.classList.contains('toggle-button')) {
                    return;
                }
                const toggleButton = this.querySelector('.toggle-button');
                if (toggleButton) {
                    toggleButton.click();
                }
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
            modal.classList.add('hidden');
            modalOverlay.classList.add('hidden');
            filtersModal.classList.add('hidden');
            filtersModalOverlay.classList.add('hidden');
            document.body.classList.remove('modal-open');
        });
    }

    function applyFiltersAndRender() {
        const filters = Object.fromEntries(Object.entries(filterInputs).map(([key, el]) => [key, el.value.toLowerCase()]));
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

            if (filters.star !== '无' && String(hero.star) !== filters.star) return false;
            if (filters.color !== '无' && String(hero.color).toLowerCase() !== filters.color) return false;
            if (filters.speed !== '无' && String(hero.speed).toLowerCase() !== filters.speed) return false;
            if (filters.class !== '无' && String(hero.class).toLowerCase() !== filters.class) return false;
            if (filters.family !== '无' && String(hero.family).toLowerCase() !== filters.family) return false;
            if (filters.source !== '无' && String(hero.source).toLowerCase() !== filters.source) return false;
            if (filters.aetherpower !== '无' && String(hero.AetherPower).toLowerCase() !== filters.aetherpower) return false;

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
        filteredHeroes.sort((a, b) => Number(b.power) - Number(a.power));
        renderTable(filteredHeroes);

        // 将表格滚动条回到顶端 <-- 新增
        resultsTableContainer.scrollTop = 0;
    }

    function renderTable(heroes) {
        resultsCountEl.textContent = `筛选列表中有 ${heroes.length} 位英雄`;
        const headers = {
            image: '图片', name: '名称', color: '颜色', star: '星级', class: '职业',
            speed: '法速', power: '战力', attack: '攻击', defense: '防御',
            health: '生命', types: '技能类型'
        };
        const colKeys = Object.keys(headers);
        let tableHTML = '<table class="manual-table">';
        tableHTML += '<thead class="table-header"><tr>' + colKeys.map(key => `<th class="col-${key}">${headers[key]}</th>`).join('') + '</tr></thead>';
        tableHTML += '<tbody>' + heroes.map(hero => {
            const cellsHTML = colKeys.map(key => {
                let content = hero[key] || '';
                if (key === 'image') {
                    const heroColorClass = getColorGlowClass(hero.color);
                    return `<td class="col-image"><img src="${getLocalImagePath(content)}" class="hero-image ${heroColorClass}" alt="${hero.name}" loading="lazy"></td>`;
                }
                if (key === 'family' && content) {
                    content = family_values[String(content).toLowerCase()] || content;
                }
                if (Array.isArray(content)) content = content.join(', ');
                return `<td class="col-${key}">${content}</td>`;
            }).join('');
            return `<tr class="table-row" data-hero-id="${hero.originalIndex}">${cellsHTML}</tr>`;
        }).join('') + '</tbody></table>';
        resultsTableContainer.innerHTML = tableHTML;
    }

    function getLocalImagePath(url) {
        if (!url || typeof url !== 'string') return '';
        try {
            const filename = url.substring(url.lastIndexOf('/') + 1).split('?')[0];
            return 'imgs/' + filename;
        } catch (e) { return ''; }
    }

    function renderDetailsInModal(hero) {
        const renderListAsHTML = (itemsArray) => {
            if (!itemsArray || !Array.isArray(itemsArray) || itemsArray.length === 0) return '<li>无</li>';
            return itemsArray.map(item => {
                let cleanItem = String(item).trim();
                if (cleanItem.includes(' * ')) {
                    const parts = cleanItem.split(' * ');
                    let subHtml = `<li>&bull; ${parts[0].trim()}</li>`;
                    for (let i = 1; i < parts.length; i++) {
                        subHtml += `<li style="margin-left: 20px;">&bull; <i>${parts[i].trim()}</i></li>`;
                    }
                    return subHtml;
                }
                return `<li>&bull; ${cleanItem}</li>`;
            }).join('');
        };

        const heroFamily = String(hero.family || '').toLowerCase();
        const familyBonus = families_bonus.find(f => f.name.toLowerCase() === heroFamily)?.bonus || [];
        const translatedFamily = family_values[heroFamily] || hero.family;
        const heroTypesContent = (hero.types && hero.types.length > 0) ? hero.types.join('、') : '无';
        const localImagePath = getLocalImagePath(hero.image);
        const avatarGlowClass = getColorGlowClass(hero.color);
        let rawHeroName = hero.name || '未知英雄';
        let mainHeroName = rawHeroName;
        let altHeroNamesHTML = '';
        let heroSkin = '';
        const skinPattern = /\s*(?:\[|\()?(C\d+|\S+?)(?:\]|\))?\s*$/;
        let tempName = rawHeroName;
        const currentSkinMatch = tempName.match(skinPattern);
        if (currentSkinMatch && currentSkinMatch[1]) {
            const potentialSkin = currentSkinMatch[1];
            if (tempName.trim() !== potentialSkin.trim() || rawHeroName.trim() !== potentialSkin.trim()) {
                if (potentialSkin.match(/^C\d+$/i) || potentialSkin.toLowerCase() === '玻璃' || potentialSkin.toLowerCase().endsWith('皮肤')) {
                    heroSkin = potentialSkin;
                    mainHeroName = tempName.substring(0, tempName.length - currentSkinMatch[0].length).trim();
                } else {
                    mainHeroName = rawHeroName.trim();
                }
            }
        } else {
            mainHeroName = rawHeroName.trim();
        }
        const multiLangNamePattern = /^(.*?)\s+([^\s\(]+)\s+\((.*?)\)$/;
        const singleAltLangNamePattern = /^(.*?)\s+\((.*?)\)$/;
        let currentParsedNameForAlt = mainHeroName;
        const multiLangMatch = currentParsedNameForAlt.match(multiLangNamePattern);
        const singleAltLangMatch = currentParsedNameForAlt.match(singleAltLangNamePattern);
        if (multiLangMatch) {
            mainHeroName = multiLangMatch[1].trim();
            const traditionalChinese = multiLangMatch[2].trim();
            const englishName = multiLangMatch[3].trim();
            altHeroNamesHTML = `<div class="hero-alt-names-container"><span class="hero-alt-name">${traditionalChinese}</span><span class="hero-alt-name">(${englishName})</span></div>`;
        } else if (singleAltLangMatch) {
            mainHeroName = singleAltLangMatch[1].trim();
            const altName = singleAltLangMatch[2].trim();
            altHeroNamesHTML = `<div class="hero-alt-names-container"><span class="hero-alt-name">(${altName})</span></div>`;
        } else {
            mainHeroName = currentParsedNameForAlt.trim();
        }
        const fancyNameHTML = hero.fancy_name ? `<p class="hero-fancy-name">${hero.fancy_name}</p>` : '';
        const releaseDateHTML = hero['Release date'] ? `<span class="hero-info-block">📅 ${hero['Release date']}</span>` : '';
        const aetherPowerHTML = hero.AetherPower ? `<span class="hero-info-block">⏫ ${hero.AetherPower}</span>` : '';
        const skinContentHTML = heroSkin ? `<span class="hero-info-block">皮肤: ${heroSkin}</span>` : '';
        const detailsHTML = `
            <div class="details-header">
                <h2>ℹ️ 英雄详情</h2><button class="close-btn" id="hide-details-btn" title="关闭">❌</button>
            </div>
            <h1 class="hero-name-modal">${mainHeroName}</h1>
            ${altHeroNamesHTML}
            ${fancyNameHTML} <div class="details-body">
                <div class="details-top-left">
                    <img src="${localImagePath}" class="hero-image-modal ${avatarGlowClass}" alt="${hero.name}">
                </div>
                <div class="details-top-right">
                    <div class="details-info-line">
                        <span class="hero-info-block">${hero.class || '无'}</span>
                        ${aetherPowerHTML} ${skinContentHTML}
                        <span class="hero-info-block">起源: ${hero.source || '无'}</span>
                         ${releaseDateHTML} </div>
                    <hr>
                    <h3>📊 核心属性</h3>
                    <div class="details-stats-grid">
                        <div><p class="metric-value-style"><span class="icon">💪</span> ${hero.power || 0}</p></div>
                        <div><p class="metric-value-style"><span class="icon">⚔️</span> ${hero.attack || 0}</p></div>
                        <div><p class="metric-value-style"><span class="icon">🛡️</span> ${hero.defense || 0}</p></div>
                        <div><p class="metric-value-style"><span class="icon">❤️</span> ${hero.health || 0}</p></div>
                    </div>
                </div>
            </div>
            <hr class="divider">
            <div class="details-bottom-section">
                <h3>📖 技能详情</h3>
                <div class="skill-category-block" style="display: flex; align-items: baseline; gap: 10px;">
                    <p class="uniform-style" style="margin-bottom: 0;">📄 名称: <i>${hero.skill && hero.skill !== 'nan' ? hero.skill : '无'}</i></p>
                    <p class="uniform-style" style="margin-bottom: 0;">⚡ 法速: ${hero.speed || '无'}</p>
                </div>
                <div class="skill-category-block">
                    <p class="uniform-style">🏷️ 技能类型: ${heroTypesContent}</p>
                </div>
                <div class="skill-category-block">
                    <p class="uniform-style">✨ 特殊技能:</p>
                    <ul class="skill-list">${renderListAsHTML(hero.effects)}</ul>
                </div>
                <div class="skill-category-block">
                    <p class="uniform-style">🧿 被动技能:</p>
                    <ul class="skill-list">${renderListAsHTML(hero.passives)}</ul>
                </div>
                ${familyBonus.length > 0 ? `
                <div class="skill-category-block">
                    <p class="uniform-style">👪 家族加成 (${translatedFamily || hero.family}):</p>
                    <ul class="skill-list">${renderListAsHTML(familyBonus)}</ul>
                </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="close-bottom-btn" id="hide-details-bottom-btn">关闭详情</button>
            </div>`;
        modalContent.innerHTML = detailsHTML;
        document.getElementById('hide-details-btn').addEventListener('click', closeDetailsModal);
        document.getElementById('hide-details-bottom-btn').addEventListener('click', closeDetailsModal);
    }

    // --- Initialisation ---
    if (typeof allHeroes !== 'undefined' && allHeroes.length > 0) {
        populateFilters();
        addFilterEventListeners();
        applyFiltersAndRender();
        loadFilterStates();
    } else {
        resultsTableContainer.innerHTML = "<p style='color: var(--md-sys-color-error); font-weight: bold;'>错误：数据未能加载。请确保 heroes_data.js 文件存在且内容正确。</p>";
    }
};