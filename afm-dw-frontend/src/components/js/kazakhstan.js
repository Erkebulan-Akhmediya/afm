/* eslint no-undef: "off"*/
const usa = require('./json/Kazakhstan.json');
// eslint-disable-next-line
!function(e,o){"function"==typeof define&&define.amd?define(["exports","echarts"],o):"object"==typeof exports&&"string"!=typeof exports.nodeName?o(exports,require("echarts")):o({},e.echarts)}(this,function(e,o){var t=function(e){"undefined"!=typeof console&&console&&console.error&&console.error(e)};o?o.registerMap?o.registerMap('Kazakhstan', usa):t("ECharts Map is not loaded"):t("ECharts is not Loaded")});