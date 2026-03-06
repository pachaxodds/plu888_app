require "test_helper"

class PortalControllerTest < ActionDispatch::IntegrationTest
  test "should get portal" do
    get portal_portal_url
    assert_response :success
  end
end
