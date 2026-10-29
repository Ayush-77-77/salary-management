class CreateCountries < ActiveRecord::Migration[8.1]
  def change
    create_table :countries do |t|
      t.string :name, null: false
      t.string :code, null: false, limit: 2
      t.string :currency, null: false, limit: 3

      t.timestamps
    end
    add_index :countries, :name, unique: true
    add_index :countries, :code, unique: true
  end
end
