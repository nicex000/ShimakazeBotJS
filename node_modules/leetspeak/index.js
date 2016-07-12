var map = {
   'a': '4',
   'e': '3',
   'f': 'ph',
   'g': '9',
   'l': '1',
   'o': '0',
   's': '5',
   't': '7',
   'y': '`/'
};

module.exports = function (str) {
   if (str === null || typeof str === 'undefined') {
      return;
   }

   var newStr = '';

   for (var i = 0; i < str.length; i++) {
      newStr += map[str[i].toLowerCase()] || str[i];
   }

   return newStr;
}