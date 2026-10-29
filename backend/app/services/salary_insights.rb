class SalaryInsights
  STAT_COLUMNS = {
    headcount: "COUNT(*)",
    min_salary: "MIN(employees.salary)",
    max_salary: "MAX(employees.salary)",
    average_salary: "ROUND(AVG(employees.salary), 2)"
  }.freeze

  class << self
    def summary
      employees, countries, departments = Employee.pick(
        Arel.sql("COUNT(*), COUNT(DISTINCT employees.country_id), COUNT(DISTINCT employees.department_id)")
      )

      { total_employees: employees, total_countries: countries, total_departments: departments }
    end

    def by_country
      aggregate(
        Employee.joins(:country).order("countries.name"),
        country_id: "countries.id", name: "countries.name", code: "countries.code", currency: "countries.currency"
      )
    end

    def by_job_title(country)
      aggregate(
        country.employees.order(Arel.sql("AVG(employees.salary) DESC")),
        job_title: "employees.job_title"
      )
    end

    private

    def aggregate(scope, group_columns)
      columns = group_columns.merge(STAT_COLUMNS)

      scope.group(*group_columns.values)
           .pluck(*columns.values.map { |sql| Arel.sql(sql) })
           .map { |row| columns.keys.zip(row).to_h }
    end
  end
end
