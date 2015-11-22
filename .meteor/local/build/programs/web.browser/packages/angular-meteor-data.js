//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var Session = Package.session.Session;
var Mongo = Package.mongo.Mongo;
var EJSON = Package.ejson.EJSON;
var check = Package.check.check;
var Match = Package.check.Match;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var ObserveSequence = Package['observe-sequence'].ObserveSequence;
var DiffSequence = Package['diff-sequence'].DiffSequence;
var MongoID = Package['mongo-id'].MongoID;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/angular-meteor-data/lib/diff-array.js                                                             //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
'use strict';                                                                                                 // 1
                                                                                                              // 2
var module = angular.module('diffArray', ['getUpdates']);                                                     // 3
                                                                                                              // 4
module.factory('diffArray', ['getUpdates',                                                                    // 5
  function(getUpdates) {                                                                                      // 6
    var LocalCollection = Package['minimongo'].LocalCollection;                                               // 7
    var idStringify = LocalCollection._idStringify || Package['mongo-id'].MongoID.idStringify;                // 8
    var idParse = LocalCollection._idParse || Package['mongo-id'].MongoID.idParse;                            // 9
                                                                                                              // 10
    // Calculates the differences between `lastSeqArray` and                                                  // 11
    // `seqArray` and calls appropriate functions from `callbacks`.                                           // 12
    // Reuses Minimongo's diff algorithm implementation.                                                      // 13
    // XXX Should be replaced with the original diffArray function here:                                      // 14
    // https://github.com/meteor/meteor/blob/devel/packages/observe-sequence/observe_sequence.js#L152         // 15
    // When it will become nested as well, tracking here: https://github.com/meteor/meteor/issues/3764        // 16
    function diffArray(lastSeqArray, seqArray, callbacks, preventNestedDiff) {                                // 17
      preventNestedDiff = !!preventNestedDiff;                                                                // 18
                                                                                                              // 19
      var diffFn = Package.minimongo.LocalCollection._diffQueryOrderedChanges ||                              // 20
        Package['diff-sequence'].DiffSequence.diffQueryOrderedChanges;                                        // 21
                                                                                                              // 22
      var oldObjIds = [];                                                                                     // 23
      var newObjIds = [];                                                                                     // 24
      var posOld = {}; // maps from idStringify'd ids                                                         // 25
      var posNew = {}; // ditto                                                                               // 26
      var posCur = {};                                                                                        // 27
      var lengthCur = lastSeqArray.length;                                                                    // 28
                                                                                                              // 29
      _.each(seqArray, function (doc, i) {                                                                    // 30
        newObjIds.push({_id: doc._id});                                                                       // 31
        posNew[idStringify(doc._id)] = i;                                                                     // 32
      });                                                                                                     // 33
                                                                                                              // 34
      _.each(lastSeqArray, function (doc, i) {                                                                // 35
        oldObjIds.push({_id: doc._id});                                                                       // 36
        posOld[idStringify(doc._id)] = i;                                                                     // 37
        posCur[idStringify(doc._id)] = i;                                                                     // 38
      });                                                                                                     // 39
                                                                                                              // 40
      // Arrays can contain arbitrary objects. We don't diff the                                              // 41
      // objects. Instead we always fire 'changedAt' callback on every                                        // 42
      // object. The consumer of `observe-sequence` should deal with                                          // 43
      // it appropriately.                                                                                    // 44
      diffFn(oldObjIds, newObjIds, {                                                                          // 45
        addedBefore: function (id, doc, before) {                                                             // 46
          var position = before ? posCur[idStringify(before)] : lengthCur;                                    // 47
                                                                                                              // 48
          _.each(posCur, function (pos, id) {                                                                 // 49
            if (pos >= position) posCur[id]++;                                                                // 50
          });                                                                                                 // 51
                                                                                                              // 52
          lengthCur++;                                                                                        // 53
          posCur[idStringify(id)] = position;                                                                 // 54
                                                                                                              // 55
          callbacks.addedAt(                                                                                  // 56
            id,                                                                                               // 57
            seqArray[posNew[idStringify(id)]],                                                                // 58
            position,                                                                                         // 59
            before                                                                                            // 60
          );                                                                                                  // 61
        },                                                                                                    // 62
                                                                                                              // 63
        movedBefore: function (id, before) {                                                                  // 64
          var prevPosition = posCur[idStringify(id)];                                                         // 65
          var position = before ? posCur[idStringify(before)] : lengthCur - 1;                                // 66
                                                                                                              // 67
          _.each(posCur, function (pos, id) {                                                                 // 68
            if (pos >= prevPosition && pos <= position)                                                       // 69
              posCur[id]--;                                                                                   // 70
            else if (pos <= prevPosition && pos >= position)                                                  // 71
              posCur[id]++;                                                                                   // 72
          });                                                                                                 // 73
                                                                                                              // 74
          posCur[idStringify(id)] = position;                                                                 // 75
                                                                                                              // 76
          callbacks.movedTo(                                                                                  // 77
            id,                                                                                               // 78
            seqArray[posNew[idStringify(id)]],                                                                // 79
            prevPosition,                                                                                     // 80
            position,                                                                                         // 81
            before                                                                                            // 82
          );                                                                                                  // 83
        },                                                                                                    // 84
        removed: function (id) {                                                                              // 85
          var prevPosition = posCur[idStringify(id)];                                                         // 86
                                                                                                              // 87
          _.each(posCur, function (pos, id) {                                                                 // 88
            if (pos >= prevPosition) posCur[id]--;                                                            // 89
          });                                                                                                 // 90
                                                                                                              // 91
          delete posCur[idStringify(id)];                                                                     // 92
          lengthCur--;                                                                                        // 93
                                                                                                              // 94
          callbacks.removedAt(                                                                                // 95
            id,                                                                                               // 96
            lastSeqArray[posOld[idStringify(id)]],                                                            // 97
            prevPosition                                                                                      // 98
          );                                                                                                  // 99
        }                                                                                                     // 100
      });                                                                                                     // 101
                                                                                                              // 102
      _.each(posNew, function (pos, idString) {                                                               // 103
        if (!_.has(posOld, idString)) return;                                                                 // 104
                                                                                                              // 105
        var id = idParse(idString);                                                                           // 106
        var newItem = seqArray[pos] || {};                                                                    // 107
        var oldItem = lastSeqArray[posOld[idString]];                                                         // 108
        var updates = getUpdates(oldItem, newItem, preventNestedDiff);                                        // 109
                                                                                                              // 110
        if (!_.isEmpty(updates))                                                                              // 111
          callbacks.changedAt(id, updates, pos, oldItem);                                                     // 112
      });                                                                                                     // 113
    }                                                                                                         // 114
                                                                                                              // 115
    diffArray.deepCopyChanges = function (oldItem, newItem) {                                                 // 116
      var setDiff = getUpdates(oldItem, newItem).$set;                                                        // 117
                                                                                                              // 118
      _.each(setDiff, function(v, deepKey) {                                                                  // 119
        setDeep(oldItem, deepKey, v);                                                                         // 120
      });                                                                                                     // 121
    };                                                                                                        // 122
                                                                                                              // 123
    diffArray.deepCopyRemovals = function (oldItem, newItem) {                                                // 124
      var unsetDiff = getUpdates(oldItem, newItem).$unset;                                                    // 125
                                                                                                              // 126
      _.each(unsetDiff, function(v, deepKey) {                                                                // 127
        unsetDeep(oldItem, deepKey);                                                                          // 128
      });                                                                                                     // 129
    };                                                                                                        // 130
                                                                                                              // 131
    var setDeep = function(obj, deepKey, v) {                                                                 // 132
      var split = deepKey.split('.');                                                                         // 133
      var initialKeys = _.initial(split);                                                                     // 134
      var lastKey = _.last(split);                                                                            // 135
                                                                                                              // 136
      initialKeys.reduce(function(subObj, k, i) {                                                             // 137
        var nextKey = split[i + 1];                                                                           // 138
                                                                                                              // 139
        if (isNumStr(nextKey)) {                                                                              // 140
          if (subObj[k] == null) subObj[k] = [];                                                              // 141
          if (subObj[k].length == parseInt(nextKey)) subObj[k].push(null);                                    // 142
        }                                                                                                     // 143
                                                                                                              // 144
        else if (subObj[k] == null || !isHash(subObj[k])) {                                                   // 145
          subObj[k] = {};                                                                                     // 146
        }                                                                                                     // 147
                                                                                                              // 148
        return subObj[k];                                                                                     // 149
      }, obj);                                                                                                // 150
                                                                                                              // 151
      var deepObj = getDeep(obj, initialKeys);                                                                // 152
      deepObj[lastKey] = v;                                                                                   // 153
      return v;                                                                                               // 154
    };                                                                                                        // 155
                                                                                                              // 156
    var unsetDeep = function(obj, deepKey) {                                                                  // 157
      var split = deepKey.split('.');                                                                         // 158
      var initialKeys = _.initial(split);                                                                     // 159
      var lastKey = _.last(split);                                                                            // 160
      var deepObj = getDeep(obj, initialKeys);                                                                // 161
                                                                                                              // 162
      if (_.isArray(deepObj) && isNumStr(lastKey))                                                            // 163
        return !!deepObj.splice(lastKey, 1);                                                                  // 164
      else                                                                                                    // 165
        return delete deepObj[lastKey];                                                                       // 166
    };                                                                                                        // 167
                                                                                                              // 168
    var getDeep = function(obj, keys) {                                                                       // 169
      return keys.reduce(function(subObj, k) {                                                                // 170
        return subObj[k];                                                                                     // 171
      }, obj);                                                                                                // 172
    };                                                                                                        // 173
                                                                                                              // 174
    var isHash = function(obj) {                                                                              // 175
      return _.isObject(obj) &&                                                                               // 176
             Object.getPrototypeOf(obj) === Object.prototype;                                                 // 177
    };                                                                                                        // 178
                                                                                                              // 179
    var isNumStr = function(str) {                                                                            // 180
      return str.match(/^\d+$/);                                                                              // 181
    };                                                                                                        // 182
                                                                                                              // 183
    return diffArray;                                                                                         // 184
}]);                                                                                                          // 185
                                                                                                              // 186
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/angular-meteor-data/lib/get-updates.js                                                            //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
'use strict';                                                                                                 // 1
                                                                                                              // 2
