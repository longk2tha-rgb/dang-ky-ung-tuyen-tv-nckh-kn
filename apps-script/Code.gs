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
    { key: "classInfo", label: "3. Lớp - Khoa - Khóa" },
    { key: "phone", label: "4. Số điện thoại" },
    { key: "email", label: "5. Địa chỉ email liên hệ" },
    { key: "facebook", label: "6. Link Facebook (nếu có)" },
    { key: "motivation", label: "7. Trình bày lý do bạn mong muốn tham gia nhóm" },
    { key: "goal", label: "8. Mục tiêu cá nhân sau 3-6 tháng" },
    { key: "weeklyTime", label: "9. Thời gian có thể dành cho nhóm mỗi tuần" },
    { key: "skills", label: "10. Kỹ năng liên quan" },
    { key: "programming", label: "11. Lập trình (ngôn ngữ)" },
    { key: "otherSkill", label: "12. Kỹ năng khác" },
    { key: "seriousActivity", label: "13. Hoạt động/học tập đã tham gia nghiêm túc" },
    { key: "newTaskApproach", label: "14. Cách xử lý nhiệm vụ mới" },
    { key: "workPriority", label: "15. Yếu tố quan trọng hơn trong công việc" },
    { key: "priorityReason", label: "16. Giải thích lựa chọn" },
    { key: "weeklyMeeting", label: "17. Cam kết họp định kỳ" },
    { key: "commitPeriod", label: "18. Cam kết tối thiểu 03-06 tháng" },
    { key: "personalCommitment", label: "19. Cam kết cá nhân" },
    { key: "firstMonthContribution", label: "20. Đóng góp trong tháng đầu" }
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
    "1 den 3 gio": "Từ 1 đến 3 giờ",
    "3 den 5 gio": "Từ 3 đến 5 giờ",
    "Tren 5 gio": "Trên 5 giờ",
    "Hoan thanh chinh xac ngay tu dau": "Hoàn thành chính xác ngay từ đầu",
    "Trien khai nhanh va dieu chinh": "Triển khai nhanh, điều chỉnh trong quá trình thực hiện",
    "Cong nghe / AI": "Công nghệ / Trí tuệ nhân tạo (AI)",
    "Nghien cuu khoa hoc / viet hoc thuat": "Nghiên cứu khoa học / viết học thuật",
    "Thiet ke": "Thiết kế",
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
