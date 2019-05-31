'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    var pagination = $.pagination(activity);
    let pageSize = parseInt(pagination.pageSize);
    let offset = 0;

    if (activity.Request.Data && activity.Request.Data.args && activity.Request.Data.args.atAgentAction === 'nextpage') {
      offset = activity.Request.Data.args.providedOffset;
    }

    api.initialize(activity);
    let searchParam = activity.Request.Query.query;
    const response = await api(`?offset=${offset}&pageSize=${pageSize}
        &filterByFormula=FIND("${searchParam}",CONCATENATE(Name," - ", Description))`);

    if ($.isErrorResponse(activity, response)) return;

    activity.Response.Data = api.convertResponse(response.body.records);
    activity.Response.Data.title = T(activity, 'My Issues');
    activity.Response.Data.link = `https://airtable.com/${activity.Context.connector.custom2}`;
    activity.Response.Data.linkLabel = T(activity, 'Go to Airtable Issues');

    if (response.body.offset) activity.Response.Data.providedOffset = response.body.offset;
  } catch (error) {
    $.handleError(activity, error);
  }
};