// https://github.com/DAB0mB/get-updates                                                                      // 3
(function() {                                                                                                 // 4
  var module = angular.module('getUpdates', []);                                                              // 5
                                                                                                              // 6
  var utils = (function() {                                                                                   // 7
    var rip = function(obj, level) {                                                                          // 8
      if (level < 1) return {};                                                                               // 9
                                                                                                              // 10
      return _.reduce(obj, function(clone, v, k) {                                                            // 11
        v = _.isObject(v) ? rip(v, --level) : v;                                                              // 12
        clone[k] = v;                                                                                         // 13
        return clone;                                                                                         // 14
      }, {});                                                                                                 // 15
    };                                                                                                        // 16
                                                                                                              // 17
    var toPaths = function(obj) {                                                                             // 18
      var keys = getKeyPaths(obj);                                                                            // 19
      var values = getDeepValues(obj);                                                                        // 20
      return _.object(keys, values);                                                                          // 21
    };                                                                                                        // 22
                                                                                                              // 23
    var getKeyPaths = function(obj) {                                                                         // 24
      var keys = _.keys(obj).map(function(k) {                                                                // 25
        var v = obj[k];                                                                                       // 26
        if (!_.isObject(v) || _.isEmpty(v) || _.isArray(v)) return k;                                         // 27
                                                                                                              // 28
        return getKeyPaths(v).map(function(subKey) {                                                          // 29
          return k + '.' + subKey;                                                                            // 30
        });                                                                                                   // 31
      });                                                                                                     // 32
                                                                                                              // 33
      return _.flatten(keys);                                                                                 // 34
    };                                                                                                        // 35
                                                                                                              // 36
    var getDeepValues = function(obj,arr) {                                                                   // 37
      arr = arr || [];                                                                                        // 38
                                                                                                              // 39
      _.values(obj).forEach(function(v) {                                                                     // 40
        if (!_.isObject(v) || _.isEmpty(v) || _.isArray(v))                                                   // 41
          arr.push(v);                                                                                        // 42
        else                                                                                                  // 43
          getDeepValues(v, arr);                                                                              // 44
      });                                                                                                     // 45
                                                                                                              // 46
      return arr;                                                                                             // 47
    };                                                                                                        // 48
                                                                                                              // 49
    var flatten = function(arr) {                                                                             // 50
      return arr.reduce(function(flattened, v, i) {                                                           // 51
        if (_.isArray(v) && !_.isEmpty(v))                                                                    // 52
          flattened.push.apply(flattened, flatten(v));                                                        // 53
        else                                                                                                  // 54
          flattened.push(v);                                                                                  // 55
                                                                                                              // 56
        return flattened;                                                                                     // 57
      }, []);                                                                                                 // 58
    };                                                                                                        // 59
                                                                                                              // 60
    var setFilled = function(obj, k, v) {                                                                     // 61
      if (!_.isEmpty(v)) obj[k] = v;                                                                          // 62
    };                                                                                                        // 63
                                                                                                              // 64
    var assert = function(result, msg) {                                                                      // 65
      if (!result) throwErr(msg);                                                                             // 66
    };                                                                                                        // 67
                                                                                                              // 68
    var throwErr = function(msg) {                                                                            // 69
      throw Error('get-updates error - ' + msg);                                                              // 70
    };                                                                                                        // 71
                                                                                                              // 72
    return {                                                                                                  // 73
      rip: rip,                                                                                               // 74
      toPaths: toPaths,                                                                                       // 75
      getKeyPaths: getKeyPaths,                                                                               // 76
      getDeepValues: getDeepValues,                                                                           // 77
      setFilled: setFilled,                                                                                   // 78
      assert: assert,                                                                                         // 79
      throwErr: throwErr                                                                                      // 80
    };                                                                                                        // 81
  })();                                                                                                       // 82
                                                                                                              // 83
  var getDifference = (function() {                                                                           // 84
    var getDifference = function(src, dst, isShallow) {                                                       // 85
      var level;                                                                                              // 86
                                                                                                              // 87
      if (isShallow > 1)                                                                                      // 88
        level = isShallow;                                                                                    // 89
      else if (isShallow)                                                                                     // 90
        level = 1;                                                                                            // 91
                                                                                                              // 92
      if (level) {                                                                                            // 93
        src = utils.rip(src, level);                                                                          // 94
        dst = utils.rip(dst, level);                                                                          // 95
      }                                                                                                       // 96
                                                                                                              // 97
      return compare(src, dst);                                                                               // 98
    };                                                                                                        // 99
                                                                                                              // 100
    var compare = function(src, dst) {                                                                        // 101
      var srcKeys = _.keys(src);                                                                              // 102
      var dstKeys = _.keys(dst);                                                                              // 103
                                                                                                              // 104
      var keys = _.chain([])                                                                                  // 105
        .concat(srcKeys)                                                                                      // 106
        .concat(dstKeys)                                                                                      // 107
        .uniq()                                                                                               // 108
        .without('$$hashKey')                                                                                 // 109
        .value();                                                                                             // 110
                                                                                                              // 111
      return keys.reduce(function(diff, k) {                                                                  // 112
        var srcValue = src[k];                                                                                // 113
        var dstValue = dst[k];                                                                                // 114
                                                                                                              // 115
        if (_.isDate(srcValue) && _.isDate(dstValue)) {                                                       // 116
          if (srcValue.getTime() != dstValue.getTime()) diff[k] = dstValue;                                   // 117
        }                                                                                                     // 118
                                                                                                              // 119
        if (_.isObject(srcValue) && _.isObject(dstValue)) {                                                   // 120
          var valueDiff = getDifference(srcValue, dstValue);                                                  // 121
          utils.setFilled(diff, k, valueDiff);                                                                // 122
        }                                                                                                     // 123
                                                                                                              // 124
        else if (srcValue !== dstValue) {                                                                     // 125
          diff[k] = dstValue;                                                                                 // 126
        }                                                                                                     // 127
                                                                                                              // 128
        return diff;                                                                                          // 129
      }, {});                                                                                                 // 130
    };                                                                                                        // 131
                                                                                                              // 132
    return getDifference;                                                                                     // 133
  })();                                                                                                       // 134
                                                                                                              // 135
  var getUpdates = (function() {                                                                              // 136
    var getUpdates = function(src, dst, isShallow) {                                                          // 137
      utils.assert(_.isObject(src), 'first argument must be an object');                                      // 138
      utils.assert(_.isObject(dst), 'second argument must be an object');                                     // 139
                                                                                                              // 140
      var diff = getDifference(src, dst, isShallow);                                                          // 141
      var paths = utils.toPaths(diff);                                                                        // 142
                                                                                                              // 143
      var set = createSet(paths);                                                                             // 144
      var unset = createUnset(paths);                                                                         // 145
      var pull = createPull(unset);                                                                           // 146
                                                                                                              // 147
      var updates = {};                                                                                       // 148
      utils.setFilled(updates, '$set', set);                                                                  // 149
      utils.setFilled(updates, '$unset', unset);                                                              // 150
      utils.setFilled(updates, '$pull', pull);                                                                // 151
                                                                                                              // 152
      return updates;                                                                                         // 153
    };                                                                                                        // 154
                                                                                                              // 155
    var createSet = function(paths) {                                                                         // 156
      var undefinedKeys = getUndefinedKeys(paths);                                                            // 157
      return _.omit(paths, undefinedKeys);                                                                    // 158
    };                                                                                                        // 159
                                                                                                              // 160
    var createUnset = function(paths) {                                                                       // 161
      var undefinedKeys = getUndefinedKeys(paths);                                                            // 162
      var unset = _.pick(paths, undefinedKeys);                                                               // 163
                                                                                                              // 164
      return _.reduce(unset, function(result, v, k) {                                                         // 165
        result[k] = true;                                                                                     // 166
        return result;                                                                                        // 167
      }, {});                                                                                                 // 168
    };                                                                                                        // 169
                                                                                                              // 170
    var createPull = function(unset) {                                                                        // 171
      var arrKeyPaths = _.keys(unset).map(function(k) {                                                       // 172
        var split = k.match(/(.*)\.\d+$/);                                                                    // 173
        return split && split[1];                                                                             // 174
      });                                                                                                     // 175
                                                                                                              // 176
      return _.compact(arrKeyPaths).reduce(function(pull, k) {                                                // 177
        pull[k] = null;                                                                                       // 178
        return pull;                                                                                          // 179
      }, {});                                                                                                 // 180
    };                                                                                                        // 181
                                                                                                              // 182
    var getUndefinedKeys = function(obj) {                                                                    // 183
      return _.keys(obj).filter(function (k) {                                                                // 184
        var v = obj[k];                                                                                       // 185
        return _.isUndefined(v);                                                                              // 186
      });                                                                                                     // 187
    };                                                                                                        // 188
                                                                                                              // 189
    return getUpdates;                                                                                        // 190
  })();                                                                                                       // 191
                                                                                                              // 192
  module.value('getUpdates', getUpdates);                                                                     // 193
})();                                                                                                         // 194
                                                                                                              // 195
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/angular-meteor-data/modules/angular-meteor-subscribe.js                                           //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
'use strict';                                                                                                 // 1
var angularMeteorSubscribe = angular.module('angular-meteor.subscribe', []);                                  // 2
                                                                                                              // 3
