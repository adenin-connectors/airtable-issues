'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const response = await api(`?filterByFormula=IF(Closed="",TRUE(),FALSE())`);

    if ($.isErrorResponse(activity, response)) return;

    let status = {
      title: T(activity, 'Open Bugs And Issues'),
      link: `https://airtable.com/${activity.Context.connector.custom2}`,
      linkLabel: T(activity, 'All Bugs And Issues'),
    };

    let value = response.body.records.length;

    if (value != 0) {
      status = {
        ...status,
        description: value > 1 ? T(activity, "You have {0} issues.", value) : T(activity, "You have 1 issue."),
        color: 'blue',
        value: value,
        actionable: true
      };
    } else {
      status = {
        ...status,
        description: T(activity, 'You have no issues.'),
        actionable: false
      };
    }

    activity.Response.Data = status;
  } catch (error) {
    $.handleError(activity, error);
  }
};
