/**
 * predictGender
 * v0.2.0
 *
 * Predict the gender of a string's author.
 *
 * Help me make this better:
 * https://github.com/phugh/predictGender
 *
 * Based on this paper:
 * Schwartz, H. A., Eichstaedt, J. C., Kern, M. L., Dziurzynski, L., Ramones, S. M., Agrawal, M., Shah, A., Kosinski, M., Stillwell, D., Seligman, M. E., & Ungar, L. H. (2013). Personality, gender, and age in the language of social media: The Open-Vocabulary Approach. PLOS ONE, 8(9), . . e73791.
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
 *  'return': 'gender', // return 'gender' (default) as a string, e.g. "Male" or return 'lex' the lexical value, or 'number' -1 = male, 0 = indeterminate, 1 = female
 *  'ngrams': true      // include bigrams and trigrams in analysis, not recommended for long strings
 * }
 * const text = "A big long string of text...";
 * const gender = pg(text, opts);
 * console.log(gender)
 *
 * @param {string} str  input string
 * @param {Object} opts options object
 * @return {string||number} predicted gender
 */

'use strict'
;(function () {
  const root = this
  const previous = root.predictGender

  const hasRequire = typeof require !== 'undefined'

  let tokenizer = root.tokenizer
  let lexicon = root.lexicon
  let natural = root.natural

  if (typeof _ === 'undefined') {
    if (hasRequire) {
      tokenizer = require('happynodetokenizer')
      lexicon = require('./data/lexicon.json')
      natural = require('natural')
    } else throw new Error('predictGender required happynodetokenizer and ./data/lexicon.json')
  }

  // get number of times el appears in an array
  Array.prototype.indexesOf = function (el) {
    const idxs = []
    let i = this.length - 1
    for (i; i >= 0; i--) {
      if (this[i] === el) {
        idxs.unshift(i)
      }
    }
    return idxs
  }

  /**
  * @function getBigrams
  * @param  {string} str input string
  * @return {Array} array of bigram strings
  */
  const getBigrams = str => {
    const NGrams = natural.NGrams
    const bigrams = NGrams.bigrams(str)
    const result = []
    const len = bigrams.length
    let i = 0
    for (i; i < len; i++) {
      result.push(bigrams[i].join(' '))
    }
    return result
  }

  /**
  * @function getTrigrams
  * @param  {string} str input string
  * @return {Array} array of trigram strings
  */
  const getTrigrams = str => {
    const NGrams = natural.NGrams
    const trigrams = NGrams.trigrams(str)
    const result = []
    const len = trigrams.length
    let i = 0
    for (i; i < len; i++) {
      result.push(trigrams[i].join(' '))
    }
    return result
  }

  /**
  * @function getMatches
  * @param  {Array} arr token array
  * @param  {Object} lexicon  lexicon object
  * @return {Object}  object of matches
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
      let key
      for (key in data) {
        if (!data.hasOwnProperty(key)) continue
        // if word from input matches word from lexicon ...
        if (arr.indexOf(key) > -1) {
          let item
          let weight = data[key]
          let reps = arr.indexesOf(key).length // numbder of times the word appears in the input text
          if (reps > 1) { // if the word appears more than once, group all appearances in one array
            let words = []
            for (let i = 0; i < reps; i++) {
              words.push(key)
            }
            item = [words, weight]
          } else {
            item = [key, weight]
          }
          match.push(item)
        }
      }
      matches[category] = match
    }
    // return matches object
    return matches
  }

  /**
  * @function calcLex
  * @param  {Object} obj      matches object
  * @param  {number} wc       wordcount
  * @param  {number} int      intercept value
  * @return {number} lexical value
  */
  const calcLex = (obj, wc, int) => {
    const counts = []   // number of matched objects
    const weights = []  // weights of matched objects
    // loop through the matches and get the word frequency (counts) and weights
    let key
    for (key in obj) {
      if (!obj.hasOwnProperty(key)) continue
      if (Array.isArray(obj[key][0])) { // if the first item in the match is an array, the item is a duplicate
        counts.push(obj[key][0].length) // for duplicate matches
      } else {
        counts.push(1)                  // for non-duplicates
      }
      weights.push(obj[key][1])         // corresponding weight
    }
    // calculate lexical usage value
    let lex = 0
    let i
    const len = counts.length
    const words = Number(wc)
    for (i = 0; i < len; i++) {
      let weight = Number(weights[i])
      let count = Number(counts[i])
      // (word frequency / total word count) * weight
      lex += (count / words) * weight
    }
    // add intercept value
    lex += int
    // return final lexical value
    return lex
  }

  /**
  * @function predictGender
  * @param  {string} str  string input
  * @param  {Object} opts options object
  * @return {number||string}
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
        'return': 'gender',
        'ngrams': true
      }
    }
    opts.return = opts.return || 'gender'
    // convert our string to tokens
    let tokens = tokenizer(str)
    // if there are no tokens return 0
    if (tokens == null) return 0
    // get wordcount before we add ngrams
    const wordcount = tokens.length
    // handle bigrams and trigrams if wanted
    if (opts.ngrams) {
      const bigrams = getBigrams(str)
      const trigrams = getTrigrams(str)
      tokens = tokens.concat(bigrams, trigrams)
    }
    // get matches from array
    const matches = getMatches(tokens, lexicon)
    // calculate lexical useage
    const lex = calcLex(matches.GENDER, wordcount, (-0.06724152))
    // return lex if requested
    if (opts.return === 'lex') return lex
    // else calculate gender value
    let gender = 0 // unknown
    const out = opts.return
    if (lex < 0) {
      // Male
      out === 'gender' ? gender = 'Male' : gender = -1
    } else if (lex > 0) {
      out === 'gender' ? gender = 'Female' : gender = 1
    } else {
      out === 'gender' ? gender = 'Unknown' : gender = 0
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
