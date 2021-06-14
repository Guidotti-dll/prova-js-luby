(function (DOM) {
  'use strict';

    const app = (function() {
      let selectedGame = {};
      let games = {};
      return {
        init : function init() {
          app.getGamesInfo();
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
            $button.addEventListener('click', () => app.selectGame(event,game))
            $gamesDom.appendChild($button);
          })
        },

        selectGame: function selectGame(event,game) {
          if(game.type !== selectedGame.type){
            selectedGame = game;
          }else {
            selectedGame = {}
          }
          app.renderGames();
        },

        isReady: function isReady() {
          return this.readyState === 4 && this.status === 200;
        },
      }
    }())

    app.init();
})(window.DOM);
