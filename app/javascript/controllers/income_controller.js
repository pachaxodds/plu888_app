import { Controller } from "@hotwired/stimulus";

export default class IncomeController extends Controller {
  static targets = ["otHours", "otPay", "totalIncome", "taxAmount"];

  async calculate() {
    const incomeInput = document.getElementById("income");
    const baseIncome = Number.parseFloat(incomeInput.value) || 0;

    const hoursInput = document.getElementById("work_hours");
    const otHours = Number.parseFloat(hoursInput.value) || 0;

    const hourlyRate = baseIncome / 30 / 8;
    const otPay = otHours * hourlyRate;

    const grossIncome = baseIncome + otPay;
    let tax = 0;

    if (grossIncome > 50000) {
      tax += (grossIncome - 50000) * 0.1;
      tax += 20000 * 0.05;
    } else if (grossIncome > 30000) {
      tax += (grossIncome - 30000) * 0.05;
    }

    const finalTotal = grossIncome - tax;

    this.otPayTarget.innerText = `${otPay.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท`;
    this.taxAmountTarget.innerText = `${tax.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท`;
    this.totalIncomeTarget.innerText = `${finalTotal.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท`;

    try {
      await fetch(`/employee/16`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]')
            .content,
        },
        body: JSON.stringify({
          employee_list: { income: finalTotal },
        }),
      });
    } catch (error) {
      console.error("Error:", error);
    }
  }
}
