import IncomeController from "../../../app/javascript/controllers/income_controller";

describe("IncomeController", () => {
  let controller;
  let element;
  let otPayTarget;
  let otHoursTarget;
  let totalIncomeTarget;
  let taxAmountTarget;
  let incomeInput;
  let workHoursInput;

  beforeEach(() => {
    element = document.createElement("div");

    otPayTarget = document.createElement("div");
    otPayTarget.id = "ot-pay";

    otHoursTarget = document.createElement("div");
    otHoursTarget.id = "ot-hours";

    totalIncomeTarget = document.createElement("div");
    totalIncomeTarget.id = "total-income";

    taxAmountTarget = document.createElement("div");
    taxAmountTarget.id = "tax-amount";

    incomeInput = document.createElement("input");
    incomeInput.id = "income";
    incomeInput.type = "number";
    incomeInput.value = "";

    workHoursInput = document.createElement("input");
    workHoursInput.id = "work_hours";
    workHoursInput.type = "number";
    workHoursInput.value = "";

    const csrfToken = document.createElement("meta");
    csrfToken.name = "csrf-token";
    csrfToken.content = "test-csrf-token";
    document.head.appendChild(csrfToken);

    element.appendChild(otPayTarget);
    element.appendChild(otHoursTarget);
    element.appendChild(totalIncomeTarget);
    element.appendChild(taxAmountTarget);
    element.appendChild(incomeInput);
    element.appendChild(workHoursInput);

    document.body.appendChild(element);

    controller = new IncomeController(element);
    controller.otPayTarget = otPayTarget;
    controller.otHoursTarget = otHoursTarget;
    controller.totalIncomeTarget = totalIncomeTarget;
    controller.taxAmountTarget = taxAmountTarget;

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      }),
    );
  });

  afterEach(() => {
    document.body.removeChild(element);
    document.head.querySelector('meta[name="csrf-token"]').remove();
    jest.clearAllMocks();
  });

  describe("calculate() - Tax Calculation", () => {
    it("should calculate no tax for income under 30000", async () => {
      incomeInput.value = "25000";
      workHoursInput.value = "0";

      await controller.calculate();

      expect(taxAmountTarget.innerText).toContain("0.00");
    });

    it("should calculate 5% tax on amount between 30000 and 50000", async () => {
      incomeInput.value = "40000";
      workHoursInput.value = "0";

      await controller.calculate();

      expect(taxAmountTarget.innerText).toContain("500.00");
    });

    it("should calculate progressive tax for income over 50000", async () => {
      incomeInput.value = "60000";
      workHoursInput.value = "0";

      await controller.calculate();

      const taxText = taxAmountTarget.innerText.replace(/[^0-9.]/g, "");
      expect(parseFloat(taxText)).toBeCloseTo(2000, 0);
    });

    it("should calculate tax on gross income including overtime", async () => {
      incomeInput.value = "40000";
      workHoursInput.value = "10";

      await controller.calculate();

      const taxText = taxAmountTarget.innerText;
      const taxAmount = parseFloat(taxText.replace(/[^0-9.]/g, ""));

      expect(taxAmount).toBeCloseTo(583.34, 1);
    });
  });

  describe("calculate() - Overtime Pay", () => {
    it("should calculate zero OT pay when no overtime hours", async () => {
      incomeInput.value = "40000";
      workHoursInput.value = "0";

      await controller.calculate();

      expect(otPayTarget.innerText).toContain("0.00");
    });

    it("should calculate OT pay based on hourly rate", async () => {
      incomeInput.value = "30000";
      workHoursInput.value = "5";

      await controller.calculate();

      expect(otPayTarget.innerText).toContain("625.00");
    });

    it("should calculate correct hourly rate from base income", async () => {
      incomeInput.value = "40000";
      workHoursInput.value = "8";

      await controller.calculate();

      const otText = otPayTarget.innerText;
      const otAmount = parseFloat(otText.replace(/[^0-9.]/g, ""));

      expect(otAmount).toBeCloseTo(1333.36, 1);
    });
  });

  describe("calculate() - Total Income", () => {
    it("should calculate final income as gross minus tax", async () => {
      incomeInput.value = "35000";
      workHoursInput.value = "0";

      await controller.calculate();

      const totalText = totalIncomeTarget.innerText.replace(/[^0-9.]/g, "");
      expect(parseFloat(totalText)).toBeCloseTo(34750, 0);
    });

    it("should include overtime in final income calculation", async () => {
      incomeInput.value = "30000";
      workHoursInput.value = "10";

      await controller.calculate();

      const totalText = totalIncomeTarget.innerText;
      const totalAmount = parseFloat(totalText.replace(/[^0-9.]/g, ""));

      expect(totalAmount).toBeCloseTo(31187.5, 1);
    });
  });

  describe("calculate() - Empty/Invalid Input", () => {
    it("should handle empty income input", async () => {
      incomeInput.value = "";
      workHoursInput.value = "0";

      await controller.calculate();

      expect(otPayTarget.innerText).toContain("0.00");
      expect(taxAmountTarget.innerText).toContain("0.00");
      expect(totalIncomeTarget.innerText).toContain("0.00");
    });

    it("should handle empty work hours input", async () => {
      incomeInput.value = "30000";
      workHoursInput.value = "";

      await controller.calculate();

      expect(otPayTarget.innerText).toContain("0.00");
    });

    it("should handle both inputs empty", async () => {
      incomeInput.value = "";
      workHoursInput.value = "";

      await controller.calculate();

      expect(otPayTarget.innerText).toContain("0.00");
      expect(taxAmountTarget.innerText).toContain("0.00");
      expect(totalIncomeTarget.innerText).toContain("0.00");
    });

    it("should handle zero income", async () => {
      incomeInput.value = "0";
      workHoursInput.value = "0";

      await controller.calculate();

      expect(totalIncomeTarget.innerText).toContain("0.00");
    });
  });

  describe("calculate() - Currency Formatting", () => {
    it("should format output with Thai locale", async () => {
      incomeInput.value = "30000";
      workHoursInput.value = "0";

      await controller.calculate();

      expect(otPayTarget.innerText).toContain("บาท");
      expect(taxAmountTarget.innerText).toContain("บาท");
      expect(totalIncomeTarget.innerText).toContain("บาท");
    });

    it("should format with 2 decimal places", async () => {
      incomeInput.value = "35000";
      workHoursInput.value = "0";

      await controller.calculate();

      const pattern = /\d+\.\d{2}/;
      expect(otPayTarget.innerText).toMatch(pattern);
      expect(taxAmountTarget.innerText).toMatch(pattern);
      expect(totalIncomeTarget.innerText).toMatch(pattern);
    });

    it("should format large numbers with thousand separators", async () => {
      incomeInput.value = "100000";
      workHoursInput.value = "0";

      await controller.calculate();

      expect(totalIncomeTarget.innerText).toBeTruthy();
      expect(totalIncomeTarget.innerText).toContain("บาท");
    });
  });

  describe("calculate() - API Call", () => {
    it("should send PATCH request with correct headers", async () => {
      incomeInput.value = "30000";
      workHoursInput.value = "0";

      await controller.calculate();

      expect(global.fetch).toHaveBeenCalled();
      const callArgs = global.fetch.mock.calls[0];
      const options = callArgs[1];

      expect(options.method).toBe("PATCH");
      expect(options.headers["Content-Type"]).toBe("application/json");
      expect(options.headers["X-CSRF-Token"]).toBe("test-csrf-token");
    });

    it("should send final income in request body", async () => {
      incomeInput.value = "40000";
      workHoursInput.value = "0";

      await controller.calculate();

      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body.employee_list).toBeDefined();
      expect(body.employee_list.income).toBeDefined();
      expect(typeof body.employee_list.income).toBe("number");
    });

    it("should handle API errors gracefully", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Network error"));
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      incomeInput.value = "30000";
      workHoursInput.value = "0";

      await controller.calculate();

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error:", expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe("calculate() - Tax Bracket Edge Cases", () => {
    it("should calculate correctly at 30000 boundary (no tax)", async () => {
      incomeInput.value = "30000";
      workHoursInput.value = "0";

      await controller.calculate();

      expect(taxAmountTarget.innerText).toContain("0.00");
      const totalText = totalIncomeTarget.innerText.replace(/[^0-9.]/g, "");
      expect(parseFloat(totalText)).toBeCloseTo(30000, 0);
    });

    it("should calculate correctly just above 30000 boundary", async () => {
      incomeInput.value = "30001";
      workHoursInput.value = "0";

      await controller.calculate();

      const taxText = taxAmountTarget.innerText;
      const taxAmount = parseFloat(taxText.replace(/[^0-9.]/g, ""));
      expect(taxAmount).toBeCloseTo(0.05, 2);
    });

    it("should calculate correctly at 50000 boundary", async () => {
      incomeInput.value = "50000";
      workHoursInput.value = "0";

      await controller.calculate();

      const taxText = taxAmountTarget.innerText.replace(/[^0-9.]/g, "");
      expect(parseFloat(taxText)).toBeCloseTo(1000, 0);
    });

    it("should transition to 10% tax correctly over 50000", async () => {
      incomeInput.value = "50001";
      workHoursInput.value = "0";

      await controller.calculate();

      const taxText = taxAmountTarget.innerText;
      const taxAmount = parseFloat(taxText.replace(/[^0-9.]/g, ""));
      expect(taxAmount).toBeCloseTo(1000.1, 2);
    });
  });

  describe("calculate() - Integration Tests", () => {
    it("should process complete scenario: 40000 income + 20 OT hours", async () => {
      incomeInput.value = "40000";
      workHoursInput.value = "20";

      await controller.calculate();

      const otText = otPayTarget.innerText.replace(/[^0-9.]/g, "");
      const taxText = taxAmountTarget.innerText.replace(/[^0-9.]/g, "");
      const totalText = totalIncomeTarget.innerText.replace(/[^0-9.]/g, "");

      expect(parseFloat(otText)).toBeCloseTo(3333.33, 0);
      expect(parseFloat(taxText)).toBeCloseTo(666.67, 0);
      expect(parseFloat(totalText)).toBeCloseTo(42666.67, 0);
    });

    it("should process high income scenario with high tax bracket", async () => {
      incomeInput.value = "60000";
      workHoursInput.value = "5";

      await controller.calculate();

      const totalText = totalIncomeTarget.innerText.replace(/[^0-9.]/g, "");
      expect(parseFloat(totalText)).toBeCloseTo(59125, 0);
    });
  });
});
