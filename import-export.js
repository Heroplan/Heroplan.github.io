// import-export.js: 管理所有与设置导入和导出相关的功能。

/**
 * 初始化导出设置模态框的所有事件监听器。
 * 使用事件委托来处理动态生成的内容。
 */
function initializeExportModalListeners() {
    const modal = document.getElementById('export-settings-modal');
    const content = document.getElementById('export-settings-modal-content');

    if (!modal || !content) return;

    // 关闭模态框的通用函数
    const closeModal = () => { if (!modal.classList.contains('hidden') && !modal.classList.contains('closing')) history.back(); };

    // 用属性处理器而不是 addEventListener：模态内容常驻，重复初始化不会累积监听器。
    content.onclick = (event) => {
        event.stopPropagation();
        const target = event.target;
        if (target.id === 'close-export-modal-btn') closeModal();
        else if (target.id === 'generate-export-code-btn') handleGenerateExportCode();
        else if (target.id === 'save-to-file-btn') handleSaveToFile();
        else if (target.id === 'export-select-all') {
            content.querySelectorAll('.export-item-checkbox').forEach(cb => cb.checked = target.checked);
        }
    };

    content.onchange = (event) => {
        if (event.target.classList.contains('export-item-checkbox')) {
            const selectAll = content.querySelector('#export-select-all');
            if (selectAll) selectAll.checked = Array.from(content.querySelectorAll('.export-item-checkbox')).every(c => c.checked);
        }
    };
}

/**
 * 初始化导入设置模态框的所有事件监听器。
 */
function initializeImportModalListeners() {
    const modal = document.getElementById('import-settings-modal');
    const content = document.getElementById('import-settings-modal-content');
    if (!modal || !content) return;

    const closeModal = () => { if (!modal.classList.contains('hidden') && !modal.classList.contains('closing')) history.back(); };

    content.onclick = (event) => {
        event.stopPropagation();
        const target = event.target;
        if (target.id === 'close-import-modal-btn') closeModal();
        else if (target.id === 'import-from-file-btn') content.querySelector('#file-importer-input')?.click();
        else if (target.id === 'analyze-import-code-btn') handleAnalyzeImportCode();
        else if (target.id === 'confirm-import-btn') handleImportConfirm();
    };

    content.onchange = (event) => {
        const target = event.target;
        if (target.id === 'file-importer-input') handleFileImport(target);
        else if (target.id === 'import-select-all') {
            content.querySelectorAll('.import-item-checkbox').forEach(cb => cb.checked = target.checked);
        } else if (target.classList.contains('import-item-checkbox')) {
            const selectAll = content.querySelector('#import-select-all');
            if (selectAll) selectAll.checked = Array.from(content.querySelectorAll('.import-item-checkbox')).every(c => c.checked);
        }
    };
}

// ────────────────────────────────────────────────────────────────────
// 导入导出：数据源、Cookie 清单与格式兼容
// ────────────────────────────────────────────────────────────────────

// 设置项里不是 Cookie 的聚合数据源（收藏/队伍/收藏颜色）。
const DATA_SOURCE_KEYS = new Set(['heroFavorites', 'savedTeams', 'favoriteColors']);
const EXPORT_FILE_MAX_BYTES = 5 * 1024 * 1024;
const IMPORT_CODE_MAX_CHARS = 2 * 1024 * 1024;
const IMPORT_JSON_MAX_CHARS = 8 * 1024 * 1024;