angularMeteorSubscribe.service('$meteorSubscribe', ['$q',                                                     // 4
  function ($q) {                                                                                             // 5
    var self = this;                                                                                          // 6
                                                                                                              // 7
    this._subscribe = function(scope, deferred, args) {                                                       // 8
      var subscription = null;                                                                                // 9
      var lastArg = args[args.length - 1];                                                                    // 10
                                                                                                              // 11
      // User supplied onStop callback                                                                        // 12
      // save it for later use and remove                                                                     // 13
      // from subscription arguments                                                                          // 14
      if (angular.isObject(lastArg) &&                                                                        // 15
          angular.isFunction(lastArg.onStop)) {                                                               // 16
        var onStop = lastArg.onStop;                                                                          // 17
                                                                                                              // 18
        args.pop();                                                                                           // 19
      }                                                                                                       // 20
                                                                                                              // 21
      args.push({                                                                                             // 22
        onReady: function() {                                                                                 // 23
          deferred.resolve(subscription);                                                                     // 24
        },                                                                                                    // 25
        onStop: function(err) {                                                                               // 26
          if (!deferred.promise.$$state.status) {                                                             // 27
            if (err)                                                                                          // 28
              deferred.reject(err);                                                                           // 29
            else                                                                                              // 30
              deferred.reject(new Meteor.Error("Subscription Stopped",                                        // 31
                "Subscription stopped by a call to stop method. Either by the client or by the server."));    // 32
          } else if (onStop)                                                                                  // 33
            // After promise was resolved or rejected                                                         // 34
            // call user supplied onStop callback.                                                            // 35
            onStop.apply(this, Array.prototype.slice.call(arguments));                                        // 36
                                                                                                              // 37
        }                                                                                                     // 38
      });                                                                                                     // 39
                                                                                                              // 40
      subscription =  Meteor.subscribe.apply(scope, args);                                                    // 41
                                                                                                              // 42
      return subscription;                                                                                    // 43
    };                                                                                                        // 44
                                                                                                              // 45
    this.subscribe = function(){                                                                              // 46
      var deferred = $q.defer();                                                                              // 47
      var args = Array.prototype.slice.call(arguments);                                                       // 48
      var subscription = null;                                                                                // 49
                                                                                                              // 50
      self._subscribe(this, deferred, args);                                                                  // 51
                                                                                                              // 52
      return deferred.promise;                                                                                // 53
    };                                                                                                        // 54
  }]);                                                                                                        // 55
                                                                                                              // 56
angularMeteorSubscribe.run(['$rootScope', '$q', '$meteorSubscribe',                                           // 57
  function($rootScope, $q, $meteorSubscribe) {                                                                // 58
    Object.getPrototypeOf($rootScope).$meteorSubscribe = function() {                                         // 59
      var deferred = $q.defer();                                                                              // 60
      var args = Array.prototype.slice.call(arguments);                                                       // 61
                                                                                                              // 62
      var subscription = $meteorSubscribe._subscribe(this, deferred, args);                                   // 63
                                                                                                              // 64
      this.$on('$destroy', function() {                                                                       // 65
        subscription.stop();                                                                                  // 66
      });                                                                                                     // 67
                                                                                                              // 68
      return deferred.promise;                                                                                // 69
    };                                                                                                        // 70
}]);                                                                                                          // 71
                                                                                                              // 72
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/angular-meteor-data/modules/angular-meteor-stopper.js                                             //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
'use strict';                                                                                                 // 1
                                                                                                              // 2
var angularMeteorStopper = angular.module('angular-meteor.stopper',                                           // 3
  ['angular-meteor.subscribe']);                                                                              // 4
                                                                                                              // 5
angularMeteorStopper.factory('$meteorStopper', ['$q', '$meteorSubscribe',                                     // 6
  function($q, $meteorSubscribe) {                                                                            // 7
    function $meteorStopper($meteorEntity) {                                                                  // 8
      return function() {                                                                                     // 9
        var args = Array.prototype.slice.call(arguments);                                                     // 10
        var meteorEntity = $meteorEntity.apply(this, args);                                                   // 11
                                                                                                              // 12
        angular.extend(meteorEntity, $meteorStopper);                                                         // 13
        meteorEntity.$$scope = this;                                                                          // 14
                                                                                                              // 15
        this.$on('$destroy', function () {                                                                    // 16
          meteorEntity.stop();                                                                                // 17
          if (meteorEntity.subscription) meteorEntity.subscription.stop();                                    // 18
        });                                                                                                   // 19
                                                                                                              // 20
        return meteorEntity;                                                                                  // 21
      };                                                                                                      // 22
    }                                                                                                         // 23
                                                                                                              // 24
    $meteorStopper.subscribe = function() {                                                                   // 25
      var args = Array.prototype.slice.call(arguments);                                                       // 26
      this.subscription = $meteorSubscribe._subscribe(this.$$scope, $q.defer(), args);                        // 27
      return this;                                                                                            // 28
    };                                                                                                        // 29
                                                                                                              // 30
    return $meteorStopper;                                                                                    // 31
}]);                                                                                                          // 32
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/angular-meteor-data/modules/angular-meteor-collection.js                                          //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
'use strict';                                                                                                 // 1
                                                                                                              // 2
var angularMeteorCollection = angular.module('angular-meteor.collection',                                     // 3
  ['angular-meteor.stopper', 'angular-meteor.subscribe', 'angular-meteor.utils', 'diffArray']);               // 4
                                                                                                              // 5
