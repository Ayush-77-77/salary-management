class EmployeeSerializer < Blueprinter::Base
  identifier :id
  fields :full_name, :email, :job_title, :salary, :hire_date

  association :country, blueprint: CountrySerializer
  association :department, blueprint: DepartmentSerializer
end
