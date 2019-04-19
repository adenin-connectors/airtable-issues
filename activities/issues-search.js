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
    const response = await api(`/Bugs & Issues?offset=${offset}&pageSize=${pageSize}
    &filterByFormula=FIND("${searchParam}",CONCATENATE(Name," - ", Description))`);

    if ($.isErrorResponse(activity, response)) return;

    activity.Response.Data = convertResponse(response);
    if (response.body.offset) activity.Response.Data.providedOffset = response.body.offset;
  } catch (error) {
    $.handleError(activity,error);
  }
};
/**maps response data to items */
function convertResponse(response) {
  let items = [];
  let records = response.body.records;

  for (let i = 0; i < records.length; i++) {
    let raw = records[i];
    let item = { id: raw.id, title: raw.fields.Name, description: raw.fields.Description, link: 'https://airtable.com', raw: raw };
    items.push(item);
  }

  return { items: items };
}