// The reason angular meteor collection is a factory function and not something                               // 6
// that inherit from array comes from here:                                                                   // 7
// http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/                     // 8
// We went with the direct extensions approach.                                                               // 9
angularMeteorCollection.factory('AngularMeteorCollection', [                                                  // 10
  '$q', '$meteorSubscribe', '$meteorUtils', '$rootScope', '$timeout', 'diffArray',                            // 11
  function($q, $meteorSubscribe, $meteorUtils, $rootScope, $timeout, diffArray) {                             // 12
    function AngularMeteorCollection(curDefFunc, collection, diffArrayFunc, autoClientSave) {                 // 13
      var data = [];                                                                                          // 14
      // Server backup data to evaluate what changes come from client                                         // 15
      // after each server update.                                                                            // 16
      data._serverBackup = [];                                                                                // 17
      // Array differ function.                                                                               // 18
      data._diffArrayFunc = diffArrayFunc;                                                                    // 19
      // Handler of the cursor observer.                                                                      // 20
      data._hObserve = null;                                                                                  // 21
      // On new cursor autorun handler                                                                        // 22
      // (autorun for reactive variables).                                                                    // 23
      data._hNewCurAutorun = null;                                                                            // 24
      // On new data autorun handler                                                                          // 25
      // (autorun for cursor.fetch).                                                                          // 26
      data._hDataAutorun = null;                                                                              // 27
                                                                                                              // 28
      if (angular.isDefined(collection)) {                                                                    // 29
        data.$$collection = collection;                                                                       // 30
      } else {                                                                                                // 31
        var cursor = curDefFunc();                                                                            // 32
        data.$$collection = $meteorUtils.getCollectionByName(cursor.collection.name);                         // 33
      }                                                                                                       // 34
                                                                                                              // 35
      angular.extend(data, AngularMeteorCollection);                                                          // 36
      data._startCurAutorun(curDefFunc, autoClientSave);                                                      // 37
                                                                                                              // 38
      return data;                                                                                            // 39
    }                                                                                                         // 40
                                                                                                              // 41
    AngularMeteorCollection._startCurAutorun = function(curDefFunc, autoClientSave) {                         // 42
      var self = this;                                                                                        // 43
      self._hNewCurAutorun = Tracker.autorun(function() {                                                     // 44
        // When the reactive func gets recomputated we need to stop any previous                              // 45
        // observeChanges.                                                                                    // 46
        Tracker.onInvalidate(function() {                                                                     // 47
          self._stopCursor();                                                                                 // 48
        });                                                                                                   // 49
        if (autoClientSave) {                                                                                 // 50
          self._setAutoClientSave();                                                                          // 51
        }                                                                                                     // 52
        self._updateCursor(curDefFunc(), autoClientSave);                                                     // 53
      });                                                                                                     // 54
    };                                                                                                        // 55
                                                                                                              // 56
    AngularMeteorCollection.subscribe = function() {                                                          // 57
      $meteorSubscribe.subscribe.apply(this, arguments);                                                      // 58
      return this;                                                                                            // 59
    };                                                                                                        // 60
                                                                                                              // 61
    AngularMeteorCollection.save = function(docs, useUnsetModifier) {                                         // 62
      // save whole collection                                                                                // 63
      if (!docs) docs = this;                                                                                 // 64
      // save single doc                                                                                      // 65
      docs = [].concat(docs);                                                                                 // 66
                                                                                                              // 67
      var promises = docs.map(function(doc) {                                                                 // 68
        return this._upsertDoc(doc, useUnsetModifier);                                                        // 69
      }, this);                                                                                               // 70
                                                                                                              // 71
      var allPromise = $q.all(promises);                                                                      // 72
                                                                                                              // 73
      allPromise.finally(function() {                                                                         // 74
        // calls digestion loop with no conflicts                                                             // 75
        $timeout(angular.noop);                                                                               // 76
      });                                                                                                     // 77
                                                                                                              // 78
      return allPromise;                                                                                      // 79
    };                                                                                                        // 80
                                                                                                              // 81
    AngularMeteorCollection._upsertDoc = function(doc, useUnsetModifier) {                                    // 82
      var deferred = $q.defer();                                                                              // 83
      var collection = this.$$collection;                                                                     // 84
      var createFulfill = _.partial($meteorUtils.fulfill, deferred, null);                                    // 85
                                                                                                              // 86
      // delete $$hashkey                                                                                     // 87
      doc = $meteorUtils.stripDollarPrefixedKeys(doc);                                                        // 88
      var docId = doc._id;                                                                                    // 89
      var isExist = collection.findOne(docId);                                                                // 90
                                                                                                              // 91
      // update                                                                                               // 92
      if (isExist) {                                                                                          // 93
        // Deletes _id property (from the copy) so that                                                       // 94
        // it can be $set using update.                                                                       // 95
        delete doc._id;                                                                                       // 96
        var modifier = useUnsetModifier ? {$unset: doc} : {$set: doc};                                        // 97
        // NOTE: do not use #upsert() method, since it does not exist in some collections                     // 98
        collection.update(docId, modifier, createFulfill(function() {                                         // 99
          return {_id: docId, action: 'updated'};                                                             // 100
        }));                                                                                                  // 101
      }                                                                                                       // 102
      // insert                                                                                               // 103
      else {                                                                                                  // 104
        collection.insert(doc, createFulfill(function(id) {                                                   // 105
          return {_id: id, action: 'inserted'};                                                               // 106
        }));                                                                                                  // 107
      }                                                                                                       // 108
                                                                                                              // 109
      return deferred.promise;                                                                                // 110
    };                                                                                                        // 111
                                                                                                              // 112
    // performs $pull operations parallely.                                                                   // 113
    // used for handling splice operations returned from getUpdates() to prevent conflicts.                   // 114
    // see issue: https://github.com/Urigo/angular-meteor/issues/793                                          // 115
    AngularMeteorCollection._updateDiff = function(selector, update, callback) {                              // 116
      callback = callback || angular.noop;                                                                    // 117
      var setters = _.omit(update, '$pull');                                                                  // 118
      var updates = [setters];                                                                                // 119
                                                                                                              // 120
      _.each(update.$pull, function(pull, prop) {                                                             // 121
        var puller = {};                                                                                      // 122
        puller[prop] = pull;                                                                                  // 123
        updates.push({ $pull: puller });                                                                      // 124
      });                                                                                                     // 125
                                                                                                              // 126
      this._updateParallel(selector, updates, callback);                                                      // 127
    };                                                                                                        // 128
                                                                                                              // 129
    // performs each update operation parallely                                                               // 130
    AngularMeteorCollection._updateParallel = function(selector, updates, callback) {                         // 131
      var self = this;                                                                                        // 132
      var done = _.after(updates.length, callback);                                                           // 133
                                                                                                              // 134
      var next = function(err, affectedDocsNum) {                                                             // 135
        if (err) return callback(err);                                                                        // 136
        done(null, affectedDocsNum);                                                                          // 137
      };                                                                                                      // 138
                                                                                                              // 139
      _.each(updates, function(update) {                                                                      // 140
        self.$$collection.update(selector, update, next);                                                     // 141
      });                                                                                                     // 142
    };                                                                                                        // 143
                                                                                                              // 144
    AngularMeteorCollection.remove = function(keyOrDocs) {                                                    // 145
      var keys;                                                                                               // 146
      // remove whole collection                                                                              // 147
      if (!keyOrDocs) {                                                                                       // 148
        keys = _.pluck(this, '_id');                                                                          // 149
      } else {                                                                                                // 150
        // remove docs                                                                                        // 151
        keys = _.map([].concat(keyOrDocs), function(keyOrDoc) {                                               // 152
          return keyOrDoc._id || keyOrDoc;                                                                    // 153
        });                                                                                                   // 154
      }                                                                                                       // 155
      // Checks if all keys are correct.                                                                      // 156
      check(keys, [Match.OneOf(String, Mongo.ObjectID)]);                                                     // 157
                                                                                                              // 158
      var promises = keys.map(function(key) {                                                                 // 159
        return this._removeDoc(key);                                                                          // 160
      }, this);                                                                                               // 161
                                                                                                              // 162
      var allPromise = $q.all(promises);                                                                      // 163
                                                                                                              // 164
      allPromise.finally(function() {                                                                         // 165
        $timeout(angular.noop);                                                                               // 166
      });                                                                                                     // 167
                                                                                                              // 168
      return allPromise;                                                                                      // 169
    };                                                                                                        // 170
                                                                                                              // 171
    AngularMeteorCollection._removeDoc = function(id) {                                                       // 172
      var deferred = $q.defer();                                                                              // 173
      var collection = this.$$collection;                                                                     // 174
      var fulfill = $meteorUtils.fulfill(deferred, null, { _id: id, action: 'removed' });                     // 175
      collection.remove(id, fulfill);                                                                         // 176
      return deferred.promise;                                                                                // 177
    };                                                                                                        // 178
                                                                                                              // 179
    AngularMeteorCollection._updateCursor = function(cursor, autoClientSave) {                                // 180
      var self = this;                                                                                        // 181
                                                                                                              // 182
      // XXX - consider adding an option for a non-orderd result                                              // 183
      // for faster performance.                                                                              // 184
      if (self._hObserve) {                                                                                   // 185
        self._hObserve.stop();                                                                                // 186
        self._hDataAutorun.stop();                                                                            // 187
      }                                                                                                       // 188
                                                                                                              // 189
      var serverMode = false;                                                                                 // 190
      function setServerUpdateMode(name) {                                                                    // 191
        serverMode = true;                                                                                    // 192
        // To simplify server update logic, we don't follow                                                   // 193
        // updates from the client at the same time.                                                          // 194
        self._unsetAutoClientSave();                                                                          // 195
      }                                                                                                       // 196
                                                                                                              // 197
      var hUnsetTimeout = null;                                                                               // 198
      // Here we use $timeout to combine multiple updates that go                                             // 199
      // each one after another.                                                                              // 200
      function unsetServerUpdateMode() {                                                                      // 201
        if (hUnsetTimeout) {                                                                                  // 202
          $timeout.cancel(hUnsetTimeout);                                                                     // 203
          hUnsetTimeout = null;                                                                               // 204
        }                                                                                                     // 205
        hUnsetTimeout = $timeout(function() {                                                                 // 206
          serverMode = false;                                                                                 // 207
          // Finds updates that was potentially done from the client side                                     // 208
          // and saves them.                                                                                  // 209
          var changes = collectionUtils.diff(self, self._serverBackup,                                        // 210
            self._diffArrayFunc);                                                                             // 211
          self._saveChanges(changes);                                                                         // 212
          // After, continues following client updates.                                                       // 213
          if (autoClientSave) {                                                                               // 214
            self._setAutoClientSave();                                                                        // 215
          }                                                                                                   // 216
        }, 0);                                                                                                // 217
      }                                                                                                       // 218
                                                                                                              // 219
      this._hObserve = cursor.observe({                                                                       // 220
        addedAt: function(doc, atIndex) {                                                                     // 221
          self.splice(atIndex, 0, doc);                                                                       // 222
          self._serverBackup.splice(atIndex, 0, doc);                                                         // 223
          setServerUpdateMode();                                                                              // 224
        },                                                                                                    // 225
                                                                                                              // 226
        changedAt: function(doc, oldDoc, atIndex) {                                                           // 227
          diffArray.deepCopyChanges(self[atIndex], doc);                                                      // 228
          diffArray.deepCopyRemovals(self[atIndex], doc);                                                     // 229
          self._serverBackup[atIndex] = self[atIndex];                                                        // 230
          setServerUpdateMode();                                                                              // 231
        },                                                                                                    // 232
                                                                                                              // 233
        movedTo: function(doc, fromIndex, toIndex) {                                                          // 234
          self.splice(fromIndex, 1);                                                                          // 235
          self.splice(toIndex, 0, doc);                                                                       // 236
          self._serverBackup.splice(fromIndex, 1);                                                            // 237
          self._serverBackup.splice(toIndex, 0, doc);                                                         // 238
          setServerUpdateMode();                                                                              // 239
        },                                                                                                    // 240
                                                                                                              // 241
        removedAt: function(oldDoc) {                                                                         // 242
          var removedIndex = collectionUtils.findIndexById(self, oldDoc);                                     // 243
                                                                                                              // 244
          if (removedIndex != -1) {                                                                           // 245
            self.splice(removedIndex, 1);                                                                     // 246
            self._serverBackup.splice(removedIndex, 1);                                                       // 247
            setServerUpdateMode();                                                                            // 248
          } else {                                                                                            // 249
            // If it's been removed on client then it's already not in collection                             // 250
            // itself but still is in the _serverBackup.                                                      // 251
            removedIndex = collectionUtils.findIndexById(self._serverBackup, oldDoc);                         // 252
                                                                                                              // 253
            if (removedIndex != -1) {                                                                         // 254
              self._serverBackup.splice(removedIndex, 1);                                                     // 255
            }                                                                                                 // 256
          }                                                                                                   // 257
        }                                                                                                     // 258
      });                                                                                                     // 259
                                                                                                              // 260
      this._hDataAutorun = Tracker.autorun(function() {                                                       // 261
        cursor.fetch();                                                                                       // 262
        if (serverMode) {                                                                                     // 263
          unsetServerUpdateMode();                                                                            // 264
        }                                                                                                     // 265
      });                                                                                                     // 266
    };                                                                                                        // 267
                                                                                                              // 268
    AngularMeteorCollection.stop = function() {                                                               // 269
      this._stopCursor();                                                                                     // 270
      this._hNewCurAutorun.stop();                                                                            // 271
    };                                                                                                        // 272
                                                                                                              // 273
    AngularMeteorCollection._stopCursor = function() {                                                        // 274
      this._unsetAutoClientSave();                                                                            // 275
                                                                                                              // 276
      if (this._hObserve) {                                                                                   // 277
        this._hObserve.stop();                                                                                // 278
        this._hDataAutorun.stop();                                                                            // 279
      }                                                                                                       // 280
                                                                                                              // 281
      this.splice(0);                                                                                         // 282
      this._serverBackup.splice(0);                                                                           // 283
    };                                                                                                        // 284
                                                                                                              // 285
    AngularMeteorCollection._unsetAutoClientSave = function(name) {                                           // 286
      if (this._hRegAutoBind) {                                                                               // 287
        this._hRegAutoBind();                                                                                 // 288
        this._hRegAutoBind = null;                                                                            // 289
      }                                                                                                       // 290
    };                                                                                                        // 291
                                                                                                              // 292
    AngularMeteorCollection._setAutoClientSave = function() {                                                 // 293
      var self = this;                                                                                        // 294
                                                                                                              // 295
      // Always unsets auto save to keep only one $watch handler.                                             // 296
      self._unsetAutoClientSave();                                                                            // 297
                                                                                                              // 298
      self._hRegAutoBind = $rootScope.$watch(function() {                                                     // 299
        return self;                                                                                          // 300
      }, function(nItems, oItems) {                                                                           // 301
        if (nItems === oItems) return;                                                                        // 302
                                                                                                              // 303
        self._unsetAutoClientSave();                                                                          // 304
        var changes = collectionUtils.diff(self, oItems,                                                      // 305
          self._diffArrayFunc);                                                                               // 306
        self._saveChanges(changes);                                                                           // 307
        self._setAutoClientSave();                                                                            // 308
      }, true);                                                                                               // 309
    };                                                                                                        // 310
                                                                                                              // 311
    AngularMeteorCollection._saveChanges = function(changes) {                                                // 312
      var self = this;                                                                                        // 313
                                                                                                              // 314
      // Saves added documents                                                                                // 315
      // Using reversed iteration to prevent indexes from changing during splice                              // 316
      var addedDocs = changes.added.reverse().map(function(descriptor) {                                      // 317
        self.splice(descriptor.index, 1);                                                                     // 318
        return descriptor.item;                                                                               // 319
      });                                                                                                     // 320
      if (addedDocs.length) self.save(addedDocs);                                                             // 321
                                                                                                              // 322
      // Removes deleted documents                                                                            // 323
      var removedDocs = changes.removed.map(function(descriptor) {                                            // 324
        return descriptor.item;                                                                               // 325
      });                                                                                                     // 326
      if (removedDocs.length) self.remove(removedDocs);                                                       // 327
                                                                                                              // 328
      // Updates changed documents                                                                            // 329
      changes.changed.forEach(function(descriptor) {                                                          // 330
        self._updateDiff(descriptor.selector, descriptor.modifier);                                           // 331
      });                                                                                                     // 332
    };                                                                                                        // 333
                                                                                                              // 334
    return AngularMeteorCollection;                                                                           // 335
}]);                                                                                                          // 336
                                                                                                              // 337
