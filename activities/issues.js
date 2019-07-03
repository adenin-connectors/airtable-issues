'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    let allIssues = [];
    api.initialize(activity);
    const dateRange = $.dateRange(activity);
    const response = await api(`?filterByFormula=AND(IS_AFTER(CREATED_TIME(),'${dateRange.startDate}'),
    IS_BEFORE(CREATED_TIME(),'${dateRange.endDate}'))&pageSize=100&sort[0][field]=Opened Date&sort[0][direction]=desc`);

    if ($.isErrorResponse(activity, response)) return;
    allIssues.push(...response.body.records);

    let nextPageToken = response.body.offset;

    while (nextPageToken) {
      const nextPage = await api(`?filterByFormula=AND(IS_AFTER(CREATED_TIME(),'${dateRange.startDate}'),
      IS_BEFORE(CREATED_TIME(),'${dateRange.endDate}'))&offset=${nextPageToken}&pageSize=100&sort[0][field]=Opened Date&sort[0][direction]=desc`);
      if ($.isErrorResponse(activity, nextPage)) return;
      allIssues.push(...nextPage.body.records);
      nextPageToken = nextPage.body.offset;
    }

    let value = allIssues.length;
    let pagination = $.pagination(activity);
    let pagiantedItems = api.paginateItems(allIssues, pagination);

    activity.Response.Data.items = api.convertResponse(pagiantedItems);
    if (parseInt(pagination.page) == 1) {
      activity.Response.Data.title = T(activity, 'All Issues');
      activity.Response.Data.link = `https://airtable.com/${activity.Context.connector.custom2}`;
      activity.Response.Data.linkLabel = T(activity, 'All Issues');
      activity.Response.Data.actionable = value > 0;
      activity.Response.Data.value = value;

      if (value > 0) {
        activity.Response.Data.color = 'blue';
        activity.Response.Data.date = allIssues[0].createdTime; // items are alrady sorted by date descending in api request
        activity.Response.Data.description = value > 1 ? T(activity, "You have {0} issues.", value)
          : T(activity, "You have 1 issue.");
      } else {
        activity.Response.Data.description = T(activity, 'You have no issues.');
      }
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};