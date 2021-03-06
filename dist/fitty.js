/*
 * fitty v1.0.0 - Fits text in parent container
 * Copyright (c) 2017 undefined - https://github.com/rikschennink/fitty#readme
 */
(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['module', 'exports'], factory);
	} else if (typeof exports !== "undefined") {
		factory(module, exports);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod, mod.exports);
		global.fitty = mod.exports;
	}
})(this, function (module, exports) {
	'use strict';

	exports.__esModule = true;
	exports['default'] = fitty;

	var _extends = Object.assign || function (target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];

			for (var key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) {
					target[key] = source[key];
				}
			}
		}

		return target;
	};

	var addEvent = function addEvent(element, type, cb) {
		if (element.addEventListener) {
			element.addEventListener(type, cb);
		} else {
			element.attachEvent('on' + type, cb);
		}
	};

	var removeEvent = function removeEvent(element, type, cb) {
		if (element.removeEventListener) {
			element.removeEventListener(type, cb);
		} else {
			element.detachEvent('on' + type, cb);
		}
	};

	function fitty(target) {
		var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


		// if target is a string, treat it as a querySelector
		if (typeof target === 'string' && 'querySelectorAll' in document) {
			var nodeList = document.querySelectorAll(target);
			for (var i = 0; i < nodeList.length; i++) {
				fitty(nodeList[i], options);
			}
			return;
		}

		// set options object
		options = _extends({
			overflowSize: 500,
			rescaleDelay: 100,
			observeWindow: true,
			observeMutations: 'MutationObserver' in window
		}, options);

		// content of target element cannot wrap
		target.style.whiteSpace = 'nowrap';

		// overflow available space on purpose, then calculate fitting size
		var scale = function scale(el) {
			el.style.fontSize = options.overflowSize + 'px';
			el.style.fontSize = el.parentNode.offsetWidth / el.scrollWidth * options.overflowSize + 'px';
		};

		// initial contain
		scale(target);

		// should we observe the window?
		var rescale = null;
		if (options.observeWindow) {

			// We can rescale when window is resized! \o/
			var scaleTimeout = void 0;
			rescale = function rescale() {
				clearTimeout(scaleTimeout);
				scaleTimeout = setTimeout(function () {
					scale(target);
				}, options.rescaleDelay);
			};
			addEvent(window, 'resize', rescale);
			addEvent(window, 'orientationchange', rescale);
		}

		// should we observe dom mutations
		var observer = void 0;
		if (options.observeMutations) {

			// We can rescale when content changes! \o/
			observer = new MutationObserver(function (mutations) {
				mutations.forEach(function () {
					scale(target);
				});
			});

			observer.observe(target, {
				subtree: true,
				childList: true,
				characterData: true
			});
		}

		// expose API
		return {
			refit: function refit() {
				scale(target);
			},
			destroy: function destroy() {

				if (options.observeWindow) {
					removeEvent(window, 'resize', rescale);
				}

				if (options.observeMutations) {
					observer.disconnect();
				}

				target.style.fontSize = '';
			}
		};
	};
	module.exports = exports['default'];
});