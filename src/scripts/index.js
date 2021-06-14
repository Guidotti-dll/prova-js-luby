(function (DOM) {
  'use strict';

    const app = (function() {
      let selectedGame = {};
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
              app.renderGames(JSON.parse(ajax.responseText));
            }
          })
        },

        renderGames: function renderGames(games) {
          const $gamesDom = DOM('[data-js="games"]').get();
          games.types.forEach((game)=>{
            const $button =  document.createElement('button');
            $button.textContent = game.type
            $button.style.color = game.color
            $button.addEventListener('click', () => app.selectGame(event,game))
            $gamesDom.appendChild($button);
          })
        },

        selectGame: function selectGame(event,game) {
          const $button = event.path[0];
          if(game.type === selectedGame.type){
            selectedGame = {}
            $button.style.background = 'transparent';
            $button.style.color = game.color;
          }else {
            selectedGame = game
            $button.style.background = game.color;
            $button.style.color = '#ffffff';
          }
        },

        isReady: function isReady() {
          return this.readyState === 4 && this.status === 200;
        },
      }
    }())

    app.init();
})(window.DOM);
