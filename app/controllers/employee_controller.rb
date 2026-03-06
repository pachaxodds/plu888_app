class EmployeeController < ApplicationController
  protect_from_forgery with: :null_session 

  def employee
  end

  def index
    @profiles = Profile.all 
  end

  def update
  @employee = EmployeeList.find(params[:id])

  if @employee.update(employee_params)
    render json: { status: 'success', income: @employee.income }, status: :ok
  else
    render json: { status: 'error', message: @employee.errors.full_messages }, status: :unprocessable_entity
  end
end

private

def employee_params
  params.require(:employee_list).permit(:income)
end
end

def show
  @employee = EmployeeList.find(16)
  @today_check = Attendance.where(employee_list_id: 16)
                         .where(check_in_at: Time.zone.now.beginning_of_day..Time.zone.now.end_of_day)
                         .first
  
  @status = 0
  if @today_check
    @status = @today_check.check_out_at.present? ? 2 : 1
  end
end
