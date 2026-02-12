const _setItem = localStorage.setItem.bind(localStorage);
localStorage.setItem = (k, v) => {
    if (k === "selectedMonster") console.trace("setItem selectedMonster =", v);
    return _setItem(k, v);
};


function saveCharacter(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadCharacter(key) {
    const brute = localStorage.getItem(key);
    if (!brute) return null;

    try {
        return JSON.parse(brute);
    } catch {
        return null;
    }
}

function addedSaveSelection(key, imgSelector, nameSelector) {
    const data = loadCharacter(key);
    if (!data) return;

    const imgCFR = document.querySelector(imgSelector);
    const nameCFR = document.querySelector(nameSelector);

    if (imgCFR && data.img) imgCFR.src = data.img;
    if (nameCFR && data.name) nameCFR.textContent = data.name;
}

addedSaveSelection("selectedClass", ".img-selected-class", ".name-character-class");
addedSaveSelection("selectedMonster", ".img-selected-monster", ".name-character-monster");
addedSaveSelection("selectedClass", ".img-class-combat", ".name-class-bar-life");
addedSaveSelection("selectedMonster", ".img-monster-combat", ".name-monster-bar-life");

// motor para alterações de nome no topo e seleção de imagem dos personagens na tela index (index.html) e tela 2 (selecao-monstro.html).

function engineSelector(config) {
    const {
        cardSelector,
        nameSelectorCard,
        imgSelectorCard,
        selectedImgSelector,
        selectedNameSelector,
        buttonSelector,
        buttonSelectedSrc,
        buttonSrc,
        storageKey = null
    } = config;

    const buttons = document.querySelectorAll(buttonSelector);
    const imgSelected = document.querySelector(selectedImgSelector);
    const nameSelected = document.querySelector(selectedNameSelector);

    if (!buttons.length) return;

    function shiftName(name) {
        if (!nameSelected) return;
        nameSelected.classList.add("fade-out");

        setTimeout(() => {
            nameSelected.textContent = name
            nameSelected.classList.remove("fade-out");
            nameSelected.classList.add("fade-in");

            setTimeout(() => nameSelected.classList.remove("fade-in"), 200);
        }, 200)
    }

    function shiftImg(src) {
        if (!imgSelected) return;
        imgSelected.classList.add("fade-out");

        setTimeout(() => {
            imgSelected.src = src
            imgSelected.classList.remove("fade-out");
            imgSelected.classList.add("fade-in");

            setTimeout(() => imgSelected.classList.remove("fade-in"), 200);
        }, 200)
    }

    function resetButtons() {
        if (!buttonSrc) return;

        buttons.forEach(btn => {
            btn.src = buttonSrc;
        })
    }

    function targetButton(btn) {
        if (!buttonSelectedSrc) return;
        btn.src = buttonSelectedSrc;
    }

    function savedBtnPage() {
        if (!storageKey) return;

        const saved = loadCharacter(storageKey);
        if (!saved?.id) return;

        const savedCard = document.querySelector(`${cardSelector}[data-id="${saved.id}"]`);
        if (!savedCard) return;

        const savedBtn = savedCard.querySelector(buttonSelector);
        if (!savedBtn) return;

        resetButtons()
        targetButton(savedBtn);
    }

    buttons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const card = btn.closest(cardSelector);
            if (!card) return;

            const id = card.dataset.id;
            const nameCFR = card.querySelector(nameSelectorCard);
            const imgCFR = card.querySelector(imgSelectorCard);
            if (!nameCFR || !imgCFR) return;

            const name = nameCFR.textContent.trim();
            const img = imgCFR.getAttribute("src");

            shiftName(name);
            shiftImg(img);

            resetButtons()
            targetButton(btn);

            if (storageKey) {
                localStorage.setItem(storageKey, JSON.stringify({ id, name, img }));
            }
        });
    });

    savedBtnPage();
}

