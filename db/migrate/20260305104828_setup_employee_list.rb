class SetupEmployeeList < ActiveRecord::Migration[7.1]
  def change
    drop_table :profiles, if_exists: true
    drop_table :employee_lists, if_exists: true

    create_table :employee_lists do |t|
      t.string :name
      t.string :role
      t.decimal :income, precision: 10, scale: 2, default: 0.0

      t.timestamps
    end
  end
end