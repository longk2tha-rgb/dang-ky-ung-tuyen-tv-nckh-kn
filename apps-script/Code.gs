function getConfig() {
  return {
    sheetId: "1_IuVymQC4mOpTNFjRAP3OAM55N-nqG5OML2ArIHwA10",
    sheetName: "Form_Responses"
  };
}

function getFormFields() {
  return [
    { key: "timestamp", label: "Dấu thời gian" },
    { key: "fullName", label: "1. Họ và tên" },
    { key: "birthDate", label: "2. Ngày sinh" },
    { key: "classField", label: "3. Lớp" },
    { key: "department", label: "4. Khoa" },
    { key: "courseYear", label: "5. Khóa" },
    { key: "phone", label: "6. Số điện thoại" },
    { key: "email", label: "7. Địa chỉ email liên hệ" },
    { key: "facebook", label: "8. Link Facebook (nếu có)" },
    { key: "motivation", label: "9. Lý do mong muốn tham gia nhóm" },
    { key: "goal", label: "10. Mục tiêu cá nhân sau 3-6 tháng" },
    { key: "weeklyTime", label: "11. Thời gian dành cho nhóm mỗi tuần" },
    { key: "skills", label: "12. Kỹ năng liên quan" },
    { key: "programming", label: "13. Lập trình (ngôn ngữ)" },
    { key: "otherSkill", label: "14. Kỹ năng khác" },
    { key: "seriousActivity", label: "15. Mô tả một việc đã làm nghiêm túc" },
    { key: "newTaskApproach", label: "16. Cách xử lý nhiệm vụ mới" },
    { key: "workPriority", label: "17. Yếu tố quan trọng hơn trong công việc" },
    { key: "priorityReason", label: "18. Giải thích lựa chọn" },
    { key: "weeklyMeeting", label: "19. Cam kết họp định kỳ" },
    { key: "commitPeriod", label: "20. Cam kết tối thiểu 03-06 tháng" },
    { key: "personalCommitment", label: "21. Cam kết cụ thể khi tham gia" },
    { key: "aiTools", label: "22. 3 công cụ AI đã sử dụng" },
    { key: "aiPrompt", label: "23. Prompt AI tạo bài thuyết trình" }
  ];
}

function getOrCreateSheet() {
  var config = getConfig();
  var ss = SpreadsheetApp.openById(config.sheetId);
  return ss.getSheetByName(config.sheetName) || ss.insertSheet(config.sheetName);
}

function ensureHeaders(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return;
  }

  var existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var same = existing.join("||") === headers.join("||");
  if (!same) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function normalizeCellText(value) {
  if (typeof value !== "string") {
    return value;
  }

  var fullMap = {
    "Duoi 1 gio": "Dưới 1 giờ",
    "Duoi 2 gio": "Dưới 2 giờ",
    "1 den 3 gio": "Từ 1 đến 3 giờ",
    "2 den 4 gio": "Từ 2 – 4 giờ",
    "3 den 5 gio": "Từ 3 đến 5 giờ",
    "4 den 8 gio": "Từ 4 – 8 giờ",
    "Tren 5 gio": "Trên 5 giờ",
    "Tren 8 gio": "Trên 8 giờ",
    "Hoan thanh chinh xac ngay tu dau": "Hoàn thành chính xác ngay từ đầu",
    "Trien khai nhanh va dieu chinh": "Triển khai nhanh, điều chỉnh trong quá trình thực hiện",
    "Cong nghe / AI": "Công nghệ / Trí tuệ nhân tạo (AI)",
    "Nghien cuu khoa hoc / viet hoc thuat": "Nghiên cứu khoa học / Viết học thuật",
    "Thiet ke": "Thiết kế (Canva, PowerPoint,...)",
    "Co": "Có",
    "Khong": "Không",
    "Ko": "Không"
  };

  if (fullMap[value]) {
    return fullMap[value];
  }

  var tokens = value.split(";");
  if (tokens.length > 1) {
    return tokens
      .map(function (part) {
        var trimmed = part.trim();
        return fullMap[trimmed] || trimmed;
      })
      .join("; ");
  }

  return value;
}

function normalizeOldData() {
  var fields = getFormFields();
  var headers = fields.map(function (item) {
    return item.label;
  });
  var sheet = getOrCreateSheet();
  ensureHeaders(sheet, headers);

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return "Không có dữ liệu cũ để chuẩn hóa.";
  }

  var range = sheet.getRange(2, 1, lastRow - 1, headers.length);
  var values = range.getValues();
  var changed = 0;

  for (var r = 0; r < values.length; r++) {
    for (var c = 0; c < values[r].length; c++) {
      var oldValue = values[r][c];
      var newValue = normalizeCellText(oldValue);
      if (newValue !== oldValue) {
        values[r][c] = newValue;
        changed++;
      }
    }
  }

  if (changed > 0) {
    range.setValues(values);
  }

  return "Đã chuẩn hóa " + changed + " ô dữ liệu.";
}

function runNormalizeOldData() {
  var message = normalizeOldData();
  SpreadsheetApp.getActiveSpreadsheet().toast(message, "Chuẩn hóa dữ liệu", 5);
  Logger.log(message);
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({
      success: true,
      message: "Apps Script is running. Use POST to submit form data."
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var config = getConfig();
  var sheetName = config.sheetName;
  var sheet = getOrCreateSheet();

  var fields = getFormFields();

  var headers = fields.map(function (item) {
    return item.label;
  });

  ensureHeaders(sheet, headers);

  if (!e || !e.parameter) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "No POST payload. Please submit from website form."
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var values = fields.map(function (field) {
    return e.parameter[field.key] || "";
  });

  try {
    var row = sheet.getLastRow() + 1;
    sheet.getRange(row, 1, 1, values.length).setValues([values]);
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, row: row, sheet: sheetName })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
