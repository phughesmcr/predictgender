# predictgender - Node.js based Gender Prediction

Predict the gender of a string's author.

## Usage
```Javascript
const pg = require('predictgender')
const ret = 'gender' // Valid options include: 'number', 'lex', or 'gender' (default)
const text = "A long string of text...."
const gender = pg(text, ret)
```

## Options

### "ret"

Valid options include: 'number', 'lex', or 'gender' (default)

Number returns -1 for male, 0 for indeterminate or unknown, and 1 for female.

Lex returns the lexical value, positive values being female, negative being male.

Gender returns a string, "Male", "Female", or "Unknown"

## Acknowledgements

### References
Schwartz, H. A., Eichstaedt, J. C., Kern, M. L., Dziurzynski, L., Ramones, S. M., Agrawal, M., Shah, A., Kosinski, M., Stillwell, D., Seligman, M. E., & Ungar, L. H. (2013). Personality, gender, and age in the language of social media: The Open-Vocabulary Approach. PLOS ONE, 8(9), . . e73791.

### Lexicon
Using the gender lexicon data from [WWBP](http://www.wwbp.org/lexica.html)

Used under the Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported licence

## Licence
(C) 2017 [P. Hughes](https://www.phugh.es)
[Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/)
