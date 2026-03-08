require "test_helper"

class FormValidationTest < ActionDispatch::IntegrationTest
  # Integration tests for form validation controller
  # Note: These tests verify the HTML structure and Stimulus data attributes
  # The actual form validation logic is tested in the browser via JavaScript
  
  setup do
    # Create a test profile for testing edit views
    @profile = Profile.new(name: "Test User", role: "Tester")
    @profile.save! if Profile.table_exists?
  rescue StandardError
    # If database is not available, tests will still validate HTML structure
  end

  test "new profile form renders with form-validation controller" do
    begin
      get new_admin_path
      assert_response :success
      assert_select "[data-controller='form-validation']"
    rescue ActiveRecord::NoDatabaseError, PG::ConnectionBad
      skip "Database connection not available"
    end
  end

  test "form contains name input with form-validation target" do
    begin
      get new_admin_path
      assert_select "input[data-form-validation-target='name']"
    rescue ActiveRecord::NoDatabaseError, PG::ConnectionBad
      skip "Database connection not available"
    end
  end

  test "form contains role input with form-validation target" do
    begin
      get new_admin_path
      assert_select "input[data-form-validation-target='role']"
    rescue ActiveRecord::NoDatabaseError, PG::ConnectionBad
      skip "Database connection not available"
    end
  end

  test "form contains submit button with form-validation target" do
    begin
      get new_admin_path
      assert_select "button[data-form-validation-target='submit']"
    rescue ActiveRecord::NoDatabaseError, PG::ConnectionBad
      skip "Database connection not available"
    end
  end

  test "inputs have correct action handlers for validation" do
    begin
      get new_admin_path
      # Check that both input elements have the form-validation#validate action
      assert_select "input[data-action*='form-validation#validate']", minimum: 2
    rescue ActiveRecord::NoDatabaseError, PG::ConnectionBad
      skip "Database connection not available"
    end
  end

  test "name and role inputs trigger validation on input event" do
    begin
      get new_admin_path
      
      # Verify name input has the action
      assert_select "input[id='profile_name'][data-action*='input->form-validation#validate']"
      
      # Verify role input has the action
      assert_select "input[id='profile_role'][data-action*='input->form-validation#validate']"
    rescue ActiveRecord::NoDatabaseError, PG::ConnectionBad
      skip "Database connection not available"
    end
  end

  test "submit button has initial styling classes" do
    begin
      get new_admin_path
      
      assert_select "button[data-form-validation-target='submit']" do |buttons|
        # Verify initial styling
        assert_match /bg-gray-500/, buttons.first.attr("class")
        assert buttons.first.attr("class").include?("text-white")
      end
    rescue ActiveRecord::NoDatabaseError, PG::ConnectionBad
      skip "Database connection not available"
    end
  end

  test "form is wrapped in stimulus controller div" do
    begin
      get new_admin_path
      
      # Check that the form is inside the controller div
      assert_select "div[data-controller='form-validation']" do
        assert_select "form"
      end
    rescue ActiveRecord::NoDatabaseError, PG::ConnectionBad
      skip "Database connection not available"
    end
  end
end