// 站内偏好 Cookie 白名单。除这些固定项，还会补上筛选/弹窗动态生成的 *_state。
const OTHER_SETTING_COOKIE_KEYS = [
    'theme', 'md_theme', 'language',
    'defaultLB', 'defaultTalent', 'defaultTalentStrategy', 'defaultManaPriority',
    'showLbTalentDetails', 'enableSkillQuickSearch', 'showEventNameState',
    'chatPreviewHeight', 'teamDisplayCollapsed', 'savedTeamsCollapsed', 'collapseStates',
    'chatPanelColorsCollapsed', 'chatPanelEmojisCollapsed', 'highlightSkillTerms',
    'hideDonate', 'showSkillTypesInDetails', 'showSkillTypesInTeam', 'showCircleRay',
    'modal_settings_state', 'modal_custom_talent_state',
    'lotterySoundEnabled', 'lotteryAnimationMode', 'lotteryShowAllHistory'
];

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isSafeImportedCookieName(key) {
    // 只接受字母开头的普通 Cookie 名；排除内部迁移标记和旧队伍 Cookie。
    return typeof key === 'string'
        && /^[A-Za-z][A-Za-z0-9_.-]*$/.test(key)
        && key !== 'languageUpdated'
        && key !== 'savedTeams';
}

/** 当前可导入/导出的其它偏好 Cookie：固定清单 + 动态折叠状态。 */
function getOtherSettingKeys() {
    const keys = new Set(OTHER_SETTING_COOKIE_KEYS);
    try {
        document.querySelectorAll('#filters-modal .filter-header .toggle-button[data-target]').forEach(btn => {
            if (btn.dataset.target) keys.add(`${btn.dataset.target}_state`);
        });
        document.querySelectorAll('[data-cookie]').forEach(el => {
            if (el.dataset.cookie) keys.add(el.dataset.cookie);
        });
        if (typeof getCookieNames === 'function') {
            getCookieNames().forEach(name => {
                if (/_state$/.test(name)) keys.add(name);
            });
        }
    } catch (e) {
        console.warn('[import-export] 收集折叠状态 Cookie 失败', e);
    }
    return Array.from(keys).sort();
}

/** 导入 payload 中可安全写回的其它偏好键（兼容未来新增的 Cookie 设置）。 */
function collectImportedOtherKeys(imported) {
    return Object.keys(imported).filter(key =>
        !DATA_SOURCE_KEYS.has(key)
        && key !== 'otherSettings'
        && isSafeImportedCookieName(key)
    );
}

function readStorageRaw(key) {
    try {
        return localStorage.getItem(key) || '';
    } catch (e) {
        console.warn('[import-export] 读取 localStorage 失败', key, e);
        return '';
    }
}

function parseLegacyArrayValue(value) {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed.startsWith('[')) return null;
    try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : null;
    } catch (e) {
        return null;
    }
}

function normalizeFavoritesPayload(value) {
    const legacy = parseLegacyArrayValue(value);
    if (legacy) return legacy.filter(item => typeof item === 'string' && item.trim());
    if (typeof value !== 'string' || !value.trim()) return [];
    if (typeof decodeFavoritesFromBinary !== 'function') return [];
    const decoded = decodeFavoritesFromBinary(value);
    return Array.isArray(decoded) ? decoded.filter(item => typeof item === 'string' && item.trim()) : [];
}

function normalizeTeamObject(team) {
    if (!team || typeof team !== 'object' || !Array.isArray(team.heroes)) return null;
    const name = typeof team.name === 'string' ? team.name.trim() : '';
    if (!name) return null;
    const heroes = team.heroes.filter(h => typeof h === 'string' && h.trim()).slice(0, 5);
    return Object.assign({}, team, { name, heroes });
}

function normalizeTeamsPayload(value) {
    const legacy = parseLegacyArrayValue(value);
    if (legacy) return legacy.map(normalizeTeamObject).filter(Boolean);
    if (typeof value !== 'string' || !value.trim()) return [];
    if (typeof decodeTeamsFromBinary !== 'function') return [];
    const decoded = decodeTeamsFromBinary(value);
    return Array.isArray(decoded) ? decoded.map(normalizeTeamObject).filter(Boolean) : [];
}

function normalizeColorPayload(value) {
    const list = Array.isArray(value) ? value : parseLegacyArrayValue(value);
    if (!Array.isArray(list)) return [];
    return list
        .filter(color => typeof color === 'string' && color.trim())
        .map(color => color.trim());
}

