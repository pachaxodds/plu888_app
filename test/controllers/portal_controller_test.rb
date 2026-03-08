require "test_helper"

class PortalControllerTest < ActionDispatch::IntegrationTest
  test "should get portal" do
    get root_url
    assert_response :success
  end
end
