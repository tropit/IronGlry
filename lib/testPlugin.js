var Test = angular.module('test', []);
Test.factory('testA', function($templateRequest, $compile){
    console.log("A");

    return {
        scope:true,
        link: function(scope, element, attrs) {
            $templateRequest("../modal.html").then(function(html){
                var template = angular.element(html);
                element.append(template);
                $compile(template)(scope);
            });
        }
    };
});

Test.directive('test',function($http, $compile){
    return{
        redirect: "A",
        scope: false,
        link: function(scope,element){
            $http.get("index.html")
                .success(function (response) {
                    element.append($compile(response)(scope));
                    });
        }

    };


});

