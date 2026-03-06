class AddIncomeToEmployeeLists < ActiveRecord::Migration[7.1]
  def change
    add_column :employee_lists, :income, :decimal, precision: 10, scale: 2, default: 0.0
  end
end