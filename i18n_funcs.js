/* i18n_funcs.js —— language.js 里**函数型**的 i18n 条目（JSON 无法序列化，故单独放这里）。
 * 由 _tools/gen_i18n_funcs.js 从 _archive/language.js 自动导出；
 * langs.js 在载入 i18n_<码>.json 之后把它们合并进 window.i18n[<码>]。
 * 共 300 个键 × 20 语言。 */
window.I18N_FUNCS = {
  "cn": {
    "importSettingsSuccess": (mode, counts) => { // 【新增】用于设置导入的成功提示
            if (mode === 'overwrite') {
                return '设置已成功覆盖导入！页面即将刷新以应用更改。';
            }
            // 追加模式
            const messages = [];
            if (counts.favorites > 0) messages.push(`新增 ${counts.favorites} 个收藏英雄`);
            if (counts.teams > 0) messages.push(`新增 ${counts.teams} 个队伍`);
            if (counts.colors > 0) messages.push(`新增 ${counts.colors} 个收藏颜色`);

            if (messages.length === 0) {
                return '导入完成，没有新增项目。页面即将刷新。';
            }
            return `设置已成功追加导入！\n${messages.join('，')}。\n页面即将刷新以应用更改。`;
        },
    "resultsCountTextFiltered": (count) => `已筛选 ${count} 位英雄`,
    "resultsCountTextUnfiltered": (count) => `${count} 位英雄 (包含服装)`,
    "resultsCountTextHeroOnly": (count) => `${count} 位英雄 (不含服装)`,
    "resultsCountTextCostumeOnly": (count) => `${count} 件服装`,
    "favoritesListCount": (count) => `收藏列表共 ${count} 位英雄`,
    "modalFamilyBonus": (family) => family ? `👪 家族奖励 (${family}):` : `👪 家族奖励:`,
    "confirmRemoveTeam": (name) => `您确定要移除队伍 "${name}" 吗？`,
    "importSuccess": (teamName) => `队伍 "${teamName}" 已成功导入！`,
    "importConfirmOverwrite": (teamName) => `队伍 "${teamName}" 已存在。您想覆盖它吗？`,
    "importEnterNewName": (teamName) => `队伍 "${teamName}" 已存在。请输入一个新的名称以导入：`,
    "summonHistoryTitleCurrent": (poolName, count) => `${poolName} 召唤记录 (共 ${count} 次)`,
    "superElementalExclusionNotice": (days) => `* 不包含${days}天内发布的非活动家族英雄`,
    "totalHeroesCountText": (count) => `(共 ${count} 位)`,
    "latestHeroAgeNotice": (days) => `* 仅包含 ${days} 天内发布的英雄和服装`
  },
  "tc": {
    "importSettingsSuccess": (mode, counts) => { // 【新增】
            if (mode === 'overwrite') {
                return '設定已成功覆蓋導入！頁面即將刷新以應用更改。';
            }
            // 追加模式
            const messages = [];
            if (counts.favorites > 0) messages.push(`新增 ${counts.favorites} 個收藏英雄`);
            if (counts.teams > 0) messages.push(`新增 ${counts.teams} 個隊伍`);
            if (counts.colors > 0) messages.push(`新增 ${counts.colors} 個收藏顏色`);

            if (messages.length === 0) {
                return '導入完成，沒有新增項目。頁面即將刷新。';
            }
            return `設定已成功追加導入！\n${messages.join('，')}。\n頁面即將刷新以應用更改。`;
        },
    "resultsCountTextFiltered": (count) => `已篩選 ${count} 位英雄`,
    "resultsCountTextUnfiltered": (count) => `${count} 位英雄 (包含服裝)`,
    "resultsCountTextHeroOnly": (count) => `${count} 位英雄 (不含服裝)`,
    "resultsCountTextCostumeOnly": (count) => `${count} 件服裝`,
    "favoritesListCount": (count) => `收藏清單共 ${count} 位英雄`,
    "modalFamilyBonus": (family) => family ? `👪 家族獎勵 (${family}):` : `👪 家族獎勵:`,
    "confirmRemoveTeam": (name) => `您確定要移除隊伍 "${name}" 嗎？`,
    "importSuccess": (teamName) => `隊伍 "${teamName}" 已成功匯入！`,
    "importConfirmOverwrite": (teamName) => `隊伍 "${teamName}" 已存在。您想覆蓋它嗎？`,
    "importEnterNewName": (teamName) => `隊伍 "${teamName}" 已存在。請輸入一個新的名稱以匯入：`,
    "summonHistoryTitleCurrent": (poolName, count) => `${poolName} 召喚記錄 (共 ${count} 次)`,
    "superElementalExclusionNotice": (days) => `* 不包含${days}天內發佈的非活動家族英雄`,
    "totalHeroesCountText": (count) => `(共 ${count} 位)`,
    "latestHeroAgeNotice": (days) => `* 僅包含 ${days} 天內發佈的英雄和服裝`
  },
  "en": {
    "importSettingsSuccess": (mode, counts) => { // 【新增】
            if (mode === 'overwrite') {
                return 'Settings have been successfully overwritten! The page will now reload to apply changes.';
            }
            // Append mode
            const messages = [];
            if (counts.favorites > 0) messages.push(`Added ${counts.favorites} favorite heroes`);
            if (counts.teams > 0) messages.push(`Added ${counts.teams} teams`);
            if (counts.colors > 0) messages.push(`Added ${counts.colors} favorite colors`);

            if (messages.length === 0) {
                return 'Import complete, no new items were added. The page will now reload.';
            }
            return `Settings successfully appended!\n${messages.join(', ')}.\nThe page will now reload to apply changes.`;
        },
    "resultsCountTextFiltered": (count) => `filtered ${count} Heroes`,
    "resultsCountTextUnfiltered": (count) => `${count} Heroes (Included Costumes)`,
    "resultsCountTextHeroOnly": (count) => `${count} Heroes (Excluded Costumes)`,
    "resultsCountTextCostumeOnly": (count) => `${count} Costumes`,
    "favoritesListCount": (count) => `${count} heroes in the favorites list`,
    "modalFamilyBonus": (family) => family ? `👪 Family Bonuses (${family}):` : `👪 Family Bonuses:`,
    "confirmRemoveTeam": (name) => `Are you sure you want to remove the team "${name}"?`,
    "importSuccess": (teamName) => `Team "${teamName}" imported successfully!`,
    "importConfirmOverwrite": (teamName) => `Team "${teamName}" already exists. Overwrite it?`,
    "importEnterNewName": (teamName) => `Team "${teamName}" already exists. Please enter a new name to import:`,
    "summonHistoryTitleCurrent": (poolName, count) => `${poolName} Summon History (Total ${count} pulls)`,
    "superElementalExclusionNotice": (days) => `* Does not include non-event family heroes released within ${days} days`,
    "totalHeroesCountText": (count) => `(Total ${count})`,
    "latestHeroAgeNotice": (days) => `* Only includes heroes and costumes released within ${days} days`
  },
  "pl": {
    "importSettingsSuccess": (mode, counts) => {
            if (mode === 'overwrite') {
                return 'Ustawienia zostały pomyślnie nadpisane! Strona zostanie teraz odświeżona, aby zastosować zmiany.';
            }
            const messages = [];
            if (counts.favorites > 0) messages.push(`Dodano ${counts.favorites} ulubionych bohaterów`);
            if (counts.teams > 0) messages.push(`Dodano ${counts.teams} drużyn`);
            if (counts.colors > 0) messages.push(`Dodano ${counts.colors} ulubionych kolorów`);

            if (messages.length === 0) {
                return 'Import zakończony, nie dodano nowych elementów. Strona zostanie odświeżona.';
            }
            return `Ustawienia pomyślnie dołączone!\n${messages.join(', ')}.\nStrona zostanie odświeżona, aby zastosować zmiany.`;
        },
    "resultsCountTextFiltered": (count) => `odfiltrowano ${count} bohaterów`,
    "resultsCountTextUnfiltered": (count) => `${count} Bohaterów (z kostiumami)`,
    "resultsCountTextHeroOnly": (count) => `${count} Bohaterów (bez kostiumów)`,
    "resultsCountTextCostumeOnly": (count) => `${count} Kostiumów`,
    "favoritesListCount": (count) => `${count} bohaterów na liście ulubionych`,
    "modalFamilyBonus": (family) => family ? `👪 Bonusy Rodzinne (${family}):` : `👪 Bonusy Rodzinne:`,
    "confirmRemoveTeam": (name) => `Czy na pewno chcesz usunąć drużynę "${name}"?`,
    "importSuccess": (teamName) => `Drużyna "${teamName}" zaimportowana pomyślnie!`,
    "importConfirmOverwrite": (teamName) => `Drużyna "${teamName}" już istnieje. Czy chcesz ją nadpisać?`,
    "importEnterNewName": (teamName) => `Drużyna "${teamName}" już istnieje. Wpisz nową nazwę do importu:`,
    "summonHistoryTitleCurrent": (poolName, count) => `Historia losowań: ${poolName} (Razem ${count} prób)`,
    "superElementalExclusionNotice": (days) => `* Nie obejmuje bohaterów rodzin niewydarzeniowych wydanych w ciągu ostatnich ${days} dni`,
    "totalHeroesCountText": (count) => `(Razem ${count})`,
    "latestHeroAgeNotice": (days) => `* Obejmuje tylko bohaterów i kostiumy wydane w ciągu ostatnich ${days} dni`
  },
  "ar": {
    "importSettingsSuccess": (mode, counts) => {
            if (mode === 'overwrite') return 'تم استبدال الإعدادات بنجاح! سيتم إعادة تحميل الصفحة لتطبيق التغييرات.';
            const messages = [];
            if (counts.favorites > 0) messages.push(`تمت إضافة ${counts.favorites} بطلًا مفضلاً`);
            if (counts.teams > 0) messages.push(`تمت إضافة ${counts.teams} فرق`);
            if (counts.colors > 0) messages.push(`تمت إضافة ${counts.colors} لونًا مفضلاً`);
            if (messages.length === 0) return 'اكتمل الاستيراد، لم تتم إضافة عناصر جديدة. سيتم إعادة تحميل الصفحة.';
            return `تم إلحاق الإعدادات بنجاح!\n${messages.join('، ')}.\nسيتم إعادة تحميل الصفحة لتطبيق التغييرات.`;
        },
    "resultsCountTextFiltered": (count) => `تمت تصفية ${count} بطل`,
    "resultsCountTextUnfiltered": (count) => `${count} بطل (بما في ذلك الأزياء)`,
    "resultsCountTextHeroOnly": (count) => `${count} بطل (باستثناء الأزياء)`,
    "resultsCountTextCostumeOnly": (count) => `${count} زي`,
    "favoritesListCount": (count) => `${count} بطل في قائمة المفضلات`,
    "modalFamilyBonus": (family) => family ? `👪 مكافآت العائلة (${family}):` : `👪 مكافآت العائلة:`,
    "confirmRemoveTeam": (name) => `هل أنت متأكد أنك تريد إزالة الفريق "${name}"؟`,
    "importSuccess": (teamName) => `تم استيراد الفريق "${teamName}" بنجاح!`,
    "importConfirmOverwrite": (teamName) => `الفريق "${teamName}" موجود بالفعل. هل تريد استبداله؟`,
    "importEnterNewName": (teamName) => `الفريق "${teamName}" موجود بالفعل. يرجى إدخال اسم جديد للاستيراد:`,
    "summonHistoryTitleCurrent": (poolName, count) => `${poolName} سجل الاستدعاء (إجمالي ${count} عملية سحب)`,
    "superElementalExclusionNotice": (days) => `* لا يشمل أبطال العائلات غير المرتبطة بالأحداث الذين تم إصدارهم خلال ${days} يومًا`,
    "totalHeroesCountText": (count) => `(إجمالي ${count})`,
    "latestHeroAgeNotice": (days) => `* يشمل فقط الأبطال والأزياء التي تم إصدارها خلال ${days} يومًا`
  },
  "da": {
    "importSettingsSuccess": (mode, counts) => {
            if (mode === 'overwrite') return 'Indstillinger er blevet overskrevet! Siden vil genindlæse for at anvende ændringer.';
            const messages = [];
            if (counts.favorites > 0) messages.push(`Tilføjet ${counts.favorites} favorithelte`);
            if (counts.teams > 0) messages.push(`Tilføjet ${counts.teams} hold`);
            if (counts.colors > 0) messages.push(`Tilføjet ${counts.colors} favoritfarver`);
            if (messages.length === 0) return 'Import fuldført, ingen nye elementer tilføjet. Siden genindlæses.';
            return `Indstillinger blevet tilføjet!\n${messages.join(', ')}.\nSiden genindlæses for at anvende ændringer.`;
        },
    "resultsCountTextFiltered": (count) => `filtrerede ${count} helte`,
    "resultsCountTextUnfiltered": (count) => `${count} Helte (inklusive kostumer)`,
    "resultsCountTextHeroOnly": (count) => `${count} Helte (eksklusive kostumer)`,
    "resultsCountTextCostumeOnly": (count) => `${count} Kostumer`,
    "favoritesListCount": (count) => `${count} helte på favoritlisten`,
    "modalFamilyBonus": (family) => family ? `👪 Familie bonusser (${family}):` : `👪 Familie bonusser:`,
    "confirmRemoveTeam": (name) => `Er du sikker på, at du vil fjerne holdet "${name}"?`,
    "importSuccess": (teamName) => `Holdet "${teamName}" blev importeret!`,
    "importConfirmOverwrite": (teamName) => `Holdet "${teamName}" findes allerede. Vil du overskrive det?`,
    "importEnterNewName": (teamName) => `Holdet "${teamName}" findes allerede. Indtast et nyt navn til import:`,
    "summonHistoryTitleCurrent": (poolName, count) => `${poolName} Indkaldelseshistorik (I alt ${count} træk)`,
    "superElementalExclusionNotice": (days) => `* Inkluderer ikke ikke-begivenheds familiehelte udgivet inden for ${days} dage`,
    "totalHeroesCountText": (count) => `(I alt ${count})`,
    "latestHeroAgeNotice": (days) => `* Inkluderer kun helte og kostumer udgivet inden for ${days} dage`
  },
  "nl": {
    "importSettingsSuccess": (mode, counts) => {
            if (mode === 'overwrite') return 'Instellingen zijn succesvol overschreven! De pagina wordt vernieuwd om wijzigingen toe te passen.';
            const messages = [];
            if (counts.favorites > 0) messages.push(`${counts.favorites} favoriete helden toegevoegd`);
            if (counts.teams > 0) messages.push(`${counts.teams} teams toegevoegd`);
            if (counts.colors > 0) messages.push(`${counts.colors} favoriete kleuren toegevoegd`);
            if (messages.length === 0) return 'Import voltooid, geen nieuwe items toegevoegd. De pagina wordt vernieuwd.';
            return `Instellingen succesvol toegevoegd!\n${messages.join(', ')}.\nDe pagina wordt vernieuwd om wijzigingen toe te passen.`;
        },
    "resultsCountTextFiltered": (count) => `${count} helden gefilterd`,
    "resultsCountTextUnfiltered": (count) => `${count} Helden (inclusief kostuums)`,
    "resultsCountTextHeroOnly": (count) => `${count} Helden (exclusief kostuums)`,
    "resultsCountTextCostumeOnly": (count) => `${count} Kostuums`,
    "favoritesListCount": (count) => `${count} helden op de favorietenlijst`,
    "modalFamilyBonus": (family) => family ? `👪 Familiebonussen (${family}):` : `👪 Familiebonussen:`,
    "confirmRemoveTeam": (name) => `Weet u zeker dat u het team "${name}" wilt verwijderen?`,
    "importSuccess": (teamName) => `Team "${teamName}" succesvol geïmporteerd!`,
    "importConfirmOverwrite": (teamName) => `Team "${teamName}" bestaat al. Wilt u het overschrijven?`,
    "importEnterNewName": (teamName) => `Team "${teamName}" bestaat al. Voer een nieuwe naam in om te importeren:`,
    "summonHistoryTitleCurrent": (poolName, count) => `${poolName} Oproepgeschiedenis (Totaal ${count} trekkingen)`,
    "superElementalExclusionNotice": (days) => `* Inclusief geen niet-evenement familiehelden uitgebracht binnen ${days} dagen`,
    "totalHeroesCountText": (count) => `(Totaal ${count})`,
    "latestHeroAgeNotice": (days) => `* Inclusief alleen helden en kostuums uitgebracht binnen ${days} dagen`
  },
  "fi": {
    "importSettingsSuccess": (mode, counts) => {
            if (mode === 'overwrite') return 'Asetukset on korvattu onnistuneesti! Sivu päivitetään muutosten soveltamiseksi.';
            const messages = [];
            if (counts.favorites > 0) messages.push(`Lisätty ${counts.favorites} suosikkisankaria`);
            if (counts.teams > 0) messages.push(`Lisätty ${counts.teams} joukkuetta`);
            if (counts.colors > 0) messages.push(`Lisätty ${counts.colors} suosikkiväriä`);
            if (messages.length === 0) return 'Tuonti valmis, uusia kohteita ei lisätty. Sivu päivitetään.';
            return `Asetukset on lisätty onnistuneesti!\n${messages.join(', ')}.\nSivu päivitetään muutosten soveltamiseksi.`;
        },
    "resultsCountTextFiltered": (count) => `suodatettu ${count} sankaria`,
    "resultsCountTextUnfiltered": (count) => `${count} Sankaria (asut mukaan lukien)`,
    "resultsCountTextHeroOnly": (count) => `${count} Sankaria (asut pois lukien)`,
    "resultsCountTextCostumeOnly": (count) => `${count} Asua`,
    "favoritesListCount": (count) => `${count} sankaria suosikkilistalla`,
    "modalFamilyBonus": (family) => family ? `👪 Perhebonukset (${family}):` : `👪 Perhebonukset:`,
    "confirmRemoveTeam": (name) => `Oletko varma, että haluat poistaa joukkueen "${name}"?`,
    "importSuccess": (teamName) => `Joukkue "${teamName}" tuotu onnistuneesti!`,
    "importConfirmOverwrite": (teamName) => `Joukkue "${teamName}" on jo olemassa. Haluatko korvata sen?`,
    "importEnterNewName": (teamName) => `Joukkue "${teamName}" on jo olemassa. Anna uusi nimi tuontia varten:`,
    "summonHistoryTitleCurrent": (poolName, count) => `${poolName} Kutsumishistoria (Yhteensä ${count} vetoa)`,
    "superElementalExclusionNotice": (days) => `* Ei sisällä ei-tapahtumaperhesankareita, jotka on julkaistu ${days} päivän sisällä`,
    "totalHeroesCountText": (count) => `(Yhteensä ${count})`,
    "latestHeroAgeNotice": (days) => `* Sisältää vain sankarit ja asut, jotka on julkaistu ${days} päivän sisällä`
  },
  "fr": {
    "importSettingsSuccess": (mode, counts) => {
            if (mode === 'overwrite') return 'Les paramètres ont été écrasés avec succès ! La page va se rafraîchir pour appliquer les modifications.';
            const messages = [];
            if (counts.favorites > 0) messages.push(`Ajout de ${counts.favorites} héros favoris`);
            if (counts.teams > 0) messages.push(`Ajout de ${counts.teams} équipes`);
            if (counts.colors > 0) messages.push(`Ajout de ${counts.colors} couleurs favorites`);
            if (messages.length === 0) return 'Importation terminée, aucun nouvel élément ajouté. La page va se rafraîchir.';
            return `Paramètres ajoutés avec succès !\n${messages.join(', ')}.\nLa page va se rafraîchir pour appliquer les modifications.`;
        },
    "resultsCountTextFiltered": (count) => `${count} héros filtrés`,
    "resultsCountTextUnfiltered": (count) => `${count} Héros (costumes inclus)`,
    "resultsCountTextHeroOnly": (count) => `${count} Héros (costumes exclus)`,
    "resultsCountTextCostumeOnly": (count) => `${count} Costumes`,
    "favoritesListCount": (count) => `${count} héros dans la liste des favoris`,
    "modalFamilyBonus": (family) => family ? `👪 Bonus familiaux (${family}) :` : `👪 Bonus familiaux :`,
    "confirmRemoveTeam": (name) => `Êtes-vous sûr de vouloir supprimer l'équipe "${name}" ?`,
    "importSuccess": (teamName) => `L'équipe "${teamName}" a été importée avec succès !`,
    "importConfirmOverwrite": (teamName) => `L'équipe "${teamName}" existe déjà. Voulez-vous l'écraser ?`,
    "importEnterNewName": (teamName) => `L'équipe "${teamName}" existe déjà. Veuillez entrer un nouveau nom à importer :`,
    "summonHistoryTitleCurrent": (poolName, count) => `${poolName} Historique d'invocation (Total ${count} tirages)`,
    "superElementalExclusionNotice": (days) => `* N'inclut pas les héros de famille non événementielle publiés au cours des ${days} derniers jours`,
    "totalHeroesCountText": (count) => `(Total ${count})`,
    "latestHeroAgeNotice": (days) => `* Inclut uniquement les héros et costumes publiés au cours des ${days} derniers jours`
  },
  "de": {
    "importSettingsSuccess": (mode, counts) => {
            if (mode === 'overwrite') return 'Einstellungen wurden erfolgreich überschrieben! Die Seite wird neu geladen, um Änderungen zu übernehmen.';
            const messages = [];
            if (counts.favorites > 0) messages.push(`${counts.favorites} Favoritenhelden hinzugefügt`);
            if (counts.teams > 0) messages.push(`${counts.teams} Teams hinzugefügt`);
            if (counts.colors > 0) messages.push(`${counts.colors} Lieblingsfarben hinzugefügt`);
            if (messages.length === 0) return 'Import abgeschlossen, keine neuen Elemente hinzugefügt. Die Seite wird neu geladen.';
            return `Einstellungen erfolgreich angehängt!\n${messages.join(', ')}.\nDie Seite wird neu geladen, um Änderungen zu übernehmen.`;
        },
    "resultsCountTextFiltered": (count) => `${count} Helden gefiltert`,
    "resultsCountTextUnfiltered": (count) => `${count} Helden (einschließlich Kostüme)`,
    "resultsCountTextHeroOnly": (count) => `${count} Helden (ohne Kostüme)`,
    "resultsCountTextCostumeOnly": (count) => `${count} Kostüme`,
    "favoritesListCount": (count) => `${count} Helden auf der Favoritenliste`,
    "modalFamilyBonus": (family) => family ? `👪 Familienboni (${family}):` : `👪 Familienboni:`,
    "confirmRemoveTeam": (name) => `Sind Sie sicher, dass Sie das Team "${name}" entfernen möchten?`,
    "importSuccess": (teamName) => `Team "${teamName}" wurde erfolgreich importiert!`,
    "importConfirmOverwrite": (teamName) => `Team "${teamName}" ist bereits vorhanden. Möchten Sie es überschreiben?`,
    "importEnterNewName": (teamName) => `Team "${teamName}" ist bereits vorhanden. Bitte geben Sie einen neuen Namen zum Importieren ein:`,
    "summonHistoryTitleCurrent": (poolName, count) => `${poolName} Beschwörungshistorie (Insgesamt ${count} Ziehungen)`,
    "superElementalExclusionNotice": (days) => `* Schließt Nicht-Ereignis-Familienhelden aus, die innerhalb von ${days} Tagen veröffentlicht wurden`,
    "totalHeroesCountText": (count) => `(Insgesamt ${count})`,
    "latestHeroAgeNotice": (days) => `* Enthält nur Helden und Kostüme, die innerhalb von ${days} Tagen veröffentlicht wurden`
  },
  "id": {
    "importSettingsSuccess": (mode, counts) => {
            if (mode === 'overwrite') return 'Pengaturan berhasil ditimpa! Halaman akan dimuat ulang untuk menerapkan perubahan.';
            const messages = [];
            if (counts.favorites > 0) messages.push(`Menambahkan ${counts.favorites} pahlawan favorit`);
            if (counts.teams > 0) messages.push(`Menambahkan ${counts.teams} tim`);
            if (counts.colors > 0) messages.push(`Menambahkan ${counts.colors} warna favorit`);
            if (messages.length === 0) return 'Impor selesai, tidak ada item baru yang ditambahkan. Halaman akan dimuat ulang.';
            return `Pengaturan berhasil ditambahkan!\n${messages.join(', ')}.\nHalaman akan dimuat ulang untuk menerapkan perubahan.`;
        },
    "resultsCountTextFiltered": (count) => `memfilter ${count} pahlawan`,
    "resultsCountTextUnfiltered": (count) => `${count} Pahlawan (termasuk Kostum)`,
    "resultsCountTextHeroOnly": (count) => `${count} Pahlawan (tidak termasuk Kostum)`,
    "resultsCountTextCostumeOnly": (count) => `${count} Kostum`,
    "favoritesListCount": (count) => `${count} pahlawan dalam daftar favorit`,
    "modalFamilyBonus": (family) => family ? `👪 Bonus Keluarga (${family}):` : `👪 Bonus Keluarga:`,
    "confirmRemoveTeam": (name) => `Anda yakin ingin menghapus tim "${name}"?`,
    "importSuccess": (teamName) => `Tim "${teamName}" berhasil diimpor!`,
    "importConfirmOverwrite": (teamName) => `Tim "${teamName}" sudah ada. Apakah Anda ingin menimpanya?`,
    "importEnterNewName": (teamName) => `Tim "${teamName}" sudah ada. Silakan masukkan nama baru untuk diimpor:`,
    "summonHistoryTitleCurrent": (poolName, count) => `${poolName} Riwayat Panggilan (Total ${count} tarikan)`,
    "superElementalExclusionNotice": (days) => `* Tidak termasuk pahlawan keluarga non-acara yang dirilis dalam ${days} hari`,
    "totalHeroesCountText": (count) => `(Total ${count})`,
    "latestHeroAgeNotice": (days) => `* Hanya mencakup pahlawan dan kostum yang dirilis dalam ${days} hari`
  },
  "it": {
    "importSettingsSuccess": (mode, counts) => {
            if (mode === 'overwrite') return 'Impostazioni sovrascritte con successo! La pagina verrà ricaricata per applicare le modifiche.';
            const messages = [];
            if (counts.favorites > 0) messages.push(`Aggiunti ${counts.favorites} eroi preferiti`);
            if (counts.teams > 0) messages.push(`Aggiunte ${counts.teams} squadre`);
            if (counts.colors > 0) messages.push(`Aggiunti ${counts.colors} colori preferiti`);
            if (messages.length === 0) return 'Importazione completata, nessun nuovo elemento aggiunto. La pagina verrà ricaricata.';
            return `Impostazioni aggiunte con successo!\n${messages.join(', ')}.\nLa pagina verrà ricaricata per applicare le modifiche.`;
        },
    "resultsCountTextFiltered": (count) => `filtrati ${count} eroi`,
    "resultsCountTextUnfiltered": (count) => `${count} Eroi (costumi inclusi)`,
    "resultsCountTextHeroOnly": (count) => `${count} Eroi (costumi esclusi)`,
    "resultsCountTextCostumeOnly": (count) => `${count} Costumi`,
    "favoritesListCount": (count) => `${count} eroi nell'elenco dei preferiti`,
    "modalFamilyBonus": (family) => family ? `👪 Bonus famiglia (${family}):` : `👪 Bonus famiglia:`,
    "confirmRemoveTeam": (name) => `Sei sicuro di voler rimuovere la squadra "${name}"?`,
    "importSuccess": (teamName) => `Squadra "${teamName}" importata con successo!`,
    "importConfirmOverwrite": (teamName) => `La squadra "${teamName}" esiste già. Vuoi sovrascriverla?`,
    "importEnterNewName": (teamName) => `La squadra "${teamName}" esiste già. Inserisci un nuovo nome da importare:`,
    "summonHistoryTitleCurrent": (poolName, count) => `${poolName} Cronologia evocazioni (Totale ${count} tentativi)`,
    "superElementalExclusionNotice": (days) => `* Non include eroi famiglia non evento rilasciati negli ultimi ${days} giorni`,
    "totalHeroesCountText": (count) => `(Totale ${count})`,
    "latestHeroAgeNotice": (days) => `* Include solo eroi e costumi rilasciati negli ultimi ${days} giorni`
  },
  "ru": {
    "importSettingsSuccess": (mode, counts) => {
            if (mode === 'overwrite') return 'Настройки успешно перезаписаны! Страница будет перезагружена для применения изменений.';
            const messages = [];
            if (counts.favorites > 0) messages.push(`Добавлено ${counts.favorites} избранных героев`);
            if (counts.teams > 0) messages.push(`Добавлено ${counts.teams} отрядов`);
            if (counts.colors > 0) messages.push(`Добавлено ${counts.colors} любимых цветов`);
            if (messages.length === 0) return 'Импорт завершён, новые элементы не добавлены. Страница будет перезагружена.';
            return `Настройки успешно добавлены!\n${messages.join(', ')}.\nСтраница будет перезагружена для применения изменений.`;
        },
    "resultsCountTextFiltered": (count) => `отфильтровано ${count} героев`,
    "resultsCountTextUnfiltered": (count) => `${count} Героев (включая костюмы)`,
    "resultsCountTextHeroOnly": (count) => `${count} Героев (без костюмов)`,
    "resultsCountTextCostumeOnly": (count) => `${count} Костюмов`,
    "favoritesListCount": (count) => `${count} героев в списке избранного`,
    "modalFamilyBonus": (family) => family ? `👪 Семейные бонусы (${family}):` : `👪 Семейные бонусы:`,
    "confirmRemoveTeam": (name) => `Вы уверены, что хотите удалить отряд "${name}"?`,
    "importSuccess": (teamName) => `Отряд "${teamName}" успешно импортирован!`,
    "importConfirmOverwrite": (teamName) => `Отряд "${teamName}" уже существует. Перезаписать его?`,
    "importEnterNewName": (teamName) => `Отряд "${teamName}" уже существует. Введите новое название для импорта:`,
    "summonHistoryTitleCurrent": (poolName, count) => `${poolName} История призывов (всего ${count} попыток)`,
    "superElementalExclusionNotice": (days) => `* Не включает несобытийных семейных героев, выпущенных в течение ${days} дней`,
    "totalHeroesCountText": (count) => `(Всего ${count})`,
    "latestHeroAgeNotice": (days) => `* Включает только героев и костюмы, выпущенные в течение ${days} дней`
  },
  "ja": {
    "importSettingsSuccess": (mode, counts) => {
            if (mode === 'overwrite') return '設定が正常に上書きされました！変更を適用するためにページがリロードされます。';
            const messages = [];
            if (counts.favorites > 0) messages.push(`${counts.favorites} 人のお気に入りヒーローを追加`);
            if (counts.teams > 0) messages.push(`${counts.teams} チームを追加`);
            if (counts.colors > 0) messages.push(`${counts.colors} 個のお気に入りカラーを追加`);
            if (messages.length === 0) return 'インポートが完了しました。新しい項目は追加されませんでした。ページがリロードされます。';
            return `設定が正常に追加されました！\n${messages.join('、')}。\n変更を適用するためにページがリロードされます。`;
        },
    "resultsCountTextFiltered": (count) => `${count} 人のヒーローをフィルタリング`,
    "resultsCountTextUnfiltered": (count) => `${count} 人のヒーロー（コスチュームを含む）`,
    "resultsCountTextHeroOnly": (count) => `${count} 人のヒーロー（コスチュームを除く）`,
    "resultsCountTextCostumeOnly": (count) => `${count} 着のコスチューム`,
    "favoritesListCount": (count) => `お気に入りリストに ${count} 人のヒーロー`,
    "modalFamilyBonus": (family) => family ? `👪 ファミリーボーナス (${family}):` : `👪 ファミリーボーナス:`,
    "confirmRemoveTeam": (name) => `チーム「${name}」を削除してもよろしいですか？`,
    "importSuccess": (teamName) => `チーム「${teamName}」が正常にインポートされました！`,
    "importConfirmOverwrite": (teamName) => `チーム「${teamName}」は既に存在します。上書きしますか？`,
    "importEnterNewName": (teamName) => `チーム「${teamName}」は既に存在します。インポートする新しい名前を入力してください:`,
    "summonHistoryTitleCurrent": (poolName, count) => `${poolName} 召喚履歴 (合計 ${count} 回の召喚)`,
    "superElementalExclusionNotice": (days) => `* ${days} 日以内にリリースされた非イベントファミリーヒーローは含まれません`,
    "totalHeroesCountText": (count) => `(合計 ${count} 人)`,
    "latestHeroAgeNotice": (days) => `* ${days} 日以内にリリースされたヒーローとコスチュームのみを含みます`
  },
  "ko": {
    "importSettingsSuccess": (mode, counts) => {
            if (mode === 'overwrite') return '설정이 성공적으로 덮어쓰기되었습니다! 변경 사항을 적용하려면 페이지를 새로 고칩니다.';
            const messages = [];
            if (counts.favorites > 0) messages.push(`${counts.favorites}명의 즐겨찾는 영웅 추가됨`);
            if (counts.teams > 0) messages.push(`${counts.teams}개 팀 추가됨`);
            if (counts.colors > 0) messages.push(`${counts.colors}개 즐겨찾는 색상 추가됨`);
            if (messages.length === 0) return '가져오기가 완료되었습니다. 새 항목이 추가되지 않았습니다. 페이지를 새로 고칩니다.';
            return `설정이 성공적으로 추가되었습니다!\n${messages.join(', ')}.\n변경 사항을 적용하려면 페이지를 새로 고칩니다.`;
        },
    "resultsCountTextFiltered": (count) => `${count}명의 영웅 필터링됨`,
    "resultsCountTextUnfiltered": (count) => `${count}명의 영웅 (코스튬 포함)`,
    "resultsCountTextHeroOnly": (count) => `${count}명의 영웅 (코스튬 제외)`,
    "resultsCountTextCostumeOnly": (count) => `${count}개의 코스튬`,
    "favoritesListCount": (count) => `즐겨찾기 목록에 ${count}명의 영웅`,
    "modalFamilyBonus": (family) => family ? `👪 가족 보너스 (${family}):` : `👪 가족 보너스:`,
    "confirmRemoveTeam": (name) => `팀 "${name}"을(를) 제거하시겠습니까?`,
    "importSuccess": (teamName) => `팀 "${teamName}"이(가) 성공적으로 가져와졌습니다!`,
    "importConfirmOverwrite": (teamName) => `팀 "${teamName}"이(가) 이미 존재합니다. 덮어쓰시겠습니까?`,
    "importEnterNewName": (teamName) => `팀 "${teamName}"이(가) 이미 존재합니다. 가져올 새 이름을 입력하세요:`,
    "summonHistoryTitleCurrent": (poolName, count) => `${poolName} 소환 기록 (총 ${count}회)`,
    "superElementalExclusionNotice": (days) => `* ${days}일 이내에 출시된 비이벤트 가족 영웅은 포함되지 않습니다`,
    "totalHeroesCountText": (count) => `(총 ${count}명)`,
    "latestHeroAgeNotice": (days) => `* ${days}일 이내에 출시된 영웅과 코스튬만 포함됩니다`
  },
  "no": {
    "importSettingsSuccess": (mode, counts) => {
            if (mode === 'overwrite') return 'Innstillinger er blitt overskrevet! Siden vil lastes inn på nytt for å bruke endringene.';
            const messages = [];
            if (counts.favorites > 0) messages.push(`Lagt til ${counts.favorites} favoritthelter`);
            if (counts.teams > 0) messages.push(`Lagt til ${counts.teams} lag`);
            if (counts.colors > 0) messages.push(`Lagt til ${counts.colors} favorittfarger`);
            if (messages.length === 0) return 'Import fullført, ingen nye elementer lagt til. Siden vil lastes inn på nytt.';
            return `Innstillinger lagt til!\n${messages.join(', ')}.\nSiden vil lastes inn på nytt for å bruke endringene.`;
        },
    "resultsCountTextFiltered": (count) => `filtrerte ${count} helter`,
    "resultsCountTextUnfiltered": (count) => `${count} Helter (inkludert kostymer)`,
    "resultsCountTextHeroOnly": (count) => `${count} Helter (ekskludert kostymer)`,
    "resultsCountTextCostumeOnly": (count) => `${count} Kostymer`,
    "favoritesListCount": (count) => `${count} helter på favorittlisten`,
    "modalFamilyBonus": (family) => family ? `👪 Familiebonuser (${family}):` : `👪 Familiebonuser:`,
    "confirmRemoveTeam": (name) => `Er du sikker på at du vil fjerne laget "${name}"?`,
    "importSuccess": (teamName) => `Laget "${teamName}" ble importert!`,
    "importConfirmOverwrite": (teamName) => `Laget "${teamName}" finnes allerede. Vil du overskrive det?`,
    "importEnterNewName": (teamName) => `Laget "${teamName}" finnes allerede. Skriv inn et nytt navn for å importere:`,
    "summonHistoryTitleCurrent": (poolName, count) => `${poolName} Påkallingshistorikk (Totalt ${count} trekk)`,
    "superElementalExclusionNotice": (days) => `* Inkluderer ikke ikke-arrangements familiehelter utgitt i løpet av ${days} dager`,
    "totalHeroesCountText": (count) => `(Totalt ${count})`,
    "latestHeroAgeNotice": (days) => `* Inkluderer bare helter og kostymer utgitt i løpet av ${days} dager`
  },
  "pt": {
    "importSettingsSuccess": (mode, counts) => {
            if (mode === 'overwrite') return 'As configurações foram substituídas com sucesso! A página será recarregada para aplicar as alterações.';
            const messages = [];
            if (counts.favorites > 0) messages.push(`Adicionados ${counts.favorites} heróis favoritos`);
            if (counts.teams > 0) messages.push(`Adicionadas ${counts.teams} equipes`);
            if (counts.colors > 0) messages.push(`Adicionadas ${counts.colors} cores favoritas`);
            if (messages.length === 0) return 'Importação concluída, nenhum novo item adicionado. A página será recarregada.';
            return `Configurações adicionadas com sucesso!\n${messages.join(', ')}.\nA página será recarregada para aplicar as alterações.`;
        },
    "resultsCountTextFiltered": (count) => `${count} heróis filtrados`,
    "resultsCountTextUnfiltered": (count) => `${count} Heróis (incluindo trajes)`,
    "resultsCountTextHeroOnly": (count) => `${count} Heróis (excluindo trajes)`,
    "resultsCountTextCostumeOnly": (count) => `${count} Trajes`,
    "favoritesListCount": (count) => `${count} heróis na lista de favoritos`,
    "modalFamilyBonus": (family) => family ? `👪 Bônus de Família (${family}):` : `👪 Bônus de Família:`,
    "confirmRemoveTeam": (name) => `Tem certeza que deseja remover a equipe "${name}"?`,
    "importSuccess": (teamName) => `Equipe "${teamName}" importada com sucesso!`,
    "importConfirmOverwrite": (teamName) => `A equipe "${teamName}" já existe. Deseja substituí-la?`,
    "importEnterNewName": (teamName) => `A equipe "${teamName}" já existe. Digite um novo nome para importar:`,
    "summonHistoryTitleCurrent": (poolName, count) => `${poolName} Histórico de Invocações (Total de ${count} tentativas)`,
    "superElementalExclusionNotice": (days) => `* Não inclui heróis de família não evento lançados nos últimos ${days} dias`,
    "totalHeroesCountText": (count) => `(Total ${count})`,
    "latestHeroAgeNotice": (days) => `* Inclui apenas heróis e trajes lançados nos últimos ${days} dias`
  },
  "es": {
    "importSettingsSuccess": (mode, counts) => {
            if (mode === 'overwrite') return '¡La configuración se ha sobrescrito correctamente! La página se recargará para aplicar los cambios.';
            const messages = [];
            if (counts.favorites > 0) messages.push(`Añadidos ${counts.favorites} héroes favoritos`);
            if (counts.teams > 0) messages.push(`Añadidos ${counts.teams} equipos`);
            if (counts.colors > 0) messages.push(`Añadidos ${counts.colors} colores favoritos`);
            if (messages.length === 0) return 'Importación completada, no se añadieron nuevos elementos. La página se recargará.';
            return `¡Configuración añadida correctamente!\n${messages.join(', ')}.\nLa página se recargará para aplicar los cambios.`;
        },
    "resultsCountTextFiltered": (count) => `${count} héroes filtrados`,
    "resultsCountTextUnfiltered": (count) => `${count} Héroes (incluyendo disfraces)`,
    "resultsCountTextHeroOnly": (count) => `${count} Héroes (excluyendo disfraces)`,
    "resultsCountTextCostumeOnly": (count) => `${count} Disfraces`,
    "favoritesListCount": (count) => `${count} héroes en la lista de favoritos`,
    "modalFamilyBonus": (family) => family ? `👪 Bonificaciones de Familia (${family}):` : `👪 Bonificaciones de Familia:`,
    "confirmRemoveTeam": (name) => `¿Estás seguro de que quieres eliminar el equipo "${name}"?`,
    "importSuccess": (teamName) => `¡Equipo "${teamName}" importado correctamente!`,
    "importConfirmOverwrite": (teamName) => `El equipo "${teamName}" ya existe. ¿Quieres sobrescribirlo?`,
    "importEnterNewName": (teamName) => `El equipo "${teamName}" ya existe. Ingresa un nuevo nombre para importar:`,
    "summonHistoryTitleCurrent": (poolName, count) => `${poolName} Historial de Invocaciones (Total de ${count} tiradas)`,
    "superElementalExclusionNotice": (days) => `* No incluye héroes de familia no evento lanzados en los últimos ${days} días`,
    "totalHeroesCountText": (count) => `(Total ${count})`,
    "latestHeroAgeNotice": (days) => `* Incluye solo héroes y disfraces lanzados en los últimos ${days} días`
  },
  "sv": {
    "importSettingsSuccess": (mode, counts) => {
            if (mode === 'overwrite') return 'Inställningarna har skrivits över! Sidan kommer att laddas om för att tillämpa ändringarna.';
            const messages = [];
            if (counts.favorites > 0) messages.push(`Lade till ${counts.favorites} favorithjältar`);
            if (counts.teams > 0) messages.push(`Lade till ${counts.teams} lag`);
            if (counts.colors > 0) messages.push(`Lade till ${counts.colors} favoritfärger`);
            if (messages.length === 0) return 'Import slutförd, inga nya objekt lades till. Sidan kommer att laddas om.';
            return `Inställningar har lagts till!\n${messages.join(', ')}.\nSidan kommer att laddas om för att tillämpa ändringarna.`;
        },
    "resultsCountTextFiltered": (count) => `filtrerade ${count} hjältar`,
    "resultsCountTextUnfiltered": (count) => `${count} Hjältar (inklusive kostymer)`,
    "resultsCountTextHeroOnly": (count) => `${count} Hjältar (exklusive kostymer)`,
    "resultsCountTextCostumeOnly": (count) => `${count} Kostymer`,
    "favoritesListCount": (count) => `${count} hjältar på favoritlistan`,
    "modalFamilyBonus": (family) => family ? `👪 Familjebonusar (${family}):` : `👪 Familjebonusar:`,
    "confirmRemoveTeam": (name) => `Är du säker på att du vill ta bort laget "${name}"?`,
    "importSuccess": (teamName) => `Lag "${teamName}" importerades framgångsrikt!`,
    "importConfirmOverwrite": (teamName) => `Lag "${teamName}" finns redan. Vill du skriva över det?`,
    "importEnterNewName": (teamName) => `Lag "${teamName}" finns redan. Ange ett nytt namn för att importera:`,
    "summonHistoryTitleCurrent": (poolName, count) => `${poolName} Framkallningshistorik (Totalt ${count} dragningar)`,
    "superElementalExclusionNotice": (days) => `* Inkluderar inte icke-evenemangs familjehjältar som släppts inom ${days} dagar`,
    "totalHeroesCountText": (count) => `(Totalt ${count})`,
    "latestHeroAgeNotice": (days) => `* Inkluderar endast hjältar och kostymer som släppts inom ${days} dagar`
  },
  "tr": {
    "importSettingsSuccess": (mode, counts) => {
            if (mode === 'overwrite') return 'Ayarlar başarıyla üzerine yazıldı! Değişiklikleri uygulamak için sayfa yenilenecek.';
            const messages = [];
            if (counts.favorites > 0) messages.push(`${counts.favorites} favori kahraman eklendi`);
            if (counts.teams > 0) messages.push(`${counts.teams} takım eklendi`);
            if (counts.colors > 0) messages.push(`${counts.colors} favori renk eklendi`);
            if (messages.length === 0) return 'İçe aktarma tamamlandı, yeni öğe eklenmedi. Sayfa yenilenecek.';
            return `Ayarlar başarıyla eklendi!\n${messages.join(', ')}.\nDeğişiklikleri uygulamak için sayfa yenilenecek.`;
        },
    "resultsCountTextFiltered": (count) => `${count} kahraman filtrelendi`,
    "resultsCountTextUnfiltered": (count) => `${count} Kahraman (kostümler dahil)`,
    "resultsCountTextHeroOnly": (count) => `${count} Kahraman (kostümler hariç)`,
    "resultsCountTextCostumeOnly": (count) => `${count} Kostüm`,
    "favoritesListCount": (count) => `Favori listesinde ${count} kahraman`,
    "modalFamilyBonus": (family) => family ? `👪 Aile Bonusları (${family}):` : `👪 Aile Bonusları:`,
    "confirmRemoveTeam": (name) => `"${name}" takımını kaldırmak istediğinizden emin misiniz?`,
    "importSuccess": (teamName) => `"${teamName}" takımı başarıyla içe aktarıldı!`,
    "importConfirmOverwrite": (teamName) => `"${teamName}" takımı zaten mevcut. Üzerine yazmak istiyor musunuz?`,
    "importEnterNewName": (teamName) => `"${teamName}" takımı zaten mevcut. İçe aktarmak için yeni bir ad girin:`,
    "summonHistoryTitleCurrent": (poolName, count) => `${poolName} Çağırma Geçmişi (Toplam ${count} çekiliş)`,
    "superElementalExclusionNotice": (days) => `* ${days} gün içinde yayınlanan etkinlik dışı aile kahramanlarını içermez`,
    "totalHeroesCountText": (count) => `(Toplam ${count})`,
    "latestHeroAgeNotice": (days) => `* Sadece ${days} gün içinde yayınlanan kahramanları ve kostümleri içerir`
  }
};
