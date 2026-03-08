require "application_system_test_case"

class HomePageTest < ApplicationSystemTestCase
  test "visiting the root page and checking contents" do
    visit root_path

    assert_selector "h2", text: "ระบบบริหารจัดการพนักงาน"
    assert_selector "h2", text: "บริษัท แจ่มแมว จำกัด"

    assert_link "เข้าสู่ระบบพนักงาน"
    assert_link "เข้าสู่ระบบแอดมิน"
  end

  test "navigating to employee system" do
    visit root_path
    click_on "เข้าสู่ระบบพนักงาน"

    assert_current_path employee_index_path
  end

  test "navigating to admin system" do
    visit root_path
    click_on "เข้าสู่ระบบแอดมิน"

    assert_current_path admin_index_path
  end
end