function normalizeCookieValue(value) {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return null;
}

/** 队伍脚本是懒加载的；导入/导出碰队伍数据前先补上，避免 getSavedTeams 未定义。 */
function ensureTeamStorageReady() {
    if (typeof getSavedTeams === 'function' && typeof decodeTeamsFromBinary === 'function') {
        return Promise.resolve();
    }
    if (typeof ensureViewScripts === 'function') {
        return ensureViewScripts('team').catch(err => {
            console.warn('[import-export] 加载队伍存储模块失败', err);
        });
    }
    return Promise.resolve();
}

/** 解析导入代码：优先 LZString，兼容纯 JSON（便于调试/旧工具）。 */
function parseImportCode(raw) {
    const text = String(raw || '').trim();
    if (!text || text.length > IMPORT_CODE_MAX_CHARS) return null;

    const candidates = [];
    if (typeof LZString !== 'undefined' && typeof LZString.decompressFromEncodedURIComponent === 'function') {
        try {
            const decompressed = LZString.decompressFromEncodedURIComponent(text) || '';
            if (decompressed) candidates.push(decompressed);
        } catch (e) {
            // 不是 LZString 就继续尝试原始 JSON
        }
    }
    // 兼容纯 JSON（便于调试、旧工具或压缩库不可用时的导出内容）。
    if (text.startsWith('{') || text.startsWith('[')) candidates.push(text);

    for (const candidate of candidates) {
        if (candidate.length > IMPORT_JSON_MAX_CHARS) continue;
        try {
            const parsed = JSON.parse(candidate);
            if (isPlainObject(parsed)) return parsed;
        } catch (e) {
            // 尝试下一个候选格式
        }
    }
    return null;
}

/** 导出 payload：所有值保持字符串，和旧格式兼容。 */
function buildExportPayload(selectedKeys) {
    const payload = {};

    if (selectedKeys.has('heroFavorites')) {
        // getFavorites() 会触发旧键迁移，再读二进制原文，保持和旧导出格式一致。
        try { getFavorites(); } catch (e) { console.warn('[import-export] 读取收藏失败', e); }
        payload.heroFavorites = readStorageRaw('favorites_binary');
    }

    if (selectedKeys.has('savedTeams')) {
        try { getSavedTeams(); } catch (e) { console.warn('[import-export] 读取队伍失败', e); }
        payload.savedTeams = readStorageRaw('savedTeams_binary');
    }

    if (selectedKeys.has('favoriteColors')) {
        payload.favoriteColors = JSON.stringify(normalizeColorPayload(getCookieJSON('favoriteColors', [])));
    }

    if (selectedKeys.has('otherSettings')) {
        getOtherSettingKeys().forEach(key => {
            const value = getCookie(key);
            if (value !== null) payload[key] = value;
        });
    }

    return payload;
}

/** 导入预览/卡片使用的数据源统计。 */
function buildImportDataSources(imported, langDict) {
    const otherKeys = collectImportedOtherKeys(imported);
    return {
        heroFavorites: {
            name: langDict.setting_heroFavorites,
            count: normalizeFavoritesPayload(imported.heroFavorites).length
        },
        savedTeams: {
            name: langDict.setting_savedTeams,
            count: normalizeTeamsPayload(imported.savedTeams).length
        },
        favoriteColors: {
            name: langDict.setting_favoriteColors,
            count: normalizeColorPayload(imported.favoriteColors).length
        },
        otherSettings: {
            name: langDict.setting_otherSettings,
            count: otherKeys.length
        }
    };
}
/**
 * 打开导出设置模态框，并根据可导出的数据动态生成内容。
 */
