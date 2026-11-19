/* Heroplan 抽奖引擎：逐位复现官方 il2cpp 抽取逻辑。
 * 纯逻辑、零 DOM，node + browser 双兼容。消费 lottery_official.json（无损官方数据）。
 * 种子 RNG 可注入，便于单测逐位对拍。 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LotteryEngine = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // ---------- 枚举 ----------
  const GameMode = { Classic: 0, Dragon: 1 };
  const IncludedCostume = { None: 0, Exclusive: 1, NonExclusive: 2 };
  const TrainerType = { None: 0, Normal: 1, MasterRainbow: 2, NoviceRainbow: 3 };
  const ExclusiveTag = { None: 0, Wardrobe1: 1, Wardrobe2: 2 };
  const EventType = {
    Challenge: 0, MonthlyHero: 1, Seasonal: 2, Legends: 3, Tower: 4,
    AllianceQuest: 5, Calendar: 6, CovenantQuest: 7, TreasureQuest: 8,
    Goblin: 9, Chess: 10, MysteryHero: 11, AstralElves: 12, ShadowQuest: 13,
    Harvest: 14, GuestIP: 15, AncientDragon: 16, TempleEvent: 17, MonthlyDragon: 18,
  };
  const DAY = 86400;

  // ---------- 工具 ----------
  function isNullOrEmpty(a) { return a == null || a.length === 0; }
  function safeEquals(a, b) { return (a == null ? "" : a) === (b == null ? "" : b); }
  function parseTime(s) {
    if (s == null || s === "") return null;
    if (typeof s === "number") return s;
    const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
    if (!m) return null;
    return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]) / 1000;
  }
  function enumVal(map, name, dflt) {
    if (name == null || name === "") return dflt;
    return map[name] != null ? map[name] : dflt;
  }

  // ---------- DeterministicRandom 双 LFSR ----------
  function DeterministicRandom(seed) {
    this.lfsr32 = 0; this.lfsr31 = 0;
    if (seed != null) this.withSeed(seed);
  }
  DeterministicRandom.prototype.withSeed = function (seed) {
    seed = seed >>> 0;
    const v5 = (Math.imul(73244475, (seed ^ (seed >>> 16)) >>> 0)) >>> 0;
    this.lfsr31 = v5;
    const t = (Math.imul(73244475, (v5 ^ (v5 >>> 16)) >>> 0)) >>> 0;
    this.lfsr32 = ((t ^ (t >>> 16)) + 1) >>> 0;
    return this;
  };
  DeterministicRandom.prototype._step = function () {
    let x = this.lfsr32;
    x = ((x >>> 2) ^ ((x & 1) ? 0x5A5E69AE : 0) ^ ((x & 2) ? 0xB4BCD35C : 0)) >>> 0;
    this.lfsr32 = x;
    let y = this.lfsr31;
    y = ((y >>> 1) ^ ((y & 1) ? 0x7A5BC2E3 : 0)) >>> 0;
    this.lfsr31 = y;
    return ((x & 0x7FFFFFFF) ^ y) >>> 0;
  };
  DeterministicRandom.prototype.nextInt = function (n) {
    if (n <= 0) return 0;
    return this._step() % n;
  };
  DeterministicRandom.prototype.nextIntRange = function (min, max) {
    return this._step() % (max - min + 1) + min;
  };
  DeterministicRandom.prototype.nextBool = function (perMil) {
    return this._step() % 1000 < perMil;
  };

  // ---------- 加权选桶 / 桶内选取 ----------
  function getWeightedRandomIndex(rng, weights) {
    let sum = 0;
    for (const w of weights) sum += w;
    if (sum <= 0) return -1;
    let r = rng.nextInt(sum);
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r < 0) return i;
    }
    return weights.length - 1;
  }

  // ---------- 英雄索引 ----------
  function HeroIndex(characters, balanceEvents) {
    this.heroes = characters.heroes || {};
    this.order = Object.keys(this.heroes);
    this.balanced = {};
    for (const h of characters.balancedHeroes || []) this.balanced[h.id] = h;
    this.costumesForParent = {};
    for (const id of this.order) {
      const h = this.heroes[id];
      if (h.parentHeroId) {
        (this.costumesForParent[h.parentHeroId] || (this.costumesForParent[h.parentHeroId] = [])).push(id);
      }
    }
    this.activeBalancedHeroIds = null;
    if (balanceEvents && balanceEvents.enabled) {
      const entry = (balanceEvents.entries || []).find(e => e.id === balanceEvents.activeEntryId);
      if (entry) this.activeBalancedHeroIds = new Set(entry.balancedHeroIds || []);
    }
  }
  HeroIndex.prototype.get = function (id) { return this.heroes[id] || null; };
  HeroIndex.prototype.tryGetBalanced = function (id) {
    if (!this.activeBalancedHeroIds || !this.activeBalancedHeroIds.has(id)) return null;
    return this.balanced[id] || null;
  };
  HeroIndex.prototype.isCostume = function (h) { return !!(h && h.parentHeroId); };
  HeroIndex.prototype.canBeReceived = function (h, time, cutOffStart) {
    const d = parseTime(h.canBeReceivedDate);
    if (d == null) return false;
    if (d > time) return false;
    if (cutOffStart != null && cutOffStart > 0 && d < cutOffStart) return false;
    return true;
  };
  HeroIndex.prototype.availableCostumeCount = function (parentId, time, cutOffStart) {
    const list = this.costumesForParent[parentId] || [];
    let n = 0;
    for (const cid of list) {
      const c = this.get(cid);
      if (c && this.canBeReceived(c, time, cutOffStart)) n++;
    }
    return n;
  };

  // ---------- 英雄池快照 ----------
  function getSafeDonationCurrentHeroes(idx, time, predicate, cutOffStart) {
    const seen = new Set();
    const result = [];
    for (const id of idx.order) {
      const base = idx.heroes[id];
      const h0 = idx.tryGetBalanced(id) || base;
      if (!idx.canBeReceived(h0, time, cutOffStart)) continue;
      if (seen.has(h0.id) || (h0.parentHeroId && seen.has(h0.parentHeroId))) continue;
      if (predicate && !predicate(h0)) continue;
      let h = h0;
      let v45 = parseTime(h.canBeReceivedDate);
      const key = idx.isCostume(h) ? h.parentHeroId : h.id;
      const costumes = idx.costumesForParent[key];
      if (costumes) {
        for (const cid of costumes) {
          if (cid === h.id) continue;
          const c = idx.get(cid);
          if (!c) continue;
          const cd = parseTime(c.canBeReceivedDate);
          if (cd != null && cd > v45 && idx.canBeReceived(c, time, cutOffStart) && (!predicate || predicate(c))) {
            h = c; v45 = cd;
          }
        }
      }
      seen.add(key);
      result.push(h);
    }
    return result;
  }

  // ---------- 过滤链 ----------
  function heroTag(h) { return enumVal(ExclusiveTag, h.summonExclusiveTag, 0); }
  function isTrainer(h) { return h.trainerType != null && h.trainerType !== "None"; }
  function isSecretOrDefaultRider(h) { return !!h.isSecret || !!h.isDefaultRider; }

  function hasMatchingFamily(heroFamily, familyId, sharedBonusFamilies) {
    if (safeEquals(heroFamily, familyId)) return true;
    if (safeEquals(familyId, "hotm")) return heroFamily != null && heroFamily.startsWith("hotm");
    const set = sharedBonusFamilies && sharedBonusFamilies[familyId];
    if (!set) return false;
    return set.indexOf(heroFamily) >= 0;
  }

  function isCostumeIncluded(bucket, hero, sourceProduct) {
    const inc = enumVal(IncludedCostume, bucket.includedCostume, 0);
    const tag = heroTag(hero);
    if (inc === IncludedCostume.NonExclusive) return tag === 0;
    if (inc === IncludedCostume.Exclusive) {
      if (tag === 0) return true;
      if (!sourceProduct) return false;
      return tag === enumVal(ExclusiveTag, sourceProduct.summonExclusiveTag, 0);
    }
    return false;
  }

  // BucketIncludedEntryConfiguration.IsCharacterIncluded
  function bucketIsCharacterIncluded(bucket, iec, hero, sourceProduct, time, excludedOrigin, expectedFeatured, runtimeFilter, idx, sharedBonusFamilies) {
    if ((bucket.weight || 0) < 1) return false;
    if (!hero) return false;
    if (isSecretOrDefaultRider(hero)) return false;
    if (!isNullOrEmpty(excludedOrigin) && safeEquals(hero.origin, excludedOrigin)) return false;
    if ((bucket.rarity || 0) !== hero.rarity) return false;
    const bel = bucket.element;
    if (bel != null && bel !== "" && bel !== "All" && bel !== hero.element) return false;

    if (isTrainer(hero)) {
      const tt = bucket.includedTrainerTypes;
      if (isNullOrEmpty(tt)) return false;
      return tt.indexOf(hero.trainerType) >= 0;
    }

    if (idx.isCostume(hero) && !isCostumeIncluded(bucket, hero, sourceProduct)) return false;

    const youngest = bucket.youngestCharacterAgeInDays || 0;
    const oldest = bucket.oldestCharacterAgeInDays || 0;
    const minCostume = bucket.minParentCharacterCostumeCount || 0;
    // 早拒块：无年龄/origin/family/costume 数过滤时
    if (youngest <= 0 && oldest <= 0
      && isNullOrEmpty(bucket.includedOrigins)
      && isNullOrEmpty(bucket.includedFamilies)
      && isNullOrEmpty(bucket.excludedOrigins)
      && isNullOrEmpty(bucket.excludedFamilies)
      && minCostume <= 0) {
      if (bucket.isFeatured) {
        if (runtimeFilter == null && isNullOrEmpty(expectedFeatured)) return false;
      } else if (runtimeFilter == null) {
        return false;
      }
    }

    if (minCostume >= 1) {
      const parentId = idx.isCostume(hero) ? hero.parentHeroId : hero.id;
      if (idx.availableCostumeCount(parentId, time, 0) < minCostume) return false;
    }

    const d = parseTime(hero.canBeReceivedDate);
    if (oldest >= 1 && d < time - DAY * oldest) return false;
    if (youngest >= 1 && d > time - DAY * youngest) return false;

    if (!isNullOrEmpty(bucket.includedOrigins) && bucket.includedOrigins.indexOf(hero.origin) < 0) return false;
    if (!isNullOrEmpty(bucket.includedFamilies)) {
      let ok = false;
      for (const f of bucket.includedFamilies) if (hasMatchingFamily(hero.family, f, sharedBonusFamilies)) { ok = true; break; }
      if (!ok) return false;
    }
    if (!isNullOrEmpty(bucket.excludedOrigins) && bucket.excludedOrigins.indexOf(hero.origin) >= 0) return false;
    if (!isNullOrEmpty(bucket.excludedFamilies)) {
      for (const f of bucket.excludedFamilies) if (hasMatchingFamily(hero.family, f, sharedBonusFamilies)) return false;
    }
    if (!isNullOrEmpty(expectedFeatured) && expectedFeatured.indexOf(hero.id) >= 0) return true;
    if (!bucket.isFeatured && (runtimeFilter == null || runtimeFilter(hero))) return true;
    return false;
  }

  function makeFilterContext(ctx) {
    const { iec, sourceProduct, time, excludedOrigin, expectedFeatured, runtimeFilter, idx, sharedBonusFamilies } = ctx;
    const buckets = iec.bucketIncludedEntryConfigs;
    const included = (hero) => buckets.some(b => bucketIsCharacterIncluded(b, iec, hero, sourceProduct, time, excludedOrigin, expectedFeatured, runtimeFilter, idx, sharedBonusFamilies));
    const bucketIndex = (hero) => {
      let best = -1;
      for (const b of buckets) {
        if (bucketIsCharacterIncluded(b, iec, hero, sourceProduct, time, excludedOrigin, expectedFeatured, runtimeFilter, idx, sharedBonusFamilies)) {
          if (b.index > best) best = b.index;
        }
      }
      return best;
    };
    return { included, bucketIndex };
  }

  // ---------- 活动 / 当期条目 ----------
  function scheduleActive(entry, time) {
    const s = parseTime(entry.startDate != null ? entry.startDate : entry.startTime);
    const e = parseTime(entry.endDate != null ? entry.endDate : entry.endTime);
    return s != null && e != null && s <= time && e > time;
  }
  function getActiveUniqueEvent(events, time, type) {
    const list = (events && events.uniqueEvents) || [];
    const typeName = typeof type === "number" ? Object.keys(EventType).find(k => EventType[k] === type) : type;
    for (const ev of list) {
      if (ev.type === typeName && scheduleActive(ev, time)) return ev;
    }
    return null;
  }
  function getActiveMonthlyCharacterEvent(events, time, gameMode) {
    if (gameMode === GameMode.Dragon) {
      if (events && events.monthlyDragonSummonEnabled) return getActiveUniqueEvent(events, time, EventType.MonthlyDragon);
      return null;
    }
    return getActiveUniqueEvent(events, time, EventType.MonthlyHero);
  }
  function firstActiveEntry(entries, time) {
    for (const e of entries || []) if (scheduleActive(e, time)) return e;
    return null;
  }
  // 瘦身数据兜底：无严格活跃条目时取"匹配的最新项"（过去7天最晚→未来30天最早→所有过去最晚），
  // 与旧站 choose_best_candidate 同口径，保证当期池在窗口刚结束时仍可解析。
  function chooseBestEntry(entries, time) {
    let past7 = null, fut30 = null, allPast = null;
    for (const e of entries || []) {
      const s = parseTime(e.startDate != null ? e.startDate : e.startTime);
      if (s == null) continue;
      if (s <= time) {
        if (!allPast || s > allPast.s) allPast = { s, e };
        if (time - s <= 7 * DAY && (!past7 || s > past7.s)) past7 = { s, e };
      } else if (s - time <= 30 * DAY && (!fut30 || s < fut30.s)) {
        fut30 = { s, e };
      }
    }
    const pick = past7 || fut30 || allPast;
    return pick ? pick.e : null;
  }
  function activeEntry(entries, time) {
    return firstActiveEntry(entries, time) || chooseBestEntry(entries, time);
  }
  function getActiveLotteryEvent(events, eventId, time) {
    if (!eventId) return null;
    const tec = events.towerEventConfig;
    const pools = [
      events.uniqueEvents || [],
      events.challengeEventEntries || [],
      (events.challengeEventsConfig && events.challengeEventsConfig.entries) || [],
      events.allianceQuestEventEntries || [],
      (tec && tec.towerEventEntries) || [],
    ];
    const matches = [];
    for (const list of pools) for (const e of list) if (e.id === eventId) matches.push(e);
    return firstActiveEntry(matches, time) || chooseBestEntry(matches, time);
  }

  // ---------- 引擎 ----------
  function Engine(data) {
    this.data = data;
    this.pools = data.pools || {};
    this.lottery = data.lottery || {};
    this.events = data.events || {};
    this.shop = data.shop || {};
    this.pvpLeague = data.pvpLeague || null;
    this.balanceEvents = data.balanceEvents || null;
    this.idx = new HeroIndex(data.characters || {}, this.balanceEvents);
    this.sharedBonusFamilies = data.sharedBonusFamilies || {};
    this.iecByLotteryId = {};
    for (const c of this.lottery.lotteryIncludedEntryConfigs || []) this.iecByLotteryId[c.lotteryId] = c;
    this.bonusByLotteryId = {};
    for (const c of this.lottery.lotteryBonusPullConfigs || []) this.bonusByLotteryId[c.lotteryId] = c;
    this.playerSelectedBySummonId = {};
    for (const c of this.lottery.playerSelectedFeaturedEntityConfigs || []) this.playerSelectedBySummonId[c.summonId] = c;
    this.recurringByType = {};
    for (const c of this.lottery.recurringLotteriesWithState || []) this.recurringByType[c.productType] = c;
  }

  Engine.prototype.getProduct = function (id) { return this.pools[id] || null; };

  // 解析奖池产品（bulk → sourceProductId 基产品；虚拟聚合池 → 当期条目产品）
  Engine.prototype.resolveProduct = function (poolId) {
    let p = this.getProduct(poolId);
    if (!p) {
      const agg = this.resolveAggregate(poolId);
      if (agg) return agg;
      return null;
    }
    if (p.sourceProductId && this.getProduct(p.sourceProductId)) {
      const base = this.getProduct(p.sourceProductId);
      return Object.assign({}, base, { id: p.id, amount: p.amount, gemPrice: p.gemPrice, sourceProductId: p.sourceProductId, _bulkOf: base.id });
    }
    return p;
  };

  // 虚拟聚合池（如 lottery_super_elemental）：productType 取自 recurring 配置，
  // 实际产品由当期条目 productId 决定（buildContext 里换入）。
  Engine.prototype.resolveAggregate = function (poolId) {
    for (const pt in this.recurringByType) {
      const cfg = this.recurringByType[pt];
      const entries = cfg.lotteryEntries || [];
      if (entries.some(e => typeof e.productId === "string" && e.productId.indexOf(poolId + "_") === 0)) {
        return { id: poolId, productType: pt, _aggregate: true };
      }
    }
    return null;
  };

  Engine.prototype.getIec = function (product) {
    const id = product._bulkOf || product.id;
    return this.iecByLotteryId[id] || this.iecByLotteryId[product.id] || null;
  };

  Engine.prototype.featuredBucketIndex = function (iec) {
    if (!iec) return -1;
    for (const b of iec.bucketIncludedEntryConfigs) if (b.isFeatured) return b.index;
    return -1;
  };

  // GetActiveLottery 按 productType 分派 → 当期条目
  Engine.prototype.getActiveLottery = function (product, time) {
    const pt = product.productType;
    const L = this.lottery;
    const eventTypes = ["EpicHeroSummon", "TowerEventSummon", "AllianceEventSummon", "ChallengeEventSummon"];
    if (eventTypes.indexOf(pt) >= 0) {
      const ev = getActiveLotteryEvent(this.events, product.associatedEvent, time);
      return ev ? { entry: ev, kind: "event" } : null;
    }
    if (pt === "MapSeasonSummon") {
      const season = product.associatedSeason;
      const cfg = (L.mapSeasonLotteries || []).find(c => c.season === season);
      return cfg ? { entry: activeEntry(cfg.lotteryEntries, time), config: cfg, kind: "mapSeason" } : null;
    }
    if (pt === "PickupSummon") return { entry: activeEntry(L.pickupLottery && L.pickupLottery.lotteryEntries, time), config: L.pickupLottery, kind: "pickup" };
    if (pt === "LeagueSummon") return { entry: activeEntry(L.leagueLottery && L.leagueLottery.lotteryEntries, time), config: L.leagueLottery, kind: "league" };
    if (pt === "MonsterIslandSummon") return { entry: activeEntry(L.monsterIslandLottery && L.monsterIslandLottery.lotteryEntries, time), config: L.monsterIslandLottery, kind: "monsterIsland" };
    if (pt === "ElementalDragonSummon") return { config: L.elementalDragonLottery, kind: "elementalDragon" };
    if (pt === "EpicDragonSummon") return { config: L.permanentAncientDragonLottery, kind: "ancientDragon" };
    const rec = this.recurringByType[pt];
    if (rec && rec.enabled) {
      const all = rec.lotteryEntries || [];
      const pid = product._bulkOf || product.id;
      const own = all.filter(e => e.productId === pid);
      return { entry: activeEntry(own.length ? own : all, time), config: rec, kind: "recurring" };
    }
    return null;
  };

  // featured 链
  Engine.prototype.getExpectedFeatured = function (product, active, time) {
    const pt = product.productType;
    const entry = active && active.entry;
    if (pt === "EpicHeroSummon") return this.epicHeroFeatured(product, time);
    if (pt === "SeasonalPremiumSummon") return (product.featuredHeroes || []).slice();
    if (pt === "EpicDragonSummon") return this.rotationFeatured(active && active.config, time, "featuredEntityRotation");
    if (entry && entry.featuredHeroes) return entry.featuredHeroes.slice();
    if (entry && entry.featuredCostumeItems) return entry.featuredCostumeItems.slice();
    if (entry && entry.featuredCharacters) return entry.featuredCharacters.slice();
    // 官方已移除当期事件时，回退池上 baked 的历史精选。
    return (product.featuredHeroes || []).slice();
  };

  Engine.prototype.rotationFeatured = function (cfg, time, key) {
    if (!cfg) return [];
    const rot = cfg[key];
    if (!rot || !rot.length) return [];
    const ref = cfg.elementRotationReferenceTime != null ? cfg.elementRotationReferenceTime
      : (cfg.featuredEntitiesRotationReferenceTime != null ? cfg.featuredEntitiesRotationReferenceTime : 0);
    const dur = cfg.elementRotationDuration || cfg.featuredEntitiesRotationDuration || 0;
    const offset = cfg.featuredEntitiesRotationOffset || 0;
    let idx = offset;
    if (dur > 0) idx = offset + Math.floor((time - ref) / dur);
    idx = ((idx % rot.length) + rot.length) % rot.length;
    const item = rot[idx];
    if (!item) return [];
    if (Array.isArray(item)) return item.slice();
    if (item.entities) return item.entities.slice();
    if (item.featuredEntities && item.featuredEntities.entities) return item.featuredEntities.entities.slice();
    return [];
  };

  Engine.prototype.epicHeroFeatured = function (product, time) {
    const cfg = this.lottery.epicHeroLottery;
    if (!cfg) return [];
    const useRotation = safeEquals(product.sourceProductId || product.id, cfg.productWithFeaturingId);
    if (useRotation && cfg.featuredHeroRotation && cfg.featuredHeroRotation.length) {
      const ref = cfg.featuredRotationReferenceTime || 0;
      const dur = cfg.featuredRotationDuration || 1;
      const rot = cfg.featuredHeroRotation;
      let idx = Math.floor((time - ref) / dur) % rot.length;
      if (idx < 0) idx += rot.length;
      const inner = rot[idx];
      return Array.isArray(inner) ? inner.slice() : [];
    }
    const active = getActiveLotteryEvent(this.events, product.associatedEvent, time);
    if (active && active.featuredCharacters) return active.featuredCharacters.slice();
    return (product.featuredHeroes || []).slice();
  };

  Engine.prototype.getAdvertised = function (product, expectedFeatured) {
    if (expectedFeatured && expectedFeatured.length) return expectedFeatured[0];
    const ps = this.playerSelectedBySummonId[product.sourceProductId || product.id];
    if (ps && ps.entitiesToChooseFrom && ps.entitiesToChooseFrom.length) return ps.entitiesToChooseFrom[0];
    return null;
  };

  // 运行时过滤器
  Engine.prototype.getRuntimeFilter = function (product, active, time) {
    const pt = product.productType;
    if (pt === "SeasonalPremiumSummon") {
      const list = product.includedHeroes;
      if (!isNullOrEmpty(list)) return (hero) => list.indexOf(hero.id) >= 0;
      return null;
    }
    if (pt === "LeagueSummon") {
      const families = this.leagueFeaturedFamilies(time);
      if (!isNullOrEmpty(families)) return (hero) => families.indexOf(hero.family) >= 0;
      return null;
    }
    return null;
  };

  Engine.prototype.leagueFeaturedFamilies = function (time) {
    const league = this.pvpLeague;
    if (!league) return null;
    const entries = league.eventEntries || league.entries || [];
    let last = null;
    for (const e of entries) {
      if (e.skipped) continue;
      const s = parseTime(e.startDate != null ? e.startDate : e.startTime);
      if (s != null && s <= time) last = e;
    }
    return last ? (last.featuredFamilies || null) : null;
  };

  // 精选桶默认空、靠玩家自选的池（League）：候选 = runtimeFilter 命中且稀有度==精选桶稀有度的已发布英雄。
  // 官方精选桶只收 expectedFeatured/玩家自选（桶过滤末步 IsFeatured→false），故候选不入桶、仅供网格点选。
  Engine.prototype.getSelectableFeaturedCandidates = function (poolId, time) {
    const ctx = this.buildContext(poolId, time, {});
    if (!ctx || ctx.featuredIdx < 0 || !ctx.runtimeFilter) return null;
    if (!isNullOrEmpty(ctx.expectedFeatured)) return null;
    const fb = ctx.iec.bucketIncludedEntryConfigs.find(b => b.index === ctx.featuredIdx);
    if (!fb) return null;
    const ids = [];
    for (const id of this.idx.order) {
      const h = this.idx.heroes[id];
      if (!h || h.rarity !== fb.rarity) continue;
      if (this.idx.isCostume(h)) continue;
      if (!this.idx.canBeReceived(h, ctx.effectiveTime, 0)) continue;
      if (ctx.runtimeFilter(h)) ids.push(id);
    }
    return ids;
  };

  // GetPreviewPriority（仅影响桶内展示排序，不影响概率）
  Engine.prototype.getPreviewPriority = function (product, hero, advertised, bucketIdx, featuredIdx) {
    if (advertised != null && hero.id === advertised) return 4;
    if (bucketIdx === featuredIdx) return 3;
    if (this.isCharacterAssociated(product, hero)) return 2;
    if (this.isHeroFromExtraOrigin(product, hero)) return 1;
    return 0;
  };
  Engine.prototype.isCharacterAssociated = function (product, hero) {
    return safeEquals(hero.origin, product.associatedEvent);
  };
  Engine.prototype.isHeroFromExtraOrigin = function (product, hero) {
    const extra = this.getAdditionalIncluded(product);
    return extra && extra.indexOf(hero.id) >= 0;
  };
  Engine.prototype.getAdditionalIncluded = function (product) {
    const pt = product.productType;
    if (pt === "SeasonalPremiumSummon") {
      const premium = this.getProduct(product.premiumSummonProductId);
      return (premium && premium.includedHeroes) || null;
    }
    return null;
  };

  // ---------- 桶构建 ----------
  Engine.prototype.buildContext = function (poolId, time, opts) {
    opts = opts || {};
    const product0 = this.resolveProduct(poolId);
    if (!product0) return null;
    let active = this.getActiveLottery(product0, time);
    const entry = active && active.entry;
    // 聚合池换入当期条目的真实产品定义
    let product = product0;
    if (product0._aggregate && entry && entry.productId && this.getProduct(entry.productId)) {
      product = this.resolveProduct(entry.productId);
    }
    let effectiveTime = time;
    if (entry) {
      const st = parseTime(entry.startDate != null ? entry.startDate : entry.startTime);
      if (st != null) effectiveTime = st;
    } else if (opts.overrideTime != null && opts.overrideTime > 0) {
      effectiveTime = opts.overrideTime;
    }
    const expectedFeatured = this.getExpectedFeatured(product, active, effectiveTime);
    const advertised = this.getAdvertised(product, expectedFeatured);
    const runtimeFilter = this.getRuntimeFilter(product, active, effectiveTime);
    const monthlyEvent = getActiveUniqueEvent(this.events, effectiveTime, EventType.MonthlyHero);
    const excludedOrigin = monthlyEvent ? monthlyEvent.excludedOrigin : null;
    const iec = this.getIec(product);
    const sourceProduct = product.sourceProductId ? this.getProduct(product.sourceProductId) : product;
    const gameMode = product.productType === "EpicDragonSummon" ? GameMode.Dragon : GameMode.Classic;
    return {
      poolId, product, active, entry, time, effectiveTime, expectedFeatured, advertised,
      runtimeFilter, excludedOrigin, iec, sourceProduct, gameMode,
      featuredIdx: this.featuredBucketIndex(iec),
    };
  };

  Engine.prototype.buildBuckets = function (poolId, time, opts) {
    const ctx = this.buildContext(poolId, time, opts);
    if (!ctx) return null;
    const pt = ctx.product.productType;
    if (pt === "ShadowSummon" || pt === "TitanHunterSummon" || pt === "PickupSummon") {
      return this.buildV1Buckets(ctx, opts);
    }
    return this.buildV2Buckets(ctx, opts);
  };

  Engine.prototype.buildV2Buckets = function (ctx, opts) {
    const { iec, product, sourceProduct, effectiveTime, excludedOrigin, expectedFeatured, runtimeFilter, featuredIdx } = ctx;
    if (!iec) return null;
    const buckets = iec.bucketIncludedEntryConfigs.map(b => ({ index: b.index, weight: b.weight || 0, rarity: b.rarity, isFeatured: !!b.isFeatured, entries: [] }));
    const fctx = makeFilterContext({ iec, sourceProduct, time: effectiveTime, excludedOrigin, expectedFeatured, runtimeFilter, idx: this.idx, sharedBonusFamilies: this.sharedBonusFamilies });
    const heroes = getSafeDonationCurrentHeroes(this.idx, effectiveTime, fctx.included, 0);
    for (const hero of heroes) {
      const bi = fctx.bucketIndex(hero);
      if (bi < 0) continue;
      const priority = this.getPreviewPriority(product, hero, ctx.advertised, bi, featuredIdx);
      const bucket = buckets.find(b => b.index === bi);
      if (bucket && bucket.weight >= 1) bucket.entries.push({ id: hero.id, priority });
    }
    this.addPlayerSelected(ctx, buckets, opts);
    for (const b of buckets) b.entries.sort((a, z) => z.priority - a.priority);
    return { ctx, buckets };
  };

  // 玩家自选精选
  Engine.prototype.addPlayerSelected = function (ctx, buckets, opts) {
    const selected = (opts && opts.selectedFeatured) || [];
    if (!selected.length) return;
    const featuredIdx = ctx.featuredIdx;
    if (featuredIdx < 0) return;
    const parentSet = new Set(selected.map(id => {
      const h = this.idx.get(id);
      return h && h.parentHeroId ? h.parentHeroId : id;
    }));
    const selSet = new Set(selected);
    for (const b of buckets) {
      b.entries = b.entries.filter(e => !selSet.has(e.id) && !parentSet.has(e.id));
    }
    const fb = buckets.find(b => b.index === featuredIdx);
    if (!fb) return;
    for (const id of selected) {
      const h = this.idx.get(id);
      if (!h) continue;
      fb.entries.push({ id, priority: 0x7FFFFFFF });
    }
  };

  // 额外抽桶（官方 ExtraPullSummonProductDefinition.GetExtraPullBuckets）：
  // 桶来自 iec[GetExtraPullProductId(id)]＝iec[id+"_extra"]，权重取该 iec 桶 weight，
  // 成员走与主桶相同的过滤链（trainer 桶按 element/rarity/includedTrainerTypes 匹配）。
  // rarity0 桶为“无英雄”空桶（官方概率面板不出行），抽取时 pickFromBucket 返回 null 跳过。
  Engine.prototype.buildExtraBuckets = function (ctx, opts) {
    const product = ctx.product;
    // bulk 解析会换入基产品字段，额外抽配置须回查原始产品（如 hotm reroll 自带 extraBucketsPullAmount）。
    const orig = this.getProduct(ctx.poolId) || product;
    const pullAmount = orig.extraBucketsPullAmount != null ? orig.extraBucketsPullAmount : product.extraBucketsPullAmount;
    if (!(pullAmount >= 1)) return null;
    // 额外桶 iec 优先按产品自身 id（reroll 等独立产品），回退基产品 id（真 bulk 变体）。
    const extraIec = this.iecByLotteryId[product.id + "_extra"] || this.iecByLotteryId[(product._bulkOf || product.id) + "_extra"];
    if (!extraIec || !extraIec.bucketIncludedEntryConfigs || !extraIec.bucketIncludedEntryConfigs.length) return null;
    const buckets = extraIec.bucketIncludedEntryConfigs.map(b => ({ index: b.index, weight: b.weight || 0, rarity: b.rarity, isFeatured: false, entries: [] }));
    const fctx = makeFilterContext({ iec: extraIec, sourceProduct: ctx.sourceProduct, time: ctx.effectiveTime, excludedOrigin: ctx.excludedOrigin, expectedFeatured: [], runtimeFilter: ctx.runtimeFilter, idx: this.idx, sharedBonusFamilies: this.sharedBonusFamilies });
    const heroes = getSafeDonationCurrentHeroes(this.idx, ctx.effectiveTime, fctx.included, 0);
    for (const hero of heroes) {
      const bi = fctx.bucketIndex(hero);
      if (bi < 0) continue;
      const bucket = buckets.find(b => b.index === bi);
      if (bucket && bucket.weight >= 1) bucket.entries.push({ id: hero.id, priority: 0 });
    }
    return { ctx, buckets, iec: extraIec, pullAmount };
  };

  // V1 三池
  Engine.prototype.v1Eligible = function (hero, pt) {
    if (hero.rarity < 3) return false;
    if (this.idx.isCostume(hero)) return false;
    if (isTrainer(hero)) return false;
    if (pt === "TitanHunterSummon") return !hero.isDefaultRider;
    return !isSecretOrDefaultRider(hero);
  };

  Engine.prototype.buildV1Buckets = function (ctx, opts) {
    const { product, effectiveTime, expectedFeatured, featuredIdx } = ctx;
    const pt = product.productType;
    const weights = product.bucketWeights || [];
    const buckets = weights.map((w, i) => ({ index: i, weight: w, entries: [] }));
    const entry = ctx.entry;
    const add = (hero, bi, priority) => {
      if (bi < 0 || bi >= buckets.length) return;
      if (buckets[bi].weight >= 1) buckets[bi].entries.push({ id: hero.id, priority });
    };
    if (pt === "PickupSummon") {
      const heroes = getSafeDonationCurrentHeroes(this.idx, effectiveTime, null, 0);
      const extraPoolId = entry && entry.extraHeroesPoolId;
      const extra = this.resolveExtraHeroPool(extraPoolId);
      const advertised = entry && entry.featuredHeroes && entry.featuredHeroes[0];
      for (const hero of heroes) {
        if (expectedFeatured.indexOf(hero.id) >= 0) {
          add(hero, featuredIdx >= 0 ? featuredIdx : buckets.length - 1, advertised === hero.id ? 3 : 2);
        } else {
          add(hero, hero.rarity - 3, 1);
        }
      }
      for (const id of extra) {
        const h = this.idx.get(id);
        if (h && this.idx.canBeReceived(h, effectiveTime, 0)) add(h, h.rarity - 3, 0);
      }
    } else if (pt === "ShadowSummon") {
      const heroes = getSafeDonationCurrentHeroes(this.idx, effectiveTime, null, 0);
      const extra = (entry && entry.includedHeroes) || [];
      for (const hero of heroes) {
        if (expectedFeatured.indexOf(hero.id) >= 0) {
          add(hero, 6, ctx.advertised === hero.id ? 4 : 3);
        } else if (this.v1Eligible(hero, pt)) {
          add(hero, hero.rarity, this.isCharacterAssociated(product, hero) ? 2 : 1);
        }
      }
      for (const id of extra) {
        const h = this.idx.get(id);
        if (h && this.idx.canBeReceived(h, effectiveTime, 0)) add(h, h.rarity - 3, 0);
      }
    } else if (pt === "TitanHunterSummon") {
      const heroes = getSafeDonationCurrentHeroes(this.idx, effectiveTime, null, 0);
      const featured = (entry && entry.featuredHeroes) || [];
      const extra = (entry && entry.includedHeroes) || [];
      for (const hero of heroes) {
        if (featured.indexOf(hero.id) >= 0) {
          add(hero, featuredIdx >= 0 ? featuredIdx : buckets.length - 1, ctx.advertised === hero.id ? 4 : 3);
        } else if (this.v1Eligible(hero, pt)) {
          add(hero, hero.rarity - 3, this.isCharacterAssociated(product, hero) ? 2 : 1);
        }
      }
      for (const id of extra) {
        const h = this.idx.get(id);
        if (h && this.idx.canBeReceived(h, effectiveTime, 0)) add(h, h.rarity - 3, 0);
      }
    }
    this.addPlayerSelected(ctx, buckets, opts);
    for (const b of buckets) b.entries.sort((a, z) => z.priority - a.priority);
    return { ctx, buckets };
  };

  Engine.prototype.resolveExtraHeroPool = function (poolId) {
    const pools = (this.lottery.pickupLottery && this.lottery.pickupLottery.extraHeroPools) || [];
    const p = pools.find(x => x.id === poolId) || pools.find(x => x.id === "default");
    return (p && p.heroesIds) || [];
  };

  // ---------- 权重 ----------
  // 保底清零非匹配桶
  function applyGuaranteed(weights, buckets, guaranteedRarity) {
    if (!guaranteedRarity || guaranteedRarity <= 0) return weights.slice();
    return weights.map((w, i) => (buckets[i].rarity === guaranteedRarity ? w : 0));
  }

  // ---------- 主抽 ----------
  Engine.prototype.pickFromBucket = function (rng, bucket, lastSummonedId) {
    const entries = bucket.entries;
    const n = entries.length;
    if (n === 0) return null;
    let pick = rng.nextInt(n);
    if (n >= 2 && lastSummonedId != null && entries[pick].id === lastSummonedId) {
      pick = rng.nextInt(n);
    }
    return entries[pick];
  };

  Engine.prototype.summon = function (poolId, opts) {
    opts = opts || {};
    const time = opts.time != null ? opts.time : Math.floor(Date.now() / 1000);
    const built = this.buildBuckets(poolId, time, opts);
    if (!built) return { error: "unknown pool " + poolId, results: [] };
    const { ctx, buckets } = built;
    const product = ctx.product;
    const rng = opts.rng || new DeterministicRandom(opts.seed != null ? opts.seed : (Math.random() * 0xFFFFFFFF) >>> 0);
    const count = opts.count != null ? opts.count : (product.amount || 1);
    const guaranteed = opts.guaranteedRarity || 0;
    const baseWeights = buckets.map(b => b.weight);
    const weights = applyGuaranteed(baseWeights, buckets, guaranteed);
    const results = [];
    let lastSummonedId = opts.lastSummonedId != null ? opts.lastSummonedId : null;
    let firstSpenderRemaining = opts.firstSpenderRemaining != null ? opts.firstSpenderRemaining : -1;
    const firstSpenderBucket = product.firstSpenderGuaranteedHeroBucketIndex != null ? product.firstSpenderGuaranteedHeroBucketIndex : -1;

    for (let i = 0; i < count; i++) {
      const bi = getWeightedRandomIndex(rng, weights);
      if (bi < 0) break;
      const bucket = buckets[bi];
      let entry = this.pickFromBucket(rng, bucket, lastSummonedId);
      if (!entry) continue;
      // 首充重抽
      if (firstSpenderRemaining >= 1 && guaranteed === 0 && firstSpenderBucket >= 0
        && baseWeights[firstSpenderBucket] >= 1 && bucket.rarity != null) {
        const hero = this.idx.get(entry.id);
        if (hero && hero.rarity > 3) {
          firstSpenderRemaining = 0;
        } else if (rng.nextIntRange(1, firstSpenderRemaining) === 1) {
          const fb = buckets[firstSpenderBucket];
          const re = this.pickFromBucket(rng, fb, lastSummonedId);
          if (re) { entry = re; }
          firstSpenderRemaining = 0;
        } else {
          firstSpenderRemaining -= 1;
        }
      }
      results.push({ id: entry.id, bucketIndex: bi, bonus: false, pullIndex: results.length });
      lastSummonedId = entry.id;
    }

    // 奖励抽（仅 guaranteed==0）
    if (guaranteed === 0) {
      this.getBonusSummons(ctx, buckets, baseWeights, rng, results, count, lastSummonedId, opts);
    }
    return { results, ctx, buckets, weights, lastSummonedId, firstSpenderRemaining };
  };

  // ---------- 奖励抽 ----------
  Engine.prototype.getBonusSummons = function (ctx, buckets, weights, rng, results, summonCount, lastSummonedId, opts) {
    const product = ctx.product;
    const pt = product.productType;
    const time = ctx.effectiveTime;
    const gameMode = ctx.gameMode;
    const doExtra = (bucketList, weightList, n, updateLast, kind, source, triggerOf) => {
      for (let k = 0; k < n; k++) {
        const bi = getWeightedRandomIndex(rng, weightList);
        if (bi < 0) break;
        const e = this.pickFromBucket(rng, bucketList[bi], updateLast ? lastSummonedId : null);
        if (!e) continue;
        const ti = typeof triggerOf === "function" ? triggerOf(k) : triggerOf;
        results.push({ id: e.id, bucketIndex: bi, bonus: true, kind, source, triggerIndex: ti });
        if (updateLast) lastSummonedId = e.id;
      }
    };

    // A Harvest additionalDraw：从主桶抽 ⇒ source=additionalDraw（产出计入主概率）
    if (pt === "HarvestSummon" && product.additionalDrawWeights) {
      const aw = product.additionalDrawWeights;
      for (const r of results.slice()) {
        if (r.bonus) continue;
        const n = getWeightedRandomIndex(rng, aw);
        if (n > 0) doExtra(buckets, weights, n, true, "extra", "additionalDraw", r.pullIndex);
      }
    }

    // B BonusPullConfig lucky/pity
    const bonus = this.bonusByLotteryId[product._bulkOf || product.id] || this.bonusByLotteryId[product.id];
    if (bonus) this.doBonusPullConfig(bonus, ctx, buckets, weights, rng, results);

    // C/D HOTM（月度英雄统一用当月 now，不按奖池条目日期取未解锁月英）
    const monthlyEvent = getActiveMonthlyCharacterEvent(this.events, ctx.time, gameMode);
    if (monthlyEvent && this.hasHotmBonusRoll(product)) {
      const chance = gameMode === GameMode.Dragon
        ? (this.events.monthlyDragonSummonChancePerMil || 0)
        : (this.events.hotmSummonChancePerMil || 0);
      const candidates = this.getEventAssociatedHeroes(ctx.time, monthlyEvent.id, false, -1);
      this.doBonusRoll(rng, results, summonCount, chance, candidates, "hotm");
    }

    // E ExtraBuckets（官方 HasExtraBucketsPull＝extraBucketsPullAmount>=1 且额外桶非空）
    if (product.amount) {
      const extraBuilt = this.buildExtraBuckets(ctx, opts);
      if (extraBuilt) {
        const amount = Math.floor(summonCount / product.amount) * extraBuilt.pullAmount;
        if (amount > 0) {
          const ew = extraBuilt.buckets.map(b => b.weight);
          const pa = extraBuilt.pullAmount, per = product.amount;
          doExtra(extraBuilt.buckets, ew, amount, true, "extra", "extraBuckets",
            k => Math.min((Math.floor(k / pa) + 1) * per - 1, summonCount - 1));
        }
      }
    }

    // F Mystery
    if (this.hasMysteryBonusRoll(product)) {
      const mysteryEvent = getActiveUniqueEvent(this.events, time, EventType.MysteryHero);
      if (mysteryEvent) {
        const candidates = this.getSecretHeroes(time, mysteryEvent.id, false);
        this.doBonusRoll(rng, results, summonCount, this.events.mysterySummonChancePerMil || 0, candidates, "mystery");
      }
    }
  };

  Engine.prototype.doBonusRoll = function (rng, results, amount, chancePerMil, candidates, kind) {
    if (!candidates || !candidates.length) return;
    for (let i = 0; i < amount; i++) {
      if (rng.nextBool(chancePerMil)) {
        const pick = candidates[rng.nextInt(candidates.length)];
        results.push({ id: pick, bucketIndex: -1, bonus: true, source: "lucky", kind, triggerIndex: i });
      }
    }
  };

  Engine.prototype.doBonusPullConfig = function (bonus, ctx, buckets, weights, rng, results) {
    const luckyIdx = bonus.luckyPullBucketIndexes || [];
    const pityIdx = bonus.pityPullBucketIndexes || [];
    const chance = bonus.chancePerMil || 0;
    const amount = bonus.pullAmount || 1;
    const minRarity = bonus.triggersOnMinCharacterRarity || 0;
    const eventOnly = !!bonus.triggersOnEventCharactersOnly;
    const triggers = results.filter(r => {
      if (r.bonus) return false;
      const h = this.idx.get(r.id);
      if (!h || h.rarity < minRarity) return false;
      if (eventOnly && !this.isCharacterAssociated(ctx.product, h)) return false;
      return true;
    });
    for (const t of triggers) {
      for (let k = 0; k < amount; k++) {
        const luckyBuckets = luckyIdx.map(i => buckets[i]).filter(b => b && b.entries.length);
        if (rng.nextBool(chance) && luckyBuckets.length) {
          const b = luckyBuckets[rng.nextInt(luckyBuckets.length)];
          const e = this.pickFromBucket(rng, b, null);
          if (e) results.push({ id: e.id, bucketIndex: b.index, bonus: true, source: "lucky", kind: "bonus", triggerIndex: t.pullIndex });
        } else {
          const pityBuckets = pityIdx.map(i => buckets[i]).filter(b => b && b.entries.length);
          if (pityBuckets.length) {
            const b = pityBuckets[rng.nextInt(pityBuckets.length)];
            const e = this.pickFromBucket(rng, b, null);
            if (e) results.push({ id: e.id, bucketIndex: b.index, bonus: true, source: "pity", kind: "bonus", triggerIndex: t.pullIndex });
          }
        }
      }
    }
  };

  // 官方 HasCharacterOfTheMonthBonusRoll（逐产品 override）：
  //   恒 false：Ascension/Daily/Mimic/Reroll/WelcomeBack + 各 Troop/Item/ExtraPull；
  //   !IsAdProduct（非广告池即有）：Alliance/Challenge/ElementalHeroLottery/MapSeason/Pickup/Tower；
  //   其余恒 true。IsAdProduct 为运行时 bool（广告 _ad 变体），站点池均非广告池 ⇒ 缺省 false。
  const HOTM_BONUS_FALSE = ["AscensionSummon", "DailySummon", "EpicTroopSummon", "ExtraPullSummon",
    "ImprovedLegendaryTroopSummon", "ItemSummon", "LegendaryTroopSummon", "MimicSummon",
    "RerollSummon", "WelcomeBackSummon"];
  const HOTM_BONUS_UNLESS_AD = ["AllianceEventSummon", "ChallengeEventSummon", "ElementalHeroLottery",
    "MapSeasonSummon", "PickupSummon", "TowerEventSummon"];
  Engine.prototype.hasHotmBonusRoll = function (product) {
    const pt = product.productType;
    if (HOTM_BONUS_FALSE.indexOf(pt) >= 0) return false;
    if (HOTM_BONUS_UNLESS_AD.indexOf(pt) >= 0) return !product.isAdProduct;
    return true;
  };

  Engine.prototype.hasMysteryBonusRoll = function (product) {
    if (product.productType === "EpicDragonSummon") return false;
    const src = product.sourceProductId ? this.getProduct(product.sourceProductId) : product;
    const gemPrice = src ? (src.gemPrice || 0) : (product.gemPrice || 0);
    const min = this.events.minSourceProductGemPriceForMysterySummonChance || 200;
    return gemPrice > min && product.associatedEvent == null;
  };

  // 官方 TryAddBonusRollTextKeys：月英/秘密英雄奖励抽的概率行（独立 "Bonus Draw" 段）。
  // 返回 [{ kind, key, chancePerMil, heroId }]，heroId 取候选首个（官方 First），名称由 UI 本地化。
  Engine.prototype.getBonusRollOdds = function (ctx) {
    const product = ctx.product, time = ctx.effectiveTime, gameMode = ctx.gameMode;
    const dragon = gameMode === GameMode.Dragon;
    const out = [];
    if (this.hasHotmBonusRoll(product)) {
      const ev = getActiveMonthlyCharacterEvent(this.events, ctx.time, gameMode);
      if (ev) {
        const chance = dragon ? (this.events.monthlyDragonSummonChancePerMil || 0) : (this.events.hotmSummonChancePerMil || 0);
        const candidates = this.getEventAssociatedHeroes(ctx.time, ev.id, false, -1);
        if (candidates.length) out.push({ kind: "hotm", key: dragon ? "odds.hero_monthly.dragon" : "odds.hero_monthly", chancePerMil: chance, heroId: candidates[0] });
      }
    }
    if (this.hasMysteryBonusRoll(product)) {
      const ev = getActiveUniqueEvent(this.events, time, EventType.MysteryHero);
      if (ev) {
        const candidates = this.getSecretHeroes(time, ev.id, false);
        if (candidates.length) out.push({ kind: "mystery", key: "odds.hero_mystery", chancePerMil: this.events.mysterySummonChancePerMil || 0, heroId: candidates[0] });
      }
    }
    return out;
  };

  // 官方 TryAddUnavailableBonusRollTextKeys：免责声明仅当某奖励抽「不可用」但对应活动活跃时发出
  // （hasHotm==false 且当期月英活动存在 ⇒ "不包含当前的月度英雄"）。两者皆不可用合并 no_both 键。
  // 与 getBonusRollOdds（可用奖励抽）互补：可用的出概率行，不可用的出免责说明，二者不并存。
  Engine.prototype.getBonusRollDisclaimers = function (ctx) {
    const product = ctx.product, time = ctx.effectiveTime, gameMode = ctx.gameMode;
    const suf = gameMode === GameMode.Dragon ? ".dragon" : "";
    const cotm = getActiveMonthlyCharacterEvent(this.events, ctx.time, gameMode);
    const mystery = getActiveUniqueEvent(this.events, time, EventType.MysteryHero);
    const noHotm = !!cotm && !this.hasHotmBonusRoll(product);
    const noMystery = !!mystery && !this.hasMysteryBonusRoll(product);
    if (noHotm && noMystery) return ["odds.disclaimer.no_monthly_hero_and_mystery_hero_bonus_draw" + suf];
    if (noHotm) return ["odds.disclaimer.no_monthly_hero_draw" + suf];
    if (noMystery) return ["odds.disclaimer.no_mystery_hero_bonus_draw" + suf];
    return [];
  };

  // donation 候选
  Engine.prototype.getEventAssociatedHeroes = function (time, eventId, includeCostumes, rarity) {
    const pred = (h) => safeEquals(h.origin, eventId)
      && !isSecretOrDefaultRider(h)
      && (includeCostumes || !this.idx.isCostume(h))
      && (rarity === -1 || h.rarity === rarity);
    return getSafeDonationCurrentHeroes(this.idx, time, pred, 0).map(h => h.id);
  };
  Engine.prototype.getSecretHeroes = function (time, eventId, includeCostumes) {
    const pred = (h) => !!h.isSecret
      && (includeCostumes || !this.idx.isCostume(h))
      && safeEquals(h.origin, eventId);
    return getSafeDonationCurrentHeroes(this.idx, time, pred, 0).map(h => h.id);
  };

  // ---------- 概率计算 ----------
  Engine.prototype.computeOdds = function (poolId, time, opts) {
    const built = this.buildBuckets(poolId, time, opts);
    if (!built) return null;
    const { buckets } = built;
    const weights = buckets.map(b => b.weight);
    let sum = 0; for (const w of weights) sum += w;
    const out = buckets.map((b, i) => {
      const prob = sum > 0 ? b.weight / sum : 0;
      const n = b.entries.length;
      return {
        index: b.index, weight: b.weight, rarity: b.rarity, isFeatured: b.isFeatured,
        probability: prob,
        heroes: b.entries.map(e => ({ id: e.id, probability: n > 0 ? prob / n : 0 })),
      };
    });
    return { buckets: out, totalWeight: sum };
  };

  return {
    create: (data) => new Engine(data),
    Engine, DeterministicRandom, getWeightedRandomIndex,
    getSafeDonationCurrentHeroes, HeroIndex, parseTime,
    GameMode, EventType, IncludedCostume, TrainerType, ExclusiveTag,
  };
});