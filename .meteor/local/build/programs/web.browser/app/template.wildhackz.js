(function(){angular.module('angular-meteor').run(['$templateCache', function($templateCache) { $templateCache.put('undefined',"<button>Click Me</button> <p>You've pressed the button {{counter}} times.</p>");}]);
}).call(this);
