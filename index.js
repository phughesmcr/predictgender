/**
 * predictGender
 * v0.6.3
 *
 * Predict the gender of a string's author.
 *
 * Help me make this better:
 * https://github.com/phugh/predictGender
 *
 * Based on this paper:
 * Schwartz, H. A., Eichstaedt, J. C., Kern, M. L., Dziurzynski, L.,
 * Ramones, S. M., Agrawal, M., Shah, A., Kosinski, M., Stillwell,
 * D., Seligman, M. E., & Ungar, L. H. (2013).
 * Personality, gender, and age in the language of social media:
 * The Open-Vocabulary Approach. PLOS ONE, 8(9), . . e73791.
 *
 * Using the gender lexicon data from http://www.wwbp.org/lexica.html, under the
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported licence
 *
 * (C) 2017 P. Hughes
 * Licence : Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 * http://creativecommons.org/licenses/by-nc-sa/3.0/
 *
 * Usage example:
 * const pg = require('predictgender);
 * // These are the default options
 * const opts = {
 *  'output': 'gender'
 *  'nGrams': true,
 *  'wcGrams': false,
 *  'sortBy': 'lex',
 *  'places': 16,
 *  'max': 99,
 *  'min': -99
 * }
 * const str = "A big long string of text...";
 * const gender = pg(str, opts);
 * console.log(gender)
 *
 * @param {string} str input string
 * @param {Object} opts options object
 * @return {(string|number|Array)} predicted gender or array of matches
 */

