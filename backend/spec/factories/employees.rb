FactoryBot.define do
  factory :employee do
    sequence(:full_name) { |n| "Employee #{n}" }
    sequence(:email) { |n| "employee#{n}@acme.test" }
    job_title { "Software Engineer" }
    department
    country
    salary { 50_000 }
    hire_date { Date.new(2022, 1, 15) }
  end
end
