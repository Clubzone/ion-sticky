angular.module('ion-sticky', ['ionic'])
    .directive('ionSticky', ['$ionicPosition', '$compile', '$timeout', function ($ionicPosition, $compile, $timeout) {
        return {
            restrict: 'A',
            require: '^$ionicScroll',
            link: function ($scope, $element, $attr, $ionicScroll) {
                var scroll = angular.element($ionicScroll.element);
                var clone;
                var cloneVal = function (original, to) {
                    var my_textareas = original.getElementsByTagName('textarea');
                    var result_textareas = to.getElementsByTagName('textarea');
                    var my_selects = original.getElementsByTagName('select');
                    var result_selects = to.getElementsByTagName('select');
                    for (var i = 0, l = my_textareas.length; i < l; ++i)
                        result_textareas[i].value = my_textareas[i].value;
                    for (var i = 0, l = my_selects.length; i < l; ++i)
                        result_selects[i].value = my_selects[i].value;
                };
                // creates the sticky divider clone and adds it to DOM
                var createStickyClone = function ($element) {
                    clone = $element.clone().css({
                        position: 'absolute',
                        transform: 'translate3d(0,' + $ionicPosition.position(scroll).top + 'px,0)', // put to top
                        left: 0,
                        right: 0
                    });
                    $attr.ionStickyClass = ($attr.ionStickyClass) ? $attr.ionStickyClass : 'assertive';
                    cloneVal($element[0], clone[0]);
                    clone[0].className += ' ' + $attr.ionStickyClass;

                    clone.removeAttr('ng-repeat-start').removeAttr('ng-if');

                    scroll.parent().append(clone);

                    // hide existing element
                    $element[0].style.opacity = 0;

                    $timeout(function() {
                      $element[0].style.opacity = 1;
                    }, 1500);

                    // compile the clone so that anything in it is in Angular lifecycle.
                    $compile(clone)($scope);
                };

                var removeStickyClone = function () {
                    if (clone) {
                        clone.remove();
                    }
                    clone = null;
                };

                $scope.$on("$destroy", function () {
                    // remove the clone and unbind the scroll listener
                    removeStickyClone();
                    angular.element($ionicScroll.element).off('scroll');
                });

                var lastActive;
                var minHeight = $attr.minHeight ? $attr.minHeight : 0;
                var updateSticky = ionic.throttle(function () {
                    //console.log(performance.now());
                    var active = null;
                    var dividers = [];

                    var tmp = $element[0].getElementsByClassName("item-divider");

                    for (var i = 0; i < tmp.length; ++i) dividers.push(angular.element(tmp[i]));
                    for (var i = 0; i < dividers.length; ++i) { // can be changed to binary search

                        var scrollTop = $ionicPosition.position(scroll).top;
                        var dividerTop = $ionicPosition.offset(dividers[i]).top;
                        var dividerHeight = dividers[i].prop('offsetHeight');

                        if (dividerTop < 95 + dividerHeight) {
                            //  if is uppermost divider and its formers divider top-offset minus its height (40) plus the height of the next divider (40) are > 0 make it active                (dividers[i].prop('offsetHeight') + dividers[i + 1].prop('offsetHeight'))
                            if (i === dividers.length - 1 || $ionicPosition.offset(dividers[i + 1]).top - 95 > 0) {

                                if (dividerTop <= scrollTop) {
                                    active = dividers[i][0];
                                    break;
                                }

                                if (i !== 0 && dividerTop < 95 && dividerTop > 0) {
                                    if (clone) {
                                        angular.element(clone)[0].style.transform = 'translate3d(0,' + (dividerTop - 40) + 'px,0)';
                                    }

                                    active = lastActive ? lastActive : dividers[i][0];
                                }

                            }

                        }

                    }

                    for (var i = 0; i < dividers.length; ++i) {
                        var dividerTop = $ionicPosition.offset(dividers[i]).top;
                        if (dividerTop > 95 && dividerTop < 300) {
                            if (clone) {
                                angular.element(clone)[0].style.transform = 'translate3d(0,59px,0)';
                            }
                        }
                    }

                    if (lastActive != active) {
                        removeStickyClone();
                        if (active != null) {
                            createStickyClone(angular.element(active));
                        }
                        lastActive = active;
                        //if (active != null)
                        //  createStickyClone(angular.element(active));
                    }
                    //console.log(performance.now());
                }, 100);

                scroll.on('scroll', function (event) {
                    updateSticky();
                });
            }
        }
    }]);