function equipSelectPersonFromInspectView() {
    const { personType: type, personId: id } = document.body.dataset;
    if (!type || !id) return false;

    const btn = document.querySelector(".btn-equipar");
    if (!btn) return false;

    const titlePerson = type === "class" ? "#title-data-class" : "#title-data-monster";
    const name = document.querySelector(titlePerson)?.textContent?.trim() || id;
    const img = document.querySelector(".img-class-data")?.getAttribute("src") || "";

    const storageKey = type === "class" ? "selectedClass" : "selectedMonster";

    const staticSrc = type === "class" ? "/assets/botão-equipar.png" : "/assets/botão-selecionar.png";
    const selectSrc = type === "class" ? "/assets/botão-equipado.png" : "/assets/botão-selecionado.png";

    const saved = loadCharacter(storageKey);
    if (saved?.id === id) btn.src = selectSrc;
    else btn.src = staticSrc;

    btn.addEventListener("click", (e) => {
        e.preventDefault();

        localStorage.setItem(storageKey, JSON.stringify({ id, name, img }));

        btn.src = selectSrc;

        if (type === "class") location.href = "/index.html";
        if (type === "monster") location.href = "/selecao-monstro.html";
    });

    return true;
}

// toast com log ao vivo de cada ação do personagem e do monstro

function showLogToast(state, who, text) {
    const entry = { who, text, t: Date.now() };
    state.log.push(entry);

    const toastLog = document.querySelector(who === "player" ? "#toast-response-class" : "#toast-response-monster");
    const textLog = document.querySelector(who === "player" ? ".response-class" : ".response-monster");
    if (!toastLog || !textLog) return;

    textLog.textContent = text;

    toastLog.classList.remove("show");
    void toastLog.offsetWidth;
    toastLog.classList.add("show");

    clearTimeout(toastLog._t);
    toastLog._t = setTimeout(() => toastLog.classList.remove("show"), 2000);
}

// lógica de combate

const combatState = {
    player: null,
    monster: null,
    turn: "player",
    lastRoll: null,
    isRolling: false,
    log: [],
    end: false
}

const catalogClass = {
    barbarian: {
        name: "Barbarian",
        hpMax: 90,
        acBase: 12,
        attackBonus: 14,

        weaponIndex: "handaxe",
        armorIndex: "leather-armor",
        spellIndex: null,
        spellDice: null
    },

    cleric: {
        name: "Cleric",
        hpMax: 105,
        acBase: 16,
        attackBonus: 11,

        weaponIndex: "warhammer",
        armorIndex: "scale-mail",
        spellIndex: "guiding-bolt",
        spellDice: "3d16"
    },

    paladin: {
        name: "Paladin",
        hpMax: 100,
        acBase: 16,
        attackBonus: 12,

        weaponIndex: "longsword",
        armorIndex: "chain-mail",
        spellIndex: "divine-favor",
        spellDice: "6d10"
    },

    rogue: {
        name: "Rogue",
        hpMax: 80,
        acBase: 12,
        attackBonus: 17,

        weaponIndex: "shortsword",
        armorIndex: "chain-mail",
        spellIndex: null,
        spellDice: null
    },

    sorcerer: {
        name: "Sorcerer",
        hpMax: 75,
        acBase: 12,
        attackBonus: 15,
        weaponIndex: "dagger",
        armorIndex: null,
        spellIndex: "fire-bolt",
        spellDice: "4d18"
    },

    wizard: {
        name: "Wizard",
        hpMax: 70,
        acBase: 12,
        attackBonus: 15,

        attackDice: "1d6",
        weaponIndex: "quarterstaff",
        armorIndex: null,
        spellIndex: "thunderwave",
        spellDice: "5d20"
    },
}

const monsterActions = {
    "aboleth": ["Tentacle", "Tail"],
    "ancient-red-dragon": ["Fire Breath", "Claw"],
    "balor": ["Longsword", "Whip"],
    "chimera": ["Bite", "Horns"],
    "oni": ["Claw (Oni Form Only)"]
}

const baseAPI = "https://www.dnd5eapi.co/api";

async function getApi(path) {
    const resp = await fetch(`${baseAPI}${path}`);
    if (!resp.ok) throw new Error(`API Error ${resp.status} em ${path}`);
    return resp.json();
}

const getEquipment = (index) => getApi(`/equipment/${index}`);
const getSpell = (index) => getApi(`/spells/${index}`);
const getMonster = (index) => getApi(`/monsters/${index}`);

function disableBtnRollDice(state) {
    const btnRoll = document.querySelector(".btn-roll-dice");
    if (!btnRoll) return;

    const lock = state.isRolling || state.lastRoll != null || state.turn !== "player";
    btnRoll.disabled = lock;
    btnRoll.style.pointerEvents = lock ? "none" : "auto";
    btnRoll.style.opacity = lock ? ".6" : "1";
}

