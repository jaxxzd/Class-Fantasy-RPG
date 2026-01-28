console.log("app.js carregou");

// motor para alterações de nome no topo e seleção de imagem dos personagens na tela index (index-selecao-personagem.html) e tela 2 (tela-2-selecao-monstro.html).

function engineSelector(config) {
    const {
        cardSelector,
        nameSelectorCard,
        imgSelectorCard,
        selectedImgSelector,
        selectedNameSelector,
        buttonSelector,
        buttonSrc,
        buttonSelectedSrc,
        noLinks = true
    } = config;

    const cards = document.querySelectorAll(cardSelector);
    const imgSelected = document.querySelector(selectedImgSelector);
    const nameSelected = document.querySelector(selectedNameSelector);

    if (!cards.length || (!nameSelected && !imgSelected)) return;

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
        if (!buttonSelector || !buttonSrc) return;

        const allButtons = document.querySelectorAll(buttonSelector);
        allButtons.forEach(btn => {
            btn.classList.remove("selected");
            btn.src = buttonSrc;
        });
    }

    function targetButton(card) {
        if (!buttonSelector || !buttonSelectedSrc) return;

        const btn = card.querySelector(buttonSelector);
        if (!btn) return;

        btn.classList.add("selected");
        btn.src = buttonSelectedSrc
    }

    cards.forEach(card => {
        card.addEventListener("click", (e) => {
            if (noLinks && e.target.closest("a")) return;

            const nameCFR = card.querySelector(nameSelectorCard);
            const imgCFR = card.querySelector(imgSelectorCard);

            if (!nameCFR || !imgCFR) return;

            const name = nameCFR.textContent.trim();
            const img = imgCFR.getAttribute("src");

            shiftName(name);
            shiftImg(img);

            resetButtons();
            targetButton(card);
        });
    });
}

engineSelector({
    cardSelector: ".card-character",
    nameSelectorCard: ".name-class-card",
    imgSelectorCard: ".container-name-img img",
    selectedImgSelector: ".img-selected-class",
    selectedNameSelector: ".name-character-class",
    buttonSelector: ".btn-equipar",
    buttonSrc: "./assets/botão-equipar.png",
    buttonSelectedSrc: "./assets/botão-equipado.png",
    ignoreLinks: true
});

engineSelector({
    cardSelector: ".card-character",
    nameSelectorCard: ".name-monster-card",
    imgSelectorCard: ".container-name-img img",
    selectedImgSelector: ".img-selected-monster",
    selectedNameSelector: ".name-character-monster",
    buttonSelector: ".btn-selecionar",
    buttonSrc: "./assets/botão-selecionar.png",
    buttonSelectedSrc: "./assets/botão-selecionar.png",
    ignoreLinks: true
});

