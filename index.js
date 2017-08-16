/**
 * predictGender
 * v0.5.0
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
 * Using the gender lexicon data from http://www.wwbp.org/lexica.html
 * Used under the Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported licence
 *
 * (C) 2017 P. Hughes
 * Licence : Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 * http://creativecommons.org/licenses/by-nc-sa/3.0/
 *
 * Usage example:
 * const pg = require('predictgender);
 * const opts = {
 *    'ret': 'gender',  // return: 'gender' (default) returns the gender as a
 *                          string, e.g. "Male". Or return: 'lex', returns the
 *                          lexical value. Or return: 'number', returns the
 *                          gender as a number, i,e, -1 = male,
 *                          0 = indeterminate, 1 = female.
 *    'nGrams': true,   // boolean - include bigrams / trigrams (true - default)
 *    'wcGrams': false, // boolean - take word count before (false - default) or
 *                          after (true) n-Grams have been added
 *    'sortBy': 'lex' // if ret = 'matches', sortBy can be used to sort the
 *                          returned matches array. Acceptable options are
 *                          'total' sorts array by total weight
 *                          (i.e. use frequency * weight), 'weight' sorts by
 *                          singular weight, 'freq' sorts by word frequency, or
 *                          'lex' (default) sorts by final lexical value
 *                          (i.e. (word freq / word count) * weight)
 * }
 * const str = "A big long string of text...";
 * const gender = pg(str, opts);
 * console.log(gender)
 *
 * @param {string} str input string
 * @param {Object} opts options object
 * @return {(string||number)} predicted gender
 */

