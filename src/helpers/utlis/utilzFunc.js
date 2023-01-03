export function generateRandomColor() {
  let newColor;
  do {
    newColor = "#" + ((Math.random() * 0xffffff) << 0).toString(16);
  } while (newColor.length < 7);
  {
    return newColor;
  }
}
export const sortAlphabets = (arr, sortedField) => {
  let sortedArray = arr.sort(function (o1, o2) {
    var t1 = o1[sortedField].toLowerCase(),
      t2 = o2[sortedField].toLowerCase();

    return t1 > t2 ? 1 : t1 < t2 ? -1 : 0;
  });
  return sortedArray;
};
export const isResultEmpty=(result)=> {
  return result.every((resultSet) => resultSet.data.length === 0);
}