angularMeteorCollection.factory('$meteorCollectionFS', ['$meteorCollection', 'diffArray',                     // 338
  function($meteorCollection, diffArray) {                                                                    // 339
    function $meteorCollectionFS(reactiveFunc, autoClientSave, collection) {                                  // 340
      return new $meteorCollection(reactiveFunc, autoClientSave, collection, noNestedDiffArray);              // 341
    }                                                                                                         // 342
                                                                                                              // 343
    var noNestedDiffArray = function(lastSeqArray, seqArray, callbacks) {                                     // 344
      return diffArray(lastSeqArray, seqArray, callbacks, true);                                              // 345
    };                                                                                                        // 346
                                                                                                              // 347
    return $meteorCollectionFS;                                                                               // 348
}]);                                                                                                          // 349
                                                                                                              // 350
angularMeteorCollection.factory('$meteorCollection', [                                                        // 351
  'AngularMeteorCollection', '$rootScope', 'diffArray',                                                       // 352
  function(AngularMeteorCollection, $rootScope, diffArray) {                                                  // 353
    function $meteorCollection(reactiveFunc, autoClientSave, collection, diffArrayFunc) {                     // 354
      // Validate parameters                                                                                  // 355
      if (!reactiveFunc) {                                                                                    // 356
        throw new TypeError('The first argument of $meteorCollection is undefined.');                         // 357
      }                                                                                                       // 358
                                                                                                              // 359
      if (!(angular.isFunction(reactiveFunc) || angular.isFunction(reactiveFunc.find))) {                     // 360
        throw new TypeError(                                                                                  // 361
          'The first argument of $meteorCollection must be a function or\
            a have a find function property.');                                                               // 363
      }                                                                                                       // 364
                                                                                                              // 365
      if (!angular.isFunction(reactiveFunc)) {                                                                // 366
        collection = angular.isDefined(collection) ? collection : reactiveFunc;                               // 367
        reactiveFunc = _.bind(reactiveFunc.find, reactiveFunc);                                               // 368
      }                                                                                                       // 369
                                                                                                              // 370
      // By default auto save - true.                                                                         // 371
      autoClientSave = angular.isDefined(autoClientSave) ? autoClientSave : true;                             // 372
      var ngCollection = new AngularMeteorCollection(reactiveFunc, collection,                                // 373
        diffArrayFunc || diffArray, autoClientSave);                                                          // 374
                                                                                                              // 375
      return ngCollection;                                                                                    // 376
    }                                                                                                         // 377
                                                                                                              // 378
    return $meteorCollection;                                                                                 // 379
 }]);                                                                                                         // 380
                                                                                                              // 381
angularMeteorCollection.run([                                                                                 // 382
  '$rootScope', '$meteorCollection', '$meteorCollectionFS', '$meteorStopper',                                 // 383
  function($rootScope, $meteorCollection, $meteorCollectionFS, $meteorStopper) {                              // 384
    var scopeProto = Object.getPrototypeOf($rootScope);                                                       // 385
    scopeProto.$meteorCollection = $meteorStopper($meteorCollection);                                         // 386
    scopeProto.$meteorCollectionFS = $meteorStopper($meteorCollectionFS);                                     // 387
 }]);                                                                                                         // 388
                                                                                                              // 389
                                                                                                              // 390
// Local utilities                                                                                            // 391
var collectionUtils = {                                                                                       // 392
                                                                                                              // 393
  findIndexById: function(collection, doc) {                                                                  // 394
    var foundDoc = _.find(collection, function(colDoc) {                                                      // 395
      // EJSON.equals used to compare Mongo.ObjectIDs and Strings.                                            // 396
      return EJSON.equals(colDoc._id, doc._id);                                                               // 397
    });                                                                                                       // 398
    return _.indexOf(collection, foundDoc);                                                                   // 399
  },                                                                                                          // 400
                                                                                                              // 401
  // Finds changes between two collections and saves differences.                                             // 402
  diff: function(newCollection, oldCollection, diffMethod) {                                                  // 403
    var changes = {added: [], removed: [], changed: []};                                                      // 404
                                                                                                              // 405
    diffMethod(oldCollection, newCollection, {                                                                // 406
      addedAt: function(id, item, index) {                                                                    // 407
        changes.added.push({item: item, index: index});                                                       // 408
      },                                                                                                      // 409
                                                                                                              // 410
      removedAt: function(id, item, index) {                                                                  // 411
        changes.removed.push({item: item, index: index});                                                     // 412
      },                                                                                                      // 413
                                                                                                              // 414
      changedAt: function(id, updates, index, oldItem) {                                                      // 415
        changes.changed.push({selector: id, modifier: updates});                                              // 416
      },                                                                                                      // 417
                                                                                                              // 418
      movedTo: function(id, item, fromIndex, toIndex) {                                                       // 419
        // XXX do we need this?                                                                               // 420
      }                                                                                                       // 421
    });                                                                                                       // 422
                                                                                                              // 423
    return changes;                                                                                           // 424
  }                                                                                                           // 425
};                                                                                                            // 426
                                                                                                              // 427
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/angular-meteor-data/modules/angular-meteor-object.js                                              //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
'use strict';                                                                                                 // 1
                                                                                                              // 2
var angularMeteorObject = angular.module('angular-meteor.object', ['angular-meteor.utils', 'angular-meteor.subscribe', 'angular-meteor.collection', 'getUpdates', 'diffArray']);
                                                                                                              // 4
