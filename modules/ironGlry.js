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

        // Defines scopes includes localStroage
        $scope.searchVal = $localStorage.searchVal;
        $scope.onPagePics = [];
        $scope.currentPage = $localStorage.currentPage || 1;
        $scope.maxSize = 5;
        $scope.sortProp = $localStorage.sortProp || 'title';
        $scope.search = $scope.search || true;
        $scope.pagination = $scope.pagination || true;
        $scope.numPerPage = $localStorage.numPerPage || $scope.resultsPerPage || 10;
        $scope.sorting = $scope.sorting || true;
        // check if inter are valid ( exsits and number)
        if($scope.myInterval==null||!(/^\d+$/.test($scope.myInterval)))
            $scope.myInterval = 4000;
        $scope.imagesOverBool = [];
        $scope.slideShowMode = false;
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
            }
            $scope.pushOverBool = function (index) {
                $scope.imagesOverBool[index] = false;
            }
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
