// Concept-based multilingual SFX dictionary
// Each KEY is a term in any language (es, en, fr, de, ru, ja, zh)
// The VALUE is the English search terms sent to FreeSound

type SynMap = Record<string, string[]>;

// ─── CONCEPT GROUPS ───
// Each group defines: { langs: multilingual terms, en: English search queries }

interface ConceptGroup {
  langs: string[];
  en: string[];
}

const CONCEPTS: ConceptGroup[] = [
  // ── JUMP ──
  {
    langs: ["salto", "saltar", "jump", "hop", "leap", "bounce", "skip",
      "saut", "sauter", "bond", "rebondir",
      "sprung", "springen", "hupfen", "hopser",
      "прыжок", "прыгать", "скакать",
      "ジャンプ", "janpu", "跳躍", "choyaku", "ホップ", "hoppu",
      "跳跃", "tiaoyue", "跳", "tiao",
      "land", "hard_land", "fall", "double_jump", "aterrizar", "caida", "doble_salto"],
    en: ["jump", "hop", "leap", "bounce", "jumping", "skip", "spring", "vault", "land", "hard_land", "fall", "double_jump"],
  },
  // ── SHOOT / GUNSHOT ──
  {
    langs: ["disparo", "disparar", "tiro", "shoot", "gunshot", "fire", "gun", "bullet", "bang", "pew", "blaster",
      "tir", "coup", "feu", "fusil", "pistolet",
      "schuss", "schießen", "knall", "peng", "pistole", "gewehr",
      "выстрел", "стрелять", "пистолет", "пуля", "бах", "пиу",
      "ショット", "shotto", "銃", "juu", "発砲", "happou", "ピストル", "pisutoru",
      "射击", "sheji", "枪", "qiang", "子弹", "zidan",
      "pistol_shot", "rifle_shot", "shotgun_shot", "sniper_shot", "laser_shot", "plasma_shot", "magic_shot",
      "bow_shot", "crossbow_shot", "cannon_shot", "bullet_impact", "bullet_whiz", "bullet_ricochet",
      "shell_casing_drop", "muzzle_flash", "dry_fire",
      "disparo_pistola", "disparo_rifle", "disparo_escopeta", "disparo_francotirador",
      "impacto_bala", "rebote_bala", "silbido_bala", "casquillo", "destello_boca", "disparo_seco"],
    en: ["shoot", "gunshot", "fire", "blast", "bang", "pew", "bullet", "shot", "gun", "zap",
      "pistol_shot", "rifle_shot", "shotgun_shot", "sniper_shot", "laser_shot", "plasma_shot", "magic_shot",
      "bow_shot", "crossbow_shot", "cannon_shot", "bullet_impact", "bullet_whiz", "bullet_ricochet",
      "shell_casing_drop", "muzzle_flash", "dry_fire"],
  },
  // ── EXPLOSION ──
  {
    langs: ["explosion", "explotar", "explosión", "explode", "blast", "boom", "bang", "detonate", "burst", "bomb",
      "explosion_fr", "exploser", "détonation", "boum",
      "explosion_de", "explodieren", "detonation", "knall", "bumm",
      "взрыв", "взрываться", "бабах", "бум", "бомба",
      "爆発", "bakuhatsu", "バクハツ", "ドカン", "dokan", "ボム", "bomu",
      "爆炸", "baozha", "爆", "bao", "炸弹", "zhadan",
      "explosion_small", "explosion_medium", "explosion_large", "explosion_magic", "explosion_fire",
      "explosion_electric", "explosion_ice", "explosion_plasma", "explosion_underwater", "explosion_distant",
      "grenade_explode", "explosion_pequeña", "explosion_grande", "explosion_magica", "explosion_fuego",
      "explosion_electrica", "explosion_hielo", "explosion_submarina", "explosion_distante", "granada_explotar"],
    en: ["explosion", "blast", "boom", "bang", "detonate", "burst", "bomb", "explode", "kaboom",
      "explosion_small", "explosion_medium", "explosion_large", "explosion_magic", "explosion_fire",
      "explosion_electric", "explosion_ice", "explosion_plasma", "explosion_underwater", "explosion_distant",
      "grenade_explode"],
  },
  // ── COIN / PICKUP ──
  {
    langs: ["moneda", "coin", "pickup", "collect", "loot", "item", "ding", "money", "jingle", "grab", "recolectar", "recoger",
      "pièce", "argent", "collecter", "ramasser", "objet",
      "münze", "geld", "einsammeln", "aufheben", "gegenstand",
      "монета", "монетка", "сбор", "деньги", "дзынь", "подобрать",
      "コイン", "koin", "アイテム", "aitemu", "取得", "shutoku", "ピックアップ", "pikkuappu",
      "金币", "jinbi", "道具", "daoju", "收集", "shouji", "拾取", "shiqu",
      "coin_pickup", "gem_pickup", "gold_pickup", "item_pickup", "item_drop", "item_use",
      "potion_drink", "potion_pickup", "food_eat", "key_pickup", "key_use",
      "loot_drop", "rare_loot", "legendary_loot", "treasure_reveal", "reward",
      "gema", "oro", "objeto_recoger", "objeto_usar", "pocion_beber", "comida_comer",
      "llave_recoger", "llave_usar", "botin_raro", "botin_legendario", "tesoro_revelar", "recompensa"],
    en: ["coin", "pickup", "collect", "ding", "money", "jingle", "item", "loot", "grab", "reward", "treasure",
      "coin_pickup", "gem_pickup", "gold_pickup", "item_pickup", "item_drop", "item_use",
      "potion_drink", "potion_pickup", "food_eat", "key_pickup", "key_use",
      "loot_drop", "rare_loot", "legendary_loot", "treasure_reveal"],
  },
  // ── HIT / PUNCH ──
  {
    langs: ["golpe", "golpear", "hit", "punch", "impact", "strike", "smack", "thud", "slam", "smash", "whack", "knock",
      "coup", "frapper", "impact", "claquer", "baffe",
      "schlag", "schlagen", "treffer", "hieb", "klatschen",
      "удар", "бить", "стук", "шлепок", "бах",
      "ヒット", "hitto", "パンチ", "panchi", "打撃", "dageki", "スマック", "sumakku",
      "打击", "daji", "击打", "重击", "zhongji", "砰", "peng",
      "kick", "kick_hit", "slap", "body_hit", "heavy_hit", "critical_hit", "weak_hit",
      "combo_hit", "finisher", "uppercut", "ground_slam", "stomp", "tackle", "punch_hit",
      "patada", "patada_golpe", "bofetada", "golpe_cuerpo", "golpe_fuerte", "golpe_critico",
      "golpe_debil", "golpe_combo", "remate", "gancho", "golpe_suelo", "pisoton", "embestida", "golpe_puño"],
    en: ["hit", "punch", "impact", "strike", "smack", "thud", "slam", "whack", "smash", "knock", "slap",
      "kick", "kick_hit", "body_hit", "heavy_hit", "critical_hit", "weak_hit",
      "combo_hit", "finisher", "uppercut", "ground_slam", "stomp", "tackle", "punch_hit"],
  },
  // ── LASER ──
  {
    langs: ["laser", "láser", "beam", "zap", "pew", "blaster", "ray", "rayo",
      "laser_fr", "rayon", "faisceau",
      "laser_de", "strahl",
      "лазер", "луч",
      "レーザー", "reezaa", "ビーム", "biimu", "光線", "kousen",
      "激光", "jiguang", "光束", "guangshu"],
    en: ["laser", "beam", "zap", "pew", "blaster", "ray", "phase", "energy"],
  },
  // ── POWERUP ──
  {
    langs: ["powerup", "power", "boost", "charge", "energy", "upgrade", "levelup", "level", "buff",
      "pouvoir", "bonus", "énergie", "amélioration",
      "kraft", "energie", "aufstieg", "verbesserung", "stärkung",
      "усиление", "энергия", "буст", "зарядка", "апгрейд",
      "パワーアップ", "pawaaappu", "強化", "kyouka", "バフ", "bafu",
      "升级", "shengji", "能量", "nengliang", "强化", "qianghua", "增益", "zengyi"],
    en: ["powerup", "boost", "charge", "energy", "levelup", "upgrade", "buff", "power", "enhance"],
  },
  // ── DEATH / DIE ──
  {
    langs: ["muerte", "morir", "muerto", "death", "die", "dead", "kill", "gameover", "defeat",
      "mort", "mourir", "décès", "tuer",
      "tod", "sterben", "tot", "getötet",
      "смерть", "умирать", "убит", "конец",
      "死亡", "shibou", "死", "shi", "ゲームオーバー", "geemu oobaa",
      "死亡", "siwang", "死", "si", "游戏结束", "youxi jieshu",
      "player_death", "enemy_death", "zombie_death", "boss_death", "player_respawn", "player_revive", "game_over",
      "muerte_jugador", "muerte_enemigo", "muerte_zombie", "muerte_jefe", "reaparecer_jugador", "revivir_jugador"],
    en: ["death", "die", "dead", "kill", "gameover", "defeat", "lose", "fail", "end",
      "player_death", "enemy_death", "zombie_death", "boss_death", "player_respawn", "player_revive", "game_over"],
  },
  // ── WIN / VICTORY ──
  {
    langs: ["victoria", "ganar", "victory", "win", "success", "fanfare", "triumph", "celebration",
      "victoire", "gagner", "succès", "réussite",
      "sieg", "gewinnen", "erfolg", "triumph",
      "победа", "выигрыш", "успех", "фанфары",
      "勝利", "shouri", "勝ち", "kachi", "ファンファーレ", "fanfaare",
      "胜利", "shengli", "成功", "chenggong", "赢", "ying",
      "level_up", "xp_gain", "skill_unlock", "achievement_unlock", "trophy_unlock", "rank_up",
      "subir_nivel", "ganar_xp", "desbloquear_habilidad", "logro_desbloqueado", "trofeo_desbloqueado", "subir_rango"],
    en: ["win", "victory", "success", "fanfare", "triumph", "celebration", "levelup", "achievement",
      "level_up", "xp_gain", "skill_unlock", "achievement_unlock", "trophy_unlock", "rank_up"],
  },
  // ── LOSE / FAIL ──
  {
    langs: ["derrota", "perder", "lose", "fail", "defeat", "gameover", "failure",
      "défaite", "perdre", "échec", "rater",
      "niederlage", "verlieren", "scheitern", "verlust",
      "поражение", "проигрыш", "провал",
      "敗北", "haiboku", "負け", "make", "失敗", "shippai",
      "失败", "shibai", "输", "shu", "输了", "shule",
      "quest_fail", "mission_failed", "match_end",
      "mision_fallida", "partida_terminada"],
    en: ["lose", "fail", "defeat", "gameover", "failure", "loss", "wrong", "error",
      "quest_fail", "mission_failed", "match_end"],
  },
  // ── CLICK / BUTTON ──
  {
    langs: ["click", "clic", "clique", "button", "tap", "press", "ui", "interface", "select", "menu", "botón",
      "cliquer", "bouton", "appuyer", "sélection",
      "klick", "klicken", "knopf", "drücken", "auswahl",
      "клик", "кнопка", "нажать", "щелчок",
      "クリック", "kurikku", "ボタン", "botan", "選択", "sentaku",
      "点击", "dianji", "按钮", "anniu", "按", "an",
      "ui_hover", "ui_click", "ui_toggle", "ui_slider", "ui_popup", "ui_notification",
      "ui_warning", "ui_success", "ui_fail", "button_press", "switch_click", "lever_pull",
      "interfaz_hover", "interfaz_clic", "interfaz_palanca", "interfaz_deslizador",
      "interfaz_emergente", "interfaz_notificacion", "interfaz_aviso", "interfaz_exito",
      "interfaz_fallo", "boton_presionar", "interruptor_clic", "palanca_tirar"],
    en: ["click", "tap", "press", "button", "ui", "interface", "select", "mouse", "keyboard", "type",
      "ui_hover", "ui_click", "ui_toggle", "ui_slider", "ui_popup", "ui_notification",
      "ui_warning", "ui_success", "ui_fail", "button_press", "switch_click", "lever_pull"],
  },
  // ── DOOR / OPEN ──
  {
    langs: ["puerta", "abrir", "apertura", "door", "open", "gate", "unlock", "creak",
      "porte", "ouvrir", "ouverture", "portail",
      "tür", "öffnen", "tor", "aufmachen",
      "дверь", "открыть", "открытие", "ворота",
      "ドア", "doa", "開く", "hiraku", "オープン", "oopun",
      "门", "men", "打开", "dakai", "开门", "kaimen",
      "metal_door_open", "metal_door_close", "wooden_door_open", "wooden_door_close",
      "gate_open", "gate_close", "door_locked", "door_unlock",
      "puerta_metal_abrir", "puerta_metal_cerrar", "puerta_madera_abrir", "puerta_madera_cerrar",
      "porton_abrir", "porton_cerrar", "puerta_bloqueada", "puerta_desbloquear"],
    en: ["door", "open", "gate", "unlock", "creak", "entrance", "close", "shut", "slam",
      "metal_door_open", "metal_door_close", "wooden_door_open", "wooden_door_close",
      "gate_open", "gate_close", "door_locked", "door_unlock"],
  },
  // ── SWORD / SLASH ──
  {
    langs: ["espada", "sword", "slash", "blade", "swing", "clash", "clang",
      "épée", "lame", "taillader", "frapper",
      "schwert", "klinge", "hieb", "schlagen",
      "меч", "клинок", "удар", "звон",
      "剣", "ken", "刀", "katana", "スラッシュ", "surasshu",
      "剑", "jian", "刀", "dao", "斩", "zhan", "挥砍", "huikan",
      "sword_swing", "sword_hit", "sword_clash", "sword_draw", "sword_sheath",
      "axe_swing", "axe_hit", "hammer_swing", "hammer_hit", "spear_thrust", "dagger_stab", "knife_slash",
      "espada_golpe", "espada_choque", "espada_desenvainar", "espada_envainar",
      "hacha_golpe", "martillo_golpe", "lanza_estocada", "daga_puñalada", "cuchillo_tajo"],
    en: ["sword", "slash", "blade", "swing", "clash", "clang", "metal", "weapon", "cut",
      "sword_swing", "sword_hit", "sword_clash", "sword_draw", "sword_sheath",
      "axe_swing", "axe_hit", "hammer_swing", "hammer_hit", "spear_thrust", "dagger_stab", "knife_slash"],
  },
  // ── BOW / ARROW ──
  {
    langs: ["arco", "flecha", "bow", "arrow", "twang", "shoot",
      "arc", "flèche", "tirer",
      "bogen", "pfeil", "schießen",
      "лук", "стрела", "тетива",
      "弓", "yumi", "矢", "ya", "アロー", "aroo",
      "弓", "gong", "箭", "jian", "射箭", "shejian"],
    en: ["bow", "arrow", "twang", "shoot", "string", "release", "whoosh"],
  },
  // ── SHIELD / BLOCK ──
  {
    langs: ["escudo", "bloqueo", "bloquear", "shield", "block", "defend", "parry", "deflect", "guard",
      "bouclier", "bloquer", "défense", "parer",
      "schild", "blocken", "abwehr", "verteidigung",
      "щит", "блок", "защита", "отражать",
      "シールド", "shiirudo", "防御", "bougyo", "ガード", "gaado",
      "盾", "dun", "防御", "fangyu", "格挡", "gedang",
      "shield_block", "shield_hit", "bloqueo_escudo", "golpe_escudo"],
    en: ["shield", "block", "defend", "parry", "deflect", "guard", "protect", "clang",
      "shield_block", "shield_hit"],
  },
  // ── HEAL / CURE ──
  {
    langs: ["curacion", "curar", "sanar", "heal", "cure", "health", "regen", "restore",
      "soin", "guérir", "santé", "régénération",
      "heilung", "heilen", "gesundheit", "wiederherstellen",
      "лечение", "здоровье", "исцеление", "восстановление",
      "回復", "kaifuku", "ヒール", "hiiru", "治療", "chiryou",
      "治疗", "zhiliao", "恢复", "huifu", "生命", "shengming"],
    en: ["heal", "cure", "health", "regen", "restore", "recovery", "magic", "spell"],
  },
  // ── MAGIC / SPELL ──
  {
    langs: ["magia", "hechizo", "magic", "spell", "enchant", "arcane", "mystic", "mana",
      "magie", "sort", "enchantement", "arcane",
      "magie", "zauber", "verzauberung", "arkan",
      "магия", "заклинание", "чары", "волшебство",
      "魔法", "mahou", "スペル", "superu", "魔力", "maryoku",
      "魔法", "mofa", "咒语", "zhouyu", "魔力", "moli",
      "magic_cast", "magic_charge", "magic_loop", "magic_impact", "magic_fail",
      "fireball_cast", "fireball_impact", "ice_spell_cast", "ice_spell_impact",
      "lightning_cast", "lightning_impact", "healing_spell", "poison_spell",
      "dark_spell", "holy_spell", "wind_spell", "earth_spell", "water_spell",
      "shield_spell", "curse_spell", "aura_loop", "spell_ready", "spell_cooldown",
      "mana_regen", "energy_pickup", "energy_loop", "mana_low",
      "lanzar_magia", "cargar_magia", "impacto_magia", "fallo_magia",
      "bola_fuego", "impacto_fuego", "hechizo_hielo", "impacto_hielo",
      "lanzar_rayo", "impacto_rayo", "hechizo_curacion", "hechizo_veneno",
      "hechizo_oscuro", "hechizo_sagrado", "hechizo_viento", "hechizo_tierra",
      "hechizo_agua", "hechizo_escudo", "hechizo_maldicion", "aura",
      "hechizo_listo", "enfriamiento", "regeneracion_mana", "recoger_energia", "mana_baja"],
    en: ["magic", "spell", "enchant", "arcane", "mystic", "mana", "whoosh", "chime", "cast",
      "magic_cast", "magic_charge", "magic_loop", "magic_impact", "magic_fail",
      "fireball_cast", "fireball_impact", "ice_spell_cast", "ice_spell_impact",
      "lightning_cast", "lightning_impact", "healing_spell", "poison_spell",
      "dark_spell", "holy_spell", "wind_spell", "earth_spell", "water_spell",
      "shield_spell", "curse_spell", "aura_loop", "spell_ready", "spell_cooldown",
      "mana_regen", "energy_pickup", "energy_loop", "mana_low"],
  },
  // ── PORTAL / TELEPORT ──
  {
    langs: ["portal", "teleport", "warp", "blink", "vanish", "transport",
      "portail", "téléportation", "disparaître",
      "portal", "teleport", "verschwinden", "warp",
      "портал", "телепорт", "телепортация",
      "ポータル", "pootaru", "テレポート", "terepooto", "ワープ", "waapu",
      "传送门", "chuansongmen", "传送", "chuansong", "瞬移", "shunyi",
      "teleport_in", "teleport_out", "portal_open", "portal_close",
      "summon", "banish", "spawn", "monster_spawn", "monster_despawn",
      "teletransporte_entrar", "teletransporte_salir", "portal_abrir", "portal_cerrar",
      "invocar", "desterrar", "aparecer", "monstruo_aparecer", "monstruo_desaparecer"],
    en: ["portal", "teleport", "warp", "blink", "vanish", "appear", "whoosh", "vortex", "gate",
      "teleport_in", "teleport_out", "portal_open", "portal_close",
      "summon", "banish", "spawn", "monster_spawn", "monster_despawn"],
  },
  // ── WATER / SPLASH ──
  {
    langs: ["agua", "splash", "water", "drip", "liquid", "bubble", "flow", "wave",
      "eau", "éclaboussure", "goutte", "liquide", "bulle",
      "wasser", "spritzen", "tropfen", "blase", "welle",
      "вода", "всплеск", "капля", "пузырь", "волна",
      "水", "mizu", "スプラッシュ", "supurasshu", "波", "nami",
      "水", "shui", "溅", "jian", "水滴", "shuidi",
      "water_drip", "water_splash", "water_big_splash", "underwater_loop",
      "river_loop", "waterfall_loop", "wave_crash",
      "goteo_agua", "gran_salpicadura", "bajo_agua", "rio", "cascada", "ola_romper"],
    en: ["water", "splash", "drip", "liquid", "bubble", "flow", "wave", "ocean", "river",
      "water_drip", "water_splash", "water_big_splash", "underwater_loop",
      "river_loop", "waterfall_loop", "wave_crash"],
  },
  // ── FIRE ──
  {
    langs: ["fuego", "fire", "flame", "burn", "crackle", "ignite", "blaze", "inferno",
      "feu", "flamme", "brûler", "crépiter", "allumer",
      "feuer", "flamme", "brennen", "knistert", "entzünden",
      "огонь", "пламя", "гореть", "треск", "зажигать",
      "火", "hi", "ファイア", "faia", "炎", "honoo", "燃える", "moeru",
      "火", "huo", "火焰", "huoyan", "燃烧", "ranshao",
      "fire_ignite", "fire_loop", "fire_extinguish", "flame_burst", "torch_loop",
      "campfire_loop", "lava_bubble", "lava_splash", "steam_burst", "smoke_puff",
      "encender_fuego", "fuego_extinguir", "llamarada", "antorcha", "hoguera",
      "lava_burbuja", "lava_salpicadura", "vapor_rafaga", "humo_bocanada"],
    en: ["fire", "flame", "burn", "crackle", "ignite", "blaze", "inferno", "hot", "ember",
      "fire_ignite", "fire_loop", "fire_extinguish", "flame_burst", "torch_loop",
      "campfire_loop", "lava_bubble", "lava_splash", "steam_burst", "smoke_puff"],
  },
  // ── ICE / FREEZE ──
  {
    langs: ["hielo", "congelar", "ice", "freeze", "frost", "cold", "crystal", "shatter",
      "glace", "geler", "gel", "froid", "cristal",
      "eis", "frieren", "frost", "kalt", "kristall",
      "лед", "заморозка", "холод", "кристалл",
      "氷", "koori", "フリーズ", "furiizu", "凍結", "touketsu",
      "冰", "bing", "冻结", "dongjie", "冰冻", "bingdong",
      "ice_crack", "ice_break", "snow_crunch", "avalanche",
      "hielo_quebrar", "hielo_romper", "nieve_crujir", "avalancha"],
    en: ["ice", "freeze", "frost", "cold", "crystal", "shatter", "arctic", "winter",
      "ice_crack", "ice_break", "snow_crunch", "avalanche"],
  },
  // ── LIGHTNING / ELECTRIC ──
  {
    langs: ["rayo", "electricidad", "lightning", "thunder", "zap", "spark", "shock", "bolt", "electric",
      "foudre", "éclair", "électricité", "étincelle",
      "blitz", "donner", "elektrizität", "funke",
      "молния", "электричество", "искра", "удар током",
      "雷", "kaminari", "稲妻", "inazuma", "エレクトリック", "erekutorikku",
      "闪电", "shandian", "电", "dian", "雷电", "leidian",
      "lightning_strike", "impacto_rayo"],
    en: ["lightning", "thunder", "zap", "spark", "shock", "bolt", "electric", "crackle", "buzz",
      "lightning_strike"],
  },
  // ── WIND ──
  {
    langs: ["viento", "wind", "gust", "blow", "howl", "breeze", "whoosh",
      "vent", "souffler", "brise", "rafale",
      "wind", "wehen", "brise", "sturm",
      "ветер", "дуновение", "порыв", "шум ветра",
      "風", "kaze", "ウィンド", "windo", "そよ風", "soyokaze",
      "风", "feng", "吹", "chui", "微风", "weifeng",
      "wind_gust", "wind_loop", "tornado_loop",
      "rafaga_viento", "viento_bucle", "tornado_bucle"],
    en: ["wind", "gust", "blow", "howl", "breeze", "whoosh", "storm", "air", "swoosh",
      "wind_gust", "wind_loop", "tornado_loop"],
  },
  // ── WALK / FOOTSTEP ──
  {
    langs: ["caminar", "paso", "pisada", "walk", "step", "footstep", "run", "sprint", "dash",
      "marcher", "pas", "course", "sprint",
      "gehen", "schritt", "laufen", "rennen",
      "ходить", "шаг", "бежать", "топот",
      "歩く", "aruku", "足音", "ashioto", "走る", "hashiru",
      "走", "zou", "走路", "zoulu", "跑步", "paobu", "脚步", "jiaobu",
      "footstep_grass", "footstep_dirt", "footstep_stone", "footstep_metal", "footstep_wood",
      "footstep_water", "footstep_snow", "footstep_sand", "footstep_mud", "footstep_carpet",
      "footstep_glass", "footstep_leaves", "armor_step", "monster_step", "giant_step",
      "stealth_step", "sprint_start", "sprint_loop", "sprint_stop",
      "paso_cesped", "paso_tierra", "paso_piedra", "paso_metal", "paso_madera",
      "paso_agua", "paso_nieve", "paso_arena", "paso_barro", "paso_alfombra",
      "paso_vidrio", "paso_hojas", "paso_armadura", "paso_monstruo", "paso_gigante",
      "paso_sigilo", "empezar_correr", "correr_bucle", "parar_correr"],
    en: ["walk", "step", "footstep", "run", "sprint", "dash", "stroll", "march",
      "footstep_grass", "footstep_dirt", "footstep_stone", "footstep_metal", "footstep_wood",
      "footstep_water", "footstep_snow", "footstep_sand", "footstep_mud", "footstep_carpet",
      "footstep_glass", "footstep_leaves", "armor_step", "monster_step", "giant_step",
      "stealth_step", "sprint_start", "sprint_loop", "sprint_stop"],
  },
  // ── ALARM / SIREN ──
  {
    langs: ["alarma", "sirena", "alarm", "alert", "warning", "siren", "emergency", "bell",
      "alarme", "sirène", "alerte", "urgence",
      "alarm", "warnung", "sirene", "notfall",
      "сигнализация", "тревога", "сирена", "предупреждение",
      "アラーム", "araamu", "警報", "keihou", "サイレン", "sairen",
      "警报", "jingbao", "警告", "jinggao", "警笛", "jingdi"],
    en: ["alarm", "alert", "warning", "siren", "emergency", "bell", "ring", "danger", "caution"],
  },
  // ── NOTIFICATION ──
  {
    langs: ["notificacion", "aviso", "notification", "ping", "pop", "ding", "bell", "chime", "message",
      "notification_fr", "message", "alerte",
      "benachrichtigung", "nachricht", "meldung",
      "уведомление", "сообщение", "звонок",
      "通知", "tsuuchi", "お知らせ", "oshirase", "ピコン", "pikon",
      "通知", "tongzhi", "消息", "xiaoxi", "提醒", "tixing"],
    en: ["notification", "ping", "pop", "ding", "bell", "chime", "message", "alert", "notice"],
  },
  // ── ERROR / WRONG ──
  {
    langs: ["error", "equivocado", "wrong", "fail", "buzz", "incorrect", "mistake",
      "erreur", "faux", "incorrect", "rater",
      "fehler", "falsch", "summen", "verkehrt",
      "ошибка", "неправильно", "провал",
      "エラー", "eraa", "間違い", "machigai", "失敗", "shippai",
      "错误", "cuowu", "错", "cuo", "失败", "shibai"],
    en: ["error", "wrong", "fail", "buzz", "incorrect", "mistake", "false", "alert", "warning"],
  },
  // ── MENU ──
  {
    langs: ["menu", "menú", "interface", "ui", "panel", "screen",
      "menu_fr", "écran", "panneau",
      "menü", "bildschirm", "oberfläche",
      "меню", "экран", "интерфейс", "панель",
      "メニュー", "menyuu", "画面", "gamen", "UI", "yuuai",
      "菜单", "caidan", "界面", "jiemian", "屏幕", "pingmu",
      "menu_open", "menu_close", "menu_move", "menu_select", "menu_back",
      "menu_confirm", "menu_cancel", "menu_error",
      "menu_abrir", "menu_cerrar", "menu_mover", "menu_seleccionar",
      "menu_atras", "menu_confirmar", "menu_cancelar", "menu_error_es"],
    en: ["menu", "interface", "ui", "panel", "screen", "open", "close", "navigate",
      "menu_open", "menu_close", "menu_move", "menu_select", "menu_back",
      "menu_confirm", "menu_cancel", "menu_error"],
  },
  // ── ROCKET / MISSILE ──
  {
    langs: ["cohete", "misil", "rocket", "missile", "launch", "blast", "thrust",
      "fusée", "missile", "lancement", "décollage",
      "rakete", "raketenstart", "abschuss",
      "ракета", "запуск", "старт", "реактивный",
      "ロケット", "roketto", "ミサイル", "misairu", "発射", "hassha",
      "火箭", "huojian", "导弹", "daodan", "发射", "fashe",
      "rocket_launch", "lanzar_cohete"],
    en: ["rocket", "missile", "launch", "blast", "thrust", "fly", "engine", "jet",
      "rocket_launch"],
  },
  // ── ENGINE / MOTOR ──
  {
    langs: ["motor", "engine", "vehicle", "car", "drive", "rev",
      "moteur", "voiture", "conduire", "accélérer",
      "motor", "auto", "wagen", "fahren",
      "двигатель", "мотор", "машина", "ехать",
      "エンジン", "enjin", "車", "kuruma", "ドライブ", "doraibu",
      "引擎", "yinqing", "发动机", "fadongji", "车", "che",
      "engine_start", "engine_loop", "engine_stop", "car_accelerate", "car_brake",
      "car_drift", "tire_screech", "car_crash", "car_horn",
      "train_pass", "train_horn", "boat_engine", "boat_wave",
      "helicopter_loop", "plane_flyby", "jet_boost",
      "spaceship_flyby", "spaceship_engine", "spaceship_boost", "spaceship_explosion",
      "drone_fly",
      "motor_arrancar", "motor_bucle", "motor_parar", "coche_acelerar", "coche_frenar",
      "coche_derrapar", "neumatico_chirriar", "coche_choque", "claxon",
      "tren_pasar", "tren_bocina", "barco_motor", "barco_ola",
      "helicoptero_bucle", "avion_pasar", "jet_impulso",
      "nave_espacial_pasar", "nave_espacial_motor", "nave_espacial_impulso", "nave_espacial_explosion",
      "dron_volar"],
    en: ["engine", "motor", "vehicle", "car", "drive", "rev", "rumble", "hum", "accelerate",
      "engine_start", "engine_loop", "engine_stop", "car_accelerate", "car_brake",
      "car_drift", "tire_screech", "car_crash", "car_horn",
      "train_pass", "train_horn", "boat_engine", "boat_wave",
      "helicopter_loop", "plane_flyby", "jet_boost",
      "spaceship_flyby", "spaceship_engine", "spaceship_boost", "spaceship_explosion",
      "drone_fly"],
  },
  // ── BREAK / SHATTER ──
  {
    langs: ["romper", "quebrar", "break", "shatter", "crack", "smash", "destroy", "crush",
      "casser", "briser", "détruire", "fracasser",
      "zerbrechen", "brechen", "zerschmettern", "kaputt",
      "сломать", "разбить", "треснуть", "разрушить",
      "壊す", "kowasu", "破壊", "hakai", "クラッシュ", "kurasshu",
      "破坏", "pohuai", "打破", "dapo", "粉碎", "fensui",
      "glass_break", "rock_break", "rock_fall", "tree_fall", "branch_snap",
      "vidrio_romper", "roca_romper", "roca_caer", "arbol_caer", "rama_romper"],
    en: ["break", "shatter", "crack", "smash", "destroy", "crush", "glass", "wood", "impact",
      "glass_break", "rock_break", "rock_fall", "tree_fall", "branch_snap"],
  },
  // ── GLASS ──
  {
    langs: ["vidrio", "cristal", "glass", "break", "shatter", "clink", "window",
      "verre", "briser", "vitre", "fenêtre",
      "glas", "zerbrechen", "fenster", "klirren",
      "стекло", "разбить", "окно", "звон",
      "ガラス", "garasu", "窓", "mado", "割れる", "wareru",
      "玻璃", "boli", "窗户", "chuanghu", "碎", "sui",
      "glass_break", "vidrio_romper"],
    en: ["glass", "break", "shatter", "clink", "window", "crack", "tinkle", "glass_break"],
  },
  // ── METAL / CLANG ──
  {
    langs: ["metal", "clang", "clink", "iron", "steel", "impact", "heavy",
      "métal", "acier", "fer", "choc",
      "metall", "stahl", "eisen", "klirren",
      "металл", "сталь", "железо", "звон",
      "金属", "kinzoku", "鉄", "tetsu", "鋼", "hagane",
      "金属", "jinshu", "铁", "tie", "钢", "gang",
      "chain_rattle", "cadena_sacudir"],
    en: ["metal", "clang", "clink", "iron", "steel", "impact", "heavy", "industrial", "chain_rattle"],
  },
  // ── WOOD ──
  {
    langs: ["madera", "wood", "timber", "crack", "creak", "thud",
      "bois", "craquer", "grincer", "bruit sourd",
      "holz", "knacken", "brett", "knarren",
      "дерево", "треск", "доска", "стук",
      "木", "ki", "材木", "zaimoku", "きしみ", "kishimi",
      "木头", "mutou", "木材", "mucai", "嘎吱", "gazhi",
      "crate_break", "barrel_break", "pottery_break",
      "caja_romper", "barril_romper", "ceramica_romper"],
    en: ["wood", "timber", "crack", "creak", "thud", "plank", "branch",
      "crate_break", "barrel_break", "pottery_break"],
  },
  // ── ENEMY / MONSTER ──
  {
    langs: ["enemigo", "monstruo", "enemy", "monster", "boss", "foe", "creature", "beast",
      "ennemi", "monstre", "boss", "créature",
      "feind", "monster", "gegner", "kreatur",
      "враг", "монстр", "босс", "существо",
      "敵", "teki", "モンスター", "monsutaa", "ボス", "bosu",
      "敌人", "diren", "怪物", "guaiwu", "怪兽", "guaishou", "boss", "laoban",
      "enemy_hurt", "enemy_pain", "enemy_death", "enemy_alert", "enemy_idle", "enemy_attack",
      "enemy_charge", "enemy_roar", "enemy_growl", "enemy_scream", "beast_snarl",
      "enemigo_herido", "enemigo_dolor", "enemigo_muerte", "enemigo_alerta",
      "enemigo_inactivo", "enemigo_atacar", "enemigo_cargar", "enemigo_rugir",
      "enemigo_grunir", "enemigo_gritar", "bestia_gruñir"],
    en: ["enemy", "monster", "boss", "foe", "creature", "beast", "growl", "roar",
      "enemy_hurt", "enemy_pain", "enemy_death", "enemy_alert", "enemy_idle", "enemy_attack",
      "enemy_charge", "enemy_roar", "enemy_growl", "enemy_scream", "beast_snarl"],
  },
  // ── ROBOT / MECH ──
  {
    langs: ["robot", "mech", "mechanical", "android", "machine",
      "robot_fr", "mécanique", "machine",
      "roboter", "mechanisch", "maschine",
      "робот", "механический", "машина",
      "ロボット", "robotto", "メカ", "meka", "機械", "kikai",
      "机器人", "jiqiren", "机械", "jixie", "机甲", "jijia",
      "robot_move", "robot_hit", "robot_death", "mech_step", "mech_servo", "mech_weapon", "mech_explode",
      "robot_movimiento", "robot_golpe", "robot_muerte", "mech_paso", "mech_servomotor", "mech_arma", "mech_explotar"],
    en: ["robot", "mech", "mechanical", "android", "machine", "beep", "servo", "electronic",
      "robot_move", "robot_hit", "robot_death", "mech_step", "mech_servo", "mech_weapon", "mech_explode"],
  },
  // ── GHOST / SPIRIT ──
  {
    langs: ["fantasma", "espiritu", "ghost", "spirit", "spooky", "haunt", "boo",
      "fantôme", "esprit", "hanté",
      "geist", "spuk", "gespenst",
      "призрак", "дух", "привидение", "бу",
      "幽霊", "yuurei", "ゴースト", "goosuto", "お化け", "obake",
      "鬼", "gui", "幽灵", "youling", "鬼魂", "guihun",
      "ghost_whisper", "ghost_attack", "fantasma_susurro", "fantasma_ataque"],
    en: ["ghost", "spirit", "spooky", "haunt", "boo", "scary", "ethereal", "horror",
      "ghost_whisper", "ghost_attack"],
  },
  // ── DRAGON ──
  {
    langs: ["dragon", "dragón", "drake", "wyrm", "roar", "fire",
      "dragon_fr", "dragon_fr2", "cracheur de feu",
      "drache", "feuer",
      "дракон", "змей", "рык",
      "ドラゴン", "doragon", "竜", "ryuu", "龍", "tatsu",
      "龙", "long", "恐龙", "konglong",
      "dragon_roar", "dragon_fire", "dragon_rugido", "dragon_fuego"],
    en: ["dragon", "drake", "roar", "fire", "winged", "mythical",
      "dragon_roar", "dragon_fire"],
  },
  // ── ZOMBIE / UNDEAD ──
  {
    langs: ["zombie", "muerto viviente", "zombi", "undead", "ghoul",
      "zombie_fr", "mort-vivant",
      "zombie_de", "untoter",
      "зомби", "нежить",
      "ゾンビ", "zonbi", "アンデッド", "andeddo",
      "僵尸", "jiangshi", "丧尸", "sangshi",
      "zombie_idle", "zombie_attack", "zombie_death",
      "zombie_inactivo", "zombie_atacar", "zombie_muerte"],
    en: ["zombie", "undead", "ghoul", "moan", "growl", "horror", "brain",
      "zombie_idle", "zombie_attack", "zombie_death"],
  },
  // ── POISON / TOXIC ──
  {
    langs: ["veneno", "toxico", "poison", "toxic", "acid", "burn",
      "poison_fr", "toxique", "acide",
      "gift", "giftig", "säure",
      "яд", "отрава", "токсичный",
      "毒", "doku", "ポイズン", "poizun",
      "毒", "du", "中毒", "zhongdu", "毒药", "duyao"],
    en: ["poison", "toxic", "acid", "burn", "sick", "green", "bubble"],
  },
  // ── STUN / DIZZY ──
  {
    langs: ["aturdido", "mareado", "stun", "dizzy", "paralyze", "daze",
      "étourdi", "paralysé", "vertige",
      "betäubt", "schwindlig", "lähmen",
      "оглушение", "головокружение", "паралич",
      "スタン", "sutan", "めまい", "memai", "麻痺", "mahi",
      "眩晕", "xuanyun", "麻痹", "mabi", "昏迷", "hunmi"],
    en: ["stun", "dizzy", "paralyze", "daze", "stars", "spin", "confuse"],
  },
  // ── DODGE / EVADE ──
  {
    langs: ["esquivar", "evadir", "dodge", "evade", "sidestep", "roll", "avoid",
      "esquiver", "éviter", "roulade",
      "ausweichen", "vermeiden", "rolle",
      "уклонение", "уворот", "перекат",
      "回避", "kaihi", "ドッジ", "dojji", "かわす", "kawasu",
      "闪避", "shanbi", "躲避", "duobi", "翻滚", "fangun"],
    en: ["dodge", "evade", "sidestep", "roll", "avoid", "swoosh", "fast"],
  },
  // ── FOOTBALL / SOCCER ──
  {
    langs: ["futbol", "fútbol", "soccer", "football", "kick", "goal", "stadium",
      "football_fr", "foot", "but", "stade",
      "fußball", "tor", "stadion",
      "футбол", "гол", "стадион",
      "サッカー", "sakkaa", "ゴール", "gooru",
      "足球", "zuqiu", "进球", "jinqiu"],
    en: ["soccer", "football", "kick", "goal", "stadium", "cheer", "crowd"],
  },
  // ── RACE / SPEED ──
  {
    langs: ["carrera", "race", "speed", "fast", "competition", "rush",
      "course", "vitesse", "rapide", "compétition",
      "rennen", "geschwindigkeit", "schnell", "wettkampf",
      "гонка", "скорость", "быстро",
      "レース", "reesu", "スピード", "supiido", "競争", "kyousou",
      "比赛", "bisai", "赛车", "saiche", "速度", "sudu"],
    en: ["race", "speed", "fast", "competition", "rush", "go", "countdown"],
  },
  // ── COUNTDOWN ──
  {
    langs: ["cuenta regresiva", "countdown", "timer", "clock", "tick",
      "compte à rebours", "minuteur", "horloge",
      "countdown_de", "zeituhr", "uhr",
      "обратный отсчет", "таймер", "часы",
      "カウントダウン", "kauntodaun", "タイマー", "taimaa",
      "倒计时", "daojishi", "计时器", "jishiqi",
      "countdown_tick", "countdown_final", "timer_start", "timer_end",
      "cuenta_regresiva_tic", "cuenta_regresiva_final", "temporizador_iniciar", "temporizador_fin"],
    en: ["countdown", "timer", "clock", "tick", "number", "beep", "start",
      "countdown_tick", "countdown_final", "timer_start", "timer_end"],
  },
  // ── RAIN / WEATHER ──
  {
    langs: ["lluvia", "storm", "rain", "weather", "thunder", "downpour",
      "pluie", "tempête", "orage", "averse",
      "regen", "sturm", "gewitter",
      "дождь", "гроза", "ливень", "погода",
      "雨", "ame", "嵐", "arashi", "天気", "tenki",
      "雨", "yu", "暴风雨", "baofengyu", "天气", "tianqi",
      "rain_light", "rain_heavy", "lluvia_ligera", "lluvia_fuerte"],
    en: ["rain", "storm", "weather", "thunder", "downpour", "drip", "water", "ambient",
      "rain_light", "rain_heavy"],
  },
  // ── NIGHT / DARK ──
  {
    langs: ["noche", "oscuridad", "night", "dark", "ambient", "cricket",
      "nuit", "sombre", "noir", "obscurité",
      "nacht", "dunkel", "finsternis",
      "ночь", "темнота", "тьма",
      "夜", "yoru", "暗闇", "kurayami", "ナイト", "naito",
      "夜晚", "yewan", "黑暗", "heian", "夜色", "yese"],
    en: ["night", "dark", "ambient", "cricket", "owl", "moon", "silence"],
  },
  // ── FOREST / NATURE ──
  {
    langs: ["bosque", "naturaleza", "forest", "nature", "birds", "trees", "woods",
      "forêt", "nature", "oiseaux", "arbres",
      "wald", "natur", "vögel", "bäume",
      "лес", "природа", "птицы", "деревья",
      "森", "mori", "自然", "shizen", "鳥", "tori",
      "森林", "senlin", "自然", "ziran", "鸟", "niao",
      "ambient_forest", "leaf_rustle", "bush_rustle", "grass_rustle",
      "ambiente_bosque", "hoja_susurro", "arbusto_susurro", "cesped_susurro"],
    en: ["forest", "nature", "birds", "trees", "woods", "ambient", "wind", "leaves",
      "ambient_forest", "leaf_rustle", "bush_rustle", "grass_rustle"],
  },
  // ── CITY / URBAN ──
  {
    langs: ["ciudad", "urbano", "city", "urban", "traffic", "street", "noise",
      "ville", "urbain", "circulation", "rue",
      "stadt", "verkehr", "straße", "lärm",
      "город", "уличный", "трафик", "шум",
      "都市", "toshi", "街", "machi", "交通", "koutsuu",
      "城市", "chengshi", "街道", "jiedao", "交通", "jiaotong",
      "ambient_city", "ambiente_ciudad"],
    en: ["city", "urban", "traffic", "street", "noise", "ambient", "crowd", "car", "ambient_city"],
  },
  // ── SPACE / COSMIC ──
  {
    langs: ["espacio", "cosmos", "space", "cosmic", "star", "void", "galaxy",
      "espace", "cosmique", "étoile", "galaxie",
      "weltraum", "kosmos", "stern", "galaxie",
      "космос", "звезда", "галактика", "вселенная",
      "宇宙", "uchuu", "星", "hoshi", "銀河", "ginga",
      "太空", "taikong", "宇宙", "yuzhou", "星", "xing",
      "ambient_space", "ambiente_espacio"],
    en: ["space", "cosmic", "star", "void", "galaxy", "scifi", "ambient", "deep", "ambient_space"],
  },
  // ── DASH (movement) ──
  {
    langs: ["dash", "impulso", "rush", "sprint", "boost", "speed",
      "ruée", "élan", "vitesse",
      "sturmlauf", "sprinten", "schub",
      "рывок", "спринт", "ускорение",
      "ダッシュ", "dasshu", "突進", "tosshin",
      "冲刺", "chongci", "疾跑", "jipao",
      "roll", "rodar"],
    en: ["dash", "rush", "sprint", "boost", "speed", "fast", "whoosh", "zoom", "roll"],
  },
  // ── LOCK / UNLOCK ──
  {
    langs: ["bloquear", "desbloquear", "cerrar", "lock", "unlock", "secure", "key",
      "verrouiller", "déverrouiller", "serrure", "clé",
      "sperren", "entsperren", "schloss", "schlüssel",
      "закрыть", "открыть", "замок", "ключ",
      "ロック", "rokku", "アンロック", "anrokku", "鍵", "kagi",
      "锁", "suo", "解锁", "jiesuo", "钥匙", "yaoshi"],
    en: ["lock", "unlock", "secure", "key", "click", "mechanism", "open"],
  },
  // ── TRANSFORM / MORPH ──
  {
    langs: ["transformar", "transform", "morph", "change", "shift", "evolve",
      "transformer", "métamorphose", "changer",
      "verwandeln", "transformation", "ändern",
      "трансформация", "превращение", "изменение",
      "変身", "henshin", "トランスフォーム", "toransufoomu",
      "变形", "bianxing", "变换", "bianhuan", "变身", "bianshen"],
    en: ["transform", "morph", "change", "shift", "evolve", "whoosh", "magic"],
  },
  // ── TIME ──
  {
    langs: ["tiempo", "reloj", "time", "clock", "tick", "watch", "hour",
      "temps", "horloge", "montre", "heure",
      "zeit", "uhr", "stunde", "ticken",
      "время", "часы", "тик",
      "時間", "jikan", "時計", "tokei", "チクタク", "chikutaku",
      "时间", "shijian", "钟", "zhong", "滴答", "dida"],
    en: ["time", "clock", "tick", "watch", "hour", "ticktock", "timer"],
  },
  // ── LAUGH ──
  {
    langs: ["risa", "reir", "laugh", "laughter", "giggle", "funny",
      "rire", "rigoler", "comique",
      "lachen", "kichern", "lustig",
      "смех", "хохот", "смеяться",
      "笑い", "warai", "笑う", "warau", "ハハハ", "hahaha",
      "笑声", "xiaosheng", "笑", "xiao", "哈哈", "haha"],
    en: ["laugh", "laughter", "giggle", "funny", "joy", "happy", "chuckle"],
  },
  // ── SCREAM / YELL ──
  {
    langs: ["grito", "gritar", "scream", "yell", "shout", "cry",
      "cri", "hurler", "crier", "pleurer",
      "schrei", "schreien", "rufen",
      "крик", "орать", "вопль",
      "叫び", "sakebi", "悲鳴", "himei", "叫ぶ", "sakebu",
      "尖叫", "jianjiao", "喊叫", "hanjiao", "呐喊", "nahan"],
    en: ["scream", "yell", "shout", "cry", "horror", "scary", "panic"],
  },
  // ── WHISPER ──
  {
    langs: ["susurro", "susurrar", "whisper", "quiet", "soft", "hush",
      "chuchoter", "murmure", "doux",
      "flüstern", "leise", "pst",
      "шепот", "тихо", "шёпот",
      "ささやき", "sasayaki", "小声", "kogoe",
      "悄悄话", "qiaoqiaohua", "耳语", "eryu", "轻声", "qingsheng"],
    en: ["whisper", "quiet", "soft", "hush", "secret", "stealth", "low"],
  },
  // ── CROWD / CHEER ──
  {
    langs: ["multitud", "aplauso", "crowd", "cheer", "clap", "applause", "audience",
      "foule", "acclamer", "applaudir", "public",
      "menge", "jubeln", "applaus", "publikum",
      "толпа", "аплодисменты", "овации",
      "群衆", "gunshuu", "拍手", "hakushu", "歓声", "kansei",
      "人群", "renqun", "欢呼", "huanhu", "鼓掌", "guzhang",
      "crowd_boo", "crowd_panic", "multitud_abucheo", "multitud_panico"],
    en: ["crowd", "cheer", "clap", "applause", "audience", "public", "chatter",
      "crowd_boo", "crowd_panic"],
  },
  // ── BUBBLE / POP ──
  {
    langs: ["burbuja", "pop", "bubble", "boil", "fizz",
      "bulle", "éclater", "bouillir",
      "blase", "platzen", "kochen",
      "пузырь", "хлоп", "кипеть",
      "泡", "awa", "バブル", "baburu", "ポップ", "poppu",
      "泡泡", "paopao", "爆炸", "baozha", "气泡", "qipao",
      "water_drip", "lava_bubble", "goteo_agua", "lava_burbuja"],
    en: ["bubble", "pop", "boil", "fizz", "burst", "water", "liquid",
      "water_drip", "lava_bubble"],
  },
  // ── BALL ──
  {
    langs: ["pelota", "balon", "ball", "bounce", "kick", "sports",
      "balle", "ballon", "rebondir", "sport",
      "ball", "springen", "kicken", "sport",
      "мяч", "прыгать", "спорт",
      "ボール", "booru", "球", "tama", "スポーツ", "supootsu",
      "球", "qiu", "弹跳", "tantiao", "运动", "yundong"],
    en: ["ball", "bounce", "kick", "sports", "game", "play", "toy"],
  },
  // ── KEYBOARD / TYPING ──
  {
    langs: ["teclado", "escribir", "typing", "keyboard", "type", "keystroke",
      "clavier", "taper", "dactylographie",
      "tastatur", "tippen", "schreiben",
      "клавиатура", "печатать", "набор",
      "キーボード", "kiiboodo", "タイピング", "taipingu",
      "键盘", "jianpan", "打字", "dazi"],
    en: ["keyboard", "typing", "type", "keystroke", "click", "office", "computer"],
  },
  // ── CAMERA / SHUTTER ──
  {
    langs: ["camara", "foto", "camera", "shutter", "photo", "snapshot",
      "appareil photo", "obturateur", "photo",
      "kamera", "foto", "auslöser",
      "камера", "фото", "затвор",
      "カメラ", "kamera", "シャッター", "shattaa",
      "相机", "xiangji", "拍照", "paizhao", "快门", "kuaimen"],
    en: ["camera", "shutter", "photo", "snapshot", "click", "flash"],
  },
  // ── PHONE / CALL ──
  {
    langs: ["telefono", "llamar", "phone", "call", "ring", "mobile",
      "téléphone", "appeler", "sonner", "portable",
      "telefon", "anruf", "klingeln", "handy",
      "телефон", "звонок", "звонить",
      "電話", "denwa", "着信", "chakushin",
      "电话", "dianhua", "来电", "laidian", "铃声", "lingsheng"],
    en: ["phone", "call", "ring", "mobile", "ringtone", "notification"],
  },
  // ── DOG / BARK ──
  {
    langs: ["perro", "ladrido", "dog", "bark", "woof", "growl", "puppy",
      "chien", "aboyer", "ouaf", "chiot",
      "hund", "bellen", "wuff", "welpe",
      "собака", "лаять", "гав", "щенок",
      "犬", "inu", "ワンワン", "wanwan", "吠える", "hoeru",
      "狗", "gou", "汪汪", "wangwang", "叫", "jiao",
      "pet_bark", "mascota_ladrar"],
    en: ["dog", "bark", "woof", "growl", "puppy", "animal", "pet", "pet_bark"],
  },
  // ── CAT / MEOW ──
  {
    langs: ["gato", "miau", "cat", "meow", "purr", "kitten", "hiss",
      "chat", "miauler", "ronronner", "chaton",
      "katze", "miauen", "schnurren", "kätzchen",
      "кошка", "мяу", "кот", "мурлыкать",
      "猫", "neko", "ニャー", "nyaa", "ゴロゴロ", "gorogoro",
      "猫", "mao", "喵", "miao", "咪咪", "mimi",
      "pet_meow", "mascota_maullar"],
    en: ["cat", "meow", "purr", "kitten", "hiss", "animal", "pet", "feline", "pet_meow"],
  },
  // ── BIRD ──
  {
    langs: ["pajaro", "ave", "bird", "chirp", "tweet", "wing", "flap",
      "oiseau", "gazouiller", "aile", "voler",
      "vogel", "zwitschern", "flügel",
      "птица", "чирикать", "крыло",
      "鳥", "tori", "さえずり", "saezuri", "羽", "hane",
      "鸟", "niao", "鸣叫", "mingjiao", "翅膀", "chibang",
      "bird_call", "ave_canto"],
    en: ["bird", "chirp", "tweet", "wing", "flap", "song", "fly", "ambient", "bird_call"],
  },
  // ── HORSE ──
  {
    langs: ["caballo", "horse", "neigh", "gallop", "hoof",
      "cheval", "hennir", "galop", "sabot",
      "pferd", "wiehern", "galopp", "huf",
      "лошадь", "ржать", "галоп", "копыто",
      "馬", "uma", "ヒヒーン", "hihiin", "駆ける", "kakeru",
      "马", "ma", "嘶鸣", "siming", "马蹄", "mati",
      "horse_step", "mount_jump", "mount_land",
      "caballo_paso", "montura_saltar", "montura_aterrizar"],
    en: ["horse", "neigh", "gallop", "hoof", "animal", "ride",
      "horse_step", "mount_jump", "mount_land"],
  },
  // ── SNAKE ──
  {
    langs: ["serpiente", "culebra", "snake", "hiss", "slither", "rattle",
      "serpent", "siffler", "ramper",
      "schlange", "zischen", "kriechen",
      "змея", "шипеть", "ползти",
      "蛇", "hebi", "ヘビ", "hebi", "シュー", "shuu",
      "蛇", "she", "嘶嘶", "sisi", "爬行", "paxing"],
    en: ["snake", "hiss", "slither", "rattle", "reptile", "animal"],
  },
  // ── LION / ROAR ──
  {
    langs: ["leon", "león", "lion", "roar", "growl", "pride",
      "lion_fr", "rugir", "félin",
      "löwe", "brüllen", "gebrüll",
      "лев", "рычать", "рык",
      "ライオン", "raion", "吠える", "hoeru", "雄叫び", "otakebi",
      "狮子", "shizi", "吼叫", "houjiao", "狮", "shi",
      "animal_growl", "animal_gruñir"],
    en: ["lion", "roar", "growl", "pride", "animal", "wild", "savage", "animal_growl"],
  },
  // ── FLY / BUZZ ──
  {
    langs: ["mosca", "volar", "fly", "buzz", "insect", "wing",
      "mouche", "voler", "bourdonner", "insecte",
      "fliege", "summen", "insekt", "flügel",
      "муха", "жужжать", "насекомое",
      "ハエ", "hae", "ブンブン", "bunbun", "虫", "mushi",
      "苍蝇", "cangying", "嗡嗡", "wengweng", "虫", "chong",
      "insect_buzz", "insecto_zumbido"],
    en: ["fly", "buzz", "insect", "wing", "pest", "bug", "insect_buzz"],
  },
  // ── EAT / BITE ──
  {
    langs: ["comer", "morder", "eat", "bite", "chew", "munch", "chomp",
      "manger", "mordre", "mâcher", "croquer",
      "essen", "beißen", "kauen", "mampfen",
      "есть", "кусать", "жевать", "хрустеть",
      "食べる", "taberu", "噛む", "kamu", "ムシャムシャ", "mushamusha",
      "吃", "chi", "咬", "yao", "嚼", "jiao"],
    en: ["eat", "bite", "chew", "munch", "chomp", "food", "crunch"],
  },
  // ── DRINK ──
  {
    langs: ["beber", "tomar", "drink", "sip", "gulp", "slurp",
      "boire", "siroter", "avaler", "lamper",
      "trinken", "nippeln", "schlucken",
      "пить", "глоток", "хлебать",
      "飲む", "nomu", "ゴクゴク", "gokugoku", "飲料", "inryou",
      "喝", "he", "饮", "yin", "喝水", "heshui"],
    en: ["drink", "sip", "gulp", "slurp", "liquid", "water"],
  },
  // ── CHEST / TREASURE ──
  {
    langs: ["cofre", "tesoro", "chest", "treasure", "gold", "open", "loot",
      "coffre", "trésor", "or", "butin",
      "truhe", "schatz", "gold", "beute",
      "сундук", "сокровище", "золото",
      "宝箱", "takarabako", "トレジャー", "torejaa",
      "宝箱", "baoxiang", "财宝", "caibao", "箱子", "xiangzi"],
    en: ["chest", "treasure", "gold", "open", "loot", "reward", "prize"],
  },
  // ── KEY ──
  {
    langs: ["llave", "clave", "key", "unlock", "jingle", "item",
      "clé", "ouvrir", "objet",
      "schlüssel", "aufmachen", "gegenstand",
      "ключ", "отпирать", "предмет",
      "鍵", "kagi", "キーアイテム", "kii aitemu",
      "钥匙", "yaoshi", "解锁", "jiesuo", "物品", "wupin"],
    en: ["key", "unlock", "jingle", "item", "open", "door"],
  },
  // ── SCROLL / PAPER ──
  {
    langs: ["pergamino", "papel", "scroll", "paper", "document", "map",
      "parchemin", "papier", "document", "carte",
      "pergament", "papier", "dokument", "karte",
      "свиток", "бумага", "документ", "карта",
      "巻物", "makimono", "紙", "kami", "スクロール", "sukurooru",
      "卷轴", "juanzhou", "纸", "zhi", "文件", "wenjian"],
    en: ["scroll", "paper", "document", "map", "open", "read"],
  },
  // ── FLAG / CHECKPOINT ──
  {
    langs: ["bandera", "flag", "checkpoint", "marker", "goal", "finish",
      "drapeau", "point de contrôle", "arrivée",
      "flagge", "kontrollpunkt", "ziel",
      "флаг", "контрольная точка", "финиш",
      "旗", "hata", "チェックポイント", "chekkupointo",
      "旗帜", "qizhi", "检查点", "jianchadian", "终点", "zhongdian"],
    en: ["flag", "checkpoint", "marker", "goal", "finish", "save", "progress"],
  },
  // ── SWIM ──
  {
    langs: ["nadar", "natacion", "swim", "swimming", "dive", "pool", "water",
      "nager", "plonger", "piscine",
      "schwimmen", "tauchen", "pool",
      "плавать", "нырять", "бассейн",
      "泳ぐ", "oyogu", "水泳", "suiei", "プール", "puuru",
      "游泳", "youyong", "潜水", "qianshui", "泳池", "yongchi"],
    en: ["swim", "swimming", "dive", "pool", "water", "splash", "underwater"],
  },
  // ── FLY (air) ──
  {
    langs: ["volar", "vuelo", "fly", "flight", "wing", "air", "hover",
      "voler_fr", "vol", "air", "planer",
      "fliegen", "flug", "luft", "schweben",
      "летать", "полет", "воздух", "парить",
      "飛ぶ", "tobu", "飛行", "hikou", "フライト", "furaito",
      "飞", "fei", "飞行", "feixing", "翱翔", "aoxiang",
      "creature_wing_flap", "criatura_alas_batir"],
    en: ["fly", "flight", "wing", "air", "hover", "whoosh", "soar", "creature_wing_flap"],
  },
  // ── PUSH ──
  {
    langs: ["empujar", "push", "shove", "slide", "nudge", "move",
      "pousser", "glisser", "déplacer",
      "schieben", "drücken", "stoßen",
      "толкать", "двигать", "пихать",
      "押す", "osu", "プッシュ", "pusshu", "動かす", "ugokasu",
      "推", "tui", "移动", "yidong", "推开", "tuikai"],
    en: ["push", "shove", "slide", "nudge", "move", "block", "heavy"],
  },
  // ── PULL ──
  {
    langs: ["tirar", "jalar", "pull", "drag", "yank", "stretch",
      "tirer", "trainer", "étirer",
      "ziehen", "zerren", "dehnen",
      "тянуть", "тащить", "растягивать",
      "引く", "hiku", "プル", "puru", "引っ張る", "hipparu",
      "拉", "la", "拖", "tuo", "拽", "zhuai"],
    en: ["pull", "drag", "yank", "stretch", "tug", "rope"],
  },
  // ── CUT / SLICE ──
  {
    langs: ["cortar", "corte", "cut", "slice", "snip", "chop", "trim",
      "couper", "trancher", "découper",
      "schneiden", "hacken", "kürzen",
      "резать", "рубить", "стричь",
      "切る", "kiru", "カット", "katto", "スライス", "suraisu",
      "切", "qie", "割", "ge", "剪", "jian"],
    en: ["cut", "slice", "snip", "chop", "trim", "scissors"],
  },
  // ── SCRATCH ──
  {
    langs: ["raspar", "rascar", "scratch", "scrape", "grind", "tear",
      "gratter", "racler", "écorcher",
      "kratzen", "schaben", "reißen",
      "скрести", "царапать", "тереть",
      "引っかく", "hikkaku", "スクラッチ", "sukuratchi",
      "刮", "gua", "抓", "zhua", "划", "hua"],
    en: ["scratch", "scrape", "grind", "tear", "rip", "rough"],
  },
  // ── SAW / CUT TOOL ──
  {
    langs: ["sierra", "serrucho", "saw", "cut", "tool", "wood",
      "scie", "couper", "outil", "bois",
      "säge", "schneiden", "werkzeug", "holz",
      "пила", "резать", "инструмент",
      "のこぎり", "nokogiri", "切る", "kiru", "ツール", "tsuuru",
      "锯", "ju", "切割", "qiege", "工具", "gongju"],
    en: ["saw", "cut", "tool", "wood", "buzz", "build", "carpentry"],
  },
  // ── HAMMER ──
  {
    langs: ["martillo", "hammer", "nail", "hit", "tool", "build",
      "marteau", "clou", "frapper", "outil",
      "hammer", "nagel", "schlagen", "werkzeug",
      "молоток", "гвоздь", "бить", "инструмент",
      "ハンマー", "hanmaa", "釘", "kugi", "道具", "dougu",
      "锤子", "chuizi", "钉子", "dingzi", "敲", "qiao"],
    en: ["hammer", "nail", "hit", "tool", "build", "impact", "carpentry"],
  },
  // ── SAVE ──
  {
    langs: ["guardar", "salvar", "save", "savepoint", "store", "write",
      "sauvegarder", "enregistrer", "stocker",
      "speichern", "sichern", "aufbewahren",
      "сохранить", "запись", "сейв",
      "セーブ", "seebu", "保存", "hozon", "記録", "kiroku",
      "保存", "baocun", "储存", "chucun", "存档", "cundang",
      "save_game", "load_game", "pause", "unpause", "check",
      "guardar_partida", "cargar_partida", "pausa", "reanudar", "marca"],
    en: ["save", "savepoint", "store", "write", "checkpoint", "progress",
      "save_game", "load_game", "pause", "unpause", "check"],
  },
  // ── LOAD ──
  {
    langs: ["cargar", "load", "loading", "progress", "fetch", "retrieve",
      "charger", "télécharger", "progression",
      "laden", "fortschritt", "abrufen",
      "загрузить", "загрузка", "прогресс",
      "ロード", "roodo", "読み込み", "yomikomi", "進行", "shinkou",
      "加载", "jiazai", "读取", "duqu", "载入", "zairu"],
    en: ["load", "loading", "progress", "fetch", "retrieve", "spin", "wait"],
  },
  // ── DELETE / ERASE ──
  {
    langs: ["borrar", "eliminar", "delete", "erase", "remove", "clear", "trash",
      "supprimer", "effacer", "enlever", "poubelle",
      "löschen", "entfernen", "müll",
      "удалить", "стереть", "мусор",
      "削除", "sakujo", "消す", "kesu", "ゴミ箱", "gomibako",
      "删除", "shanchu", "清除", "qingchu", "删除", "shanchu"],
    en: ["delete", "erase", "remove", "clear", "trash", "discard"],
  },
  // ── BUY / PURCHASE ──
  {
    langs: ["comprar", "compra", "buy", "purchase", "shop", "cash",
      "acheter", "achat", "magasin", "argent",
      "kaufen", "einkauf", "laden", "geld",
      "купить", "покупка", "магазин",
      "買う", "kau", "購入", "kounyuu", "ショップ", "shoppu",
      "买", "mai", "购买", "goumai", "商店", "shangdian"],
    en: ["buy", "purchase", "shop", "cash", "coin", "transaction", "sell"],
  },
  // ── DOUBLE JUMP ──
  {
    langs: ["doble salto", "doublejump", "double jump", "air jump", "second jump",
      "double saut", "saut double",
      "doppelsprung",
      "двойной прыжок",
      "二段ジャンプ", "nidan janpu", "ダブルジャンプ", "daburu janpu",
      "二段跳", "erduantiao", "双跳", "shuangtiao"],
    en: ["doublejump", "double jump", "air jump", "second jump", "extra jump"],
  },
  // ── WALL JUMP ──
  {
    langs: ["salto de pared", "walljump", "wall jump", "wall kick",
      "saut mural",
      "wandsprung",
      "прыжок от стены",
      "壁ジャンプ", "kabe janpu"],
    en: ["walljump", "wall jump", "wall kick", "climb"],
  },
  // ── INVISIBLE / CLOAK ──
  {
    langs: ["invisible", "sigilo", "invisible", "stealth", "cloak", "hide", "vanish",
      "invisible_fr", "furtif", "camouflage",
      "unsichtbar", "tarnung", "verstecken",
      "невидимость", "скрытность",
      "透明", "toumei", "ステルス", "suterusu",
      "隐身", "yinshen", "隐形", "yinxing"],
    en: ["invisible", "stealth", "cloak", "hide", "vanish", "transparent"],
  },
  // ── RESPAWN ──
  {
    langs: ["respawn", "reaparecer", "revivir", "reappear", "revive", "comeback",
      "réapparaître", "revivre",
      "wiedererscheinen", "wiederbeleben",
      "возрождение", "перерождение",
      "リスポーン", "risupoon", "復活", "fukkatsu",
      "重生", "chongsheng", "复活", "fuhuo"],
    en: ["respawn", "reappear", "revive", "comeback", "spawn"],
  },
  // ── THUNDER ──
  {
    langs: ["trueno", "thunder", "lightning", "storm", "rumble",
      "tonnerre", "foudre", "orage",
      "donner", "blitz", "sturm",
      "гром", "молния", "буря", "гроза",
      "雷", "kaminari", "サンダー", "sandaa", "雷鳴", "raimei",
      "雷", "lei", "打雷", "dalei", "雷声", "leisheng"],
    en: ["thunder", "lightning", "storm", "rumble", "loud", "sky"],
  },
  // ── EARTHQUAKE / RUMBLE ──
  {
    langs: ["terremoto", "temblor", "earthquake", "quake", "rumble", "shake", "tremor",
      "tremblement de terre", "secousse",
      "erdbeben", "beben", "rütteln",
      "землетрясение", "дрожь", "грохот",
      "地震", "jishin", "揺れ", "yure",
      "地震", "dizhen", "震动", "zhendong",
      "cave_rumble", "cueva_retumbar"],
    en: ["earthquake", "quake", "rumble", "shake", "tremor", "heavy", "deep", "cave_rumble"],
  },
  // ── COMPUTER / TECH ──
  {
    langs: ["computadora", "ordenador", "computer", "tech", "pc", "electronic",
      "ordinateur", "technologie",
      "computer_de", "technik",
      "компьютер", "техника",
      "コンピューター", "konpyuutaa", "テック", "tekku",
      "电脑", "diannao", "计算机", "jisuanji",
      "computer_beep", "terminal_open", "terminal_type",
      "computadora_pitido", "terminal_abrir", "terminal_teclear"],
    en: ["computer", "tech", "electronic", "beep", "boot", "startup",
      "computer_beep", "terminal_open", "terminal_type"],
  },
  // ── GLITCH ──
  {
    langs: ["glitch", "error", "static", "digital", "malfunction", "bug",
      "glitch_fr", "bug", "numérique",
      "glitch_de", "fehler", "digital",
      "глитч", "ошибка", "цифровой",
      "グリッチ", "guricchi", "バグ", "bagu",
      "故障", "guzhang", "错误", "cuowu", "数字", "shuzi"],
    en: ["glitch", "error", "static", "digital", "malfunction", "bug", "noise"],
  },
  // ── SCAN ──
  {
    langs: ["escanear", "scan", "detect", "analyze", "sensor", "radar",
      "scanner", "détecter", "analyser",
      "scannen", "erkennen", "analysieren",
      "сканировать", "анализ", "сенсор",
      "スキャン", "sukyan", "検出", "kenshutsu",
      "扫描", "saomiao", "检测", "jiance"],
    en: ["scan", "detect", "analyze", "sensor", "radar", "beep", "ping"],
  },
  // ── SMOKE / HAZE ──
  {
    langs: ["humo", "smoke", "fog", "haze", "mist", "steam",
      "fumée", "brouillard", "brume", "vapeur",
      "rauch", "nebel", "dunst", "dampf",
      "дым", "туман", "пар", "мгла",
      "煙", "kemuri", "スモーク", "sumooku", "霧", "kiri",
      "烟", "yan", "雾", "wu", "蒸汽", "zhengqi",
      "smoke_puff", "steam_burst", "dust_cloud",
      "humo_bocanada", "vapor_rafaga", "polvo_nube"],
    en: ["smoke", "fog", "haze", "mist", "steam", "cloud", "ambient",
      "smoke_puff", "steam_burst", "dust_cloud"],
  },
  // ── SWOOSH / WHOOSH ──
  {
    langs: ["swoosh", "whoosh", "swish", "sweep", "rush", "wind",
      "froufrou", "sifflement",
      "rauschen", "sausen",
      "свист", "шорох", "пронестись",
      "シューッ", "shuu", "ビューン", "byuun",
      "嗖", "sou", "呼", "hu"],
    en: ["swoosh", "whoosh", "swish", "sweep", "rush", "wind", "fast", "air"],
  },

  // ════════════════════════════════════════
  // NEW CONCEPT GROUPS
  // ════════════════════════════════════════

  // ── RELOAD (new) ──
  {
    langs: ["reload", "recargar", "recarga", "reload_empty", "reload_fast", "ammo", "ammo_pickup", "ammo_empty", "municion", "dry_fire"],
    en: ["reload", "reload_empty", "reload_fast", "ammo", "dry_fire", "ammo_pickup", "weapon"],
  },

  // ── WEAPON_EQUIP (new) ──
  {
    langs: ["weapon_cock", "weapon_jam", "weapon_switch", "weapon_pickup", "weapon_drop", "equip", "unequip", "equip_item", "unequip_item", "armar", "desarmar", "equipar"],
    en: ["weapon_cock", "weapon_jam", "weapon_switch", "weapon_pickup", "weapon_drop", "equip", "unequip", "equip_item"],
  },

  // ── GRENADE (new) ──
  {
    langs: ["grenade", "granada", "grenade_throw", "grenade_bounce", "grenade_explode"],
    en: ["grenade", "grenade_throw", "grenade_bounce", "grenade_explode", "explosion"],
  },

  // ── CHARGE (new) ──
  {
    langs: ["charge_weapon", "charged_shot", "overheat", "cooldown", "charge", "cargar", "carga", "sobrecalentar"],
    en: ["charge_weapon", "charged_shot", "overheat", "cooldown", "charge", "energy"],
  },

  // ── DODGE_MOVE (new) ──
  {
    langs: ["dodge", "roll", "slide", "climb", "crouch", "dash", "esquivar", "rodar", "deslizar", "escalar", "agacharse"],
    en: ["dodge", "roll", "slide", "climb", "crouch", "dash", "evade", "wall_slide", "wall_jump"],
  },

  // ── PLAYER (new) ──
  {
    langs: ["player_hurt", "player_pain", "player_heal", "player_burn", "player_freeze", "player_poisoned", "player_stunned", "player_scream", "player_drown", "player_exhausted", "player_breathe", "jugador_herido", "jugador_curado"],
    en: ["player_hurt", "player_pain", "player_heal", "player_burn", "player_freeze", "player_poisoned", "player_stunned", "player_scream", "player_drown", "player_exhausted", "player_breathe", "player_death", "player_respawn", "player_revive"],
  },

  // ── BOSS (new) ──
  {
    langs: ["boss", "jefe", "boss_intro", "boss_roar", "boss_attack", "boss_hurt", "boss_death", "jefe_final"],
    en: ["boss", "boss_intro", "boss_roar", "boss_attack", "boss_hurt", "boss_death", "monster", "enemy"],
  },

  // ── NPC (new) ──
  {
    langs: ["npc", "npc_talk", "npc_greeting", "npc_goodbye", "npc_laugh", "npc_cry", "villager_murmur", "shopkeeper_talk", "dialogue", "dialogo", "conversacion"],
    en: ["npc_talk", "npc_greeting", "npc_goodbye", "npc_laugh", "npc_cry", "villager_murmur", "shopkeeper_talk", "dialogue", "dialogue_next", "dialogue_choice"],
  },

  // ── GUARD (new) ──
  {
    langs: ["guard_alert", "guard_whistle", "guard_attack", "guardia", "alerta_guardia", "silbato"],
    en: ["guard_alert", "guard_whistle", "guard_attack", "alert", "whistle"],
  },

  // ── COMPANION (new) ──
  {
    langs: ["companion", "companion_call", "companion_hurt", "companero", "aliado", "mascota"],
    en: ["companion_call", "companion_hurt", "pet", "ally"],
  },

  // ── ABILITIES (new) ──
  {
    langs: ["ability", "habilidad", "ability_ready", "ability_cast", "ability_fail", "skill_unlock", "buff_apply", "buff_loop", "buff_end", "debuff_apply", "debuff_loop", "debuff_end", "stun_apply", "silence_apply", "shield_apply", "shield_break", "invincible_start", "invincible_loop", "invincible_end"],
    en: ["ability_ready", "ability_cast", "ability_fail", "buff", "debuff", "stun", "silence", "shield", "invincible", "skill"],
  },

  // ── INVENTORY (new) ──
  {
    langs: ["inventory", "inventario", "inventory_open", "inventory_close", "inventory_move", "inventory_select", "inventory_error", "equip_item", "unequip_item"],
    en: ["inventory_open", "inventory_close", "inventory_move", "inventory_select", "inventory_error", "equip_item", "unequip_item"],
  },

  // ── CRAFT (new) ──
  {
    langs: ["craft", "crafting", "fabricar", "crear", "craft_start", "craft_success", "craft_fail", "forge_hit", "repair", "upgrade", "reparar", "mejorar", "forjar"],
    en: ["craft_start", "craft_success", "craft_fail", "forge_hit", "repair", "upgrade", "craft"],
  },

  // ── QUEST (new) ──
  {
    langs: ["quest", "mision", "busqueda", "quest_accept", "quest_complete", "quest_fail", "objective_update", "objective_ping", "waypoint_set", "waypoint_reached", "checkpoint_pass", "marker", "map_marker"],
    en: ["quest_accept", "quest_complete", "quest_fail", "objective_update", "objective_ping", "waypoint_set", "waypoint_reached", "checkpoint"],
  },

  // ── SCORE (new) ──
  {
    langs: ["score", "puntos", "puntaje", "score_add", "score_combo", "high_score", "rank_up", "bonus_start", "bonus_end", "bono"],
    en: ["score_add", "score_combo", "high_score", "rank_up", "bonus", "points"],
  },

  // ── GAME_FLOW (new) ──
  {
    langs: ["match_start", "match_end", "round_start", "round_end", "wave_start", "wave_clear", "mission_start", "mission_complete", "mission_failed", "partida", "ronda", "oleada"],
    en: ["match_start", "match_end", "round_start", "round_end", "wave_start", "wave_clear", "mission_start", "mission_complete", "mission_failed", "game_start", "game_end"],
  },

  // ── RACE (new) ──
  {
    langs: ["race_start", "race_finish", "lap_complete", "position_up", "position_down", "carrera_inicio", "vuelta"],
    en: ["race_start", "race_finish", "lap_complete", "position_up", "position_down", "race", "speed"],
  },

  // ── HEALTH_STATES (new) ──
  {
    langs: ["health_low", "stamina_low", "mana_low", "oxygen_low", "vida_baja", "energia_baja", "salud"],
    en: ["health_low", "stamina_low", "mana_low", "oxygen_low", "low_health", "warning"],
  },

  // ── AMBIENT (new) ──
  {
    langs: ["ambient", "ambiente", "ambient_forest", "ambient_cave", "ambient_city", "ambient_space", "ambient_dungeon", "ambient_swamp", "ambient_desert", "ambient_ocean", "ambient_factory", "bosque_ambiente", "cueva_ambiente", "ciudad_ambiente"],
    en: ["ambient_forest", "ambient_cave", "ambient_city", "ambient_space", "ambient_dungeon", "ambient_swamp", "ambient_desert", "ambient_ocean", "ambient_factory", "ambient", "background"],
  },

  // ── MACHINES (new) ──
  {
    langs: ["machine_start", "machine_loop", "machine_stop", "generator_loop", "power_down", "elevator_start", "elevator_loop", "elevator_stop", "platform_move", "bridge_extend", "bridge_collapse", "maquina", "motor"],
    en: ["machine_start", "machine_loop", "machine_stop", "generator_loop", "power_down", "elevator", "platform_move", "bridge_extend", "bridge_collapse", "machine", "engine"],
  },

  // ── TRAPS (new) ──
  {
    langs: ["trap", "trampa", "trap_trigger", "trap_reset", "trap_disarm", "spikes_out", "spikes_in", "saw_loop", "arrow_trap", "boulder_roll", "pressure_plate"],
    en: ["trap_trigger", "trap_reset", "trap_disarm", "spikes_out", "spikes_in", "saw_loop", "arrow_trap", "boulder_roll", "pressure_plate", "trap"],
  },

  // ── CHEST_ITEM (new) ──
  {
    langs: ["chest_open", "chest_close", "chest_locked", "crate_break", "barrel_break", "pottery_break", "cofre_abrir", "cofre_cerrar", "caja_romper"],
    en: ["chest_open", "chest_close", "chest_locked", "crate_break", "barrel_break", "pottery_break", "chest", "treasure", "loot"],
  },

  // ── SCI_FI (new) ──
  {
    langs: ["sci_fi", "scifi", "science_fiction", "sci_fi_door", "sci_fi_button", "hologram_on", "hologram_loop", "hologram_off", "computer_beep", "terminal_open", "terminal_type", "radar_ping", "scanner_sweep", "drone_fly"],
    en: ["sci_fi_door", "sci_fi_button", "hologram_on", "hologram_loop", "hologram_off", "computer_beep", "terminal_open", "terminal_type", "radar_ping", "scanner_sweep", "drone_fly", "scifi", "futuristic"],
  },

  // ── LASER_LOOP (new) ──
  {
    langs: ["laser_loop", "beam_charge", "beam_fire", "beam_stop"],
    en: ["laser_loop", "beam_charge", "beam_fire", "beam_stop", "laser", "beam", "zap"],
  },

  // ── STEALTH_DETECT (new) ──
  {
    langs: ["stealth", "sigilo", "stealth_alert", "detection_meter", "lock_on", "target_acquired", "target_lost", "detectado", "alerta_sigilo"],
    en: ["stealth_alert", "detection_meter", "lock_on", "target_acquired", "target_lost", "stealth", "detect", "alert"],
  },

  // ── HACKING (new) ──
  {
    langs: ["hacking", "hackeo", "hacking_start", "hacking_loop", "hacking_success", "hacking_fail", "puzzle_piece", "puzzle_solve", "puzzle_fail", "secret_found", "hidden_area", "collectible_found", "collectible_complete", "rompecabezas", "secreto"],
    en: ["hacking_start", "hacking_loop", "hacking_success", "hacking_fail", "puzzle_solve", "puzzle_fail", "secret_found", "hidden_area", "secret"],
  },

  // ── CINEMATIC (new) ──
  {
    langs: ["cinematic", "cinematic_whoosh", "logo_sting", "intro", "cinematografia", "transicion"],
    en: ["cinematic_whoosh", "logo_sting", "intro", "swoosh", "whoosh", "transition"],
  },

  // ── PURCHASE_SELL (new) ──
  {
    langs: ["purchase", "sell", "cash_register", "comprar", "vender", "caja_registradora", "tienda", "shop"],
    en: ["purchase", "sell", "cash_register", "buy", "shop", "transaction", "coin"],
  },

  // ── ALIEN (new) ──
  {
    langs: ["alien", "extraterrestre", "alien_voice", "alien_attack", "ovni", "ufo"],
    en: ["alien_voice", "alien_attack", "alien", "scifi", "extraterrestrial"],
  },

  // ── CREATURE (new) ──
  {
    langs: ["creature_chirp", "creature_bite", "creature_wing_flap", "criatura", "bicho", "monstruo"],
    en: ["creature_chirp", "creature_bite", "creature_wing_flap", "creature", "monster", "animal"],
  },

  // ── FISH (new) ──
  {
    langs: ["fish_splash", "pez", "pescado", "peces", "animal_agua"],
    en: ["fish_splash", "water_splash", "fish", "underwater"],
  },

  // ── SAND_WEATHER (new) ──
  {
    langs: ["sandstorm", "dust_cloud", "mud_squelch", "arena", "polvo", "barro"],
    en: ["sandstorm", "dust_cloud", "mud_squelch", "desert", "weather"],
  },

  // ── CAMERA_TOOLS (new) ──
  {
    langs: ["camera_shutter", "camera_zoom", "binocular_focus", "camara", "zoom", "foto"],
    en: ["camera_shutter", "camera_zoom", "binocular_focus", "camera", "zoom", "click"],
  },

  // ── PING (new) ──
  {
    langs: ["ping", "sonar", "radar_ping", "beep", "señal"],
    en: ["ping", "radar_ping", "sonar", "beep", "notification"],
  },

  // ── RESPAWN_COUNT (new) ──
  {
    langs: ["respawn_countdown", "respawn_ready", "cuenta_regresiva_respawn", "reaparecer", "revivir_cuenta"],
    en: ["respawn_countdown", "respawn_ready", "respawn", "countdown"],
  },

  // ── MAP (new) ──
  {
    langs: ["map", "mapa", "map_marker", "minimap_alert", "map_pickup", "map_open", "map_close", "minimapa"],
    en: ["map_marker", "minimap_alert", "map_pickup", "map_open", "map_close", "map", "minimap"],
  },

  // ── BOOK_SCROLL (new) ──
  {
    langs: ["book_open", "book_close", "scroll_open", "scroll_close", "libro_abrir", "pergamino_abrir"],
    en: ["book_open", "book_close", "scroll_open", "scroll_close", "book", "scroll", "paper", "page"],
  },
];

