class CreateAttendances < ActiveRecord::Migration[8.0]
  def change
    create_table :attendances do |t|
      t.references :employee_list, null: false, foreign_key: true
      t.datetime :check_in_at
      t.datetime :check_out_at

      t.timestamps
    end
  end
end
