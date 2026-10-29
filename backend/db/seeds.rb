return if Rails.env.test?

User.find_or_create_by!(email: ENV.fetch("USER_EMAIL", "hr@acme.test")) do |user|
  user.password = ENV.fetch("USER_PASSWORD", "pass@acme")
end

Seeds::EmployeeSeeder.new.call

puts "Seeded #{Country.count} countries, #{Department.count} departments and #{Employee.count} employees"