async function openExportModal() {
    // 队伍数据在懒加载脚本里；先补齐再统计，避免未进过队伍视图时直接 ReferenceError。
    await ensureTeamStorageReady();

    const modal = document.getElementById('export-settings-modal');
    const content = document.getElementById('export-settings-modal-content');
    if (!modal || !content || modal.open) return;

    const langDict = i18n[state.currentLang] || {};

    // 检查有哪些数据可以导出
    const dataSources = {
        heroFavorites: {
            name: langDict.setting_heroFavorites,
            count: getFavorites().length,
            storage: 'localStorage',
            newKey: 'favorites_binary'
        },
        savedTeams: {
            name: langDict.setting_savedTeams,
            count: typeof getSavedTeams === 'function' ? getSavedTeams().length : 0,
            storage: 'localStorage',
            newKey: 'savedTeams_binary'
        },
        favoriteColors: {
            name: langDict.setting_favoriteColors,
            count: normalizeColorPayload(getCookieJSON('favoriteColors', [])).length,
            storage: 'cookie'
        },
        otherSettings: {
            name: langDict.setting_otherSettings,
            count: getOtherSettingKeys().filter(key => getCookie(key) !== null).length,
            storage: 'cookie'
        }
    };

    if (!Object.values(dataSources).some(item => item.count > 0)) {
        alert(langDict.noDataToExport);
        return;
    }

    // 构建复选框列表
    let checkboxesHTML = Object.entries(dataSources).map(([key, { name, count }]) => {
        if (count > 0) {
            return `<div style="margin-bottom: 0.5rem;"><label style="cursor:pointer;"><input type="checkbox" class="export-item-checkbox" data-key="${key}" checked> ${name} <span style="color: var(--md-sys-color-outline);">(${count})</span></label></div>`;
        }
        return '';
    }).join('');

    // 渲染模态框内容
    content.innerHTML = `
        <div class="multi-select-header"><h3 id="export-settings-modal-title">${langDict.exportModalTitle}</h3><button class="close-btn" id="close-export-modal-btn">✖</button></div>
        <p>${langDict.exportItems}</p>
        <div style="margin: 1rem 0;">
            <div><label style="cursor:pointer; font-weight: bold;"><input type="checkbox" id="export-select-all" checked> ${langDict.selectAll}</label></div>
            <hr class="divider" style="margin: 0.75rem 0;">
            ${checkboxesHTML}
        </div>
        <div id="export-result-container" class="hidden" style="margin-top:1.5rem;">
            <p><strong>${langDict.exportResultTitle}</strong></p>
            <textarea id="export-code-textarea" readonly style="width: 100%; height: 100px; resize: vertical;"></textarea>
        </div>
        <div class="multi-select-footer">
            <button class="action-button" id="generate-export-code-btn">${langDict.exportSelected}</button>
            <button class="action-button hidden" id="save-to-file-btn">${langDict.saveToFile}</button>
        </div>`;

    modal.classList.remove('hidden');
    cancelModalClose(modal);
    modal.showModal();
    history.pushState({ modal: 'exportSettings' }, null);
    state.modalStack.push('exportSettings');
}



/**
 * 打开导入设置模态框。
 */
function openImportModal() {
    const modal = document.getElementById('import-settings-modal');
    const content = document.getElementById('import-settings-modal-content');
    if (!modal || !content || modal.open) return;

    state._tempImportedSettings = null; // 清空临时数据
    const langDict = i18n[state.currentLang] || {};

    content.innerHTML = `
        <div class="multi-select-header"><h3 id="import-settings-modal-title">${langDict.importModalTitle}</h3><button class="close-btn" id="close-import-modal-btn">✖</button></div>
        <p>${langDict.importInstructions}</p>
        <textarea id="import-settings-textarea" style="width: 100%; height: 120px; resize: vertical;"></textarea>
        <input type="file" id="file-importer-input" class="hidden" accept=".txt,text/plain">
        <div class="multi-select-footer" style="justify-content: center; gap: 1rem;">
            <button class="action-button" id="import-from-file-btn">${langDict.importFromFile}</button>
            <button class="action-button" id="analyze-import-code-btn">${langDict.analyzeCode}</button>
        </div>
        <div id="import-options-container" class="hidden" style="margin-top:1rem;"></div>`;

    modal.classList.remove('hidden');
    cancelModalClose(modal);
    modal.showModal();
    history.pushState({ modal: 'importSettings' }, null);
    state.modalStack.push('importSettings');
}

