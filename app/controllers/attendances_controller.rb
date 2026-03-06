class AttendancesController < ApplicationController
  skip_before_action :verify_authenticity_token 

  def create
    employee = EmployeeList.find_by(id: 16)
    
    if employee
      @attendance = Attendance.new(employee_list: employee, check_in_at: Time.current)
      if @attendance.save
        render json: { status: 'success', check_in_at: @attendance.check_in_at.strftime("%H:%M") }
      else
        render json: { error: @attendance.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: "ไม่พบพนักงาน ID 16" }, status: :not_found
    end
  end

  def check_out
    @attendance = Attendance.where(employee_list_id: 16).where(check_out_at: nil).last
    if @attendance&.update(check_out_at: Time.current)
      render json: { status: 'success', check_out_at: @attendance.check_out_at.strftime("%H:%M") }
    else
      render json: { error: "ไม่พบข้อมูลการเข้างาน" }, status: :not_found
    end
  end
end