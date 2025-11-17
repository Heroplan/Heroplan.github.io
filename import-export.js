// import-export.js: 管理所有与设置导入和导出相关的功能。

/**
 * 初始化导出设置模态框的所有事件监听器。
 * 使用事件委托来处理动态生成的内容。
 */
function initializeExportModalListeners() {
    const modal = document.getElementById('export-settings-modal');
    const overlay = document.getElementById('export-settings-modal-overlay');
    const content = document.getElementById('export-settings-modal-content');

    if (!modal || !overlay || !content) return;

    // 关闭模态框的通用函数
    const closeModal = () => { if (!modal.classList.contains('hidden')) history.back(); };
    overlay.addEventListener('click', closeModal);
    content.addEventListener('click', e => e.stopPropagation()); // 阻止事件冒泡到遮罩层

    // 使用事件委托处理所有点击事件
    content.addEventListener('click', (event) => {
        const target = event.target;
        if (target.id === 'close-export-modal-btn') closeModal();
        else if (target.id === 'generate-export-code-btn') handleGenerateExportCode();
        else if (target.id === 'save-to-file-btn') handleSaveToFile();
        else if (target.id === 'export-select-all') {
            content.querySelectorAll('.export-item-checkbox').forEach(cb => cb.checked = target.checked);
        }
    });

    // 处理复选框的全选/取消全选联动
    content.addEventListener('change', (event) => {
        if (event.target.classList.contains('export-item-checkbox')) {
            document.getElementById('export-select-all').checked = Array.from(content.querySelectorAll('.export-item-checkbox')).every(c => c.checked);
        }
    });
}

/**
 * 初始化导入设置模态框的所有事件监听器。
 */
function initializeImportModalListeners() {
    const modal = document.getElementById('import-settings-modal');
    const overlay = document.getElementById('import-settings-modal-overlay');
    const content = document.getElementById('import-settings-modal-content');
    if (!modal || !overlay || !content) return;

    const closeModal = () => { if (!modal.classList.contains('hidden')) history.back(); };
    overlay.addEventListener('click', closeModal);
    content.addEventListener('click', e => e.stopPropagation());

    // 使用事件委托处理所有点击事件
    content.addEventListener('click', (event) => {
        const target = event.target;
        if (target.id === 'close-import-modal-btn') closeModal();
        else if (target.id === 'import-from-file-btn') document.getElementById('file-importer-input')?.click();
        else if (target.id === 'analyze-import-code-btn') handleAnalyzeImportCode();
        else if (target.id === 'confirm-import-btn') handleImportConfirm();
    });

    // 使用事件委托处理change事件（主要用于文件输入和复选框）
    content.addEventListener('change', (event) => {
        const target = event.target;
        if (target.id === 'file-importer-input') handleFileImport(target);
        else if (target.id === 'import-select-all') {
            content.querySelectorAll('.import-item-checkbox').forEach(cb => cb.checked = target.checked);
        }
        else if (target.classList.contains('import-item-checkbox')) {
            document.getElementById('import-select-all').checked = Array.from(content.querySelectorAll('.import-item-checkbox')).every(c => c.checked);
        }
    });
}

// 导入导出使用的Cookie键名
const otherSettingKeys = [
    'theme', 'language', 'defaultLB', 'defaultTalent', 'defaultTalentStrategy',
    'defaultManaPriority', 'showLbTalentDetails', 'enableSkillQuickSearch',
    'skillTypeSource', 'showEventNameState', 'chatPreviewHeight',
    'teamDisplayCollapsed', 'collapseStates',
    'chatPanelColorsCollapsed', 'chatPanelEmojisCollapsed', 'highlightSkillTerms',
    'hideDonate', 'showSkillTypesInDetails', 'showSkillTypesInTeam'
];
/**
 * 打开导出设置模态框，并根据可导出的数据动态生成内容。
 */