'use strict'
;(function() {
  const global = this;
  const previous = global.predictGender;

  let lexicon = global.lexicon;
  let simplengrams = global.simplengrams;
  let tokenizer = global.tokenizer;

  if (typeof lexicon === 'undefined') {
    if (typeof require !== 'undefined') {
      lexicon = require('./data/lexicon.json');
      simplengrams = require('simplengrams');
      tokenizer = require('happynodetokenizer');
    } else {
      throw new Error(`predictGender required modules not found!`);
    }
  }

  /**
   * Get the indexes of duplicate elements in an array
   * @function indexesOf
   * @param  {Array} arr input array
   * @param  {string} str string to test against
   * @return {Array} array of indexes
   */
  const indexesOf = (arr, str) => {
    const idxs = [];
    let i = arr.length;
    while (i--) {
      if (arr[i] === str) {
        idxs.unshift(i);
      }
    }
    return idxs;
  };

  /**
   * Combines multidimensional array elements into strings
   * @function arr2string
   * @param  {Array} arr input array
   * @return {Array} output array
   */
  const arr2string = (arr) => {
    let i = 0;
    const len = arr.length;
    const result = [];
    for (i; i < len; i++) {
      result.push(arr[i].join(' '));
    }
    return result;
  };

  /**
   * Sort and return an array by column
   * @function sortByUse
   * @param  {Array} arr input array
   * @param  {string} by  what to sort by
   * @return {Array}
   */
  const sortArrBy = (arr, by) => {
    let x = 3; // default to sort by lexical value
    if (by === 'weight') {
      x = 2;
    } else if (by === 'freq') {
      x = 1;
    }
    const sorter = (a, b) => {
      return a[x] - b[x];
    };
    return arr.sort(sorter);
  };

  /**
   * Prepare an object to be sorted by sortArrBy
   * @function prepareMatches
   * @param  {Object} obj input object
   * @param  {string} by  string
   * @param  {number} wc  word count
   * @param  {number} places  decimal places
   * @return {Array} sorted array
   */
  const prepareMatches = (obj, by, wc, places) => {
    let matches = [];
    for (let word in obj) {
      if (!obj.hasOwnProperty(word)) continue;
      let lex = (Number(obj[word][1]) / wc) * Number(obj[word][2]);
      lex = Number(lex.toFixed(places));
      matches.push([obj[word][0], obj[word][1], obj[word][2], lex]);
    }
    return sortArrBy(matches, by);
  };

  /**
  * Match an array against a lexicon object
  * @function getMatches
  * @param {Array} arr token array
  * @param {Object} lexicon lexicon object
  * @param {number} places decimal places
  * @param {number} min minimum weight threshold
  * @param {number} max maximum weight threshold
  * @return {Object} object of matches
  */
  const getMatches = (arr, lexicon, places, min, max) => {
    const matches = {};
    // loop through the lexicon categories
    let category;
    for (category in lexicon) {
      if (!lexicon.hasOwnProperty(category)) continue;
      let match = [];
      // loop through words in category
      let data = lexicon[category];
      let word;
      for (word in data) {
        if (!data.hasOwnProperty(word)) continue;
        // if word from input matches word from lexicon ...
        if (arr.indexOf(word) > -1) {
          let weight = Number((data[word]).toFixed(places));
          if (weight < max && weight > min) {
            // reps: number of times word appears in text
            let reps = indexesOf(arr, word).length;
            let item = [word, reps, weight];
            match.push(item);
          }
        }
      }
      matches[category] = match;
    }
    // return matches object
    return matches;
  };

  /**
  * Calculate the total lexical value of matches
  * @function calcLex
  * @param {Object} obj matches object
  * @param {number} wc wordcount
  * @param {number} int intercept value
  * @param {number} places decimal places
  * @return {number} lexical value
  */
  const calcLex = (obj, wc, int, places) => {
    let lex = 0;
    let word;
    for (word in obj) {
      if (!obj.hasOwnProperty(word)) continue;
      // (word frequency / total wordcount) * weight
      lex += (Number(obj[word][1]) / wc) * Number(obj[word][2]);
    }
    // add intercept value
    lex += int;
    // return final lexical value
    return Number(lex.toFixed(places));
  };

  /**
  * @function predictGender
  * @param {string} str input string
  * @param {Object} opts options object
  * @return {(string|number|Array)} predicted gender or array of matches
  */
  const predictGender = (str, opts) => {
    // no string return null
    if (!str) return null;
    // if str isn't a string, make it into one
    if (typeof str !== 'string') str = str.toString();
    // trim whitespace and convert to lowercase
    str = str.toLowerCase().trim();
    // options defaults
    if (!opts) {
      opts = {
        'output': 'gender',
        'nGrams': true,
        'wcGrams': false,
        'sortBy': 'lex',
        'places': 16,
        'max': 99,
        'min': -99,
      };
    }
    opts.output = opts.output || 'gender';
    opts.sortBy = opts.sortBy || 'lex';
    opts.nGrams = opts.nGrams || true;
    opts.wcGrams = opts.wcGrams || false;
    opts.places = opts.places || 16;
    opts.max = opts.max || 99;
    opts.min = opts.min || -99;
    let output = opts.output;
    const places = opts.places;
    // convert our string to tokens
    let tokens = tokenizer(str);
    // if there are no tokens return unknown or 0
    if (!tokens) return output === 'gender' ? 'Unknown' : 0;
    // get wordcount before we add ngrams
    let wordcount = tokens.length;
    // get n-grams
    if (opts.nGrams) {
      const bigrams = arr2string(simplengrams(str, 2));
      const trigrams = arr2string(simplengrams(str, 3));
      tokens = tokens.concat(bigrams, trigrams);
    }
    // recalculate wordcount if wcGrams is true
    if (opts.wcGrams) wordcount = tokens.length;
    // get matches from array
    const matches = getMatches(tokens, lexicon, places,
        opts.min, opts.max);
    // return match object if requested
    if (output === 'matches') {
      return prepareMatches(matches.GENDER, opts.sortBy, wordcount, places);
    }
    // calculate lexical useage
    const lex = calcLex(matches.GENDER, wordcount, (-0.06724152), places);
    // return lex if requested
    if (output === 'lex') return lex;
    // else calculate gender value
    let gender;
    if (lex < 0) {
      output === 'gender' ? gender = 'Male' : gender = -1;
    } else if (lex > 0) {
      output === 'gender' ? gender = 'Female' : gender = 1;
    } else {
      output === 'gender' ? gender = 'Unknown' : gender = 0;
    }
    // return gender
    return gender;
  };

  predictGender.noConflict = function() {
    global.predictGender = previous;
    return predictGender;
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = predictGender;
    }
    exports.predictGender = predictGender;
  } else {
    global.predictGender = predictGender;
  }
}).call(this);