angularMeteorObject.factory('AngularMeteorObject', [                                                          // 5
  '$q', '$meteorSubscribe', '$meteorUtils', 'diffArray', 'getUpdates', 'AngularMeteorCollection',             // 6
  function($q, $meteorSubscribe, $meteorUtils, diffArray, getUpdates, AngularMeteorCollection) {              // 7
    // A list of internals properties to not watch for, nor pass to the Document on update and etc.           // 8
    AngularMeteorObject.$$internalProps = [                                                                   // 9
      '$$collection', '$$options', '$$id', '$$hashkey', '$$internalProps', '$$scope',                         // 10
      'save', 'reset', 'subscribe', 'stop', 'autorunComputation', 'unregisterAutoBind', 'unregisterAutoDestroy', 'getRawObject',
      '_auto', '_setAutos', '_eventEmitter', '_serverBackup', '_updateDiff', '_updateParallel'                // 12
    ];                                                                                                        // 13
                                                                                                              // 14
    function AngularMeteorObject (collection, id, options){                                                   // 15
      // Make data not be an object so we can extend it to preserve                                           // 16
      // Collection Helpers and the like                                                                      // 17
      var data = new function SubObject() {};                                                                 // 18
      var doc = collection.findOne(id, options);                                                              // 19
      var collectionExtension = _.pick(AngularMeteorCollection, '_updateParallel');                           // 20
      angular.extend(data, doc);                                                                              // 21
      angular.extend(data, AngularMeteorObject);                                                              // 22
      angular.extend(data, collectionExtension);                                                              // 23
                                                                                                              // 24
      data._serverBackup = doc || {};                                                                         // 25
      data.$$collection = collection;                                                                         // 26
      data.$$options = options;                                                                               // 27
      data.$$id = id || new Mongo.ObjectID();                                                                 // 28
                                                                                                              // 29
      return data;                                                                                            // 30
    }                                                                                                         // 31
                                                                                                              // 32
    AngularMeteorObject.getRawObject = function () {                                                          // 33
      return angular.copy(_.omit(this, this.$$internalProps));                                                // 34
    };                                                                                                        // 35
                                                                                                              // 36
    AngularMeteorObject.subscribe = function () {                                                             // 37
      $meteorSubscribe.subscribe.apply(this, arguments);                                                      // 38
      return this;                                                                                            // 39
    };                                                                                                        // 40
                                                                                                              // 41
    AngularMeteorObject.save = function(custom) {                                                             // 42
      var deferred = $q.defer();                                                                              // 43
      var collection = this.$$collection;                                                                     // 44
      var createFulfill = _.partial($meteorUtils.fulfill, deferred, null);                                    // 45
      var oldDoc = collection.findOne(this.$$id);                                                             // 46
      var mods;                                                                                               // 47
                                                                                                              // 48
      // update                                                                                               // 49
      if (oldDoc) {                                                                                           // 50
        if (custom)                                                                                           // 51
          mods = { $set: custom };                                                                            // 52
        else {                                                                                                // 53
          mods = getUpdates(oldDoc, this.getRawObject());                                                     // 54
          // If there are no updates, there is nothing to do here, returning                                  // 55
          if (_.isEmpty(mods)) {                                                                              // 56
            return $q.when({ action: 'updated' });                                                            // 57
          }                                                                                                   // 58
        }                                                                                                     // 59
                                                                                                              // 60
        // NOTE: do not use #upsert() method, since it does not exist in some collections                     // 61
        this._updateDiff(mods, createFulfill({ action: 'updated' }));                                         // 62
      }                                                                                                       // 63
      // insert                                                                                               // 64
      else {                                                                                                  // 65
        if (custom)                                                                                           // 66
          mods = _.clone(custom);                                                                             // 67
        else                                                                                                  // 68
          mods = this.getRawObject();                                                                         // 69
                                                                                                              // 70
        mods._id = this.$$id;                                                                                 // 71
        collection.insert(mods, createFulfill({ action: 'inserted' }));                                       // 72
      }                                                                                                       // 73
                                                                                                              // 74
      return deferred.promise;                                                                                // 75
    };                                                                                                        // 76
                                                                                                              // 77
    AngularMeteorObject._updateDiff = function(update, callback) {                                            // 78
      var selector = this.$$id;                                                                               // 79
      AngularMeteorCollection._updateDiff.call(this, selector, update, callback);                             // 80
    };                                                                                                        // 81
                                                                                                              // 82
    AngularMeteorObject.reset = function(keepClientProps) {                                                   // 83
      var self = this;                                                                                        // 84
      var options = this.$$options;                                                                           // 85
      var id = this.$$id;                                                                                     // 86
      var doc = this.$$collection.findOne(id, options);                                                       // 87
                                                                                                              // 88
      if (doc) {                                                                                              // 89
        // extend SubObject                                                                                   // 90
        var docKeys = _.keys(doc);                                                                            // 91
        var docExtension = _.pick(doc, docKeys);                                                              // 92
        var clientProps;                                                                                      // 93
                                                                                                              // 94
        angular.extend(Object.getPrototypeOf(self), Object.getPrototypeOf(doc));                              // 95
        _.extend(self, docExtension);                                                                         // 96
        _.extend(self._serverBackup, docExtension);                                                           // 97
                                                                                                              // 98
        if (keepClientProps) {                                                                                // 99
          clientProps = _.intersection(_.keys(self), _.keys(self._serverBackup));                             // 100
        } else {                                                                                              // 101
          clientProps = _.keys(self);                                                                         // 102
        }                                                                                                     // 103
                                                                                                              // 104
        var serverProps = _.keys(doc);                                                                        // 105
        var removedKeys = _.difference(clientProps, serverProps, self.$$internalProps);                       // 106
                                                                                                              // 107
        removedKeys.forEach(function (prop) {                                                                 // 108
          delete self[prop];                                                                                  // 109
          delete self._serverBackup[prop];                                                                    // 110
        });                                                                                                   // 111
      }                                                                                                       // 112
                                                                                                              // 113
      else {                                                                                                  // 114
        _.keys(this.getRawObject()).forEach(function(prop) {                                                  // 115
          delete self[prop];                                                                                  // 116
        });                                                                                                   // 117
                                                                                                              // 118
        self._serverBackup = {};                                                                              // 119
      }                                                                                                       // 120
    };                                                                                                        // 121
                                                                                                              // 122
    AngularMeteorObject.stop = function () {                                                                  // 123
      if (this.unregisterAutoDestroy)                                                                         // 124
        this.unregisterAutoDestroy();                                                                         // 125
                                                                                                              // 126
      if (this.unregisterAutoBind)                                                                            // 127
        this.unregisterAutoBind();                                                                            // 128
                                                                                                              // 129
      if (this.autorunComputation && this.autorunComputation.stop)                                            // 130
        this.autorunComputation.stop();                                                                       // 131
    };                                                                                                        // 132
                                                                                                              // 133
    return AngularMeteorObject;                                                                               // 134
}]);                                                                                                          // 135
                                                                                                              // 136
                                                                                                              // 137
angularMeteorObject.factory('$meteorObject', [                                                                // 138
  '$rootScope', '$meteorUtils', 'getUpdates', 'AngularMeteorObject',                                          // 139
  function($rootScope, $meteorUtils, getUpdates, AngularMeteorObject) {                                       // 140
    function $meteorObject(collection, id, auto, options) {                                                   // 141
      // Validate parameters                                                                                  // 142
      if (!collection) {                                                                                      // 143
        throw new TypeError("The first argument of $meteorObject is undefined.");                             // 144
      }                                                                                                       // 145
                                                                                                              // 146
      if (!angular.isFunction(collection.findOne)) {                                                          // 147
        throw new TypeError("The first argument of $meteorObject must be a function or a have a findOne function property.");
      }                                                                                                       // 149
                                                                                                              // 150
      var data = new AngularMeteorObject(collection, id, options);                                            // 151
      data._auto = auto !== false; // Making auto default true - http://stackoverflow.com/a/15464208/1426570  // 152
      angular.extend(data, $meteorObject);                                                                    // 153
      data._setAutos();                                                                                       // 154
      return data;                                                                                            // 155
    }                                                                                                         // 156
                                                                                                              // 157
    $meteorObject._setAutos = function() {                                                                    // 158
      var self = this;                                                                                        // 159
                                                                                                              // 160
      this.autorunComputation = $meteorUtils.autorun($rootScope, function() {                                 // 161
        self.reset(true);                                                                                     // 162
      });                                                                                                     // 163
                                                                                                              // 164
      // Deep watches the model and performs autobind                                                         // 165
      this.unregisterAutoBind = this._auto && $rootScope.$watch(function(){                                   // 166
        return self.getRawObject();                                                                           // 167
      }, function (item, oldItem) {                                                                           // 168
        if (item !== oldItem) self.save();                                                                    // 169
      }, true);                                                                                               // 170
                                                                                                              // 171
      this.unregisterAutoDestroy = $rootScope.$on('$destroy', function() {                                    // 172
        if (self && self.stop) {                                                                              // 173
          self.stop();                                                                                        // 174
        }                                                                                                     // 175
      });                                                                                                     // 176
    };                                                                                                        // 177
                                                                                                              // 178
    return $meteorObject;                                                                                     // 179
}]);                                                                                                          // 180
                                                                                                              // 181
angularMeteorObject.run([                                                                                     // 182
  '$rootScope', '$meteorObject', '$meteorStopper',                                                            // 183
  function ($rootScope, $meteorObject, $meteorStopper) {                                                      // 184
    var scopeProto = Object.getPrototypeOf($rootScope);                                                       // 185
    scopeProto.$meteorObject = $meteorStopper($meteorObject);                                                 // 186
}]);                                                                                                          // 187
                                                                                                              // 188
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/angular-meteor-data/modules/angular-meteor-user.js                                                //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
'use strict';                                                                                                 // 1
                                                                                                              // 2
var angularMeteorUser = angular.module('angular-meteor.user', ['angular-meteor.utils']);                      // 3
                                                                                                              // 4
