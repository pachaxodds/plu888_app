import FormValidationController from "../../../app/javascript/controllers/form_validation_controller";

describe("FormValidationController", () => {
  let controller;
  let nameInput;
  let roleInput;
  let submitButton;
  let element;

  beforeEach(() => {
    element = document.createElement("div");

    nameInput = document.createElement("input");
    nameInput.value = "";
    nameInput.id = "name";

    roleInput = document.createElement("input");
    roleInput.value = "";
    roleInput.id = "role";

    submitButton = document.createElement("button");
    submitButton.id = "submit";
    submitButton.className = "bg-gray-500";
    submitButton.disabled = false;

    element.appendChild(nameInput);
    element.appendChild(roleInput);
    element.appendChild(submitButton);

    document.body.appendChild(element);

    controller = new FormValidationController(element);
    controller.nameTarget = nameInput;
    controller.roleTarget = roleInput;
    controller.submitTarget = submitButton;
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  describe("connect()", () => {
    it("should call validate on connect", () => {
      const validateSpy = jest.spyOn(controller, "validate");
      controller.connect();
      expect(validateSpy).toHaveBeenCalled();
      validateSpy.mockRestore();
    });
  });

  describe("validate() - Empty Fields", () => {
    beforeEach(() => {
      nameInput.value = "";
      roleInput.value = "";
    });

    it("should disable the submit button when both fields are empty", () => {
      controller.validate();
      expect(submitButton.disabled).toBe(true);
    });

    it("should have gray background class when disabled", () => {
      submitButton.classList.add("bg-blue-600");
      controller.validate();
      expect(submitButton.classList.contains("bg-gray-500")).toBe(true);
    });

    it("should remove blue background class when disabled", () => {
      submitButton.classList.add("bg-blue-600");
      controller.validate();
      expect(submitButton.classList.contains("bg-blue-600")).toBe(false);
    });

    it("should remove hover and cursor classes when disabled", () => {
      submitButton.classList.add("hover:bg-blue-500", "cursor-pointer");
      controller.validate();
      expect(submitButton.classList.contains("hover:bg-blue-500")).toBe(false);
      expect(submitButton.classList.contains("cursor-pointer")).toBe(false);
    });
  });

  describe("validate() - Partial Fields", () => {
    it("should disable button when only name is filled", () => {
      nameInput.value = "John Doe";
      roleInput.value = "";
      controller.validate();
      expect(submitButton.disabled).toBe(true);
    });

    it("should disable button when only role is filled", () => {
      nameInput.value = "";
      roleInput.value = "Manager";
      controller.validate();
      expect(submitButton.disabled).toBe(true);
    });
  });

  describe("validate() - Both Fields Filled", () => {
    beforeEach(() => {
      nameInput.value = "John Doe";
      roleInput.value = "Manager";
    });

    it("should enable the submit button", () => {
      controller.validate();
      expect(submitButton.disabled).toBe(false);
    });

    it("should set blue background class", () => {
      submitButton.classList.add("bg-gray-500");
      controller.validate();
      expect(submitButton.classList.contains("bg-blue-600")).toBe(true);
    });

    it("should remove gray background class", () => {
      submitButton.classList.add("bg-gray-500");
      controller.validate();
      expect(submitButton.classList.contains("bg-gray-500")).toBe(false);
    });

    it("should add hover and cursor classes", () => {
      controller.validate();
      expect(submitButton.classList.contains("hover:bg-blue-500")).toBe(true);
      expect(submitButton.classList.contains("cursor-pointer")).toBe(true);
    });
  });

  describe("validate() - Whitespace Handling", () => {
    it("should disable button when both fields contain only whitespace", () => {
      nameInput.value = "   ";
      roleInput.value = "   ";
      controller.validate();
      expect(submitButton.disabled).toBe(true);
    });

    it("should disable button when name contains only whitespace", () => {
      nameInput.value = "   ";
      roleInput.value = "Manager";
      controller.validate();
      expect(submitButton.disabled).toBe(true);
    });

    it("should disable button when role contains only whitespace", () => {
      nameInput.value = "John Doe";
      roleInput.value = "   ";
      controller.validate();
      expect(submitButton.disabled).toBe(true);
    });

    it("should enable button with valid values surrounded by whitespace", () => {
      nameInput.value = "  John Doe  ";
      roleInput.value = "  Manager  ";
      controller.validate();
      expect(submitButton.disabled).toBe(false);
    });

    it("should trim newlines and tabs correctly", () => {
      nameInput.value = "\n\tJohn Doe\t\n";
      roleInput.value = "\n\tManager\t\n";
      controller.validate();
      expect(submitButton.disabled).toBe(false);
    });
  });

  describe("CSS Class Management", () => {
    it("should replace bg-gray-500 with bg-blue-600 when valid", () => {
      nameInput.value = "Alice";
      roleInput.value = "Developer";
      submitButton.classList.add("bg-gray-500");

      controller.validate();

      expect(submitButton.classList.contains("bg-gray-500")).toBe(false);
      expect(submitButton.classList.contains("bg-blue-600")).toBe(true);
    });

    it("should replace bg-blue-600 with bg-gray-500 when invalid", () => {
      nameInput.value = "";
      roleInput.value = "";
      submitButton.classList.add("bg-blue-600");

      controller.validate();

      expect(submitButton.classList.contains("bg-blue-600")).toBe(false);
      expect(submitButton.classList.contains("bg-gray-500")).toBe(true);
    });

    it("should preserve other classes while managing bg classes", () => {
      nameInput.value = "Test";
      roleInput.value = "Tester";
      submitButton.className =
        "px-4 py-2 rounded bg-gray-500 text-white font-medium";

      controller.validate();

      expect(submitButton.classList.contains("px-4")).toBe(true);
      expect(submitButton.classList.contains("py-2")).toBe(true);
      expect(submitButton.classList.contains("rounded")).toBe(true);
      expect(submitButton.classList.contains("text-white")).toBe(true);
      expect(submitButton.classList.contains("font-medium")).toBe(true);
    });
  });

  describe("Multiple Validations", () => {
    it("should handle rapid consecutive validation calls", () => {
      nameInput.value = "John Doe";
      roleInput.value = "Manager";

      controller.validate();
      controller.validate();
      controller.validate();

      expect(submitButton.disabled).toBe(false);
    });

    it("should handle toggling between valid and invalid states", () => {
      controller.validate();
      expect(submitButton.disabled).toBe(true);

      nameInput.value = "Test";
      roleInput.value = "Tester";
      controller.validate();
      expect(submitButton.disabled).toBe(false);

      nameInput.value = "";
      controller.validate();
      expect(submitButton.disabled).toBe(true);

      nameInput.value = "Test";
      controller.validate();
      expect(submitButton.disabled).toBe(false);
    });
  });
});
