'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const response = await api(`/Bugs & Issues`);

    if ($.isErrorResponse(activity,response)) return;

    let issuesStatus = {
      title: T(activity,'Open Bugs And Issues'),
      link: 'https://airtable.com',
      linkLabel: T(activity,'All Bugs And Issues'),
    };

    let issueCount = response.body.records.length;

    if (issueCount != 0) {
      issuesStatus = {
        ...issuesStatus,
        description: issueCount > 1 ? T(activity,"You have {0} issues.", issueCount) : T(activity,"You have 1 issue."),
        color: 'blue',
        value: response.body.length,
        actionable: true
      };
    } else {
      issuesStatus = {
        ...issuesStatus,
        description: T(activity,'You have no issues.'),
        actionable: false
      };
    }

    activity.Response.Data = issuesStatus;
  } catch (error) {
    $.handleError(activity,error);
  }
};
