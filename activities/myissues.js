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
    const response = await api(`?filterByFormula=NOT(OR(Status = "Complete", Status ="Won't fix", Status = "By design"))
        &offset=${offset}&pageSize=${pageSize}`);

    if ($.isErrorResponse(activity, response)) return;

    // convert response to items[]
    activity.Response.Data = api.convertResponse(response);
    activity.Response.Data.title = T(activity, 'My Issues');
    activity.Response.Data.link = `https://airtable.com/${activity.Context.connector.custom3}`;
    activity.Response.Data.linkLabel = T(activity, 'Go to Airtable Issues');

    if (response.body.offset) activity.Response.Data._nextpage = response.body.offset;
  } catch (error) {
    $.handleError(activity, error);
  }
};