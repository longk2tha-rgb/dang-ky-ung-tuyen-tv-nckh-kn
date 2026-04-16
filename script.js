const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwhTenYZfTZDonz7fwRpUFxRKG8gkMjSpY16ssQzl9BZBOhS4xjVAc77VoPxhUKlIP8/exec";

const THANK_YOU_MESSAGE =
  "Cảm ơn bạn đã quan tâm đăng ký, chúng tôi sẽ thông báo kết quả cho bạn qua email hoặc SĐT sau khi có kết quả. Trân trọng";

const form = document.getElementById("applicationForm");
const submitBtn = document.getElementById("submitBtn");
const thankYouBox = document.getElementById("thankYou");

function clearErrors() {
  form.querySelectorAll(".field.error").forEach((field) => field.classList.remove("error"));
}

function markInvalidFields() {
  const invalidElements = form.querySelectorAll(":invalid");

  invalidElements.forEach((el) => {
    const field = el.closest(".field");
    if (field) {
      field.classList.add("error");
    }
  });

  return invalidElements.length === 0;
}

function buildPayload() {
  const formData = new FormData(form);
  const selectedSkills = formData.getAll("skills");

  return {
    timestamp: new Date().toISOString(),
    fullName: formData.get("fullName") || "",
    birthDate: formData.get("birthDate") || "",
    classField: formData.get("classField") || "",
    department: formData.get("department") || "",
    courseYear: formData.get("courseYear") || "",
    phone: formData.get("phone") || "",
    email: formData.get("email") || "",
    facebook: formData.get("facebook") || "",
    motivation: formData.get("motivation") || "",
    goal: formData.get("goal") || "",
    weeklyTime: formData.get("weeklyTime") || "",
    skills: selectedSkills.join("; "),
    programming: formData.get("programming") || "",
    otherSkill: formData.get("otherSkill") || "",
    seriousActivity: formData.get("seriousActivity") || "",
    newTaskApproach: formData.get("newTaskApproach") || "",
    workPriority: formData.get("workPriority") || "",
    priorityReason: formData.get("priorityReason") || "",
    weeklyMeeting: formData.get("weeklyMeeting") || "",
    commitPeriod: formData.get("commitPeriod") || "",
    personalCommitment: formData.get("personalCommitment") || "",
    aiTools: formData.get("aiTools") || "",
    aiPrompt: formData.get("aiPrompt") || ""
  };
}

async function postToSheet(payload) {
  const body = new URLSearchParams(payload);
  const response = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    body
  });

  const rawText = await response.text();
  let result;

  try {
    result = JSON.parse(rawText);
  } catch (_error) {
    throw new Error("Phan hoi tu Apps Script khong hop le. Vui long kiem tra quyen deploy.");
  }

  if (!response.ok || !result.success) {
    throw new Error("Không thể gửi dữ liệu.");
  }
}

function showThankYou() {
  thankYouBox.querySelector("p").textContent = THANK_YOU_MESSAGE;
  thankYouBox.hidden = false;
  form.hidden = true;
  thankYouBox.scrollIntoView({ behavior: "smooth", block: "start" });
}

form.addEventListener("input", () => {
  clearErrors();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();

  const valid = form.checkValidity();
  if (!valid || !markInvalidFields()) {
    form.reportValidity();
    return;
  }

  if (!APPS_SCRIPT_URL) {
    alert("Bạn cần cấu hình APPS_SCRIPT_URL trong file script.js để lưu dữ liệu vào Google Sheet.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Đang gửi...";

  try {
    const payload = buildPayload();
    await postToSheet(payload);
    showThankYou();
    form.reset();
  } catch (error) {
    alert("Gửi phiếu chưa thành công. Vui lòng thử lại.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Gửi phiếu đăng ký";
  }
});
