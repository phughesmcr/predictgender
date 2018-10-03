# predictGender - Node.js based gender prediction!

Predict the gender of a string's author.

## Usage
```javascript
const pg = require('predictgender');
const text = 'A long string of text....';
const gender = pg(text);
console.log(gender); // { GENDER: -1.63736172 }
```

## Default output
By default, predictGender will output an object with a 'GENDER' key and a lexical value:
```javascript
{ GENDER: -1.63736172 }
```
Negative numbers (< 0) = Male, 0 = Unknown, Positive numbers (> 0) = Female.

## The Options Object

The options object is optional and provides a number of controls to allow you to tailor the output to your needs. However, for general use it is recommended that all options are left to their defaults.

```javascript
const pg = require('predictgender');
// These are the default and recommended options
const opts = {  
  'encoding': 'freq',
  'locale': 'US',
  'logs': 3,
  'max': Number.POSITIVE_INFINITY,
  'min': Number.NEGATIVE_INFINITY,
  'noInt': false,
  'output': 'lex',
  'places': undefined,
  'sortBy': 'lex',
}
const text = 'A long string of text....';
const gender = pg(text, opts);
console.log(gender); // { GENDER: -1.63736172 }
```

### 'encoding'
**String - valid options: 'freq' (default), 'binary', or 'percent'**

*N.B - You probably don't want to change this, ever.*

Controls how the lexical value is calculated.

__Binary__ is simply the addition of lexical weights, i.e. word1 + word2 + word3.

__Frequency__ encoding takes the overall wordcount and word frequency into account, i.e. (word frequency / word count) * weight. Note that the encoding option accepts either 'freq' or 'frequency' to enable this option.

__Percent__ returns the percentage of total (non-unique) tokens matched against the lexicon in each category as a decimal, i.e. 0.48 = 48%.

### 'locale'
**String - valid options: 'US' (default), 'GB'**
The lexicon data is in American English (US), if the string(s) you want to analyse are in British English set the locale option to 'GB'.

### 'logs'
**Number - valid options: 0, 1, 2, 3 (default)**
Used to control console.log, console.warn, and console.error outputs.
* 0 = suppress all logs
* 1 = print errors only
* 2 = print errors and warnings
* 3 = print all console logs

### 'max' and 'min'

**Number - accepts floats**

Exclude words that have weights above the max threshold or below the min threshold.

By default these are set to positive and negative infinity respectively, ensuring that no words from the lexicon are excluded.

### 'noInt'

**Boolean - valid options: true or false (default)**

The lexica contain intercept values, set noInt to true to ignore these values.

Unless you have a specific need to ignore the intercepts, it is recommended you leave this set to false.

### 'output'

### 'output'
**String - valid options: 'lex' (default), 'gender', 'matches', 'number', or 'full'**

'lex' (Default) returns the lexical value, positive values being female, negative being male.

'gender' returns a string, "Male", "Female", or "Unknown".

'matches' returns an array of matched words along with the number of times each word appears, its weight, and its final lexical value (i.e. (appearances / word count) * weight). See the output section below for an example.

'number' returns -1 for male, 0 for indeterminate or unknown, and 1 for female.

'full' returns an object with number, lex, and matches keys as above.

### 'places'

**Number - valid options between 0 and 20 inclusive.**

Number of decimal places to limit outputted values to.

The default is "undefined" which will simply return the value unchanged.

### 'sortBy'

**String - valid options: 'lex' (default)', 'weight', or 'freq'**

If 'output' = 'matches', this option can be used to control how the outputted array is sorted.

'lex' (default) sorts by final lexical value, i.e. (word frequency * word count) / word weight.

'weight' sorts the array by the matched words initial weight.

'freq' sorts by word frequency, i.e. the most used words appear first.

By default the array is sorted by final lexical value, this is so you can see which words had the greatest impact on the prediction.

## {'output': 'matches'} output example
Setting "output" to "matches" in the options object makes predictGender output an array containing information about the lexical matches in your query.

Each match between the lexicon and your input is pushed into an array which contains: the term, the number of times that term appears in the text (its frequency), its weight in the lexicon, and its lexical value (i.e. (word freq / total word count) * weight) when 'freq' encoding is used).

By default the matches output array is sorted ascending by lexical value. This can be controlled using the "sortBy" option.

```javascript
{
  GENDER: {
    matches: [ 
      [ 'magnificent', 1, -192.0206116, -1.3914537072463768 ],
      [ 'capital', 1, -133.9311307, -0.9705154398550726 ],
      [ 'note', 3, -34.83417005, -0.7572645663043478 ],
      [ 'america', 2, -49.21227355, -0.7132213557971014 ],
      [ 'republic', 1, -75.5720402, -0.5476234797101449 ]
    ],
    info: {
      total_matches: 100,
      total_unique_matches: 63,
      total_tokens: 200,
      percent_matches: 50,
    },
  }
}
```

| Term          | Frequency | Weight (value)| Lexical Value (group norm) |
| ------------- | --------- | ------------- | ------------------- |
| 'magnificent' | 1         | -192.0206116  | -1.3914537072463768 |
| 'capital'     | 1         | -133.9311307  | -0.9705154398550726 |
| 'note'        | 3         | -34.83417005  | -0.7572645663043478 |
| 'america'     | 2         | -49.21227355  | -0.7132213557971014 |
| 'republic'    | 1         | -75.5720402   | -0.5476234797101449 |


## Acknowledgements

### References
Based on [Schwartz, H. A., Eichstaedt, J. C., Kern, M. L., Dziurzynski, L., Ramones, S. M., Agrawal, M., Shah, A., Kosinski, M., Stillwell, D., Seligman, M. E., & Ungar, L. H. (2013). Personality, Gender, and Age in the Language of Social Media: The Open-Vocabulary Approach. PLOS ONE, 8(9), e73791.](http://journals.plos.org/plosone/article/file?id=10.1371/journal.pone.0073791&type=printable)

### Lexicon
Using the gender lexicon data from [WWBP](http://www.wwbp.org/lexica.html) under the [Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/).

## License
(C) 2017-18 [P. Hughes](https://www.phugh.es). All rights reserved.

Shared under the [Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/) license.