function getMonsterAcAPI(monsterAPI) {
    const ac = monsterAPI.armor_class;

    if (typeof ac === "number") return ac;

    if (Array.isArray(ac) && ac.length && typeof ac[0]?.value === "number") {
        return ac[0].value
    }

    return 15;
}

async function creationTurnCombat() {
    const selectedClass = loadCharacter("selectedClass");
    const selectedMonster = loadCharacter("selectedMonster");
    if (!selectedClass?.id || !selectedMonster?.id) {
        console.warn("seleção incompleta", { selectedClass, selectedMonster });
        return null;
    };

    const baseClass = catalogClass[selectedClass.id];
    if (!baseClass) return null;

    const [weapon, armor, spell, monster] = await Promise.all([
        baseClass.weaponIndex ? getEquipment(baseClass.weaponIndex) : Promise.resolve(null),
        baseClass.armorIndex ? getEquipment(baseClass.armorIndex) : Promise.resolve(null),
        baseClass.spellIndex ? getSpell(baseClass.spellIndex) : Promise.resolve(null),
        getMonster(selectedMonster.id),
    ]);

    combatState.player = {
        base: {
            id: selectedClass.id,
            name: baseClass.name,
            hpMax: baseClass.hpMax,
            acBase: baseClass.acBase,
            attackBonus: baseClass.attackBonus,
            spellDice: baseClass.spellDice ?? null,
            attackDice: baseClass.attackDice ?? null
        },
        api: { weapon, armor, spell },
        currentHp: baseClass.hpMax
    };

    combatState.monster = {
        base: { id: selectedMonster.id, name: monster.name },
        api: { actions: monster.actions ?? [] },
        hpMax: monster.hit_points,
        currentHp: monster.hit_points,
        ac: getMonsterAcAPI(monster)
    };

    console.log(combatState.monster.api.actions.map(a => a.name));
    return combatState;
}

document.addEventListener("DOMContentLoaded", async () => {
    if (renderInspectViewPerson()) {
        equipSelectPersonFromInspectView();
        return;
    };

    // Ligação do motor para classes

    engineSelector({
        cardSelector: ".card-character",
        nameSelectorCard: ".name-class-card",
        imgSelectorCard: ".container-name-img img",
        selectedImgSelector: ".img-selected-class",
        selectedNameSelector: ".name-character-class",
        buttonSelector: ".btn-equipar",
        buttonSrc: "./assets/botão-equipar.png",
        buttonSelectedSrc: "./assets/botão-equipado.png",
        storageKey: "selectedClass"
    });

    // Ligação do motor para monstros

    engineSelector({
        cardSelector: ".card-character",
        nameSelectorCard: ".name-monster-card",
        imgSelectorCard: ".container-name-img img",
        selectedImgSelector: ".img-selected-monster",
        selectedNameSelector: ".name-character-monster",
        buttonSelector: ".btn-selecionar",
        buttonSrc: "./assets/botão-selecionar.png",
        buttonSelectedSrc: "./assets/botão-selecionado.png",
        storageKey: "selectedMonster"
    });

    document.querySelectorAll(".btn-play").forEach(btn => {
        btn.addEventListener("click", () => restartCombatEnd());
    });

    const state = await creationTurnCombat();
    if (!state) return;

    connectBtnAction(state);
    adaptRollBtn(state);
    playAgain();
    restartCombatWithExitButton();

    const ended = readCombatEnd();
    if (ended) {
        state.end = true;
        state.turn = "end";
        state.lastRoll = null;
        state.isRolling = false;

        if (typeof ended.playerHp === "number") state.player.currentHp = ended.playerHp;
        if (typeof ended.monsterHp === "number") state.monster.currentHp = ended.monsterHp;

        updateWrapperUI(state);
        disableBtnRollDice(state);

        if (ended.result === "victory") {
            const txt = document.querySelector("#text-banner-victory");
            if (txt) txt.textContent = `Você derrotou ${ended.monsterName} com sucesso!`;
            document.querySelector("#section-victory")?.classList.add("show");
        } else {
            document.querySelector("#section-derrota")?.classList.add("show");
        }

        document.querySelectorAll(".btn-journey-banner").forEach((btn) => {
            btn.addEventListener("click", () => openYourJourney(state));
        });

        return;
    };

    updateWrapperUI(state);
    disableBtnRollDice(state);

    document.querySelectorAll(".btn-journey-banner").forEach((btn) => {
        btn.addEventListener("click", () => openYourJourney(state));
    });
});

