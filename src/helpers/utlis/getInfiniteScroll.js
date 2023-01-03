export const getInfiniteScroll = (list, limit, page) => {
    const start = limit * page - limit;
    const ending = limit * page + 1;
    console.log(list.slice(0, ending));
    return list.slice(0, ending);
  };
  