'use strict'
;(function () {
  const root = this
  const previous = root.predictGender

  let lexicon = root.lexicon
  let simplengrams = root.simplengrams
  let tokenizer = root.tokenizer

  if (typeof lexicon === 'undefined') {
    if (typeof require !== 'undefined') {
      lexicon = require('./data/lexicon.json')
      simplengrams = require('simplengrams')
      tokenizer = require('happynodetokenizer')
    } else throw new Error('predictGender requires happynodetokenizer and simplengrams, and ./data/lexicon.json')
  }

  /**
   * Get the indexes of duplicate elements in an array
   * @function indexesOf
   * @param  {Array} arr input array
   * @param  {string} el element to test against
   * @return {Array} array of indexes
   */
  const indexesOf = (arr, el) => {
    const idxs = []
    let i = arr.length
    while (i--) {
      if (arr[i] === el) {
        idxs.unshift(i)
      }
    }
    return idxs
  }

  /**
   * Combines multidimensional array elements into strings
   * @function arr2string
   * @param  {Array} arr input array
   * @return {Array} output array
   */
  const arr2string = arr => {
    let i = 0
    const len = arr.length
    const result = []
    for (i; i < len; i++) {
      result.push(arr[i].join(' '))
    }
    return result
  }

  /**
   * Sort and return an array by column
   * @function sortByUse
   * @param  {Array} arr input array
   * @param  {string} by  what to sort by
   * @return {Array}
   */
  const sortByUse = (arr, by) => {
    let x = 4 // default to sort by lexical value
    if (by === 'total') {
      x = 3
    } else if (by === 'weight') {
      x = 2
    } else if (by === 'freq') {
      x = 1
    }
    const sorter = (a, b) => {
      return a[x] - b[x]
    }
    return arr.sort(sorter)
  }

  /**
   * Prepare an object to be sorted by sortByUse
   * @function prepareMatches
   * @param  {Object} obj input object
   * @param  {string} by  string
   * @param  {number} wc  word count
   * @return {Array} sorted array
   */
  const prepareMatches = (obj, by, wc) => {
    let matches = []
    for (let word in obj) {
      if (!obj.hasOwnProperty(word)) continue
      let total = Number(obj[word][1]) * Number(obj[word][2])
      let lex = (Number(obj[word][1]) / wc) * Number(obj[word][2])
      matches.push([obj[word][0], obj[word][1], obj[word][2], total, lex])
    }
    return sortByUse(matches, by)
  }

  /**
  * Match an array against a lexicon object
  * @function getMatches
  * @param {Array} arr token array
  * @param {Object} lexicon lexicon object
  * @return {Object} object of matches
  */
  const getMatches = (arr, lexicon) => {
    const matches = {}
    // loop through the lexicon categories
    let category
    for (category in lexicon) {
      if (!lexicon.hasOwnProperty(category)) continue
      let match = []
      // loop through words in category
      let data = lexicon[category]
      let word
      for (word in data) {
        if (!data.hasOwnProperty(word)) continue
        // if word from input matches word from lexicon ...
        if (arr.indexOf(word) > -1) {
          let weight = data[word]
          let reps = indexesOf(arr, word).length // number of times the word appears in the input text
          let item = [word, reps, weight]
          match.push(item)
        }
      }
      matches[category] = match
    }
    // return matches object
    return matches
  }

  /**
  * Calculate the total lexical value of matches
  * @function calcLex
  * @param {Object} obj matches object
  * @param {number} wc wordcount
  * @param {number} int intercept value
  * @return {number} lexical value
  */
  const calcLex = (obj, wc, int) => {
    let word
    let lex = 0
    for (word in obj) {
      if (!obj.hasOwnProperty(word)) continue
      // (word frequency / total wordcount) * weight
      lex += (Number(obj[word][1]) / wc) * Number(obj[word][2])
    }
    // add intercept value
    lex += int
    // return final lexical value
    return lex
  }

  /**
  * @function predictGender
  * @param {string} str string input
  * @param {Object} opts options object
  * @return {(string||number)}
  */
  const predictGender = (str, opts) => {
    // no string return 0
    if (str == null) return null
    // if str isn't a string, make it into one
    if (typeof str !== 'string') str = str.toString()
    // trim whitespace and convert to lowercase
    str = str.toLowerCase().trim()
    // options defaults
    if (opts == null) {
      opts = {
        'ret': 'gender',
        'nGrams': true,
        'wcGrams': false,
        'sortBy': 'total'
      }
    }
    opts.ret = opts.ret || 'gender'
    opts.sortBy = opts.sortBy || 'total'
    opts.wcGrams = opts.wcGrams || false
    const ret = opts.ret
    // convert our string to tokens
    let tokens = tokenizer(str)
    // if there are no tokens return unknown or 0
    if (tokens == null) return ret === 'gender' ? 'Unknown' : 0
    // get wordcount before we add ngrams
    let wordcount = tokens.length
    // get n-grams
    if (opts.nGrams) {
      const ngrams = []
      ngrams.push(arr2string(simplengrams(str, 2)))
      ngrams.push(arr2string(simplengrams(str, 3)))
      const nLen = ngrams.length
      let i = 0
      for (i; i < nLen; i++) {
        tokens = tokens.concat(ngrams[i])
      }
    }
    // recalculate wordcount if wcGrams is true
    if (opts.wcGrams) wordcount = tokens.length
    // get matches from array
    const matches = getMatches(tokens, lexicon)
    // return match object if requested
    if (ret === 'matches') return prepareMatches(matches.GENDER, opts.sortBy, wordcount)
    // calculate lexical useage
    const lex = calcLex(matches.GENDER, wordcount, (-0.06724152))
    // return lex if requested
    if (ret === 'lex') return lex
    // else calculate gender value
    let gender = 0 // 0 = unknown
    if (lex < 0) {
      ret === 'gender' ? gender = 'Male' : gender = -1
    } else if (lex > 0) {
      ret === 'gender' ? gender = 'Female' : gender = 1
    } else {
      ret === 'gender' ? gender = 'Unknown' : gender = 0
    }
    // return gender
    return gender
  }

  predictGender.noConflict = function () {
    root.predictGender = previous
    return predictGender
  }

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = predictGender
    }
    exports.predictGender = predictGender
  } else {
    root.predictGender = predictGender
  }
}).call(this)
