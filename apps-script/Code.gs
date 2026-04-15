function doPost(e) {
  var sheetId = "1_IuVymQC4mOpTNFjRAP3OAM55N-nqG5OML2ArIHwA10";
  var sheetName = "Form_Responses";
  var ss = SpreadsheetApp.openById(sheetId);
  var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

  var headers = [
    "timestamp",
    "fullName",
    "birthDate",
    "classInfo",
    "phone",
    "email",
    "facebook",
    "motivation",
    "goal",
    "weeklyTime",
    "skills",
    "programming",
    "otherSkill",
    "seriousActivity",
    "newTaskApproach",
    "workPriority",
    "priorityReason",
    "weeklyMeeting",
    "commitPeriod",
    "personalCommitment",
    "firstMonthContribution"
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  var values = headers.map(function (key) {
    return e.parameter[key] || "";
  });

  try {
    sheet.appendRow(values);
    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
