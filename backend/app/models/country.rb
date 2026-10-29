class Country < ApplicationRecord
  has_many :employees, dependent: :restrict_with_error

  normalizes :name, with: ->(name) { name.squish }
  normalizes :code, :currency, with: ->(value) { value.strip.upcase }

  validates :name, presence: true, uniqueness: { case_sensitive: false }
  validates :code, presence: true, uniqueness: true, length: { is: 2 }
  validates :currency, presence: true, length: { is: 3 }
end
