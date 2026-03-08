import { Controller } from "@hotwired/stimulus";

export default class TimestampController extends Controller {
  static targets = ["display", "button"];
  static values = { status: Number }; // 0=ยังไม่เข้า, 1=เข้าแล้ว, 2=ออกแล้ว

  connect() {
    this.updateButtonUI();
  }

  async stamp() {
    const now = new Date();
    const timeString = now.toLocaleTimeString("th-TH", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    if (this.statusValue === 0) {
      await this.sendToServer("check_in");
      this.statusValue = 1;
      this.displayTarget.innerText = `เข้างานเมื่อ: ${timeString}`;
    } else if (this.statusValue === 1) {
      await this.sendToServer("check_out");
      this.statusValue = 2;
      this.displayTarget.innerText = `ออกงานเรียบร้อยแล้ว (${timeString})`;
    }

    this.updateButtonUI();
  }

  updateButtonUI() {
    if (this.statusValue === 1) {
      this.buttonTarget.innerText = "ออกงาน";
      this.buttonTarget.classList.replace("bg-blue-600", "bg-red-600");
      this.buttonTarget.classList.replace(
        "hover:bg-blue-700",
        "hover:bg-red-700",
      );
    } else if (this.statusValue === 2) {
      this.buttonTarget.innerText = "วันนี้คุณออกงานแล้ว";
      this.buttonTarget.disabled = true;
    }
  }

  async sendToServer(type) {
    const url = type === "check_in" ? "/attendances" : "/attendances/check_out";
    const method = type === "check_in" ? "POST" : "PATCH";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]')
            .content,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`${type} สำเร็จ:`, data);
        return true;
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      return false;
    }
  }
}