// ─── BUILD FLAT INDEX ───

function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s\-_]+/g, "")
    .replace(/[^a-zа-яё0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff\u3400-\u4dbf]/g, "");
}

// Build the flat lookup map: normalized_term → English search queries
const flatMap: SynMap = {};

for (const group of CONCEPTS) {
  for (const langTerm of group.langs) {
    const key = normalize(langTerm);
    if (key.length > 0) {
      // Merge with existing (some terms appear in multiple groups)
      const existing = flatMap[key] || [];
      const combined = [...existing, ...group.en];
      const deduped: string[] = [];
      const seen = new Set<string>();
      for (const item of combined) {
        if (!seen.has(item)) {
          seen.add(item);
          deduped.push(item);
        }
      }
      flatMap[key] = deduped;
    }
  }
}

export function generateVariants(term: string): string[] {
  const normalized = normalize(term);
  const variants = new Set<string>();

  // Always include original term
  variants.add(term.trim());

  // Direct lookup
  const found = flatMap[normalized];
  if (found) {
    for (const v of found) {
      variants.add(v);
    }
  }

  // Split into words and look up each one
  const words = normalized.split(/\s+/).filter(Boolean);
  for (const word of words) {
    if (word.length >= 2) {
      // Direct word lookup
      if (flatMap[word]) {
        for (const v of flatMap[word]) {
          variants.add(v);
        }
      }
      // Substring matching: check if any key contains the word or vice versa
      for (const key of Object.keys(flatMap)) {
        if (key.length >= 3 && (key.includes(word) || word.includes(key))) {
          for (const v of flatMap[key]) {
            variants.add(v);
          }
        }
      }
    }
  }

  // If still only original term, add fallbacks
  if (variants.size <= 1) {
    variants.add(`${term.trim()} sound`);
    variants.add(`${term.trim()} sfx`);
    variants.add(`${term.trim()} effect`);
    variants.add(`${term.trim()} audio`);
  }

  return Array.from(variants);
}

export function getTotalConceptCount(): number {
  return CONCEPTS.length;
}

export function getTotalLanguageTermCount(): number {
  return Object.keys(flatMap).length;
}
