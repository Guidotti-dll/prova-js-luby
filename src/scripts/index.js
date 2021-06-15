(function (DOM) {
  'use strict';

    const app = (function() {
      let selectedGame = {};
      let games = {};
      let gameNumbers = [];
      let totalValueBet = 0;

      return {
        init : function init() {
          app.getGamesInfo();
          app.initEvents();
        },

        initEvents: function initEvents() {
          const $clearGameButton = DOM('[data-js="clearGameButton"]').get();
          const $completeGameButton = DOM('[data-js="completeGameButton"]').get();
          const $addToCartButton = DOM('[data-js="addToCartButton"]').get();
          const $saveGameButton = DOM('[data-js="saveGameButton"]').get();
          $clearGameButton.addEventListener('click', app.clearGame);
          $completeGameButton.addEventListener('click', app.completeGame);
          $addToCartButton.addEventListener('click', app.addToCart);
          $saveGameButton.addEventListener('click', app.saveGame);
        },

        getGamesInfo: function getGamesInfo() {
          const ajax = new XMLHttpRequest();
          ajax.open('GET', '../../games.json');
          ajax.send();
          ajax.addEventListener('readystatechange', function () {
            if(app.isReady.call(this)){
              games = JSON.parse(ajax.responseText);
              app.renderGames();
            }
          })
        },

        renderGames: function renderGames() {
          const $gamesDom = DOM('[data-js="games"]').get();
          $gamesDom.innerHTML = ''
          games.types.forEach((game)=>{
            const $button =  document.createElement('button');
            $button.textContent = game.type
            if(game.type !== selectedGame.type){
              $button.style.background = 'transparent';
              $button.style.color = game.color;
            }else {
              $button.style.background = game.color;
              $button.style.color = '#ffffff';
            }
            $button.addEventListener('click', () => app.selectGame(game))
            $gamesDom.appendChild($button);
          })
        },

        selectGame: function selectGame(game) {
          if(game.type !== selectedGame.type){
            selectedGame = game;
          }else {
            selectedGame = {}
          }
          app.clearGame();
          app.renderGames();
          app.setDescription();
          app.renderNumbersButton();

        },

        setDescription: function setDescription() {
          const $gamesDom = DOM('[data-js="description"]').get();
          $gamesDom.innerHTML = selectedGame.description ? selectedGame.description : '';
        },

        renderNumbersButton: function renderNumbersButton() {
          const $gameNumbers = DOM('[data-js="gameNumbers"]').get();
          $gameNumbers.innerHTML= '';
          if(!selectedGame.range){
            $gameNumbers.innerHTML= '';
          }
          for (let index = 1; index <= selectedGame.range; index++) {
            const $button =  document.createElement('button');
            $button.textContent = index;
            $button.addEventListener('click', () => app.addNumber(event));
            $gameNumbers.appendChild($button);
          }
        },

        addToCart: function addToCart() {
          if (!selectedGame.type) {
            alert("Você deve selecionar um jogo e escolher os números em que vai apostar");
            return;
          }
          if (  selectedGame['max-number'] > gameNumbers.length) {
            alert(`Falta escolher mais ${selectedGame['max-number'] - gameNumbers.length} números`);
            return;
          }
          const orderedNumbers = gameNumbers.sort((num1, num2) => {
            return num1 > num2 ? 1 : num1 < num2 ? -1 : 0;
          })
          const $cartGames = DOM('[data-js="cartGames"]').get();
          totalValueBet += selectedGame.price;
          $cartGames.innerHTML += `
            <li>
            <img src="../assets/icons/trash.svg" alt="Trash Icon">
              <div class="gameCard" style="border-color: ${selectedGame.color}">
              <p>${orderedNumbers.join(', ')}</p>
                <p style="color: ${selectedGame.color}">${selectedGame.type} <span>${app.formatPrice(selectedGame.price)}</span></p>
              </div>
            </li>
          `
          DOM('img').on('click',app.removeGame)
          app.showTotalValueBet();
          app.clearGame();
        },

        formatPrice: function formatPrice(value) {
          return value.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})
        },
        
        showTotalValueBet: function showTotalValueBet(value) {
          const $total = DOM('[data-js="total"]').get();
          if (totalValueBet !== 0) {
            $total.innerHTML = `
            <p><strong>CART</strong> Total: ${app.formatPrice(totalValueBet)}</p>
            `
            return;
          }
          $total.innerHTML = ``
        },

        removeGame: function removeGame(event) {
          const $removeButton = event.path[0];
          const $removedLi = $removeButton.parentNode;
          totalValueBet -= parseFloat($removedLi.lastElementChild.lastElementChild.lastElementChild.textContent.slice(3).replace(',','.'));
          $removeButton.parentNode.parentNode.removeChild($removeButton.parentNode);
          app.showTotalValueBet();
        },

        addNumber: function addNumber(event) {
          const $numberButton = event.path[0];
          const selectedNumber = +event.target.innerText;
          const hasInArray = gameNumbers.some((item) => {
            return item === selectedNumber;
          });
          
          if (hasInArray) {
            $numberButton.style.background = '#adc0c4'
            const numberIndex = gameNumbers.findIndex(number => number === selectedNumber );
            gameNumbers.splice(numberIndex, 1);
          } else if(selectedGame['max-number'] > gameNumbers.length) {
            $numberButton.style.background = selectedGame.color;
            gameNumbers.push(selectedNumber)
          } else if (selectedGame['max-number'] === gameNumbers.length) {
            alert(`Você não pode selecionar mais números!`);
            return;
          }
          
        },

        clearGame: function clearGame() {
          gameNumbers = [];
          app.renderNumbersButton();
        },

        completeGame: function completeGame() {
          if (!selectedGame.type) {
            alert("Você deve escolher um jogo antes de completa-lo!!")
          }
          while (selectedGame['max-number'] > gameNumbers.length && selectedGame) {
            const selectedNumber = app.getRandomIntInclusive(0,selectedGame.range);
            const hasInArray = gameNumbers.some((item) => {
              return item === selectedNumber;
            });
            if (!hasInArray && selectedNumber !== 0) {
              gameNumbers.push(selectedNumber);
            }
          }
          const $gameNumbers = DOM('[data-js="gameNumbers"]').get();
          gameNumbers.forEach((item) => {
            const $button = $gameNumbers.children[item-1];
            $button.style.background = selectedGame.color;
          });
        },

        getRandomIntInclusive:function getRandomIntInclusive(min, max) {
          min = Math.ceil(min);
          max = Math.floor(max);
          return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        saveGame: function saveGame() {
          if (totalValueBet === 0) {
            alert("Seu carrinho está vazio. Aposte um pouco, só não ganha quem não joga!!");
            return;
          }
          if (totalValueBet < games.types[0]["min-cart-value"]) {
            alert(`O valor mínimo de aposta é ${app.formatPrice(games.types[0]["min-cart-value"])}`);
            return;
          }
          app.resetValues()
          window.scrollTo(0, 0);
          alert("Aposta realizada com sucesso!!")
        },
        
        resetValues: function resetValues() {
          selectedGame = {};
          gameNumbers = [];
          totalValueBet = 0;
          DOM('[data-js="cartGames"]').get().innerHTML = ``;
          app.showTotalValueBet();
        },
        
        isReady: function isReady() {
          return this.readyState === 4 && this.status === 200;
        },
      }
    }())

    app.init();
})(window.DOM);
