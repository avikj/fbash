

module.exports = function(a, b){
  if(a === b) return true;
  if(a == null || b == null) return false;
  if(a.length != b.length)  return false;

  for(var i = 0; i < a.length; i++)
    if(a[i].url != b[i].url)
      return false;
  return true;
}