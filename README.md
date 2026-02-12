# Class Fantasy RPG 🎲🎮

Class Fantasy RPG é denominado por um mini-jogo de combate por turnos, utilizando Front-end com as principais tecnologias - HTML/CSS/JS, com o objetivo de consumir a DnD API 5e.

O principal objetivo do projeto é o consumo de uma API pública, manipulação de JSON, com aplicação de lógica para rolagem de dados, ações de ataque, defesa e magia, com salvamento de progresso e barra de vida animada com a integração de UI dinâmica e funcional.

# Instrução de gameplay 🕹️

Ao início do jogo você se depara com duas interrogações, a primeira tela em que se localiza serve para você equipar a classe que irá começar a batalha com um monstro, ao selecionar, a interrogação será substituída pela imagem da classe equipada, mostrando o nome da classe na parte superior.

Diante a primeira página, você possui variedades de opção de classes, possibilitando equipá-las ou inspêcioná-las para visualizar seus dados de vida, ataque, defesa e dano, com informações de vitória e derrota (salvamento de progresso) e detalhes sobre suas especialidades como magias e equipamentos.

Ao clicar no botão "Next" no footer, você será direcionado a seleção de monstros, onde terá a oportunidade de selecionar o seu oponente formidável, ao clicar em selecionar nos cards dos monstros será efetuado o mesmo processo de substituição da interrogação para a imagem correspondente ao monstro, monstrando o seu nome no topo.

Diante a segunda página, temos o mesmo fluxo de variedades de monstros, podendo escolher qual monstro irá batalhar, com opções de selecioná-los ou inspecionâ-los onde terá suas mais importantes informações técnicas.

Ao selecionar sua classe e monstro deverá clicar no botão "PLAY" para iniciar a batalha, ao clicar, irá se deparar com um dado D20, para girá-lo e acionar as suas táticas precisará clicar no botão "Rolar dado", ao clicar neste botão, poderá escolher dentre as três opções de ação abaixo, definido por "Ataque", "Cura" e "Magia". Você seguirá um fluxo de turno neste combate, podendo executar as suas ações e o monstro as dele, quem conseguir ser mais estratégico e habilidoso vence o jogo. Ao final do jogo você pode observar as suas ações clicando no botão "Sua jornada", olhando os passos que você deu e os passos do monstro, além de poder clicar em "Jogar novamente" e viver mais uma aventura ou clicar em sair para testar personagens diferentes!

# Clonagem do projeto 💻🌍

Você poderá clonar o repositório deste projeto para integrar novas funcionalidades!

Clone o repositório:

git clone git@github.com:jaxxzd/Class-Fantasy-RPG.git (SSH)

git clone https://github.com/jaxxzd/Class-Fantasy-RPG.git (HTTPS)

# Recursos/Endpoints (D&D API 5e) 📍

Endpoint de monstros:

https://www.dnd5eapi.co/api/monsters

Endpoint de equipamentos:

https://www.dnd5eapi.co/api/equipment

Endpoint de magias:

https://www.dnd5eapi.co/api/spells

URL BASE:

https://www.dnd5eapi.co/api

# Decisões de projeto 🧠

Optei principalmente por utilizar as tecnologias de Front-end - HTML/CSS/JS.

O ponto que peguei de referência foi de jogos que estão na plataforma Roblox.

Lógica de combate (ataque, defesa, magia, AC) e funções de UI foram preparadas para atender ao usuário, com organizações na criação e pequenos comentários para ter noção do que foi feito.

Feedback visual ao final do jogo.

Logs ao vivo a cada ação da classe ou monstro.

Proatividade na contenção de erros vindos da base de dados da API, com utilização de estrutura de verificação.

Imersão e informação ao usuário a cada ação executada.

Busca por um tema de jogo Dark Fantasy e organização de imagens para que coincidem com o objetivo.


