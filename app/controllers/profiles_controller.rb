class ProfilesController < ApplicationController
  before_action :set_profile, only: %i[ show edit update destroy ]
def index
  @profiles = EmployeeList.order(id: :asc)
  render "admin/index"
end
  def show
  end

  def new
    @profile = EmployeeList.new
    render "admin/new"
  end

  def edit
    render "admin/edit"
  end

  def create
    @profile = EmployeeList.new(employee_params)

    if @profile.save
      redirect_to admin_index_path, notice: "บันทึกพนักงานเรียบร้อยแล้ว", status: :see_other
    else
      render "admin/new", status: :unprocessable_entity
    end
  end

def update
  if @profile.update(employee_params)
    redirect_to admin_index_path, notice: "แก้ไขพนักงานเรียบร้อยแล้ว", status: :see_other
  else
    render "admin/edit", status: :unprocessable_entity
  end
end

def destroy
  @profile.destroy!
  redirect_to admin_index_path, notice: "ลบพนักงานเรียบร้อยแล้ว", status: :see_other
end

  private

  def set_profile
    @profile = EmployeeList.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    redirect_to admin_index_path, alert: "ไม่พบข้อมูลพนักงาน", status: :see_other
  end

  def employee_params
    params.require(:employee_list).permit(:name, :role)
  end
end