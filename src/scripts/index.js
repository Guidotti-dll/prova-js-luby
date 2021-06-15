(function (DOM) {
  'use strict';

    const app = (function() {
      let selectedGame = {};
      let games = {};
      let gameNumbers = [];

      return {
        init : function init() {
          app.getGamesInfo();
          app.initEvents();
        },

        initEvents: function initEvents() {
          const $clearGameButton = DOM('[data-js="clearGameButton"]').get();
          const $completeGameButton = DOM('[data-js="completeGameButton"]').get();
          $clearGameButton.addEventListener('click', app.clearGame);
          $completeGameButton.addEventListener('click', app.completeGame);
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
            return;
          }
          for (let index = 1; index <= selectedGame.range; index++) {
            const $button =  document.createElement('button');
            $button.textContent = index;
            $button.addEventListener('click', () => app.addNumber(event));
            $gameNumbers.appendChild($button);
          }
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
            gameNumbers.push(selectedNumber);
            $numberButton.style.background = selectedGame.color;
          }
        },

        clearGame: function clearGame() {
          gameNumbers = [];
          app.renderNumbersButton();
        },

        completeGame: function completeGame() {
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
        
        isReady: function isReady() {
          return this.readyState === 4 && this.status === 200;
        },
      }
    }())

    app.init();
})(window.DOM);
