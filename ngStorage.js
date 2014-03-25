'use strict';

(function () {

    var service = function ($rootScope, $window) {
        
        var serviceMembers = {
            defaults: defaults,
            reset: reset
        };

        var $storage = {},
            _last$storage,
            _debounce;

        function defaults(items) {
            for (var k in items) {
                angular.isDefined($storage[k]) || ($storage[k] = items[k]);
            }
            return $storage;
        };

        function reset(items) {
            for (var k in $storage) {
                '$' === k[0] || delete $storage[k];
            }
            // TODO: Should reset given items back to defaults
            return defaults(items);
        };

        for (var i = 0, k; i < $window.localStorage.length; i++) {
            // #8, #10: `$window.localStorage.key(i)` may be an empty string (or throw an exception in IE9 if `$window.localStorage` is empty)
            // TODO: replace 'ngStorage' prefix with storageKeyBuildService
            (k = $window.localStorage.key(i)) && 'ngStorage-' === k.slice(0, 10) && ($storage[k.slice(10)] = angular.fromJson($window.localStorage.getItem(k)));
        }

        _last$storage = angular.copy($storage);

        $rootScope.$watch(function () {
            _debounce || (_debounce = setTimeout(function () {
                _debounce = null;

                if (!angular.equals($storage, _last$storage)) {
                    angular.forEach($storage, function (v, k) {
                        angular.isDefined(v) && '$' !== k[0] && $window.localStorage.setItem('ngStorage-' + k, angular.toJson(v));

                        delete _last$storage[k];
                    });

                    for (var k in _last$storage) {
                        $window.localStorage.removeItem('ngStorage-' + k);
                    }

                    _last$storage = angular.copy($storage);
                }
            }, 100));
        });

        // #6: Use `$window.addEventListener` instead of `angular.element` to avoid the jQuery-specific `event.originalEvent`
        $window.addEventListener && $window.addEventListener('storage', function (event) {
            if ('ngStorage-' === event.key.slice(0, 10)) {
                event.newValue ? $storage[event.key.slice(10)] = angular.fromJson(event.newValue) : delete $storage[event.key.slice(10)];

                _last$storage = angular.copy($storage);

                $rootScope.$apply();
            }
        });
        return serviceMembers;
    };

    angular.module('ngStorage').factory('ngStorageService', ['$rootScope', '$window', service]);

})();
