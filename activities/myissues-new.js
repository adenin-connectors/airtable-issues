'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    var dateRange = $.dateRange(activity, "today");
    const response = await api(`?filterByFormula=AND(IS_BEFORE(CREATED_TIME(),'${dateRange.startDate}'),
        NOT(OR(Status = "Complete", Status ="Won't fix", Status = "By design")))`);

    if ($.isErrorResponse(activity, response)) return;

    let issuesStatus = {
      title: T(activity, 'New Bugs And Issues'),
      link: `https://airtable.com/${activity.Context.connector.custom3}`,
      linkLabel: T(activity, 'All Bugs And Issues'),
    };

    let issueCount = response.body.records.length;

    if (issueCount != 0) {
      issuesStatus = {
        ...issuesStatus,
        description: issueCount > 1 ? T(activity, "You have {0} issues.", issueCount) : T(activity, "You have 1 issue."),
        color: 'blue',
        value: issueCount,
        actionable: true
      };
    } else {
      issuesStatus = {
        ...issuesStatus,
        description: T(activity, 'You have no issues.'),
        actionable: false
      };
    }

    activity.Response.Data = issuesStatus;
  } catch (error) {
    $.handleError(activity, error);
  }
};
