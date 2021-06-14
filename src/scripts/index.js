(function () {
  'use strict';

    const app = (function() {
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
          console.log(games);
        },

        isReady: function isReady() {
          return this.readyState === 4 && this.status === 200;
        },
      }
    }())

    app.init();
})();
