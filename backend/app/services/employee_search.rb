class EmployeeSearch
  DEFAULT_SORT = "full_name asc".freeze

  def initialize(query: {}, page: nil, per_page: nil)
    @query = query
    @page = page
    @per_page = per_page
  end

  def call
    search = Employee.ransack(query)
    search.sorts = DEFAULT_SORT if search.sorts.empty?

    search.result
          .includes(:country, :department)
          .order(:id)
          .page(page)
          .per(per_page)
  end

  private

  attr_reader :query, :page, :per_page
end
