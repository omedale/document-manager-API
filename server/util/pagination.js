
/**
   * pagination: This returns documents and users with pagination
   * @function pagination
   * @param {integer} limit limit
   * @param {integer} offset offset
   * @param {integer} totalCount totalCount
   * @param {object} data data
   * @param {object} res response
   *  @param {string} message message
   * @return {object} - returns response status and json data
   */
module.exports.pagination
  = (limit, offset, totalCount, data, res, message) => {
    let pageCount = Math.round(totalCount / limit);
    pageCount = (pageCount < 1 && totalCount > 0) ? 1 : pageCount;
    const page = Math.round(offset / limit) + 1;

    const metaData = {
      page,
      pageCount,
      count: data.length,
      totalCount,
    };
    if (message === 'document') {
      return res.status(200).send({
        documents: data,
        metaData
      });
    } else {
      return res.status(200).send({
        users: data,
        metaData
      });
    }
  };