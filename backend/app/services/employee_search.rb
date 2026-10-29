class EmployeeSearch
  DEFAULT_SORT = "full_name asc".freeze

  def initialize(query: {}, page: nil, per_page: nil)
    @query = query
    @page = page
    @per_page = per_page
  end

  def call
    search = Employee.ransack(query)
    search.sorts = DEFAULT_SORT if search.sorts.none? { |sort| sortable?(sort) }

    search.result
          .includes(:country, :department)
          .order(:id)
          .page(page)
          .per(page_size)
  end

  private

  attr_reader :query, :page, :per_page

  def sortable?(sort)
    Employee.ransortable_attributes.include?(sort.name)
  end

  def page_size
    per_page if per_page.to_i.positive?
  end
end
