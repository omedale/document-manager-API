
/**
   * paginationHelper: This returns document with pagination
   * @function paginationHelper
   * @param {integer} limit limit
   * @param {integer} offset offset
   * @param {integer} totalCount totalCount
   * @param {integer} documents documents
   * @param {object} res response
   * @return {object} - returns response status and json data
   */
module.exports.documentPaginationHelper
  = (limit, offset, totalCount, documents, res) => {
    let pageCount = Math.round(totalCount / limit);
    pageCount = (pageCount < 1 && totalCount > 0) ? 1 : pageCount;
    const page = Math.round(offset / limit) + 1;
    return res.status(200).send({
      documents,
      metaData: {
        page,
        pageCount,
        count: documents.length,
        totalCount,
      }
    });
  };
/**
   * userPaginationHelper: This returns users with pagunation
   * @function userPaginationHelper
   * @param {integer} limit limit
   * @param {integer} offset offset
   * @param {integer} totalCount totalCount
   * @param {integer} userslist users
   * @param {object} res response
   * @return {object} - returns response status and json data
   */
module.exports.userPaginationHelper
  = (limit, offset, totalCount, userslist, res) => {
    let pageCount = Math.round(totalCount / limit);
    pageCount = (pageCount < 1 && totalCount > 0) ? 1 : pageCount;
    const page = Math.round(offset / limit) + 1;
    return res.status(200).send({
      users: userslist,
      metaData: {
        page,
        pageCount,
        count: userslist.length,
        totalCount,
      }
    });
  };