function updateHp(state) {
    const hpClass = document.querySelector(".number-hp-class");
    const hpMaxClass = document.querySelector(".number-hpMax-class");
    const hpMonster = document.querySelector(".number-hp-monster");
    const hpMaxMonster = document.querySelector(".number-hpMax-monster");

    if (hpClass) hpClass.textContent = state.player.currentHp.toFixed(0);
    if (hpMaxClass) hpMaxClass.textContent = state.player.base.hpMax;

    if (hpMonster) hpMonster.textContent = state.monster.currentHp.toFixed(0);
    if (hpMaxMonster) hpMaxMonster.textContent = state.monster.hpMax;
}

function updateBarLife(state) {
    const barLeft = document.querySelector(".bar-life-animated-left");
    const barRight = document.querySelector(".bar-life-animated-right");
    if (!barLeft || !barRight) return;

    const player = Math.max(0, Math.min(1, state.player.currentHp / state.player.base.hpMax));
    const monster = Math.max(0, Math.min(1, state.monster.currentHp / state.monster.hpMax));

    barLeft.style.transform = `scaleX(${player})`;
    barRight.style.transform = `scaleX(${monster})`;
}

function updateWrapperUI(state) {
    updateHp(state);
    updateBarLife(state);
}

function rollDice(strDice) {
    const [qtdStr, facesStr] = strDice.toLowerCase().split("d");
    const qtd = Number(qtdStr);
    const faces = Number(facesStr);

    let total = 0;

    for (let i = 0; i < qtd; i++) total += Math.floor(Math.random() * faces) + 1

    return total
}

function connectBtnAction(state) {
    const btnAttack = document.querySelector(".btn-attack");
    const btnHeal = document.querySelector(".btn-heal");
    const btnSpell = document.querySelector(".btn-spell");

    if (btnAttack) btnAttack.addEventListener("click", () => playerAction(state, "attack"));
    if (btnHeal) btnHeal.addEventListener("click", () => playerAction(state, "heal"));
    if (btnSpell) btnSpell.addEventListener("click", () => playerAction(state, "spell"));
}

function playerAction(state, type) {
    if (state.end) return;
    if (state.turn !== "player") return;

    let result = { done: false };

    if (type === "attack") result = playerAttack(state);
    if (type === "heal") result = playerHeal(state);
    if (type === "spell") result = playerSpell(state);

    if (!result.done) return;

    if (result.log) showLogToast(state, "player", result.log);

    updateWrapperUI(state);
    if (doneEndCombat(state)) return;

    state.turn = "monster";
    disableBtnRollDice(state);
    setTimeout(() => monsterTurn(state), 500);
}

function adaptRollBtn(state) {
    const btnRoll = document.querySelector(".btn-roll-dice");
    const numberRoll = document.querySelector("#number-dice");
    if (!btnRoll || !numberRoll) return;

    btnRoll.addEventListener("click", () => {
        if (state.end) return;
        if (state.isRolling) return;
        if (state.lastRoll != null) {
            alert("Você rolou o dado, faça uma ação para rolar novamente!");
            return;
        }

        state.isRolling = true;
        disableBtnRollDice(state);
        state.lastRoll = null;

        const numberRollingInterval = setInterval(() => {
            numberRoll.textContent = String(Math.floor(Math.random() * 20) + 1)
        }, 60);

        setTimeout(() => {
            clearInterval(numberRollingInterval);

            const rollingInWindow = Math.floor(Math.random() * 20) + 1;
            numberRoll.textContent = String(rollingInWindow);

            state.lastRoll = rollingInWindow;
            state.isRolling = false;
            disableBtnRollDice(state);
        }, 1200);
    });
}

function animationUiD20(numberDice, ms = 1200) {
    return new Promise((resolve) => {
        if (!numberDice) return resolve(null);

        const intervalNumberDice = setInterval(() => {
            numberDice.textContent = Math.floor(Math.random() * 20) + 1;
        }, 60);

        setTimeout(() => {
            clearInterval(intervalNumberDice);
            const final = Math.floor(Math.random() * 20) + 1;
            numberDice.textContent = String(final);
            resolve(final);
        }, ms);
    })
}

