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
    const response = await api(`?filterByFormula=IF(Status="",TRUE(),FALSE())
        &offset=${offset}&pageSize=${pageSize}`);

    if ($.isErrorResponse(activity, response)) return;

    // provide status information
    let status = {
      title: T(activity, 'New Issues'),
      link: `https://airtable.com/${activity.Context.connector.custom3}`,
      linkLabel: T(activity, 'Go to Airtable'),
    };

    let value = response.body.records.length;

    if (value != 0) {
      status = {
        ...status,
        description: value > 1 ? T(activity, "{0} new issues", value) : T(activity, "1 new issue"),
        xcolor: 'red',
        value: value,
        actionable: true
      };
    } else {
      status = {
        ...status,
        description: T(activity, 'No new issues.'),
        actionable: false
      };
    }

    activity.Response.Data = status;

    // convert response to items[]
    activity.Response.Data.items = api.convertResponse(response);
 
    if (response.body.offset) activity.Response.Data._nextpage = response.body.offset;
    
  } catch (error) {
    $.handleError(activity, error);
  }
};