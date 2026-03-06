require "test_helper"

class StaticPagesControllerTest < ActionDispatch::IntegrationTest
  test "should get portal" do
    get static_pages_portal_url
    assert_response :success
  end
end
