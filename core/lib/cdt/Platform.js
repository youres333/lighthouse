// @ts-nocheck
/**
 * @license Copyright 2021 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

// Functions manually copied from:
// https://github.com/ChromeDevTools/devtools-frontend/blob/main/front_end/core/platform/array-utilities.ts#L125

/**
 * @param {any[]} array
 * @param {any} needle
 * @param {any} comparator
 */
function lowerBound(array, needle, comparator, left, right) {
  let l = left || 0;
  let r = right !== undefined ? right : array.length;
  while (l < r) {
    const m = (l + r) >> 1;
    if (comparator(needle, array[m]) > 0) {
      l = m + 1;
    } else {
      r = m;
    }
  }
  return r;
}

/**
 * @param {any[]} array
 * @param {any} needle
 * @param {any} comparator
 */
function upperBound(array, needle, comparator, left, right) {
  let l = left || 0;
  let r = right !== undefined ? right : array.length;
  while (l < r) {
    const m = (l + r) >> 1;
    if (comparator(needle, array[m]) >= 0) {
      l = m + 1;
    } else {
      r = m;
    }
  }
  return r;
}

const NearestSearchStart = {
  BEGINNING: 'BEGINNING',
  END: 'END',
};

/**
 * Obtains the first or last item in the array that satisfies the predicate function.
 * So, for example, if the array were arr = [2, 4, 6, 8, 10], and you are looking for
 * the last item arr[i] such that arr[i] < 5  you would be returned 1, because
 * array[1] is 4, the last item in the array that satisfies the
 * predicate function.
 *
 * If instead you were looking for the first item in the same array that satisfies
 * arr[i] > 5 you would be returned 2 because array[2] = 6.
 *
 * Please note: this presupposes that the array is already ordered.
 *
 * @template {T}
 * @param {T[]} arr
 * @param {(arrayItem: T) => boolean}
 * @param {string} searchStart
 * @return {number|null}
 */
function nearestIndex(arr, predicate, searchStart) {
  const searchFromEnd = searchStart === NearestSearchStart.END;
  if (arr.length === 0) {
    return null;
  }

  let left = 0;
  let right = arr.length - 1;
  let pivot = 0;
  let matchesPredicate = false;
  let moveToTheRight = false;
  let middle = 0;
  do {
    middle = left + (right - left) / 2;
    pivot = searchFromEnd ? Math.ceil(middle) : Math.floor(middle);
    matchesPredicate = predicate(arr[pivot]);
    moveToTheRight = matchesPredicate === searchFromEnd;
    if (moveToTheRight) {
      left = Math.min(right, pivot + (left === pivot ? 1 : 0));
    } else {
      right = Math.max(left, pivot + (right === pivot ? -1 : 0));
    }
  } while (right !== left);

  // Special-case: the indexed item doesn't pass the predicate. This
  // occurs when none of the items in the array are a match for the
  // predicate.
  if (!predicate(arr[left])) {
    return null;
  }
  return left;
}

/**
 * Obtains the first item in the array that satisfies the predicate function.
 * So, for example, if the array was arr = [2, 4, 6, 8, 10], and you are looking for
 * the first item arr[i] such that arr[i] > 5 you would be returned 2, because
 * array[2] is 6, the first item in the array that satisfies the
 * predicate function.
 *
 * Please note: this presupposes that the array is already ordered.
 * @template {T}
 * @param {T[]} arr
 * @param {(arrayItem: T) => boolean}
 * @return {number|null}
 */
function nearestIndexFromBeginning(arr, predicate) {
  return nearestIndex(arr, predicate, NearestSearchStart.BEGINNING);
}

/**
 * Obtains the last item in the array that satisfies the predicate function.
 * So, for example, if the array was arr = [2, 4, 6, 8, 10], and you are looking for
 * the last item arr[i] such that arr[i] < 5 you would be returned 1, because
 * arr[1] is 4, the last item in the array that satisfies the
 * predicate function.
 *
 * Please note: this presupposes that the array is already ordered.
 * @template {T}
 * @param {T[]} arr
 * @param {(arrayItem: T) => boolean}
 * @return {number|null}
 */
function nearestIndexFromEnd(arr, predicate) {
  return nearestIndex(arr, predicate, NearestSearchStart.END);
}

/**
 * Gets value for key, assigning a default if value is falsy.
 * @template {K}
 * @template {V}
 * @param {Map<K, V>} map
 * @param {K} key
 * @param {(key?: K) => V} defaultValueFactory
 * @return {V}
 */
function getWithDefault(map, key, defaultValueFactory) {
  let value = map.get(key);
  if (!value) {
    value = defaultValueFactory(key);
    map.set(key, value);
  }

  return value;
}

module.exports = {
  ArrayUtilities: {
    lowerBound,
    upperBound,
    nearestIndexFromBeginning,
    nearestIndexFromEnd,
  },
  MapUtilities: {
    getWithDefault,
  },
  DevToolsPath: {
    EmptyUrlString: '',
  },
};