function openExportModal() {
    const modal = document.getElementById('export-settings-modal');
    const overlay = document.getElementById('export-settings-modal-overlay');
    const content = document.getElementById('export-settings-modal-content');
    if (!modal || !overlay || !content) return;

    const langDict = i18n[state.currentLang];

    // 检查有哪些数据可以导出
    const dataSources = {
        heroFavorites: { name: langDict.setting_heroFavorites, count: (localStorage.getItem('heroFavorites') ? JSON.parse(localStorage.getItem('heroFavorites')) : []).length, storage: 'localStorage' },
        savedTeams: { name: langDict.setting_savedTeams, count: (getCookie('savedTeams') ? JSON.parse(getCookie('savedTeams')) : []).length, storage: 'cookie' },
        favoriteColors: { name: langDict.setting_favoriteColors, count: (getCookie('favoriteColors') ? JSON.parse(getCookie('favoriteColors')) : []).length, storage: 'cookie' },
        otherSettings: { name: langDict.setting_otherSettings, count: otherSettingKeys.filter(key => getCookie(key) !== null).length, storage: 'cookie' }
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
        <div class="multi-select-header"><h3>${langDict.exportModalTitle}</h3><button class="close-btn" id="close-export-modal-btn">✖</button></div>
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
    overlay.classList.remove('hidden');
    history.pushState({ modal: 'exportSettings' }, null);
    state.modalStack.push('exportSettings');
}



/**
 * 打开导入设置模态框。
 */
function openImportModal() {
    const modal = document.getElementById('import-settings-modal');
    const overlay = document.getElementById('import-settings-modal-overlay');
    const content = document.getElementById('import-settings-modal-content');
    if (!modal) return;

    state._tempImportedSettings = null; // 清空临时数据
    const langDict = i18n[state.currentLang];

    content.innerHTML = `
        <div class="multi-select-header"><h3>${langDict.importModalTitle}</h3><button class="close-btn" id="close-import-modal-btn">✖</button></div>
        <p>${langDict.importInstructions}</p>
        <textarea id="import-settings-textarea" style="width: 100%; height: 120px; resize: vertical;"></textarea>
        <input type="file" id="file-importer-input" class="hidden" accept=".txt,text/plain">
        <div class="multi-select-footer" style="justify-content: center; gap: 1rem;">
            <button class="action-button" id="import-from-file-btn">${langDict.importFromFile}</button>
            <button class="action-button" id="analyze-import-code-btn">${langDict.analyzeCode}</button>
        </div>
        <div id="import-options-container" class="hidden" style="margin-top:1rem;"></div>`;

    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
    history.pushState({ modal: 'importSettings' }, null);
    state.modalStack.push('importSettings');
}

/**
 * 处理“生成导出代码”按钮的点击事件。
 */
function handleGenerateExportCode() {
    const langDict = i18n[state.currentLang];
    const dataSources = {
        heroFavorites: { storage: 'localStorage' },
        savedTeams: { storage: 'cookie' },
        favoriteColors: { storage: 'cookie' },
        otherSettings: { storage: 'cookie' }
    };

    const settingsToExport = {};
    document.querySelectorAll('.export-item-checkbox:checked').forEach(cb => {
        const key = cb.dataset.key;
        if (key === 'otherSettings') {
            otherSettingKeys.forEach(settingKey => {
                const value = getCookie(settingKey);
                if (value !== null) settingsToExport[settingKey] = value;
            });
        } else {
            const source = dataSources[key];
            const value = source.storage === 'localStorage' ? localStorage.getItem(key) : getCookie(key);
            if (value) settingsToExport[key] = value;
        }
    });

    const jsonString = JSON.stringify(settingsToExport);
    const compressedString = LZString.compressToEncodedURIComponent(jsonString);

    document.getElementById('export-code-textarea').value = compressedString;
    document.getElementById('export-result-container').classList.remove('hidden');
    document.getElementById('save-to-file-btn').classList.remove('hidden');
}

/**
 * 处理“保存到文件”按钮的点击事件。
 */
function handleSaveToFile() {
    const textToSave = document.getElementById('export-code-textarea').value;
    if (!textToSave) { alert('没有可保存的内容。'); return; }
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
    URL.revokeObjectURL(url);
}

/**
 * 处理“从文件导入”时文件选择的事件。
 * @param {HTMLInputElement} fileInput - 文件输入元素。
 */
function handleFileImport(fileInput) {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('import-settings-textarea').value = e.target.result;
        handleAnalyzeImportCode(); // 读取后自动解析
    };
    reader.onerror = () => alert('读取文件时发生错误。');
    reader.readAsText(file);
    fileInput.value = null; // 重置以便可以再次选择同名文件
}

/**
 * 处理“解析代码”按钮的点击事件。
 */
