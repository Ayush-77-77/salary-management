class Employee < ApplicationRecord
  belongs_to :country
  belongs_to :department

  delegate :currency, to: :country

  normalizes :full_name, :job_title, with: ->(value) { value.squish }
  normalizes :email, with: ->(email) { email.strip.downcase }

  validates :full_name, :job_title, :hire_date, presence: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :salary, presence: true, numericality: { greater_than: 0 }
  validate :hire_date_not_in_future

  private

  def hire_date_not_in_future
    return if hire_date.blank? || hire_date <= Date.current

    errors.add(:hire_date, "can't be in the future")
  end
end
