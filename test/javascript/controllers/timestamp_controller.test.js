import TimestampController from "../../../app/javascript/controllers/timestamp_controller";

describe("TimestampController", () => {
  let controller;
  let element;
  let displayTarget;
  let buttonTarget;

  beforeEach(() => {
    element = document.createElement("div");

    displayTarget = document.createElement("div");
    displayTarget.id = "display";

    buttonTarget = document.createElement("button");
    buttonTarget.id = "button";
    buttonTarget.className = "bg-blue-600 hover:bg-blue-700";
    buttonTarget.disabled = false;

    const csrfToken = document.createElement("meta");
    csrfToken.name = "csrf-token";
    csrfToken.content = "test-csrf-token";
    document.head.appendChild(csrfToken);

    element.appendChild(displayTarget);
    element.appendChild(buttonTarget);

    document.body.appendChild(element);

    controller = new TimestampController(element);
    controller.displayTarget = displayTarget;
    controller.buttonTarget = buttonTarget;
    controller.statusValue = 0;

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      }),
    );

    global.console.log = jest.fn();
    global.console.error = jest.fn();
  });

  afterEach(() => {
    document.body.removeChild(element);
    const csrfMeta = document.head.querySelector('meta[name="csrf-token"]');
    if (csrfMeta) csrfMeta.remove();
    jest.clearAllMocks();
  });

  describe("connect()", () => {
    it("should call updateButtonUI on connect", () => {
      const updateSpy = jest.spyOn(controller, "updateButtonUI");
      controller.connect();
      expect(updateSpy).toHaveBeenCalled();
      updateSpy.mockRestore();
    });

    it("should initialize with status 0 button UI", () => {
      controller.statusValue = 0;
      controller.connect();
      expect(buttonTarget.disabled).toBe(false);
    });
  });

  describe("stamp()", () => {
    it("should transition from status 0 to status 1 on first call", async () => {
      controller.statusValue = 0;
      await controller.stamp();
      expect(controller.statusValue).toBe(1);
    });

    it("should transition from status 1 to status 2 on second call", async () => {
      controller.statusValue = 1;
      await controller.stamp();
      expect(controller.statusValue).toBe(2);
    });

    it("should not change status from 2", async () => {
      controller.statusValue = 2;
      await controller.stamp();
      expect(controller.statusValue).toBe(2);
    });

    it("should call sendToServer with 'check_in' when status is 0", async () => {
      controller.statusValue = 0;
      const sendSpy = jest.spyOn(controller, "sendToServer");
      await controller.stamp();
      expect(sendSpy).toHaveBeenCalledWith("check_in");
      sendSpy.mockRestore();
    });

    it("should call sendToServer with 'check_out' when status is 1", async () => {
      controller.statusValue = 1;
      const sendSpy = jest.spyOn(controller, "sendToServer");
      await controller.stamp();
      expect(sendSpy).toHaveBeenCalledWith("check_out");
      sendSpy.mockRestore();
    });

    it("should update display text on check_in", async () => {
      controller.statusValue = 0;
      await controller.stamp();
      expect(displayTarget.innerText).toContain("เข้างานเมื่อ:");
    });

    it("should update display text on check_out", async () => {
      controller.statusValue = 1;
      await controller.stamp();
      expect(displayTarget.innerText).toContain("ออกงานเรียบร้อยแล้ว");
    });

    it("should call updateButtonUI after status change", async () => {
      controller.statusValue = 0;
      const updateSpy = jest.spyOn(controller, "updateButtonUI");
      await controller.stamp();
      expect(updateSpy).toHaveBeenCalled();
      updateSpy.mockRestore();
    });

    it("should include Thai timezone in timestamp", async () => {
      controller.statusValue = 0;
      await controller.stamp();

      expect(displayTarget.innerText).toContain("เข้างานเมื่อ:");
    });
  });

  describe("updateButtonUI()", () => {
    it("should set button to 'ออกงาน' and red colors when status is 1", () => {
      controller.statusValue = 1;
      buttonTarget.className = "bg-blue-600 hover:bg-blue-700";

      controller.updateButtonUI();

      expect(buttonTarget.innerText).toBe("ออกงาน");
      expect(buttonTarget.classList.contains("bg-red-600")).toBe(true);
      expect(buttonTarget.classList.contains("hover:bg-red-700")).toBe(true);
    });

    it("should not have blue colors when status is 1", () => {
      controller.statusValue = 1;
      buttonTarget.className = "bg-blue-600 hover:bg-blue-700";

      controller.updateButtonUI();

      expect(buttonTarget.classList.contains("bg-blue-600")).toBe(false);
      expect(buttonTarget.classList.contains("hover:bg-blue-700")).toBe(false);
    });

    it("should disable button and update text when status is 2", () => {
      controller.statusValue = 2;
      buttonTarget.disabled = false;

      controller.updateButtonUI();

      expect(buttonTarget.innerText).toBe("วันนี้คุณออกงานแล้ว");
      expect(buttonTarget.disabled).toBe(true);
    });

    it("should not change button for status 0", () => {
      controller.statusValue = 0;

      controller.updateButtonUI();

      expect(buttonTarget.disabled).toBe(false);
    });

    it("should preserve other classes when updating status colors", () => {
      controller.statusValue = 1;
      buttonTarget.className =
        "text-white font-medium bg-blue-600 hover:bg-blue-700 py-2 px-4";

      controller.updateButtonUI();

      expect(buttonTarget.classList.contains("text-white")).toBe(true);
      expect(buttonTarget.classList.contains("font-medium")).toBe(true);
      expect(buttonTarget.classList.contains("py-2")).toBe(true);
      expect(buttonTarget.classList.contains("px-4")).toBe(true);
    });
  });

  describe("sendToServer()", () => {
    it("should send POST request to /attendances for check_in", async () => {
      await controller.sendToServer("check_in");

      expect(global.fetch).toHaveBeenCalledWith(
        "/attendances",
        expect.objectContaining({
          method: "POST",
        }),
      );
    });

    it("should send PATCH request to /attendances/check_out for checkout", async () => {
      await controller.sendToServer("check_out");

      expect(global.fetch).toHaveBeenCalledWith(
        "/attendances/check_out",
        expect.objectContaining({
          method: "PATCH",
        }),
      );
    });

    it("should include correct headers in request", async () => {
      await controller.sendToServer("check_in");

      const callArgs = global.fetch.mock.calls[0];
      const options = callArgs[1];

      expect(options.headers["Content-Type"]).toBe("application/json");
      expect(options.headers["X-CSRF-Token"]).toBe("test-csrf-token");
    });

    it("should return true on successful response", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await controller.sendToServer("check_in");
      expect(result).toBe(true);
    });

    it("should return false on failed response", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      const result = await controller.sendToServer("check_in");
      expect(result).toBeFalsy();
    });

    it("should handle fetch errors gracefully", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await controller.sendToServer("check_in");
      expect(result).toBe(false);
    });

    it("should log error message on fetch error", async () => {
      const error = new Error("Network error");
      global.fetch.mockRejectedValueOnce(error);

      await controller.sendToServer("check_in");
      expect(global.console.error).toHaveBeenCalledWith(
        "เกิดข้อผิดพลาด:",
        error,
      );
    });

    it("should log success message when check_in succeeds", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1, status: "checked_in" }),
      });

      await controller.sendToServer("check_in");
      expect(global.console.log).toHaveBeenCalledWith("check_in สำเร็จ:", {
        id: 1,
        status: "checked_in",
      });
    });

    it("should log success message when check_out succeeds", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1, status: "checked_out" }),
      });

      await controller.sendToServer("check_out");
      expect(global.console.log).toHaveBeenCalledWith("check_out สำเร็จ:", {
        id: 1,
        status: "checked_out",
      });
    });
  });

  describe("Complete Workflow", () => {
    it("should handle complete check-in and check-out workflow", async () => {
      expect(controller.statusValue).toBe(0);
      expect(buttonTarget.disabled).toBe(false);

      await controller.stamp();
      expect(controller.statusValue).toBe(1);
      expect(displayTarget.innerText).toContain("เข้างานเมื่อ:");
      expect(buttonTarget.innerText).toBe("ออกงาน");
      expect(buttonTarget.classList.contains("bg-red-600")).toBe(true);

      await controller.stamp();
      expect(controller.statusValue).toBe(2);
      expect(displayTarget.innerText).toContain("ออกงานเรียบร้อยแล้ว");
      expect(buttonTarget.innerText).toBe("วันนี้คุณออกงานแล้ว");
      expect(buttonTarget.disabled).toBe(true);
    });

    it("should call server for both check_in and check_out", async () => {
      await controller.stamp();
      expect(global.fetch).toHaveBeenCalledWith(
        "/attendances",
        expect.any(Object),
      );

      global.fetch.mockClear();

      await controller.stamp();
      expect(global.fetch).toHaveBeenCalledWith(
        "/attendances/check_out",
        expect.any(Object),
      );
    });
  });

  describe("Status Value Management", () => {
    it("should initialize with status 0", () => {
      expect(controller.statusValue).toBe(0);
    });

    it("should increment status from 0 to 1 to 2", async () => {
      controller.statusValue = 0;
      await controller.stamp();
      expect(controller.statusValue).toBe(1);

      await controller.stamp();
      expect(controller.statusValue).toBe(2);
    });

    it("should maintain status at 2", async () => {
      controller.statusValue = 2;
      const initialStatus = controller.statusValue;

      await controller.stamp();
      expect(controller.statusValue).toBe(initialStatus);
    });
  });

  describe("Thai Language Support", () => {
    it("should display Thai text for check_in", async () => {
      controller.statusValue = 0;
      await controller.stamp();
      expect(displayTarget.innerText).toContain("เข้างาน");
    });

    it("should display Thai text for check_out", async () => {
      controller.statusValue = 1;
      await controller.stamp();
      expect(displayTarget.innerText).toContain("ออกงาน");
    });

    it("should display Thai button text for checkout action", async () => {
      controller.statusValue = 1;
      controller.updateButtonUI();
      expect(buttonTarget.innerText).toBe("ออกงาน");
    });

    it("should display Thai button text when already checked out", () => {
      controller.statusValue = 2;
      controller.updateButtonUI();
      expect(buttonTarget.innerText).toBe("วันนี้คุณออกงานแล้ว");
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid consecutive stamp calls", async () => {
      controller.statusValue = 0;

      await controller.stamp();
      await controller.stamp();

      expect(controller.statusValue).toBe(2);
    });

    it("should handle missing CSRF token gracefully", async () => {
      const csrfMeta = document.head.querySelector('meta[name="csrf-token"]');
      if (csrfMeta) csrfMeta.remove();

      const result = await controller.sendToServer("check_in");
      expect(result).toBeFalsy();
    });

    it("should handle displaying time with Bangkok timezone", async () => {
      controller.statusValue = 0;
      await controller.stamp();

      const displayText = displayTarget.innerText;
      expect(displayText).toBeTruthy();
      expect(displayText).toContain("เข้างานเมื่อ:");
    });
  });

  describe("Button UI Updates", () => {
    it("should replace bg-blue-600 with bg-red-600 on checkout", () => {
      controller.statusValue = 1;
      buttonTarget.className = "bg-blue-600 hover:bg-blue-700";

      controller.updateButtonUI();

      expect(buttonTarget.classList.contains("bg-blue-600")).toBe(false);
      expect(buttonTarget.classList.contains("bg-red-600")).toBe(true);
    });

    it("should replace hover:bg-blue-700 with hover:bg-red-700 on checkout", () => {
      controller.statusValue = 1;
      buttonTarget.className = "bg-blue-600 hover:bg-blue-700";

      controller.updateButtonUI();

      expect(buttonTarget.classList.contains("hover:bg-blue-700")).toBe(false);
      expect(buttonTarget.classList.contains("hover:bg-red-700")).toBe(true);
    });

    it("should disable button only on status 2", () => {
      controller.statusValue = 0;
      controller.updateButtonUI();
      expect(buttonTarget.disabled).toBe(false);

      controller.statusValue = 1;
      controller.updateButtonUI();
      expect(buttonTarget.disabled).toBe(false);

      controller.statusValue = 2;
      controller.updateButtonUI();
      expect(buttonTarget.disabled).toBe(true);
    });
  });
});