function handleAnalyzeImportCode() {
    const compressedString = document.getElementById('import-settings-textarea').value.trim();
    if (!compressedString) return;
    const langDict = i18n[state.currentLang];

    try {
        const jsonString = LZString.decompressFromEncodedURIComponent(compressedString);
        state._tempImportedSettings = JSON.parse(jsonString);
        if (typeof state._tempImportedSettings !== 'object' || state._tempImportedSettings === null) throw new Error("Invalid data");
    } catch (e) {
        alert(langDict.noDataInCode);
        state._tempImportedSettings = null;
        return;
    }

    const { setting_heroFavorites, setting_savedTeams, setting_favoriteColors, setting_otherSettings } = langDict;
    const dataSources = {
        heroFavorites: { name: setting_heroFavorites, count: (state._tempImportedSettings.heroFavorites ? JSON.parse(state._tempImportedSettings.heroFavorites) : []).length },
        savedTeams: { name: setting_savedTeams, count: (state._tempImportedSettings.savedTeams ? JSON.parse(state._tempImportedSettings.savedTeams) : []).length },
        favoriteColors: { name: setting_favoriteColors, count: (state._tempImportedSettings.favoriteColors ? JSON.parse(state._tempImportedSettings.favoriteColors) : []).length },
        otherSettings: { name: setting_otherSettings, count: Object.keys(state._tempImportedSettings).filter(k => k !== 'heroFavorites' && k !== 'savedTeams' && k !== 'favoriteColors').length }
    };

    if (!Object.values(dataSources).some(item => item.count > 0)) {
        alert(langDict.noDataInCode); return;
    }

    let checkboxesHTML = Object.entries(dataSources).map(([key, { name, count }]) => {
        if (count > 0) return `<div><label><input type="checkbox" class="import-item-checkbox" data-key="${key}" checked> ${name} <span>(${count})</span></label></div>`;
        return '';
    }).join('');

    const optionsContainer = document.getElementById('import-options-container');
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
 * 处理“确认导入”按钮的点击事件。
 */
function handleImportConfirm() {
    const langDict = i18n[state.currentLang];
    if (!state._tempImportedSettings) {
        alert(langDict.importError);
        return;
    }

    const mode = document.querySelector('input[name="import-mode"]:checked').value;
    const counters = { favorites: 0, teams: 0, colors: 0 };

    const selectedKeys = new Set();
    document.querySelectorAll('.import-item-checkbox:checked').forEach(cb => selectedKeys.add(cb.dataset.key));

    if (selectedKeys.has('otherSettings')) {
        otherSettingKeys.forEach(key => selectedKeys.add(key));
    }

    for (const key of selectedKeys) {
        if (!state._tempImportedSettings.hasOwnProperty(key)) continue;
        const importedValueStr = state._tempImportedSettings[key];

        if (key === 'heroFavorites') {
            if (mode === 'append') {
                const existing = getFavorites();
                const imported = JSON.parse(importedValueStr);
                const originalSize = new Set(existing).size;
                const merged = new Set([...existing, ...imported]);
                counters.favorites = merged.size - originalSize;
                saveFavorites(Array.from(merged));
            } else {
                saveFavorites(JSON.parse(importedValueStr));
            }
        } else if (key === 'savedTeams' || key === 'favoriteColors') {
            if (mode === 'append') {
                const existing = getCookie(key) ? JSON.parse(getCookie(key)) : [];
                const imported = JSON.parse(importedValueStr);
                if (key === 'savedTeams') {
                    const existingNames = new Set(existing.map(t => t.name));
                    imported.forEach(team => { if (team.name && !existingNames.has(team.name)) { existing.push(team); counters.teams++; } });
                    saveTeams(existing);
                } else {
                    const originalSize = new Set(existing).size;
                    const merged = new Set([...existing, ...imported]);
                    counters.colors = merged.size - originalSize;
                    setCookie(key, JSON.stringify(Array.from(merged)), 365);
                }
            } else {
                setCookie(key, importedValueStr, 365);
            }
        } else if (otherSettingKeys.includes(key)) {
            setCookie(key, importedValueStr, 365);
        }
    }

    state._tempImportedSettings = null; // 清理临时数据
    document.getElementById('import-settings-modal').classList.add('hidden');
    document.getElementById('import-settings-modal-overlay').classList.add('hidden');
    alert(langDict.importSettingsSuccess(mode, counters));
    window.location.reload(); // 刷新页面以应用所有设置
}