function consomeRoll(state) {
    if (state.isRolling) return null;

    if (state.lastRoll == null) {
        alert("Para definir uma ação, role o dado antes!");
        return null;
    };

    const value = state.lastRoll;
    state.lastRoll = null;

    disableBtnRollDice(state);
    return value;
}

function playerAttack(state) {
    const roll = consomeRoll(state);
    if (roll == null) return { done: false, dmg: 0 };

    const attackBonus = Number(state.player.base.attackBonus) || 0;
    const acMonster = Number(state.monster.ac) || 15;

    if (roll === 1) return { done: true, dmg: 0, log: `${state.player.base.name} errou o ataque.` };

    const weaponDice = state.player.base.attackDice;
    if (!weaponDice) return { done: true, dmg: 0 };

    if (roll === 20) {
        const dmg = rollDice(weaponDice) + rollDice(weaponDice);
        state.monster.currentHp = Math.max(0, state.monster.currentHp - dmg);
        return { done: true, dmg, log: `${state.player.base.name} atacou com ${state.player.api.weapon?.name ?? "arma"}.` };
    };

    const toHit = roll + attackBonus;
    if (toHit < acMonster) {
        return { done: true, dmg: 0, log: `${state.player.base.name} errou o ataque.` };
    };

    const dmg = rollDice(weaponDice);
    state.monster.currentHp = Math.max(0, state.monster.currentHp - dmg);
    return { done: true, dmg, log: `${state.player.base.name} atacou com ${state.player.api.weapon?.name ?? "arma"}.` };
}

function playerHeal(state) {
    const roll = consomeRoll(state);
    if (roll == null) return { done: false, heal: 0 };

    const heal = rollDice("2d16");
    state.player.currentHp = Math.min(state.player.base.hpMax, state.player.currentHp + heal);

    if (state.player.currentHp === state.player.base.hpMax) {
        return { done: true, heal, log: `${state.player.base.name} está com HP cheio.` };
    }

    return { done: true, heal, log: `${state.player.base.name} se curou (+${heal}).` };
}

function playerSpell(state) {
    const dice = state.player.base.spellDice;

    if (!dice) {
        alert("Esta classe não possui magia.");
        return { done: false, dmg: 0 };
    }

    const roll = consomeRoll(state);
    if (roll == null) return { done: false, dmg: 0 };

    const spellBonus = Number(state.player.base.attackBonus) || 0;
    const acMonster = Number(state.monster.ac) || 15;

    if (roll === 1) return { done: true, dmg: 0, log: `${state.player.base.name} errou o ataque.` };

    if (roll === 20) {
        const dmg = rollDice(dice) + rollDice(dice);
        state.monster.currentHp = Math.max(0, state.monster.currentHp - dmg);
        return { done: true, dmg, log: `${state.player.base.name} atacou com ${state.player.api.spell?.name ?? "magia"}.` };
    }

    const toHit = roll + spellBonus;
    if (toHit < acMonster) {
        return { done: true, dmg: 0, log: `${state.player.base.name} errou o ataque.` };
    };

    const dmg = rollDice(dice);
    state.monster.currentHp = Math.max(0, state.monster.currentHp - dmg);

    return { done: true, dmg, log: `${state.player.base.name} atacou com ${state.player.api.spell?.name ?? "magia"}.` };
}

function monsterAttack(state) {
    const dmg = rollDice("2d12");
    state.player.currentHp = Math.max(0, state.player.currentHp - dmg);
    showLogToast(state, "monster", `${state.monster.base.name} atacou.`);
    return dmg;
}

function monsterHeal(state) {
    const heal = rollDice("2d8");
    state.monster.currentHp = Math.min(state.monster.hpMax, state.monster.currentHp + heal);
    showLogToast(state, "monster", `${state.monster.base.name} se curou.`);
    return heal;
}

function getSelectMonsterActions(state) {
    const monsterId = state.monster.base.id;
    const allowList = monsterActions[monsterId] ?? [];

    const selected = state.monster.api.actions.filter(a => allowList.includes(a.name));

    return selected;
}

