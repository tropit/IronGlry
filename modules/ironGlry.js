    // Create gallery module
    // loading the next libraries: ui.bootstrap, ngStorage, ngAnimate, anugularPerloadImage, setNgAnimate
    var glryApp = angular.module('IronGlry', ['ui.bootstrap','ngStorage','ngAnimate','angular-preload-image', 'ui.bootstrap.setNgAnimate']);

    // Conotroller of the first section - glry
    glryApp.controller('glryCtrl', function($scope, $http, $location, $localStorage, filterFilter, $filter, $modal) {
        var lastNumPerPage = $scope.resultsPerPage || 10;
        var lastCurrentPage = 1;
        var blockedImages = $localStorage.blocked || [];
        var tempPics;
        var firstLoad = true;
        var picsToShow;

        // ***important tool to test the system (for changing feed with another vaild feed)
        // clearAllStorage();

        // Defines scopes includes localStroage
        $scope.searchVal = $localStorage.searchVal;
        $scope.onPagePics = [];
        $scope.currentPage = $localStorage.currentPage || 1;
        $scope.maxSize = 5;
        $scope.sortProp = $localStorage.sortProp || 'title';
        $scope.search = $scope.search || 'true';
        $scope.pagination = $scope.pagination || 'true';
        $scope.numPerPage = $localStorage.numPerPage || $scope.resultsPerPage || 10;
        $scope.sorting = $scope.sorting || 'true';
        // check if inter are valid ( exsits and number)
        if($scope.myInterval==null||!(/^\d+$/.test($scope.myInterval)))
            $scope.myInterval = 4000;
        $scope.imagesOverBool = [];
        $scope.slideShowMode = false;


        console.log($scope.search + "," + $scope.myInterval + "," + $scope.sorting + "," + $scope.pagination + "," + $scope.feed + "," + $scope.numPerPage);
        // getting Http request in the first of the runing and only after the callback continue
        $http.get($scope.feed).success(function(response){
                if(isJson(response))
                    tempPics = angular.fromJson(response.data);
                else if(angular.isArray(response))
                    tempPics = response;
                else
                    tempPics = getFeed();
                runProgram();
            })
            .error(function(){
                tempPics = getFeed();
                runProgram();
            });

        // Input: feed, output: array
        function getFeed(response){
            var feed = $scope.feed;
            if(angular.isArray(feed))
                return feed;
            else if(isJson(feed))
                return angular.fromJson(feed)
        }

        // run all of  the scopes in this controll (after callback from the feed
        function runProgram() {
            $scope.pics = $localStorage.allowed || tempPics;
            // exit if the feed is wrong
            if(!(angular.isArray($scope.pics)))
                document.write("Please Insert input JSON or Array into the feed.");
            picsToShow = angular.copy($scope.pics);
            $scope.open = function (picIndexInPage) {
                var allPics = angular.copy(picsToShow);
                if(picIndexInPage != -1) {
                    var picIndex = (($scope.currentPage - 1) * $scope.numPerPage) + picIndexInPage;
                    allPics[picIndex].active = true;
                    $scope.slideShowMode = false;
                }
                else
                    $scope.slideShowMode = true;
                openBigImage(allPics);
            };
            $scope.imageOver = function (image) {
                image.showTools = true;
                image.width = 400;
            };
            $scope.imageOut = function (image) {
                image.showTools = false;
                image.width = "";
            };
            $scope.pushOverBool = function (index) {
                $scope.imagesOverBool[index] = false;
            };
            $scope.$watch('sortProp', function () {
                $scope.sortBy();
            });
            $scope.$watch('searchVal', function () {
                picsToShow = filterFilter($scope.pics, $scope.searchVal);
                $scope.sortBy();
                $scope.updatePage(picsToShow);
                $localStorage.filterd = picsToShow;
                $localStorage.searchVal = $scope.searchVal;
            });
            $scope.$watch('numPerPage', function () {
                if (lastNumPerPage != $scope.numPerPage) {
                    $scope.currentPage = Math.ceil(( ((lastCurrentPage - 1) * lastNumPerPage) + 1) / parseInt($scope.numPerPage));
                    $localStorage.numPerPage = $scope.numPerPage;
                }
            });
            $scope.$watch('currentPage + numPerPage', function () {
                $scope.updatePage(picsToShow);
                firstLoad = false;
            });
            $scope.updatePage = function (picsToUpdate) {
                //console.log("LastNumPerPage: " + $scope.lastNumPerPage + ",LastCurrentPage: " + $scope.lastCurrentPage + ",NumPerPage: " + $scope.numPerPage + ",CurrentPage: " + $scope.currentPage);
                picsToShow = picsToUpdate;
                if($scope.pagination=='true')
                    calculatePages(picsToShow);
                else
                    $scope.onPagePics = picsToShow;
            };
            $scope.sortBy = function () {
                var prop = $scope.sortProp;
                //$scope.order(prop, false);
                picsToShow.sortBy(prop);
                $localStorage.sortProp = prop;
                if (!firstLoad) {
                    $scope.currentPage = 1;
                }
                $scope.updatePage(picsToShow);
            };
            $scope.blockImage = function (i) {
                var indexToDelete = (($scope.currentPage - 1) * $scope.numPerPage) + i;
                blockedImages.push(picsToShow[indexToDelete]);
                picsToShow.remove(indexToDelete);
                $localStorage.allowed = picsToShow;
                $localStorage.blocked = blockedImages;
                $scope.updatePage(picsToShow);
            };
        }

        // open modal window of the big image
        function openBigImage(allPicsToBig) {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'modal.html',
                controller: 'modalCtrl',
                size: 'lg',
                resolve: {
                    picsArr: function () {
                        return allPicsToBig;
                    },
                    slideShowMode: function () {
                        return $scope.slideShowMode;
                    },
                    myInterval: function () {
                        return $scope.myInterval;
                    }
                }
            });
            modalInstance.result.then(function () {
            }, function () {
                $scope.slideShowMode = false;
            });
        }

        // check if the string is JSON
        function isJson(str) {
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }
            return true;
        }

        // calculatePages for the pagination
        function calculatePages(picsToCalculate){
            var begin = (($scope.currentPage - 1) * $scope.numPerPage)
                , end = begin + parseInt($scope.numPerPage);
            lastCurrentPage = $scope.currentPage;
            lastNumPerPage = $scope.numPerPage;
            $scope.onPagePics = picsToCalculate.slice(begin, end);
            $scope.totalNumOfPics = picsToCalculate.length;
            $localStorage.currentPage = $scope.currentPage;
        }

        // Function to clear all of the localStorage (must for testing)
        function clearAllStorage(){
            $localStorage.$reset();
        }

        Array.prototype.remove = function(from, to) {
            var rest = this.slice((to || from) + 1 || this.length);
            this.length = from < 0 ? this.length + from : from;
            return this.push.apply(this, rest);
        };
        Array.prototype.sortBy = function(prop){
            this.sort(function(a, b){
                if(prop=='title') {
                    var titleA = a.title.toLowerCase(), titleB = b.title.toLowerCase()
                    if (titleA < titleB) //sort string ascending
                        return -1
                    if (titleA > titleB)
                        return 1
                    return 0 //default return value (no sorting)
                }
                else if(prop=='date'){
                    var dateA=new Date(a.date), dateB=new Date(b.date)
                    return dateA-dateB //sort by date ascending
                }
            });
        }
    });

    glryApp.controller('modalCtrl', function ($scope, $animate, $modalInstance, picsArr, slideShowMode, myInterval, $timeout) {
        var first = true;
        var allPics = angular.copy(picsArr);

        // Define the copes in the controller
        $scope.slideShowMode = slideShowMode;
        if(!$scope.slideShowMode)
            $scope.myInterval = myInterval;
        $scope.myInterval = 0;
        $scope.noWrapSlides = false;
        $scope.animate = false;
        $scope.slideShow = false;
        console.log($scope.myInterval,$scope.slideShow, $scope.slideShowMode);

        // The perpose of this section is to fixing bug bitween Angular to Boostraps
        $scope.$watch('animate', function(){
            if(!first) {
                $scope.animate = true;
            }
            first = false;
        });

        // Play and puase the slide show
        $scope.play = function(){
            $scope.slideShow = true;
            $scope.myInterval = myInterval;
            if(!first) {
                $scope.animate = true;
            }
        };
        $scope.pause = function(){
            $scope.slideShow = false;
            $scope.myInterval = 0;
        };

        // Hide the Play button
        $scope.hideMe = function () {
            $scope.myInterval = myInterval;
            $scope.slideShow = true;
            $scope.startFade = true;
            $scope.hidden = true;

        };

        // Show and hide the toolbar in the big picture
        $scope.showToolbar = function(){
            $scope.showTool = true;
        };
        $scope.hideToolbar = function(){
            $scope.showTool = false;
        };

        // Enter the data to the slide
        $scope.slides = allPics;

    });

    // Create the directive <my-gallery></my-galley>
    glryApp.directive('myGallery', function($http,$compile){
        return{
            redirect: "A",
            scope: false,
            link: function(scope,element,attrs){
                scope.feed = attrs.feed || false;
                scope.search = attrs.search;
                scope.pagination = attrs.pagination || false;
                scope.resultsPerPage = attrs.resultsPerPage || false;
                scope.sorting = attrs.sorting || false;
                scope.myInterval = attrs.autoRotateTime || false;
                $http.get("index.html")
                    .success(function (response) {
                        element.append($compile(response)(scope));
                    });
            }

        };
    });

    angular.module('ui.bootstrap.setNgAnimate', ['ngAnimate'])
        .directive('setNgAnimate', ['$animate', function ($animate) {
            return {
                link: function ($scope, $element, $attrs) {
                    $scope.$watch( function() {
                        return $scope.$eval($attrs.setNgAnimate, $scope);
                    }, function(valnew, valold){
                        $animate.enabled(!!valnew, $element);
                    });
                }
            };
        }]);


    angular.module('angular-preload-image', []);
    angular.module('angular-preload-image').factory('preLoader', function(){
        return function (url, successCallback, errorCallback) {
            //Thank you Adriaan for this little snippet: http://www.bennadel.com/members/11887-adriaan.htm
            angular.element(new Image()).bind('load', function(){
                successCallback();
            }).bind('error', function(){
                errorCallback();
            }).attr('src', url);
        }
    });
    angular.module('angular-preload-image').directive('preloadImage', ['preLoader', function(preLoader){
        return {
            restrict: 'A',
            terminal: true,
            priority: 100,
            link: function(scope, element, attrs) {
                var url = attrs.ngSrc;
                scope.default = attrs.defaultImage || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wEWEygNWiLqlwAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAMSURBVAjXY/j//z8ABf4C/tzMWecAAAAASUVORK5CYII=";
                attrs.$set('src', scope.default);
                //var ngC = attrs.ngClick;

                preLoader(url, function(){
                    attrs.$set('src', url);
                    //attrs.$set('ngClick',ngC);
                }, function(){
                    if (attrs.fallbackImage != undefined) {
                        attrs.$set('src', attrs.fallbackImage);
                    }
                });
            }
        };
    }]);



    // Another Libraries [preLoadImage, ngStorage]

    angular.module('angular-preload-image').directive('preloadBgImage', ['preLoader', function(preLoader){
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                if (attrs.preloadBgImage != undefined) {
                    //Define default image
                    scope.default = attrs.defaultImage || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wEWEygNWiLqlwAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAMSURBVAjXY/j//z8ABf4C/tzMWecAAAAASUVORK5CYII=";
                    element.css({
                        'background-image': 'url("' + scope.default + '")'
                    });
                    preLoader(attrs.preloadBgImage, function(){
                        element.css({
                            'background-image': 'url("' + attrs.preloadBgImage + '")'
                        });
                    }, function(){
                        if (attrs.fallbackImage != undefined) {
                            element.css({
                                'background-image': 'url("' + attrs.fallbackImage + '")'
                            });
                        }
                    });
                }
            }
        };
    }]);

    (function (root, factory) {
        'use strict';

        if (typeof define === 'function' && define.amd) {
            define(['angular'], factory);
        } else if (typeof exports === 'object') {
            module.exports = factory(require('angular'));
        } else {
            // Browser globals (root is window), we don't register it.
            factory(root.angular);
        }
    }(this , function (angular) {
        'use strict';

        // RequireJS does not pass in Angular to us (will be undefined).
        // Fallback to window which should mostly be there.
        angular = (angular && angular.module ) ? angular : window.angular;

        /**
         * @ngdoc overview
         * @name ngStorage
         */

        return angular.module('ngStorage', [])

        /**
         * @ngdoc object
         * @name ngStorage.$localStorage
         * @requires $rootScope
         * @requires $window
         */

            .provider('$localStorage', _storageProvider('localStorage'))

        /**
         * @ngdoc object
         * @name ngStorage.$sessionStorage
         * @requires $rootScope
         * @requires $window
         */

            .provider('$sessionStorage', _storageProvider('sessionStorage'));

        function _storageProvider(storageType) {
            return function () {
                var storageKeyPrefix = 'ngStorage-';

                this.setKeyPrefix = function (prefix) {
                    if (typeof prefix !== 'string') {
                        throw new TypeError('[ngStorage] - ' + storageType + 'Provider.setKeyPrefix() expects a String.');
                    }
                    storageKeyPrefix = prefix;
                };

                var serializer = angular.toJson;
                var deserializer = angular.fromJson;

                this.setSerializer = function (s) {
                    if (typeof s !== 'function') {
                        throw new TypeError('[ngStorage] - ' + storageType + 'Provider.setSerializer expects a function.');
                    }

                    serializer = s;
                };

                this.setDeserializer = function (d) {
                    if (typeof d !== 'function') {
                        throw new TypeError('[ngStorage] - ' + storageType + 'Provider.setDeserializer expects a function.');
                    }

                    deserializer = d;
                };

                // Note: This is not very elegant at all.
                this.get = function (key) {
                    return deserializer(window[storageType].getItem(storageKeyPrefix + key));
                };

                // Note: This is not very elegant at all.
                this.set = function (key, value) {
                    return window[storageType].setItem(key, serializer(value));
                };

                this.$get = [
                    '$rootScope',
                    '$window',
                    '$log',
                    '$timeout',

                    function(
                        $rootScope,
                        $window,
                        $log,
                        $timeout
                    ){
                        function isStorageSupported(storageType) {

                            // Some installations of IE, for an unknown reason, throw "SCRIPT5: Error: Access is denied"
                            // when accessing window.localStorage. This happens before you try to do anything with it. Catch
                            // that error and allow execution to continue.

                            // fix 'SecurityError: DOM Exception 18' exception in Desktop Safari, Mobile Safari
                            // when "Block cookies": "Always block" is turned on
                            var supported;
                            try {
                                supported = $window[storageType];
                            }
                            catch (err) {
                                supported = false;
                            }

                            // When Safari (OS X or iOS) is in private browsing mode, it appears as though localStorage
                            // is available, but trying to call .setItem throws an exception below:
                            // "QUOTA_EXCEEDED_ERR: DOM Exception 22: An attempt was made to add something to storage that exceeded the quota."
                            if (supported && storageType === 'localStorage') {
                                var key = '__' + Math.round(Math.random() * 1e7);

                                try {
                                    localStorage.setItem(key, key);
                                    localStorage.removeItem(key);
                                }
                                catch (err) {
                                    supported = false;
                                }
                            }

                            return supported;
                        }

                        // The magic number 10 is used which only works for some keyPrefixes...
                        // See https://github.com/gsklee/ngStorage/issues/137
                        var prefixLength = storageKeyPrefix.length;

                        // #9: Assign a placeholder object if Web Storage is unavailable to prevent breaking the entire AngularJS app
                        var webStorage = isStorageSupported(storageType) || ($log.warn('This browser does not support Web Storage!'), {setItem: angular.noop, getItem: angular.noop}),
                            $storage = {
                                $default: function(items) {
                                    for (var k in items) {
                                        angular.isDefined($storage[k]) || ($storage[k] = items[k]);
                                    }

                                    $storage.$sync();
                                    return $storage;
                                },
                                $reset: function(items) {
                                    for (var k in $storage) {
                                        '$' === k[0] || (delete $storage[k] && webStorage.removeItem(storageKeyPrefix + k));
                                    }

                                    return $storage.$default(items);
                                },
                                $sync: function () {
                                    for (var i = 0, l = webStorage.length, k; i < l; i++) {
                                        // #8, #10: `webStorage.key(i)` may be an empty string (or throw an exception in IE9 if `webStorage` is empty)
                                        (k = webStorage.key(i)) && storageKeyPrefix === k.slice(0, prefixLength) && ($storage[k.slice(prefixLength)] = deserializer(webStorage.getItem(k)));
                                    }
                                },
                                $apply: function() {
                                    var temp$storage;

                                    _debounce = null;

                                    if (!angular.equals($storage, _last$storage)) {
                                        temp$storage = angular.copy(_last$storage);
                                        angular.forEach($storage, function(v, k) {
                                            angular.isDefined(v) && '$' !== k[0] && webStorage.setItem(storageKeyPrefix + k, serializer(v));

                                            delete temp$storage[k];
                                        });

                                        for (var k in temp$storage) {
                                            webStorage.removeItem(storageKeyPrefix + k);
                                        }

                                        _last$storage = angular.copy($storage);
                                    }
                                },
                            },
                            _last$storage,
                            _debounce;

                        $storage.$sync();

                        _last$storage = angular.copy($storage);

                        $rootScope.$watch(function() {
                            _debounce || (_debounce = $timeout($storage.$apply, 100, false));
                        });

                        // #6: Use `$window.addEventListener` instead of `angular.element` to avoid the jQuery-specific `event.originalEvent`
                        $window.addEventListener && $window.addEventListener('storage', function(event) {
                            if (storageKeyPrefix === event.key.slice(0, prefixLength)) {
                                event.newValue ? $storage[event.key.slice(prefixLength)] = deserializer(event.newValue) : delete $storage[event.key.slice(prefixLength)];

                                _last$storage = angular.copy($storage);

                                $rootScope.$apply();
                            }
                        });

                        $window.addEventListener && $window.addEventListener('beforeunload', function() {
                            $storage.$sync();
                        });

                        return $storage;
                    }
                ];
            };
        }

    }));
