module Seeds
  class EmployeeSeeder
    DATA_FILE = Rails.root.join("db/seeds/reference_data.yml")
    BATCH_SIZE = 1_000
    FIRST_HIRE_DATE = Date.new(2012, 1, 1)
    LAST_HIRE_DATE = Date.new(2025, 12, 31)
    SALARY_SPREAD = 0.8..1.25

    def initialize(count: 10_000, seed: 42)
      @count = count
      @random = Random.new(seed)
      @data = YAML.load_file(DATA_FILE)
    end

    def call
      ActiveRecord::Base.transaction do
        seed_reference_data
        seed_employees if Employee.none?
      end
    end

    private

    attr_reader :count, :random, :data

    def seed_reference_data
      Country.upsert_all(data["countries"].map { |country| country.slice("name", "code", "currency") }, unique_by: :code)
      Department.upsert_all(data["departments"].map { |department| department.slice("name") }, unique_by: :name)
    end

    def seed_employees
      country_ids = Country.pluck(:code, :id).to_h
      department_ids = Department.pluck(:name, :id).to_h

      rows = (1..count).map { |number| build_employee(number, country_ids, department_ids) }
      rows.each_slice(BATCH_SIZE) { |batch| Employee.insert_all!(batch) }
    end

    def build_employee(number, country_ids, department_ids)
      country = countries_pool.sample(random:)
      department = departments_pool.sample(random:)
      job_title, base_salary = department["job_titles"].to_a.sample(random:)
      first_name = country["first_names"].sample(random:)
      last_name = country["last_names"].sample(random:)

      {
        full_name: "#{first_name} #{last_name}",
        email: "#{first_name}.#{last_name}.#{number}@acme.test".downcase,
        job_title:,
        country_id: country_ids.fetch(country["code"]),
        department_id: department_ids.fetch(department["name"]),
        salary: salary_for(base_salary, country["salary_factor"]),
        hire_date: FIRST_HIRE_DATE + random.rand((LAST_HIRE_DATE - FIRST_HIRE_DATE).to_i + 1)
      }
    end

    def salary_for(base_salary, salary_factor)
      amount = base_salary * salary_factor * random.rand(SALARY_SPREAD)
      (amount / 100).round * 100
    end

    def countries_pool
      @countries_pool ||= expand_by_weight(data["countries"])
    end

    def departments_pool
      @departments_pool ||= expand_by_weight(data["departments"])
    end

    def expand_by_weight(items)
      items.flat_map { |item| [ item ] * item["weight"] }
    end
  end
end
