class CreateEmployees < ActiveRecord::Migration[8.1]
  def change
    create_table :employees do |t|
      t.string :full_name, null: false
      t.string :email, null: false
      t.string :job_title, null: false
      t.references :department, null: false, foreign_key: true
      t.references :country, null: false, foreign_key: true, index: false
      t.decimal :salary, precision: 12, scale: 2, null: false
      t.date :hire_date, null: false

      t.timestamps
    end
    add_index :employees, :email, unique: true
    add_index :employees, :job_title
    add_index :employees, [ :country_id, :job_title ]
  end
end