// requires package 'accounts-password'                                                                       // 5
angularMeteorUser.service('$meteorUser', [                                                                    // 6
  '$rootScope', '$meteorUtils', '$q',                                                                         // 7
  function($rootScope, $meteorUtils, $q){                                                                     // 8
    var pack = Package['accounts-base'];                                                                      // 9
    if (!pack) return;                                                                                        // 10
                                                                                                              // 11
    var self = this;                                                                                          // 12
    var Accounts = pack.Accounts;                                                                             // 13
                                                                                                              // 14
    this.waitForUser = function(){                                                                            // 15
                                                                                                              // 16
      var deferred = $q.defer();                                                                              // 17
                                                                                                              // 18
      $meteorUtils.autorun($rootScope, function(){                                                            // 19
        if ( !Meteor.loggingIn() )                                                                            // 20
          deferred.resolve( Meteor.user() );                                                                  // 21
      });                                                                                                     // 22
                                                                                                              // 23
      return deferred.promise;                                                                                // 24
    };                                                                                                        // 25
                                                                                                              // 26
    this.requireUser = function(){                                                                            // 27
                                                                                                              // 28
      var deferred = $q.defer();                                                                              // 29
                                                                                                              // 30
      $meteorUtils.autorun($rootScope, function(){                                                            // 31
        if ( !Meteor.loggingIn() ) {                                                                          // 32
          if ( Meteor.user() == null)                                                                         // 33
            deferred.reject("AUTH_REQUIRED");                                                                 // 34
          else                                                                                                // 35
            deferred.resolve( Meteor.user() );                                                                // 36
        }                                                                                                     // 37
      });                                                                                                     // 38
                                                                                                              // 39
      return deferred.promise;                                                                                // 40
    };                                                                                                        // 41
                                                                                                              // 42
    this.requireValidUser = function(validatorFn) {                                                           // 43
      return self.requireUser().then(function(user){                                                          // 44
        var valid = validatorFn( user );                                                                      // 45
                                                                                                              // 46
        if ( valid === true )                                                                                 // 47
          return user;                                                                                        // 48
        else if ( typeof valid === "string" )                                                                 // 49
          return $q.reject( valid );                                                                          // 50
        else                                                                                                  // 51
          return $q.reject( "FORBIDDEN" );                                                                    // 52
	    });                                                                                                      // 53
	  };                                                                                                         // 54
                                                                                                              // 55
    this.loginWithPassword = $meteorUtils.promissor(Meteor, 'loginWithPassword');                             // 56
    this.createUser = $meteorUtils.promissor(Accounts, 'createUser');                                         // 57
    this.changePassword = $meteorUtils.promissor(Accounts, 'changePassword');                                 // 58
    this.forgotPassword = $meteorUtils.promissor(Accounts, 'forgotPassword');                                 // 59
    this.resetPassword = $meteorUtils.promissor(Accounts, 'resetPassword');                                   // 60
    this.verifyEmail = $meteorUtils.promissor(Accounts, 'verifyEmail');                                       // 61
    this.logout = $meteorUtils.promissor(Meteor, 'logout');                                                   // 62
    this.logoutOtherClients = $meteorUtils.promissor(Meteor, 'logoutOtherClients');                           // 63
    this.loginWithFacebook = $meteorUtils.promissor(Meteor, 'loginWithFacebook');                             // 64
    this.loginWithTwitter = $meteorUtils.promissor(Meteor, 'loginWithTwitter');                               // 65
    this.loginWithGoogle = $meteorUtils.promissor(Meteor, 'loginWithGoogle');                                 // 66
    this.loginWithGithub = $meteorUtils.promissor(Meteor, 'loginWithGithub');                                 // 67
    this.loginWithMeteorDeveloperAccount = $meteorUtils.promissor(Meteor, 'loginWithMeteorDeveloperAccount');
    this.loginWithMeetup = $meteorUtils.promissor(Meteor, 'loginWithMeetup');                                 // 69
    this.loginWithWeibo = $meteorUtils.promissor(Meteor, 'loginWithWeibo');                                   // 70
  }                                                                                                           // 71
]);                                                                                                           // 72
                                                                                                              // 73
angularMeteorUser.run([                                                                                       // 74
  '$rootScope', '$meteorUtils',                                                                               // 75
  function($rootScope, $meteorUtils){                                                                         // 76
    $meteorUtils.autorun($rootScope, function(){                                                              // 77
      if (!Meteor.user) return;                                                                               // 78
      $rootScope.currentUser = Meteor.user();                                                                 // 79
      $rootScope.loggingIn = Meteor.loggingIn();                                                              // 80
    });                                                                                                       // 81
  }                                                                                                           // 82
]);                                                                                                           // 83
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/angular-meteor-data/modules/angular-meteor-methods.js                                             //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
'use strict';                                                                                                 // 1
                                                                                                              // 2
var angularMeteorMethods = angular.module('angular-meteor.methods', ['angular-meteor.utils']);                // 3
                                                                                                              // 4
angularMeteorMethods.service('$meteorMethods', [                                                              // 5
  '$q', '$meteorUtils',                                                                                       // 6
  function($q, $meteorUtils) {                                                                                // 7
    this.call = function(){                                                                                   // 8
      var deferred = $q.defer();                                                                              // 9
      var fulfill = $meteorUtils.fulfill(deferred);                                                           // 10
      var args = _.toArray(arguments).concat(fulfill);                                                        // 11
      Meteor.call.apply(this, args);                                                                          // 12
      return deferred.promise;                                                                                // 13
    };                                                                                                        // 14
  }                                                                                                           // 15
]);                                                                                                           // 16
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/angular-meteor-data/modules/angular-meteor-session.js                                             //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
'use strict';                                                                                                 // 1
var angularMeteorSession = angular.module('angular-meteor.session', ['angular-meteor.utils']);                // 2
                                                                                                              // 3
angularMeteorSession.factory('$meteorSession', ['$meteorUtils', '$parse',                                     // 4
  function ($meteorUtils, $parse) {                                                                           // 5
    return function (session) {                                                                               // 6
                                                                                                              // 7
      return {                                                                                                // 8
                                                                                                              // 9
        bind: function(scope, model) {                                                                        // 10
          var getter = $parse(model);                                                                         // 11
          var setter = getter.assign;                                                                         // 12
          $meteorUtils.autorun(scope, function() {                                                            // 13
            setter(scope, Session.get(session));                                                              // 14
          });                                                                                                 // 15
                                                                                                              // 16
          scope.$watch(model, function(newItem, oldItem) {                                                    // 17
            Session.set(session, getter(scope));                                                              // 18
          }, true);                                                                                           // 19
                                                                                                              // 20
        }                                                                                                     // 21
      };                                                                                                      // 22
    }                                                                                                         // 23
  }                                                                                                           // 24
]);                                                                                                           // 25
                                                                                                              // 26
                                                                                                              // 27
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/angular-meteor-data/modules/angular-meteor-reactive-scope.js                                      //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
/**                                                                                                           // 1
 * Created by netanel on 29/12/14.                                                                            // 2
 */                                                                                                           // 3
var angularMeteorReactiveScope = angular.module('angular-meteor.reactive-scope', []);                         // 4
                                                                                                              // 5
angularMeteorReactiveScope.run(['$rootScope', '$parse', function($rootScope, $parse) {                        // 6
  Object.getPrototypeOf($rootScope).getReactively = function(property, objectEquality) {                      // 7
    var self = this;                                                                                          // 8
    var getValue = $parse(property);                                                                          // 9
    objectEquality = !!objectEquality;                                                                        // 10
                                                                                                              // 11
    if (!self.hasOwnProperty('$$trackerDeps')) {                                                              // 12
      self.$$trackerDeps = {};                                                                                // 13
    }                                                                                                         // 14
                                                                                                              // 15
    if (!self.$$trackerDeps[property]) {                                                                      // 16
      self.$$trackerDeps[property] = new Tracker.Dependency();                                                // 17
                                                                                                              // 18
      self.$watch(function() {                                                                                // 19
        return getValue(self)                                                                                 // 20
      }, function(newVal, oldVal) {                                                                           // 21
        if (newVal !== oldVal) {                                                                              // 22
          self.$$trackerDeps[property].changed();                                                             // 23
        }                                                                                                     // 24
      }, objectEquality);                                                                                     // 25
    }                                                                                                         // 26
                                                                                                              // 27
    self.$$trackerDeps[property].depend();                                                                    // 28
                                                                                                              // 29
    return getValue(self);                                                                                    // 30
  };                                                                                                          // 31
  Object.getPrototypeOf($rootScope).getCollectionReactively = function(property) {                            // 32
    var self = this;                                                                                          // 33
    var getValue = $parse(property);                                                                          // 34
                                                                                                              // 35
                                                                                                              // 36
    if (!self.hasOwnProperty('$$trackerDeps')) {                                                              // 37
      self.$$trackerDeps = {};                                                                                // 38
    }                                                                                                         // 39
                                                                                                              // 40
    if (!self.$$trackerDeps[property]) {                                                                      // 41
      self.$$trackerDeps[property] = new Tracker.Dependency();                                                // 42
                                                                                                              // 43
      self.$watchCollection(property, function() {                                                            // 44
        self.$$trackerDeps[property].changed();                                                               // 45
      });                                                                                                     // 46
    }                                                                                                         // 47
                                                                                                              // 48
    self.$$trackerDeps[property].depend();                                                                    // 49
                                                                                                              // 50
    return getValue(self);                                                                                    // 51
  };                                                                                                          // 52
}]);                                                                                                          // 53
                                                                                                              // 54
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/angular-meteor-data/modules/angular-meteor-utils.js                                               //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
'use strict';                                                                                                 // 1
var angularMeteorUtils = angular.module('angular-meteor.utils', []);                                          // 2
                                                                                                              // 3