function runMonsterAction(state, action) {
    // versão arcade: você decide o dano por nome
    if (action.name === "Tail") return monsterDealDamage(state, "2d6", `usou ${action.name}`);
    if (action.name === "Tentacle") return monsterDealDamage(state, "2d8", `usou ${action.name}`);
    if (action.name === "Fire Breath") return monsterDealDamage(state, "2d14", `usou ${action.name}`);
    if (action.name === "Claw") return monsterDealDamage(state, "2d8", `usou ${action.name}`);
    if (action.name === "Longsword") return monsterDealDamage(state, "2d10", `usou ${action.name}`);
    if (action.name === "Whip") return monsterDealDamage(state, "2d9", `usou ${action.name}`);
    if (action.name === "Bite") return monsterDealDamage(state, "2d8", `usou ${action.name}`);
    if (action.name === "Horns") return monsterDealDamage(state, "2d7", `usou ${action.name}`);
    if (action.name === "Claw (Oni Form Only)") return monsterDealDamage(state, "2d7", `usou Claw`);

    // fallback
    return monsterDealDamage(state, "2d8", `usou ${action.name}`);
}

function monsterDealDamage(state, dice, log) {
    const dmg = rollDice(dice);
    state.player.currentHp = Math.max(0, state.player.currentHp - dmg);
    showLogToast(state, "monster", `${state.monster.base.name} ${log}.`);
    return dmg;
}

async function monsterTurn(state) {
    if (state.end) return;
    if (state.turn !== "monster") return;
    disableBtnRollDice(state);

    const numberDice = document.querySelector("#number-dice");
    await animationUiD20(numberDice, 1200);

    const hpVerification = state.monster.currentHp / state.monster.hpMax;
    const actions = getSelectMonsterActions(state);

    // 20% a menos de vida cura
    if (hpVerification < 0.20 && Math.random() < 0.5) {
        monsterHeal(state);
    }
    else if (actions) {
        const index = Math.floor(Math.random() * actions.length);
        const selectAction = actions[index];
        runMonsterAction(state, selectAction);
        updateWrapperUI(state);
    } else {
        monsterDealDamage(state, "2d8", "atacou");
    }

    if (doneEndCombat(state)) return;
    updateWrapperUI(state);

    state.turn = "player";
    disableBtnRollDice(state);
}

function detectEndCombat(state, result) {
    if (state.end) return;

    state.end = true;
    state.turn = "end";
    state.lastRoll = null;
    state.isRolling = false;

    if (result === "victory") state.monster.currentHp = 0;
    if (result === "defeat") state.player.currentHp = 0;

    saveCombatEnd({
        result,
        monsterName: state.monster.base.name,
        className: state.player.base.name,
        playerHp: state.player.currentHp,
        monsterHp: state.monster.currentHp,
        t: Date.now()
    });

    updateWrapperUI(state);
    disableBtnRollDice(state);
    applyResultsInspectView(state, result);

    document.querySelector(".btn-attack")?.style.setProperty("pointer-events", "none");
    document.querySelector(".btn-heal")?.style.setProperty("pointer-events", "none");
    document.querySelector(".btn-spell")?.style.setProperty("pointer-events", "none");

    if (result === "victory") {
        const txtVictory = document.querySelector("#text-banner-victory");
        if (txtVictory) txtVictory.textContent = `Você derrotou ${state.monster.base.name} com sucesso!`;
        document.querySelector("#section-victory")?.classList.add("show");
        const ended = {
            result,
            monsterName: state.monster.base.name,
            className: state.player.base.name,
            playerHp: state.player.currentHp,
            monsterHp: state.monster.currentHp,
            t: Date.now(),
        };

        saveCombatEnd(ended);

        const k = showlogVictoryKey(ended);
        if (!localStorage.getItem(k)) {
            localStorage.setItem(k, "1");
            showLogVictory(state);
        }
    } else {
        const txtDefeat = document.querySelector("#text-banner-defeat");
        if (txtDefeat) txtDefeat.textContent = `Você fracassou com sua dignidade de vitória.`;
        document.querySelector("#section-derrota")?.classList.add("show");
    }
}

function doneEndCombat(state) {
    if (state.end) return true;

    if (state.monster.currentHp <= 0) {
        detectEndCombat(state, "victory");
        return true;
    }

    if (state.player.currentHp <= 0) {
        detectEndCombat(state, "defeat");
        return true;
    }

    return false;
}

