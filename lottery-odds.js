/* lottery-odds.js — 官方概率说明还原（纯逻辑，node+browser，零 DOM）。
 *
 * 官方概率面板 = 本地化 TextKey 模板（odds.*）+ 百分比 + 星号脚注。
 * 本模块从 lottery-engine.js 的桶 + context 还原官方 `GetBucketOddsLines` 的输出结构：
 *   - 桶标签 key：V2 按官方文法动态拼（odds.hero.<element>.<event|origin>.<family>.<trainer>.<featured>.<rarity>.<extra_pull>）；
 *     V1 按桶成员稀有度 + 池类型取静态 key（odds.hero_{rarity} / odds.dragon_{rarity} / 池专属 featured key）。
 *   - 百分比：weight / Sum(bucketWeights) * 100，格式 "0.0##"（1~3 位小数去尾零）。
 *   - 星号脚注：按桶的年龄闸 / 服装 / 排除家族等字段取 odds.asterisk.info.* 模板。
 *   - 分组：同 key 的桶合并一行（百分比相加），星号按出现顺序编号。
 *
 * 文案表 oddsText = { key: template }（当前语言，来自 langs_json/odds_<码>.json，官方原文）。
 * 用法：
 *   const odds = LotteryOdds.build(engine, poolId, { time, oddsText, selectedFeatured });
 *   // odds.lines[i] = { key, percent, weight, bucketIndexes, asterisks:[编号] }
 *   // odds.asterisks[j] = { key, params }（脚注，编号 j+1）
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.LotteryOdds = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var RARITY_LOWER = { 1: "common", 2: "uncommon", 3: "rare", 4: "epic", 5: "legendary" };

  function lower(s) { return String(s == null ? "" : s).toLowerCase(); }
  function nonEmpty(a) { return a != null && a.length > 0; }

  // 官方 Single.ToString("0.0##")：至少 1 位小数、至多 3 位、去尾零。
  function formatPercent(weight, sum) {
    if (!(sum > 0)) return "0";
    var v = weight / sum * 100;
    var s = v.toFixed(3);
    s = s.replace(/0+$/, "").replace(/\.$/, ".0");
    if (s.indexOf(".") < 0) s += ".0";
    return s;
  }

  // 官方 Support.StringUtils.FormatPerMilAsPercent：perMil/10 银行家舍入到整数后默认 ToString。
  function formatPerMil(perMil) {
    var v = (perMil || 0) / 10;
    var f = Math.floor(v), diff = v - f;
    var r = diff > 0.5 ? f + 1 : diff < 0.5 ? f : (f % 2 === 0 ? f : f + 1);
    return String(r);
  }

  // 官方月英行 Single.ToString("0.0")：固定 1 位小数。
  function formatPerMilOneDecimal(perMil) {
    return ((perMil || 0) / 10).toFixed(1);
  }

  function isExtraPull(product) {
    return !!(product && (product.isExtraPullProduct || product._extraPull));
  }

  // ---------- V2 动态桶标签 key（官方 GetBucketOddTextKey 文法） ----------
  function v2BucketTextKey(bucket, ctx, extraPull) {
    var product = ctx.product || {};
    var key = "odds.hero";
    var el = bucket.element;
    if (el && lower(el) !== "all") key += "." + lower(el);

    var origins = bucket.includedOrigins || [];
    var assoc = product.associatedEvent;
    var hasEvent = !!assoc && origins.indexOf(assoc) >= 0;
    if (hasEvent) {
      key += ".event";
    } else if (nonEmpty(origins)) {
      key += "." + lower(origins.join("_"));
    }

    var fams = bucket.includedFamilies || [];
    if (fams.length === 1) key += "." + lower(fams[0]);

    if (nonEmpty(bucket.includedTrainerTypes)) key += ".trainer";
    if (bucket.isFeatured) key += ".featured";
    key += "." + (RARITY_LOWER[bucket.rarity] || lower(bucket.rarity));
    if (extraPull || isExtraPull(product)) key += ".extra_pull";
    return key;
  }

  // ---------- V1 静态桶标签 key ----------
  // V1 桶按稀有度分组（桶配置无 rarity 字段）⇒ 从桶成员英雄取众数稀有度。
  function bucketRarityFromEntries(bucket, idx) {
    var count = {};
    for (var i = 0; i < bucket.entries.length; i++) {
      var h = idx.get(bucket.entries[i].id);
      if (h && h.rarity) count[h.rarity] = (count[h.rarity] || 0) + 1;
    }
    var best = 0, bestN = -1;
    for (var r in count) if (count[r] > bestN) { bestN = count[r]; best = +r; }
    return best;
  }

  // 池专属 featured key（官方 odds.hero_featured_<池>_5），按 productType 取。
  var V1_FEATURED_KEY = {
    ShadowSummon: "odds.hero_featured_shadow_summon_5",
    TitanHunterSummon: "odds.hero_featured_titan_hunter_5",
    PickupSummon: "odds.hero_featured_pickup_summon_5",
  };

  // 抽中传奇后额外抽的「描述行」key（官方各 product GetBucketOddsLines override 硬编码，
  // 键已在官方字典核验）。仅当通用 bonus_pull 脚注键不存在时回落至此（如 V1 暗影/黑色生日）。
  var BONUS_PULL_DESC_KEY = {
    ShadowSummon: "odds.hero_event_shadow.bonus_pull",
    BlackSummon: "odds.hero_black_summon.bonus_pull",
    ChallengeEventSummon: "odds.hero_event_challenge_event.bonus_pull",
    TowerEventSummon: "odds.hero_event_tower_magic.bonus_pull",
  };

  function v1BucketTextKey(bucket, ctx, idx) {
    var product = ctx.product || {};
    var pt = product.productType;
    var rarity = bucket.rarity || bucketRarityFromEntries(bucket, idx);
    var dragon = ctx.gameMode === 1 || /Dragon/.test(pt || "");
    if (bucket.isFeatured || (ctx.featuredIdx >= 0 && bucket.index === ctx.featuredIdx)) {
      var fk = V1_FEATURED_KEY[pt];
      if (fk) return fk;
      return dragon ? "odds.dragon_featured_5" : "odds.hero_featured_5";
    }
    if (dragon) return "odds.dragon_" + rarity;
    return "odds.hero_" + rarity;
  }

  // ---------- 星号脚注（官方 GetAsteriskInfoTextKeys） ----------
  function bucketAsterisks(bucket, ctx) {
    var out = [];
    var young = bucket.youngestCharacterAgeInDays || 0;
    var old = bucket.oldestCharacterAgeInDays || 0;
    var dragon = ctx.gameMode === 1;
    if (young > 0 && old > 0) out.push({ key: "odds.asterisk.info.cutoff.young.old", params: [young, old] });
    else if (young > 0) out.push({ key: dragon ? "odds.asterisk.info.cutoff.young.dragon" : "odds.asterisk.info.cutoff.young", params: [young] });
    else if (old > 0) out.push({ key: "odds.asterisk.info.cutoff.old", params: [old] });

    var costume = bucket.includedCostume;
    if (costume === "NonExclusive") out.push({ key: "odds.asterisk.info.included.costume_nonexclusive", params: [] });
    else if (costume === "Exclusive") {
      var tag = (ctx.sourceProduct && ctx.sourceProduct.summonExclusiveTag) || "Wardrobe1";
      out.push({ key: tag === "Wardrobe2" ? "odds.asterisk.info.included.costume_wardrobe2" : "odds.asterisk.info.included.costume_wardrobe1", params: [] });
    }

    var exFams = (bucket.excludedFamilies || []).map(lower);
    var exOrig = (bucket.excludedOrigins || []).map(lower);
    var ex = exFams.concat(exOrig);
    if (ex.length) {
      var has = function (x) { return ex.indexOf(x) >= 0; };
      if (has("classic") && has("hotm")) out.push({ key: "odds.asterisk.info.excluded.classic_hotm", params: [] });
      else if (has("classic") || has("season1")) out.push({ key: "odds.asterisk.info.excluded.classic", params: [] });
      else if (has("mimic") && has("dryad") && has("rodent")) out.push({ key: "odds.asterisk.info.excluded.dryad_mimic_rodent", params: [] });
      else if (has("mimic")) out.push({ key: "odds.asterisk.info.excluded.mimic", params: [] });
    }
    return out;
  }

  // ---------- 主流程：还原 GetBucketOddsLines ----------
  function build(engine, poolId, opts) {
    opts = opts || {};
    var built = engine.buildBuckets(poolId, opts.time, opts);
    if (!built) return null;
    var ctx = built.ctx, buckets = built.buckets;
    var oddsText = opts.oddsText || {};
    var isV1 = /^(ShadowSummon|TitanHunterSummon|PickupSummon)$/.test(ctx.product.productType);
    var rawBuckets = (!isV1 && ctx.iec && ctx.iec.bucketIncludedEntryConfigs) || null;

    var sum = 0;
    for (var i = 0; i < buckets.length; i++) sum += buckets[i].weight || 0;

    // 逐桶取 key + 星号（只取 weight>=1 的桶，官方 Where 有效桶）
    var perBucket = [];
    for (var bi = 0; bi < buckets.length; bi++) {
      var b = buckets[bi];
      if (!(b.weight >= 1)) continue;
      var raw = rawBuckets ? rawBuckets.filter(function (x) { return x.index === b.index; })[0] : null;
      var cfg = raw || b;
      var key = isV1 ? v1BucketTextKey(b, ctx, engine.idx) : v2BucketTextKey(cfg, ctx);
      var aster = raw ? bucketAsterisks(raw, ctx) : [];
      perBucket.push({ index: b.index, weight: b.weight, key: key, asterisks: aster });
    }

    // 星号编号：按桶顺序收集去重（key+params），编号 1..N
    var asterList = [], asterIndex = {};
    function asterNum(a) {
      var sig = a.key + "|" + a.params.join(",");
      if (!(sig in asterIndex)) { asterIndex[sig] = asterList.length + 1; asterList.push(a); }
      return asterIndex[sig];
    }
    for (var p = 0; p < perBucket.length; p++) {
      perBucket[p].asterNums = perBucket[p].asterisks.map(asterNum);
    }

    // 分组：同 key 合并（百分比相加），保持首次出现顺序（官方 OrderBy 桶 index）
    var groups = {}, order = [];
    for (var g = 0; g < perBucket.length; g++) {
      var pb = perBucket[g];
      if (!groups[pb.key]) { groups[pb.key] = { key: pb.key, weight: 0, bucketIndexes: [], asterNums: [] }; order.push(pb.key); }
      var gr = groups[pb.key];
      gr.weight += pb.weight;
      gr.bucketIndexes.push(pb.index);
      for (var an = 0; an < pb.asterNums.length; an++) if (gr.asterNums.indexOf(pb.asterNums[an]) < 0) gr.asterNums.push(pb.asterNums[an]);
    }
    var lines = order.map(function (k) {
      var gr = groups[k];
      gr.percent = formatPercent(gr.weight, sum);
      gr.asterisks = gr.asterNums.sort(function (a, b) { return a - b; });
      delete gr.asterNums;
      gr.missing = !(k in oddsText);
      return gr;
    });

    // 额外抽段（官方 GetExtraPullBucketOddsLines，标题 odds.details.odds_extra）。
    // 桶来自 iec[id+"_extra"]，key 强制 .extra_pull 后缀（trainer 变体）；
    // 百分比按全部额外桶权重归一（含 rarity0 空桶），但 rarity0 无官方 key 故不出行。
    var extraLines = [], extraAsterisks = [];
    var extraBuilt = (!isV1 && engine.buildExtraBuckets) ? engine.buildExtraBuckets(ctx, opts) : null;
    if (extraBuilt) {
      var ebuckets = extraBuilt.buckets;
      var eRaw = extraBuilt.iec.bucketIncludedEntryConfigs;
      var esum = 0;
      for (var ei = 0; ei < ebuckets.length; ei++) esum += ebuckets[ei].weight || 0;
      var ePer = [];
      for (var ej = 0; ej < ebuckets.length; ej++) {
        var eb = ebuckets[ej];
        if (!(eb.weight >= 1) || !RARITY_LOWER[eb.rarity]) continue;
        var eraw = eRaw.filter(function (x) { return x.index === eb.index; })[0] || eb;
        ePer.push({ index: eb.index, weight: eb.weight, key: v2BucketTextKey(eraw, ctx, true), asterisks: bucketAsterisks(eraw, ctx) });
      }
      var eAsterList = [], eAsterIndex = {};
      var eAsterNum = function (a) {
        var sig = a.key + "|" + a.params.join(",");
        if (!(sig in eAsterIndex)) { eAsterIndex[sig] = eAsterList.length + 1; eAsterList.push(a); }
        return eAsterIndex[sig];
      };
      for (var ep = 0; ep < ePer.length; ep++) ePer[ep].asterNums = ePer[ep].asterisks.map(eAsterNum);
      var eGroups = {}, eOrder = [];
      for (var eg = 0; eg < ePer.length; eg++) {
        var epb = ePer[eg];
        if (!eGroups[epb.key]) { eGroups[epb.key] = { key: epb.key, weight: 0, bucketIndexes: [], asterNums: [] }; eOrder.push(epb.key); }
        var egr = eGroups[epb.key];
        egr.weight += epb.weight;
        egr.bucketIndexes.push(epb.index);
        for (var en = 0; en < epb.asterNums.length; en++) if (egr.asterNums.indexOf(epb.asterNums[en]) < 0) egr.asterNums.push(epb.asterNums[en]);
      }
      extraLines = eOrder.map(function (k) {
        var gr = eGroups[k];
        gr.percent = formatPercent(gr.weight, esum);
        gr.asterisks = gr.asterNums.sort(function (a, b) { return a - b; });
        delete gr.asterNums;
        gr.missing = !(k in oddsText);
        return gr;
      });
      extraAsterisks = eAsterList;
    }

    // 官方免责声明（TryAddUnavailableBonusRollTextKeys）：仅当奖励抽不可用且对应活动活跃时发出，
    // 与 Bonus Draw 概率行互补不并存。标题 odds.additional_draw.extra（独立 "Extra Info" 段）。
    var disclaimers = engine.getBonusRollDisclaimers ? engine.getBonusRollDisclaimers(ctx) : [];

    // 抽中传奇后额外抽（官方 GetBucketsInfo 的 bonus_pull 脚注 + 各 product 描述行）。
    var product = ctx.product;
    var bonus = engine.bonusByLotteryId[product._bulkOf || product.id] || engine.bonusByLotteryId[product.id];
    if (bonus && (bonus.chancePerMil || 0) >= 1) {
      var luckyIdx = bonus.luckyPullBucketIndexes || [];
      var chance = bonus.chancePerMil || 0, amount = bonus.pullAmount || 1;
      var footnoteKey = null;
      if (rawBuckets) {
        var luckyRaw = rawBuckets.filter(function (x) { return luckyIdx.indexOf(x.index) >= 0; });
        var rarities = [];
        luckyRaw.forEach(function (x) { var r = RARITY_LOWER[x.rarity]; if (r && rarities.indexOf(r) < 0) rarities.push(r); });
        var assoc = product.associatedEvent;
        var allEvent = luckyRaw.length > 0 && luckyRaw.every(function (x) { return (x.includedOrigins || []).indexOf(assoc) >= 0; });
        var prefix = (assoc && allEvent) ? "event." : "";
        var fk = "odds.asterisk.info.bonus_pull." + prefix + rarities.join("_");
        if (fk in oddsText) footnoteKey = fk;
      }
      if (footnoteKey) {
        // 通用脚注：挂 lucky 桶，编号接在桶脚注之后。
        var fn = asterList.length + 1;
        asterList.push({ key: footnoteKey, params: [formatPerMil(chance), amount], bucketIndexes: luckyIdx.slice() });
        lines.forEach(function (l) {
          if (l.bucketIndexes.some(function (i) { return luckyIdx.indexOf(i) >= 0; }) && l.asterisks.indexOf(fn) < 0) {
            l.asterisks.push(fn); l.asterisks.sort(function (a, b) { return a - b; });
          }
        });
      } else {
        // 回落描述行（V1 暗影/黑色生日等）：key 按 product，参数按模板占位符语义。
        var dk = BONUS_PULL_DESC_KEY[product.productType];
        if (dk && dk in oddsText) {
          var dtpl = oddsText[dk], dparams = [];
          if (dtpl.indexOf("{2}") >= 0) dparams = [amount, formatPerMil(chance), formatPerMil(1000 - chance)];
          else if (dtpl.indexOf("{0}") >= 0) dparams = [formatPerMil(chance)];
          lines.push({ key: dk, params: dparams, percent: null, weight: 0, bucketIndexes: [], asterisks: [], missing: false, isDescription: true });
        }
      }
    }

    // 月英/秘密英雄奖励抽概率行（官方独立 "Bonus Draw" 段，标题 odds.additional_draw）。
    var bonusLines = [];
    if (engine.getBonusRollOdds) {
      engine.getBonusRollOdds(ctx).forEach(function (b) {
        if (!(b.key in oddsText)) return;
        bonusLines.push({ key: b.key, kind: b.kind, heroId: b.heroId, params: [formatPerMilOneDecimal(b.chancePerMil), b.heroId] });
      });
    }

    // 丰收额外抽卡说明（官方 HarvestSummonProductDefinition.GetAdditionalDrawChanceText）：
    // 模板 odds.harvest_additional_draw 多行，{BONUSkDRAW}＝AdditionalDrawWeights[k-1]/10 经 Double.ToString()
    // （880→"88"、26→"2.6"、1→"0.1"）。官方模板第 9 行在 {BONUS10DRAW} 后多一段字面小数（".1"/",1"/"。1"），
    // 与代入值叠加成误导的 "0.1.1%"；在渲染层剥离该字面小数（数据仍保留官方原文）。
    var harvestDraw = null;
    var aw = ctx.product.additionalDrawWeights;
    if (ctx.product.productType === "HarvestSummon" && Array.isArray(aw) && aw.length && ("odds.harvest_additional_draw" in oddsText)) {
      var tpl = oddsText["odds.harvest_additional_draw"].replace(/(\{BONUS10DRAW\})[.,。]1/g, "$1");
      var filled = tpl.replace(/\{BONUS(\d+)DRAW\}/g, function (_, k) {
        var w = aw[(+k) - 1] || 0;
        return String(w / 10);
      });
      harvestDraw = { titleKey: "odds.harvest_additional_draw.title", body: filled };
    }

    return {
      poolId: poolId, productType: ctx.product.productType, totalWeight: sum,
      lines: lines, asterisks: asterList, disclaimers: disclaimers,
      disclaimerTitleKey: "odds.additional_draw.extra",
      extraLines: extraLines, extraAsterisks: extraAsterisks,
      bonusLines: bonusLines, bonusTitleKey: "odds.additional_draw",
      harvestDraw: harvestDraw,
      missingKeys: lines.filter(function (l) { return l.missing; }).map(function (l) { return l.key; }),
    };
  }

  // 渲染辅助：把官方模板的 {0}/{1}… 替换成参数，剥离富文本标签（[#..]/[##..]/[#]/[*]）。
  function render(template, params) {
    var s = String(template == null ? "" : template);
    s = s.replace(/\{(\d+)\}/g, function (_, n) { return params && params[+n] != null ? String(params[+n]) : ""; });
    s = s.replace(/\[##?[^\]]*\]/g, "").replace(/\[#\]/g, "").replace(/\[\*\]/g, "*");
    return s;
  }

  return {
    build: build, render: render, formatPercent: formatPercent,
    v2BucketTextKey: v2BucketTextKey, v1BucketTextKey: v1BucketTextKey, bucketAsterisks: bucketAsterisks,
    RARITY_LOWER: RARITY_LOWER,
  };
});