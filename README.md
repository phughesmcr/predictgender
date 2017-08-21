# predictgender - Node.js based Gender Prediction

Predict the gender of a string's author.

## Usage
```Javascript
const pg = require('predictgender')
// These are the default options:
const opts = {
  'output': 'gender'
  'nGrams': true,
  'wcGrams': false,
  'sortBy': 'lex',
  'places': 16,
  'max': 99,
  'min': -99
}
const text = 'A long string of text....'
const gender = pg(text, opts)
console.log(gender)
```

## The Options Object

The options object is optional and provides a number of controls to allow you to tailor the output to your needs. However, for general use it is recommended that all options are left to their defaults.

### 'output'

**String - valid options: 'gender' (default), 'lex', 'matches', or 'number'**

'gender' (Default) returns a string, "Male", "Female", or "Unknown".

'matches' returns an array of matched words along with the number of times each word appears, its weight, and its final lexical value (i.e. (appearances / word count) * weight). See the output section below for an example.

'number' returns -1 for male, 0 for indeterminate or unknown, and 1 for female.

'lex' returns the lexical value, positive values being female, negative being male.

### 'nGrams'

**Boolean - valid options: true (default) or false**

n-Grams are contiguous pieces of text, bi-grams being chunks of 2, tri-grams being chunks of 3, etc.

Use the nGrams option to include (true) or exclude (false) n-grams. For accuracy it is recommended that n-grams are included, however including n-grams for very long strings can detrement performance.

### 'wcGrams'

**Boolean - valid options: true or false (default)**

When set to true, the output from the nGrams option will be added to the word count.

For accuracy it is recommended that this is set to false.

### 'sortBy'

**String - valid options: 'lex' (default)', 'weight', or 'freq'**

If 'output' = 'matches', this option can be used to control how the outputted array is sorted.

'lex' (default) sorts by final lexical value, i.e. (word frequency * word count) / word weight.

'weight' sorts the array by the matched words initial weight.

'freq' sorts by word frequency, i.e. the most used words appear first.

By default the array is sorted by final lexical value, this is so you can see which words had the greatest impact on the prediction - i.e. the words at the beginning of the array will be the most masculine, progressing toward the most feminine words at the end on the array.

### "places"

**Number**

Number of decimal places to limit outputted values to.

The default is 16 decimal places as this is accuracy level the lexicon data provides.

### "max" and "min"

**Float**

Exclude words that have weights above the max threshold or below the min threshold.

By default these are set to extreme values of 99 (max) and -99 (min) ensuring that no words from the lexicon are excluded.

## {"output": "matches"} output example
Setting "output" to "matches" in the options object makes predictGender output an array containing information about the lexical matches in your query.

Each match between the lexicon and your input is pushed into an array which contains: the word, the number of times that word appears in the text (its frequency), its weight in the lexicon, and its lexical value (i.e. (word freq / total word count) * weight)).

By default the matches output array is sorted ascending by lexical value. This can be controlled using the "sortBy" option.

```javascript
[
  [ 'magnificent', 1, -192.0206116, -1.3914537072463768 ],
  [ 'capital', 1, -133.9311307, -0.9705154398550726 ],
  [ 'note', 3, -34.83417005, -0.7572645663043478 ],
  [ 'america', 2, -49.21227355, -0.7132213557971014 ],
  [ 'republic', 1, -75.5720402, -0.5476234797101449 ]
]
```

| Word          | Frequency | Weight        | Lexical Val.        |
| ------------- | --------- | ------------- | ------------------- |
| 'magnificent' | 1         | -192.0206116  | -1.3914537072463768 |
| 'capital'     | 1         | -133.9311307  | -0.9705154398550726 |
| 'note'        | 3         | -34.83417005  | -0.7572645663043478 |
| 'america'     | 2         | -49.21227355  | -0.7132213557971014 |
| 'republic'    | 1         | -75.5720402   | -0.5476234797101449 |

## Acknowledgements

### References
Schwartz, H. A., Eichstaedt, J. C., Kern, M. L., Dziurzynski, L., Ramones, S. M., Agrawal, M., Shah, A., Kosinski, M., Stillwell, D., Seligman, M. E., & Ungar, L. H. (2013). Personality, gender, and age in the language of social media: The Open-Vocabulary Approach. PLOS ONE, 8(9), . . e73791.

### Lexicon
Using the gender lexicon data from [WWBP](http://www.wwbp.org/lexica.html) under the [Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/).

## Licence
(C) 2017 [P. Hughes](https://www.phugh.es).

[Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/).
