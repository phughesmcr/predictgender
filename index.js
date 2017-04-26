/**
 * predictGender
 * v0.1.0
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
 * const text = "A big long string of text...";
 * let gender = pg(text);
 * console.log(gender)
 *
 * Male = 1
 * Female = 2
 * Errors or unknown = 0
 *
 * @param {string} str  {input string}
 * @return {number} {predicted gender}
 */

'use strict'
;(function () {
  const root = this
  const previous = root.predictGender

  const hasRequire = typeof require !== 'undefined'

  let tokenizer = root.tokenizer
  let lexicon = root.lexicon

  if (typeof _ === 'undefined') {
    if (hasRequire) {
      tokenizer = require('happynodetokenizer')
      lexicon = require('./data/lexicon.json')
    } else throw new Error('predictGender required happynodetokenizer and ./data/lexicon.json')
  }

  // get number of times el appears in an array
  Array.prototype.indexesOf = function (el) {
    var idxs = []
    for (var i = this.length - 1; i >= 0; i--) {
      if (this[i] === el) {
        idxs.unshift(i)
      }
    }
    return idxs
  }

  /**
  * @function getMatches
  * @param  {array} arr {token array}
  * @return {object} {object of matches in their respective categories}
  */
  const getMatches = (arr) => {
    let matches = {}
    // loop through the lexicon data
    const data = lexicon.GENDER
    let key
    for (key in data) {
      if (!data.hasOwnProperty(key)) continue
      let match = []
      if (arr.indexOf(key) > -1) {  // if there is a match between lexicon and input
        let item
        let weight = data[key]
        let reps = arr.indexesOf(key).length  // numbder of times the word appears in the input text
        if (reps > 1) { // if the word appears more than once, group all appearances in one array
          let words = []
          let i
          for (i = 0; i < reps; i++) {
            words.push(key)
          }
          item = [words, weight]
        } else {
          item = [key, weight]
        }
        match.push(item)
        matches[key] = match
      }
    }
    // return matches object
    return matches
  }

  /**
  * Calculate the lexical value of matched items in object
  * @function calcLex
  * @param  {object} obj {object of matched items}
  * @param  {number} wc  {total word count}
  * @param  {number} int {intercept value}
  * @return {number} {lexical value}
  */
  const calcLex = (obj, wc, int) => {
    let counts = []   // number of matched objects
    let weights = []  // weights of matched objects
    // loop through the matches and get the word frequency (counts) and weights
    let key
    for (key in obj) {
      if (!obj.hasOwnProperty(key)) continue
      if (Array.isArray(obj[key][0][0])) {  // if the first item in the match is an array, the item is a duplicate
        counts.push(obj[key][0][0].length)  // for duplicate matches
      } else {
        counts.push(1)                      // for non-duplicates
      }
      weights.push(obj[key][0][1])          // corresponding weight
    }
    // calculate lexical usage value
    let lex = 0
    counts.forEach(function (a, b) {
      // (word frequency / total word count) * weight
      lex += (a / wc) * weights[b]
    })
    // return final lexical value + intercept
    return lex + int
  }

  /**
  * @function predictGender
  * @param  {string} str {string input}
  * @return {type} {description}
  */
  const predictGender = (str) => {
    // no string return 0
    if (str == null) return 0
    // if str isn't a string, make it into one
    if (typeof str !== 'string') str = str.toString()
    // trim whitespace and convert to lowercase
    str = str.toLowerCase().trim()
    // convert our string to tokens
    const tokens = tokenizer(str)
    // if there are no tokens return crud
    if (tokens == null) return 0
    // get matches from array
    const matches = getMatches(tokens)
    // calculate lexical useage
    const lex = calcLex(matches, tokens.length, (-0.06724152))
    // convert lex value to gender number
    let gender = 0 // unknown
    if (lex < 0) {
      gender = 1 // male
    } else if (lex > 0) {
      gender = 2 // female
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