angularMeteorUtils.service('$meteorUtils', [                                                                  // 4
  '$q', '$timeout',                                                                                           // 5
  function ($q, $timeout) {                                                                                   // 6
    var self = this;                                                                                          // 7
    this.getCollectionByName = function(string){                                                              // 8
      return Mongo.Collection.get(string);                                                                    // 9
    };                                                                                                        // 10
    this.autorun = function(scope, fn) {                                                                      // 11
      // wrapping around Deps.autorun                                                                         // 12
      var comp = Tracker.autorun(function(c) {                                                                // 13
        fn(c);                                                                                                // 14
                                                                                                              // 15
        // this is run immediately for the first call                                                         // 16
        // but after that, we need to $apply to start Angular digest                                          // 17
        if (!c.firstRun) $timeout(angular.noop, 0);                                                           // 18
      });                                                                                                     // 19
      // stop autorun when scope is destroyed                                                                 // 20
      scope.$on('$destroy', function() {                                                                      // 21
        comp.stop();                                                                                          // 22
      });                                                                                                     // 23
      // return autorun object so that it can be stopped manually                                             // 24
      return comp;                                                                                            // 25
    };                                                                                                        // 26
    // Borrowed from angularFire - https://github.com/firebase/angularfire/blob/master/src/utils.js#L445-L454
    this.stripDollarPrefixedKeys = function (data) {                                                          // 28
      if( !angular.isObject(data) ||                                                                          // 29
        data instanceof Date ||                                                                               // 30
        data instanceof File ||                                                                               // 31
        EJSON.toJSONValue(data).$type === 'oid' ||                                                            // 32
        (typeof FS === 'object' && data instanceof FS.File)) {                                                // 33
        return data;                                                                                          // 34
      }                                                                                                       // 35
      var out = angular.isArray(data)? [] : {};                                                               // 36
      angular.forEach(data, function(v,k) {                                                                   // 37
        if(typeof k !== 'string' || k.charAt(0) !== '$') {                                                    // 38
          out[k] = self.stripDollarPrefixedKeys(v);                                                           // 39
        }                                                                                                     // 40
      });                                                                                                     // 41
      return out;                                                                                             // 42
    };                                                                                                        // 43
    // Returns a callback which fulfills promise                                                              // 44
    this.fulfill = function(deferred, boundError, boundResult) {                                              // 45
      return function(err, result) {                                                                          // 46
        if (err)                                                                                              // 47
          deferred.reject(boundError == null ? err : boundError);                                             // 48
        else if (typeof boundResult == "function")                                                            // 49
          deferred.resolve(boundResult == null ? result : boundResult(result));                               // 50
        else                                                                                                  // 51
          deferred.resolve(boundResult == null ? result : boundResult);                                       // 52
      };                                                                                                      // 53
    };                                                                                                        // 54
    // creates a function which invokes method with the given arguments and returns a promise                 // 55
    this.promissor = function(obj, method) {                                                                  // 56
      return function() {                                                                                     // 57
        var deferred = $q.defer();                                                                            // 58
        var fulfill = self.fulfill(deferred);                                                                 // 59
        var args = _.toArray(arguments).concat(fulfill);                                                      // 60
        obj[method].apply(obj, args);                                                                         // 61
        return deferred.promise;                                                                              // 62
      };                                                                                                      // 63
    };                                                                                                        // 64
  }                                                                                                           // 65
]);                                                                                                           // 66
                                                                                                              // 67
angularMeteorUtils.run(['$rootScope', '$meteorUtils',                                                         // 68
  function($rootScope, $meteorUtils) {                                                                        // 69
    Object.getPrototypeOf($rootScope).$meteorAutorun = function(fn) {                                         // 70
      return $meteorUtils.autorun(this, fn);                                                                  // 71
    };                                                                                                        // 72
}]);                                                                                                          // 73
                                                                                                              // 74
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/angular-meteor-data/modules/angular-meteor-camera.js                                              //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
'use strict';                                                                                                 // 1
                                                                                                              // 2
var angularMeteorCamera = angular.module('angular-meteor.camera', ['angular-meteor.utils']);                  // 3
                                                                                                              // 4
// requires package 'mdg:camera'                                                                              // 5
angularMeteorCamera.service('$meteorCamera', [                                                                // 6
  '$q', '$meteorUtils',                                                                                       // 7
  function ($q, $meteorUtils) {                                                                               // 8
    var pack = Package['mdg:camera'];                                                                         // 9
    if (!pack) return;                                                                                        // 10
                                                                                                              // 11
    var MeteorCamera = pack.MeteorCamera;                                                                     // 12
                                                                                                              // 13
    this.getPicture = function(options){                                                                      // 14
      options = options || {};                                                                                // 15
      var deferred = $q.defer();                                                                              // 16
      MeteorCamera.getPicture(options, $meteorUtils.fulfill(deferred));                                       // 17
      return deferred.promise;                                                                                // 18
    };                                                                                                        // 19
  }                                                                                                           // 20
]);                                                                                                           // 21
                                                                                                              // 22
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/angular-meteor-data/angular-meteor.js                                                             //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
// Define angular-meteor and its dependencies                                                                 // 1
var angularMeteor = angular.module('angular-meteor', [                                                        // 2
  'angular-meteor.subscribe',                                                                                 // 3
  'angular-meteor.collection',                                                                                // 4
  'angular-meteor.object',                                                                                    // 5
  'angular-meteor.user',                                                                                      // 6
  'angular-meteor.methods',                                                                                   // 7
  'angular-meteor.session',                                                                                   // 8
  'angular-meteor.reactive-scope',                                                                            // 9
  'angular-meteor.utils',                                                                                     // 10
  'angular-meteor.camera'                                                                                     // 11
]);                                                                                                           // 12
                                                                                                              // 13
angularMeteor.run(['$compile', '$document', '$rootScope', function ($compile, $document, $rootScope) {        // 14
    // Recompile after iron:router builds page                                                                // 15
    if(Package['iron:router']) {                                                                              // 16
      var appLoaded = false;                                                                                  // 17
      Package['iron:router'].Router.onAfterAction(function(req, res, next) {                                  // 18
        Tracker.afterFlush(function() {                                                                       // 19
          if (!appLoaded) {                                                                                   // 20
            $compile($document)($rootScope);                                                                  // 21
            if (!$rootScope.$$phase) $rootScope.$apply();                                                     // 22
            appLoaded = true;                                                                                 // 23
          }                                                                                                   // 24
        })                                                                                                    // 25
      });                                                                                                     // 26
    }                                                                                                         // 27
  }]);                                                                                                        // 28
                                                                                                              // 29
// Putting all services under $meteor service for syntactic sugar                                             // 30
angularMeteor.service('$meteor', ['$meteorCollection', '$meteorCollectionFS', '$meteorObject', '$meteorMethods', '$meteorSession', '$meteorSubscribe', '$meteorUtils', '$meteorCamera', '$meteorUser',
  function($meteorCollection, $meteorCollectionFS, $meteorObject, $meteorMethods, $meteorSession, $meteorSubscribe, $meteorUtils, $meteorCamera, $meteorUser){
    this.collection = $meteorCollection;                                                                      // 33
    this.collectionFS = $meteorCollectionFS;                                                                  // 34
    this.object = $meteorObject;                                                                              // 35
    this.subscribe = $meteorSubscribe.subscribe;                                                              // 36
    this.call = $meteorMethods.call;                                                                          // 37
    this.loginWithPassword = $meteorUser.loginWithPassword;                                                   // 38
    this.requireUser = $meteorUser.requireUser;                                                               // 39
    this.requireValidUser = $meteorUser.requireValidUser;                                                     // 40
    this.waitForUser = $meteorUser.waitForUser;                                                               // 41
    this.createUser = $meteorUser.createUser;                                                                 // 42
    this.changePassword = $meteorUser.changePassword;                                                         // 43
    this.forgotPassword = $meteorUser.forgotPassword;                                                         // 44
    this.resetPassword = $meteorUser.resetPassword;                                                           // 45
    this.verifyEmail = $meteorUser.verifyEmail;                                                               // 46
    this.loginWithMeteorDeveloperAccount = $meteorUser.loginWithMeteorDeveloperAccount;                       // 47
    this.loginWithFacebook = $meteorUser.loginWithFacebook;                                                   // 48
    this.loginWithGithub = $meteorUser.loginWithGithub;                                                       // 49
    this.loginWithGoogle = $meteorUser.loginWithGoogle;                                                       // 50
    this.loginWithMeetup = $meteorUser.loginWithMeetup;                                                       // 51
    this.loginWithTwitter = $meteorUser.loginWithTwitter;                                                     // 52
    this.loginWithWeibo = $meteorUser.loginWithWeibo;                                                         // 53
    this.logout = $meteorUser.logout;                                                                         // 54
    this.logoutOtherClients = $meteorUser.logoutOtherClients;                                                 // 55
    this.session = $meteorSession;                                                                            // 56
    this.autorun = $meteorUtils.autorun;                                                                      // 57
    this.getCollectionByName = $meteorUtils.getCollectionByName;                                              // 58
    this.getPicture = $meteorCamera.getPicture;                                                               // 59
}]);                                                                                                          // 60
                                                                                                              // 61
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['angular-meteor-data'] = {};

})();