/**
 * 处理“生成导出代码”按钮的点击事件。
 */
function handleGenerateExportCode() {
    const langDict = i18n[state.currentLang] || {};
    const content = document.getElementById('export-settings-modal-content');
    if (!content) return;

    const selectedKeys = new Set(
        Array.from(content.querySelectorAll('.export-item-checkbox:checked')).map(cb => cb.dataset.key)
    );
    if (selectedKeys.size === 0) {
        alert(langDict.noDataToExport);
        return;
    }

    const settingsToExport = buildExportPayload(selectedKeys);
    if (Object.keys(settingsToExport).length === 0) {
        alert(langDict.noDataToExport);
        return;
    }

    const jsonString = JSON.stringify(settingsToExport);
    const compressedString = (typeof LZString !== 'undefined' && typeof LZString.compressToEncodedURIComponent === 'function')
        ? LZString.compressToEncodedURIComponent(jsonString)
        : jsonString;

    const textarea = document.getElementById('export-code-textarea');
    const resultContainer = document.getElementById('export-result-container');
    const saveButton = document.getElementById('save-to-file-btn');
    if (!textarea || !resultContainer || !saveButton) return;
    textarea.value = compressedString;
    resultContainer.classList.remove('hidden');
    saveButton.classList.remove('hidden');
}

/**
 * 处理“保存到文件”按钮的点击事件。
 */
