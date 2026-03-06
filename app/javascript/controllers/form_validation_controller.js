import { Controller } from "@hotwired/stimulus";

export default class FormValidationController extends Controller {
  static targets = ["name", "role", "submit"];

  connect() {
    this.validate();
  }

  validate() {
    const isNameFilled = this.nameTarget.value.trim() !== "";
    const isRoleFilled = this.roleTarget.value.trim() !== "";

    if (isNameFilled && isRoleFilled) {
      this.submitTarget.disabled = false;
      this.submitTarget.classList.replace("bg-gray-500", "bg-blue-600");
      this.submitTarget.classList.add("hover:bg-blue-500", "cursor-pointer");
    } else {
      this.submitTarget.disabled = true;
      this.submitTarget.classList.replace("bg-blue-600", "bg-gray-500");
      this.submitTarget.classList.remove("hover:bg-blue-500", "cursor-pointer");
    }
  }
}