function showYourJourney(state) {
    const box = document.querySelector("#journey-content-txt");
    if (!box) return;

    box.innerHTML = "";

    state.log.forEach((info) => {
        const p = document.createElement("p");
        p.className = info.who === "player" ? "journey-line player" : "journey-line monster";
        p.textContent = info.text;
        p.classList.add("txt-journey");
        box.appendChild(p);
    })
}

function openYourJourney(state) {
    showYourJourney(state);

    document.querySelector("#section-victory")?.classList.remove("show");
    document.querySelector("#section-derrota")?.classList.remove("show");

    document.querySelector("#journey-section")?.classList.add("show");
}

function closeYourJourney() {
    document.querySelector("#journey-section")?.classList.remove("show");

    if (combatState.monster.currentHp <= 0) {
        document.querySelector("#section-victory")?.classList.add("show");

    } else {
        document.querySelector("#section-derrota")?.classList.add("show");
    }
}

const journeySection = document.querySelector("#journey-section");

journeySection?.addEventListener("click", () => {
    closeYourJourney();
});

const journeyContentTxt = document.querySelector("#journey-content-txt");

journeyContentTxt?.addEventListener("click", (e) => {
    e.stopPropagation();
});

const end_key = "combatEnd";

function saveCombatEnd(data) {
    localStorage.setItem(end_key, JSON.stringify(data));
}

function readCombatEnd() {
    const item = localStorage.getItem(end_key);
    if (!item) return null;
    try { return JSON.parse(item); } catch { return null; }
}

function restartCombatEnd() {
    localStorage.removeItem(end_key);
}

function playAgain() {
    document.querySelectorAll(".btn-play-again-banner").forEach((btn) => {
        btn.addEventListener("click", () => {
            restartCombatEnd();
            location.reload();
        })
    })
}

function restartCombatWithExitButton() {
    document.querySelectorAll(".btn-exit-banner").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            restartCombatEnd();
            location.href = "/index.html";
        });
    });
}

// Desafio extra: salver progresso de vitória e derrota dos personagens

function inspectViewKey(type, id) {
    return `profile:${type}:${id}`;
}

function loadInspectView(type, id) {
    const item = localStorage.getItem(inspectViewKey(type, id));
    if (!item) {
        return { id, type, wins: 0, defeats: 0, victoriesIndex: {} };
    }
    try {
        const data = JSON.parse(item);
        return {
            id,
            type,
            wins: Number(data.wins) || 0,
            defeats: Number(data.defeats) || 0,
            victoriesIndex: data.victoriesIndex && typeof data.victoriesIndex === "object" ? data.victoriesIndex : {}
        };
    }
    catch {
        return { id, type, wins: 0, defeats: 0, victoriesIndex: {} };
    }
}

function saveInspectView(profile) {
    localStorage.setItem(inspectViewKey(profile.type, profile.id), JSON.stringify(profile));
}

function applyResultsInspectView(state, result) {
    const classId = state.player.base.id;
    const monsterId = state.monster.base.id;

    const classInspect = loadInspectView("class", classId);
    const monsterInspect = loadInspectView("monster", monsterId);

    if (result === "victory") {
        classInspect.wins += 1;
        monsterInspect.defeats += 1;

        classInspect.victoriesIndex[monsterId] = true;

    } else {
        classInspect.defeats += 1;
        monsterInspect.wins += 1;
    }

    saveInspectView(classInspect);
    saveInspectView(monsterInspect);
}

function renderInspectViewPerson() {
    const { personType: type, personId: id } = document.body.dataset;

    if (!type || !id) return false;
    renderInspectViewInWindow(type, id);
    return true;
}

function renderInspectViewInWindow(type, id) {
    const p = loadInspectView(type, id);
    const indexVic = document.querySelector(".index-victory");
    const indexDef = document.querySelector(".index-defeat");
    if (indexVic) indexVic.textContent = `Vitórias: ${p.wins}`;
    if (indexDef) indexDef.textContent = `Derrotas: ${p.defeats}`;
}

function showLogVictory(state) {
    const toast = document.querySelector("#toast-stock-victory");
    if (!toast) return;

    const text = toast.querySelector("#txt-toast-stock-victory");
    if (!text) return;
    text.textContent = `${state.monster.base.name} foi adicionado ao índice de vitória`;

    toast.classList.add("show");
}

function showlogVictoryKey(ended) {
    return `toastLogVictory:${ended.t}`;
}