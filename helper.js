function htmlEntities(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

var usedColors = [];

function getRandomColor() {
  // 16777215 == ffffff in decimal
  return Math.floor(Math.random()*16777215).toString(16);
}

function getColor() {
  var colorExists = true;
  var newColor = getRandomColor();
  while (colorExists) {
    if (usedColors.indexOf(newColor) === -1) {
      colorExists = false;
    }else{
      newColor = getRandomColor();
    }
  }
  usedColors.push(newColor);
  return newColor;
}

function removeColor(color) {
  const index = usedColors.indexOf(color);
  if (index > -1) {
    usedColors.splice(index, 1);
  }
}

module.exports = {
  htmlEntities,
  getColor,
  removeColor,
}