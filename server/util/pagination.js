
/**
   * pagination: This returns document with pagination
   * @function pagination
   * @param {integer} limit limit
   * @param {integer} offset offset
   * @param {integer} totalCount totalCount
   * @param {integer} item items could be list of docuemnts or users
   * @param {object} res response
   *  @param {string} message message
   * @return {object} - returns response status and json data
   */
module.exports.pagination
  = (limit, offset, totalCount, item) => {
    let pageCount = Math.round(totalCount / limit);
    pageCount = (pageCount < 1 && totalCount > 0) ? 1 : pageCount;
    const page = Math.round(offset / limit) + 1;
    const metaData = {
      page,
      pageCount,
      count: item.length,
      totalCount,
    };
    return metaData;
  };