function handleSaveToFile() {
    const langDict = i18n[state.currentLang] || {};
    const textToSave = document.getElementById('export-code-textarea')?.value;
    if (!textToSave) {
        alert(langDict.noDataToExport || '没有可保存的内容。');
        return;
    }
    const blob = new Blob([textToSave], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const today = new Date();
    const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    a.download = `heroplan_settings_${dateString}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // 部分浏览器要把 revoke 推到下一拍，否则下载可能被取消。
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * 处理“从文件导入”时文件选择的事件。
 * @param {HTMLInputElement} fileInput - 文件输入元素。
 */
function handleFileImport(fileInput) {
    const langDict = i18n[state.currentLang] || {};
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    if (file.size > EXPORT_FILE_MAX_BYTES) {
        alert(langDict.importError || '文件过大，请选择设置导出文件。');
        fileInput.value = null;
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        const textarea = document.getElementById('import-settings-textarea');
        if (textarea) {
            textarea.value = e.target.result || '';
            handleAnalyzeImportCode(); // 读取后自动解析
        }
    };
    reader.onerror = () => alert(langDict.importError || '读取文件时发生错误。');
    reader.readAsText(file);
    fileInput.value = null; // 重置以便可以再次选择同名文件
}

/**
 * 处理“解析代码”按钮的点击事件。
 */
async function handleAnalyzeImportCode() {
    const compressedString = document.getElementById('import-settings-textarea')?.value.trim() || '';
    if (!compressedString) return;
    const langDict = i18n[state.currentLang] || {};
    const optionsContainer = document.getElementById('import-options-container');

    const imported = parseImportCode(compressedString);
    if (!imported) {
        state._tempImportedSettings = null;
        if (optionsContainer) {
            optionsContainer.classList.add('hidden');
            optionsContainer.innerHTML = '';
        }
        alert(langDict.noDataInCode);
        return;
    }

    state._tempImportedSettings = imported;

    // 队伍数据可能来自懒加载模块；先补齐再解码统计。
    if (Object.prototype.hasOwnProperty.call(imported, 'savedTeams')) {
        await ensureTeamStorageReady();
    }

    const dataSources = buildImportDataSources(imported, langDict);
    if (!Object.values(dataSources).some(item => item.count > 0)) {
        state._tempImportedSettings = null;
        if (optionsContainer) {
            optionsContainer.classList.add('hidden');
            optionsContainer.innerHTML = '';
        }
        alert(langDict.noDataInCode);
        return;
    }

    if (!optionsContainer) return;

    const checkboxesHTML = Object.entries(dataSources).map(([key, { name, count }]) => {
        if (count > 0) return `<div><label><input type="checkbox" class="import-item-checkbox" data-key="${key}" checked> ${name} <span>(${count})</span></label></div>`;
        return '';
    }).join('');

    optionsContainer.innerHTML = `
        <p><strong>${langDict.importItems}</strong></p>
        <div><label><input type="checkbox" id="import-select-all" checked> ${langDict.selectAll}</label></div>
        <hr>${checkboxesHTML}
        <div style="margin-top: 1rem;"><label><input type="radio" name="import-mode" value="append" checked> ${langDict.importModeAppend}</label></div>
        <div><label><input type="radio" name="import-mode" value="overwrite"> ${langDict.importModeOverwrite}</label></div>
        <div class="multi-select-footer"><button class="action-button" id="confirm-import-btn">${langDict.importSelected}</button></div>`;
    optionsContainer.classList.remove('hidden');
}

/**
 * 把已解析的导入数据写回 localStorage / Cookie。
 * 返回追加模式下的新增数量，供成功提示复用。
 */
function applyImportedSettings(imported, selectedKeys, mode) {
    const counters = { favorites: 0, teams: 0, colors: 0 };
    const has = key => Object.prototype.hasOwnProperty.call(imported, key);

    if (selectedKeys.has('heroFavorites') && has('heroFavorites')) {
        const importedFavs = normalizeFavoritesPayload(imported.heroFavorites);
        if (mode === 'append') {
            const existing = getFavorites();
            const originalSize = new Set(existing).size;
            const merged = new Set([...existing, ...importedFavs]);
            counters.favorites = merged.size - originalSize;
            if (counters.favorites > 0) {
                saveFavorites(Array.from(merged));
                invalidateFavoritesCache();
            }
        } else {
            saveFavorites(importedFavs);
            invalidateFavoritesCache();
            counters.favorites = importedFavs.length;
        }
    }

    if (selectedKeys.has('savedTeams') && has('savedTeams')) {
        const importedTeams = normalizeTeamsPayload(imported.savedTeams);
        if (mode === 'append') {
            const existing = getSavedTeams();
            const existingNames = new Set(existing.map(team => team.name));
            importedTeams.forEach(team => {
                if (!existingNames.has(team.name)) {
                    existing.push(team);
                    existingNames.add(team.name);
                    counters.teams++;
                }
            });
            if (counters.teams > 0) saveTeams(existing);
        } else {
            saveTeams(importedTeams);
            counters.teams = importedTeams.length;
        }
    }

    if (selectedKeys.has('favoriteColors') && has('favoriteColors')) {
        const importedColors = normalizeColorPayload(imported.favoriteColors);
        if (mode === 'append') {
            const existing = normalizeColorPayload(getCookieJSON('favoriteColors', []));
            const originalSize = new Set(existing).size;
            const merged = new Set([...existing, ...importedColors]);
            counters.colors = merged.size - originalSize;
            if (counters.colors > 0) setCookieJSON('favoriteColors', Array.from(merged), 365);
        } else {
            setCookieJSON('favoriteColors', importedColors, 365);
            counters.colors = importedColors.length;
        }
    }

    if (selectedKeys.has('otherSettings')) {
        collectImportedOtherKeys(imported).forEach(key => {
            if (!has(key)) return;
            const value = normalizeCookieValue(imported[key]);
            if (value !== null) setCookie(key, value, 365);
        });
    }

    return counters;
}

/**
 * 处理“确认导入”按钮的点击事件。
 */
async function handleImportConfirm() {
    const langDict = i18n[state.currentLang] || {};
    if (!state._tempImportedSettings) {
        alert(langDict.importError);
        return;
    }

    await ensureTeamStorageReady();

    const content = document.getElementById('import-settings-modal-content');
    if (!content) return;

    const selectedKeys = new Set(
        Array.from(content.querySelectorAll('.import-item-checkbox:checked')).map(cb => cb.dataset.key)
    );
    if (selectedKeys.size === 0) {
        alert(langDict.importError);
        return;
    }

    const mode = content.querySelector('input[name="import-mode"]:checked')?.value === 'overwrite'
        ? 'overwrite'
        : 'append';

    let counters;
    try {
        counters = applyImportedSettings(state._tempImportedSettings, selectedKeys, mode);
    } catch (e) {
        console.error('[import-export] 应用导入设置失败', e);
        alert(langDict.importError);
        return;
    }

    state._tempImportedSettings = null; // 清理临时数据
    const importModal = document.getElementById('import-settings-modal');
    if (importModal) {
        if (importModal.open) importModal.close();
        importModal.classList.add('hidden');
    }
    const successText = typeof langDict.importSettingsSuccess === 'function'
        ? langDict.importSettingsSuccess(mode, counters)
        : langDict.importError;
    alert(successText);
    window.location.reload(); // 刷新页面以应用所有设置
}
/**
 * 初始化「打开游戏英雄列表」：按钮 → 触发隐藏的 .eva1 文件选择框。
 * 在 `main.js` 的 `initializeApp` 里调用一次。
 */
function initializeOpenGameHeroes() {
    const btn = uiElements.openGameHeroesBtn;
    const input = uiElements.eva1ImporterInput;
    if (!btn || !input) return;
    btn.addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        if (file) handleEva1File(file);
        input.value = null;   // 重置：允许再次选择同名文件
    });
}

/**
 * 读取并解析玩家选择的 `.eva1` 存档，然后应用「只列已拥有英雄」的过滤。
 * @param {File} file - 玩家的 .eva1 存档文件。
 */
function handleEva1File(file) {
    const langDict = i18n[state.currentLang] || {};
    if (typeof Eva1Parser === 'undefined' || typeof Eva1Parser.parseEva1 !== 'function') {
        alert(langDict.gameHeroesParserMissing || '解析模块未加载，请刷新页面后重试。');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const parsed = Eva1Parser.parseEva1(e.target.result);
            applyOwnedHeroesFilter(parsed);
        } catch (err) {
            console.error('[eva1] 解析失败', err);
            alert(langDict.gameHeroesParseFailed || '无法解析该存档文件，请确认选择的是游戏的 .eva1 存档。');
        }
    };
    reader.onerror = () => alert(langDict.gameHeroesReadFailed || '读取文件失败，请重试。');
    reader.readAsArrayBuffer(file);
}

/**
 * 应用「游戏英雄列表」过滤：把解析出的已拥有 ID 存进 `state.temporaryOwnedHeroes`，
 * 关闭搜索页，然后重渲染（只列存档内英雄、排除 1~2 星）。
 *
 * ⚠ 顺序：必须**先** `resetAllFilters()`（它会清 `temporaryOwnedHeroes`），**再**赋值 ⇒
 *   顺序反了会静默失效。
 * @param {{ownedIds: string[]}} parsed - `Eva1Parser.parseEva1` 的返回值。
 */
function applyOwnedHeroesFilter(parsed) {
    if (!parsed || !parsed.ownedIds) return;
    const langDict = i18n[state.currentLang] || {};

    resetAllFilters();
    state.temporaryOwnedHeroes = new Set(parsed.ownedIds);

    // 关闭搜索页（复用既有模态框出栈逻辑）
    if (typeof closeFiltersModal === 'function') closeFiltersModal();

    applyFiltersAndRender();

    const total = parsed.ownedIds.length;
    const shown = state.filteredHeroes.length;
    const low = total - shown;
    if (typeof langDict.gameHeroesLoaded === 'function') {
        alert(langDict.gameHeroesLoaded(shown, total, low));
    }
}
